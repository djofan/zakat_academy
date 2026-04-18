import { db } from "@/lib/db";
import { AdminProgramsClient } from "./programs-client";

export default async function AdminProgramsPage() {
  const programs = await db.program.findMany({
    orderBy: { order: "asc" },
    include: {
      _count: { select: { modules: true, enrollments: true } },
      modules: {
        include: { _count: { select: { lessons: true } } },
        orderBy: { order: "asc" },
      },
    },
  });

  return (
    <AdminProgramsClient
      initialPrograms={programs.map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        shortDescription: p.shortDescription,
        description: p.description,
        thumbnailUrl: p.thumbnailUrl,
        isPublished: p.isPublished,
        order: p.order,
        createdAt: p.createdAt,
        _count: {
          modules: p._count.modules,
          enrollments: p._count.enrollments,
          lessons: p.modules.reduce((sum, m) => sum + m._count.lessons, 0),
        },
      }))}
    />
  );
}