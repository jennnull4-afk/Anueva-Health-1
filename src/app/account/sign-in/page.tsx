import Link from "next/link";
import { redirect } from "next/navigation";
import { AccountForm } from "@/components/account-form";
import { PasswordField } from "@/components/password-field";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { signInAction } from "@/app/account/actions";
import { getCurrentCustomer } from "@/lib/customers";

export const dynamic = "force-dynamic";
export default async function SignInPage({ searchParams }: { searchParams: Promise<{ deleted?: string; verified?: string }> }) {
  if (await getCurrentCustomer()) redirect("/account");
  const params = await searchParams;
  const deleted = params.deleted === "1";
  const verified = params.verified === "1";
  return <><SiteHeader /><main><section className="page-hero py-12"><div className="mx-auto max-w-lg px-5"><p className="eyebrow">Account</p><h1 className="mt-3 font-serif text-3xl">Sign in</h1></div></section><section className="mx-auto max-w-lg px-5 py-8">{deleted && <p role="status" className="mt-4 text-sm text-teal">Your deletion request was submitted. You have been signed out.</p>}{verified && <p role="status" className="mt-4 text-sm text-teal">Email confirmed. You can sign in.</p>}<div className="mt-6"><AccountForm action={signInAction} submitLabel="Sign in"><label className="text-sm font-semibold">Email<input required type="email" name="email" autoComplete="email" className="form-input" /></label><PasswordField name="password" label="Password" autoComplete="current-password" /><label className="flex items-center gap-2 text-sm"><input type="checkbox" name="remember" />Remember this browser for 30 days</label></AccountForm></div><p className="mt-5 text-sm"><Link href="/account/forgot-password" className="text-link">Forgot password</Link></p><p className="mt-3 text-sm text-slate-600">New to Auneva? <Link href="/account/register" className="font-bold text-navy">Create account</Link></p></section></main><SiteFooter /></>;
}
