import "server-only";

import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { getAunevaCatalog } from "@/lib/catalog";
import { PrymaLabClient } from "@/lib/prymalab";

export interface PrymaLabWebhookOrder {
  id: number;
  external_id: string;
  status: string;
  carrier?: string;
  tracking_number?: string;
  tracking_url?: string;
  shipped_at?: string | null;
  items?: Array<{ sku?: string; name?: string; quantity?: number; lot?: string }>;
}

export const orderStatuses = ["Pending Payment", "Paid", "Submitted to Fulfillment", "Processing", "Shipped", "Complete", "On Hold", "Cancelled", "Failed", "FULFILLMENT SUBMISSION FAILED"] as const;
export type AunevaOrderStatus = (typeof orderStatuses)[number];

export interface CheckoutRequest {
  customer: { name: string; email: string; phone?: string };
  shipping: { name: string; address1: string; address2?: string; city: string; state: string; postalCode: string; country: string; method: string };
  items: Array<{ id: string; quantity: number }>;
  researchUseAcknowledged: boolean;
}

export interface AunevaOrder {
  id: string;
  status: AunevaOrderStatus;
  createdAt: string;
  customer: CheckoutRequest["customer"];
  shipping: CheckoutRequest["shipping"];
  items: Array<{ productId: string; sku?: string; name: string; specification: string; quantity: number; unitPrice: number; lot?: string }>;
  currency: string;
  subtotal: number;
  shippingTotal: number;
  taxTotal: number;
  total: number;
  researchUseAcknowledgedAt: string;
  paymentReference?: string;
  prymalabOrderId?: number;
  prymalabStatus?: string;
  fulfillmentSubmittedAt?: string;
  fulfillmentError?: string;
  carrier?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  shippedAt?: string;
}

const ordersPath = path.join(process.cwd(), "data", "orders.json");

async function readOrders(): Promise<AunevaOrder[]> {
  try { return JSON.parse(await readFile(ordersPath, "utf8")) as AunevaOrder[]; } catch { return []; }
}

async function saveOrders(orders: AunevaOrder[]) {
  await mkdir(path.dirname(ordersPath), { recursive: true });
  const temporaryPath = `${ordersPath}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(orders, null, 2)}\n`, "utf8");
  await rename(temporaryPath, ordersPath);
}

function money(value: number) { return Math.round(value * 100) / 100; }

function validateCheckout(request: CheckoutRequest) {
  if (!request.customer.name.trim() || !/^\S+@\S+\.\S+$/.test(request.customer.email) || !request.shipping.name.trim() || !request.shipping.address1.trim() || !request.shipping.city.trim() || !request.shipping.state.trim() || !request.shipping.postalCode.trim() || !request.shipping.country.trim() || !request.shipping.method.trim() || !request.researchUseAcknowledged || request.items.length === 0) throw new Error("Checkout information is incomplete.");
  if (request.items.some((item) => !item.id || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99)) throw new Error("Cart quantities are invalid.");
}

export async function createPendingPaymentOrder(request: CheckoutRequest) {
  validateCheckout(request);
  const catalog = await getAunevaCatalog();
  if (catalog.error) throw new Error("Catalog is unavailable. Please try again shortly.");
  const items = request.items.map((item) => {
    const product = catalog.products.find((entry) => entry.id === item.id);
    if (!product) throw new Error("A cart item is no longer available.");
    return { productId: product.id, sku: product.sku, name: product.name, specification: product.specification, quantity: item.quantity, unitPrice: product.retailPrice };
  });
  const subtotal = money(items.reduce((total, item) => total + item.unitPrice * item.quantity, 0));
  // Carrier-rate integration will replace this explicit pre-payment estimate.
  const shippingTotal = request.shipping.method === "standard" ? 9.95 : 19.95;
  const taxTotal = 0;
  const order: AunevaOrder = { id: `AUN-${new Date().getUTCFullYear()}-${randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase()}`, status: "Pending Payment", createdAt: new Date().toISOString(), customer: { name: request.customer.name.trim(), email: request.customer.email.trim().toLowerCase(), phone: request.customer.phone?.trim() || undefined }, shipping: { ...request.shipping, address2: request.shipping.address2?.trim() || undefined }, items, currency: catalog.products[0]?.currency ?? "USD", subtotal, shippingTotal, taxTotal, total: money(subtotal + shippingTotal + taxTotal), researchUseAcknowledgedAt: new Date().toISOString() };
  const orders = await readOrders();
  orders.push(order);
  await saveOrders(orders);
  return order;
}

