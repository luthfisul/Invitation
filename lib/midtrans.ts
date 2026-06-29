// ============================================================
// lib/midtrans.ts
// Midtrans Payment Gateway — server-side only
//
// SETUP:
// npm install midtrans-client
//
// Docs: https://docs.midtrans.com
// Dashboard: https://dashboard.midtrans.com
// ============================================================

// @ts-expect-error — midtrans-client tidak punya official types
import Midtrans from "midtrans-client";
import { supabase } from "@/lib/supabase";

// ── Client instance (singleton) ───────────────────────────────

const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";

export const snap = new Midtrans.Snap({
  isProduction,
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.MIDTRANS_CLIENT_KEY!,
});

export const coreApi = new Midtrans.CoreApi({
  isProduction,
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.MIDTRANS_CLIENT_KEY!,
});

// ── Types ─────────────────────────────────────────────────────

export interface MidtransCustomer {
  firstName: string;
  lastName:  string;
  email:     string;
  phone?:    string;
}

export interface CreateTransactionParams {
  orderId:      string;     // UUID order dari DB
  orderNumber:  string;     // ORDER-2026-0001
  amount:       number;     // dalam IDR
  customer:     MidtransCustomer;
  templateName: string;
}

export interface MidtransTokenResult {
  token:       string;
  redirectUrl: string;
}

// ── Create Snap Token ─────────────────────────────────────────

/**
 * Buat Snap token untuk ditampilkan di frontend.
 * Token ini dipakai untuk membuka popup pembayaran Midtrans.
 */
export async function createSnapToken(
  params: CreateTransactionParams
): Promise<MidtransTokenResult> {
  const parameter = {
    transaction_details: {
      order_id:     params.orderNumber,  // Midtrans pakai order_number (string)
      gross_amount: params.amount,
    },
    item_details: [
      {
        id:       params.orderId,
        price:    params.amount,
        quantity: 1,
        name:     `Undangan Digital — ${params.templateName}`,
      },
    ],
    customer_details: {
      first_name: params.customer.firstName,
      last_name:  params.customer.lastName,
      email:      params.customer.email,
      phone:      params.customer.phone ?? "",
    },
    callbacks: {
      finish: `${process.env.NEXT_PUBLIC_SITE_URL}/order/${params.orderId}/success`,
    },
    expiry: {
      unit:     "hours",
      duration: 24,  // token expired dalam 24 jam
    },
    enabled_payments: [
      "qris",
      "gopay",
      "shopeepay",
      "bank_transfer",
      "bca_va",
      "bni_va",
      "bri_va",
      "mandiri_bill",
    ],
  };

  const result = await snap.createTransaction(parameter);
  return {
    token:       result.token,
    redirectUrl: result.redirect_url,
  };
}

// ── Verify Webhook Signature ──────────────────────────────────

/**
 * Verifikasi bahwa webhook benar-benar dari Midtrans.
 * Signature: SHA512(orderId + statusCode + grossAmount + serverKey)
 */
export async function verifyWebhookSignature(
  orderId:     string,
  statusCode:  string,
  grossAmount: string,
  signature:   string
): Promise<boolean> {
  const { createHash } = await import("crypto");

  const serverKey = process.env.MIDTRANS_SERVER_KEY!;
  const expected  = createHash("sha512")
    .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
    .digest("hex");

  return expected === signature;
}

// ── Process Webhook Notification ─────────────────────────────

export interface WebhookPayload {
  order_id:           string;   // order_number kita (ORDER-2026-0001)
  transaction_id:     string;
  transaction_status: string;
  fraud_status:       string;
  payment_type:       string;
  gross_amount:       string;
  status_code:        string;
  signature_key:      string;
}

/**
 * Status mapping Midtrans → status payment kita
 */
export function mapMidtransStatus(
  transactionStatus: string,
  fraudStatus:       string
): "paid" | "pending" | "failed" {
  if (
    transactionStatus === "capture" && fraudStatus === "accept" ||
    transactionStatus === "settlement"
  ) {
    return "paid";
  }
  if (
    transactionStatus === "cancel"  ||
    transactionStatus === "deny"    ||
    transactionStatus === "expire"  ||
    fraudStatus === "deny"
  ) {
    return "failed";
  }
  return "pending";
}

// ── Save Payment to DB ────────────────────────────────────────

/**
 * Simpan data payment ke tabel payments berdasarkan webhook.
 * Dipanggil dari webhook handler setelah verifikasi.
 */
export async function savePaymentFromWebhook(
  dbOrderId:   string,    // UUID dari tabel orders
  payload:     WebhookPayload,
  status:      "paid" | "pending" | "failed"
): Promise<void> {
  const method = resolvePaymentMethod(payload.payment_type);

  const { error } = await supabase
    .from("payments")
    .upsert(
      {
        order_id:         dbOrderId,
        method,
        status,
        amount:           parseInt(payload.gross_amount, 10),
        transaction_id:   payload.transaction_id,
        paid_at:          status === "paid" ? new Date().toISOString() : null,
        gateway_response: payload as unknown as Record<string, unknown>,
      },
      { onConflict: "order_id" }
    );

  if (error) throw new Error(`savePaymentFromWebhook: ${error.message}`);
}

function resolvePaymentMethod(
  paymentType: string
): "qris" | "bank_transfer" | "ewallet" {
  if (paymentType === "qris")                          return "qris";
  if (["gopay", "shopeepay", "dana"].includes(paymentType)) return "ewallet";
  return "bank_transfer";
}
