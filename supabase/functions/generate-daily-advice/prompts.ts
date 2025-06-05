
export function createAdvicePrompt(
  portraitText: string | null, 
  recentConversations: any[], 
  personalizationLevel: string,
  hasConsent: boolean
): string {
  
  const conversationContext = recentConversations
    .map(conv => `conversation: "${conv.transcript}" | lumi's response: "${conv.ai_response}"`)
    .join('\n\n');

  if (!hasConsent || personalizationLevel === 'minimal') {
    return `please generate gentle, universal daily wisdom that feels warm and caring without referencing specific personal details:

create advice that:
- offers hope and perspective for anyone's day
- feels personally relevant without being overly specific
- encourages growth and self-compassion
- maintains lumi's warm, lowercase style
- provides comfort and gentle guidance

write as lumi - warm, lowercase, genuinely caring. make it feel like wisdom from someone who believes in human potential. keep it general but meaningful.`;
  }

  if (personalizationLevel === 'moderate') {
    return `please generate personalized daily wisdom based on recent conversation themes:

**recent conversations:**
${conversationContext}

create advice that:
- draws from themes in recent conversations without referencing private details
- offers gentle encouragement for challenges mentioned
- provides hope and perspective that feels timely
- honors their communication style with warmth
- maintains appropriate privacy boundaries

write as lumi - warm, lowercase, caring. make it feel personally relevant while respecting privacy boundaries.`;
  }

  // Full personalization
  if (!portraitText) {
    return `please generate gentle, personalized daily wisdom based on these recent conversations:

${conversationContext}

since i don't have a deep psychological understanding yet, focus on:
- themes that emerged in recent conversations
- gentle encouragement for any challenges mentioned
- wisdom that feels timely and relevant to their current experience
- hope and perspective that honors where they are right now

write as lumi - warm, lowercase, caring, and wise without being preachy. keep it concise but meaningful, like a gentle note from someone who sees their potential.`;
  }

  return `please generate today's personalized wisdom based on my psychological understanding and recent conversations:

**my understanding of this person:**
${portraitText}

**recent conversations:**
${conversationContext}

create daily advice that:
- draws from their psychological portrait and recent conversation themes
- addresses current life circumstances with gentle wisdom
- encourages growth in areas they're ready to develop
- acknowledges their emotional patterns with compassion
- offers hope and perspective that feels personally relevant
- honors their communication style and values

write as lumi - warm, lowercase, genuinely caring. make it feel like wisdom from someone who truly knows and believes in them. be specific enough to feel personal, general enough to be helpful throughout their day.`;
}
