import Link from "next/link";
import Image from "next/image";
import { connection } from "next/server";
import { ArrowRight, ArrowUpRight, FileCheck2, FlaskConical, ShieldCheck } from "lucide-react";
import { CatalogProductCard } from "@/components/catalog-product-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getAunevaCatalog, getCatalogCategories } from "@/lib/catalog";
import { formatImages } from "@/lib/format-images";

const trustItems = [["Live catalog", "Current product and specification data", FlaskConical], ["Available documentation", "Published by product and stated lot", FileCheck2], ["Secure ordering", "Protected checkout infrastructure", ShieldCheck]] as const;

export default async function Home() {
  await connection();
  const catalog = await getAunevaCatalog();
  const categories = getCatalogCategories(catalog.products);
  const featuredProducts = catalog.products.slice(0, 4);
  return <><SiteHeader /><main>
      <section className="luxury-hero">
        <div className="luxury-hero__image"><Image src="/1.svg.png" alt="Auneva research vial collection" fill priority sizes="100vw" className="object-cover object-center" /><Link href="/shop" aria-label="Explore the Auneva research collection" className="image-overlay-link"><span>Explore collection <ArrowUpRight size={16} /></span></Link></div>
        <div className="luxury-hero__veil" />
        <div className="luxury-hero__content"><p className="eyebrow text-teal-200">Auneva Research</p><h1>THE FUTURE OF RESEARCH, <em>REFINED.</em></h1><p>A modern destination for research products, technical documentation and scientific discovery.</p><div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link href="/shop" className="button-primary">Explore Collection <ArrowRight size={17} /></Link><Link href="/coas-testing" className="button-dark">Our Standards</Link></div></div>
      </section>
      <section className="trust-strip"><div className="mx-auto grid max-w-7xl divide-y divide-white/15 px-6 sm:grid-cols-3 sm:divide-x sm:divide-y-0 lg:px-8">{trustItems.map(([label, note, Icon]) => <div className="flex gap-3 py-5 sm:px-5" key={label}><Icon className="mt-1 shrink-0 text-teal-200" size={18} /><div><p className="text-xs font-bold uppercase tracking-[.12em] text-white">{label}</p><p className="mt-1 text-xs leading-5 text-slate-300">{note}</p></div></div>)}</div></section>
      <section className="section-shell"><div className="section-heading"><div><p className="eyebrow">The collection</p><h2>Research, by format</h2></div><Link href="/shop" className="text-link">Shop all products <ArrowRight size={16} /></Link></div><div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{categories.map((category, index) => <article key={category.slug} className="category-tile"><Image src={formatImages[category.format]} alt={`${category.name} format reference`} fill sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw" className="object-contain p-6" /><div className="category-tile__shade" /><Link href={`/shop/category/${category.slug}`} aria-label={`Browse ${category.name}`} className="image-overlay-link"><span>View category <ArrowUpRight size={16} /></span></Link><div className="category-tile__copy"><p>0{index + 1} / {category.productCount} products</p><h3>{category.name}</h3></div></article>)}</div></section>
      <section className="featured-section"><div className="section-shell"><div className="section-heading"><div><p className="eyebrow">Selected from the live catalog</p><h2>Featured collection</h2></div><Link href="/shop" className="text-link">View full catalog <ArrowRight size={16} /></Link></div>{catalog.error ? <p className="mt-8 border border-navy/15 bg-white p-5 text-slate-600">The live catalog is currently unavailable. Please visit the shop shortly.</p> : <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{featuredProducts.map((product) => <CatalogProductCard key={product.id} product={product} />)}</div>}</div></section>
      <section className="documentation-feature"><div className="documentation-feature__image"><Image src="/2.svg.png" alt="Auneva research product detail" fill sizes="(max-width: 1023px) 100vw, 48vw" className="object-cover" /></div><div className="documentation-feature__content"><p className="eyebrow text-teal-200">COAs &amp; Testing</p><h2>Documentation that stays close to the product.</h2><p>Review published Certificates of Analysis and laboratory records only where they are associated with a current catalog product and stated lot.</p><Link href="/coas-testing" className="button-light">Explore available documents <ArrowRight size={17} /></Link></div></section>
      <section className="section-shell brand-story"><div><p className="eyebrow">The Auneva standard</p><h2>Exacting by design.</h2></div><div><p>Auneva brings a considered point of view to research product discovery: a clear, current catalog, direct access to available documentation, and ordering built around legitimate laboratory work.</p><Link href="/research-information" className="mt-6 inline-flex items-center gap-2 font-bold text-navy hover:text-teal">Research information <ArrowRight size={17} /></Link></div></section>
      <section className="research-notice"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 px-6 py-10 lg:flex-row lg:items-center lg:px-8"><p>For laboratory research use only. Products are not intended for human or veterinary consumption.</p><Link href="/research-use" className="text-link text-white">Research use &amp; compliance <ArrowRight size={16} /></Link></div></section>
    </main><SiteFooter /></>;
}
