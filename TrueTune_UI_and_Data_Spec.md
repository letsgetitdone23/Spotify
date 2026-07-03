# TrueTune — Full Build Spec: Seeded Data + UI + User Journey
> Companion to `TrueTune_MVP_Build_Spec.md`. This file is what you hand to Antigravity to actually build the prototype.

---

## ⚠️ One Note Before You Build

This prototype is presented as a screen **within the actual Spotify app** — using Spotify's real logo, name, and visual identity as the app shell. **TrueTune is the name of the feature**, not the app — it only appears as a label inside the Shield and Reveal moments (e.g. "TrueTune protected this session"), the same way Spotify names individual features like "Discover Weekly" or "AI DJ" within the app. Since this deploys to a public production URL, keep a clearly visible disclaimer on every screen (footer or header): *"This is a non-commercial student concept demo of a hypothetical Spotify feature (TrueTune) and is not affiliated with, endorsed by, or produced by Spotify."* This is a judgment call worth a quick gut-check against your program's submission rules before final deployment — a disclaimer reduces confusion but doesn't fully eliminate brand-use risk on a public URL.

---

## 1. Seeded Dataset

Save this as `seed_data.json` in your project. Two pools: a **user's full library** (for the Reveal engine to pull from) and a **set of session scenarios** (fed to the classifier).

### 1a. User Library (`library`)

```json
{
  "library": [
    { "track_id": "t001", "title": "Nightfall Static", "artist": "Kōno", "genre": "lo-fi", "mood_tags": ["chill", "focus"], "play_count": 41, "pool": "functional_only" },
    { "track_id": "t002", "title": "Rainlight Loop", "artist": "Studio Palms", "genre": "lo-fi", "mood_tags": ["chill", "focus"], "play_count": 38, "pool": "functional_only" },
    { "track_id": "t003", "title": "Quiet Hours", "artist": "Kōno", "genre": "lo-fi", "mood_tags": ["chill", "focus"], "play_count": 35, "pool": "functional_only" },
    { "track_id": "t004", "title": "Amber Static", "artist": "Studio Palms", "genre": "lo-fi", "mood_tags": ["chill", "focus"], "play_count": 30, "pool": "functional_only" },

    { "track_id": "t005", "title": "Copper Skies", "artist": "Wren Ellery", "genre": "indie folk", "mood_tags": ["warm", "nostalgic"], "play_count": 6, "pool": "known_identity" },
    { "track_id": "t006", "title": "Marigold", "artist": "The Faint Parade", "genre": "indie rock", "mood_tags": ["energetic", "bittersweet"], "play_count": 4, "pool": "known_identity" },
    { "track_id": "t007", "title": "Low Tide", "artist": "Isla Moon", "genre": "dream pop", "mood_tags": ["dreamy", "melancholy"], "play_count": 5, "pool": "known_identity" },
    { "track_id": "t008", "title": "Departures", "artist": "Nordveil", "genre": "post-rock", "mood_tags": ["cinematic", "intense"], "play_count": 3, "pool": "known_identity" },
    { "track_id": "t009", "title": "Salt & Static", "artist": "Wren Ellery", "genre": "indie folk", "mood_tags": ["warm", "reflective"], "play_count": 7, "pool": "known_identity" },
    { "track_id": "t010", "title": "Glasshouse", "artist": "Comet Youth", "genre": "electronic", "mood_tags": ["euphoric", "bright"], "play_count": 5, "pool": "known_identity" },
    { "track_id": "t011", "title": "Half-Light", "artist": "Isla Moon", "genre": "dream pop", "mood_tags": ["dreamy", "soft"], "play_count": 4, "pool": "known_identity" },
    { "track_id": "t012", "title": "Sundial", "artist": "The Faint Parade", "genre": "indie rock", "mood_tags": ["nostalgic", "warm"], "play_count": 6, "pool": "known_identity" },

    { "track_id": "t013", "title": "Pulse Drive", "artist": "Neon Fields", "genre": "electronic", "mood_tags": ["energetic", "driving"], "play_count": 22, "pool": "functional_only" },
    { "track_id": "t014", "title": "Ironclad", "artist": "Neon Fields", "genre": "electronic", "mood_tags": ["energetic", "aggressive"], "play_count": 19, "pool": "functional_only" },
    { "track_id": "t015", "title": "Overdrive", "artist": "Volt Theory", "genre": "electronic", "mood_tags": ["energetic", "driving"], "play_count": 17, "pool": "functional_only" },

    { "track_id": "t016", "title": "Dhuaan", "artist": "Rehaan Vaid", "genre": "hindi lo-fi", "mood_tags": ["chill", "focus"], "play_count": 33, "pool": "functional_only" },
    { "track_id": "t017", "title": "Sukoon", "artist": "Meher Kohli", "genre": "hindi lo-fi", "mood_tags": ["chill", "focus"], "play_count": 29, "pool": "functional_only" },
    { "track_id": "t018", "title": "Sherni", "artist": "Baaghi Sound", "genre": "punjabi hip-hop", "mood_tags": ["energetic", "aggressive"], "play_count": 20, "pool": "functional_only" },

    { "track_id": "t019", "title": "Kaanch ke Rishtey", "artist": "Anahita Rao", "genre": "indie hindi", "mood_tags": ["warm", "reflective"], "play_count": 5, "pool": "known_identity" },
    { "track_id": "t020", "title": "Barsaat ke Baad", "artist": "Ishaan Dutt", "genre": "indie hindi", "mood_tags": ["nostalgic", "bittersweet"], "play_count": 4, "pool": "known_identity" },
    { "track_id": "t021", "title": "Raagdesh Reimagined", "artist": "Kavya Menon", "genre": "carnatic fusion", "mood_tags": ["cinematic", "soulful"], "play_count": 3, "pool": "known_identity" },
    { "track_id": "t022", "title": "Shehnaai Dreams", "artist": "Anahita Rao", "genre": "ghazal fusion", "mood_tags": ["melancholy", "soulful"], "play_count": 6, "pool": "known_identity" }
  ]
}
```

