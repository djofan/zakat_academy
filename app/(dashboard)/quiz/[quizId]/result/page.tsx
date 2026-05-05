import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ResultPageProps {
  params: { quizId: string; attemptId: string };
}

export default async function QuizResultPage({ params }: ResultPageProps) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const attempt = await db.quizAttempt.findFirst({
    where: { id: params.attemptId, userId: session.user.id, quizId: params.quizId },
    include: {
      quiz: {
        select: { title: true, passingScore: true },
      },
    },
  });

  if (!attempt) redirect("/quiz");

  const score = attempt.score ?? 0;
  const passed = attempt.passed ?? false;
  const answers = attempt.answers as Record<string, string>;
  const passingScore = attempt.quiz.passingScore;

  // Ambil soal untuk ditampilkan
  const questions = await db.quizQuestion.findMany({
    where: { quizId: params.quizId },
    orderBy: { order: "asc" },
    include: { options: true },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8">
      <div className="text-center">
        {passed ? (
          <>
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-green-700">Lulus!</h1>
            <p className="text-muted-foreground">Selamat, kamu berhasil mengerjakan kuis ini.</p>
          </>
        ) : (
          <>
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-red-700">Tidak Lulus</h1>
            <p className="text-muted-foreground">
              Skor kamu belum mencapai batas kelulusan ({passingScore}%).
            </p>
          </>
        )}
      </div>

      {/* Score Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{attempt.quiz.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-6">
            <div className="text-center">
              <p className="text-5xl font-bold">{score.toFixed(1)}%</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Nilai Kamu &middot; Lulus &ge; {passingScore}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Review Jawaban */}
      <div className="space-y-3">
        <h2 className="font-semibold">Pembahasan Jawaban</h2>
        {questions.map((q, i) => {
          const selectedId = answers[q.id];
          const correctOption = q.options.find((o) => o.isCorrect);
          const isCorrect = selectedId === correctOption?.id;

          return (
            <Card key={q.id} className={isCorrect ? "border-green-200 bg-green-50/30" : "border-red-200 bg-red-50/30"}>
              <CardContent className="pt-4">
                <p className="mb-3 text-sm font-medium">
                  {i + 1}. {q.question}
                </p>
                <div className="space-y-1.5">
                  {q.options.map((opt) => {
                    const isSelected = opt.id === selectedId;
                    const isCorrectOpt = opt.isCorrect;
                    return (
                      <div
                        key={opt.id}
                        className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
                          isCorrectOpt
                            ? "border border-green-400 bg-green-100 text-green-800"
                            : isSelected
                            ? "border border-red-400 bg-red-100 text-red-800"
                            : "bg-muted/50 text-muted-foreground"
                        }`}
                      >
                        <span>{opt.label}</span>
                        {isCorrectOpt && <span className="ml-auto text-xs font-medium">✓ Jawaban Benar</span>}
                        {isSelected && !isCorrectOpt && <span className="ml-auto text-xs font-medium">✗ Pilihanmu</span>}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Link href="/quiz">
        <Button variant="outline" className="w-full">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Daftar Kuis
        </Button>
      </Link>
    </div>
  );
}