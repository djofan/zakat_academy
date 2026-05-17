import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { CheckCircle, BookOpen, Video, Lock, ChevronRight, FileQuestion } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);

  const program = await db.program.findUnique({
    where: { slug: slug, isPublished: true },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
          },
          quizzes: {
            where: { isPublished: true },
            orderBy: { createdAt: "asc" },
            select: { id: true, title: true },
          },
        },
      },
    },
  });

  if (!program) notFound();

  const enrollment = await db.enrollment.findUnique({
    where: {
      userId_programId: {
        userId: session!.user.id,
        programId: program!.id,
      },
    },
  });

  const lessonIds = program.modules.flatMap((m) => m.lessons.map((l) => l.id));
  const quizIds = program.modules.flatMap((m) => m.quizzes.map((q) => q.id));

  const [lessonProgress, quizAttempts] = await Promise.all([
    db.lessonProgress.findMany({
      where: {
  userId: session!.user.id,
  lessonId: { in: lessonIds },
},
      select: { lessonId: true },
    }),
    db.quizAttempt.findMany({
      where: { userId: session!.user.id, quizId: { in: quizIds } },
      select: { quizId: true, score: true, passed: true },
    }),
  ]);

  const completedLessonIds = new Set(lessonProgress.map((p) => p.lessonId));
  const passedQuizIds = new Set(quizAttempts.filter((a) => a.passed !== null).map((a) => a.quizId));

  const totalLessons = program.modules.reduce((s, m) => s + m.lessons.length, 0);
  const completedCount = program.modules.reduce(
    (s, m) => s + m.lessons.filter((l) => completedLessonIds.has(l.id)).length,
    0
  );

  async function enrollAction() {
    "use server";
    const sess = await getServerSession(authOptions);
    if (!sess) redirect("/login");
    await db.enrollment.upsert({
      where: {
        userId_programId: {
          userId: sess.user.id,
          programId: program!.id,
        },
      },
      update: {},
      create: {
        userId: sess.user.id,
        programId: program!.id,
      },
    });
    redirect(`/programs/${slug}`);
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">{program.title}</h1>
        <p className="mt-1 text-muted-foreground">{program.shortDescription}</p>

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              {program.modules.length} modul
            </span>
            <span className="flex items-center gap-1">
              <Video className="h-4 w-4" />
              {totalLessons} lesson
            </span>
            {enrollment ? (
              <span className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-primary" />
                {completedCount} / {totalLessons} selesai
              </span>
            ) : null}
          </div>
          {!enrollment ? (
            <form action={enrollAction}>
              <Button>Daftar Gratis</Button>
            </form>
          ) : (
            <Badge className="bg-primary text-primary-foreground">Terdaftar</Badge>
          )}
        </div>

        {enrollment && totalLessons > 0 && (
          <div className="mt-3 h-2 w-full max-w-xs rounded-full bg-muted">
            <div
              className="h-2 rounded-full bg-primary transition-all"
              style={{ width: `${Math.round((completedCount / totalLessons) * 100)}%` }}
            />
          </div>
        )}

        {/* Materi PDF */}
{program.materialUrl && enrollment && (
  <div className="mt-4">
    <a href={program.materialUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700 transition-colors hover:bg-green-100">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      Download Materi PDF
    </a>
  </div>
)}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Description */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tentang Program</CardTitle>
            </CardHeader>
            <CardContent>
              {program.description ? (
                <p className="text-sm whitespace-pre-line">
                  {program.description}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">Tidak ada deskripsi.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Modules & Lessons */}
        <div className="lg:col-span-2 space-y-4">
          {program.modules.map((module, idx) => {
            const modCompleted = module.lessons.filter((l) => completedLessonIds.has(l.id)).length;
            return (
              <Card key={module.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      Modul {idx + 1}: {module.title}
                    </CardTitle>
                    <Badge variant="secondary">
                      {modCompleted}/{module.lessons.length}
                    </Badge>
                  </div>
                  {module.description && (
                    <p className="mt-1 text-xs text-muted-foreground">{module.description}</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-1">
                  {module.lessons.map((lesson) => {
                    const isDone = completedLessonIds.has(lesson.id);
                    const canAccess = !!enrollment;
                    return (
                      <div
                        key={lesson.id}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-muted"
                      >
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted">
                          {isDone ? (
                            <CheckCircle className="h-4 w-4 text-primary" />
                          ) : canAccess ? (
                            <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                          ) : (
                            <Lock className="h-3 w-3 text-muted-foreground" />
                          )}
                        </div>
                        <span className={cn("flex-1", isDone && "text-muted-foreground")}>
                          {lesson.title}
                        </span>
                        {canAccess && (
                          <Button size="sm" variant="ghost" className="h-7 gap-1" asChild>
                            <Link href={`/programs/${slug}/${lesson.slug}`}>
                              {isDone ? "Ulangi" : "Mulai"}
                              <ChevronRight className="h-3 w-3" />
                            </Link>
                          </Button>
                        )}
                      </div>
                    );
                  })}
                  {module.quizzes.map((quiz) => {
                    const passed = passedQuizIds.has(quiz.id);
                    return (
                      <div
                        key={quiz.id}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm"
                      >
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                          {passed ? (
                            <CheckCircle className="h-4 w-4 text-purple-600" />
                          ) : (
                            <FileQuestion className="h-4 w-4 text-purple-600" />
                          )}
                        </div>
                        <span className={cn("flex-1", passed && "text-muted-foreground")}>
                          {quiz.title}
                        </span>
                        {passed ? (
                          <Badge variant="secondary" className="text-xs">Lulus</Badge>
                        ) : (
                          <Button size="sm" variant="ghost" className="h-7 gap-1" asChild>
                            <Link href={`/quiz/${quiz.id}`}>
                              Ikuti Kuis
                              <ChevronRight className="h-3 w-3" />
                            </Link>
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}