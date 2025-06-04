
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
    isAuthenticated: !!session
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
