// ============================================================
// app/api/payment/midtrans/route.ts
// POST /api/payment/midtrans
// Buat Snap token untuk ditampilkan di frontend
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { createSnapToken }           from "@/lib/midtrans";
import { getOrderWithDetails }       from "@/lib/orders";
import { supabase }                  from "@/lib/supabase";
import type { InvitationDataRow }    from "@/types/database";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, customerEmail, customerName } = body;

    // ── Validasi input ────────────────────────────────────────
    if (!orderId || !customerEmail || !customerName) {
      return NextResponse.json(
        { error: "orderId, customerEmail, dan customerName wajib diisi" },
        { status: 400 }
      );
    }

    // ── Ambil data order ──────────────────────────────────────
    const order = await getOrderWithDetails(orderId);

    if (order.status !== "pending") {
      return NextResponse.json(
        { error: `Order tidak bisa dibayar. Status saat ini: ${order.status}` },
        { status: 400 }
      );
    }

    // ── Ambil nama mempelai untuk deskripsi ───────────────────
    const invData = order.invitation_data as InvitationDataRow | null;
    const nameParts = customerName.trim().split(" ");

    // ── Buat Snap token ───────────────────────────────────────
    const result = await createSnapToken({
      orderId,
      orderNumber:  order.order_number,
      amount:       order.total_amount,
      templateName: order.templates?.name ?? "Template",
      customer: {
        firstName: nameParts[0],
        lastName:  nameParts.slice(1).join(" ") || "-",
        email:     customerEmail,
      },
    });

    // ── Simpan snap_token ke orders (opsional, untuk audit) ───
    await supabase
      .from("settings")
      .upsert(
        { key: `snap_token_${orderId}`, value: result.token, description: "Midtrans Snap Token" },
        { onConflict: "key" }
      );

    return NextResponse.json({
      success:     true,
      snapToken:   result.token,
      redirectUrl: result.redirectUrl,
      orderNumber: order.order_number,
      amount:      order.total_amount,
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal membuat transaksi";
    console.error("[POST /api/payment/midtrans]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
