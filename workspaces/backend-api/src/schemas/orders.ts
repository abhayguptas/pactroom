import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

// ============================================================================
// V1 Strict E-Commerce & Subscription Billing Schemas
// ============================================================================

export const CustomerTierEnum = z
  .enum(['free', 'pro', 'enterprise'])
  .openapi('CustomerTier');

export const OrderStatusEnum = z
  .enum(['pending', 'processing', 'settled', 'refunded', 'failed'])
  .openapi('OrderStatus');

export const LineItemSchema = z
  .object({
    item_id: z.string().openapi({ example: 'item_desk_mat_01' }),
    title: z.string().openapi({ example: 'Merino Wool Desk Mat' }),
    unit_price_cents: z.number().int().positive().openapi({ example: 4500 }),
    quantity: z.number().int().positive().openapi({ example: 1 })
  })
  .openapi('LineItem');

/**
 * Baseline Order Response Schema
 * Strict schema guaranteeing total_amount_cents as integer cents and settled status
 */
export const OrderResponseSchema = z
  .object({
    id: z.string().openapi({ example: 'ord_2026_9872' }),
    customer_id: z.string().openapi({ example: 'cust_switch_441' }),
    customer_tier: CustomerTierEnum.openapi({ example: 'pro' }),
    currency_code: z.string().openapi({ example: 'USD' }),
    total_amount_cents: z.number().int().nonnegative().openapi({
      description: 'Total transaction amount in minor currency units (cents)',
      example: 8900
    }),
    status: OrderStatusEnum.openapi({ example: 'settled' }),
    line_items: z.array(LineItemSchema).openapi({ description: 'Purchased items' }),
    created_at: z.string().openapi({ example: '2026-10-31T10:00:00.000Z' }),
    updated_at: z.string().openapi({ example: '2026-10-31T10:15:00.000Z' })
  })
  .openapi('OrderResponse');

export const CheckoutSessionRequestSchema = z
  .object({
    customer_id: z.string().openapi({ example: 'cust_switch_441' }),
    customer_tier: CustomerTierEnum.default('free').openapi({ example: 'pro' }),
    currency_code: z.string().default('USD').openapi({ example: 'USD' }),
    line_items: z.array(LineItemSchema).min(1),
    success_url: z.string().url().optional(),
    cancel_url: z.string().url().optional()
  })
  .openapi('CheckoutSessionRequest');

export const CheckoutSessionResponseSchema = z
  .object({
    session_id: z.string().openapi({ example: 'cs_live_981240192' }),
    checkout_url: z.string().openapi({ example: 'https://checkout.pactroom.dev/pay/cs_live_981240192' }),
    total_amount_cents: z.number().int().nonnegative().openapi({ example: 8900 }),
    currency_code: z.string().openapi({ example: 'USD' }),
    status: z.enum(['open', 'expired', 'completed']).openapi({ example: 'open' }),
    expires_at: z.string().openapi({ example: '2026-10-31T12:00:00.000Z' })
  })
  .openapi('CheckoutSessionResponse');

export const ActiveSubscriptionResponseSchema = z
  .object({
    subscription_id: z.string().openapi({ example: 'sub_enterprise_33' }),
    customer_id: z.string().openapi({ example: 'cust_switch_441' }),
    tier: CustomerTierEnum.openapi({ example: 'pro' }),
    currency_code: z.string().openapi({ example: 'USD' }),
    monthly_price_cents: z.number().int().nonnegative().openapi({ example: 4900 }),
    status: z.enum(['active', 'trialing', 'past_due', 'canceled']).openapi({ example: 'active' }),
    current_period_end: z.string().openapi({ example: '2026-11-30T23:59:59.000Z' })
  })
  .openapi('ActiveSubscriptionResponse');

// Types for V1
export type OrderResponse = z.infer<typeof OrderResponseSchema>;
export type CheckoutSessionRequest = z.infer<typeof CheckoutSessionRequestSchema>;
export type CheckoutSessionResponse = z.infer<typeof CheckoutSessionResponseSchema>;
export type ActiveSubscriptionResponse = z.infer<typeof ActiveSubscriptionResponseSchema>;
export type LineItem = z.infer<typeof LineItemSchema>;

// ============================================================================
// Legacy Schemas for /api/orders backward-compatibility
// ============================================================================

export const OrderItemSchema = z
  .object({
    productId: z.string().openapi({ example: 'prod_keyboard_01' }),
    name: z.string().openapi({ example: 'Mechanical Split Keyboard' }),
    quantity: z.number().int().positive().openapi({ example: 1 }),
    price: z.number().positive().openapi({ example: 189.99 })
  })
  .openapi('OrderItem');

export const OrderSchema = z
  .object({
    id: z.string().openapi({ example: 'ord_98723' }),
    customerId: z.string().openapi({ example: 'usr_441' }),
    items: z.array(OrderItemSchema),
    total_amount: z.number().openapi({
      description: 'Total order amount in USD',
      example: 189.99
    }),
    status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).openapi({ example: 'processing' }),
    createdAt: z.string().openapi({ example: '2026-10-31T10:00:00Z' }),
    updatedAt: z.string().openapi({ example: '2026-10-31T10:15:00Z' })
  })
  .openapi('Order');

export const CreateOrderRequestSchema = z
  .object({
    customerId: z.string().openapi({ example: 'usr_441' }),
    items: z.array(
      z.object({
        productId: z.string(),
        name: z.string(),
        quantity: z.number().int().positive(),
        price: z.number().positive()
      })
    )
  })
  .openapi('CreateOrderRequest');

export const OrderListResponseSchema = z.object({
  orders: z.array(OrderSchema),
  count: z.number()
});

export type Order = z.infer<typeof OrderSchema>;
export type OrderItem = z.infer<typeof OrderItemSchema>;
export type CreateOrderInput = z.infer<typeof CreateOrderRequestSchema>;
