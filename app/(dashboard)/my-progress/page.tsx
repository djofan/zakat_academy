import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { BookOpen, CheckCircle, Trophy, Brain, ArrowRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

export const dynamic = 'force-dynamic'

function getNilaiLabel(avg: number) {
  if (avg >= 90) return { label: 'Mumtaz', color: 'text-yellow-700 bg-yellow-50 border-yellow-200' }
  if (avg >= 80) return { label: 'Jayyid Jiddan', color: 'text-green-700 bg-green-50 border-green-200' }
  if (avg >= 70) return { label: 'Jayyid', color: 'text-blue-700 bg-blue-50 border-blue-200' }
  return { label: 'Maqbul', color: 'text-gray-600 bg-gray-50 border-gray-200' }
}

export default async function MyProgressPage() {
  const session = await getServerSession(authOptions);

  const enrollments = await db.enrollment.findMany({
    where: { userId: session!.user.id },
    include: {
      program: {
        include: {
          modules: {
            include: { lessons: true },
            orderBy: { order: "asc" },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const lessonProgress = await db.lessonProgress.findMany({
    where: { userId: session!.user.id, completed: true },
    select: { lessonId: true },
  });

  const completedLessonIds = new Set(lessonProgress.map((p) => p.lessonId));

  const quizAttempts = await db.quizAttempt.findMany({
    where: { userId: session!.user.id, isCompleted: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      score: true,
      createdAt: true,
      quizId: true,
      answers: true,
      quiz: {
        select: {
          id: true,
          title: true,
          questions: { select: { id: true } },
          module: {
            select: {
              title: true,
              program: { select: { title: true } }
            }
          }
        }
      }
    },
  })

  const avgScore = quizAttempts.length > 0
    ? quizAttempts.reduce((sum, a) => sum + (a.score ?? 0), 0) / quizAttempts.length
    : null

  const totalLessons = enrollments.reduce(
    (s, e) => s + e.program.modules.reduce((ms, m) => ms + m.lessons.length, 0), 0
  );
  const totalCompleted = enrollments.reduce(
    (s, e) => s + e.program.modules.reduce(
      (ms, m) => ms + m.lessons.filter((l) => completedLessonIds.has(l.id)).length, 0
    ), 0
  );
  const overallPercent = totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 md:text-2xl">Kemajuan Saya</h1>
        <p className="mt-1 text-sm text-gray-500">Pantau progres pembelajaran Anda.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-green-50">
            <BookOpen className="h-4 w-4 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{enrollments.length}</p>
          <p className="mt-0.5 text-xs text-gray-500">Program Diikuti</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50">
            <Trophy className="h-4 w-4 text-orange-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalCompleted}</p>
          <p className="mt-0.5 text-xs text-gray-500">Lesson Selesai</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{overallPercent}%</p>
          <p className="mt-0.5 text-xs text-gray-500">Keseluruhan</p>
          <Progress value={overallPercent} className="mt-2 h-1.5" />
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50">
            <Brain className="h-4 w-4 text-orange-500" />
          </div>
          {avgScore !== null ? (
            <>
              <p className="text-2xl font-bold text-gray-900">{avgScore.toFixed(1)}</p>
              <p className="mt-0.5 text-xs text-gray-500 mb-1">Rata-rata Kuis</p>
              <span className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${getNilaiLabel(avgScore).color}`}>
                {getNilaiLabel(avgScore).label}
              </span>
            </>
          ) : (
            <>
              <p className="text-2xl font-bold text-gray-900">-</p>
              <p className="mt-0.5 text-xs text-gray-500">Rata-rata Kuis</p>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="program">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="program">
            Program ({enrollments.length})
          </TabsTrigger>
          <TabsTrigger value="kuis">
            Riwayat Kuis ({quizAttempts.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab Program */}
        <TabsContent value="program" className="mt-4">
          {enrollments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 py-10 text-center">
              <p className="text-sm text-gray-400">Belum ada program yang diikuti.</p>
              <Link href="/programs" className="mt-3 inline-block rounded-lg bg-green-600 px-4 py-2 text-xs font-medium text-white hover:bg-green-700">
                Lihat Program
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {enrollments.map((enrollment) => {
                const programLessons = enrollment.program.modules.reduce((s, m) => s + m.lessons.length, 0);
                const programCompleted = enrollment.program.modules.reduce(
                  (s, m) => s + m.lessons.filter((l) => completedLessonIds.has(l.id)).length, 0
                );
                const percent = programLessons > 0 ? Math.round((programCompleted / programLessons) * 100) : 0;

                return (
                  <div key={enrollment.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{enrollment.program.title}</h3>
                        <p className="text-xs text-gray-400">
                          {programCompleted}/{programLessons} lesson · Terdaftar {new Date(enrollment.createdAt).toLocaleDateString("id-ID")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {avgScore !== null && (
                          <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${getNilaiLabel(avgScore).color}`}>
                            {getNilaiLabel(avgScore).label}
                          </span>
                        )}
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${percent === 100 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {percent === 100 ? 'Selesai!' : `${percent}%`}
                        </span>
                      </div>
                    </div>
                    <Progress value={percent} className="mb-3 h-1.5" />
                    <div className="mb-3 flex flex-wrap gap-2">
                      {enrollment.program.modules.map((module) => {
                        const modDone = module.lessons.filter((l) => completedLessonIds.has(l.id)).length;
                        const modTotal = module.lessons.length;
                        return (
                          <div key={module.id} className="flex items-center gap-1 text-xs text-gray-500">
                            <span>{module.title}</span>
                            <span className="font-medium text-gray-700">{modDone}/{modTotal}</span>
                            {modDone === modTotal && modTotal > 0 && (
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <Link
                      href={`/programs/${enrollment.program.slug}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:border-green-300 hover:bg-green-50 hover:text-green-700"
                    >
                      {percent === 100 ? "Ulangi" : "Lanjutkan"}
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Tab Riwayat Kuis */}
        <TabsContent value="kuis" className="mt-4">
          {quizAttempts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 py-10 text-center">
              <Brain className="mx-auto mb-2 h-8 w-8 text-gray-200" />
              <p className="text-sm text-gray-400">Belum ada kuis yang dikerjakan.</p>
              <Link href="/quiz" className="mt-3 inline-block rounded-lg bg-green-600 px-4 py-2 text-xs font-medium text-white hover:bg-green-700">
                Lihat Kuis
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {quizAttempts.map((attempt) => {
                const totalSoal = attempt.quiz.questions.length
                const correctCount = attempt.score !== null
                  ? Math.round((attempt.score / 100) * totalSoal)
                  : 0

                return (
                  <div key={attempt.id} className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50">
                      <Brain className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-gray-900">{attempt.quiz.title}</p>
                      <p className="text-xs text-gray-400">
                        {attempt.quiz.module.program.title} · {new Date(attempt.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {correctCount}/{totalSoal} benar
                      </p>
                    </div>
                    <Link
                      href={`/quiz/${attempt.quizId}/result/${attempt.id}`}
                      className="shrink-0 flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:border-green-300 hover:bg-green-50 hover:text-green-700"
                    >
                      Lihat Detail
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}