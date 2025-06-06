
import React from 'react';
import { useAuth } from '@/components/SimpleAuthProvider';
import JournalHeader from '@/components/Journal/JournalHeader';
import StartConversationSection from '@/components/Journal/StartConversationSection';
import ConversationLog from '@/components/Journal/ConversationLog';

const Journal: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Please log in to access your journal.</div>;
  }

  return (
    <div className="min-h-screen bg-lumi-deep-space">
      <JournalHeader />
      
      <main className="px-4 py-8 max-w-2xl mx-auto">
        <StartConversationSection />
        <ConversationLog />
      </main>
    </div>
  );
};

export default Journal;
