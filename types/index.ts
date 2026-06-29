// ============================================================
// types/index.ts
// Central type definitions for the EverAfter Invitation Platform
// ============================================================

export type TemplateTier = "basic" | "premium" | "exclusive";

export type TemplateCategory =
  | "modern"
  | "rustic"
  | "minimalist"
  | "floral"
  | "royal"
  | "bohemian";

export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "published"
  | "cancelled";

export interface Template {
  id: string;                   // e.g. "template-gold-01"
  name: string;                 // e.g. "Luxury Gold"
  tier: TemplateTier;
  category: TemplateCategory[];
  price: number;                // in IDR, e.g. 199000
  description: string;
  previewImage: string;         // path to /public/templates/...
  tags: string[];               // e.g. ["elegant", "modern", "dark"]
  isNew?: boolean;
  isBestSeller?: boolean;
  defaultStyles: {
    primaryColor: string;
    secondaryColor: string;
    fontHeading: string;
    fontBody: string;
    backgroundColor: string;
  };
}

// Akan digunakan di Phase 3+
export interface Order {
  id: string;                   // e.g. "ORDER-2026-0001"
  templateId: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  invitationData: InvitationData;
  payment?: PaymentInfo;
}

export interface InvitationData {
  brideFullName: string;
  groomFullName: string;
  brideNickName?: string;
  groomNickName?: string;
  eventDate: string;            // ISO 8601
  eventTime: string;
  venueName: string;
  venueAddress: string;
  venueMapsUrl?: string;
  story?: string;
  musicUrl?: string;
  galleryImages?: string[];
  rsvpEnabled: boolean;
  customStyles?: Partial<Template["defaultStyles"]>;
}

export interface PaymentInfo {
  method: "qris" | "bank_transfer" | "ewallet";
  status: "pending" | "paid" | "failed";
  paidAt?: string;
  amount: number;
  transactionId?: string;
}
