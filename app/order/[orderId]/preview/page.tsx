// app/order/[orderId]/preview/page.tsx
import { notFound }            from "next/navigation";
import { getOrderWithDetails } from "@/lib/orders";
import { buildRenderData }     from "@/lib/template-engine";
import TemplateRenderer        from "@/components/template-engine/TemplateRenderer";
import PreviewBar              from "@/components/template-engine/PreviewBar";
import type { InvitationDataRow, TemplateRow } from "@/types/database";

interface PageProps {
  params: Promise<{ orderId: string }>;
}

export const metadata = { title: "Preview Undangan" };

export default async function PreviewPage({ params }: PageProps) {
  const { orderId } = await params;
  let order;
  try { order = await getOrderWithDetails(orderId); }
  catch { notFound(); }

  if (!order.templates || !order.invitation_data) notFound();

  const renderData = buildRenderData(
    order.templates as TemplateRow,
    order.invitation_data as InvitationDataRow
  );

  return (
    <div className="relative">
      <PreviewBar
        orderId={orderId}
        orderNumber={order.order_number}
        templateName={order.templates.name}
        status={order.status}
      />
      <div className="pt-14">
        <TemplateRenderer data={renderData} preview={false} />
      </div>
    </div>
  );
}
