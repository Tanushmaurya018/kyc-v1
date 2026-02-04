import type { AnalyticsData, DailyStats, DropOffAnalytics } from '@/types';
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

// Generate drop-off funnel analytics
function generateDropOffAnalytics(orgId?: string): DropOffAnalytics {
  const filteredContracts = orgId 
    ? contracts.filter(c => c.orgId === orgId)
    : contracts;

  const total = filteredContracts.length;
  
  // Simulated funnel steps based on Face Sign flow
  // Each step represents where users might drop off
  const linkOpened = total;
  const documentViewed = Math.round(total * 0.92); // 92% view document
  const kycStarted = Math.round(total * 0.85); // 85% start KYC
  const kycCompleted = Math.round(total * 0.78); // 78% complete KYC (some fail)
  const signatureStarted = Math.round(total * 0.72); // 72% start signing
  const signatureCompleted = filteredContracts.filter(c => c.status === 'SIGNED').length;

  const steps = [
    {
      name: 'Link Opened',
      count: linkOpened,
      percentage: 100,
      dropOff: 0,
    },
    {
      name: 'Document Viewed',
      count: documentViewed,
      percentage: total > 0 ? Math.round((documentViewed / total) * 100) : 0,
      dropOff: linkOpened - documentViewed,
    },
    {
      name: 'KYC Started',
      count: kycStarted,
      percentage: total > 0 ? Math.round((kycStarted / total) * 100) : 0,
      dropOff: documentViewed - kycStarted,
    },
    {
      name: 'KYC Completed',
      count: kycCompleted,
      percentage: total > 0 ? Math.round((kycCompleted / total) * 100) : 0,
      dropOff: kycStarted - kycCompleted,
    },
    {
      name: 'Signature Started',
      count: signatureStarted,
      percentage: total > 0 ? Math.round((signatureStarted / total) * 100) : 0,
      dropOff: kycCompleted - signatureStarted,
    },
    {
      name: 'Signed',
      count: signatureCompleted,
      percentage: total > 0 ? Math.round((signatureCompleted / total) * 100) : 0,
      dropOff: signatureStarted - signatureCompleted,
    },
  ];

  return {
    steps,
    totalStarted: total,
    totalCompleted: signatureCompleted,
    overallCompletionRate: total > 0 ? signatureCompleted / total : 0,
  };
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
    dropOff: generateDropOffAnalytics(orgId),
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
