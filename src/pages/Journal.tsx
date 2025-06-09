
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const JournalPage = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-light text-gray-900">Your Journal</h1>
            <p className="text-gray-600">Conversations with Lumi</p>
          </div>
          <div className="flex gap-2">
            <Link to="/conversation">
              <Button
                variant="outline"
                size="sm"
                className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                New Conversation
              </Button>
            </Link>
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
        </div>

        {/* Journal Entries */}
        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-white/80">
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-4">📖</div>
              <h3 className="text-xl font-light text-gray-900 mb-2">
                Your conversations will appear here
              </h3>
              <p className="text-gray-600 mb-6">
                Each conversation with Lumi will be saved as a journal entry with her reflections and insights.
              </p>
              <Link to="/conversation">
                <Button className="bg-indigo-400 hover:bg-indigo-500 text-white">
                  Start Your First Conversation
                </Button>
              </Link>
            </CardContent>
          </Card>
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
