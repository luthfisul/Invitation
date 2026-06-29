// ============================================================
// lib/template-engine.ts
// Core Template Engine — menggabungkan master template
// dengan invitation_data milik user menjadi satu objek render.
//
// PRINSIP UTAMA:
// - Master template (dari DB) → TIDAK PERNAH diubah
// - invitation_data.custom_styles → OVERRIDE styles per user
// - Output: InvitationRenderData → dikirim ke komponen React
// ============================================================

import type { InvitationDataRow, TemplateRow } from "@/types/database";
import { formatDateID } from "@/lib/utils";

// ── Output type yang dikonsumsi komponen template ────────────

export interface InvitationRenderData {
  // Identitas
  brideFullName:  string;
  groomFullName:  string;
  brideNickName:  string;
  groomNickName:  string;

  // Acara
  eventDateRaw:   string;          // "2026-09-12"
  eventDateLabel: string;          // "12 September 2026"
  eventTime:      string;          // "10:00"
  venueName:      string;
  venueAddress:   string;
  venueMapsUrl:   string;

  // Konten
  story:          string;
  musicUrl:       string;
  rsvpEnabled:    boolean;
  galleryImages:  string[];

  // Styles (merge: template default ← user custom_styles)
  styles: {
    primaryColor:    string;
    secondaryColor:  string;
    fontHeading:     string;
    fontBody:        string;
    backgroundColor: string;
  };

  // Meta
  templateSlug:   string;
  templateName:   string;
  templateTier:   string;
}

// ── Default fallback styles ──────────────────────────────────

const DEFAULT_STYLES = {
  primaryColor:    "#C6A98C",
  secondaryColor:  "#2B2B2B",
  fontHeading:     "Playfair Display",
  fontBody:        "Inter",
  backgroundColor: "#FFFFFF",
};

// ── Core function ────────────────────────────────────────────

/**
 * Merge template master + user data → InvitationRenderData
 * Dipanggil di Server Component sebelum render.
 */
export function buildRenderData(
  template: TemplateRow,
  invData:  InvitationDataRow
): InvitationRenderData {
  // Ambil default styles dari template
  const templateStyles = (template.default_styles ?? {}) as Record<string, string>;

  // Custom styles dari user (bisa partial)
  const userStyles = (invData.custom_styles ?? {}) as Record<string, string>;

  // Merge: default → template → user (user paling prioritas)
  const styles = {
    primaryColor:    userStyles.primaryColor    ?? templateStyles.primaryColor    ?? DEFAULT_STYLES.primaryColor,
    secondaryColor:  userStyles.secondaryColor  ?? templateStyles.secondaryColor  ?? DEFAULT_STYLES.secondaryColor,
    fontHeading:     userStyles.fontHeading     ?? templateStyles.fontHeading     ?? DEFAULT_STYLES.fontHeading,
    fontBody:        userStyles.fontBody        ?? templateStyles.fontBody        ?? DEFAULT_STYLES.fontBody,
    backgroundColor: userStyles.backgroundColor ?? templateStyles.backgroundColor ?? DEFAULT_STYLES.backgroundColor,
  };

  return {
    brideFullName:  invData.bride_full_name  || "Mempelai Wanita",
    groomFullName:  invData.groom_full_name  || "Mempelai Pria",
    brideNickName:  invData.bride_nick_name  || invData.bride_full_name?.split(" ")[0] || "Mempelai",
    groomNickName:  invData.groom_nick_name  || invData.groom_full_name?.split(" ")[0] || "Mempelai",
    eventDateRaw:   invData.event_date       || "",
    eventDateLabel: invData.event_date ? formatDateID(invData.event_date) : "Segera",
    eventTime:      invData.event_time       || "",
    venueName:      invData.venue_name       || "",
    venueAddress:   invData.venue_address    || "",
    venueMapsUrl:   invData.venue_maps_url   || "",
    story:          invData.story            || "",
    musicUrl:       invData.music_url        || "",
    rsvpEnabled:    invData.rsvp_enabled     ?? true,
    galleryImages:  invData.gallery_images   ?? [],
    styles,
    templateSlug:   template.slug,
    templateName:   template.name,
    templateTier:   template.tier,
  };
}

// ── Variable interpolation (untuk Phase 4 static preview) ───

/**
 * Ganti {{variable}} dalam string HTML dengan nilai aktual.
 * Dipakai jika template disimpan sebagai string HTML di DB.
 */
export function interpolateTemplate(
  html:   string,
  data:   InvitationRenderData
): string {
  const vars: Record<string, string> = {
    "{{bride}}":       data.brideFullName,
    "{{groom}}":       data.groomFullName,
    "{{bride_nick}}":  data.brideNickName,
    "{{groom_nick}}":  data.groomNickName,
    "{{date}}":        data.eventDateLabel,
    "{{time}}":        data.eventTime,
    "{{venue}}":       data.venueName,
    "{{address}}":     data.venueAddress,
    "{{story}}":       data.story,
    "{{music}}":       data.musicUrl,
    // Styles
    "{{primary_color}}":    data.styles.primaryColor,
    "{{secondary_color}}":  data.styles.secondaryColor,
    "{{font_heading}}":     data.styles.fontHeading,
    "{{font_body}}":        data.styles.fontBody,
    "{{bg_color}}":         data.styles.backgroundColor,
  };

  return Object.entries(vars).reduce(
    (result, [key, value]) => result.replaceAll(key, value ?? ""),
    html
  );
}
