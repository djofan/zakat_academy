import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";

export default withAuth(
  async function middleware(req: any) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Cek maintenance mode
    const maintenanceRes = await fetch(new URL('/api/maintenance', req.url))
    const { maintenance } = await maintenanceRes.json()

    if (maintenance && token?.role !== 'ADMIN' && path !== '/maintenance') {
      return NextResponse.redirect(new URL('/maintenance', req.url))
    }

    if (path === '/maintenance' && !maintenance) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // Admin mencoba akses halaman student
    if (path.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Student mencoba akses halaman admin
    if (
      (path.startsWith("/dashboard") ||
        path.startsWith("/programs") ||
        path.startsWith("/my-progress") ||
        path.startsWith("/quiz") ||
        path.startsWith("/leaderboard") ||
        path.startsWith("/certificates")) &&
      token?.role === "ADMIN"
    ) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/programs/:path*",
    "/my-progress/:path*",
    "/quiz/:path*",
    "/leaderboard/:path*",
    "/certificates/:path*",
    "/admin/:path*",
    "/maintenance",
  ],
};