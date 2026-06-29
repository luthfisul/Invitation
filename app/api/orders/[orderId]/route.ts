// app/api/orders/[orderId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getOrderWithDetails }       from "@/lib/orders";
import { supabase }                  from "@/lib/supabase";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const order = await getOrderWithDetails(orderId);
    return NextResponse.json({ success: true, data: order });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Order tidak ditemukan";
    return NextResponse.json({ error: message }, { status: 404 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const body = await req.json();
    const { updates } = body;

    if (!updates || typeof updates !== "object") {
      return NextResponse.json({ error: "updates wajib diisi" }, { status: 400 });
    }

    const forbidden = ["template_id", "order_number", "user_id"];
    for (const key of forbidden) {
      if (key in updates) {
        return NextResponse.json({ error: `Field '${key}' tidak boleh diubah` }, { status: 403 });
      }
    }

    const { data, error } = await supabase
      .from("invitation_data")
      .update(updates)
      .eq("order_id", orderId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return NextResponse.json({ success: true, data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal update";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
