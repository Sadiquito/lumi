
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Star } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ui/use-toast";

interface PasswordResetProps {
  onBack: () => void;
}

const PasswordReset = ({ onBack }: PasswordResetProps) => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?reset=true`,
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setEmailSent(true);
        toast({
          title: "Password reset email sent",
          description: "Check your email for the password reset link.",
        });
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

  if (emailSent) {
    return (
      <Card className="bg-lumi-charcoal/80 backdrop-blur-sm border-lumi-sunset-coral/20 shadow-lg">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Star className="w-6 h-6 text-lumi-aquamarine mr-2" />
            <CardTitle className="text-white text-xl font-title">lumi</CardTitle>
          </div>
          <p className="text-white/70 font-sans">
            check your email for the reset link
          </p>
        </CardHeader>
        <CardContent>
          <Button
            onClick={onBack}
            className="w-full bg-lumi-sunset-coral hover:bg-lumi-sunset-coral/90 text-white py-3 text-lg font-medium rounded-xl font-sans"
          >
            back to sign in
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-lumi-charcoal/80 backdrop-blur-sm border-lumi-sunset-coral/20 shadow-lg">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-2">
          <Star className="w-6 h-6 text-lumi-aquamarine mr-2" />
          <CardTitle className="text-white text-xl font-title">lumi</CardTitle>
        </div>
        <p className="text-white/70 font-sans">
          reset your password
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-white/80 font-sans">email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-lumi-sunset-coral/20 focus:border-lumi-aquamarine bg-lumi-deep-space/50 text-white placeholder:text-white/40"
              placeholder="your@email.com"
              required
            />
          </div>

          <Button 
            type="submit"
            className="w-full bg-lumi-sunset-coral hover:bg-lumi-sunset-coral/90 text-white py-3 text-lg font-medium rounded-xl font-sans"
            disabled={loading}
          >
            {loading ? "..." : "send reset link"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Button
            variant="link"
            onClick={onBack}
            className="text-lumi-aquamarine hover:text-lumi-aquamarine/80 p-0 h-auto font-sans"
          >
            back to sign in
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PasswordReset;
