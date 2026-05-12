'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { toggleMaintenanceMode } from '@/features/settings/actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { AlertTriangle } from 'lucide-react'

export function MaintenanceToggle({ isMaintenance }: { isMaintenance: boolean }) {
  const [enabled, setEnabled] = useState(isMaintenance)
  const [loading, setLoading] = useState(false)

  async function handleToggle(checked: boolean) {
    setLoading(true)
    const result = await toggleMaintenanceMode(checked)
    setLoading(false)

    if (result?.error) {
      toast.error(result.error)
      return
    }

    setEnabled(checked)
    toast.success(checked ? 'Mode maintenance diaktifkan' : 'Mode maintenance dinonaktifkan')
  }

  return (
    <Card className={enabled ? 'border-amber-300 bg-amber-50/30' : ''}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangle className={`h-4 w-4 ${enabled ? 'text-amber-500' : 'text-muted-foreground'}`} />
          Mode Maintenance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Ketika diaktifkan, peserta tidak dapat mengakses platform dan akan diarahkan ke halaman maintenance. Admin tetap bisa login dan mengakses panel admin.
        </p>
        <div className="flex items-center gap-3">
          <Switch
            checked={enabled}
            onCheckedChange={handleToggle}
            disabled={loading}
          />
          <Label>
            {enabled ? (
              <span className="text-amber-600 font-medium">Maintenance aktif</span>
            ) : (
              <span>Maintenance nonaktif</span>
            )}
          </Label>
        </div>
      </CardContent>
    </Card>
  )
}