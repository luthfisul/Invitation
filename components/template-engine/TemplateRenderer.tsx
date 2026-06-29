// ============================================================
// components/template-engine/TemplateRenderer.tsx
// Router komponen — pilih template yang tepat berdasarkan slug.
// Tambahkan case baru di sini setiap ada template baru.
// ============================================================

import type { InvitationRenderData } from "@/lib/template-engine";
import TemplateLuxuryGold    from "./templates/TemplateLuxuryGold";
import TemplateRusticBohemian from "./templates/TemplateRusticBohemian";
import TemplateCleanMinimal  from "./templates/TemplateCleanMinimal";

interface TemplateRendererProps {
  data:    InvitationRenderData;
  preview?: boolean; // true = tampil preview singkat, false = full page
}

export default function TemplateRenderer({
  data,
  preview = false,
}: TemplateRendererProps) {
  switch (data.templateSlug) {
    case "template-gold-01":
      return <TemplateLuxuryGold    data={data} preview={preview} />;
    case "template-rustic-01":
      return <TemplateRusticBohemian data={data} preview={preview} />;
    case "template-minimal-01":
    case "template-minimal-02":
      return <TemplateCleanMinimal  data={data} preview={preview} />;
    default:
      // Fallback: pakai Clean Minimal untuk template belum punya komponen
      return <TemplateCleanMinimal  data={data} preview={preview} />;
  }
}
