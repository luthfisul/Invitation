"use client";

import { useState } from "react";
import { templates } from "@/data/templates";
import TemplateCard from "./TemplateCard";

export default function Gallery() {
  const [active, setActive] = useState("Semua");

  const filters = ["Semua", "Basic", "Menengah", "Profesional"];

  const filteredData =
    active === "Semua"
      ? templates
      : templates.filter((item) => item.category === active);

  return (
    <section className="py-20 bg-[#F5F1EA]">
      <div className="max-w-7xl mx-auto px-6 text-center">

        <h2 className="text-3xl font-serif mb-2">
          Pilih Tema Undanganmu
        </h2>

        <p className="text-gray-500 mb-8">
          Temukan desain yang paling menggambarkan ceritamu.
        </p>

        {/* FILTER */}
        <div className="flex justify-center gap-3 mb-10 flex-wrap">
          {filters.map((item) => (
            <button
              key={item}
              onClick={() => setActive(item)}
              className={`px-4 py-2 rounded-full text-sm transition
                ${
                  active === item
                    ? "bg-[var(--gold)] text-white"
                    : "border text-gray-600"
                }`}
            >
              {item}
            </button>
          ))}
        </div>

        {/* GRID */}
        <div className="grid md:grid-cols-3 gap-6">
          {filteredData.map((item) => (
            <TemplateCard key={item.id} data={item} />
          ))}
        </div>

      </div>
    </section>
  );
}