import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function NotFound() {
  return <><SiteHeader /><main className="page-hero"><div className="section-shell"><p className="eyebrow">Page not found</p><h1 className="mt-3">This page is not available.</h1><p className="mt-4 max-w-xl leading-7 text-slate-600">The address may be outdated, or the requested catalog item is no longer listed.</p><Link href="/shop" className="button-primary mt-7">Return to the catalog</Link></div></main><SiteFooter /></>;
}
