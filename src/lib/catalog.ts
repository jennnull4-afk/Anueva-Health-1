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

const formats: ProductFormat[] = ["vials", "sprays", "pens", "capsules"];
const RETAIL_MARKUP_PERCENT = 40;

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

function productId(format: ProductFormat, product: PrymaLabCatalogProduct) {
  return product.sku ? `sku:${product.sku}` : `${format}:${product.product}:${product.spec}`;
}

function retailPrice(supplierPrice: number) {
  return Math.round(supplierPrice * (1 + RETAIL_MARKUP_PERCENT / 100) * 100) / 100;
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

  const products = formats.flatMap((format) => rawCatalog[format].map((source) => {
    const name = source.product;
    return {
      id: productId(format, source),
      slug: `${slugify(name)}-${slugify(source.spec)}-${slugify(source.sku ?? format)}`,
      sku: source.sku,
      name,
      specification: source.spec,
      format,
      retailPrice: retailPrice(source.t1),
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

export async function getAunevaProduct(slug: string) {
  const catalog = await getAunevaCatalog();
  return catalog.products.find((product) => product.slug === slug);
}