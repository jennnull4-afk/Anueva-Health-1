import "server-only";

import { PrymaLabClient } from "@/lib/prymalab";

export type ProductFormat = "vials" | "sprays" | "pens" | "capsules";

interface PrymaLabCatalogProduct {
  sku?: string;
  product: string;
  spec: string;
  t1: number;
  t2: number;
  t3: number;
  msrp?: number;
}

interface PrymaLabCatalogResponse {
  effective: string;
  currency: string;
  tiers: Record<"t1" | "t2" | "t3", string>;
  vials: PrymaLabCatalogProduct[];
  sprays: PrymaLabCatalogProduct[];
  pens: PrymaLabCatalogProduct[];
  capsules: PrymaLabCatalogProduct[];
}

export interface AunevaProduct {
  id: string;
  slug: string;
  sku?: string;
  name: string;
  specification: string;
  format: ProductFormat;
  retailPrice: number;
  salePrice?: number;
  saleDiscountPercent?: number;
  currency: string;
  enabled: boolean;
  featured: boolean;
  availability: "not_provided";
  coasAvailable: false;
  madeInUsa: false;
}

export interface CatalogSnapshot {
  products: AunevaProduct[];
  effective?: string;
  error?: "unavailable" | "invalid_response";
}

export interface CatalogCategory {
  slug: string;
  name: string;
  description: string;
  format: ProductFormat;
  productCount: number;
}

const formats: ProductFormat[] = ["vials", "sprays", "pens", "capsules"];
const DEFAULT_RETAIL_MARKUP_PERCENT = 75;
const categoryDefinitions: Record<ProductFormat, Omit<CatalogCategory, "format" | "productCount">> = {
  vials: { slug: "peptide-vials", name: "Peptide Vials", description: "Research products supplied in vial format." },
  sprays: { slug: "nasal-sprays", name: "Nasal Sprays", description: "Research products supplied in nasal spray format." },
  pens: { slug: "autoinjector-pens", name: "Autoinjector Pens", description: "Research products supplied in autoinjector pen format." },
  capsules: { slug: "capsules", name: "Capsules", description: "Research products supplied in capsule format." },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isCatalogProduct(value: unknown): value is PrymaLabCatalogProduct {
  return isRecord(value) && (value.sku === undefined || typeof value.sku === "string") && typeof value.product === "string" && typeof value.spec === "string" && typeof value.t1 === "number" && typeof value.t2 === "number" && typeof value.t3 === "number" && (value.msrp === undefined || typeof value.msrp === "number");
}

function isCatalogResponse(value: unknown): value is PrymaLabCatalogResponse {
  return isRecord(value) && typeof value.effective === "string" && typeof value.currency === "string" && isRecord(value.tiers) && formats.every((format) => Array.isArray(value[format]) && value[format].every(isCatalogProduct));
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function productId(format: ProductFormat, product: PrymaLabCatalogProduct, sourceIndex: number) {
  return `${format}:${product.sku ?? "no-sku"}:${product.product}:${product.spec}:${sourceIndex}`;
}

function money(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function configuredRetailMarkupPercent() {
  const value = Number(process.env.AUNEVA_RETAIL_MARKUP ?? DEFAULT_RETAIL_MARKUP_PERCENT);
  return Number.isFinite(value) && value >= 0 && value <= 500 ? value : DEFAULT_RETAIL_MARKUP_PERCENT;
}

function configuredSale() {
  if (process.env.AUNEVA_SALE_ENABLED !== "true") return undefined;
  const discount = Number(process.env.AUNEVA_SALE_DISCOUNT);
  return Number.isFinite(discount) && discount > 0 && discount < 100 ? discount : undefined;
}

function retailPrice(supplierPrice: number) {
  return money(supplierPrice * (1 + configuredRetailMarkupPercent() / 100));
}

export async function getAunevaCatalog(): Promise<CatalogSnapshot> {
  let rawCatalog: unknown;
  try {
    rawCatalog = await new PrymaLabClient().getCatalog();
  } catch (error) {
    console.error("PrymaLab catalog sync failed", error instanceof Error ? error.name : "unknown error");
    return { products: [], error: "unavailable" };
  }

  if (!isCatalogResponse(rawCatalog)) {
    console.error("PrymaLab catalog sync failed: invalid documented catalog response");
    return { products: [], error: "invalid_response" };
  }

  const products = formats.flatMap((format) => rawCatalog[format].map((source, sourceIndex) => {
    const name = source.product;
    const regularPrice = retailPrice(source.t1);
    const saleDiscountPercent = configuredSale();
    return {
      id: productId(format, source, sourceIndex),
      slug: `${slugify(name)}-${slugify(source.spec)}-${slugify(format)}-${slugify(source.sku ?? "no-sku")}-${sourceIndex + 1}`,
      sku: source.sku,
      name,
      specification: source.spec,
      format,
      retailPrice: regularPrice,
      salePrice: saleDiscountPercent ? money(regularPrice * (1 - saleDiscountPercent / 100)) : undefined,
      saleDiscountPercent,
      currency: rawCatalog.currency,
      enabled: true,
      featured: false,
      availability: "not_provided" as const,
      coasAvailable: false as const,
      madeInUsa: false as const,
    };
  }));

  return { products, effective: rawCatalog.effective };
}

export function getCatalogCategories(products: AunevaProduct[]): CatalogCategory[] {
  return formats.map((format) => ({
    ...categoryDefinitions[format],
    format,
    productCount: products.filter((product) => product.format === format).length,
  })).filter((category) => category.productCount > 0);
}

export function getCatalogCategory(slug: string, products: AunevaProduct[]) {
  return getCatalogCategories(products).find((category) => category.slug === slug);
}

export async function getAunevaProduct(slug: string) {
  const catalog = await getAunevaCatalog();
  return catalog.products.find((product) => product.slug === slug);
}