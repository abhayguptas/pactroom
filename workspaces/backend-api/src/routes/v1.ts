import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  OrderResponseSchema,
  CheckoutSessionRequestSchema,
  CheckoutSessionResponseSchema,
  ActiveSubscriptionResponseSchema
} from '../schemas/orders.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const v1Router = Router();

// In-memory baseline mock entity database (no fake delays, real deterministic data)
const MOCK_ORDER = {
  id: 'ord_2026_9872',
  customer_id: 'cust_switch_441',
  customer_tier: 'pro' as const,
  currency_code: 'USD',
  total_amount_cents: 8900,
  status: 'settled' as const,
  line_items: [
    {
      item_id: 'item_desk_mat_01',
      title: 'Merino Wool Desk Mat',
      unit_price_cents: 4500,
      quantity: 1
    },
    {
      item_id: 'item_cable_dock_02',
      title: 'Magnetic Cable Management Dock',
      unit_price_cents: 4400,
      quantity: 1
    }
  ],
  created_at: '2026-10-31T10:00:00.000Z',
  updated_at: '2026-10-31T10:15:00.000Z'
};

const MOCK_SUBSCRIPTION = {
  subscription_id: 'sub_enterprise_33',
  customer_id: 'cust_switch_441',
  tier: 'pro' as const,
  currency_code: 'USD',
  monthly_price_cents: 4900,
  status: 'active' as const,
  current_period_end: '2026-11-30T23:59:59.000Z'
};

/**
 * GET /api/v1/orders/:id
 * Strict baseline response with total_amount_cents & status settled
 */
v1Router.get('/orders/:id', (req: Request, res: Response) => {
  const orderId = String(req.params.id);
  const order = {
    ...MOCK_ORDER,
    id: orderId
  };

  // Check if uncommitted mutation has broken this response shape
  const schemaFile = path.resolve(__dirname, '../schemas/orders.ts');
  const schemaSource = fs.existsSync(schemaFile) ? fs.readFileSync(schemaFile, 'utf-8') : '';
  const isMutated = schemaSource.includes('pricing_breakdown: PricingBreakdownSchema');

  if (isMutated) {
    // Return the breaking schema payload: total_amount_cents refactored to nested pricing_breakdown
    return res.json({
      id: orderId,
      customer_id: order.customer_id,
      customer_tier: order.customer_tier,
      currency_code: order.currency_code,
      pricing_breakdown: {
        amount_minor: 8900,
        currency: 'USD',
        tax_cents: 720
      },
      status: 'completed', // 'settled' removed
      line_items: order.line_items,
      created_at: order.created_at,
      updated_at: order.updated_at
    });
  }

  // Return order validated against schema
  const parsed = OrderResponseSchema.safeParse(order);
  return res.json(parsed.success ? parsed.data : order);
});

/**
 * POST /api/v1/checkout/session
 * Creates an e-commerce checkout session with total_amount_cents
 */
v1Router.post('/checkout/session', (req: Request, res: Response) => {
  const parseResult = CheckoutSessionRequestSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      error: 'Invalid checkout session payload',
      details: parseResult.error.issues
    });
  }

  const { line_items, currency_code } = parseResult.data;
  const calculatedTotal = line_items.reduce((sum, item) => sum + item.unit_price_cents * item.quantity, 0);

  const sessionId = 'cs_live_' + Math.random().toString(36).substring(2, 11);
  const responsePayload = {
    session_id: sessionId,
    checkout_url: `https://checkout.pactroom.dev/pay/${sessionId}`,
    total_amount_cents: calculatedTotal,
    currency_code: currency_code || 'USD',
    status: 'open' as const,
    expires_at: new Date(Date.now() + 2 * 3600 * 1000).toISOString()
  };

  const validated = CheckoutSessionResponseSchema.parse(responsePayload);
  return res.status(201).json(validated);
});

/**
 * GET /api/v1/subscriptions/active
 * Active subscription details with monthly_price_cents
 */
v1Router.get('/subscriptions/active', (_req: Request, res: Response) => {
  const validated = ActiveSubscriptionResponseSchema.parse(MOCK_SUBSCRIPTION);
  return res.json(validated);
});

// Paths to manage live uncommitted disk state
const SCHEMAS_ORDERS_PATH = path.resolve(__dirname, '../schemas/orders.ts');

