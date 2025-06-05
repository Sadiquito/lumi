
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Activity, 
  Settings, 
  LogOut,
  Home
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useToast } from '@/hooks/use-toast';

interface AdminDashboardLayoutProps {
  children: React.ReactNode;
}

const AdminDashboardLayout: React.FC<AdminDashboardLayoutProps> = ({ children }) => {
  const { clearAdminSession } = useAdminAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAdminSession();
    toast({
      title: "Admin Session Ended",
      description: "You have been logged out of the admin panel.",
    });
    navigate('/');
  };

  const navItems = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/admin',
      active: true
    },
    {
      label: 'User Management',
      icon: Users,
      href: '/admin/users',
      active: false
    },
    {
      label: 'System Health',
      icon: Activity,
      href: '/admin/health',
      active: false
    },
    {
      label: 'Settings',
      icon: Settings,
      href: '/admin/settings',
      active: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-lumi-sage/10 to-lumi-aquamarine/10">
      <div className="flex">
        {/* Sidebar */}
        <Card className="w-64 h-screen rounded-none border-r border-lumi-aquamarine/20 bg-white/80 backdrop-blur-sm">
          <div className="p-6">
            {/* Logo/Brand */}
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-8 h-8 bg-gradient-to-br from-lumi-aquamarine to-lumi-sage rounded-lg flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-lumi-charcoal">Admin Panel</span>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`
                    flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors
                    ${item.active 
                      ? 'bg-lumi-aquamarine text-white' 
                      : 'text-lumi-charcoal hover:bg-lumi-aquamarine/10'
                    }
                  `}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Footer Actions */}
          <div className="absolute bottom-6 left-6 right-6 space-y-2">
            <Link to="/">
              <Button variant="outline" className="w-full justify-start">
                <Home className="w-4 h-4 mr-2" />
                Back to App
              </Button>
            </Link>
            <Button 
              variant="destructive" 
              onClick={handleLogout}
              className="w-full justify-start"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Exit Admin
            </Button>
          </div>
        </Card>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardLayout;
