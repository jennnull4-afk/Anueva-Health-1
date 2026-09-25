import { getCurrentCustomer, ownsOrder } from "@/lib/customers";
import { getOrder } from "@/lib/orders";

export async function GET(_request: Request, context: { params: Promise<{ orderId: string }> }) {
  const customer = await getCurrentCustomer();
  const order = await getOrder((await context.params).orderId);
  if (!customer || !order || !ownsOrder(customer.id, order)) return new Response("Not found", { status: 404 });
  const lines = [`Auneva order summary`, `Order: ${order.id}`, `Date: ${order.createdAt}`, `Status: ${order.status}`, ``, ...order.items.map((item) => `${item.name} | ${item.specification} | Qty ${item.quantity} | ${item.unitPrice.toFixed(2)} ${order.currency}`), ``, `Subtotal: ${order.subtotal.toFixed(2)}`, `Shipping: ${order.shippingTotal.toFixed(2)}`, `Tax: ${order.taxTotal.toFixed(2)}`, `Total: ${order.total.toFixed(2)} ${order.currency}`, ``, `This summary reflects stored order data. It is not a payment-processor receipt.`];
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8", "Content-Disposition": `attachment; filename="${order.id}-summary.txt"`, "Cache-Control": "private, no-store" } });
}
