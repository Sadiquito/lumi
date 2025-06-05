
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useAnalyticsTracking } from '@/components/AnalyticsProvider';
import { FeatureTracker } from '@/components/Analytics/FeatureTracker';
import JournalHeader from '@/components/Journal/JournalHeader';
import TodaysCheckIn from '@/components/Journal/TodaysCheckIn';
import RecentConversations from '@/components/Journal/RecentConversations';
import ConversationThread from '@/components/Journal/ConversationThread';
import TrialStatusAlerts from '@/components/Journal/TrialStatusAlerts';
import ActivityTracker from '@/components/Admin/ActivityTracker';

const Journal: React.FC = () => {
  const { user, trialStatus } = useAuth();
  const { trackConversation, trackFeatureUsage } = useAnalyticsTracking();
  const [selectedConversation, setSelectedConversation] = useState<any>(null);

  // Track journal page visit
  useEffect(() => {
    trackFeatureUsage('journal_page');
  }, [trackFeatureUsage]);

  const handleConversationSelect = (conversation: any) => {
    setSelectedConversation(conversation);
    trackFeatureUsage('conversation_select');
  };

  const handleNewConversation = () => {
    setSelectedConversation(null);
    trackFeatureUsage('new_conversation');
  };

  const handleConversationComplete = (transcript: string) => {
    // Track conversation metrics
    trackConversation(transcript.length);
  };

  if (!user) {
    return <div>Please log in to access your journal.</div>;
  }

  return (
    <ActivityTracker activityType="journal_usage">
      <div className="min-h-screen bg-gradient-to-br from-lumi-sage/10 to-lumi-aquamarine/10">
        <TrialStatusAlerts />
        
        <div className="flex h-screen">
          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <JournalHeader />
            
            <div className="flex-1 overflow-auto p-6">
              {selectedConversation ? (
                <FeatureTracker feature="conversation_thread" trackOnMount>
                  <ConversationThread 
                    conversation={selectedConversation}
                  />
                </FeatureTracker>
              ) : (
                <div className="max-w-4xl mx-auto space-y-8">
                  <FeatureTracker feature="daily_checkin" trackOnMount>
                    <TodaysCheckIn />
                  </FeatureTracker>
                  
                  <FeatureTracker feature="recent_conversations" trackOnMount>
                    <RecentConversations />
                  </FeatureTracker>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ActivityTracker>
  );
};

export default Journal;
