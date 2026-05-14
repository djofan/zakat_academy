import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { BookOpen, CheckCircle, PlayCircle } from "lucide-react";

export const dynamic = 'force-dynamic'

export default async function ProgramsPage() {
  const session = await getServerSession(authOptions);

  const [programs, enrollments] = await Promise.all([
    db.program.findMany({
      where: { isPublished: true },
      orderBy: { order: "asc" },
      include: {
        _count: { select: { modules: true } },
        modules: {
          include: { lessons: true },
          orderBy: { order: "asc" },
        },
      },
    }),
    db.enrollment.findMany({
      where: { userId: session!.user.id },
      select: { programId: true },
    }),
  ]);

  const enrolledIds = new Set(enrollments.map((e) => e.programId));

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 md:text-2xl">Program Pembelajaran</h1>
        <p className="mt-1 text-sm text-gray-500">Pilih program yang sesuai dengan kebutuhan Anda.</p>
      </div>

      {programs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 py-16 text-center">
          <BookOpen className="mx-auto mb-3 h-10 w-10 text-gray-200" />
          <p className="text-gray-500">Belum ada program tersedia.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((program) => {
            const totalLessons = program.modules.reduce((s, m) => s + m.lessons.length, 0);
            const isEnrolled = enrolledIds.has(program.id);

            return (
              <div
                key={program.id}
                className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video w-full overflow-hidden bg-gray-50">
                  {program.thumbnailUrl ? (
                    <img
                      src={program.thumbnailUrl}
                      alt={program.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
                      <BookOpen className="h-12 w-12 text-green-200" />
                    </div>
                  )}
                  {isEnrolled && (
                    <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-green-600 px-2.5 py-1 text-xs font-medium text-white shadow">
                      <CheckCircle className="h-3 w-3" />
                      Terdaftar
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="mb-1 font-semibold text-gray-900 leading-snug group-hover:text-green-700 transition-colors">
                    {program.title}
                  </h3>
                  {program.shortDescription && (
                    <p className="mb-3 line-clamp-2 text-xs text-gray-500">
                      {program.shortDescription}
                    </p>
                  )}
                  <div className="mb-4 flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3.5 w-3.5" />
                      {program._count.modules} modul
                    </span>
                    <span className="h-1 w-1 rounded-full bg-gray-200" />
                    <span className="flex items-center gap-1">
                      <PlayCircle className="h-3.5 w-3.5" />
                      {totalLessons} lesson
                    </span>
                  </div>
                  <Link
                    href={`/programs/${program.slug}`}
                    className={`block w-full rounded-xl py-2 text-center text-sm font-medium transition-all ${
                      isEnrolled
                        ? 'border border-gray-200 text-gray-700 hover:border-green-300 hover:bg-green-50 hover:text-green-700'
                        : 'bg-green-600 text-white shadow-sm shadow-green-200 hover:bg-green-700'
                    }`}
                  >
                    {isEnrolled ? "Lanjutkan" : "Daftar Gratis"}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}