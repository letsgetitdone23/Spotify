Build a mobile-styled web app called TrueTune (feature) within Spotify (app shell) — using **Next.js**, deployed to Vercel. Three things define the full spec; use all of them together:

1. **6 attached screen images** (generated in Stitch: Home, Simulate a Session, Now Playing, Shield card, Reveal card, Insights) — these are your visual source of truth. Build the frontend closely following their direction: layout, spacing, colors, typography, card shapes, bottom-sheet style. Reference them directly, e.g. "using @home.png, @session.png, @nowplaying.png, @shield.png, @reveal.png, @insights.png as the visual direction, build the Next.js frontend to match."
2. `TrueTune_MVP_Build_Spec.md` — the problem, solution logic, and why-AI reasoning
3. `TrueTune_UI_and_Data_Spec.md` — the seeded data (Section 1) and full user journey (Section 3) that define what each screen actually does

## What to build

**Core concept:** TrueTune detects when a listening session is "functional" (studying, gym, sleep) vs. "identity" (active taste exploration). When a session is classified as functional, it (a) shows a Shield card explaining the session won't affect the user's taste profile, with reasoning and a confidence score, and (b) immediately shows a Reveal card recommending one track from the user's protected/true-taste library.

**Data:** Use the exact `library` and `sessions` JSON objects from Section 1 of `TrueTune_UI_and_Data_Spec.md`. Save as `seed_data.json`. Do not invent different seed data.

**UI:** This app is presented as **Spotify itself** — using Spotify's actual logo, name, and visual identity as the app shell — with **TrueTune as the name of a feature within it**, not the app name. TrueTune should only appear as a small label/badge inside the Shield and Reveal cards (the same way real Spotify names individual features like "Discover Weekly" or "AI DJ" within the app), not in the header or home screen branding. Build the app inside a centered phone-frame container (~390px wide, rounded corners ~40px, subtle shadow) so it reads as a phone screen regardless of browser width — follow the 6 attached images for the exact look. Add a small, clearly visible disclaimer, e.g.: "This is a non-commercial student concept demo of a hypothetical Spotify feature (TrueTune) and is not affiliated with, endorsed by, or produced by Spotify." Keep this disclaimer visible on every screen, not just a one-time splash.

**Screens to build, matching the attached Stitch images:**
1. Home (recently played + made-for-you rows)
2. Simulate a Session (5 tappable scenario cards)
3. Now Playing (full-screen, animated track cycling)
4. Shield card (bottom sheet overlay)
5. Reveal card (bottom sheet overlay)
6. Insights (two metric cards with progress bars)

**Flow to implement, in order:**
1. Home screen — matching the real Spotify layout in @home.png: status bar, profile + filter pills (All/Music/Podcasts), "Recommended Stations" row, "Recents" row (with "Show all"), "Your top mixes" row, 5-icon bottom nav (Home, Search, Your Library, Premium, Create). Purely visual, no interaction needed, no mini now-playing bar in this state.
2. A "Simulate a session" screen listing the 5 seeded scenarios by their human-readable `label` field (not their IDs), as tappable cards
3. On selecting a scenario: navigate to the full-screen Now Playing view and animate through the `tracks_played` list (simple visual cycling, no real audio needed)
4. When the simulated session ends, call an LLM with the session's signal fields (skip_rate, repeat_rate, session_length_minutes, time_of_day, playlist_name, genre_diversity) and prompt it to return strict JSON:
   `{"classification": "functional"|"identity", "confidence": 0.0-1.0, "reasoning": ["signal 1", "signal 2", "signal 3"]}`
5. If classification is "functional": slide up the Shield card as a bottom sheet over the dimmed Now Playing screen (icon, message, reasoning bullets, confidence %, dismiss button) per the Shield screen image
6. Immediately after dismissing Shield: show the Reveal card as a second bottom sheet with a row of tappable genre/mood filter chips built dynamically from the `genre` and `mood_tags` values present in `library` entries where `pool == "protected"`, followed by one track randomly selected (weighted, avoid repeats across the session) from that same protected pool — filtered to the tapped chip's tag if one is selected, otherwise the default unfiltered weighted-random pick. Display the selected track's `genre` and `mood_tags` directly beneath its title/artist (e.g. "Indie folk · warm, nostalgic"). Show three actions: Play and Save buttons (buttons can be non-functional/mock — just show visual state change on click), plus a smaller, less prominent Skip action that dismisses the current pick and re-runs selection (excluding the skipped track_id) to surface a different track from the same pool/filter
7. If classification is "identity": skip both cards, just return to Home normally with no interrupt
8. Build a separate "Insights" screen with two progress-bar style metrics: Taste Profile Protection Rate and Post-Shield Save Rate, computed live from however many simulated sessions have been run in the current browser session (store in an in-memory JS variable or `sessionStorage`, no database needed)

**Classifier implementation:** Use an LLM call via the **Groq API** (free tier, no credit card required) rather than a hardcoded rule-based classifier — this is the core point of the MVP, so don't shortcut it with if/else logic on the signal fields. Use the `llama-3.3-70b-versatile` model. Implement this as a Next.js API route (e.g. `/pages/api/classify.js` or `/app/api/classify/route.js`) rather than calling Groq directly from client components — this keeps the API key server-side and out of the public bundle.

API route:
```javascript
export default async function handler(req, res) {
  const session = req.body;
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: buildClassifierPrompt(session) }],
      response_format: { type: "json_object" }
    })
  });
  const data = await response.json();
  res.status(200).json(JSON.parse(data.choices[0].message.content));
}
```

Frontend calls it simply: `fetch('/api/classify', { method: 'POST', body: JSON.stringify(session) })`. Store `GROQ_API_KEY` as a Vercel environment variable, never hardcoded or exposed client-side. Prompt the model to return strict JSON only: `{"classification": "functional"|"identity", "confidence": 0.0-1.0, "reasoning": ["signal 1", "signal 2", "signal 3"]}`. Parse and render `reasoning` directly as the bullet list in the Shield card, and `confidence` as the percentage shown. Groq's free tier (~30 requests/minute, ~14,400/day) is more than sufficient for this app's usage — no cost, no billing setup needed.

**Definition of done:** all 5 seeded sessions run end-to-end without errors, scenario s05 (the borderline case) visibly returns a mid-range confidence score (roughly 50-70%) rather than a confident one, the Reveal card's filter chips correctly re-filter the recommendation by tapped genre/mood tag, the Reveal card displays the selected track's genre/mood and Skip correctly surfaces a different track without repeating the skipped one, the Insights screen updates after each simulated session, and the app is deployed to Vercel with a public URL.

Ask me before making any UI or data decisions not covered in the two spec files — don't improvise scope beyond what's defined there.
