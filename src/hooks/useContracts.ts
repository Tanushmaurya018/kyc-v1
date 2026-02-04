import { useState, useEffect, useCallback } from 'react';
import { contracts as stubContracts, getContractsByOrgId, getContractById } from '@/data';
import type { Contract } from '@/types';
import { delay } from '@/lib/utils';

export function useContracts(orgId?: string) {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchContracts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await delay(400);
      const data = orgId ? getContractsByOrgId(orgId) : stubContracts;
      setContracts(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  return { contracts, isLoading, error, refetch: fetchContracts };
}

export function useContract(contractId: string | undefined) {
  const [contract, setContract] = useState<Contract | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchContract() {
      if (!contractId) {
        setContract(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        await delay(300);
        const data = getContractById(contractId);
        if (!data) {
          throw new Error('Contract not found');
        }
        setContract(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchContract();
  }, [contractId]);

  return { contract, isLoading, error };
}
