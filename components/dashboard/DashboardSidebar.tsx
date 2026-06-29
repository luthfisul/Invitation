// ============================================================
// components/dashboard/DashboardSidebar.tsx
// Sidebar navigasi dashboard customer
// ============================================================

"use client";

import Link                from "next/link";
import { usePathname }     from "next/navigation";
import { createClient }    from "@supabase/supabase-js";
import { useRouter }       from "next/navigation";
import { cn }              from "@/lib/utils";
import { siteConfig }      from "@/config/site";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const navItems = [
  { href: "/dashboard",         label: "Beranda",   icon: "🏠" },
  { href: "/dashboard/orders",  label: "Pesanan",   icon: "📋" },
  { href: "/dashboard/profile", label: "Profil",    icon: "👤" },
];

interface DashboardSidebarProps {
  userEmail: string;
}

export default function DashboardSidebar({ userEmail }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router   = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="hidden md:flex w-56 shrink-0 flex-col bg-white border-r
                      border-[var(--color-border)] min-h-screen">

      {/* Logo */}
      <div className="px-5 py-6 border-b border-[var(--color-border)]">
        <Link href="/" className="font-semibold text-base">
          {siteConfig.name}
        </Link>
        <p className="text-xs text-muted mt-0.5 truncate">{userEmail}</p>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors",
                isActive
                  ? "bg-[var(--color-primary)] text-white font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-[var(--color-border)]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                     text-sm text-red-500 hover:bg-red-50 transition-colors"
        >
          <span>🚪</span> Keluar
        </button>
      </div>

    </aside>
  );
}
