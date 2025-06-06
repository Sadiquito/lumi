# Lumi Implementation Plan — Audio-First Reset

## Phase 1 — Scaffold Build

- Clean repo scaffold:
  - Landing page
  - Login / Signup (Supabase Auth)
  - Journal page with Start Conversation button
  - Conversation logs

- Database:
  - Setup conversations table
  - Setup persona_state table

- Utility:
  - Backend persona_state management functions

- No audio, no AI yet.

---

## Phase 2 — Audio + AI Loop

- Audio Input:
  - Browser mic (Web Audio API)
  - Audio file upload (future fallback)

- Audio Output:
  - ElevenLabs TTS integration

- Transcription:
  - AssemblyAI or Whisper API

- AI Logic:
  - GPT-4o conversation engine
  - persona_state read/write and update after each exchange

---

## Phase 3 — Developer Tuning

- persona_state schema iterations
- Prompt engineering
- Developer dashboards for testing personalization behavior

