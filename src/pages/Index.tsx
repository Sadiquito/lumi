
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Index = () => {
  const { user, loading, signInWithGoogle } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-pulse text-lg text-white">Loading...</div>
      </div>
    );
  }

  // If user is authenticated, redirect to conversation page
  if (user) {
    return <Navigate to="/conversation" replace />;
  }

  // Landing page for unauthenticated users
  return (
    <div 
      className="min-h-screen relative flex items-center justify-center"
      style={{
        backgroundImage: `url('/lovable-uploads/8c8842f2-3e9e-4b69-9310-31278ea82e3b.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/30"></div>
      
      <div className="relative z-10 max-w-4xl mx-auto text-center px-4 space-y-12">
        {/* Main heading */}
        <div className="space-y-6">
          <h1 
            className="text-6xl md:text-8xl font-cinzel font-medium text-white tracking-wider"
            style={{
              textShadow: '0 0 20px rgba(255, 255, 255, 0.5), 0 0 40px rgba(255, 255, 255, 0.3), 0 0 60px rgba(255, 255, 255, 0.2)',
              filter: 'blur(0.5px)'
            }}
          >
            LUMI
          </h1>
          <div className="space-y-2 font-cinzel">
            <h2 className="text-2xl md:text-3xl font-medium text-white">
              PERSONAL
            </h2>
            <h2 className="text-2xl md:text-3xl font-medium text-cyan-300">
              SUPERINTELLIGENCE
            </h2>
          </div>
          <p className="text-lg md:text-xl text-white/90 font-crimson font-normal max-w-2xl mx-auto leading-relaxed">
            Your AI companion for daily reflection through natural conversation
          </p>
        </div>

        {/* Sign in button */}
        <div className="space-y-4">
          <Button
            onClick={signInWithGoogle}
            className="bg-white/90 hover:bg-white text-gray-800 px-8 py-3 text-lg font-crimson font-semibold rounded-lg shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl flex items-center gap-3 mx-auto"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>
        </div>

        {/* Feature highlights */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 mx-auto bg-cyan-400/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <div className="text-2xl">🎙️</div>
            </div>
            <h3 className="text-lg font-crimson font-semibold text-white">VOICE-FIRST, FOREVER</h3>
            <p className="text-sm text-white/80 font-crimson leading-relaxed">
              Writing sucks. Just speak your mind.
            </p>
          </div>
          
          <div className="text-center space-y-3">
            <div className="w-12 h-12 mx-auto bg-pink-400/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <div className="text-2xl">💚</div>
            </div>
            <h3 className="text-lg font-crimson font-semibold text-white">THOUGHTFUL GUIDANCE</h3>
            <p className="text-sm text-white/80 font-crimson leading-relaxed">
              Let Lumi guide you when you don't know what to say
            </p>
          </div>
          
          <div className="text-center space-y-3">
            <div className="w-12 h-12 mx-auto bg-orange-400/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <div className="text-2xl">⏰</div>
            </div>
            <h3 className="text-lg font-crimson font-semibold text-white">DAY IN, DAY OUT</h3>
            <p className="text-sm text-white/80 font-crimson leading-relaxed">
              Build a daily habit that will last until you croak
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
