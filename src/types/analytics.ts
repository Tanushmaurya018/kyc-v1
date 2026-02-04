export interface DailyStats {
  date: string;
  created: number;
  signed: number;
  rejected: number;
  abandoned: number;
  expired: number;
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
}

export type DateRange = '7d' | '30d' | '90d' | 'custom';
