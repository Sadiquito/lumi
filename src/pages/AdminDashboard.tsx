
import React from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useAdminSessionMonitor } from '@/hooks/useAdminSessionMonitor';
import AdminDashboardLayout from '@/components/Admin/AdminDashboardLayout';
import MetricsOverview from '@/components/Admin/MetricsOverview';
import SystemHealthPanel from '@/components/Admin/SystemHealthPanel';
import UserActivityChart from '@/components/Admin/UserActivityChart';
import TrialConversionMetrics from '@/components/Admin/TrialConversionMetrics';
import AdminSessionIndicator from '@/components/Admin/AdminSessionIndicator';

const AdminDashboard: React.FC = () => {
  const { isAdminAuthenticated, isLoadingAdminAuth } = useAdminAuth();
  const { 
    userActivity, 
    trialConversions, 
    systemHealth,
    isLoadingActivity,
    isLoadingConversions,
    isLoadingHealth
  } = useAnalytics(isAdminAuthenticated);

  // Initialize session monitoring
  useAdminSessionMonitor();

  if (isLoadingAdminAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lumi-aquamarine mx-auto mb-4"></div>
          <p className="text-lumi-charcoal">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  const isLoading = isLoadingActivity || isLoadingConversions || isLoadingHealth;

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        {/* Header with Session Indicator */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-lumi-charcoal">Admin Dashboard</h1>
            <p className="text-lumi-charcoal/60 mt-1">Monitor system health and user analytics</p>
          </div>
          <AdminSessionIndicator />
        </div>

        {/* Metrics Overview */}
        <MetricsOverview 
          userActivity={userActivity}
          trialConversions={trialConversions}
          systemHealth={systemHealth}
          isLoading={isLoading}
        />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* System Health Panel */}
          <div className="lg:col-span-1">
            <SystemHealthPanel 
              healthData={systemHealth}
              isLoading={isLoadingHealth}
            />
          </div>

          {/* User Activity Chart */}
          <div className="lg:col-span-1">
            <UserActivityChart 
              activityData={userActivity}
              isLoading={isLoadingActivity}
            />
          </div>
        </div>

        {/* Trial Conversion Metrics */}
        <TrialConversionMetrics 
          conversionData={trialConversions}
          isLoading={isLoadingConversions}
        />
      </div>
    </AdminDashboardLayout>
  );
};

export default AdminDashboard;
