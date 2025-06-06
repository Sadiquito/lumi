
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-cosmic-gradient">
      <div className="flex items-center p-4 md:p-6">
        <Star className="w-8 h-8 text-lumi-aquamarine mr-2" />
        <h1 className="text-2xl font-title text-white tracking-wide">Lumi</h1>
      </div>

      <div className="max-w-md mx-auto px-4 md:px-6 pb-8 mt-20">
        <Card className="bg-lumi-charcoal/80 backdrop-blur-sm border-lumi-sunset-coral/20 shadow-lg">
          <CardContent className="pt-8 pb-8 text-center">
            <h2 className="text-3xl font-title font-medium text-white mb-4">
              Page Not Found
            </h2>
            <p className="text-white/70 mb-6 font-sans">
              The page you're looking for doesn't exist.
            </p>
            <Button 
              onClick={() => navigate('/')}
              className="bg-lumi-sunset-coral hover:bg-lumi-sunset-coral/90 text-white py-3 px-6 text-lg font-medium rounded-xl font-sans"
            >
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotFound;
