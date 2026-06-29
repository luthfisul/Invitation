// ============================================================
// app/admin/orders/[orderId]/page.tsx
// Detail order — admin view: info lengkap + update status + publish manual
// ============================================================

import { notFound }             from "next/navigation";
import Link                     from "next/link";
import { requireAdmin }         from "@/lib/admin";
import { createServerSupabase } from "@/lib/auth";
import { formatPrice, formatDateID } from "@/lib/utils";
import AdminOrderActions        from "@/components/admin/AdminOrderActions";
import type {
  TemplateRow, InvitationDataRow, InvitationRow, PaymentRow,
} from "@/types/database";

interface PageProps { params: { orderId: string } }

export const metadata = { title: "Detail Pesanan" };

export default async function AdminOrderDetailPage({ params }: PageProps) {
  await requireAdmin();
  const supabase = createServerSupabase();

  const { data: order, error } = await supabase
    .from("orders")
    .select(`
      *,
      templates (*),
      invitation_data (*),
      invitations (*),
      payments (*),
      users ( id, full_name, email, phone )
    `)
    .eq("id", params.orderId)
    .single();

  if (error || !order) notFound();

  const template = order.templates      as unknown as TemplateRow | null;
  const invData  = order.invitation_data as unknown as InvitationDataRow | null;
  const inv      = order.invitations    as unknown as InvitationRow | null;
  const payments = Array.isArray(order.payments)
    ? (order.payments as PaymentRow[])
    : [];
  const customer = order.users as unknown as {
    id: string; full_name: string; email: string; phone: string;
  } | null;

  return (
    <div className="space-y-6 max-w-4xl">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/orders"
            className="text-xs text-gray-400 hover:text-gray-600 mb-2 inline-block"
          >
            ← Kembali ke daftar
          </Link>
          <h1 className="text-lg font-semibold">
            {invData?.bride_full_name && invData?.groom_full_name
              ? `${invData.bride_full_name} & ${invData.groom_full_name}`
              : order.order_number}
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">{order.order_number}</p>
        </div>

        {/* Admin actions */}
        <AdminOrderActions
          orderId={order.id}
          currentStatus={order.status}
          isPublished={inv?.is_published ?? false}
          invSlug={inv?.slug ?? null}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-5">

        {/* Info Order */}
        <InfoCard title="Info Pesanan">
          {[
            ["No. Order",  order.order_number],
            ["Status",     order.status],
            ["Template",   template?.name],
            ["Paket",      template?.tier],
            ["Total",      formatPrice(order.total_amount)],
            ["Tgl Order",  new Date(order.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })],
          ].map(([k, v]) => <InfoRow key={k} label={k!} value={v ?? "—"} />)}
        </InfoCard>

        {/* Customer */}
        <InfoCard title="Customer">
          {[
            ["Nama",    customer?.full_name],
            ["Email",   customer?.email],
            ["Telpon",  customer?.phone],
          ].map(([k, v]) => <InfoRow key={k} label={k!} value={v ?? "—"} />)}
          {customer && (
            <Link
              href={`/admin/customers?search=${customer.email}`}
              className="text-xs text-[var(--color-primary)] hover:underline mt-2 inline-block"
            >
              Lihat profil customer →
            </Link>
          )}
        </InfoCard>

        {/* Data Undangan */}
        <InfoCard title="Data Undangan">
          {[
            ["Mempelai Wanita", invData?.bride_full_name],
            ["Mempelai Pria",   invData?.groom_full_name],
            ["Tanggal",         invData?.event_date ? formatDateID(invData.event_date) : null],
            ["Waktu",           invData?.event_time],
            ["Venue",           invData?.venue_name],
            ["Alamat",          invData?.venue_address],
            ["Musik",           invData?.music_url],
            ["RSVP",            invData?.rsvp_enabled ? "Aktif" : "Nonaktif"],
          ].map(([k, v]) => v ? <InfoRow key={k} label={k!} value={v} /> : null)}
          <div className="pt-2 flex gap-2">
            <Link
              href={`/order/${order.id}/preview`}
              target="_blank"
              className="text-xs border border-gray-300 px-3 py-1.5 rounded-full
                         hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]
                         transition-colors"
            >
              Preview →
            </Link>
            {inv?.slug && (
              <Link
                href={`/invitation/${inv.slug}`}
                target="_blank"
                className="text-xs bg-emerald-500 text-white px-3 py-1.5 rounded-full"
              >
                Lihat Live →
              </Link>
            )}
          </div>
        </InfoCard>

        {/* Pembayaran */}
        <InfoCard title="Pembayaran">
          {payments.length === 0 && (
            <p className="text-xs text-gray-400">Belum ada pembayaran.</p>
          )}
          {payments.map((p, i) => (
            <div key={p.id} className={i > 0 ? "pt-3 mt-3 border-t border-gray-100" : ""}>
              {[
                ["Metode",        p.method],
                ["Status",        p.status],
                ["Jumlah",        formatPrice(p.amount)],
                ["Transaction ID", p.transaction_id],
                ["Dibayar",       p.paid_at ? new Date(p.paid_at).toLocaleString("id-ID") : null],
              ].map(([k, v]) => v ? <InfoRow key={k} label={k!} value={v} /> : null)}
            </div>
          ))}
        </InfoCard>

        {/* Undangan Published */}
        {inv?.is_published && (
          <InfoCard title="Undangan Aktif">
            {[
              ["Slug",       inv.slug],
              ["Published",  inv.published_at ? new Date(inv.published_at).toLocaleString("id-ID") : null],
              ["Dilihat",    `${inv.view_count ?? 0} kali`],
            ].map(([k, v]) => v ? <InfoRow key={k} label={k!} value={v} /> : null)}
          </InfoCard>
        )}

      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
        {title}
      </p>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 text-sm">
      <span className="text-gray-400 shrink-0">{label}</span>
      <span className="text-gray-700 text-right break-all">{value}</span>
    </div>
  );
}
