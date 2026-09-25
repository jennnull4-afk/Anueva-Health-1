import Link from "next/link";
import { redirect } from "next/navigation";
import { AccountForm } from "@/components/account-form";
import { PasswordField } from "@/components/password-field";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { registerAction } from "@/app/account/actions";
import { getCurrentCustomer } from "@/lib/customers";

export const dynamic = "force-dynamic";
export default async function RegisterPage() {
  if (await getCurrentCustomer()) redirect("/account");
  return <><SiteHeader /><main><section className="page-hero py-12"><div className="mx-auto max-w-lg px-5"><p className="eyebrow">Account</p><h1 className="mt-3 font-serif text-3xl">Create account</h1><p className="mt-3 text-sm leading-6 text-slate-600">Registration requires email verification before sign-in. Guest checkout remains available.</p></div></section><section className="mx-auto max-w-lg px-5 py-8"><div className="mt-6"><AccountForm action={registerAction} submitLabel="Create account"><label className="text-sm font-semibold">First name<input required name="firstName" autoComplete="given-name" className="form-input" /></label><label className="text-sm font-semibold">Last name<input required name="lastName" autoComplete="family-name" className="form-input" /></label><label className="text-sm font-semibold">Email<input required type="email" name="email" autoComplete="email" className="form-input" /></label><PasswordField name="password" label="Password" autoComplete="new-password" /></AccountForm></div><p className="mt-5 text-sm text-slate-600">Already registered? <Link href="/account/sign-in" className="font-bold text-navy">Sign in</Link></p></section></main><SiteFooter /></>;
}
