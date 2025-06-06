
import React from 'react';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/components/SimpleAuthProvider';
import { useNavigate } from 'react-router-dom';

const DiscreteSignOutButton: React.FC = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="absolute top-6 right-6 z-20">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSignOut}
        className="w-10 h-10 p-0 text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200 rounded-full"
        title="Sign out"
      >
        <LogOut className="w-5 h-5" />
      </Button>
    </div>
  );
};

export default DiscreteSignOutButton;
