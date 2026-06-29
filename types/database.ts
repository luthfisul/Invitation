// ============================================================
// types/database.ts
// TypeScript types yang merepresentasikan schema Supabase
// Di-generate manual — sync dengan supabase/schema.sql
// ============================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ── Row types (data yang dikembalikan dari SELECT) ────────────

export interface UserRow {
  id:          string;
  email:       string;
  full_name:   string | null;
  phone:       string | null;
  avatar_url:  string | null;
  created_at:  string;
  updated_at:  string;
}

export interface TemplateRow {
  id:             string;
  slug:           string;
  name:           string;
  tier:           "basic" | "premium" | "exclusive";
  category:       string[];
  price:          number;
  description:    string | null;
  preview_image:  string | null;
  tags:           string[];
  is_new:         boolean;
  is_best_seller: boolean;
  is_active:      boolean;
  default_styles: Json;
  created_at:     string;
  updated_at:     string;
}

export interface OrderRow {
  id:            string;
  order_number:  string;
  user_id:       string | null;
  template_id:   string | null;
  status:        "pending" | "paid" | "processing" | "published" | "cancelled";
  total_amount:  number;
  notes:         string | null;
  created_at:    string;
  updated_at:    string;
}

export interface InvitationDataRow {
  id:               string;
  order_id:         string;
  bride_full_name:  string;
  groom_full_name:  string;
  bride_nick_name:  string | null;
  groom_nick_name:  string | null;
  event_date:       string | null;
  event_time:       string | null;
  venue_name:       string | null;
  venue_address:    string | null;
  venue_maps_url:   string | null;
  story:            string | null;
  music_url:        string | null;
  rsvp_enabled:     boolean;
  gallery_images:   string[];
  custom_styles:    Json;   // ← diubah oleh AI chatbot
  created_at:       string;
  updated_at:       string;
}

export interface PaymentRow {
  id:               string;
  order_id:         string;
  method:           "qris" | "bank_transfer" | "ewallet" | null;
  status:           "pending" | "paid" | "failed" | "refunded";
  amount:           number;
  transaction_id:   string | null;
  paid_at:          string | null;
  gateway_response: Json;
  created_at:       string;
  updated_at:       string;
}

export interface GuestBookRow {
  id:           string;
  order_id:     string;
  guest_name:   string;
  message:      string | null;
  attendance:   "hadir" | "tidak_hadir" | "mungkin" | null;
  guest_count:  number;
  created_at:   string;
  updated_at:   string;
}

export interface InvitationRow {
  id:            string;
  order_id:      string;
  slug:          string;
  is_published:  boolean;
  published_at:  string | null;
  view_count:    number;
  qr_code_url:   string | null;
  expires_at:    string | null;
  created_at:    string;
  updated_at:    string;
}

export interface MediaRow {
  id:          string;
  order_id:    string | null;
  user_id:     string | null;
  file_name:   string;
  file_url:    string;
  file_type:   string | null;
  file_size:   number | null;
  bucket:      string;
  created_at:  string;
  updated_at:  string;
}

export interface SettingRow {
  id:          string;
  key:         string;
  value:       Json;
  description: string | null;
  created_at:  string;
  updated_at:  string;
}

// ── Insert types (data yang dikirim saat INSERT) ─────────────

export type UserInsert = Omit<UserRow, "id" | "created_at" | "updated_at">;
export type OrderInsert = Omit<OrderRow, "id" | "created_at" | "updated_at">;
export type InvitationDataInsert = Omit<InvitationDataRow, "id" | "created_at" | "updated_at">;
export type PaymentInsert = Omit<PaymentRow, "id" | "created_at" | "updated_at">;
export type GuestBookInsert = Omit<GuestBookRow, "id" | "created_at" | "updated_at">;
export type InvitationInsert = Omit<InvitationRow, "id" | "created_at" | "updated_at">;
export type MediaInsert = Omit<MediaRow, "id" | "created_at" | "updated_at">;

// ── Update types (Partial — semua field opsional) ────────────

export type InvitationDataUpdate = Partial<InvitationDataInsert>;
export type OrderUpdate = Partial<OrderInsert>;

// ── Database master type (untuk Supabase client generics) ────

export interface Database {
  public: {
    Tables: {
      users:           { Row: UserRow;           Insert: UserInsert; };
      templates:       { Row: TemplateRow;       Insert: never; };       // READ ONLY
      orders:          { Row: OrderRow;           Insert: OrderInsert; };
      invitation_data: { Row: InvitationDataRow; Insert: InvitationDataInsert; Update: InvitationDataUpdate; };
      payments:        { Row: PaymentRow;         Insert: PaymentInsert; };
      guest_books:     { Row: GuestBookRow;       Insert: GuestBookInsert; };
      invitations:     { Row: InvitationRow;      Insert: InvitationInsert; };
      media:           { Row: MediaRow;           Insert: MediaInsert; };
      settings:        { Row: SettingRow;         Insert: never; };       // READ ONLY
    };
  };
}
