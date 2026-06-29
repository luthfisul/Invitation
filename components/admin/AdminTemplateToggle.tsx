// ============================================================
// components/admin/AdminTemplateToggle.tsx
// Toggle aktif / nonaktif template
// ============================================================

"use client";

import { useState, useTransition } from "react";
import { useRouter }               from "next/navigation";
import { supabase }                from "@/lib/supabase";

interface Props { templateId: string; isActive: boolean; }

export default function AdminTemplateToggle({ templateId, isActive }: Props) {
  const router = useRouter();
  const [active, setActive]   = useState(isActive);
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(async () => {
      const next = !active;
      await supabase
        .from("templates")
        .update({ is_active: next })
        .eq("id", templateId);
      setActive(next);
      router.refresh();
    });
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      title={active ? "Nonaktifkan template" : "Aktifkan template"}
      className={[
        "relative w-10 h-6 rounded-full transition-colors shrink-0",
        active ? "bg-emerald-500" : "bg-gray-300",
        isPending ? "opacity-50" : "",
      ].join(" ")}
    >
      <span
        className={[
          "absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform",
          active ? "translate-x-5" : "translate-x-1",
        ].join(" ")}
      />
    </button>
  );
}
