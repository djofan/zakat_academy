import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { canStartQuiz, startQuizAttempt, getQuizWithQuestions } from "@/features/quizzes/actions";
import { QuizPlayer } from "@/features/quizzes/components/quiz-player";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertTriangle } from "lucide-react";

interface QuizPageProps {
  params: Promise<{ quizId: string }>;
}

export default async function QuizPage({ params }: QuizPageProps) {
  const { quizId } = await params
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const canStart = await canStartQuiz(quizId);
  if (!canStart.ok) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-amber-100 p-4">
            <AlertTriangle className="h-8 w-8 text-amber-600" />
          </div>
        </div>
        <h2 className="mb-2 text-xl font-bold">Tidak Dapat Memulai Kuis</h2>
        <p className="mb-6 text-muted-foreground">{canStart.reason}</p>
        <Link href="/quiz">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Kuis
          </Button>
        </Link>
      </div>
    );
  }

  // Mulai atau lanjutkan attempt
  const startResult = await startQuizAttempt(quizId);
  if (!startResult || "error" in startResult) {
    const errMsg = "error" in startResult ? (startResult as { error: string }).error : "Gagal memulai kuis.";
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <p className="text-muted-foreground">{errMsg}</p>
        <Link href="/quiz" className="mt-4 inline-block">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
        </Link>
      </div>
    );
  }

  const quizData = await getQuizWithQuestions(quizId);
  if (!quizData) redirect("/quiz");

  // Cek apakah sudah completed → redirect ke result
  const attempt = await db.quizAttempt.findFirst({
    where: { userId: session.user.id, quizId: quizId },
    select: { id: true, isCompleted: true },
  });

  if (attempt?.isCompleted) {
    redirect(`/quiz/${quizId}/result/${attempt.id}`);
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <QuizPlayer
        quiz={{
          id: quizData.id,
          title: quizData.title,
          moduleTitle: quizData.moduleTitle,
          timeLimitMinutes: quizData.timeLimitMinutes,
          startedAt: new Date(startResult.startedAt),
          attemptId: startResult.attemptId,
          questions: quizData.questions,
        }}
      />
    </div>
  );
}
