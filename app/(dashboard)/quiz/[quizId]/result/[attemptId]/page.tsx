import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ResultPageProps {
  params: { quizId: string; attemptId: string };
}

export default async function QuizResultPage({ params }: ResultPageProps) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const attempt = await db.quizAttempt.findUnique({
    where: { id: params.attemptId },
    include: {
      quiz: {
        include: {
          module: {
            include: { program: { select: { id: true, slug: true, title: true } } },
          },
          questions: {
            orderBy: { order: "asc" },
            include: { options: true },
          },
        },
      },
    },
  });

  if (!attempt || attempt.quizId !== params.quizId || attempt.userId !== session.user.id) {
    notFound();
  }

  const score = attempt.score;
  const passed = score >= 70;
  const answers = attempt.answers as Record<string, string>;

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Score Banner */}
        <Card className="text-center">
          <CardContent className="py-8">
            <p className="text-sm text-muted-foreground mb-2">Skor Anda</p>
            <p className="text-5xl font-bold mb-2">{score.toFixed(1)}</p>
            <p className="text-muted-foreground mb-4">dari 100</p>
            <Badge variant={passed ? "default" : "destructive"} className="text-sm px-4 py-1">
              {passed ? "LULUS" : "BELUM LULUS"}
            </Badge>
            <p className="mt-3 text-sm text-muted-foreground">
              {passed
                ? "Selamat! Anda telah menyelesaikan kuis ini."
                : "Anda perlu skor minimal 70 untuk lulus. Silakan coba lagi."}
            </p>
          </CardContent>
        </Card>

        {/* Question Review */}
        <div className="space-y-4">
          {attempt.quiz.questions.map((question, qIndex) => {
            const correctOption = question.options.find((o) => o.isCorrect);
            const selectedOption = question.options.find((o) => o.id === answers[question.id]);
            const isCorrect = selectedOption?.isCorrect ?? false;

            return (
              <Card key={question.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-2">
                    {isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                    )}
                    <CardTitle className="text-base font-medium">
                      {qIndex + 1}. {question.question}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {question.options.map((option) => {
                    const isSelected = option.id === answers[question.id];
                    const isThisCorrect = option.isCorrect;

                    return (
                      <div
                        key={option.id}
                        className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm ${
                          isThisCorrect
                            ? "border-green-200 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400"
                            : isSelected && !isThisCorrect
                            ? "border-red-200 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400"
                            : ""
                        }`}
                      >
                        <span>{option.label}</span>
                        {isThisCorrect && <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />}
                        {isSelected && !isThisCorrect && (
                          <XCircle className="h-4 w-4 text-red-500 ml-auto" />
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Back Button */}
        <Button variant="outline" asChild className="w-full">
          <Link href={`/programs/${attempt.quiz.module.program.slug}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke {attempt.quiz.module.program.title}
          </Link>
        </Button>
      </div>
    </div>
  );
}
