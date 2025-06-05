
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';

export interface AuditLogEntry {
  action: string;
  resource?: string;
  metadata?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
}

export const useAdminAuditLogger = () => {
  const { user } = useAuth();

  const logAdminActivity = useCallback(async (entry: AuditLogEntry) => {
    if (!user) return;

    try {
      // Get client info for audit trail
      const clientInfo = {
        ip_address: entry.ip_address || 'unknown',
        user_agent: entry.user_agent || navigator.userAgent,
        timestamp: new Date().toISOString(),
      };

      await supabase.from('admin_audit_logs').insert({
        admin_user_id: user.id,
        action: entry.action,
        resource: entry.resource,
        metadata: {
          ...entry.metadata,
          ...clientInfo,
        },
      });

      console.log(`Admin audit log: ${entry.action}`, entry.metadata);
    } catch (error) {
      console.error('Failed to log admin activity:', error);
    }
  }, [user]);

  const logPageAccess = useCallback((page: string) => {
    logAdminActivity({
      action: 'admin_page_access',
      resource: page,
      metadata: { access_time: new Date().toISOString() },
    });
  }, [logAdminActivity]);

  const logDataAccess = useCallback((dataType: string, filters?: Record<string, any>) => {
    logAdminActivity({
      action: 'admin_data_access',
      resource: dataType,
      metadata: { 
        filters: filters || {},
        access_time: new Date().toISOString() 
      },
    });
  }, [logAdminActivity]);

  const logSystemAction = useCallback((action: string, details?: Record<string, any>) => {
    logAdminActivity({
      action: 'admin_system_action',
      resource: action,
      metadata: { 
        details: details || {},
        action_time: new Date().toISOString() 
      },
    });
  }, [logAdminActivity]);

  return {
    logAdminActivity,
    logPageAccess,
    logDataAccess,
    logSystemAction,
  };
};
