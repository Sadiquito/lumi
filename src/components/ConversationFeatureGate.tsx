
import React from 'react';

interface ConversationFeatureGateProps {
  feature: 'ai_insights' | 'advanced_history';
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const ConversationFeatureGate: React.FC<ConversationFeatureGateProps> = ({ 
  feature, 
  children, 
  fallback 
}) => {
  // All users now have access to all conversation features
  return <>{children}</>;
};

export default ConversationFeatureGate;
