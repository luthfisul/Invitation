// ============================================================
// app/(auth)/register/page.tsx
// Halaman registrasi customer baru
// ============================================================

import RegisterForm from "@/components/auth/RegisterForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Daftar Akun" };

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-[var(--color-light)]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold mb-1">Buat Akun</h1>
          <p className="text-sm text-muted">Daftar untuk mulai memesan undangan</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}
