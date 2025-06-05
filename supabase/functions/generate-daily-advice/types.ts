
export interface PrivacySettings {
  hasConsent: boolean;
  personalizationLevel: 'minimal' | 'moderate' | 'full';
  respectPrivacy?: boolean;
}

export interface RequestBody {
  userId: string;
  privacySettings: PrivacySettings;
}

export interface UserData {
  portraitText: string | null;
  recentConversations: any[];
}

export interface GenerationResponse {
  success: boolean;
  message?: string;
  alreadyGenerated?: boolean;
  advice?: string;
  generated?: boolean;
  personalizationLevel?: string;
  error?: string;
}
