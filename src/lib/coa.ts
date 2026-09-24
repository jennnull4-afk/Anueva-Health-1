import "server-only";

import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { Redis } from "@upstash/redis";
import { del, get, put } from "@vercel/blob";
import { cookies } from "next/headers";
import { getAunevaCatalog, type AunevaProduct } from "@/lib/catalog";

export type CoaStatus = "draft" | "published" | "archived";
export interface CoaRecord {
  id: string;
  productId: string;
  lot: string;
  title: string;
  status: CoaStatus;
  supplierProvided: boolean;
  labName?: string;
  testingDate?: string;
  methods?: string;
  documentedResults?: string;
  blobUrl?: string;
  blobPath?: string;
  createdAt: string;
  replacesId?: string;
}

export interface CoaRequest {
  id: string;
  productId: string;
  lot?: string;
  orderNumber?: string;
  email: string;
  message?: string;
  createdAt: string;
}

type CoaStore = { records: CoaRecord[]; requests: CoaRequest[] };
export const coaAdminCookieName = "auneva_coa_admin";
const storePath = path.join(process.cwd(), "data", "coas.json");
const localDocumentsPath = path.join(process.cwd(), "data", "coa-documents");
const storeKey = "auneva:coas";
const isVercelDeployment = process.env.VERCEL === "1";
const safeText = /^[\p{L}\p{N} .,_()\[\]+/#&:-]+$/u;

function redis() {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) throw new Error("UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be configured for COAs on Vercel.");
  return Redis.fromEnv();
}

async function readStore(): Promise<CoaStore> {
  if (isVercelDeployment) return (await redis().get<CoaStore>(storeKey)) ?? { records: [], requests: [] };
  try {
    const parsed = JSON.parse(await readFile(storePath, "utf8")) as Partial<CoaStore>;
    return { records: Array.isArray(parsed.records) ? parsed.records : [], requests: Array.isArray(parsed.requests) ? parsed.requests : [] };
  } catch { return { records: [], requests: [] }; }
}

async function saveStore(store: CoaStore) {
  if (isVercelDeployment) { await redis().set(storeKey, store); return; }
  await mkdir(path.dirname(storePath), { recursive: true });
  const temporaryPath = `${storePath}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
  await rename(temporaryPath, storePath);
}

function normalizeText(value: unknown, field: string, required = false, max = 500) {
  const text = typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
  if (required && !text) throw new Error(`${field} is required.`);
  if (text && (!safeText.test(text) || text.length > max)) throw new Error(`${field} contains invalid characters.`);
  return text || undefined;
}

function validDate(value: string | undefined, field: string) {
  if (!value) return undefined;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(`${value}T00:00:00Z`))) throw new Error(`${field} must be a valid date.`);
  return value;
}

async function requireCurrentProduct(productId: string) {
  const catalog = await getAunevaCatalog();
  if (catalog.error) throw new Error("The live catalog is unavailable. Try again shortly.");
  const product = catalog.products.find((entry) => entry.id === productId);
  if (!product) throw new Error("Select a currently available catalog product.");
  return product;
}

export async function getPublishedCoas(productId?: string) {
  const store = await readStore();
  return store.records.filter((record) => record.status === "published" && (!productId || record.productId === productId));
}
export async function getAllCoas() { return (await readStore()).records; }
export async function getCoaRequests() { return (await readStore()).requests; }
export async function getPublishedCoa(id: string) { return (await getPublishedCoas()).find((record) => record.id === id); }

export async function createCoaRequest(input: Record<string, unknown>) {
  const productId = normalizeText(input.productId, "Product", true, 300)!;
  await requireCurrentProduct(productId);
  const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
  if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 254) throw new Error("Enter a valid email address.");
  const request: CoaRequest = { id: randomUUID(), productId, lot: normalizeText(input.lot, "Lot", false, 120), orderNumber: normalizeText(input.orderNumber, "Order number", false, 120), email, message: normalizeText(input.message, "Message", false, 1000), createdAt: new Date().toISOString() };
  const store = await readStore();
  store.requests.unshift(request);
  await saveStore(store);
  return request;
}

export function coaAdminConfigured() { return Boolean(process.env.AUNEVA_COA_ADMIN_TOKEN); }
function signature() { return createHmac("sha256", process.env.AUNEVA_COA_ADMIN_TOKEN ?? "").update("auneva-coa-admin-v1").digest("hex"); }
export async function isCoaAdmin() {
  const token = process.env.AUNEVA_COA_ADMIN_TOKEN;
  const session = (await cookies()).get(coaAdminCookieName)?.value;
  if (!token || !session || session.length !== signature().length) return false;
  return timingSafeEqual(Buffer.from(session), Buffer.from(signature()));
}
export async function startCoaAdminSession(token: string) {
  const expected = process.env.AUNEVA_COA_ADMIN_TOKEN;
  if (!expected || token.length !== expected.length || !timingSafeEqual(Buffer.from(token), Buffer.from(expected))) return false;
  (await cookies()).set(coaAdminCookieName, signature(), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/admin", maxAge: 60 * 60 * 8 });
  return true;
}
export async function endCoaAdminSession() { (await cookies()).delete(coaAdminCookieName); }
export async function requireCoaAdmin() { if (!await isCoaAdmin()) throw new Error("Staff authorization required."); }

async function putPdf(file: File, recordId: string) {
  if (file.type !== "application/pdf" || file.size < 5 || file.size > 15 * 1024 * 1024) throw new Error("Upload a PDF document no larger than 15 MB.");
  const fileBytes = await file.arrayBuffer();
  const bytes = new Uint8Array(fileBytes);
  if (new TextDecoder().decode(bytes.slice(0, 5)) !== "%PDF-") throw new Error("The uploaded file is not a valid PDF.");
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    if (isVercelDeployment) throw new Error("BLOB_READ_WRITE_TOKEN must be configured for COA documents on Vercel.");
    await mkdir(localDocumentsPath, { recursive: true });
    const blobPath = `local:coa-documents/${recordId}.pdf`;
    await writeFile(path.join(process.cwd(), blobPath.replace("local:", "")), bytes);
    return { blobPath, blobUrl: `local://${recordId}.pdf` };
  }
  const blobPath = `coas/${recordId}.pdf`;
  const blob = await put(blobPath, fileBytes, { access: "private", contentType: "application/pdf", addRandomSuffix: false });
  return { blobUrl: blob.url, blobPath };
}

