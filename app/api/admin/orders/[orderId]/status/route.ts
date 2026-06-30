// app/api/admin/orders/[orderId]/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser }            from "@/lib/auth";
import { supabase }                  from "@/lib/supabase";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
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

    const { error } = await (supabase as any)
      .from("orders")
      .update({ status })
      .eq("id", orderId);

    if (error) throw new Error(error.message);
    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
