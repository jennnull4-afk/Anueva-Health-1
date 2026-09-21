"use server";

import { cookies } from "next/headers";
import { acknowledgementCookieName } from "@/lib/acknowledgement";

export async function acknowledgeResearchUse() {
  const cookieStore = await cookies();
  cookieStore.set(acknowledgementCookieName, "v1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}