// ============================================================
// lib/auth.ts
// Authentication helpers menggunakan Supabase Auth
// Dipakai di seluruh dashboard customer
// ============================================================

import { createClient }       from "@supabase/supabase-js";
import { cookies }            from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database }      from "@/types/database";

// ── Server-side client (Server Components & API Routes) ──────

export function createServerSupabase() {
  const cookieStore = cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name)         { return cookieStore.get(name)?.value; },
        set(name, value, options) {
          try { cookieStore.set({ name, value, ...options }); } catch {}
        },
        remove(name, options) {
          try { cookieStore.set({ name, value: "", ...options }); } catch {}
        },
      },
    }
  );
}

// ── Get current user (Server Component) ──────────────────────

export async function getCurrentUser() {
  const supabase = createServerSupabase();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

// ── Get current session ───────────────────────────────────────

export async function getSession() {
  const supabase = createServerSupabase();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// ── Require auth — redirect jika belum login ─────────────────

export async function requireAuth() {
  const { redirect } = await import("next/navigation");
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
