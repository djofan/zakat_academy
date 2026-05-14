"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { BookOpen, LayoutDashboard, BarChart3, LogOut, Menu, Brain, Trophy, Award } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Session } from "next-auth";

interface DashboardSidebarProps {
  session: Session;
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/programs", label: "Program", icon: BookOpen },
  { href: "/my-progress", label: "Kemajuan Saya", icon: BarChart3 },
  { href: "/quiz", label: "Kuis", icon: Brain },
  { href: "/leaderboard", label: "Peringkat", icon: Trophy },
  { href: "/certificates", label: "Sertifikat", icon: Award },
];

function SidebarContent({ session, onNavClick }: { session: Session; onNavClick?: () => void }) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 border-b border-gray-100 px-5">
        <img src="/logo-lazsip.webp" alt="LAZSIP" className="h-7 w-7 object-contain" />
        <span className="font-semibold text-gray-900">Zakat Academy</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 p-3">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={onNavClick}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
              isActive(href)
                ? "bg-green-600 text-white shadow-sm shadow-green-200"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      {/* User info */}
      <div className="border-t border-gray-100 p-3">
        <div className="mb-2 flex items-center gap-3 rounded-xl bg-gray-50 px-3 py-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-600 text-xs font-bold text-white">
            {session.user?.name?.charAt(0).toUpperCase() ?? "U"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-900">{session.user?.name}</p>
            <p className="truncate text-xs text-gray-400 font-mono">
              {(session.user as { nis?: string })?.nis ?? "-"}
            </p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-4 w-4" />
          Keluar
        </button>
      </div>
    </div>
  );
}

export function DashboardSidebar({ session }: DashboardSidebarProps) {
  return (
    <aside className="hidden w-64 flex-col border-r border-gray-100 bg-white md:flex">
      <SidebarContent session={session} />
    </aside>
  );
}

export function MobileHeader({ session }: DashboardSidebarProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-100 bg-white px-4 md:hidden">
      <Link href="/" className="flex items-center gap-2 font-semibold">
        <img src="/logo-lazsip.webp" alt="LAZSIP" className="h-7 w-7 object-contain" />
        <span className="text-gray-900">Zakat Academy</span>
      </Link>

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Buka menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex w-64 flex-col p-0">
          <SidebarContent session={session} />
        </SheetContent>
      </Sheet>
    </header>
  );
}