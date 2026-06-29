// ============================================================
// components/auth/RegisterForm.tsx
// Form registrasi customer baru
// ============================================================

"use client";

import { useState, useTransition } from "react";
import { useRouter }               from "next/navigation";
import Link                        from "next/link";
import { createClient }            from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm " +
  "focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] " +
  "focus:border-transparent transition bg-white";

export default function RegisterForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [fullName,  setFullName]  = useState("");
  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [error,     setError]     = useState<string | null>(null);
  const [success,   setSuccess]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }

    startTransition(async () => {
      // 1. Daftar via Supabase Auth
      const { data, error: authError } = await supabase.auth.signUp({
        email:    email.trim(),
        password,
        options: {
          data: { full_name: fullName.trim() },
        },
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      // 2. Insert ke tabel users kita
      if (data.user) {
        await supabase.from("users").upsert({
          id:        data.user.id,
          email:     email.trim(),
          full_name: fullName.trim(),
        });
      }

      setSuccess(true);
    });
  }

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="text-5xl">📧</div>
        <h2 className="text-lg font-semibold">Cek Email Kamu!</h2>
        <p className="text-sm text-muted">
          Kami telah mengirim link verifikasi ke{" "}
          <span className="font-medium text-gray-700">{email}</span>.
          Klik link tersebut untuk mengaktifkan akun.
        </p>
        <Link
          href="/login"
          className="inline-block mt-2 text-sm text-[var(--color-primary)] hover:underline"
        >
          Kembali ke halaman masuk
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1.5">
          Nama Lengkap
        </label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="contoh: Raka Pratama"
          required
          className={inputClass}
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1.5">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="kamu@email.com"
          required
          className={inputClass}
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1.5">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Minimal 8 karakter"
          required
          minLength={8}
          className={inputClass}
        />
      </div>

      {error && (
        <p className="text-xs text-red-500 bg-red-50 px-4 py-3 rounded-xl">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-3 rounded-full bg-[var(--color-primary)] text-white
                   text-sm font-medium hover:bg-[var(--color-primary-dark)]
                   transition-colors disabled:opacity-50"
      >
        {isPending ? "Memproses..." : "Buat Akun"}
      </button>

      <p className="text-center text-sm text-muted">
        Sudah punya akun?{" "}
        <Link
          href="/login"
          className="text-[var(--color-primary)] hover:underline font-medium"
        >
          Masuk
        </Link>
      </p>
    </form>
  );
}
