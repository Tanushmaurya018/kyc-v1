import { useState, useEffect } from "react";
import {
  getOrgDetail,
  getOrgUsers,
  getOrgTokens,
  getOrgBalance,
  getOrgCredits,
  type OrgDetail,
  type OrgUser,
  type OrgToken,
  type OrgBalance,
  type OrgCreditTopUp,
} from "@/services/org-api";

export interface OrgDetailData {
  org: OrgDetail | null;
  users: OrgUser[];
  tokens: OrgToken[];
  tokenCount: number;
  balance: OrgBalance | null;
  topUps: OrgCreditTopUp[];
}

export function useOrgDetail(orgId: string | undefined) {
  const [data, setData] = useState<OrgDetailData>({
    org: null,
    users: [],
    tokens: [],
    tokenCount: 0,
    balance: null,
    topUps: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!orgId) return;
    let cancelled = false;

    async function fetchAll() {
      setIsLoading(true);
      setError(null);
      try {
        const [org, usersRes, tokensRes, balance, creditsRes] =
          await Promise.all([
            getOrgDetail(orgId!),
            getOrgUsers(orgId!),
            getOrgTokens(orgId!),
            getOrgBalance(orgId!).catch(() => null),
            getOrgCredits(orgId!).catch(() => null),
          ]);

        if (!cancelled) {
          setData({
            org,
            users: usersRes.users,
            tokens: tokensRes.tokens,
            tokenCount: tokensRes.totalCount,
            balance,
            topUps: creditsRes?.credits ?? [],
          });
        }
      } catch (err) {
        if (!cancelled) setError(err as Error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchAll();
    return () => {
      cancelled = true;
    };
  }, [orgId]);

  return { ...data, isLoading, error };
}
