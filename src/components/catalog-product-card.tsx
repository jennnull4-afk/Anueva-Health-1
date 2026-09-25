import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { CatalogProductVisual } from "@/components/catalog-product-visual";
import { ProductPrice } from "@/components/product-price";
import type { AunevaProduct, ProductFormat } from "@/lib/catalog";

const formatNames: Record<ProductFormat, string> = { vials: "Peptide Vials", sprays: "Nasal Sprays", pens: "Autoinjector Pens", capsules: "Capsules" };

export function CatalogProductCard({ product, categoryName }: { product: AunevaProduct; categoryName?: string }) {
  return <article className="catalog-product-card group"><div className="catalog-product-media"><CatalogProductVisual format={product.format} className="catalog-product-image" /><Link href={`/product/${product.slug}`} aria-label={`View ${product.name}, ${product.specification}`} className="image-overlay-link"><span>View product <ArrowUpRight size={15} /></span></Link></div><div className="flex flex-1 flex-col p-4 sm:p-5"><p className="text-[10px] font-bold uppercase tracking-[.13em] text-teal">{categoryName ?? formatNames[product.format]}</p><h3 className="mt-2 font-serif text-xl leading-tight text-ink">{product.name}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{product.specification}</p><div className="mt-4"><ProductPrice retailPrice={product.retailPrice} salePrice={product.salePrice} saleDiscountPercent={product.saleDiscountPercent} currency={product.currency} /></div><p className="mt-2 text-xs leading-5 text-slate-500">Availability: supplier confirmation required</p><div className="mt-5 grid grid-cols-2 gap-3"><Link href={`/product/${product.slug}`} className="button-secondary">Details</Link><AddToCartButton product={product} /></div></div></article>;
}