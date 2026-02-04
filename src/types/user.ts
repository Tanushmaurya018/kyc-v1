// User roles as per spec: ROOT, ADMIN, USER
export type UserRole = 'ROOT' | 'ADMIN' | 'USER';

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

// ROOT: Full access, can create other org users
// ADMIN: Full access except user management
// USER: View-only access to contracts
export const rolePermissions: Record<UserRole, UserPermissions> = {
  ROOT: {
    viewContracts: true,
    exportData: true,
    manageApiKeys: true,
    manageUsers: true,
    billingAccess: true,
    settings: true,
  },
  ADMIN: {
    viewContracts: true,
    exportData: true,
    manageApiKeys: true,
    manageUsers: false,
    billingAccess: true,
    settings: true,
  },
  USER: {
    viewContracts: true,
    exportData: false,
    manageApiKeys: false,
    manageUsers: false,
    billingAccess: false,
    settings: false,
  },
};

export const roleLabels: Record<UserRole, string> = {
  ROOT: 'Root Admin',
  ADMIN: 'Administrator',
  USER: 'User',
};
