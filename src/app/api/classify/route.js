import { NextResponse } from "next/server";
import seedData from "@/data/seed_data.json";

const libraryMap = new Map(seedData.library.map(track => [track.track_id, track]));

const fallbackData = {
  s01: {
    classification: "functional",
    confidence: 0.95,
    reasoning: [
      "Playlist name 'Deep Focus Lo-Fi' indicates a study/work environment.",
      "Extremely low skip rate (4%) suggests passive background listening.",
      "High repeat rate (60%) is characteristic of repetitive focus tracks."
    ]
  },
  s02: {
    classification: "identity",
    confidence: 0.92,
    reasoning: [
      "High skip rate (35%) shows active exploration and curation.",
      "High genre diversity indicates exploration of multiple distinct styles.",
      "No playlist name suggests manual queue exploration or search."
    ]
  },
  s03: {
    classification: "functional",
    confidence: 0.90,
    reasoning: [
      "Playlist name 'Gym Power Hour' indicates a physical activity background session.",
      "Low skip rate (8%) suggests a hands-off workout focus.",
      "High repeat rate (50%) keeps energy levels consistent."
    ]
  },
  s04: {
    classification: "identity",
    confidence: 0.88,
    reasoning: [
      "High skip rate (28%) indicates active skip-forward exploration.",
      "High genre and mood diversity matches exploration mode.",
      "Session length (25 minutes) is short, typical for a quick taste scroll."
    ]
  },
  s05: {
    classification: "functional",
    confidence: 0.62,
    reasoning: [
      "Playlist name 'Evening Wind Down' is typical of passive background listening.",
      "Medium genre diversity indicates a mix of background and personal selections.",
      "Low-to-moderate skip rate (15%) and repeat rate (25%) suggest a relaxed, borderline focus session."
    ]
  }
};

