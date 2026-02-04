export type OrganizationStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  timezone: string;
  createdAt: Date;
  status: OrganizationStatus;
  industry: string;
  
  // Settings
  sessionTtlHours: number;
  maxFileSizeMb: number;
  webhookUrl?: string;
  emailNotifications: boolean;
  notifyOnComplete: boolean;
  notifyOnReject: boolean;
  
  // Stats
  totalContracts: number;
  activeUsers: number;
}

export interface OrgSettings {
  orgName: string;
  orgLogo?: string;
  timezone: string;
  sessionTtlHours: number;
  maxFileSizeMb: number;
  webhookUrl?: string;
  emailNotifications: boolean;
  notifyOnComplete: boolean;
  notifyOnReject: boolean;
}
