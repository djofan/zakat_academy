import { Suspense } from "react";
import { db } from "@/lib/db";
import { ModuleTable } from "@/features/modules/components/module-table";
import { Skeleton } from "@/components/ui/skeleton";

export default async function AdminModulesPage() {
  const [modules, programs] = await Promise.all([
    db.module.findMany({
      orderBy: [{ programId: "asc" }, { order: "asc" }],
      include: {
        program: { select: { id: true, title: true } },
        _count: { select: { lessons: true } },
      },
    }),
    db.program.findMany({
      orderBy: { title: "asc" },
      select: { id: true, title: true },
    }),
  ]);

  const initialModules = modules.map((m) => ({
    id: m.id,
    title: m.title,
    slug: m.slug,
    description: m.description,
    order: m.order,
    isPublished: m.isPublished,
    programId: m.programId,
    program: m.program,
    _count: m._count,
  }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Modul</h1>
        <p className="text-muted-foreground">Kelola modul dalam program.</p>
      </div>
      <Suspense fallback={<ModulesSkeleton />}>
        <ModuleTable initialModules={initialModules} initialPrograms={programs} />
      </Suspense>
    </div>
  );
}

function ModulesSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <Skeleton className="h-9 w-[220px]" />
        <Skeleton className="h-9 w-[200px]" />
        <Skeleton className="ml-auto h-9 w-[140px]" />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}
