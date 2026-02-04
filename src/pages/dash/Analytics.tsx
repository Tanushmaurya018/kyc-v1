import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, Skeleton } from '@/components/ui';
import { StatsCards, ContractsChart, StatusBreakdown, DropOffFunnel } from '@/components/analytics';
import { useAnalytics } from '@/hooks';
import { currentOrganization } from '@/data';
import type { DateRange } from '@/types';

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const { analytics, isLoading } = useAnalytics(currentOrganization.id, dateRange);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div />
        <Tabs value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
          <TabsList>
            <TabsTrigger value="7d">7 days</TabsTrigger>
            <TabsTrigger value="30d">30 days</TabsTrigger>
            <TabsTrigger value="90d">90 days</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-[120px]" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="lg:col-span-2 h-[400px]" />
            <Skeleton className="h-[400px]" />
          </div>
        </div>
      ) : analytics ? (
        <>
          <StatsCards
            totalContracts={analytics.totalContracts}
            signedContracts={analytics.signedContracts}
            rejectedContracts={analytics.rejectedContracts}
            abandonedContracts={analytics.abandonedContracts}
            expiredContracts={analytics.expiredContracts}
            totalChange={analytics.totalChange}
            signedChange={analytics.signedChange}
            rejectedChange={analytics.rejectedChange}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ContractsChart data={analytics.dailyStats} />
            </div>
            <StatusBreakdown
              signed={analytics.signedContracts}
              rejected={analytics.rejectedContracts}
              abandoned={analytics.abandonedContracts}
              expired={analytics.expiredContracts}
              created={analytics.createdContracts}
            />
          </div>

          <DropOffFunnel data={analytics.dropOff} />
        </>
      ) : null}
    </div>
  );
}
