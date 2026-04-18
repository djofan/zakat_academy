import Link from "next/link";
import { ArrowRight, BookOpen, Users, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";

export default async function LandingPage() {
  const programs = await db.program.findMany({
    where: { isPublished: true },
    orderBy: { order: "asc" },
    take: 6,
    include: { _count: { select: { modules: true } } },
  });

  const stats = [
    { icon: Video, label: "Video Pembelajaran", value: "50+" },
    { icon: BookOpen, label: "Modul", value: "12+" },
    { icon: Users, label: "Peserta", value: "200+" },
  ];

  return (
    <>
      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-4 py-24 text-center">
        <div className="mx-auto max-w-3xl space-y-6">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Belajar Zakat dengan{" "}
            <span className="text-primary">Sistematis</span> dan{" "}
            <span className="text-primary">Video</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Platform pembelajaran fikih zakat berbasis video. Belajar dari
            dasar hingga tingkat lanjut dengan pendekatan praktis dan terstruktur.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button size="lg" asChild>
              <Link href="/register">
                Mulai Belajar Gratis <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/programs">Lihat Program</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y bg-muted/30">
        <div className="mx-auto grid max-w-4xl grid-cols-3 gap-6 px-4 py-10">
          {stats.map(({ icon: Icon, label, value }) => (
            <div key={label} className="text-center">
              <Icon className="mx-auto mb-2 h-6 w-6 text-primary" />
              <div className="text-2xl font-bold">{value}</div>
              <div className="text-sm text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Programs */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold tracking-tight">Program Pembelajaran</h2>
            <p className="mt-2 text-muted-foreground">
              Pilih program yang sesuai dengan kebutuhan Anda
            </p>
          </div>

          {programs.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <p>Belum ada program tersedia. Cek lagi nanti.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {programs.map((program) => (
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
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        <BookOpen className="h-10 w-10 opacity-30" />
                      </div>
                    )}
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base leading-snug group-hover:text-primary">
                      {program.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 text-xs">
                      {program.shortDescription}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="mb-3 text-xs text-muted-foreground">
                      {program._count.modules} modul
                    </p>
                    <Button size="sm" variant="outline" className="w-full" asChild>
                      <Link href={`/programs/${program.slug}`}>Lihat Program</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {programs.length > 0 && (
            <div className="mt-8 text-center">
              <Button variant="outline" asChild>
                <Link href="/programs">Lihat Semua Program</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary px-4 py-16 text-primary-foreground">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold">Siap Memulai?</h2>
          <p className="mt-2 opacity-80">
            Daftar sekarang dan mulai belajar fikih zakat dengan mudah dan gratis.
          </p>
          <div className="mt-6">
            <Button size="lg" variant="secondary" className="font-medium" asChild>
              <Link href="/register">Daftar Sekarang</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}