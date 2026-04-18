import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { BookOpen, GraduationCap, Trophy, Video } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function StudentDashboardPage() {
  const session = await getServerSession(authOptions);

  const enrollments = await db.enrollment.findMany({
    where: { userId: session!.user.id },
    include: {
      program: {
        include: {
          modules: {
            include: { lessons: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const lessonProgress = await db.lessonProgress.findMany({
    where: {
      userId: session!.user.id,
      completed: true,
    },
    select: { lessonId: true },
  });

  const completedLessonIds = new Set(lessonProgress.map((p) => p.lessonId));

  const totalLessons = enrollments.reduce(
    (sum, e) =>
      sum + e.program.modules.reduce((s, m) => s + m.lessons.length, 0),
    0
  );

  const completedLessons = enrollments.reduce((sum, e) => {
    return (
      sum +
      e.program.modules.reduce((s, m) => {
        return s + m.lessons.filter((l) => completedLessonIds.has(l.id)).length;
      }, 0)
    );
  }, 0);

  const overallPercent =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const stats = [
    { label: "Program Diikuti", value: enrollments.length, icon: BookOpen },
    { label: "Total Modul", value: totalLessons, icon: Video },
    { label: "Lesson Selesai", value: completedLessons, icon: Trophy },
    { label: "Progress Keseluruhan", value: `${overallPercent}%`, icon: GraduationCap },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Selamat Datang, {session?.user?.name}!</h1>
        <p className="text-muted-foreground">Lanjutkan perjalanan belajar Anda.</p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-lg bg-primary/10 p-3">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Enrolled Programs */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Program Saya</h2>
        <Button variant="outline" size="sm" asChild>
          <Link href="/programs">Jelajahi Program</Link>
        </Button>
      </div>

      {enrollments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <BookOpen className="mb-3 h-10 w-10 text-muted-foreground" />
            <p className="mb-1 font-medium">Belum mengikuti program apapun</p>
            <p className="mb-4 text-sm text-muted-foreground">
              Mulai belajar dengan memilih program yang tersedia.
            </p>
            <Button asChild>
              <Link href="/programs">Lihat Program</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {enrollments.map((enrollment) => {
            const progLessons = enrollment.program.modules.reduce(
              (s, m) => s + m.lessons.length,
              0
            );
            const progCompleted = enrollment.program.modules.reduce(
              (s, m) =>
                s + m.lessons.filter((l) => completedLessonIds.has(l.id)).length,
              0
            );
            const progPercent =
              progLessons > 0 ? Math.round((progCompleted / progLessons) * 100) : 0;

            return (
              <Card key={enrollment.id}>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{enrollment.program.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {progCompleted} / {progLessons} lesson selesai
                    </p>
                    <div className="mt-1.5 h-1.5 w-full rounded-full bg-muted">
                      <div
                        className="h-1.5 rounded-full bg-primary transition-all"
                        style={{ width: `${progPercent}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="secondary">{progPercent}%</Badge>
                    <Button size="sm" asChild>
                      <Link href={`/programs/${enrollment.program.slug}`}>Lanjut</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}