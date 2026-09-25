import { CheckoutForm } from "@/components/checkout-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getCurrentCustomer } from "@/lib/customers";

export const dynamic = "force-dynamic";
export default async function CheckoutPage() {
  const customer = await getCurrentCustomer();
  return <><SiteHeader /><main><section className="page-hero py-12"><div className="mx-auto max-w-6xl px-6"><p className="eyebrow">Checkout</p><h1 className="mt-3 font-serif text-4xl text-ink">Complete your order</h1><p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">Review your order details before continuing. Guest checkout remains available, and saved cards are not offered.</p></div></section><section className="mx-auto max-w-6xl px-6 py-10"><CheckoutForm customer={customer ? { name: `${customer.firstName} ${customer.lastName}`, email: customer.email, phone: customer.phone } : undefined} addresses={customer?.addresses ?? []} /></section></main><SiteFooter /></>;
}