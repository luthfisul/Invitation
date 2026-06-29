// ============================================================
// app/api/orders/[orderId]/route.ts
// API Route: GET /api/orders/:orderId — detail satu order
//            PATCH /api/orders/:orderId — update invitation data
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { getOrderWithDetails } from "@/lib/orders";
import { supabase } from "@/lib/supabase";

interface Params {
  params: { orderId: string };
}

// ── GET /api/orders/:orderId ─────────────────────────────────
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const order = await getOrderWithDetails(params.orderId);
    return NextResponse.json({ success: true, data: order });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Order tidak ditemukan";
    return NextResponse.json({ error: message }, { status: 404 });
  }
}

// ── PATCH /api/orders/:orderId ───────────────────────────────
// Dipakai oleh AI chatbot untuk update invitation_data
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const body = await req.json();
    const { updates } = body;

    if (!updates || typeof updates !== "object") {
      return NextResponse.json(
        { error: "updates wajib diisi" },
        { status: 400 }
      );
    }

    // GUARDRAIL: pastikan tidak ada field berbahaya
    const forbidden = ["template_id", "order_number", "user_id"];
    for (const key of forbidden) {
      if (key in updates) {
        return NextResponse.json(
          { error: `Field '${key}' tidak boleh diubah` },
          { status: 403 }
        );
      }
    }

    const { data, error } = await supabase
      .from("invitation_data")
      .update(updates)
      .eq("order_id", params.orderId)
      .select()
      .single();

    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true, data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal update";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
