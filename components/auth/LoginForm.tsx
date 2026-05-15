"use client";

import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { PasswordInput } from "@/components/shared/password-input";
import { loginSchema, type LoginInput } from "@/lib/validators/auth";

export function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { nis: "", password: "" },
  });

  async function onSubmit(values: LoginInput) {
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        nis: values.nis,
        password: values.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("NIS atau password salah");
      } else {
        toast.success("Login berhasil");
        const res = await fetch("/api/auth/session")
        const sessionData = await res.json() as { user?: { role?: string } | null }
        const role = sessionData?.user?.role
        if (role === "ADMIN") {
          router.push("/admin")
        } else {
          router.push("/dashboard")
        }
        router.refresh()
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      {/* Logo & judul */}
      <div className="mb-8 text-center">
        <img src="/logo-lazsip.webp" alt="LAZSIP" className="mx-auto mb-4 h-14 w-14 object-contain" />
        <h1 className="text-2xl font-bold text-gray-900">Zakat Academy</h1>
        <p className="mt-1 text-sm text-gray-500">Masuk untuk melanjutkan belajar</p>
      </div>

      {/* Form */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="nis" className="text-sm font-medium text-gray-700">NIS</label>
            <input
              id="nis"
              type="text"
              placeholder="LAN-26001"
              autoComplete="off"
              className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-green-400 focus:ring-2 focus:ring-green-100"
              {...form.register("nis")}
            />
            {form.formState.errors.nis && (
              <p className="text-xs text-red-500">{form.formState.errors.nis.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
            <PasswordInput
              id="password"
              placeholder="••••••••"
              autoComplete="current-password"
              className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-green-400 focus:ring-2 focus:ring-green-100"
              {...form.register("password")}
            />
            {form.formState.errors.password && (
              <p className="text-xs text-red-500">{form.formState.errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-2.5 text-sm font-semibold text-white shadow-sm shadow-green-200 transition-all hover:bg-green-700 disabled:opacity-70"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>
      </div>

      {/* Footer */}
      <p className="mt-6 text-center text-xs text-gray-400">
        Belum punya akun?{" "}
        <a href="https://wa.me/628111186626" target="_blank" rel="noopener noreferrer" className="font-medium text-green-600 hover:text-green-700">
          Hubungi Admin
        </a>
      </p>
    </div>
  );
}