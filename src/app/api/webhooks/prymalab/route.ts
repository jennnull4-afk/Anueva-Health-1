import { createHmac, timingSafeEqual } from "node:crypto";
import { applyPrymaLabWebhookOrder, type PrymaLabWebhookOrder } from "@/lib/orders";
import { hasProcessedWebhook, logWebhookEvent } from "@/lib/webhook-events";
import { clientIdentifier, consumeRateLimit } from "@/lib/request-security";

export const dynamic = "force-dynamic";

type WebhookPayload = { event: string; partner_id: number; sent_at: string; order?: PrymaLabWebhookOrder };

function isWebhookOrder(value: unknown): value is PrymaLabWebhookOrder {
  return typeof value === "object" && value !== null && typeof (value as PrymaLabWebhookOrder).id === "number" && typeof (value as PrymaLabWebhookOrder).external_id === "string" && typeof (value as PrymaLabWebhookOrder).status === "string";
}

function isWebhookPayload(value: unknown): value is WebhookPayload {
  if (typeof value !== "object" || value === null) return false;
  const payload = value as WebhookPayload;
  return typeof payload.event === "string" && typeof payload.partner_id === "number" && typeof payload.sent_at === "string" && (!payload.order || isWebhookOrder(payload.order));
}

function signatureMatches(rawBody: string, suppliedSignature: string, secret: string) {
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const supplied = Buffer.from(suppliedSignature, "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");
  return supplied.length === expectedBuffer.length && timingSafeEqual(supplied, expectedBuffer);
}

export async function POST(request: Request) {
  if (!consumeRateLimit(`prymalab-webhook:${await clientIdentifier()}`, 120, 60_000)) return Response.json({ message: "Too many requests." }, { status: 429 });
  const secret = process.env.PRYMALAB_WEBHOOK_SECRET;
  const signature = request.headers.get("x-prymalab-signature");
  const deliveryId = request.headers.get("x-prymalab-delivery");
  if (!secret || !signature || !deliveryId) return Response.json({ message: "Unauthorized webhook." }, { status: 401 });

  const rawBody = await request.text();
  if (!signatureMatches(rawBody, signature, secret)) return Response.json({ message: "Invalid webhook signature." }, { status: 401 });
  if (await hasProcessedWebhook(deliveryId)) return Response.json({ received: true, duplicate: true });

  let payload: unknown;
  try { payload = JSON.parse(rawBody); } catch { return Response.json({ message: "Malformed webhook payload." }, { status: 400 }); }
  if (!isWebhookPayload(payload)) return Response.json({ message: "Malformed webhook payload." }, { status: 400 });

  const supportsOrderUpdate = ["order.received", "order.processing", "order.fulfilled", "order.complete", "order.on_hold", "order.cancelled", "order.paid"].includes(payload.event);
  const order = supportsOrderUpdate && payload.order ? await applyPrymaLabWebhookOrder(payload.order) : undefined;
  await logWebhookEvent({ deliveryId, event: payload.event, orderId: payload.order?.external_id, prymalabStatus: payload.order?.status, receivedAt: new Date().toISOString(), outcome: order ? "processed" : "ignored" });
  console.info("PrymaLab webhook processed", { event: payload.event, deliveryId, orderMatched: Boolean(order) });
  return Response.json({ received: true });
}