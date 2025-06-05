
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useAnalyticsTracking } from '@/components/AnalyticsProvider';
import { FeatureTracker } from '@/components/Analytics/FeatureTracker';
import JournalHeader from '@/components/Journal/JournalHeader';
import TodaysCheckIn from '@/components/Journal/TodaysCheckIn';
import RecentConversations from '@/components/Journal/RecentConversations';
import ConversationThread from '@/components/Journal/ConversationThread';
import JournalSidebar from '@/components/Journal/JournalSidebar';
import TrialStatusAlerts from '@/components/Journal/TrialStatusAlerts';
import ActivityTracker from '@/components/Admin/ActivityTracker';

const Journal: React.FC = () => {
  const { user, trialStatus } = useAuth();
  const { trackConversation, trackFeatureUsage } = useAnalyticsTracking();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Track journal page visit
  useEffect(() => {
    trackFeatureUsage('journal_page');
  }, [trackFeatureUsage]);

  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setIsSidebarOpen(false);
    trackFeatureUsage('conversation_select');
  };

  const handleNewConversation = () => {
    setSelectedConversationId(null);
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
          {/* Sidebar */}
          <JournalSidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            selectedConversationId={selectedConversationId}
            onConversationSelect={handleConversationSelect}
            onNewConversation={handleNewConversation}
          />

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <JournalHeader 
              onToggleSidebar={() => setIsSidebarOpen(true)}
              selectedConversationId={selectedConversationId}
            />
            
            <div className="flex-1 overflow-auto p-6">
              {selectedConversationId ? (
                <FeatureTracker feature="conversation_thread" trackOnMount>
                  <ConversationThread 
                    conversationId={selectedConversationId}
                    onConversationComplete={handleConversationComplete}
                  />
                </FeatureTracker>
              ) : (
                <div className="max-w-4xl mx-auto space-y-8">
                  <FeatureTracker feature="daily_checkin" trackOnMount>
                    <TodaysCheckIn />
                  </FeatureTracker>
                  
                  <FeatureTracker feature="recent_conversations" trackOnMount>
                    <RecentConversations 
                      onConversationSelect={handleConversationSelect}
                    />
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
