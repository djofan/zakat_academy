"use server";

import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { Role } from "@/generated/prisma/client";
import type { QuizFormValues } from "./schemas";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== Role.ADMIN) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function createQuiz(values: QuizFormValues) {
  await requireAdmin();

  await db.quiz.create({
    data: {
      title: values.title,
      moduleId: values.moduleId,
      questions: {
        create: values.questions.map((q) => ({
          question: q.text,
          order: q.order,
          options: {
            create: q.options.map((o) => ({
              label: o.label,
              isCorrect: o.isCorrect,
            })),
          },
        })),
      },
    },
  });

  revalidatePath("/admin/quizzes");
}

export async function updateQuiz(id: string, values: QuizFormValues) {
  await requireAdmin();

  await db.quiz.update({
    where: { id },
    data: {
      title: values.title,
      moduleId: values.moduleId,
    },
  });

  await db.quizQuestion.deleteMany({ where: { quizId: id } });

  await db.quizQuestion.createMany({
    data: values.questions.map((q) => ({
      quizId: id,
      question: q.text,
      order: q.order,
    })),
  });

  const questions = await db.quizQuestion.findMany({
    where: { quizId: id },
    select: { id: true, order: true },
  });

  for (const q of values.questions) {
    const dbQuestion = questions.find((dq) => dq.order === q.order);
    if (!dbQuestion) continue;

    await db.quizOption.createMany({
      data: q.options.map((o) => ({
        questionId: dbQuestion.id,
        label: o.label,
        isCorrect: o.isCorrect,
      })),
    });
  }

  revalidatePath("/admin/quizzes");
}

export async function deleteQuiz(id: string) {
  await requireAdmin();
  await db.quiz.delete({ where: { id } });
  revalidatePath("/admin/quizzes");
}

export async function submitQuizAttempt(
  quizId: string,
  answers: Record<string, string>
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Unauthorized");
  }

  const existing = await db.quizAttempt.findFirst({
    where: { userId: session.user.id, quizId },
  });

  if (existing) {
    return { error: "Sudah pernah mengerjakan kuis ini" };
  }

  const quiz = await db.quiz.findUnique({
    where: { id: quizId },
    include: {
      questions: {
        include: { options: true },
      },
    },
  });

  if (!quiz) {
    throw new Error("Kuis tidak ditemukan");
  }

  let correct = 0;
  const total = quiz.questions.length;

  for (const question of quiz.questions) {
    const selectedOptionId = answers[question.id];
    if (!selectedOptionId) continue;

    const selectedOption = question.options.find((o) => o.id === selectedOptionId);
    if (selectedOption?.isCorrect) {
      correct++;
    }
  }

  const score = Math.round((correct / total) * 100 * 10) / 10;
  const passed = score >= 70;

  const attempt = await db.quizAttempt.create({
    data: {
      userId: session.user.id,
      quizId,
      score,
      passed,
      answers,
    },
  });

  return { score, correct, total, attemptId: attempt.id };
}
