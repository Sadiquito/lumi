
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/SimpleAuthProvider';
import JournalHeader from '@/components/Journal/JournalHeader';
import TodaysCheckIn from '@/components/Journal/TodaysCheckIn';
import RecentConversations from '@/components/Journal/RecentConversations';
import ConversationThread from '@/components/Journal/ConversationThread';

const Journal: React.FC = () => {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<any>(null);

  const handleConversationSelect = (conversation: any) => {
    setSelectedConversation(conversation);
  };

  const handleNewConversation = () => {
    setSelectedConversation(null);
  };

  if (!user) {
    return <div>Please log in to access your journal.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lumi-sage/10 to-lumi-aquamarine/10">
      <div className="flex h-screen">
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <JournalHeader />
          
          <div className="flex-1 overflow-auto p-6">
            {selectedConversation ? (
              <ConversationThread 
                conversation={selectedConversation}
              />
            ) : (
              <div className="max-w-4xl mx-auto space-y-8">
                <TodaysCheckIn />
                <RecentConversations />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Journal;
