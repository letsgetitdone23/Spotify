# TrueTune — MVP Build Specification
> Formerly "Functional Listening Shield + Reveal." Built for the Spotify PM Graduation Project — Taste-Evolving Explorer segment.

---

## 1. One-Line Summary

**TrueTune protects a user's real taste profile from being corrupted by functional listening (studying, gym, sleep) — and the moment it protects a session, it immediately shows the user a recommendation drawn from their true, uncorrupted taste, so protection and discovery happen in the same breath.**

---

## 2. The Problem (Root Cause)

Spotify's recommendation model treats every listening event as an equal signal for taste identity. It makes no distinction between:
- **Functional listening** — studying, working out, sleeping, background noise
- **Identity listening** — intentional, emotionally invested exploration

Because of this, short, transient contextual phases (a lo-fi study phase, a workout playlist binge) permanently overwrite a user's taste profile. This produces two compounding failures:

1. **Repetitive recommendations** — the taste profile is diluted by noise, so the system keeps recommending "safe" tracks that match the corrupted average, not the user's actual evolving taste.
2. **Stalled discovery** — because the signal is corrupted, the system has no clean basis from which to confidently recommend something genuinely new.

Users have already built manual workarounds for this — most notably, self-censoring their own listening (avoiding certain playlists to protect their profile), which is itself evidence the problem is real and already changing behavior.

---

## 3. Target User Segment

**Taste-Evolving Explorer (TEE):** Active, emotionally invested daily listeners with large libraries (250–2,000 songs) who discover new music off-platform (Instagram, YouTube, Reddit) and come to Spotify to save and listen. They want Spotify to help them grow their taste, not reflect who they were last week.

**Anchor persona for this MVP:** Ananya — avoids opening certain playlists (sleep, Christmas) because she worries Spotify will misread them as her new taste. 2,000 saved songs, but only 40–50 surface on shuffle.

**Anchor quote (north star):** *"I sometimes avoid listening to certain playlists because I'm worried Spotify will think that's my new personality."*

---

## 4. Why This Solves the Business Problem