export async function createCoa(formData: FormData) {
  await requireCoaAdmin();
  const productId = normalizeText(formData.get("productId"), "Product", true, 300)!;
  await requireCurrentProduct(productId);
  const record: CoaRecord = { id: randomUUID(), productId, lot: normalizeText(formData.get("lot"), "Lot", true, 120)!, title: normalizeText(formData.get("title"), "Title", true, 200)!, status: parseStatus(formData.get("status")), supplierProvided: formData.get("supplierProvided") === "true", labName: normalizeText(formData.get("labName"), "Laboratory", false, 200), testingDate: validDate(normalizeText(formData.get("testingDate"), "Testing date", false, 10), "Testing date"), methods: normalizeText(formData.get("methods"), "Methods", false, 500), documentedResults: normalizeText(formData.get("documentedResults"), "Documented results", false, 1000), createdAt: new Date().toISOString(), replacesId: normalizeText(formData.get("replacesId"), "Replacement record", false, 100) };
  const file = formData.get("document");
  if (file instanceof File && file.size) Object.assign(record, await putPdf(file, record.id));
  const store = await readStore();
  store.records.unshift(record);
  await saveStore(store);
  return record;
}

function parseStatus(value: FormDataEntryValue | null): CoaStatus {
  if (value === "draft" || value === "published" || value === "archived") return value;
  throw new Error("Choose a valid record status.");
}

export async function updateCoaStatus(id: string, status: CoaStatus) {
  await requireCoaAdmin();
  const store = await readStore();
  const record = store.records.find((entry) => entry.id === id);
  if (!record) throw new Error("COA record not found.");
  record.status = status;
  await saveStore(store);
  return record;
}

export async function privateCoaDocument(id: string) {
  const record = await getPublishedCoa(id);
  if (!record?.blobPath) return undefined;
  if (record.blobPath.startsWith("local:")) return { body: new Uint8Array(await readFile(path.join(process.cwd(), record.blobPath.replace("local:", "")))) };
  if (!record.blobUrl) return undefined;
  const document = await get(record.blobUrl, { access: "private" });
  return document ? { body: document.stream } : undefined;
}

export async function deleteUnusedDocument(record: CoaRecord) { if (record.blobUrl) await del(record.blobUrl); }
export function productForRecord(products: AunevaProduct[], record: CoaRecord) { return products.find((product) => product.id === record.productId); }