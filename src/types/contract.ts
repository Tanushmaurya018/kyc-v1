export type ContractStatus = 'CREATED' | 'SIGNED' | 'REJECTED' | 'ABANDONED' | 'EXPIRED';

export type IdType = 'EMIRATES_ID' | 'PASSPORT' | 'GCC_ID';

export type KycStatus = 'PENDING' | 'SUCCESS' | 'FAILED';

export interface SignaturePosition {
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ContractEvent {
  id: string;
  type: 'CREATED' | 'KYC_STARTED' | 'KYC_COMPLETED' | 'KYC_FAILED' | 'SIGNATURE_POSITIONED' | 'SIGNED' | 'REJECTED' | 'ABANDONED' | 'EXPIRED';
  timestamp: Date;
  description: string;
  metadata?: Record<string, unknown>;
}

export interface Contract {
  id: string;
  sessionId: string;
  status: ContractStatus;
  
  // Document
  documentName: string;
  documentHash: string;
  pageCount: number;
  fileSizeKb: number;
  documentUrl?: string;        // Original document preview URL
  signedDocumentUrl?: string;  // Signed document URL (after signing)
  
  // Signer
  signerName: string;
  signerIdNumber: string;
  signerIdType: IdType;
  signerEmail?: string;
  
  // KYC
  kycJourneyId: string | null;
  kycStatus: KycStatus | null;
  kycCompletedAt: Date | null;
  
  // Timestamps
  createdAt: Date;
  expiresAt: Date;
  completedAt: Date | null;
  
  // Rejection/Abandonment reason (if applicable)
  terminationReason?: string;
  
  // Signature positions (for detail view)
  signaturePositions: SignaturePosition[];
  
  // Event timeline
  events: ContractEvent[];
  
  // Organization
  orgId: string;
  orgName: string;
}

export interface ContractFilters {
  status?: ContractStatus[];
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
  orgId?: string;
}

export interface ContractStats {
  total: number;
  signed: number;
  rejected: number;
  abandoned: number;
  expired: number;
  created: number;
}
