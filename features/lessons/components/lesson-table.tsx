"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2, ArrowUp, ArrowDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { deleteLesson, reorderLesson } from "@/features/lessons/actions";
import { toast } from "sonner";
import { LessonForm } from "./lesson-form";

export type LessonRow = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  contentSummary: string | null;
  thumbnailUrl: string | null;
  videoProvider: "YOUTUBE" | "VIMEO" | "BUNNY";
  videoUrl: string;
  order: number;
  isPublished: boolean;
  moduleId: string;
  module: { id: string; title: string; program: { id: string; title: string; slug: string } };
  attachments: { id: string; title: string; fileUrl: string; fileType?: string | null }[];
};

export type ModuleOption = {
  id: string;
  title: string;
  programTitle: string;
};

const providerColors: Record<string, string> = {
  YOUTUBE: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  VIMEO: "bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300",
  BUNNY: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
};

const providerLabels: Record<string, string> = {
  YOUTUBE: "YouTube",
  VIMEO: "Vimeo",
  BUNNY: "Bunny",
};

export function LessonTable({
  initialLessons,
  initialModules,
}: {
  initialLessons: LessonRow[];
  initialModules: ModuleOption[];
}) {
  const router = useRouter();
  const [lessons, setLessons] = useState(initialLessons);
  const [filterModule, setFilterModule] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editLesson, setEditLesson] = useState<LessonRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LessonRow | null>(null);
  const [deletePending, startDelete] = useTransition();

  const filtered = lessons.filter((l) => {
    const matchModule = filterModule === "all" || l.moduleId === filterModule;
    const matchSearch = l.title.toLowerCase().includes(search.toLowerCase());
    return matchModule && matchSearch;
  });

  function handleEdit(row: LessonRow) {
    setEditLesson(row);
    setFormOpen(true);
  }

  function handleDelete(row: LessonRow) {
    setDeleteTarget(row);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    startDelete(async () => {
      try {
        await deleteLesson(deleteTarget.id);
        setLessons((prev) => prev.filter((l) => l.id !== deleteTarget.id));
        toast.success("Lesson dihapus");
      } catch {
        toast.error("Gagal menghapus lesson");
      } finally {
        setDeleteTarget(null);
      }
    });
  }

  function handleReorder(id: string, dir: "up" | "down") {
    startDelete(async () => {
      try {
        await reorderLesson(id, dir);
        router.refresh();
      } catch {
        toast.error("Gagal mengubah urutan");
      }
    });
  }

  const columns: ColumnDef<LessonRow>[] = [
    {
      accessorKey: "order",
      header: "#",
      cell: ({ row }) => (
        <span className="tabular-nums font-medium">{row.original.order}</span>
      ),
    },
    {
      accessorKey: "title",
      header: "Judul Lesson",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.title}</p>
          <p className="text-xs text-muted-foreground">
            {row.original.module.program.title} &rsaquo; {row.original.module.title}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "videoProvider",
      header: "Platform",
      cell: ({ row }) => (
        <Badge className={cn(providerColors[row.original.videoProvider])}>
          {providerLabels[row.original.videoProvider]}
        </Badge>
      ),
    },
    {
      accessorKey: "isPublished",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.isPublished ? "default" : "secondary"}>
          {row.original.isPublished ? "Published" : "Draft"}
        </Badge>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
            <DropdownMenuItem onSelect={() => handleReorder(row.original.id, "up")}>
              <ArrowUp className="mr-2 h-4 w-4" /> Geser Naik
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleReorder(row.original.id, "down")}>
              <ArrowDown className="mr-2 h-4 w-4" /> Geser Turun
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => handleEdit(row.original)}>
              <Pencil className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onSelect={() => handleDelete(row.original)}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      enableSorting: false,
    },
  ];

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Input
          placeholder="Cari lesson..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-[240px]"
        />
        <div className="flex items-center gap-2">
          <Label className="text-sm text-muted-foreground">Modul:</Label>
          <Select value={filterModule} onValueChange={setFilterModule}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Semua modul" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Modul</SelectItem>
              {initialModules.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.programTitle} &rsaquo; {m.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="ml-auto">
          <Button onClick={() => { setEditLesson(null); setFormOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Tambah Lesson
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              {columns.map((col) => (
                <th key={col.id ?? (col as any).accessorKey} className="px-3 py-2.5 text-left font-medium">
                  {"header" in col ? String(col.header) : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-8 text-center text-muted-foreground">
                  Tidak ada lesson ditemukan.
                </td>
              </tr>
            ) : (
              filtered.map((row) => (
                <tr key={row.id} className="border-t hover:bg-muted/30">
                  {columns.map((col) => {
                    const id = col.id ?? String((col as any).accessorKey);
                    return (
                      <td key={id} className="px-3 py-2.5">
                        {id === "actions" ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                              <DropdownMenuItem onSelect={() => handleReorder(row.id, "up")}>
                                <ArrowUp className="mr-2 h-4 w-4" /> Geser Naik
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => handleReorder(row.id, "down")}>
                                <ArrowDown className="mr-2 h-4 w-4" /> Geser Turun
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onSelect={() => handleEdit(row)}>
                                <Pencil className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onSelect={() => handleDelete(row)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Hapus
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : col.id === "title" ? (
                          <div>
                            <p className="font-medium">{row.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {row.module.program.title} &rsaquo; {row.module.title}
                            </p>
                          </div>
                        ) : col.id === "videoProvider" ? (
                          <Badge className={cn(providerColors[row.videoProvider])}>
                            {providerLabels[row.videoProvider]}
                          </Badge>
                        ) : col.id === "isPublished" ? (
                          <Badge variant={row.isPublished ? "default" : "secondary"}>
                            {row.isPublished ? "Published" : "Draft"}
                          </Badge>
                        ) : col.id === "order" ? (
                          <span className="tabular-nums font-medium">{row.order}</span>
                        ) : null}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Lesson?</AlertDialogTitle>
            <AlertDialogDescription>
              Lesson "{deleteTarget?.title}" akan dihapus permanen beserta lampirannya.
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmDelete}
            >
              {deletePending ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <LessonForm
        lesson={editLesson ?? undefined}
        modules={initialModules}
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditLesson(null);
        }}
      />
    </>
  );
}