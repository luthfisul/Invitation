// ============================================================
// app/api/invitations/[slug]/route.ts
// GET /api/invitations/:slug — cek status undangan
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { supabase }                  from "@/lib/supabase";

interface Params {
  params: { slug: string };
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { data, error } = await supabase
      .from("invitations")
      .select(`
        slug,
        is_published,
        published_at,
        view_count,
        qr_code_url,
        orders (
          order_number,
          status,
          total_amount,
          invitation_data ( bride_full_name, groom_full_name, event_date )
        )
      `)
      .eq("slug", params.slug)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Undangan tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data });

  } catch (err) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
