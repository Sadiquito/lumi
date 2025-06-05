
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useToast } from '@/hooks/use-toast';

interface AdminAuthContextType {
  isAdminAuthenticated: boolean;
  adminUser: any;
  isLoadingAdminAuth: boolean;
  hasValidAdminAccess: () => boolean;
  refreshAdminSession: () => void;
  clearAdminSession: () => void;
  sessionTimeRemaining: number | null;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const useAdminAuthContext = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuthContext must be used within an AdminAuthProvider');
  }
  return context;
};

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const adminAuth = useAdminAuth();
  const { toast } = useToast();
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState<number | null>(null);

  // Session countdown timer
  useEffect(() => {
    if (!adminAuth.sessionExpiry) {
      setSessionTimeRemaining(null);
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = adminAuth.sessionExpiry! - now;
      
      if (remaining <= 0) {
        setSessionTimeRemaining(null);
        clearInterval(interval);
        
        // Show session expired warning
        toast({
          title: "Admin Session Expired",
          description: "Your admin session has expired. Please refresh to continue.",
          variant: "destructive",
        });
      } else {
        setSessionTimeRemaining(remaining);
        
        // Show warning at 10 minutes remaining
        if (remaining <= 10 * 60 * 1000 && remaining > 9 * 60 * 1000) {
          toast({
            title: "Admin Session Warning",
            description: "Your admin session will expire in 10 minutes.",
          });
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [adminAuth.sessionExpiry, toast]);

  const value = {
    isAdminAuthenticated: adminAuth.isAdminAuthenticated,
    adminUser: adminAuth.adminUser,
    isLoadingAdminAuth: adminAuth.isLoadingAdminAuth,
    hasValidAdminAccess: adminAuth.hasValidAdminAccess,
    refreshAdminSession: adminAuth.refreshAdminSession,
    clearAdminSession: adminAuth.clearAdminSession,
    sessionTimeRemaining,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};
