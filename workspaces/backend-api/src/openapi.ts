import {
  OpenAPIRegistry,
  OpenApiGeneratorV31
} from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import {
  OrderSchema,
  OrderListResponseSchema,
  CreateOrderRequestSchema,
  OrderResponseSchema,
  CheckoutSessionRequestSchema,
  CheckoutSessionResponseSchema,
  ActiveSubscriptionResponseSchema
} from './schemas/orders.js';
import {
  UserSchema,
  UserListResponseSchema,
  UpdateUserRequestSchema
} from './schemas/users.js';
import {
  InvoiceSchema,
  ChargeRequestSchema,
  SubscriptionSchema
} from './schemas/billing.js';

export const registry = new OpenAPIRegistry();

// ============================================================================
// V1 E-Commerce Checkout & Subscription Billing API (Strict Contracts)
// ============================================================================
registry.registerPath({
  method: 'get',
  path: '/api/v1/orders/{id}',
  summary: 'Get order details with strict total_amount_cents and status settled',
  tags: ['V1 Orders'],
  parameters: [
    {
      name: 'id',
      in: 'path',
      required: true,
      schema: { type: 'string' }
    }
  ],
  responses: {
    200: {
      description: 'Order found with strict total_amount_cents and line items',
      content: {
        'application/json': {
          schema: OrderResponseSchema
        }
      }
    },
    404: {
      description: 'Order not found',
      content: {
        'application/json': {
          schema: z.object({ error: z.string() })
        }
      }
    }
  }
});

registry.registerPath({
  method: 'post',
  path: '/api/v1/checkout/session',
  summary: 'Create e-commerce checkout session with total_amount_cents',
  tags: ['V1 Checkout'],
  request: {
    body: {
      description: 'Checkout session payload with customer ID and line items',
      content: {
        'application/json': {
          schema: CheckoutSessionRequestSchema
        }
      }
    }
  },
  responses: {
    201: {
      description: 'Checkout session created successfully',
      content: {
        'application/json': {
          schema: CheckoutSessionResponseSchema
        }
      }
    },
    400: {
      description: 'Validation failed',
      content: {
        'application/json': {
          schema: z.object({ error: z.string(), details: z.array(z.any()).optional() })
        }
      }
    }
  }
});

registry.registerPath({
  method: 'get',
  path: '/api/v1/subscriptions/active',
  summary: 'Get active subscription billing details',
  tags: ['V1 Subscriptions'],
  responses: {
    200: {
      description: 'Active subscription retrieved with monthly_price_cents',
      content: {
        'application/json': {
          schema: ActiveSubscriptionResponseSchema
        }
      }
    }
  }
});

// 1. Orders Endpoints
registry.registerPath({
  method: 'get',
  path: '/api/orders',
  summary: 'List customer orders',
  tags: ['Orders'],
  parameters: [
    {
      name: 'limit',
      in: 'query',
      required: false,
      schema: { type: 'integer', default: 20 }
    }
  ],
  responses: {
    200: {
      description: 'Successful retrieval of orders list',
      content: {
        'application/json': {
          schema: OrderListResponseSchema
        }
      }
    }
  }
});

registry.registerPath({
  method: 'get',
  path: '/api/orders/{id}',
  summary: 'Get order details by ID',
  tags: ['Orders'],
  parameters: [
    {
      name: 'id',
      in: 'path',
      required: true,
      schema: { type: 'string' }
    }
  ],
  responses: {
    200: {
      description: 'Order found',
      content: {
        'application/json': {
          schema: OrderSchema
        }
      }
    },
    404: {
      description: 'Order not found',
      content: {
        'application/json': {
          schema: z.object({ error: z.string() })
        }
      }
    }
  }
});

