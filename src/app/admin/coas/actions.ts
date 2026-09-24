"use server";

import { redirect } from "next/navigation";
import { endCoaAdminSession, startCoaAdminSession } from "@/lib/coa";

export async function coaAdminLogin(_: { error?: string }, formData: FormData) {
  const candidate = formData.get("token");
  const token = typeof candidate === "string" ? candidate : "";
  if (!await startCoaAdminSession(token)) return { error: "Invalid staff token or missing server configuration." };
  redirect("/admin/coas");
}

export async function coaAdminLogout() { await endCoaAdminSession(); redirect("/admin/coas/login"); }