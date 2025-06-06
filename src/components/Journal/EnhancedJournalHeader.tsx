
import React from 'react';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/components/SimpleAuthProvider';

const EnhancedJournalHeader: React.FC = () => {
  const { signOut } = useAuth();

  return (
    <div className="sticky top-0 z-40 bg-cosmic-gradient/95 backdrop-blur-sm border-b border-white/10">
      {/* Main Header */}
      <div className="flex items-center justify-between p-4 md:p-6">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-title font-medium text-white tracking-wide">
            lumi
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={signOut}
            className="text-white hover:bg-white/10"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedJournalHeader;
