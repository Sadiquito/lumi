
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, Check, Star, Clock, AlertTriangle, Crown, Zap, Shield, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import TrialCountdown from "@/components/TrialCountdown";

const Subscription = () => {
  const navigate = useNavigate();
  const { trialStatus } = useAuth();
  const { isTrialExpired, daysRemaining, hasPremiumAccess, subscriptionStatus } = trialStatus;

  const features = [
    { icon: <Heart className="w-5 h-5" />, text: "daily ai-powered calls at your chosen time" },
    { icon: <Zap className="w-5 h-5" />, text: "personalized conversation prompts that evolve with you" },
    { icon: <Clock className="w-5 h-5" />, text: "unlimited voice journaling sessions" },
    { icon: <Shield className="w-5 h-5" />, text: "transcript storage and export (pdf/excel)" },
    { icon: <Check className="w-5 h-5" />, text: "missed call retry system" },
    { icon: <Crown className="w-5 h-5" />, text: "whatsapp and phone call options" },
    { icon: <Shield className="w-5 h-5" />, text: "secure, private conversations" }
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
              <Crown className="w-12 h-12 text-lumi-aquamarine mx-auto mb-4" />
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

  // Determine urgency level and messaging
  const getUrgencyLevel = () => {
    if (isTrialExpired) return 'expired';
    if (daysRemaining <= 1) return 'critical';
    if (daysRemaining <= 3) return 'urgent';
    return 'normal';
  };

  const urgencyLevel = getUrgencyLevel();

  const getStatusMessage = () => {
    if (isTrialExpired) {
      return {
        title: "your trial has expired",
        description: "upgrade now to continue your journey of reflection and growth",
        ctaText: "restore full access"
      };
    }
    if (daysRemaining <= 1) {
      return {
        title: `last ${daysRemaining === 1 ? 'day' : 'hours'} of your trial!`,
        description: "don't lose access to your personal ai companion",
        ctaText: "secure your access"
      };
    }
    if (daysRemaining <= 3) {
      return {
        title: "trial ending soon",
        description: `only ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} left - upgrade to keep your progress`,
        ctaText: "continue your journey"
      };
    }
    return {
      title: "invest in your daily reflection practice",
      description: "lumi is designed to be your long-term companion for building lasting journaling habits",
      ctaText: "start my annual journey"
    };
  };

  const statusMessage = getStatusMessage();

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
          <h1 className="text-2xl font-title font-medium text-white tracking-wide">
            {isTrialExpired ? 'continue with lumi' : 'join lumi'}
          </h1>
        </div>
        <TrialCountdown variant="full" />
      </div>

      <div className="max-w-2xl mx-auto px-4 md:px-6 pb-8">
        {/* Trial Status Alert */}
        {urgencyLevel === 'expired' && (
          <Alert className="bg-red-500/20 backdrop-blur-sm border-red-500/50 shadow-lg mb-6">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            <AlertTitle className="text-white font-medium">Trial Expired</AlertTitle>
            <AlertDescription className="text-white/80">
              Your 7-day free trial has ended. Upgrade now to restore access to all your conversations and continue your journey.
            </AlertDescription>
          </Alert>
        )}

        {urgencyLevel === 'critical' && (
          <Alert className="bg-lumi-sunset-coral/30 backdrop-blur-sm border-lumi-sunset-coral/60 shadow-lg mb-6 animate-pulse">
            <Clock className="w-6 h-6 text-lumi-sunset-coral" />
            <AlertTitle className="text-white font-medium">⚡ Last Day of Trial!</AlertTitle>
            <AlertDescription className="text-white/80">
              Your trial expires tomorrow. Don't lose access to your personal AI companion and reflection progress.
            </AlertDescription>
          </Alert>
        )}

        {urgencyLevel === 'urgent' && (
          <Alert className="bg-lumi-sunset-coral/20 backdrop-blur-sm border-lumi-sunset-coral/40 shadow-lg mb-6">
            <Clock className="w-6 h-6 text-lumi-sunset-coral" />
            <AlertTitle className="text-white font-medium">Trial Ending Soon</AlertTitle>
            <AlertDescription className="text-white/80">
              Only {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} left in your trial. Upgrade now to keep your progress and continue building your reflection habit.
            </AlertDescription>
          </Alert>
        )}

        {/* Main Heading */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-title text-white mb-4 tracking-wide">
            {statusMessage.title}
          </h2>
          <p className="text-white/70 leading-relaxed font-sans text-lg">
            {statusMessage.description}
          </p>
          
          {/* Benefits Preview */}
          {urgencyLevel !== 'normal' && (
            <div className="mt-6 p-4 bg-lumi-aquamarine/10 backdrop-blur-sm border border-lumi-aquamarine/20 rounded-lg">
              <p className="text-lumi-aquamarine text-sm font-medium">
                ✨ Don't lose access to your personalized AI companion, conversation history, and reflection insights
              </p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Annual Plan - Recommended */}
          <Card className="bg-lumi-charcoal/80 backdrop-blur-sm border-2 border-lumi-aquamarine shadow-lg relative overflow-hidden transform hover:scale-[1.02] transition-transform">
            <div className="absolute top-0 right-0">
              <Badge className="bg-lumi-aquamarine text-white rounded-none rounded-bl-lg px-3 py-1 font-sans">
                <Star className="w-3 h-3 mr-1" />
                most popular
              </Badge>
            </div>
            <CardHeader>
              <CardTitle className="text-white text-xl font-title font-medium tracking-wide flex items-center">
                <Crown className="w-5 h-5 mr-2 text-lumi-aquamarine" />
                annual commitment
              </CardTitle>
              <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-title text-white">$333</span>
                <span className="text-white/60 font-sans">/year</span>
              </div>
              <div className="flex items-center space-x-2">
                <p className="text-sm text-lumi-aquamarine font-medium font-sans">save $63 compared to monthly</p>
                <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                  16% off
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-lumi-aquamarine hover:bg-lumi-aquamarine/90 text-white py-4 text-lg font-medium rounded-xl mb-4 font-sans shadow-lg hover:shadow-xl transition-shadow">
                <Crown className="w-5 h-5 mr-2" />
                {statusMessage.ctaText}
              </Button>
              <p className="text-sm text-white/60 text-center font-sans">
                $27.75/month • commit to a full year of growth
              </p>
              {urgencyLevel !== 'normal' && (
                <p className="text-xs text-lumi-aquamarine text-center mt-2 font-medium">
                  immediate access restoration
                </p>
              )}
            </CardContent>
          </Card>

          {/* Monthly Plan */}
          <Card className="bg-lumi-charcoal/80 backdrop-blur-sm border-lumi-sunset-coral/20 shadow-lg hover:border-lumi-sunset-coral/40 transition-colors">
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
                className="w-full border-lumi-sunset-coral text-lumi-sunset-coral hover:bg-lumi-sunset-coral/10 py-4 text-lg font-medium rounded-xl mb-4 font-sans"
              >
                {isTrialExpired ? 'continue monthly' : 'try monthly first'}
              </Button>
              <p className="text-sm text-white/60 text-center font-sans">
                cancel anytime • perfect for getting started
              </p>
            </CardContent>
          </Card>

          {/* Enhanced Features List */}
          <Card className="bg-lumi-charcoal/80 backdrop-blur-sm border-lumi-sunset-coral/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-white text-lg font-title font-medium tracking-wide flex items-center">
                <Zap className="w-5 h-5 mr-2 text-lumi-aquamarine" />
                what you get with lumi premium
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                    <div className="text-lumi-aquamarine mt-0.5 flex-shrink-0">
                      {feature.icon}
                    </div>
                    <span className="text-white/80 font-sans">{feature.text}</span>
                  </div>
                ))}
              </div>
              
              {/* Social Proof */}
              <div className="mt-6 pt-4 border-t border-white/10">
                <p className="text-white/60 text-sm text-center italic">
                  "lumi has transformed my daily reflection practice. i look forward to our conversations every day." - sarah k.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Trust Signals & Additional Info */}
          <div className="text-center space-y-4 text-sm text-white/60">
            <div className="flex items-center justify-center space-x-4 text-xs">
              <div className="flex items-center space-x-1">
                <Shield className="w-4 h-4 text-lumi-aquamarine" />
                <span>secure payments</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4 text-lumi-aquamarine" />
                <span>cancel anytime</span>
              </div>
              <div className="flex items-center space-x-1">
                <Heart className="w-4 h-4 text-lumi-aquamarine" />
                <span>privacy first</span>
              </div>
            </div>
            <p className="font-sans">
              secure payments powered by stripe • your conversations are private and never shared
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
