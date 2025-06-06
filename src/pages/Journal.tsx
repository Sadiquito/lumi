
import React from 'react';
import { useAuth } from '@/components/SimpleAuthProvider';
import ConversationInterface from '@/components/Journal/ConversationInterface';
import UserGreeting from '@/components/Journal/UserGreeting';
import DiscreteSignOutButton from '@/components/Journal/DiscreteSignOutButton';

const Journal: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Please log in to access your journal.</div>;
  }

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat relative"
      style={{
        backgroundImage: `url('/lovable-uploads/1f629700-83cc-4ed8-9a5f-5b47389195de.png')`
      }}
    >
      {/* Subtle overlay to maintain readability */}
      <div className="absolute inset-0 bg-black/20"></div>
      
      {/* Discrete Sign Out Button */}
      <DiscreteSignOutButton />
      
      {/* Content */}
      <div className="relative z-10">
        <main className="px-4 py-16 max-w-4xl mx-auto">
          {/* User Greeting */}
          <UserGreeting />
          
          {/* Conversation Interface */}
          <ConversationInterface />
        </main>
      </div>
    </div>
  );
};

export default Journal;
