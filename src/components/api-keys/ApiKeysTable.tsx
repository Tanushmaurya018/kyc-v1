import { useState } from 'react';
import { format } from 'date-fns';
import { Key, Copy, MoreHorizontal, Trash2, Ban, Eye, EyeOff } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Button,
  Badge,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Skeleton,
} from '@/components/ui';
import type { ApiKey } from '@/types';

interface ApiKeysTableProps {
  apiKeys: ApiKey[];
  isLoading?: boolean;
  onRevoke?: (key: ApiKey) => void;
  onDelete?: (key: ApiKey) => void;
  readOnly?: boolean;
}

export function ApiKeysTable({ apiKeys, isLoading, onRevoke, onDelete, readOnly }: ApiKeysTableProps) {
  const [showKey, setShowKey] = useState<string | null>(null);

  // Filter out revoked keys - only show active ones
  const activeKeys = apiKeys.filter(key => key.status === 'ACTIVE');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-32" />
          </div>
        ))}
      </div>
    );
  }

  if (activeKeys.length === 0) {
    return (
      <div className="text-center py-12 border border-gray-200 rounded-xl">
        <Key className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 mb-2">No API keys found</p>
        <p className="text-sm text-gray-400">Create an API key to get started</p>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead>Name</TableHead>
            <TableHead>Key</TableHead>
            <TableHead>Environment</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Last Activity</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activeKeys.map((key) => (
            <TableRow key={key.id}>
              <TableCell>
                <div>
                  <p className="font-medium">{key.name}</p>
                  <p className="text-xs text-gray-500">by {key.createdByName}</p>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded-lg">
                    {showKey === key.id ? `${key.keyPrefix}...` : `${key.keyPrefix.slice(0, 8)}...`}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setShowKey(showKey === key.id ? null : key.id)}
                  >
                    {showKey === key.id ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => copyToClipboard(key.keyPrefix)}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={key.environment === 'LIVE' ? 'live' : 'test'}>
                  {key.environment}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-gray-600">
                {format(key.createdAt, 'MMM d, yyyy')}
              </TableCell>
              <TableCell className="text-sm text-gray-600">
                {key.lastUsedAt ? format(key.lastUsedAt, 'MMM d, yyyy HH:mm') : 'Never'}
              </TableCell>
              <TableCell>
                {!readOnly && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={() => onRevoke?.(key)}
                        className="text-amber-600"
                      >
                        <Ban className="h-4 w-4 mr-2" />
                        Revoke
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => onDelete?.(key)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
