
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Stars, Moon, TreePine } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Cosmic Cabin Background Image */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/lovable-uploads/64e09d9e-4a2f-40b0-8df2-f575927a323c.png')"
          }}
        />
        
        {/* Subtle overlay to ensure text readability while preserving the image beauty */}
        <div className="absolute inset-0 bg-black/10" />
      </div>

      {/* Main Content - Positioned to use the clear cosmic sky areas */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header - Positioned in the upper cosmic sky area */}
        <div className="flex-1 flex flex-col justify-center items-center px-4 pt-12">
          <div className="animate-fade-in max-w-4xl mx-auto text-center">
            {/* Brand Header - Positioned in clear sky space */}
            <div className="mb-8">
              <h1 className="text-5xl md:text-7xl font-hero font-light text-white mb-3 tracking-tight drop-shadow-2xl">
                Lumi
              </h1>
              <p className="text-lg md:text-xl text-white/95 font-light drop-shadow-lg">
                Take a moment for yourself, daily
              </p>
            </div>

            {/* Hero Card - Positioned to float in the cosmic sky */}
            <div className="flex justify-center mb-12">
              <Card className="max-w-sm w-full p-6 bg-black/30 backdrop-blur-md border-white/20 shadow-2xl">
                <div className="space-y-5">
                  <div className="flex justify-center mb-5">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center shadow-lg">
                      <Stars className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  
                  <div className="space-y-3 text-center">
                    <h2 className="text-xl font-medium text-white">
                      Your cosmic companion for reflection
                    </h2>
                    <p className="text-white/85 leading-relaxed text-sm">
                      Lumi calls you every day, listens to your thoughts, and helps you build a lasting journaling practice through gentle AI guidance.
                    </p>
                  </div>

                  <div className="space-y-3 pt-3">
                    <Button 
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-2.5 text-base font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                      onClick={() => navigate('/journal')}
                    >
                      Start your journey
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full border-white/60 bg-white/10 text-white hover:bg-white/20 hover:border-white/80 backdrop-blur-sm py-2.5 text-base font-medium rounded-xl transition-all duration-200"
                      onClick={() => navigate('/journal')}
                    >
                      Sign in
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Features Preview - Positioned at bottom to complement the forest floor */}
        <div className="px-4 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="text-center space-y-2">
              <div className="w-10 h-10 bg-white/15 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto border border-white/30">
                <Stars className="w-5 h-5 text-amber-300" />
              </div>
              <h3 className="font-medium text-white drop-shadow-lg text-sm">Daily calls</h3>
              <p className="text-xs text-white/80 drop-shadow-sm">Lumi calls you at your chosen time</p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="w-10 h-10 bg-white/15 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto border border-white/30">
                <Moon className="w-5 h-5 text-blue-300" />
              </div>
              <h3 className="font-medium text-white drop-shadow-lg text-sm">AI guidance</h3>
              <p className="text-xs text-white/80 drop-shadow-sm">Personalized prompts that evolve with you</p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="w-10 h-10 bg-white/15 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto border border-white/30">
                <TreePine className="w-5 h-5 text-green-300" />
              </div>
              <h3 className="font-medium text-white drop-shadow-lg text-sm">Lasting habits</h3>
              <p className="text-xs text-white/80 drop-shadow-sm">Build reflection into your daily routine</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
