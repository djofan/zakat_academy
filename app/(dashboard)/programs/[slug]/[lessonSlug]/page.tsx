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
import { VideoPlayer } from "@/components/shared/video-player";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string; lessonSlug: string }>;
}) {
  const { slug, lessonSlug } = await params
  const session = await getServerSession(authOptions);

  const program = await db.program.findUnique({ where: { slug: slug } });
  if (!program) notFound();

  const enrollment = await db.enrollment.findUnique({
    where: {
      userId_programId: {
        userId: session!.user.id,
        programId: program.id,
      },
    },
  });

  if (!enrollment) redirect(`/programs/${slug}`);

  const lesson = await db.lesson.findFirst({
    where: {
      slug: lessonSlug,
      module: { program: { slug: slug } },
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
    <div className="flex h-[calc(100vh-3.5rem)] flex-col lg:flex-row">
      {/* Konten kiri */}
      <div className="flex-1 overflow-auto">
        {/* Video */}
        <div className="bg-white px-4 py-4">
          <div className="mx-auto max-w-3xl">
            {lesson.videoUrl ? (
              <VideoPlayer
                provider={lesson.videoProvider}
                url={lesson.videoUrl}
                className="rounded-xl overflow-hidden"
              />
            ) : (
              <div className="aspect-video flex items-center justify-center rounded-xl bg-muted">
                <Video className="h-16 w-16 text-muted-foreground/30" />
              </div>
            )}
          </div>
        </div>

        {/* Lesson Info */}
        <div className="p-6">
          <div className="mx-auto max-w-3xl">
            <div className="mb-2">
              <Link
                href={`/programs/${slug}`}
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
                    <Link href={`/programs/${slug}/${prevLesson.slug}`}>
                      <ChevronLeft className="mr-1 h-4 w-4" />
                      Sebelumnya
                    </Link>
                  </Button>
                )}
                {nextLesson && (
                  <Button size="sm" asChild>
                    <Link href={`/programs/${slug}/${nextLesson.slug}`}>
                      Selanjutnya
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar kanan — daftar lesson */}
      <div className="w-full lg:w-72 border-t lg:border-t-0 lg:border-l bg-background overflow-auto">
        <div className="p-4">
          <p className="mb-3 text-sm font-semibold">Daftar Lesson</p>
          <div className="space-y-1">
            {allLessons.map((l, idx) => (
              <Link
                key={l.id}
                href={`/programs/${slug}/${l.slug}`}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  l.id === lesson.id
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <span className="shrink-0 flex h-5 w-5 items-center justify-center rounded-full border text-xs">
                  {idx + 1}
                </span>
                <span className="truncate">{l.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )};