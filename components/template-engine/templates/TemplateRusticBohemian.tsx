// ============================================================
// components/template-engine/templates/TemplateRusticBohemian.tsx
// Template: Rustic Bohemian — hangat, organik, natural
// ============================================================

"use client";

import type { InvitationRenderData } from "@/lib/template-engine";
import { useEffect } from "react";

interface Props {
  data:    InvitationRenderData;
  preview: boolean;
}

export default function TemplateRusticBohemian({ data, preview }: Props) {
  const { styles } = data;

  useEffect(() => {
    const fontUrl = `https://fonts.googleapis.com/css2?family=${
      encodeURIComponent(styles.fontHeading)
    }:ital,wght@0,400;1,400&family=${
      encodeURIComponent(styles.fontBody)
    }&display=swap`;
    const link = document.createElement("link");
    link.rel  = "stylesheet";
    link.href = fontUrl;
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, [styles.fontHeading, styles.fontBody]);

  const wrap: React.CSSProperties = {
    backgroundColor: styles.backgroundColor,
    color:           styles.secondaryColor,
    fontFamily:      `'${styles.fontBody}', sans-serif`,
  };
  const h: React.CSSProperties = {
    fontFamily: `'${styles.fontHeading}', serif`,
    color:      styles.primaryColor,
  };

  if (preview) {
    return (
      <div style={wrap} className="rounded-2xl p-8 text-center">
        {/* Decorative leaf */}
        <div className="text-3xl mb-3">🌿</div>
        <p style={{ color: styles.primaryColor }} className="text-xs tracking-widest uppercase mb-3">
          Wedding Invitation
        </p>
        <h2 style={{ ...h, fontSize: "1.9rem", fontStyle: "italic" }}>
          {data.brideNickName} & {data.groomNickName}
        </h2>
        <p style={{ color: styles.primaryColor + "90" }} className="text-sm mt-3">
          {data.eventDateLabel}
        </p>
        {data.venueName && (
          <p style={{ color: styles.secondaryColor + "70" }} className="text-xs mt-1">
            {data.venueName}
          </p>
        )}
      </div>
    );
  }

  return (
    <div style={wrap} className="min-h-screen">

      {/* Hero */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-8 py-20 relative">
        {/* Decorative top */}
        <div className="text-5xl mb-6 opacity-60">🌾</div>
        <p style={{ color: styles.primaryColor }} className="text-xs tracking-[0.4em] uppercase mb-6">
          Dengan Rahmat Tuhan Yang Maha Esa
        </p>
        <h1 style={{ ...h, fontSize: "clamp(2rem, 8vw, 5rem)", fontStyle: "italic" }}>
          {data.brideFullName}
        </h1>
        <div className="flex items-center gap-4 my-4">
          <div className="h-px w-12" style={{ backgroundColor: styles.primaryColor + "60" }} />
          <span style={{ color: styles.primaryColor }} className="text-xl">&</span>
          <div className="h-px w-12" style={{ backgroundColor: styles.primaryColor + "60" }} />
        </div>
        <h1 style={{ ...h, fontSize: "clamp(2rem, 8vw, 5rem)", fontStyle: "italic" }}>
          {data.groomFullName}
        </h1>
        <div className="text-3xl mt-8 opacity-40">🌿</div>
      </section>

      {/* Tanggal & Lokasi */}
      <section className="py-20 px-8 max-w-md mx-auto text-center">
        <div className="rounded-3xl p-8 space-y-5"
          style={{ backgroundColor: styles.primaryColor + "15", border: `1px solid ${styles.primaryColor}30` }}>
          <div className="text-2xl">📅</div>
          <p style={{ ...h, fontSize: "1.3rem" }}>{data.eventDateLabel}</p>
          {data.eventTime && (
            <p style={{ color: styles.secondaryColor + "80" }} className="text-sm">
              Pukul {data.eventTime} WIB
            </p>
          )}
          {data.venueName && (
            <>
              <div className="h-px" style={{ backgroundColor: styles.primaryColor + "30" }} />
              <div className="text-2xl">📍</div>
              <p style={{ ...h, fontSize: "1.1rem" }}>{data.venueName}</p>
              {data.venueAddress && (
                <p style={{ color: styles.secondaryColor + "70" }} className="text-sm">
                  {data.venueAddress}
                </p>
              )}
              {data.venueMapsUrl && (
                <a
                  href={data.venueMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-xs px-5 py-2 rounded-full"
                  style={{ backgroundColor: styles.primaryColor, color: styles.backgroundColor }}
                >
                  Lihat di Maps →
                </a>
              )}
            </>
          )}
        </div>
      </section>

      {/* Story */}
      {data.story && (
        <section className="py-16 px-8 max-w-md mx-auto text-center">
          <div className="text-3xl mb-4">💌</div>
          <p style={{ ...h, fontSize: "1.2rem", fontStyle: "italic" }} className="mb-6">
            Cerita Kami
          </p>
          <p style={{ color: styles.secondaryColor + "80", lineHeight: "1.9" }} className="text-sm">
            {data.story}
          </p>
        </section>
      )}

      {/* Galeri */}
      {data.galleryImages.length > 0 && (
        <section className="py-16 px-4">
          <p style={{ ...h, textAlign: "center", fontStyle: "italic" }} className="text-xl mb-8">
            Momen Bersama
          </p>
          <div className="grid grid-cols-2 gap-3 max-w-xl mx-auto">
            {data.galleryImages.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={src}
                alt={`Foto ${i + 1}`}
                className={`w-full object-cover rounded-2xl ${i === 0 ? "col-span-2 aspect-video" : "aspect-square"}`}
              />
            ))}
          </div>
        </section>
      )}

      {/* RSVP */}
      {data.rsvpEnabled && (
        <section className="py-16 px-8 max-w-sm mx-auto text-center">
          <div className="text-3xl mb-4">🤝</div>
          <p style={{ ...h, fontStyle: "italic" }} className="text-xl mb-6">
            Konfirmasi Kehadiran
          </p>
          <input
            type="text"
            placeholder="Nama kamu..."
            className="w-full px-4 py-3 rounded-2xl text-sm mb-3 outline-none border"
            style={{ borderColor: styles.primaryColor + "50", backgroundColor: "transparent", color: styles.secondaryColor }}
          />
          <div className="flex gap-2">
            {["Hadir ✓", "Tidak Hadir"].map(l => (
              <button
                key={l}
                className="flex-1 py-3 rounded-2xl text-sm"
                style={{ backgroundColor: styles.primaryColor, color: styles.backgroundColor }}
              >
                {l}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-16 text-center">
        <div className="text-4xl mb-4">🌸</div>
        <p style={{ ...h, fontSize: "1.4rem", fontStyle: "italic" }}>
          {data.brideNickName} & {data.groomNickName}
        </p>
        <p style={{ color: styles.primaryColor + "80" }} className="text-xs mt-2 tracking-widest uppercase">
          {data.eventDateLabel}
        </p>
      </footer>

    </div>
  );
}