*Design logic: tracks 1–4, 13–15, and 16–18 are the "functional pools" (study lo-fi in English and Hindi, workout electronic and Punjabi hip-hop) — high play count, low diversity. Tracks 5–12 and 19–22 are `pool: "known_identity"` — the user's existing, true taste, already saved to their library, spanning indie/dream pop/post-rock alongside indie Hindi, carnatic fusion, and ghazal fusion — lower play count, high genre/mood diversity. This pool is what identity-listening sessions (s02, s04) draw from — the user is actively playing music that already reflects who they are.*

### 1a-ii. Discovery Pool (`discovery_pool`) — separate from the library

**This is what Reveal actually recommends from — not `library`.** These are tracks the user has **never saved or played**, genre/mood-adjacent to their `known_identity` cluster, representing genuine new-to-user discovery seeded from their protected taste signal. This is the fix for a real gap: if Reveal only resurfaced tracks already in the user's library, "new artists discovered" on the Taste Journey screen would be misleading — nothing new would actually have been found.

```json
{
  "discovery_pool": [
    { "track_id": "d001", "title": "Ivory Bloom", "artist": "Mira Solden", "genre": "indie folk", "mood_tags": ["warm", "hopeful"] },
    { "track_id": "d002", "title": "Static Bloom", "artist": "Nordveil", "genre": "post-rock", "mood_tags": ["cinematic", "expansive"] },
    { "track_id": "d003", "title": "Faded Neon", "artist": "Comet Youth", "genre": "electronic", "mood_tags": ["euphoric", "nostalgic"] },
    { "track_id": "d004", "title": "Hollow Orbit", "artist": "Isla Moon", "genre": "dream pop", "mood_tags": ["ethereal", "soft"] },
    { "track_id": "d005", "title": "Tideline", "artist": "The Faint Parade", "genre": "indie rock", "mood_tags": ["energetic", "hopeful"] },
    { "track_id": "d006", "title": "Ratnakar", "artist": "Kavya Menon", "genre": "carnatic fusion", "mood_tags": ["soulful", "meditative"] },
    { "track_id": "d007", "title": "Bheegi Yaadein", "artist": "Ishaan Dutt", "genre": "indie hindi", "mood_tags": ["nostalgic", "warm"] },
    { "track_id": "d008", "title": "Zar-e-Khwab", "artist": "Anahita Rao", "genre": "ghazal fusion", "mood_tags": ["melancholy", "dreamy"] }
  ]
}
```

