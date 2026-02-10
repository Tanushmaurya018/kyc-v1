import { useParams } from 'react-router-dom';
import { ContractDetail } from '@/components/contracts';
import { useSessionDetail } from '@/hooks';
import { mapSessionToContract } from '@/lib/session-mapper';
import { Skeleton } from '@/components/ui';

export default function ConsoleContractDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { session, isLoading, error } = useSessionDetail(id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[400px] w-full" />
        <div className="grid grid-cols-2 gap-6">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          {error?.message || 'Session not found'}
        </p>
      </div>
    );
  }

  return (
    <ContractDetail
      contract={mapSessionToContract(session)}
      basePath="/console"
      showOrg
    />
  );
}
