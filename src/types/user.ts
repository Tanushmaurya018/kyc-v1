export type UserRole = 'ADMIN' | 'MANAGER' | 'VIEWER';

export type UserStatus = 'ACTIVE' | 'INVITED' | 'DISABLED';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  lastLoginAt: Date | null;
  invitedBy?: string;
  orgId: string;
  avatarUrl?: string;
}

export interface UserPermissions {
  viewContracts: boolean;
  exportData: boolean;
  manageApiKeys: boolean;
  manageUsers: boolean;
  billingAccess: boolean;
  settings: boolean;
}

export const rolePermissions: Record<UserRole, UserPermissions> = {
  ADMIN: {
    viewContracts: true,
    exportData: true,
    manageApiKeys: true,
    manageUsers: true,
    billingAccess: true,
    settings: true,
  },
  MANAGER: {
    viewContracts: true,
    exportData: true,
    manageApiKeys: false,
    manageUsers: false,
    billingAccess: false,
    settings: true,
  },
  VIEWER: {
    viewContracts: true,
    exportData: false,
    manageApiKeys: false,
    manageUsers: false,
    billingAccess: false,
    settings: false,
  },
};
