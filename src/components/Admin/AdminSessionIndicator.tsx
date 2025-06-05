
import React, { useState, useEffect } from 'react';
import { Shield, Clock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdminAuth } from '@/hooks/useAdminAuth';

const AdminSessionIndicator: React.FC = () => {
  const { 
    isAdminAuthenticated, 
    sessionExpiry, 
    refreshAdminSession,
    adminUser 
  } = useAdminAuth();
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    if (!sessionExpiry || !isAdminAuthenticated) {
      setTimeRemaining('');
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = sessionExpiry - now;
      
      if (remaining <= 0) {
        setTimeRemaining('Expired');
        clearInterval(interval);
      } else {
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        setTimeRemaining(`${hours}h ${minutes}m`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionExpiry, isAdminAuthenticated]);

  if (!isAdminAuthenticated) return null;

  return (
    <div className="flex items-center space-x-3 bg-lumi-charcoal/60 backdrop-blur-sm rounded-lg px-3 py-2 border border-lumi-aquamarine/20">
      <div className="flex items-center space-x-2 text-lumi-aquamarine">
        <Shield className="w-4 h-4" />
        <span className="text-sm font-medium">Admin</span>
      </div>
      
      <div className="text-white/60 text-xs">|</div>
      
      <div className="flex items-center space-x-2 text-white/80">
        <Clock className="w-3 h-3" />
        <span className="text-xs font-mono">{timeRemaining}</span>
      </div>
      
      <Button
        size="sm"
        variant="ghost"
        onClick={refreshAdminSession}
        className="h-6 px-2 text-xs text-lumi-aquamarine hover:bg-lumi-aquamarine/10"
      >
        <RefreshCw className="w-3 h-3" />
      </Button>
    </div>
  );
};

export default AdminSessionIndicator;
