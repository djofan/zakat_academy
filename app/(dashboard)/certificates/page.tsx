import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Award, CheckCircle, XCircle, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function CertificatesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  // Ambil semua enrollment student
  const enrollments = await db.enrollment.findMany({
    where: { userId: session.user.id },
    include: {
      program: {
        include: {
          modules: {
            include: {
              lessons: true,
              quizzes: true,
            },
          },
        },
      },
    },
  })

  // Ambil semua lesson progress
  const lessonProgress = await db.lessonProgress.findMany({
    where: { userId: session.user.id },
    select: { lessonId: true },
  })
  const completedLessonIds = new Set(lessonProgress.map((p) => p.lessonId))

  // Ambil semua quiz attempt
  const quizAttempts = await db.quizAttempt.findMany({
    where: { userId: session.user.id },
    select: { quizId: true, score: true },
  })
  const passedQuizIds = new Set(
    quizAttempts.filter((a) => (a.score ?? 0) >= 60).map((a) => a.quizId)
  )

  // Ambil data user untuk certificateUrl
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { certificateUrl: true, name: true, nis: true },
  })

  // Hitung status per program
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

    return {
      program: enrollment.program,
      totalLessons,
      completedLessons,
      totalQuizzes,
      passedQuizzes,
      isComplete,
    }
  })

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Sertifikat</h1>
        <p className="text-muted-foreground">
          Selesaikan semua lesson dan kuis untuk mendapatkan sertifikat.
        </p>
      </div>

      {programStatus.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Award className="mx-auto mb-3 h-10 w-10 opacity-30" />
            <p>Belum mengikuti program apapun.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {programStatus.map(({ program, totalLessons, completedLessons, totalQuizzes, passedQuizzes, isComplete }) => (
            <Card key={program.id} className={isComplete ? 'border-green-200 bg-green-50/30' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{program.title}</CardTitle>
                  <Badge variant={isComplete ? 'default' : 'secondary'}>
                    {isComplete ? 'Selesai' : 'Belum Selesai'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Progress lesson */}
                <div className="flex items-center gap-2 text-sm">
                  {completedLessons === totalLessons && totalLessons > 0 ? (
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                  <span className="text-muted-foreground">
                    Lesson: {completedLessons}/{totalLessons} selesai
                  </span>
                </div>

                {/* Progress kuis */}
                {totalQuizzes > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    {passedQuizzes === totalQuizzes ? (
                      <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                    <span className="text-muted-foreground">
                      Kuis: {passedQuizzes}/{totalQuizzes} lulus
                    </span>
                  </div>
                )}

{/* Tombol download */}
{isComplete && (
  <div className="pt-2">
    {user?.certificateUrl ? (
      <a href={user.certificateUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
        <Download className="h-4 w-4" />
        Download Sertifikat
      </a>
    ) : (
      <p className="text-sm text-muted-foreground italic">
        Sertifikat sedang diproses admin. Silahkan hubungi admin via WA.
      </p>
    )}
  </div>
)}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}