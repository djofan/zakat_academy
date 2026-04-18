"use server";

import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { Role } from "@/generated/prisma/client";
import type { ProgramFormValues } from "./schemas";

export async function createProgram(values: ProgramFormValues) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== Role.ADMIN) {
    throw new Error("Unauthorized");
  }

  const program = await db.program.create({
    data: {
      title: values.title,
      slug: values.slug,
      shortDescription: values.shortDescription,
      description: values.description ?? null,
      thumbnailUrl: values.thumbnailUrl || null,
      isPublished: values.isPublished ?? false,
      order: values.order,
    },
  });

  revalidatePath("/admin/programs");
  revalidatePath("/programs");
  return program;
}

export async function updateProgram(id: string, values: ProgramFormValues) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== Role.ADMIN) {
    throw new Error("Unauthorized");
  }

  const program = await db.program.update({
    where: { id },
    data: {
      title: values.title,
      slug: values.slug,
      shortDescription: values.shortDescription,
      description: values.description ?? null,
      thumbnailUrl: values.thumbnailUrl || null,
      isPublished: values.isPublished ?? false,
      order: values.order,
    },
  });

  revalidatePath("/admin/programs");
  revalidatePath("/programs");
  revalidatePath(`/programs/${program.slug}`);
  return program;
}

export async function deleteProgram(id: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== Role.ADMIN) {
    throw new Error("Unauthorized");
  }

  await db.program.delete({ where: { id } });

  revalidatePath("/admin/programs");
  revalidatePath("/programs");
}

export async function togglePublished(id: string, isPublished: boolean) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== Role.ADMIN) {
    throw new Error("Unauthorized");
  }

  const program = await db.program.update({
    where: { id },
    data: { isPublished },
  });

  revalidatePath("/admin/programs");
  revalidatePath("/programs");
  revalidatePath(`/programs/${program.slug}`);
  return program;
}
