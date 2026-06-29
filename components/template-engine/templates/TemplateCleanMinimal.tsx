// ============================================================
// components/template-engine/templates/TemplateCleanMinimal.tsx
// Template: Clean Minimal & Sage & Ivory
// Desain bersih, putih, tipografi dominan
// ============================================================

"use client";

import type { InvitationRenderData } from "@/lib/template-engine";
import { useEffect } from "react";

interface Props {
  data:    InvitationRenderData;
  preview: boolean;
}

export default function TemplateCleanMinimal({ data, preview }: Props) {
  const { styles } = data;

  useEffect(() => {
    const fontUrl = `https://fonts.googleapis.com/css2?family=${
      encodeURIComponent(styles.fontHeading)
    }:wght@400;700&family=${
      encodeURIComponent(styles.fontBody)
    }&display=swap`;
    const link = document.createElement("link");
    link.rel = "stylesheet";
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
      <div style={wrap} className="rounded-2xl p-8 text-center border"
        style={{ ...wrap, border: `1px solid ${styles.primaryColor}30` }}>
        <p style={{ color: styles.primaryColor }} className="text-xs tracking-widest uppercase mb-4">
          Undangan Pernikahan
        </p>
        <h2 style={{ ...h, fontSize: "1.8rem" }}>
          {data.brideNickName} & {data.groomNickName}
        </h2>
        <div className="w-8 h-px mx-auto my-4" style={{ backgroundColor: styles.primaryColor }} />
        <p style={{ color: styles.primaryColor }} className="text-sm">{data.eventDateLabel}</p>
        {data.venueName && (
          <p style={{ color: styles.secondaryColor + "70" }} className="text-xs mt-1">{data.venueName}</p>
        )}
      </div>
    );
  }

  return (
    <div style={wrap} className="min-h-screen">

      {/* Hero */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-8">
        <p style={{ color: styles.primaryColor }} className="text-xs tracking-[0.4em] uppercase mb-8">
          Undangan Pernikahan
        </p>
        <h1 style={{ ...h, fontSize: "clamp(2rem, 7vw, 4.5rem)" }}>
          {data.brideFullName}
        </h1>
        <p style={{ color: styles.primaryColor }} className="text-2xl my-4">＆</p>
        <h1 style={{ ...h, fontSize: "clamp(2rem, 7vw, 4.5rem)" }}>
          {data.groomFullName}
        </h1>
        <div className="w-12 h-px mx-auto my-8" style={{ backgroundColor: styles.primaryColor }} />
        <p style={{ color: styles.primaryColor }}>{data.eventDateLabel}</p>
        {data.venueName && (
          <p style={{ color: styles.secondaryColor + "80" }} className="text-sm mt-2">
            {data.venueName}
          </p>
        )}
      </section>

      {/* Detail */}
      <section className="py-20 px-8 max-w-md mx-auto">
        <div className="border rounded-2xl p-8 space-y-6 text-sm"
          style={{ borderColor: styles.primaryColor + "30" }}>
          {[
            { label: "Tanggal",  value: data.eventDateLabel },
            { label: "Waktu",    value: data.eventTime ? `${data.eventTime} WIB` : null },
            { label: "Lokasi",   value: data.venueName },
            { label: "Alamat",   value: data.venueAddress },
          ].filter(r => r.value).map(row => (
            <div key={row.label} className="flex gap-4">
              <span style={{ color: styles.primaryColor }} className="w-20 shrink-0 text-xs uppercase tracking-widest pt-0.5">
                {row.label}
              </span>
              <span style={{ color: styles.secondaryColor }}>{row.value}</span>
            </div>
          ))}
          {data.venueMapsUrl && (
            <a
              href={data.venueMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center text-xs py-2 rounded-full border mt-2"
              style={{ borderColor: styles.primaryColor, color: styles.primaryColor }}
            >
              Buka di Google Maps →
            </a>
          )}
        </div>
      </section>

      {/* Story */}
      {data.story && (
        <section className="py-16 px-8 max-w-md mx-auto text-center">
          <p style={{ color: styles.primaryColor }} className="text-xs tracking-widest uppercase mb-6">
            Cerita Kami
          </p>
          <p style={{ color: styles.secondaryColor + "80", lineHeight: "1.9" }} className="text-sm">
            {data.story}
          </p>
        </section>
      )}

      {/* RSVP */}
      {data.rsvpEnabled && (
        <section className="py-16 px-8 max-w-sm mx-auto text-center">
          <p style={{ color: styles.primaryColor }} className="text-xs tracking-widest uppercase mb-6">
            RSVP
          </p>
          <input
            type="text"
            placeholder="Nama kamu..."
            className="w-full px-4 py-2.5 rounded-full text-sm mb-3 outline-none border"
            style={{ borderColor: styles.primaryColor + "40", color: styles.secondaryColor }}
          />
          <div className="flex gap-2">
            {["Hadir ✓", "Tidak Hadir"].map(l => (
              <button
                key={l}
                className="flex-1 py-2.5 rounded-full text-sm"
                style={{ backgroundColor: styles.primaryColor, color: styles.backgroundColor }}
              >
                {l}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-12 text-center border-t"
        style={{ borderColor: styles.primaryColor + "20" }}>
        <p style={{ ...h, fontSize: "1.3rem" }}>
          {data.brideNickName} & {data.groomNickName}
        </p>
        <p style={{ color: styles.primaryColor + "70" }} className="text-xs mt-2">
          {data.eventDateLabel}
        </p>
      </footer>

    </div>
  );
}
