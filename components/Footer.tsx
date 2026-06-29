// ============================================================
// components/Footer.tsx
// Footer sederhana dengan link dan copyright
// ============================================================

import { siteConfig } from "@/config/site";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--color-border)] py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">

        <p className="font-semibold text-sm">{siteConfig.name}</p>

        <p className="text-xs text-muted text-center">
          © {year} {siteConfig.name}. Hak cipta dilindungi.
        </p>

        <div className="flex gap-4 text-xs text-muted">
          <a href="#" className="hover:text-primary transition-colors">Syarat & Ketentuan</a>
          <a href="#" className="hover:text-primary transition-colors">Privasi</a>
          <a href={`https://wa.me/${siteConfig.contact.whatsapp}`} className="hover:text-primary transition-colors">
            WhatsApp
          </a>
        </div>

      </div>
    </footer>
  );
}
