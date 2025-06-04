
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Stars, Sparkles, Moon, Zap, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-cosmic-gradient relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 text-lumi-sunset-coral/20">
          <Stars size={120} />
        </div>
        <div className="absolute top-20 right-20 text-lumi-aquamarine/20">
          <Moon size={100} />
        </div>
        <div className="absolute bottom-20 left-1/4 text-lumi-sunset-gold/20">
          <Sparkles size={80} />
        </div>
        <div className="absolute top-1/4 right-1/3 text-lumi-sunset-coral/10">
          <Globe size={60} />
        </div>
        <div className="absolute bottom-1/3 right-10 text-lumi-aquamarine/15">
          <Zap size={40} />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <div className="animate-fade-in">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-6xl md:text-8xl font-light text-white mb-4 tracking-tight">
              lumi
            </h1>
            <p className="text-xl md:text-2xl text-white/80 font-light">
              take a moment for yourself, daily
            </p>
          </div>

          {/* Hero Card */}
          <Card className="max-w-md mx-auto p-8 bg-lumi-charcoal/80 backdrop-blur-sm border-lumi-sunset-coral/20 shadow-2xl mb-8">
            <div className="space-y-6">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-sunset-gradient rounded-full flex items-center justify-center">
                  <Stars className="w-8 h-8 text-white" />
                </div>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-2xl font-medium text-white">
                  your daily companion for reflection
                </h2>
                <p className="text-white/70 leading-relaxed">
                  lumi calls you every day, listens to your thoughts, and helps you build a lasting journaling practice through gentle AI guidance.
                </p>
              </div>

              <div className="space-y-3 pt-4">
                <Button 
                  className="w-full bg-lumi-sunset-coral hover:bg-lumi-sunset-coral/90 text-white py-3 text-lg font-medium rounded-xl"
                  onClick={() => navigate('/journal')}
                >
                  start your journey
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full border-lumi-aquamarine text-lumi-aquamarine hover:bg-lumi-aquamarine/10 py-3 text-lg font-medium rounded-xl"
                  onClick={() => navigate('/journal')}
                >
                  sign in
                </Button>
              </div>
            </div>
          </Card>

          {/* Features Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-lumi-aquamarine/20 rounded-full flex items-center justify-center mx-auto">
                <Stars className="w-6 h-6 text-lumi-aquamarine" />
              </div>
              <h3 className="font-medium text-white">daily calls</h3>
              <p className="text-sm text-white/70">lumi calls you at your chosen time</p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-lumi-sunset-coral/20 rounded-full flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6 text-lumi-sunset-coral" />
              </div>
              <h3 className="font-medium text-white">ai guidance</h3>
              <p className="text-sm text-white/70">personalized prompts that evolve with you</p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-lumi-sunset-gold/20 rounded-full flex items-center justify-center mx-auto">
                <Moon className="w-6 h-6 text-lumi-sunset-gold" />
              </div>
              <h3 className="font-medium text-white">lasting habits</h3>
              <p className="text-sm text-white/70">build reflection into your daily routine</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
