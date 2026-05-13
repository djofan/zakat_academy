import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Role } from "@/generated/prisma/client";
import { NisForm } from "@/features/users/components/nis-form";
import { CertificateUrlForm } from "@/features/users/components/certificate-url-form";
import { CreateStudentForm } from "@/features/users/components/create-student-form";
import { getLastStudentNis } from "@/features/users/actions";
import { ImportStudentsForm } from "@/features/users/components/import-students-form";

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

      {/* Student */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-base">
            Peserta ({students.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {students.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Belum ada peserta terdaftar.
              </p>
            ) : (
              students.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between rounded-lg border px-4 py-3 text-sm"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                    {user.no_hp && (
                      <p className="text-xs text-muted-foreground">{user.no_hp}</p>
                    )}
                    <div className="mt-1">
                      <NisForm userId={user.id} currentNis={user.nis} />
                    </div>
                    <div className="mt-1">
                      <CertificateUrlForm userId={user.id} currentUrl={user.certificateUrl} />
                    </div>
                  </div>
                  <div className="ml-4 shrink-0 text-xs text-muted-foreground">
                    {user._count.enrollments} pendaftaran
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Admin */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Admin ({admins.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {admins.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between rounded-lg border px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <Badge>Admin</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}