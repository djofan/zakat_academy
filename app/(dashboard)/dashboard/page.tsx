import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { BookOpen, GraduationCap, Trophy, Video, ArrowRight } from "lucide-react";

export const dynamic = 'force-dynamic'

function getNilaiLabel(avg: number) {
  if (avg >= 90) return { label: 'Mumtaz', color: 'text-yellow-700 bg-yellow-50 border-yellow-200' }
  if (avg >= 80) return { label: 'Jayyid Jiddan', color: 'text-green-700 bg-green-50 border-green-200' }
  if (avg >= 60) return { label: 'Jayyid', color: 'text-blue-700 bg-blue-50 border-blue-200' }
  return { label: 'Maqbul', color: 'text-gray-600 bg-gray-50 border-gray-200' }
}

export default async function StudentDashboardPage() {
  const session = await getServerSession(authOptions);

  const enrollments = await db.enrollment.findMany({
    where: { userId: session!.user.id },
    include: {
      program: {
        include: {
          modules: { include: { lessons: true } },
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
    select: { score: true },
  })

  const avgScore = quizAttempts.length > 0
    ? quizAttempts.reduce((sum, a) => sum + (a.score ?? 0), 0) / quizAttempts.length
    : null

  const totalLessons = enrollments.reduce(
    (sum, e) => sum + e.program.modules.reduce((s, m) => s + m.lessons.length, 0), 0
  );

  const completedLessons = enrollments.reduce((sum, e) =>
    sum + e.program.modules.reduce((s, m) =>
      s + m.lessons.filter((l) => completedLessonIds.has(l.id)).length, 0
    ), 0
  );

  const overallPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const stats = [
    { label: "Program Diikuti", value: enrollments.length, icon: BookOpen, color: "bg-green-50 text-green-600" },
    { label: "Total Lesson", value: totalLessons, icon: Video, color: "bg-orange-50 text-orange-500" },
    { label: "Lesson Selesai", value: completedLessons, icon: Trophy, color: "bg-green-50 text-green-600" },
    { label: "Progress", value: `${overallPercent}%`, icon: GraduationCap, color: "bg-orange-50 text-orange-500" },
  ];

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 md:text-2xl">
          Selamat Datang, {session?.user?.name}! 👋
        </h1>
        <p className="mt-1 text-sm text-gray-500">Lanjutkan perjalanan belajar Anda.</p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl ${color}`}>
              <Icon className="h-4 w-4" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="mt-0.5 text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Nilai Kuis */}
      <div className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Nilai Kuis Saya</h2>
          <Link href="/leaderboard" className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700">
            Lihat Peringkat <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          {avgScore !== null ? (
            <div className="flex items-center gap-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-green-50">
                <Trophy className="h-7 w-7 text-green-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{avgScore.toFixed(1)}</p>
                <p className="text-xs text-gray-400">Rata-rata dari {quizAttempts.length} kuis</p>
                <span className={`mt-1.5 inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${getNilaiLabel(avgScore).color}`}>
                  {getNilaiLabel(avgScore).label}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center py-4 text-center">
              <Trophy className="mb-2 h-8 w-8 text-gray-200" />
              <p className="text-sm text-gray-400">Belum ada kuis yang dikerjakan.</p>
              <Link href="/quiz" className="mt-3 rounded-lg bg-green-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-green-700">
                Lihat Kuis
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Program Saya */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Program Saya</h2>
          <Link href="/programs" className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700">
            Jelajahi <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {enrollments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center">
            <BookOpen className="mx-auto mb-3 h-8 w-8 text-gray-200" />
            <p className="text-sm font-medium text-gray-600">Belum mengikuti program apapun</p>
            <p className="mt-1 text-xs text-gray-400">Mulai belajar dengan memilih program yang tersedia.</p>
            <Link href="/programs" className="mt-4 inline-block rounded-lg bg-green-600 px-4 py-2 text-xs font-medium text-white hover:bg-green-700">
              Lihat Program
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {enrollments.map((enrollment) => {
              const progLessons = enrollment.program.modules.reduce((s, m) => s + m.lessons.length, 0);
              const progCompleted = enrollment.program.modules.reduce(
                (s, m) => s + m.lessons.filter((l) => completedLessonIds.has(l.id)).length, 0
              );
              const progPercent = progLessons > 0 ? Math.round((progCompleted / progLessons) * 100) : 0;

              return (
                <div key={enrollment.id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50">
                      <BookOpen className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-gray-900">{enrollment.program.title}</p>
                      <p className="text-xs text-gray-400">{progCompleted} / {progLessons} lesson selesai</p>
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-green-500 transition-all"
                          style={{ width: `${progPercent}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <span className="text-sm font-semibold text-gray-700">{progPercent}%</span>
                      <Link
                        href={`/programs/${enrollment.program.slug}`}
                        className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
                      >
                        Lanjut
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}