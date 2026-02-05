import { useMemo } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import type { DailyStats } from '@/types';

interface ContractsChartProps {
  data: DailyStats[];
}

// Muted chart colors
const CHART_COLORS = {
  created: '#6b7280',   // gray-500 (muted)
  signed: '#6ee7b7',    // emerald-300 (soft green)
  rejected: '#fca5a5',  // red-300 (soft red)
};

export function ContractsChart({ data }: ContractsChartProps) {
  const chartData = useMemo(() => {
    return data.map(d => ({
      ...d,
      date: format(parseISO(d.date), 'MMM d'),
    }));
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Contracts Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.created} stopOpacity={0.1}/>
                  <stop offset="95%" stopColor={CHART_COLORS.created} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorSigned" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.signed} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={CHART_COLORS.signed} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorRejected" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.rejected} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={CHART_COLORS.rejected} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e5e5',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                formatter={(value) => <span className="text-sm text-gray-600">{value}</span>}
              />
              <Area 
                type="monotone" 
                dataKey="created" 
                stroke={CHART_COLORS.created}
                strokeWidth={2}
                fill="url(#colorCreated)"
                name="Created"
              />
              <Area 
                type="monotone" 
                dataKey="signed" 
                stroke={CHART_COLORS.signed}
                strokeWidth={2}
                fill="url(#colorSigned)"
                name="Signed"
              />
              <Area 
                type="monotone" 
                dataKey="rejected" 
                stroke={CHART_COLORS.rejected}
                strokeWidth={2}
                fill="url(#colorRejected)"
                name="Rejected"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
