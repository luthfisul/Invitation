// ============================================================
// components/order/TemplateCatalog.tsx
// Grid katalog interaktif — klik template → buat order
// ============================================================

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { TemplateRow } from "@/types/database";
import { formatPrice, cn } from "@/lib/utils";
import Image from "next/image";

interface TemplateCatalogProps {
  templates: TemplateRow[];
}

type FilterOption = "all" | string;

const tierLabel: Record<string, string> = {
  basic:     "Basic",
  premium:   "Premium",
  exclusive: "Exclusive",
};

const tierStyle: Record<string, string> = {
  basic:     "bg-gray-500",
  premium:   "bg-[var(--color-primary)]",
  exclusive: "bg-yellow-600",
};

export default function TemplateCatalog({ templates }: TemplateCatalogProps) {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterOption>("all");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Build filter dari data aktual
  const allCategories = Array.from(
    new Set(templates.flatMap((t) => t.category))
  ).sort();

  const filterOptions = [
    { label: "Semua", value: "all" },
    ...allCategories.map((c) => ({
      label: c.charAt(0).toUpperCase() + c.slice(1),
      value: c,
    })),
  ];

  const filtered =
    activeFilter === "all"
      ? templates
      : templates.filter((t) => t.category.includes(activeFilter));

  // Simulasi: pakai guest userId sementara (Phase 7 akan pakai auth)
  async function handleSelectTemplate(template: TemplateRow) {
    setLoadingId(template.id);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateSlug: template.slug,
          userId: "guest-user-placeholder", // akan diganti auth di Phase 7
        }),
      });

      const json = await res.json();

      if (!res.ok) throw new Error(json.error);

      // Redirect ke halaman order / chatbot customization
      router.push(`/order/${json.data.orderId}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal membuat order");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div>
      {/* Filter Pills */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {filterOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setActiveFilter(opt.value)}
            className={cn(
              "px-4 py-2 rounded-full text-sm border transition-colors duration-200",
              activeFilter === opt.value
                ? "bg-primary text-white border-primary"
                : "border-gray-300 text-gray-600 hover:border-primary hover:text-primary"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className="text-center text-muted py-20">
          Tidak ada template untuk kategori ini.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filtered.map((template) => (
            <article
              key={template.id}
              className="group rounded-2xl overflow-hidden shadow hover:shadow-xl
                         transition-shadow duration-300 bg-white"
            >
              {/* Thumbnail */}
              <div className="relative h-64 bg-gray-100 overflow-hidden">
                {template.preview_image ? (
                  <Image
                    src={template.preview_image}
                    alt={`Preview ${template.name}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                ) : (
                  // Placeholder warna dari template styles
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{
                      backgroundColor:
                        (template.default_styles as Record<string, string>)
                          ?.backgroundColor ?? "#F3F4F6",
                    }}
                  >
                    <span className="text-white/50 text-sm">Preview</span>
                  </div>
                )}

                {/* Badge tier */}
                <span
                  className={cn(
                    "absolute top-3 left-3 text-white text-xs font-medium px-3 py-1 rounded-full",
                    tierStyle[template.tier] ?? "bg-gray-500"
                  )}
                >
                  {tierLabel[template.tier]}
                </span>

                {/* Badge kondisi */}
                {template.is_best_seller && (
                  <span className="absolute top-3 right-3 bg-rose-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                    Best Seller
                  </span>
                )}
                {template.is_new && !template.is_best_seller && (
                  <span className="absolute top-3 right-3 bg-emerald-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                    Baru
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-semibold text-base">{template.name}</h3>
                <p className="text-sm text-muted mt-1 line-clamp-2">
                  {template.description}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-semibold text-primary">
                    {formatPrice(template.price)}
                  </span>
                  <button
                    onClick={() => handleSelectTemplate(template)}
                    disabled={loadingId === template.id}
                    className={cn(
                      "text-xs border border-primary text-primary px-3 py-1.5 rounded-full",
                      "hover:bg-primary hover:text-white transition-colors duration-200",
                      "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                  >
                    {loadingId === template.id ? "Memproses..." : "Pilih Template"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
