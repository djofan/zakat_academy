import { z } from "zod";

export const programSchema = z.object({
  title: z.string().min(1, "Judul wajib diisi").max(200),
  slug: z
    .string()
    .min(1, "Slug wajib diisi")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug hanya boleh huruf kecil, angka, dan strip"),
  shortDescription: z.string().min(1, "Deskripsi singkat wajib diisi").max(300),
  description: z.string().optional(),
  thumbnailUrl: z.string().url("URL thumbnail tidak valid").or(z.literal("")).optional(),
  isPublished: z.boolean().optional(),
  order: z.coerce.number().int().min(0).default(0),
});

export type ProgramFormValues = z.infer<typeof programSchema>;
