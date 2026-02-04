import { useMemo } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  Legend,
  Tooltip
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { formatPercentage } from '@/lib/utils';

interface StatusBreakdownProps {
  signed: number;
  rejected: number;
  abandoned: number;
  expired: number;
  created: number;
}

const COLORS = {
  signed: '#22c55e',
  rejected: '#ef4444',
  abandoned: '#6b7280',
  expired: '#9ca3af',
  created: '#f59e0b',
};

export function StatusBreakdown({ signed, rejected, abandoned, expired, created }: StatusBreakdownProps) {
  const total = signed + rejected + abandoned + expired + created;
  
  const data = useMemo(() => [
    { name: 'Signed', value: signed, color: COLORS.signed },
    { name: 'Rejected', value: rejected, color: COLORS.rejected },
    { name: 'Abandoned', value: abandoned, color: COLORS.abandoned },
    { name: 'Expired', value: expired, color: COLORS.expired },
    { name: 'Created', value: created, color: COLORS.created },
  ].filter(item => item.value > 0), [signed, rejected, abandoned, expired, created]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Status Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e5e5',
                  borderRadius: 0,
                }}
                formatter={(value) => [
                  `${value} (${formatPercentage((value as number) / total)})`,
                ]}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Stats below chart */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Completion Rate</p>
              <p className="font-semibold text-lg">
                {formatPercentage(total > 0 ? signed / total : 0)}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Rejection Rate</p>
              <p className="font-semibold text-lg">
                {formatPercentage(total > 0 ? rejected / total : 0)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