Note each `discovery_pool` track shares genre/mood territory with an existing `known_identity` artist (e.g. Nordveil, Isla Moon, The Faint Parade, Kavya Menon, Anahita Rao all appear in both pools) — this is deliberate: it demonstrates "adjacent-but-different" recommendation logic (Section 10, MVP Build Spec) without needing real embedding similarity for the MVP. No `play_count` field, since by definition these haven't been played yet.

**Save behavior (important):** when a user taps Save on a Reveal card, that track moves from `discovery_pool` into `library` with `pool: "known_identity"` and `play_count: 1`, and is removed from future `discovery_pool` candidates so it isn't recommended twice. It also logs into `reveal_saves` (Section 1c) for the Taste Journey stats. **A saved track always counts as "shaping your taste," never as "protected"** — "Protected" describes a session's classification (excluded from taste updates), while a Save is an explicit, intentional action and the strongest identity signal in the product.

### 1b. Playlist Override State (`playlist_overrides`)

Tracks each playlist's manual override setting (if any) and its last classification result, so the status badge (Screen 8) and Now Playing badge (Screen 3) can display current state without re-running classification. Store as an in-memory JS object, keyed by playlist name — no database needed.

```json
{
  "playlist_overrides": {
    "Deep Focus Lo-Fi": { "override": "auto", "last_classification": null },
    "Gym Power Hour": { "override": "auto", "last_classification": null },
    "Evening Wind Down": { "override": "auto", "last_classification": null }
  }
}
```

