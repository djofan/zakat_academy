import { Suspense } from "react";
import { db } from "@/lib/db";
import { QuizTable } from "@/features/quizzes/components/quiz-table";
import { SkeletonTable } from "@/components/shared/skeleton-table";

export default async function AdminQuizzesPage() {
  const [quizzes, modules] = await Promise.all([
    db.quiz.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        module: {
          include: { program: { select: { id: true, title: true } } },
        },
        questions: {
          orderBy: { order: "asc" },
          include: {
            options: {
              select: { id: true, label: true, isCorrect: true },
            },
          },
        },
      },
    }),
    db.module.findMany({
      orderBy: [{ program: { title: "asc" } }, { order: "asc" }],
      include: {
        program: { select: { id: true, title: true } },
      },
    }),
  ]);

  const initialQuizzes = quizzes.map((q) => ({
    id: q.id,
    title: q.title,
    moduleId: q.moduleId,
    module: {
      id: q.module.id,
      title: q.module.title,
      program: { id: q.module.program.id, title: q.module.program.title },
    },
    questions: q.questions.map((question) => ({
      id: question.id,
      text: question.question,
      order: question.order,
      options: question.options.map((o) => ({
        id: o.id,
        label: o.label,
        isCorrect: o.isCorrect,
      })),
    })),
  }));

  const initialModules = modules.map((m) => ({
    id: m.id,
    title: m.title,
    program: { id: m.program.id, title: m.program.title },
  }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Kuis</h1>
        <p className="text-muted-foreground">Kelola kuis dalam modul.</p>
      </div>
      <Suspense fallback={<SkeletonTable cols={4} rows={5} />}>
        <QuizTable initialQuizzes={initialQuizzes} initialModules={initialModules} />
      </Suspense>
    </div>
  );
}
