
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, MicOff, Volume2, User, Bot, Loader2, AlertCircle } from 'lucide-react';
import { useRealtimeConversation } from '@/hooks/useRealtimeConversation';

export const RealtimeConversation: React.FC = () => {
  const {
    isConnected,
    isConnecting,
    isLumiSpeaking,
    transcript,
    error,
    startConversation,
    endConversation
  } = useRealtimeConversation();

  const formatTime = (timestamp: number) => {
    try {
      return new Date(timestamp).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (err) {
      return '--:--:--';
    }
  };

  const getConnectionStatus = () => {
    if (error) return { text: 'Connection Error', color: 'text-red-400' };
    if (isConnecting) return { text: 'Connecting...', color: 'text-yellow-400' };
    if (isConnected) return { text: 'Connected', color: 'text-green-400' };
    return { text: 'Disconnected', color: 'text-gray-400' };
  };

  const connectionStatus = getConnectionStatus();

  // Add error boundary behavior
  if (error && error.includes('React')) {
    return (
      <div className="flex flex-col items-center space-y-6">
        <Card className="border-red-500 bg-red-50/90 backdrop-blur-sm max-w-md">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-red-700 text-sm font-medium">Component Error</p>
                <p className="text-red-600 text-xs mt-1">Please refresh the page</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Connection Control */}
      <div className="flex flex-col items-center space-y-4">
        <Button
          onClick={isConnected ? endConversation : startConversation}
          disabled={isConnecting}
          className={`
            w-24 h-24 rounded-full transition-all duration-300 
            ${isConnected 
              ? 'bg-red-500/20 hover:bg-red-500/30 border-2 border-red-400 shadow-[0_0_30px_rgba(239,68,68,0.3)]' 
              : isConnecting
              ? 'bg-yellow-500/20 border-2 border-yellow-400 shadow-[0_0_30px_rgba(234,179,8,0.3)]'
              : 'bg-cyan-400/20 hover:bg-cyan-400/30 border-2 border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.3)]'
            }
            backdrop-blur-sm
          `}
        >
          {isConnecting ? (
            <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
          ) : isConnected ? (
            <MicOff className="w-8 h-8 text-red-400" />
          ) : (
            <Mic className="w-8 h-8 text-cyan-400" />
          )}
        </Button>
        
        <div className="text-center space-y-2">
          <h2 className="text-lg font-cinzel text-white">
            {isConnecting ? 'Connecting...' : isConnected ? 'End Conversation' : 'Begin Real-time Conversation'}
          </h2>
          <p className="font-crimson text-sm text-white/70">
            {isConnecting 
              ? 'Establishing connection with Lumi...'
              : isConnected 
                ? isLumiSpeaking 
                  ? 'Lumi is speaking...' 
                  : 'Speak naturally - Lumi will respond in real-time'
                : 'Start your voice conversation with Lumi'
            }
          </p>
        </div>
      </div>

      {/* Status Indicators */}
      <div className="flex justify-center space-x-6 text-sm">
        <div className={`flex items-center space-x-2 ${connectionStatus.color}`}>
          <div className={`w-3 h-3 rounded-full ${
            error ? 'bg-red-500' : 
            isConnecting ? 'bg-yellow-500 animate-pulse' : 
            isConnected ? 'bg-green-500 animate-pulse' : 'bg-white/20'
          }`} />
          <span>{connectionStatus.text}</span>
          {error && <AlertCircle className="w-4 h-4" />}
        </div>
        
        <div className={`flex items-center space-x-2 ${isLumiSpeaking ? 'text-orange-400' : 'text-white/40'}`}>
          <div className={`w-3 h-3 rounded-full ${isLumiSpeaking ? 'bg-orange-500 animate-pulse' : 'bg-white/20'}`} />
          <span>Lumi Speaking</span>
          {isLumiSpeaking && <Volume2 className="w-4 h-4 animate-pulse" />}
        </div>
      </div>

      {/* Error Display */}
      {error && !error.includes('React') && (
        <Card className="border-red-500 bg-red-50/90 backdrop-blur-sm max-w-md">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-red-700 text-sm font-medium">Connection Error</p>
                <p className="text-red-600 text-xs mt-1">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Live Transcript */}
      {isConnected && Array.isArray(transcript) && transcript.length > 0 && (
        <Card className="w-full max-w-2xl border-none shadow-sm bg-white/60 backdrop-blur-sm">
          <CardContent className="p-6 space-y-4 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Live Conversation</h3>
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <User className="w-3 h-3" />
                  <span>You</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Bot className="w-3 h-3" />
                  <span>Lumi</span>
                </div>
              </div>
            </div>
            
            {transcript.map((entry) => (
              <div
                key={entry.id}
                className={`flex ${entry.speaker === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
              >
                <div
                  className={`
                    max-w-xs lg:max-w-md px-4 py-3 rounded-lg relative
                    ${entry.speaker === 'user' 
                      ? 'bg-indigo-500 text-white rounded-br-sm' 
                      : 'bg-gray-200 text-gray-900 rounded-bl-sm'
                    }
                  `}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-medium flex items-center">
                      {entry.speaker === 'user' ? (
                        <>
                          <User className="w-3 h-3 mr-1" />
                          You
                        </>
                      ) : (
                        <>
                          <Bot className="w-3 h-3 mr-1" />
                          Lumi
                          {entry.speaker === 'lumi' && isLumiSpeaking && !entry.text.includes('[COMPLETE]') && (
                            <Volume2 className="ml-2 w-3 h-3 text-orange-500 animate-pulse" />
                          )}
                        </>
                      )}
                    </div>
                    <div className="text-xs opacity-75">
                      {formatTime(entry.timestamp)}
                    </div>
                  </div>
                  
                  <div className="text-sm leading-relaxed">
                    {entry.text?.replace(' [COMPLETE]', '') || ''}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
