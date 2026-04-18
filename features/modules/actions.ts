"use server";

import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { Role } from "@/generated/prisma/client";
import type { ModuleFormValues } from "./schemas";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== Role.ADMIN) {
    throw new Error("Unauthorized");
  }
}

export async function createModule(data: ModuleFormValues) {
  try {
    await requireAdmin();
    const m = await db.module.create({
      data: {
        title: data.title,
        slug: data.slug,
        programId: data.programId,
        description: data.description ?? null,
        order: data.order,
        isPublished: data.isPublished,
      },
    });
    revalidatePath("/admin/modules");
    revalidatePath("/admin/programs");
    revalidatePath("/admin/lessons");
    return m;
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") throw err;
    throw new Error("Gagal membuat modul");
  }
}

export async function updateModule(id: string, data: ModuleFormValues) {
  try {
    await requireAdmin();
    const m = await db.module.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        programId: data.programId,
        description: data.description ?? null,
        order: data.order,
        isPublished: data.isPublished,
      },
    });
    revalidatePath("/admin/modules");
    revalidatePath("/admin/programs");
    revalidatePath("/admin/lessons");
    return m;
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") throw err;
    throw new Error("Gagal memperbarui modul");
  }
}

export async function deleteModule(id: string) {
  try {
    await requireAdmin();
    const count = await db.lesson.count({ where: { moduleId: id } });
    if (count > 0) {
      return { error: "Modul masih memiliki lesson" };
    }
    await db.module.delete({ where: { id } });
    revalidatePath("/admin/modules");
    revalidatePath("/admin/programs");
    revalidatePath("/admin/lessons");
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") throw err;
    throw new Error("Gagal menghapus modul");
  }
}

export async function reorderModule(id: string, direction: "up" | "down") {
  try {
    await requireAdmin();
    const module = await db.module.findUnique({ where: { id } });
    if (!module) throw new Error("Modul tidak ditemukan");

    const siblings = await db.module.findMany({
      where: { programId: module.programId },
      orderBy: { order: "asc" },
    });

    const currentIndex = siblings.findIndex((m) => m.id === id);
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= siblings.length) return;

    const currentOrder = module.order;
    const targetModule = siblings[targetIndex];

    await db.$transaction([
      db.module.updateMany({ where: { id: module.id }, data: { order: targetModule.order } }),
      db.module.updateMany({ where: { id: targetModule.id }, data: { order: currentOrder } }),
    ]);

    revalidatePath("/admin/modules");
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") throw err;
    throw new Error("Gagal mengubah urutan modul");
  }
}
