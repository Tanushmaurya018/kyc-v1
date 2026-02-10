import { CheckCircle2, Clock, TrendingUp, Key, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, Button, Skeleton } from '@/components/ui';

import { StatCard } from '@/components/analytics/StatsCards';
import { ContractsChart, StatusBreakdown, DropOffFunnel } from '@/components/analytics';
import { useConsoleDashboard } from '@/hooks';
import type { ConsoleDashboardResponse } from '@/services/sessions-api';

function mapChartData(data: ConsoleDashboardResponse) {
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

export default function ConsoleDashboard() {
  const navigate = useNavigate();
  const { data, isLoading, error } = useConsoleDashboard();

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Total Sessions"
            value={data.stats.total_sessions}
            change={data.stats.total_sessions_change}
          />
          <StatCard
            title="Signed"
            value={data.stats.signed_sessions}
            change={data.stats.signed_sessions_change}
            variant="success"
          />
          <StatCard
            title="Failed"
            value={data.stats.failed_sessions}
            change={data.stats.failed_sessions_change}
            variant="error"
          />
          <StatCard
            title="Expired"
            value={data.stats.expired_sessions}
          />
          <StatCard
            title="Active"
            value={data.stats.active_sessions}
            variant="warning"
          />
        </div>
      ) : null}

      {/* Contracts Over Time & Status Breakdown */}
      {charts && data && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ContractsChart data={charts.dailyStats} />
          </div>
          <StatusBreakdown
            signed={data.stats.signed_sessions}
            rejected={data.stats.failed_sessions}
            abandoned={0}
            expired={data.stats.expired_sessions}
            created={data.stats.active_sessions}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance */}
        <div className="lg:col-span-2">
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
                      {data.stats.completion_rate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">KYC Pass Rate</span>
                    </div>
                    <span className="font-semibold">
                      {data.stats.kyc_pass_rate.toFixed(1)}%
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
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate('/console/sessions')}
            >
              <FileText className="h-4 w-4 mr-2" />
              View All Sessions
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate('/console/api-keys')}
            >
              <Key className="h-4 w-4 mr-2" />
              Manage API Keys
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Drop-off Funnel */}
      {charts && <DropOffFunnel data={charts.dropOff} />}
    </div>
  );
}
