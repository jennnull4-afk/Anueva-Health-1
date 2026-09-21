"use server";

import { getOrderForTracking } from "@/lib/orders";
import { clientIdentifier, consumeRateLimit } from "@/lib/request-security";

export type TrackingLookupState = { error?: string; order?: { id: string; status: string; carrier?: string; trackingNumber?: string; trackingUrl?: string; shippedAt?: string } };

export async function lookupOrder(_: TrackingLookupState, formData: FormData): Promise<TrackingLookupState> {
  if (!consumeRateLimit(`tracking:${await clientIdentifier()}`, 10, 60_000)) return { error: "Too many lookup attempts. Please try again shortly." };
  const orderId = String(formData.get("orderId") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  if (!orderId || !email) return { error: "Enter both your order ID and order email." };
  const order = await getOrderForTracking(orderId, email);
  if (!order) return { error: "We could not locate an order with those details." };
  const statusMap: Record<string, string> = { received: "Order Received", processing: "Processing", fulfilled: "Shipped", complete: "Complete", on_hold: "On Hold", cancelled: "Cancelled" };
  return { order: { id: order.id, status: statusMap[order.prymalabStatus?.toLowerCase() ?? ""] ?? "Order Pending", carrier: order.carrier, trackingNumber: order.trackingNumber, trackingUrl: order.trackingUrl, shippedAt: order.shippedAt } };
}