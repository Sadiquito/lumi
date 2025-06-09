
import { Button } from "@/components/ui/button";
import { Mic, MicOff, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Conversation = () => {
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const handleStartConversation = () => {
    setHasStarted(true);
    setIsListening(true);
    // Here we would integrate with ElevenLabs and audio capture
    console.log("Starting conversation...");
  };

  const toggleListening = () => {
    setIsListening(!isListening);
    // Here we would handle microphone toggle
    console.log(isListening ? "Stopping microphone" : "Starting microphone");
  };

  return (
    <div className="min-h-screen bg-lumi-cosmic text-white flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-lg font-medium">Conversation</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/journal')}
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            Journal
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="max-w-md mx-auto text-center space-y-8">
          {!hasStarted ? (
            <>
              {/* Initial State */}
              <div className="space-y-6">
                <div className="w-32 h-32 mx-auto bg-lumi-lavender/20 rounded-full flex items-center justify-center animate-glow">
                  <Mic className="w-16 h-16 text-lumi-lavender" />
                </div>
                <div className="space-y-4">
                  <h2 className="text-2xl font-light">Ready to begin?</h2>
                  <p className="text-white/70 leading-relaxed">
                    Lumi will speak first and guide you through a gentle conversation about whatever is on your mind.
                  </p>
                </div>
                <Button
                  onClick={handleStartConversation}
                  size="lg"
                  className="bg-lumi-lavender hover:bg-lumi-lavender/90 text-lumi-cosmic px-8 py-4 rounded-full font-medium"
                >
                  Start Conversation
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Active Conversation State */}
              <div className="space-y-6">
                <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center transition-all duration-300 ${
                  isListening ? 'bg-lumi-lavender/30 animate-pulse' : 'bg-white/10'
                }`}>
                  {isListening ? (
                    <Mic className="w-16 h-16 text-lumi-lavender" />
                  ) : (
                    <MicOff className="w-16 h-16 text-white/50" />
                  )}
                </div>
                
                <div className="space-y-4">
                  <h2 className="text-2xl font-light">
                    {isListening ? "I'm listening..." : "Lumi is speaking"}
                  </h2>
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                    <p className="text-white/80 italic text-lg leading-relaxed">
                      "Hello there. I'm glad you decided to spend some time with me today. 
                      Would you like to share what's been on your mind lately, or would you 
                      prefer if I offered you a gentle prompt to get started?"
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={toggleListening}
                    variant={isListening ? "destructive" : "default"}
                    className={`flex-1 py-3 rounded-full font-medium ${
                      isListening 
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30' 
                        : 'bg-lumi-lavender hover:bg-lumi-lavender/90 text-lumi-cosmic'
                    }`}
                  >
                    {isListening ? 'Stop' : 'Speak'}
                  </Button>
                  <Button
                    onClick={() => navigate('/journal')}
                    variant="outline"
                    className="px-6 py-3 rounded-full font-medium border-white/20 text-white/70 hover:bg-white/10 hover:text-white"
                  >
                    Finish & Save
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Conversation;
