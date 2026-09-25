import Link from "next/link";
import { redirect } from "next/navigation";
import { AccountShell } from "@/components/account-shell";
import { getCurrentCustomer } from "@/lib/customers";
import { listOrdersForCustomer } from "@/lib/orders";

export const dynamic = "force-dynamic";
const active = new Set(["Pending Payment", "Paid", "Submitted to Fulfillment", "Processing", "Shipped", "On Hold", "FULFILLMENT SUBMISSION FAILED"]);

export default async function AccountDashboard() {
  const customer = await getCurrentCustomer();
  if (!customer) redirect("/account/sign-in");
  const orders = await listOrdersForCustomer(customer.id);
  const currentOrders = orders.filter((order) => active.has(order.status)).slice(0, 3);
  return <AccountShell customer={customer} title="Dashboard"><h1 className="font-serif text-3xl">Welcome, {customer.firstName}.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Review current orders, saved details, and account security from one place.</p><div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[["Current orders", String(currentOrders.length), "/account/orders"], ["Saved addresses", String(customer.addresses.length), "/account/addresses"], ["Payment methods", "Unavailable", "/account/payments"], ["Catalog", "Shop", "/shop"]].map(([label, value, href]) => <Link key={label} href={href} className="account-card"><span className="text-xs font-bold uppercase tracking-[.1em] text-slate-500">{label}</span><strong className="mt-2 block font-serif text-2xl">{value}</strong></Link>)}</div><section className="mt-8"><h2 className="font-serif text-2xl">Current orders</h2>{currentOrders.length === 0 ? <p className="mt-3 text-sm text-slate-600">No active orders are associated with this account.</p> : <div className="mt-4 grid gap-3">{currentOrders.map((order) => <article key={order.id} className="account-card"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-semibold">{order.id}</p><p className="text-sm text-slate-500">{new Date(order.createdAt).toLocaleDateString()} · {order.status}</p></div><Link href={`/account/orders/${order.id}`} className="button-secondary">View order</Link></div></article>)}</div>}</section><div className="mt-6 flex flex-wrap gap-3"><Link href="/account/support" className="button-secondary">Contact support</Link><Link href="/shop" className="button-primary">Browse catalog</Link></div></AccountShell>;
}
