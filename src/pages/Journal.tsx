
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Circle, CircleStop } from 'lucide-react';
import { Link } from 'react-router-dom';

const JournalPage = () => {
  const { user, signOut } = useAuth();
  const [isConversationActive, setIsConversationActive] = useState(false);

  const handleConversationToggle = () => {
    setIsConversationActive(!isConversationActive);
    // Here you would integrate with your conversation logic
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
      
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
        {/* Simple sign out button in top right */}
        <div className="absolute top-6 right-6">
          <Button
            onClick={signOut}
            variant="ghost"
            size="sm"
            className="text-white/80 hover:text-white hover:bg-white/10 font-crimson"
          >
            Sign Out
          </Button>
        </div>

        {/* Central conversation control */}
        <div className="flex flex-col items-center space-y-12">
          {/* Main conversation button */}
          <div className="flex flex-col items-center space-y-6">
            <Button
              onClick={handleConversationToggle}
              className={`
                w-32 h-32 rounded-full transition-all duration-300 
                ${isConversationActive 
                  ? 'bg-red-500/20 hover:bg-red-500/30 border-2 border-red-400 shadow-[0_0_30px_rgba(239,68,68,0.3)]' 
                  : 'bg-cyan-400/20 hover:bg-cyan-400/30 border-2 border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.3)]'
                }
                backdrop-blur-sm
              `}
            >
              {isConversationActive ? (
                <CircleStop className="w-12 h-12 text-red-400" />
              ) : (
                <Circle className="w-12 h-12 text-cyan-400" />
              )}
            </Button>
            
            <div className="text-center">
              <h2 className="text-xl font-cinzel text-white mb-2">
                {isConversationActive ? 'Stop Conversation' : 'Begin Conversation'}
              </h2>
              <p className="text-white/70 font-crimson">
                {isConversationActive ? 'Lumi is listening...' : 'Start your daily reflection with Lumi'}
              </p>
            </div>
          </div>

          {/* Journal entries section */}
          <div className="w-full max-w-2xl space-y-4">
            <h3 className="text-lg font-cinzel text-white/90 text-center mb-6">
              Your Conversations
            </h3>
            
            {/* Empty state for now */}
            <Card className="bg-black/30 border-white/20 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className="text-4xl mb-4">✨</div>
                <h4 className="text-white font-crimson text-lg mb-2">
                  Your journal awaits
                </h4>
                <p className="text-white/70 font-crimson">
                  Each conversation with Lumi will appear here as a reflection entry
                </p>
              </CardContent>
            </Card>
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
