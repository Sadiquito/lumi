# Lumi – External API References

This project integrates with several third-party APIs for AI processing, voice synthesis, transcription, and backend services. Below are the primary integrations used in Lumi, along with relevant documentation links and implementation notes.

---

## 🎤 Speech-to-Text (STT)

**Provider:** Deepgram or AssemblyAI  
**Purpose:** Real-time audio transcription during user speech

- Deepgram: https://developers.deepgram.com/docs/  
- AssemblyAI: https://docs.assemblyai.com/

> Notes:
> - Use chunked streaming for responsiveness
> - Prefer `real-time` endpoints with VAD-compatible chunks
> - Watch for auth headers and token expiration timing

---

## 🧠 Language Model

**Provider:** OpenAI GPT-4o  
**Purpose:** Generate Lumi's voice responses based on session + user profile

- API Docs: https://platform.openai.com/docs/introduction  
- GPT-4o specific: https://platform.openai.com/docs/guides/gpt/what-is-gpt-4o

> Notes:
> - Use `chat/completions` endpoint
> - System prompt includes memory context
> - Inject recent history + structured user state JSON

---

## 🔊 Text-to-Speech (TTS)

**Provider:** ElevenLabs  
**Purpose:** Convert Lumi's responses into warm, expressive audio

- Docs: https://docs.elevenlabs.io/  
- Voice creation: https://docs.elevenlabs.io/api-reference/text-to-speech

> Notes:
> - Use `v1/text-to-speech/{voice_id}` endpoint
> - Use streaming playback if available
> - Set voice style to calm, neutral, expressive (custom voice optional)

---

## 🗂️ Database / Auth / Hosting

**Provider:** Supabase  
**Purpose:** User auth (Google OAuth), transcript storage, user profiles

- Docs: https://supabase.com/docs  
- Auth: https://supabase.com/docs/guides/auth  
- Edge Functions: https://supabase.com/docs/guides/functions

> Notes:
> - All data linked by user ID
> - Enable RLS for user-level data access
> - Supabase Edge Functions may be used for LLM orchestration

---

## 📦 Additional Tooling (Optional)

- **VAD** (client-side or server): https://github.com/snakers4/silero-vad  
- **MediaRecorder (Browser API)**: https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder

