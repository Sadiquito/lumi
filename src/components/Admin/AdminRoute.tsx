
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { useAdminFunctions } from '@/hooks/useAdminFunctions';
import { Loader2 } from 'lucide-react';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const { isAdmin, isCheckingAdmin } = useAdminFunctions();

  // Show loading while checking authentication and admin status
  if (loading || isCheckingAdmin) {
    return (
      <div className="min-h-screen bg-cosmic-gradient flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-lumi-aquamarine mx-auto mb-4" />
          <p className="text-white">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect to main app if not admin
  if (!isAdmin) {
    return <Navigate to="/journal" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
