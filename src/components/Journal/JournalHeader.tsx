
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Settings, Crown } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import TrialCountdown from '@/components/TrialCountdown';

const JournalHeader: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
  const userInitials = userName.charAt(0).toUpperCase();

  return (
    <div className="flex items-center justify-between p-4 md:p-6">
      <div className="flex items-center space-x-3">
        <Avatar className="w-10 h-10 bg-lumi-sunset-coral">
          <AvatarFallback className="bg-lumi-sunset-coral text-white font-medium">
            {userInitials}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-xl font-medium text-white">welcome back, {userName}</h1>
          <p className="text-white/70 text-sm">ready for today's reflection?</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <TrialCountdown variant="compact" />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/settings')}
          className="text-white hover:bg-white/10"
        >
          <Settings className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/subscription')}
          className="text-white hover:bg-white/10"
        >
          <Crown className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className="text-white hover:bg-white/10 text-sm"
        >
          sign out
        </Button>
      </div>
    </div>
  );
};

export default JournalHeader;
