import { FileText, CheckCircle2, Clock, TrendingUp, Key } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, Button, Skeleton } from '@/components/ui';
import { StatsCards, ContractsChart, StatusBreakdown, DropOffFunnel } from '@/components/analytics';
import { StatusBadge } from '@/components/contracts';
import { useContracts } from '@/hooks';
import { useAnalytics } from '@/hooks';
import { currentOrganization } from '@/data';
import { format } from 'date-fns';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { contracts, isLoading: contractsLoading } = useContracts(currentOrganization.id);
  const { analytics, isLoading: analyticsLoading } = useAnalytics(currentOrganization.id);

  const recentContracts = contracts.slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Cards */}
      {analyticsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-[120px]" />
          ))}
        </div>
      ) : analytics ? (
        <StatsCards
          totalContracts={analytics.totalContracts}
          signedContracts={analytics.signedContracts}
          rejectedContracts={analytics.rejectedContracts}
          abandonedContracts={analytics.abandonedContracts}
          expiredContracts={analytics.expiredContracts}
          totalChange={analytics.totalChange}
          signedChange={analytics.signedChange}
          rejectedChange={analytics.rejectedChange}
        />
      ) : null}

      {/* Contracts Over Time & Status Breakdown - moved up */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ContractsChart data={analytics.dailyStats} />
          </div>
          <StatusBreakdown
            signed={analytics.signedContracts}
            rejected={analytics.rejectedContracts}
            abandoned={analytics.abandonedContracts}
            expired={analytics.expiredContracts}
            created={analytics.createdContracts}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Contracts */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Recent Contracts</CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/dash/contracts')}
              >
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {contractsLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16" />
                  ))}
                </div>
              ) : recentContracts.length > 0 ? (
                <div className="space-y-4">
                  {recentContracts.map((contract) => (
                    <div 
                      key={contract.id}
                      className="flex items-center justify-between p-3 border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/dash/contracts/${contract.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-sm">{contract.documentName}</p>
                          <p className="text-xs text-gray-500">{contract.signerName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-gray-500">
                          {format(contract.createdAt, 'MMM d, HH:mm')}
                        </span>
                        <StatusBadge status={contract.status} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No contracts yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {analyticsLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12" />
                  <Skeleton className="h-12" />
                </div>
              ) : analytics ? (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Completion Rate</span>
                    </div>
                    <span className="font-semibold">
                      {(analytics.completionRate * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">KYC Pass Rate</span>
                    </div>
                    <span className="font-semibold">
                      {(analytics.kycPassRate * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">Avg. Time to Sign</span>
                    </div>
                    <span className="font-semibold">
                      {analytics.avgTimeToSign} min
                    </span>
                  </div>
                </>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/dash/contracts')}
              >
                <FileText className="h-4 w-4 mr-2" />
                View All Contracts
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/dash/api-keys')}
              >
                <Key className="h-4 w-4 mr-2" />
                Manage API Keys
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Drop-off Funnel */}
      {analytics && (
        <DropOffFunnel data={analytics.dropOff} />
      )}
    </div>
  );
}
