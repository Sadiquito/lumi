
import React, { useEffect, useState } from 'react';
import { Activity, Clock, User, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAdminAuditLogger } from '@/hooks/useAdminAuditLogger';
import { useAdminAuth } from '@/hooks/useAdminAuth';

interface AdminActivity {
  id: string;
  action: string;
  resource?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export const AdminActivityMonitor: React.FC = () => {
  const { adminUser, sessionExpiry } = useAdminAuth();
  const { logPageAccess } = useAdminAuditLogger();
  const [recentActivities, setRecentActivities] = useState<AdminActivity[]>([]);
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState<number | null>(null);

  useEffect(() => {
    logPageAccess('admin_activity_monitor');
  }, [logPageAccess]);

  // Monitor session time
  useEffect(() => {
    if (!sessionExpiry) return;

    const interval = setInterval(() => {
      const remaining = sessionExpiry - Date.now();
      if (remaining <= 0) {
        setSessionTimeRemaining(null);
      } else {
        setSessionTimeRemaining(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionExpiry]);

  // Mock recent activities (in production, this would come from audit logs)
  useEffect(() => {
    const mockActivities: AdminActivity[] = [
      {
        id: '1',
        action: 'admin_page_access',
        resource: 'dashboard',
        timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        metadata: { ip: '192.168.1.100' }
      },
      {
        id: '2',
        action: 'admin_data_access',
        resource: 'user_activity',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        metadata: { filters: { date_range: '30d' } }
      },
      {
        id: '3',
        action: 'privacy_compliance_check',
        resource: 'system',
        timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
        metadata: { status: 'completed' }
      }
    ];

    setRecentActivities(mockActivities);
  }, []);

  const formatTimeRemaining = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const formatRelativeTime = (timestamp: string) => {
    const now = Date.now();
    const time = new Date(timestamp).getTime();
    const diff = now - time;
    
    if (diff < 60 * 1000) return 'Just now';
    if (diff < 60 * 60 * 1000) return `${Math.floor(diff / (60 * 1000))}m ago`;
    return `${Math.floor(diff / (60 * 60 * 1000))}h ago`;
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'admin_page_access': return 'bg-blue-100 text-blue-800';
      case 'admin_data_access': return 'bg-green-100 text-green-800';
      case 'privacy_compliance_check': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {/* Session Status */}
      <Card className="bg-white/60 backdrop-blur-sm border-lumi-aquamarine/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <Shield className="w-5 h-5 text-lumi-aquamarine" />
            <span>Admin Session Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-lumi-charcoal/60" />
                <span className="text-sm font-medium text-lumi-charcoal">Administrator</span>
              </div>
              <p className="text-sm text-lumi-charcoal/70 ml-6">
                {adminUser?.name || adminUser?.email || 'Unknown'}
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-lumi-charcoal/60" />
                <span className="text-sm font-medium text-lumi-charcoal">Session Time</span>
              </div>
              <p className="text-sm text-lumi-charcoal/70 ml-6">
                {sessionTimeRemaining ? formatTimeRemaining(sessionTimeRemaining) : 'Expired'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <Card className="bg-white/60 backdrop-blur-sm border-lumi-aquamarine/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <Activity className="w-5 h-5 text-lumi-aquamarine" />
            <span>Recent Admin Activities</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivities.length === 0 ? (
              <p className="text-center text-lumi-charcoal/60 py-4">No recent activities</p>
            ) : (
              recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-white/40 rounded-lg border border-lumi-aquamarine/10">
                  <div className="flex items-center space-x-3">
                    <Badge className={getActionColor(activity.action)}>
                      {activity.action.replace('admin_', '').replace('_', ' ')}
                    </Badge>
                    <div>
                      <p className="text-sm font-medium text-lumi-charcoal">
                        {activity.resource || 'System'}
                      </p>
                      {activity.metadata && (
                        <p className="text-xs text-lumi-charcoal/60">
                          {JSON.stringify(activity.metadata, null, 0)}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-lumi-charcoal/60">
                    {formatRelativeTime(activity.timestamp)}
                  </span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
