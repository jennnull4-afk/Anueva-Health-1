import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { CoaLibrary } from "@/components/coa-library";
import { getPublishedCoas } from "@/lib/coa";
import { getAunevaCatalog } from "@/lib/catalog";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "COAs & Laboratory Testing", description: "Lot-specific Certificate of Analysis and laboratory documentation available for current Auneva Research catalog products." };

export default async function CoasTestingPage() {
  const [catalog, records] = await Promise.all([getAunevaCatalog(), getPublishedCoas()]);
  const productIds = new Set(catalog.products.map((product) => product.id));
  const publicRecords = records.filter((record) => productIds.has(record.productId)).map((record) => ({ ...record, blobUrl: record.blobUrl ? "available" : undefined }));
  return <><SiteHeader /><main><section className="page-hero"><div className="section-shell"><p className="eyebrow">Lot-specific documentation</p><h1 className="mt-3 max-w-3xl">COAs & laboratory testing</h1><p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">Certificates and testing records appear only when a published document is associated with a current catalog product and its stated lot. A document does not establish results for any other batch.</p></div></section><section className="section-shell"><CoaLibrary products={catalog.products} records={publicRecords} /></section></main><SiteFooter /></>;
}