// ============================================================
// components/payment/CheckoutButton.tsx
// Tombol bayar — membuka Midtrans Snap popup
//
// CARA KERJA:
// 1. Klik tombol → POST /api/payment/midtrans → dapat snapToken
// 2. window.snap.pay(snapToken) → popup Midtrans terbuka
// 3. User bayar (QRIS / transfer / e-wallet)
// 4. Midtrans kirim webhook → /api/payment/webhook
// 5. Undangan di-generate otomatis → redirect ke /success
// ============================================================

"use client";

import { useState, useEffect } from "react";
import { useRouter }           from "next/navigation";
import { cn }                  from "@/lib/utils";

// Deklarasi global untuk Midtrans Snap
declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        options?: {
          onSuccess?:   (result: unknown) => void;
          onPending?:   (result: unknown) => void;
          onError?:     (result: unknown) => void;
          onClose?:     ()                => void;
        }
      ) => void;
    };
  }
}

interface CheckoutButtonProps {
  orderId:       string;
  amount:        number;
  customerName:  string;
  customerEmail: string;
  className?:    string;
}

export default function CheckoutButton({
  orderId,
  amount,
  customerName,
  customerEmail,
  className,
}: CheckoutButtonProps) {
  const router  = useRouter();
  const [loading, setLoading]   = useState(false);
  const [error,   setError]     = useState<string | null>(null);
  const [snapReady, setSnapReady] = useState(false);

  const clientKey    = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;
  const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true";

  // ── Load Midtrans Snap.js ─────────────────────────────────
  useEffect(() => {
    const snapUrl = isProduction
      ? "https://app.midtrans.com/snap/snap.js"
      : "https://app.sandbox.midtrans.com/snap/snap.js";

    if (document.querySelector(`script[src="${snapUrl}"]`)) {
      setSnapReady(true);
      return;
    }

    const script       = document.createElement("script");
    script.src         = snapUrl;
    script.setAttribute("data-client-key", clientKey ?? "");
    script.onload      = () => setSnapReady(true);
    script.onerror     = () => setError("Gagal memuat payment gateway");
    document.head.appendChild(script);
  }, [clientKey, isProduction]);

  // ── Handle Payment ────────────────────────────────────────
  async function handlePay() {
    if (!snapReady || !window.snap) {
      setError("Payment gateway belum siap. Coba lagi dalam beberapa detik.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Minta snap token dari backend
      const res = await fetch("/api/payment/midtrans", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ orderId, customerEmail, customerName }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      // 2. Buka popup Midtrans
      window.snap.pay(json.snapToken, {
        onSuccess: () => {
          // Payment sukses — redirect ke success page
          // Webhook akan trigger generate invitation
          router.push(`/order/${orderId}/success`);
        },
        onPending: () => {
          // Menunggu transfer — tetap redirect, tampilkan status pending
          router.push(`/order/${orderId}/success`);
        },
        onError: (result) => {
          console.error("Snap error:", result);
          setError("Pembayaran gagal. Silakan coba lagi.");
          setLoading(false);
        },
        onClose: () => {
          // User menutup popup tanpa bayar
          setLoading(false);
        },
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handlePay}
        disabled={loading || !snapReady}
        className={cn(
          "w-full py-3.5 rounded-full text-sm font-medium transition-all",
          "bg-[var(--color-primary)] text-white",
          "hover:bg-[var(--color-primary-dark)]",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
      >
        {loading
          ? "Memproses..."
          : !snapReady
          ? "Memuat payment..."
          : `Bayar ${new Intl.NumberFormat("id-ID", {
              style:    "currency",
              currency: "IDR",
              minimumFractionDigits: 0,
            }).format(amount)}`
        }
      </button>

      {error && (
        <p className="text-xs text-red-500 text-center">{error}</p>
      )}

      <p className="text-xs text-muted text-center">
        Pembayaran diproses dengan aman oleh Midtrans.
        Mendukung QRIS, GoPay, ShopeePay, dan transfer bank.
      </p>
    </div>
  );
}
