import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    nextauth_url: process.env.NEXTAUTH_URL,
    nextauth_secret_exists: !!process.env.NEXTAUTH_SECRET,
    node_env: process.env.NODE_ENV,
  });
}