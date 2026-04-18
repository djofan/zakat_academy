import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { lessonId, isCompleted }: { lessonId: string; isCompleted: boolean } = await req.json();

  if (!lessonId) {
    return NextResponse.json({ error: "lessonId required" }, { status: 400 });
  }

  if (isCompleted) {
    await db.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId: session.user.id,
          lessonId,
        },
      },
      update: { completed: true, completedAt: new Date() },
      create: {
        userId: session.user.id,
        lessonId,
        completed: true,
        completedAt: new Date(),
      },
    });
  } else {
    await db.lessonProgress.deleteMany({
      where: {
        userId: session.user.id,
        lessonId,
      },
    });
  }

  return NextResponse.json({ ok: true });
}