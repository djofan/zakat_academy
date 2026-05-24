"use client";

import { useEffect, useTransition } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { quizSchema, type QuizFormValues } from "../schemas";
import { createQuiz, updateQuiz } from "../actions";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { QuestionEditor } from "./question-editor";

interface QuizFormProps {
  quiz?: {
    id: string;
    title: string;
    moduleId: string;
    isActive: boolean;
    quizDate: string | null;
    timeLimitMinutes: number;
    allowRetake: boolean;
    questions: {
      id: string;
      text: string;
      order: number;
      options: { id: string; label: string; isCorrect: boolean }[];
    }[];
  };
  modules: { id: string; title: string; program: { title: string } }[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function defaultQuestion() {
  return {
    text: "",
    order: 0,
    options: [
      { label: "", isCorrect: false },
      { label: "", isCorrect: false },
    ],
  };
}

function makeFormDefaults(quiz?: QuizFormProps["quiz"]) {
  if (!quiz) {
    return {
      title: "",
      moduleId: "",
      isActive: false,
      quizDate: null,
      timeLimitMinutes: 10,
      allowRetake: false,
      questions: [defaultQuestion()],
    };
  }
  return {
    title: quiz.title,
    moduleId: quiz.moduleId,
    isActive: quiz.isActive,
    quizDate: quiz.quizDate
  ? (() => {
      const d = new Date(quiz.quizDate);
      d.setHours(d.getHours() - 7); // UTC ke WIB
      return d.toISOString().slice(0, 16);
    })()
  : null,
    timeLimitMinutes: quiz.timeLimitMinutes,
    allowRetake: quiz.allowRetake,
    questions: [...quiz.questions]
      .sort((a, b) => a.order - b.order)
      .map((q) => ({
        text: q.text,
        order: q.order,
        options: q.options.map((o) => ({ label: o.label, isCorrect: o.isCorrect })),
      })),
  };
}

export function QuizForm({ quiz, modules, open, onOpenChange }: QuizFormProps) {
  const isEdit = !!quiz?.id;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<QuizFormValues>({
    resolver: zodResolver(quizSchema) as any,
    defaultValues: makeFormDefaults(quiz),
  });

  useEffect(() => {
    if (open) {
      form.reset(makeFormDefaults(quiz));
    }
  }, [open, quiz, form]);

  function removeQuestion(index: number) {
    remove(index);
    const questions = form.getValues("questions");
    questions.forEach((_, i) => {
      form.setValue(`questions.${i}.order`, i);
    });
  }

  function onSubmit(values: QuizFormValues) {
    const payload = {
      ...values,
      questions: values.questions.map((q, i) => ({ ...q, order: i })),
    };
    startTransition(async () => {
      try {
        if (isEdit && quiz?.id) {
          await updateQuiz(quiz.id, payload);
        } else {
          await createQuiz(payload);
        }
        toast.success(isEdit ? "Kuis diperbarui" : "Kuis dibuat");
        onOpenChange(false);
        window.location.reload();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Gagal menyimpan kuis");
      }
    });
  }

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "questions",
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEdit ? "Edit Kuis" : "Tambah Kuis Baru"}</SheetTitle>
          <SheetDescription>
            {isEdit ? "Perbarui detail kuis." : "Buat kuis baru dalam modul."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4 pl-2">
          {/* Module */}
          <div className="space-y-1.5">
            <Label>Modul *</Label>
            <Select
              value={form.watch("moduleId")}
              onValueChange={(v) => form.setValue("moduleId", v, { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih modul..." />
              </SelectTrigger>
              <SelectContent>
                {modules.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.program.title} &rsaquo; {m.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.moduleId && (
              <p className="text-xs text-red-500">{String(form.formState.errors.moduleId.message)}</p>
            )}
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="quiz-title">Judul Kuis *</Label>
            <Input
              id="quiz-title"
              placeholder="Contoh: Kuis Pengertian Zakat"
              {...form.register("title")}
            />
            {form.formState.errors.title && (
              <p className="text-xs text-red-500">{String(form.formState.errors.title.message)}</p>
            )}
          </div>

          {/* Quiz Settings */}
          <div className="space-y-3 rounded-lg border p-4">
            <p className="text-sm font-medium">Pengaturan Kuis</p>

            {/* isActive */}
            <div className="flex items-center justify-between">
              <Label htmlFor="isActive" className="cursor-pointer">Kuis Aktif</Label>
              <input
                id="isActive"
                type="checkbox"
                className="accent-primary h-4 w-4"
                {...form.register("isActive")}
              />
            </div>

            {/* quizDate */}
            <div className="space-y-1.5">
              <Label htmlFor="quizDate">Tanggal & Jam Kuis</Label>
              <Input
                id="quizDate"
                type="datetime-local"
                {...form.register("quizDate", {
  setValueAs: (v) => {
    if (!v || v === "") return null;
    const d = new Date(v);
    d.setHours; // WIB ke UTC
    return d.toISOString();
  },
})}
              />
              <p className="text-xs text-muted-foreground">
                Kosongkan jika kuis selalu tersedia (selama aktif).
              </p>
            </div>

            {/* timeLimitMinutes */}
            <div className="space-y-1.5">
              <Label htmlFor="timeLimitMinutes">Batas Waktu (menit)</Label>
              <Input
                id="timeLimitMinutes"
                type="number"
                min={1}
                max={120}
                {...form.register("timeLimitMinutes", { valueAsNumber: true })}
              />
              {form.formState.errors.timeLimitMinutes && (
                <p className="text-xs text-red-500">
                  {String(form.formState.errors.timeLimitMinutes.message)}
                </p>
              )}
            </div>

            {/* allowRetake */}
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="allowRetake" className="cursor-pointer">Izinkan Pengulangan</Label>
                <p className="text-xs text-muted-foreground">
                  Student bisa mengerjakan lebih dari sekali.
                </p>
              </div>
              <input
                id="allowRetake"
                type="checkbox"
                className="accent-primary h-4 w-4"
                {...form.register("allowRetake")}
              />
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Soal</Label>
            </div>

            {fields.map((field, index) => (
              <QuestionEditor
                key={field.id}
                questionIndex={index}
                control={form.control}
                register={form.register}
                setValue={form.setValue}
                watch={form.watch}
                errors={form.formState.errors}
                onRemove={() => removeQuestion(index)}
              />
            ))}

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => append({
                text: "",
                order: fields.length,
                options: [
                  { label: "", isCorrect: false },
                  { label: "", isCorrect: false },
                ],
              })}
            >
              <Plus className="mr-2 h-4 w-4" />
              Tambah Soal
            </Button>
          </div>

          {form.formState.errors.root && (
            <p className="text-sm text-red-500">{String(form.formState.errors.root.message)}</p>
          )}

          <SheetFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Buat Kuis"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

