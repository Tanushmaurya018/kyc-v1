import type { Contract, ContractStatus, ContractEvent, IdType } from '@/types';
import { organizations } from './organizations';

const documentNames = [
  'Employment_Contract.pdf',
  'NDA_Agreement.pdf',
  'Service_Agreement.pdf',
  'Lease_Agreement.pdf',
  'Consultancy_Contract.pdf',
  'Vendor_Agreement.pdf',
  'Partnership_Deed.pdf',
  'Loan_Agreement.pdf',
  'Insurance_Policy.pdf',
  'Terms_of_Service.pdf',
  'Privacy_Policy_Consent.pdf',
  'Medical_Release_Form.pdf',
  'Travel_Authorization.pdf',
  'Power_of_Attorney.pdf',
  'Property_Transfer_Deed.pdf',
];

const signerNames = [
  'Abdullah Mohammed',
  'Fatima Al Zahra',
  'Mohammed Hassan',
  'Aisha Khalil',
  'Omar Rashid',
  'Sara Ahmed',
  'Youssef Nasser',
  'Mariam Ibrahim',
  'Khalid Saeed',
  'Noor Al Din',
  'Hassan Mahmoud',
  'Layla Yousef',
  'Tariq Abbas',
  'Hana Faisal',
  'Rami Saleh',
  'Zainab Kareem',
  'Bilal Mansoor',
  'Dina Qasim',
  'Faris Al Amir',
  'Ghada Hussein',
];

function generateEmiratesId(): string {
  const year = Math.floor(Math.random() * 30) + 1970;
  const random = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
  const checksum = Math.floor(Math.random() * 10);
  return `784-${year}-${random}-${checksum}`;
}

function generatePassportNumber(): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const prefix = letters[Math.floor(Math.random() * 26)] + letters[Math.floor(Math.random() * 26)];
  const number = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
  return `${prefix}${number}`;
}

function generateDocumentHash(): string {
  const chars = 'abcdef0123456789';
  let hash = '';
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return `sha256:${hash}`;
}

function generateEvents(status: ContractStatus, createdAt: Date, completedAt: Date | null): ContractEvent[] {
  const events: ContractEvent[] = [
    {
      id: `evt-${Math.random().toString(36).substring(2, 9)}`,
      type: 'CREATED',
      timestamp: createdAt,
      description: 'Session created and document uploaded',
    },
  ];

  if (status === 'CREATED') {
    return events;
  }

  const kycStarted = new Date(createdAt.getTime() + Math.random() * 3600000);
  events.push({
    id: `evt-${Math.random().toString(36).substring(2, 9)}`,
    type: 'KYC_STARTED',
    timestamp: kycStarted,
    description: 'Signer initiated KYC verification',
  });

  if (status === 'REJECTED') {
    const kycFailed = new Date(kycStarted.getTime() + Math.random() * 120000 + 30000);
    events.push({
      id: `evt-${Math.random().toString(36).substring(2, 9)}`,
      type: 'KYC_FAILED',
      timestamp: kycFailed,
      description: 'KYC verification failed',
      metadata: { reason: 'Face match score below threshold' },
    });
    events.push({
      id: `evt-${Math.random().toString(36).substring(2, 9)}`,
      type: 'REJECTED',
      timestamp: new Date(kycFailed.getTime() + 1000),
      description: 'Session rejected due to KYC failure',
    });
    return events;
  }

  if (status === 'ABANDONED') {
    events.push({
      id: `evt-${Math.random().toString(36).substring(2, 9)}`,
      type: 'ABANDONED',
      timestamp: new Date(kycStarted.getTime() + Math.random() * 600000),
      description: 'Signer abandoned the session',
    });
    return events;
  }

  if (status === 'EXPIRED') {
    return events;
  }

  // SIGNED status
  const kycCompleted = new Date(kycStarted.getTime() + Math.random() * 120000 + 30000);
  events.push({
    id: `evt-${Math.random().toString(36).substring(2, 9)}`,
    type: 'KYC_COMPLETED',
    timestamp: kycCompleted,
    description: 'KYC verification completed successfully',
    metadata: { confidence: (0.85 + Math.random() * 0.14).toFixed(2) },
  });

  const positioned = new Date(kycCompleted.getTime() + Math.random() * 60000);
  events.push({
    id: `evt-${Math.random().toString(36).substring(2, 9)}`,
    type: 'SIGNATURE_POSITIONED',
    timestamp: positioned,
    description: 'Signer positioned signature on document',
  });

  events.push({
    id: `evt-${Math.random().toString(36).substring(2, 9)}`,
    type: 'SIGNED',
    timestamp: completedAt!,
    description: 'Document signed successfully',
  });

  return events;
}

