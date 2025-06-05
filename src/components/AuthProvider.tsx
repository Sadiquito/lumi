
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import TrialErrorBoundary from './TrialErrorBoundary';
import { useTrialQueries } from '@/hooks/useTrialQueries';
import { useAuthFunctions } from '@/hooks/useAuthFunctions';
import { ensureTrialStartDate } from '@/utils/trialUtils';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signUp: (email: string, password: string, name?: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: { name?: string; email?: string }) => Promise<{ error: AuthError | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: AuthError | null }>;
  loading: boolean;
  isAuthenticated: boolean;
  // Enhanced trial status integration with error handling
  trialStatus: {
    isTrialExpired: boolean;
    daysRemaining: number;
    hasPremiumAccess: boolean;
    canUseTTS: boolean;
    canUseAIAdvice: boolean;
    subscriptionStatus: string;
    trialStartDate: string | null;
    trialEndDate: string | null;
    isInGracePeriod: boolean;
    gracePeriodEndsAt: string | null;
    isLoading: boolean;
    error: string | null;
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Use the extracted hooks
  const authFunctions = useAuthFunctions();
  const {
    userData,
    trialStatusData,
    hasPremiumAccess,
    canUseTTS,
    canUseAIAdvice,
    isLoading: trialQueriesLoading,
    error: trialError,
  } = useTrialQueries(user?.id);

  const trialStatus = {
    isTrialExpired: trialStatusData?.isTrialExpired || false,
    daysRemaining: trialStatusData?.daysRemaining || 0,
    hasPremiumAccess: hasPremiumAccess || false,
    canUseTTS: canUseTTS || false,
    canUseAIAdvice: canUseAIAdvice || false,
    subscriptionStatus: userData?.subscription_status || 'trial',
    trialStartDate: userData?.trial_start_date || null,
    trialEndDate: trialStatusData?.trialEndDate || null,
    isInGracePeriod: trialStatusData?.isInGracePeriod || false,
    gracePeriodEndsAt: trialStatusData?.gracePeriodEndsAt || null,
    isLoading: trialQueriesLoading,
    error: trialError,
  };

  // Activity tracking function
  const trackActivity = async (activityType: string) => {
    if (user?.id) {
      try {
        await supabase.rpc('track_user_activity', { activity_type: activityType });
      } catch (error) {
        console.error('Error tracking activity:', error);
      }
    }
  };

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Handle different auth events and track activity
        if (event === 'SIGNED_OUT') {
          // Clear any cached data when user signs out
          localStorage.removeItem('lumi-user-preferences');
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed successfully');
        } else if (event === 'SIGNED_IN') {
          console.log('User signed in successfully');
          // Track login activity
          setTimeout(() => {
            if (session?.user) {
              trackActivity('login');
              ensureTrialStartDate(session.user.id);
            }
          }, 0);
        }
      }
    );

    // Check for existing session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
          toast({
            title: "Session Error",
            description: "There was an issue with your session. Please sign in again.",
            variant: "destructive",
          });
        } else {
          setSession(session);
          setUser(session?.user ?? null);
          
          // Ensure trial start date is set for existing users
          if (session?.user) {
            setTimeout(() => {
              ensureTrialStartDate(session.user.id);
            }, 0);
          }
        }
      } catch (error) {
        console.error('Unexpected error getting session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    return () => subscription.unsubscribe();
  }, [toast]);

  const value = {
    user,
    session,
    signUp: authFunctions.signUp,
    signIn: authFunctions.signIn,
    signOut: authFunctions.signOut,
    updateProfile: authFunctions.updateProfile,
    updatePassword: authFunctions.updatePassword,
    loading: loading || authFunctions.loading,
    isAuthenticated: !!session,
    trialStatus
  };

  return (
    <AuthContext.Provider value={value}>
      <TrialErrorBoundary>
        {children}
      </TrialErrorBoundary>
    </AuthContext.Provider>
  );
};
