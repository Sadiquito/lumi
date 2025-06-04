
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
      title: "voice-first journaling",
      description: "speak naturally about your day, thoughts, and feelings"
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "empathetic ai companion",
      description: "lumi listens without judgment and responds with care"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "daily consistency",
      description: "build a sustainable reflection practice that grows with you"
    }
  ];

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat relative"
      style={{
        backgroundImage: `url('/lovable-uploads/64e09d9e-4a2f-40b0-8df2-f575927a323c.png')`
      }}
    >
      {/* Dark overlay to maintain readability */}
      <div className="absolute inset-0 bg-black/50"></div>
      
      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center p-4 md:p-6">
          <div className="flex items-center">
            <Star className="w-8 h-8 text-lumi-aquamarine mr-2" />
            <h1 className="text-2xl font-medium text-white">lumi</h1>
          </div>
          <Button 
            onClick={() => navigate('/auth')}
            className="bg-lumi-sunset-coral hover:bg-lumi-sunset-coral/90 text-white"
          >
            get started
          </Button>
        </div>

        <div className="max-w-4xl mx-auto px-4 md:px-6 pb-8">
          {/* Hero Section */}
          <div className="text-center mb-16 mt-8">
            <h2 className="text-4xl md:text-6xl font-light text-white mb-6 leading-tight">
              your daily
              <br />
              <span className="text-lumi-aquamarine">reflection companion</span>
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
              lumi is an ai-powered journaling companion that listens to your thoughts, 
              asks meaningful questions, and helps you build a consistent reflection practice.
            </p>
            <Button 
              onClick={() => navigate('/auth')}
              className="bg-lumi-sunset-coral hover:bg-lumi-sunset-coral/90 text-white py-4 px-8 text-lg font-medium rounded-xl"
            >
              start your journey
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => (
              <Card key={index} className="bg-lumi-charcoal/90 backdrop-blur-sm border-lumi-sunset-coral/20 shadow-lg">
                <CardHeader>
                  <div className="text-lumi-aquamarine mb-3">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-white text-lg">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white/80">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CTA Section */}
          <Card className="bg-lumi-charcoal/90 backdrop-blur-sm border-lumi-sunset-coral/20 shadow-lg">
            <CardContent className="pt-8 pb-8 text-center">
              <h3 className="text-2xl font-light text-white mb-4">
                ready to begin?
              </h3>
              <p className="text-white/80 mb-6 max-w-md mx-auto">
                join thousands who are building meaningful reflection practices with lumi.
              </p>
              <Button 
                onClick={() => navigate('/auth')}
                className="bg-lumi-sunset-coral hover:bg-lumi-sunset-coral/90 text-white py-3 px-6 text-lg font-medium rounded-xl"
              >
                create your account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Landing;
