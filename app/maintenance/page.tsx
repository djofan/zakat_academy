export default function MaintenancePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4 text-center">
      <div className="max-w-md space-y-4">
        <div className="flex justify-center">
          <div className="rounded-full bg-amber-100 p-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>
        <h1 className="text-2xl font-bold">Sedang dalam Pemeliharaan</h1>
        <p className="text-muted-foreground">
          Zakat Academy sedang dalam pemeliharaan sementara. Kami akan segera kembali. Mohon maaf atas ketidaknyamanannya.
        </p>
        <p className="text-sm text-muted-foreground">
          Hubungi admin untuk informasi lebih lanjut.
        </p>
      </div>
    </div>
  )
}