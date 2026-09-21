import { TrackOrderForm } from "@/components/track-order-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function TrackOrderPage() { return <><SiteHeader /><main className="min-h-[60vh] bg-[#edf7f6] px-6 py-16"><div className="mx-auto max-w-4xl"><p className="eyebrow">Order support</p><h1 className="mt-3 font-serif text-5xl text-ink">Track your order</h1><p className="mt-5 max-w-xl leading-7 text-slate-600">Enter the Auneva order ID and email used at checkout to view the current fulfillment status and available carrier tracking.</p><div className="mt-8"><TrackOrderForm /></div></div></main><SiteFooter /></>; }