- TEE has the highest app-exit rate on repetition (64% open another app when repetition hits)
- 73% of TEE users are already Premium or actively switching — this is a retention play on high-value users, not a cold-acquisition bet
- Published research (Anderson et al., 2020, using Spotify's own data) ties diversity of consumption directly to higher conversion and retention
- Directly serves both halves of the stated strategic goal: **reduce repetitive listening** (via Shield) and **increase meaningful discovery** (via Reveal) — not just one

**Tier availability:** TrueTune launches Premium-only, consistent with Spotify's own AI feature rollout pattern (AI DJ and Prompted Playlist beta both launched Premium-first). This matches the retention framing above — it's a defensive/loyalty play on high-value subscribers, not a conversion feature. The free-tier population (77% of TEE, per the survey) represents a stated future-expansion direction, not something this MVP needs to solve.

---

## 5. What TrueTune Does (Functional Overview)

TrueTune has two coupled parts that always fire together as one flow:

### Part A — Shield (Classification)
Classifies each listening session in real time as **functional** or **identity-driven**, using implicit behavioral signals — no manual tagging required from the user. If classified as functional, that session's plays are **excluded from taste-profile updates**.

### Part B — Reveal (Discovery)
Immediately after any session is classified — functional or identity — the user sees one surfaced recommendation — a track the user has **never saved**, drawn from a discovery pool that's genre/mood-adjacent to their protected, uncorrupted taste signal (not simply resurfaced from their existing library — that would just be rediscovery, not discovery). Reveal fires from **two trigger contexts**, sharing the same mechanism and pool but with different framing:
- **After a Shield event (functional session):** *"Since your profile's protected, here's something new"*
- **After an identity-session toast:** *"You're on a roll — here's another direction worth exploring"*

The recommendation is shown with its genre/mood (e.g. "Indie folk · warm, nostalgic") so the taste-evolution claim is visible, not just asserted. The user can Play, Save, or Skip it — Skip simply dismisses the card with no penalty and surfaces a different candidate, keeping the moment low-pressure rather than a forced choice. **Saving a track moves it into the user's real library as an explicit identity-taste addition** — it's the strongest identity signal in the product, and always counts toward "shaping your taste," never toward "protected" (which describes session exclusion, not track ownership).

**Why this covers both halves of the strategic goal, for every session type:** Shield (functional path) reduces repetition by protecting signal. Reveal (fires on both paths) increases discovery regardless of what kind of session just happened — protected or already-healthy. This closes a real gap: a user who's already doing great, identity-driven exploration shouldn't get nothing from the feature just because there was nothing to protect.

---

## 6. Why AI Is Uniquely Suited to This Problem

This section should appear explicitly in the MVP demo and the deck — it's a direct requirement of the brief.

### Why traditional (rule-based) recommendation systems are insufficient
Spotify's current closest equivalent — "Exclude from Taste Profile" — is **manual and explicit**. The user must identify a playlist themselves and tag it. A rule-based system can only act on what a human has already labeled. It cannot detect an *unlabeled* functional session on its own, and it cannot generalize — every new context (a new gym playlist, a new study playlist) requires the user to manually flag it again.

### What AI unlocks that was previously difficult
**Implicit, real-time session-intent classification.** Determining "is this session functional or identity-driven" from a noisy combination of signals — skip rate, repeat rate, session length, time of day, playlist metadata — is a pattern-recognition problem across multiple weakly-correlated variables. This is exactly the class of problem traditional rule-based/heuristic systems handle poorly and ML-based classification handles well, because it needs to weigh and combine signals probabilistically rather than match against a fixed rule.

### How AI changes the user experience
The experience shifts from **"user manages the algorithm"** (manually tagging playlists, restarting shuffle, avoiding certain playlists out of anxiety) to **"the algorithm understands context and acts on the user's behalf, invisibly — and then proves it."** Ananya never has to remember to protect her sleep playlist. The system already knows, and shows her a discovery moment that wouldn't have existed if it hadn't known.

---

## 7. Core User Flow (for the MVP prototype)

```
1. User plays music (session starts)
   ↓
2. TrueTune monitors session signals in real time:
   - skip rate
   - repeat rate
   - session length / time elapsed
   - time of day
   - playlist name/metadata (if available)
   ↓
3. Classification engine outputs: FUNCTIONAL or IDENTITY session
   (with a confidence score)
   ↓
4a. IF FUNCTIONAL:
    - Session excluded from taste-profile update
    - UI surfaces: "This session looks like focus/study listening —
      it won't shape your Taste Profile. Here's why: [top 2–3 signals]"
    - Immediately followed by: "Since we protected your profile,
      here's something that matches who you're actually becoming"
      → 1 recommended track pulled from protected/identity-listening history,
      shown with genre/mood, with Play / Save / Skip
   ↓
4b. IF IDENTITY:
    - Session proceeds normally, contributes to taste profile
    - A brief, low-key toast appears (not a full card): "You're actively
      exploring — this is shaping your real taste." Auto-dismisses after
      ~3 seconds, no action required.
    - Immediately after the toast dismisses, the Reveal card fires — same
      mechanism as the functional path (Section 10), same discovery_pool,
      same filter chips, same Play/Save/Skip — but with different framing:
      "You're on a roll — here's another direction worth exploring" instead
      of "Since your profile's protected, here's something new." This is
      not a second system — it's the same Reveal component with a copy
      variant, triggered from a second context.
   ↓
5. The playlist involved in this session is tagged with its classification
   result (functional/identity) for display elsewhere in the app (see
   Section 7a)
```

### 7a. Status Visibility and Manual Override

A user has no way to know a playlist's protection status outside the exact moment a session is classified — this needs to be visible persistently, not just as a one-off card:

- **Status badge**, shown in two places:
  - **Now Playing screen** — a small pill near the top showing the current session's classification: 🛡 "Protected" (functional) / 🌱 "Shaping your taste" (identity) / no badge if this session hasn't been classified yet
  - **Playlist cards** in Library/Recents — the same badge, reflecting the *last* classification result for that playlist, so a user can glance at their library and see e.g. "Deep Focus Lo-Fi" is consistently shielded, without needing to run a session first

- **Manual override**, one tier above automatic — a small "•••" menu on each playlist card with three options:
  - **Auto-detect (recommended)** — default; AI classifies per session as normal
  - **Always treat as functional**
  - **Always treat as identity-driven**

  This mirrors Spotify's existing "Exclude from Taste Profile" toggle, but reframed as a *fallback* rather than the primary mechanism — automatic AI classification is the default and does the work; manual override exists only for edge cases where a user disagrees with the AI's read. This is worth keeping in the demo narrative: it reinforces the "why AI, not manual rules" argument one more time, since manual tagging alone was never sufficient (that's the root cause), but a manual override *alongside* AI as a trust/control layer is good product design.

---

## 8. MVP Scope (What to Actually Build)

Given the deployment deadline, scope this as a **standalone mobile-styled web app** (HTML/CSS/JS, deployed to Vercel), not a fork of Spotify itself. It should run on the seeded/synthetic dataset defined in the companion UI/Data spec — no live Spotify API connection needed, which keeps auth/scope risk off the table entirely this close to deadline.

**Recommended MVP feature set (in priority order):**

1. **Session simulator or real session ingestion** — either let a user "play" through a few pre-set session scenarios (clearly functional vs. clearly identity-driven) or pull recent listening data via Spotify API
2. **Classification engine** — the core AI component (see Section 9)
3. **Shield UI moment** — the visible "this session won't shape your profile, here's why" card
4. **Reveal UI moment** — the immediate follow-up recommendation card, sourced from protected/uncorrupted history
5. **Simple dashboard** — showing Taste Profile Protection Rate and Post-Shield Save Rate as live/mock metrics, to demonstrate the metrics story

**Explicitly out of scope for MVP:** full production-grade classifier accuracy, multi-language support, family/duo account handling, podcast/audiobook sessions — note these as "future roadmap" in the deck, don't try to build them.

---

## 9. Classification Engine — Technical Approach

**Goal:** binary (or confidence-scored) classification of a listening session as functional vs. identity-driven.

**Signals to use (in order of expected predictive strength):**
| Signal | Why it matters |
|---|---|
| Skip rate | Functional sessions (background/study) tend to have very low skip rates — user isn't actively curating |
| Repeat rate | High repeat of same tracks/albums signals functional/background use |
| Session length | Long, unbroken sessions correlate with study/work/sleep |
| Time of day | Late night → sleep; consistent weekday daytime blocks → study/work |
| Playlist metadata | Playlist name/genre tags (if available) — "lo-fi," "focus," "sleep," "workout" keywords are strong signals |
| Track diversity within session | Low diversity (same genre/mood throughout) suggests functional; high diversity suggests active exploration |

**Approach for MVP timeline:**
- A lightweight supervised classifier (logistic regression or a small gradient-boosted model) trained on labeled/synthetic session data is realistic to build and explain within the timeline, and is easy to demo transparently (you can show feature weights — which directly supports the "here's why" explainability requirement).
- If time allows, an LLM-based classifier (prompting an LLM with session signal summaries to output a classification + reasoning) can work well for the demo specifically *because* it naturally produces the human-readable "here's why" explanation without extra engineering — worth considering given you're building in Antigravity with model access already available.
- Either approach should output: `{ classification: "functional" | "identity", confidence: 0.0–1.0, top_signals: [...] }`

---

## 10. Reveal Recommendation Logic

- **Recommendation pool = `discovery_pool`, not the user's existing library.** This is a deliberate, important distinction: tracks in `discovery_pool` are ones the user has never saved or played — genre/mood-adjacent to their `known_identity` cluster, but genuinely new to them. Recommending from the existing library instead would just be rediscovery (closer to the Deep Shuffle solution you already deprioritized), not real discovery — and would make "new artists discovered" on the Taste Journey screen inaccurate.
- Simple MVP approach: weighted random selection from `discovery_pool`, avoiding repeats within the current session
- **Genre/mood filter (scoped addition):** the Reveal card shows a row of filter chips built from the `genre` and `mood_tags` values present in `discovery_pool`. If the user taps a chip, re-run the selection restricted to tracks matching that tag; no selection = default weighted-random across the whole pool. This is a client-side filter on data already in `seed_data.json` — no new model or backend logic needed. It gives the user a small, visible way to steer *which direction* their taste evolves, which ties directly to the JTBD framing ("help me become who I'll be tomorrow," not just "show me something random").
- **Genre/mood display:** once a track is selected, render its `genre` and `mood_tags` directly beneath the track title/artist (e.g. "Indie folk · warm, nostalgic"), sourced straight from `seed_data.json` — no extra logic needed, just surfacing existing fields.
- **Save logic:** moves the selected track from `discovery_pool` into `library` with `pool: "known_identity"` and `play_count: 1`, removes it from future `discovery_pool` candidates (so it isn't recommended twice), and pushes it into `reveal_saves` (used by the Your Taste Journey screen's "new artists discovered" count and genre tag cloud). This is the moment a discovery becomes a real part of the user's taste — the strongest identity signal in the whole product, deliberately stronger than a passive identity-listening session.
- **Skip logic:** a third action alongside Play/Save. Skip dismisses the current card without touching `discovery_pool` or `reveal_saves`, and re-runs selection (excluding the just-skipped track_id) to surface a different candidate from the same pool/filter — this makes Skip feel responsive rather than a dead-end, and is a trivial re-roll of the existing selection function.
- Stretch: use embedding similarity (audio features or genre/mood tags) to select a `discovery_pool` track that's adjacent-but-different from the user's `known_identity` cluster, rather than pure random — this is closer to true "taste evolution" and worth attempting if time allows, but the seed data already encodes this manually (each discovery track shares an artist/genre with an existing known_identity track), so weighted-random is acceptable for MVP given the deadline

---

## 11. Metrics to Track/Display in the MVP

**Backend metrics** (the actual numbers powering everything below — these are what you defend in the deck/Q&A, not what the user sees):

| Metric | What it measures | Ties to |
|---|---|---|
| **Taste Profile Protection Rate** | % of functional sessions correctly excluded from taste updates | Reduces repetitive listening (strategic goal, half 1) |
| **Post-Shield Save Rate** | % of Reveal recommendations saved by the user | Increases meaningful discovery (strategic goal, half 2) |

**User-facing display — "Your Taste Journey" (formerly "Insights")**

A raw percentage ("Protection Rate: 82%") isn't something a user opens the app to check — it doesn't help them decide or feel anything. The same underlying data is reframed into what the user actually cares about, tying back to the JTBD language ("help me become," not "here's a stat"):

| Backend metric | User-facing translation | Why this framing |
|---|---|---|
| Taste Profile Protection Rate | **"X functional sessions protected"** (a count, not a %) — e.g. "8 focus sessions protected this month," with subtext "Your real taste stayed untouched during study/gym/sleep sessions" | Concrete and felt, not abstract |
| Post-Shield Save Rate | **"Y new artists discovered through TrueTune"** — count of distinct artists saved via Reveal, with subtext "From tracks you saved after a Shield moment" | This is the actual payoff a TEE user cares about — discovery, not a rate |
| *(new, derived from saved Reveal tracks)* | **Genre diversity visual** — a simple tag cloud of genres saved this period, tag size proportional to count | Ties directly to Anderson et al.'s finding that consumption diversity correlates with retention — showing the user their own diversity growing is both meaningful to them and thematically consistent with the whole pitch |

Even in an MVP with limited real usage data, these can be shown as live counters against demo/seeded sessions — the point is to prove the metrics *framework* works, not to have statistically significant real-world numbers yet. Keep the backend percentages ready to cite verbally in Q&A even though they're not what's rendered on screen.

---

## 12. Deployment Notes

- Brief requires a **production deployment**, not a raw prototype link — deploy to Vercel (free), with a live public URL — not a local-only build or a raw Figma/Lovable link
- Build with Next.js so the Groq classifier call runs through a built-in API route (server-side) rather than client-side JS — this keeps the API key off the public page
- Keep the UI simple and focused on the two moments that matter (Shield card, Reveal card) rather than trying to rebuild Spotify's full app

---

## 13. One-Slide Summary (for the required "how it works" slide)

**TrueTune protects your real taste from your temporary context — and proves it, instantly.**

- Detects functional listening sessions automatically, using behavioral signals (no manual tagging)
- Protects your taste profile from being corrupted by that session
- Immediately shows you a recommendation from your true, protected taste — so you see the protection working, not just trust that it is

---

## 14. Naming Note

**App:** Spotify (real logo, name, and visual identity used as the app shell — this is presented as a feature demo *within* Spotify, not a standalone app)
**Feature name:** TrueTune — appears only as a small label inside the Shield and Reveal moments, the same way real Spotify names individual features (Discover Weekly, AI DJ, etc.) within the broader app
Internal/technical names used in code and docs may still reference "Shield" (classification module) and "Reveal" (recommendation module) as component names — this is fine and doesn't need to change; only the user-facing feature name is TrueTune.
