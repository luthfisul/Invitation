// ============================================================
// app/admin/layout.tsx
// Layout admin panel — proteksi role, sidebar navigasi
// ============================================================

import { requireAdmin }     from "@/lib/admin";
import AdminSidebar         from "@/components/admin/AdminSidebar";
import AdminHeader          from "@/components/admin/AdminHeader";

export const metadata = { title: { default: "Admin", template: "%s | Admin" } };

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();

  return (
    <div className="min-h-screen flex bg-gray-50">
      <AdminSidebar userEmail={user.email ?? ""} />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader />
        <main className="flex-1 p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
