import "server-only";

import { createHmac, randomBytes, randomUUID, scrypt, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { Redis } from "@upstash/redis";
import { cookies, headers } from "next/headers";
import { claimUnassignedOrders, type AunevaOrder } from "@/lib/orders";
import { sendAccountEmail } from "@/lib/account-mail";
import { siteUrl } from "@/lib/site-url";

const scryptAsync = promisify(scrypt);
export const customerSessionCookie = "auneva_customer";
const storePath = path.join(process.cwd(), "data", "customers.json");
const secretPath = path.join(process.cwd(), "data", ".account-secret");
const storeKey = "auneva:customers";
const isVercelDeployment = process.env.VERCEL === "1";

export interface SavedAddress {
  id: string;
  fullName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
}

export interface CustomerPreferences { orderUpdates: boolean; catalogUpdates: boolean; }
interface CustomerRecord {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phone?: string;
  emailVerifiedAt?: string;
  pendingEmail?: string;
  preferences: CustomerPreferences;
  addresses: SavedAddress[];
  createdAt: string;
  deletionRequestedAt?: string;
}
interface AccountToken { id: string; customerId: string; purpose: "verify-email" | "reset-password" | "change-email"; tokenHash: string; expiresAt: string; newEmail?: string; }
export interface SupportRequest { id: string; customerId: string; orderId?: string; subject: string; message: string; createdAt: string; }
type CustomerStore = { customers: CustomerRecord[]; tokens: AccountToken[]; supportRequests: SupportRequest[] };
export type PublicCustomer = Omit<CustomerRecord, "passwordHash" | "pendingEmail"> & { pendingEmail?: string };

function redis() {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) throw new Error("UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be configured for Vercel deployments.");
  return Redis.fromEnv();
}
async function readStore(): Promise<CustomerStore> {
  if (isVercelDeployment) return (await redis().get<CustomerStore>(storeKey)) ?? { customers: [], tokens: [], supportRequests: [] };
  try {
    const parsed = JSON.parse(await readFile(storePath, "utf8")) as Partial<CustomerStore>;
    return { customers: parsed.customers ?? [], tokens: parsed.tokens ?? [], supportRequests: parsed.supportRequests ?? [] };
  } catch { return { customers: [], tokens: [], supportRequests: [] }; }
}
async function saveStore(store: CustomerStore) {
  if (isVercelDeployment) { await redis().set(storeKey, store); return; }
  await mkdir(path.dirname(storePath), { recursive: true });
  const temporaryPath = `${storePath}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(store, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
  await rename(temporaryPath, storePath);
}
async function sessionSecret() {
  if (process.env.ACCOUNT_SESSION_SECRET) return process.env.ACCOUNT_SESSION_SECRET;
  if (isVercelDeployment) throw new Error("ACCOUNT_SESSION_SECRET must be configured.");
  try { return (await readFile(secretPath, "utf8")).trim(); } catch {
    const secret = randomBytes(32).toString("hex");
    await mkdir(path.dirname(secretPath), { recursive: true });
    await writeFile(secretPath, secret, { encoding: "utf8", mode: 0o600 });
    return secret;
  }
}
function publicCustomer(customer: CustomerRecord): PublicCustomer {
  const { passwordHash: _passwordHash, ...profile } = customer;
  return profile;
}
function normalizeEmail(value: string) { return value.trim().toLowerCase(); }
function validEmail(value: string) { return /^\S+@\S+\.\S+$/.test(value) && value.length <= 254; }
function validPassword(value: string) { return value.length >= 12 && value.length <= 128 && /[A-Za-z]/.test(value) && /\d/.test(value); }
function clean(value: FormDataEntryValue | null, max = 120) { return String(value ?? "").trim().replace(/\s+/g, " ").slice(0, max); }
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = (await scryptAsync(password, salt, 32) as Buffer).toString("hex");
  return `scrypt:${salt}:${hash}`;
}
async function verifyPassword(password: string, stored: string) {
  const [algorithm, salt, hash] = stored.split(":");
  if (algorithm !== "scrypt" || !salt || !hash) return false;
  const actual = await scryptAsync(password, salt, 32) as Buffer;
  const expected = Buffer.from(hash, "hex");
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
function hashToken(token: string, secret: string) { return createHmac("sha256", secret).update(token).digest("hex"); }
async function origin() {
  const requestHeaders = await headers();
  return requestHeaders.get("origin") || siteUrl;
}
async function issueToken(store: CustomerStore, customerId: string, purpose: AccountToken["purpose"], newEmail?: string) {
  const secret = await sessionSecret();
  const token = randomBytes(32).toString("base64url");
  store.tokens = store.tokens.filter((entry) => entry.customerId !== customerId || entry.purpose !== purpose);
  store.tokens.push({ id: randomUUID(), customerId, purpose, tokenHash: hashToken(token, secret), expiresAt: new Date(Date.now() + (purpose === "reset-password" ? 60 : 24 * 60) * 60_000).toISOString(), newEmail });
  return token;
}
async function consumeToken(token: string, purpose: AccountToken["purpose"]) {
  const store = await readStore();
  const secret = await sessionSecret();
  const tokenHash = hashToken(token, secret);
  const match = store.tokens.find((entry) => entry.purpose === purpose && entry.tokenHash === tokenHash && Date.parse(entry.expiresAt) > Date.now());
  if (!match) return undefined;
  store.tokens = store.tokens.filter((entry) => entry.id !== match.id);
  const customer = store.customers.find((entry) => entry.id === match.customerId);
  return customer ? { store, customer, token: match } : undefined;
}
async function startSession(customerId: string, remember: boolean) {
  const secret = await sessionSecret();
  const expiresAt = Date.now() + (remember ? 30 : 1) * 24 * 60 * 60_000;
  const payload = Buffer.from(JSON.stringify({ customerId, expiresAt })).toString("base64url");
  const signature = createHmac("sha256", secret).update(payload).digest("base64url");
  (await cookies()).set(customerSessionCookie, `${payload}.${signature}`, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: remember ? 30 * 24 * 60 * 60 : undefined });
}
export async function endCustomerSession() { (await cookies()).delete(customerSessionCookie); }
export async function getCurrentCustomer() {
  try {
    const session = (await cookies()).get(customerSessionCookie)?.value;
    if (!session) return null;
    const [payload, signature] = session.split(".");
    const secret = await sessionSecret();
    const expected = createHmac("sha256", secret).update(payload).digest("base64url");
    if (!signature || signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString()) as { customerId?: string; expiresAt?: number };
    if (!parsed.customerId || !parsed.expiresAt || parsed.expiresAt < Date.now()) return null;
    const customer = (await readStore()).customers.find((entry) => entry.id === parsed.customerId && entry.emailVerifiedAt && !entry.deletionRequestedAt);
    return customer ? publicCustomer(customer) : null;
  } catch { return null; }
}
export async function requireCustomer() {
  const customer = await getCurrentCustomer();
  if (!customer) throw new Error("Sign in required.");
  return customer;
}

export async function registerCustomer(input: { firstName: string; lastName: string; email: string; password: string }) {
  if (!input.firstName.trim() || !input.lastName.trim() || !validEmail(input.email)) throw new Error("Enter your name and a valid email address.");
  if (!validPassword(input.password)) throw new Error("Use at least 12 characters, including a letter and a number.");
  const email = normalizeEmail(input.email);
  const store = await readStore();
  const existing = store.customers.find((entry) => entry.email === email);
  if (!existing) {
    const customer: CustomerRecord = { id: randomUUID(), email, passwordHash: await hashPassword(input.password), firstName: input.firstName.trim(), lastName: input.lastName.trim(), preferences: { orderUpdates: true, catalogUpdates: false }, addresses: [], createdAt: new Date().toISOString() };
    const token = await issueToken(store, customer.id, "verify-email");
    store.customers.push(customer);
    await saveStore(store);
    await sendAccountEmail(email, "Verify your Auneva account", `Verify your email to activate your account: ${await origin()}/account/verify-email?token=${token}`);
  } else if (!existing.emailVerifiedAt) {
    const token = await issueToken(store, existing.id, "verify-email");
    await saveStore(store);
    await sendAccountEmail(email, "Verify your Auneva account", `Verify your email to activate your account: ${await origin()}/account/verify-email?token=${token}`);
  }
}
export async function verifyEmail(token: string) {
  const result = await consumeToken(token, "verify-email");
  if (!result) return false;
  result.customer.emailVerifiedAt = new Date().toISOString();
  await saveStore(result.store);
  await claimUnassignedOrders(result.customer.id, result.customer.email);
  return true;
}
export async function signInCustomer(email: string, password: string, remember: boolean) {
  const store = await readStore();
  const customer = store.customers.find((entry) => entry.email === normalizeEmail(email) && !entry.deletionRequestedAt);
  if (!customer || !await verifyPassword(password, customer.passwordHash)) throw new Error("Email or password is incorrect.");
  if (!customer.emailVerifiedAt) throw new Error("Verify your email before signing in.");
  await startSession(customer.id, remember);
  await claimUnassignedOrders(customer.id, customer.email);
}
export async function requestPasswordReset(email: string) {
  if (!validEmail(email)) return;
  const store = await readStore();
  const customer = store.customers.find((entry) => entry.email === normalizeEmail(email) && entry.emailVerifiedAt && !entry.deletionRequestedAt);
  if (!customer) return;
  const token = await issueToken(store, customer.id, "reset-password");
  await saveStore(store);
  await sendAccountEmail(customer.email, "Reset your Auneva password", `Reset your password: ${await origin()}/account/reset-password?token=${token}`);
}
export async function resetPassword(token: string, password: string) {
  if (!validPassword(password)) throw new Error("Use at least 12 characters, including a letter and a number.");
  const result = await consumeToken(token, "reset-password");
  if (!result) throw new Error("This reset link is invalid or has expired.");
  result.customer.passwordHash = await hashPassword(password);
  await saveStore(result.store);
}
export async function updateProfile(input: { firstName: string; lastName: string; phone: string; orderUpdates: boolean; catalogUpdates: boolean }) {
  const current = await requireCustomer();
  const store = await readStore();
  const customer = store.customers.find((entry) => entry.id === current.id);
  if (!customer || !input.firstName.trim() || !input.lastName.trim()) throw new Error("Enter your first and last name.");
  customer.firstName = input.firstName.trim();
  customer.lastName = input.lastName.trim();
  customer.phone = input.phone.trim() || undefined;
  customer.preferences = { orderUpdates: input.orderUpdates, catalogUpdates: input.catalogUpdates };
  await saveStore(store);
}
export async function requestEmailChange(nextEmail: string, password: string) {
  if (!validEmail(nextEmail)) throw new Error("Enter a valid email address.");
  const current = await requireCustomer();
  const store = await readStore();
  const customer = store.customers.find((entry) => entry.id === current.id);
  if (!customer || !await verifyPassword(password, customer.passwordHash)) throw new Error("Current password is incorrect.");
  const email = normalizeEmail(nextEmail);
  if (store.customers.some((entry) => entry.email === email && entry.id !== customer.id)) throw new Error("That email cannot be used.");
  customer.pendingEmail = email;
  const token = await issueToken(store, customer.id, "change-email", email);
  await saveStore(store);
  await sendAccountEmail(email, "Confirm your new Auneva email", `Confirm this email change: ${await origin()}/account/verify-email?token=${token}&purpose=change-email`);
}
export async function confirmEmailChange(token: string) {
  const result = await consumeToken(token, "change-email");
  if (!result?.token.newEmail) return false;
  result.customer.email = result.token.newEmail;
  result.customer.pendingEmail = undefined;
  result.customer.emailVerifiedAt = new Date().toISOString();
  await saveStore(result.store);
  return true;
}
export async function changePassword(currentPassword: string, nextPassword: string) {
  if (!validPassword(nextPassword)) throw new Error("Use at least 12 characters, including a letter and a number.");
  const current = await requireCustomer();
  const store = await readStore();
  const customer = store.customers.find((entry) => entry.id === current.id);
  if (!customer || !await verifyPassword(currentPassword, customer.passwordHash)) throw new Error("Current password is incorrect.");
  customer.passwordHash = await hashPassword(nextPassword);
  await saveStore(store);
  await endCustomerSession();
}
function addressFrom(formData: FormData, id = randomUUID() as string): SavedAddress {
  const address = { id, fullName: clean(formData.get("fullName")), company: clean(formData.get("company")) || undefined, address1: clean(formData.get("address1")), address2: clean(formData.get("address2")) || undefined, city: clean(formData.get("city")), state: clean(formData.get("state"), 40), postalCode: clean(formData.get("postalCode"), 20), country: clean(formData.get("country"), 2).toUpperCase(), phone: clean(formData.get("phone"), 30) || undefined, isDefault: formData.get("isDefault") === "on" };
  if (!address.fullName || !address.address1 || !address.city || !address.state || !address.postalCode || !/^[A-Z]{2}$/.test(address.country)) throw new Error("Complete all required address fields.");
  return address;
}
async function mutateAddresses(update: (customer: CustomerRecord) => void) {
  const current = await requireCustomer();
  const store = await readStore();
  const customer = store.customers.find((entry) => entry.id === current.id);
  if (!customer) throw new Error("Sign in required.");
  update(customer);
  if (!customer.addresses.some((address) => address.isDefault) && customer.addresses[0]) customer.addresses[0].isDefault = true;
  await saveStore(store);
}
export async function saveAddress(formData: FormData) {
  const id = clean(formData.get("addressId"), 80);
  await mutateAddresses((customer) => {
    const next = addressFrom(formData, id || undefined);
    if (next.isDefault) customer.addresses.forEach((address) => { address.isDefault = false; });
    const index = customer.addresses.findIndex((address) => address.id === id);
    if (index >= 0) customer.addresses[index] = next;
    else customer.addresses.push(next);
  });
}
export async function deleteAddress(id: string) { await mutateAddresses((customer) => { customer.addresses = customer.addresses.filter((address) => address.id !== id); }); }
export async function createSupportRequest(input: { orderId?: string; subject: string; message: string }) {
  const customer = await requireCustomer();
  if (input.subject.trim().length < 3 || input.message.trim().length < 10) throw new Error("Enter a subject and a message of at least 10 characters.");
  const store = await readStore();
  const request: SupportRequest = { id: randomUUID(), customerId: customer.id, orderId: input.orderId, subject: input.subject.trim().slice(0, 160), message: input.message.trim().slice(0, 2000), createdAt: new Date().toISOString() };
  store.supportRequests.unshift(request);
  await saveStore(store);
  return request;
}
export async function requestAccountDeletion(password: string) {
  const current = await requireCustomer();
  const store = await readStore();
  const customer = store.customers.find((entry) => entry.id === current.id);
  if (!customer || !await verifyPassword(password, customer.passwordHash)) throw new Error("Current password is incorrect.");
  customer.deletionRequestedAt = new Date().toISOString();
  store.supportRequests.unshift({ id: randomUUID(), customerId: customer.id, subject: "Account deletion request", message: "Customer requested account deletion.", createdAt: customer.deletionRequestedAt });
  await saveStore(store);
  await endCustomerSession();
}
export function ownsOrder(customerId: string, order: AunevaOrder) { return order.customerId === customerId; }
