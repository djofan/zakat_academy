"use client";

import { useState } from "react";
import { useTransition } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-table";
import { deleteQuiz } from "../actions";
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

export type QuizRow = {
  id: string;
  title: string;
  moduleId: string;
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
        </div>
      ),
    },
    {
      accessorKey: "questions",
      header: "Soal",
      cell: ({ row }) => (
        <span className="tabular-nums">{row.original.questions.length}</span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
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
