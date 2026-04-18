import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminSettingsPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Pengaturan</h1>
      <p className="text-muted-foreground">Konfigurasi sistem.</p>
    </div>
  );
}