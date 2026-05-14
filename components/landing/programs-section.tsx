"use client";

import Link from "next/link";
import { BookOpen, PlayCircle } from "lucide-react";

interface Program {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  thumbnailUrl: string | null;
  _count: { modules: number };
  totalLessons: number;
}

interface ProgramsSectionProps {
  programs: Program[];
}

export function ProgramsSection({ programs }: ProgramsSectionProps) {
  return (
    <section id="programs" className="bg-gray-50/50 px-4 py-16 md:py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-green-600">
            Program Belajar
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
            Pilih Program yang Sesuai Kebutuhanmu
          </h2>
          <p className="mt-3 text-sm text-gray-500 md:text-base">
            Kurikulum terstruktur dari dasar hingga mahir, dipandu pengajar berpengalaman.
          </p>
        </div>

        {programs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 py-16 text-center">
            <BookOpen className="mx-auto mb-3 h-10 w-10 text-gray-300" />
            <p className="text-gray-500">Program segera hadir.</p>
            <p className="mt-1 text-sm text-gray-400">Cek lagi nanti untuk konten pembelajaran baru.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {programs.map((program) => (
              <div
                key={program.id}
                className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
                  {program.thumbnailUrl ? (
                    <img
                      src={program.thumbnailUrl}
                      alt={program.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
                      <BookOpen className="h-12 w-12 text-green-300" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/5" />
                </div>

                <div className="p-5">
                  <h3 className="mb-1.5 font-semibold text-gray-900 leading-snug group-hover:text-green-700 transition-colors">
                    {program.title}
                  </h3>
                  {program.shortDescription && (
                    <p className="mb-3 line-clamp-2 text-sm text-gray-500">
                      {program.shortDescription}
                    </p>
                  )}
                  <div className="mb-4 flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3.5 w-3.5" />
                      {program._count.modules} Modul
                    </span>
                    <span className="h-1 w-1 rounded-full bg-gray-300" />
                    <span className="flex items-center gap-1">
                      <PlayCircle className="h-3.5 w-3.5" />
                      {program.totalLessons} Lesson
                    </span>
                  </div>
                  <Link
                    href={`/programs/${program.slug}`}
                    className="block w-full rounded-xl border border-gray-200 py-2 text-center text-sm font-medium text-gray-700 transition-all hover:border-green-300 hover:bg-green-50 hover:text-green-700"
                  >
                    Pelajari Sekarang
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}