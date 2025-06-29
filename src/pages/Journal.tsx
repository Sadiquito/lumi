
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ConversationsList } from '@/components/ConversationsList';
import { JournalLayout } from '@/components/journal/JournalLayout';
import { JournalHeader } from '@/components/journal/JournalHeader';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const JournalPage = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <JournalLayout>
      <JournalHeader 
        onSignOut={signOut}
        additionalActions={
          <Button
            onClick={() => navigate('/chat')}
            variant="outline"
            size="sm"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Chat
          </Button>
        }
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col items-center px-4 pb-8">
        <div className="w-full max-w-4xl pt-8">
          <h2 className="text-2xl font-cinzel text-center mb-8" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
            Your Conversations
          </h2>
          
          <div className="h-[calc(100vh-200px)]">
            <ConversationsList />
          </div>
        </div>
      </div>
    </JournalLayout>
  );
};

const Journal = () => (
  <ProtectedRoute>
    <JournalPage />
  </ProtectedRoute>
);

export default Journal;
