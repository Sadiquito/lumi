
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

interface SocialAuthButtonsProps {
  isSignUp: boolean;
}

const SocialAuthButtons = ({ isSignUp }: SocialAuthButtonsProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSocialAuth = async (provider: 'google' | 'facebook') => {
    try {
      setLoading(provider);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/journal`,
        },
      });

      if (error) {
        let friendlyMessage = `Failed to sign ${isSignUp ? 'up' : 'in'} with ${provider === 'google' ? 'Google' : 'Facebook'}`;
        
        if (error.message.includes('Email not confirmed')) {
          friendlyMessage = "Please check your email and confirm your account before signing in.";
        } else if (error.message.includes('access_denied')) {
          friendlyMessage = "Access was denied. Please try again.";
        }

        toast({
          title: "Authentication Error",
          description: friendlyMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(`${provider} auth error:`, error);
      toast({
        title: "Network Error",
        description: "Unable to connect. Please check your internet connection.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="outline"
        className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 py-3 font-sans"
        onClick={() => handleSocialAuth('google')}
        disabled={loading !== null}
      >
        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        {loading === 'google' ? '...' : `Continue with Google`}
      </Button>

      <Button
        type="button"
        variant="outline"
        className="w-full bg-[#1877F2]/10 border-[#1877F2]/20 text-white hover:bg-[#1877F2]/20 py-3 font-sans"
        onClick={() => handleSocialAuth('facebook')}
        disabled={loading !== null}
      >
        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
        {loading === 'facebook' ? '...' : `Continue with Facebook`}
      </Button>
    </div>
  );
};

export default SocialAuthButtons;
