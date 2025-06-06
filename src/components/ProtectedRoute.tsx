
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './SimpleAuthProvider';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated || !user) {
        // Small delay to ensure auth state is fully resolved
        const timer = setTimeout(() => {
          setShouldRedirect(true);
        }, 100);
        return () => clearTimeout(timer);
      } else {
        setShouldRedirect(false);
      }
    }
  }, [user, loading, isAuthenticated]);

  useEffect(() => {
    if (shouldRedirect) {
      navigate('/auth', { replace: true });
    }
  }, [shouldRedirect, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cosmic-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-lg mb-2 font-title">loading...</div>
          <div className="text-white/60 text-sm font-sans">verifying your session</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user || shouldRedirect) {
    return (
      <div className="min-h-screen bg-cosmic-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-lg mb-2 font-title">redirecting...</div>
          <div className="text-white/60 text-sm font-sans">taking you to sign in</div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
