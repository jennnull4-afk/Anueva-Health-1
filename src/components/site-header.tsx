import { connection } from "next/server";
import { getAunevaCatalog, getCatalogCategories } from "@/lib/catalog";
import { getCurrentCustomer } from "@/lib/customers";
import { SiteHeaderClient } from "@/components/site-header-client";

export async function SiteHeader() {
  await connection();
  const [catalog, customer] = await Promise.all([getAunevaCatalog(), getCurrentCustomer()]);
  return <SiteHeaderClient categories={getCatalogCategories(catalog.products)} signedIn={Boolean(customer)} />;
}