
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Stars, TreePine, Mountain } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-warm-gradient relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 text-lumi-wood/20">
          <TreePine size={120} />
        </div>
        <div className="absolute top-20 right-20 text-lumi-aqua/20">
          <Mountain size={100} />
        </div>
        <div className="absolute bottom-20 left-1/4 text-lumi-sage/20">
          <TreePine size={80} />
        </div>
        <div className="absolute top-1/4 right-1/3 text-lumi-wood/10">
          <Stars size={60} />
        </div>
        <div className="absolute bottom-1/3 right-10 text-lumi-aqua/15">
          <Stars size={40} />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <div className="animate-fade-in">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-6xl md:text-8xl font-light text-lumi-wood mb-4 tracking-tight">
              lumi
            </h1>
            <p className="text-xl md:text-2xl text-lumi-wood/80 font-light">
              take a moment for yourself, daily
            </p>
          </div>

          {/* Hero Card */}
          <Card className="max-w-md mx-auto p-8 bg-white/80 backdrop-blur-sm border-0 shadow-2xl mb-8">
            <div className="space-y-6">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-forest-gradient rounded-full flex items-center justify-center">
                  <Stars className="w-8 h-8 text-white" />
                </div>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-2xl font-medium text-lumi-wood">
                  your daily companion for reflection
                </h2>
                <p className="text-lumi-wood/70 leading-relaxed">
                  lumi calls you every day, listens to your thoughts, and helps you build a lasting journaling practice through gentle AI guidance.
                </p>
              </div>

              <div className="space-y-3 pt-4">
                <Button 
                  className="w-full bg-lumi-wood hover:bg-lumi-wood/90 text-white py-3 text-lg font-medium rounded-xl"
                  onClick={() => navigate('/journal')}
                >
                  start your journey
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full border-lumi-aqua text-lumi-aqua hover:bg-lumi-aqua/10 py-3 text-lg font-medium rounded-xl"
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
              <div className="w-12 h-12 bg-lumi-aqua/20 rounded-full flex items-center justify-center mx-auto">
                <Stars className="w-6 h-6 text-lumi-aqua" />
              </div>
              <h3 className="font-medium text-lumi-wood">daily calls</h3>
              <p className="text-sm text-lumi-wood/70">lumi calls you at your chosen time</p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-lumi-wood/20 rounded-full flex items-center justify-center mx-auto">
                <TreePine className="w-6 h-6 text-lumi-wood" />
              </div>
              <h3 className="font-medium text-lumi-wood">ai guidance</h3>
              <p className="text-sm text-lumi-wood/70">personalized prompts that evolve with you</p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-lumi-sage/20 rounded-full flex items-center justify-center mx-auto">
                <Mountain className="w-6 h-6 text-lumi-sage" />
              </div>
              <h3 className="font-medium text-lumi-wood">lasting habits</h3>
              <p className="text-sm text-lumi-wood/70">build reflection into your daily routine</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
