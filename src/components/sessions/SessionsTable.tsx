import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowUp, ArrowDown, ArrowUpDown, Eye } from 'lucide-react';
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
import { StatusBadge } from '@/components/contracts/StatusBadge';
import { mapSessionState } from '@/lib/state-mapper';
import type { SessionListItem, Pagination } from '@/services/sessions-api';

type SortField = 'created_at' | 'updated_at' | 'state' | 'org_name';

interface SessionsTableProps {
  sessions: SessionListItem[];
  pagination: Pagination | null;
  isLoading?: boolean;
  basePath?: string;
  showOrg?: boolean;
  sortBy?: SortField;
  sortOrder?: 'asc' | 'desc';
  onSort?: (field: SortField) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

function SortButton({
  label,
  field,
  currentSort,
  currentOrder,
  onSort,
}: {
  label: string;
  field: SortField;
  currentSort?: SortField;
  currentOrder?: 'asc' | 'desc';
  onSort?: (field: SortField) => void;
}) {
  const isActive = currentSort === field;
  const Icon = isActive
    ? currentOrder === 'asc' ? ArrowUp : ArrowDown
    : ArrowUpDown;

  return (
    <Button
      variant="ghost"
      onClick={() => onSort?.(field)}
      className="h-auto p-0 font-medium hover:bg-transparent"
    >
      {label}
      <Icon className="ml-2 h-4 w-4" />
    </Button>
  );
}

export function SessionsTable({
  sessions,
  pagination,
  isLoading,
  basePath = '/console',
  showOrg,
  sortBy,
  sortOrder,
  onSort,
  onPageChange,
  onPageSizeChange,
}: SessionsTableProps) {
  const navigate = useNavigate();

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

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12 rounded-lg border border-border bg-card">
        <p className="text-muted-foreground mb-2">No sessions found</p>
        <p className="text-sm text-muted-foreground/70">
          Try adjusting your filters
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="rounded-lg border border-border overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Session ID</TableHead>
              {showOrg && (
                <TableHead>
                  <SortButton
                    label="Organization"
                    field="org_name"
                    currentSort={sortBy}
                    currentOrder={sortOrder}
                    onSort={onSort}
                  />
                </TableHead>
              )}
              <TableHead>Document</TableHead>
              <TableHead>
                <SortButton
                  label="Status"
                  field="state"
                  currentSort={sortBy}
                  currentOrder={sortOrder}
                  onSort={onSort}
                />
              </TableHead>
              <TableHead>
                <SortButton
                  label="Created"
                  field="created_at"
                  currentSort={sortBy}
                  currentOrder={sortOrder}
                  onSort={onSort}
                />
              </TableHead>
              <TableHead>
                <SortButton
                  label="Last Activity"
                  field="updated_at"
                  currentSort={sortBy}
                  currentOrder={sortOrder}
                  onSort={onSort}
                />
              </TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.map((session) => (
              <TableRow
                key={session.id}
                className="cursor-pointer"
                onClick={() => navigate(`${basePath}/sessions/${session.id}`)}
              >
                <TableCell>
                  <span className="font-mono text-sm">
                    {session.id.slice(0, 8)}...
                  </span>
                </TableCell>
                {showOrg && (
                  <TableCell>
                    <span className="text-sm">{session.org_name || '—'}</span>
                  </TableCell>
                )}
                <TableCell>
                  <span className="font-mono text-sm">{session.token.slice(0, 12)}...</span>
                </TableCell>
                <TableCell>
                  <StatusBadge status={mapSessionState(session.state)} />
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(session.created_at), 'MMM d, yyyy HH:mm')}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(session.updated_at), 'MMM d, yyyy HH:mm')}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`${basePath}/sessions/${session.id}`);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {pagination && (
        <TablePagination
          currentPage={pagination.page}
          totalPages={pagination.total_pages}
          totalItems={pagination.total_items}
          pageSize={pagination.page_size}
          onPageChange={(page) => onPageChange?.(page)}
          onPageSizeChange={(size) => onPageSizeChange?.(size)}
          itemLabel="sessions"
        />
      )}
    </div>
  );
}
