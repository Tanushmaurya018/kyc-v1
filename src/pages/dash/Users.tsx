import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui';
import { UsersTable, UserForm } from '@/components/users';
import { useUsers } from '@/hooks';
import { currentOrganization } from '@/data';
import type { User, UserRole } from '@/types';
import { generateId } from '@/lib/utils';

export default function UsersPage() {
  const { users: initialUsers, isLoading } = useUsers(currentOrganization.id);
  const [users, setUsers] = useState<User[]>([]);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Sync state with hook data
  if (!initialized && !isLoading && initialUsers.length > 0) {
    setUsers(initialUsers);
    setInitialized(true);
  }

  const handleInvite = (data: { email: string; role: UserRole }) => {
    const newUser: User = {
      id: generateId(),
      email: data.email,
      name: data.email.split('@')[0],
      role: data.role,
      status: 'INVITED',
      createdAt: new Date(),
      lastLoginAt: null,
      invitedBy: 'user-009',
      orgId: currentOrganization.id,
    };
    
    setUsers(prev => [newUser, ...prev]);
  };

  const handleDisable = (user: User) => {
    setUsers(prev => 
      prev.map(u => u.id === user.id ? { ...u, status: 'DISABLED' as const } : u)
    );
  };

  const handleRemove = (user: User) => {
    setUsers(prev => prev.filter(u => u.id !== user.id));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">
            {users.filter(u => u.status === 'ACTIVE').length} active users
          </p>
        </div>
        <Button onClick={() => setInviteModalOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Invite User
        </Button>
      </div>

      <UsersTable 
        users={users}
        isLoading={isLoading}
        onDisable={handleDisable}
        onRemove={handleRemove}
      />

      <UserForm
        open={inviteModalOpen}
        onOpenChange={setInviteModalOpen}
        onSubmit={handleInvite}
      />
    </div>
  );
}
