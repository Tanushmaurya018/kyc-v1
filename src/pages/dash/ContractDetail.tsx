import { useParams } from 'react-router-dom';
import { ContractDetail } from '@/components/contracts';
import { useContract } from '@/hooks';
import { Skeleton } from '@/components/ui';

export default function ContractDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { contract, isLoading, error } = useContract(id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Contract not found</p>
      </div>
    );
  }

  return <ContractDetail contract={contract} basePath="/dash" />;
}
