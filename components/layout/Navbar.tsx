"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { BookOpen, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => pathname === href;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <BookOpen className="h-5 w-5 text-primary" />
          <span>Zakat Academy</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-6 text-sm md:flex">
          <Link
            href="/programs"
            className={cn(
              "text-muted-foreground transition-colors hover:text-foreground",
              isActive("/programs") && "text-foreground"
            )}
          >
            Program
          </Link>
        </nav>

        {/* Auth */}
        <div className="hidden items-center gap-2 md:flex">
          {status === "loading" ? null : session ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <Button variant="outline" size="sm" onClick={() => signOut()}>
                Keluar
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Masuk</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">Daftar</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="flex items-center md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="border-t md:hidden">
          <nav className="flex flex-col gap-1 p-4 text-sm">
            <Link
              href="/programs"
              className="rounded-md px-3 py-2 text-muted-foreground hover:bg-muted"
              onClick={() => setMobileOpen(false)}
            >
              Program
            </Link>
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className="rounded-md px-3 py-2 text-muted-foreground hover:bg-muted"
                  onClick={() => setMobileOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  className="rounded-md px-3 py-2 text-left text-muted-foreground hover:bg-muted"
                  onClick={() => { signOut(); setMobileOpen(false); }}
                >
                  Keluar
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-md px-3 py-2 text-muted-foreground hover:bg-muted"
                  onClick={() => setMobileOpen(false)}
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="rounded-md px-3 py-2 hover:bg-muted"
                  onClick={() => setMobileOpen(false)}
                >
                  Daftar
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}