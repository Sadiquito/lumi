
import React from 'react';
import { useAuth } from '@/components/SimpleAuthProvider';
import JournalHeader from '@/components/Journal/JournalHeader';
import ConversationInterface from '@/components/Journal/ConversationInterface';

const Journal: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Please log in to access your journal.</div>;
  }

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat relative"
      style={{
        backgroundImage: `url('/lovable-uploads/1f629700-83cc-4ed8-9a5f-5b47389195de.png')`
      }}
    >
      {/* Subtle overlay to maintain readability */}
      <div className="absolute inset-0 bg-black/20"></div>
      
      {/* Content */}
      <div className="relative z-10">
        <JournalHeader />
        
        <main className="px-4 py-8 max-w-4xl mx-auto">
          <ConversationInterface />
        </main>
      </div>
    </div>
  );
};

export default Journal;
