import { useMemo } from 'react';
import { 
  LineChart, 
  Line, 
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
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: '#e5e5e5' }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: '#e5e5e5' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e5e5',
                  borderRadius: 0,
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="created" 
                stroke="#000000" 
                strokeWidth={2}
                dot={false}
                name="Created"
              />
              <Line 
                type="monotone" 
                dataKey="signed" 
                stroke="#22c55e" 
                strokeWidth={2}
                dot={false}
                name="Signed"
              />
              <Line 
                type="monotone" 
                dataKey="rejected" 
                stroke="#ef4444" 
                strokeWidth={2}
                dot={false}
                name="Rejected"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