export async function getOrder(orderId: string) { return (await readOrders()).find((order) => order.id === orderId); }

export function customerFacingOrderStatus(status?: string) {
  switch (status?.toLowerCase()) {
    case "received": return "Order Received";
    case "processing": return "Processing";
    case "fulfilled": return "Shipped";
    case "complete": return "Complete";
    case "on_hold": return "On Hold";
    case "cancelled": return "Cancelled";
    default: return "Order Pending";
  }
}

function localStatusFromPrymaLab(status: string): AunevaOrderStatus {
  switch (status.toLowerCase()) {
    case "processing": return "Processing";
    case "fulfilled": return "Shipped";
    case "complete": return "Complete";
    case "on_hold": return "On Hold";
    case "cancelled": return "Cancelled";
    case "received": return "Submitted to Fulfillment";
    default: return "Submitted to Fulfillment";
  }
}

export async function applyPrymaLabWebhookOrder(incoming: PrymaLabWebhookOrder) {
  const orders = await readOrders();
  const order = orders.find((entry) => entry.id === incoming.external_id);
  if (!order) return undefined;
  order.prymalabOrderId = incoming.id;
  order.prymalabStatus = incoming.status;
  order.status = localStatusFromPrymaLab(incoming.status);
  order.carrier = incoming.carrier || order.carrier;
  order.trackingNumber = incoming.tracking_number || order.trackingNumber;
  order.trackingUrl = incoming.tracking_url || order.trackingUrl;
  order.shippedAt = incoming.shipped_at || order.shippedAt;
  for (const item of incoming.items ?? []) {
    const matchingItem = order.items.find((entry) => (item.sku && entry.sku === item.sku) || (!item.sku && item.name && entry.name === item.name));
    if (matchingItem && item.lot) matchingItem.lot = item.lot;
  }
  await saveOrders(orders);
  return order;
}

export async function getOrderForTracking(orderId: string, email: string) {
  const order = await getOrder(orderId);
  return order && order.customer.email === email.trim().toLowerCase() ? order : undefined;
}

function fulfillmentPayload(order: AunevaOrder) {
  return {
    external_id: order.id,
    order_number: order.id,
    customer: order.customer,
    ship_to: { name: order.shipping.name, address_1: order.shipping.address1, address_2: order.shipping.address2, city: order.shipping.city, state: order.shipping.state, postcode: order.shipping.postalCode, country: order.shipping.country },
    items: order.items.map((item) => ({ sku: item.sku, name: item.name, quantity: item.quantity, price: item.unitPrice })),
    shipping_method: order.shipping.method,
    notes: `Auneva Research order ${order.id}`,
  };
}

async function submitPaidOrder(order: AunevaOrder, orders: AunevaOrder[]) {
  try {
    const result = await new PrymaLabClient().createOrder(fulfillmentPayload(order));
    order.status = "Submitted to Fulfillment";
    order.prymalabOrderId = result.order.id;
    order.prymalabStatus = result.order.status;
    order.fulfillmentSubmittedAt = new Date().toISOString();
    order.fulfillmentError = undefined;
    await saveOrders(orders);
    return order;
  } catch (error) {
    order.status = "FULFILLMENT SUBMISSION FAILED";
    order.fulfillmentError = "PrymaLab fulfillment submission failed. Retry using the same Auneva order ID.";
    await saveOrders(orders);
    console.error("PrymaLab fulfillment submission failed", error instanceof Error ? error.name : "unknown error");
    throw error;
  }
}

// Call only from a payment-provider webhook after its signature and payment result have been verified.
export async function submitVerifiedPaymentToFulfillment(orderId: string, paymentReference: string) {
  if (!paymentReference.trim()) throw new Error("A verified payment reference is required.");
  const orders = await readOrders();
  const order = orders.find((entry) => entry.id === orderId);
  if (!order) throw new Error("Order not found.");
  if (order.status !== "Pending Payment") throw new Error("Order is not eligible for payment processing.");

  order.status = "Paid";
  order.paymentReference = paymentReference;
  await saveOrders(orders);
  return submitPaidOrder(order, orders);
}
