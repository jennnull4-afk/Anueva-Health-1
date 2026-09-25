import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { signOutAction } from "@/app/account/actions";
import type { PublicCustomer } from "@/lib/customers";

const links = [["Dashboard", "/account"], ["Orders", "/account/orders"], ["Addresses", "/account/addresses"], ["Profile", "/account/profile"], ["Security", "/account/security"], ["Payments", "/account/payments"], ["Support", "/account/support"]] as const;

export function AccountShell({ customer, title, children }: { customer: PublicCustomer; title: string; children: React.ReactNode }) {
  return <><SiteHeader /><main className="account-shell"><aside className="account-nav"><p className="text-xs font-bold uppercase tracking-[.14em] text-teal">Account</p><p className="mt-2 font-serif text-2xl">{customer.firstName}</p><nav className="mt-5 flex gap-2 overflow-x-auto lg:flex-col" aria-label="Account">{links.map(([label, href]) => <Link key={href} href={href} className="account-nav-link">{label}</Link>)}</nav><form action={signOutAction} className="mt-4"><button className="account-nav-link">Sign out</button></form></aside><section><p className="eyebrow">{title}</p><div className="mt-5">{children}</div></section></main><SiteFooter /></>;
}
