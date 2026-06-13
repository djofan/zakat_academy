import { db } from "@/lib/db";
import Link from "next/link";
import { BookOpen, Users, Video, GraduationCap, Brain, ArrowRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Role } from "@/generated/prisma/client";

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const [
    totalUsers,
    totalStudents,
    totalAdmins,
    totalPrograms,
    totalEnrollments,
    totalLessons,
    totalQuizzes,
    totalAttempts,
  ] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { role: Role.STUDENT } }),
    db.user.count({ where: { role: Role.ADMIN } }),
    db.program.count(),
    db.enrollment.count(),
    db.lesson.count(),
    db.quiz.count(),
    db.quizAttempt.count({ where: { isCompleted: true } }),
  ]);

  const recentStudents = await db.user.findMany({
    where: { role: Role.STUDENT },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, name: true, nis: true, no_hp: true, createdAt: true },
  });

  const recentEnrollments = await db.enrollment.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      createdAt: true,
      user: { select: { name: true, nis: true } },
      program: { select: { title: true } },
    },
  });

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 md:text-2xl">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Ringkasan sistem Zakat Academy.</p>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="mb-6 w-full justify-start">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="peserta">Peserta</TabsTrigger>
          <TabsTrigger value="konten">Konten</TabsTrigger>
          <TabsTrigger value="aktivitas">Aktivitas</TabsTrigger>
        </TabsList>

        {/* Tab Overview */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{totalUsers}</p>
              <p className="mt-1 text-sm text-gray-500">Total Pengguna</p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50">
                <BookOpen className="h-5 w-5 text-orange-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{totalPrograms}</p>
              <p className="mt-1 text-sm text-gray-500">Program</p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
                <GraduationCap className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{totalEnrollments}</p>
              <p className="mt-1 text-sm text-gray-500">Pendaftaran</p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50">
                <Brain className="h-5 w-5 text-orange-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{totalAttempts}</p>
              <p className="mt-1 text-sm text-gray-500">Kuis Dikerjakan</p>
            </div>
          </div>

          {/* Peserta terbaru */}
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h2 className="font-semibold text-gray-900">Peserta Terbaru</h2>
              <Link href="/admin/users" className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700">
                Lihat Semua <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {recentStudents.map((user) => (
                <div key={user.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-400 font-mono">{user.nis ?? '-'}</p>
                  </div>
                  <p className="text-xs text-gray-400">
                    {new Date(user.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Tab Peserta */}
        <TabsContent value="peserta" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{totalStudents}</p>
              <p className="mt-1 text-sm text-gray-500">Total Peserta</p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50">
                <GraduationCap className="h-5 w-5 text-orange-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{totalEnrollments}</p>
              <p className="mt-1 text-sm text-gray-500">Total Pendaftaran</p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{totalAdmins}</p>
              <p className="mt-1 text-sm text-gray-500">Total Admin</p>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h2 className="font-semibold text-gray-900">Pendaftaran Terbaru</h2>
              <Link href="/admin/users" className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700">
                Kelola Peserta <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {recentEnrollments.map((e) => (
                <div key={e.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{e.user.name}</p>
                    <p className="text-xs text-gray-400">{e.program.title}</p>
                  </div>
                  <p className="text-xs text-gray-400">
                    {new Date(e.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Tab Konten */}
        <TabsContent value="konten" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
                <BookOpen className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{totalPrograms}</p>
              <p className="mt-1 text-sm text-gray-500">Program</p>
              <Link href="/admin/programs" className="mt-3 inline-flex items-center gap-1 text-xs text-green-600 hover:text-green-700">
                Kelola <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50">
                <Video className="h-5 w-5 text-orange-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{totalLessons}</p>
              <p className="mt-1 text-sm text-gray-500">Total Lesson</p>
              <Link href="/admin/lessons" className="mt-3 inline-flex items-center gap-1 text-xs text-green-600 hover:text-green-700">
                Kelola <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
                <Brain className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{totalQuizzes}</p>
              <p className="mt-1 text-sm text-gray-500">Total Kuis</p>
              <Link href="/admin/quizzes" className="mt-3 inline-flex items-center gap-1 text-xs text-green-600 hover:text-green-700">
                Kelola <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </TabsContent>

        {/* Tab Aktivitas */}
        <TabsContent value="aktivitas" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
                <Brain className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{totalAttempts}</p>
              <p className="mt-1 text-sm text-gray-500">Kuis Diselesaikan</p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50">
                <GraduationCap className="h-5 w-5 text-orange-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{totalEnrollments}</p>
              <p className="mt-1 text-sm text-gray-500">Total Pendaftaran Program</p>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4">
              <h2 className="font-semibold text-gray-900">Pendaftaran Terbaru</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {recentEnrollments.map((e) => (
                <div key={e.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{e.user.name}</p>
                    <p className="text-xs text-gray-400">{e.program.title}</p>
                  </div>
                  <p className="text-xs text-gray-400">
                    {new Date(e.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}