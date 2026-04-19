"use client";

export function Footer() {
  return (
    <footer className="border-t py-8">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-4 text-sm text-muted-foreground md:flex-row">
        <p>&copy; {new Date().getFullYear()} Zakat Academy &middot; LAZSIP</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-foreground">
            Tentang
          </a>
          <a href="#" className="hover:text-foreground">
            Hubungi Kami
          </a>
        </div>
      </div>
    </footer>
  );
}
