import {
  Order,
  OrderListResponse,
  OrderListResponseSchema,
  OrderSchema,
  OrderResponse,
  OrderResponseSchema,
  CheckoutSessionRequest,
  CheckoutSessionResponse,
  CheckoutSessionResponseSchema,
  ActiveSubscriptionResponse,
  ActiveSubscriptionResponseSchema
} from '../schemas/orders.js';
import { User, UserSchema } from '../schemas/users.js';
import {
  Invoice,
  InvoicesResponseSchema,
  Subscription,
  SubscriptionSchema
} from '../schemas/billing.js';

export interface ApiClientConfig {
  baseUrl: string;
  fetchFn?: typeof fetch;
}

export class PactRoomApiClient {
  private baseUrl: string;
  private fetchFn: typeof fetch;

  constructor(config?: Partial<ApiClientConfig>) {
    this.baseUrl = config?.baseUrl || process.env.BACKEND_API_URL || 'http://localhost:3001';
    this.fetchFn = config?.fetchFn || globalThis.fetch;
  }

  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const response = await this.fetchFn(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {})
      }
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`API Error [${response.status} ${response.statusText}]: ${errText}`);
    }

    return (await response.json()) as T;
  }

  // ==========================================================================
  // V1 Strict E-Commerce & Subscription Billing Endpoints
  // ==========================================================================

  /**
   * GET /api/v1/orders/:id
   * Validates strict OrderResponseSchema expecting total_amount_cents & status settled
   */
  async getOrderV1(id = 'ord_2026_9872'): Promise<OrderResponse> {
    const rawData = await this.request<unknown>(`/api/v1/orders/${id}`);
    return OrderResponseSchema.parse(rawData);
  }

  /**
   * POST /api/v1/checkout/session
   * Validates checkout session response with total_amount_cents
   */
  async createCheckoutSession(payload: CheckoutSessionRequest): Promise<CheckoutSessionResponse> {
    const rawData = await this.request<unknown>('/api/v1/checkout/session', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return CheckoutSessionResponseSchema.parse(rawData);
  }

  /**
   * GET /api/v1/subscriptions/active
   * Validates active subscription with monthly_price_cents
   */
  async getActiveSubscription(): Promise<ActiveSubscriptionResponse> {
    const rawData = await this.request<unknown>('/api/v1/subscriptions/active');
    return ActiveSubscriptionResponseSchema.parse(rawData);
  }

  // ==========================================================================
  // Legacy Endpoints
  // ==========================================================================

  async getOrders(limit = 20): Promise<OrderListResponse> {
    const rawData = await this.request<unknown>(`/api/orders?limit=${limit}`);
    return OrderListResponseSchema.parse(rawData);
  }

  async getOrderById(id: string): Promise<Order> {
    const rawData = await this.request<unknown>(`/api/orders/${id}`);
    return OrderSchema.parse(rawData);
  }

  async createOrder(payload: {
    customerId: string;
    items: Array<{ productId: string; name: string; quantity: number; price: number }>;
  }): Promise<Order> {
    const rawData = await this.request<unknown>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return OrderSchema.parse(rawData);
  }

  async getUser(id: string): Promise<User> {
    const rawData = await this.request<unknown>(`/api/users/${id}`);
    return UserSchema.parse(rawData);
  }

  async getInvoices(): Promise<Invoice[]> {
    const rawData = await this.request<unknown>('/api/billing/invoices');
    const parsed = InvoicesResponseSchema.parse(rawData);
    return parsed.invoices;
  }

  async getSubscription(): Promise<Subscription> {
    const rawData = await this.request<unknown>('/api/billing/subscription');
    return SubscriptionSchema.parse(rawData);
  }
}

export const defaultClient = new PactRoomApiClient();
