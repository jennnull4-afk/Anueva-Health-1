import { TrackOrderForm } from "@/components/track-order-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function TrackOrderPage() { return <><SiteHeader /><main><section className="page-hero py-12"><div className="mx-auto max-w-4xl px-6"><p className="eyebrow">Order support</p><h1 className="mt-3 font-serif text-5xl text-ink">Track your order</h1><p className="mt-5 max-w-xl leading-7 text-slate-600">Enter the Auneva order ID and email used at checkout to view the current fulfillment status and available carrier tracking.</p></div></section><section className="mx-auto max-w-4xl px-6 py-10"><TrackOrderForm /></section></main><SiteFooter /></>; }