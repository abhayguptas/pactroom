import { Router, Request, Response } from 'express';
import {
  ChargeRequestSchema,
  Invoice,
  Subscription
} from '../schemas/billing.js';

export const billingRouter = Router();

const invoicesStore: Invoice[] = [
  {
    id: 'inv_2026_09',
    customerId: 'usr_441',
    amountDue: 49.0,
    amountPaid: 49.0,
    currency: 'usd',
    status: 'paid',
    dueDate: '2026-10-15',
    paidAt: '2026-10-14T18:00:00.000Z'
  },
  {
    id: 'inv_2026_10',
    customerId: 'usr_441',
    amountDue: 49.0,
    amountPaid: 49.0,
    currency: 'usd',
    status: 'paid',
    dueDate: '2026-11-15',
    paidAt: '2026-10-31T09:20:00.000Z'
  }
];

const subscriptionStore: Subscription = {
  id: 'sub_enterprise_33',
  tier: 'pro',
  active: true,
  currentPeriodEnd: '2026-11-30T23:59:59.000Z'
};

// GET /api/billing/invoices
billingRouter.get('/invoices', (_req: Request, res: Response) => {
  res.json({ invoices: invoicesStore });
});

// POST /api/billing/charge
billingRouter.post('/charge', (req: Request, res: Response) => {
  const parseResult = ChargeRequestSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: 'Invalid charge payload', details: parseResult.error.flatten() });
    return;
  }

  const { customerId, amount, currency } = parseResult.data;
  const newInvoice: Invoice = {
    id: `inv_${Date.now()}`,
    customerId,
    amountDue: amount,
    amountPaid: amount,
    currency,
    status: 'paid',
    dueDate: new Date().toISOString().split('T')[0],
    paidAt: new Date().toISOString()
  };

  invoicesStore.push(newInvoice);

  res.json({
    success: true,
    transactionId: `tx_${Date.now()}`,
    amount,
    currency
  });
});

// GET /api/billing/subscription
billingRouter.get('/subscription', (_req: Request, res: Response) => {
  res.json(subscriptionStore);
});

