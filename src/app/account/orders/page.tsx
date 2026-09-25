import Link from "next/link";
import { redirect } from "next/navigation";
import { AccountShell } from "@/components/account-shell";
import { getCurrentCustomer } from "@/lib/customers";
import { listOrdersForCustomer, orderStatuses } from "@/lib/orders";

export const dynamic = "force-dynamic";
export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; from?: string; to?: string }> }) {
  const customer = await getCurrentCustomer();
  if (!customer) redirect("/account/sign-in");
  const { q = "", status = "", from = "", to = "" } = await searchParams;
  const query = q.trim().toLowerCase();
  const orders = (await listOrdersForCustomer(customer.id)).filter((order) => (!query || order.id.toLowerCase().includes(query)) && (!status || order.status === status) && (!from || order.createdAt.slice(0, 10) >= from) && (!to || order.createdAt.slice(0, 10) <= to));
  return <AccountShell customer={customer} title="Order history"><h1 className="font-serif text-3xl">Orders</h1><form className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5"><label className="text-sm font-semibold">Order number<input name="q" defaultValue={q} className="form-input" /></label><label className="text-sm font-semibold">Status<select name="status" defaultValue={status} className="form-input"><option value="">All statuses</option>{orderStatuses.map((item) => <option key={item}>{item}</option>)}</select></label><label className="text-sm font-semibold">From<input type="date" name="from" defaultValue={from} className="form-input" /></label><label className="text-sm font-semibold">To<input type="date" name="to" defaultValue={to} className="form-input" /></label><button className="button-primary self-end">Filter</button></form>{orders.length === 0 ? <p className="mt-6 text-sm text-slate-600">No orders match these filters.</p> : <div className="mt-6 grid gap-3">{orders.map((order) => <article key={order.id} className="account-card"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-serif text-xl">{order.id}</h2><p className="mt-1 text-sm text-slate-500">{new Date(order.createdAt).toLocaleDateString()} · {order.status} · {order.currency} {order.total.toFixed(2)}</p><p className="mt-2 text-sm text-slate-600">{order.items.map((item) => `${item.name} (${item.specification}) × ${item.quantity}`).join(", ")}</p>{order.trackingNumber && <p className="mt-2 text-sm">Tracking: {order.carrier ?? "Carrier"} {order.trackingNumber}</p>}</div><Link href={`/account/orders/${order.id}`} className="button-secondary">View order details</Link></div></article>)}</div>}</AccountShell>;
}
