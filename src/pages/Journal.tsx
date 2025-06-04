
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, Download, FileText, Settings, Phone, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const Journal = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [todaysAdvice, setTodaysAdvice] = useState("");
  const [recentConversations, setRecentConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch today's advice
      const { data: adviceData } = await supabase
        .from('daily_advice')
        .select('*')
        .eq('user_id', user?.id)
        .gte('created_at', new Date().toISOString().split('T')[0])
        .order('created_at', { ascending: false })
        .limit(1);

      if (adviceData && adviceData.length > 0) {
        setTodaysAdvice(adviceData[0].advice_text);
      } else {
        // Default advice if none exists yet
        setTodaysAdvice("remember that small, consistent actions compound over time. your willingness to show up today, even for just a few minutes, is building something meaningful. trust the process.");
      }

      // Fetch recent conversations
      const { data: conversationsData } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentConversations(conversationsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartRecording = () => {
    setIsRecording(!isRecording);
    // Future: Implement actual recording logic
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cosmic-gradient flex items-center justify-center">
        <div className="text-white text-lg">loading your journal...</div>
      </div>
    );
  }

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
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleSignOut}
            className="text-white hover:bg-white/10"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-6 pb-8">
        {/* Welcome Message */}
        <div className="mb-6 text-center">
          <h2 className="text-xl text-white/90 mb-2">
            welcome back, {user?.user_metadata?.name || 'friend'}
          </h2>
          <p className="text-white/60">
            ready for today's reflection?
          </p>
        </div>

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

        {/* Recent Conversations */}
        <div className="space-y-6">
          <h2 className="text-xl font-medium text-white">recent conversations</h2>
          
          {recentConversations.length === 0 ? (
            <Card className="bg-lumi-charcoal/80 backdrop-blur-sm border-lumi-sunset-coral/20 shadow-lg">
              <CardContent className="pt-6">
                <div className="text-center text-white/60">
                  <p>no conversations yet</p>
                  <p className="text-sm mt-2">start your first reflection session above</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            recentConversations.map((conversation) => (
              <Card key={conversation.id} className="bg-lumi-charcoal/80 backdrop-blur-sm border-lumi-sunset-coral/20 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-sm text-white/60">
                    {formatDate(conversation.created_at)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-white leading-relaxed">
                      "{conversation.transcript}"
                    </p>
                  </div>
                  <div className="border-l-2 border-lumi-aquamarine pl-4 space-y-2">
                    <p className="text-sm font-medium text-lumi-aquamarine">lumi:</p>
                    <p className="text-white/80 leading-relaxed italic">
                      {conversation.ai_response}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Journal;
