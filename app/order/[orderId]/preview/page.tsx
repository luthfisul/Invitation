// ============================================================
// app/order/[orderId]/preview/page.tsx
// Halaman preview undangan — tampilan full sebelum bayar
// ============================================================

import { notFound }         from "next/navigation";
import { getOrderWithDetails } from "@/lib/orders";
import { buildRenderData }  from "@/lib/template-engine";
import TemplateRenderer     from "@/components/template-engine/TemplateRenderer";
import PreviewBar           from "@/components/template-engine/PreviewBar";
import type { InvitationDataRow, TemplateRow } from "@/types/database";

interface PageProps {
  params: { orderId: string };
}

export const metadata = { title: "Preview Undangan" };

export default async function PreviewPage({ params }: PageProps) {
  let order;
  try {
    order = await getOrderWithDetails(params.orderId);
  } catch {
    notFound();
  }

  if (!order.templates || !order.invitation_data) {
    notFound();
  }

  const renderData = buildRenderData(
    order.templates  as TemplateRow,
    order.invitation_data as InvitationDataRow
  );

  return (
    <div className="relative">
      {/* Bar atas: info order + tombol aksi */}
      <PreviewBar
        orderId={params.orderId}
        orderNumber={order.order_number}
        templateName={order.templates.name}
        status={order.status}
      />

      {/* Render template penuh */}
      <div className="pt-14">
        <TemplateRenderer data={renderData} preview={false} />
      </div>
    </div>
  );
}
