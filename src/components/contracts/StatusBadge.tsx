import { Badge } from '@/components/ui';
import type { ContractStatus } from '@/types';

interface StatusBadgeProps {
  status: ContractStatus;
}

const statusConfig: Record<ContractStatus, { label: string; variant: 'signed' | 'rejected' | 'created' | 'expired' | 'abandoned' }> = {
  SIGNED: { label: 'Signed', variant: 'signed' },
  REJECTED: { label: 'Rejected', variant: 'rejected' },
  CREATED: { label: 'Created', variant: 'created' },
  EXPIRED: { label: 'Expired', variant: 'expired' },
  ABANDONED: { label: 'Abandoned', variant: 'abandoned' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  );
}
