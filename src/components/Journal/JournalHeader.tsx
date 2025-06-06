
import React from 'react';
import { Button } from '@/components/ui/button';
import { Star, LogOut } from 'lucide-react';
import { useAuth } from '@/components/SimpleAuthProvider';
import { useNavigate } from 'react-router-dom';

const JournalHeader: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="bg-lumi-charcoal/80 backdrop-blur-sm border-b border-lumi-sunset-coral/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Star className="w-8 h-8 text-lumi-aquamarine mr-2" />
            <h1 className="text-xl font-title text-white tracking-wide">Lumi</h1>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="text-white/70 text-sm">
              Welcome back, {user?.user_metadata?.name || user?.email?.split('@')[0] || 'there'}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-white/60 hover:text-white hover:bg-white/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default JournalHeader;
