"use client";

const features = [
  {
    title: "Video Terstruktur",
    description:
      "Materi disajikan dalam video singkat yang mudah dipahami, tersusun dari dasar hingga lanjutan.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-6 w-6"
        aria-hidden="true"
      >
        <rect
          x="2"
          y="4"
          width="15"
          height="11"
          rx="2"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M17 9l5 3-5 3V9z"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Kuis Interaktif",
    description:
      "Uji pemahaman kamu setiap selesai modul dengan kuis yang dirancang untuk memperkuat hafalan.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-6 w-6"
        aria-hidden="true"
      >
        <rect
          x="4"
          y="2"
          width="16"
          height="20"
          rx="2"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M8 10l2 2 4-4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Pantau Progres",
    description:
      "Lihat sejauh mana perjalanan belajarmu dan lanjutkan kapan saja dari perangkat apapun.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-6 w-6"
        aria-hidden="true"
      >
        <path
          d="M18 20V10M12 20V4M6 20v-6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

export function FeaturesSection() {
  return (
    <section className="bg-muted/30 px-4 py-16">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <p className="mb-2 text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Fitur
          </p>
          <h2 className="text-2xl font-semibold tracking-tight">
            Belajar Lebih Efektif
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {features.map(({ title, description, icon }) => (
            <div key={title} className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                {icon}
              </div>
              <h3 className="mb-2 font-semibold">{title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
