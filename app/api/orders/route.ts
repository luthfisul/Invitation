// ============================================================
// app/api/orders/route.ts
// API Route: POST /api/orders — buat order baru
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { createOrder } from "@/lib/orders";
import { supabase } from "@/lib/supabase";

// ── POST /api/orders ─────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { templateSlug, userId } = body;

    // Validasi input
    if (!templateSlug || typeof templateSlug !== "string") {
      return NextResponse.json(
        { error: "templateSlug wajib diisi" },
        { status: 400 }
      );
    }

    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { error: "userId wajib diisi" },
        { status: 400 }
      );
    }

    // Buat order
    const order = await createOrder({ userId, templateSlug });

    return NextResponse.json(
      {
        success: true,
        data: {
          orderId:     order.id,
          orderNumber: order.order_number,
          status:      order.status,
          totalAmount: order.total_amount,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ── GET /api/orders?userId=xxx ───────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId wajib diisi" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("orders")
      .select(`*, invitation_data (*), templates (id, name, slug, tier, preview_image)`)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true, data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
