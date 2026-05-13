'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { createStudent, getLastStudentNis } from '@/features/users/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Loader2 } from 'lucide-react'

function generateNextNis(lastNis: string | null, gender: 'IKHWAN' | 'AKHWAT'): string {
  const prefix = gender === 'IKHWAN' ? 'LAN-' : 'LAT-'
  if (!lastNis) return `${prefix}26001`
  const num = parseInt(lastNis.replace(prefix, '')) + 1
  return `${prefix}26${String(num % 1000).padStart(3, '0')}`
}

interface CreateStudentFormProps {
  lastNisIkhwan: string | null
  lastNisAkhwat: string | null
}

export function CreateStudentForm({ lastNisIkhwan, lastNisAkhwat }: CreateStudentFormProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<{ password: string; nis: string } | null>(null)

  const [form, setForm] = useState({
    name: '',
    email: '',
    no_hp: '',
    gender: '' as 'IKHWAN' | 'AKHWAT' | '',
    nis: '',
  })

  const passwordPreview = form.no_hp.length >= 4
    ? form.no_hp.slice(-4)
    : '----'

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleGenderChange(value: 'IKHWAN' | 'AKHWAT') {
    const lastNis = value === 'IKHWAN' ? lastNisIkhwan : lastNisAkhwat
    const suggestedNis = generateNextNis(lastNis, value)
    setForm((prev) => ({ ...prev, gender: value, nis: suggestedNis }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!form.gender) {
      toast.error('Pilih gender terlebih dahulu')
      return
    }

    setLoading(true)
    const result = await createStudent({
      name: form.name,
      email: form.email || undefined,
      no_hp: form.no_hp,
      nis: form.nis,
      gender: form.gender,
    })
    setLoading(false)

    if (result?.error) {
      toast.error(result.error)
      return
    }

    if (result?.success) {
      setSuccess({ password: result.password!, nis: form.nis })
    }
  }

  function handleClose() {
    setOpen(false)
    setSuccess(null)
    setForm({ name: '', email: '', no_hp: '', gender: '', nis: '' })
  }

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) handleClose(); else setOpen(true) }}>
      <SheetTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Tambah Peserta
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Tambah Peserta Baru</SheetTitle>
        </SheetHeader>

        {success ? (
          <div className="mt-6 space-y-4">
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm">
              <p className="font-medium text-green-800 mb-3">Akun berhasil dibuat!</p>
              <div className="space-y-2 text-green-700">
                <div className="flex justify-between">
                  <span>NIS</span>
                  <span className="font-mono font-bold">{success.nis}</span>
                </div>
                <div className="flex justify-between">
                  <span>Password</span>
                  <span className="font-mono font-bold">{success.password}</span>
                </div>
              </div>
              <p className="mt-3 text-xs text-green-600">
                Kirimkan NIS dan password ini ke peserta via WA.
              </p>
            </div>
            <Button className="w-full" onClick={handleClose}>Selesai</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4 pl-2">
            <div className="space-y-1.5">
              <Label>Gender *</Label>
              <Select onValueChange={handleGenderChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IKHWAN">Ikhwan</SelectItem>
                  <SelectItem value="AKHWAT">Akhwat</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="name">Nama Lengkap *</Label>
              <Input
                id="name"
                name="name"
                placeholder="Ahmad Fauzi"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="no_hp">No HP *</Label>
              <Input
                id="no_hp"
                name="no_hp"
                placeholder="08123456789"
                value={form.no_hp}
                onChange={handleChange}
                required
              />
              <p className="text-xs text-muted-foreground">
                Password otomatis: <span className="font-mono font-medium">{passwordPreview}</span>
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="nis">NIS *</Label>
              <Input
                id="nis"
                name="nis"
                placeholder="LA-26-I-00001"
                value={form.nis}
                onChange={handleChange}
                required
              />
              <p className="text-xs text-muted-foreground">
                Ikhwan terakhir: <span className="font-mono">{lastNisIkhwan ?? 'belum ada'}</span>
                {' · '}
                Akhwat terakhir: <span className="font-mono">{lastNisAkhwat ?? 'belum ada'}</span>
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">
                Email <span className="text-muted-foreground">(opsional)</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="ahmad@email.com"
                value={form.email}
                onChange={handleChange}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Menyimpan...' : 'Buat Akun'}
            </Button>
          </form>
        )}
      </SheetContent>
    </Sheet>
  )
}