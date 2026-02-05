import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
import { ContractsTable, ContractFilters } from '@/components/contracts';
import { contracts, organizations } from '@/data';
import type { ContractFilters as ContractFiltersType } from '@/types';

export default function ConsoleContractsPage() {
  const [filters, setFilters] = useState<ContractFiltersType>({});
  const [selectedOrgId, setSelectedOrgId] = useState<string | 'all'>('all');

  const filteredContracts = selectedOrgId === 'all' 
    ? contracts 
    : contracts.filter(c => c.orgId === selectedOrgId);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Select 
          value={selectedOrgId} 
          onValueChange={(value) => setSelectedOrgId(value as string | 'all')}
        >
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="All Organizations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Organizations</SelectItem>
            {organizations.map(org => (
              <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ContractFilters filters={filters} onFiltersChange={setFilters} />
      
      <ContractsTable 
        contracts={filteredContracts} 
        isLoading={false}
        filters={filters}
        basePath="/console"
        showOrg
      />
    </div>
  );
}
