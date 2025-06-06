
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageCircle } from 'lucide-react';

interface ConversationThreadProps {
  conversation: any;
}

const ConversationThread: React.FC<ConversationThreadProps> = ({ conversation }) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Button
          variant="ghost"
          className="text-white/60 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Journal
        </Button>
      </div>

      <Card className="bg-lumi-charcoal/80 backdrop-blur-sm border-lumi-sunset-coral/20 shadow-lg">
        <CardHeader>
          <CardTitle className="text-white text-xl font-title flex items-center">
            <MessageCircle className="w-6 h-6 mr-2 text-lumi-aquamarine" />
            Conversation Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-white/70">
              Conversation view will be implemented in Phase 2 with audio functionality.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConversationThread;
