
export interface ConversationArchive {
  id: string;
  session_id: string;
  user_id: string;
  title: string;
  created_at: string;
  archived_at: string;
  status: 'completed' | 'paused' | 'archived';
  duration_minutes: number;
  message_count: number;
  has_summary: boolean;
  metadata: {
    completion_reason?: 'user_ended' | 'timeout' | 'max_duration';
    archive_reason?: 'manual' | 'auto_cleanup' | 'user_request';
    tags?: string[];
    emotional_tone?: string;
  };
}

export interface ConversationSummary {
  id: string;
  conversation_id: string;
  summary_text: string;
  key_insights: string[];
  emotional_tone: string;
  duration_minutes: number;
  message_count: number;
  created_at: string;
  metadata: {
    generation_model?: string;
    confidence_score?: number;
    themes?: string[];
  };
}

export interface SessionBoundaryEvent {
  type: 'session_start' | 'session_pause' | 'session_resume' | 'session_complete' | 'session_archive';
  session_id: string;
  timestamp: Date;
  metadata?: {
    reason?: string;
    duration?: number;
    message_count?: number;
  };
}
