import { z } from 'zod';

// ============================================================================
// V1 Strict E-Commerce & Subscription Billing Schemas (Matches Backend Contract)
// ============================================================================

export const CustomerTierEnum = z.enum(['free', 'pro', 'enterprise']);

export const OrderStatusEnum = z.enum([
  'pending',
  'processing',
  'settled',
  'refunded',
  'failed'
]);

export const LineItemSchema = z.object({
  item_id: z.string(),
  title: z.string(),
  unit_price_cents: z.number().int().positive(),
  quantity: z.number().int().positive()
});

/**
 * Strict V1 Order Response Contract
 * Machine B Consumer directly consumes total_amount_cents, currency_code, and status
 */
export const OrderResponseSchema = z.object({
  id: z.string(),
  customer_id: z.string(),
  customer_tier: CustomerTierEnum,
  currency_code: z.string(),
  total_amount_cents: z.number().int().nonnegative({
    message: 'Contract Violation: total_amount_cents must be a non-negative integer'
  }),
  status: OrderStatusEnum,
  line_items: z.array(LineItemSchema),
  created_at: z.string(),
  updated_at: z.string()
});

export const CheckoutSessionRequestSchema = z.object({
  customer_id: z.string(),
  customer_tier: CustomerTierEnum.default('free'),
  currency_code: z.string().default('USD'),
  line_items: z.array(LineItemSchema).min(1),
  success_url: z.string().url().optional(),
  cancel_url: z.string().url().optional()
});

export const CheckoutSessionResponseSchema = z.object({
  session_id: z.string(),
  checkout_url: z.string(),
  total_amount_cents: z.number().int().nonnegative(),
  currency_code: z.string(),
  status: z.enum(['open', 'expired', 'completed']),
  expires_at: z.string()
});

export const ActiveSubscriptionResponseSchema = z.object({
  subscription_id: z.string(),
  customer_id: z.string(),
  tier: CustomerTierEnum,
  currency_code: z.string(),
  monthly_price_cents: z.number().int().nonnegative(),
  status: z.enum(['active', 'trialing', 'past_due', 'canceled']),
  current_period_end: z.string()
});

// Inferred Types
export type CustomerTier = z.infer<typeof CustomerTierEnum>;
export type OrderStatus = z.infer<typeof OrderStatusEnum>;
export type LineItem = z.infer<typeof LineItemSchema>;
export type OrderResponse = z.infer<typeof OrderResponseSchema>;
export type CheckoutSessionRequest = z.infer<typeof CheckoutSessionRequestSchema>;
export type CheckoutSessionResponse = z.infer<typeof CheckoutSessionResponseSchema>;
export type ActiveSubscriptionResponse = z.infer<typeof ActiveSubscriptionResponseSchema>;

// Legacy Schemas
export const OrderItemSchema = z.object({
  productId: z.string(),
  name: z.string(),
  quantity: z.number().int().positive(),
  price: z.number().positive()
});

export const OrderLegacyStatusSchema = z.enum([
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled'
]);

export const OrderSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  items: z.array(OrderItemSchema),
  total_amount: z.number().min(0, 'Order total must be non-negative'),
  status: OrderLegacyStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string()
});

export const OrderListResponseSchema = z.object({
  orders: z.array(OrderSchema),
  count: z.number()
});

export type Order = z.infer<typeof OrderSchema>;
export type OrderItem = z.infer<typeof OrderItemSchema>;
export type OrderListResponse = z.infer<typeof OrderListResponseSchema>;
