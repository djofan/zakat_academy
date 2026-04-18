"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { moduleSchema, type ModuleFormValues } from "../schemas";
import { slugify } from "@/lib/slugify";
import { createModule, updateModule } from "../actions";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useDebouncedCallback } from "use-debounce";

interface ProgramOption {
  id: string;
  title: string;
}

interface ModuleFormProps {
  module?: {
    id: string;
    title: string;
    slug: string;
    description?: string | null;
    order: number;
    isPublished: boolean;
    programId: string;
  };
  programs: ProgramOption[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ModuleForm({ module, programs, open, onOpenChange }: ModuleFormProps) {
  const isEdit = !!module?.id;
  const router = useRouter();
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const resolver = zodResolver(moduleSchema) as any;
  const form = useForm<ModuleFormValues>({
    resolver,
    defaultValues: {
      title: module?.title ?? "",
      slug: module?.slug ?? "",
      programId: module?.programId ?? "",
      description: module?.description ?? "",
      order: module?.order ?? 0,
      isPublished: module?.isPublished ?? false,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        title: module?.title ?? "",
        slug: module?.slug ?? "",
        programId: module?.programId ?? "",
        description: module?.description ?? "",
        order: module?.order ?? 0,
        isPublished: module?.isPublished ?? false,
      });
      setSlugManuallyEdited(false);
    }
  }, [open, module, form]);

  const debouncedSetSlug = useDebouncedCallback((value: string) => {
    if (!slugManuallyEdited) {
      form.setValue("slug", slugify(value), { shouldValidate: true });
    }
  }, 400);

  async function onSubmit(values: ModuleFormValues) {
    try {
      if (isEdit && module?.id) {
        await updateModule(module.id, values);
      } else {
        await createModule(values);
      }
      toast.success("Modul berhasil disimpan");
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan modul");
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEdit ? "Edit Modul" : "Tambah Modul Baru"}</SheetTitle>
          <SheetDescription>
            {isEdit ? "Perbarui detail modul." : "Buat modul baru dalam program."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          {/* Program */}
          <div className="space-y-1.5">
            <Label>Program *</Label>
            <Select
              value={form.watch("programId")}
              onValueChange={(v) => form.setValue("programId", v, { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih program..." />
              </SelectTrigger>
              <SelectContent>
                {programs.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.programId && (
              <p className="text-xs text-red-500">{form.formState.errors.programId.message}</p>
            )}
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title">Judul Modul *</Label>
            <Input
              id="title"
              placeholder="Contoh: Pengertian Zakat"
              {...form.register("title")}
              onChange={(e) => {
                form.register("title").onChange(e);
                debouncedSetSlug(e.target.value);
              }}
            />
            {form.formState.errors.title && (
              <p className="text-xs text-red-500">{form.formState.errors.title.message}</p>
            )}
          </div>

          {/* Slug */}
          <div className="space-y-1.5">
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              placeholder="pengertian-zakat"
              {...form.register("slug")}
              onChange={(e) => {
                form.register("slug").onChange(e);
                setSlugManuallyEdited(true);
              }}
            />
            {form.formState.errors.slug && (
              <p className="text-xs text-red-500">{form.formState.errors.slug.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              placeholder="Deskripsi modul..."
              rows={3}
              {...form.register("description")}
            />
          </div>

          {/* Order */}
          <div className="space-y-1.5">
            <Label htmlFor="order">Urutan</Label>
            <Input id="order" type="number" min={0} {...form.register("order")} />
          </div>

          {/* Published */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label htmlFor="isPublished" className="cursor-pointer">Publikasi</Label>
              <p className="text-xs text-muted-foreground">Jika diaktifkan, modul akan terlihat.</p>
            </div>
            <Switch
              id="isPublished"
              checked={form.watch("isPublished")}
              onCheckedChange={(checked) => form.setValue("isPublished", checked)}
            />
          </div>

          <SheetFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
            <Button type="submit">
              {isEdit ? "Simpan Perubahan" : "Buat Modul"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
