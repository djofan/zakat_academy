import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { BookOpen, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Program Pembelajaran</h1>
        <p className="text-muted-foreground">
          Pilih program yang sesuai dengan kebutuhan Anda.
        </p>
      </div>

      {programs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Belum ada program tersedia.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((program) => {
            const totalLessons = program.modules.reduce(
              (s, m) => s + m.lessons.length,
              0
            );
            const isEnrolled = enrolledIds.has(program.id);

            return (
              <Card key={program.id} className="group">
                <div className="aspect-video w-full overflow-hidden rounded-t-xl bg-muted">
                  {program.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={program.thumbnailUrl}
                      alt={program.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <BookOpen className="h-10 w-10 text-muted-foreground opacity-30" />
                    </div>
                  )}
                </div>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base leading-snug group-hover:text-primary">
                      {program.title}
                    </CardTitle>
                    {isEnrolled && (
                      <Badge className="shrink-0">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Terdaftar
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="line-clamp-2 text-xs">
                    {program.shortDescription}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="mb-3 text-xs text-muted-foreground">
                    {program._count.modules} modul · {totalLessons} lesson
                  </p>
                  <Button size="sm" variant={isEnrolled ? "outline" : "default"} className="w-full" asChild>
                    <Link href={`/programs/${program.slug}`}>
                      {isEnrolled ? "Lanjutkan" : "Daftar Gratis"}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
