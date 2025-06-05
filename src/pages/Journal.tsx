
import React from 'react';
import AudioRecordingFeature from '@/components/AudioRecordingFeature';
import TTSFeatureGate from '@/components/TTSFeatureGate';
import TTSTestingPanel from '@/components/TTSTestingPanel';
import EnhancedJournalHeader from '@/components/Journal/EnhancedJournalHeader';
import TodaysCheckIn from '@/components/Journal/TodaysCheckIn';
import RecentConversations from '@/components/Journal/RecentConversations';
import JournalSidebar from '@/components/Journal/JournalSidebar';
import EnhancedTrialCountdown from '@/components/EnhancedTrialCountdown';
import TrialFeatureLimitation from '@/components/TrialFeatureLimitation';
import { useAuth } from '@/components/AuthProvider';

const Journal = () => {
  const { trialStatus } = useAuth();
  const { daysRemaining, isTrialExpired } = trialStatus;

  return (
    <div className="min-h-screen bg-cosmic-gradient">
      {/* Enhanced Header with Trial Status */}
      <EnhancedJournalHeader />

      <div className="max-w-4xl mx-auto px-4 md:px-6 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Trial Progress Card - prominent for urgent situations */}
            {(isTrialExpired || daysRemaining <= 3) && (
              <EnhancedTrialCountdown 
                variant="progress"
                showProgress={true}
                showUpgradeButton={true}
                className="mb-6"
              />
            )}

            {/* Today's Call Status */}
            <TodaysCheckIn />

            {/* Audio Recording - Always Available */}
            <AudioRecordingFeature
              onTranscriptionComplete={(transcript) => {
                console.log('Transcription received:', transcript);
              }}
            />

            {/* Recent Conversations with Privacy-Aware Analysis */}
            <RecentConversations />

            {/* TTS Enhanced Demo with Trial Limitation */}
            <div className="space-y-4">
              <TrialFeatureLimitation 
                feature="tts"
                variant="alert"
                customMessage="Voice responses showcase Lumi's premium audio experience with voice selection and advanced controls."
              />
              
              <TTSFeatureGate 
                text="Welcome to Lumi's enhanced voice feature! This showcases our premium audio experience with voice selection, progress tracking, and advanced controls. Upgrade to unlock unlimited voice responses."
                variant="enhanced"
                showAlert={false} 
                showVoiceSelector={true}
              />
            </div>

            {/* Export Feature Limitation */}
            <TrialFeatureLimitation 
              feature="export"
              variant="card"
              customMessage="Export your conversations and insights in PDF, text, or markdown formats. Keep your reflection journey with you forever."
            />

            {/* TTS Testing Panel - Development/Admin Feature */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-8">
                <TTSTestingPanel />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <JournalSidebar />
        </div>
      </div>
    </div>
  );
};

export default Journal;
