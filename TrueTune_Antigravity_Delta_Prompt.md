# Delta Prompt for Antigravity — Additions to the Existing TrueTune Build

The core MVP (Shield, Reveal, seeded sessions, classifier via Groq, Insights) is already built. This adds three things on top of it. Read `TrueTune_MVP_Build_Spec.md` Section 7 and 7a, and `TrueTune_UI_and_Data_Spec.md` Section 1b before making changes — they define the exact spec.

Two new reference images are attached: `@identity-toast.png` (Screen 7) and `@playlist-status.png` (Screen 8) — match their visual direction the same way the original 6 screens were matched. A third image, `@your-taste-journey.png`, replaces the old Insights screen reference (Screen 6) — the layout and content of that screen have changed, see item 4 below.

## 1. Identity Session Toast + Reveal Trigger (important: this now includes a real behavior change, not just a visual toast)

When a simulated session is classified as `"identity"` (not functional), show a brief, non-blocking toast — not a bottom sheet, not a modal. It should:
- Appear near the top of the Now Playing screen, below the status bar
- Show a leaf/sparkle icon and the text: "You're actively exploring — this is shaping your real taste."
- Auto-dismiss after ~3 seconds, no user action required
- Use a dark, green-tinted background per `@identity-toast.png`

**Immediately after the toast dismisses, trigger the existing Reveal card** — same component, same `discovery_pool` source, same filter chips, same Play/Save/Skip logic already built for the functional path — but with a different headline: **"You're on a roll — here's another direction worth exploring"** instead of "Since your profile's protected, here's something new." This closes a real gap: without it, discovery only ever happens after a functional session gets shielded, meaning a user already doing healthy, identity-driven exploration would get nothing from the feature. Reveal should now be a shared component parameterized by a `trigger` value (`"shield"` | `"identity"`) that only changes the headline text — everything else (pool, chips, actions, save/skip logic) stays identical.

This uses the exact same classifier output already being generated — no new classification logic, just a new render path (toast + Reveal) for the `"identity"` case, which currently does nothing visible.

## 2. Playlist Status Badges

Add a small status badge, computed from each playlist's last classification result, shown in two places:
- **Now Playing screen**: near the top, a small pill — 🛡 "Protected" if the current session was classified functional, 🌱 "Shaping your taste" if identity, no badge if not yet classified
- **Playlist cards** (wherever playlists are listed — Home rows, Library view): same badge logic, reflecting the *last* time that playlist name was involved in a classified session

Track this in a `playlist_overrides` object (see `TrueTune_UI_and_Data_Spec.md` Section 1b for exact shape) — in-memory JS state keyed by playlist name, no database. Update `last_classification` on that object every time a session involving that playlist finishes classifying.

## 3. Manual Override Menu

Add a "•••" menu to each playlist card (Library view or wherever playlists are listed) with three options:
- **Auto-detect (recommended)** — default, existing behavior, calls the classifier as normal
- **Always treat as functional**
- **Always treat as identity-driven**

Store the selection in the same `playlist_overrides` object, under the `override` field (`"auto"` | `"force_functional"` | `"force_identity"`).

**Important behavior change when a forced override is set:** skip the Groq classifier call entirely for that playlist — apply the forced classification directly. This is both a UX correctness point (a user who forced "always functional" shouldn't see the AI second-guess them) and a minor efficiency win (fewer API calls). Only playlists left on "Auto-detect" go through the real classifier.

## 4. Rename Insights → "Your Taste Journey" and Change What It Shows

The existing Insights screen shows raw percentages (Protection Rate, Save Rate) — replace this entirely. A percentage isn't something a user opens the app to check; it doesn't help them decide or feel anything. Same underlying data, new presentation:

- **Rename the screen/route** from "Insights" to **"Your Taste Journey"**
- **Stat 1:** a big number + "focus sessions protected" with subtext "Your real taste stayed untouched during study/gym/sleep sessions" — this replaces Protection Rate. Count = increment by 1 every time a session is classified/overridden as functional and Shield fires.
- **Stat 2:** a big number + "new artists discovered" with subtext "From tracks you saved after a Shield moment" — this replaces Save Rate. Count = number of *distinct artists* across all tracks the user has tapped Save on in Reveal cards (not Play, not Skip — only Save).
- **New section, "Your Growing Genres":** a tag cloud of genre pills, sized by how often that genre appears among saved Reveal tracks. Built from the same saved-tracks list as Stat 2 — no new data collection needed, just tally `genre` values.

Track this with a new in-memory object, e.g.:
```javascript
{
  functional_sessions_protected: 0,
  reveal_saves: []  // push { track_id, artist, genre } here on every Reveal Save tap
}
```
Skip does not add to `reveal_saves` — only Save counts.

Match the visual direction of `@your-taste-journey.png` (replaces the old Insights reference image) — warm and personal in tone, not analytical; no progress bars.

## 5. Fix Reveal's Recommendation Source (important correctness fix)

The current build likely recommends Reveal tracks from `library` entries tagged `pool == "protected"` — this is a real bug worth fixing, not a style preference. Those tracks are already in the user's library, so recommending them isn't actual discovery, it's rediscovery — which undermines "new artists discovered" on the Taste Journey screen and is closer to the Deep Shuffle solution you already deprioritized.

**Add a new `discovery_pool` array** (see `TrueTune_UI_and_Data_Spec.md` Section 1a-ii for the exact seed data) — 8 tracks the user has never saved, genre/mood-adjacent to their existing `known_identity` library tracks.

**Change Reveal to select from `discovery_pool`, not `library`.**

**Change Save's behavior:** tapping Save should now move the selected track from `discovery_pool` into `library` (with `pool: "known_identity"`, `play_count: 1`), remove it from future `discovery_pool` candidates so it can't be recommended twice, and push it into `reveal_saves`. Skip does not touch either pool — just re-rolls another `discovery_pool` candidate.

Note: existing `library` tracks that were tagged `pool: "protected"` should be renamed to `pool: "known_identity"` for consistency — this is a rename only, doesn't change what those tracks are used for (identity-session playback, e.g. scenarios s02/s04/s05).

## Definition of Done for This Delta

- Running an "identity" scenario (s02 or s04) shows the toast, not silence
- Running any scenario updates that session's playlist's badge, visible afterward on Home/Library
- Setting a playlist to "Always treat as functional" and re-running a session with that playlist skips the Groq call and shows Shield/Reveal directly, using the forced result
- Setting a playlist back to "Auto-detect" restores normal classifier behavior on the next run
- Your Taste Journey shows a protected-session count and distinct-artist count that increment correctly, plus a genre tag cloud that updates after each Save action
- Reveal recommends from `discovery_pool`, never from `library` — verify by confirming a saved track disappears from future Reveal picks and appears in `library` with `pool: "known_identity"` afterward
- Running an "identity" scenario shows the toast, followed by the Reveal card with the "on a roll" headline variant — not just the toast alone
