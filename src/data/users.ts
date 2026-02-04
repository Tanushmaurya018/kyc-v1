import type { User } from '@/types';

export const users: User[] = [
  // Ministry of Finance users
  {
    id: 'user-001',
    email: 'ahmed.malik@mof.gov.ae',
    name: 'Ahmed Al Malik',
    role: 'ROOT',
    status: 'ACTIVE',
    createdAt: new Date('2025-06-15'),
    lastLoginAt: new Date('2026-02-04T09:30:00'),
    orgId: 'org-001',
  },
  {
    id: 'user-002',
    email: 'fatima.hassan@mof.gov.ae',
    name: 'Fatima Hassan',
    role: 'ADMIN',
    status: 'ACTIVE',
    createdAt: new Date('2025-07-01'),
    lastLoginAt: new Date('2026-02-03T14:20:00'),
    orgId: 'org-001',
  },
  {
    id: 'user-003',
    email: 'omar.saeed@mof.gov.ae',
    name: 'Omar Saeed',
    role: 'USER',
    status: 'ACTIVE',
    createdAt: new Date('2025-08-15'),
    lastLoginAt: new Date('2026-01-28T11:00:00'),
    orgId: 'org-001',
  },
  
  // Dubai Health Authority users
  {
    id: 'user-004',
    email: 'sara.khan@dha.gov.ae',
    name: 'Sara Khan',
    role: 'ROOT',
    status: 'ACTIVE',
    createdAt: new Date('2025-07-20'),
    lastLoginAt: new Date('2026-02-04T08:15:00'),
    orgId: 'org-002',
  },
  {
    id: 'user-005',
    email: 'youssef.ali@dha.gov.ae',
    name: 'Youssef Ali',
    role: 'ADMIN',
    status: 'INVITED',
    createdAt: new Date('2026-01-28'),
    lastLoginAt: null,
    invitedBy: 'user-004',
    orgId: 'org-002',
  },
  
  // Abu Dhabi Digital Authority users
  {
    id: 'user-006',
    email: 'khalid.rahman@adda.gov.ae',
    name: 'Khalid Rahman',
    role: 'ROOT',
    status: 'ACTIVE',
    createdAt: new Date('2025-08-10'),
    lastLoginAt: new Date('2026-02-04T10:45:00'),
    orgId: 'org-003',
  },
  {
    id: 'user-007',
    email: 'mariam.noor@adda.gov.ae',
    name: 'Mariam Noor',
    role: 'ADMIN',
    status: 'ACTIVE',
    createdAt: new Date('2025-09-01'),
    lastLoginAt: new Date('2026-02-02T16:30:00'),
    orgId: 'org-003',
  },
  {
    id: 'user-008',
    email: 'hassan.ibrahim@adda.gov.ae',
    name: 'Hassan Ibrahim',
    role: 'USER',
    status: 'DISABLED',
    createdAt: new Date('2025-09-15'),
    lastLoginAt: new Date('2025-12-15T09:00:00'),
    orgId: 'org-003',
  },
  
  // Emirates Airlines users
  {
    id: 'user-009',
    email: 'layla.ahmed@emirates.com',
    name: 'Layla Ahmed',
    role: 'ROOT',
    status: 'ACTIVE',
    createdAt: new Date('2025-09-01'),
    lastLoginAt: new Date('2026-02-04T11:00:00'),
    orgId: 'org-004',
  },
  {
    id: 'user-010',
    email: 'tariq.hussein@emirates.com',
    name: 'Tariq Hussein',
    role: 'ADMIN',
    status: 'ACTIVE',
    createdAt: new Date('2025-09-01'),
    lastLoginAt: new Date('2026-02-04T07:30:00'),
    orgId: 'org-004',
  },
  {
    id: 'user-011',
    email: 'nadia.omar@emirates.com',
    name: 'Nadia Omar',
    role: 'ADMIN',
    status: 'ACTIVE',
    createdAt: new Date('2025-10-01'),
    lastLoginAt: new Date('2026-02-03T15:45:00'),
    orgId: 'org-004',
  },
  {
    id: 'user-012',
    email: 'rami.faisal@emirates.com',
    name: 'Rami Faisal',
    role: 'USER',
    status: 'ACTIVE',
    createdAt: new Date('2025-10-15'),
    lastLoginAt: new Date('2026-02-01T12:00:00'),
    orgId: 'org-004',
  },
  {
    id: 'user-013',
    email: 'aisha.majid@emirates.com',
    name: 'Aisha Majid',
    role: 'USER',
    status: 'ACTIVE',
    createdAt: new Date('2025-11-01'),
    lastLoginAt: new Date('2026-01-30T10:30:00'),
    orgId: 'org-004',
  },
  {
    id: 'user-014',
    email: 'zaid.karim@emirates.com',
    name: 'Zaid Karim',
    role: 'USER',
    status: 'INVITED',
    createdAt: new Date('2026-02-01'),
    lastLoginAt: null,
    invitedBy: 'user-009',
    orgId: 'org-004',
  },
  
  // First Abu Dhabi Bank users
  {
    id: 'user-015',
    email: 'mohammed.sultan@fab.ae',
    name: 'Mohammed Al Sultan',
    role: 'ROOT',
    status: 'ACTIVE',
    createdAt: new Date('2025-09-15'),
    lastLoginAt: new Date('2026-02-04T09:00:00'),
    orgId: 'org-005',
  },
  {
    id: 'user-016',
    email: 'hana.rashid@fab.ae',
    name: 'Hana Rashid',
    role: 'ADMIN',
    status: 'ACTIVE',
    createdAt: new Date('2025-10-01'),
    lastLoginAt: new Date('2026-02-03T17:00:00'),
    orgId: 'org-005',
  },
  {
    id: 'user-017',
    email: 'bilal.mansoor@fab.ae',
    name: 'Bilal Mansoor',
    role: 'USER',
    status: 'ACTIVE',
    createdAt: new Date('2025-11-15'),
    lastLoginAt: new Date('2026-01-29T14:00:00'),
    orgId: 'org-005',
  },
];

// Current logged in user (for dash view)
export const currentUser = users[9]; // Layla Ahmed from Emirates Airlines

export function getAllUsers(): User[] {
  return users;
}

export function getUsersByOrgId(orgId: string): User[] {
  return users.filter(user => user.orgId === orgId);
}

export function getUserById(id: string): User | undefined {
  return users.find(user => user.id === id);
}
