import { useState, useEffect, useCallback } from 'react';
import { getAnalyticsForDateRange } from '@/data';
import type { AnalyticsData, DateRange } from '@/types';
import { delay } from '@/lib/utils';

export function useAnalytics(orgId?: string, dateRange: DateRange = '30d') {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await delay(400);
      const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
      const data = getAnalyticsForDateRange(orgId, days);
      setAnalytics(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [orgId, dateRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return { analytics, isLoading, error, refetch: fetchAnalytics };
}
