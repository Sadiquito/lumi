# Lumi Masterplan

## App Overview and Objectives

**Lumi** is an AI-native audio journaling platform designed to dramatically lower the friction for journaling by using proactive daily phone calls and adaptive, AI-powered guidance. Lumi serves as a comforting, non-intrusive companion, helping users build lasting journaling habits and personal growth through reflection, emotional processing, and gentle coaching.

## Target Audience

* Habit-builders seeking daily self-reflection
* Individuals exploring personal growth, mindfulness, coaching, and mental wellness
* Users frustrated by the friction of written journaling
* Tech-savvy users open to AI-powered emotional support

## Core Features and Functionality

* **Landing Page**: Beautiful AI-generated fantasy landscape; inviting tagline and CTA for login/signup.
* **Journal Page**: Daily AI-generated advice; on-demand journaling via audio; transcript display with AI prompts interwoven; export options (PDF/Excel); placeholder for physical journal purchase.
* **Call Settings**: Schedule daily calls; configure retry logic; select phone number and channel (Phone/WhatsApp).
* **Admin Dashboard**: Internal-only statistics on user activity, system health, and call metrics.
* **Subscription Management**: Integrated with Stripe; \$35/month or \$350/year.
* **AI Personalization**: Adaptive prompts generated from evolving user profiles, incorporating neuroscience, psychology, and spirituality.
* **Export Engine**: Generate downloadable summaries of journaling history.

## High-Level Technical Stack Recommendations

* **Frontend**: Vite, TypeScript, React, Tailwind CSS, shadcn/ui
* **Backend & Storage**: Supabase (Postgres, Auth, Storage, RLS policies)
* **Authentication**: Google, Apple, Facebook OAuth + email/password
* **AI Models**: GPT-4o, OpenAI embeddings, custom RAG pipeline
* **Transcription**: AssemblyAI
* **Telephony**: Twilio Programmable Voice
* **Payments**: Stripe

## Conceptual Data Model

### Tables

* **users**: id, email, name, created\_at, auth\_provider, phone\_number
* **calls**: id, user\_id, scheduled\_time, call\_status, call\_duration\_minutes
* **transcripts**: id, user\_id, call\_id, transcript\_text, ai\_prompts, advice\_summary, created\_at
* **personalization\_state**: id, user\_id, state\_blob (jsonb), updated\_at
* **subscriptions**: id, user\_id, stripe\_customer\_id, subscription\_status, created\_at

## User Interface Design Principles

* Cozy, calming, inviting; promotes emotional safety
* Minimalist mobile-first layout with generous whitespace
* Card-based layout
* Fantasy-inspired visuals with forest, cabin, and starry sky themes
* Primary color: #5E4B3B (earthy wood)
* Accent color: #88BDBC (soft aquamarine blue)
* Font: Inter
* Mood: "Your special place" for introspection and comfort

## Security Considerations

* Supabase RLS for strict data privacy
* No transcript access beyond developer testing phase
* Secure authentication with OAuth providers
* Stripe customer portal for secure payment management
* GDPR and HIPAA considerations as future compliance milestones

## Development Phases or Milestones

### Phase 1: MVP (3-4 months)

* Core journaling flows (landing, journal page, call settings)
* Twilio call integration
* AssemblyAI transcription pipeline
* Supabase backend and authentication
* Stripe subscription system
* Basic RAG pipeline with manual seed content

### Phase 2: V1 Launch (2-3 months)

* Admin dashboard
* Export engine (PDF/Excel)
* AI persona voice refinement
* Personalization state and adaptive prompts
* Initial curated seed content for RAG

### Phase 3: Expansion (ongoing)

* Print journal integration
* Fine-tuned AI models with domain-specific knowledge
* Internationalization
* Advanced analytics for user insights
* Real-time adaptive prompt adjustments

## Potential Challenges and Solutions

* **Telephony reliability**: Use Twilio retries and call status webhooks.
* **Data privacy**: Strong Supabase RLS; developer-only transcript access.
* **AI hallucination risk**: Careful prompt engineering; curated RAG seed content.
* **Voice persona consistency**: Extensive prompt testing, voice alignment docs.
* **RAG knowledge base quality**: Build curation workflows and source pipelines.

## Future Expansion Possibilities

* Multilingual support
* Deeper AI coaching modes (IFS, CBT, ACT frameworks)
* API integrations with existing journaling or therapy platforms
* Custom voice models for phone calls
* Founder-curated spiritual and psychological content modules
