import Link from "next/link";

const shopLinks = [["Shop All", "/shop"], ["COAs & Testing", "/coas-testing"], ["Research Information", "/research-information"], ["Track Order", "/track-order"]] as const;
const supportLinks = [["FAQ", "/faq"], ["Contact Us", "/contact"], ["Shipping Policy", "/shipping"], ["Return & Refund Policy", "/returns"]] as const;
const legalLinks = [["Terms & Conditions", "/terms"], ["Privacy Policy", "/privacy"], ["Research Use & Compliance", "/research-use"], ["Cookie Policy", "/cookies"], ["Accessibility", "/accessibility"]] as const;

function FooterLinks({ title, links }: { title: string; links: readonly (readonly [string, string])[] }) {
  return <div><p className="text-xs font-bold uppercase tracking-[.15em] text-teal-200">{title}</p><ul className="mt-4 space-y-2">{links.map(([label, href]) => <li key={href}><Link className="text-sm text-slate-300 hover:text-white" href={href}>{label}</Link></li>)}</ul></div>;
}

export function SiteFooter() {
  return <footer className="bg-navy text-white"><div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1fr_1fr] lg:px-8"><div><p className="font-serif text-3xl tracking-[.1em]">AUNEVA RESEARCH<span className="text-teal-200">.</span></p><p className="mt-4 max-w-xs text-sm leading-6 text-slate-300">Premium research products with quality documentation and dependable fulfillment.</p></div><FooterLinks title="Shop" links={shopLinks} /><FooterLinks title="Support" links={supportLinks} /><FooterLinks title="Legal" links={legalLinks} /></div><div className="border-t border-white/10"><div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-6 text-xs text-slate-300 lg:px-8"><span>© 2026 Auneva Research. All rights reserved.</span><p className="max-w-lg font-bold leading-5 tracking-[.08em] text-teal-200">FOR LABORATORY RESEARCH USE ONLY.<br />NOT FOR HUMAN OR VETERINARY CONSUMPTION.</p><p>Products are not intended to diagnose, treat, cure or prevent disease.</p></div></div></footer>;
}
