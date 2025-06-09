
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const Index = () => {
  const { user, loading, signInWithGoogle } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-orange-50">
        <div className="animate-pulse text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  // If user is authenticated, redirect to conversation page
  if (user) {
    return <Navigate to="/conversation" replace />;
  }

  // Landing page for unauthenticated users
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        {/* Hero Section */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-light text-gray-900 tracking-tight">
            Lumi
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 font-light leading-relaxed">
            Your voice-first companion for daily reflection through natural conversation
          </p>
        </div>

        {/* Value Proposition */}
        <div className="space-y-6">
          <p className="text-lg text-gray-700 leading-relaxed max-w-lg mx-auto">
            Lumi listens with warmth and wisdom, creating a safe space for you to explore your thoughts, feelings, and experiences through meaningful dialogue.
          </p>
          
          <div className="grid md:grid-cols-3 gap-4 mt-8">
            <Card className="border-none shadow-sm bg-white/70">
              <CardContent className="p-6 text-center">
                <div className="text-2xl mb-2">🎙️</div>
                <p className="text-sm text-gray-600">Voice-first journaling that feels like a natural conversation</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-white/70">
              <CardContent className="p-6 text-center">
                <div className="text-2xl mb-2">🧠</div>
                <p className="text-sm text-gray-600">AI that remembers and grows with your personal journey</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-white/70">
              <CardContent className="p-6 text-center">
                <div className="text-2xl mb-2">📖</div>
                <p className="text-sm text-gray-600">Beautiful journal that captures your reflections</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main CTA */}
        <div className="space-y-4">
          <Button
            onClick={signInWithGoogle}
            size="lg"
            className="bg-indigo-400 hover:bg-indigo-500 text-white px-8 py-6 text-lg rounded-2xl shadow-lg transition-all duration-200 hover:shadow-xl"
          >
            Begin Your Conversation
          </Button>
          <p className="text-sm text-gray-500">
            Sign in with Google to start your journey with Lumi
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
