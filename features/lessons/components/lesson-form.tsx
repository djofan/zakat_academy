"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { lessonSchema, type LessonFormValues } from "../schemas";
import { slugify } from "@/lib/slugify";
import { createLesson, updateLesson, addAttachment, deleteAttachment } from "../actions";
import { VideoPlayer } from "@/components/shared/video-player";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { UploadButton } from "@uploadthing/react";
import { cn } from "@/lib/utils";
import { X, FileText } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";

const UploadBtn = UploadButton as React.ComponentType<any>;

interface ModuleOption {
  id: string;
  title: string;
  programTitle: string;
}

interface LessonFormProps {
  lesson?: {
    id: string;
    title: string;
    slug: string;
    shortDescription?: string | null;
    contentSummary?: string | null;
    thumbnailUrl?: string | null;
    videoProvider: "YOUTUBE" | "VIMEO" | "BUNNY";
    videoUrl: string;
    order: number;
    isPublished: boolean;
    moduleId: string;
    attachments: { id: string; title: string; fileUrl: string; fileType?: string | null }[];
  };
  modules: ModuleOption[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function UploadButtonWrapper({ lessonId, attachments, setAttachments, onUploaded }: {
  lessonId: string;
  attachments: { id: string; title: string; fileUrl: string }[];
  setAttachments: React.Dispatch<React.SetStateAction<{ id: string; title: string; fileUrl: string }[]>>;
  onUploaded: () => void;
}) {
  async function handleDelete(id: string) {
    try {
      await deleteAttachment(id);
      setAttachments((prev) => prev.filter((a) => a.id !== id));
      toast.success("Lampiran dihapus");
    } catch {
      toast.error("Gagal menghapus lampiran");
    }
  }
  return (
    <div className="space-y-2">
      {attachments.length > 0 && (
        <div className="space-y-1">
          {attachments.map((att) => (
            <div key={att.id} className="flex items-center justify-between rounded-md border px-3 py-2">
              <a href={att.fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm hover:underline">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="truncate max-w-[200px]">{att.title}</span>
              </a>
              <Button type="button" variant="ghost" size="sm" onClick={() => handleDelete(att.id)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
      <UploadBtn
        endpoint="attachmentUploader"
        onClientUploadComplete={async (res: any) => {
          for (const file of res as { name: string; url: string }[]) {
            try {
              const att = await addAttachment(lessonId, file.name, file.url);
              setAttachments((prev) => [...prev, att]);
              toast.success("Lampiran ditambahkan");
            } catch {
              toast.error("Gagal menambahkan lampiran");
            }
          }
          onUploaded();
        }}
        onUploadError={(err: Error) => toast.error(err.message)}
        content={{ button: "Upload PDF" }}
      />
    </div>
  );
}

export function LessonForm({ lesson, modules, open, onOpenChange }: LessonFormProps) {
  const isEdit = !!lesson?.id;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [attachments, setAttachments] = useState(lesson?.attachments ?? []);
  const [videoUrl, setVideoUrl] = useState(lesson?.videoUrl ?? "");
  const [videoProvider, setVideoProvider] = useState(lesson?.videoProvider ?? "YOUTUBE");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const resolver = zodResolver(lessonSchema) as any;
  const form = useForm<LessonFormValues>({
    resolver,
    defaultValues: {
      title: lesson?.title ?? "",
      slug: lesson?.slug ?? "",
      moduleId: lesson?.moduleId ?? "",
      shortDescription: lesson?.shortDescription ?? "",
      contentSummary: lesson?.contentSummary ?? "",
      thumbnailUrl: lesson?.thumbnailUrl ?? "",
      videoProvider: lesson?.videoProvider ?? "YOUTUBE",
      videoUrl: lesson?.videoUrl ?? "",
      order: lesson?.order ?? 0,
      isPublished: lesson?.isPublished ?? false,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        title: lesson?.title ?? "",
        slug: lesson?.slug ?? "",
        moduleId: lesson?.moduleId ?? "",
        shortDescription: lesson?.shortDescription ?? "",
        contentSummary: lesson?.contentSummary ?? "",
        thumbnailUrl: lesson?.thumbnailUrl ?? "",
        videoProvider: lesson?.videoProvider ?? "YOUTUBE",
        videoUrl: lesson?.videoUrl ?? "",
        order: lesson?.order ?? 0,
        isPublished: lesson?.isPublished ?? false,
      });
      setAttachments(lesson?.attachments ?? []);
      setVideoUrl(lesson?.videoUrl ?? "");
      setVideoProvider(lesson?.videoProvider ?? "YOUTUBE");
      setSlugManuallyEdited(false);
    }
  }, [open, lesson, form]);

  const debouncedSetSlug = useDebouncedCallback((value: string) => {
    if (!slugManuallyEdited) {
      form.setValue("slug", slugify(value), { shouldValidate: true });
    }
  }, 400);

  function onSubmit(values: LessonFormValues) {
    startTransition(async () => {
      try {
        if (isEdit && lesson?.id) {
          await updateLesson(lesson.id, values);
        } else {
          await createLesson(values);
        }
        toast.success("Lesson berhasil disimpan");
        onOpenChange(false);
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Gagal menyimpan lesson");
      }
    });
  }

  async function handleDeleteAttachment(id: string) {
    try {
      await deleteAttachment(id);
      setAttachments((prev) => prev.filter((a) => a.id !== id));
      toast.success("Lampiran dihapus");
    } catch (err) {
      toast.error("Gagal menghapus lampiran");
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEdit ? "Edit Lesson" : "Tambah Lesson Baru"}</SheetTitle>
          <SheetDescription>
            {isEdit ? "Perbarui detail lesson." : "Buat lesson baru dalam modul."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
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
                    {m.programTitle} &rsaquo; {m.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.moduleId && (
              <p className="text-xs text-red-500">{form.formState.errors.moduleId.message}</p>
            )}
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title">Judul *</Label>
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

          {/* Short Description */}
          <div className="space-y-1.5">
            <Label htmlFor="shortDescription">Deskripsi Singkat</Label>
            <Input
              id="shortDescription"
              placeholder="Penjelasan singkat..."
              {...form.register("shortDescription")}
            />
          </div>

          {/* Video Provider */}
          <div className="space-y-1.5">
            <Label>Platform Video *</Label>
            <Select
              value={form.watch("videoProvider")}
              onValueChange={(v) => {
                form.setValue("videoProvider", v as "YOUTUBE" | "VIMEO" | "BUNNY");
                setVideoProvider(v as "YOUTUBE" | "VIMEO" | "BUNNY");
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="YOUTUBE">YouTube</SelectItem>
                <SelectItem value="VIMEO">Vimeo</SelectItem>
                <SelectItem value="BUNNY">Bunny Stream</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Video URL */}
          <div className="space-y-1.5">
            <Label htmlFor="videoUrl">URL Video *</Label>
            <Input
              id="videoUrl"
              placeholder={
                videoProvider === "YOUTUBE"
                  ? "https://www.youtube.com/watch?v=..."
                  : videoProvider === "VIMEO"
                  ? "https://vimeo.com/..."
                  : "https://..."
              }
              {...form.register("videoUrl")}
              onChange={(e) => {
                form.register("videoUrl").onChange(e);
                setVideoUrl(e.target.value);
              }}
            />
            {form.formState.errors.videoUrl && (
              <p className="text-xs text-red-500">{form.formState.errors.videoUrl.message}</p>
            )}
            {videoUrl && (
              <div className="mt-2">
                <VideoPlayer provider={videoProvider} url={videoUrl} />
              </div>
            )}
          </div>

          {/* Notes / Content Summary */}
          <div className="space-y-1.5">
            <Label htmlFor="contentSummary">Ringkasan / Catatan</Label>
            <Textarea
              id="contentSummary"
              placeholder="Ringkasan atau catatan untuk lesson ini..."
              rows={5}
              {...form.register("contentSummary")}
            />
          </div>

          {/* Order */}
          <div className="space-y-1.5">
            <Label htmlFor="order">Urutan</Label>
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
              <Label htmlFor="isPublished" className="cursor-pointer">Publikasi</Label>
              <p className="text-xs text-muted-foreground">Jika diaktifkan, lesson akan terlihat.</p>
            </div>
            <Switch
              id="isPublished"
              checked={form.watch("isPublished")}
              onCheckedChange={(checked) => form.setValue("isPublished", checked)}
            />
          </div>

          {/* Attachments — edit mode only */}
          {isEdit && (
            <div className="space-y-2">
              <Label>Lampiran</Label>
              {attachments.length > 0 && (
                <div className="space-y-1">
                  {attachments.map((att) => (
                    <div key={att.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                      <a href={att.fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm hover:underline">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate max-w-[200px]">{att.title}</span>
                      </a>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAttachment(att.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <UploadButtonWrapper
                lessonId={lesson.id}
                attachments={attachments}
                setAttachments={setAttachments}
                onUploaded={() => { router.refresh(); }}
              />
            </div>
          )}

          {form.formState.errors.root && (
            <p className="text-sm text-red-500">{form.formState.errors.root.message}</p>
          )}

          <SheetFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Buat Lesson"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
