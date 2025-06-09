# Lumi – Master Plan

## App Overview and Objectives
Lumi is a minimalist, audio-first journaling companion designed to foster daily introspection through voice conversations. Users speak freely, and Lumi—a calm, intelligent, emotionally neutral AI presence—listens, reflects, and gently guides. Each conversation is transcribed and added to a personal journal, creating a longitudinal space for self-reflection. Lumi remembers key themes and evolves her interactions based on the user's current psychological state.

## Target Audience
- Introspective individuals seeking emotional clarity
- People who prefer voice-based over written journaling
- Users engaged in mindfulness, spirituality, or self-development practices

## Core Features and Functionality

### Landing Page
- Clean, inviting layout with hero section and single CTA: “Start Your Conversation”
- Cosmic-sunset inspired visuals and color palette
- Seamless Google login integrated into the CTA

### Journaling Page (Main Page Post-Login)
- One large animated button at the top to begin a conversation
  - Button indicates whether Lumi is listening or speaking via color/pulsing animation
- Voice-based, hands-free conversation pipeline:
  - User speaks via browser audio capture
  - Lumi responds via expressive TTS using ElevenLabs
  - VAD ensures natural turn-taking, no manual toggling needed
  - User can interrupt Lumi by speaking
- Lumi opens each session with: 
  - “Would you like to tell me what’s on your mind, or shall I offer a prompt?”
- Conversations are transcribed in near real-time
- Session ends when user signals or Lumi senses a natural close
- Transcripts are stored and styled distinctly by speaker
- Each journal entry includes 1–2 personalized reflections or suggestions from Lumi

## High-Level Technical Stack
- **Frontend**: Next.js, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase edge functions
- **Audio**: MediaRecorder API, VAD for turn-taking (Silero or AssemblyAI)
- **Speech-To-Text (STT)**: Deepgram or AssemblyAI
- **Text-To-Speech (TTS)**: ElevenLabs (calm, expressive female voice)
- **LLM**: OpenAI GPT-4o (with evolving user-specific memory context)
- **Hosting**: Lovable.dev

## Conceptual Data Model
- **User**
  - id (from Google OAuth)
  - current_psych_profile: JSON (updated after each session)
- **Transcript**
  - id
  - user_id
  - created_at
  - conversation: Array of { speaker: 'user' | 'lumi', text: string }

## User Interface Design Principles
- Mobile-first, voice-centric layout
- Warm, minimalist design with whitespace-rich balance
- Color palette: Lavender-blue (#A5B4FC), soft peach (#FDF6EC), warm gray backgrounds
- Smooth animations for button state, scroll, and transitions
- Distinct styling for Lumi's speech (e.g., lavender bubbles) vs user input
- Emotive tone: cozy, futuristic, peaceful

## Security Considerations
- Google OAuth login initiated from landing page
- No raw audio storage; only transcripts saved
- Transcripts linked to authenticated user ID
- Supabase row-level security to isolate user data

## Development Phases or Milestones

### Phase 1: Prototype (Internal Testing)
- Implement end-to-end audio journaling loop
- Support VAD-based turn-taking and transcript capture
- Build minimal journaling interface
- Integrate early memory profile handling

### Phase 2: MVP (Early Access)
- Polish UI, transitions, and interaction animations
- Add daily reminder logic
- Handle TTS interruptibility and fallback gracefully
- Improve memory update logic and profile tuning

## Potential Challenges and Solutions
- **VAD performance**: Test client-side and fallback to manual turn transitions if needed
- **Interruptibility**: Detect and pause/stop TTS if user begins speaking
- **STT quality**: Use fallback between Deepgram and AssemblyAI based on latency/accuracy
- **Latency stacking**: Stream audio in chunks to minimize response delay

---

Lumi is built to feel less like a chatbot and more like a wise, attentive companion who remembers what matters and meets the user exactly where they are—every day.
