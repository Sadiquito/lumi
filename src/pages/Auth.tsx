
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ui/use-toast";

const Auth = () => {
  const navigate = useNavigate();
  const { signUp, signIn } = useAuth();
  const { toast } = useToast();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;
      if (isSignUp) {
        result = await signUp(email, password, name);
      } else {
        result = await signIn(email, password);
      }

      if (result.error) {
        toast({
          title: "Error",
          description: result.error.message,
          variant: "destructive",
        });
      } else {
        if (isSignUp) {
          toast({
            title: "Welcome to Lumi!",
            description: "Your account has been created. Please check your email to verify your account.",
          });
        } else {
          toast({
            title: "Welcome back!",
            description: "You've successfully signed in.",
          });
        }
        navigate('/journal');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cosmic-gradient">
      {/* Header */}
      <div className="flex items-center p-4 md:p-6">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate('/')}
          className="text-white hover:bg-white/10 mr-3"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-medium text-white">
          {isSignUp ? "join lumi" : "welcome back"}
        </h1>
      </div>

      <div className="max-w-md mx-auto px-4 md:px-6 pb-8">
        <Card className="bg-lumi-charcoal/80 backdrop-blur-sm border-lumi-sunset-coral/20 shadow-lg">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Star className="w-6 h-6 text-lumi-aquamarine mr-2" />
              <CardTitle className="text-white text-xl">lumi</CardTitle>
            </div>
            <p className="text-white/70">
              {isSignUp 
                ? "start your daily reflection journey" 
                : "continue your reflection practice"
              }
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div className="space-y-2">
                  <Label className="text-white/80">name</Label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border-lumi-sunset-coral/20 focus:border-lumi-aquamarine bg-lumi-deep-space/50 text-white placeholder:text-white/40"
                    placeholder="your name"
                    required
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label className="text-white/80">email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-lumi-sunset-coral/20 focus:border-lumi-aquamarine bg-lumi-deep-space/50 text-white placeholder:text-white/40"
                  placeholder="your@email.com"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-white/80">password</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-lumi-sunset-coral/20 focus:border-lumi-aquamarine bg-lumi-deep-space/50 text-white placeholder:text-white/40"
                  placeholder="your password"
                  required
                  minLength={6}
                />
              </div>

              <Button 
                type="submit"
                className="w-full bg-lumi-sunset-coral hover:bg-lumi-sunset-coral/90 text-white py-3 text-lg font-medium rounded-xl"
                disabled={loading}
              >
                {loading ? "..." : isSignUp ? "create account" : "sign in"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Button
                variant="link"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-lumi-aquamarine hover:text-lumi-aquamarine/80 p-0 h-auto"
              >
                {isSignUp 
                  ? "already have an account? sign in" 
                  : "need an account? sign up"
                }
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
