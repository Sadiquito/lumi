
import { useEffect } from 'react';
import { useSystemHealthMonitor } from '@/hooks/useSystemHealthMonitor';

export const PerformanceTracker: React.FC = () => {
  const { trackResponseTime } = useSystemHealthMonitor();

  useEffect(() => {
    // Intercept fetch requests to track response times
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const startTime = Date.now();
      
      // Extract URL correctly based on argument type
      let url: string;
      if (typeof args[0] === 'string') {
        url = args[0];
      } else if (args[0] instanceof Request) {
        url = args[0].url;
      } else {
        url = args[0].toString();
      }
      
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
