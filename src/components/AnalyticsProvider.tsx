
import React, { createContext, useContext, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useSystemHealthMonitor } from '@/hooks/useSystemHealthMonitor';

interface AnalyticsContextType {
  trackConversation: (length: number) => Promise<void>;
  trackFeatureUsage: (feature: string) => Promise<void>;
  trackPersonalizationEvent: (eventType: 'advice_generated' | 'advice_rated' | 'portrait_updated') => Promise<void>;
  trackTrialConversion: (type: 'subscription' | 'cancellation') => Promise<void>;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export const useAnalyticsTracking = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalyticsTracking must be used within an AnalyticsProvider');
  }
  return context;
};

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const {
    trackConversation,
    trackFeatureUsage,
    trackPersonalizationEvent,
    trackTrialConversion,
    trackActivity,
  } = useAnalytics(false);
  const { trackError } = useSystemHealthMonitor();

  // Track page views and session activity
  useEffect(() => {
    if (isAuthenticated && user) {
      trackActivity('session_active');
    }
  }, [isAuthenticated, user, trackActivity]);

  // Track errors globally
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      trackError('javascript_error');
      console.error('Global error tracked:', event.error);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      trackError('promise_rejection');
      console.error('Unhandled promise rejection tracked:', event.reason);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [trackError]);

  const value = {
    trackConversation,
    trackFeatureUsage,
    trackPersonalizationEvent,
    trackTrialConversion,
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};
