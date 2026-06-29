// ============================================================
// components/dashboard/DashboardHeader.tsx
// Header mobile dashboard dengan hamburger menu
// ============================================================

"use client";

import { useState }        from "react";
import Link                from "next/link";
import { usePathname }     from "next/navigation";
import { useRouter }       from "next/navigation";
import { createClient }    from "@supabase/supabase-js";
import { siteConfig }      from "@/config/site";
import { cn }              from "@/lib/utils";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const navItems = [
  { href: "/dashboard",         label: "Beranda", icon: "🏠" },
  { href: "/dashboard/orders",  label: "Pesanan", icon: "📋" },
  { href: "/dashboard/profile", label: "Profil",  icon: "👤" },
];

interface DashboardHeaderProps {
  userName: string;
}

export default function DashboardHeader({ userName }: DashboardHeaderProps) {
  const pathname    = usePathname();
  const router      = useRouter();
  const [open, setOpen] = useState(false);

  const pageTitle = navItems.find((n) =>
    n.href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(n.href)
  )?.label ?? "Dashboard";

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      <header className="bg-white border-b border-[var(--color-border)]
                         px-6 h-14 flex items-center justify-between sticky top-0 z-30">
        {/* Mobile: hamburger + title */}
        <div className="flex items-center gap-3">
          <button
            className="md:hidden p-1"
            onClick={() => setOpen(true)}
            aria-label="Buka menu"
          >
            <div className="space-y-1.5">
              <span className="block w-5 h-0.5 bg-gray-700" />
              <span className="block w-5 h-0.5 bg-gray-700" />
              <span className="block w-5 h-0.5 bg-gray-700" />
            </div>
          </button>
          <h1 className="text-sm font-semibold">{pageTitle}</h1>
        </div>

        {/* Right: greeting */}
        <p className="text-xs text-muted hidden sm:block">
          Halo, <span className="font-medium text-gray-700">{userName.split(" ")[0]}</span> 👋
        </p>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          {/* Drawer */}
          <div className="absolute left-0 top-0 bottom-0 w-56 bg-white flex flex-col shadow-xl">
            <div className="px-5 py-5 border-b border-[var(--color-border)] flex justify-between items-center">
              <span className="font-semibold">{siteConfig.name}</span>
              <button onClick={() => setOpen(false)} className="text-xl text-gray-400">×</button>
            </div>
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
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm",
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
            <div className="px-3 py-4 border-t border-[var(--color-border)]">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                           text-sm text-red-500 hover:bg-red-50"
              >
                <span>🚪</span> Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
