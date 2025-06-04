
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Stars, Sparkles, Moon } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image Container - Ready for your cosmic cabin image */}
      <div className="absolute inset-0 bg-cosmic-gradient">
        {/* This is where your background image will go */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-90"
          style={{
            // backgroundImage: "url('/path-to-your-cosmic-cabin-image.jpg')",
            // Placeholder cosmic gradient until image is ready
            background: 'linear-gradient(135deg, #1a0033 0%, #0d1117 25%, #1a0033 50%, #2d1b4e 75%, #0d1117 100%)'
          }}
        />
        
        {/* Subtle overlay to ensure text readability */}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Main Content - Positioned to use clear space areas */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <div className="animate-fade-in max-w-4xl mx-auto">
          {/* Header - Positioned in top center clear space */}
          <div className="text-center mb-12">
            <h1 className="text-6xl md:text-8xl font-light text-white mb-4 tracking-tight drop-shadow-lg">
              lumi
            </h1>
            <p className="text-xl md:text-2xl text-white/90 font-light drop-shadow-md">
              take a moment for yourself, daily
            </p>
          </div>

          {/* Hero Card - Positioned in middle clear space */}
          <div className="flex justify-center mb-16">
            <Card className="max-w-md w-full p-8 bg-black/40 backdrop-blur-md border-white/20 shadow-2xl">
              <div className="space-y-6">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-lumi-sunset-coral to-lumi-sunset-gold rounded-full flex items-center justify-center shadow-lg">
                    <Stars className="w-8 h-8 text-white" />
                  </div>
                </div>
                
                <div className="space-y-4 text-center">
                  <h2 className="text-2xl font-medium text-white">
                    your daily companion for reflection
                  </h2>
                  <p className="text-white/80 leading-relaxed">
                    lumi calls you every day, listens to your thoughts, and helps you build a lasting journaling practice through gentle AI guidance.
                  </p>
                </div>

                <div className="space-y-3 pt-4">
                  <Button 
                    className="w-full bg-lumi-sunset-coral hover:bg-lumi-sunset-coral/90 text-white py-3 text-lg font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                    onClick={() => navigate('/journal')}
                  >
                    start your journey
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full border-white/30 text-white hover:bg-white/10 backdrop-blur-sm py-3 text-lg font-medium rounded-xl"
                    onClick={() => navigate('/journal')}
                  >
                    sign in
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Features Preview - Positioned below main content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto border border-white/20">
                <Stars className="w-6 h-6 text-lumi-aquamarine" />
              </div>
              <h3 className="font-medium text-white drop-shadow-md">daily calls</h3>
              <p className="text-sm text-white/80 drop-shadow-sm">lumi calls you at your chosen time</p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto border border-white/20">
                <Sparkles className="w-6 h-6 text-lumi-sunset-coral" />
              </div>
              <h3 className="font-medium text-white drop-shadow-md">ai guidance</h3>
              <p className="text-sm text-white/80 drop-shadow-sm">personalized prompts that evolve with you</p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto border border-white/20">
                <Moon className="w-6 h-6 text-lumi-sunset-gold" />
              </div>
              <h3 className="font-medium text-white drop-shadow-md">lasting habits</h3>
              <p className="text-sm text-white/80 drop-shadow-sm">build reflection into your daily routine</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
