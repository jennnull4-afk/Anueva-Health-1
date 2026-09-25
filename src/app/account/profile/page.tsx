import { redirect } from "next/navigation";
import { AccountForm } from "@/components/account-form";
import { AccountShell } from "@/components/account-shell";
import { PasswordField } from "@/components/password-field";
import { emailChangeAction, profileAction } from "@/app/account/actions";
import { getCurrentCustomer } from "@/lib/customers";

export const dynamic = "force-dynamic";
export default async function ProfilePage() {
  const customer = await getCurrentCustomer();
  if (!customer) redirect("/account/sign-in");
  return <AccountShell customer={customer} title="Personal information"><h1 className="font-serif text-3xl">Profile</h1><div className="mt-6 grid gap-6 lg:grid-cols-2"><article className="account-card"><h2 className="font-serif text-xl">Contact details</h2><div className="mt-4"><AccountForm action={profileAction} submitLabel="Save profile"><label className="text-sm font-semibold">First name<input required name="firstName" defaultValue={customer.firstName} className="form-input" /></label><label className="text-sm font-semibold">Last name<input required name="lastName" defaultValue={customer.lastName} className="form-input" /></label><label className="text-sm font-semibold">Phone<input name="phone" defaultValue={customer.phone} className="form-input" /></label><label className="flex items-center gap-2 text-sm"><input type="checkbox" name="orderUpdates" defaultChecked={customer.preferences.orderUpdates} />Order update messages</label><label className="flex items-center gap-2 text-sm"><input type="checkbox" name="catalogUpdates" defaultChecked={customer.preferences.catalogUpdates} />Catalog update messages</label></AccountForm></div></article><article className="account-card"><h2 className="font-serif text-xl">Email address</h2><p className="mt-2 text-sm text-slate-600">Current email: {customer.email}. A change stays pending until the new address is verified.</p><div className="mt-4"><AccountForm action={emailChangeAction} submitLabel="Send confirmation"><label className="text-sm font-semibold">New email<input required type="email" name="email" autoComplete="email" className="form-input" /></label><PasswordField name="currentPassword" label="Current password" autoComplete="current-password" /></AccountForm></div></article></div></AccountShell>;
}
