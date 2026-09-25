import { redirect } from "next/navigation";
import { AccountForm } from "@/components/account-form";
import { AccountShell } from "@/components/account-shell";
import { supportAction } from "@/app/account/actions";
import { getCurrentCustomer, ownsOrder } from "@/lib/customers";
import { getOrder } from "@/lib/orders";

export const dynamic = "force-dynamic";
export default async function SupportPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const customer = await getCurrentCustomer();
  if (!customer) redirect("/account/sign-in");
  const requestedOrder = (await searchParams).order ?? "";
  const order = requestedOrder ? await getOrder(requestedOrder) : undefined;
  const orderId = order && ownsOrder(customer.id, order) ? order.id : "";
  return <AccountShell customer={customer} title="Support"><h1 className="font-serif text-3xl">Contact support</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">A confirmation appears only after the request is stored. Staff email notification is not configured, so this page does not claim that a message was delivered to an inbox.</p><div className="account-card mt-6 max-w-2xl"><AccountForm action={supportAction} submitLabel="Submit request"><label className="text-sm font-semibold">Order number <span className="font-normal text-slate-500">(optional)</span><input name="orderId" defaultValue={orderId} className="form-input" /></label><label className="text-sm font-semibold">Subject<input required name="subject" className="form-input" /></label><label className="text-sm font-semibold">Message<textarea required name="message" minLength={10} className="form-input min-h-32 py-2" /></label></AccountForm></div></AccountShell>;
}
