"use client";

interface StatsSectionProps {
  totalPrograms: number;
  totalLessons: number;
  totalUsers: number;
}

export function StatsSection({ totalPrograms, totalLessons, totalUsers }: StatsSectionProps) {
  const stats = [
    { value: `${totalPrograms}+`, label: "Program Pembelajaran", color: "text-green-600" },
    { value: `${totalLessons}+`, label: "Video Lesson", color: "text-orange-500" },
    { value: `${totalUsers}+`, label: "Pelajar Aktif", color: "text-green-600" },
  ];

  return (
    <section className="relative border-y border-gray-100 bg-white">
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="grid grid-cols-3 gap-4 md:gap-8">
          {stats.map(({ value, label, color }, idx) => (
            <div key={label} className={`text-center ${idx === 1 ? 'border-x border-gray-100' : ''}`}>
              <div className={`text-3xl font-bold md:text-4xl ${color}`}>{value}</div>
              <div className="mt-1 text-xs text-gray-500 md:text-sm">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}