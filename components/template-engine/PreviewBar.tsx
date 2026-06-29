// ============================================================
// components/template-engine/PreviewBar.tsx
// Bar sticky di atas halaman preview — info order + aksi
// ============================================================

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { OrderRow } from "@/types/database";

interface PreviewBarProps {
  orderId:      string;
  orderNumber:  string;
  templateName: string;
  status:       OrderRow["status"];
}

const statusLabel: Record<OrderRow["status"], string> = {
  pending:    "Menunggu Pembayaran",
  paid:       "Dibayar",
  processing: "Diproses",
  published:  "Aktif",
  cancelled:  "Dibatalkan",
};

const statusColor: Record<OrderRow["status"], string> = {
  pending:    "bg-yellow-100 text-yellow-700",
  paid:       "bg-blue-100 text-blue-700",
  processing: "bg-purple-100 text-purple-700",
  published:  "bg-emerald-100 text-emerald-700",
  cancelled:  "bg-red-100 text-red-700",
};

export default function PreviewBar({
  orderId,
  orderNumber,
  templateName,
  status,
}: PreviewBarProps) {
  const router  = useRouter();
  const [copying, setCopying] = useState(false);

  async function handleCopyLink() {
    setCopying(true);
    await navigator.clipboard.writeText(window.location.href);
    setTimeout(() => setCopying(false), 2000);
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b
                    border-gray-200 h-14 flex items-center px-4 gap-3 shadow-sm">

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 truncate">
          {orderNumber} · {templateName}
        </p>
      </div>

      {/* Status badge */}
      <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${statusColor[status]}`}>
        {statusLabel[status]}
      </span>

      {/* Actions */}
      <div className="flex gap-2 shrink-0">
        {/* Edit data */}
        <Link
          href={`/order/${orderId}`}
          className="text-xs border border-gray-300 text-gray-600 px-3 py-1.5
                     rounded-full hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]
                     transition-colors"
        >
          Edit
        </Link>

        {/* Copy link preview */}
        <button
          onClick={handleCopyLink}
          className="text-xs border border-gray-300 text-gray-600 px-3 py-1.5
                     rounded-full hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]
                     transition-colors"
        >
          {copying ? "Tersalin!" : "Salin Link"}
        </button>

        {/* Bayar — akan dihubungkan ke Phase 6 */}
        {status === "pending" && (
          <button
            onClick={() => router.push(`/order/${orderId}/checkout`)}
            className="text-xs bg-[var(--color-primary)] text-white px-4 py-1.5
                       rounded-full hover:bg-[var(--color-primary-dark)] transition-colors"
          >
            Bayar Sekarang
          </button>
        )}

        {/* Lihat undangan live — jika sudah published */}
        {status === "published" && (
          <Link
            href={`/invitation/${orderId}`}
            className="text-xs bg-emerald-500 text-white px-4 py-1.5 rounded-full"
          >
            Lihat Undangan →
          </Link>
        )}
      </div>
    </div>
  );
}
