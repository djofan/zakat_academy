"use client";

import { useState } from "react";
import { useTransition } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2, Plus, Power, Calendar, Clock, RotateCcw, PowerOff, PowerIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-table";
import { deleteQuiz, toggleQuizActive } from "../actions";
import { toast } from "sonner";
import { QuizForm } from "./quiz-form";
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
import { Badge } from "@/components/ui/badge";

export type QuizRow = {
  id: string;
  title: string;
  moduleId: string;
  isActive: boolean;
  quizDate: string | null;
  timeLimitMinutes: number;
  allowRetake: boolean;
  module: { id: string; title: string; program: { id: string; title: string } };
  questions: { id: string; text: string; order: number; options: { id: string; label: string; isCorrect: boolean }[] }[];
};

export type QuizModuleOption = {
  id: string;
  title: string;
  program: { id: string; title: string };
};

export function QuizTable({
  initialQuizzes,
  initialModules,
}: {
  initialQuizzes: QuizRow[];
  initialModules: QuizModuleOption[];
}) {
  const [quizzes, setQuizzes] = useState(initialQuizzes);
  const [formOpen, setFormOpen] = useState(false);
  const [editQuiz, setEditQuiz] = useState<QuizRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<QuizRow | null>(null);
  const [deletePending, startDelete] = useTransition();
  const [toggling, startToggle] = useTransition();

  function handleEdit(row: QuizRow) {
    setEditQuiz(row);
    setFormOpen(true);
  }

  function handleDelete(row: QuizRow) {
    setDeleteTarget(row);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    startDelete(async () => {
      try {
        await deleteQuiz(deleteTarget.id);
        setQuizzes((prev) => prev.filter((q) => q.id !== deleteTarget.id));
        toast.success("Kuis dihapus");
      } catch {
        toast.error("Gagal menghapus kuis");
      } finally {
        setDeleteTarget(null);
      }
    });
  }

  function handleToggle(row: QuizRow) {
    startToggle(async () => {
      try {
        await toggleQuizActive(row.id, !row.isActive);
        setQuizzes((prev) =>
          prev.map((q) =>
            q.id === row.id ? { ...q, isActive: !q.isActive } : q
          )
        );
        toast.success(row.isActive ? "Kuis dinonaktifkan" : "Kuis diaktifkan");
      } catch {
        toast.error("Gagal mengubah status kuis");
      }
    });
  }

  const columns: ColumnDef<QuizRow>[] = [
  {
    accessorKey: "title",
    header: "Judul Kuis",
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{row.original.title}</p>
        <p className="text-xs text-muted-foreground">
          {row.original.module.program.title} &rsaquo; {row.original.module.title}
        </p>
        {/* Info tambahan di mobile */}
        <div className="mt-1 flex flex-wrap gap-1 md:hidden">
          {row.original.isActive ? (
            <Badge className="bg-green-100 text-green-800 text-xs hover:bg-green-100">Aktif</Badge>
          ) : (
            <Badge variant="secondary" className="text-xs">Nonaktif</Badge>
          )}
          <span className="text-xs text-muted-foreground">{row.original.timeLimitMinutes} menit</span>
          <span className="text-xs text-muted-foreground">{row.original.questions.length} soal</span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => (
      row.original.isActive ? (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Aktif</Badge>
      ) : (
        <Badge variant="secondary">Nonaktif</Badge>
      )
    ),
    enableSorting: false,
    meta: { className: "hidden md:table-cell" },
  },
  {
    accessorKey: "quizDate",
    header: "Jadwal",
    cell: ({ row }) => {
      const d = row.original.quizDate;
      return d ? (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          {new Date(d).toLocaleString("id-ID", {
            day: "2-digit", month: "short", year: "numeric",
            hour: "2-digit", minute: "2-digit",
            timeZone: "Asia/Jakarta",
          })}
        </div>
      ) : (
        <span className="text-xs text-muted-foreground">Tanpa jadwal</span>
      );
    },
    enableSorting: false,
    meta: { className: "hidden md:table-cell" },
  },
  {
    accessorKey: "timeLimitMinutes",
    header: "Waktu",
    cell: ({ row }) => (
      <div className="flex items-center gap-1 text-sm">
        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
        {row.original.timeLimitMinutes} menit
      </div>
    ),
    enableSorting: false,
    meta: { className: "hidden md:table-cell" },
  },
  {
    accessorKey: "allowRetake",
    header: "Retake",
    cell: ({ row }) => (
      row.original.allowRetake ? (
        <Badge variant="outline" className="text-xs">
          <RotateCcw className="mr-1 h-3 w-3" />Izin
        </Badge>
      ) : (
        <span className="text-xs text-muted-foreground">1x saja</span>
      )
    ),
    enableSorting: false,
    meta: { className: "hidden md:table-cell" },
  },
  {
    accessorKey: "questions",
    header: "Soal",
    cell: ({ row }) => (
      <span className="tabular-nums">{row.original.questions.length}</span>
    ),
    enableSorting: false,
    meta: { className: "hidden md:table-cell" },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <Button
          variant={row.original.isActive ? "ghost" : "outline"}
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => handleToggle(row.original)}
          disabled={toggling}
          title={row.original.isActive ? "Nonaktifkan" : "Aktifkan"}
        >
          {row.original.isActive ? (
            <PowerOff className="h-4 w-4 text-green-600" />
          ) : (
            <PowerIcon className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => handleEdit(row.original)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
          onClick={() => handleDelete(row.original)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    ),
    enableSorting: false,
  },
];

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => { setEditQuiz(null); setFormOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Kuis
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={quizzes}
        searchKey="title"
        searchPlaceholder="Cari kuis..."
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Kuis?</AlertDialogTitle>
            <AlertDialogDescription>
              Kuis "{deleteTarget?.title}" akan dihapus permanen beserta semua soalnya.
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

      <QuizForm
        quiz={editQuiz ?? undefined}
        modules={initialModules}
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditQuiz(null);
        }}
      />
    </>
  );
}
