"use client";

import { useState } from "react";

type Product = { id: string; name: string; specification: string; sku?: string };
export function CoaRequestForm({ products, selectedProductId }: { products: Product[]; selectedProductId?: string }) {
  const [message, setMessage] = useState<string>();
  const [pending, setPending] = useState(false);
  async function submit(formData: FormData) {
    setPending(true); setMessage(undefined);
    const response = await fetch("/api/coa-requests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(formData)) });
    const body = await response.json() as { message?: string };
    setPending(false);
    setMessage(response.status === 201 ? "Request received. Staff follow-up channel is pending configuration." : body.message ?? "Unable to submit your request.");
  }
  return <form action={submit} className="border border-navy/10 bg-white p-5 shadow-sm"><h2 className="text-xl">Request a COA</h2><div className="mt-4 grid gap-4"><label className="text-sm font-semibold">Product<select required name="productId" defaultValue={selectedProductId ?? ""} className="form-input"><option value="" disabled>Select a live catalog product</option>{products.map((product) => <option key={product.id} value={product.id}>{product.name} - {product.specification}{product.sku ? ` (${product.sku})` : ""}</option>)}</select></label><div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold">Lot (optional)<input name="lot" className="form-input" /></label><label className="text-sm font-semibold">Order number (optional)<input name="orderNumber" className="form-input" /></label></div><label className="text-sm font-semibold">Email<input required name="email" type="email" className="form-input" /></label><label className="text-sm font-semibold">Message (optional)<textarea name="message" rows={3} className="form-input h-auto" /></label></div><button disabled={pending} className="button-primary mt-5 disabled:bg-slate-300">{pending ? "Sending..." : "Send request"}</button>{message && <p role="status" className="mt-4 text-sm text-slate-700">{message}</p>}</form>;
}