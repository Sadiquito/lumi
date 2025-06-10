
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { ConversationsList } from '@/components/ConversationsList';
import { Circle, CircleStop, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const JournalPage = () => {
  const { user, signOut } = useAuth();
  const [isConversationActive, setIsConversationActive] = useState(false);
  const navigate = useNavigate();

  const handleConversationToggle = () => {
    setIsConversationActive(!isConversationActive);
    // Here you would integrate with your conversation logic
  };

  const handleStartConversation = () => {
    navigate('/conversation');
  };

  return (
    <div 
      className="min-h-screen relative"
      style={{
        backgroundImage: `url('/lovable-uploads/1e779805-c108-43d4-b827-10df1f9b34e9.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/60"></div>
      
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header with sign out button */}
        <div className="flex justify-end p-6">
          <Button
            onClick={signOut}
            variant="ghost"
            size="sm"
            className="text-white/80 hover:text-white hover:bg-white/10 font-crimson"
          >
            Sign Out
          </Button>
        </div>

        {/* Main content area */}
        <div className="flex-1 flex flex-col items-center px-4 pb-8">
          {/* Central conversation control */}
          <div className="flex flex-col items-center space-y-6 mb-12">
            <Button
              onClick={handleConversationToggle}
              className={`
                w-24 h-24 rounded-full transition-all duration-300 
                ${isConversationActive 
                  ? 'bg-red-500/20 hover:bg-red-500/30 border-2 border-red-400 shadow-[0_0_30px_rgba(239,68,68,0.3)]' 
                  : 'bg-cyan-400/20 hover:bg-cyan-400/30 border-2 border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.3)]'
                }
                backdrop-blur-sm
              `}
            >
              {isConversationActive ? (
                <CircleStop className="w-8 h-8 text-red-400" />
              ) : (
                <Circle className="w-8 h-8 text-cyan-400" />
              )}
            </Button>
            
            <div className="text-center space-y-4">
              <h2 className="text-lg font-cinzel text-white mb-1">
                {isConversationActive ? 'Stop Conversation' : 'Begin Conversation'}
              </h2>
              <p className="text-white/70 font-crimson text-sm">
                {isConversationActive ? 'Lumi is listening...' : 'Start your daily reflection with Lumi'}
              </p>
              
              {/* New Start Conversation Button */}
              <Button
                onClick={handleStartConversation}
                className="bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400 text-cyan-400 backdrop-blur-sm transition-all duration-300"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Start New Conversation
              </Button>
            </div>
          </div>

          {/* Journal entries section */}
          <div className="w-full max-w-4xl flex-1">
            <h3 className="text-xl font-cinzel text-white/90 text-center mb-6">
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
