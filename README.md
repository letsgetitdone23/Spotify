# Spotify TrueTune (MVP) 🎧

**TrueTune protects your real taste from your temporary context — and proves it, instantly.**

This is a functional MVP prototype built for the **Spotify PM Graduation Project**, specifically targeting the "Taste-Evolving Explorer" user segment.

## 🚀 The Problem
Spotify's recommendation model currently treats every listening event as an equal signal for your taste identity. It makes no distinction between **functional listening** (e.g., studying, working out, sleeping) and **identity listening** (intentional, emotionally invested music exploration). 

Because of this, transient contextual phases (like a lo-fi study playlist binge) can easily corrupt a user's taste profile, leading to repetitive recommendations and stalled discovery of genuinely new music.

## 🛡️ How TrueTune Works

TrueTune solves this with two coupled features that happen seamlessly in real-time:

1. **Shield (Classification)**: Using implicit behavioral signals (skip rate, repeat rate, session length), it detects functional listening sessions without manual tagging, and excludes them from corrupting your taste profile.
2. **Reveal (Discovery)**: Immediately after a session is protected, it surfaces a new track recommendation drawn from your true, uncorrupted taste — so protection and discovery happen in the same breath.

## 💻 Tech Stack
- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Styling**: CSS Modules
- **Icons**: Lucide React
- **Hosting**: Vercel ready

## 🛠️ Getting Started Locally

1. Install the dependencies:
   ```bash
   npm install
   ```
2. Run the development server:
   ```bash
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000) with your browser to interact with the TrueTune MVP.

## 📊 Core MVP Features
- **Session Simulator**: Experience how TrueTune classifies different listening contexts.
- **Shield UI Moment**: Transparently shows why a session was classified as functional and excluded from taste updates.
- **Reveal UI Moment**: Discover new tracks curated from an uncorrupted discovery pool.
- **Your Taste Journey (Dashboard)**: Track user-centric metrics like "Functional sessions protected" and "New artists discovered".
