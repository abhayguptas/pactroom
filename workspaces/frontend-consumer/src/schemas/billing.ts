import { z } from 'zod';

export const InvoiceStatusSchema = z.enum(['paid', 'open', 'void', 'uncollectible']);

export const InvoiceSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amountDue: z.number(),
  amountPaid: z.number(),
  currency: z.string(),
  status: InvoiceStatusSchema,
  dueDate: z.string(),
  paidAt: z.string().nullable()
});

export const InvoicesResponseSchema = z.object({
  invoices: z.array(InvoiceSchema)
});

export const SubscriptionSchema = z.object({
  id: z.string(),
  tier: z.enum(['starter', 'pro', 'enterprise']),
  active: z.boolean(),
  currentPeriodEnd: z.string()
});

export type Invoice = z.infer<typeof InvoiceSchema>;
export type Subscription = z.infer<typeof SubscriptionSchema>;

