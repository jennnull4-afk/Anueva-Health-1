import { CartPage } from "@/components/cart-page";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function CartRoute() { return <><SiteHeader /><main><section className="page-hero py-12"><div className="mx-auto max-w-6xl px-6"><p className="eyebrow">Cart</p><h1 className="mt-3 font-serif text-5xl text-ink">Your research cart</h1></div></section><section className="mx-auto max-w-6xl px-6 py-10"><CartPage /></section></main><SiteFooter /></>; }