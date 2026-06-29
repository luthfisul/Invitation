// ============================================================
// app/api/invitations/route.ts
// POST /api/invitations — generate & publish undangan
//
// Dipanggil otomatis oleh webhook payment (Phase 6),
// atau manual untuk testing sebelum payment aktif.
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { generateInvitation }        from "@/lib/invitation-generator";

export async function POST(req: NextRequest) {
  try {
    const body    = await req.json();
    const { orderId } = body;

    if (!orderId || typeof orderId !== "string") {
      return NextResponse.json(
        { error: "orderId wajib diisi" },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
      ?? `${req.nextUrl.protocol}//${req.nextUrl.host}`;

    const result = await generateInvitation(orderId, baseUrl);

    return NextResponse.json(
      {
        success: true,
        data: {
          slug:          result.slug,
          invitationUrl: result.invitationUrl,
          qrCodeUrl:     result.qrCodeUrl,
          publishedAt:   result.publishedAt,
        },
      },
      { status: 201 }
    );

  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal generate undangan";
    console.error("[POST /api/invitations]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
