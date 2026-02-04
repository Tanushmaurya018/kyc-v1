import { useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui';
import { ContractsTable, ContractFilters } from '@/components/contracts';
import { useContracts } from '@/hooks';
import { currentOrganization } from '@/data';
import type { ContractFilters as ContractFiltersType } from '@/types';

export default function ContractsPage() {
  const { contracts, isLoading } = useContracts(currentOrganization.id);
  const [filters, setFilters] = useState<ContractFiltersType>({});

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">
            {contracts.length} total contracts
          </p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

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
