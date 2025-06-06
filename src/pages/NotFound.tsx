
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-cosmic-gradient flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md mx-auto px-4">
        <div className="space-y-2">
          <h1 className="text-6xl font-title text-white">404</h1>
          <h2 className="text-2xl font-title text-white/80">page not found</h2>
          <p className="text-white/60 font-sans">
            the page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            onClick={() => navigate('/')}
            className="bg-lumi-aquamarine hover:bg-lumi-aquamarine/90 text-white"
          >
            <Home className="w-4 h-4 mr-2" />
            go home
          </Button>
          <Button 
            onClick={() => navigate(-1)}
            variant="outline"
            className="border-lumi-sunset-coral text-lumi-sunset-coral hover:bg-lumi-sunset-coral/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            go back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
