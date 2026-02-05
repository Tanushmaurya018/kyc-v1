import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { cn, formatNumber, formatPercentage } from '@/lib/utils';
import { ArrowDown, TrendingDown, CheckCircle2 } from 'lucide-react';
import type { DropOffAnalytics } from '@/types';

interface DropOffFunnelProps {
  data: DropOffAnalytics;
}

// Gradient colors for funnel steps (from dark to light, ending with success)
const STEP_COLORS = [
  'bg-gray-700',
  'bg-gray-600', 
  'bg-gray-500',
  'bg-gray-400',
  'bg-emerald-400',
  'bg-emerald-500',
];

export function DropOffFunnel({ data }: DropOffFunnelProps) {
  const maxCount = data.steps[0]?.count || 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Conversion Funnel</CardTitle>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-700">
              {formatPercentage(data.overallCompletionRate)} completion
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {/* Funnel Visualization */}
        <div className="space-y-1">
          {data.steps.map((step, index) => {
            const widthPercentage = maxCount > 0 ? (step.count / maxCount) * 100 : 0;
            const isLast = index === data.steps.length - 1;
            const colorClass = STEP_COLORS[Math.min(index, STEP_COLORS.length - 1)];
            
            return (
              <div key={step.name} className="group">
                {/* Step row */}
                <div className="flex items-center gap-4">
                  {/* Step number */}
                  <div className={cn(
                    "flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold",
                    isLast 
                      ? "bg-emerald-100 text-emerald-700" 
                      : "bg-gray-100 text-gray-600"
                  )}>
                    {index + 1}
                  </div>
                  
                  {/* Bar container */}
                  <div className="flex-1 relative">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-gray-700">{step.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold tabular-nums">
                          {formatNumber(step.count)}
                        </span>
                        <span className={cn(
                          "text-xs font-medium px-1.5 py-0.5 rounded",
                          isLast 
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-gray-100 text-gray-600"
                        )}>
                          {step.percentage}%
                        </span>
                      </div>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all duration-700 ease-out",
                          colorClass
                        )}
                        style={{ width: `${widthPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Drop-off indicator between steps */}
                {step.dropOff > 0 && !isLast && (
                  <div className="flex items-center gap-4 py-1">
                    <div className="w-7 flex justify-center">
                      <ArrowDown className="h-3 w-3 text-gray-300" />
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-red-400">
                      <TrendingDown className="h-3 w-3" />
                      <span>-{formatNumber(step.dropOff)} dropped</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
