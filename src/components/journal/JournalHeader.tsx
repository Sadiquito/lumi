
import React from 'react';
import { Button } from '@/components/ui/button';

interface JournalHeaderProps {
  onSignOut: () => void;
}

export const JournalHeader: React.FC<JournalHeaderProps> = ({ onSignOut }) => {
  return (
    <div className="flex justify-end p-6">
      <Button
        onClick={onSignOut}
        variant="ghost"
        size="sm"
        style={{ color: 'rgba(255, 255, 255, 0.8)' }}
        className="hover:text-white hover:bg-white/10 font-crimson"
      >
        Sign Out
      </Button>
    </div>
  );
};
