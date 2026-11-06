import { useState, useEffect } from 'react';
import { User } from '../schemas/users.js';
import { PactRoomApiClient, defaultClient } from '../api/client.js';

export function useUserProfile(userId: string, client: PactRoomApiClient = defaultClient) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    client
      .getUser(userId)
      .then((data) => {
        if (isMounted) setUser(data);
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
  }, [userId, client]);

  return { user, loading, error };
}

