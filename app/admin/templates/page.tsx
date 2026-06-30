// app/admin/templates/page.tsx
import { requireAdmin }         from "@/lib/admin";
import { createServerSupabase } from "@/lib/auth";
import { formatPrice }          from "@/lib/utils";
import AdminTemplateToggle      from "@/components/admin/AdminTemplateToggle";

export const metadata = { title: "Kelola Template" };

interface UsageRow {
  template_id: string | null;
}

export default async function AdminTemplatesPage() {
  await requireAdmin();
  const supabase = createServerSupabase();

  const result = await supabase
    .from("templates")
    .select("*")
    .order("price", { ascending: true });
  const templates: any[] = result.data ?? [];

  const usageResult = await supabase
    .from("orders")
    .select("template_id")
    .in("status", ["paid", "published"]);
  const usage: UsageRow[] = (usageResult.data ?? []) as UsageRow[];

  const usageMap: Record<string, number> = {};
  for (const o of usage) {
    if (o.template_id) usageMap[o.template_id] = (usageMap[o.template_id] ?? 0) + 1;
  }

  const tierBadge: Record<string, string> = {
    basic:     "bg-gray-100 text-gray-600",
    premium:   "bg-amber-100 text-amber-700",
    exclusive: "bg-purple-100 text-purple-700",
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Template Catalog</h1>
        <p className="text-xs text-gray-400">{templates.length} template tersedia</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {templates.map((t) => (
          <div key={t.id} className={["bg-white border rounded-2xl p-5 transition-opacity", !t.is_active ? "opacity-50" : ""].join(" ")}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-sm">{t.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${tierBadge[t.tier] ?? ""}`}>{t.tier}</span>
                  {t.is_best_seller && <span className="text-xs bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full">Best Seller</span>}
                </div>
                <p className="text-xs text-gray-400 line-clamp-1">{t.description}</p>
              </div>
              <AdminTemplateToggle templateId={t.id} isActive={t.is_active} />
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-400 pt-3 border-t border-gray-100">
              <span className="font-semibold text-[var(--color-primary)]">{formatPrice(t.price)}</span>
              <span>|</span>
              <span>{(t.category as string[]).join(", ")}</span>
              <span>|</span>
              <span>{usageMap[t.id] ?? 0}× dipakai</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
