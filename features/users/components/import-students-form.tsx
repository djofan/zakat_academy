'use client'

import { useState } from 'react'
import * as XLSX from 'xlsx'
import { toast } from 'sonner'
import { importStudentsFromExcel } from '@/features/users/actions'
import { Button } from '@/components/ui/button'
import { Upload, Loader2, CheckCircle, XCircle, Download } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

type ImportResult = {
  name: string
  nis: string
  password: string
  status: 'success' | 'error'
  message?: string
}

export function ImportStudentsForm() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<ImportResult[]>([])
  const [fileName, setFileName] = useState('')

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setLoading(true)
    setResults([])

    try {
      const buffer = await file.arrayBuffer()
      const wb = XLSX.read(buffer, { type: 'array' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws)

      // Map kolom Excel ke data yang dibutuhkan
      const data = rows.map((row: Record<string, string>) => ({
  name: row['Nama'] ?? row['nama'] ?? row['Nama Lengkap'] ?? '',
  no_hp: String(row['No HP'] ?? row['no_hp'] ?? row['No. HP'] ?? row['Nomor HP'] ?? ''),
  gender: (row['Gender'] ?? row['gender'] ?? '').toUpperCase() as 'IKHWAN' | 'AKHWAT',
  email: row['Email'] ?? row['email'] ?? undefined,
}))

      if (data.length === 0) {
        toast.error('File Excel kosong atau format tidak sesuai')
        setLoading(false)
        return
      }

      const result = await importStudentsFromExcel(data)

      if ('error' in result) {
        toast.error(result.error)
      } else {
        setResults(result.results)
        const success = result.results.filter((r) => r.status === 'success').length
        const failed = result.results.filter((r) => r.status === 'error').length
        toast.success(`${success} akun berhasil dibuat, ${failed} gagal`)
      }
    } catch {
      toast.error('Gagal membaca file Excel')
    } finally {
      setLoading(false)
    }
  }

  function downloadTemplate() {
    const ws = XLSX.utils.aoa_to_sheet([
      ['Nama', 'No HP', 'Gender', 'Email'],
      ['Ahmad Fauzi', '08123456789', 'IKHWAN', 'ahmad@email.com'],
      ['Fatimah Azzahra', '08129876543', 'AKHWAT', ''],
    ])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Peserta')
    XLSX.writeFile(wb, 'template_import_peserta.xlsx')
  }

  function handleClose() {
    setOpen(false)
    setResults([])
    setFileName('')
  }

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) handleClose(); else setOpen(true) }}>
      <SheetTrigger asChild>
        <Button size="sm" variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          Import Excel
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Import Peserta dari Excel</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4 px-2">
          {/* Download template */}
          <div className="rounded-lg border border-dashed p-4 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Gunakan template Excel berikut untuk memastikan format sesuai.
            </p>
            <Button size="sm" variant="outline" onClick={downloadTemplate}>
              <Download className="mr-2 h-4 w-4" />
              Download Template
            </Button>
          </div>

          {/* Upload file */}
          <div>
            <label
              htmlFor="excel-upload"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
            >
              {loading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Memproses...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {fileName || 'Klik untuk upload file Excel'}
                  </p>
                  <p className="text-xs text-muted-foreground">.xlsx atau .xls</p>
                </div>
              )}
            </label>
            <input
              id="excel-upload"
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleFile}
              disabled={loading}
            />
          </div>

          {/* Hasil import */}
          {results.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">
                Hasil Import ({results.filter((r) => r.status === 'success').length} berhasil, {results.filter((r) => r.status === 'error').length} gagal)
              </p>
              <div className="max-h-64 overflow-y-auto space-y-1">
                {results.map((result, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${
                      result.status === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                    }`}
                  >
                    {result.status === 'success' ? (
                      <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{result.name}</p>
                      {result.status === 'success' ? (
                        <p className="text-xs text-green-700">
                          NIS: {result.nis} · Password: {result.password}
                        </p>
                      ) : (
                        <p className="text-xs text-red-700">{result.message}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <Button className="w-full" onClick={handleClose}>
                Selesai
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}