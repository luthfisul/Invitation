// ============================================================
// components/Hero.tsx
// Landing section utama — headline, CTA, mock preview card
// ============================================================

"use client";

import { motion } from "framer-motion";
import { siteConfig } from "@/config/site";

export default function Hero() {
  return (
    <section className="min-h-screen flex items-center pt-20">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 px-6 py-16">

        {/* ── LEFT: Copy ── */}
        <div className="flex flex-col justify-center">

          {/* Pill label */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 bg-white border border-[var(--color-border)]
                       rounded-full px-4 py-1.5 text-xs text-muted w-fit mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Platform Undangan Digital #1 Indonesia
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-5xl font-semibold leading-tight mb-5"
          >
            Undangan Pernikahan{" "}
            <span className="text-primary">Digital</span>{" "}
            yang Elegan & Instan
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-gray-500 text-base mb-8 leading-relaxed"
          >
            {siteConfig.tagline}. Pilih template, isi data lewat chat AI,
            dan undanganmu siap dibagikan dalam hitungan menit.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap gap-3"
          >
            <a
              href="#gallery"
              className="bg-primary text-white px-6 py-3 rounded-full text-sm font-medium
                         hover:bg-[var(--color-primary-dark)] transition-colors duration-200"
            >
              Lihat Template
            </a>
            <a
              href="#how-it-works"
              className="border border-gray-300 text-gray-700 px-6 py-3 rounded-full text-sm
                         hover:border-primary hover:text-primary transition-colors duration-200"
            >
              Cara Kerja →
            </a>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-10 flex items-center gap-4 text-sm text-muted"
          >
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white"
                />
              ))}
            </div>
            <span>
              <strong className="text-dark">500+</strong> pasangan sudah mempercayakan momen mereka
            </span>
          </motion.div>

        </div>

        {/* ── RIGHT: Mock phone preview ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex justify-center items-center"
        >
          <div className="relative">
            {/* Decorative background blob */}
            <div
              className="absolute inset-0 -z-10 rounded-full blur-3xl opacity-30"
              style={{ backgroundColor: "var(--color-primary)" }}
            />

            {/* Phone frame */}
            <div className="w-[260px] h-[480px] bg-white shadow-2xl rounded-[2.5rem] p-3 border border-gray-100">
              <div className="w-full h-full rounded-[2rem] bg-[#1A1A1A] overflow-hidden relative flex flex-col">

                {/* Mock header */}
                <div className="px-4 pt-6 pb-3 text-center">
                  <p className="text-[#C6A98C] text-[10px] tracking-widest uppercase">
                    Wedding Invitation
                  </p>
                  <h3 className="text-white text-lg font-light mt-2 leading-snug">
                    Raka<br />&<br />Siti
                  </h3>
                </div>

                {/* Divider */}
                <div className="mx-auto w-12 h-px bg-[#C6A98C] my-2" />

                {/* Mock content */}
                <div className="flex-1 flex flex-col items-center justify-center px-4 text-center gap-2">
                  <p className="text-[#C6A98C] text-[9px] tracking-widest">KAMI AKAN MENIKAH</p>
                  <p className="text-white text-xs">Sabtu, 12 September 2026</p>
                  <p className="text-gray-400 text-[9px]">Ballroom Grand Hyatt Jakarta</p>
                </div>

                {/* Mock footer */}
                <div className="p-4">
                  <div className="bg-[#C6A98C] rounded-full text-center py-2">
                    <span className="text-white text-[10px] font-medium">RSVP Sekarang</span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
