// ============================================================
// app/order/[orderId]/checkout/page.tsx
// Halaman checkout — ringkasan order + form customer + bayar
// ============================================================

import { notFound }            from "next/navigation";
import Navbar                  from "@/components/Navbar";
import Footer                  from "@/components/Footer";
import CheckoutForm            from "@/components/payment/CheckoutForm";
import { getOrderWithDetails } from "@/lib/orders";
import { formatPrice }         from "@/lib/utils";
import type {
  InvitationDataRow,
  TemplateRow,
}                              from "@/types/database";

interface PageProps {
  params: { orderId: string };
}

export const metadata = { title: "Checkout" };

export default async function CheckoutPage({ params }: PageProps) {
  let order;
  try {
    order = await getOrderWithDetails(params.orderId);
  } catch {
    notFound();
  }

  // Sudah dibayar → redirect ke success
  if (order.status !== "pending") {
    notFound();
  }

  const invData  = order.invitation_data as InvitationDataRow | null;
  const template = order.templates       as TemplateRow | null;

  const tierLabel: Record<string, string> = {
    basic:     "Basic",
    premium:   "Premium",
    exclusive: "Exclusive",
  };

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="max-w-lg mx-auto px-6">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold mb-1">Checkout</h1>
            <p className="text-sm text-muted">{order.order_number}</p>
          </div>

          {/* Ringkasan Order */}
          <div className="bg-white border border-[var(--color-border)]
                          rounded-2xl p-5 mb-6">
            <p className="text-xs text-muted uppercase tracking-widest mb-4">
              Ringkasan Pesanan
            </p>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Template</span>
                <span className="font-medium">{template?.name ?? "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Paket</span>
                <span>{tierLabel[template?.tier ?? "basic"]}</span>
              </div>
              {invData?.bride_full_name && invData?.groom_full_name && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Mempelai</span>
                  <span className="text-right">
                    {invData.bride_full_name} & {invData.groom_full_name}
                  </span>
                </div>
              )}
              {invData?.event_date && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Tanggal</span>
                  <span>
                    {new Date(invData.event_date).toLocaleDateString("id-ID", {
                      day:   "numeric",
                      month: "long",
                      year:  "numeric",
                    })}
                  </span>
                </div>
              )}
              <div className="border-t border-[var(--color-border)] pt-3 mt-1
                              flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-[var(--color-primary)]">
                  {formatPrice(order.total_amount)}
                </span>
              </div>
            </div>
          </div>

          {/* Form customer + tombol bayar */}
          <CheckoutForm
            orderId={params.orderId}
            amount={order.total_amount}
          />

        </div>
      </main>
      <Footer />
    </>
  );
}
