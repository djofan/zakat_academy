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

// ─── ADMIN ACTIONS ────────────────────────────────────────────────────────────

export async function createQuiz(values: QuizFormValues) {
  await requireAdmin();

  await db.quiz.create({
    data: {
      title: values.title,
      moduleId: values.moduleId,
      isActive: values.isActive,
      quizDate: values.quizDate ? new Date(values.quizDate) : null,
      timeLimitMinutes: values.timeLimitMinutes,
      allowRetake: values.allowRetake,
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
      isActive: values.isActive,
      quizDate: values.quizDate ? new Date(values.quizDate) : null,
      timeLimitMinutes: values.timeLimitMinutes,
      allowRetake: values.allowRetake,
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

export async function toggleQuizActive(id: string, isActive: boolean) {
  await requireAdmin();
  await db.quiz.update({
    where: { id },
    data: { isActive },
  });
  revalidatePath("/admin/quizzes");
}

// ─── STUDENT ACTIONS ───────────────────────────────────────────────────────────

export async function getActiveQuizzes() {
  const session = await getServerSession(authOptions);
  if (!session) return [];

  const now = new Date();

  const quizzes = await db.quiz.findMany({
    where: {
  isActive: true,
  OR: [
    { quizDate: { lte: now } },
    { quizDate: null },
  ],
},
    include: {
      module: { select: { title: true } },
      questions: {
        select: { id: true },
      },
    },
    orderBy: { quizDate: "desc" },
  });

  // Ambil attempt user untuk cek status
  const attempts = await db.quizAttempt.findMany({
    where: {
      userId: session.user.id,
      quizId: { in: quizzes.map((q) => q.id) },
    },
    select: { quizId: true, isCompleted: true },
  });

  const attemptMap: Record<string, boolean> = {};
  for (const a of attempts) {
    attemptMap[a.quizId] = a.isCompleted;
  }

  return quizzes.map((q) => ({
    id: q.id,
    title: q.title,
    moduleTitle: q.module.title,
    questionCount: q.questions.length,
    timeLimitMinutes: q.timeLimitMinutes,
    quizDate: q.quizDate,
    attemptCompleted: attemptMap[q.id] ?? false,
  }));
}

export async function canStartQuiz(quizId: string): Promise<{ ok: boolean; reason?: string }> {
  const session = await getServerSession(authOptions);
  if (!session) return { ok: false, reason: "Unauthorized" };

  const quiz = await db.quiz.findUnique({
    where: { id: quizId },
    select: {
      isActive: true,
      quizDate: true,
      timeLimitMinutes: true,
      allowRetake: true,
    },
  });

  if (!quiz) return { ok: false, reason: "Kuis tidak ditemukan" };
  if (!quiz.isActive) return { ok: false, reason: "Kuis belum aktif" };

  const now = new Date();
  if (quiz.quizDate && quiz.quizDate > now) {
    return { ok: false, reason: `Kuis tersedia mulai ${quiz.quizDate.toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })}` };
  }

  const existing = await db.quizAttempt.findFirst({
    where: { userId: session.user.id, quizId },
  });

  if (existing) {
    if (existing.isCompleted && !quiz.allowRetake) {
      return { ok: false, reason: "Kuis sudah dikerjakan dan tidak boleh diulang" };
    }
    if (!existing.isCompleted) {
      // Hitung apakah waktu sudah habis
      const deadline = new Date(existing.startedAt.getTime() + quiz.timeLimitMinutes * 60000);
      if (now > deadline) {
        // Auto-submit expired attempt
        await db.quizAttempt.update({
          where: { id: existing.id },
          data: { isCompleted: true },
        });
        return { ok: false, reason: "Sesi kuis sudah berakhir" };
      }
      // Masih dalam waktu → izinkan lanjut
      return { ok: true };
    }
  }

  return { ok: true };
}

export async function startQuizAttempt(quizId: string) {
  const session = await getServerSession(authOptions);
  if (!session) return { error: "Unauthorized" };

  const canStart = await canStartQuiz(quizId);
  if (!canStart.ok) return { error: canStart.reason };

  // Cek apakah sudah ada attempt (untuk allowRetake)
  const existing = await db.quizAttempt.findFirst({
    where: { userId: session.user.id, quizId },
  });

  if (existing) {
    return {
      attemptId: existing.id,
      startedAt: existing.startedAt,
      timeLimitMinutes: (await db.quiz.findUnique({ where: { id: quizId }, select: { timeLimitMinutes: true } }))?.timeLimitMinutes ?? 10,
    };
  }

  const attempt = await db.quizAttempt.create({
    data: {
      userId: session.user.id,
      quizId,
    },
  });

  return {
    attemptId: attempt.id,
    startedAt: attempt.startedAt,
    timeLimitMinutes: (await db.quiz.findUnique({ where: { id: quizId }, select: { timeLimitMinutes: true } }))?.timeLimitMinutes ?? 10,
  };
}

export async function getQuizWithQuestions(quizId: string) {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const quiz = await db.quiz.findUnique({
    where: { id: quizId },
    include: {
      questions: {
        orderBy: { order: "asc" },
        include: { options: { select: { id: true, label: true } } },
      },
      module: { select: { title: true } },
    },
  });

  if (!quiz) return null;

  return {
    id: quiz.id,
    title: quiz.title,
    moduleTitle: quiz.module.title,
    timeLimitMinutes: quiz.timeLimitMinutes,
    questions: quiz.questions.map((q) => ({
      id: q.id,
      question: q.question,
      order: q.order,
      options: q.options.map((o) => ({ id: o.id, label: o.label })),
    })),
  };
}

export async function submitQuizAttempt(
  quizId: string,
  attemptId: string,
  answers: Record<string, string>
) {
  const session = await getServerSession(authOptions);
  if (!session) return { error: "Unauthorized" };

  const attempt = await db.quizAttempt.findFirst({
    where: { id: attemptId, userId: session.user.id, quizId },
  });

  if (!attempt) return { error: "Attempt tidak ditemukan" };
  if (attempt.isCompleted) return { error: "Kuis sudah dikumpulkan" };

  const quiz = await db.quiz.findUnique({
    where: { id: quizId },
    include: { questions: { include: { options: true } } },
  });

  if (!quiz) return { error: "Kuis tidak ditemukan" };

  // Cek waktu
  const now = new Date();
  const deadline = new Date(attempt.startedAt.getTime() + quiz.timeLimitMinutes * 60000);
  const isExpired = now > deadline;

  let correct = 0;
  const total = quiz.questions.length;

  for (const question of quiz.questions) {
    const selectedOptionId = answers[question.id];
    if (!selectedOptionId) continue;
    const selectedOption = question.options.find((o) => o.id === selectedOptionId);
    if (selectedOption?.isCorrect) correct++;
  }

  const score = total > 0 ? Math.round((correct / total) * 100 * 10) / 10 : 0;
  const passed = score >= quiz.passingScore;

  await db.quizAttempt.update({
    where: { id: attemptId },
    data: {
      score,
      passed,
      answers,
      isCompleted: true,
      submittedAt: now,
    },
  });

  revalidatePath("/quizzes");
  return { score, correct, total, passed, passingScore: quiz.passingScore };
}

export async function getMyQuizAttempts(quizId: string) {
  const session = await getServerSession(authOptions);
  if (!session) return [];

  const attempts = await db.quizAttempt.findMany({
    where: { userId: session.user.id, quizId },
    orderBy: { createdAt: "desc" },
  });

  return attempts;
}
