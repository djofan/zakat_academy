import { z } from "zod";

export const moduleSchema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter"),
  slug: z
    .string()
    .min(1, "Slug wajib diisi")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug hanya huruf kecil, angka, dan strip"),
  programId: z.string().min(1, "Program wajib dipilih"),
  description: z.string().optional(),
  order: z.coerce.number().int().min(0).default(0),
  isPublished: z.boolean().default(false),
});

export type ModuleFormValues = z.infer<typeof moduleSchema>;
