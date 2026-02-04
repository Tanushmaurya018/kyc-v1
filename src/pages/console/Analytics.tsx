import { useState, useMemo } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  Tabs, 
  TabsList, 
  TabsTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { StatsCards, ContractsChart, StatusBreakdown } from '@/components/analytics';
import { contracts, organizations } from '@/data';
import type { DailyStats } from '@/types';
import { subDays, isAfter } from 'date-fns';

type SimpleDateRange = '7d' | '30d' | '90d';

export default function ConsoleAnalyticsPage() {
  const [dateRange, setDateRange] = useState<SimpleDateRange>('30d');
  const [selectedOrgId, setSelectedOrgId] = useState<string | 'all'>('all');

  const analytics = useMemo(() => {
    // Filter contracts by org if selected
    let filteredContracts = selectedOrgId === 'all' 
      ? contracts 
      : contracts.filter(c => c.orgId === selectedOrgId);
    
    // Filter by date range
    const daysMap: Record<SimpleDateRange, number> = { '7d': 7, '30d': 30, '90d': 90 };
    const cutoffDate = subDays(new Date(), daysMap[dateRange]);
    filteredContracts = filteredContracts.filter(c => isAfter(c.createdAt, cutoffDate));

    // Calculate stats
    const totalContracts = filteredContracts.length;
    const signedContracts = filteredContracts.filter(c => c.status === 'SIGNED').length;
    const rejectedContracts = filteredContracts.filter(c => c.status === 'REJECTED').length;
    const abandonedContracts = filteredContracts.filter(c => c.status === 'ABANDONED').length;
    const expiredContracts = filteredContracts.filter(c => c.status === 'EXPIRED').length;
    const createdContracts = filteredContracts.filter(c => c.status === 'CREATED').length;

    // Generate daily stats
    const dailyStats: DailyStats[] = [];
    for (let i = daysMap[dateRange] - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayContracts = filteredContracts.filter(c => 
        c.createdAt.toISOString().split('T')[0] === dateStr
      );
      
      dailyStats.push({
        date: dateStr,
        created: dayContracts.length,
        signed: dayContracts.filter(c => c.status === 'SIGNED').length,
        rejected: dayContracts.filter(c => c.status === 'REJECTED').length,
        abandoned: dayContracts.filter(c => c.status === 'ABANDONED').length,
        expired: dayContracts.filter(c => c.status === 'EXPIRED').length,
      });
    }

    return {
      totalContracts,
      signedContracts,
      rejectedContracts,
      abandonedContracts,
      expiredContracts,
      createdContracts,
      dailyStats,
      totalChange: 12.5,
      signedChange: 8.3,
      rejectedChange: -2.1,
    };
  }, [dateRange, selectedOrgId]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <Select 
          value={selectedOrgId} 
          onValueChange={(value) => setSelectedOrgId(value as string | 'all')}
        >
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="All Organizations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Organizations</SelectItem>
            {organizations.map(org => (
              <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Tabs value={dateRange} onValueChange={(v) => setDateRange(v as SimpleDateRange)}>
          <TabsList>
            <TabsTrigger value="7d">7 days</TabsTrigger>
            <TabsTrigger value="30d">30 days</TabsTrigger>
            <TabsTrigger value="90d">90 days</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

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

      {/* Per-org breakdown */}
      {selectedOrgId === 'all' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Per Organization Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {organizations.map(org => {
                const orgContracts = contracts.filter(c => c.orgId === org.id);
                const signed = orgContracts.filter(c => c.status === 'SIGNED').length;
                const rate = orgContracts.length > 0 
                  ? ((signed / orgContracts.length) * 100).toFixed(1) 
                  : '0';

                return (
                  <div 
                    key={org.id}
                    className="flex items-center justify-between p-3 border border-gray-200"
                  >
                    <div>
                      <p className="font-medium text-sm">{org.name}</p>
                      <p className="text-xs text-gray-500">
                        {orgContracts.length} contracts
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{rate}%</p>
                      <p className="text-xs text-gray-500">Completion Rate</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
