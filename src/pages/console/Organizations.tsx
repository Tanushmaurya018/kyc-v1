import { useState } from 'react';
import { Building2, Search, Users, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  Input,
  Badge,
} from '@/components/ui';
import { organizations, contracts, getAllUsers, getBillingDataByOrgId } from '@/data';

import { format } from 'date-fns';

export default function OrganizationsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const filteredOrgs = organizations.filter(org => 
    org.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search organizations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <p className="text-sm text-gray-500">
          {filteredOrgs.length} organizations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOrgs.map(org => {
          const orgContracts = contracts.filter(c => c.orgId === org.id);
          const allUsers = getAllUsers();
          const orgUsers = allUsers.filter(u => u.orgId === org.id);
          const billing = getBillingDataByOrgId(org.id);
          const signedCount = orgContracts.filter(c => c.status === 'SIGNED').length;
          const completionRate = orgContracts.length > 0 
            ? ((signedCount / orgContracts.length) * 100).toFixed(1) 
            : '0';

          return (
            <Card 
              key={org.id} 
              className="cursor-pointer hover:border-gray-300 transition-colors"
              onClick={() => navigate(`/console/organizations/${org.id}`)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {org.logoUrl ? (
                      <img 
                        src={org.logoUrl} 
                        alt={org.name} 
                        className="h-10 w-10 object-contain"
                      />
                    ) : (
                      <div className="h-10 w-10 bg-gray-100 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-sm font-semibold">{org.name}</CardTitle>
                      <p className="text-xs text-gray-500">{org.industry}</p>
                    </div>
                  </div>
                  <Badge variant={org.status === 'ACTIVE' ? 'default' : 'secondary'}>
                    {org.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span>{orgContracts.length} contracts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span>{orgUsers.length} users</span>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 space-y-1">
                  <div className="flex justify-between">
                    <span>Completion Rate</span>
                    <span className="font-medium text-black">{completionRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Current Plan</span>
                    <span className="font-medium text-black">{billing?.plan.name || 'Free'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Joined</span>
                    <span>{format(org.createdAt, 'MMM d, yyyy')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
