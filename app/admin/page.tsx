// ============================================================
// app/admin/page.tsx
// Admin dashboard — stat cards + order terbaru + template stats
// ============================================================

import Link                    from "next/link";
import { requireAdmin }        from "@/lib/admin";
import { getAdminStats, getTemplateStats } from "@/lib/admin";
import { createServerSupabase } from "@/lib/auth";
import { formatPrice, formatDateID } from "@/lib/utils";
import type { OrderRow, TemplateRow } from "@/types/database";

const statusColor: Record<string, string> = {
  pending:    "bg-yellow-100 text-yellow-700",
  paid:       "bg-blue-100 text-blue-700",
  processing: "bg-purple-100 text-purple-700",
  published:  "bg-emerald-100 text-emerald-700",
  cancelled:  "bg-red-100 text-red-700",
};

const statusLabel: Record<string, string> = {
  pending:    "Menunggu Bayar",
  paid:       "Dibayar",
  processing: "Diproses",
  published:  "Aktif",
  cancelled:  "Dibatalkan",
};

export const metadata = { title: "Dashboard Admin" };

export default async function AdminDashboardPage() {
  await requireAdmin();

  const [stats, templateStats] = await Promise.all([
    getAdminStats(),
    getTemplateStats(),
  ]);

  // 10 order terbaru
  const supabase = createServerSupabase();
  const { data: recentOrders } = await supabase
    .from("orders")
    .select(`
      id, order_number, status, total_amount, created_at,
      templates ( name ),
      invitation_data ( bride_full_name, groom_full_name, event_date )
    `)
    .order("created_at", { ascending: false })
    .limit(10);

  const statCards = [
    { label: "Total Pesanan",    value: stats.totalOrders,     icon: "📋", color: "bg-blue-50   text-blue-600"   },
    { label: "Undangan Aktif",   value: stats.publishedOrders, icon: "✅", color: "bg-emerald-50 text-emerald-600" },
    { label: "Menunggu Bayar",   value: stats.pendingOrders,   icon: "⏳", color: "bg-yellow-50 text-yellow-600" },
    { label: "Total Customer",   value: stats.totalCustomers,  icon: "👥", color: "bg-purple-50 text-purple-600" },
    { label: "Total Revenue",    value: formatPrice(stats.totalRevenue), icon: "💰", color: "bg-green-50  text-green-600",  isString: true },
    { label: "Total Views",      value: `${stats.totalViews}×`, icon: "👁",  color: "bg-gray-50   text-gray-600",   isString: true },
  ];

  return (
    <div className="space-y-8 max-w-6xl">

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white border border-gray-200 rounded-2xl p-5"
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center
                             text-lg mb-3 ${card.color}`}>
              {card.icon}
            </div>
            <p className="text-xs text-gray-400 mb-1">{card.label}</p>
            <p className="text-2xl font-semibold text-gray-800">
              {card.isString ? card.value : card.value.toLocaleString("id-ID")}
            </p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-6">

        {/* Recent Orders */}
        <div className="md:col-span-2 bg-white border border-gray-200 rounded-2xl">
          <div className="flex items-center justify-between px-5 py-4
                          border-b border-gray-100">
            <h2 className="text-sm font-semibold">Pesanan Terbaru</h2>
            <Link
              href="/admin/orders"
              className="text-xs text-[var(--color-primary)] hover:underline"
            >
              Lihat semua →
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {(recentOrders ?? []).map((order) => {
              const tpl  = order.templates     as unknown as { name: string } | null;
              const invD = order.invitation_data as unknown as {
                bride_full_name: string;
                groom_full_name: string;
                event_date: string;
              } | null;

              return (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between px-5 py-3.5
                             hover:bg-gray-50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">
                      {invD?.bride_full_name && invD?.groom_full_name
                        ? `${invD.bride_full_name} & ${invD.groom_full_name}`
                        : order.order_number}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {tpl?.name ?? "-"} ·{" "}
                      {new Date(order.created_at).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full
                                      ${statusColor[order.status] ?? ""}`}>
                      {statusLabel[order.status] ?? order.status}
                    </span>
                    <span className="text-sm font-semibold text-[var(--color-primary)]">
                      {formatPrice(order.total_amount)}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Template Stats */}
        <div className="bg-white border border-gray-200 rounded-2xl">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold">Template Terlaris</h2>
          </div>
          <div className="p-5 space-y-4">
            {templateStats.length === 0 && (
              <p className="text-xs text-gray-400">Belum ada data.</p>
            )}
            {templateStats.map((t, i) => (
              <div key={t.name} className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-300 w-4">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{t.name}</p>
                  <div className="mt-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--color-primary)] rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          (t.count / (templateStats[0]?.count ?? 1)) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
                <span className="text-xs font-semibold text-gray-500 shrink-0">
                  {t.count}×
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
