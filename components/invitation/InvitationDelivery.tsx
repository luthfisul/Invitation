// ============================================================
// components/invitation/InvitationDelivery.tsx
// Komponen hasil akhir setelah undangan di-publish.
// Menampilkan: URL, QR Code, tombol salin & share.
// Dipakai di: halaman sukses setelah bayar, dashboard customer.
// ============================================================

"use client";

import { useState }   from "react";
import Image          from "next/image";
import type { InvitationRow } from "@/types/database";

interface InvitationDeliveryProps {
  invitation:    InvitationRow;
  brideNickName: string;
  groomNickName: string;
  eventDate:     string;
}

export default function InvitationDelivery({
  invitation,
  brideNickName,
  groomNickName,
  eventDate,
}: InvitationDeliveryProps) {
  const [copied, setCopied]   = useState(false);
  const [shared, setShared]   = useState(false);

  const invUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/invitation/${invitation.slug}`
      : `/invitation/${invitation.slug}`;

  // ── Actions ─────────────────────────────────────────────────

  async function handleCopy() {
    await navigator.clipboard.writeText(invUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  async function handleShare() {
    if (navigator.share) {
      await navigator.share({
        title: `Undangan Pernikahan ${brideNickName} & ${groomNickName}`,
        text:  `Kami mengundang kamu untuk hadir di pernikahan kami 💌`,
        url:   invUrl,
      });
      setShared(true);
    } else {
      handleCopy();
    }
  }

  function handleWhatsApp() {
    const text = encodeURIComponent(
      `Halo! Kami mengundang kamu untuk hadir di pernikahan kami 💍\n\n` +
      `${brideNickName} & ${groomNickName}\n` +
      `${eventDate}\n\n` +
      `Lihat undangan lengkapnya di sini:\n${invUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }

  function handleDownloadQR() {
    if (!invitation.qr_code_url) return;
    const a = document.createElement("a");
    a.href     = invitation.qr_code_url;
    a.download = `qr-undangan-${invitation.slug}.png`;
    a.click();
  }

  // ── Render ───────────────────────────────────────────────────

  return (
    <div className="max-w-md mx-auto px-6 py-12 text-center">

      {/* Success icon */}
      <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center
                      mx-auto mb-6 text-3xl">
        🎉
      </div>

      <h1 className="text-2xl font-semibold mb-2">
        Undangan Siap!
      </h1>
      <p className="text-muted text-sm mb-8">
        Undangan pernikahan {brideNickName} & {groomNickName} sudah aktif
        dan bisa langsung dibagikan.
      </p>

      {/* URL Box */}
      <div className="bg-white border border-[var(--color-border)] rounded-2xl
                      p-4 mb-6 text-left">
        <p className="text-xs text-muted mb-2 uppercase tracking-widest">
          Link Undangan
        </p>
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium flex-1 truncate text-[var(--color-primary)]">
            {invUrl}
          </p>
          <button
            onClick={handleCopy}
            className="shrink-0 text-xs border border-gray-300 px-3 py-1.5 rounded-full
                       hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]
                       transition-colors"
          >
            {copied ? "✓ Tersalin" : "Salin"}
          </button>
        </div>
      </div>

      {/* QR Code */}
      {invitation.qr_code_url && (
        <div className="bg-white border border-[var(--color-border)] rounded-2xl p-6 mb-6">
          <p className="text-xs text-muted uppercase tracking-widest mb-4">
            QR Code
          </p>
          <div className="flex justify-center mb-4">
            <Image
              src={invitation.qr_code_url}
              alt="QR Code Undangan"
              width={180}
              height={180}
              className="rounded-xl"
              unoptimized // QR dari external URL
            />
          </div>
          <button
            onClick={handleDownloadQR}
            className="text-xs border border-gray-300 px-4 py-2 rounded-full
                       hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]
                       transition-colors"
          >
            Download QR Code
          </button>
        </div>
      )}

      {/* Share buttons */}
      <div className="space-y-3">
        {/* WhatsApp */}
        <button
          onClick={handleWhatsApp}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-full
                     bg-emerald-500 text-white text-sm font-medium
                     hover:bg-emerald-600 transition-colors"
        >
          <span>💬</span> Bagikan via WhatsApp
        </button>

        {/* Native share / copy */}
        <button
          onClick={handleShare}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-full
                     bg-[var(--color-primary)] text-white text-sm font-medium
                     hover:bg-[var(--color-primary-dark)] transition-colors"
        >
          <span>🔗</span>
          {shared ? "Berhasil Dibagikan!" : "Bagikan Link"}
        </button>

        {/* Lihat undangan */}
        <a
          href={invUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 py-3 rounded-full
                     border border-gray-300 text-gray-700 text-sm
                     hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]
                     transition-colors"
        >
          <span>👀</span> Lihat Undangan
        </a>
      </div>

      {/* Stats */}
      <div className="mt-8 pt-6 border-t border-[var(--color-border)]">
        <p className="text-xs text-muted">
          Sudah dilihat{" "}
          <span className="font-semibold text-[var(--color-dark)]">
            {invitation.view_count ?? 0}
          </span>{" "}
          kali
        </p>
      </div>

    </div>
  );
}
