// ============================================================
// components/dashboard/ProfileForm.tsx
// Form edit profil customer
// ============================================================

"use client";

import { useState, useTransition } from "react";
import { createClient }            from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ProfileFormProps {
  userId:      string;
  initialData: { fullName: string; phone: string; email: string };
}

const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm " +
  "focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] " +
  "focus:border-transparent transition bg-white";

export default function ProfileForm({ userId, initialData }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition();
  const [fullName,  setFullName]  = useState(initialData.fullName);
  const [phone,     setPhone]     = useState(initialData.phone);
  const [saved,     setSaved]     = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);

    startTransition(async () => {
      const { error: dbError } = await supabase
        .from("users")
        .update({ full_name: fullName.trim(), phone: phone.trim() })
        .eq("id", userId);

      if (dbError) { setError(dbError.message); return; }
      setSaved(true);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1.5">Email</label>
        <input
          type="email"
          value={initialData.email}
          disabled
          className={`${inputClass} opacity-60 cursor-not-allowed`}
        />
        <p className="text-xs text-muted mt-1">Email tidak bisa diubah.</p>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1.5">Nama Lengkap</label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => { setFullName(e.target.value); setSaved(false); }}
          placeholder="Nama lengkap kamu"
          className={inputClass}
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1.5">
          Nomor WhatsApp
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => { setPhone(e.target.value); setSaved(false); }}
          placeholder="contoh: 08123456789"
          className={inputClass}
        />
      </div>

      {error && (
        <p className="text-xs text-red-500 bg-red-50 px-4 py-3 rounded-xl">{error}</p>
      )}
      {saved && (
        <p className="text-xs text-emerald-600 bg-emerald-50 px-4 py-3 rounded-xl">
          ✓ Profil berhasil diperbarui!
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-3 rounded-full bg-[var(--color-primary)] text-white
                   text-sm font-medium hover:bg-[var(--color-primary-dark)]
                   transition-colors disabled:opacity-50"
      >
        {isPending ? "Menyimpan..." : "Simpan Perubahan"}
      </button>
    </form>
  );
}
