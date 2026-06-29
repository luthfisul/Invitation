// ============================================================
// app/dashboard/profile/page.tsx
// Halaman profil customer — edit nama, email, password
// ============================================================

import { requireAuth }          from "@/lib/auth";
import { createServerSupabase } from "@/lib/auth";
import ProfileForm              from "@/components/dashboard/ProfileForm";

export const metadata = { title: "Profil Saya" };

export default async function ProfilePage() {
  const user     = await requireAuth();
  const supabase = createServerSupabase();

  const { data: profile } = await supabase
    .from("users")
    .select("full_name, phone, avatar_url")
    .eq("id", user.id)
    .single();

  return (
    <div className="space-y-6 max-w-sm">
      <h1 className="text-lg font-semibold">Profil Saya</h1>

      <div className="bg-white border border-[var(--color-border)]
                      rounded-2xl p-6">
        <p className="text-xs text-muted uppercase tracking-widest mb-5">
          Informasi Akun
        </p>
        <ProfileForm
          userId={user.id}
          initialData={{
            fullName: profile?.full_name ?? user.user_metadata?.full_name ?? "",
            phone:    profile?.phone     ?? "",
            email:    user.email         ?? "",
          }}
        />
      </div>
    </div>
  );
}
