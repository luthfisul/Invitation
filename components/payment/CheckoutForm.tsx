// ============================================================
// components/payment/CheckoutForm.tsx
// Form data customer + integrasi CheckoutButton
// ============================================================

"use client";

import { useState }      from "react";
import CheckoutButton    from "./CheckoutButton";
import { cn }            from "@/lib/utils";

interface CheckoutFormProps {
  orderId: string;
  amount:  number;
}

export default function CheckoutForm({ orderId, amount }: CheckoutFormProps) {
  const [name,  setName]  = useState("");
  const [email, setEmail] = useState("");
  const [ready, setReady] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim() && email.trim()) setReady(true);
  }

  const inputClass =
    "w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm " +
    "focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] " +
    "focus:border-transparent transition bg-white";

  return (
    <div>
      {!ready ? (
        /* ── Step 1: Isi data diri ── */
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <p className="text-xs text-muted uppercase tracking-widest mb-4">
              Data Pemesan
            </p>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="contoh: Raka Pratama"
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">
                  Email *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contoh: raka@email.com"
                  required
                  className={inputClass}
                />
                <p className="text-xs text-muted mt-1">
                  Link undangan akan dikirim ke email ini setelah pembayaran.
                </p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className={cn(
              "w-full py-3.5 rounded-full text-sm font-medium",
              "bg-[var(--color-primary)] text-white",
              "hover:bg-[var(--color-primary-dark)] transition-colors"
            )}
          >
            Lanjut ke Pembayaran →
          </button>
        </form>

      ) : (
        /* ── Step 2: Konfirmasi + Bayar ── */
        <div className="space-y-5">
          {/* Konfirmasi data */}
          <div className="bg-white border border-[var(--color-border)]
                          rounded-2xl p-5">
            <p className="text-xs text-muted uppercase tracking-widest mb-3">
              Data Pemesan
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Nama</span>
                <span className="font-medium">{name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Email</span>
                <span>{email}</span>
              </div>
            </div>
            <button
              onClick={() => setReady(false)}
              className="text-xs text-[var(--color-primary)] mt-3 hover:underline"
            >
              Ubah data
            </button>
          </div>

          {/* Payment methods info */}
          <div className="bg-[var(--color-light)] rounded-2xl p-4">
            <p className="text-xs text-muted mb-2">Metode Pembayaran Tersedia</p>
            <div className="flex flex-wrap gap-2">
              {["QRIS", "GoPay", "ShopeePay", "BCA", "BNI", "BRI", "Mandiri"].map((m) => (
                <span
                  key={m}
                  className="text-xs bg-white border border-gray-200 px-2.5 py-1 rounded-full"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>

          {/* Tombol bayar */}
          <CheckoutButton
            orderId={orderId}
            amount={amount}
            customerName={name}
            customerEmail={email}
          />
        </div>
      )}
    </div>
  );
}
