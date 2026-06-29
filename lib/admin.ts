// ============================================================
// lib/admin.ts
// Admin helpers — verifikasi role admin, query analytics
// ============================================================

import { createServerSupabase } from "@/lib/auth";
import { redirect }             from "next/navigation";

// ── Daftar email admin (simple role system) ──────────────────
// Phase 8: pakai whitelist email di env
// Phase lanjut: bisa tambah kolom role di tabel users

function getAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS ?? "";
  return raw.split(",").map((e) => e.trim()).filter(Boolean);
}

// ── Require Admin Auth ────────────────────────────────────────

export async function requireAdmin() {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const adminEmails = getAdminEmails();
  if (!adminEmails.includes(user.email ?? "")) {
    redirect("/dashboard"); // bukan admin → ke dashboard customer
  }

  return user;
}

// ── Analytics Queries ─────────────────────────────────────────

export async function getAdminStats() {
  const supabase = createServerSupabase();

  const [
    { count: totalOrders },
    { count: publishedOrders },
    { count: pendingOrders },
    { count: totalCustomers },
  ] = await Promise.all([
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("users").select("*",  { count: "exact", head: true }),
  ]);

  // Total revenue dari order yang sudah paid/published
  const { data: revenueData } = await supabase
    .from("orders")
    .select("total_amount")
    .in("status", ["paid", "published"]);

  const totalRevenue = (revenueData ?? []).reduce(
    (sum, o) => sum + (o.total_amount ?? 0), 0
  );

  // Total views semua undangan
  const { data: viewData } = await supabase
    .from("invitations")
    .select("view_count");

  const totalViews = (viewData ?? []).reduce(
    (sum, i) => sum + (i.view_count ?? 0), 0
  );

  return {
    totalOrders:     totalOrders   ?? 0,
    publishedOrders: publishedOrders ?? 0,
    pendingOrders:   pendingOrders ?? 0,
    totalCustomers:  totalCustomers ?? 0,
    totalRevenue,
    totalViews,
  };
}

// ── Revenue per hari (7 hari terakhir) ───────────────────────

export async function getRevenueChart() {
  const supabase = createServerSupabase();

  const { data } = await supabase
    .from("orders")
    .select("total_amount, created_at")
    .in("status", ["paid", "published"])
    .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .order("created_at", { ascending: true });

  // Group by date
  const grouped: Record<string, number> = {};
  for (const order of data ?? []) {
    const date = new Date(order.created_at).toLocaleDateString("id-ID", {
      day: "numeric", month: "short",
    });
    grouped[date] = (grouped[date] ?? 0) + order.total_amount;
  }

  return Object.entries(grouped).map(([date, revenue]) => ({ date, revenue }));
}

// ── Template popularity ───────────────────────────────────────

export async function getTemplateStats() {
  const supabase = createServerSupabase();

  const { data } = await supabase
    .from("orders")
    .select("template_id, templates ( name )")
    .in("status", ["paid", "published"]);

  const counter: Record<string, { name: string; count: number }> = {};

  for (const order of data ?? []) {
    const tpl = order.templates as unknown as { name: string } | null;
    if (!order.template_id || !tpl) continue;
    if (!counter[order.template_id]) {
      counter[order.template_id] = { name: tpl.name, count: 0 };
    }
    counter[order.template_id].count++;
  }

  return Object.values(counter).sort((a, b) => b.count - a.count);
}
