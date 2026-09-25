"use client";

import { useState } from "react";
import { useCart } from "@/components/cart-provider";
import type { CartProduct } from "@/components/cart-provider";

export function ReorderButton({ products }: { products: CartProduct[] }) {
  const cart = useCart();
  const [message, setMessage] = useState("");
  if (!products.length) return <p className="text-sm text-slate-600">None of these items are currently available to reorder.</p>;
  return <div><button type="button" className="button-secondary" onClick={() => { products.forEach((product) => cart.add(product)); cart.open(); setMessage("Available items were added at current catalog prices. Checkout and research-use acknowledgement are still required."); }}>Reorder available items</button>{message && <p role="status" className="mt-2 text-sm text-teal">{message}</p>}</div>;
}
