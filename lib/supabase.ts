// ============================================================
// lib/supabase.ts
// Supabase client — satu instance untuk seluruh aplikasi
//
// SETUP:
// 1. Install: npm install @supabase/supabase-js
// 2. Buat file .env.local di root project:
//    NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
//    NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...
// ============================================================

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables.\n" +
    "Pastikan NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY ada di .env.local"
  );
}

// Client utama — dipakai di seluruh aplikasi
export const supabase = createClient(supabaseUrl, supabaseAnonKey);


// ============================================================
// HELPER FUNCTIONS — Templates (Master Catalog)
// ============================================================

/**
 * Ambil semua template aktif dari database
 */
export async function getTemplates() {
  const { data, error } = await supabase
    .from("templates")
    .select("*")
    .eq("is_active", true)
    .order("price", { ascending: true });

  if (error) throw new Error(`getTemplates: ${error.message}`);
  return data;
}

/**
 * Ambil satu template berdasarkan slug
 */
export async function getTemplateBySlug(slug: string) {
  const { data, error } = await supabase
    .from("templates")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) throw new Error(`getTemplateBySlug: ${error.message}`);
  return data;
}


// ============================================================
// HELPER FUNCTIONS — Orders
// ============================================================

/**
 * Generate order number berikutnya: ORDER-2026-0001
 */
async function generateOrderNumber(): Promise<string> {
  const year = new Date().getFullYear();

  // Ambil sequence counter dari settings
  const { data, error } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "order_sequence")
    .single();

  if (error) throw new Error(`generateOrderNumber: ${error.message}`);

  const current = Number(data.value) + 1;

  // Update counter
  await supabase
    .from("settings")
    .update({ value: current })
    .eq("key", "order_sequence");

  return `ORDER-${year}-${String(current).padStart(4, "0")}`;
}

/**
 * Buat order baru
 */
export async function createOrder(params: {
  userId: string;
  templateSlug: string;
}) {
  // 1. Ambil template
  const template = await getTemplateBySlug(params.templateSlug);

  // 2. Generate order number
  const orderNumber = await generateOrderNumber();

  // 3. Buat order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      user_id: params.userId,
      template_id: template.id,
      status: "pending",
      total_amount: template.price,
    })
    .select()
    .single();

  if (orderError) throw new Error(`createOrder: ${orderError.message}`);

  // 4. Buat invitation_data kosong untuk order ini
  const { error: dataError } = await supabase
    .from("invitation_data")
    .insert({
      order_id: order.id,
      bride_full_name: "",
      groom_full_name: "",
      rsvp_enabled: true,
    });

  if (dataError) throw new Error(`createOrder (invitation_data): ${dataError.message}`);

  return order;
}

/**
 * Ambil order beserta invitation_data-nya
 */
export async function getOrderWithData(orderId: string) {
  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      invitation_data (*),
      templates (*)
    `)
    .eq("id", orderId)
    .single();

  if (error) throw new Error(`getOrderWithData: ${error.message}`);
  return data;
}


// ============================================================
// HELPER FUNCTIONS — Invitation Data (AI Chatbot updates ini)
// ============================================================

/**
 * Update data undangan — HANYA boleh update invitation_data,
 * TIDAK BOLEH menyentuh tabel templates.
 *
 * Fungsi ini dipanggil oleh AI chatbot saat user minta revisi.
 */
export async function updateInvitationData(
  orderId: string,
  updates: Partial<{
    bride_full_name:  string;
    groom_full_name:  string;
    bride_nick_name:  string;
    groom_nick_name:  string;
    event_date:       string;
    event_time:       string;
    venue_name:       string;
    venue_address:    string;
    venue_maps_url:   string;
    story:            string;
    music_url:        string;
    rsvp_enabled:     boolean;
    gallery_images:   string[];
    custom_styles:    Record<string, string>; // ← font, warna, dll
  }>
) {
  const { data, error } = await supabase
    .from("invitation_data")
    .update(updates)
    .eq("order_id", orderId)
    .select()
    .single();

  if (error) throw new Error(`updateInvitationData: ${error.message}`);
  return data;
}

/**
 * Update hanya custom_styles — dipanggil saat AI ganti warna/font
 * @example updateCustomStyles(orderId, { primaryColor: "#FFB6C1", fontHeading: "Great Vibes" })
 */
export async function updateCustomStyles(
  orderId: string,
  styles: Record<string, string>
) {
  // Merge dengan styles yang sudah ada (tidak overwrite semua)
  const { data: existing } = await supabase
    .from("invitation_data")
    .select("custom_styles")
    .eq("order_id", orderId)
    .single();

  const merged = {
    ...(existing?.custom_styles as Record<string, string> ?? {}),
    ...styles,
  };

  return updateInvitationData(orderId, { custom_styles: merged });
}


// ============================================================
// HELPER FUNCTIONS — Guest Book
// ============================================================

/**
 * Tambah ucapan tamu
 */
export async function addGuestBookEntry(params: {
  orderId:     string;
  guestName:   string;
  message?:    string;
  attendance?: "hadir" | "tidak_hadir" | "mungkin";
  guestCount?: number;
}) {
  const { data, error } = await supabase
    .from("guest_books")
    .insert({
      order_id:    params.orderId,
      guest_name:  params.guestName,
      message:     params.message,
      attendance:  params.attendance,
      guest_count: params.guestCount ?? 1,
    })
    .select()
    .single();

  if (error) throw new Error(`addGuestBookEntry: ${error.message}`);
  return data;
}

/**
 * Ambil semua ucapan untuk satu undangan
 */
export async function getGuestBook(orderId: string) {
  const { data, error } = await supabase
    .from("guest_books")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`getGuestBook: ${error.message}`);
  return data;
}


// ============================================================
// HELPER FUNCTIONS — Published Invitation
// ============================================================

/**
 * Ambil undangan publik berdasarkan slug URL
 * Dipakai di halaman: domain.com/invitation/raka-dan-siti
 */
export async function getPublishedInvitation(slug: string) {
  const { data, error } = await supabase
    .from("invitations")
    .select(`
      *,
      orders (
        *,
        invitation_data (*),
        templates (*)
      )
    `)
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (error) throw new Error(`getPublishedInvitation: ${error.message}`);

  // Tambah view count
  await supabase
    .from("invitations")
    .update({ view_count: (data.view_count ?? 0) + 1 })
    .eq("slug", slug);

  return data;
}
