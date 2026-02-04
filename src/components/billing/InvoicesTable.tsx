import { format } from 'date-fns';
import { Download } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Button,
  Badge,
} from '@/components/ui';
import { formatCurrency, formatNumber } from '@/lib/utils';
import type { Invoice } from '@/types';

interface InvoicesTableProps {
  invoices: Invoice[];
}

export function InvoicesTable({ invoices }: InvoicesTableProps) {
  if (invoices.length === 0) {
    return (
      <div className="text-center py-12 border border-gray-200">
        <p className="text-gray-500">No invoices yet</p>
      </div>
    );
  }

  return (
    <div className="border border-gray-200">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead>Period</TableHead>
            <TableHead>Contracts</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Paid At</TableHead>
            <TableHead className="w-[100px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell className="font-medium">{invoice.period}</TableCell>
              <TableCell>{formatNumber(invoice.contracts)}</TableCell>
              <TableCell>{formatCurrency(invoice.amount, invoice.currency)}</TableCell>
              <TableCell>
                <Badge variant={
                  invoice.status === 'PAID' ? 'paid' :
                  invoice.status === 'PENDING' ? 'pending' : 'overdue'
                }>
                  {invoice.status}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-gray-600">
                {invoice.paidAt ? format(invoice.paidAt, 'MMM d, yyyy') : '—'}
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
