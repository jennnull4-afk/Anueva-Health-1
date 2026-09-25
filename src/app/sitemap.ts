import type { MetadataRoute } from "next";
import { getAunevaCatalog, getCatalogCategories } from "@/lib/catalog";
import { siteUrl } from "@/lib/site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const paths = ["", "/shop", "/coas-testing", "/research-information", "/faq", "/track-order", "/contact", "/terms", "/privacy", "/shipping", "/returns", "/research-use", "/accessibility", "/cookies"];
  const entries: MetadataRoute.Sitemap = paths.map((path) => ({ url: `${siteUrl}${path}`, lastModified: new Date("2026-09-24"), changeFrequency: path === "/shop" ? "daily" : "monthly", priority: path === "" ? 1 : 0.6 }));
  try {
    const catalog = await getAunevaCatalog();
    entries.push(...getCatalogCategories(catalog.products).map((category) => ({ url: `${siteUrl}/shop/category/${category.slug}`, lastModified: new Date("2026-09-24"), changeFrequency: "daily" as const, priority: 0.7 })));
    entries.push(...catalog.products.map((product) => ({ url: `${siteUrl}/product/${product.slug}`, lastModified: new Date("2026-09-24"), changeFrequency: "daily" as const, priority: 0.8 })));
  } catch { /* Keep the static sitemap available when the live catalog cannot be reached. */ }
  return entries;
}