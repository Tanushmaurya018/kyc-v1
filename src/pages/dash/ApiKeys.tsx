import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui';
import { ApiKeysTable, CreateKeyModal } from '@/components/api-keys';
import { getApiKeysByOrgId } from '@/data';
import { currentOrganization } from '@/data';
import type { ApiKey, ApiKeyEnvironment, ApiKeyPermission } from '@/types';
import { generateId } from '@/lib/utils';

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState(() => getApiKeysByOrgId(currentOrganization.id));
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | undefined>();

  const handleCreate = (data: {
    name: string;
    environment: ApiKeyEnvironment;
    permissions: ApiKeyPermission[];
  }) => {
    const newKey: ApiKey = {
      id: generateId(),
      name: data.name,
      keyPrefix: data.environment === 'LIVE' ? 'fs_live_' : 'fs_test_',
      fullKey: `fs_${data.environment.toLowerCase()}_${generateId()}${generateId()}`,
      environment: data.environment,
      status: 'ACTIVE',
      createdAt: new Date(),
      lastUsedAt: null,
      createdBy: 'user-009',
      createdByName: 'Layla Ahmed',
      permissions: data.permissions,
      orgId: currentOrganization.id,
    };
    
    setApiKeys(prev => [newKey, ...prev]);
    setCreatedKey(newKey.fullKey);
  };

  const handleRevoke = (key: ApiKey) => {
    setApiKeys(prev => 
      prev.map(k => k.id === key.id ? { ...k, status: 'REVOKED' as const } : k)
    );
  };

  const handleDelete = (key: ApiKey) => {
    setApiKeys(prev => prev.filter(k => k.id !== key.id));
  };

  const handleModalClose = (open: boolean) => {
    if (!open) {
      setCreatedKey(undefined);
    }
    setCreateModalOpen(open);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">
            {apiKeys.filter(k => k.status === 'ACTIVE').length} active keys
          </p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create API Key
        </Button>
      </div>

      <ApiKeysTable 
        apiKeys={apiKeys}
        onRevoke={handleRevoke}
        onDelete={handleDelete}
      />

      <CreateKeyModal
        open={createModalOpen}
        onOpenChange={handleModalClose}
        onSubmit={handleCreate}
        createdKey={createdKey}
      />
    </div>
  );
}
