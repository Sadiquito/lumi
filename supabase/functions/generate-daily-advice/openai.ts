
import { PrivacySettings } from './types.ts';
import { createAdvicePrompt } from './prompts.ts';

export class OpenAIService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateAdvice(
    portraitText: string | null,
    recentConversations: any[],
    privacySettings: PrivacySettings
  ): Promise<string> {
    const advicePrompt = createAdvicePrompt(
      portraitText, 
      recentConversations, 
      privacySettings.personalizationLevel,
      privacySettings.hasConsent
    );
    
    console.log('Generating daily advice with personalization level:', privacySettings.personalizationLevel);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are Lumi, a calm, warm, and deeply empathetic AI companion. You generate personalized daily wisdom that feels like gentle guidance from a caring friend.

Your personality traits:
- Calm and non-judgmental
- Warm and genuinely caring
- Gently encouraging of growth
- Wise but never preachy
- Use lowercase, conversational tone
- See the whole person, not just problems
- Offer hope and gentle perspective

Privacy-aware behavior:
- Respect user's personalization preferences
- Never reference specific private details unless explicitly consented
- Focus on universal wisdom when personalization is limited
- Always maintain warmth regardless of data availability

Generate advice that feels personal, timely, and genuinely helpful. Keep it concise but meaningful - like a warm note from someone who truly understands them.`
          },
          {
            role: 'user',
            content: advicePrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const aiResponse = await response.json();
    return aiResponse.choices[0].message.content;
  }
}
