import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { QuizPlayer } from "@/features/quizzes/components/quiz-player";

interface QuizPageProps {
  params: { quizId: string };
}

export default async function QuizPage({ params }: QuizPageProps) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  const quiz = await db.quiz.findUnique({
    where: { id: params.quizId },
    include: {
      module: {
        include: { program: { select: { id: true, slug: true, title: true } } },
      },
      questions: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          question: true,
          options: {
            select: { id: true, label: true },
          },
        },
      },
    },
  });

  if (!quiz) {
    redirect("/dashboard");
  }

  const attempt = await db.quizAttempt.findFirst({
    where: { userId: session.user.id, quizId: params.quizId },
  });

  if (attempt) {
    redirect(`/quiz/${params.quizId}/result/${attempt.id}`);
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <QuizPlayer
        quiz={{
          id: quiz.id,
          title: quiz.title,
          questions: quiz.questions.map((q) => ({
            id: q.id,
            text: q.question,
            options: q.options,
          })),
        }}
      />
    </div>
  );
}
