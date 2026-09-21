"use client";

import { useActionState } from "react";
import { ExternalLink, Search } from "lucide-react";
import { lookupOrder, type TrackingLookupState } from "@/app/track-order/actions";

const initialState: TrackingLookupState = {};

export function TrackOrderForm() {
  const [state, formAction, pending] = useActionState(lookupOrder, initialState);
  return <form action={formAction} className="max-w-xl border border-navy/10 bg-white p-6 shadow-sm"><div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto]"><label className="text-sm font-semibold">Order ID<input required name="orderId" placeholder="AUN-2026-..." className="form-input" /></label><label className="text-sm font-semibold">Order email<input required type="email" name="email" className="form-input" /></label><button disabled={pending} className="button-primary mt-auto disabled:bg-slate-300">{pending ? "Searching..." : "Find order"} <Search size={15} /></button></div>{state.error && <p role="alert" className="mt-5 border border-red-200 bg-red-50 p-3 text-sm text-red-950">{state.error}</p>}{state.order && <section className="mt-6 border-t border-navy/10 pt-5"><p className="eyebrow">Order {state.order.id}</p><p className="mt-2 font-serif text-3xl text-ink">{state.order.status}</p>{state.order.trackingNumber ? <div className="mt-5 border-l-4 border-teal bg-teal-50 p-4"><p className="text-sm text-slate-600">Carrier</p><p className="font-semibold text-ink">{state.order.carrier ?? "Carrier update pending"}</p><p className="mt-4 text-sm text-slate-600">Tracking number</p><p className="font-semibold text-ink">{state.order.trackingNumber}</p>{state.order.trackingUrl && <a href={state.order.trackingUrl} target="_blank" rel="noreferrer" className="button-primary mt-5">Track package <ExternalLink size={15} /></a>}</div> : <p className="mt-4 text-sm leading-6 text-slate-600">Tracking details will appear here when fulfillment has shipped your order.</p>}</section>}</form>;
}