import { getCurrentCustomer } from "@/lib/customers";
import { createPendingPaymentOrder, type CheckoutRequest } from "@/lib/orders";
import { clientIdentifier, consumeRateLimit, isSameOriginRequest } from "@/lib/request-security";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return Response.json({ message: "Invalid request origin." }, { status: 403 });
  if (!consumeRateLimit(`checkout:${await clientIdentifier()}`, 10, 60_000)) return Response.json({ message: "Too many requests. Please try again shortly." }, { status: 429 });
  try {
    const body = await request.json() as CheckoutRequest;
    const customer = await getCurrentCustomer();
    const order = await createPendingPaymentOrder(body, customer?.id);
    return Response.json({ orderId: order.id, status: order.status, total: order.total, currency: order.currency }, { status: 201 });
  } catch (error) {
    return Response.json({ message: error instanceof Error ? error.message : "Unable to create order." }, { status: 400 });
  }
}