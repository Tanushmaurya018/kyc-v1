import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { cn, formatNumber, formatPercentage } from '@/lib/utils';
import type { DropOffAnalytics } from '@/types';

interface DropOffFunnelProps {
  data: DropOffAnalytics;
}

export function DropOffFunnel({ data }: DropOffFunnelProps) {
  const maxCount = data.steps[0]?.count || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center justify-between">
          <span>Conversion Funnel</span>
          <span className="text-sm font-normal text-gray-500">
            {formatPercentage(data.overallCompletionRate)} completion rate
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.steps.map((step, index) => {
            const widthPercentage = maxCount > 0 ? (step.count / maxCount) * 100 : 0;
            const isLast = index === data.steps.length - 1;
            
            return (
              <div key={step.name} className="relative">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{step.name}</span>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-gray-600">{formatNumber(step.count)}</span>
                    <span className={cn(
                      "font-medium",
                      step.percentage >= 70 ? "text-green-600" :
                      step.percentage >= 50 ? "text-amber-600" :
                      "text-red-600"
                    )}>
                      {step.percentage}%
                    </span>
                  </div>
                </div>
                <div className="h-8 bg-gray-100 rounded relative overflow-hidden">
                  <div 
                    className={cn(
                      "h-full transition-all duration-500 rounded",
                      isLast ? "bg-green-500" : "bg-gray-800"
                    )}
                    style={{ width: `${widthPercentage}%` }}
                  />
                </div>
                {step.dropOff > 0 && (
                  <div className="absolute -right-2 top-1/2 transform translate-x-full -translate-y-1/2">
                    <span className="text-xs text-red-500 font-medium">
                      -{formatNumber(step.dropOff)}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="mt-6 pt-4 border-t grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-semibold">{formatNumber(data.totalStarted)}</p>
            <p className="text-xs text-gray-500">Total Started</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-green-600">{formatNumber(data.totalCompleted)}</p>
            <p className="text-xs text-gray-500">Completed</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-red-600">{formatNumber(data.totalStarted - data.totalCompleted)}</p>
            <p className="text-xs text-gray-500">Dropped Off</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
