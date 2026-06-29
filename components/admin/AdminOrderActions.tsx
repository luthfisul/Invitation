// ============================================================
// components/admin/AdminOrderActions.tsx
// Aksi admin untuk satu order: update status, publish manual
// ============================================================

"use client";

import { useState, useTransition } from "next/dist/client/components/react-dev-overlay/app/hooks/use-transition";
import { useRouter }               from "next/navigation";
import { cn }                      from "@/lib/utils";
import type { OrderRow }           from "@/types/database";

interface AdminOrderActionsProps {
  orderId:       string;
  currentStatus: OrderRow["status"];
  isPublished:   boolean;
  invSlug:       string | null;
}

const STATUS_OPTIONS: Array<{ value: OrderRow["status"]; label: string }> = [
  { value: "pending",    label: "Menunggu Bayar" },
  { value: "paid",       label: "Dibayar" },
  { value: "processing", label: "Diproses" },
  { value: "published",  label: "Aktif" },
  { value: "cancelled",  label: "Dibatalkan" },
];

export default function AdminOrderActions({
  orderId,
  currentStatus,
  isPublished,
  invSlug,
}: AdminOrderActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [status,  setStatus]  = useState<OrderRow["status"]>(currentStatus);
  const [message, setMessage] = useState<string | null>(null);
  const [error,   setError]   = useState<string | null>(null);

  async function handleUpdateStatus() {
    setMessage(null); setError(null);
    startTransition(async () => {
      const res  = await fetch(`/api/orders/${orderId}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ updates: {} }), // hanya status
      });
      // Pakai API khusus admin untuk update status
      const res2 = await fetch(`/api/admin/orders/${orderId}/status`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ status }),
      });
      const json = await res2.json();
      if (!res2.ok) { setError(json.error); return; }
      setMessage("Status berhasil diperbarui.");
      router.refresh();
    });
  }

  async function handlePublish() {
    setMessage(null); setError(null);
    startTransition(async () => {
      const res  = await fetch("/api/invitations", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ orderId }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error); return; }
      setMessage(`Undangan berhasil dipublish: /invitation/${json.data.slug}`);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-3 items-end">

      {/* Update status */}
      <div className="flex items-center gap-2">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as OrderRow["status"])}
          className="text-xs border border-gray-300 rounded-xl px-3 py-2
                     focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]
                     bg-white"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <button
          onClick={handleUpdateStatus}
          disabled={isPending || status === currentStatus}
          className={cn(
            "text-xs px-4 py-2 rounded-xl font-medium transition-colors",
            "bg-gray-800 text-white hover:bg-gray-700",
            "disabled:opacity-40 disabled:cursor-not-allowed"
          )}
        >
          Update
        </button>
      </div>

      {/* Publish manual */}
      {!isPublished && (
        <button
          onClick={handlePublish}
          disabled={isPending}
          className="text-xs bg-emerald-500 text-white px-4 py-2 rounded-xl
                     hover:bg-emerald-600 transition-colors disabled:opacity-40"
        >
          🚀 Publish Manual
        </button>
      )}

      {/* Feedback */}
      {message && <p className="text-xs text-emerald-600">{message}</p>}
      {error   && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
