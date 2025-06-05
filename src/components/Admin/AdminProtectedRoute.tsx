
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Loader2, Shield, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
  requireValidSession?: boolean;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ 
  children, 
  requireValidSession = true 
}) => {
  const {
    isLoadingAdminAuth,
    isAuthenticated,
    isAdmin,
    isAdminAuthenticated,
    hasValidAdminAccess,
    isAdminSessionExpired,
    refreshAdminSession,
    adminUser,
  } = useAdminAuth();

  // Show loading while checking authentication and admin status
  if (isLoadingAdminAuth) {
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

  // Show access denied if not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-cosmic-gradient flex items-center justify-center p-4">
        <Card className="bg-lumi-charcoal/80 backdrop-blur-sm border-lumi-sunset-coral/20 max-w-md w-full">
          <CardHeader className="text-center">
            <Shield className="w-12 h-12 text-lumi-sunset-coral mx-auto mb-2" />
            <CardTitle className="text-white text-xl font-title">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-white/70 font-sans">
              You don't have administrator privileges to access this area.
            </p>
            <Button 
              onClick={() => window.location.href = '/journal'}
              className="bg-lumi-aquamarine hover:bg-lumi-aquamarine/90 text-lumi-charcoal font-medium"
            >
              Return to Journal
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check session validity if required
  if (requireValidSession && !hasValidAdminAccess()) {
    // Show session expired message
    if (isAdminSessionExpired()) {
      return (
        <div className="min-h-screen bg-cosmic-gradient flex items-center justify-center p-4">
          <Card className="bg-lumi-charcoal/80 backdrop-blur-sm border-lumi-sunset-coral/20 max-w-md w-full">
            <CardHeader className="text-center">
              <AlertTriangle className="w-12 h-12 text-lumi-sunset-coral mx-auto mb-2" />
              <CardTitle className="text-white text-xl font-title">Session Expired</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-white/70 font-sans">
                Your admin session has expired for security reasons. Please refresh your session to continue.
              </p>
              <div className="space-y-2">
                <Button 
                  onClick={refreshAdminSession}
                  className="w-full bg-lumi-aquamarine hover:bg-lumi-aquamarine/90 text-lumi-charcoal font-medium"
                >
                  Refresh Admin Session
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.location.href = '/journal'}
                  className="w-full border-lumi-sunset-coral/20 text-white hover:bg-lumi-sunset-coral/10"
                >
                  Return to Journal
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Show admin authentication required
    return (
      <div className="min-h-screen bg-cosmic-gradient flex items-center justify-center p-4">
        <Card className="bg-lumi-charcoal/80 backdrop-blur-sm border-lumi-aquamarine/20 max-w-md w-full">
          <CardHeader className="text-center">
            <Shield className="w-12 h-12 text-lumi-aquamarine mx-auto mb-2" />
            <CardTitle className="text-white text-xl font-title">Admin Authentication Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-white/70 font-sans">
              Please complete admin authentication to access this area.
            </p>
            <Button 
              onClick={refreshAdminSession}
              className="bg-lumi-aquamarine hover:bg-lumi-aquamarine/90 text-lumi-charcoal font-medium"
            >
              Authenticate as Admin
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show admin session info if authenticated
  return (
    <>
      {adminUser && (
        <div className="bg-lumi-charcoal/50 border-b border-lumi-aquamarine/20 px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2 text-lumi-aquamarine">
              <Shield className="w-4 h-4" />
              <span className="font-medium">Admin Panel</span>
              <span className="text-white/60">•</span>
              <span className="text-white/80">{adminUser.name || adminUser.email}</span>
            </div>
            <div className="text-white/60 font-sans text-xs">
              Admin access active
            </div>
          </div>
        </div>
      )}
      {children}
    </>
  );
};

export default AdminProtectedRoute;
