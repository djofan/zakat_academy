import { z } from "zod";

export const quizOptionSchema = z.object({
  label: z.string().min(1, "Jawaban tidak boleh kosong"),
  isCorrect: z.boolean().default(false),
});

export type QuizOptionValues = z.infer<typeof quizOptionSchema>;

export const quizQuestionSchema = z.object({
  text: z.string().min(5, "Soal minimal 5 karakter"),
  order: z.number().int().min(0),
  options: z
    .array(quizOptionSchema)
    .min(2, "Minimal 2 pilihan jawaban")
    .max(4, "Maksimal 4 pilihan jawaban")
    .refine(
      (options) => options.filter((o) => o.isCorrect).length === 1,
      { message: "Pilih tepat satu jawaban yang benar" }
    ),
});

export type QuizQuestionValues = z.infer<typeof quizQuestionSchema>;

export const quizSchema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter"),
  moduleId: z.string().min(1, "Modul wajib dipilih"),
  questions: z
    .array(quizQuestionSchema)
    .min(1, "Minimal 1 soal"),
});

export type QuizFormValues = z.infer<typeof quizSchema>;
