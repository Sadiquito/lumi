
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { RealtimeConversation } from '@/components/RealtimeConversation';
import { JournalLayout } from '@/components/journal/JournalLayout';
import { JournalHeader } from '@/components/journal/JournalHeader';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ChatPage = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <JournalLayout>
      <JournalHeader 
        onSignOut={signOut}
        additionalActions={
          <Button
            onClick={() => navigate('/journal')}
            variant="outline"
            size="sm"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Journal
          </Button>
        }
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8">
        <div className="w-full max-w-4xl">
          <RealtimeConversation />
        </div>
      </div>
    </JournalLayout>
  );
};

const Chat = () => (
  <ProtectedRoute>
    <ChatPage />
  </ProtectedRoute>
);

export default Chat;
