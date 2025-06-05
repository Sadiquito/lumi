
import React from 'react';
import { Shield, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useToast } from '@/hooks/use-toast';

const AdminAuthButton: React.FC = () => {
  const { 
    isAdminAuthenticated, 
    isAdmin,
    refreshAdminSession, 
    clearAdminSession,
    adminUser 
  } = useAdminAuth();
  const { toast } = useToast();

  if (!isAdmin) return null;

  const handleAdminAuth = () => {
    if (isAdminAuthenticated) {
      clearAdminSession();
      toast({
        title: "Admin Session Ended",
        description: "You have been logged out of the admin panel.",
      });
    } else {
      refreshAdminSession();
    }
  };

  return (
    <Button
      onClick={handleAdminAuth}
      variant={isAdminAuthenticated ? "destructive" : "default"}
      size="sm"
      className={`
        flex items-center space-x-2 font-medium
        ${isAdminAuthenticated 
          ? 'bg-lumi-sunset-coral hover:bg-lumi-sunset-coral/90 text-white' 
          : 'bg-lumi-aquamarine hover:bg-lumi-aquamarine/90 text-lumi-charcoal'
        }
      `}
    >
      {isAdminAuthenticated ? (
        <>
          <LogOut className="w-4 h-4" />
          <span>Exit Admin</span>
        </>
      ) : (
        <>
          <Shield className="w-4 h-4" />
          <span>Admin Access</span>
        </>
      )}
    </Button>
  );
};

export default AdminAuthButton;
