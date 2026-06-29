// ============================================================
// app/invitation/[slug]/page.tsx  [UPDATED Phase 5]
// Halaman undangan publik — domain.com/invitation/raka-dan-siti
// Update: tambah view count tracking & music player
// ============================================================

import { notFound }            from "next/navigation";
import { supabase }            from "@/lib/supabase";
import { buildRenderData }     from "@/lib/template-engine";
import { incrementViewCount }  from "@/lib/invitation-generator";
import TemplateRenderer        from "@/components/template-engine/TemplateRenderer";
import MusicPlayer             from "@/components/invitation/MusicPlayer";
import type { InvitationDataRow, TemplateRow } from "@/types/database";
import type { Metadata }       from "next";

interface PageProps {
  params: { slug: string };
}

async function getInvitationBySlug(slug: string) {
  const { data, error } = await supabase
    .from("invitations")
    .select(`
      *,
      orders (
        *,
        invitation_data (*),
        templates (*)
      )
    `)
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (error || !data) return null;
  return data;
}

// ── Dynamic Metadata ─────────────────────────────────────────

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const inv = await getInvitationBySlug(params.slug);
  if (!inv) return { title: "Undangan tidak ditemukan" };

  const order   = inv.orders   as Record<string, unknown>;
  const invData = order?.invitation_data as InvitationDataRow | null;

  const bride = invData?.bride_full_name ?? "Mempelai Wanita";
  const groom = invData?.groom_full_name ?? "Mempelai Pria";
  const date  = invData?.event_date
    ? new Date(invData.event_date).toLocaleDateString("id-ID", {
        day: "numeric", month: "long", year: "numeric",
      })
    : "";

  return {
    title:       `Undangan Pernikahan ${bride} & ${groom}`,
    description: `Kami mengundang Anda hadir merayakan pernikahan ${bride} & ${groom}${date ? ` pada ${date}` : ""}.`,
    openGraph: {
      title:       `${bride} & ${groom} 💍`,
      description: `Kami mengundang Anda untuk hadir merayakan momen bahagia kami.`,
      type:        "website",
    },
  };
}

// ── Page ─────────────────────────────────────────────────────

export default async function InvitationPage({ params }: PageProps) {
  const inv = await getInvitationBySlug(params.slug);
  if (!inv) notFound();

  const order    = inv.orders   as Record<string, unknown>;
  const invData  = order?.invitation_data as InvitationDataRow | null;
  const template = order?.templates      as TemplateRow | null;

  if (!invData || !template) notFound();

  // Tambah view count (fire & forget)
  incrementViewCount(params.slug).catch(() => {});

  const renderData = buildRenderData(template, invData);

  return (
    <div className="relative">
      {/* Musik background — auto play saat user interaksi pertama */}
      {renderData.musicUrl && (
        <MusicPlayer musicUrl={renderData.musicUrl} />
      )}

      {/* Render template undangan */}
      <TemplateRenderer data={renderData} preview={false} />
    </div>
  );
}
