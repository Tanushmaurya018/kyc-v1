import { useState, useEffect, useCallback } from 'react';
import { getUsersByOrgId } from '@/data';
import type { User } from '@/types';
import { delay } from '@/lib/utils';

export function useUsers(orgId: string) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await delay(300);
      const data = getUsersByOrgId(orgId);
      setUsers(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, isLoading, error, refetch: fetchUsers };
}
