"use client";

import Link from "next/link";
import { createContext, useContext, useEffect, useState } from "react";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";

export interface CartProduct { id: string; slug: string; name: string; specification: string; retailPrice: number; currency: string; }
export interface CartLine extends CartProduct { quantity: number; }
interface CartContextValue { lines: CartLine[]; count: number; subtotal: number; currency: string; add: (product: CartProduct) => void; setQuantity: (id: string, quantity: number) => void; remove: (id: string) => void; clear: () => void; open: () => void; }
const CartContext = createContext<CartContextValue | null>(null);
const formatMoney = (amount: number, currency: string) => new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);

export function useCart() { const context = useContext(CartContext); if (!context) throw new Error("useCart must be used inside CartProvider"); return context; }

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { const timer = window.setTimeout(() => { try { const saved = window.localStorage.getItem("auneva-cart"); if (saved) setLines(JSON.parse(saved)); } finally { setHydrated(true); } }, 0); return () => window.clearTimeout(timer); }, []);
  useEffect(() => { if (hydrated) window.localStorage.setItem("auneva-cart", JSON.stringify(lines)); }, [hydrated, lines]);
  const setQuantity = (id: string, quantity: number) => setLines((current) => quantity < 1 ? current.filter((item) => item.id !== id) : current.map((item) => item.id === id ? { ...item, quantity } : item));
  const add = (product: CartProduct) => setLines((current) => { const line = current.find((item) => item.id === product.id); return line ? current.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item) : [...current, { ...product, quantity: 1 }]; });
  const count = lines.reduce((total, line) => total + line.quantity, 0);
  const subtotal = lines.reduce((total, line) => total + line.retailPrice * line.quantity, 0);
  const currency = lines[0]?.currency ?? "USD";
  const value = { lines, count, subtotal, currency, add, setQuantity, remove: (id: string) => setQuantity(id, 0), clear: () => setLines([]), open: () => setOpen(true) };
  return <CartContext.Provider value={value}>{children}{open && <aside role="dialog" aria-modal="true" aria-label="Shopping cart" className="fixed inset-y-0 right-0 z-[90] flex w-full max-w-md flex-col bg-white shadow-2xl"><div className="flex items-center justify-between border-b border-navy/10 p-5"><p className="font-serif text-2xl text-ink">Your cart</p><button onClick={() => setOpen(false)} aria-label="Close cart" className="p-2"><X size={20} /></button></div><div className="flex-1 overflow-y-auto p-5">{lines.length === 0 ? <div className="py-16 text-center"><ShoppingBag className="mx-auto text-teal" size={28} /><p className="mt-4 font-serif text-2xl">Your cart is empty</p><p className="mt-2 text-sm text-slate-500">Browse research products to begin.</p><Link href="/shop" onClick={() => setOpen(false)} className="button-primary mt-6">Browse catalog</Link></div> : lines.map((line) => <div key={line.id} className="border-b border-navy/10 py-4"><div className="flex justify-between gap-4"><div><p className="font-semibold">{line.name}</p><p className="mt-1 text-sm text-slate-500">{line.specification}</p></div><button onClick={() => setQuantity(line.id, 0)} aria-label={`Remove ${line.name}`} className="h-fit p-1 text-slate-500 hover:text-red-700"><Trash2 size={16} /></button></div><div className="mt-3 flex items-center justify-between"><div className="flex items-center border border-navy/15"><button onClick={() => setQuantity(line.id, line.quantity - 1)} className="p-2" aria-label={`Remove one ${line.name}`}><Minus size={14} /></button><span className="min-w-8 text-center text-sm">{line.quantity}</span><button onClick={() => setQuantity(line.id, line.quantity + 1)} className="p-2" aria-label={`Add one ${line.name}`}><Plus size={14} /></button></div><p className="font-semibold">{formatMoney(line.retailPrice * line.quantity, currency)}</p></div></div>)}</div>{lines.length > 0 && <div className="border-t border-navy/10 p-5 text-sm"><div className="flex justify-between"><span>Subtotal</span><span>{formatMoney(subtotal, currency)}</span></div><div className="mt-3 flex justify-between text-slate-500"><span>Shipping</span><span>Calculated at checkout</span></div><div className="mt-3 flex justify-between border-t border-navy/10 pt-3 text-base font-semibold"><span>Estimated total</span><span>{formatMoney(subtotal, currency)} + shipping</span></div><Link href="/checkout" onClick={() => setOpen(false)} className="button-primary mt-5 w-full">Proceed to checkout</Link></div>}</aside>}</CartContext.Provider>;
}