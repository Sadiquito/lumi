
import { useEffect, useCallback } from 'react';
import { useAnalytics } from './useAnalytics';

export const useSystemHealthMonitor = () => {
  const { trackSystemHealth } = useAnalytics(false);

  // Track API response times
  const trackResponseTime = useCallback(async (endpoint: string, startTime: number) => {
    const responseTime = Date.now() - startTime;
    await trackSystemHealth('response_time', responseTime);
    console.log(`API Response time for ${endpoint}: ${responseTime}ms`);
  }, [trackSystemHealth]);

  // Track error rates
  const trackError = useCallback(async (errorType: string) => {
    await trackSystemHealth('error_rate', 1);
    console.log(`Error tracked: ${errorType}`);
  }, [trackSystemHealth]);

  // Monitor memory usage
  const trackMemoryUsage = useCallback(async () => {
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      const usagePercent = (memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit) * 100;
      await trackSystemHealth('memory_usage', usagePercent);
    }
  }, [trackSystemHealth]);

  // Monitor active connections (estimate based on active sessions)
  const trackActiveConnections = useCallback(async () => {
    const connectionCount = navigator.onLine ? 1 : 0;
    await trackSystemHealth('active_connections', connectionCount);
  }, [trackSystemHealth]);

  // Set up periodic monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      trackMemoryUsage();
      trackActiveConnections();
    }, 5 * 60 * 1000); // Every 5 minutes

    return () => clearInterval(interval);
  }, [trackMemoryUsage, trackActiveConnections]);

  return {
    trackResponseTime,
    trackError,
    trackMemoryUsage,
    trackActiveConnections,
  };
};
