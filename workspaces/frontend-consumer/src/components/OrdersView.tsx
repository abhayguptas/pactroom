import React from 'react';
import { useOrders } from '../hooks/useOrders.js';
import { Order } from '../schemas/orders.js';

export const OrdersView: React.FC = () => {
  const { orders, loading, error, refetch } = useOrders();

  if (loading) {
    return <div className="p-4 text-gray-400">Loading verified orders from backend...</div>;
  }

  if (error) {
    return (
      <div className="p-4 border border-red-500 bg-red-950/40 text-red-300 rounded-lg">
        <h4 className="font-bold">Contract Schema Desynchronization Error</h4>
        <p className="text-sm font-mono mt-1">{error.message}</p>
        <button
          onClick={() => void refetch()}
          className="mt-3 px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-semibold"
        >
          Retry Fetch
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Active Orders ({orders.length})</h2>
        <button
          onClick={() => void refetch()}
          className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-xs"
        >
          Refresh
        </button>
      </div>

      <div className="grid gap-3">
        {orders.map((order: Order) => (
          <div
            key={order.id}
            className="p-4 rounded-lg bg-neutral-900 border border-neutral-800 flex justify-between items-center"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm text-cyan-400 font-semibold">{order.id}</span>
                <span className="text-xs px-2 py-0.5 rounded-full uppercase bg-neutral-800 text-neutral-300 font-mono">
                  {order.status}
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                Items: {order.items.map((i) => `${i.name} (x${i.quantity})`).join(', ')}
              </p>
            </div>

            <div className="text-right">
              {/* Note: Front-end renders total_amount as guaranteed by V1 contract */}
              <div className="text-lg font-bold text-emerald-400 font-mono">
                ${order.total_amount.toFixed(2)}
              </div>
              <div className="text-xs text-neutral-500">
                {new Date(order.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

