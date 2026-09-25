import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { CatalogProductVisual } from "@/components/catalog-product-visual";
import { ProductCoas } from "@/components/product-coas";
import { ProductPrice } from "@/components/product-price";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getAunevaCatalog, getAunevaProduct } from "@/lib/catalog";
import { formatImages } from "@/lib/format-images";
import { siteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const product = await getAunevaProduct((await params).slug);
  if (!product) return {};
  return { title: product.name, description: `${product.name} ${product.specification}. Offered exclusively for legitimate laboratory and research purposes.`, alternates: { canonical: `/product/${product.slug}` } };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const product = await getAunevaProduct((await params).slug);
  if (!product) notFound();
  const catalog = await getAunevaCatalog();
  const productSchema = { "@context": "https://schema.org", "@type": "Product", name: product.name, sku: product.sku, description: `${product.name} ${product.specification}. For legitimate laboratory research only.`, image: `${siteUrl}${formatImages[product.format]}`, category: product.format, offers: { "@type": "Offer", url: `${siteUrl}/product/${product.slug}`, priceCurrency: product.currency, price: product.salePrice ?? product.retailPrice, availability: "https://schema.org/LimitedAvailability" } };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} /><SiteHeader /><main className="mx-auto max-w-6xl px-6 py-10 lg:px-8"><nav aria-label="Breadcrumb" className="mb-8 text-sm text-slate-500"><Link href="/shop" className="hover:text-teal">Shop</Link><span aria-hidden="true" className="mx-2">/</span><span>{product.name}</span></nav><div className="grid gap-12 lg:grid-cols-[.85fr_1fr]"><CatalogProductVisual format={product.format} className="min-h-80 lg:min-h-[32rem]" /><div><p className="eyebrow">{product.format}</p><h1 className="mt-3 font-serif text-5xl text-ink">{product.name}</h1><p className="mt-4 text-lg text-slate-600">{product.specification}</p><ProductPrice retailPrice={product.retailPrice} salePrice={product.salePrice} saleDiscountPercent={product.saleDiscountPercent} currency={product.currency} className="mt-7" /><dl className="mt-8 divide-y divide-navy/10 border-y border-navy/10 text-sm"><div className="flex justify-between gap-6 py-4"><dt className="text-slate-500">SKU</dt><dd className="text-right">{product.sku ?? "Not provided by supplier"}</dd></div><div className="flex justify-between gap-6 py-4"><dt className="text-slate-500">Quantity / size</dt><dd className="text-right">{product.specification}</dd></div><div className="flex justify-between gap-6 py-4"><dt className="text-slate-500">Availability</dt><dd className="text-right">Supplier confirmation required</dd></div></dl><div className="mt-8 max-w-sm"><AddToCartButton product={product} /></div></div></div><ProductCoas product={product} products={catalog.products} /><section className="mt-16 grid gap-8 border-t border-navy/10 pt-12 md:grid-cols-2"><div><p className="eyebrow">Research information</p><p className="mt-3 leading-7 text-slate-600">This item is presented for legitimate laboratory and research purposes only. It is not intended for human or veterinary consumption.</p></div><div><p className="eyebrow">Testing &amp; COAs</p><p className="mt-3 leading-7 text-slate-600">Testing and Certificate of Analysis documentation is displayed only when supplied and applicable to the product lot.</p></div></section></main><SiteFooter /></>;
}