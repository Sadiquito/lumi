
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Check, Star, Clock, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTrialStatus } from "@/hooks/useTrialStatus";
import TrialCountdown from "@/components/TrialCountdown";

const Subscription = () => {
  const navigate = useNavigate();
  const { isTrialExpired, daysRemaining, hasPremiumAccess } = useTrialStatus();

  const features = [
    "daily ai-powered calls at your chosen time",
    "personalized conversation prompts that evolve with you",
    "unlimited voice journaling sessions", 
    "transcript storage and export (pdf/excel)",
    "missed call retry system",
    "whatsapp and phone call options",
    "secure, private conversations"
  ];

  // Don't show subscription page if user already has premium access
  if (hasPremiumAccess && !isTrialExpired) {
    return (
      <div className="min-h-screen bg-cosmic-gradient">
        <div className="flex items-center p-4 md:p-6">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/journal')}
            className="text-white hover:bg-white/10 mr-3"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-title font-medium text-white tracking-wide">subscription</h1>
        </div>
        
        <div className="max-w-2xl mx-auto px-4 md:px-6 pb-8 text-center">
          <Card className="bg-lumi-charcoal/80 backdrop-blur-sm border-lumi-aquamarine shadow-lg">
            <CardContent className="p-8">
              <h2 className="text-2xl font-title text-white mb-4">you're all set!</h2>
              <p className="text-white/70 mb-6">
                you have access to all lumi premium features. enjoy your journey of reflection and growth.
              </p>
              <Button 
                onClick={() => navigate('/journal')}
                className="bg-lumi-aquamarine hover:bg-lumi-aquamarine/90 text-white"
              >
                back to journal
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cosmic-gradient">
      {/* Header */}
      <div className="flex items-center justify-between p-4 md:p-6">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/journal')}
            className="text-white hover:bg-white/10 mr-3"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-title font-medium text-white tracking-wide">join lumi</h1>
        </div>
        <TrialCountdown variant="full" />
      </div>

      <div className="max-w-2xl mx-auto px-4 md:px-6 pb-8">
        {/* Trial Status Banner */}
        {isTrialExpired ? (
          <Card className="bg-red-500/20 backdrop-blur-sm border-red-500/30 shadow-lg mb-6">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-6 h-6 text-red-400" />
                <div>
                  <h3 className="text-white font-medium">your trial has expired</h3>
                  <p className="text-white/70 text-sm">
                    upgrade now to continue accessing all lumi features
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : daysRemaining <= 3 ? (
          <Card className="bg-lumi-sunset-coral/20 backdrop-blur-sm border-lumi-sunset-coral/30 shadow-lg mb-6">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Clock className="w-6 h-6 text-lumi-sunset-coral" />
                <div>
                  <h3 className="text-white font-medium">trial ending soon</h3>
                  <p className="text-white/70 text-sm">
                    only {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} left - upgrade to keep your progress
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}

        <div className="text-center mb-8">
          <h2 className="text-3xl font-title text-white mb-4 tracking-wide">
            {isTrialExpired ? 'continue your journey' : 'invest in your daily reflection practice'}
          </h2>
          <p className="text-white/70 leading-relaxed font-sans">
            {isTrialExpired 
              ? 'your trial has ended, but your journey toward better mental health continues with lumi premium.'
              : 'lumi is designed to be your long-term companion for building lasting journaling habits. choose the plan that works best for your commitment to growth.'
            }
          </p>
        </div>

        <div className="space-y-6">
          {/* Annual Plan - Recommended */}
          <Card className="bg-lumi-charcoal/80 backdrop-blur-sm border-2 border-lumi-aquamarine shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0">
              <Badge className="bg-lumi-aquamarine text-white rounded-none rounded-bl-lg px-3 py-1 font-sans">
                <Star className="w-3 h-3 mr-1" />
                most popular
              </Badge>
            </div>
            <CardHeader>
              <CardTitle className="text-white text-xl font-title font-medium tracking-wide">annual commitment</CardTitle>
              <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-title text-white">$333</span>
                <span className="text-white/60 font-sans">/year</span>
              </div>
              <p className="text-sm text-lumi-aquamarine font-medium font-sans">save $63 compared to monthly</p>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-lumi-aquamarine hover:bg-lumi-aquamarine/90 text-white py-3 text-lg font-medium rounded-xl mb-4 font-sans">
                {isTrialExpired ? 'restore full access' : 'start my annual journey'}
              </Button>
              <p className="text-sm text-white/60 text-center font-sans">
                $27.75/month • commit to a full year of growth
              </p>
            </CardContent>
          </Card>

          {/* Monthly Plan */}
          <Card className="bg-lumi-charcoal/80 backdrop-blur-sm border-lumi-sunset-coral/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-white text-xl font-title font-medium tracking-wide">monthly flexibility</CardTitle>
              <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-title text-white">$33</span>
                <span className="text-white/60 font-sans">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline"
                className="w-full border-lumi-sunset-coral text-lumi-sunset-coral hover:bg-lumi-sunset-coral/10 py-3 text-lg font-medium rounded-xl mb-4 font-sans"
              >
                {isTrialExpired ? 'continue monthly' : 'try monthly first'}
              </Button>
              <p className="text-sm text-white/60 text-center font-sans">
                cancel anytime • perfect for getting started
              </p>
            </CardContent>
          </Card>

          {/* Features List */}
          <Card className="bg-lumi-charcoal/80 backdrop-blur-sm border-lumi-sunset-coral/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-white text-lg font-title font-medium tracking-wide">what you get with lumi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-lumi-aquamarine mt-0.5 flex-shrink-0" />
                    <span className="text-white/80 font-sans">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <div className="text-center space-y-4 text-sm text-white/60">
            <p className="font-sans">
              secure payments powered by stripe • cancel anytime • 
              <br />
              your conversations are private and never shared
            </p>
            <Button 
              variant="link" 
              className="text-lumi-aquamarine hover:text-lumi-aquamarine/80 p-0 h-auto font-sans"
            >
              manage billing →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
