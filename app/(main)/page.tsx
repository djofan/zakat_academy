import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Navbar } from "@/components/landing/navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { StatsSection } from "@/components/landing/stats-section";
import { ProgramsSection } from "@/components/landing/programs-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { Footer } from "@/components/landing/footer";

export default async function LandingPage() {
  const session = await getServerSession(authOptions);
  const isLoggedIn = !!session;

  const [programs, totalLessons, totalStudents] = await Promise.all([
    db.program.findMany({
      where: { isPublished: true },
      orderBy: { order: "asc" },
      take: 6,
      include: {
        _count: { select: { modules: true } },
        modules: {
          include: { _count: { select: { lessons: true } } },
        },
      },
    }),
    db.lesson.count({
      where: { isPublished: true },
    }),
    db.user.count({
      where: { role: "STUDENT" },
    }),
  ]);

  const programsWithTotalLessons = programs.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    shortDescription: p.shortDescription,
    thumbnailUrl: p.thumbnailUrl,
    _count: p._count,
    totalLessons: p.modules.reduce((s, m) => s + m._count.lessons, 0),
  }));

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar isLoggedIn={isLoggedIn} />
      <div className="pt-14">
        <HeroSection />
        <StatsSection
          totalPrograms={programs.length}
          totalLessons={totalLessons}
          totalUsers={totalStudents}
        />
        <ProgramsSection programs={programsWithTotalLessons} />
        <FeaturesSection />
      </div>
      <Footer />
    </div>
  );
}
