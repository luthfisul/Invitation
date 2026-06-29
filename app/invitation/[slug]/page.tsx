// app/invitation/[slug]/page.tsx
import { notFound }            from "next/navigation";
import { supabase }            from "@/lib/supabase";
import { buildRenderData }     from "@/lib/template-engine";
import { incrementViewCount }  from "@/lib/invitation-generator";
import TemplateRenderer        from "@/components/template-engine/TemplateRenderer";
import MusicPlayer             from "@/components/invitation/MusicPlayer";
import type { InvitationDataRow, TemplateRow } from "@/types/database";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getInvitationBySlug(slug: string) {
  const { data, error } = await supabase
    .from("invitations")
    .select(`*, orders (*, invitation_data (*), templates (*))`)
    .eq("slug", slug)
    .eq("is_published", true)
    .single();
  if (error || !data) return null;
  return data;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const inv = await getInvitationBySlug(slug);
  if (!inv) return { title: "Undangan tidak ditemukan" };
  const order   = inv.orders   as Record<string, unknown>;
  const invData = order?.invitation_data as InvitationDataRow | null;
  const bride   = invData?.bride_full_name ?? "Mempelai Wanita";
  const groom   = invData?.groom_full_name ?? "Mempelai Pria";
  return {
    title: `Undangan Pernikahan ${bride} & ${groom}`,
    description: `Kami mengundang Anda hadir merayakan pernikahan ${bride} & ${groom}.`,
  };
}

export default async function InvitationPage({ params }: PageProps) {
  const { slug } = await params;
  const inv = await getInvitationBySlug(slug);
  if (!inv) notFound();

  const order    = inv.orders   as Record<string, unknown>;
  const invData  = order?.invitation_data as InvitationDataRow | null;
  const template = order?.templates      as TemplateRow | null;
  if (!invData || !template) notFound();

  incrementViewCount(slug).catch(() => {});
  const renderData = buildRenderData(template, invData);

  return (
    <div className="relative">
      {renderData.musicUrl && <MusicPlayer musicUrl={renderData.musicUrl} />}
      <TemplateRenderer data={renderData} preview={false} />
    </div>
  );
}
