# Lumi Masterplan — Audio-First Reset

## Vision

Lumi is an AI-native audio journaling companion. It provides users with a safe, minimalist, warm space for introspection through real-time voice conversations powered by adaptive AI.

The app has no unnecessary features. Its sole function is to host adaptive, evolving conversations between the user and Lumi through audio.

## Key Principles

- Audio-first interaction
- Hyper-minimalist UI
- No subscriptions, payments, or telephony
- Real-time adaptive dialogue
- AI memory evolves per user (psychological profile)

## User Flow

1️⃣ Landing page → Sign up / Login  
2️⃣ Journal page → Press “Start Conversation”  
3️⃣ Lumi initiates conversation (speaks via ElevenLabs)  
4️⃣ User responds (browser mic)  
5️⃣ Transcription (AssemblyAI or Whisper)  
6️⃣ GPT-4o processes response & persona_state  
7️⃣ Lumi responds → loop continues  
8️⃣ Conversation saved; persona_state updated

## Technical Stack

- Frontend: Vite, React, TypeScript, TailwindCSS, shadcn/ui
- Backend: Supabase (Postgres, Auth, RLS)
- Audio Output: ElevenLabs TTS
- Audio Input: Browser mic (Web Audio API)
- Transcription: AssemblyAI or Whisper
- AI: GPT-4o with persona_state memory

## Database Tables

### users (Supabase auth default)

### conversations
- id (uuid, pk)
- user_id (fk → users)
- timestamp (timestamptz)
- transcript_text (text)

### persona_state
- id (uuid, pk)
- user_id (fk → users)
- state_blob (JSONB)
- updated_at (timestamptz)

## AI Persona Design

- Gentle, warm, inviting, non-judgmental
- Reflective, emotionally safe, coaching-oriented
- Personalization adapts over time through state_blob
- Tone and behaviors drawn from existing Lumi voice principles

