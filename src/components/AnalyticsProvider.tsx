
import React, { createContext, useContext, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useSystemHealthMonitor } from '@/hooks/useSystemHealthMonitor';
import { useAdminAuditLogger } from '@/hooks/useAdminAuditLogger';

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
  const { logSystemAction } = useAdminAuditLogger();

  // Track page views and session activity
  useEffect(() => {
    if (isAuthenticated && user) {
      trackActivity('session_active');
    }
  }, [isAuthenticated, user, trackActivity]);

  // Enhanced error tracking with privacy compliance
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      trackError('javascript_error');
      
      // Log admin-specific errors for security monitoring
      if (window.location.pathname.startsWith('/admin')) {
        logSystemAction('admin_error_encountered', {
          error_type: 'javascript_error',
          page: window.location.pathname,
          timestamp: new Date().toISOString(),
          // No personal data included
        });
      }
      
      console.error('Global error tracked:', event.error);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      trackError('promise_rejection');
      
      // Log admin-specific promise rejections
      if (window.location.pathname.startsWith('/admin')) {
        logSystemAction('admin_promise_rejection', {
          error_type: 'promise_rejection',
          page: window.location.pathname,
          timestamp: new Date().toISOString(),
        });
      }
      
      console.error('Unhandled promise rejection tracked:', event.reason);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [trackError, logSystemAction]);

  // Privacy-compliant conversation tracking
  const privacyCompliantTrackConversation = async (length: number) => {
    // Only track aggregated metrics, no content
    await trackConversation(length);
    
    // Additional privacy audit for admin monitoring
    if (user) {
      logSystemAction('conversation_tracked', {
        metric_type: 'conversation_length',
        value_range: length > 100 ? 'long' : 'short',
        timestamp: new Date().toISOString(),
        // No actual content or user identification
      });
    }
  };

  const value = {
    trackConversation: privacyCompliantTrackConversation,
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
