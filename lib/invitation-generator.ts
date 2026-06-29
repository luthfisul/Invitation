// ============================================================
// lib/invitation-generator.ts
// Phase 5 — Invitation Generator
//
// Tanggung jawab:
// 1. Generate slug URL unik dari nama mempelai
// 2. Publish undangan ke tabel invitations
// 3. Generate QR Code URL
// 4. Kirim notifikasi ke customer (email/WA — stub Phase 11)
// ============================================================

import { supabase }               from "@/lib/supabase";
import { generateInvitationSlug } from "@/lib/utils";
import { updateOrderStatus }      from "@/lib/orders";
import type { InvitationRow }     from "@/types/database";

// ── Types ────────────────────────────────────────────────────

export interface GenerateResult {
  slug:           string;
  invitationUrl:  string;
  qrCodeUrl:      string;
  publishedAt:    string;
}

// ── Core: Generate & Publish ─────────────────────────────────

/**
 * Entry point utama Phase 5.
 * Dipanggil otomatis setelah pembayaran sukses (Phase 6).
 * Bisa juga dipanggil manual via API untuk testing.
 */
export async function generateInvitation(
  orderId: string,
  baseUrl: string = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
): Promise<GenerateResult> {

  // 1. Ambil data mempelai dari invitation_data
  const { data: invData, error: fetchError } = await supabase
    .from("invitation_data")
    .select("groom_full_name, bride_full_name")
    .eq("order_id", orderId)
    .single();

  if (fetchError || !invData) {
    throw new Error(`Invitation data tidak ditemukan untuk order: ${orderId}`);
  }

  if (!invData.groom_full_name || !invData.bride_full_name) {
    throw new Error("Nama mempelai belum diisi. Harap lengkapi data terlebih dahulu.");
  }

  // 2. Generate slug dari nama mempelai
  const baseSlug = generateInvitationSlug(
    invData.groom_full_name,
    invData.bride_full_name
  );

  // 3. Pastikan slug unik — tambah suffix jika sudah ada
  const slug = await ensureUniqueSlug(baseSlug, orderId);

  // 4. Build URL
  const invitationUrl = `${baseUrl}/invitation/${slug}`;

  // 5. Generate QR Code URL (pakai qr-server.com — tidak perlu install)
  const qrCodeUrl = buildQrCodeUrl(invitationUrl);

  // 6. Upsert ke tabel invitations
  const publishedAt = new Date().toISOString();

  const { error: pubError } = await supabase
    .from("invitations")
    .upsert(
      {
        order_id:     orderId,
        slug,
        is_published: true,
        published_at: publishedAt,
        qr_code_url:  qrCodeUrl,
        view_count:   0,
      },
      { onConflict: "order_id" }
    );

  if (pubError) {
    throw new Error(`Gagal publish undangan: ${pubError.message}`);
  }

  // 7. Update status order → published
  await updateOrderStatus(orderId, "published");

  // 8. Kirim notifikasi (stub — akan dikembangkan Phase 11)
  await sendDeliveryNotification(orderId, invitationUrl, qrCodeUrl).catch(
    (err) => console.warn("Notifikasi gagal (non-fatal):", err)
  );

  return { slug, invitationUrl, qrCodeUrl, publishedAt };
}

// ── Slug Uniqueness ───────────────────────────────────────────

/**
 * Pastikan slug belum dipakai order lain.
 * Jika sudah ada, tambah suffix pendek: raka-dan-siti-x3k2
 */
async function ensureUniqueSlug(
  baseSlug: string,
  currentOrderId: string
): Promise<string> {
  const { data: existing } = await supabase
    .from("invitations")
    .select("slug, order_id")
    .eq("slug", baseSlug)
    .single();

  // Tidak ada → slug aman dipakai
  if (!existing) return baseSlug;

  // Slug milik order yang sama (re-generate) → aman
  if (existing.order_id === currentOrderId) return baseSlug;

  // Slug milik order lain → tambah suffix
  const suffix = Date.now().toString(36).slice(-4); // e.g. "x3k2"
  return `${baseSlug}-${suffix}`;
}

// ── QR Code ──────────────────────────────────────────────────

/**
 * Build URL QR Code menggunakan qr-server.com (free, no API key).
 * Format: https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=URL
 */
export function buildQrCodeUrl(targetUrl: string, size = 300): string {
  const params = new URLSearchParams({
    size:  `${size}x${size}`,
    data:  targetUrl,
    color: "2B2B2B",  // warna QR (hex tanpa #)
    bgcolor: "FFFFFF",
    format: "png",
    margin: "10",
  });
  return `https://api.qrserver.com/v1/create-qr-code/?${params.toString()}`;
}

// ── Notification Stub ─────────────────────────────────────────

/**
 * Stub notifikasi — akan diimplementasi penuh di Phase 11.
 * Saat ini hanya log ke console.
 */
async function sendDeliveryNotification(
  orderId:        string,
  invitationUrl:  string,
  qrCodeUrl:      string
): Promise<void> {
  // TODO Phase 11: integrasi Resend (email) + WhatsApp API
  console.log(`[Phase 11 stub] Notifikasi untuk order ${orderId}:`);
  console.log(`  URL: ${invitationUrl}`);
  console.log(`  QR:  ${qrCodeUrl}`);
}

// ── Helper: Get Published Invitation ─────────────────────────

/**
 * Ambil detail undangan yang sudah publish berdasarkan orderId.
 * Dipakai di dashboard customer.
 */
export async function getPublishedByOrderId(
  orderId: string
): Promise<InvitationRow | null> {
  const { data, error } = await supabase
    .from("invitations")
    .select("*")
    .eq("order_id", orderId)
    .eq("is_published", true)
    .single();

  if (error) return null;
  return data;
}

/**
 * Tambah view count saat undangan dibuka.
 * Dipanggil dari halaman /invitation/[slug].
 */
export async function incrementViewCount(slug: string): Promise<void> {
  // Pakai RPC atau update biasa
  const { data } = await supabase
    .from("invitations")
    .select("view_count")
    .eq("slug", slug)
    .single();

  if (!data) return;

  await supabase
    .from("invitations")
    .update({ view_count: (data.view_count ?? 0) + 1 })
    .eq("slug", slug);
}
