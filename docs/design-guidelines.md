# Lumi – Design Guidelines

## Visual Style
- **Font**: Inter
- **Primary Color**: #A5B4FC (lavender-blue)
- **Accent Color**: #FDF6EC (soft peach)
- **Backgrounds**: White, warm grays, and subtle gradients
- **Imagery Theme**: "Cosmic sunset" — evokes warmth, peace, and gentle futurism
- **Voice Mood**: Calming, slow-paced, reflective (complementing the color and imagery choices)

## Page Layout Principles
- Mobile-first design with full responsiveness across devices
- Whitespace-rich layout to create a sense of breathing space and clarity
- Each screen should focus on a **single clear CTA**, avoiding visual clutter  
  - e.g., Landing page: "Begin Your Conversation"  
  - Journaling page: Large central "Start Conversation" button
- Use soft scroll-triggered animations to imply depth without distraction
- All content should visually reinforce that **voice is the primary interface**

## Components and Styles
- Use **shadcn/ui** for base components (buttons, cards, modals)
- Buttons and containers:
  - Rounded corners (2xl), soft drop shadows
  - Feedback animations on hover and press
- Lumi's speaking moments:
  - Displayed in lavender-blue bubbles with subtle glowing border
  - User responses: gray or soft neutral tones
  - Add gentle pulsing effect when Lumi is listening or speaking
- Journaling entries:
  - Use readable transcript font sizes
  - Clear timestamps and speaker identity
  - Include Lumi's optional reflection card at top of each entry

## Accessibility
- Transcripts must be high-contrast and readable on mobile and desktop
- All interactive elements (buttons, links) must be fully keyboard accessible
- Design should support screen readers and use semantic HTML elements
- Animations should respect user motion preferences

## Brand Tone and Voice
- **Emotionally neutral** and emotionally intelligent
- Warm, calm, and affirming without mimicking human emotions
- Lumi should feel like a **wise, attentive presence**, not a chatbot or friend simulacrum
- Use language that prompts introspection without giving advice unless prompted post-session
- All voice lines must reinforce Lumi's primary purpose: to gently hold space for self-reflection

---

The interface should invite a state of ease: no clutter, no speed, no pressure. Every design decision must reinforce Lumi’s purpose as a voice-first, emotionally intelligent companion for quiet daily reflection.
