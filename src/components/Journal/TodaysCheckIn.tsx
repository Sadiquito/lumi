
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, MessageCircle } from 'lucide-react';

const TodaysCheckIn: React.FC = () => {
  const handleStartConversation = () => {
    // TODO: Implement conversation start logic in Phase 2
    console.log('Starting conversation...');
  };

  return (
    <Card className="bg-lumi-charcoal/80 backdrop-blur-sm border-lumi-sunset-coral/20 shadow-lg">
      <CardHeader>
        <CardTitle className="text-white text-xl font-title flex items-center">
          <MessageCircle className="w-6 h-6 mr-2 text-lumi-aquamarine" />
          Today's Check-In
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center py-8">
          <div className="mb-6">
            <div className="w-20 h-20 bg-lumi-sunset-coral/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mic className="w-10 h-10 text-lumi-sunset-coral" />
            </div>
            <h3 className="text-white text-lg font-medium mb-2">Ready to reflect?</h3>
            <p className="text-white/70 text-sm max-w-md mx-auto">
              Press the button below to start your conversation with Lumi. Share what's on your mind.
            </p>
          </div>
          
          <Button
            onClick={handleStartConversation}
            className="bg-lumi-sunset-coral hover:bg-lumi-sunset-coral/90 text-white py-4 px-8 text-lg font-medium rounded-xl"
          >
            <Mic className="w-5 h-5 mr-2" />
            Start Conversation
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TodaysCheckIn;
