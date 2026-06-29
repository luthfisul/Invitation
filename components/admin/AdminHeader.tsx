// ============================================================
// components/admin/AdminHeader.tsx
// Header admin — breadcrumb + mobile menu
// ============================================================

"use client";

import { usePathname } from "next/navigation";

const pageTitles: Record<string, string> = {
  "/admin":            "Dashboard",
  "/admin/orders":     "Pesanan",
  "/admin/customers":  "Customer",
  "/admin/templates":  "Template",
  "/admin/analytics":  "Analytics",
};

export default function AdminHeader() {
  const pathname = usePathname();

  const title =
    Object.entries(pageTitles)
      .reverse()
      .find(([key]) => pathname.startsWith(key))?.[1] ?? "Admin";

  return (
    <header className="bg-white border-b border-gray-200 h-14
                       flex items-center px-6 sticky top-0 z-30">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-400">Admin</span>
        <span className="text-gray-300">/</span>
        <span className="font-medium text-gray-700">{title}</span>
      </div>
    </header>
  );
}
