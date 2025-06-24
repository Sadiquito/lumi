
import React from 'react';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

interface JournalHeaderProps {
  onSignOut: () => void;
  additionalActions?: React.ReactNode;
}

export const JournalHeader: React.FC<JournalHeaderProps> = ({ onSignOut, additionalActions }) => {
  return (
    <header className="w-full flex justify-between items-center p-6 bg-black/20 backdrop-blur-sm border-b border-white/10">
      <div className="flex items-center space-x-2">
        <h1 className="text-2xl font-cinzel text-white">Lumi</h1>
      </div>
      
      <div className="flex items-center space-x-3">
        {additionalActions}
        <Button 
          onClick={onSignOut}
          variant="outline"
          size="sm"
          className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </header>
  );
};
