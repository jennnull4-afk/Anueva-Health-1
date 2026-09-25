import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AccountShell } from "@/components/account-shell";
import { CatalogProductVisual } from "@/components/catalog-product-visual";
import { ReorderButton } from "@/components/reorder-button";
import { getCurrentCustomer, ownsOrder } from "@/lib/customers";
import { getAunevaCatalog } from "@/lib/catalog";
import { getOrder } from "@/lib/orders";

export const dynamic = "force-dynamic";
const money = (value: number, currency: string) => new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value);

export default async function AccountOrderPage({ params }: { params: Promise<{ orderId: string }> }) {
  const customer = await getCurrentCustomer();
  if (!customer) redirect("/account/sign-in");
  const order = await getOrder((await params).orderId);
  if (!order || !ownsOrder(customer.id, order)) notFound();
  const catalog = await getAunevaCatalog();
  const reorderable = order.items.flatMap((item) => {
    const product = catalog.products.find((entry) => entry.id === item.productId);
    return product ? [{ id: product.id, slug: product.slug, name: product.name, specification: product.specification, format: product.format, retailPrice: product.retailPrice, salePrice: product.salePrice, saleDiscountPercent: product.saleDiscountPercent, currency: product.currency }] : [];
  });
  return <AccountShell customer={customer} title="Order details"><div className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="font-serif text-3xl">{order.id}</h1><p className="mt-2 text-sm text-slate-600">{new Date(order.createdAt).toLocaleString()} · Payment/fulfillment status: {order.status}</p></div><div className="flex flex-wrap gap-2"><a className="button-secondary" href={`/api/account/orders/${order.id}/summary`}>Download order summary</a><Link className="button-primary" href={`/account/support?order=${order.id}`}>Contact support</Link></div></div><div className="mt-6 grid gap-3">{order.items.map((item) => <article key={`${item.productId}-${item.specification}`} className="account-card grid grid-cols-[4.5rem_1fr] gap-4"><div className="relative h-16">{item.format ? <CatalogProductVisual format={item.format} className="h-full" /> : <div className="grid h-full place-items-center bg-teal-50 text-xs">Format</div>}</div><div><h2 className="font-serif text-xl">{item.name}</h2><p className="text-sm text-slate-500">{item.specification} · Qty {item.quantity}</p><p className="mt-1 text-sm">{money(item.unitPrice, order.currency)} each</p></div></article>)}</div><dl className="mt-6 grid gap-2 text-sm sm:grid-cols-2"><div className="flex justify-between border-b border-navy/10 py-2"><dt>Subtotal</dt><dd>{money(order.subtotal, order.currency)}</dd></div><div className="flex justify-between border-b border-navy/10 py-2"><dt>Shipping</dt><dd>{money(order.shippingTotal, order.currency)}</dd></div><div className="flex justify-between border-b border-navy/10 py-2"><dt>Taxes</dt><dd>{money(order.taxTotal, order.currency)}</dd></div><div className="flex justify-between py-2 font-bold"><dt>Total</dt><dd>{money(order.total, order.currency)}</dd></div></dl><section className="mt-6 grid gap-4 lg:grid-cols-2"><div className="account-card"><h2 className="font-serif text-xl">Shipping address</h2><p className="mt-3 text-sm leading-6">{order.shipping.name}<br />{order.shipping.address1}{order.shipping.address2 ? `, ${order.shipping.address2}` : ""}<br />{order.shipping.city}, {order.shipping.state} {order.shipping.postalCode}<br />{order.shipping.country}</p></div><div className="account-card"><h2 className="font-serif text-xl">Tracking</h2>{order.trackingNumber ? <p className="mt-3 text-sm">{order.carrier ?? "Carrier not provided"} · {order.trackingNumber}{order.trackingUrl ? <> · <a className="text-link" href={order.trackingUrl}>Track shipment</a></> : null}</p> : <p className="mt-3 text-sm text-slate-600">No carrier or tracking number has been provided for this order.</p>}</div></section><div className="mt-6"><ReorderButton products={reorderable} /></div></AccountShell>;
}
