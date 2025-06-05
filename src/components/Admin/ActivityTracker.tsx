
import React, { useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useAnalytics } from '@/hooks/useAnalytics';

interface ActivityTrackerProps {
  activityType: string;
  children?: React.ReactNode;
}

const ActivityTracker: React.FC<ActivityTrackerProps> = ({ activityType, children }) => {
  const { isAuthenticated } = useAuth();
  const { trackActivity } = useAnalytics(false); // Don't need admin status for tracking

  useEffect(() => {
    if (isAuthenticated && activityType) {
      // Track activity when component mounts
      trackActivity(activityType);
    }
  }, [isAuthenticated, activityType, trackActivity]);

  return <>{children}</>;
};

export default ActivityTracker;