function getGeneralFallback(session) {
  const playlistName = session.playlist_name || "";
  const skipRate = session.skip_rate ?? 0.2;
  const repeatRate = session.repeat_rate ?? 0.1;
  const playlistLower = playlistName.toLowerCase();
  
  const hasFunctionalKeyword = playlistLower.includes("focus") ||
                               playlistLower.includes("lo-fi") ||
                               playlistLower.includes("lofi") ||
                               playlistLower.includes("study") ||
                               playlistLower.includes("gym") ||
                               playlistLower.includes("power") ||
                               playlistLower.includes("sleep") ||
                               playlistLower.includes("wind down") ||
                               playlistLower.includes("relax");

  const isFunctional = hasFunctionalKeyword || (skipRate < 0.15 && session.genre_diversity === "low");
  const classification = isFunctional ? "functional" : "identity";
  
  let confidence = 0.75;
  if (isFunctional) {
    if (skipRate < 0.05) confidence += 0.15;
    if (hasFunctionalKeyword) confidence += 0.05;
  } else {
    if (skipRate > 0.3) confidence += 0.15;
  }
  confidence = Math.min(Math.max(confidence, 0.5), 0.99);

  const reasoning = [];
  if (playlistName) {
    reasoning.push(`Playlist name '${playlistName}' suggests a ${isFunctional ? 'focused background' : 'curated'} environment.`);
  } else {
    reasoning.push(`No playlist name indicates direct track-to-track exploration.`);
  }
  reasoning.push(`${isFunctional ? 'Low' : 'High'} skip rate (${(skipRate * 100).toFixed(0)}%) suggests ${isFunctional ? 'passive background' : 'active'} engagement.`);
  reasoning.push(`${session.genre_diversity || 'Medium'} genre diversity points to a ${isFunctional ? 'consistent thematic' : 'varied discovery'} session.`);

  return { classification, confidence, reasoning };
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { session_id, playlist_name, skip_rate, repeat_rate, session_length_minutes, time_of_day, genre_diversity, tracks_played } = body;

    // Build session telemetry object
    const sessionTelemetry = {
      playlist_name,
      skip_rate,
      repeat_rate,
      session_length_minutes,
      time_of_day,
      genre_diversity,
      tracks_played
    };

    // If session_id is passed and telemetry is sparse, fill from seed_data
    let targetSessionId = session_id;
    if (session_id && seedData.sessions) {
      const seedSession = seedData.sessions.find(s => s.session_id === session_id);
      if (seedSession) {
        sessionTelemetry.playlist_name = sessionTelemetry.playlist_name ?? seedSession.playlist_name;
        sessionTelemetry.skip_rate = sessionTelemetry.skip_rate ?? seedSession.skip_rate;
        sessionTelemetry.repeat_rate = sessionTelemetry.repeat_rate ?? seedSession.repeat_rate;
        sessionTelemetry.session_length_minutes = sessionTelemetry.session_length_minutes ?? seedSession.session_length_minutes;
        sessionTelemetry.time_of_day = sessionTelemetry.time_of_day ?? seedSession.time_of_day;
        sessionTelemetry.genre_diversity = sessionTelemetry.genre_diversity ?? seedSession.genre_diversity;
        sessionTelemetry.tracks_played = sessionTelemetry.tracks_played ?? seedSession.tracks_played;
      }
    } else {
      // Try to identify session by matching telemetry if not explicitly passed
      const matchedSeedSession = seedData.sessions.find(s => 
        s.playlist_name === playlist_name && 
        s.skip_rate === skip_rate &&
        s.session_length_minutes === session_length_minutes
      );
      if (matchedSeedSession) {
        targetSessionId = matchedSeedSession.session_id;
      }
    }

    const apiKey = process.env.GROQ_API_KEY;
    const isApiKeyConfigured = apiKey && apiKey.trim() !== "" && !apiKey.startsWith("YOUR_");

    if (!isApiKeyConfigured) {
      console.log("GROQ_API_KEY is not configured. Using high-fidelity mock fallback.");
      const mockResult = fallbackData[targetSessionId] || getGeneralFallback(sessionTelemetry);
      return NextResponse.json({ ...mockResult, isMock: true });
    }

    // Resolve track details from seed library
    const resolvedTracks = (sessionTelemetry.tracks_played || []).map(tid => {
      const track = libraryMap.get(tid);
      return track ? track : { track_id: tid, title: "Unknown Track", artist: "Unknown Artist", genre: "unknown", mood_tags: [] };
    });

    // Build the LLM prompt
    const trackDetails = resolvedTracks.map(t => `- "${t.title}" by ${t.artist} (${t.genre}, Moods: ${t.mood_tags.join(', ')})`).join('\n');
    const systemPrompt = `You are an expert machine learning classifier embedded in Spotify's audio recommendation system. Your job is to classify user listening sessions as either "functional" or "identity" based on behavioral telemetry.

- "functional" session: Used as passive background noise (studying, sleep, workout, chores). Characters: low skip rates, high repeats, long session length, low genre/mood diversity, or functional playlist titles (e.g., "focus", "gym", "sleep").
- "identity" session: Active exploration, curating personal, core taste. Characters: higher skip rates (curation), high diversity of genres/moods, and no background/functional playlist titles.

You must output a strict JSON object with NO extra text or markdown wrapping. Match the following format exactly:
{
  "classification": "functional" | "identity",
  "confidence": number between 0.0 and 1.0,
  "reasoning": [
    "bullet point 1 explaining one telemetry signal",
    "bullet point 2 explaining another telemetry signal",
    "bullet point 3 explaining a third telemetry signal"
  ]
}

Ensure "reasoning" contains exactly 3 concise, user-friendly bullet points detailing how specific telemetry signals (such as skip rate, playlist title, etc.) influenced your classification.`;

    const userPrompt = `Classify this session:
Telemetry:
- Playlist Name: ${sessionTelemetry.playlist_name || 'None (Direct exploration)'}
- Skip Rate: ${(sessionTelemetry.skip_rate * 100).toFixed(0)}%
- Repeat Rate: ${(sessionTelemetry.repeat_rate * 100).toFixed(0)}%
- Session Duration: ${sessionTelemetry.session_length_minutes} minutes
- Time of Day: ${sessionTelemetry.time_of_day}
- Genre Diversity: ${sessionTelemetry.genre_diversity}

Tracks Played:
${trackDetails || 'None recorded'}`;

    console.log("Calling Groq API...");
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API error response:", errorText);
      throw new Error(`Groq API returned status ${response.status}`);
    }

    const responseData = await response.json();
    const content = responseData.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("Empty response from Groq API");
    }

    const classificationResult = JSON.parse(content);

    // Basic validation of fields
    if (!classificationResult.classification || !classificationResult.reasoning) {
      throw new Error("Invalid classification output structure");
    }

    return NextResponse.json({
      classification: classificationResult.classification,
      confidence: classificationResult.confidence ?? 0.8,
      reasoning: Array.isArray(classificationResult.reasoning) ? classificationResult.reasoning.slice(0, 3) : ["Analyzed session behavioral signals"],
      isMock: false
    });

  } catch (error) {
    console.error("Error in classification route, falling back to mock:", error);
    try {
      const body = await request.clone().json();
      const targetSessionId = body.session_id || "s01";
      const mockResult = fallbackData[targetSessionId] || getGeneralFallback(body);
      return NextResponse.json({ ...mockResult, isMock: true, error: error.message });
    } catch (_) {
      return NextResponse.json({
        classification: "functional",
        confidence: 0.5,
        reasoning: ["System error occurred. Fallback classification applied."],
        isMock: true,
        error: error.message
      });
    }
  }
}
