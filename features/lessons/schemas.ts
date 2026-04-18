import { z } from "zod";

export const lessonSchema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter"),
  slug: z
    .string()
    .min(1, "Slug wajib diisi")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug hanya huruf kecil, angka, dan strip"),
  moduleId: z.string().min(1, "Modul wajib dipilih"),
  shortDescription: z.string().optional(),
  contentSummary: z.string().optional(),
  thumbnailUrl: z.string().url("URL tidak valid").or(z.literal("")).optional(),
  videoProvider: z.enum(["YOUTUBE", "VIMEO", "BUNNY"]),
  videoUrl: z.string().min(1, "URL video wajib diisi").url("URL tidak valid"),
  order: z.coerce.number().int().min(0).default(0),
  isPublished: z.boolean().default(false),
});

export type LessonFormValues = z.infer<typeof lessonSchema>;
