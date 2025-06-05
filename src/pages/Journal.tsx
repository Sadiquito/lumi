
import React from 'react';
import AudioRecordingFeature from '@/components/AudioRecordingFeature';
import TTSFeatureGate from '@/components/TTSFeatureGate';
import TTSTestingPanel from '@/components/TTSTestingPanel';
import JournalHeader from '@/components/Journal/JournalHeader';
import TrialStatusAlerts from '@/components/Journal/TrialStatusAlerts';
import TodaysCheckIn from '@/components/Journal/TodaysCheckIn';
import RecentConversations from '@/components/Journal/RecentConversations';
import JournalSidebar from '@/components/Journal/JournalSidebar';

const Journal = () => {
  return (
    <div className="min-h-screen bg-cosmic-gradient">
      {/* Header with Trial Status */}
      <JournalHeader />

      <div className="max-w-4xl mx-auto px-4 md:px-6 pb-8">
        {/* Trial Status Alert */}
        <TrialStatusAlerts />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
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

            {/* TTS Enhanced Demo - Updated for trial integration */}
            <TTSFeatureGate 
              text="Welcome to Lumi's enhanced voice feature! This showcases our premium audio experience with voice selection, progress tracking, and advanced controls. Upgrade to unlock unlimited voice responses."
              variant="enhanced"
              showAlert={true} 
              showVoiceSelector={true}
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
