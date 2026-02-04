import { useParams } from 'react-router-dom';
import { ContractDetail } from '@/components/contracts';
import { contracts } from '@/data';
import { Skeleton } from '@/components/ui';

export default function ConsoleContractDetailPage() {
  const { id } = useParams<{ id: string }>();
  const contract = contracts.find(c => c.id === id);

  if (!contract) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Contract not found</p>
      </div>
    );
  }

  return <ContractDetail contract={contract} basePath="/console" showOrg />;
}
