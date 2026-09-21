import "server-only";

import type { AunevaOrder } from "@/lib/orders";
import { submitVerifiedPaymentToFulfillment } from "@/lib/orders";

export interface PaymentProvider {
  createCheckoutSession(order: AunevaOrder): Promise<{ redirectUrl: string }>;
  verifyWebhook(rawBody: string, signature: string | null): Promise<{ orderId: string; verified: boolean }>;
}

// Intentionally unavailable until a real payment processor is configured. No card data is accepted or stored by Auneva.
export const paymentProvider: PaymentProvider = {
  async createCheckoutSession() { throw new Error("A payment provider has not been configured."); },
  async verifyWebhook() { return { orderId: "", verified: false }; },
};

export async function handleVerifiedPayment(orderId: string, paymentReference: string, verified: boolean) {
  if (!verified) throw new Error("Payment verification failed.");
  return submitVerifiedPaymentToFulfillment(orderId, paymentReference);
}