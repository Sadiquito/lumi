# Lumi Implementation Plan

## Phase 1: MVP Build (1 month)

### Core Functionality

* Build landing page with AI-generated fantasy landscape
* User authentication (Google, Apple, Facebook, Email/Password) via Supabase Auth
* Journal page with:

  * Daily AI-generated advice (basic GPT-4o integration)
  * Audio recording via browser mic API (WebRTC)
  * Audio upload to Supabase Storage
  * Transcription pipeline via AssemblyAI
  * Display transcript with AI prompts interwoven
  * Export to PDF/Excel
* Call settings page with scheduling, retry logic, and Twilio Programmable Voice integration
* Subscription page with Stripe integration

  * Pricing: \$33/month or \$333/year
  * Stripe customer portal
* Backend Supabase Postgres schema (users, calls, transcripts, personalization\_state, subscriptions)
* Supabase RLS policies for strict data privacy
* Initial personalization\_state design: evolving JSON profile per user
  AI daily advice refinement via personalization\_state integration

### Technical Setup

* Frontend: Vite + React + Tailwind + shadcn/ui
* Backend: Supabase functions and SQL
* API integrations: OpenAI, AssemblyAI, Twilio, Stripe

### Internal Testing

* Developer access to transcripts for prompt tuning
* Daily call stress testing
* Initial AI persona voice testing

## Phase 2: V1 Launch (2-3 months)

### Additional Features

* Admin dashboard for internal analytics (call success, durations, journaling frequency)
* Export engine for transcript downloads (PDFKit, Pandas, or similar)
* RAG knowledge base MVP with manually curated seed content
* Onboarding flows and first-use experience

### Team Setup (Recommended)

* Full-stack developer (Supabase, React, API integrations)
* AI engineer (prompt engineering, RAG, embeddings)
* Product/design lead (UX/UI, flows, voice consistency)
* Part-time backend advisor (Supabase SQL, RLS, security)

## Phase 3: Post-Launch Expansion (ongoing)

### Growth Features

* Physical printed journal export & purchase flow
* AI persona voice refinement with consistent tone and behavior
* Advanced RAG schema design (ongoing seed content updates)
* More sophisticated retry/call escalation logic
* Internationalization groundwork
* GDPR/HIPAA compliance workup
* Integration with additional coaching frameworks (IFS, CBT, ACT)
* Custom voice models for phone calls

## Optional Tasks & Integrations

* Notion or Airtable integration for content management
* Zapier webhooks for operational workflows
* Advanced Twilio Studio flows for call orchestration
* Admin transcript review tooling (limited, for tuning)

## Potential AI/ML Experiments

* Fine-tuned models using neuroscience/psychology/spirituality corpora
* Sentiment tracking & longitudinal journaling insights
* Personalized growth recommendations based on evolving themes
* Voice-based prompt delivery in real-time during calls

---

## Summary Timeline

| Phase   | Duration   | Outcome                      |
| ------- | ---------- | ---------------------------- |
| Phase 1 | 1 month    | MVP soft-launch              |
| Phase 2 | 2 months   | Full V1 launch               |
| Phase 3 | Ongoing    | Continuous feature expansion |
