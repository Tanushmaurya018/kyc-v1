import { FileText, CheckCircle2, Clock, TrendingUp, Key } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, Button, Skeleton } from '@/components/ui';
import { StatsCards, ContractsChart, StatusBreakdown, DropOffFunnel } from '@/components/analytics';
import { StatusBadge } from '@/components/contracts';
import { mapSessionState } from '@/lib/state-mapper';
import { useClientDashboard } from '@/hooks';
import { format } from 'date-fns';
import type { ClientDashboardResponse } from '@/services/sessions-api';

function mapChartData(data: ClientDashboardResponse) {
  return {
    dailyStats: data.daily_stats!.map((d) => ({
      date: d.date,
      created: d.created,
      signed: d.signed,
      rejected: d.rejected,
      abandoned: d.abandoned,
      expired: d.expired,
    })),
    dropOff: {
      steps: data.drop_off!.steps.map((s) => ({
        name: s.name,
        count: s.count,
        percentage: s.percentage,
        dropOff: s.drop_off,
      })),
      totalStarted: data.drop_off!.total_started,
      totalCompleted: data.drop_off!.total_completed,
      overallCompletionRate: data.drop_off!.overall_completion_rate,
    },
  };
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data, isLoading, error } = useClientDashboard();

  const charts = data?.daily_stats && data?.drop_off ? mapChartData(data) : null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-[120px]" />
          ))}
        </div>
      ) : error ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">{error.message}</p>
          </CardContent>
        </Card>
      ) : data ? (
        <StatsCards
          totalContracts={data.stats.total_sessions}
          signedContracts={data.stats.signed_sessions}
          rejectedContracts={data.stats.rejected_sessions}
          abandonedContracts={data.stats.abandoned_sessions}
          expiredContracts={data.stats.expired_sessions}
          totalChange={data.stats.total_change}
          signedChange={data.stats.signed_change}
          rejectedChange={data.stats.rejected_change}
        />
      ) : null}

      {/* Contracts Over Time & Status Breakdown */}
      {charts && data && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ContractsChart data={charts.dailyStats} />
          </div>
          <StatusBreakdown
            signed={data.stats.signed_sessions}
            rejected={data.stats.rejected_sessions}
            abandoned={data.stats.abandoned_sessions}
            expired={data.stats.expired_sessions}
            created={data.stats.created_sessions}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Sessions */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Recent Sessions</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dash/sessions')}
              >
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16" />
                  ))}
                </div>
              ) : data && data.recent_sessions.length > 0 ? (
                <div className="space-y-3">
                  {data.recent_sessions.slice(0, 5).map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/dash/sessions/${session.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">
                            {session.document_name || session.id.slice(0, 12) + '...'}
                          </p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {session.id.slice(0, 8)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(session.created_at), 'MMM d, HH:mm')}
                        </span>
                        <StatusBadge status={mapSessionState(session.state)} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No sessions yet</p>
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
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12" />
                  <Skeleton className="h-12" />
                </div>
              ) : data ? (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Completion Rate</span>
                    </div>
                    <span className="font-semibold">
                      {(data.stats.completion_rate * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">KYC Pass Rate</span>
                    </div>
                    <span className="font-semibold">
                      {(data.stats.kyc_pass_rate * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Avg. Time to Sign</span>
                    </div>
                    <span className="font-semibold">
                      {data.stats.avg_time_to_sign} min
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
                onClick={() => navigate('/dash/sessions')}
              >
                <FileText className="h-4 w-4 mr-2" />
                View All Sessions
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
      {charts && <DropOffFunnel data={charts.dropOff} />}
    </div>
  );
}
