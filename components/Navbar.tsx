// ============================================================
// components/Navbar.tsx
// Navigasi utama — sticky, responsive, dengan CTA
// ============================================================

"use client";

import { useState, useEffect } from "react";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Katalog",  href: "#gallery" },
  { label: "Harga",    href: "#pricing" },
  { label: "Kontak",   href: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "w-full fixed top-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/90 backdrop-blur-md shadow-sm border-b border-[var(--color-border)]"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">

        {/* Logo */}
        <a href="/" className="font-semibold text-xl tracking-wide text-[var(--color-dark)]">
          {siteConfig.name}
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-gray-600 hover:text-primary transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:block">
          <a
            href="#gallery"
            className="bg-primary text-white text-sm px-5 py-2.5 rounded-full
                       hover:bg-[var(--color-primary-dark)] transition-colors duration-200"
          >
            Pesan Sekarang
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-1"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className={cn("block w-5 h-0.5 bg-gray-700 transition-transform", menuOpen && "rotate-45 translate-y-2")} />
          <span className={cn("block w-5 h-0.5 bg-gray-700 transition-opacity", menuOpen && "opacity-0")} />
          <span className={cn("block w-5 h-0.5 bg-gray-700 transition-transform", menuOpen && "-rotate-45 -translate-y-2")} />
        </button>

      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-[var(--color-border)] px-6 py-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-gray-700"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <a
            href="#gallery"
            className="bg-primary text-white text-sm text-center px-5 py-2.5 rounded-full"
            onClick={() => setMenuOpen(false)}
          >
            Pesan Sekarang
          </a>
        </div>
      )}
    </nav>
  );
}
