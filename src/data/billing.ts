import type { BillingData, UsageTransaction } from '@/types';

// Generate usage transactions from contracts
function generateUsageHistory(orgId: string): UsageTransaction[] {
  const sessions = [
    { id: 'FS-2026-00142', date: new Date('2026-02-04T14:32:00') },
    { id: 'FS-2026-00141', date: new Date('2026-02-04T11:15:00') },
    { id: 'FS-2026-00140', date: new Date('2026-02-03T16:45:00') },
    { id: 'FS-2026-00139', date: new Date('2026-02-03T09:20:00') },
    { id: 'FS-2026-00138', date: new Date('2026-02-02T15:30:00') },
    { id: 'FS-2026-00137', date: new Date('2026-02-02T10:00:00') },
    { id: 'FS-2026-00136', date: new Date('2026-02-01T14:15:00') },
    { id: 'FS-2026-00135', date: new Date('2026-02-01T09:45:00') },
  ];

  return sessions.map((s, i) => ({
    id: `usage-${orgId}-${i + 1}`,
    sessionId: `sess-${i + 1}`,
    sessionDisplayId: s.id,
    creditsUsed: 1,
    date: s.date,
    type: 'FACE_SIGN' as const,
  }));
}

export const billingDataByOrg: Record<string, BillingData> = {
  'org-001': {
    plan: 'ENTERPRISE',
    planName: 'Government Enterprise',
    credits: {
      available: 8750,
      used: 1250,
      lowBalanceThreshold: 500,
    },
    pricing: {
      kycPerJourney: 1,
      faceSignPerContract: 1,
    },
    currentPeriod: {
      start: new Date('2026-02-01'),
      end: new Date('2026-02-28'),
      contractsSigned: 145,
      creditsConsumed: 145,
    },
    topUpHistory: [
      {
        id: 'topup-mof-001',
        credits: 10000,
        date: new Date('2025-12-15'),
        addedBy: 'icp-001',
        addedByName: 'ICP Admin',
        reference: 'INV-2025-MOF-001',
      },
    ],
    usageHistory: generateUsageHistory('org-001'),
  },
  'org-002': {
    plan: 'PROFESSIONAL',
    planName: 'Healthcare Professional',
    credits: {
      available: 2340,
      used: 660,
      lowBalanceThreshold: 200,
    },
    pricing: {
      kycPerJourney: 1,
      faceSignPerContract: 1,
    },
    currentPeriod: {
      start: new Date('2026-02-01'),
      end: new Date('2026-02-28'),
      contractsSigned: 89,
      creditsConsumed: 89,
    },
    topUpHistory: [
      {
        id: 'topup-dha-001',
        credits: 3000,
        date: new Date('2026-01-10'),
        addedBy: 'icp-001',
        addedByName: 'ICP Admin',
        reference: 'INV-2026-DHA-001',
      },
    ],
    usageHistory: generateUsageHistory('org-002'),
  },
  'org-003': {
    plan: 'ENTERPRISE',
    planName: 'Government Enterprise',
    credits: {
      available: 15000,
      used: 5000,
      lowBalanceThreshold: 1000,
    },
    pricing: {
      kycPerJourney: 1,
      faceSignPerContract: 1,
    },
    currentPeriod: {
      start: new Date('2026-02-01'),
      end: new Date('2026-02-28'),
      contractsSigned: 234,
      creditsConsumed: 234,
    },
    topUpHistory: [
      {
        id: 'topup-adda-001',
        credits: 20000,
        date: new Date('2025-11-01'),
        addedBy: 'icp-001',
        addedByName: 'ICP Admin',
        reference: 'INV-2025-ADDA-001',
      },
    ],
    usageHistory: generateUsageHistory('org-003'),
  },
  'org-004': {
    plan: 'ENTERPRISE',
    planName: 'Corporate Enterprise',
    credits: {
      available: 45000,
      used: 5000,
      lowBalanceThreshold: 2000,
    },
    pricing: {
      kycPerJourney: 1,
      faceSignPerContract: 1,
    },
    currentPeriod: {
      start: new Date('2026-02-01'),
      end: new Date('2026-02-28'),
      contractsSigned: 456,
      creditsConsumed: 456,
    },
    topUpHistory: [
      {
        id: 'topup-emirates-001',
        credits: 50000,
        date: new Date('2025-09-15'),
        addedBy: 'icp-001',
        addedByName: 'ICP Admin',
        reference: 'INV-2025-EK-001',
      },
    ],
    usageHistory: generateUsageHistory('org-004'),
  },
  'org-005': {
    plan: 'ENTERPRISE',
    planName: 'Banking Enterprise',
    credits: {
      available: 75000,
      used: 25000,
      lowBalanceThreshold: 5000,
    },
    pricing: {
      kycPerJourney: 1,
      faceSignPerContract: 1,
    },
    currentPeriod: {
      start: new Date('2026-02-01'),
      end: new Date('2026-02-28'),
      contractsSigned: 789,
      creditsConsumed: 789,
    },
    topUpHistory: [
      {
        id: 'topup-fab-001',
        credits: 100000,
        date: new Date('2025-10-01'),
        addedBy: 'icp-001',
        addedByName: 'ICP Admin',
        reference: 'INV-2025-FAB-001',
      },
    ],
    usageHistory: generateUsageHistory('org-005'),
  },
};

export function getBillingDataByOrgId(orgId: string): BillingData | undefined {
  return billingDataByOrg[orgId];
}
