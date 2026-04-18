"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgramForm } from "@/features/programs/components/program-form";
import { useProgramColumns, type ProgramRow } from "@/features/programs/components/program-columns";
import { DataTable } from "@/components/shared/data-table";

interface AdminProgramsClientProps {
  initialPrograms: ProgramRow[];
}

export function AdminProgramsClient({ initialPrograms }: AdminProgramsClientProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editData, setEditData] = useState<ProgramRow | null>(null);

  const columns = useProgramColumns((program) => {
    setEditData(program);
    setFormOpen(true);
  });

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Program</h1>
          <p className="text-muted-foreground">Kelola program pembelajaran.</p>
        </div>
        <Button
          onClick={() => {
            setEditData(null);
            setFormOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Tambah Program
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={initialPrograms}
        searchPlaceholder="Cari program..."
      />

      <ProgramForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditData(null);
        }}
        editData={editData}
      />
    </>
  );
}
