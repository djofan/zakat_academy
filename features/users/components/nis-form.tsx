'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { updateUserNis } from '@/features/users/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Pencil, Check, X } from 'lucide-react'

interface NisFormProps {
  userId: string
  currentNis: string | null
}

export function NisForm({ userId, currentNis }: NisFormProps) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(currentNis ?? '')
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
  setLoading(true)

  const res = await updateUserNis({
    userId,
    nis: value,
  })

  if (res?.error) {
    alert(res.error)
  } else {
    setEditing(false)
  }

  setLoading(false)
}

  function handleCancel() {
    setValue(currentNis ?? '')
    setEditing(false)
  }

  if (!editing) {
    return (
      <div className="flex items-center gap-2">
        <span className="font-mono text-sm">
          {currentNis ?? (
            <span className="text-muted-foreground italic">Belum ada NIS</span>
          )}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => setEditing(true)}
        >
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
        placeholder="LA-26-00001"
        className="h-7 w-36 font-mono text-sm"
        autoFocus
      />
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-green-600"
        onClick={handleSave}
        disabled={loading}
      >
        <Check className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-red-500"
        onClick={handleCancel}
        disabled={loading}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}