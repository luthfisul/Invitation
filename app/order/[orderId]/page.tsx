// ============================================================
// app/order/[orderId]/page.tsx
// Halaman kustomisasi order — form data undangan
// Phase 3: form sederhana. Phase 9-10: akan diganti AI chatbot
// ============================================================

import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OrderForm from "@/components/order/OrderForm";
import { getOrderWithDetails } from "@/lib/orders";

interface PageProps {
  params: { orderId: string };
}

export async function generateMetadata({ params }: PageProps) {
  return {
    title: `Kustomisasi Undangan`,
    description: "Isi data undangan pernikahan Anda.",
  };
}

export default async function OrderPage({ params }: PageProps) {
  let order;
  try {
    order = await getOrderWithDetails(params.orderId);
  } catch {
    notFound();
  }

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="max-w-2xl mx-auto px-6">

          {/* Header */}
          <div className="mb-8">
            <p className="text-xs text-muted mb-1">
              {order.order_number}
            </p>
            <h1 className="text-2xl font-semibold">
              Kustomisasi Undangan
            </h1>
            <p className="text-sm text-muted mt-1">
              Template:{" "}
              <span className="text-primary font-medium">
                {order.templates?.name ?? "-"}
              </span>
            </p>
          </div>

          {/* Form */}
          <OrderForm
            orderId={params.orderId}
            initialData={order.invitation_data}
          />

        </div>
      </main>
      <Footer />
    </>
  );
}
