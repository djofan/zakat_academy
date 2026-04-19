"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import {
  BookOpen,
  LayoutDashboard,
  GraduationCap,
  BarChart3,
  LogOut,
  Menu,
} from "lucide-react";
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
];

function SidebarContent({
  session,
  onNavClick,
}: {
  session: Session;
  onNavClick?: () => void;
}) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(href);

  return (
    <>
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <BookOpen className="h-5 w-5 text-primary" />
          <span>Zakat Academy</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={onNavClick}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive(href)
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="border-t p-4">
        <div className="mb-3 flex items-center gap-3 px-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            {session.user?.name?.charAt(0).toUpperCase() ?? "U"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{session.user?.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {session.user?.email}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="h-4 w-4" />
          Keluar
        </Button>
      </div>
    </>
  );
}

export function DashboardSidebar({ session }: DashboardSidebarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-64 flex-col border-r bg-background md:flex">
        <SidebarContent session={session} />
      </aside>

      {/* Mobile: Sheet + hamburger in header (header lives in layout) */}
    </>
  );
}

export function MobileHeader({ session }: DashboardSidebarProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-4 md:hidden">
      <Link href="/" className="flex items-center gap-2 font-semibold">
        <BookOpen className="h-5 w-5 text-primary" />
        <span>Zakat Academy</span>
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
