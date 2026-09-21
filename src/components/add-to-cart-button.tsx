"use client";

import { ShoppingBag } from "lucide-react";
import { type CartProduct, useCart } from "@/components/cart-provider";

export function AddToCartButton({ product }: { product: CartProduct }) {
  const cart = useCart();
  return <button onClick={() => { cart.add(product); cart.open(); }} className="button-primary w-full">Add to cart <ShoppingBag size={17} /></button>;
}