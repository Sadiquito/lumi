# Lumi – Implementation Plan

## Phase 1: Prototype (Internal Testing)
**Goal:** Build a working voice-first journaling loop for private testing and feedback.

### Tasks:
- [ ] Set up Next.js frontend with Tailwind CSS and shadcn/ui
- [ ] Implement Google OAuth login using Supabase Auth (landing page CTA triggers auth directly)
- [ ] Build minimalist UI for Landing Page and Journaling Page (with one prominent "Start Conversation" button)
- [ ] Integrate MediaRecorder API for browser audio capture
- [ ] Add Voice Activity Detection (VAD) using silero or AssemblyAI for hands-free turn-taking
- [ ] Implement STT using Deepgram or AssemblyAI with chunked transcription for low latency
- [ ] Connect to GPT-4o for Lumi's conversational generation using system prompt + session context + evolving user profile
- [ ] Integrate ElevenLabs TTS to voice Lumi's responses in a calm, expressive tone
- [ ] Enable user interruptions by detecting overlapping speech and halting TTS playback
- [ ] Display live transcript during the session; distinguish user vs Lumi by style
- [ ] Store transcripts (structured by speaker) in Supabase and link to user ID
- [ ] Generate or update user psychological profile JSON after each session
- [ ] Build Journaling Page to list and display prior transcripts with timestamps and Lumi's session reflections
- [ ] Ensure mobile compatibility and perform end-to-end testing

## Phase 2: MVP (Early Access)
**Goal:** Refine interaction design and increase conversational fluidity for a limited test audience.

### Tasks:
- [ ] Enhance UI polish with smooth animations, state transitions, and visual feedback
- [ ] Improve conversation ending logic (natural close detection, fallback timeout, user-end signal)
- [ ] Add support for Lumi-generated reflections/questions at the top of each journal entry
- [ ] Implement memory state summarization logic post-session (with recency-weighted prioritization)
- [ ] Add daily check-in logic with optional reminders via email or in-app notification
- [ ] Improve TTS latency and robustness to interruption
- [ ] Fine-tune turn-taking dynamics based on real user behavior
- [ ] Expand journal interface with search and filter (optional)
- [ ] Reinforce security (Supabase RLS validation, audit transcript creation logic)

## Team Setup (Solo Dev or Small Team)
- **Frontend**: Single dev can handle all interface and UI logic in Next.js and Tailwind
- **Backend**: Supabase handles auth, storage, and RLS with minimal server logic required
- **LLM & Audio Integration**: Requires orchestration of STT, TTS, and LLM APIs with lightweight middleware
- Focus early efforts on full audio-to-audio flow; visual polish and onboarding come later

## Optional Tasks / Integrations
- Basic analytics via Posthog or Plausible
- Daily check-in reminders via email (Resend or Supabase Edge Functions)
- Feedback form or quick voice feedback capture post-session
- Basic error logging via Sentry or LogRocket
- Usage-based cost tracking dashboard (e.g. LLM/API spend awareness)

---

Lumi's prototype must feel seamless and deeply intentional, even in its earliest form. Prioritize a responsive, voice-first experience where the user speaks, Lumi listens and responds, and the conversation feels naturally guided—without needing a single click beyond the first.
