import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { format } from 'date-fns';
import { ArrowUpDown, Eye } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Button,
  Skeleton,
  TablePagination,
} from '@/components/ui';
import { StatusBadge } from './StatusBadge';
import { organizations } from '@/data';
import type { Contract, ContractFilters } from '@/types';


interface ContractsTableProps {
  contracts: Contract[];
  isLoading?: boolean;
  filters: ContractFilters;
  basePath?: string;
  showOrg?: boolean;
}

export function ContractsTable({ contracts, isLoading, filters, basePath = '/dash', showOrg }: ContractsTableProps) {
  const navigate = useNavigate();
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'createdAt', desc: true }
  ]);

  const columns = useMemo<ColumnDef<Contract>[]>(() => {
    const baseColumns: ColumnDef<Contract>[] = [
      {
        accessorKey: 'sessionId',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-auto p-0 font-medium hover:bg-transparent"
          >
            Session ID
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="font-mono text-sm">{row.getValue('sessionId')}</span>
        ),
      },
      {
        accessorKey: 'documentName',
        header: 'Document',
        cell: ({ row }) => (
          <div className="max-w-[200px]">
            <span className="truncate block" title={row.getValue('documentName')}>
              {row.getValue('documentName')}
            </span>
          </div>
        ),
      },
    ];

    if (showOrg) {
      baseColumns.push({
        accessorKey: 'orgId',
        header: 'Organization',
        cell: ({ row }) => {
          const org = organizations.find(o => o.id === row.getValue('orgId'));
          return <span className="text-sm">{org?.name || 'Unknown'}</span>;
        },
      });
    }

    baseColumns.push(
      {
        accessorKey: 'signerName',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-auto p-0 font-medium hover:bg-transparent"
          >
            Signer
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{row.getValue('signerName')}</p>
            <p className="text-xs text-muted-foreground">{row.original.signerIdType.replace('_', ' ')}</p>
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <StatusBadge status={row.getValue('status')} />,
        filterFn: (row, id, filterValue: string[]) => {
          if (!filterValue || filterValue.length === 0) return true;
          return filterValue.includes(row.getValue(id));
        },
      },
      {
        accessorKey: 'createdAt',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-auto p-0 font-medium hover:bg-transparent"
          >
            Created
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {format(row.getValue('createdAt'), 'MMM d, yyyy HH:mm')}
          </span>
        ),
      },
      {
        id: 'lastActivity',
        header: 'Last Activity',
        cell: ({ row }) => {
          const contract = row.original;
          // Show the most recent activity date
          const activityDate = contract.completedAt || contract.expiresAt;
          return (
            <span className="text-sm text-muted-foreground">
              {format(activityDate, 'MMM d, yyyy HH:mm')}
            </span>
          );
        },
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className="flex items-center gap-2 justify-end">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`${basePath}/contracts/${row.original.id}`)}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        ),
      }
    );

    return baseColumns;
  }, [navigate, basePath, showOrg]);

  // Apply filters
  const filteredContracts = useMemo(() => {
    let result = contracts;
    
    if (filters.status && filters.status.length > 0) {
      result = result.filter(c => filters.status!.includes(c.status));
    }
    
    if (filters.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(c => 
        c.sessionId.toLowerCase().includes(search) ||
        c.signerName.toLowerCase().includes(search) ||
        c.documentName.toLowerCase().includes(search)
      );
    }
    
    return result;
  }, [contracts, filters]);

  const table = useReactTable({
    data: filteredContracts,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 25 },
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        ))}
      </div>
    );
  }

  if (filteredContracts.length === 0) {
    return (
      <div className="text-center py-12 rounded-lg border border-border bg-card">
        <p className="text-muted-foreground mb-2">No contracts found</p>
        <p className="text-sm text-muted-foreground/70">
          {filters.search || filters.status ? 'Try adjusting your filters' : 'Contracts will appear here once created'}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="rounded-lg border border-border overflow-hidden bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-muted/50">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className="cursor-pointer"
                onClick={() => navigate(`${basePath}/contracts/${row.original.id}`)}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <TablePagination
        currentPage={table.getState().pagination.pageIndex + 1}
        totalPages={table.getPageCount()}
        totalItems={filteredContracts.length}
        pageSize={table.getState().pagination.pageSize}
        onPageChange={(page) => table.setPageIndex(page - 1)}
        onPageSizeChange={(size) => table.setPageSize(size)}
        itemLabel="contracts"
      />
    </div>
  );
}
