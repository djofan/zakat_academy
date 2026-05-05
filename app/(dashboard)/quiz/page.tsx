import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getActiveQuizzes } from "@/features/quizzes/actions";
import Link from "next/link";
import { Calendar, Clock, Brain } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function StudentQuizzesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const quizzes = await getActiveQuizzes();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Kuis</h1>
        <p className="text-muted-foreground">Kumpulkan kuis harian yang tersedia.</p>
      </div>

      {quizzes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Brain className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <p className="text-muted-foreground">Belum ada kuis yang tersedia.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} className="flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{quiz.title}</CardTitle>
                <p className="text-xs text-muted-foreground">{quiz.moduleTitle}</p>
              </CardHeader>
              <CardContent className="flex-1 space-y-3">
                <div className="flex flex-wrap gap-2">
                  {quiz.attemptCompleted ? (
                    <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50">
                      ✓ Sudah Selesai
                    </Badge>
                  ) : (
                    <Badge className="bg-blue-100 text-blue-800">Tersedia</Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    <Clock className="mr-1 h-3 w-3" />
                    {quiz.timeLimitMinutes} menit
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {quiz.questionCount} soal
                  </Badge>
                </div>

                {quiz.quizDate && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(quiz.quizDate).toLocaleString("id-ID", {
                      day: "2-digit", month: "short", year: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </div>
                )}

                {quiz.attemptCompleted ? (
                  <div className="mt-2 rounded-lg border border-green-200 bg-green-50 p-3 text-center text-sm text-green-700">
                    Kamu sudah mengerjakan kuis ini.
                  </div>
                ) : (
                  <Link
                    href={`/quiz/${quiz.id}`}
                    className="mt-2 block w-full rounded-lg bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    Mulai Kuis
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}