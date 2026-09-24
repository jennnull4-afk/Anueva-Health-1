import Link from "next/link";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { CatalogProductVisual } from "@/components/catalog-product-visual";
import { ProductPrice } from "@/components/product-price";
import type { AunevaProduct } from "@/lib/catalog";

export function CatalogProductCard({ product, categoryName }: { product: AunevaProduct; categoryName?: string }) {
  return <article className="catalog-product-card group"><CatalogProductVisual format={product.format} className="catalog-product-image" /><div className="flex flex-1 flex-col p-5"><p className="text-[10px] font-bold uppercase tracking-[.13em] text-teal">{categoryName ?? product.format}</p><h2 className="mt-2 font-serif text-2xl leading-tight text-ink">{product.name}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{product.specification}</p><div className="mt-5"><ProductPrice retailPrice={product.retailPrice} salePrice={product.salePrice} saleDiscountPercent={product.saleDiscountPercent} currency={product.currency} /></div><p className="mt-2 text-xs leading-5 text-slate-500">Availability: supplier confirmation required</p><div className="mt-6 grid grid-cols-2 gap-3"><Link href={`/product/${product.slug}`} className="button-secondary">Details</Link><AddToCartButton product={product} /></div></div></article>;
}