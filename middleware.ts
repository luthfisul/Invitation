// ============================================================
// middleware.ts — Root level (sejajar package.json)
// Proteksi route dashboard & admin via Supabase SSR
// ============================================================

import { createServerClient }  from "@supabase/ssr";
import { NextResponse }        from "next/server";
import type { NextRequest }    from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name)              { return req.cookies.get(name)?.value; },
        set(name, value, opts) { res.cookies.set({ name, value, ...opts }); },
        remove(name, opts)     { res.cookies.set({ name, value: "", ...opts }); },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const path = req.nextUrl.pathname;

  // ── Proteksi /dashboard ───────────────────────────────────
  if (path.startsWith("/dashboard") && !user) {
    const url = new URL("/login", req.url);
    url.searchParams.set("redirect", path);
    return NextResponse.redirect(url);
  }

  // ── Proteksi /admin ───────────────────────────────────────
  if (path.startsWith("/admin")) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    // Cek apakah admin — validasi email di server component (lib/admin.ts)
    // Middleware hanya cek login, role dicek di requireAdmin()
  }

  // ── Redirect jika sudah login ─────────────────────────────
  const authRoutes = ["/login", "/register"];
  if (authRoutes.includes(path) && user) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/login", "/register"],
};
