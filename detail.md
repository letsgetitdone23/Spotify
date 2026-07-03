# TrueTune — Full Project Documentation

> A hypothetical Spotify feature concept built as a Next.js MVP for the NextLeap PM Graduation Project.  
> **Not affiliated with, endorsed by, or produced by Spotify.**

---

## Table of Contents

1. [What Is TrueTune?](#1-what-is-truetune)
2. [The Problem It Solves](#2-the-problem-it-solves)
3. [The Target User](#3-the-target-user)
4. [How TrueTune Works — Core Concept](#4-how-truetune-works--core-concept)
5. [Feature Overview](#5-feature-overview)
6. [Full User Journeys](#6-full-user-journeys)
   - [Journey A: Functional Session (Shield + Reveal)](#journey-a-functional-session-shield--reveal)
   - [Journey B: Identity Session (Toast + Reveal)](#journey-b-identity-session-toast--reveal)
   - [Journey C: Manual Override Flow](#journey-c-manual-override-flow)
   - [Journey D: Explore Taste Journey Screen](#journey-d-explore-taste-journey-screen)
7. [Screen-by-Screen Breakdown](#7-screen-by-screen-breakdown)
8. [Data Architecture](#8-data-architecture)
9. [AI Classification Engine](#9-ai-classification-engine)
10. [Tech Stack](#10-tech-stack)
11. [Seed Data Reference](#11-seed-data-reference)
12. [Key Product Decisions](#12-key-product-decisions)
13. [Metrics & What They Measure](#13-metrics--what-they-measure)
14. [Definition of Done](#14-definition-of-done)

---

## 1. What Is TrueTune?

TrueTune is a **hypothetical Spotify feature** — not a standalone app. It appears inside Spotify the same way real Spotify features like "Discover Weekly," "AI DJ," or "Radio" do: as a named capability within the existing app shell.

Its job is two-fold:
1. **Shield** — Detect when a listening session is *functional* (studying, gym, sleep) and protect the user's real taste profile from being corrupted by it.
2. **Reveal** — After any classified session (functional *or* identity-driven), surface one genuinely new track from a curated discovery pool that is adjacent to the user's true, uncorrupted taste.

The MVP is built as a **mobile-styled Next.js web app** deployed to Vercel, presented inside a centered phone-frame UI that mimics the real Spotify app experience.

---

## 2. The Problem It Solves

Spotify's recommendation engine treats **every listening event as an equal signal for taste identity**. It cannot distinguish between:

- **Functional listening** — studying with a lo-fi playlist, working out to gym tracks, falling asleep to ambient noise. These are *context-driven*, not taste-driven.
- **Identity listening** — intentionally exploring new music, emotionally engaged curation, discovering something that represents who you are becoming.

Because of this blindspot:

1. **Taste profiles get corrupted.** A two-week lo-fi study phase tells Spotify you're suddenly a lo-fi person. Your Discover Weekly shifts accordingly. This dilutes the quality of future recommendations.
2. **Discovery stalls.** With a noisy signal, Spotify plays it safe and keeps recommending familiar-feeling music. The user never hears anything genuinely new.
3. **Users self-censor.** Real users (documented in primary research) avoid opening sleep playlists or gym mixes because they're worried Spotify will misread it as their new personality — *algorithm corruption anxiety*.

**The root cause:** The system lacks session-intent awareness. It cannot tell the *why* behind a listening event — only the *what*.

TrueTune fixes this with an AI classifier that infers session intent from implicit behavioral signals, without requiring any manual tagging from the user.

---

## 3. The Target User

**Segment: Taste-Evolving Explorer (TEE)**

An active, emotionally invested daily listener who:
- Has a large library (250–2,000 saved songs) but only ~40–100 surface on shuffle
- Discovers music off-platform (Instagram, YouTube, Reddit) and comes to Spotify to save it
- Experiences "contextual lock-in" — a lo-fi study phase locks them in lo-fi recommendations for months
- Has tried to "confuse" the algorithm (deliberate skips, shuffles restarts) with no visible result
- **Self-censors** playlist listening to protect their recommendation profile

**Anchor Persona: Ananya**
> *"I sometimes avoid listening to certain playlists because I'm worried Spotify will think that's my new personality."*

Ananya has 2,000 saved songs. Only 40–50 surface on shuffle. She avoids her sleep playlist and Christmas music entirely because she's seen what they do to her Discover Weekly. She wants Spotify to understand she's *changing* — not lock her into who she was last month.

**Why this segment:**
- Highest app-exit rate (64% open another app when repetition hits)
- 73% are already Premium or actively switching → retention play, not acquisition
- Research (Anderson et al., 2020, using Spotify's own data) ties consumption diversity directly to higher conversion and retention

---

## 4. How TrueTune Works — Core Concept

```
User plays music (a session starts)
         ↓
TrueTune monitors session signals in real time:
  - Skip rate
  - Repeat rate
  - Session length / time elapsed
  - Time of day
  - Playlist name / metadata
  - Genre diversity across tracks played
         ↓
AI Classifier (Groq → Llama-3.3-70b-versatile) outputs:
  {
    classification: "functional" | "identity",
    confidence: 0.0–1.0,
    reasoning: ["signal 1", "signal 2", "signal 3"]
  }
         ↓
┌──────────────────────┬──────────────────────────────┐
│   IF FUNCTIONAL      │   IF IDENTITY                │
│                      │                              │
│  Shield Card fires:  │  Toast appears briefly:      │
│  "This session won't │  "You're actively exploring  │
│  shape your Taste    │  — this is shaping your      │
│  Profile. Here's     │  real taste."                │
│  why: [3 AI bullets] │  (auto-dismisses in 3s)      │
│                      │                              │
│  → Reveal Card fires │  → Reveal Card fires         │
│    (shield trigger)  │    (identity trigger)        │
└──────────────────────┴──────────────────────────────┘
         ↓
Reveal Card (both paths share same component, different headline):
  - Shows 1 track from discovery_pool (never-saved, genre-adjacent)
  - Genre/mood filter chips for user to steer direction
  - Actions: Play | Save | Skip
         ↓
Save → moves track from discovery_pool into library (pool: "known_identity")
     → increments "New Artists Discovered" counter
     → adds genre to "Your Growing Genres" tag cloud
Skip → re-rolls a different track (skipped track excluded)
Done → navigates to "Your Taste Journey" to see updated metrics
```

---

## 5. Feature Overview

| Feature | Description |
|---|---|
| **Session Simulator** | 5 pre-seeded scenarios that mimic real listening sessions with different telemetry signals |
| **Now Playing Screen** | Full-screen animated track cycling through session's track list |
| **AI Classification** | Groq API (Llama-3.3-70b) classifies sessions as functional or identity with confidence score + 3 reasoning bullets |
| **Shield Card** | Bottom sheet overlay for functional sessions — shows reasoning, confidence %, and TrueTune Shield label |
| **Reveal Card** | Bottom sheet with a discovery track recommendation from discovery_pool, with genre/mood filter chips and Play/Save/Skip actions |
| **Identity Toast** | Non-blocking banner at top of Now Playing for identity sessions — auto-dismisses after 3 seconds |
| **Playlist Status Badges** | 🛡️ Protected / 🌱 Shaping your taste badges shown on playlist cards in Home and Library views |
| **Manual Override Menu** | ••• menu on each playlist card with 3 options: Auto-detect / Always functional / Always identity. Bypasses Groq API when forced. |
| **Your Taste Journey** | Renamed Insights screen — shows focus sessions protected count, new artists discovered count, and a genre tag cloud |
| **Discovered Artists Modal** | Tap "New Artists Discovered" stat to see the full list of artists discovered via Reveal saves |
| **Library Screen** | Tabs for Playlists (with override menu), Saved Discovery tracks, and Discovered Artists |
| **Session Guard Log** | History of all simulated sessions showing classification, confidence, date |

---

## 6. Full User Journeys

---

### Journey A: Functional Session (Shield + Reveal)

**Scenario:** Ananya opens the app to run a simulation of her 3am study session.

**Steps:**

1. **Home Screen** — Ananya sees the app in Spotify's visual identity. She notices "Deep Focus Lo-Fi" in her Recents has a 🛡️ Protected badge from a previous session. She taps the "Simulate" nav item.

2. **Simulate a Session Screen** — She sees 5 scenario cards listed by their human-readable labels. She taps **"3am study session"** — the scenario matching her Deep Focus Lo-Fi playlist.

3. **Now Playing Screen** — The screen transitions to a full-screen Now Playing view. The track art cycles animated through the session's 5 tracks. The header shows "SIMULATOR ACTIVE" and the session label. Playback auto-progresses every few seconds.

4. **Classification Trigger** — When the last track finishes, playback stops. A loading overlay appears: *"TrueTune Analysis Active — Querying Groq ML classifier engine with session telemetry signals..."* The spinner rotates while the API call is made.

5. **Shield Card Slides Up** — A bottom sheet slides up over the dimmed Now Playing screen:
   - **TrueTune Shield** pill label (top left)
   - **95% Confidence** badge (top right)
   - Large shield icon with green glow
   - **"This session was protected"** headline
   - Subtext: "We identified this as a functional background session. Plays will not influence your Taste Profile."
   - **Signals Detected by AI:** 3 reasoning bullets (e.g., "Playlist name 'Deep Focus Lo-Fi' indicates a study/work environment", "Extremely low skip rate (4%)...", "High repeat rate (60%)...")
   - **"Got it"** button

6. **Reveal Card Slides Up** — After tapping Got it, the Reveal card appears:
   - **TrueTune Reveal** pill label
   - Headline: *"Since your profile's protected, here's something new:"*
   - A row of filter chips: All | Dream Pop | Indie Folk | Indie Hindi | Carnatic Fusion | Warm | Soulful | Dreamy
   - A recommended track card showing title, artist, genre • mood tags (e.g., "Ivory Bloom by Mira Solden — Indie folk · warm, hopeful")
   - Three actions: **Play** | **Save** | **Skip recommendation**
   - A "Done" button at the bottom

7. **Ananya taps Save** — The button turns green with a heart icon. The track is moved from `discovery_pool` into her `library` with `pool: "known_identity"`. A toast appears: "Added to Your Library."

8. **She taps Done** — The app navigates to **Your Taste Journey**, where she can see:
   - **3 focus sessions protected** (updated counter)
   - **2 new artists discovered** (updated if this is a new artist)
   - Her growing genre tag cloud now includes "Indie folk"

---

### Journey B: Identity Session (Toast + Reveal)

**Scenario:** Aarav simulates his Saturday afternoon of free music exploration.

**Steps:**

1. **Simulate Screen** — Aarav taps **"Saturday afternoon exploring"** (s02). This session has high skip rate (35%), no playlist, high genre diversity — clear identity markers.

2. **Now Playing Screen** — Tracks cycle. He sees a mix of indie rock, electronic, carnatic fusion.

3. **Classification** — Session ends. Loading overlay appears briefly.

4. **Identity Toast** — Instead of a Shield card, a small banner appears near the top of the Now Playing screen with a green-tinted dark background:
   > 🌿 "You're actively exploring — this is shaping your real taste."
   
   This auto-dismisses after 3 seconds. No user action needed.

5. **Reveal Card Slides Up** — Immediately after the toast disappears, the Reveal card appears with a **different headline**:
   > *"You're on a roll — here's another direction worth exploring:"*
   
   Everything else is identical to the functional-path Reveal: same filter chips, same discovery pool, same Play/Save/Skip logic.

6. **Aarav taps a filter chip** — He taps "Carnatic Fusion." The recommendation re-filters to tracks with that genre or mood tag. A new track appears: "Ratnakar by Kavya Menon — Carnatic fusion · soulful, meditative."

7. **He taps Skip** — The current track is excluded and a different track from the Carnatic Fusion pool surfaces. Skip never moves any track or updates any counter.

8. **He taps Save** — New artist, new genre saved. Navigates to Your Taste Journey.

---

### Journey C: Manual Override Flow

**Scenario:** Ananya is tired of TrueTune misclassifying her evening playlist as identity. She wants to force it to always be treated as functional.

**Steps:**

1. **Library Screen (Playlists tab)** — Ananya taps the Library icon in the bottom nav. She sees all her playlists listed with their current override status and last classification badge.

2. **Tap ••• on "Evening Wind Down"** — A bottom sheet slides up titled "Evening Wind Down" with three options:
   - ✅ **Auto-detect (Recommended)** — TrueTune will dynamically classify session telemetry (currently selected, shown with checkmark)
   - **Always Treat as Functional** — Always protect library from this playlist
   - **Always Treat as Identity** — Always allow this playlist to shape discovery insights

3. **She taps "Always Treat as Functional"** — A toast appears: "Override updated for 'Evening Wind Down'." The menu closes.

4. **Back on Home** — The "Evening Wind Down" playlist card now shows "Always functional" as its subtitle. Its 🛡️ Protected badge persists from the override.

5. **She simulates "Borderline: quiet evening"** — This session uses "Evening Wind Down" as its playlist. When it finishes, the app detects the override. **No Groq API call is made.** Instead:
   - A brief 800ms delay for UX realism
   - Shield card appears with reasoning: *"Manual override: playlist 'Evening Wind Down' is forced to functional."*
   - Confidence shows 100%.

6. **She taps the ••• menu again** — Selects **Auto-detect**. Checkmark moves back. Next session will use the real classifier.

---

### Journey D: Explore Taste Journey Screen

**Scenario:** After running 3 sessions, Ananya checks her Taste Journey to see how TrueTune is working for her.

**Steps:**

1. **Tap "Taste Journey" in bottom nav** — Navigates to the Your Taste Journey screen.

2. **Stat 1 — Focus Sessions Protected:**
   - Large number (e.g., **3**)
   - Label: "focus sessions protected"
   - Subtext: "Your real taste stayed untouched during study/gym/sleep sessions."

3. **Stat 2 — New Artists Discovered (Tappable):**
   - Large number (e.g., **2**)
   - Label: "new artists discovered" (underlined, in green)
   - Subtext: "Unique artists introduced through TrueTune Reveal recommended tracks."
   - Tap → opens a bottom sheet listing all discovered artists by name with gradient avatars.

4. **Your Growing Genres tag cloud:**
   - Genre pills sized by frequency among saved Reveal tracks.
   - E.g., "Indie folk" (large) · "Carnatic fusion" (medium) · "Dream pop" (small)
   - Empty state if no saves yet.

5. **Session Guard Log:**
   - Chronological list of all simulated sessions.
   - Each entry shows: session label, date, confidence %, and a Shielded / Identity badge.

6. **Reset Button** — "Reset Taste Journey & History" — clears all counters, history, overrides, and restores original seed data for a fresh demo run.

---

## 7. Screen-by-Screen Breakdown

### Screen 1: Home
- **Status bar** (time, wifi, battery)
- **Header:** Profile avatar + All / Music / Podcasts filter pills + sparkle icon
- **Recommended Stations:** Horizontal carousel (Lo-Fi Lullabies, Gym Hype Mix, Indian Fusion Radio)
- **Recents:** Playlist cards with 🛡️ / 🌱 status badges, ••• override menus
- **Quick Simulate Scenarios:** Shortcut cards to each of the 5 sessions
- **TrueTune Taste Guard Active** info widget
- **Bottom nav:** Home | Simulate | Taste Journey | Library | Search

### Screen 2: Simulate a Session
- Header + refresh icon
- Descriptive subtitle
- 5 session cards (icon, label, playlist, duration/skip/repeat stats, play arrow)

### Screen 3: Now Playing
- Full-screen gradient art (cycling per track)
- Status bar
- Back chevron → returns to Simulate
- "SIMULATOR ACTIVE" label + session label
- 🛡️ Protected / 🌱 Shaping your taste badge (appears post-classification)
- Track art with "TRACK X OF Y" counter
- Track title, artist, genre chip
- Progress bar (auto-advances)
- Playback controls (Shuffle, Prev, Play/Pause, Next, Shield)

### Screen 4: Shield Card (Bottom Sheet)
- Handle bar
- TrueTune Shield pill + Confidence badge
- Shield icon (green circle)
- "This session was protected" headline
- Functional session explanation
- AI reasoning bullets (3 items)
- "Got it" button

### Screen 5: Reveal Card (Bottom Sheet)
- Handle bar (green tinted)
- TrueTune Reveal pill + "Protected Taste Pool" label
- Headline (varies by trigger: Shield vs. Identity)
- Genre/mood filter chips (scrollable)
- Recommendation track card (art gradient, title, artist, genre · mood)
- Play + Save buttons
- Skip recommendation (text link)
- Done button

### Screen 6: Your Taste Journey
- Header + compass icon
- Descriptive subtitle
- 2 stat cards (Focus Sessions Protected, New Artists Discovered — tappable)
- Your Growing Genres tag cloud
- Session Guard Log (history list)
- Reset button

### Screen 7: Your Library
- Tabs: Playlists | Saved Discovery | Artists
- **Playlists tab:** All playlists with status badge, override indicator, ••• menu
- **Saved Discovery tab:** Saved Reveal tracks with genre labels
- **Artists tab:** All discovered artists with gradient avatar, "Discovered via TrueTune" label

### Screen 8: Search
- Search bar mockup
- Browse all grid (Podcasts, Made For You, New Releases, etc.)

### Overlay: Discovered Artists Modal
- Bottom sheet listing all discovered artists
- Close button

### Overlay: Playlist Override Menu
- Bottom sheet with 3 options (Auto-detect, Always functional, Always identity)
- Checkmark on active selection
- Cancel button

---

## 8. Data Architecture

All data is in-memory (no database). State lives in React `useState` hooks in [page.js](./src/app/page.js). Seed data is loaded from [seed_data.json](./src/data/seed_data.json).

### Core State Objects

| State | Type | Purpose |
|---|---|---|
| `library` | `Array` | User's full track library (functional_only + known_identity pools) |
| `discoveryPool` | `Array` | 8 tracks the user has never saved — source for Reveal recommendations |
| `playlistOverrides` | `Object` | Keyed by playlist name; stores `{ override, last_classification }` |
| `revealSaves` | `Array` | All tracks saved via Reveal — `{ track_id, artist, genre }` |
| `functionalSessionsProtected` | `number` | Running count of shield-fired sessions |
| `runHistory` | `Array` | Log of all classified sessions |
| `savedTracksSet` | `Set` | Track IDs the user has saved |

### Pool System
- `pool: "functional_only"` — tracks used for background/functional session playback (lo-fi, gym). Never recommended in Reveal.
- `pool: "known_identity"` — tracks the user has intentionally saved. Part of taste identity. Not recommended in Reveal (user already has them).
- `discovery_pool` — separate array in seed_data. Tracks the user has *never* saved. Genre-adjacent to known_identity tracks. **This is the only source for Reveal recommendations.**

**Save behavior:** Saving a Reveal track moves it from `discovery_pool` → `library` with `pool: "known_identity"`, and removes it from future Reveal candidates.

---

## 9. AI Classification Engine

### API Route
`POST /api/classify` ([route.js](./src/app/api/classify/route.js))

The server-side Next.js API route keeps the Groq API key off the client bundle.

### Request Body (full session object)
```json
{
  "session_id": "s01",
  "playlist_name": "Deep Focus Lo-Fi",
  "skip_rate": 0.04,
  "repeat_rate": 0.6,
  "session_length_minutes": 95,
  "time_of_day": "03:10",
  "genre_diversity": "low",
  "tracks_played": ["t001", "t001", "t003", "t001", "t004"]
}
```

### Response
```json
{
  "classification": "functional",
  "confidence": 0.95,
  "reasoning": [
    "Playlist name 'Deep Focus Lo-Fi' indicates a study/work environment.",
    "Extremely low skip rate (4%) suggests passive background listening.",
    "High repeat rate (60%) is characteristic of repetitive focus tracks."
  ],
  "isMock": false
}
```

### Model
- **Provider:** Groq (free tier)
- **Model:** `llama-3.3-70b-versatile`
- **Temperature:** 0.1 (near-deterministic, consistent outputs)
- **response_format:** `{ type: "json_object" }` (strict JSON output)

### Fallback (no API key)
If `GROQ_API_KEY` is not configured, the route returns pre-defined mock results for sessions s01–s05, and a general rule-based fallback for dynamic sessions. This enables full UI testing without a Groq account.

### Manual Override Bypass
If a playlist has `override: "force_functional"` or `"force_identity"`, the Groq API call is **skipped entirely**. The forced classification is applied directly with a 800ms simulated delay. This is both a UX correctness measure and a minor efficiency win.

---

## 10. Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16.2.10 (App Router) |
| **Runtime** | React 19.2.4 |
| **Styling** | Vanilla CSS (globals.css — no Tailwind) |
| **Icons** | lucide-react |
| **Fonts** | Google Fonts — Outfit (display) + Inter (body) |
| **AI / LLM** | Groq API → Llama-3.3-70b-versatile |
| **API Route** | Next.js Route Handler (`/app/api/classify/route.js`) |
| **Data** | JSON seed file (`/src/data/seed_data.json`) |
| **State** | React useState (in-memory, no persistence) |
| **Deployment** | Vercel (recommended) |

---

## 11. Seed Data Reference

### Library (22 tracks)

| Pool | Tracks | Genre |
|---|---|---|
| `functional_only` | t001–t004 (lo-fi), t013–t018 (gym/electronic/hindi lo-fi/punjabi hip-hop) | Lo-fi, Electronic, Hindi Lo-Fi, Punjabi Hip-Hop |
| `known_identity` | t005–t012 (indie folk, indie rock, dream pop, post-rock, electronic), t019–t022 (indie hindi, carnatic fusion, ghazal fusion) | Indie Folk, Indie Rock, Dream Pop, Post-Rock, Electronic, Indie Hindi, Carnatic Fusion, Ghazal Fusion |

### Discovery Pool (8 tracks — Reveal source)

| ID | Title | Artist | Genre | Mood Tags |
|---|---|---|---|---|
| d001 | Ivory Bloom | Mira Solden | Indie folk | warm, hopeful |
| d002 | Static Bloom | Nordveil | Post-rock | cinematic, expansive |
| d003 | Faded Neon | Comet Youth | Electronic | euphoric, nostalgic |
| d004 | Hollow Orbit | Isla Moon | Dream pop | ethereal, soft |
| d005 | Tideline | The Faint Parade | Indie rock | energetic, hopeful |
| d006 | Ratnakar | Kavya Menon | Carnatic fusion | soulful, meditative |
| d007 | Bheegi Yaadein | Ishaan Dutt | Indie hindi | nostalgic, warm |
| d008 | Zar-e-Khwab | Anahita Rao | Ghazal fusion | melancholy, dreamy |

### Sessions (5 scenarios)

| ID | Label | Playlist | Expected Classification |
|---|---|---|---|
| s01 | 3am study session | Deep Focus Lo-Fi | functional (~95% confidence) |
| s02 | Saturday afternoon exploring | None (direct queue) | identity (~92% confidence) |
| s03 | Morning gym session | Gym Power Hour | functional (~90% confidence) |
| s04 | Late night discovery scroll | None (direct queue) | identity (~88% confidence) |
| s05 | Borderline: quiet evening, single playlist | Evening Wind Down | functional borderline (~55–65% confidence) |

---

## 12. Key Product Decisions

### Why Reveal fires on *both* paths (functional AND identity)
Without Reveal on the identity path, discovery would only ever happen after a session gets shielded. That means a user who's already doing healthy, identity-driven exploration gets nothing from the feature — they'd have to deliberately listen to something functional just to trigger a recommendation. This is backwards. Reveal now fires on both paths with different framing; the underlying component and pool are identical.

### Why `discovery_pool` instead of `library` for Reveal
Recommending tracks already in the user's library is *rediscovery*, not discovery. It's closer to Deep Shuffle (a deprioritized solution). For "new artists discovered" to mean anything, Reveal must only surface tracks the user has never saved. The `discovery_pool` is genre/mood-adjacent to the user's `known_identity` cluster, ensuring recommendations feel relevant without being already-familiar.

### Why TrueTune is a feature badge, not the app name
Spotify already has precedent for named features within the app (Discover Weekly, AI DJ, Blend). TrueTune follows the same pattern — the app shell is Spotify, the feature has its own identity only inside the Shield and Reveal moments. This makes the concept credible as a real Spotify feature rather than a fictional competitor.

### Why AI instead of manual rules
The existing Spotify "Exclude from Taste Profile" toggle is manual. The user must identify a playlist themselves and remember to tag it. A rule-based system can only act on what's been explicitly labeled. The AI classifier solves the *unlabeled* case — detecting a functional session from behavioral signals alone, automatically, every time. Manual override is kept as a trust/control layer, not the primary mechanism.

### Why the override skips the Groq API call entirely
If a user has explicitly told the system "always treat this as functional," calling the AI classifier anyway and then ignoring its output is wasteful and potentially confusing. The override is the user's signal of higher confidence than the AI. Skipping the call is both more efficient and more semantically correct.

---

## 13. Metrics & What They Measure

### User-Facing (Your Taste Journey Screen)

| Display | Underlying Metric | What It Proves |
|---|---|---|
| **X focus sessions protected** | Count of sessions where Shield fired (functional classification confirmed) | TrueTune is actively working — proof of shield events |
| **Y new artists discovered** | Count of distinct artists across saved Reveal tracks | Actual discovery outcome — not a rate, a concrete result |
| **Your Growing Genres** | Genre tag cloud from saved Reveal track genres (sized by frequency) | Taste breadth is visibly expanding |

### Backend / PM Metrics (for deck/Q&A)

| Metric | Formula | Why It Matters |
|---|---|---|
| **Taste Profile Protection Rate** | (Sessions classified functional & shielded) / (All functional sessions) | Accuracy of the classifier on the functional side |
| **Post-Shield Save Rate** | (Reveal tracks saved) / (Shield events fired) | Quality of Reveal recommendations — are they worth saving? |
| **Discovery Rate** | (Sessions where user saves a Reveal track) / (All sessions) | Top-line discovery outcome |
| **Genre Diversity Index** | Breadth of genres in `reveal_saves` over time | Leading indicator of TEE satisfaction |

---

## 14. Definition of Done

The MVP is considered complete when:

- [ ] All 5 seeded sessions run end-to-end without errors
- [ ] Session s05 (borderline) returns a mid-range confidence score (~55–65%), not a confident call
- [ ] Identity sessions (s02, s04) show the toast banner — **not** silence
- [ ] Toast auto-dismisses after ~3 seconds and Reveal card appears immediately after
- [ ] Reveal card shows the correct headline variant based on trigger (shield vs. identity)
- [ ] Reveal card's filter chips re-filter the recommendation by tapped tag
- [ ] Reveal card displays the selected track's genre and mood tags beneath title/artist
- [ ] Skip surfaces a different track, does not repeat the skipped one
- [ ] Save moves the track from discovery_pool into library and increments artist/genre counts
- [ ] Setting a playlist override to "Always functional" bypasses Groq and fires Shield directly
- [ ] Resetting back to "Auto-detect" restores normal classifier behavior on next run
- [ ] Your Taste Journey counters and genre cloud update correctly after each session
- [ ] Playlist status badges appear on Home carousel cards and Library list after classification
- [ ] App is deployed to Vercel with a public production URL
- [ ] Disclaimer is visible on every screen

---

*Built by Challagulla Dedipya — NextLeap PM Graduation Project, 2026.*  
*TrueTune is a student concept demo. Not affiliated with Spotify AB.*
