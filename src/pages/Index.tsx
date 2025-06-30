import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import AuthModal from '@/components/AuthModal';

const Index = () => {
  const { user, loading } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
    
  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{
          backgroundColor: 'rgb(15, 23, 42)', // Explicit cosmic color to prevent flash
          backgroundImage: `url('/lovable-uploads/bdc3bda7-af34-486a-bbfa-a981143b27c6.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div 
          className="animate-pulse text-lg"
          style={{ color: '#ffffff' }} // Explicit white to prevent yellow flash
        >
          Loading...
        </div>
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
        backgroundColor: 'rgb(15, 23, 42)', // Explicit background to prevent flash
        backgroundImage: `url('/lovable-uploads/bdc3bda7-af34-486a-bbfa-a981143b27c6.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="relative z-10 max-w-4xl mx-auto text-center px-4 space-y-12">
        {/* Main heading with golden glow */}
        <div className="space-y-6">
          <h1 className="text-6xl md:text-7xl font-cinzel font-bold tracking-wider text-white animate-golden-glow">
            LUMI
          </h1>
          <div className="space-y-2 font-cinzel">
            <h2 className="text-2xl md:text-3xl font-medium text-white">
              PERSONAL
            </h2>
            <h2 className="text-2xl md:text-3xl font-medium text-lumi-cyan">
              SUPERINTELLIGENCE
            </h2>
          </div>
          <p className="text-lg md:text-xl font-crimson font-normal max-w-2xl mx-auto leading-relaxed text-white">
            Your AI companion for daily reflection through natural conversation
          </p>
        </div>

        {/* Enter button */}
        <div className="space-y-4">
          <Button
            onClick={() => setAuthModalOpen(true)}
            className="bg-gradient-to-r from-lumi-cyan/20 to-lumi-lavender/20 hover:from-lumi-cyan/30 hover:to-lumi-lavender/30 text-white border border-lumi-cyan/50 hover:border-lumi-cyan/70 px-12 py-4 text-xl font-cinzel font-bold rounded-full shadow-[0_0_30px_rgba(34,211,238,0.3)] transition-all duration-500 hover:shadow-[0_0_50px_rgba(34,211,238,0.5)] hover:scale-105 backdrop-blur-sm"
          >
            ENTER
          </Button>
        </div>

        {/* Feature highlights with clean cosmic theme */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-lumi-cyan/30 to-lumi-lavender/30 rounded-full flex items-center justify-center backdrop-blur-sm border border-lumi-cyan/40 shadow-[0_0_25px_rgba(34,211,238,0.25)]">
              <svg className="w-8 h-8 text-lumi-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                <circle cx="12" cy="12" r="1" fill="currentColor" className="animate-pulse" />
              </svg>
            </div>
            <h3 className="text-lg font-cinzel font-medium text-white">VOICE-FIRST, FOREVER</h3>
            <p className="text-sm font-crimson leading-relaxed text-white">
              Writing sucks. Just speak your mind.
            </p>
          </div>
          
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-lumi-lavender/30 to-lumi-cyan/30 rounded-full flex items-center justify-center backdrop-blur-sm border border-lumi-lavender/40 shadow-[0_0_25px_rgba(139,92,246,0.25)]">
              <svg className="w-8 h-8 text-lumi-lavender" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636" />
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth={1.5} fill="none" />
                <circle cx="12" cy="12" r="1" fill="currentColor" className="animate-glow" />
              </svg>
            </div>
            <h3 className="text-lg font-cinzel font-medium text-white">THOUGHTFUL GUIDANCE</h3>
            <p className="text-sm font-crimson leading-relaxed text-white">
              Let Lumi guide you when you don't know what to say
            </p>
          </div>
          
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-lumi-nebula/30 to-lumi-cyan/30 rounded-full flex items-center justify-center backdrop-blur-sm border border-lumi-nebula/40 shadow-[0_0_25px_rgba(51,65,85,0.25)]">
              <svg className="w-8 h-8 text-lumi-starlight" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth={1.5} />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                <circle cx="12" cy="12" r="2" fill="currentColor" className="animate-pulse" opacity="0.6" />
              </svg>
            </div>
            <h3 className="text-lg font-cinzel font-medium text-white">DAY IN, DAY OUT</h3>
            <p className="text-sm font-crimson leading-relaxed text-white">
              Build a daily habit that will last until you croak
            </p>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal 
        open={authModalOpen} 
        onOpenChange={setAuthModalOpen}
      />
    </div>
  );
};

export default Index;
