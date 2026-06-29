// ============================================================
// app/templates/page.tsx
// Halaman katalog template — data dari Supabase
// ============================================================

import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TemplateCatalog from "@/components/order/TemplateCatalog";
import { supabase } from "@/lib/supabase";

// Fetch templates di server side
async function getTemplates() {
  const { data, error } = await supabase
    .from("templates")
    .select("*")
    .eq("is_active", true)
    .order("price", { ascending: true });

  if (error) return [];
  return data;
}

export const metadata = {
  title: "Pilih Template",
  description: "Pilih template undangan pernikahan yang sesuai dengan tema Anda.",
};

export default async function TemplatesPage() {
  const templates = await getTemplates();

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-semibold mb-2">Pilih Template</h1>
            <p className="text-muted text-sm">
              {templates.length} template tersedia. Klik template untuk mulai kustomisasi.
            </p>
          </div>

          <Suspense fallback={<p className="text-center text-muted">Memuat template...</p>}>
            <TemplateCatalog templates={templates} />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}
