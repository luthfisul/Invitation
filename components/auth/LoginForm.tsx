// ============================================================
// components/auth/LoginForm.tsx
// Form login — email + password via Supabase Auth
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

export default function LoginForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email:    email.trim(),
        password,
      });

      if (authError) {
        setError("Email atau password salah. Silakan coba lagi.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
          autoComplete="email"
          className={inputClass}
        />
      </div>

      <div>
        <div className="flex justify-between mb-1.5">
          <label className="text-sm font-medium text-gray-700">Password</label>
          <Link
            href="/forgot-password"
            className="text-xs text-[var(--color-primary)] hover:underline"
          >
            Lupa password?
          </Link>
        </div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          autoComplete="current-password"
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
        {isPending ? "Memproses..." : "Masuk"}
      </button>

      <p className="text-center text-sm text-muted">
        Belum punya akun?{" "}
        <Link
          href="/register"
          className="text-[var(--color-primary)] hover:underline font-medium"
        >
          Daftar sekarang
        </Link>
      </p>
    </form>
  );
}
