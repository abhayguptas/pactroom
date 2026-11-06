import { useState, useEffect, useCallback } from 'react';
import { Order, OrderListResponse } from '../schemas/orders.js';
import { PactRoomApiClient, defaultClient } from '../api/client.js';

export interface UseOrdersResult {
  orders: Order[];
  count: number;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useOrders(client: PactRoomApiClient = defaultClient): UseOrdersResult {
  const [data, setData] = useState<OrderListResponse>({ orders: [], count: 0 });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await client.getOrders();
      setData(response);
    } catch (err: unknown) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => {
    void fetchOrders();
  }, [fetchOrders]);

  return {
    orders: data.orders,
    count: data.count,
    loading,
    error,
    refetch: fetchOrders
  };
}

