"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { BookOpen, LayoutDashboard, LogOut, Settings, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Session } from "next-auth";

interface AdminSidebarProps {
  session: Session;
}

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/programs", label: "Program", icon: BookOpen },
  { href: "/admin/users", label: "Pengguna", icon: Users },
  { href: "/admin/settings", label: "Pengaturan", icon: Settings },
];

export function AdminSidebar({ session }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 flex-col border-r bg-background md:flex">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <BookOpen className="h-5 w-5 text-primary" />
          <span>Zakat Academy</span>
        </Link>
      </div>

      <div className="border-b px-4 py-2 text-xs text-muted-foreground">
        Panel Admin
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <div className="mb-3 flex items-center gap-3 px-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            {session.user?.name?.charAt(0).toUpperCase() ?? "A"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{session.user?.name}</p>
            <p className="truncate text-xs text-muted-foreground">Admin</p>
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
    </aside>
  );
}