// app/order/[orderId]/success/page.tsx
import { notFound }              from "next/navigation";
import { getOrderWithDetails }   from "@/lib/orders";
import { getPublishedByOrderId } from "@/lib/invitation-generator";
import InvitationDelivery        from "@/components/invitation/InvitationDelivery";
import Navbar                    from "@/components/Navbar";
import Footer                    from "@/components/Footer";
import type { InvitationDataRow } from "@/types/database";
import { formatDateID }          from "@/lib/utils";

interface PageProps {
  params: Promise<{ orderId: string }>;
}

export const metadata = { title: "Undangan Siap!" };

export default async function SuccessPage({ params }: PageProps) {
  const { orderId } = await params;
  let order;
  try { order = await getOrderWithDetails(orderId); }
  catch { notFound(); }

  const invitation = await getPublishedByOrderId(orderId);
  if (!invitation) notFound();

  const invData = order.invitation_data as InvitationDataRow | null;

  return (
    <>
      <Navbar />
      <main className="pt-20 pb-10 min-h-screen">
        <InvitationDelivery
          invitation={invitation}
          brideNickName={invData?.bride_nick_name ?? invData?.bride_full_name?.split(" ")[0] ?? "Mempelai Wanita"}
          groomNickName={invData?.groom_nick_name ?? invData?.groom_full_name?.split(" ")[0] ?? "Mempelai Pria"}
          eventDate={invData?.event_date ? formatDateID(invData.event_date) : "Segera"}
        />
      </main>
      <Footer />
    </>
  );
}
