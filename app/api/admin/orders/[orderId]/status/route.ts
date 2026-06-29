// ============================================================
// app/api/admin/orders/[orderId]/status/route.ts
// PATCH /api/admin/orders/:orderId/status — admin only
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser }            from "@/lib/auth";
import { supabase }                  from "@/lib/supabase";

interface Params { params: { orderId: string } }

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const user        = await getCurrentUser();
    const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map(e => e.trim());
    if (!user || !adminEmails.includes(user.email ?? "")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { status } = await req.json();
    const valid = ["pending","paid","processing","published","cancelled"];
    if (!valid.includes(status)) {
      return NextResponse.json({ error: "Status tidak valid" }, { status: 400 });
    }

    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", params.orderId);

    if (error) throw new Error(error.message);
    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
