// Prepaid Credits Model - No currency displayed on dashboard
export type BillingPlan = 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE' | 'CUSTOM';

export interface CreditsBalance {
  available: number;           // Current available credits
  used: number;                // Total used (all time)
  lowBalanceThreshold: number; // Warn when below this
}

export interface PlanPricing {
  kycPerJourney: number;       // Credits per KYC journey
  faceSignPerContract: number; // Credits per signed contract
}

export interface BillingPeriod {
  start: Date;
  end: Date;
  contractsSigned: number;
  creditsConsumed: number;
}

export interface TopUpTransaction {
  id: string;
  credits: number;
  date: Date;
  addedBy: string;             // ICP user who added credits
  addedByName: string;
  reference?: string;          // Payment reference
}

export interface UsageTransaction {
  id: string;
  sessionId: string;
  sessionDisplayId: string;    // FS-2026-XXXXX
  creditsUsed: number;
  date: Date;
  type: 'FACE_SIGN' | 'KYC';
}

export interface BillingData {
  plan: BillingPlan;
  planName: string;
  credits: CreditsBalance;
  pricing: PlanPricing;
  currentPeriod: BillingPeriod;
  topUpHistory: TopUpTransaction[];
  usageHistory: UsageTransaction[];
}
