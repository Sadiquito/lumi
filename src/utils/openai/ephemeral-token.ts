
import { OpenAIModel, OpenAIVoice, EphemeralTokenRequest, EphemeralTokenResponse } from '@/types/openai-realtime';

const MODEL_MAP = {
  'gpt-4o': 'gpt-4o-realtime-preview-2024-12-17',
  'gpt-4o-mini': 'gpt-4o-mini-realtime-preview-2024-12-17'
} as const;

export async function getEphemeralToken(
  apiKey: string, 
  model: OpenAIModel, 
  voice: OpenAIVoice
): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL_MAP[model] || MODEL_MAP['gpt-4o-mini'],
      voice: voice
    } as EphemeralTokenRequest),
  });

  if (!response.ok) {
    throw new Error(`Failed to get ephemeral token: ${await response.text()}`);
  }

  const data: EphemeralTokenResponse = await response.json();
  return data.client_secret.value;
}

export function getRealtimeModel(model: OpenAIModel): string {
  return MODEL_MAP[model] || MODEL_MAP['gpt-4o-mini'];
}
