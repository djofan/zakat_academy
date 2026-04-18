import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { BookOpen, Users, Video } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function AdminDashboardPage() {
  const [userCount, programCount, enrollmentCount] = await Promise.all([
    db.user.count(),
    db.program.count(),
    db.enrollment.count(),
  ]);

  const recentUsers = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Ringkasan sistem Zakat Academy.</p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{userCount}</p>
              <p className="text-xs text-muted-foreground">Total Pengguna</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{programCount}</p>
              <p className="text-xs text-muted-foreground">Program</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <Video className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{enrollmentCount}</p>
              <p className="text-xs text-muted-foreground">Pendaftaran</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pengguna Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <div className="text-xs text-muted-foreground">
                  {user.role}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/users">Lihat Semua</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}