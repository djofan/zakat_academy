import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Award, CheckCircle, XCircle, Download } from "lucide-react";

export const dynamic = 'force-dynamic'

export default async function CertificatesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const enrollments = await db.enrollment.findMany({
    where: { userId: session.user.id },
    include: {
      program: {
        include: {
          modules: {
            include: { lessons: true, quizzes: true },
          },
        },
      },
    },
  })

  const lessonProgress = await db.lessonProgress.findMany({
    where: { userId: session.user.id },
    select: { lessonId: true },
  })
  const completedLessonIds = new Set(lessonProgress.map((p) => p.lessonId))

  const quizAttempts = await db.quizAttempt.findMany({
    where: { userId: session.user.id },
    select: { quizId: true, score: true },
  })
  const passedQuizIds = new Set(
    quizAttempts.filter((a) => (a.score ?? 0) >= 60).map((a) => a.quizId)
  )

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { certificateUrl: true, name: true, nis: true },
  })

  const programStatus = enrollments.map((enrollment) => {
    const allLessons = enrollment.program.modules.flatMap((m) => m.lessons)
    const allQuizzes = enrollment.program.modules.flatMap((m) => m.quizzes)
    const totalLessons = allLessons.length
    const completedLessons = allLessons.filter((l) => completedLessonIds.has(l.id)).length
    const totalQuizzes = allQuizzes.length
    const passedQuizzes = allQuizzes.filter((q) => passedQuizIds.has(q.id)).length
    const lessonsComplete = totalLessons > 0 && completedLessons === totalLessons
    const quizzesComplete = totalQuizzes === 0 || passedQuizzes === totalQuizzes
    const isComplete = lessonsComplete && quizzesComplete
    return { program: enrollment.program, totalLessons, completedLessons, totalQuizzes, passedQuizzes, isComplete }
  })

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 md:text-2xl">Sertifikat</h1>
        <p className="mt-1 text-sm text-gray-500">
          Selesaikan semua lesson dan kuis untuk mendapatkan sertifikat.
        </p>
      </div>

      {programStatus.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 py-16 text-center">
          <Award className="mx-auto mb-3 h-10 w-10 text-gray-200" />
          <p className="text-gray-500">Belum mengikuti program apapun.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {programStatus.map(({ program, totalLessons, completedLessons, totalQuizzes, passedQuizzes, isComplete }) => (
            <div
              key={program.id}
              className={`rounded-2xl border bg-white shadow-sm ${
                isComplete ? 'border-green-200 bg-green-50/30' : 'border-gray-100'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                <h3 className="font-semibold text-gray-900">{program.title}</h3>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  isComplete
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {isComplete ? 'Selesai' : 'Belum Selesai'}
                </span>
              </div>

              {/* Progress */}
              <div className="space-y-2.5 px-5 py-4">
                <div className="flex items-center gap-2.5 text-sm">
                  {completedLessons === totalLessons && totalLessons > 0 ? (
                    <CheckCircle className="h-4 w-4 shrink-0 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 shrink-0 text-gray-300" />
                  )}
                  <span className="text-gray-600">
                    Lesson: <span className="font-medium">{completedLessons}/{totalLessons}</span> selesai
                  </span>
                </div>

                {totalQuizzes > 0 && (
                  <div className="flex items-center gap-2.5 text-sm">
                    {passedQuizzes === totalQuizzes ? (
                      <CheckCircle className="h-4 w-4 shrink-0 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 shrink-0 text-gray-300" />
                    )}
                    <span className="text-gray-600">
                      Kuis: <span className="font-medium">{passedQuizzes}/{totalQuizzes}</span> selesai
                    </span>
                  </div>
                )}

                {isComplete && (
  <div className="pt-1">
    {user?.certificateUrl ? (
      <a href={user.certificateUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-green-200 transition-colors hover:bg-green-700">
        <Download className="h-4 w-4" />
        Download Sertifikat
      </a>
    ) : (
      <p className="text-sm italic text-gray-400">
        Sertifikat sedang diproses admin. Hubungi admin via WA.
      </p>
    )}
  </div>
)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}