import { mapSessionState } from './state-mapper';
import type { Contract, ContractEvent, SignaturePosition, IdType, KycStatus } from '@/types';
import type { SessionDetail } from '@/services/sessions-api';

/**
 * Maps a backend SessionDetail response → the frontend Contract type
 * so the existing ContractDetail component can render it.
 */
export function mapSessionToContract(s: SessionDetail): Contract {
  return {
    id: s.id,
    sessionId: s.id,
    status: mapSessionState(s.state),

    // Document
    documentName: extractDocName(s),
    documentHash: s.document_hash || '',
    pageCount: s.page_count || 0,
    fileSizeKb: 0,
    documentUrl: s.original_doc_path || undefined,
    signedDocumentUrl: s.signed_doc_path || undefined,

    // Signer
    signerName: s.signer_name || '—',
    signerIdNumber: s.emirates_id_number || s.passport_number || s.gcc_id_number || '—',
    signerIdType: deriveIdType(s),
    signerEmail: undefined,

    // KYC
    kycJourneyId: s.kyc_journey_id,
    kycStatus: deriveKycStatus(s.state),
    kycCompletedAt: findKycCompletedAt(s),

    // Timestamps
    createdAt: new Date(s.created_at),
    expiresAt: new Date(s.expires_at),
    completedAt: isTerminal(s.state) ? new Date(s.updated_at) : null,

    // Error
    terminationReason: s.error_message || undefined,

    // Positions
    signaturePositions: flattenPositions(s.positions),

    // Events — filter out noisy internal events
    events: (s.events || [])
      .filter((e) => !SKIP_EVENT_TYPES.has(e.event_type))
      .map(mapEvent),

    // Org
    orgId: s.org_id,
    orgName: s.org_name || '—',
  };
}

function extractDocName(s: SessionDetail): string {
  if (s.metadata?.document_name) return String(s.metadata.document_name);
  if (s.original_doc_path) {
    const parts = s.original_doc_path.split('/');
    return parts[parts.length - 1] || 'Document';
  }
  return 'Document';
}

function deriveIdType(s: SessionDetail): IdType {
  if (s.signer_id_type === 'UAE_KYC') return 'UAE_KYC';
  if (s.signer_id_type === 'EMIRATES_ID' || s.emirates_id_number) return 'EMIRATES_ID';
  if (s.signer_id_type === 'PASSPORT' || s.passport_number) return 'PASSPORT';
  if (s.signer_id_type === 'GCC_ID' || s.gcc_id_number) return 'GCC_ID';
  return 'UAE_KYC';
}

function deriveKycStatus(state: string): KycStatus | null {
  if (['KYC_SUCCESS', 'POSITIONING', 'SIGNING', 'COMPLETE'].includes(state)) return 'SUCCESS';
  if (state === 'KYC_FAILED') return 'FAILED';
  if (['KYC_PENDING', 'CREATED', 'HANDSHAKED', 'PREVIEWING'].includes(state)) return 'PENDING';
  // FAILED state — KYC may have passed before the session failed
  if (state === 'FAILED') return null;
  return null;
}

function isTerminal(state: string): boolean {
  return ['COMPLETE', 'FAILED', 'EXPIRED', 'CANCELLED', 'KYC_FAILED', 'KYC_EXPIRED'].includes(state);
}

/** Event states in events are PascalCase, not UPPERCASE */
function findKycCompletedAt(s: SessionDetail): Date | null {
  const evt = s.events?.find(
    (e) =>
      e.event_type === 'KYC_COMPLETE' ||
      e.event_type === 'KYC_FAILED'
  );
  return evt ? new Date(evt.created_at) : null;
}

function flattenPositions(
  positions: SessionDetail['positions']
): SignaturePosition[] {
  if (!positions) return [];
  const result: SignaturePosition[] = [];
  for (const [pageStr, posArr] of Object.entries(positions)) {
    for (const p of posArr) {
      result.push({ page: Number(pageStr), x: p.x, y: p.y, width: p.width, height: p.height });
    }
  }
  return result;
}

/** Internal events not worth showing in the user-facing timeline */
const SKIP_EVENT_TYPES = new Set([
  'REQUEST_PAGE',
  'DOCUMENT_LOADED',
  'TEMPLATE_LOADED',
]);

function mapEvent(e: SessionDetail['events'][number]): ContractEvent {
  const typeMap: Record<string, ContractEvent['type']> = {
    HANDSHAKE: 'CREATED',
    INITIALIZE: 'CREATED',
    PREVIEW_CONFIRMED: 'KYC_STARTED',
    KYC_COMPLETE: 'KYC_COMPLETED',
    KYC_FAILED: 'KYC_FAILED',
    POSITIONS_CONFIRMED: 'SIGNATURE_POSITIONED',
    SIGNING_COMPLETE: 'SIGNED',
    PREVIEW_CANCELLED: 'REJECTED',
    SESSION_EXPIRED: 'EXPIRED',
  };

  return {
    id: e.id,
    type: typeMap[e.event_type] || 'CREATED',
    timestamp: new Date(e.created_at),
    description: formatEventDescription(e.event_type, e.from_state, e.to_state),
    metadata: undefined, // don't show raw event_data in UI
  };
}

function formatEventDescription(
  eventType: string,
  fromState: string | null,
  toState: string | null
): string {
  const descriptions: Record<string, string> = {
    HANDSHAKE: 'Session started',
    INITIALIZE: 'SDK initialized',
    PREVIEW_CONFIRMED: 'Document preview confirmed — KYC started',
    KYC_COMPLETE: 'KYC verification completed',
    KYC_FAILED: 'KYC verification failed',
    POSITIONS_CONFIRMED: 'Signature position confirmed',
    SIGNING_COMPLETE: 'Document signed successfully',
    PREVIEW_CANCELLED: 'Session cancelled by signer',
    SESSION_EXPIRED: 'Session expired',
    DOCUMENT_LOAD_FAILED: 'Document failed to load',
  };

  return descriptions[eventType] || `${eventType}: ${fromState} → ${toState}`;
}
