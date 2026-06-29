// ============================================================
// components/TemplateCard.tsx
// Menampilkan satu template dalam grid katalog.
// Menerima data dari props — tidak ada hardcode di sini.
// ============================================================

import type { Template } from "@/types";
import { formatPrice, cn } from "@/lib/utils";
import Image from "next/image";

interface TemplateCardProps {
  template: Template;
}

const tierLabel: Record<Template["tier"], string> = {
  basic: "Basic",
  premium: "Premium",
  exclusive: "Exclusive",
};

const tierStyle: Record<Template["tier"], string> = {
  basic:     "bg-gray-500",
  premium:   "bg-primary",
  exclusive: "bg-yellow-600",
};

export default function TemplateCard({ template }: TemplateCardProps) {
  const { name, tier, description, price, previewImage, isBestSeller, isNew } = template;

  return (
    <article className="group rounded-2xl overflow-hidden shadow hover:shadow-xl transition-shadow duration-300 bg-white cursor-pointer">
      
      {/* Thumbnail */}
      <div className="relative h-64 bg-gray-100 overflow-hidden">
        <Image
          src={previewImage}
          alt={`Preview template ${name}`}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, 33vw"
          // Fallback jika gambar belum ada
          onError={() => {}}
        />

        {/* Badge tier */}
        <span
          className={cn(
            "absolute top-3 left-3 text-white text-xs font-medium px-3 py-1 rounded-full",
            tierStyle[tier]
          )}
        >
          {tierLabel[tier]}
        </span>

        {/* Badge kondisi */}
        {isBestSeller && (
          <span className="absolute top-3 right-3 bg-rose-500 text-white text-xs font-medium px-3 py-1 rounded-full">
            Best Seller
          </span>
        )}
        {isNew && !isBestSeller && (
          <span className="absolute top-3 right-3 bg-emerald-500 text-white text-xs font-medium px-3 py-1 rounded-full">
            Baru
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-base">{name}</h3>
        <p className="text-sm text-muted mt-1 line-clamp-2">{description}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="font-semibold text-primary">{formatPrice(price)}</span>
          <button
            className="text-xs border border-primary text-primary px-3 py-1.5 rounded-full
                       hover:bg-primary hover:text-white transition-colors duration-200"
          >
            Pilih Template
          </button>
        </div>
      </div>

    </article>
  );
}
