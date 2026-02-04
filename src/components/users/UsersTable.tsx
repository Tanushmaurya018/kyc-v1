import { format } from 'date-fns';
import { MoreHorizontal, UserPlus, Edit, Ban, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Button,
  Badge,
  Avatar,
  AvatarFallback,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Skeleton,
} from '@/components/ui';
import type { User } from '@/types';
import { roleLabels } from '@/types/user';

interface UsersTableProps {
  users: User[];
  isLoading?: boolean;
  onEdit?: (user: User) => void;
  onDisable?: (user: User) => void;
  onRemove?: (user: User) => void;
  readOnly?: boolean;
}

export function UsersTable({ users, isLoading, onEdit, onDisable, onRemove, readOnly }: UsersTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-32" />
          </div>
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-12 border border-gray-200">
        <UserPlus className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 mb-2">No users found</p>
        <p className="text-sm text-gray-400">Invite team members to get started</p>
      </div>
    );
  }

  return (
    <div className="border border-gray-200">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Login</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-gray-200 text-sm">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="secondary">{roleLabels[user.role]}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant={
                  user.status === 'ACTIVE' ? 'active' :
                  user.status === 'INVITED' ? 'invited' : 'disabled'
                }>
                  {user.status}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-gray-600">
                {user.lastLoginAt 
                  ? format(user.lastLoginAt, 'MMM d, yyyy HH:mm')
                  : user.status === 'INVITED' ? 'Pending acceptance' : 'Never'
                }
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
                      <DropdownMenuItem onClick={() => onEdit?.(user)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Role
                      </DropdownMenuItem>
                      {user.status === 'ACTIVE' && (
                        <DropdownMenuItem 
                          onClick={() => onDisable?.(user)}
                          className="text-amber-600"
                        >
                          <Ban className="h-4 w-4 mr-2" />
                          Disable
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => onRemove?.(user)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
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
