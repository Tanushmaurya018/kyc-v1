export type InvoiceStatus = 'PAID' | 'PENDING' | 'OVERDUE';

export type BillingCycle = 'MONTHLY' | 'ANNUAL';

export interface BillingPlan {
  name: string;
  pricePerContract: number;
  currency: string;
  billingCycle: BillingCycle;
}

export interface BillingPeriod {
  start: Date;
  end: Date;
  contractsUsed: number;
  amountDue: number;
}

export interface Invoice {
  id: string;
  period: string;
  periodStart: Date;
  periodEnd: Date;
  contracts: number;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  paidAt: Date | null;
  downloadUrl: string;
}

export interface BillingData {
  plan: BillingPlan;
  currentPeriod: BillingPeriod;
  invoices: Invoice[];
}
