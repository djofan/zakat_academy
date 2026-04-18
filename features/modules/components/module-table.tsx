"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2, ArrowUp, ArrowDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { deleteModule, reorderModule } from "@/features/modules/actions";
import { toast } from "sonner";
import { ModuleForm } from "./module-form";

export type ModuleRow = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  order: number;
  isPublished: boolean;
  programId: string;
  program: { id: string; title: string };
  _count: { lessons: number };
};

export function ModuleTable({
  initialModules,
  initialPrograms,
}: {
  initialModules: ModuleRow[];
  initialPrograms: { id: string; title: string }[];
}) {
  const router = useRouter();
  const [modules, setModules] = useState(initialModules);
  const [filterProgram, setFilterProgram] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editModule, setEditModule] = useState<ModuleRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ModuleRow | null>(null);
  const [deletePending, startDelete] = useTransition();

  const filtered = modules.filter((m) => {
    const matchProgram = filterProgram === "all" || m.programId === filterProgram;
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase());
    return matchProgram && matchSearch;
  });

  function handleEdit(row: ModuleRow) {
    setEditModule(row);
    setFormOpen(true);
  }

  function handleDelete(row: ModuleRow) {
    setDeleteTarget(row);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    startDelete(async () => {
      const result = await deleteModule(deleteTarget.id);
      if (result && "error" in result) {
        toast.error(result.error);
        setDeleteTarget(null);
        return;
      }
      try {
        setModules((prev) => prev.filter((m) => m.id !== deleteTarget.id));
        toast.success("Modul dihapus");
      } catch {
        toast.error("Gagal menghapus modul");
      } finally {
        setDeleteTarget(null);
      }
    });
  }

  function handleReorder(id: string, dir: "up" | "down") {
    startDelete(async () => {
      try {
        await reorderModule(id, dir);
        router.refresh();
      } catch {
        toast.error("Gagal mengubah urutan");
      }
    });
  }

  const columns: ColumnDef<ModuleRow>[] = [
    {
      accessorKey: "order",
      header: "#",
      cell: ({ row }) => <span className="tabular-nums font-medium">{row.original.order}</span>,
    },
    {
      accessorKey: "title",
      header: "Modul",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.title}</p>
          <p className="text-xs text-muted-foreground">{row.original.program.title}</p>
        </div>
      ),
    },
    {
      accessorKey: "_count.lessons",
      header: "Lesson",
      cell: ({ row }) => <span className="tabular-nums">{row.original._count.lessons}</span>,
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
      cell: () => null,
      enableSorting: false,
    },
  ];

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Input
          placeholder="Cari modul..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-[220px]"
        />
        <div className="flex items-center gap-2">
          <Label className="text-sm text-muted-foreground">Program:</Label>
          <Select value={filterProgram} onValueChange={setFilterProgram}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Semua program" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Program</SelectItem>
              {initialPrograms.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="ml-auto">
          <Button onClick={() => { setEditModule(null); setFormOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Tambah Modul
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
                  Tidak ada modul ditemukan.
                </td>
              </tr>
            ) : (
              filtered.map((row) => (
                <tr key={row.id} className="border-t hover:bg-muted/30">
                  <td className="px-3 py-2.5"><span className="tabular-nums font-medium">{row.order}</span></td>
                  <td className="px-3 py-2.5">
                    <div>
                      <p className="font-medium">{row.title}</p>
                      <p className="text-xs text-muted-foreground">{row.program.title}</p>
                    </div>
                  </td>
                  <td className="px-3 py-2.5"><span className="tabular-nums">{row._count.lessons}</span></td>
                  <td className="px-3 py-2.5">
                    <Badge variant={row.isPublished ? "default" : "secondary"}>
                      {row.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </td>
                  <td className="px-3 py-2.5">
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
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Modul?</AlertDialogTitle>
            <AlertDialogDescription>
              Modul "{deleteTarget?.title}" akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
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

      <ModuleForm
        module={editModule ?? undefined}
        programs={initialPrograms}
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditModule(null);
        }}
      />
    </>
  );
}
