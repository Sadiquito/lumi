
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mic } from 'lucide-react';
import ListeningModal from './ListeningModal';

const StartConversationSection: React.FC = () => {
  const [isListening, setIsListening] = useState(false);

  const handleStartConversation = () => {
    console.log('Starting conversation...');
    setIsListening(true);
    // TODO: Implement conversation start logic
  };

  const handleStopListening = () => {
    setIsListening(false);
  };

  return (
    <>
      <div className="text-center mb-12">
        <Button
          onClick={handleStartConversation}
          className="bg-lumi-sunset-coral hover:bg-lumi-sunset-coral/90 text-white py-6 px-12 text-xl font-medium rounded-2xl transition-all duration-200 hover:scale-105 shadow-lg"
          size="lg"
        >
          <Mic className="w-6 h-6 mr-3" />
          Start Conversation
        </Button>
      </div>

      <ListeningModal 
        isOpen={isListening} 
        onClose={handleStopListening}
      />
    </>
  );
};

export default StartConversationSection;
