import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, Users, FileText, Key, Coins } from 'lucide-react';
import { 
  Button, 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui';
import { ContractsTable, ContractFilters } from '@/components/contracts';
import { UsersTable } from '@/components/users';
import { ApiKeysTable } from '@/components/api-keys';
import { CurrentPlan, TopUpHistoryTable, UsageHistoryTable } from '@/components/billing';
import { 
  organizations, 
  contracts, 
  getUsersByOrgId, 
  getApiKeysByOrgId, 
  getBillingDataByOrgId 
} from '@/data';
import { format } from 'date-fns';
import { formatNumber } from '@/lib/utils';
import type { ContractFilters as ContractFiltersType } from '@/types';

export default function OrganizationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [filters, setFilters] = useState<ContractFiltersType>({});

  const org = organizations.find(o => o.id === id);
  
  if (!org || !id) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Organization not found</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => navigate('/console/organizations')}
        >
          Back to Organizations
        </Button>
      </div>
    );
  }

  const orgContracts = contracts.filter(c => c.orgId === id);
  const orgUsers = getUsersByOrgId(id);
  const orgApiKeys = getApiKeysByOrgId(id);
  const billingData = getBillingDataByOrgId(id);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate('/console/organizations')}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
      </div>

      {/* Org Info Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {org.logoUrl ? (
                <img 
                  src={org.logoUrl} 
                  alt={org.name} 
                  className="h-16 w-16 object-contain"
                />
              ) : (
                <div className="h-16 w-16 bg-gray-100 flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-gray-400" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold">{org.name}</h2>
                  <Badge variant={org.status === 'ACTIVE' ? 'default' : 'secondary'}>
                    {org.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500">{org.industry}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Member since {format(org.createdAt, 'MMMM yyyy')}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-8 text-center">
              <div>
                <FileText className="h-5 w-5 mx-auto text-gray-400" />
                <p className="text-2xl font-bold mt-1">{orgContracts.length}</p>
                <p className="text-xs text-gray-500">Contracts</p>
              </div>
              <div>
                <Users className="h-5 w-5 mx-auto text-gray-400" />
                <p className="text-2xl font-bold mt-1">{orgUsers.length}</p>
                <p className="text-xs text-gray-500">Users</p>
              </div>
              <div>
                <Key className="h-5 w-5 mx-auto text-gray-400" />
                <p className="text-2xl font-bold mt-1">{orgApiKeys.length}</p>
                <p className="text-xs text-gray-500">API Keys</p>
              </div>
              <div>
                <Coins className="h-5 w-5 mx-auto text-gray-400" />
                <p className="text-2xl font-bold mt-1">{billingData ? formatNumber(billingData.credits.available) : '—'}</p>
                <p className="text-xs text-gray-500">Credits</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="contracts">
        <TabsList>
          <TabsTrigger value="contracts">
            Contracts ({orgContracts.length})
          </TabsTrigger>
          <TabsTrigger value="users">
            Users ({orgUsers.length})
          </TabsTrigger>
          <TabsTrigger value="api-keys">
            API Keys ({orgApiKeys.length})
          </TabsTrigger>
          <TabsTrigger value="billing">
            Billing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="contracts" className="mt-6 space-y-4">
          <ContractFilters filters={filters} onFiltersChange={setFilters} />
          <ContractsTable 
            contracts={orgContracts} 
            isLoading={false}
            filters={filters}
            basePath="/console"
          />
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <UsersTable 
            users={orgUsers}
            isLoading={false}
            onDisable={() => {}}
            onRemove={() => {}}
            readOnly
          />
        </TabsContent>

        <TabsContent value="api-keys" className="mt-6">
          <ApiKeysTable 
            apiKeys={orgApiKeys}
            onRevoke={() => {}}
            onDelete={() => {}}
            readOnly
          />
        </TabsContent>

        <TabsContent value="billing" className="mt-6 space-y-6">
          {billingData ? (
            <>
              <CurrentPlan billingData={billingData} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Top-Up History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <TopUpHistoryTable transactions={billingData.topUpHistory} />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Recent Usage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <UsageHistoryTable transactions={billingData.usageHistory.slice(0, 5)} />
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <p className="text-center text-gray-500 py-8">
              Billing information not available
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
