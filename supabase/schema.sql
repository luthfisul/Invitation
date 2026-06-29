-- ============================================================
-- EVERAFTER INVITATION PLATFORM — DATABASE SCHEMA
-- Phase 2: Supabase PostgreSQL
-- 
-- CARA PAKAI:
-- 1. Buka Supabase Dashboard → SQL Editor
-- 2. Copy semua isi file ini
-- 3. Paste → klik "Run"
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ============================================================
-- TABLE: users
-- Data user yang mendaftar / memesan
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         TEXT UNIQUE NOT NULL,
  full_name     TEXT,
  phone         TEXT,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.users IS 'Data customer yang mendaftar di platform';


-- ============================================================
-- TABLE: templates
-- Master catalog template — READ ONLY dari aplikasi
-- ============================================================
CREATE TABLE IF NOT EXISTS public.templates (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug            TEXT UNIQUE NOT NULL,       -- e.g. "template-gold-01"
  name            TEXT NOT NULL,
  tier            TEXT NOT NULL CHECK (tier IN ('basic', 'premium', 'exclusive')),
  category        TEXT[] NOT NULL DEFAULT '{}',
  price           INTEGER NOT NULL,           -- dalam IDR
  description     TEXT,
  preview_image   TEXT,
  tags            TEXT[] DEFAULT '{}',
  is_new          BOOLEAN DEFAULT FALSE,
  is_best_seller  BOOLEAN DEFAULT FALSE,
  is_active       BOOLEAN DEFAULT TRUE,
  default_styles  JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.templates IS 'Master catalog template — jangan diubah via aplikasi user';


-- ============================================================
-- TABLE: orders
-- Setiap pesanan customer
-- ============================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number    TEXT UNIQUE NOT NULL,       -- e.g. "ORDER-2026-0001"
  user_id         UUID REFERENCES public.users(id) ON DELETE SET NULL,
  template_id     UUID REFERENCES public.templates(id) ON DELETE RESTRICT,
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'paid', 'processing', 'published', 'cancelled')),
  total_amount    INTEGER NOT NULL,           -- dalam IDR
  notes           TEXT,                       -- catatan tambahan dari customer
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.orders IS 'Setiap order dari customer — satu order = satu undangan';


