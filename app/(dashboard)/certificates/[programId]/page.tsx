import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { PrintButton } from "./print-button";

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ programId: string }>;
}) {
  const { programId } = await params;
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const program = await db.program.findUnique({
    where: { id: programId },
    include: {
      modules: {
        include: { lessons: true },
      },
    },
  });

  if (!program) notFound();

  const enrollment = await db.enrollment.findUnique({
    where: {
      userId_programId: {
        userId: session.user.id,
        programId,
      },
    },
  });

  if (!enrollment) redirect("/certificates");

  const allLessons = program.modules.flatMap((m) => m.lessons);
  const lessonProgress = await db.lessonProgress.findMany({
    where: {
      userId: session.user.id,
      lessonId: { in: allLessons.map((l) => l.id) },
      completed: true,
    },
  });

  if (lessonProgress.length < allLessons.length) {
    redirect("/certificates");
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, nis: true },
  });

  const completedDate = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div>
      <div className="print:hidden flex justify-center gap-3 p-4 bg-muted/30 border-b">
        <PrintButton />
        <a href="/certificates" className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted">
          Kembali
        </a>
      </div>

      <div className="flex min-h-screen items-center justify-center bg-muted/20 p-8 print:p-0 print:bg-white print:min-h-0">
        <div className="relative w-[794px] min-h-[562px] bg-white border-8 border-double border-green-700 p-12" style={{ fontFamily: 'Georgia, serif' }}>
          <div className="absolute inset-3 border-2 border-green-600 pointer-events-none" />

          <div className="relative flex flex-col items-center text-center space-y-6">
            <img src="/logo-lazsip.webp" alt="Logo LAZSIP" className="h-20 w-20 object-contain" />

            <div>
              <p className="text-sm font-semibold tracking-widest text-green-700 uppercase">
                Lembaga Amil Zakat Sosial Islam Profesional
              </p>
              <p className="text-2xl font-bold text-green-800 tracking-wide">LAZSIP</p>
            </div>

            <div className="space-y-1">
              <p className="text-xs tracking-widest text-gray-500 uppercase">Dengan bangga memberikan</p>
              <h1 className="text-4xl font-bold text-gray-800" style={{ fontFamily: 'Georgia, serif' }}>
                Sertifikat Kelulusan
              </h1>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-gray-500">Diberikan kepada</p>
              <p className="text-3xl font-bold text-green-800 border-b-2 border-green-700 pb-1 px-8">
                {user?.name ?? session.user.name}
              </p>
              <p className="text-sm text-gray-500 font-mono">{user?.nis ?? ''}</p>
            </div>

            <div className="max-w-lg space-y-1">
              <p className="text-sm text-gray-600">Telah berhasil menyelesaikan program pembelajaran</p>
              <p className="text-lg font-semibold text-gray-800">"{program.title}"</p>
              <p className="text-sm text-gray-600">pada Zakat Academy — Platform Belajar Zakat LAZSIP</p>
            </div>

            <p className="text-sm text-gray-500">{completedDate}</p>

            <div className="mt-4 flex flex-col items-center gap-1">
              <div className="w-40 border-t-2 border-gray-400" />
              <p className="text-sm font-semibold text-gray-700">Muhammad Irfandi, Lc., MA.</p>
              <p className="text-xs text-gray-500">Direktur LAZSIP</p>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body { margin: 0; }
          @page { size: A4 landscape; margin: 0; }
          .print\\:hidden { display: none !important; }
        }
      `}} />
    </div>
  );
}