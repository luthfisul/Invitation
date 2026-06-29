// app/admin/orders/page.tsx
import Link                     from "next/link";
import { requireAdmin }         from "@/lib/admin";
import { createServerSupabase } from "@/lib/auth";
import { formatPrice, formatDateID } from "@/lib/utils";
import type { OrderRow }        from "@/types/database";

export const metadata = { title: "Semua Pesanan" };

const STATUS_OPTIONS = [
  { value: "",          label: "Semua" },
  { value: "pending",   label: "Menunggu Bayar" },
  { value: "paid",      label: "Dibayar" },
  { value: "published", label: "Aktif" },
  { value: "cancelled", label: "Dibatalkan" },
];

const statusColor: Record<string, string> = {
  pending:    "bg-yellow-100 text-yellow-700",
  paid:       "bg-blue-100 text-blue-700",
  processing: "bg-purple-100 text-purple-700",
  published:  "bg-emerald-100 text-emerald-700",
  cancelled:  "bg-red-100 text-red-700",
};

interface PageProps {
  searchParams: Promise<{ status?: string; page?: string }>;
}

const PAGE_SIZE = 20;

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  await requireAdmin();
  const supabase = createServerSupabase();
  const params   = await searchParams;
  const status   = params.status ?? "";
  const page     = Math.max(1, parseInt(params.page ?? "1", 10));
  const from     = (page - 1) * PAGE_SIZE;

  let query = supabase
    .from("orders")
    .select(`id, order_number, status, total_amount, created_at,
      templates ( name, tier ),
      invitation_data ( bride_full_name, groom_full_name, event_date ),
      users ( full_name, email )`, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + PAGE_SIZE - 1);

  if (status) query = query.eq("status", status as OrderRow["status"]);

  const { data: orders, count } = await query;
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  return (
    <div className="space-y-6 max-w-6xl">
      <h1 className="text-lg font-semibold">
        Semua Pesanan <span className="ml-2 text-sm font-normal text-gray-400">({count ?? 0})</span>
      </h1>
      <div className="flex flex-wrap gap-2">
        {STATUS_OPTIONS.map((opt) => (
          <Link key={opt.value} href={`/admin/orders${opt.value ? `?status=${opt.value}` : ""}`}
            className={["text-xs px-4 py-2 rounded-full border transition-colors",
              status === opt.value
                ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                : "border-gray-300 text-gray-600 hover:border-[var(--color-primary)]"
            ].join(" ")}>
            {opt.label}
          </Link>
        ))}
      </div>
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["No. Order","Mempelai","Template","Customer","Total","Tanggal","Status",""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(orders ?? []).length === 0 && (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400 text-sm">Tidak ada pesanan.</td></tr>
              )}
              {(orders ?? []).map((order) => {
                const tpl  = order.templates      as unknown as { name: string } | null;
                const invD = order.invitation_data as unknown as { bride_full_name: string; groom_full_name: string; event_date: string } | null;
                const usr  = order.users           as unknown as { full_name: string; email: string } | null;
                return (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500 whitespace-nowrap">{order.order_number}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium whitespace-nowrap">
                        {invD?.bride_full_name && invD?.groom_full_name ? `${invD.bride_full_name} & ${invD.groom_full_name}` : "—"}
                      </p>
                      {invD?.event_date && <p className="text-xs text-gray-400 mt-0.5">{formatDateID(invD.event_date)}</p>}
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{tpl?.name ?? "—"}</td>
                    <td className="px-4 py-3">
                      <p className="whitespace-nowrap">{usr?.full_name ?? "—"}</p>
                      <p className="text-xs text-gray-400">{usr?.email ?? ""}</p>
                    </td>
                    <td className="px-4 py-3 font-semibold text-[var(--color-primary)] whitespace-nowrap">{formatPrice(order.total_amount)}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{new Date(order.created_at).toLocaleDateString("id-ID")}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColor[order.status] ?? ""}`}>{order.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/orders/${order.id}`} className="text-xs text-[var(--color-primary)] hover:underline">Detail →</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-400">Hal. {page} dari {totalPages}</p>
            <div className="flex gap-2">
              {page > 1 && <Link href={`/admin/orders?${status?`status=${status}&`:""}page=${page-1}`} className="text-xs border px-3 py-1.5 rounded-full">← Sebelumnya</Link>}
              {page < totalPages && <Link href={`/admin/orders?${status?`status=${status}&`:""}page=${page+1}`} className="text-xs border px-3 py-1.5 rounded-full">Berikutnya →</Link>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
