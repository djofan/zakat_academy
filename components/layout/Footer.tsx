export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex flex-col items-center gap-4 text-center text-sm text-muted-foreground">
          <p>Zakat Academy — Platform pembelajaran zakat berbasis video</p>
          <p>&copy; {new Date().getFullYear()} Zakat Academy. Hak cipta dilindungi.</p>
        </div>
      </div>
    </footer>
  );
}