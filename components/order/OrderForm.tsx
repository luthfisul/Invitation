// ============================================================
// components/order/OrderForm.tsx
// Form isi data undangan — Phase 3
// Akan dikembangkan jadi AI Chat Interface di Phase 10
// ============================================================

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { InvitationDataRow } from "@/types/database";
import { cn } from "@/lib/utils";

interface OrderFormProps {
  orderId:     string;
  initialData: InvitationDataRow | null;
}

interface FormState {
  bride_full_name:  string;
  groom_full_name:  string;
  bride_nick_name:  string;
  groom_nick_name:  string;
  event_date:       string;
  event_time:       string;
  venue_name:       string;
  venue_address:    string;
  venue_maps_url:   string;
  story:            string;
  music_url:        string;
  rsvp_enabled:     boolean;
}

function toFormState(data: InvitationDataRow | null): FormState {
  return {
    bride_full_name:  data?.bride_full_name  ?? "",
    groom_full_name:  data?.groom_full_name  ?? "",
    bride_nick_name:  data?.bride_nick_name  ?? "",
    groom_nick_name:  data?.groom_nick_name  ?? "",
    event_date:       data?.event_date        ?? "",
    event_time:       data?.event_time        ?? "",
    venue_name:       data?.venue_name        ?? "",
    venue_address:    data?.venue_address     ?? "",
    venue_maps_url:   data?.venue_maps_url    ?? "",
    story:            data?.story             ?? "",
    music_url:        data?.music_url         ?? "",
    rsvp_enabled:     data?.rsvp_enabled      ?? true,
  };
}

export default function OrderForm({ orderId, initialData }: OrderFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<FormState>(toFormState(initialData));
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : value,
    }));
    setSaved(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ updates: form }),
        });

        const json = await res.json();
        if (!res.ok) throw new Error(json.error);

        setSaved(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal menyimpan");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {/* ── Section: Mempelai ─────────────────────────── */}
      <section>
        <h2 className="text-sm font-semibold text-muted uppercase tracking-widest mb-4">
          Data Mempelai
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Nama Lengkap Mempelai Wanita *">
            <input
              name="bride_full_name"
              value={form.bride_full_name}
              onChange={handleChange}
              required
              placeholder="contoh: Siti Rahmawati"
              className={inputClass}
            />
          </Field>
          <Field label="Nama Lengkap Mempelai Pria *">
            <input
              name="groom_full_name"
              value={form.groom_full_name}
              onChange={handleChange}
              required
              placeholder="contoh: Raka Pratama"
              className={inputClass}
            />
          </Field>
          <Field label="Nama Panggilan Wanita">
            <input
              name="bride_nick_name"
              value={form.bride_nick_name}
              onChange={handleChange}
              placeholder="contoh: Siti"
              className={inputClass}
            />
          </Field>
          <Field label="Nama Panggilan Pria">
            <input
              name="groom_nick_name"
              value={form.groom_nick_name}
              onChange={handleChange}
              placeholder="contoh: Raka"
              className={inputClass}
            />
          </Field>
        </div>
      </section>

      {/* ── Section: Acara ────────────────────────────── */}
      <section>
        <h2 className="text-sm font-semibold text-muted uppercase tracking-widest mb-4">
          Detail Acara
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Tanggal Pernikahan *">
            <input
              type="date"
              name="event_date"
              value={form.event_date}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </Field>
          <Field label="Waktu Acara *">
            <input
              type="time"
              name="event_time"
              value={form.event_time}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </Field>
          <Field label="Nama Gedung / Venue *" className="sm:col-span-2">
            <input
              name="venue_name"
              value={form.venue_name}
              onChange={handleChange}
              required
              placeholder="contoh: Ballroom Grand Hyatt Jakarta"
              className={inputClass}
            />
          </Field>
          <Field label="Alamat Lengkap *" className="sm:col-span-2">
            <textarea
              name="venue_address"
              value={form.venue_address}
              onChange={handleChange}
              required
              rows={2}
              placeholder="Jl. MH Thamrin Kav. 28-30, Jakarta Pusat 10350"
              className={inputClass}
            />
          </Field>
          <Field label="Link Google Maps" className="sm:col-span-2">
            <input
              name="venue_maps_url"
              value={form.venue_maps_url}
              onChange={handleChange}
              placeholder="https://maps.google.com/..."
              className={inputClass}
            />
          </Field>
        </div>
      </section>

      {/* ── Section: Konten Tambahan ──────────────────── */}
      <section>
        <h2 className="text-sm font-semibold text-muted uppercase tracking-widest mb-4">
          Konten Tambahan
        </h2>
        <div className="space-y-4">
          <Field label="Cerita Singkat Mempelai">
            <textarea
              name="story"
              value={form.story}
              onChange={handleChange}
              rows={4}
              placeholder="Ceritakan bagaimana kalian bertemu dan perjalanan cinta kalian..."
              className={inputClass}
            />
          </Field>
          <Field label="Link Musik Background (Spotify / YouTube)">
            <input
              name="music_url"
              value={form.music_url}
              onChange={handleChange}
              placeholder="https://open.spotify.com/track/..."
              className={inputClass}
            />
          </Field>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="rsvp_enabled"
              name="rsvp_enabled"
              checked={form.rsvp_enabled}
              onChange={handleChange}
              className="w-4 h-4 accent-[var(--color-primary)]"
            />
            <label htmlFor="rsvp_enabled" className="text-sm text-gray-700">
              Aktifkan fitur RSVP (konfirmasi kehadiran tamu)
            </label>
          </div>
        </div>
      </section>

      {/* ── Error & Status ────────────────────────────── */}
      {error && (
        <p className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-xl">
          {error}
        </p>
      )}
      {saved && (
        <p className="text-sm text-emerald-600 bg-emerald-50 px-4 py-3 rounded-xl">
          ✓ Data berhasil disimpan!
        </p>
      )}

      {/* ── Actions ───────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className={cn(
            "flex-1 bg-primary text-white py-3 rounded-full text-sm font-medium",
            "hover:bg-[var(--color-primary-dark)] transition-colors",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {isPending ? "Menyimpan..." : "Simpan Data"}
        </button>
        <button
          type="button"
          onClick={() => router.push(`/order/${orderId}/preview`)}
          className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-full
                     text-sm hover:border-primary hover:text-primary transition-colors"
        >
          Lihat Preview →
        </button>
      </div>

    </form>
  );
}

// ── Sub-components ────────────────────────────────────────────

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm " +
  "focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] " +
  "focus:border-transparent transition resize-none bg-white";
