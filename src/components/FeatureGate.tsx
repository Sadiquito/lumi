
import React from 'react';

interface FeatureGateProps {
  feature: 'tts' | 'ai_advice' | 'ai_insights' | 'premium';
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
}

const FeatureGate: React.FC<FeatureGateProps> = ({ 
  feature, 
  children, 
  fallback,
  showUpgradePrompt = true 
}) => {
  // All users now have access to all features
  return <>{children}</>;
};

export default FeatureGate;
