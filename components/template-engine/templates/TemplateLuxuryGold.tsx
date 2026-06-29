// ============================================================
// components/template-engine/templates/TemplateLuxuryGold.tsx
// Template: Luxury Gold — dark, elegant, mewah
// Semua nilai visual dari props data.styles (tidak hardcode)
// ============================================================

"use client";

import type { InvitationRenderData } from "@/lib/template-engine";
import { useEffect, useState } from "react";

interface Props {
  data:    InvitationRenderData;
  preview: boolean;
}

export default function TemplateLuxuryGold({ data, preview }: Props) {
  const { styles } = data;
  const [guestName, setGuestName] = useState("");

  // Inject Google Fonts dinamis
  useEffect(() => {
    const fontUrl = `https://fonts.googleapis.com/css2?family=${
      encodeURIComponent(styles.fontHeading)
    }:wght@400;600&family=${
      encodeURIComponent(styles.fontBody)
    }&display=swap`;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = fontUrl;
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, [styles.fontHeading, styles.fontBody]);

  const css = {
    wrapper: {
      backgroundColor: styles.backgroundColor,
      color:           styles.secondaryColor,
      fontFamily:      `'${styles.fontBody}', sans-serif`,
      minHeight:       preview ? "auto" : "100vh",
    } as React.CSSProperties,
    heading: {
      fontFamily: `'${styles.fontHeading}', serif`,
      color:      styles.primaryColor,
    } as React.CSSProperties,
    divider: {
      borderColor: styles.primaryColor,
    } as React.CSSProperties,
    btn: {
      backgroundColor: styles.primaryColor,
      color:           styles.backgroundColor,
    } as React.CSSProperties,
    label: {
      color: styles.primaryColor,
    } as React.CSSProperties,
  };

  if (preview) {
    return (
      <div style={css.wrapper} className="rounded-2xl overflow-hidden p-8 text-center">
        <p style={css.label} className="text-xs tracking-[0.3em] uppercase mb-3">
          Wedding Invitation
        </p>
        <h2 style={{ ...css.heading, fontSize: "2rem", lineHeight: 1.2 }}>
          {data.brideNickName}
          <span style={css.label} className="block text-lg my-1">&</span>
          {data.groomNickName}
        </h2>
        <hr style={css.divider} className="w-12 mx-auto my-4 border-t" />
        <p style={{ color: styles.primaryColor }} className="text-sm">
          {data.eventDateLabel}
        </p>
        {data.venueName && (
          <p style={{ color: styles.secondaryColor + "99" }} className="text-xs mt-1">
            {data.venueName}
          </p>
        )}
      </div>
    );
  }

  return (
    <div style={css.wrapper}>

      {/* ── HERO ── */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-8 py-20">
        <p style={css.label} className="text-xs tracking-[0.4em] uppercase mb-6">
          We Are Getting Married
        </p>
        <h1 style={{ ...css.heading, fontSize: "clamp(2.5rem, 8vw, 5rem)", lineHeight: 1.1 }}>
          {data.brideFullName}
        </h1>
        <p style={css.label} className="text-3xl my-3">&</p>
        <h1 style={{ ...css.heading, fontSize: "clamp(2.5rem, 8vw, 5rem)", lineHeight: 1.1 }}>
          {data.groomFullName}
        </h1>
        <hr style={css.divider} className="w-16 mx-auto border-t my-8" />
        <p style={{ color: styles.primaryColor }} className="text-lg">
          {data.eventDateLabel}
        </p>
        {data.eventTime && (
          <p style={{ color: styles.secondaryColor + "80" }} className="text-sm mt-1">
            Pukul {data.eventTime} WIB
          </p>
        )}
        {/* Scroll hint */}
        <div className="mt-16 animate-bounce">
          <span style={{ color: styles.primaryColor + "60" }} className="text-2xl">↓</span>
        </div>
      </section>

      {/* ── DETAIL ACARA ── */}
      <section className="py-20 px-8 text-center max-w-lg mx-auto">
        <p style={css.label} className="text-xs tracking-[0.3em] uppercase mb-8">
          Detail Acara
        </p>
        <div className="space-y-6">
          <div>
            <p style={css.label} className="text-xs tracking-widest uppercase mb-1">Tanggal</p>
            <p style={{ fontFamily: `'${styles.fontHeading}', serif`, fontSize: "1.25rem" }}>
              {data.eventDateLabel}
            </p>
          </div>
          {data.eventTime && (
            <div>
              <p style={css.label} className="text-xs tracking-widest uppercase mb-1">Waktu</p>
              <p>{data.eventTime} WIB</p>
            </div>
          )}
          {data.venueName && (
            <div>
              <p style={css.label} className="text-xs tracking-widest uppercase mb-1">Lokasi</p>
              <p style={{ fontFamily: `'${styles.fontHeading}', serif`, fontSize: "1.1rem" }}>
                {data.venueName}
              </p>
              {data.venueAddress && (
                <p style={{ color: styles.secondaryColor + "70" }} className="text-sm mt-1">
                  {data.venueAddress}
                </p>
              )}
              {data.venueMapsUrl && (
                <a
                  href={data.venueMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={css.label}
                  className="inline-block text-xs border mt-3 px-4 py-1.5 rounded-full"
                  // border color from primaryColor
                >
                  Buka di Google Maps →
                </a>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── CERITA ── */}
      {data.story && (
        <section className="py-20 px-8 max-w-lg mx-auto text-center">
          <p style={css.label} className="text-xs tracking-[0.3em] uppercase mb-6">
            Cerita Kami
          </p>
          <p style={{ color: styles.secondaryColor + "90", lineHeight: "1.8" }} className="text-sm">
            {data.story}
          </p>
        </section>
      )}

      {/* ── GALERI ── */}
      {data.galleryImages.length > 0 && (
        <section className="py-20 px-4">
          <p style={css.label} className="text-xs tracking-[0.3em] uppercase mb-8 text-center">
            Galeri
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-w-2xl mx-auto">
            {data.galleryImages.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={src}
                alt={`Foto ${i + 1}`}
                className="w-full aspect-square object-cover rounded-xl"
              />
            ))}
          </div>
        </section>
      )}

      {/* ── RSVP ── */}
      {data.rsvpEnabled && (
        <section className="py-20 px-8 text-center max-w-sm mx-auto">
          <p style={css.label} className="text-xs tracking-[0.3em] uppercase mb-6">
            Konfirmasi Kehadiran
          </p>
          <input
            type="text"
            placeholder="Nama kamu..."
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-full text-sm mb-3 outline-none"
            style={{
              backgroundColor: styles.secondaryColor + "15",
              color: styles.secondaryColor,
              border: `1px solid ${styles.primaryColor}40`,
            }}
          />
          <div className="flex gap-2 justify-center">
            {["Hadir", "Tidak Hadir"].map((label) => (
              <button
                key={label}
                style={css.btn}
                className="flex-1 py-2.5 rounded-full text-sm font-medium"
              >
                {label}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ── FOOTER ── */}
      <footer className="py-12 text-center">
        <p style={{ ...css.heading, fontSize: "1.5rem" }}>
          {data.brideNickName} & {data.groomNickName}
        </p>
        <p style={{ color: styles.primaryColor + "60" }} className="text-xs mt-2">
          {data.eventDateLabel}
        </p>
      </footer>

    </div>
  );
}
