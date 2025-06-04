
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Check, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Subscription = () => {
  const navigate = useNavigate();

  const features = [
    "daily ai-powered calls at your chosen time",
    "personalized conversation prompts that evolve with you",
    "unlimited voice journaling sessions", 
    "transcript storage and export (pdf/excel)",
    "missed call retry system",
    "whatsapp and phone call options",
    "secure, private conversations"
  ];

  return (
    <div className="min-h-screen bg-warm-gradient">
      {/* Header */}
      <div className="flex items-center p-4 md:p-6">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate('/journal')}
          className="text-lumi-wood hover:bg-lumi-wood/10 mr-3"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-medium text-lumi-wood">join lumi</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 md:px-6 pb-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-light text-lumi-wood mb-4">
            invest in your daily reflection practice
          </h2>
          <p className="text-lumi-wood/70 leading-relaxed">
            lumi is designed to be your long-term companion for building lasting journaling habits. 
            choose the plan that works best for your commitment to growth.
          </p>
        </div>

        <div className="space-y-6">
          {/* Annual Plan - Recommended */}
          <Card className="bg-white/80 backdrop-blur-sm border-2 border-lumi-aqua shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0">
              <Badge className="bg-lumi-aqua text-white rounded-none rounded-bl-lg px-3 py-1">
                <Star className="w-3 h-3 mr-1" />
                most popular
              </Badge>
            </div>
            <CardHeader>
              <CardTitle className="text-lumi-wood text-xl">annual commitment</CardTitle>
              <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-light text-lumi-wood">$333</span>
                <span className="text-lumi-wood/60">/year</span>
              </div>
              <p className="text-sm text-lumi-aqua font-medium">save $63 compared to monthly</p>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-lumi-aqua hover:bg-lumi-aqua/90 text-white py-3 text-lg font-medium rounded-xl mb-4">
                start my annual journey
              </Button>
              <p className="text-sm text-lumi-wood/60 text-center">
                $27.75/month • commit to a full year of growth
              </p>
            </CardContent>
          </Card>

          {/* Monthly Plan */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lumi-wood text-xl">monthly flexibility</CardTitle>
              <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-light text-lumi-wood">$33</span>
                <span className="text-lumi-wood/60">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline"
                className="w-full border-lumi-wood text-lumi-wood hover:bg-lumi-wood/10 py-3 text-lg font-medium rounded-xl mb-4"
              >
                try monthly first
              </Button>
              <p className="text-sm text-lumi-wood/60 text-center">
                cancel anytime • perfect for getting started
              </p>
            </CardContent>
          </Card>

          {/* Features List */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lumi-wood text-lg">what you get with lumi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-lumi-aqua mt-0.5 flex-shrink-0" />
                    <span className="text-lumi-wood/80">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <div className="text-center space-y-4 text-sm text-lumi-wood/60">
            <p>
              secure payments powered by stripe • cancel anytime • 
              <br />
              your conversations are private and never shared
            </p>
            <Button 
              variant="link" 
              className="text-lumi-aqua hover:text-lumi-aqua/80 p-0 h-auto"
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
