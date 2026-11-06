import React from 'react';
import { OrderResponse } from '../schemas/orders.js';

export interface CheckoutSummaryProps {
  order: OrderResponse;
  onConfirmSettlement?: (orderId: string) => void;
}

export function formatCurrency(amountCents: number, currencyCode: string): string {
  const amountMajor = (amountCents / 100).toFixed(2);
  const symbol = currencyCode === 'USD' ? '$' : currencyCode === 'EUR' ? '€' : `${currencyCode} `;
  return `${symbol}${amountMajor}`;
}

export const CheckoutSummary: React.FC<CheckoutSummaryProps> = ({
  order,
  onConfirmSettlement
}) => {
  const formattedTotal = formatCurrency(order.total_amount_cents, order.currency_code);
  const isSettled = order.status === 'settled';

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6 text-neutral-100 shadow-xl max-w-lg">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
        <div>
          <span className="text-xs uppercase tracking-wider text-neutral-400">Order Reference</span>
          <h2 className="text-lg font-bold font-mono text-cyan-400">{order.id}</h2>
        </div>
        <div className="text-right">
          <span
            className={`inline-block px-2.5 py-1 text-xs font-mono font-semibold rounded-full border ${
              isSettled
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400'
                : 'bg-amber-950/60 border-amber-500/40 text-amber-400'
            }`}
          >
            {order.status.toUpperCase()}
          </span>
          <div className="text-[10px] uppercase text-neutral-400 mt-1">
            Tier: <span className="font-semibold text-neutral-200">{order.customer_tier}</span>
          </div>
        </div>
      </div>

      <div className="py-4 space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
          Purchased Items ({order.line_items.length})
        </h3>
        <ul className="divide-y divide-neutral-900">
          {order.line_items.map((item) => (
            <li key={item.item_id} className="py-2 flex justify-between items-center text-sm">
              <div>
                <span className="text-neutral-200">{item.title}</span>
                <span className="text-neutral-500 text-xs ml-2">×{item.quantity}</span>
              </div>
              <span className="font-mono text-neutral-300">
                {formatCurrency(item.unit_price_cents * item.quantity, order.currency_code)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-neutral-800 pt-4 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-neutral-400">Total Settlement Due</span>
          <span className="text-2xl font-bold font-mono text-emerald-400">
            {formattedTotal}
          </span>
        </div>
        <div className="text-xs text-neutral-500 flex justify-between">
          <span>Currency: {order.currency_code}</span>
          <span>Minor Cents: {order.total_amount_cents}</span>
        </div>
      </div>

      {isSettled && onConfirmSettlement && (
        <button
          onClick={() => onConfirmSettlement(order.id)}
          className="mt-6 w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-semibold text-white text-sm transition-colors shadow-lg"
        >
          Acknowledge Settled Transaction
        </button>
      )}
    </div>
  );
};
