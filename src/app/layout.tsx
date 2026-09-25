import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { DM_Sans, Playfair_Display } from "next/font/google";
import { acknowledgementCookieName } from "@/lib/acknowledgement";
import { AcknowledgementGate } from "@/components/acknowledgement-gate";
import { CartProvider } from "@/components/cart-provider";
import { siteUrl } from "@/lib/site-url";
import "./globals.css";

const sans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const serif = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = { metadataBase: new URL(siteUrl), title: { default: "Auneva Research | Premium Research Products", template: "%s | Auneva Research" }, description: "Documentation-forward research product sourcing and fulfillment for legitimate laboratory research.", openGraph: { type: "website", siteName: "Auneva Research", title: "Auneva Research | Premium Research Products", description: "Documentation-forward research product sourcing and fulfillment for legitimate laboratory research." } };

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const cookieStore = await cookies();
  const acknowledged = cookieStore.get(acknowledgementCookieName)?.value === "v1";

  return (
    <html
      lang="en"
      className={`${sans.variable} ${serif.variable}`}
    >
      <body><a className="skip-link" href="#content">Skip to content</a><Link href="/" className="site-logo" aria-label="Auneva Health home"><Image src="/logo.svg.png" alt="" fill priority sizes="(max-width: 767px) 104px, 140px" /></Link><CartProvider><AcknowledgementGate acknowledged={acknowledged}><div id="content">{children}</div></AcknowledgementGate></CartProvider></body>
    </html>
  );
}
