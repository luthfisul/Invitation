// ============================================================
// app/api/payment/webhook/route.ts
// POST /api/payment/webhook
// Menerima notifikasi dari Midtrans setelah payment
//
// PENTING: URL ini harus didaftarkan di Midtrans Dashboard:
// Settings → Configuration → Payment Notification URL
// Isi dengan: https://domain-kamu.vercel.app/api/payment/webhook
// ============================================================

import { NextRequest, NextResponse }         from "next/server";
import {
  verifyWebhookSignature,
  mapMidtransStatus,
  savePaymentFromWebhook,
  type WebhookPayload,
}                                            from "@/lib/midtrans";
import { generateInvitation }               from "@/lib/invitation-generator";
import { updateOrderStatus }                from "@/lib/orders";
import { supabase }                          from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const payload: WebhookPayload = await req.json();

    console.log("[Webhook] Received:", {
      order_id:           payload.order_id,
      transaction_status: payload.transaction_status,
      fraud_status:       payload.fraud_status,
    });

    // ── 1. Verifikasi signature ───────────────────────────────
    const isValid = await verifyWebhookSignature(
      payload.order_id,
      payload.status_code,
      payload.gross_amount,
      payload.signature_key
    );

    if (!isValid) {
      console.warn("[Webhook] Signature tidak valid — request ditolak");
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    // ── 2. Cari order di DB berdasarkan order_number ──────────
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, status")
      .eq("order_number", payload.order_id)  // order_id dari Midtrans = order_number kita
      .single();

    if (orderError || !order) {
      console.error("[Webhook] Order tidak ditemukan:", payload.order_id);
      return NextResponse.json({ error: "Order tidak ditemukan" }, { status: 404 });
    }

    // ── 3. Map status Midtrans → status kita ─────────────────
    const paymentStatus = mapMidtransStatus(
      payload.transaction_status,
      payload.fraud_status
    );

    console.log("[Webhook] Payment status:", paymentStatus);

    // ── 4. Simpan data payment ────────────────────────────────
    await savePaymentFromWebhook(order.id, payload, paymentStatus);

    // ── 5. Update order & trigger generate invitation ─────────
    if (paymentStatus === "paid" && order.status === "pending") {

      // Update status order → paid dulu
      await updateOrderStatus(order.id, "paid");

      // Generate undangan otomatis
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
      const result  = await generateInvitation(order.id, baseUrl);

      console.log("[Webhook] Undangan di-generate:", result.invitationUrl);

    } else if (paymentStatus === "failed") {
      await updateOrderStatus(order.id, "cancelled");
    }

    // ── 6. Selalu return 200 ke Midtrans ─────────────────────
    // Midtrans akan retry jika tidak dapat 200
    return NextResponse.json({ success: true });

  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook error";
    console.error("[Webhook Error]", message);
    // Tetap return 200 agar Midtrans tidak retry terus
    return NextResponse.json({ success: false, error: message });
  }
}
