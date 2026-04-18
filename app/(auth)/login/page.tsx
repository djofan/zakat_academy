import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Zakat Academy</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Platform belajar zakat berbasis video
        </p>
      </div>
      <LoginForm />
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Belum punya akun?{" "}
        <a href="/register" className="font-medium text-foreground underline-offset-4 hover:underline">
          Daftar di sini
        </a>
      </p>
    </div>
  );
}