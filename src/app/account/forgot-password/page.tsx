import Link from "next/link";
import { AccountForm } from "@/components/account-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { forgotPasswordAction } from "@/app/account/actions";

export const dynamic = "force-dynamic";
export default function ForgotPasswordPage() {
  return <><SiteHeader /><main><section className="page-hero py-12"><div className="mx-auto max-w-lg px-5"><p className="eyebrow">Account recovery</p><h1 className="mt-3 font-serif text-3xl">Forgot password</h1><p className="mt-3 text-sm leading-6 text-slate-600">The response is the same whether or not an account exists for the email entered.</p></div></section><section className="mx-auto max-w-lg px-5 py-8"><div className="mt-6"><AccountForm action={forgotPasswordAction} submitLabel="Send reset instructions"><label className="text-sm font-semibold">Email<input required type="email" name="email" autoComplete="email" className="form-input" /></label></AccountForm></div><Link href="/account/sign-in" className="mt-5 inline-block text-sm font-bold text-navy">Return to sign in</Link></section></main><SiteFooter /></>;
}
