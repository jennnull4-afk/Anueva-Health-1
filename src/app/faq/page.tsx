import type { Metadata } from "next";
import { FaqPage } from "@/components/faq-page";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = { title: "Frequently Asked Questions", description: "Policy-aligned answers about Auneva Research products, ordering, shipping, returns, privacy, and research use.", alternates: { canonical: "/faq" } };

export default function FaqRoute() {
  return <><SiteHeader /><FaqPage /><SiteFooter /></>;
}