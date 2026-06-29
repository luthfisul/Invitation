// ============================================================
// app/admin/analytics/page.tsx
// Analytics: revenue, views, conversion, template terlaris
// ============================================================

import { requireAdmin }          from "@/lib/admin";
import { getAdminStats, getRevenueChart, getTemplateStats } from "@/lib/admin";
import { createServerSupabase }  from "@/lib/auth";
import { formatPrice }           from "@/lib/utils";

export const metadata = { title: "Analytics" };

export default async function AdminAnalyticsPage() {
  await requireAdmin();

  const [stats, revenueChart, templateStats] = await Promise.all([
    getAdminStats(),
    getRevenueChart(),
    getTemplateStats(),
  ]);

  const supabase = createServerSupabase();

  // RSVP stats
  const { count: totalRsvp } = await supabase
    .from("guest_books")
    .select("*", { count: "exact", head: true });

  const { count: hadirCount } = await supabase
    .from("guest_books")
    .select("*", { count: "exact", head: true })
    .eq("attendance", "hadir");

  // Conversion rate
  const conversionRate =
    stats.totalOrders > 0
      ? ((stats.publishedOrders / stats.totalOrders) * 100).toFixed(1)
      : "0";

  const maxRevenue = Math.max(...revenueChart.map((d) => d.revenue), 1);

  return (
    <div className="space-y-8 max-w-5xl">
      <h1 className="text-lg font-semibold">Analytics</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue",      value: formatPrice(stats.totalRevenue), icon: "💰" },
          { label: "Conversion Rate",    value: `${conversionRate}%`,            icon: "📈" },
          { label: "Total Views",        value: `${stats.totalViews.toLocaleString("id-ID")}`,  icon: "👁" },
          { label: "Total RSVP",         value: `${totalRsvp ?? 0}`,             icon: "✉️" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white border border-gray-200 rounded-2xl p-5">
            <p className="text-2xl mb-2">{kpi.icon}</p>
            <p className="text-xs text-gray-400 mb-1">{kpi.label}</p>
            <p className="text-xl font-semibold">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Revenue Chart (7 hari) */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h2 className="text-sm font-semibold mb-6">Revenue 7 Hari Terakhir</h2>
        {revenueChart.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">
            Belum ada data revenue.
          </p>
        ) : (
          <div className="flex items-end gap-3 h-40">
            {revenueChart.map((d) => (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-2">
                <p className="text-xs text-gray-500 font-medium">
                  {formatPrice(d.revenue).replace("Rp", "").trim()}
                </p>
                <div
                  className="w-full bg-[var(--color-primary)] rounded-t-lg
                             transition-all min-h-[4px]"
                  style={{
                    height: `${Math.max(4, (d.revenue / maxRevenue) * 120)}px`,
                  }}
                />
                <p className="text-[10px] text-gray-400 text-center">{d.date}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">

        {/* Template Ranking */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-sm font-semibold mb-5">Template Terlaris</h2>
          <div className="space-y-4">
            {templateStats.length === 0 && (
              <p className="text-sm text-gray-400">Belum ada data.</p>
            )}
            {templateStats.map((t, i) => (
              <div key={t.name} className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-300 w-4">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{t.name}</span>
                    <span className="text-gray-400">{t.count}×</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--color-primary)] rounded-full"
                      style={{
                        width: `${(t.count / (templateStats[0]?.count ?? 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RSVP Stats */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-sm font-semibold mb-5">Statistik RSVP</h2>
          <div className="space-y-4">
            {[
              { label: "Total RSVP masuk", value: totalRsvp ?? 0,   color: "bg-blue-400" },
              { label: "Konfirmasi Hadir", value: hadirCount ?? 0,  color: "bg-emerald-400" },
              { label: "Tidak / Mungkin",  value: (totalRsvp ?? 0) - (hadirCount ?? 0), color: "bg-gray-300" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${item.color}`} />
                <span className="flex-1 text-sm text-gray-600">{item.label}</span>
                <span className="text-sm font-semibold">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
