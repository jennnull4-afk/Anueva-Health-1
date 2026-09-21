import { CheckoutForm } from "@/components/checkout-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function CheckoutPage() { return <><SiteHeader /><main className="mx-auto max-w-6xl px-6 py-16"><p className="eyebrow">Checkout</p><h1 className="mt-3 font-serif text-5xl text-ink">Complete your order</h1><p className="mt-4 max-w-2xl leading-7 text-slate-600">Review your order details before continuing to a configured payment provider.</p><div className="mt-10"><CheckoutForm /></div></main><SiteFooter /></>; }