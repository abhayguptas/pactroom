import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

describe('Backend API Microservice', () => {
  const app = createApp();

  it('GET /health returns 200 OK', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('backend-api');
  });

  it('GET /openapi.json returns valid OpenAPI 3.1 JSON', async () => {
    const res = await request(app).get('/openapi.json');
    expect(res.status).toBe(200);
    expect(res.body.openapi).toBe('3.1.0');
    expect(res.body.paths).toHaveProperty('/api/orders');
    expect(res.body.paths).toHaveProperty('/api/users');
    expect(res.body.paths).toHaveProperty('/api/billing/invoices');
  });

  it('GET /api/orders returns list of orders', async () => {
    const res = await request(app).get('/api/orders');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.orders)).toBe(true);
    expect(res.body.orders.length).toBeGreaterThan(0);
    expect(res.body.orders[0]).toHaveProperty('total_amount');
    expect(res.body.orders[0]).toHaveProperty('status');
  });

  it('POST /api/orders creates a new valid order', async () => {
    const payload = {
      customerId: 'usr_441',
      items: [
        {
          productId: 'prod_screen_01',
          name: '4K Monitor',
          quantity: 1,
          price: 399.99
        }
      ]
    };
    const res = await request(app).post('/api/orders').send(payload);
    expect(res.status).toBe(201);
    expect(res.body.total_amount).toBe(399.99);
    expect(res.body.status).toBe('pending');
  });

  it('GET /api/users returns list of users', async () => {
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(200);
    expect(res.body.users.length).toBeGreaterThanOrEqual(1);
  });

  it('GET /api/billing/invoices returns invoices list', async () => {
    const res = await request(app).get('/api/billing/invoices');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.invoices)).toBe(true);
  });

  describe('V1 Strict E-Commerce & Subscription Billing Endpoints', () => {
    it('GET /api/v1/orders/:id returns strict order with total_amount_cents or candidate pricing_breakdown', async () => {
      const res = await request(app).get('/api/v1/orders/ord_2026_9872');
      expect(res.status).toBe(200);
      expect(res.body.id).toBe('ord_2026_9872');
      expect(res.body.customer_tier).toBe('pro');
      expect(res.body.currency_code).toBe('USD');
      if (res.body.pricing_breakdown) {
        // Mutated Option B candidate state
        expect(res.body.pricing_breakdown.amount_minor).toBe(8900);
        expect(res.body.status).toBe('completed');
      } else {
        // Clean baseline state
        expect(res.body.total_amount_cents).toBe(8900);
        expect(res.body.status).toBe('settled');
      }
      expect(Array.isArray(res.body.line_items)).toBe(true);
      expect(res.body.line_items.length).toBeGreaterThan(0);
    });

    it('POST /api/v1/checkout/session creates a checkout session calculating total_amount_cents', async () => {
      const payload = {
        customer_id: 'cust_switch_441',
        customer_tier: 'enterprise',
        currency_code: 'USD',
        line_items: [
          {
            item_id: 'item_switch_hub',
            title: 'Switch Hub Pro Dock',
            unit_price_cents: 12000,
            quantity: 2
          }
        ]
      };
      const res = await request(app).post('/api/v1/checkout/session').send(payload);
      expect(res.status).toBe(201);
      expect(res.body.session_id).toMatch(/^cs_live_/);
      expect(res.body.total_amount_cents).toBe(24000);
      expect(res.body.status).toBe('open');
      expect(res.body.currency_code).toBe('USD');
    });

    it('GET /api/v1/subscriptions/active returns active subscription with monthly_price_cents', async () => {
      const res = await request(app).get('/api/v1/subscriptions/active');
      expect(res.status).toBe(200);
      expect(res.body.subscription_id).toBe('sub_enterprise_33');
      expect(res.body.monthly_price_cents).toBe(4900);
      expect(res.body.status).toBe('active');
      expect(res.body.tier).toBe('pro');
    });

    it('supports live on-disk mutation and clean baseline reset via admin API', async () => {
      // 1. Check clean baseline status
      const statusRes1 = await request(app).get('/api/v1/admin/status');
      expect(statusRes1.status).toBe(200);

      // 2. Mutate schema breaking change
      const mutateRes = await request(app).post('/api/v1/admin/mutate-breaking');
      expect(mutateRes.status).toBe(200);
      expect(mutateRes.body.status).toBe('mutated');
      expect(mutateRes.body.isDirty).toBe(true);

      // 3. Verify GET /api/v1/orders/:id now serves the mutated shape (pricing_breakdown)
      const mutatedOrderRes = await request(app).get('/api/v1/orders/ord_2026_9872');
      expect(mutatedOrderRes.status).toBe(200);
      expect(mutatedOrderRes.body).toHaveProperty('pricing_breakdown');
      expect(mutatedOrderRes.body).not.toHaveProperty('total_amount_cents');
      expect(mutatedOrderRes.body.status).toBe('completed');

      // 4. Reset baseline
      const resetRes = await request(app).post('/api/v1/admin/reset-baseline');
      expect(resetRes.status).toBe(200);
      expect(resetRes.body.status).toBe('reset');

      // 5. Verify restored baseline shape
      const restoredOrderRes = await request(app).get('/api/v1/orders/ord_2026_9872');
      expect(restoredOrderRes.status).toBe(200);
      expect(restoredOrderRes.body).toHaveProperty('total_amount_cents');
      expect(restoredOrderRes.body.status).toBe('settled');
    });
  });
});

