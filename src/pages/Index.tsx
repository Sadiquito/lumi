
import { Button } from "@/components/ui/button";
import { Mic, Heart, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/lovable-uploads/d9306ff2-3fe6-4446-9e42-41d493513f0e.png')`
        }}
      >
        {/* Overlay for text readability */}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 text-center">
        {/* Main Hero Section */}
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Logo/Title */}
          <div className="space-y-2 animate-float">
            <h1 className="text-6xl md:text-7xl font-light text-white tracking-wider">
              LUMI
            </h1>
            <div className="space-y-1">
              <p className="text-xl md:text-2xl text-white/90 font-light">
                PERSONAL
              </p>
              <p className="text-xl md:text-2xl text-lumi-lavender font-medium">
                SUPERINTELLIGENCE
              </p>
            </div>
          </div>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-white/80 font-light max-w-xl mx-auto leading-relaxed">
            Your AI companion for daily reflection through natural conversation
          </p>

          {/* CTA Button */}
          <div className="pt-4">
            <Button
              onClick={() => navigate('/conversation')}
              size="lg"
              className="bg-white/90 text-lumi-cosmic hover:bg-white transition-all duration-300 px-8 py-4 text-lg font-medium rounded-full backdrop-blur-sm border border-white/20"
            >
              Continue with Google
            </Button>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 w-full max-w-4xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            {/* Voice First */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-lumi-lavender/20 flex items-center justify-center">
                  <Mic className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-white font-medium mb-2">Voice-First, Forever</h3>
              <p className="text-white/70 text-sm">
                Writing sucks. Just speak your mind.
              </p>
            </div>

            {/* Thoughtful Guidance */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-lumi-lavender/20 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-white font-medium mb-2">Thoughtful Guidance</h3>
              <p className="text-white/70 text-sm">
                Let Lumi guide you when you don't know what to say
              </p>
            </div>

            {/* Day In, Day Out */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-lumi-lavender/20 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-white font-medium mb-2">Day In, Day Out</h3>
              <p className="text-white/70 text-sm">
                Build a daily habit that will last until you croak
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
