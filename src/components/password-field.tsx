"use client";

import { useState } from "react";

export function PasswordField({ name, label, autoComplete }: { name: string; label: string; autoComplete: string }) {
  const [visible, setVisible] = useState(false);
  return <label className="text-sm font-semibold">{label}<span className="relative block"><input required name={name} type={visible ? "text" : "password"} autoComplete={autoComplete} className="form-input pr-20" /><button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 px-2 text-xs font-bold uppercase tracking-[.08em] text-teal" aria-pressed={visible} onClick={() => setVisible(!visible)}>{visible ? "Hide" : "Show"}</button></span></label>;
}
