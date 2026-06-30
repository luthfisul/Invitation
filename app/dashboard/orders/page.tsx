// ============================================================
// app/dashboard/orders/page.tsx
// Daftar semua pesanan customer
// ============================================================

import Link                     from "next/link";
import { requireAuth }          from "@/lib/auth";
import { createServerSupabase } from "@/lib/auth";
import { formatPrice, formatDateID } from "@/lib/utils";
import type { OrderRow, TemplateRow, InvitationRow } from "@/types/database";

const statusLabel: Record<OrderRow["status"], string> = {
  pending:    "Menunggu Bayar",
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

export const metadata = { title: "Pesanan Saya" };

export default async function OrdersPage() {
  const user     = await requireAuth();
  const supabase = createServerSupabase();

  const { data: orders } = await supabase
    .from("orders")
    .select(`
      id, order_number, status, total_amount, created_at,
      templates ( name, tier ),
      invitation_data ( bride_full_name, groom_full_name, event_date ),
      invitations ( slug, view_count, is_published )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const allOrders = orders ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Semua Pesanan</h1>
        <Link
          href="/templates"
          className="text-xs bg-[var(--color-primary)] text-white
                     px-4 py-2 rounded-full hover:bg-[var(--color-primary-dark)]
                     transition-colors"
        >
          + Pesanan Baru
        </Link>
      </div>

      {allOrders.length === 0 ? (
        <div className="bg-white border border-[var(--color-border)]
                        rounded-2xl p-12 text-center">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-muted text-sm">Belum ada pesanan.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {allOrders.map((order) => {
            const tpl  = order.templates     as unknown as TemplateRow | null;
            const inv  = order.invitations   as unknown as InvitationRow | null;
            const invD = order.invitation_data as {
              bride_full_name: string;
              groom_full_name: string;
              event_date: string;
            } | null;

            return (
              <div
                key={order.id}
                className="bg-white border border-[var(--color-border)]
                           rounded-2xl p-5"
              >
                {/* Row 1: Nama + Status */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-sm font-semibold">
                      {invD?.bride_full_name && invD?.groom_full_name
                        ? `${invD.bride_full_name} & ${invD.groom_full_name}`
                        : order.order_number}
                    </p>
                    <p className="text-xs text-muted mt-0.5">
                      {order.order_number} · {tpl?.name ?? "-"}
                    </p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full shrink-0
                                    font-medium ${statusColor[order.status]}`}>
                    {statusLabel[order.status]}
                  </span>
                </div>

                {/* Row 2: Detail */}
                <div className="grid grid-cols-2 gap-2 text-xs text-muted mb-4">
                  <div>
                    <span className="block uppercase tracking-widest text-[10px] mb-0.5">
                      Tanggal Acara
                    </span>
                    {invD?.event_date ? formatDateID(invD.event_date) : "—"}
                  </div>
                  <div>
                    <span className="block uppercase tracking-widest text-[10px] mb-0.5">
                      Total
                    </span>
                    <span className="text-[var(--color-primary)] font-semibold text-sm">
                      {formatPrice(order.total_amount)}
                    </span>
                  </div>
                  {inv?.is_published && (
                    <div>
                      <span className="block uppercase tracking-widest text-[10px] mb-0.5">
                        Dilihat
                      </span>
                      {inv.view_count ?? 0}× 
                    </div>
                  )}
                </div>

                {/* Row 3: Actions */}
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/dashboard/orders/${order.id}`}
                    className="text-xs border border-gray-300 px-3 py-1.5 rounded-full
                               hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]
                               transition-colors"
                  >
                    Detail
                  </Link>
                  {order.status === "pending" && (
                    <Link
                      href={`/order/${order.id}/checkout`}
                      className="text-xs bg-[var(--color-primary)] text-white
                                 px-3 py-1.5 rounded-full"
                    >
                      Bayar Sekarang
                    </Link>
                  )}
                  {(order.status === "pending" || order.status === "published") && (
                    <Link
                      href={`/order/${order.id}/preview`}
                      className="text-xs border border-gray-300 px-3 py-1.5 rounded-full
                                 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]
                                 transition-colors"
                    >
                      Preview
                    </Link>
                  )}
                  {inv?.is_published && inv?.slug && (
                    <Link
                      href={`/invitation/${inv.slug}`}
                      target="_blank"
                      className="text-xs bg-emerald-500 text-white px-3 py-1.5 rounded-full"
                    >
                      Lihat Undangan →
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
