import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const InvoiceStatusEnum = z.enum(['paid', 'open', 'void', 'uncollectible']);

export const InvoiceSchema = z
  .object({
    id: z.string().openapi({ example: 'inv_2026_09' }),
    customerId: z.string().openapi({ example: 'usr_441' }),
    amountDue: z.number().openapi({ example: 49.0 }),
    amountPaid: z.number().openapi({ example: 49.0 }),
    currency: z.string().openapi({ example: 'usd' }),
    status: InvoiceStatusEnum.openapi({ example: 'paid' }),
    dueDate: z.string().openapi({ example: '2026-11-15' }),
    paidAt: z.string().nullable().openapi({ example: '2026-10-31T09:20:00Z' })
  })
  .openapi('Invoice');

export const ChargeRequestSchema = z
  .object({
    customerId: z.string().openapi({ example: 'usr_441' }),
    amount: z.number().positive().openapi({ example: 49.0 }),
    currency: z.string().default('usd').openapi({ example: 'usd' }),
    description: z.string().openapi({ example: 'Pro Team Subscription - Nov 2026' })
  })
  .openapi('ChargeRequest');

export const SubscriptionSchema = z
  .object({
    id: z.string().openapi({ example: 'sub_enterprise_33' }),
    tier: z.enum(['starter', 'pro', 'enterprise']).openapi({ example: 'pro' }),
    active: z.boolean().openapi({ example: true }),
    currentPeriodEnd: z.string().openapi({ example: '2026-11-30T23:59:59Z' })
  })
  .openapi('Subscription');

export type Invoice = z.infer<typeof InvoiceSchema>;
export type ChargeRequest = z.infer<typeof ChargeRequestSchema>;
export type Subscription = z.infer<typeof SubscriptionSchema>;

