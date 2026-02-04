import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input, Button, Badge } from '@/components/ui';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui';
import { Checkbox } from '@/components/ui';
import { Label } from '@/components/ui';
import type { ContractStatus, ContractFilters } from '@/types';

interface ContractFiltersProps {
  filters: ContractFilters;
  onFiltersChange: (filters: ContractFilters) => void;
}

const statusOptions: { value: ContractStatus; label: string }[] = [
  { value: 'CREATED', label: 'Created' },
  { value: 'SIGNED', label: 'Signed' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'ABANDONED', label: 'Abandoned' },
  { value: 'EXPIRED', label: 'Expired' },
];

export function ContractFilters({ filters, onFiltersChange }: ContractFiltersProps) {
  const [searchValue, setSearchValue] = useState(filters.search || '');

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

  const handleSearchSubmit = () => {
    onFiltersChange({ ...filters, search: searchValue });
  };

  const handleStatusToggle = (status: ContractStatus) => {
    const currentStatuses = filters.status || [];
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status];
    onFiltersChange({ ...filters, status: newStatuses.length > 0 ? newStatuses : undefined });
  };

  const clearFilters = () => {
    setSearchValue('');
    onFiltersChange({});
  };

  const activeFilterCount = (filters.status?.length || 0) + (filters.search ? 1 : 0);

  return (
    <div className="flex items-center gap-3 mb-6">
      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search by ID, signer, or document..."
          value={searchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
          className="pl-9"
        />
      </div>

      {/* Status Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Status
            {filters.status && filters.status.length > 0 && (
              <Badge variant="secondary" className="ml-1 px-1.5">
                {filters.status.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56" align="start">
          <div className="space-y-3">
            <p className="text-sm font-medium">Filter by status</p>
            {statusOptions.map((option) => (
              <div key={option.value} className="flex items-center gap-2">
                <Checkbox
                  id={option.value}
                  checked={filters.status?.includes(option.value) || false}
                  onCheckedChange={() => handleStatusToggle(option.value)}
                />
                <Label htmlFor={option.value} className="text-sm cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Clear Filters */}
      {activeFilterCount > 0 && (
        <Button variant="ghost" onClick={clearFilters} className="gap-2">
          <X className="h-4 w-4" />
          Clear ({activeFilterCount})
        </Button>
      )}
    </div>
  );
}
