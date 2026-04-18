"use server";

import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { Role } from "@/generated/prisma/client";
import type { LessonFormValues } from "./schemas";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== Role.ADMIN) {
    throw new Error("Unauthorized");
  }
}

export async function createLesson(data: LessonFormValues) {
  try {
    await requireAdmin();
    const lesson = await db.lesson.create({
      data: {
        title: data.title,
        slug: data.slug,
        moduleId: data.moduleId,
        shortDescription: data.shortDescription ?? null,
        contentSummary: data.contentSummary ?? null,
        thumbnailUrl: data.thumbnailUrl || null,
        videoProvider: data.videoProvider,
        videoUrl: data.videoUrl,
        order: data.order,
        isPublished: data.isPublished,
      },
    });
    revalidatePath("/admin/lessons");
    revalidatePath("/admin/programs");
    return lesson;
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") throw err;
    throw new Error("Gagal membuat lesson");
  }
}

export async function updateLesson(id: string, data: LessonFormValues) {
  try {
    await requireAdmin();
    const lesson = await db.lesson.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        moduleId: data.moduleId,
        shortDescription: data.shortDescription ?? null,
        contentSummary: data.contentSummary ?? null,
        thumbnailUrl: data.thumbnailUrl || null,
        videoProvider: data.videoProvider,
        videoUrl: data.videoUrl,
        order: data.order,
        isPublished: data.isPublished,
      },
    });
    revalidatePath("/admin/lessons");
    revalidatePath("/admin/programs");
    return lesson;
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") throw err;
    throw new Error("Gagal memperbarui lesson");
  }
}

export async function deleteLesson(id: string) {
  try {
    await requireAdmin();
    await db.lesson.delete({ where: { id } });
    revalidatePath("/admin/lessons");
    revalidatePath("/admin/programs");
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") throw err;
    throw new Error("Gagal menghapus lesson");
  }
}

export async function reorderLesson(id: string, direction: "up" | "down") {
  try {
    await requireAdmin();
    const lesson = await db.lesson.findUnique({ where: { id } });
    if (!lesson) throw new Error("Lesson tidak ditemukan");

    const siblings = await db.lesson.findMany({
      where: { moduleId: lesson.moduleId },
      orderBy: { order: "asc" },
    });

    const currentIndex = siblings.findIndex((l) => l.id === id);
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= siblings.length) return;

    const currentOrder = lesson.order;
    const targetLesson = siblings[targetIndex];

    await db.lesson.updateMany({
      where: { id: lesson.id },
      data: { order: targetLesson.order },
    });
    await db.lesson.updateMany({
      where: { id: targetLesson.id },
      data: { order: currentOrder },
    });

    revalidatePath("/admin/lessons");
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") throw err;
    throw new Error("Gagal mengubah urutan lesson");
  }
}

export async function addAttachment(lessonId: string, title: string, fileUrl: string) {
  try {
    await requireAdmin();
    const attachment = await db.lessonAttachment.create({
      data: { lessonId, title, fileUrl },
    });
    revalidatePath("/admin/lessons");
    return attachment;
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") throw err;
    throw new Error("Gagal menambahkan lampiran");
  }
}

export async function deleteAttachment(id: string) {
  try {
    await requireAdmin();
    await db.lessonAttachment.delete({ where: { id } });
    revalidatePath("/admin/lessons");
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") throw err;
    throw new Error("Gagal menghapus lampiran");
  }
}
