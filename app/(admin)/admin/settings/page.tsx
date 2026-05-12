import { getMaintenanceMode, toggleMaintenanceMode } from "@/features/settings/actions";
import { MaintenanceToggle } from "@/features/settings/components/maintenance-toggle";

export const dynamic = 'force-dynamic'

export default async function AdminSettingsPage() {
  const isMaintenance = await getMaintenanceMode()

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Pengaturan</h1>
        <p className="text-muted-foreground">Konfigurasi sistem.</p>
      </div>

      <MaintenanceToggle isMaintenance={isMaintenance} />
    </div>
  )
}