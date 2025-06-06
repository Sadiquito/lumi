
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/SimpleAuthProvider';
import { useAdminFunctions } from '@/hooks/useAdminFunctions';
import { useToast } from '@/hooks/use-toast';

export const useAdminAuth = () => {
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const { isAdmin, isCheckingAdmin } = useAdminFunctions();
  const { toast } = useToast();
  const [adminSession, setAdminSession] = useState<{
    isAdminAuthenticated: boolean;
    adminUser: any;
    sessionExpiry: number | null;
  }>({
    isAdminAuthenticated: false,
    adminUser: null,
    sessionExpiry: null,
  });

  // Session persistence key
  const ADMIN_SESSION_KEY = 'lumi-admin-session';
  const SESSION_DURATION = 4 * 60 * 60 * 1000; // 4 hours

  // Load admin session from localStorage on mount
  useEffect(() => {
    const storedSession = localStorage.getItem(ADMIN_SESSION_KEY);
    if (storedSession) {
      try {
        const parsed = JSON.parse(storedSession);
        const now = Date.now();
        
        // Check if session is still valid
        if (parsed.sessionExpiry && now < parsed.sessionExpiry) {
          setAdminSession(parsed);
        } else {
          // Session expired, clear it
          localStorage.removeItem(ADMIN_SESSION_KEY);
        }
      } catch (error) {
        console.error('Error parsing admin session:', error);
        localStorage.removeItem(ADMIN_SESSION_KEY);
      }
    }
  }, []);

  // Update admin session when admin status changes
  useEffect(() => {
    if (!isCheckingAdmin && isAuthenticated && isAdmin && user) {
      const now = Date.now();
      const newSession = {
        isAdminAuthenticated: true,
        adminUser: {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || user.email,
        },
        sessionExpiry: now + SESSION_DURATION,
      };
      
      setAdminSession(newSession);
      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(newSession));
      
      toast({
        title: "Admin Access Granted",
        description: "Welcome to the admin panel.",
      });
    } else if (!isAuthenticated || (!isCheckingAdmin && !isAdmin)) {
      // Clear admin session if user is not authenticated or not admin
      clearAdminSession();
    }
  }, [isAuthenticated, isAdmin, isCheckingAdmin, user, toast]);

  // Clear admin session
  const clearAdminSession = () => {
    setAdminSession({
      isAdminAuthenticated: false,
      adminUser: null,
      sessionExpiry: null,
    });
    localStorage.removeItem(ADMIN_SESSION_KEY);
  };

  // Force admin session refresh
  const refreshAdminSession = () => {
    if (isAuthenticated && isAdmin && user) {
      const now = Date.now();
      const refreshedSession = {
        isAdminAuthenticated: true,
        adminUser: {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || user.email,
        },
        sessionExpiry: now + SESSION_DURATION,
      };
      
      setAdminSession(refreshedSession);
      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(refreshedSession));
    }
  };

  // Check if admin session is expired
  const isAdminSessionExpired = () => {
    if (!adminSession.sessionExpiry) return true;
    return Date.now() >= adminSession.sessionExpiry;
  };

  // Validate admin access (combines auth + admin role + session)
  const hasValidAdminAccess = () => {
    return (
      isAuthenticated && 
      isAdmin && 
      adminSession.isAdminAuthenticated && 
      !isAdminSessionExpired()
    );
  };

  return {
    // Admin authentication state
    isAdminAuthenticated: adminSession.isAdminAuthenticated && !isAdminSessionExpired(),
    adminUser: adminSession.adminUser,
    sessionExpiry: adminSession.sessionExpiry,
    
    // Loading states
    isLoadingAdminAuth: authLoading || isCheckingAdmin,
    
    // Validation functions
    hasValidAdminAccess,
    isAdminSessionExpired,
    
    // Session management
    refreshAdminSession,
    clearAdminSession,
    
    // Base auth and role states
    isAuthenticated,
    isAdmin,
    user,
  };
};
