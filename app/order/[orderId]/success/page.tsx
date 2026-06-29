// ============================================================
// app/order/[orderId]/success/page.tsx
// Halaman sukses setelah undangan di-publish.
// Dituju setelah payment webhook trigger generateInvitation().
// ============================================================

import { notFound }              from "next/navigation";
import { getOrderWithDetails }   from "@/lib/orders";
import { getPublishedByOrderId } from "@/lib/invitation-generator";
import InvitationDelivery        from "@/components/invitation/InvitationDelivery";
import Navbar                    from "@/components/Navbar";
import Footer                    from "@/components/Footer";
import type { InvitationDataRow } from "@/types/database";
import { formatDateID }          from "@/lib/utils";

interface PageProps {
  params: { orderId: string };
}

export const metadata = { title: "Undangan Siap!" };

export default async function SuccessPage({ params }: PageProps) {
  // 1. Ambil order + invitation_data
  let order;
  try {
    order = await getOrderWithDetails(params.orderId);
  } catch {
    notFound();
  }

  // 2. Ambil published invitation
  const invitation = await getPublishedByOrderId(params.orderId);
  if (!invitation) {
    // Belum dipublish — redirect ke preview
    notFound();
  }

  const invData = order.invitation_data as InvitationDataRow | null;

  return (
    <>
      <Navbar />
      <main className="pt-20 pb-10 min-h-screen">
        <InvitationDelivery
          invitation={invitation}
          brideNickName={
            invData?.bride_nick_name ??
            invData?.bride_full_name?.split(" ")[0] ??
            "Mempelai Wanita"
          }
          groomNickName={
            invData?.groom_nick_name ??
            invData?.groom_full_name?.split(" ")[0] ??
            "Mempelai Pria"
          }
          eventDate={
            invData?.event_date
              ? formatDateID(invData.event_date)
              : "Segera"
          }
        />
      </main>
      <Footer />
    </>
  );
}
