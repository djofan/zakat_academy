"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { BookOpen, Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
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
import { deleteProgram, togglePublished } from "@/features/programs/actions";

export type ProgramRow = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  thumbnailUrl: string | null;
  isPublished: boolean;
  order: number;
  createdAt: Date;
  _count: {
    modules: number;
    enrollments: number;
    lessons: number;
  };
};

export function useProgramColumns(onEdit: (program: ProgramRow) => void) {
  function DeleteDialog({
    open,
    onOpenChange,
    programId,
    programTitle,
  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    programId: string;
    programTitle: string;
  }) {
    const [pending, startTransition] = useTransition();

    return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Program?</AlertDialogTitle>
            <AlertDialogDescription>
              Program "{programTitle}" akan dihapus permanen. Tindakan ini tidak
              dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                startTransition(async () => {
                  await deleteProgram(programId);
                  onOpenChange(false);
                });
              }}
            >
              {pending ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  function ActionCell({ row }: { row: ProgramRow }) {
    const [delOpen, setDelOpen] = useState(false);

    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <a
                href={`/programs/${row.slug}`}
                target="_blank"
                rel="noreferrer"
              >
                <Eye className="mr-2 h-4 w-4" />
                Lihat
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onEdit(row)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onSelect={() => setDelOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DeleteDialog
          open={delOpen}
          onOpenChange={setDelOpen}
          programId={row.id}
          programTitle={row.title}
        />
      </>
    );
  }

  function PublishSwitch({ row }: { row: ProgramRow }) {
    const [pending, startTransition] = useTransition();

    return (
      <Switch
        checked={row.isPublished}
        disabled={pending}
        onCheckedChange={(checked) => {
          startTransition(async () => {
            await togglePublished(row.id, checked);
          });
        }}
      />
    );
  }

  const columns: ColumnDef<ProgramRow>[] = [
    {
      accessorKey: "title",
      header: "Judul",
      cell: ({ row }) => (
        <div className="max-w-[240px]">
          <p className="font-medium truncate">{row.original.title}</p>
          <p className="text-xs text-muted-foreground truncate">
            {row.original.shortDescription}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "isPublished",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.isPublished ? "default" : "secondary"}>
          {row.original.isPublished ? "Dipublikasi" : "Draft"}
        </Badge>
      ),
    },
    {
      accessorKey: "_count.modules",
      header: "Modul",
      cell: ({ row }) => (
        <span className="text-sm">{row.original._count.modules}</span>
      ),
    },
    {
      accessorKey: "_count.lessons",
      header: "Lesson",
      cell: ({ row }) => (
        <span className="text-sm tabular-nums">{row.original._count.lessons}</span>
      ),
    },
    {
      accessorKey: "_count.enrollments",
      header: "Pendaftaran",
      cell: ({ row }) => (
        <span className="text-sm tabular-nums">{row.original._count.enrollments}</span>
      ),
    },
    {
      accessorKey: "order",
      header: "Urutan",
      cell: ({ row }) => (
        <span className="tabular-nums">{row.original.order}</span>
      ),
    },
    {
      accessorKey: "isPublished.toggle",
      header: "Publikasi",
      cell: ({ row }) => <PublishSwitch row={row.original} />,
    },
    {
      id: "actions",
      cell: ({ row }) => <ActionCell row={row.original} />,
      enableSorting: false,
    },
  ];

  return columns;
}