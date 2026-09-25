import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CatalogProductCard } from "@/components/catalog-product-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getAunevaCatalog, getCatalogCategories, getCatalogCategory } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const catalog = await getAunevaCatalog();
  const category = getCatalogCategory((await params).slug, catalog.products);
  return category ? { title: category.name, description: category.description, alternates: { canonical: `/shop/category/${category.slug}` } } : {};
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const catalog = await getAunevaCatalog();
  const category = getCatalogCategory((await params).slug, catalog.products);
  if (!category) notFound();
  const products = catalog.products.filter((product) => product.format === category.format);

  return <><SiteHeader /><main><section className="page-hero py-12"><div className="mx-auto max-w-7xl px-6 lg:px-8"><Link href="/shop" className="text-xs font-bold uppercase tracking-[.1em] text-teal">Shop all products</Link><p className="eyebrow mt-6">Research catalog</p><h1 className="mt-4 font-serif text-5xl text-ink">{category.name}</h1><p className="mt-5 max-w-2xl leading-7 text-slate-600">{category.description}</p></div></section><section className="mx-auto max-w-7xl px-6 py-10 lg:px-8"><div className="flex flex-wrap gap-2 border-b border-navy/10 pb-8">{getCatalogCategories(catalog.products).map((item) => <Link key={item.slug} href={`/shop/category/${item.slug}`} className={`border px-3 py-2 text-xs font-bold uppercase tracking-[.08em] ${item.slug === category.slug ? "border-teal bg-teal text-white" : "border-navy/15 text-navy hover:border-teal hover:text-teal"}`}>{item.name} ({item.productCount})</Link>)}</div><p className="mt-6 text-sm text-slate-500">Showing {products.length} products</p><div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{products.map((product) => <CatalogProductCard key={product.id} product={product} categoryName={category.name} />)}</div></section></main><SiteFooter /></>;
}