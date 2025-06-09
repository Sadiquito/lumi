
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Mic, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Journal = () => {
  const navigate = useNavigate();

  // Sample conversation data (would come from database in real app)
  const conversations = [
    {
      id: 1,
      date: "Today",
      timestamp: "2:34 PM",
      reflection: "You seem to be processing some complex feelings about change and growth.",
      question: "What does 'home' mean to you right now?",
      transcript: [
        { speaker: "lumi", text: "Hello there. I'm glad you decided to spend some time with me today. Would you like to share what's been on your mind lately?" },
        { speaker: "user", text: "I've been thinking a lot about where I want to be in life. Sometimes I feel like I'm drifting." },
        { speaker: "lumi", text: "Drifting can feel unsettling. When you imagine yourself not drifting, what does that look like to you?" },
        { speaker: "user", text: "I guess it would feel more grounded, like I have a sense of purpose and direction." },
        { speaker: "lumi", text: "That sounds like something you deeply value. What small step toward that grounding feels possible for you today?" }
      ]
    },
    {
      id: 2,
      date: "Yesterday",
      timestamp: "7:45 PM",
      reflection: "You expressed gratitude for simple moments of connection.",
      question: "How do you want to nurture the relationships that matter most to you?",
      transcript: [
        { speaker: "lumi", text: "How has your day been treating you?" },
        { speaker: "user", text: "It was actually really nice. I had coffee with an old friend I hadn't seen in months." },
        { speaker: "lumi", text: "That sounds wonderful. What made that time together special for you?" },
        { speaker: "user", text: "Just being able to talk openly without any agenda. We just... connected." }
      ]
    }
  ];

  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/lovable-uploads/b022cb85-9f2a-4184-a505-0796211a6584.png')`
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <div className="p-4 border-b border-white/10 backdrop-blur-sm bg-black/20">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-lg font-medium text-white">Your Journal</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/conversation')}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              <Mic className="w-4 h-4 mr-2" />
              New
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-4 pb-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {conversations.length === 0 ? (
              // Empty State
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto bg-white/10 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm">
                  <MessageCircle className="w-12 h-12 text-white/60" />
                </div>
                <h2 className="text-2xl font-light text-white mb-4">
                  Your conversations will appear here
                </h2>
                <p className="text-white/70 mb-8 max-w-md mx-auto">
                  Start your first conversation with Lumi to begin your journey of reflection and self-discovery.
                </p>
                <Button
                  onClick={() => navigate('/conversation')}
                  size="lg"
                  className="bg-lumi-lavender hover:bg-lumi-lavender/90 text-lumi-cosmic px-8 py-4 rounded-full font-medium"
                >
                  Begin Your First Conversation
                </Button>
              </div>
            ) : (
              // Conversation History
              <div className="space-y-6">
                {conversations.map((conversation) => (
                  <Card key={conversation.id} className="bg-white/10 backdrop-blur-md border-white/20 overflow-hidden">
                    {/* Header */}
                    <div className="p-6 border-b border-white/10">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-medium text-white">{conversation.date}</h3>
                          <p className="text-white/60 text-sm">{conversation.timestamp}</p>
                        </div>
                        <div className="w-8 h-8 bg-lumi-lavender/20 rounded-full flex items-center justify-center">
                          <Mic className="w-4 h-4 text-lumi-lavender" />
                        </div>
                      </div>
                      
                      {/* Lumi's Reflection */}
                      <div className="space-y-3">
                        <div className="bg-lumi-lavender/10 rounded-lg p-4 border border-lumi-lavender/20">
                          <p className="text-white/90 italic text-sm leading-relaxed">
                            "{conversation.reflection}"
                          </p>
                        </div>
                        
                        <div className="bg-lumi-peach/10 rounded-lg p-4 border border-lumi-peach/20">
                          <p className="text-white/80 text-sm font-medium">
                            {conversation.question}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Conversation Transcript */}
                    <div className="p-6 space-y-4">
                      {conversation.transcript.map((message, index) => (
                        <div key={index} className={`flex ${message.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] p-3 rounded-2xl ${
                            message.speaker === 'user' 
                              ? 'bg-white/20 text-white rounded-br-md' 
                              : 'bg-lumi-lavender/20 text-white/90 rounded-bl-md border border-lumi-lavender/30'
                          }`}>
                            <p className="text-sm leading-relaxed">{message.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Journal;
