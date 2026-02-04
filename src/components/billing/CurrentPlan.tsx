import { CreditCard, Calendar, Coins, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { formatNumber, cn } from '@/lib/utils';
import type { BillingData } from '@/types';
import { differenceInDays } from 'date-fns';

interface CurrentPlanProps {
  billingData: BillingData;
}

export function CurrentPlan({ billingData }: CurrentPlanProps) {
  const { credits, planName, currentPeriod } = billingData;
  const daysRemaining = differenceInDays(currentPeriod.end, new Date());
  const isLowBalance = credits.available <= credits.lowBalanceThreshold;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Current Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold">{planName}</p>
          <p className="text-sm text-gray-500 mt-1">
            1 credit per signed contract
          </p>
        </CardContent>
      </Card>

      <Card className={cn(isLowBalance && 'border-amber-300 bg-amber-50')}>
        <CardHeader className="pb-2">
          <CardTitle className={cn(
            "text-sm font-medium flex items-center gap-2",
            isLowBalance ? 'text-amber-700' : 'text-gray-500'
          )}>
            <Coins className="h-4 w-4" />
            Credits Available
            {isLowBalance && <AlertTriangle className="h-4 w-4 text-amber-500" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className={cn("text-2xl font-semibold", isLowBalance && 'text-amber-700')}>
            {formatNumber(credits.available)}
          </p>
          <p className={cn("text-sm mt-1", isLowBalance ? 'text-amber-600' : 'text-gray-500')}>
            {isLowBalance ? 'Low balance - contact ICP' : `${formatNumber(credits.used)} credits used total`}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            This Period
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold">{formatNumber(currentPeriod.contractsSigned)}</p>
          <p className="text-sm text-gray-500 mt-1">
            contracts signed • {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Period ending'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
