// ============================================================
// app/dashboard/orders/[orderId]/page.tsx
// Detail pesanan — statistik, edit data, link undangan
// ============================================================

import { notFound }             from "next/navigation";
import Link                     from "next/link";
import { requireAuth }          from "@/lib/auth";
import { createServerSupabase } from "@/lib/auth";
import { formatPrice, formatDateID } from "@/lib/utils";
import InvitationDelivery       from "@/components/invitation/InvitationDelivery";
import type {
  TemplateRow,
  InvitationDataRow,
  InvitationRow,
  PaymentRow,
}                               from "@/types/database";

interface PageProps {
  params: { orderId: string };
}

export const metadata = { title: "Detail Pesanan" };

export default async function OrderDetailPage({ params }: PageProps) {
  const user     = await requireAuth();
  const supabase = createServerSupabase();

  const { data: order, error } = await supabase
    .from("orders")
    .select(`
      *,
      templates (*),
      invitation_data (*),
      invitations (*),
      payments (*)
    `)
    .eq("id", params.orderId)
    .eq("user_id", user.id)         // pastikan milik user ini
    .single();

  if (error || !order) notFound();

  const template = order.templates     as unknown as TemplateRow | null;
  const invData  = order.invitation_data as unknown as InvitationDataRow | null;
  const inv      = order.invitations   as unknown as InvitationRow | null;
  const payment  = Array.isArray(order.payments)
    ? (order.payments[0] as PaymentRow | undefined)
    : null;

  const statusLabel: Record<string, string> = {
    pending:    "Menunggu Pembayaran",
    paid:       "Dibayar",
    processing: "Diproses",
    published:  "Aktif",
    cancelled:  "Dibatalkan",
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-muted mb-1">{order.order_number}</p>
          <h1 className="text-lg font-semibold">
            {invData?.bride_full_name && invData?.groom_full_name
              ? `${invData.bride_full_name} & ${invData.groom_full_name}`
              : "Detail Pesanan"}
          </h1>
        </div>
        <span className="text-xs px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 shrink-0">
          {statusLabel[order.status] ?? order.status}
        </span>
      </div>

      {/* Jika sudah publish — tampilkan delivery card */}
      {inv?.is_published && invData && (
        <InvitationDelivery
          invitation={inv}
          brideNickName={invData.bride_nick_name ?? invData.bride_full_name?.split(" ")[0] ?? ""}
          groomNickName={invData.groom_nick_name ?? invData.groom_full_name?.split(" ")[0] ?? ""}
          eventDate={invData.event_date ? formatDateID(invData.event_date) : ""}
        />
      )}

      {/* Info order */}
      <div className="bg-white border border-[var(--color-border)] rounded-2xl p-5">
        <p className="text-xs text-muted uppercase tracking-widest mb-4">
          Info Pesanan
        </p>
        <div className="space-y-3 text-sm">
          {[
            { label: "Template",   value: template?.name },
            { label: "Paket",      value: template?.tier },
            { label: "Total",      value: formatPrice(order.total_amount) },
            { label: "Tgl Order",  value: new Date(order.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) },
            { label: "Tgl Acara",  value: invData?.event_date ? formatDateID(invData.event_date) : null },
            { label: "Venue",      value: invData?.venue_name },
          ].filter((r) => r.value).map((row) => (
            <div key={row.label} className="flex justify-between">
              <span className="text-muted">{row.label}</span>
              <span className="font-medium text-right">{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Info pembayaran */}
      {payment && (
        <div className="bg-white border border-[var(--color-border)] rounded-2xl p-5">
          <p className="text-xs text-muted uppercase tracking-widest mb-4">
            Pembayaran
          </p>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Metode</span>
              <span className="font-medium uppercase">{payment.method ?? "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Status</span>
              <span className="font-medium capitalize">{payment.status}</span>
            </div>
            {payment.paid_at && (
              <div className="flex justify-between">
                <span className="text-muted">Dibayar</span>
                <span>{new Date(payment.paid_at).toLocaleDateString("id-ID")}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {order.status === "pending" && (
          <>
            <Link
              href={`/order/${order.id}`}
              className="flex-1 text-center border border-gray-300 text-gray-700
                         py-2.5 rounded-full text-sm hover:border-[var(--color-primary)]
                         hover:text-[var(--color-primary)] transition-colors"
            >
              Edit Data
            </Link>
            <Link
              href={`/order/${order.id}/checkout`}
              className="flex-1 text-center bg-[var(--color-primary)] text-white
                         py-2.5 rounded-full text-sm hover:bg-[var(--color-primary-dark)]
                         transition-colors"
            >
              Bayar Sekarang
            </Link>
          </>
        )}
        {order.status !== "cancelled" && (
          <Link
            href={`/order/${order.id}/preview`}
            className="flex-1 text-center border border-gray-300 text-gray-700
                       py-2.5 rounded-full text-sm hover:border-[var(--color-primary)]
                       hover:text-[var(--color-primary)] transition-colors"
          >
            Preview Undangan
          </Link>
        )}
      </div>

    </div>
  );
}
