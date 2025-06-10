
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Index = () => {
  const { user, loading, signInWithGoogle } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-lumi-cosmic">
        <div className="animate-pulse text-lg text-lumi-starlight">Loading...</div>
      </div>
    );
  }

  // If user is authenticated, redirect to journal page
  if (user) {
    return <Navigate to="/journal" replace />;
  }

  // Landing page for unauthenticated users
  return (
    <div 
      className="min-h-screen relative flex items-center justify-center pt-16 md:pt-0"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=2070&q=80')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-lumi-cosmic/40"></div>
      
      <div className="relative z-10 max-w-4xl mx-auto text-center px-4 space-y-12">
        {/* Main heading */}
        <div className="space-y-6">
          <h1 
            className="text-6xl md:text-7xl font-cinzel font-bold text-lumi-starlight tracking-wider"
            style={{
              textShadow: '0 0 20px rgba(241, 245, 249, 0.5), 0 0 40px rgba(241, 245, 249, 0.3), 0 0 60px rgba(241, 245, 249, 0.2)',
              filter: 'blur(0.5px)'
            }}
          >
            LUMI
          </h1>
          <div className="space-y-2 font-cinzel">
            <h2 className="text-2xl md:text-3xl font-medium text-lumi-starlight">
              PERSONAL
            </h2>
            <h2 className="text-2xl md:text-3xl font-medium text-lumi-lavender">
              SUPERINTELLIGENCE
            </h2>
          </div>
          <p className="text-lg md:text-xl text-lumi-starlight/90 font-crimson font-normal max-w-2xl mx-auto leading-relaxed">
            Your AI companion for daily reflection through natural conversation
          </p>
        </div>

        {/* Sign in button */}
        <div className="space-y-4">
          <Button
            onClick={signInWithGoogle}
            className="bg-lumi-starlight/90 hover:bg-lumi-starlight text-lumi-cosmic px-8 py-3 text-lg font-crimson font-semibold rounded-lg shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl flex items-center gap-3 mx-auto"
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

        {/* Feature highlights with elegant redesigned icons */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-lumi-lavender/20 to-lumi-twilight/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-lumi-lavender/30 shadow-[0_0_20px_rgba(165,180,252,0.15)]">
              <svg className="w-8 h-8 text-lumi-lavender" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                <circle cx="12" cy="12" r="1" fill="currentColor" className="animate-pulse" />
              </svg>
            </div>
            <h3 className="text-lg font-cinzel font-medium text-lumi-starlight">VOICE-FIRST, FOREVER</h3>
            <p className="text-sm text-lumi-starlight/80 font-crimson leading-relaxed">
              Writing sucks. Just speak your mind.
            </p>
          </div>
          
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-lumi-sage/20 to-lumi-twilight/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-lumi-sage/30 shadow-[0_0_20px_rgba(156,163,175,0.15)]">
              <svg className="w-8 h-8 text-lumi-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636" />
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth={1.5} fill="none" />
                <circle cx="12" cy="12" r="1" fill="currentColor" className="animate-glow" />
              </svg>
            </div>
            <h3 className="text-lg font-cinzel font-medium text-lumi-starlight">THOUGHTFUL GUIDANCE</h3>
            <p className="text-sm text-lumi-starlight/80 font-crimson leading-relaxed">
              Let Lumi guide you when you don't know what to say
            </p>
          </div>
          
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-lumi-mist/30 to-lumi-twilight/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-lumi-mist/50 shadow-[0_0_20px_rgba(229,231,235,0.15)]">
              <svg className="w-8 h-8 text-lumi-mist" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth={1.5} />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                <circle cx="12" cy="12" r="2" fill="currentColor" className="animate-pulse" opacity="0.6" />
              </svg>
            </div>
            <h3 className="text-lg font-cinzel font-medium text-lumi-starlight">DAY IN, DAY OUT</h3>
            <p className="text-sm text-lumi-starlight/80 font-crimson leading-relaxed">
              Build a daily habit that will last until you croak
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
