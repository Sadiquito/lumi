
import { useEffect } from 'react';
import { useSystemHealthMonitor } from '@/hooks/useSystemHealthMonitor';

export const PerformanceTracker: React.FC = () => {
  const { trackResponseTime } = useSystemHealthMonitor();

  useEffect(() => {
    // Intercept fetch requests to track response times
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const startTime = Date.now();
      const url = typeof args[0] === 'string' ? args[0] : args[0].url;
      
      try {
        const response = await originalFetch(...args);
        await trackResponseTime(url, startTime);
        return response;
      } catch (error) {
        await trackResponseTime(url, startTime);
        throw error;
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [trackResponseTime]);

  return null;
};
