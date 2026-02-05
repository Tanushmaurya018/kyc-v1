import { useState } from 'react';
import { ContractsTable, ContractFilters } from '@/components/contracts';
import { useContracts } from '@/hooks';
import { currentOrganization } from '@/data';
import type { ContractFilters as ContractFiltersType } from '@/types';

export default function ContractsPage() {
  const { contracts, isLoading } = useContracts(currentOrganization.id);
  const [filters, setFilters] = useState<ContractFiltersType>({});

  return (
    <div className="space-y-6 animate-fade-in">
      <ContractFilters filters={filters} onFiltersChange={setFilters} />
      
      <ContractsTable 
        contracts={contracts} 
        isLoading={isLoading}
        filters={filters}
        basePath="/dash"
      />
    </div>
  );
}
