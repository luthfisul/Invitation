// ============================================================
// lib/utils.ts
// Utility / helper functions yang dipakai di seluruh platform
// ============================================================

import { siteConfig } from "@/config/site";

/**
 * Format harga ke format Rupiah
 * @example formatPrice(199000) → "Rp 199.000"
 */
export function formatPrice(amount: number): string {
  return siteConfig.formatPrice(amount);
}

/**
 * Gabungkan class Tailwind secara kondisional
 * @example cn("px-4", isActive && "bg-primary")
 */
export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Generate Order ID unik berformat: ORDER-YYYY-XXXX
 * @example generateOrderId() → "ORDER-2026-0042"
 */
export function generateOrderId(sequence: number): string {
  const year = new Date().getFullYear();
  const padded = String(sequence).padStart(4, "0");
  return `ORDER-${year}-${padded}`;
}

/**
 * Generate slug URL dari nama pasangan
 * @example generateInvitationSlug("Raka", "Siti") → "raka-dan-siti"
 */
export function generateInvitationSlug(groom: string, bride: string): string {
  const clean = (name: string) =>
    name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  return `${clean(groom)}-dan-${clean(bride)}`;
}

/**
 * Format tanggal ke format Indonesia
 * @example formatDateID("2026-09-12") → "12 September 2026"
 */
export function formatDateID(isoDate: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(isoDate));
}

/**
 * Delay async (untuk simulasi loading, testing)
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
