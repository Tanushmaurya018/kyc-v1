import { Coins, Wallet, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { formatNumber } from '@/lib/utils';
import type { OrgBalance } from '@/services/org-api';

interface CreditsOverviewProps {
  balance: OrgBalance;
}

export function CreditsOverview({ balance }: CreditsOverviewProps) {
  const available = parseFloat(balance.totalCreditsAvailable) || 0;
  const allotted = parseFloat(balance.totalCreditsAlloted) || 0;
  const used = balance.creditUsed
    ? Object.values(balance.creditUsed).reduce((a, b) => a + b, 0)
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Coins className="h-4 w-4" />
            Credits Available
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold">{formatNumber(available)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Credits Allotted
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold">{formatNumber(allotted)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <TrendingDown className="h-4 w-4" />
            Credits Used
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold">{formatNumber(used)}</p>
        </CardContent>
      </Card>
    </div>
  );
}
