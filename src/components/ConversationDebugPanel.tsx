
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ConversationState, StateTransition, ConversationContext } from '@/types/conversation';
import { format } from 'date-fns';

interface ConversationDebugPanelProps {
  currentState: ConversationState;
  stateHistory: StateTransition[];
  context: ConversationContext;
  onTransition: (state: ConversationState) => void;
  onClearHistory: () => void;
  className?: string;
}

const ConversationDebugPanel: React.FC<ConversationDebugPanelProps> = ({
  currentState,
  stateHistory,
  context,
  onTransition,
  onClearHistory,
  className,
}) => {
  const states: ConversationState[] = ['idle', 'listening', 'processing', 'speaking'];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Conversation Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current State */}
        <div>
          <h4 className="text-xs font-medium mb-2">Current State</h4>
          <Badge variant="outline">{currentState}</Badge>
        </div>

        {/* Manual Transitions */}
        <div>
          <h4 className="text-xs font-medium mb-2">Manual Transitions</h4>
          <div className="flex flex-wrap gap-1">
            {states.map((state) => (
              <Button
                key={state}
                variant="outline"
                size="sm"
                onClick={() => onTransition(state)}
                disabled={state === currentState}
                className="text-xs"
              >
                {state}
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Session Info */}
        <div>
          <h4 className="text-xs font-medium mb-2">Session Info</h4>
          <div className="space-y-1 text-xs text-muted-foreground">
            <div>Session: {context.sessionId}</div>
            <div>Messages: {context.messageCount}</div>
            <div>Duration: {Math.floor(context.totalDuration / 1000)}s</div>
            <div>Started: {format(context.startTime, 'HH:mm:ss')}</div>
            <div>Last Activity: {format(context.lastActivity, 'HH:mm:ss')}</div>
          </div>
        </div>

        <Separator />

        {/* State History */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-medium">State History</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearHistory}
              className="text-xs h-6 px-2"
            >
              Clear
            </Button>
          </div>
          <ScrollArea className="h-32">
            <div className="space-y-1">
              {stateHistory.slice(-10).reverse().map((transition, index) => (
                <div key={index} className="text-xs p-2 bg-muted/30 rounded border">
                  <div className="flex items-center justify-between">
                    <span>{transition.from} → {transition.to}</span>
                    <span className="text-muted-foreground">
                      {transition.duration}ms
                    </span>
                  </div>
                  <div className="text-muted-foreground mt-1">
                    {format(transition.timestamp, 'HH:mm:ss')}
                    {transition.reason && ` (${transition.reason})`}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConversationDebugPanel;
