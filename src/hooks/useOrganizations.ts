import { useState, useEffect } from "react";
import { getOrganizations, type OrgListItem } from "@/services/org-api";

export function useOrganizations() {
  const [orgs, setOrgs] = useState<OrgListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchOrgs() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getOrganizations();
        if (!cancelled) setOrgs(data);
      } catch (err) {
        if (!cancelled) setError(err as Error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchOrgs();
    return () => { cancelled = true; };
  }, []);

  return { orgs, isLoading, error };
}
