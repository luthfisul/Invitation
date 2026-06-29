// ============================================================
// lib/orders.ts
// Business logic untuk Order System — Phase 3
// Semua operasi order terpusat di sini
// ============================================================

import { supabase } from "@/lib/supabase";
import { generateInvitationSlug } from "@/lib/utils";
import type { OrderRow, InvitationDataRow, TemplateRow } from "@/types/database";

// ── Types ────────────────────────────────────────────────────

export interface CreateOrderParams {
  userId:       string;
  templateSlug: string;
}

export interface OrderWithDetails extends OrderRow {
  invitation_data: InvitationDataRow | null;
  templates:       TemplateRow | null;
}

// ── Generate Order Number ────────────────────────────────────

/**
 * Generate order number sequential: ORDER-2026-0001
 * Menggunakan counter di tabel settings (atomic)
 */
async function generateOrderNumber(): Promise<string> {
  const year = new Date().getFullYear();

  const { data, error } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "order_sequence")
    .single();

  if (error) throw new Error(`generateOrderNumber: ${error.message}`);

  const next = Number(data.value) + 1;

  await supabase
    .from("settings")
    .update({ value: next })
    .eq("key", "order_sequence");

  return `ORDER-${year}-${String(next).padStart(4, "0")}`;
}

// ── Create Order ─────────────────────────────────────────────

/**
 * Buat order baru dari template yang dipilih user.
 * Otomatis membuat invitation_data kosong.
 */
export async function createOrder(
  params: CreateOrderParams
): Promise<OrderRow> {
  // 1. Ambil template
  const { data: template, error: tError } = await supabase
    .from("templates")
    .select("*")
    .eq("slug", params.templateSlug)
    .eq("is_active", true)
    .single();

  if (tError || !template) {
    throw new Error(`Template tidak ditemukan: ${params.templateSlug}`);
  }

  // 2. Generate order number
  const orderNumber = await generateOrderNumber();

  // 3. Buat order
  const { data: order, error: oError } = await supabase
    .from("orders")
    .insert({
      order_number:  orderNumber,
      user_id:       params.userId,
      template_id:   template.id,
      status:        "pending",
      total_amount:  template.price,
    })
    .select()
    .single();

  if (oError || !order) {
    throw new Error(`Gagal membuat order: ${oError?.message}`);
  }

  // 4. Buat invitation_data kosong
  const { error: idError } = await supabase
    .from("invitation_data")
    .insert({
      order_id:        order.id,
      bride_full_name: "",
      groom_full_name: "",
      rsvp_enabled:    true,
      custom_styles:   template.default_styles, // inherit dari template
    });

  if (idError) {
    throw new Error(`Gagal membuat invitation data: ${idError.message}`);
  }

  return order;
}

// ── Get Order ────────────────────────────────────────────────

/**
 * Ambil order lengkap dengan invitation_data dan template
 */
export async function getOrderWithDetails(
  orderId: string
): Promise<OrderWithDetails> {
  const { data, error } = await supabase
    .from("orders")
    .select(`*, invitation_data (*), templates (*)`)
    .eq("id", orderId)
    .single();

  if (error || !data) {
    throw new Error(`Order tidak ditemukan: ${orderId}`);
  }

  return data as OrderWithDetails;
}

/**
 * Ambil semua order milik satu user
 */
export async function getUserOrders(userId: string): Promise<OrderWithDetails[]> {
  const { data, error } = await supabase
    .from("orders")
    .select(`*, invitation_data (*), templates (*)`)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`getUserOrders: ${error.message}`);
  return (data ?? []) as OrderWithDetails[];
}

// ── Update Order Status ───────────────────────────────────────

export async function updateOrderStatus(
  orderId: string,
  status: OrderRow["status"]
): Promise<void> {
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId);

  if (error) throw new Error(`updateOrderStatus: ${error.message}`);
}

// ── Publish Invitation ────────────────────────────────────────

/**
 * Publish undangan setelah pembayaran sukses.
 * Otomatis generate slug URL dari nama mempelai.
 */
export async function publishInvitation(orderId: string): Promise<string> {
  // 1. Ambil data undangan
  const { data: invData, error: iError } = await supabase
    .from("invitation_data")
    .select("groom_full_name, bride_full_name")
    .eq("order_id", orderId)
    .single();

  if (iError || !invData) {
    throw new Error("Invitation data tidak ditemukan");
  }

  // 2. Generate slug
  let slug = generateInvitationSlug(
    invData.groom_full_name,
    invData.bride_full_name
  );

  // 3. Pastikan slug unik — tambah suffix jika perlu
  const { data: existing } = await supabase
    .from("invitations")
    .select("slug")
    .eq("slug", slug)
    .single();

  if (existing) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  // 4. Buat / update record invitations
  const { error: pubError } = await supabase
    .from("invitations")
    .upsert({
      order_id:     orderId,
      slug,
      is_published: true,
      published_at: new Date().toISOString(),
    });

  if (pubError) throw new Error(`publishInvitation: ${pubError.message}`);

  // 5. Update status order
  await updateOrderStatus(orderId, "published");

  return slug;
}
