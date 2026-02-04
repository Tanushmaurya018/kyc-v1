import type { AnalyticsData, DailyStats } from '@/types';
import { contracts } from './contracts';
import { format, subDays, startOfDay, isWithinInterval } from 'date-fns';

function generateDailyStats(days: number, orgId?: string): DailyStats[] {
  const stats: DailyStats[] = [];
  const now = new Date('2026-02-04');
  
  const filteredContracts = orgId 
    ? contracts.filter(c => c.orgId === orgId)
    : contracts;

  for (let i = days - 1; i >= 0; i--) {
    const date = startOfDay(subDays(now, i));
    const nextDay = startOfDay(subDays(now, i - 1));
    
    const dayContracts = filteredContracts.filter(c => 
      isWithinInterval(c.createdAt, { start: date, end: nextDay })
    );

    stats.push({
      date: format(date, 'yyyy-MM-dd'),
      created: dayContracts.length,
      signed: dayContracts.filter(c => c.status === 'SIGNED').length,
      rejected: dayContracts.filter(c => c.status === 'REJECTED').length,
      abandoned: dayContracts.filter(c => c.status === 'ABANDONED').length,
      expired: dayContracts.filter(c => c.status === 'EXPIRED').length,
    });
  }

  return stats;
}

function calculateAnalytics(orgId?: string): AnalyticsData {
  const filteredContracts = orgId 
    ? contracts.filter(c => c.orgId === orgId)
    : contracts;

  const total = filteredContracts.length;
  const signed = filteredContracts.filter(c => c.status === 'SIGNED').length;
  const rejected = filteredContracts.filter(c => c.status === 'REJECTED').length;
  const abandoned = filteredContracts.filter(c => c.status === 'ABANDONED').length;
  const expired = filteredContracts.filter(c => c.status === 'EXPIRED').length;
  const created = filteredContracts.filter(c => c.status === 'CREATED').length;

  const kycAttempted = filteredContracts.filter(c => c.kycStatus !== null).length;
  const kycPassed = filteredContracts.filter(c => c.kycStatus === 'SUCCESS').length;

  // Calculate average time to sign (for signed contracts)
  const signedContracts = filteredContracts.filter(c => c.status === 'SIGNED' && c.completedAt);
  const totalSignTime = signedContracts.reduce((acc, c) => {
    return acc + (c.completedAt!.getTime() - c.createdAt.getTime());
  }, 0);
  const avgTimeToSign = signedContracts.length > 0 
    ? Math.round(totalSignTime / signedContracts.length / 60000) // in minutes
    : 0;

  // Calculate average KYC duration
  const kycCompletedContracts = filteredContracts.filter(c => c.kycCompletedAt);
  const totalKycTime = kycCompletedContracts.reduce((acc, c) => {
    const kycStartEvent = c.events.find(e => e.type === 'KYC_STARTED');
    if (kycStartEvent && c.kycCompletedAt) {
      return acc + (c.kycCompletedAt.getTime() - kycStartEvent.timestamp.getTime());
    }
    return acc;
  }, 0);
  const avgKycDuration = kycCompletedContracts.length > 0
    ? Math.round(totalKycTime / kycCompletedContracts.length / 1000) // in seconds
    : 0;

  // Top documents
  const documentCounts: Record<string, { count: number; signedCount: number }> = {};
  filteredContracts.forEach(c => {
    if (!documentCounts[c.documentName]) {
      documentCounts[c.documentName] = { count: 0, signedCount: 0 };
    }
    documentCounts[c.documentName].count++;
    if (c.status === 'SIGNED') {
      documentCounts[c.documentName].signedCount++;
    }
  });

  const topDocuments = Object.entries(documentCounts)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalContracts: total,
    signedContracts: signed,
    rejectedContracts: rejected,
    abandonedContracts: abandoned,
    expiredContracts: expired,
    createdContracts: created,
    completionRate: total > 0 ? signed / total : 0,
    kycPassRate: kycAttempted > 0 ? kycPassed / kycAttempted : 0,
    dailyStats: generateDailyStats(30, orgId),
    avgTimeToSign,
    avgKycDuration,
    totalChange: 0.12, // Mock: 12% increase
    signedChange: 0.08, // Mock: 8% increase
    rejectedChange: -0.05, // Mock: 5% decrease
    topDocuments,
  };
}

// Cache analytics data
const analyticsCache: Record<string, AnalyticsData> = {};

export function getAnalyticsByOrgId(orgId: string): AnalyticsData {
  if (!analyticsCache[orgId]) {
    analyticsCache[orgId] = calculateAnalytics(orgId);
  }
  return analyticsCache[orgId];
}

export function getAggregateAnalytics(): AnalyticsData {
  if (!analyticsCache['all']) {
    analyticsCache['all'] = calculateAnalytics();
  }
  return analyticsCache['all'];
}

export function getAnalyticsForDateRange(orgId: string | undefined, days: number): AnalyticsData {
  const analytics = orgId ? getAnalyticsByOrgId(orgId) : getAggregateAnalytics();
  return {
    ...analytics,
    dailyStats: generateDailyStats(days, orgId),
  };
}
