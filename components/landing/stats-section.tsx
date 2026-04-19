"use client";

interface StatsSectionProps {
  totalPrograms: number;
  totalLessons: number;
  totalUsers: number;
}

export function StatsSection({
  totalPrograms,
  totalLessons,
  totalUsers,
}: StatsSectionProps) {
  const stats = [
    { value: `${totalPrograms}+`, label: "Program" },
    { value: `${totalLessons}+`, label: "Video Lesson" },
    { value: `${totalUsers}+`, label: "Pelajar" },
  ];

  return (
    <section className="border-y bg-muted/30">
      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 px-4 py-12 md:grid-cols-3">
        {stats.map(({ value, label }) => (
          <div key={label} className="text-center">
            <div className="text-3xl font-bold">{value}</div>
            <div className="mt-1 text-sm text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
