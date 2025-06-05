
import React from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { usePrivacySafeAnalytics } from '@/hooks/usePrivacySafeAnalytics';
import { useAdminSessionMonitor } from '@/hooks/useAdminSessionMonitor';
import { useAdminAuditLogger } from '@/hooks/useAdminAuditLogger';
import AdminDashboardLayout from '@/components/Admin/AdminDashboardLayout';
import MetricsOverview from '@/components/Admin/MetricsOverview';
import SystemHealthPanel from '@/components/Admin/SystemHealthPanel';
import UserActivityChart from '@/components/Admin/UserActivityChart';
import TrialConversionMetrics from '@/components/Admin/TrialConversionMetrics';
import AdminSessionIndicator from '@/components/Admin/AdminSessionIndicator';
import { PrivacyComplianceValidator } from '@/components/Admin/PrivacyComplianceValidator';
import { AdminActivityMonitor } from '@/components/Admin/AdminActivityMonitor';

const AdminDashboard: React.FC = () => {
  const { isAdminAuthenticated, isLoadingAdminAuth } = useAdminAuth();
  const { logPageAccess } = useAdminAuditLogger();
  
  // Use privacy-safe analytics instead of regular analytics
  const { 
    anonymizedUserActivity, 
    privacySafeConversions, 
    systemHealth,
    isLoadingActivity,
    isLoadingConversions,
    isLoadingHealth
  } = usePrivacySafeAnalytics(isAdminAuthenticated);

  // Initialize session monitoring and audit logging
  useAdminSessionMonitor();
  
  React.useEffect(() => {
    if (isAdminAuthenticated) {
      logPageAccess('admin_dashboard');
    }
  }, [isAdminAuthenticated, logPageAccess]);

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
            <p className="text-lumi-charcoal/60 mt-1">Privacy-compliant system monitoring</p>
          </div>
          <AdminSessionIndicator />
        </div>

        {/* Privacy & Security Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PrivacyComplianceValidator />
          </div>
          <div className="lg:col-span-1">
            <AdminActivityMonitor />
          </div>
        </div>

        {/* Metrics Overview - Using anonymized data */}
        <MetricsOverview 
          userActivity={anonymizedUserActivity}
          trialConversions={privacySafeConversions}
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

          {/* User Activity Chart - Anonymized */}
          <div className="lg:col-span-1">
            <UserActivityChart 
              activityData={anonymizedUserActivity}
              isLoading={isLoadingActivity}
            />
          </div>
        </div>

        {/* Trial Conversion Metrics - Privacy Safe */}
        <TrialConversionMetrics 
          conversionData={privacySafeConversions}
          isLoading={isLoadingConversions}
        />
      </div>
    </AdminDashboardLayout>
  );
};

export default AdminDashboard;
