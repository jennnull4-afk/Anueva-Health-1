"use client";

import { useActionState } from "react";
import type { AccountState } from "@/app/account/actions";

export function AccountForm({ action, children, submitLabel }: { action: (state: AccountState, formData: FormData) => Promise<AccountState>; children: React.ReactNode; submitLabel: string }) {
  const [state, formAction, pending] = useActionState(action, {});
  return <form action={formAction} className="grid gap-4">{children}{state.error && <p role="alert" className="text-sm text-red-800">{state.error}</p>}{state.message && <p role="status" className="text-sm text-teal">{state.message}</p>}<button disabled={pending} className="button-primary w-fit disabled:bg-slate-300">{pending ? "Saving..." : submitLabel}</button></form>;
}
