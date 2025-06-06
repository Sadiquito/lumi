import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, Heart, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/SimpleAuthProvider";
import { useEffect } from "react";
import GoogleAuthButton from "@/components/GoogleAuthButton";

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Redirect authenticated users to journal
    if (user) {
      navigate('/journal');
    }
  }, [user, navigate]);

  const features = [
    {
      icon: <Mic className="w-6 h-6" />,
      title: "Voice-First, Forever",
      description: "Writing sucks. Just speak your mind."
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Thoughtful Guidance",
      description: "Let Lumi guide you when you don't know what to say"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Day In, Day Out",
      description: "Build a daily habit that will last until you croak"
    }
  ];

  return (
    <div 
      className="min-h-screen h-screen bg-cover bg-center bg-no-repeat relative overflow-hidden"
      style={{
        backgroundImage: `url('/lovable-uploads/64e09d9e-4a2f-40b0-8df2-f575927a323c.png')`
      }}
    >
      {/* Subtle overlay to maintain readability while letting background show through */}
      <div className="absolute inset-0 bg-black/30"></div>
      
      {/* Content */}
      <div className="relative z-10 h-full">
        <div className="max-w-4xl mx-auto px-4 md:px-6 pb-8 h-full flex flex-col justify-center">
          {/* Large Lumi Title in Center */}
          <div className="text-center mb-8 relative">
            <h1 className="text-6xl md:text-7xl font-title font-bold tracking-wider relative">
              {/* Mystical glow effect */}
              <span className="absolute inset-0 text-lumi-aquamarine/40 blur-2xl transform scale-110">
                lumi
              </span>
              {/* Secondary glow for depth */}
              <span className="absolute inset-0 text-lumi-sunset-gold/30 blur-xl transform scale-105">
                lumi
              </span>
              {/* Main text with warm, inviting gradient */}
              <span className="relative bg-gradient-to-b from-amber-100 via-orange-100 to-rose-100 bg-clip-text text-transparent drop-shadow-lg">
                lumi
              </span>
            </h1>
          </div>

          {/* Hero Section */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-title font-medium text-white mb-6 leading-tight tracking-wide">
              personal
              <br />
              <span className="text-lumi-aquamarine font-semibold">superintelligence hehehe</span>
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed font-sans">
              Your AI companion for daily reflection through natural conversation
            </p>
            
            {/* Google Sign-In Button */}
            <div className="flex justify-center">
              <GoogleAuthButton />
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-black/10 backdrop-blur-sm border-white/5 shadow-xl transition-all duration-300 hover:bg-black/20">
                <CardHeader>
                  <div className="text-lumi-aquamarine mb-3">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-white text-lg font-title font-medium tracking-wide">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white/90 font-sans">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
