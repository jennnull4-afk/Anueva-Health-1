import Link from "next/link";
import { redirect } from "next/navigation";
import { AccountForm } from "@/components/account-form";
import { AccountShell } from "@/components/account-shell";
import { PasswordField } from "@/components/password-field";
import { deletionAction, passwordAction } from "@/app/account/actions";
import { getCurrentCustomer } from "@/lib/customers";

export const dynamic = "force-dynamic";
export default async function SecurityPage() {
  const customer = await getCurrentCustomer();
  if (!customer) redirect("/account/sign-in");
  return <AccountShell customer={customer} title="Security"><h1 className="font-serif text-3xl">Account security</h1><div className="mt-6 grid gap-6 lg:grid-cols-2"><article className="account-card"><h2 className="font-serif text-xl">Change password</h2><p className="mt-2 text-sm text-slate-600">You will be signed out after a successful change.</p><div className="mt-4"><AccountForm action={passwordAction} submitLabel="Update password"><PasswordField name="currentPassword" label="Current password" autoComplete="current-password" /><PasswordField name="password" label="New password" autoComplete="new-password" /></AccountForm></div></article><article className="account-card"><h2 className="font-serif text-xl">Deletion request</h2><p className="mt-2 text-sm leading-6 text-slate-600">This submits a deletion request and signs you out. It does not erase completed order records required for fulfillment or legal obligations. Review the <Link href="/privacy" className="text-link">Privacy Policy</Link>.</p><div className="mt-4"><AccountForm action={deletionAction} submitLabel="Request deletion"><PasswordField name="password" label="Current password" autoComplete="current-password" /></AccountForm></div></article></div></AccountShell>;
}
