import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { CreditsOverview, TopUpHistoryTable, PricingTable, UsageBreakdownTable } from '@/components/billing';
import { getOrgBalance, getOrgCredits, type OrgBalance, type OrgCreditTopUp } from '@/services/org-api';
import { orgId } from '@/lib/auth';

export default function BillingPage() {
  const [balance, setBalance] = useState<OrgBalance | null>(null);
  const [topUps, setTopUps] = useState<OrgCreditTopUp[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      try {
        if (!orgId) return;
        const [bal, credits] = await Promise.all([
          getOrgBalance(orgId),
          getOrgCredits(orgId).catch(() => null),
        ]);
        if (!cancelled) {
          setBalance(bal);
          setTopUps(credits?.credits ?? []);
        }
      } catch {
        // silently fail
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!balance) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Billing information not available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <CreditsOverview balance={balance} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {balance.prices && balance.prices.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              <PricingTable prices={balance.prices} />
            </CardContent>
          </Card>
        )}
        {balance.creditUsed && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Usage by Type</CardTitle>
            </CardHeader>
            <CardContent>
              <UsageBreakdownTable creditUsed={balance.creditUsed} />
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top-Up History</CardTitle>
        </CardHeader>
        <CardContent>
          <TopUpHistoryTable topUps={topUps} />
        </CardContent>
      </Card>
    </div>
  );
}
