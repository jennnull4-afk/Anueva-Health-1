import "server-only";

const REQUEST_TIMEOUT_MS = 10_000;
const MAX_SAFE_ATTEMPTS = 3;

export interface PrymaLabOrderItem {
  sku: string;
  name: string;
  quantity: number;
  lot: string;
}

export interface PrymaLabOrder {
  id: number;
  external_id: string;
  order_number: string;
  status: string;
  status_label?: string;
  carrier: string;
  tracking_number: string;
  tracking_url: string;
  items: PrymaLabOrderItem[];
  shipped_at: string | null;
  updated_at?: string;
  events?: Array<{ status: string; timestamp: string; note: string }>;
}

export interface PrymaLabCreateOrderResponse {
  duplicate: boolean;
  order: PrymaLabOrder;
}

export interface CreatePrymaLabOrderInput {
  external_id: string;
  order_number?: string;
  customer?: { name?: string; email?: string; phone?: string };
  ship_to: { name?: string; address_1: string; address_2?: string; city: string; state: string; postcode: string; country?: string };
  items: Array<{ sku?: string; name?: string; quantity: number; price?: number }>;
  shipping_method?: string;
  notes?: string;
}

export class PrymaLabApiError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = "PrymaLabApiError";
  }
}

function validateOrderInput(order: CreatePrymaLabOrderInput) {
  if (!order.external_id || !order.ship_to?.address_1 || !order.ship_to.city || !order.ship_to.state || !order.ship_to.postcode || order.items.length === 0) {
    throw new PrymaLabApiError("Order is missing a documented required field.");
  }
  for (const item of order.items) {
    if ((!item.sku && !item.name) || !Number.isInteger(item.quantity) || item.quantity < 1 || (item.price !== undefined && !Number.isFinite(item.price))) {
      throw new PrymaLabApiError("Order contains an invalid documented item field.");
    }
  }
}

export class PrymaLabClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(apiKey = process.env.PRYMALAB_API_KEY) {
    if (!apiKey || !apiKey.startsWith("plk_")) throw new PrymaLabApiError("PrymaLab API key is not configured.");
    if (!process.env.PRYMALAB_API_BASE_URL) throw new PrymaLabApiError("PrymaLab API base URL is not configured.");
    this.apiKey = apiKey;
    this.baseUrl = process.env.PRYMALAB_API_BASE_URL.replace(/\/$/, "");
  }

  private async request<T>(path: string, init: RequestInit = {}, retryable = false): Promise<T> {
    let lastError: Error | undefined;
    const attempts = retryable ? MAX_SAFE_ATTEMPTS : 1;
    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
      try {
        const response = await fetch(`${this.baseUrl}${path}`, {
          ...init,
          signal: controller.signal,
          headers: { Authorization: `Bearer ${this.apiKey}`, Accept: "application/json", ...init.headers },
          cache: "no-store",
        });
        if (!response.ok) {
          const retry = retryable && (response.status === 429 || response.status >= 500) && attempt < attempts;
          if (!retry) throw new PrymaLabApiError("PrymaLab request failed.", response.status);
          lastError = new PrymaLabApiError("PrymaLab temporarily unavailable.", response.status);
        } else {
          return await response.json() as T;
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new PrymaLabApiError("PrymaLab request failed.");
        if (!retryable || attempt === attempts || error instanceof PrymaLabApiError && error.status && error.status < 500 && error.status !== 429) throw lastError;
      } finally {
        clearTimeout(timeout);
      }
      await new Promise((resolve) => setTimeout(resolve, 150 * attempt));
    }
    throw lastError ?? new PrymaLabApiError("PrymaLab request failed.");
  }

  async getCatalog(): Promise<unknown> { return this.request<unknown>("/catalog", {}, true); }

  async createOrder(order: CreatePrymaLabOrderInput): Promise<PrymaLabCreateOrderResponse> {
    validateOrderInput(order);
    return this.request<PrymaLabCreateOrderResponse>("/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(order) }, true);
  }

}