-- ============================================================
-- TABLE: invitation_data
-- Data isi undangan per order — boleh diedit customer
-- INI yang diubah AI chatbot, BUKAN tabel templates
-- ============================================================
CREATE TABLE IF NOT EXISTS public.invitation_data (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id          UUID UNIQUE REFERENCES public.orders(id) ON DELETE CASCADE,

  -- Data mempelai
  bride_full_name   TEXT NOT NULL DEFAULT '',
  groom_full_name   TEXT NOT NULL DEFAULT '',
  bride_nick_name   TEXT,
  groom_nick_name   TEXT,

  -- Data acara
  event_date        DATE,
  event_time        TIME,
  venue_name        TEXT,
  venue_address     TEXT,
  venue_maps_url    TEXT,

  -- Konten tambahan
  story             TEXT,                     -- cerita singkat mempelai
  music_url         TEXT,                     -- URL Spotify / YouTube
  rsvp_enabled      BOOLEAN DEFAULT TRUE,

  -- Galeri foto (array URL)
  gallery_images    TEXT[] DEFAULT '{}',

  -- Custom styles (override dari template default)
  -- INI yang diubah AI chatbot saat user minta ganti warna/font
  custom_styles     JSONB DEFAULT '{}',

  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.invitation_data IS 'Isi undangan per order — diubah AI chatbot, bukan master template';


-- ============================================================
-- TABLE: payments
-- Riwayat pembayaran per order
-- ============================================================
CREATE TABLE IF NOT EXISTS public.payments (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id          UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  method            TEXT CHECK (method IN ('qris', 'bank_transfer', 'ewallet')),
  status            TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  amount            INTEGER NOT NULL,
  transaction_id    TEXT,                     -- ID dari payment gateway
  paid_at           TIMESTAMPTZ,
  gateway_response  JSONB DEFAULT '{}',       -- raw response dari Midtrans/Xendit
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.payments IS 'Riwayat transaksi pembayaran — Phase 6';


-- ============================================================
-- TABLE: guest_books
-- Ucapan & konfirmasi kehadiran tamu
-- ============================================================
CREATE TABLE IF NOT EXISTS public.guest_books (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id        UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  guest_name      TEXT NOT NULL,
  message         TEXT,
  attendance      TEXT CHECK (attendance IN ('hadir', 'tidak_hadir', 'mungkin')),
  guest_count     INTEGER DEFAULT 1,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.guest_books IS 'Buku tamu & RSVP untuk setiap undangan';


-- ============================================================
-- TABLE: invitations (published)
-- Undangan yang sudah aktif dan punya URL publik
-- ============================================================
CREATE TABLE IF NOT EXISTS public.invitations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id        UUID UNIQUE REFERENCES public.orders(id) ON DELETE CASCADE,
  slug            TEXT UNIQUE NOT NULL,       -- e.g. "raka-dan-siti"
  is_published    BOOLEAN DEFAULT FALSE,
  published_at    TIMESTAMPTZ,
  view_count      INTEGER DEFAULT 0,
  qr_code_url     TEXT,
  expires_at      TIMESTAMPTZ,               -- opsional: masa aktif undangan
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.invitations IS 'Undangan yang sudah dipublish — punya URL publik';


-- ============================================================
-- TABLE: media
-- Semua aset upload dari customer
-- ============================================================
CREATE TABLE IF NOT EXISTS public.media (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id        UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES public.users(id) ON DELETE SET NULL,
  file_name       TEXT NOT NULL,
  file_url        TEXT NOT NULL,
  file_type       TEXT,                       -- "image/jpeg", "audio/mpeg", dll
  file_size       INTEGER,                    -- dalam bytes
  bucket          TEXT DEFAULT 'media',       -- Supabase Storage bucket
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.media IS 'Aset media yang diupload customer (foto, musik)';


-- ============================================================
-- TABLE: settings
-- Konfigurasi platform (admin)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.settings (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key             TEXT UNIQUE NOT NULL,       -- e.g. "maintenance_mode"
  value           JSONB NOT NULL,
  description     TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.settings IS 'Konfigurasi global platform — dikelola admin';

-- Seed default settings
INSERT INTO public.settings (key, value, description) VALUES
  ('maintenance_mode', 'false', 'Aktifkan mode maintenance'),
  ('max_gallery_images', '10', 'Maksimum foto di galeri'),
  ('order_sequence', '0', 'Counter untuk generate ORDER ID')
ON CONFLICT (key) DO NOTHING;


-- ============================================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Pasang trigger ke semua tabel
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'users', 'templates', 'orders', 'invitation_data',
    'payments', 'guest_books', 'invitations', 'media', 'settings'
  ]
  LOOP
    EXECUTE format('
      CREATE OR REPLACE TRIGGER handle_%I_updated_at
      BEFORE UPDATE ON public.%I
      FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
    ', t, t);
  END LOOP;
END;
$$;


-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS
ALTER TABLE public.users         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitation_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_books   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media         ENABLE ROW LEVEL SECURITY;

-- templates & settings: publik read, hanya admin yang bisa write
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings  ENABLE ROW LEVEL SECURITY;

-- POLICIES: users
CREATE POLICY "Users can view own data"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- POLICIES: templates (publik bisa baca)
CREATE POLICY "Anyone can view active templates"
  ON public.templates FOR SELECT
  USING (is_active = TRUE);

-- POLICIES: orders
CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- POLICIES: invitation_data
CREATE POLICY "Users can view own invitation data"
  ON public.invitation_data FOR SELECT
  USING (
    order_id IN (
      SELECT id FROM public.orders WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own invitation data"
  ON public.invitation_data FOR UPDATE
  USING (
    order_id IN (
      SELECT id FROM public.orders WHERE user_id = auth.uid()
    )
  );

-- POLICIES: invitations (publik bisa baca yang published)
CREATE POLICY "Anyone can view published invitations"
  ON public.invitations FOR SELECT
  USING (is_published = TRUE);

-- POLICIES: guest_books (publik bisa tambah ucapan)
CREATE POLICY "Anyone can add guest book entry"
  ON public.guest_books FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Anyone can view guest book"
  ON public.guest_books FOR SELECT
  USING (TRUE);

-- POLICIES: media
CREATE POLICY "Users can view own media"
  ON public.media FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upload media"
  ON public.media FOR INSERT
  WITH CHECK (auth.uid() = user_id);


-- ============================================================
-- SEED: Master Templates (sync dengan data/templates.ts)
-- ============================================================
INSERT INTO public.templates (slug, name, tier, category, price, description, preview_image, tags, is_best_seller, default_styles) VALUES
(
  'template-gold-01', 'Luxury Gold', 'premium',
  ARRAY['modern','royal'], 199000,
  'Tampilan mewah bernuansa emas dengan tipografi elegan.',
  '/templates/gold-01/preview.jpg',
  ARRAY['elegant','gold','formal','dark'], TRUE,
  '{"primaryColor":"#C6A98C","secondaryColor":"#2B2B2B","fontHeading":"Playfair Display","fontBody":"Inter","backgroundColor":"#1A1A1A"}'
),
(
  'template-rustic-01', 'Rustic Bohemian', 'premium',
  ARRAY['rustic','bohemian'], 179000,
  'Nuansa alam dengan elemen kayu dan floral.',
  '/templates/rustic-01/preview.jpg',
  ARRAY['rustic','boho','nature','warm'], FALSE,
  '{"primaryColor":"#8B6347","secondaryColor":"#F4EAE6","fontHeading":"Cormorant Garamond","fontBody":"Lato","backgroundColor":"#FDF6EE"}'
),
(
  'template-minimal-01', 'Clean Minimal', 'basic',
  ARRAY['minimalist','modern'], 99000,
  'Desain bersih tanpa distraksi.',
  '/templates/minimal-01/preview.jpg',
  ARRAY['minimal','clean','modern','white'], FALSE,
  '{"primaryColor":"#333333","secondaryColor":"#888888","fontHeading":"DM Serif Display","fontBody":"Inter","backgroundColor":"#FFFFFF"}'
),
(
  'template-floral-01', 'Garden Floral', 'premium',
  ARRAY['floral','modern'], 189000,
  'Dipenuhi ilustrasi bunga yang lembut.',
  '/templates/floral-01/preview.jpg',
  ARRAY['floral','romantic','pink','soft'], FALSE,
  '{"primaryColor":"#D4869A","secondaryColor":"#4A3040","fontHeading":"Great Vibes","fontBody":"Nunito","backgroundColor":"#FFF5F7"}'
),
(
  'template-royal-01', 'Royal Emerald', 'exclusive',
  ARRAY['royal','modern'], 299000,
  'Kemewahan level tertinggi dengan palet hijau emerald.',
  '/templates/royal-01/preview.jpg',
  ARRAY['royal','emerald','luxury','exclusive'], FALSE,
  '{"primaryColor":"#D4AF37","secondaryColor":"#F5F0E8","fontHeading":"Cinzel Decorative","fontBody":"EB Garamond","backgroundColor":"#1B3A2D"}'
),
(
  'template-minimal-02', 'Sage & Ivory', 'basic',
  ARRAY['minimalist','floral'], 119000,
  'Perpaduan warna sage hijau dan ivory yang menenangkan.',
  '/templates/minimal-02/preview.jpg',
  ARRAY['sage','green','minimal','calm'], FALSE,
  '{"primaryColor":"#7D9E7A","secondaryColor":"#5C5C4A","fontHeading":"Cormorant Garamond","fontBody":"Inter","backgroundColor":"#F9F6F0"}'
)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- END OF SCHEMA
-- ============================================================
