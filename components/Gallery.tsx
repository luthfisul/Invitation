// ============================================================
// components/Gallery.tsx
// Section katalog template — data-driven dari templates.ts
// ============================================================

"use client";

import { useState } from "react";
import TemplateCard from "./TemplateCard";
import { templates } from "@/data/templates";
import type { Template, TemplateCategory } from "@/types";

type FilterOption = "all" | TemplateCategory;

const filterOptions: { label: string; value: FilterOption }[] = [
  { label: "Semua",     value: "all" },
  { label: "Modern",    value: "modern" },
  { label: "Rustic",    value: "rustic" },
  { label: "Minimalis", value: "minimalist" },
  { label: "Floral",    value: "floral" },
  { label: "Royal",     value: "royal" },
  { label: "Bohemian",  value: "bohemian" },
];

export default function Gallery() {
  const [activeFilter, setActiveFilter] = useState<FilterOption>("all");

  const filtered: Template[] =
    activeFilter === "all"
      ? templates
      : templates.filter((t) => t.category.includes(activeFilter as TemplateCategory));

  return (
    <section id="gallery" className="py-20">
      <div className="max-w-7xl mx-auto px-6">

        {/* Heading */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-semibold mb-2">Jelajahi Template Kami</h2>
          <p className="text-muted text-sm">
            Pilih desain yang paling sesuai dengan kepribadian dan tema pernikahanmu.
          </p>
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setActiveFilter(opt.value)}
              className={[
                "px-4 py-2 rounded-full text-sm border transition-colors duration-200",
                activeFilter === opt.value
                  ? "bg-primary text-white border-primary"
                  : "border-gray-300 text-gray-600 hover:border-primary hover:text-primary",
              ].join(" ")}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filtered.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted py-20">
            Tidak ada template untuk kategori ini.
          </p>
        )}

      </div>
    </section>
  );
}
