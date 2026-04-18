import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { BookOpen, CheckCircle, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function MyProgressPage() {
  const session = await getServerSession(authOptions);

  const enrollments = await db.enrollment.findMany({
    where: { userId: session!.user.id },
    include: {
      program: {
        include: {
          modules: {
            include: { lessons: true },
            orderBy: { order: "asc" },
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
    (s, e) => s + e.program.modules.reduce((ms, m) => ms + m.lessons.length, 0),
    0
  );
  const totalCompleted = enrollments.reduce(
    (s, e) =>
      s +
      e.program.modules.reduce(
        (ms, m) => ms + m.lessons.filter((l) => completedLessonIds.has(l.id)).length,
        0
      ),
    0
  );
  const overallPercent = totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Kemajuan Saya</h1>
        <p className="text-muted-foreground">Pantau progres pembelajaran Anda.</p>
      </div>

      {/* Overall */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{enrollments.length}</p>
              <p className="text-xs text-muted-foreground">Program Diikuti</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <Trophy className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalCompleted}</p>
              <p className="text-xs text-muted-foreground">Lesson Selesai</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <CheckCircle className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-2xl font-bold">{overallPercent}%</p>
              <p className="text-xs text-muted-foreground">Keseluruhan</p>
              <Progress value={overallPercent} className="mt-2 h-1.5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Per program */}
      {enrollments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Belum ada program yang diikuti.</p>
            <Button className="mt-4" asChild>
              <Link href="/programs">Lihat Program</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {enrollments.map((enrollment) => {
            const programLessons = enrollment.program.modules.reduce(
              (s, m) => s + m.lessons.length,
              0
            );
            const programCompleted = enrollment.program.modules.reduce(
              (s, m) =>
                s + m.lessons.filter((l) => completedLessonIds.has(l.id)).length,
              0
            );
            const percent = programLessons > 0 ? Math.round((programCompleted / programLessons) * 100) : 0;

            return (
              <Card key={enrollment.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{enrollment.program.title}</CardTitle>
                    <Badge variant={percent === 100 ? "default" : "secondary"}>
                      {percent === 100 ? "Selesai!" : `${percent}%`}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {programCompleted} / {programLessons} lesson · Terdaftar{" "}
                    {new Date(enrollment.createdAt).toLocaleDateString("id-ID")}
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Progress value={percent} className="h-2" />
                  <div className="flex flex-wrap gap-2">
                    {enrollment.program.modules.map((module) => {
                      const modDone = module.lessons.filter((l) => completedLessonIds.has(l.id)).length;
                      const modTotal = module.lessons.length;
                      return (
                        <div key={module.id} className="flex items-center gap-1.5 text-xs">
                          <span className="text-muted-foreground">{module.title}</span>
                          <span className="font-medium">{modDone}/{modTotal}</span>
                          {modDone === modTotal && modTotal > 0 && (
                            <CheckCircle className="h-3 w-3 text-primary" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/programs/${enrollment.program.slug}`}>
                      {percent === 100 ? "Ulangi" : "Lanjutkan"}
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