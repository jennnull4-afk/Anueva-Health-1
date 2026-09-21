import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["", "/shop", "/coas-testing", "/research-information", "/faq", "/track-order", "/contact", "/terms", "/privacy", "/shipping", "/returns", "/research-use", "/accessibility", "/cookies"];
  return paths.map((path) => ({ url: `${siteUrl}${path}`, lastModified: new Date("2026-09-21"), changeFrequency: path === "/shop" ? "daily" : "monthly", priority: path === "" ? 1 : 0.6 }));
}