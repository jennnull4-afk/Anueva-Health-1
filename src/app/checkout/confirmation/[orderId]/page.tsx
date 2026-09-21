import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getOrder } from "@/lib/orders";

export const dynamic = "force-dynamic";

export default async function CheckoutConfirmation({ params }: { params: Promise<{ orderId: string }> }) {
  const order = await getOrder((await params).orderId);
  if (!order) notFound();
  const total = new Intl.NumberFormat("en-US", { style: "currency", currency: order.currency }).format(order.total);
  return <><SiteHeader /><main className="mx-auto max-w-3xl px-6 py-20"><p className="eyebrow">Order created</p><h1 className="mt-3 font-serif text-5xl text-ink">Payment pending</h1><div className="mt-8 border-l-4 border-teal bg-teal-50 p-6"><p className="font-semibold text-ink">Order {order.id}</p><p className="mt-2 text-slate-600">Status: {order.status}</p><p className="mt-2 text-slate-600">Order total: {total}</p></div><p className="mt-8 leading-7 text-slate-600">Your order has not been submitted to PrymaLab fulfillment. A verified payment event from the configured payment provider is required before the order can be marked Paid and submitted to fulfillment.</p></main><SiteFooter /></>;
}