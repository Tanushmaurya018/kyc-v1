import { useState } from 'react';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TablePagination,
} from '@/components/ui';
import { formatNumber } from '@/lib/utils';
import type { OrgCreditTopUp } from '@/services/org-api';

// ── Top-Up History ────────────────────────────────────────────────────

interface TopUpHistoryTableProps {
  topUps: OrgCreditTopUp[];
}

export function TopUpHistoryTable({ topUps }: TopUpHistoryTableProps) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  if (topUps.length === 0) {
    return (
      <div className="text-center py-12 rounded-md border border-border bg-card">
        <p className="text-muted-foreground">No top-up history</p>
      </div>
    );
  }

  const totalPages = Math.ceil(topUps.length / pageSize);
  const paginated = topUps.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div>
      <div className="rounded-md border border-border overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Invoice</TableHead>
              <TableHead className="text-right">Credits</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="text-muted-foreground">
                  {t.credit_date ? format(new Date(t.credit_date), 'MMM d, yyyy') : '—'}
                </TableCell>
                <TableCell>{t.description || '—'}</TableCell>
                <TableCell className="text-muted-foreground">{t.invoice_id || '—'}</TableCell>
                <TableCell className="text-right font-medium text-chart-2">
                  +{formatNumber(t.credit_amount)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <TablePagination
        currentPage={page}
        totalPages={totalPages}
        totalItems={topUps.length}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        itemLabel="top-ups"
      />
    </div>
  );
}

// ── Pricing Table ─────────────────────────────────────────────────────

interface PricingTableProps {
  prices: { price: string; name: string }[];
}

export function PricingTable({ prices }: PricingTableProps) {
  if (prices.length === 0) return null;

  return (
    <div className="rounded-md border border-border overflow-hidden bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Credits</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {prices.map((p) => (
            <TableRow key={p.name}>
              <TableCell className="capitalize">
                {(p.name ?? '').toLowerCase().replace(/_/g, ' ')}
              </TableCell>
              <TableCell className="text-right">{p.price}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// ── Usage Breakdown Table ─────────────────────────────────────────────

interface UsageBreakdownTableProps {
  creditUsed: Record<string, number>;
}

export function UsageBreakdownTable({ creditUsed }: UsageBreakdownTableProps) {
  const entries = Object.entries(creditUsed).filter(([, v]) => v > 0);

  if (entries.length === 0) {
    return (
      <div className="text-center py-12 rounded-md border border-border bg-card">
        <p className="text-muted-foreground">No usage data</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border overflow-hidden bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Credits Used</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map(([type, count]) => (
            <TableRow key={type}>
              <TableCell className="capitalize">
                {type.toLowerCase().replace(/_/g, ' ')}
              </TableCell>
              <TableCell className="text-right font-medium">{formatNumber(count)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
