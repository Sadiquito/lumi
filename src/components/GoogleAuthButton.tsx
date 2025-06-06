
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

const GoogleAuthButton = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleGoogleAuth = async () => {
    try {
      setLoading(true);
      
      // Detect if we're in Lovable preview or deployed
      const currentUrl = window.location.origin;
      let redirectTo = `${currentUrl}/journal`;
      
      // If we're in a Lovable preview environment, use the deployed URL for redirect
      if (currentUrl.includes('lovableproject.com')) {
        redirectTo = 'https://lumii.lovable.app/journal';
      }
      
      console.log('Current URL:', currentUrl);
      console.log('Redirect URL:', redirectTo);
      console.log('Attempting Google OAuth...');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      console.log('OAuth response:', { data, error });

      if (error) {
        console.error('Google auth error:', error);
        let friendlyMessage = "Failed to sign in with Google";
        
        if (error.message.includes('Email not confirmed')) {
          friendlyMessage = "Please check your email and confirm your account before signing in.";
        } else if (error.message.includes('access_denied')) {
          friendlyMessage = "Access was denied. Please try again.";
        } else if (error.message.includes('popup_closed')) {
          friendlyMessage = "Sign-in was cancelled. Please try again.";
        } else if (error.message.includes('refused to connect')) {
          friendlyMessage = "OAuth configuration issue. Please check your Supabase settings.";
        }

        toast({
          title: "Authentication Error",
          description: friendlyMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Google auth error:', error);
      toast({
        title: "Network Error",
        description: "Unable to connect. Please check your internet connection.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleGoogleAuth}
      disabled={loading}
      className="bg-white hover:bg-gray-50 text-gray-900 py-4 px-8 text-lg font-medium rounded-xl border border-gray-200 shadow-lg transition-all duration-200 hover:scale-105 min-w-[280px]"
      size="lg"
    >
      <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      {loading ? 'Connecting...' : 'Continue with Google'}
    </Button>
  );
};

export default GoogleAuthButton;
