
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ConversationsList } from '@/components/ConversationsList';
import { RealtimeConversation } from '@/components/RealtimeConversation';
import { JournalHeader } from '@/components/journal/JournalHeader';

const JournalPage = () => {
  const { signOut } = useAuth();

  return (
    <div 
      className="min-h-screen relative"
      style={{
        backgroundColor: '#0f172a',
        backgroundImage: `url('/lovable-uploads/1e779805-c108-43d4-b827-10df1f9b34e9.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="absolute inset-0 bg-black/60"></div>
      
      <div className="relative z-10 min-h-screen flex flex-col">
        <JournalHeader onSignOut={signOut} />

        {/* Main content area */}
        <div className="flex-1 flex flex-col items-center px-4 pb-8">
          {/* Real-time conversation section */}
          <div className="mb-12">
            <RealtimeConversation />
          </div>

          {/* Journal entries section */}
          <div className="w-full max-w-4xl flex-1">
            <h3 className="text-xl font-cinzel text-center mb-6" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
              Your Conversations
            </h3>
            
            <div className="h-[calc(100vh-400px)]">
              <ConversationsList />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Journal = () => (
  <ProtectedRoute>
    <JournalPage />
  </ProtectedRoute>
);

export default Journal;
