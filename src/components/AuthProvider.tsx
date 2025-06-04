import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import TrialErrorBoundary from './TrialErrorBoundary';

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

  // Enhanced trial status loading with better error handling
  const { data: userData, isLoading: userLoading, error: userError } = useQuery({
    queryKey: ['user-data', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      try {
        const { data, error } = await supabase
          .from('users')
          .select('subscription_status, trial_start_date, created_at')
          .eq('id', user.id)
          .maybeSingle();
        
        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error fetching user data:', error);
        throw new Error('Failed to fetch user subscription data');
      }
    },
    enabled: !!user?.id,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Enhanced trial status check with timezone and grace period handling
  const { data: trialStatusData, isLoading: enhancedTrialLoading, error: trialStatusError } = useQuery({
    queryKey: ['enhanced-trial-status', user?.id, userData?.trial_start_date],
    queryFn: async () => {
      if (!user?.id || !userData) return null;
      
      try {
        // Use existing functions for now
        const { data: isExpired, error: expiredError } = await supabase
          .rpc('is_trial_expired', { user_id: user.id });
        
        if (expiredError) throw expiredError;

        const { data: daysRemaining, error: daysError } = await supabase
          .rpc('get_trial_days_remaining', { user_id: user.id });
        
        if (daysError) throw daysError;

        // Calculate grace period status locally for now
        let isInGracePeriod = false;
        let gracePeriodEndsAt = null;
        
        if (userData.trial_start_date && isExpired) {
          const startDate = new Date(userData.trial_start_date);
          const graceEndDate = new Date(startDate);
          graceEndDate.setDate(graceEndDate.getDate() + 8); // 7 days trial + 1 day grace
          
          const now = new Date();
          if (now < graceEndDate) {
            isInGracePeriod = true;
            gracePeriodEndsAt = graceEndDate.toISOString();
          }
        }

        // Calculate trial end date with timezone consideration
        let trialEndDate = null;
        if (userData.trial_start_date) {
          const startDate = new Date(userData.trial_start_date);
          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + 7);
          trialEndDate = endDate.toISOString();
        }

        return {
          isTrialExpired: isExpired || false,
          daysRemaining: Math.max(0, daysRemaining || 0),
          trialEndDate,
          isInGracePeriod,
          gracePeriodEndsAt,
        };
      } catch (error) {
        console.error('Error checking trial status:', error);
        throw new Error('Failed to check trial status');
      }
    },
    enabled: !!user?.id && !!userData,
    retry: 2,
    retryDelay: 1000,
  });

  const { data: hasPremiumAccess, isLoading: premiumAccessLoading } = useQuery({
    queryKey: ['premium-access', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      
      try {
        const { data, error } = await supabase
          .rpc('has_premium_access', { user_id: user.id });
        
        if (error) throw error;
        return data || false;
      } catch (error) {
        console.error('Error checking premium access:', error);
        // Fallback: allow access if we can't check (degraded gracefully)
        return true;
      }
    },
    enabled: !!user?.id,
    retry: 1,
  });

  const { data: canUseTTS, isLoading: ttsLoading } = useQuery({
    queryKey: ['can-use-tts', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      
      try {
        const { data, error } = await supabase
          .rpc('can_use_tts', { user_id: user.id });
        
        if (error) throw error;
        return data || false;
      } catch (error) {
        console.error('Error checking TTS access:', error);
        return false;
      }
    },
    enabled: !!user?.id,
  });

  const { data: canUseAIAdvice, isLoading: aiAdviceLoading } = useQuery({
    queryKey: ['can-use-ai-advice', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      
      try {
        const { data, error } = await supabase
          .rpc('can_use_ai_advice', { user_id: user.id });
        
        if (error) throw error;
        return data || false;
      } catch (error) {
        console.error('Error checking AI advice access:', error);
        return false;
      }
    },
    enabled: !!user?.id,
  });

  const allQueriesLoading = userLoading || enhancedTrialLoading || 
                           premiumAccessLoading || ttsLoading || aiAdviceLoading;

  // Collect any errors
  const error = userError?.message || trialStatusError?.message || null;

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
    isLoading: allQueriesLoading,
    error,
  };

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Handle different auth events
        if (event === 'SIGNED_OUT') {
          // Clear any cached data when user signs out
          localStorage.removeItem('lumi-user-preferences');
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed successfully');
        } else if (event === 'SIGNED_IN') {
          console.log('User signed in successfully');
          // Ensure trial start date is set for existing users
          if (session?.user) {
            setTimeout(() => {
              ensureTrialStartDate(session.user.id);
            }, 0);
          }
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

  // Enhanced function to ensure trial start date is set with validation
  const ensureTrialStartDate = async (userId: string) => {
    try {
      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('trial_start_date, subscription_status, created_at')
        .eq('id', userId)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching user data:', fetchError);
        return;
      }

      // If user exists but doesn't have trial_start_date set, set it now
      if (userData && !userData.trial_start_date && userData.subscription_status === 'trial') {
        // Use created_at date if available, otherwise use current time
        const trialStartDate = userData.created_at || new Date().toISOString();
        
        const { error: updateError } = await supabase
          .from('users')
          .update({ trial_start_date: trialStartDate })
          .eq('id', userId);

        if (updateError) {
          console.error('Error setting trial start date:', updateError);
        } else {
          console.log('Trial start date set for existing user');
        }
      }
    } catch (error) {
      console.error('Error in ensureTrialStartDate:', error);
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      setLoading(true);
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name: name || ''
          }
        }
      });

      if (error) {
        let friendlyMessage = "Failed to create account. Please try again.";
        
        if (error.message.includes('already registered')) {
          friendlyMessage = "An account with this email already exists. Please sign in instead.";
        } else if (error.message.includes('invalid email')) {
          friendlyMessage = "Please enter a valid email address.";
        } else if (error.message.includes('password')) {
          friendlyMessage = "Password must be at least 6 characters long.";
        }

        toast({
          title: "Sign Up Error",
          description: friendlyMessage,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Welcome to Lumi!",
          description: "Your 7-day free trial has started. Check your email to confirm your account.",
        });
      }

      return { error };
    } catch (error) {
      console.error('Unexpected signup error:', error);
      toast({
        title: "Network Error",
        description: "Unable to connect. Please check your internet connection.",
        variant: "destructive",
      });
      return { error: error as AuthError };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        let friendlyMessage = "Failed to sign in. Please try again.";
        
        if (error.message.includes('Invalid login credentials')) {
          friendlyMessage = "Invalid email or password. Please check your credentials.";
        } else if (error.message.includes('Email not confirmed')) {
          friendlyMessage = "Please check your email and confirm your account before signing in.";
        } else if (error.message.includes('Too many requests')) {
          friendlyMessage = "Too many login attempts. Please wait a moment before trying again.";
        }

        toast({
          title: "Sign In Error",
          description: friendlyMessage,
          variant: "destructive",
        });
      }

      return { error };
    } catch (error) {
      console.error('Unexpected signin error:', error);
      toast({
        title: "Network Error",
        description: "Unable to connect. Please check your internet connection.",
        variant: "destructive",
      });
      return { error: error as AuthError };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        toast({
          title: "Sign Out Error",
          description: "There was an issue signing out. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Signed Out",
          description: "You've been successfully signed out.",
        });
      }
    } catch (error) {
      console.error('Unexpected signout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: { name?: string; email?: string }) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({
        email: updates.email,
        data: {
          name: updates.name
        }
      });

      if (error) {
        let friendlyMessage = "Failed to update profile. Please try again.";
        
        if (error.message.includes('email')) {
          friendlyMessage = "Invalid email address or email already in use.";
        }

        toast({
          title: "Profile Update Error",
          description: friendlyMessage,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully.",
        });
      }

      return { error };
    } catch (error) {
      console.error('Unexpected profile update error:', error);
      toast({
        title: "Network Error",
        description: "Unable to update profile. Please check your internet connection.",
        variant: "destructive",
      });
      return { error: error as AuthError };
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        let friendlyMessage = "Failed to update password. Please try again.";
        
        if (error.message.includes('password')) {
          friendlyMessage = "Password must be at least 6 characters long.";
        }

        toast({
          title: "Password Update Error",
          description: friendlyMessage,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Password Updated",
          description: "Your password has been updated successfully.",
        });
      }

      return { error };
    } catch (error) {
      console.error('Unexpected password update error:', error);
      toast({
        title: "Network Error",
        description: "Unable to update password. Please check your internet connection.",
        variant: "destructive",
      });
      return { error: error as AuthError };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    signUp,
    signIn,
    signOut,
    updateProfile,
    updatePassword,
    loading,
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
