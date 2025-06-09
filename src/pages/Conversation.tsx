
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, Mic } from 'lucide-react';

const ConversationPage = () => {
  const { user, signOut } = useAuth();

  const handleStartConversation = () => {
    // This will be implemented in the next phase
    console.log('Starting conversation...');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-light text-gray-900">Welcome back</h1>
            <p className="text-gray-600">{user?.email}</p>
          </div>
          <Button
            onClick={signOut}
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-900"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {/* Main Conversation Area */}
        <div className="space-y-8">
          <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-light text-gray-900">
                Ready to talk with Lumi?
              </CardTitle>
              <p className="text-gray-600">
                Share what's on your mind, or let Lumi offer a gentle prompt
              </p>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <Button
                onClick={handleStartConversation}
                size="lg"
                className="bg-indigo-400 hover:bg-indigo-500 text-white px-12 py-8 text-xl rounded-full shadow-lg transition-all duration-200 hover:shadow-xl animate-pulse"
              >
                <Mic className="w-6 h-6 mr-3" />
                Start Conversation
              </Button>
              <p className="text-sm text-gray-500">
                This will begin a hands-free voice conversation
              </p>
            </CardContent>
          </Card>

          {/* Placeholder for future transcript display */}
          <Card className="border-none shadow-sm bg-white/60">
            <CardContent className="p-6">
              <p className="text-center text-gray-500">
                Your conversation will appear here...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const Conversation = () => (
  <ProtectedRoute>
    <ConversationPage />
  </ProtectedRoute>
);

export default Conversation;
