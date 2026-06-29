// ============================================================
// app/dashboard/page.tsx
// Halaman beranda dashboard — statistik + order terbaru
// ============================================================

import Link                from "next/link";
import { requireAuth }     from "@/lib/auth";
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

export default async function DashboardPage() {
  const user     = await requireAuth();
  const supabase = createServerSupabase();

  // Ambil semua order user
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

  const allOrders   = orders ?? [];
  const totalSpent  = allOrders
    .filter((o) => o.status === "published" || o.status === "paid")
    .reduce((sum, o) => sum + o.total_amount, 0);
  const activeCount = allOrders.filter((o) => o.status === "published").length;
  const totalViews  = allOrders.reduce((sum, o) => {
    const inv = o.invitations as unknown as InvitationRow | null;
    return sum + (inv?.view_count ?? 0);
  }, 0);

  return (
    <div className="space-y-8">

      {/* Greeting */}
      <div>
        <h1 className="text-xl font-semibold">
          Selamat datang 👋
        </h1>
        <p className="text-sm text-muted mt-1">
          Kelola undangan pernikahan digitalmu di sini.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: "Total Pesanan",   value: allOrders.length,  suffix: "" },
          { label: "Undangan Aktif",  value: activeCount,       suffix: "" },
          { label: "Total Dilihat",   value: totalViews,        suffix: "x" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white border border-[var(--color-border)]
                       rounded-2xl p-5"
          >
            <p className="text-xs text-muted mb-1">{stat.label}</p>
            <p className="text-2xl font-semibold">
              {stat.value}{stat.suffix}
            </p>
          </div>
        ))}
      </div>

      {/* Order list */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold">Pesanan Kamu</h2>
          <Link
            href="/dashboard/orders"
            className="text-xs text-[var(--color-primary)] hover:underline"
          >
            Lihat semua →
          </Link>
        </div>

        {allOrders.length === 0 ? (
          <div className="bg-white border border-[var(--color-border)]
                          rounded-2xl p-10 text-center">
            <p className="text-3xl mb-3">📋</p>
            <p className="text-sm text-muted mb-4">Belum ada pesanan.</p>
            <Link
              href="/templates"
              className="inline-block bg-[var(--color-primary)] text-white
                         text-sm px-5 py-2.5 rounded-full hover:bg-[var(--color-primary-dark)]
                         transition-colors"
            >
              Buat Undangan Sekarang
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {allOrders.slice(0, 5).map((order) => {
              const tpl    = order.templates    as unknown as TemplateRow | null;
              const inv    = order.invitations  as unknown as InvitationRow | null;
              const invD   = order.invitation_data as unknown as { bride_full_name: string; groom_full_name: string; event_date: string } | null;

              return (
                <Link
                  key={order.id}
                  href={`/dashboard/orders/${order.id}`}
                  className="bg-white border border-[var(--color-border)]
                             rounded-2xl p-4 flex items-center gap-4
                             hover:border-[var(--color-primary)] transition-colors block"
                >
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium truncate">
                        {invD?.bride_full_name && invD?.groom_full_name
                          ? `${invD.bride_full_name} & ${invD.groom_full_name}`
                          : order.order_number}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full shrink-0
                                        ${statusColor[order.status]}`}>
                        {statusLabel[order.status]}
                      </span>
                    </div>
                    <p className="text-xs text-muted">
                      {tpl?.name ?? "-"} ·{" "}
                      {invD?.event_date ? formatDateID(invD.event_date) : "Tanggal belum diisi"}
                    </p>
                    {inv?.is_published && (
                      <p className="text-xs text-emerald-600 mt-0.5">
                        👁 {inv.view_count ?? 0} kali dilihat
                      </p>
                    )}
                  </div>

                  {/* Amount */}
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-[var(--color-primary)]">
                      {formatPrice(order.total_amount)}
                    </p>
                    <p className="text-xs text-muted">
                      {new Date(order.created_at).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
