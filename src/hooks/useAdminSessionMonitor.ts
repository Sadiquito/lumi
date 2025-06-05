
import { useEffect, useCallback } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useToast } from '@/hooks/use-toast';

export const useAdminSessionMonitor = () => {
  const { 
    isAdminAuthenticated, 
    sessionExpiry, 
    refreshAdminSession,
    isAdminSessionExpired 
  } = useAdminAuth();
  const { toast } = useToast();

  // Auto-refresh session when close to expiry
  const handleSessionRefresh = useCallback(() => {
    if (isAdminAuthenticated && !isAdminSessionExpired()) {
      refreshAdminSession();
      toast({
        title: "Admin Session Refreshed",
        description: "Your admin session has been automatically refreshed.",
      });
    }
  }, [isAdminAuthenticated, isAdminSessionExpired, refreshAdminSession, toast]);

  // Monitor session expiry and auto-refresh
  useEffect(() => {
    if (!sessionExpiry || !isAdminAuthenticated) return;

    const checkInterval = setInterval(() => {
      const now = Date.now();
      const timeRemaining = sessionExpiry - now;
      
      // Auto-refresh at 30 minutes remaining
      if (timeRemaining <= 30 * 60 * 1000 && timeRemaining > 29 * 60 * 1000) {
        handleSessionRefresh();
      }
    }, 60 * 1000); // Check every minute

    return () => clearInterval(checkInterval);
  }, [sessionExpiry, isAdminAuthenticated, handleSessionRefresh]);

  // Monitor user activity to extend session
  useEffect(() => {
    if (!isAdminAuthenticated) return;

    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    let lastActivity = Date.now();

    const handleActivity = () => {
      const now = Date.now();
      // If there's been activity in the last 10 minutes, refresh session
      if (now - lastActivity > 10 * 60 * 1000) {
        lastActivity = now;
        handleSessionRefresh();
      }
    };

    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [isAdminAuthenticated, handleSessionRefresh]);
};