`override` can be `"auto"` (default — AI decides per session), `"force_functional"`, or `"force_identity"`. When a session runs: if `override` is `"auto"`, call the classifier normally; if forced, skip the classifier call entirely and use the forced value directly (this is a meaningful cost/complexity saver — forced overrides don't need an API call at all). After any session runs, update `last_classification` to the result (functional or identity) so the badge reflects it next time that playlist is viewed anywhere in the app.

### 1c. Session History (for "Your Taste Journey")

Track two running counters plus a list of saved tracks, all in-memory (no database needed) — this is what powers Screen 6:

```json
{
  "session_history": {
    "functional_sessions_protected": 0,
    "reveal_saves": []
  }
}
```

- Increment `functional_sessions_protected` by 1 every time a session is classified (or overridden) as functional and the Shield card is shown.
- Every time a user taps **Save** on a Reveal card, push that track's full object (or at minimum `track_id`, `artist`, `genre`) into `reveal_saves`.
- **New artists discovered** (Screen 6, stat 2) = count of *distinct* artists across `reveal_saves`.
- **Your Growing Genres** tag cloud (Screen 6) = tally of `genre` values across `reveal_saves`, rendered as pills sized by frequency.
- Skip does not add to `reveal_saves` — only Save counts, since the point is discovery the user actually chose to keep.

### 1d. Session Scenarios (`sessions`)

```json
{
  "sessions": [
    {
      "session_id": "s01",
      "label": "3am study session",
      "tracks_played": ["t001", "t001", "t003", "t001", "t004"],
      "skip_rate": 0.04,
      "repeat_rate": 0.6,
      "session_length_minutes": 95,
      "time_of_day": "03:10",
      "playlist_name": "Deep Focus Lo-Fi",
      "genre_diversity": "low",
      "expected_classification": "functional"
    },
    {
      "session_id": "s02",
      "label": "Saturday afternoon exploring",
      "tracks_played": ["t006", "t010", "t021", "t005", "t019"],
      "skip_rate": 0.35,
      "repeat_rate": 0.0,
      "session_length_minutes": 40,
      "time_of_day": "15:20",
      "playlist_name": null,
      "genre_diversity": "high",
      "expected_classification": "identity"
    },
    {
      "session_id": "s03",
      "label": "Morning gym session",
      "tracks_played": ["t013", "t018", "t013", "t015"],
      "skip_rate": 0.08,
      "repeat_rate": 0.5,
      "session_length_minutes": 50,
      "time_of_day": "07:00",
      "playlist_name": "Gym Power Hour",
      "genre_diversity": "low",
      "expected_classification": "functional"
    },
    {
      "session_id": "s04",
      "label": "Late night discovery scroll",
      "tracks_played": ["t007", "t022", "t012", "t020"],
      "skip_rate": 0.28,
      "repeat_rate": 0.0,
      "session_length_minutes": 25,
      "time_of_day": "23:40",
      "playlist_name": null,
      "genre_diversity": "high",
      "expected_classification": "identity"
    },
    {
      "session_id": "s05",
      "label": "Borderline: quiet evening, single playlist",
      "tracks_played": ["t002", "t017", "t002", "t009"],
      "skip_rate": 0.15,
      "repeat_rate": 0.25,
      "session_length_minutes": 60,
      "time_of_day": "20:15",
      "playlist_name": "Evening Wind Down",
      "genre_diversity": "medium",
      "expected_classification": "borderline (demo confidence ~0.55–0.65)"
    }
  ]
}
```

*Use s01–s04 as your confident, clean demo cases. Use s05 as the moment in your presentation where you show the confidence score and reasoning doing real work — this is your strongest "why AI, not rules" proof point.*

---

## 2. UI Spec — Spotify Mobile App Interface (Phone Frame)

**This app is presented as a mobile phone interface**, not a desktop web layout — even though it runs in Streamlit (a web framework). Achieve this by constraining the whole app inside a centered "phone frame" container (~390px wide, rounded corners, subtle shadow, optional notch bar at top) so it reads as a phone screen regardless of the browser window size. This is a standard technique for demoing mobile concepts in a web-based tool and works well for a live presentation.

### 2a. Design Workflow: Stitch → Antigravity

1. Generate each screen below **individually** in Stitch using the prompts provided — one image per screen, not one combined image, since each represents a different interactive state.
2. Export each as a PNG.
3. Attach all 6 exported screens to Antigravity and reference them directly by filename (e.g. "using @home.png, @session.png, @nowplaying.png, @shield.png, @reveal.png, @insights.png as the visual direction, build the Next.js frontend to match") — the images are your visual source of truth; the spec files below (Section 1 data, Section 3 user journey) define the actual functionality and logic layered on top.

### 2b. Screens to Generate in Stitch (prompts ready to paste)

**Screen 1 — Home**
> Mobile app UI, Spotify app, dark theme (#121212 background, white text, green accent), phone screen 390x844. Status bar at top showing time, alarm icon, wifi, signal bars, battery percentage. Below that: a small circular profile avatar on the left, and three pill-shaped filter tabs — "All" (selected, filled green), "Music", "Podcasts" (both unselected, dark gray outline). Section header "Recommended Stations" in bold white, followed by a horizontal scrolling row of 2-3 colorful square radio station cards — each card has a small Spotify icon top-left, "RADIO" label top-right, a collage of 2-3 circular artist photos in the middle, and an artist/station name in bold black text at the bottom of the card, with a line of contributing artist names in gray text below the card. Below that: section header "Recents" in bold white with a "Show all" link in gray on the right, followed by a horizontal row of 3-4 square playlist cover art cards with playlist name and "Playlist • Spotify" caption underneath each. Below that: section header "Your top mixes" in bold white, followed by the start of another horizontal row of square cover art cards. Bottom: a fixed 4-icon tab bar — Home (filled/selected), Search, Your Library, Create — with labels underneath each icon. This is a Premium subscriber's view, so no "Premium" upsell tab is shown. Do NOT include a mini now-playing bar at the bottom — this is the clean home screen state only.

**Screen 2 — Simulate a Session**
> Mobile app UI, Spotify dark theme, phone screen 390x844. Status bar at top matching Screen 1 (time, alarm icon, wifi, signal bars, battery). Below it, a simple header row with a back arrow on the left and the title "Simulate a Session" in bold white. Main content: 5 tappable list-style cards stacked vertically, each showing a session name ("3am study session", "Saturday afternoon exploring", "Morning gym session", "Late night discovery scroll", "Quiet evening wind-down") with a small icon on the left and subtitle text underneath each ("Tap to simulate"). Same dark theme, green accent on selection state. Bottom: the same fixed 4-icon tab bar as Screen 1 (Home, Search, Your Library, Create), none highlighted as active. Do NOT include a mini now-playing bar.

**Screen 3 — Now Playing (mid-session)**
> Mobile app UI, Spotify dark theme, phone screen 390x844. This is the one true full-screen playback takeover (matches real Spotify's now-playing screen, which replaces the tab bar entirely while a track plays). Top bar: a small downward chevron on the left to minimize, and a small label showing the session/playlist name centered. Below that: large square album art centered, track title in bold white and artist name in regular gray text beneath it, a horizontal progress bar with green fill and time markers on either end, and a row of playback controls below (shuffle, previous, play/pause, next, repeat). No bottom tab bar and no mini player — this screen IS the full player.

**Screen 4 — Shield Card (overlay)**
> Mobile app UI, Spotify dark theme, phone screen 390x844, shown as a bottom sheet / slide-up card overlaying a dimmed version of the Now Playing screen (Screen 3) behind it — album art and controls visible but darkened. Card has: a small "TrueTune" label/badge at the top of the card (feature name, small text, not a logo), a shield icon, headline text "This looks like a focus session", body text "We won't let it shape your Taste Profile", a small "Why:" section with 3 short bullet reasons, a confidence percentage badge (e.g. "91% confidence") in the top right of the card, and a "Got it" button in green at the bottom.

**Screen 5 — Reveal Card (overlay)**
> Mobile app UI, Spotify dark theme, phone screen 390x844, bottom sheet card overlay on a dimmed Now Playing background (same dimmed treatment as Screen 4). Small "TrueTune" label at the top of the card. Headline text "Since your profile's protected, here's something new" (this card has two copy variants depending on trigger — see note below the image; generate with this headline as the default). Below the headline: a row of small tappable filter chips for genre/mood (e.g. "Indie", "Electronic", "Chill", "Energetic" — pill-shaped, one highlighted green if selected, rest gray outline). Below that: an album art thumbnail with track title in bold white, artist name in regular gray text, and a small genre/mood tag line beneath that (e.g. "Indie folk · warm, nostalgic") in muted green or gray small text. Below that, three actions: a green filled "Play" button and an outlined "Save" button with a heart icon side by side, and a smaller plain-text "Skip" link/button beneath or beside them, visually less prominent than Play/Save.
>
> **Note (not part of the image, for Antigravity):** this same card fires from two contexts — after Shield (headline: "Since your profile's protected, here's something new") and after the identity toast (headline: "You're on a roll — here's another direction worth exploring"). Only the headline text changes; everything else is identical.

**Screen 6 — Your Taste Journey**
> Mobile app UI, Spotify dark theme, phone screen 390x844. Status bar at top matching Screen 1. Below it, a header row with a back arrow on the left and the title "Your Taste Journey" in bold white. Main content, top to bottom: a large stat card with a big bold number and the text "focus sessions protected" beneath it, with smaller subtext "Your real taste stayed untouched during study/gym/sleep sessions"; below it, a second large stat card with a big bold number and the text "new artists discovered" beneath it, with smaller subtext "From tracks you saved through TrueTune"; below that, a section titled "Your Growing Genres" showing a tag cloud of 6-8 pill-shaped genre labels (e.g. "Indie Folk", "Carnatic Fusion", "Dream Pop", "Electronic") in varying sizes, larger pills for genres appearing more often, all in shades of green/white on the dark background. Clean, minimal, warm and personal in tone rather than analytical. Bottom: the same fixed 4-icon tab bar as Screen 1, none highlighted. Do NOT include a mini now-playing bar.

**Screen 7 — Identity Session Toast (small overlay)**
> Mobile app UI, Spotify dark theme, phone screen 390x844, showing the Now Playing screen (Screen 3) in the background, undimmed, fully visible and active — not overlaid or darkened. Near the top of the screen, below the status bar, a small pill-shaped toast notification with a leaf or sparkle icon and the text "You're actively exploring — this is shaping your real taste" in white text on a dark green-tinted background, subtle drop shadow. The toast should look lightweight and temporary, not a modal or bottom sheet — clearly a brief, dismissible notification, not an interruption. This toast is immediately followed by the Reveal card (Screen 5, "on a roll" variant) once it dismisses.

**Screen 8 — Playlist Status Badge + Override Menu**
> Mobile app UI, Spotify dark theme, phone screen 390x844. Shows a simplified Library/playlist list view: 4-5 playlist row items stacked vertically, each with a small square album art thumbnail on the left, playlist name and "Playlist • Spotify" subtitle in the middle, and on the right a small status badge — one row shows a shield icon with "Protected" in small green text, another row shows a leaf icon with "Shaping your taste" in small text, another row shows no badge (neutral/unclassified), and a "•••" three-dot icon at the far right of each row. One row has its "•••" menu open, shown as a small dropdown/popover with three options: "Auto-detect (recommended)" (checked/selected, green checkmark), "Always treat as functional", "Always treat as identity-driven".

### 2c. Design Tokens (for Antigravity to apply consistently)
- Background: `#121212` (main), `#000000` (bottom tab bar / phone frame edges)
- Accent: Spotify green (`#1DB954` or close)
- Text: white primary (`#FFFFFF`), muted gray secondary (`#B3B3B3`)
- Corner radius: ~16px on cards/sheets, ~8px on album art thumbnails
- Top status bar: real phone status bar (time, alarm, wifi, signal, battery) on every screen except when a full-screen overlay (Shield/Reveal) is showing
- Bottom tab bar: 4 icons — Home, Search, Your Library, Create — present on Home, Simulate a Session, and Your Taste Journey screens only. Not present on the Now Playing screen (full-screen takeover) or behind the Shield/Reveal overlays. No "Premium" upsell tab, since the app represents a Premium subscriber's view (this feature is Premium-only — see business case notes in the MVP Build Spec).
- Mini "now playing" bar (the small bar above the tab bar showing a currently playing track): **excluded entirely from this MVP** — since every screen is either idle (no session) or the full-screen Now Playing takeover, there's no state where the mini bar would apply
- Bottom sheets (Shield/Reveal cards) should slide up from the bottom, dim the background behind them, and be dismissible by swipe-down or button tap
- Phone frame: ~390px width container, rounded corners (~40px), centered on the page regardless of actual browser width

---

## 3. Full User Journey (for your demo walkthrough / deck)

**Step 1 — User opens the app, sees Home (phone frame, Screen 1)**
Looks like the real Spotify home screen inside the phone frame: profile + filter pills, "Recommended Stations" row, "Recents" row, "Your top mixes" row, 4-icon bottom nav (Premium subscriber view, no upsell tab). Nothing unusual yet.

**Step 2 — User taps "Simulate a session" (Screen 2)**
5 seeded scenarios (s01–s05) shown as tappable cards, labeled by their human-readable names ("3am study session," "Saturday afternoon exploring," etc.) rather than IDs.

**Step 3 — Session plays out (Screen 3, Now Playing)**
Track list animates through as if playing (art, track names cycling) — doesn't need real audio, just visual simulation on the full-screen Now Playing view.

**Step 4 — Classification fires**
At the end of the simulated session, the classifier runs (Groq LLM call using the session's signal data), and the Shield card slides up from the bottom if functional.

**Step 5 — Shield moment (Screen 4, bottom sheet)**
User sees the protection message + the "why" reasoning + confidence score, as a bottom sheet overlaying the dimmed Now Playing screen. This is the core "why AI" demo beat — pause here in your presentation to explain the signals.

**Step 6 — Reveal moment (Screen 5, bottom sheet)**
Immediately follows — the recommended track card appears as a second bottom sheet, with a row of genre/mood filter chips above it (e.g. "Indie", "Electronic", "Chill", "Energetic") pulled from the tags present in `discovery_pool` — genuinely new-to-the-user tracks, not resurfaced library items. Tapping a chip re-picks the recommendation from tracks matching that tag; no selection shows the default weighted-random pick across the whole pool. User can tap Play (simulated), Save (moves the track into their real library, logs to Taste Journey), or Skip (re-rolls a different candidate).

**Step 6a — Run an identity scenario too (s02 or s04) — this is the fix for a real gap**
Without this step, discovery only ever happens after a functional session gets shielded — meaning a user already doing healthy, identity-driven exploration gets nothing. Run s02 or s04: the classifier returns "identity," the low-key toast appears ("You're actively exploring — this is shaping your real taste"), and it's immediately followed by the *same* Reveal card — same `discovery_pool`, same filter chips, same Play/Save/Skip — but with a different headline: *"You're on a roll — here's another direction worth exploring."* Narrate this explicitly in your demo: *"Discovery isn't a reward for being protected — it's what TrueTune does whenever it has a confident read on your session, whichever direction that read goes."*

**Step 7 — Taste Journey update (Screen 6, Your Taste Journey)**
Navigate to Your Taste Journey — show the protected-session count and new-artists-discovered count ticking up based on the sessions just run (functional sessions increment the protected count; any saved Reveal track — from either trigger path — increments the discovery count), plus the genre tag cloud reflecting saved tracks from prior demo sessions.

**Step 8 — Repeat with the borderline case (s05)**
This is your strongest closing beat — run the ambiguous scenario, show a lower confidence score (~55–65%), and narrate: *"This is what a rule-based system can't do — it can't say 'I'm 60% sure.' It just fails silently or over-triggers. This is where AI earns its place in the product."*

---

## 4. Build Notes for Antigravity

- **Framework:** Next.js, styled inside a constrained phone-frame container (~390px wide, centered, rounded corners) to read as a mobile app interface — see Section 2 for exact layout. File-based routing maps naturally to the 6 screens; built-in API routes handle the Groq call server-side.
- **Visual reference:** 6 Stitch-generated screen images (Home, Simulate a Session, Now Playing, Shield card, Reveal card, Your Taste Journey) — attach directly to Antigravity and reference by filename (e.g. "using @home.png, @shield.png...") so it builds components matching them closely, while implementing the actual data/interaction logic from this spec rather than treating the images as static mockups.
- **Data:** load `seed_data.json` directly, fetched client-side — no database needed.
- **Classifier:** implement as a Next.js API route that calls Groq with the session's signal fields, returning strict JSON: `{"classification": "functional"|"identity", "confidence": 0.0-1.0, "reasoning": ["signal 1", "signal 2", "signal 3"]}`. Parse and render directly into the Shield card.
- **Reveal logic:** simple weighted-random pick from `discovery_pool` (not `library`) — these are tracks the user has never saved, genre/mood-adjacent to their `known_identity` library. On Save, move the picked track from `discovery_pool` into `library` (as `known_identity`) and remove it from future candidates.
- **Deployment:** Vercel, free tier — Next.js deploys natively with zero config, frontend and API route together.

---

## 5. Definition of Done (MVP)

- [ ] All 5 seeded sessions run end-to-end and produce a classification
- [ ] Shield card renders with reasoning + confidence for functional sessions
- [ ] Reveal card renders with a track pulled from the protected pool
- [ ] Metrics dashboard reflects at least Protection Rate and Save Rate
- [ ] Deployed to a live, public production URL (not localhost, not a raw prototype link)
- [ ] One clean run-through of the borderline case (s05) works and shows a mid-range confidence score
