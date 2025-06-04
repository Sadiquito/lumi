
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Star, Eye, EyeOff } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import PasswordReset from "@/components/PasswordReset";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const navigate = useNavigate();
  const { signUp, signIn, user } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  // Check if this is a password reset redirect
  const isPasswordReset = searchParams.get('reset') === 'true';

  // Redirect authenticated users
  useEffect(() => {
    if (user && !isPasswordReset) {
      navigate('/journal', { replace: true });
    }
  }, [user, navigate, isPasswordReset]);

  useEffect(() => {
    if (isPasswordReset) {
      // Handle password reset flow
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      if (accessToken) {
        setShowPasswordReset(false);
        setIsSignUp(false);
      }
    }
  }, [isPasswordReset]);

  // Form validation
  const validateForm = () => {
    const errors: {[key: string]: string} = {};

    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!password.trim()) {
      errors.password = "Password is required";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (isSignUp && !name.trim()) {
      errors.name = "Name is required";
    }

    if (isPasswordReset && !newPassword.trim()) {
      errors.newPassword = "New password is required";
    } else if (isPasswordReset && newPassword.length < 6) {
      errors.newPassword = "Password must be at least 6 characters";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setFormErrors({});

    try {
      // Handle password update for reset flow
      if (isPasswordReset && newPassword) {
        const { error } = await supabase.auth.updateUser({
          password: newPassword
        });

        if (error) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Password updated successfully",
            description: "Your password has been updated.",
          });
          navigate('/journal', { replace: true });
        }
        return;
      }

      // Regular sign in/up flow
      let result;
      if (isSignUp) {
        result = await signUp(email.trim(), password, name.trim());
      } else {
        result = await signIn(email.trim(), password);
      }

      if (!result.error) {
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
        navigate('/journal', { replace: true });
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast({
        title: "Unexpected Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Show password reset component
  if (showPasswordReset) {
    return (
      <div className="min-h-screen bg-cosmic-gradient">
        <div className="flex items-center p-4 md:p-6">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/')}
            className="text-white hover:bg-white/10 mr-3"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-medium text-white font-title">
            reset password
          </h1>
        </div>

        <div className="max-w-md mx-auto px-4 md:px-6 pb-8">
          <PasswordReset onBack={() => setShowPasswordReset(false)} />
        </div>
      </div>
    );
  }

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
        <h1 className="text-2xl font-medium text-white font-title">
          {isPasswordReset ? "update password" : isSignUp ? "join lumi" : "welcome back"}
        </h1>
      </div>

      <div className="max-w-md mx-auto px-4 md:px-6 pb-8">
        <Card className="bg-lumi-charcoal/80 backdrop-blur-sm border-lumi-sunset-coral/20 shadow-lg">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Star className="w-6 h-6 text-lumi-aquamarine mr-2" />
              <CardTitle className="text-white text-xl font-title">lumi</CardTitle>
            </div>
            <p className="text-white/70 font-sans">
              {isPasswordReset 
                ? "enter your new password" 
                : isSignUp 
                  ? "start your daily reflection journey" 
                  : "continue your reflection practice"
              }
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Password reset form */}
              {isPasswordReset && (
                <div className="space-y-2">
                  <Label className="text-white/80 font-sans">new password</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="border-lumi-sunset-coral/20 focus:border-lumi-aquamarine bg-lumi-deep-space/50 text-white placeholder:text-white/40 pr-10"
                      placeholder="your new password"
                      required
                      minLength={6}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 text-white/60 hover:text-white"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                  {formErrors.newPassword && (
                    <p className="text-lumi-sunset-coral text-sm font-sans">{formErrors.newPassword}</p>
                  )}
                </div>
              )}

              {/* Regular auth form */}
              {!isPasswordReset && (
                <>
                  {isSignUp && (
                    <div className="space-y-2">
                      <Label className="text-white/80 font-sans">name</Label>
                      <Input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="border-lumi-sunset-coral/20 focus:border-lumi-aquamarine bg-lumi-deep-space/50 text-white placeholder:text-white/40"
                        placeholder="your name"
                        required
                      />
                      {formErrors.name && (
                        <p className="text-lumi-sunset-coral text-sm font-sans">{formErrors.name}</p>
                      )}
                    </div>
                  )}
                  
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
                    {formErrors.email && (
                      <p className="text-lumi-sunset-coral text-sm font-sans">{formErrors.email}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-white/80 font-sans">password</Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="border-lumi-sunset-coral/20 focus:border-lumi-aquamarine bg-lumi-deep-space/50 text-white placeholder:text-white/40 pr-10"
                        placeholder="your password"
                        required
                        minLength={6}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 text-white/60 hover:text-white"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                    {formErrors.password && (
                      <p className="text-lumi-sunset-coral text-sm font-sans">{formErrors.password}</p>
                    )}
                  </div>
                </>
              )}

              <Button 
                type="submit"
                className="w-full bg-lumi-sunset-coral hover:bg-lumi-sunset-coral/90 text-white py-3 text-lg font-medium rounded-xl font-sans"
                disabled={loading}
              >
                {loading ? "..." : isPasswordReset ? "update password" : isSignUp ? "create account" : "sign in"}
              </Button>
            </form>

            {!isPasswordReset && (
              <div className="mt-6 space-y-2 text-center">
                <Button
                  variant="link"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setFormErrors({});
                  }}
                  className="text-lumi-aquamarine hover:text-lumi-aquamarine/80 p-0 h-auto block mx-auto font-sans"
                >
                  {isSignUp 
                    ? "already have an account? sign in" 
                    : "need an account? sign up"
                  }
                </Button>
                
                {!isSignUp && (
                  <Button
                    variant="link"
                    onClick={() => setShowPasswordReset(true)}
                    className="text-white/60 hover:text-white/80 p-0 h-auto block mx-auto font-sans text-sm"
                  >
                    forgot your password?
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
