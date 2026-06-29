// ============================================================
// components/admin/AdminSidebar.tsx
// Sidebar navigasi admin panel
// ============================================================

"use client";

import Link             from "next/link";
import { usePathname }  from "next/navigation";
import { useRouter }    from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { cn }           from "@/lib/utils";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const navItems = [
  { href: "/admin",             label: "Dashboard",  icon: "📊", exact: true },
  { href: "/admin/orders",      label: "Pesanan",    icon: "📋" },
  { href: "/admin/customers",   label: "Customer",   icon: "👥" },
  { href: "/admin/templates",   label: "Template",   icon: "🎨" },
  { href: "/admin/analytics",   label: "Analytics",  icon: "📈" },
];

export default function AdminSidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();
  const router   = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col bg-[#1A1A2E]
                      text-white min-h-screen">

      {/* Logo */}
      <div className="px-5 py-6 border-b border-white/10">
        <p className="font-semibold text-base text-white">EverAfter Admin</p>
        <p className="text-xs text-white/40 mt-0.5 truncate">{userEmail}</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors",
                isActive
                  ? "bg-[var(--color-primary)] text-white font-medium"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              )}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/10 space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm
                     text-white/60 hover:bg-white/10 hover:text-white transition-colors"
        >
          <span>🌐</span> Lihat Website
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm
                     text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <span>🚪</span> Keluar
        </button>
      </div>

    </aside>
  );
}
