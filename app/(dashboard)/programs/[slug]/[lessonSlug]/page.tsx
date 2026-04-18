import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { MarkCompleteButton } from "@/components/programs/MarkCompleteButton";
import { ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";

export default async function LessonPage({
  params,
}: {
  params: { slug: string; lessonSlug: string };
}) {
  const session = await getServerSession(authOptions);

  const program = await db.program.findUnique({ where: { slug: params.slug } });
  if (!program) notFound();

  const enrollment = await db.enrollment.findUnique({
    where: {
      userId_programId: {
        userId: session!.user.id,
        programId: program.id,
      },
    },
  });

  if (!enrollment) redirect(`/programs/${params.slug}`);

  const lesson = await db.lesson.findFirst({
    where: {
      slug: params.lessonSlug,
      module: { program: { slug: params.slug } },
    },
    include: {
      module: {
        include: {
          lessons: { orderBy: { order: "asc" }, select: { id: true, title: true, slug: true } },
          program: { select: { slug: true } },
        },
      },
    },
  });

  if (!lesson) notFound();

  const progress = await db.lessonProgress.findUnique({
    where: {
      userId_lessonId: {
        userId: session!.user.id,
        lessonId: lesson.id,
      },
    },
  });

  const isCompleted = progress?.completed ?? false;

  const allLessons = lesson.module.lessons;
  const currentIdx = allLessons.findIndex((l) => l.id === lesson.id);
  const prevLesson = currentIdx > 0 ? allLessons[currentIdx - 1] : null;
  const nextLesson = currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null;

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      {/* Video */}
      <div className="bg-black">
        <div className="aspect-video max-h-[60vh] mx-auto">
          {lesson.videoUrl ? (
            <iframe
              src={lesson.videoUrl}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Video className="h-16 w-16 text-white/30" />
            </div>
          )}
        </div>
      </div>

      {/* Lesson Info */}
      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-3xl">
          <div className="mb-2 flex items-center gap-2">
            <Link
              href={`/programs/${params.slug}`}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ← {lesson.module.title}
            </Link>
          </div>
          <h1 className="text-xl font-bold">{lesson.title}</h1>

          {isCompleted && (
            <div className="mt-2 flex items-center gap-1.5 text-sm text-primary">
              <CheckCircle className="h-4 w-4" />
              Telah diselesaikan
            </div>
          )}

          {lesson.contentSummary && (
            <p className="mt-4 text-muted-foreground whitespace-pre-line">
              {lesson.contentSummary}
            </p>
          )}

          <div className="mt-6 flex items-center gap-3">
            <MarkCompleteButton
              lessonId={lesson.id}
              isCompleted={isCompleted}
              userId={session!.user.id}
            />

            <div className="ml-auto flex gap-2">
              {prevLesson && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/programs/${params.slug}/${prevLesson.slug}`}>
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Sebelumnya
                  </Link>
                </Button>
              )}
              {nextLesson && (
                <Button size="sm" asChild>
                  <Link href={`/programs/${params.slug}/${nextLesson.slug}`}>
                    Selanjutnya
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>
          </div>

          {/* Navigation to other lessons */}
          <Card className="mt-8">
            <CardContent className="p-4">
              <p className="mb-3 text-sm font-medium">Daftar Lesson</p>
              <div className="space-y-1">
                {allLessons.map((l) => (
                  <Link
                    key={l.id}
                    href={`/programs/${params.slug}/${l.slug}`}
                    className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted ${
                      l.id === lesson.id ? "bg-muted font-medium" : "text-muted-foreground"
                    }`}
                  >
                    {l.title}
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}