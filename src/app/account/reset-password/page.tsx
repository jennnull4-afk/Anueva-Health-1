import { AccountForm } from "@/components/account-form";
import { PasswordField } from "@/components/password-field";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { resetPasswordAction } from "@/app/account/actions";

export const dynamic = "force-dynamic";
export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const token = (await searchParams).token ?? "";
  return <><SiteHeader /><main><section className="page-hero py-12"><div className="mx-auto max-w-lg px-5"><p className="eyebrow">Account recovery</p><h1 className="mt-3 font-serif text-3xl">Choose a new password</h1></div></section><section className="mx-auto max-w-lg px-5 py-8"><div className="mt-6"><AccountForm action={resetPasswordAction} submitLabel="Reset password"><input type="hidden" name="token" value={token} /><PasswordField name="password" label="New password" autoComplete="new-password" /></AccountForm></div></section></main><SiteFooter /></>;
}
