export type ApiKeyEnvironment = 'LIVE' | 'TEST';

export type ApiKeyStatus = 'ACTIVE' | 'REVOKED';

export type ApiKeyPermission = 
  | 'sessions:create'
  | 'sessions:read'
  | 'sessions:delete'
  | 'webhooks:manage'
  | 'analytics:read';

export interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  fullKey?: string; // Only available on creation
  environment: ApiKeyEnvironment;
  status: ApiKeyStatus;
  createdAt: Date;
  lastUsedAt: Date | null;
  createdBy: string;
  createdByName: string;
  permissions: ApiKeyPermission[];
  modules?: string[]; // Enabled modules for this API key
  orgId: string;
}

export const availablePermissions: { value: ApiKeyPermission; label: string; description: string }[] = [
  { value: 'sessions:create', label: 'Create Sessions', description: 'Create new signing sessions' },
  { value: 'sessions:read', label: 'Read Sessions', description: 'View session details and status' },
  { value: 'sessions:delete', label: 'Delete Sessions', description: 'Cancel or delete sessions' },
  { value: 'webhooks:manage', label: 'Manage Webhooks', description: 'Configure webhook endpoints' },
  { value: 'analytics:read', label: 'Read Analytics', description: 'Access analytics data' },
];