registry.registerPath({
  method: 'post',
  path: '/api/orders',
  summary: 'Create a new order',
  tags: ['Orders'],
  request: {
    body: {
      description: 'Order creation payload',
      content: {
        'application/json': {
          schema: CreateOrderRequestSchema
        }
      }
    }
  },
  responses: {
    201: {
      description: 'Order created successfully',
      content: {
        'application/json': {
          schema: OrderSchema
        }
      }
    },
    400: {
      description: 'Validation failed',
      content: {
        'application/json': {
          schema: z.object({ error: z.string() })
        }
      }
    }
  }
});

registry.registerPath({
  method: 'post',
  path: '/api/orders/{id}/cancel',
  summary: 'Cancel an order by ID',
  tags: ['Orders'],
  parameters: [
    {
      name: 'id',
      in: 'path',
      required: true,
      schema: { type: 'string' }
    }
  ],
  responses: {
    200: {
      description: 'Order cancelled successfully',
      content: {
        'application/json': {
          schema: OrderSchema
        }
      }
    },
    404: {
      description: 'Order not found',
      content: {
        'application/json': {
          schema: z.object({ error: z.string() })
        }
      }
    }
  }
});

// 2. Users Endpoints
registry.registerPath({
  method: 'get',
  path: '/api/users',
  summary: 'List users',
  tags: ['Users'],
  responses: {
    200: {
      description: 'List of registered users',
      content: {
        'application/json': {
          schema: UserListResponseSchema
        }
      }
    }
  }
});

registry.registerPath({
  method: 'get',
  path: '/api/users/{id}',
  summary: 'Get user profile by ID',
  tags: ['Users'],
  parameters: [
    {
      name: 'id',
      in: 'path',
      required: true,
      schema: { type: 'string' }
    }
  ],
  responses: {
    200: {
      description: 'User profile retrieved',
      content: {
        'application/json': {
          schema: UserSchema
        }
      }
    },
    404: {
      description: 'User not found',
      content: {
        'application/json': {
          schema: z.object({ error: z.string() })
        }
      }
    }
  }
});

registry.registerPath({
  method: 'put',
  path: '/api/users/{id}',
  summary: 'Update user profile',
  tags: ['Users'],
  parameters: [
    {
      name: 'id',
      in: 'path',
      required: true,
      schema: { type: 'string' }
    }
  ],
  request: {
    body: {
      description: 'User update fields',
      content: {
        'application/json': {
          schema: UpdateUserRequestSchema
        }
      }
    }
  },
  responses: {
    200: {
      description: 'User updated successfully',
      content: {
        'application/json': {
          schema: UserSchema
        }
      }
    }
  }
});

// 3. Billing Endpoints
registry.registerPath({
  method: 'get',
  path: '/api/billing/invoices',
  summary: 'List billing invoices',
  tags: ['Billing'],
  responses: {
    200: {
      description: 'List of invoices',
      content: {
        'application/json': {
          schema: z.object({
            invoices: z.array(InvoiceSchema)
          })
        }
      }
    }
  }
});

registry.registerPath({
  method: 'post',
  path: '/api/billing/charge',
  summary: 'Process immediate payment charge',
  tags: ['Billing'],
  request: {
    body: {
      description: 'Payment charge details',
      content: {
        'application/json': {
          schema: ChargeRequestSchema
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Charge processed successfully',
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            transactionId: z.string(),
            amount: z.number(),
            currency: z.string()
          })
        }
      }
    }
  }
});

registry.registerPath({
  method: 'get',
  path: '/api/billing/subscription',
  summary: 'Get active subscription',
  tags: ['Billing'],
  responses: {
    200: {
      description: 'Active subscription details',
      content: {
        'application/json': {
          schema: SubscriptionSchema
        }
      }
    }
  }
});

export function generateOpenApiDocument(version = '1.0.0') {
  const generator = new OpenApiGeneratorV31(registry.definitions);
  return generator.generateDocument({
    openapi: '3.1.0',
    info: {
      title: 'PactRoom Backend API Microservice',
      version,
      description:
        'Live production-grade REST API microservice for orders, users, and billing. OpenAPI 3.1 specification dynamically generated from code.'
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Local development server'
      }
    ]
  });
}

