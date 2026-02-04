import { Building2, FileText, Users, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui';
import { StatusBadge } from '@/components/contracts';
import { organizations, contracts, getAllUsers } from '@/data';

import { format } from 'date-fns';

export default function ConsoleDashboard() {
  const navigate = useNavigate();

  // Aggregate stats across all organizations
  const allUsers = getAllUsers();
  const totalOrgs = organizations.length;
  const totalContracts = contracts.length;
  const totalUsers = allUsers.length;
  
  // Calculate aggregate analytics
  const signedContracts = contracts.filter(c => c.status === 'SIGNED').length;
  const completionRate = totalContracts > 0 ? (signedContracts / totalContracts) * 100 : 0;

  const recentContracts = contracts.slice(0, 8);

  const stats = [
    {
      title: 'Organizations',
      value: totalOrgs,
      icon: Building2,
      change: '+1 this month',
    },
    {
      title: 'Total Contracts',
      value: totalContracts,
      icon: FileText,
      change: '+12.5% from last month',
    },
    {
      title: 'Total Users',
      value: totalUsers,
      icon: Users,
      change: '+3 this week',
    },
    {
      title: 'Completion Rate',
      value: `${completionRate.toFixed(1)}%`,
      icon: TrendingUp,
      change: '+2.3% improvement',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                </div>
                <stat.icon className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Contracts */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Recent Contracts (All Orgs)</CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/console/contracts')}
              >
                View All
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentContracts.map((contract) => {
                  const org = organizations.find(o => o.id === contract.orgId);
                  return (
                    <div 
                      key={contract.id}
                      className="flex items-center justify-between p-3 border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/console/contracts/${contract.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-sm">{contract.documentName}</p>
                          <p className="text-xs text-gray-500">{org?.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-gray-500">
                          {format(contract.createdAt, 'MMM d, HH:mm')}
                        </span>
                        <StatusBadge status={contract.status} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Organizations Summary */}
        <div>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Organizations</CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/console/organizations')}
              >
                View All
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {organizations.map((org) => {
                  const orgContracts = contracts.filter(c => c.orgId === org.id);
                  const orgUsers = allUsers.filter(u => u.orgId === org.id);
                  return (
                    <div 
                      key={org.id}
                      className="flex items-center justify-between p-3 border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/console/organizations/${org.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        {org.logoUrl ? (
                          <img 
                            src={org.logoUrl} 
                            alt={org.name} 
                            className="h-8 w-8 object-contain"
                          />
                        ) : (
                          <Building2 className="h-8 w-8 text-gray-400" />
                        )}
                        <div>
                          <p className="font-medium text-sm">{org.name}</p>
                          <p className="text-xs text-gray-500">
                            {orgContracts.length} contracts • {orgUsers.length} users
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
