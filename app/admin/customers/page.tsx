// app/admin/customers/page.tsx
import { requireAdmin }         from "@/lib/admin";
import { createServerSupabase } from "@/lib/auth";

export const metadata = { title: "Customer" };

interface PageProps {
  searchParams: Promise<{ search?: string; page?: string }>;
}

interface CustomerRow {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  created_at: string;
}

const PAGE_SIZE = 20;

export default async function AdminCustomersPage({ searchParams }: PageProps) {
  await requireAdmin();
  const supabase = createServerSupabase();
  const params   = await searchParams;
  const search   = params.search ?? "";
  const page     = Math.max(1, parseInt(params.page ?? "1", 10));
  const from     = (page - 1) * PAGE_SIZE;

  let query = supabase
    .from("users")
    .select("id, full_name, email, phone, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + PAGE_SIZE - 1);

  if (search) query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);

  const { data, count } = await query;
  const customers = (data ?? []) as CustomerRow[];
  const customerIds = customers.map((c) => c.id);

  const { data: orderCounts } = await supabase
    .from("orders").select("user_id").in("user_id", customerIds);

  const countMap: Record<string, number> = {};
  for (const o of orderCounts ?? []) {
    if (o.user_id) countMap[o.user_id] = (countMap[o.user_id] ?? 0) + 1;
  }

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">
          Customer <span className="ml-2 text-sm font-normal text-gray-400">({count ?? 0})</span>
        </h1>
        <form className="flex gap-2">
          <input name="search" defaultValue={search} placeholder="Cari nama / email..."
            className="text-sm border border-gray-300 rounded-xl px-4 py-2 focus:outline-none w-56" />
          <button type="submit" className="text-sm bg-gray-800 text-white px-4 py-2 rounded-xl">Cari</button>
        </form>
      </div>
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {["Nama","Email","Telepon","Pesanan","Tgl Daftar"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {customers.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-400 text-sm">Tidak ada customer.</td></tr>
            )}
            {customers.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{c.full_name ?? "—"}</td>
                <td className="px-4 py-3 text-gray-500">{c.email}</td>
                <td className="px-4 py-3 text-gray-500">{c.phone ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className="bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full">
                    {countMap[c.id] ?? 0} pesanan
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">
                  {new Date(c.created_at).toLocaleDateString("id-ID")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex justify-between items-center">
            <p className="text-xs text-gray-400">Hal. {page} dari {totalPages}</p>
            <div className="flex gap-2">
              {page > 1 && <a href={`/admin/customers?page=${page-1}${search?`&search=${search}`:""}`} className="text-xs border px-3 py-1.5 rounded-full">← Sebelumnya</a>}
              {page < totalPages && <a href={`/admin/customers?page=${page+1}${search?`&search=${search}`:""}`} className="text-xs border px-3 py-1.5 rounded-full">Berikutnya →</a>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
