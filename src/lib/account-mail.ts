import "server-only";

import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";

const logPath = path.join(process.cwd(), "data", "account-mail.log");

export async function sendAccountEmail(to: string, subject: string, text: string) {
  if (process.env.RESEND_API_KEY && process.env.ACCOUNT_EMAIL_FROM) {
    const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify({ from: process.env.ACCOUNT_EMAIL_FROM, to, subject, text }) });
    if (!response.ok) throw new Error("Verification email could not be sent.");
    return;
  }
  if (process.env.NODE_ENV === "production") throw new Error("Account email delivery is not configured.");
  await mkdir(path.dirname(logPath), { recursive: true });
  await appendFile(logPath, `${new Date().toISOString()} ${to} ${subject} ${text}\n`, { encoding: "utf8", mode: 0o600 });
}
