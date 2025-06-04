
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { User, Settings, Lock, Mail } from "lucide-react";
import { useAuth } from './AuthProvider';
import { useToast } from '@/hooks/use-toast';

const ProfileManagement = () => {
  const { user, updateProfile, updatePassword } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: ''
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.user_metadata?.name || '',
        email: user.email || ''
      });
    }
  }, [user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Name is required.",
        variant: "destructive",
      });
      return;
    }

    if (!profileForm.email.trim()) {
      toast({
        title: "Validation Error",
        description: "Email is required.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { error } = await updateProfile({
      name: profileForm.name.trim(),
      email: profileForm.email.trim()
    });

    if (!error) {
      setIsEditing(false);
    }
    setLoading(false);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword.length < 6) {
      toast({
        title: "Validation Error",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Validation Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { error } = await updatePassword(passwordForm.newPassword);

    if (!error) {
      setIsChangingPassword(false);
      setPasswordForm({ newPassword: '', confirmPassword: '' });
    }
    setLoading(false);
  };

  const cancelEdit = () => {
    if (user) {
      setProfileForm({
        name: user.user_metadata?.name || '',
        email: user.email || ''
      });
    }
    setIsEditing(false);
  };

  const cancelPasswordChange = () => {
    setPasswordForm({ newPassword: '', confirmPassword: '' });
    setIsChangingPassword(false);
  };

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <Card className="bg-lumi-charcoal/80 backdrop-blur-sm border-lumi-sunset-coral/20 shadow-lg">
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center font-title">
            <User className="w-5 h-5 mr-2 text-lumi-aquamarine" />
            profile information
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white/80 font-sans">name</Label>
                <Input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="border-lumi-sunset-coral/20 focus:border-lumi-aquamarine bg-lumi-deep-space/50 text-white placeholder:text-white/40"
                  placeholder="your name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-white/80 font-sans">email</Label>
                <Input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="border-lumi-sunset-coral/20 focus:border-lumi-aquamarine bg-lumi-deep-space/50 text-white placeholder:text-white/40"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div className="flex space-x-3">
                <Button 
                  type="submit"
                  className="bg-lumi-sunset-coral hover:bg-lumi-sunset-coral/90 text-white font-sans"
                  disabled={loading}
                >
                  {loading ? "saving..." : "save changes"}
                </Button>
                <Button 
                  type="button"
                  variant="outline"
                  onClick={cancelEdit}
                  className="border-lumi-sunset-coral/20 text-white hover:bg-lumi-sunset-coral/10 font-sans"
                  disabled={loading}
                >
                  cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white/80 font-sans">name:</span>
                <span className="text-white font-medium">{user?.user_metadata?.name || 'Not set'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/80 font-sans">email:</span>
                <span className="text-white text-sm">{user?.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/80 font-sans">verified:</span>
                <span className={`text-sm ${user?.email_confirmed_at ? 'text-lumi-aquamarine' : 'text-lumi-sunset-coral'}`}>
                  {user?.email_confirmed_at ? 'yes' : 'pending'}
                </span>
              </div>
              
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                className="w-full border-lumi-sunset-coral/20 text-white hover:bg-lumi-sunset-coral/10 font-sans"
              >
                <Settings className="w-4 h-4 mr-2" />
                edit profile
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator className="bg-lumi-sunset-coral/10" />

      {/* Password Management */}
      <Card className="bg-lumi-charcoal/80 backdrop-blur-sm border-lumi-sunset-coral/20 shadow-lg">
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center font-title">
            <Lock className="w-5 h-5 mr-2 text-lumi-aquamarine" />
            password & security
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isChangingPassword ? (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white/80 font-sans">new password</Label>
                <Input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="border-lumi-sunset-coral/20 focus:border-lumi-aquamarine bg-lumi-deep-space/50 text-white placeholder:text-white/40"
                  placeholder="enter new password"
                  minLength={6}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-white/80 font-sans">confirm password</Label>
                <Input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="border-lumi-sunset-coral/20 focus:border-lumi-aquamarine bg-lumi-deep-space/50 text-white placeholder:text-white/40"
                  placeholder="confirm new password"
                  minLength={6}
                  required
                />
              </div>

              <div className="flex space-x-3">
                <Button 
                  type="submit"
                  className="bg-lumi-sunset-coral hover:bg-lumi-sunset-coral/90 text-white font-sans"
                  disabled={loading}
                >
                  {loading ? "updating..." : "update password"}
                </Button>
                <Button 
                  type="button"
                  variant="outline"
                  onClick={cancelPasswordChange}
                  className="border-lumi-sunset-coral/20 text-white hover:bg-lumi-sunset-coral/10 font-sans"
                  disabled={loading}
                >
                  cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white/80 font-sans">password:</span>
                <span className="text-white/60">••••••••</span>
              </div>
              
              <Button
                onClick={() => setIsChangingPassword(true)}
                variant="outline"
                className="w-full border-lumi-sunset-coral/20 text-white hover:bg-lumi-sunset-coral/10 font-sans"
              >
                <Lock className="w-4 h-4 mr-2" />
                change password
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card className="bg-lumi-charcoal/80 backdrop-blur-sm border-lumi-sunset-coral/20 shadow-lg">
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center font-title">
            <Mail className="w-5 h-5 mr-2 text-lumi-aquamarine" />
            account details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-white/80 text-sm font-sans">member since:</span>
            <span className="text-white text-sm">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/80 text-sm font-sans">last sign in:</span>
            <span className="text-white text-sm">
              {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Unknown'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/80 text-sm font-sans">user id:</span>
            <span className="text-white/60 text-xs font-mono">{user?.id?.slice(0, 8)}...</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileManagement;
