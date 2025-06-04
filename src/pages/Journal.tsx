
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, Download, FileText, Settings, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Journal = () => {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);

  // Mock data for demonstration
  const todaysAdvice = "remember that small, consistent actions compound over time. your willingness to show up today, even for just a few minutes, is building something meaningful. trust the process.";
  
  const recentTranscripts = [
    {
      id: 1,
      date: "Today, 7:30 AM",
      content: "I've been feeling overwhelmed with work lately. There's just so much on my plate and I don't know where to start.",
      lumiResponse: "It sounds like you're carrying a lot right now. When everything feels overwhelming, sometimes it helps to just pick one small thing and focus on that. What's one thing that would make you feel a little lighter today?"
    },
    {
      id: 2,
      date: "Yesterday, 7:30 AM", 
      content: "I had a really good conversation with my sister yesterday. We talked about childhood memories and I felt so connected to family.",
      lumiResponse: "That's beautiful. Those moments of connection can be so nourishing. What was it about sharing those memories that felt especially meaningful to you?"
    }
  ];

  const handleStartRecording = () => {
    setIsRecording(!isRecording);
    // Future: Implement actual recording logic
  };

  return (
    <div className="min-h-screen bg-cosmic-gradient">
      {/* Header */}
      <div className="flex justify-between items-center p-4 md:p-6">
        <h1 className="text-2xl font-medium text-white">lumi</h1>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/settings')}
            className="text-white hover:bg-white/10"
          >
            <Settings className="w-5 h-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/subscription')}
            className="text-white hover:bg-white/10"
          >
            <Phone className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-6 pb-8">
        {/* Today's Advice */}
        <Card className="mb-8 bg-lumi-charcoal/80 backdrop-blur-sm border-lumi-sunset-coral/20 shadow-lg">
          <CardHeader>
            <CardTitle className="text-white text-lg">my two cents for today</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-white/80 leading-relaxed italic">
              {todaysAdvice}
            </p>
          </CardContent>
        </Card>

        {/* Record Button */}
        <Card className="mb-8 bg-lumi-charcoal/80 backdrop-blur-sm border-lumi-sunset-coral/20 shadow-lg">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Button
                onClick={handleStartRecording}
                className={`w-full py-6 text-xl font-medium rounded-xl transition-all duration-300 ${
                  isRecording 
                    ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                    : 'bg-lumi-sunset-coral hover:bg-lumi-sunset-coral/90 text-white'
                }`}
              >
                <Mic className="w-6 h-6 mr-3" />
                {isRecording ? "speaking... tap to stop" : "let's speak right now"}
              </Button>
              <p className="text-sm text-white/60">
                {isRecording ? "lumi is listening..." : "tap to start your voice journal session"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Export Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Button 
            variant="outline" 
            className="border-lumi-aquamarine text-lumi-aquamarine hover:bg-lumi-aquamarine/10 py-3"
          >
            <Download className="w-4 h-4 mr-2" />
            export pdf
          </Button>
          <Button 
            variant="outline" 
            className="border-lumi-aquamarine text-lumi-aquamarine hover:bg-lumi-aquamarine/10 py-3"
          >
            <FileText className="w-4 h-4 mr-2" />
            export excel
          </Button>
          <Button 
            variant="outline" 
            className="border-lumi-sunset-gold text-lumi-sunset-gold hover:bg-lumi-sunset-gold/10 py-3"
            disabled
          >
            <FileText className="w-4 h-4 mr-2" />
            order journal (soon)
          </Button>
        </div>

        {/* Recent Transcripts */}
        <div className="space-y-6">
          <h2 className="text-xl font-medium text-white">recent conversations</h2>
          
          {recentTranscripts.map((transcript) => (
            <Card key={transcript.id} className="bg-lumi-charcoal/80 backdrop-blur-sm border-lumi-sunset-coral/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-sm text-white/60">{transcript.date}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-white leading-relaxed">
                    "{transcript.content}"
                  </p>
                </div>
                <div className="border-l-2 border-lumi-aquamarine pl-4 space-y-2">
                  <p className="text-sm font-medium text-lumi-aquamarine">lumi:</p>
                  <p className="text-white/80 leading-relaxed italic">
                    {transcript.lumiResponse}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Journal;
