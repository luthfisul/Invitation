// ============================================================
// config/site.ts
// Global site configuration — ubah di sini untuk branding
// ============================================================

export const siteConfig = {
  name: "EverAfter",
  tagline: "Undangan Digital yang Elegan & Instan",
  description:
    "Platform undangan pernikahan digital berbasis AI. Pilih template, sesuaikan lewat chat, dan bagikan dalam hitungan menit.",
  url: "https://invitation-lemon-theta.vercel.app",
  locale: "id-ID",
  currency: "IDR",

  contact: {
    email: "hello@everafter.id",
    whatsapp: "628123456789",
    instagram: "@everafter.id",
  },

  // Digunakan untuk format harga di seluruh app
  formatPrice: (amount: number): string =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount),
} as const;