export const BASELINE_SCHEMA_CONTENT = `import { z } from 'zod';
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
`;

export const MUTATED_BREAKING_SCHEMA_CONTENT = `import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

// ============================================================================
// V1 Strict E-Commerce & Subscription Billing Schemas (MUTATED BREAKING)
// ============================================================================

export const CustomerTierEnum = z
  .enum(['free', 'pro', 'enterprise'])
  .openapi('CustomerTier');

// BREAKING CHANGE: 'settled' status removed and replaced with 'completed'
export const OrderStatusEnum = z
  .enum(['pending', 'processing', 'completed', 'refunded', 'failed'])
  .openapi('OrderStatus');

export const LineItemSchema = z
  .object({
    item_id: z.string().openapi({ example: 'item_desk_mat_01' }),
    title: z.string().openapi({ example: 'Merino Wool Desk Mat' }),
    unit_price_cents: z.number().int().positive().openapi({ example: 4500 }),
    quantity: z.number().int().positive().openapi({ example: 1 })
  })
  .openapi('LineItem');

export const PricingBreakdownSchema = z
  .object({
    amount_minor: z.number().int().nonnegative().openapi({ example: 8900 }),
    currency: z.string().openapi({ example: 'USD' }),
    tax_cents: z.number().int().nonnegative().openapi({ example: 720 })
  })
  .openapi('PricingBreakdown');

/**
 * MUTATED BREAKING Order Response Schema
 * BREAKING: total_amount_cents removed, replaced with nested pricing_breakdown
 * BREAKING: OrderStatusEnum no longer has 'settled'
 */
export const OrderResponseSchema = z
  .object({
    id: z.string().openapi({ example: 'ord_2026_9872' }),
    customer_id: z.string().openapi({ example: 'cust_switch_441' }),
    customer_tier: CustomerTierEnum.openapi({ example: 'pro' }),
    currency_code: z.string().openapi({ example: 'USD' }),
    pricing_breakdown: PricingBreakdownSchema.openapi({
      description: 'Refactored nested pricing breakdown'
    }),
    status: OrderStatusEnum.openapi({ example: 'completed' }),
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
    pricing_breakdown: PricingBreakdownSchema.optional(),
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
`;

/**
 * POST /api/v1/admin/mutate-breaking
 * Real disk mutation: writes the breaking schema to disk without committing,
 * keeping the working tree dirty just like a developer working on Machine A.
 */
v1Router.post('/admin/mutate-breaking', (_req: Request, res: Response) => {
  fs.writeFileSync(SCHEMAS_ORDERS_PATH, MUTATED_BREAKING_SCHEMA_CONTENT, 'utf-8');
  return res.json({
    status: 'mutated',
    message: 'Applied uncommitted breaking schema changes on disk',
    mutatedFile: SCHEMAS_ORDERS_PATH,
    changes: [
      {
        field: 'total_amount_cents',
        action: 'removed',
        replacedBy: 'pricing_breakdown.amount_minor'
      },
      {
        field: 'status',
        action: 'narrowed_enum',
        removedValue: 'settled',
        addedValue: 'completed'
      }
    ],
    isDirty: true
  });
});

/**
 * POST /api/v1/admin/reset-baseline
 * Restores the clean baseline state on disk.
 */
v1Router.post('/admin/reset-baseline', (_req: Request, res: Response) => {
  fs.writeFileSync(SCHEMAS_ORDERS_PATH, BASELINE_SCHEMA_CONTENT, 'utf-8');
  return res.json({
    status: 'reset',
    message: 'Restored clean baseline schema state on disk',
    file: SCHEMAS_ORDERS_PATH,
    isDirty: false
  });
});

/**
 * GET /api/v1/admin/status
 * Queries current schema mutation status on disk.
 */
v1Router.get('/admin/status', (_req: Request, res: Response) => {
  const currentContent = fs.existsSync(SCHEMAS_ORDERS_PATH)
    ? fs.readFileSync(SCHEMAS_ORDERS_PATH, 'utf-8')
    : '';

  const isMutated = currentContent.includes('pricing_breakdown: PricingBreakdownSchema');

  return res.json({
    state: isMutated ? 'mutated_breaking' : 'clean_baseline',
    isDirty: isMutated,
    file: SCHEMAS_ORDERS_PATH
  });
});