function generateContract(index: number, orgId: string): Contract {
  const org = organizations.find(o => o.id === orgId)!;
  const statuses: ContractStatus[] = ['CREATED', 'SIGNED', 'REJECTED', 'ABANDONED', 'EXPIRED'];
  const weights = [0.15, 0.50, 0.15, 0.10, 0.10]; // Weighted distribution
  
  let random = Math.random();
  let status: ContractStatus = 'CREATED';
  let cumulative = 0;
  for (let i = 0; i < weights.length; i++) {
    cumulative += weights[i];
    if (random <= cumulative) {
      status = statuses[i];
      break;
    }
  }

  const now = new Date('2026-02-04T12:00:00');
  const daysAgo = Math.floor(Math.random() * 90);
  const createdAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  
  let expiresAt = new Date(createdAt.getTime() + org.sessionTtlHours * 60 * 60 * 1000);
  let completedAt: Date | null = null;
  let kycStatus: 'PENDING' | 'SUCCESS' | 'FAILED' | null = null;
  let kycCompletedAt: Date | null = null;
  let terminationReason: string | undefined;

  if (status === 'SIGNED') {
    const signTime = Math.random() * 0.8 * org.sessionTtlHours * 60 * 60 * 1000;
    completedAt = new Date(createdAt.getTime() + signTime);
    kycStatus = 'SUCCESS';
    kycCompletedAt = new Date(completedAt.getTime() - Math.random() * 300000 - 60000);
  } else if (status === 'REJECTED') {
    kycStatus = 'FAILED';
    kycCompletedAt = new Date(createdAt.getTime() + Math.random() * 3600000);
    terminationReason = ['Face verification failed', 'Document mismatch', 'ID verification failed', 'Liveness check failed'][Math.floor(Math.random() * 4)];
  } else if (status === 'ABANDONED') {
    kycStatus = Math.random() > 0.5 ? 'PENDING' : null;
    terminationReason = ['User closed browser', 'Session timeout', 'User navigated away', 'Technical error'][Math.floor(Math.random() * 4)];
  } else if (status === 'EXPIRED') {
    expiresAt = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000);
  } else if (status === 'CREATED') {
    // Some created contracts might be expiring soon
    if (Math.random() > 0.7) {
      expiresAt = new Date(now.getTime() + Math.random() * 4 * 60 * 60 * 1000);
    }
  }

  const idType: IdType = Math.random() > 0.3 ? 'EMIRATES_ID' : (Math.random() > 0.5 ? 'PASSPORT' : 'GCC_ID');
  const pageCount = Math.floor(Math.random() * 20) + 1;
  
  const year = createdAt.getFullYear();
  const sessionNum = (index + 1).toString().padStart(5, '0');

  return {
    id: `contract-${orgId}-${index.toString().padStart(4, '0')}`,
    sessionId: `FS-${year}-${sessionNum}`,
    status,
    documentName: documentNames[Math.floor(Math.random() * documentNames.length)],
    documentHash: generateDocumentHash(),
    pageCount,
    fileSizeKb: Math.floor(Math.random() * 5000) + 100,
    signerName: signerNames[Math.floor(Math.random() * signerNames.length)],
    signerIdNumber: idType === 'EMIRATES_ID' ? generateEmiratesId() : generatePassportNumber(),
    signerIdType: idType,
    signerEmail: `signer${index}@example.com`,
    kycJourneyId: kycStatus ? `kyc-${Math.random().toString(36).substring(2, 11)}` : null,
    kycStatus,
    kycCompletedAt,
    createdAt,
    expiresAt,
    completedAt,
    terminationReason,
    signaturePositions: status === 'SIGNED' ? [
      {
        page: Math.min(pageCount, Math.floor(Math.random() * 3) + 1),
        x: 50 + Math.random() * 100,
        y: 600 + Math.random() * 100,
        width: 150,
        height: 50,
      },
    ] : [],
    events: generateEvents(status, createdAt, completedAt),
    orgId,
    orgName: org.name,
  };
}

// Generate contracts for all organizations
export const contracts: Contract[] = [];

organizations.forEach(org => {
  const count = Math.floor(Math.random() * 30) + 20; // 20-50 contracts per org
  for (let i = 0; i < count; i++) {
    contracts.push(generateContract(contracts.length, org.id));
  }
});

// Sort by created date descending
contracts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

export function getContractsByOrgId(orgId: string): Contract[] {
  return contracts.filter(c => c.orgId === orgId);
}

export function getContractById(id: string): Contract | undefined {
  return contracts.find(c => c.id === id);
}

export function getContractBySessionId(sessionId: string): Contract | undefined {
  return contracts.find(c => c.sessionId === sessionId);
}
