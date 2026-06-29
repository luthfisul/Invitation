// ============================================================
// data/templates.ts
// MASTER CATALOG — READ ONLY
// Jangan pernah dimodifikasi oleh user session / AI chatbot.
// Semua perubahan user disimpan di session/order terpisah.
// ============================================================

import type { Template } from "@/types";

export const templates: Template[] = [
  {
    id: "template-gold-01",
    name: "Luxury Gold",
    tier: "premium",
    category: ["modern", "royal"],
    price: 199000,
    description: "Tampilan mewah bernuansa emas dengan tipografi elegan. Cocok untuk pernikahan formal dan berkelas.",
    previewImage: "/templates/gold-01/preview.jpg",
    tags: ["elegant", "gold", "formal", "dark"],
    isBestSeller: true,
    defaultStyles: {
      primaryColor: "#C6A98C",
      secondaryColor: "#2B2B2B",
      fontHeading: "Playfair Display",
      fontBody: "Inter",
      backgroundColor: "#1A1A1A",
    },
  },
  {
    id: "template-rustic-01",
    name: "Rustic Bohemian",
    tier: "premium",
    category: ["rustic", "bohemian"],
    price: 179000,
    description: "Nuansa alam dengan elemen kayu dan floral. Hangat, personal, dan penuh karakter.",
    previewImage: "/templates/rustic-01/preview.jpg",
    tags: ["rustic", "boho", "nature", "warm"],
    isNew: true,
    defaultStyles: {
      primaryColor: "#8B6347",
      secondaryColor: "#F4EAE6",
      fontHeading: "Cormorant Garamond",
      fontBody: "Lato",
      backgroundColor: "#FDF6EE",
    },
  },
  {
    id: "template-minimal-01",
    name: "Clean Minimal",
    tier: "basic",
    category: ["minimalist", "modern"],
    price: 99000,
    description: "Desain bersih tanpa distraksi. Fokus pada informasi yang esensial dengan sentuhan modern.",
    previewImage: "/templates/minimal-01/preview.jpg",
    tags: ["minimal", "clean", "modern", "white"],
    defaultStyles: {
      primaryColor: "#333333",
      secondaryColor: "#888888",
      fontHeading: "DM Serif Display",
      fontBody: "Inter",
      backgroundColor: "#FFFFFF",
    },
  },
  {
    id: "template-floral-01",
    name: "Garden Floral",
    tier: "premium",
    category: ["floral", "modern"],
    price: 189000,
    description: "Dipenuhi ilustrasi bunga yang lembut. Romantis, feminin, dan penuh keindahan.",
    previewImage: "/templates/floral-01/preview.jpg",
    tags: ["floral", "romantic", "pink", "soft"],
    defaultStyles: {
      primaryColor: "#D4869A",
      secondaryColor: "#4A3040",
      fontHeading: "Great Vibes",
      fontBody: "Nunito",
      backgroundColor: "#FFF5F7",
    },
  },
  {
    id: "template-royal-01",
    name: "Royal Emerald",
    tier: "exclusive",
    category: ["royal", "modern"],
    price: 299000,
    description: "Kemewahan level tertinggi dengan palet hijau emerald dan aksen emas. Untuk momen paling berkesan.",
    previewImage: "/templates/royal-01/preview.jpg",
    tags: ["royal", "emerald", "luxury", "exclusive"],
    defaultStyles: {
      primaryColor: "#D4AF37",
      secondaryColor: "#F5F0E8",
      fontHeading: "Cinzel Decorative",
      fontBody: "EB Garamond",
      backgroundColor: "#1B3A2D",
    },
  },
  {
    id: "template-minimal-02",
    name: "Sage & Ivory",
    tier: "basic",
    category: ["minimalist", "floral"],
    price: 119000,
    description: "Perpaduan warna sage hijau dan ivory yang menenangkan. Simple namun tetap berkesan.",
    previewImage: "/templates/minimal-02/preview.jpg",
    tags: ["sage", "green", "minimal", "calm"],
    isNew: true,
    defaultStyles: {
      primaryColor: "#7D9E7A",
      secondaryColor: "#5C5C4A",
      fontHeading: "Cormorant Garamond",
      fontBody: "Inter",
      backgroundColor: "#F9F6F0",
    },
  },
];

// Helper: ambil template by ID (tanpa mutasi)
export function getTemplateById(id: string): Template | undefined {
  return templates.find((t) => t.id === id);
}

// Helper: filter by tier
export function getTemplatesByTier(tier: Template["tier"]): Template[] {
  return templates.filter((t) => t.tier === tier);
}

// Helper: filter by category
export function getTemplatesByCategory(category: Template["category"][number]): Template[] {
  return templates.filter((t) => t.category.includes(category));
}
