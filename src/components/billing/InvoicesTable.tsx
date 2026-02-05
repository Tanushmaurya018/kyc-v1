import { format } from 'date-fns';
import { ExternalLink } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Button,
} from '@/components/ui';
import { formatNumber } from '@/lib/utils';
import type { TopUpTransaction, UsageTransaction } from '@/types';

interface TopUpHistoryTableProps {
  transactions: TopUpTransaction[];
}

export function TopUpHistoryTable({ transactions }: TopUpHistoryTableProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 rounded-xl border border-border">
        <p className="text-muted-foreground">No top-up history</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Date</TableHead>
            <TableHead>Credits Added</TableHead>
            <TableHead>Added By</TableHead>
            <TableHead>Reference</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => (
            <TableRow key={tx.id}>
              <TableCell>{format(tx.date, 'MMM d, yyyy')}</TableCell>
              <TableCell className="font-medium text-chart-2">
                +{formatNumber(tx.credits)}
              </TableCell>
              <TableCell>{tx.addedByName}</TableCell>
              <TableCell className="text-muted-foreground">{tx.reference || '—'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

interface UsageHistoryTableProps {
  transactions: UsageTransaction[];
}

export function UsageHistoryTable({ transactions }: UsageHistoryTableProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 rounded-xl border border-border">
        <p className="text-muted-foreground">No usage history</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Date</TableHead>
            <TableHead>Session ID</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Credits Used</TableHead>
            <TableHead className="w-[100px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => (
            <TableRow key={tx.id}>
              <TableCell>{format(tx.date, 'MMM d, yyyy HH:mm')}</TableCell>
              <TableCell className="font-mono text-sm">{tx.sessionDisplayId}</TableCell>
              <TableCell>{tx.type === 'FACE_SIGN' ? 'Face Sign' : 'KYC'}</TableCell>
              <TableCell className="font-medium">-{tx.creditsUsed}</TableCell>
              <TableCell>
                <Button variant="ghost" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// Keep old name for backwards compatibility but export new components
export { TopUpHistoryTable as InvoicesTable };
