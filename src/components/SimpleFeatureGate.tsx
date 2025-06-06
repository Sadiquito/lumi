
import React from 'react';

interface SimpleFeatureGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

// Simplified feature gate that just shows all features for now
const SimpleFeatureGate: React.FC<SimpleFeatureGateProps> = ({ children }) => {
  return <>{children}</>;
};

export default SimpleFeatureGate;
