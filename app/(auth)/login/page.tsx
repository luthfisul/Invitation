// ============================================================
// app/(auth)/login/page.tsx
// Halaman login customer menggunakan Supabase Auth
// ============================================================

import LoginForm from "@/components/auth/LoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Masuk" };

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-[var(--color-light)]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold mb-1">Selamat Datang</h1>
          <p className="text-sm text-muted">Masuk untuk melihat pesanan kamu</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
