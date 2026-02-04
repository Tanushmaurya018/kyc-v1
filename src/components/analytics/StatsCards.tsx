import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui';
import { cn, formatNumber, formatPercentage } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: number | string;
  change?: number;
  icon?: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error';
}

const variantStyles = {
  default: 'border-gray-200',
  success: 'border-green-200',
  warning: 'border-amber-200',
  error: 'border-red-200',
};

export function StatCard({ title, value, change, icon, variant = 'default' }: StatCardProps) {
  const displayValue = typeof value === 'number' ? formatNumber(value) : value;

  return (
    <Card className={cn(variantStyles[variant])}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">{title}</p>
            <p className="text-2xl font-semibold">{displayValue}</p>
            {change !== undefined && (
              <div className={cn(
                "flex items-center gap-1 mt-2 text-sm",
                change > 0 ? "text-green-600" : change < 0 ? "text-red-600" : "text-gray-500"
              )}>
                {change > 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : change < 0 ? (
                  <TrendingDown className="h-4 w-4" />
                ) : (
                  <Minus className="h-4 w-4" />
                )}
                <span>{formatPercentage(Math.abs(change))} vs last period</span>
              </div>
            )}
          </div>
          {icon && (
            <div className="p-2 bg-gray-100">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface StatsCardsProps {
  totalContracts: number;
  signedContracts: number;
  rejectedContracts: number;
  abandonedContracts: number;
  expiredContracts: number;
  totalChange?: number;
  signedChange?: number;
  rejectedChange?: number;
}

export function StatsCards({
  totalContracts,
  signedContracts,
  rejectedContracts,
  abandonedContracts,
  expiredContracts,
  totalChange,
  signedChange,
  rejectedChange,
}: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <StatCard
        title="Total Contracts"
        value={totalContracts}
        change={totalChange}
      />
      <StatCard
        title="Signed"
        value={signedContracts}
        change={signedChange}
        variant="success"
      />
      <StatCard
        title="Rejected"
        value={rejectedContracts}
        change={rejectedChange}
        variant="error"
      />
      <StatCard
        title="Abandoned"
        value={abandonedContracts}
        variant="warning"
      />
      <StatCard
        title="Expired"
        value={expiredContracts}
      />
    </div>
  );
}
