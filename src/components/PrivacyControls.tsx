
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Trash2, Shield, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export const PrivacyControls: React.FC = () => {
  const { user } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const exportUserData = async () => {
    if (!user) return;

    try {
      setIsExporting(true);
      
      // Fetch all user data
      const [conversationsRes, profileRes] = await Promise.all([
        supabase.from('conversations').select('*').eq('user_id', user.id),
        supabase.from('profiles').select('*').eq('id', user.id)
      ]);

      if (conversationsRes.error) throw conversationsRes.error;
      if (profileRes.error) throw profileRes.error;

      const userData = {
        exportDate: new Date().toISOString(),
        user: {
          id: user.id,
          email: user.email,
          createdAt: user.created_at
        },
        profile: profileRes.data?.[0] || null,
        conversations: conversationsRes.data || [],
        dataRetentionPolicy: {
          conversationRetention: '2 years from last interaction',
          profileDataRetention: 'Until account deletion',
          automaticDeletion: 'Inactive accounts after 3 years'
        }
      };

      // Create and download file
      const blob = new Blob([JSON.stringify(userData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lumi-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Data exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const deleteAllData = async () => {
    if (!user) return;

    try {
      setIsDeleting(true);

      // Delete conversations first (due to foreign key)
      const { error: conversationsError } = await supabase
        .from('conversations')
        .delete()
        .eq('user_id', user.id);

      if (conversationsError) throw conversationsError;

      // Delete profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      if (profileError) throw profileError;

      toast.success('All data deleted successfully');
      setShowDeleteConfirm(false);
      
      // Sign out user after deletion
      setTimeout(() => {
        supabase.auth.signOut();
      }, 2000);

    } catch (error) {
      console.error('Deletion error:', error);
      toast.error('Failed to delete data');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Privacy & Data Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Data Export */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Export Your Data</h4>
            <p className="text-sm text-gray-600">
              Download all your conversations, psychological insights, and profile data in JSON format.
            </p>
            <Button
              onClick={exportUserData}
              disabled={isExporting}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              {isExporting ? 'Exporting...' : 'Export Data'}
            </Button>
          </div>

          {/* Data Retention Info */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Data Retention Policy</h4>
            <div className="text-sm text-gray-600 space-y-2">
              <p>• Conversations: Stored for 2 years from last interaction</p>
              <p>• Profile data: Stored until account deletion</p>
              <p>• Inactive accounts: Automatically deleted after 3 years</p>
              <p>• Audio data: Processed in real-time, not stored permanently</p>
            </div>
          </div>

          {/* Data Deletion */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Delete All Data</h4>
            <p className="text-sm text-gray-600">
              Permanently delete all your conversations, insights, and profile data. This action cannot be undone.
            </p>
            {!showDeleteConfirm ? (
              <Button
                onClick={() => setShowDeleteConfirm(true)}
                variant="destructive"
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete All Data
              </Button>
            ) : (
              <div className="space-y-3 p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-medium">Confirm Data Deletion</span>
                </div>
                <p className="text-sm text-red-700">
                  This will permanently delete all your data and sign you out. Are you sure?
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={deleteAllData}
                    disabled={isDeleting}
                    variant="destructive"
                    size="sm"
                  >
                    {isDeleting ? 'Deleting...' : 'Yes, Delete All'}
                  </Button>
                  <Button
                    onClick={() => setShowDeleteConfirm(false)}
                    variant="outline"
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
