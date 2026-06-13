import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Role } from "@/generated/prisma/client";
import { NisForm } from "@/features/users/components/nis-form";
import { CertificateUrlForm } from "@/features/users/components/certificate-url-form";
import { CreateStudentForm } from "@/features/users/components/create-student-form";
import { getLastStudentNis } from "@/features/users/actions";
import { ImportStudentsForm } from "@/features/users/components/import-students-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Shield } from "lucide-react";

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
  const [users, lastNisIkhwan, lastNisAkhwat] = await Promise.all([
    db.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        nis: true,
        no_hp: true,
        certificateUrl: true,
        createdAt: true,
        _count: { select: { enrollments: true } },
      },
    }),
    getLastStudentNis('IKHWAN'),
    getLastStudentNis('AKHWAT'),
  ])

  const students = users.filter((u) => u.role === Role.STUDENT)
  const admins = users.filter((u) => u.role === Role.ADMIN)

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pengguna</h1>
          <p className="text-muted-foreground">Kelola pengguna sistem.</p>
        </div>
        <div className="flex items-center gap-2">
          <ImportStudentsForm />
          <CreateStudentForm
            lastNisIkhwan={lastNisIkhwan}
            lastNisAkhwat={lastNisAkhwat}
          />
        </div>
      </div>

      <Tabs defaultValue="students">
        <TabsList className="mb-4 w-full justify-start">
          <TabsTrigger value="students" className="gap-2">
            <Users className="h-4 w-4" />
            Peserta ({students.length})
          </TabsTrigger>
          <TabsTrigger value="admins" className="gap-2">
            <Shield className="h-4 w-4" />
            Admin ({admins.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab Peserta */}
        <TabsContent value="students">
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
            {students.length === 0 ? (
              <div className="py-12 text-center">
                <Users className="mx-auto mb-3 h-10 w-10 text-gray-200" />
                <p className="text-sm text-gray-400">Belum ada peserta terdaftar.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {students.map((user) => (
                  <div key={user.id} className="flex items-start justify-between px-5 py-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900">{user.name}</p>
                      {user.email && (
                        <p className="text-xs text-gray-400">{user.email}</p>
                      )}
                      {user.no_hp && (
                        <p className="text-xs text-gray-400">{user.no_hp}</p>
                      )}
                      <div className="mt-1.5 space-y-1">
                        <NisForm userId={user.id} currentNis={user.nis} />
                        <CertificateUrlForm userId={user.id} currentUrl={user.certificateUrl} />
                      </div>
                    </div>
                    <div className="ml-4 shrink-0 text-right">
                      <p className="text-xs text-gray-400">{user._count.enrollments} program</p>
                      {user.nis && (
                        <p className="mt-1 font-mono text-xs text-gray-500">{user.nis}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Tab Admin */}
        <TabsContent value="admins">
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
            {admins.length === 0 ? (
              <div className="py-12 text-center">
                <Shield className="mx-auto mb-3 h-10 w-10 text-gray-200" />
                <p className="text-sm text-gray-400">Belum ada admin terdaftar.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {admins.map((user) => (
                  <div key={user.id} className="flex items-center justify-between px-5 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      {user.email && (
                        <p className="text-xs text-gray-400">{user.email}</p>
                      )}
                      {user.nis && (
                        <p className="font-mono text-xs text-gray-400">{user.nis}</p>
                      )}
                    </div>
                    <Badge className="bg-green-600 text-white">Admin</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}