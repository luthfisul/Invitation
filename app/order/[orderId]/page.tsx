// app/order/[orderId]/page.tsx
import { notFound }            from "next/navigation";
import Navbar                  from "@/components/Navbar";
import Footer                  from "@/components/Footer";
import OrderForm               from "@/components/order/OrderForm";
import { getOrderWithDetails } from "@/lib/orders";

interface PageProps {
  params: Promise<{ orderId: string }>;
}

export const metadata = { title: "Kustomisasi Undangan" };

export default async function OrderPage({ params }: PageProps) {
  const { orderId } = await params;
  let order;
  try { order = await getOrderWithDetails(orderId); }
  catch { notFound(); }

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="max-w-2xl mx-auto px-6">
          <div className="mb-8">
            <p className="text-xs text-muted mb-1">{order.order_number}</p>
            <h1 className="text-2xl font-semibold">Kustomisasi Undangan</h1>
            <p className="text-sm text-muted mt-1">
              Template: <span className="text-primary font-medium">{order.templates?.name ?? "-"}</span>
            </p>
          </div>
          <OrderForm orderId={orderId} initialData={order.invitation_data} />
        </div>
      </main>
      <Footer />
    </>
  );
}
