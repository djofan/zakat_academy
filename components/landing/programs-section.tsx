"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

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
    <section id="programs" className="px-4 py-16">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 text-center">
          <p className="mb-2 text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Program Belajar
          </p>
          <h2 className="text-2xl font-semibold tracking-tight">
            Pilih Program yang Sesuai Kebutuhanmu
          </h2>
        </div>

        {programs.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-muted-foreground">Program segera hadir.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Cek lagi nanti untuk konten pembelajaran baru.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {programs.map((program) => (
              <Card
                key={program.id}
                className="group overflow-hidden transition-all duration-200 hover:scale-[1.01] hover:shadow-md"
              >
                <div className="aspect-video w-full overflow-hidden bg-muted">
                  {program.thumbnailUrl ? (
                    <img
                      src={program.thumbnailUrl}
                      alt={program.title}
                      className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <BookOpen className="h-10 w-10 text-muted-foreground opacity-30" />
                    </div>
                  )}
                </div>

                <CardHeader className="pb-2">
                  <CardTitle className="text-base leading-snug">
                    {program.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="pb-2">
                  {program.shortDescription && (
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {program.shortDescription}
                    </p>
                  )}
                </CardContent>

                <CardFooter className="pt-0">
                  <p className="mb-3 text-xs text-muted-foreground">
                    {program._count.modules} Modul &middot; {program.totalLessons} Lesson
                  </p>
                </CardFooter>

                <div className="px-4 pb-4">
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href={`/programs/${program.slug}`}>
                      Pelajari Sekarang
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
