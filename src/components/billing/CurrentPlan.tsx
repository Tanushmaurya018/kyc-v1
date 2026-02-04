import { CreditCard, Calendar, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { formatCurrency, formatNumber } from '@/lib/utils';
import type { BillingPlan, BillingPeriod } from '@/types';
import { differenceInDays } from 'date-fns';

interface CurrentPlanProps {
  plan: BillingPlan;
  currentPeriod: BillingPeriod;
}

export function CurrentPlan({ plan, currentPeriod }: CurrentPlanProps) {
  const daysRemaining = differenceInDays(currentPeriod.end, new Date());

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
          <p className="text-2xl font-semibold">{plan.name}</p>
          <p className="text-sm text-gray-500 mt-1">
            {formatCurrency(plan.pricePerContract, plan.currency)} per signed contract
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
          <p className="text-2xl font-semibold">{formatNumber(currentPeriod.contractsUsed)}</p>
          <p className="text-sm text-gray-500 mt-1">
            contracts signed • {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Period ending'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Amount Due
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold">
            {formatCurrency(currentPeriod.amountDue, plan.currency)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            to be billed on period end
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
