"use client";
import { useState } from "react";

export default function FilterBar() {
  const [active, setActive] = useState("Semua");

  const filters = ["Semua", "Basic", "Menengah", "Profesional"];

  return (
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
  );
}