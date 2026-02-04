export interface DailyStats {
  date: string;
  created: number;
  signed: number;
  rejected: number;
  abandoned: number;
  expired: number;
}

// Drop-off funnel step
export interface FunnelStep {
  name: string;
  count: number;
  percentage: number;
  dropOff: number;
}

export interface DropOffAnalytics {
  steps: FunnelStep[];
  totalStarted: number;
  totalCompleted: number;
  overallCompletionRate: number;
}

export interface AnalyticsData {
  // Overview stats
  totalContracts: number;
  signedContracts: number;
  rejectedContracts: number;
  abandonedContracts: number;
  expiredContracts: number;
  createdContracts: number;
  
  // Rates
  completionRate: number;
  kycPassRate: number;
  
  // Time series
  dailyStats: DailyStats[];
  
  // Average times
  avgTimeToSign: number; // minutes
  avgKycDuration: number; // seconds
  
  // Comparison with previous period
  totalChange: number;
  signedChange: number;
  rejectedChange: number;
  
  // Top documents
  topDocuments: {
    name: string;
    count: number;
    signedCount: number;
  }[];

  // Drop-off funnel
  dropOff: DropOffAnalytics;
}

export type DateRange = '7d' | '30d' | '90d' | 'custom';
