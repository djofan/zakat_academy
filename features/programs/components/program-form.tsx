"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { programSchema, type ProgramFormValues } from "../schemas";
import {
  createProgram,
  updateProgram,
} from "../actions";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useTransition } from "react";
import { useDebouncedCallback } from "use-debounce";
import { useState } from "react";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

interface ProgramFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editData?: {
    id?: string;
    title?: string;
    slug?: string;
    shortDescription?: string | null;
    description?: string | null;
    thumbnailUrl?: string | null;
    isPublished?: boolean;
    order?: number;
  } | null;
}

export function ProgramForm({
  open,
  onOpenChange,
  editData,
}: ProgramFormProps) {
  const isEdit = !!editData?.id;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [descriptionValue, setDescriptionValue] = useState(editData?.description ?? "");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const resolver = zodResolver(programSchema) as any;
  const form = useForm<ProgramFormValues>({
    resolver,
    defaultValues: {
      title: editData?.title ?? "",
      slug: editData?.slug ?? "",
      shortDescription: (editData?.shortDescription ?? "") as string,
      description: (editData?.description ?? "") as string,
      thumbnailUrl: editData?.thumbnailUrl ?? "",
      isPublished: editData?.isPublished ?? false,
      order: editData?.order ?? 0,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        title: editData?.title ?? "",
        slug: editData?.slug ?? "",
        shortDescription: editData?.shortDescription ?? "",
        description: editData?.description ?? "",
        thumbnailUrl: editData?.thumbnailUrl ?? "",
        isPublished: editData?.isPublished ?? false,
        order: editData?.order ?? 0,
      });
      setDescriptionValue(editData?.description ?? "");
      setSlugManuallyEdited(false);
    }
  }, [open, editData, form]);

  const debouncedSetSlug = useDebouncedCallback((value: string) => {
    if (!slugManuallyEdited) {
      form.setValue("slug", slugify(value), { shouldValidate: true });
    }
  }, 400);

  function onSubmit(values: ProgramFormValues) {
    startTransition(async () => {
      try {
        if (isEdit && editData?.id) {
          await updateProgram(editData.id, values);
        } else {
          await createProgram(values);
        }
        onOpenChange(false);
        router.refresh();
      } catch (err) {
        form.setError("root", {
          message: err instanceof Error ? err.message : "Terjadi kesalahan",
        });
      }
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {isEdit ? "Edit Program" : "Tambah Program Baru"}
          </SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Perbarui detail program pembelajaran."
              : "Buat program pembelajaran baru."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title">Judul Program *</Label>
            <Input
              id="title"
              placeholder="Contoh: Fikih Zakat Mal"
              {...form.register("title")}
              onChange={(e) => {
                form.register("title").onChange(e);
                debouncedSetSlug(e.target.value);
              }}
            />
            {form.formState.errors.title && (
              <p className="text-xs text-red-500">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          {/* Slug */}
          <div className="space-y-1.5">
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              placeholder="fikih-zakat-mal"
              {...form.register("slug")}
              onChange={(e) => {
                form.register("slug").onChange(e);
                setSlugManuallyEdited(true);
              }}
            />
            <p className="text-xs text-muted-foreground">
              URL: /programs/
              {form.watch("slug") || "slug-anda"}
            </p>
            {form.formState.errors.slug && (
              <p className="text-xs text-red-500">
                {form.formState.errors.slug.message}
              </p>
            )}
          </div>

          {/* Short Description */}
          <div className="space-y-1.5">
            <Label htmlFor="shortDescription">Deskripsi Singkat *</Label>
            <Input
              id="shortDescription"
              placeholder="Penjelasan singkat program (maks 300 karakter)"
              {...form.register("shortDescription")}
            />
            {form.formState.errors.shortDescription && (
              <p className="text-xs text-red-500">
                {form.formState.errors.shortDescription.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description">Deskripsi Lengkap</Label>
            <Textarea
              id="description"
              placeholder="Deskripsi detail program..."
              rows={4}
              value={descriptionValue}
              onChange={(e) => {
                form.register("description").onChange(e);
                setDescriptionValue(e.target.value);
              }}
              onBlur={(e) => form.register("description").onBlur(e)}
            />
          </div>

          {/* Thumbnail URL */}
          <div className="space-y-1.5">
            <Label htmlFor="thumbnailUrl">URL Thumbnail</Label>
            <Input
              id="thumbnailUrl"
              placeholder="https://..."
              {...form.register("thumbnailUrl")}
            />
            {form.formState.errors.thumbnailUrl && (
              <p className="text-xs text-red-500">
                {form.formState.errors.thumbnailUrl.message}
              </p>
            )}
          </div>

          {/* Order */}
          <div className="space-y-1.5">
            <Label htmlFor="order">Urutan Tampilan</Label>
            <Input
              id="order"
              type="number"
              min={0}
              {...form.register("order")}
            />
          </div>

          {/* Published */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label htmlFor="isPublished" className="cursor-pointer">
                Publikasi Program
              </Label>
              <p className="text-xs text-muted-foreground">
                Jika diaktifkan, program akan terlihat oleh peserta.
              </p>
            </div>
            <Switch
              id="isPublished"
              checked={form.watch("isPublished")}
              onCheckedChange={(checked) =>
                form.setValue("isPublished", checked)
              }
            />
          </div>

          {form.formState.errors.root && (
            <p className="text-sm text-red-500">
              {form.formState.errors.root.message}
            </p>
          )}

          <SheetFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Buat Program"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
