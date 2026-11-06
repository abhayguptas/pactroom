import { Router, Request, Response } from 'express';
import {
  CreateOrderRequestSchema,
  Order
} from '../schemas/orders.js';

export const ordersRouter = Router();

// Real in-memory state for orders
const ordersStore: Map<string, Order> = new Map([
  [
    'ord_101',
    {
      id: 'ord_101',
      customerId: 'usr_441',
      items: [
        {
          productId: 'prod_keyboard_01',
          name: 'Mechanical Split Keyboard',
          quantity: 1,
          price: 189.99
        }
      ],
      total_amount: 189.99,
      status: 'delivered',
      createdAt: '2026-10-25T14:32:00.000Z',
      updatedAt: '2026-10-28T09:15:00.000Z'
    }
  ],
  [
    'ord_102',
    {
      id: 'ord_102',
      customerId: 'usr_441',
      items: [
        {
          productId: 'prod_mouse_02',
          name: 'Ergonomic Vertical Mouse',
          quantity: 2,
          price: 64.5
        }
      ],
      total_amount: 129.0,
      status: 'processing',
      createdAt: '2026-10-30T11:20:00.000Z',
      updatedAt: '2026-10-30T11:20:00.000Z'
    }
  ]
]);

// GET /api/orders
ordersRouter.get('/', (req: Request, res: Response) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
  const list = Array.from(ordersStore.values()).slice(0, limit);
  res.json({
    orders: list,
    count: list.length
  });
});

// GET /api/orders/:id
ordersRouter.get('/:id', (req: Request, res: Response) => {
  const id = String(req.params.id);
  const order = ordersStore.get(id);
  if (!order) {
    res.status(404).json({ error: `Order with ID '${id}' not found` });
    return;
  }
  res.json(order);
});

// POST /api/orders
ordersRouter.post('/', (req: Request, res: Response) => {
  const parseResult = CreateOrderRequestSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({
      error: 'Invalid order payload',
      details: parseResult.error.flatten()
    });
    return;
  }

  const { customerId, items } = parseResult.data;
  const total_amount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const newOrder: Order = {
    id: `ord_${Date.now()}`,
    customerId,
    items,
    total_amount: Math.round(total_amount * 100) / 100,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  ordersStore.set(newOrder.id, newOrder);
  res.status(201).json(newOrder);
});

// POST /api/orders/:id/cancel
ordersRouter.post('/:id/cancel', (req: Request, res: Response) => {
  const id = String(req.params.id);
  const order = ordersStore.get(id);
  if (!order) {
    res.status(404).json({ error: `Order with ID '${id}' not found` });
    return;
  }

  order.status = 'cancelled';
  order.updatedAt = new Date().toISOString();
  ordersStore.set(order.id, order);

  res.json(order);
});

