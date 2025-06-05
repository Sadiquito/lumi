
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, Star, Heart, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { useEffect } from "react";

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
      className="min-h-screen bg-cover bg-center bg-no-repeat relative"
      style={{
        backgroundImage: `url('/lovable-uploads/64e09d9e-4a2f-40b0-8df2-f575927a323c.png')`
      }}
    >
      {/* Subtle overlay to maintain readability while letting background show through */}
      <div className="absolute inset-0 bg-black/30"></div>
      
      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center p-4 md:p-6">
          <div className="flex items-center">
            <Star className="w-8 h-8 text-lumi-aquamarine mr-2" />
            <h1 className="text-2xl font-title text-white tracking-wide">Lumi</h1>
          </div>
          <Button 
            onClick={() => navigate('/auth')}
            className="bg-lumi-sunset-coral hover:bg-lumi-sunset-coral/90 text-white font-sans"
          >
            Get Started
          </Button>
        </div>

        <div className="max-w-4xl mx-auto px-4 md:px-6 pb-8">
          {/* Large Lumi Title in Center - More fantasy/magical styling */}
          <div className="text-center mb-8 mt-16 relative">
            <h1 className="text-8xl md:text-9xl font-title font-bold tracking-wider relative">
              {/* Mystical glow effect - larger and more prominent */}
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
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-title font-medium text-white mb-6 leading-tight tracking-wide">
              your superintelligent
              <br />
              <span className="text-lumi-aquamarine font-semibold">companion</span>
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed font-sans">
              Write your story, one day at a time.
            </p>
             Reclaim your life, one moment at a time.
            </p>
            <Button 
              onClick={() => navigate('/auth')}
              className="bg-lumi-sunset-coral hover:bg-lumi-sunset-coral/90 text-white py-4 px-8 text-lg font-medium rounded-xl font-sans"
            >
              Step In
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
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

          {/* CTA Section */}
          <Card className="bg-black/10 backdrop-blur-sm border-white/5 shadow-xl">
            <CardContent className="pt-8 pb-8 text-center">
              <h3 className="text-2xl font-title font-medium text-white mb-4 tracking-wide">
                Ready to Begin?
              </h3>
              <p className="text-white/90 mb-6 max-w-md mx-auto font-sans">
                Join thousands who are building meaningful reflection practices with Lumi.
              </p>
              <Button 
                onClick={() => navigate('/auth')}
                className="bg-lumi-sunset-coral hover:bg-lumi-sunset-coral/90 text-white py-3 px-6 text-lg font-medium rounded-xl font-sans"
              >
                Create Your Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Landing;
