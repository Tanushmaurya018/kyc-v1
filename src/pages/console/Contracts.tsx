import { useState, useCallback } from 'react';
import { Search, Filter, X } from 'lucide-react';
import {
  Input,
  Button,
  Badge,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Checkbox,
  Label,
} from '@/components/ui';
import { SessionsTable } from '@/components/sessions';
import { useSessions } from '@/hooks';
import { getBackendStatesForStatus } from '@/lib/state-mapper';
import type { ContractStatus } from '@/types';
import type { SessionListParams } from '@/services/sessions-api';

type SortField = 'created_at' | 'updated_at' | 'state' | 'org_name';

const statusOptions: { value: ContractStatus; label: string }[] = [
  { value: 'CREATED', label: 'Created' },
  { value: 'SIGNED', label: 'Signed' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'ABANDONED', label: 'Abandoned' },
  { value: 'EXPIRED', label: 'Expired' },
];

export default function ConsoleContractsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortBy, setSortBy] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<ContractStatus[]>([]);

  // Convert dashboard statuses → backend states for the API
  const backendStates = selectedStatuses.flatMap(getBackendStatesForStatus);

  const params: SessionListParams = {
    page,
    page_size: pageSize,
    sort_by: sortBy,
    sort_order: sortOrder,
    ...(appliedSearch && { search: appliedSearch }),
    ...(backendStates.length > 0 && { status: backendStates }),
  };

  const { sessions, pagination, isLoading } = useSessions(params);

  const handleSort = useCallback((field: SortField) => {
    if (field === sortBy) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPage(1);
  }, [sortBy]);

  const handleSearchSubmit = () => {
    setAppliedSearch(search);
    setPage(1);
  };

  const handleStatusToggle = (status: ContractStatus) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
    setPage(1);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  const activeFilterCount =
    selectedStatuses.length + (appliedSearch ? 1 : 0);

  const clearFilters = () => {
    setSearch('');
    setAppliedSearch('');
    setSelectedStatuses([]);
    setPage(1);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by ID, signer, or org..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
            className="pl-9"
          />
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Status
              {selectedStatuses.length > 0 && (
                <Badge variant="secondary" className="ml-1 px-1.5">
                  {selectedStatuses.length}
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
                    checked={selectedStatuses.includes(option.value)}
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

        {activeFilterCount > 0 && (
          <Button variant="ghost" onClick={clearFilters} className="gap-2">
            <X className="h-4 w-4" />
            Clear ({activeFilterCount})
          </Button>
        )}
      </div>

      {/* Table */}
      <SessionsTable
        sessions={sessions}
        pagination={pagination}
        isLoading={isLoading}
        basePath="/console"
        showOrg
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        onPageChange={setPage}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
}
