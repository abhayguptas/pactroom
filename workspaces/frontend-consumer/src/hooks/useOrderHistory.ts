import { useState, useEffect, useCallback } from 'react';
import { OrderResponse } from '../schemas/orders.js';
import { defaultClient, PactRoomApiClient } from '../api/client.js';

export interface UseOrderHistoryResult {
  order: OrderResponse | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  formattedTotal: string | null;
  isSettled: boolean;
  totalCents: number | null;
}

/**
 * Hook for consuming V1 Orders endpoint on Machine B
 * Directly binds to total_amount_cents, currency_code, and settled status
 */
export function useOrderHistory(
  orderId = 'ord_2026_9872',
  client: PactRoomApiClient = defaultClient
): UseOrderHistoryResult {
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchOrder = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await client.getOrderV1(orderId);
      setOrder(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [orderId, client]);

  useEffect(() => {
    void fetchOrder();
  }, [fetchOrder]);

  const totalCents = order?.total_amount_cents ?? null;
  const isSettled = order?.status === 'settled';
  const formattedTotal =
    order && typeof order.total_amount_cents === 'number'
      ? `$${(order.total_amount_cents / 100).toFixed(2)} ${order.currency_code}`
      : null;

  return {
    order,
    loading,
    error,
    refetch: fetchOrder,
    formattedTotal,
    isSettled,
    totalCents
  };
}
