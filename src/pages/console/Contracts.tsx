import { useState } from 'react';
import { Download } from 'lucide-react';
import { Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
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
      <div className="flex items-center justify-between">
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
          <p className="text-sm text-gray-500">
            {filteredContracts.length} contracts
          </p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
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
