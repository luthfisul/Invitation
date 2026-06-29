// ============================================================
// app/dashboard/layout.tsx
// Layout dashboard — proteksi auth, sidebar navigasi
// ============================================================

import { redirect }         from "next/navigation";
import { requireAuth }      from "@/lib/auth";
import DashboardSidebar     from "@/components/dashboard/DashboardSidebar";
import DashboardHeader      from "@/components/dashboard/DashboardHeader";

export const metadata = { title: "Dashboard" };

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Proteksi: redirect ke login jika belum auth
  const user = await requireAuth();

  return (
    <div className="min-h-screen flex bg-[var(--color-light)]">

      {/* Sidebar — hidden di mobile */}
      <DashboardSidebar userEmail={user.email ?? ""} />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader
          userName={user.user_metadata?.full_name ?? user.email ?? ""}
        />
        <main className="flex-1 p-6 md:p-8 max-w-5xl w-full mx-auto">
          {children}
        </main>
      </div>

    </div>
  );
}
