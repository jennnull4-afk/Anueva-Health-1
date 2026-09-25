import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { confirmVerificationAction } from "@/app/account/actions";

export const dynamic = "force-dynamic";
export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ token?: string; purpose?: string; error?: string }> }) {
  const { token = "", purpose = "", error = "" } = await searchParams;
  return <><SiteHeader /><main><section className="page-hero py-12"><div className="mx-auto max-w-lg px-5"><p className="eyebrow">Email verification</p><h1 className="mt-3 font-serif text-3xl">{error ? "Verification link unavailable" : "Confirm your email"}</h1><p className="mt-4 text-sm leading-6 text-slate-600">{error ? "This link is invalid or has expired." : "Confirmation is completed only when you submit this form."}</p></div></section><section className="mx-auto max-w-lg px-5 py-8">{!error && token && <form action={confirmVerificationAction} className="mt-6"><input type="hidden" name="token" value={token} /><input type="hidden" name="purpose" value={purpose} /><button className="button-primary">Confirm email</button></form>}<Link href="/account/sign-in" className="mt-5 inline-block text-sm font-bold text-navy">Sign in</Link></section></main><SiteFooter /></>;
}
