'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Pencil, Check, X, Award } from 'lucide-react'
import { updateCertificateUrl } from '@/features/users/actions'

interface CertificateUrlFormProps {
  userId: string
  currentUrl: string | null
}

export function CertificateUrlForm({ userId, currentUrl }: CertificateUrlFormProps) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(currentUrl ?? '')
  const [loading, setLoading] = useState(false)

  async function handleSave() {
    setLoading(true)
    const result = await updateCertificateUrl(userId, value)
    setLoading(false)

    if (result?.error) {
      toast.error(result.error)
      return
    }

    toast.success('Link sertifikat disimpan')
    setEditing(false)
  }

  if (!editing) {
    return (
      <div className="flex items-center gap-2">
        <Award className="h-3 w-3 text-muted-foreground" />
        <span className="text-xs text-muted-foreground truncate max-w-[150px]">
          {currentUrl ? 'Sertifikat tersedia' : 'Belum ada sertifikat'}
        </span>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setEditing(true)}>
          <Pencil className="h-3 w-3" />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="https://drive.google.com/..."
        className="h-7 text-xs w-48"
        autoFocus
      />
      <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600" onClick={handleSave} disabled={loading}>
        <Check className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => setEditing(false)} disabled={loading}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}