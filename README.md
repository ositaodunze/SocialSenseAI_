# SocialSense AI 

> Build real social confidence — AI-powered social skills coaching for college students

SocialSense AI is a mobile-first web application that helps students with social anxiety build genuine confidence through real-world conversation practice, AI coaching, and biometric feedback.

## The Problem

Post-pandemic college students are struggling with social anxiety at record rates. 61% report difficulty making friends, and traditional therapy is inaccessible or stigmatized.

## The Solution

SocialSense AI acts as a social confidence coach in your pocket. It records real conversations, analyzes them with AI, and gives personalized feedback to help users improve over time.

## Features

-  **Auth & Onboarding** — Personalized signup flow capturing social anxiety level, interests, and goals
-  **Safe Zone Matching** — Google Maps-powered campus map showing verified public meeting spots
-  **Voice Recording** — Real-time conversation recording with live transcription
-  **Speaker Diarization** — AssemblyAI identifies who said what in the conversation
-  **Sentiment Analysis** — AI analyzes emotional tone and confidence patterns
-  **Biometric Tracking** — Apple Watch heart rate monitoring (simulated for demo)
-  **AR Replay** — Review conversations in augmented reality (Apple Glasses,)
-  **AI Coaching** — Personalized feedback powered by OpenAI GPT-4
-  **Friend System** — Connect with people you've had great conversations with
-  **XP & Leveling** — Gamified progression from Beginner → Connector → Socialite → Catalyst

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, JSX |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Transcription | AssemblyAI (speech-to-text, diarization) |
| Sentiment | AssemblyAI Sentiment Analysis |
| AI Coaching | OpenAI GPT-4 (in progress) |
| Maps | Google Maps API |
| Audio | Web Speech API, MediaRecorder API |
| Biometrics | Apple Watch HRV/HR (simulated) |
| AR | Apple Glasses (simulated) |
| DevOps | GitHub, VS Code |

## Getting Started

### Prerequisites
- Node.js 18+
- npm
- Supabase account
- AssemblyAI API key
- Google Maps API key

### Installation
```bash
git clone https://github.com/ositaodunze/SoscialSenseAI
cd socialsense
npm install
```

### Environment Variables

Create a `.env` file in the root:

### Database Setup

Run the SQL schema in your Supabase SQL Editor:
```sql
-- profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text, email text, photo_url text, major text,
  anxiety_level int, interests text[], goal text, gender text,
  xp int default 0, tier text default 'Beginner',
  convo_count int default 0, streak int default 0,
  created_at timestamp with time zone default timezone('utc', now())
);

-- conversations table
create table public.conversations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id),
  duration_seconds int, transcript text,
  sentiment_score float, avg_heart_rate int,
  audio_url text, turns jsonb, location text,
  created_at timestamp with time zone default timezone('utc', now())
);

-- connections table
create table public.connections (
  id uuid default gen_random_uuid() primary key,
  user_a uuid references public.profiles(id),
  user_b uuid references public.profiles(id),
  status text default 'pending',
  created_at timestamp with time zone default timezone('utc', now())
);
```

### Run Locally
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

