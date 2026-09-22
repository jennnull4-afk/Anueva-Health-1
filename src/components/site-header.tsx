import { connection } from "next/server";
import { getAunevaCatalog, getCatalogCategories } from "@/lib/catalog";
import { SiteHeaderClient } from "@/components/site-header-client";

export async function SiteHeader() {
  await connection();
  const catalog = await getAunevaCatalog();
  return <SiteHeaderClient categories={getCatalogCategories(catalog.products)} />;
}