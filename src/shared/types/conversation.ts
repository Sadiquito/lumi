export interface TranscriptEntry {
  id?: string; // Optional for backward compatibility
  speaker: 'user' | 'lumi';
  text: string;
  timestamp: number;
  [key: string]: unknown; // Allow additional properties for flexibility
}

export interface PsychologicalInsights {
  [key: string]: unknown;
}

export interface SessionAnalysisResult {
  summary: string;
  reflection: string;
  followUpQuestion: string;
}

export interface Conversation {
  id: string;
  transcript: TranscriptEntry[];
  session_summary: string | null;
  lumi_reflection: string | null;
  lumi_question: string | null;
  psychological_insights: PsychologicalInsights;
  conversation_duration: number;
  created_at: string;
}

// Re-export existing types from conversation.ts for compatibility
export type ModelOption = 'gpt-4o' | 'gpt-4o-mini';
export type VoiceOption = 'alloy' | 'ash' | 'ballad' | 'coral' | 'echo' | 'sage' | 'shimmer' | 'verse'; 