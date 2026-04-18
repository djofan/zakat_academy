import { Suspense } from "react";
import { db } from "@/lib/db";
import { LessonTable } from "@/features/lessons/components/lesson-table";
import { Skeleton } from "@/components/ui/skeleton";

export default async function AdminLessonsPage() {
  const [lessons, modules] = await Promise.all([
    db.lesson.findMany({
      orderBy: [{ moduleId: "asc" }, { order: "asc" }],
      include: {
        module: {
          include: { program: { select: { id: true, title: true, slug: true } } },
        },
        attachments: true,
      },
    }),
    db.module.findMany({
      orderBy: [{ program: { title: "asc" } }, { order: "asc" }],
      include: {
        program: { select: { id: true, title: true } },
      },
    }),
  ]);

  const initialLessons = lessons.map((l) => ({
    id: l.id,
    title: l.title,
    slug: l.slug,
    shortDescription: l.shortDescription,
    contentSummary: l.contentSummary,
    thumbnailUrl: l.thumbnailUrl,
    videoProvider: l.videoProvider,
    videoUrl: l.videoUrl,
    order: l.order,
    isPublished: l.isPublished,
    moduleId: l.moduleId,
    module: {
      id: l.module.id,
      title: l.module.title,
      program: l.module.program,
    },
    attachments: l.attachments.map((a) => ({
      id: a.id,
      title: a.title,
      fileUrl: a.fileUrl,
      fileType: a.fileType,
    })),
  }));

  const initialModules = modules.map((m) => ({
    id: m.id,
    title: m.title,
    programTitle: m.program.title,
  }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Lesson</h1>
        <p className="text-muted-foreground">Kelola semua lesson pembelajaran.</p>
      </div>
      <Suspense fallback={<LessonsSkeleton />}>
        <LessonTable initialLessons={initialLessons} initialModules={initialModules} />
      </Suspense>
    </div>
  );
}

function LessonsSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <Skeleton className="h-9 w-[240px]" />
        <Skeleton className="h-9 w-[220px]" />
        <Skeleton className="ml-auto h-9 w-[140px]" />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}
