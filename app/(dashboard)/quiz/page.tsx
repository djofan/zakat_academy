import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getActiveQuizzes } from "@/features/quizzes/actions";
import Link from "next/link";
import { Calendar, Clock, Brain, CheckCircle } from "lucide-react";

export const dynamic = 'force-dynamic'

export default async function StudentQuizzesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const quizzes = await getActiveQuizzes();

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 md:text-2xl">Kuis</h1>
        <p className="mt-1 text-sm text-gray-500">Kerjakan kuis yang tersedia untuk menguji pemahamanmu.</p>
      </div>

      {quizzes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 py-16 text-center">
          <Brain className="mx-auto mb-3 h-10 w-10 text-gray-200" />
          <p className="text-gray-500">Belum ada kuis yang tersedia.</p>
          <p className="mt-1 text-sm text-gray-400">Cek lagi nanti ya.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className={`flex flex-col rounded-2xl border bg-white shadow-sm transition-all ${
                quiz.attemptCompleted
                  ? 'border-green-100'
                  : 'border-gray-100 hover:-translate-y-0.5 hover:shadow-md'
              }`}
            >
              {/* Header */}
              <div className="p-4 pb-3">
                <div className="mb-1 flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-gray-900 leading-snug">{quiz.title}</h3>
                  {quiz.attemptCompleted ? (
                    <span className="shrink-0 flex items-center gap-1 rounded-full bg-green-50 border border-green-200 px-2 py-0.5 text-xs font-medium text-green-700">
                      <CheckCircle className="h-3 w-3" />
                      Selesai
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-xs font-medium text-blue-700">
                      Tersedia
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400">{quiz.moduleTitle}</p>
              </div>

              {/* Info */}
              <div className="flex items-center gap-3 border-t border-gray-50 px-4 py-2.5 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {quiz.timeLimitMinutes} menit
                </span>
                <span className="h-1 w-1 rounded-full bg-gray-200" />
                <span>{quiz.questionCount} soal</span>
                {quiz.quizDate && (
                  <>
                    <span className="h-1 w-1 rounded-full bg-gray-200" />
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(quiz.quizDate).toLocaleString("id-ID", {
                        day: "2-digit", month: "short",
                        hour: "2-digit", minute: "2-digit",
                        timeZone: "Asia/Jakarta",
                      })}
                    </span>
                  </>
                )}
              </div>

              {/* Action */}
              <div className="p-4 pt-3">
                {quiz.attemptCompleted ? (
                  <div className="rounded-xl bg-green-50 py-2.5 text-center text-sm text-green-700">
                    ✓ Sudah dikerjakan
                  </div>
                ) : (
                  <Link
                    href={`/quiz/${quiz.id}`}
                    className="block w-full rounded-xl bg-green-600 py-2.5 text-center text-sm font-medium text-white shadow-sm shadow-green-200 transition-colors hover:bg-green-700"
                  >
                    Mulai Kuis
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}