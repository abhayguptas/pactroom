import { useState, useEffect } from 'react';
import { Invoice, Subscription } from '../schemas/billing.js';
import { PactRoomApiClient, defaultClient } from '../api/client.js';

export function useBilling(client: PactRoomApiClient = defaultClient) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([client.getInvoices(), client.getSubscription()])
      .then(([invs, sub]) => {
        if (isMounted) {
          setInvoices(invs);
          setSubscription(sub);
        }
      })
      .catch((err) => {
        if (isMounted) setError(err instanceof Error ? err : new Error(String(err)));
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [client]);

  return { invoices, subscription, loading, error };
}

