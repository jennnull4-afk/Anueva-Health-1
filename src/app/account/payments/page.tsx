import { redirect } from "next/navigation";
import { AccountShell } from "@/components/account-shell";
import { getCurrentCustomer } from "@/lib/customers";

export const dynamic = "force-dynamic";
export default async function PaymentsPage() {
  const customer = await getCurrentCustomer();
  if (!customer) redirect("/account/sign-in");
  return <AccountShell customer={customer} title="Payment methods"><h1 className="font-serif text-3xl">Saved payment methods</h1><div className="account-card mt-6"><p className="text-sm leading-6 text-slate-600">Saved payment methods are unavailable. The configured payment service does not currently provide a customer vault or hosted card tokenization. Auneva does not store card numbers, CVV values, or card authentication data.</p></div></AccountShell>;
}
