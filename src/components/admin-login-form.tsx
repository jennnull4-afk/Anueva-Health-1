"use client";

import { useActionState } from "react";
import { coaAdminLogin } from "@/app/admin/coas/actions";

export function AdminLoginForm() {
  const [state, action, pending] = useActionState(coaAdminLogin, {} as { error?: string });
  return <form action={action} className="mt-6 border border-navy/10 bg-white p-6 shadow-sm"><label className="text-sm font-semibold">Staff token<input required name="token" type="password" autoComplete="current-password" className="form-input" /></label>{state.error && <p role="alert" className="mt-4 text-sm text-red-700">{state.error}</p>}<button disabled={pending} className="button-primary mt-5 disabled:bg-slate-300">{pending ? "Checking..." : "Sign in"}</button></form>;
}