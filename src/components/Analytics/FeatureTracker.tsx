
import { useEffect } from 'react';
import { useAnalyticsTracking } from '../AnalyticsProvider';

interface FeatureTrackerProps {
  feature: string;
  children: React.ReactNode;
  trackOnMount?: boolean;
  trackOnClick?: boolean;
}

export const FeatureTracker: React.FC<FeatureTrackerProps> = ({
  feature,
  children,
  trackOnMount = false,
  trackOnClick = false,
}) => {
  const { trackFeatureUsage } = useAnalyticsTracking();

  useEffect(() => {
    if (trackOnMount) {
      trackFeatureUsage(feature);
    }
  }, [feature, trackOnMount, trackFeatureUsage]);

  const handleClick = () => {
    if (trackOnClick) {
      trackFeatureUsage(feature);
    }
  };

  return (
    <div onClick={handleClick}>
      {children}
    </div>
  );
};
