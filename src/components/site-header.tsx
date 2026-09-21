"use client";

import Link from "next/link";
import { Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/components/cart-provider";

const links = [["Home", "/"], ["Shop", "/shop"], ["COAs & Testing", "/coas-testing"], ["Research Information", "/research-information"], ["FAQ", "/faq"], ["Track Order", "/track-order"], ["Contact", "/contact"]] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const cart = useCart();
  return <header className="sticky top-0 z-50 border-b border-navy/10 bg-[#fcfcfa]/95 backdrop-blur"><div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 lg:px-8"><Link href="/" className="font-serif text-2xl tracking-[.08em] text-navy">AUNEVA<span className="text-teal">.</span></Link><nav className="hidden items-center gap-5 xl:flex">{links.map(([label, href]) => <Link key={href} href={href} className="text-[11px] font-bold uppercase tracking-[.08em] text-slate-600 hover:text-teal">{label}</Link>)}</nav><div className="flex items-center gap-1 text-navy"><Link aria-label="Search catalog" href="/shop" className="p-2 hover:text-teal"><Search size={19} /></Link><Link aria-label="Account" href="/account" className="hidden p-2 hover:text-teal sm:block"><UserRound size={19} /></Link><button aria-label="Shopping cart" onClick={cart.open} className="relative p-2 hover:text-teal"><ShoppingBag size={19} /><span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-teal text-[9px] text-white">{cart.count}</span></button><button aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(!open)} className="p-2 xl:hidden">{open ? <X size={22} /> : <Menu size={22} />}</button></div></div>{open && <nav className="border-t border-navy/10 bg-[#fcfcfa] px-6 py-5 xl:hidden">{links.map(([label, href]) => <Link onClick={() => setOpen(false)} key={href} href={href} className="block border-b border-navy/10 py-3 text-sm font-semibold text-navy">{label}</Link>)}</nav>}</header>;
}