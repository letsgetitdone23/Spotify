"use client";

import React, { useState, useEffect } from "react";
import { 
  Home as HomeIcon, 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Heart, 
  Shield, 
  ChevronDown, 
  BookOpen, 
  Compass, 
  Dumbbell, 
  Moon, 
  Music, 
  RefreshCw, 
  Check, 
  Lock, 
  Volume2, 
  Wifi, 
  Battery, 
  Clock, 
  Sparkles, 
  Activity,
  Plus,
  Search,
  FolderHeart,
  MoreHorizontal,
  Library as LibraryIcon
} from "lucide-react";
import seedData from "@/data/seed_data.json";

// StatusBar Helper Component
function StatusBar() {
  const [time, setTime] = useState("03:10");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      let minutes = now.getMinutes();
      const strHours = hours < 10 ? "0" + hours : hours;
      const strMinutes = minutes < 10 ? "0" + minutes : minutes;
      setTime(`${strHours}:${strMinutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="status-bar">
      <span>{time}</span>
      <div className="status-bar-icons">
        <Wifi size={13} strokeWidth={2.5} />
        <Volume2 size={13} strokeWidth={2.5} />
        <Battery size={16} strokeWidth={2} />
      </div>
    </div>
  );
}

const PALETTE_COLORS = [
  "#1DB954", // Spotify Green
  "#11998e", // Teal
  "#8D67AB", // Purple
  "#1E3264", // Blue
  "#BC5900", // Orange
  "#E8115B", // Pink/Rose
  "#E1306C", // Magenta
  "#008080", // Dark Teal
  "#6f42c1", // Deep Purple
  "#2d46b9", // Bright Blue
  "#e91429", // Red
  "#155e63", // Slate Teal
  "#880e4f", // Deep Rose
  "#5b2b90", // Dark Purple
  "#1a508b", // Ocean Blue
];

const getStringHash = (str) => {
  let hash = 0;
  if (!str) return hash;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const getGradientForSeed = (seed) => {
  const hash = getStringHash(seed);
  const color1 = PALETTE_COLORS[hash % PALETTE_COLORS.length];
  const color2 = PALETTE_COLORS[(hash + 3) % PALETTE_COLORS.length];
  return `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`;
};

const getInitials = (name) => {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export default function App() {
  // Navigation & View State
  const [currentView, setCurrentView] = useState("home"); // home | simulate | nowplaying | insights | library
  const [selectedSession, setSelectedSession] = useState(null);
  
  // Player & Simulation State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [trackProgress, setTrackProgress] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Classifier API State
  const [classificationResult, setClassificationResult] = useState(null);
  const [showShield, setShowShield] = useState(false);
  const [showReveal, setShowReveal] = useState(false);

  // Reveal Card Recommendation State
  const [revealTrack, setRevealTrack] = useState(null);
  const [activeRevealChip, setActiveRevealChip] = useState("All");
  const [revealTrigger, setRevealTrigger] = useState("shield"); // "shield" | "identity"
  
  // Saved Tracks & Toast State
  const [savedTracksSet, setSavedTracksSet] = useState(new Set(["t005"]));
  const [toastText, setToastText] = useState("");

  // Library and Discovery Pool states
  const [library, setLibrary] = useState(seedData.library);
  const [discoveryPool, setDiscoveryPool] = useState(seedData.discovery_pool || []);

  // Playlist Override and History state
  const [playlistOverrides, setPlaylistOverrides] = useState({
    "Deep Focus Lo-Fi": { override: "auto", last_classification: "functional" },
    "Gym Power Hour": { override: "auto", last_classification: "functional" },
    "Evening Wind Down": { override: "auto", last_classification: null },
    "Discover Weekly": { override: "auto", last_classification: null },
    "Release Radar": { override: "auto", last_classification: null }
  });

  const [functionalSessionsProtected, setFunctionalSessionsProtected] = useState(2);
  const [revealSaves, setRevealSaves] = useState([
    { track_id: "t005", title: "Copper Skies", artist: "Wren Ellery", genre: "indie folk" }
  ]);

  const [openOverridePlaylistName, setOpenOverridePlaylistName] = useState(null);
  const [playlistForOverrideMenu, setPlaylistForOverrideMenu] = useState(null);
  const [activeLibraryTab, setActiveLibraryTab] = useState("playlists"); // Default to Playlists tab
  const [showIdentityToast, setShowIdentityToast] = useState(false);
  const [currentSessionClassification, setCurrentSessionClassification] = useState(null);
  const [showDiscoveredArtistsModal, setShowDiscoveredArtistsModal] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(true); // Welcome Modal State

  // Insights History
  // Pre-seed history with realistic runs so dashboard starts populated
  const [runHistory, setRunHistory] = useState([
    { session_id: "s01", label: "3am study session", classification: "functional", confidence: 0.95, shielded: true, saved: true, date: "Yesterday" },
    { session_id: "s02", label: "Saturday afternoon exploring", classification: "identity", confidence: 0.92, shielded: false, saved: false, date: "Yesterday" },
    { session_id: "s03", label: "Morning gym session", classification: "functional", confidence: 0.90, shielded: true, saved: false, date: "2 days ago" }
  ]);

  // Toast notification trigger
  const triggerToast = (text) => {
    setToastText(text);
    setTimeout(() => {
      setToastText("");
    }, 2500);
  };

  // Maps tracks from IDs
  const getTrackDetails = (trackId) => {
    return library.find(t => t.track_id === trackId) || 
           discoveryPool.find(t => t.track_id === trackId) || {
      title: "Unknown Track",
      artist: "Unknown Artist",
      genre: "unknown",
      mood_tags: []
    };
  };

  // Session configuration map
  const getSessionDetails = (sessionId) => {
    return seedData.sessions.find(s => s.session_id === sessionId);
  };

  // Helper for Session Icons
  const renderSessionIcon = (sessionId) => {
    switch (sessionId) {
      case "s01": return <BookOpen size={20} />;
      case "s02": return <Compass size={20} />;
      case "s03": return <Dumbbell size={20} />;
      case "s04": return <Sparkles size={20} />;
      case "s05": return <Moon size={20} />;
      default: return <Music size={20} />;
    }
  };

  // Start Simulation playback
  const startSimulation = (sessionOrPlaylistName) => {
    let session;
    if (typeof sessionOrPlaylistName === "string") {
      const matched = seedData.sessions.find(s => s.playlist_name === sessionOrPlaylistName);
      if (matched) {
        session = matched;
      } else {
        // Generate a dynamic mock session for the playlist
        const override = playlistOverrides[sessionOrPlaylistName]?.override || "auto";
        const isForcedFunctional = override === "force_functional";
        const isForcedIdentity = override === "force_identity";
        
        // Find tracks in library/discoveryPool to play
        const trackIds = library.slice(0, 4).map(t => t.track_id);
        
        session = {
          session_id: "dynamic_" + sessionOrPlaylistName.replace(/\s+/g, "_").toLowerCase(),
          label: `${sessionOrPlaylistName} Stream`,
          playlist_name: sessionOrPlaylistName,
          tracks_played: trackIds.length > 0 ? trackIds : ["t001", "t002", "t003"],
          skip_rate: isForcedFunctional ? 0.05 : isForcedIdentity ? 0.6 : 0.2,
          repeat_rate: isForcedFunctional ? 0.4 : isForcedIdentity ? 0.0 : 0.1,
          session_length_minutes: 40,
          time_of_day: "15:00",
          genre_diversity: isForcedFunctional ? "low" : "high",
          expected_classification: isForcedFunctional ? "functional" : "identity"
        };
      }
    } else {
      session = sessionOrPlaylistName;
    }
    
    setSelectedSession(session);
    setCurrentTrackIndex(0);
    setTrackProgress(0);
    setIsPlaying(true);
    setCurrentView("nowplaying");
  };

  // Animate playback progress bar and auto-advance
  useEffect(() => {
    let timer;
    if (currentView === "nowplaying" && isPlaying && selectedSession) {
      timer = setInterval(() => {
        setTrackProgress(prev => {
          if (prev >= 100) {
            // Track playback finished, proceed
            clearInterval(timer);
            const tracksCount = selectedSession.tracks_played.length;
            if (currentTrackIndex < tracksCount - 1) {
              setCurrentTrackIndex(prevIdx => prevIdx + 1);
              setTrackProgress(0);
            } else {
              // Entire session simulation completed
              setIsPlaying(false);
              triggerClassification();
            }
            return 0;
          }
          return prev + 5; // Fast forward simulation step
        });
      }, 100);
    }
    return () => clearInterval(timer);
  }, [currentView, isPlaying, selectedSession, currentTrackIndex]);

  // Request classification to Next.js API route
  const triggerClassification = async () => {
    setIsAnalyzing(true);
    setCurrentSessionClassification(null);

    const playlistName = selectedSession.playlist_name;
    const overrideObj = playlistName ? playlistOverrides[playlistName] : null;

    if (overrideObj && overrideObj.override !== "auto") {
      // Manual override is active! Skip the API call entirely
      const forcedClassification = overrideObj.override === "force_functional" ? "functional" : "identity";
      const isFunctional = forcedClassification === "functional";

      // Simulate a small delay for user feedback/realism
      await new Promise(resolve => setTimeout(resolve, 800));

      setClassificationResult({
        classification: forcedClassification,
        confidence: 1.0,
        reasoning: [`Manual override: playlist "${playlistName}" is forced to ${forcedClassification === "functional" ? "functional" : "identity-driven"}.`],
        isOverride: true
      });
      setIsAnalyzing(false);
      setCurrentSessionClassification(forcedClassification);

      // Update last classification in override state
      setPlaylistOverrides(prev => ({
        ...prev,
        [playlistName]: {
          ...prev[playlistName],
          last_classification: forcedClassification
        }
      }));

      // Append this run to history
      const newHistoryItem = {
        session_id: selectedSession.session_id,
        label: selectedSession.label,
        classification: forcedClassification,
        confidence: 1.0,
        shielded: isFunctional,
        saved: false,
        date: "Just now"
      };
      setRunHistory(prev => [newHistoryItem, ...prev]);

      if (isFunctional) {
        setFunctionalSessionsProtected(prev => prev + 1);
        setShowShield(true);
      } else {
        // Identity session: Show the temporary top toast notification
        setShowIdentityToast(true);
        // After 3 seconds, auto-dismiss toast and trigger Reveal
        setTimeout(() => {
          setShowIdentityToast(false);
          setRevealTrigger("identity");
          selectRecommendation("All");
          setShowReveal(true);
        }, 3000);
      }
      return;
    }

    try {
      const res = await fetch("/api/classify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(selectedSession)
      });
      
      const data = await res.json();
      setClassificationResult(data);
      setIsAnalyzing(false);

      const isFunctional = data.classification === "functional";
      setCurrentSessionClassification(data.classification);

      // Update last classification in override state
      if (playlistName) {
        setPlaylistOverrides(prev => ({
          ...prev,
          [playlistName]: {
            ...prev[playlistName],
            last_classification: data.classification
          }
        }));
      }

      // Append this run to history
      const newHistoryItem = {
        session_id: selectedSession.session_id,
        label: selectedSession.label,
        classification: data.classification,
        confidence: data.confidence,
        shielded: isFunctional,
        saved: false,
        date: "Just now"
      };
      setRunHistory(prev => [newHistoryItem, ...prev]);

      if (isFunctional) {
        setFunctionalSessionsProtected(prev => prev + 1);
        setShowShield(true);
      } else {
        // Identity session: Show the temporary top toast notification
        setShowIdentityToast(true);
        // After 3 seconds, auto-dismiss toast and trigger Reveal
        setTimeout(() => {
          setShowIdentityToast(false);
          setRevealTrigger("identity");
          selectRecommendation("All");
          setShowReveal(true);
        }, 3000);
      }
    } catch (err) {
      console.error(err);
      setIsAnalyzing(false);
      triggerToast("Error connecting to classification endpoint.");
    }
  };

  // Handles manual skip controls in Now Playing screen
  const handleSkipNext = () => {
    if (!selectedSession) return;
    const tracksCount = selectedSession.tracks_played.length;
    if (currentTrackIndex < tracksCount - 1) {
      setCurrentTrackIndex(prev => prev + 1);
      setTrackProgress(0);
    } else {
      setIsPlaying(false);
      triggerClassification();
    }
  };

  const handleSkipPrev = () => {
    if (currentTrackIndex > 0) {
      setCurrentTrackIndex(prev => prev - 1);
      setTrackProgress(0);
    }
  };

  // Dismiss Shield and transition to Reveal Card Recommendation
  const handleDismissShield = () => {
    setShowShield(false);
    setRevealTrigger("shield");
    // Draw recommendation from uncorrupted pool
    selectRecommendation("All");
    setShowReveal(true);
  };

  // Draw a protected recommendation track (optionally filtered by chip)
  const selectRecommendation = (chip, excludeId = null) => {
    let pool = discoveryPool;

    if (chip && chip !== "All") {
      const chipLower = chip.toLowerCase();
      pool = discoveryPool.filter(t => 
        t.genre.toLowerCase() === chipLower || 
        t.mood_tags.some(tag => tag.toLowerCase() === chipLower)
      );
    }

    if (excludeId) {
      pool = pool.filter(t => t.track_id !== excludeId);
    }

    if (pool.length === 0) {
      pool = discoveryPool; // Fallback
    }

    if (pool.length === 0) {
      setRevealTrack(null);
      return;
    }

    const randomTrack = pool[Math.floor(Math.random() * pool.length)];
    setRevealTrack(randomTrack);
    setActiveRevealChip(chip);
  };

  // Save recommended track to personal library
  const handleSaveRecommendation = () => {
    if (!revealTrack) return;
    const isSaved = savedTracksSet.has(revealTrack.track_id);
    const newSet = new Set(savedTracksSet);
    
    if (isSaved) {
      newSet.delete(revealTrack.track_id);
      triggerToast("Removed from Your Library");
      setRevealSaves(prev => prev.filter(t => t.track_id !== revealTrack.track_id));

      // Move track back from library to discoveryPool
      setLibrary(prev => prev.filter(t => t.track_id !== revealTrack.track_id));
      setDiscoveryPool(prev => {
        if (!prev.some(t => t.track_id === revealTrack.track_id)) {
          return [...prev, revealTrack];
        }
        return prev;
      });
    } else {
      newSet.add(revealTrack.track_id);
      triggerToast("Added to Your Library");
      
      // Update history to mark the last run recommendation as saved
      setRunHistory(prev => {
        const updated = [...prev];
        if (updated[0]) {
          updated[0].saved = true;
        }
        return updated;
      });

      // Add to reveal saves history
      setRevealSaves(prev => [
        ...prev,
        {
          track_id: revealTrack.track_id,
          title: revealTrack.title,
          artist: revealTrack.artist,
          genre: revealTrack.genre
        }
      ]);

      // Move track from discoveryPool to library with pool: "known_identity" and play_count: 1
      setDiscoveryPool(prev => prev.filter(t => t.track_id !== revealTrack.track_id));
      setLibrary(prev => {
        if (!prev.some(t => t.track_id === revealTrack.track_id)) {
          return [...prev, { ...revealTrack, pool: "known_identity", play_count: 1 }];
        }
        return prev;
      });
    }
    setSavedTracksSet(newSet);
  };

  // Skip / Re-roll recommendation track
  const handleSkipRecommendation = () => {
    if (!revealTrack) return;
    selectRecommendation(activeRevealChip, revealTrack.track_id);
    triggerToast("Generating new recommendation...");
  };

  // Close Reveal sheet and reset simulation states
  const handleCloseReveal = () => {
    setShowReveal(false);
    setRevealTrack(null);
    setSelectedSession(null);
    setCurrentView("insights"); // Automatically view metrics to see updates
  };

  // Reset Metrics history
  const handleResetMetrics = () => {
    setRunHistory([]);
    setSavedTracksSet(new Set());
    setFunctionalSessionsProtected(0);
    setRevealSaves([]);
    setLibrary(seedData.library);
    setDiscoveryPool(seedData.discovery_pool || []);
    setPlaylistOverrides({
      "Deep Focus Lo-Fi": { override: "auto", last_classification: null },
      "Gym Power Hour": { override: "auto", last_classification: null },
      "Evening Wind Down": { override: "auto", last_classification: null },
      "Discover Weekly": { override: "auto", last_classification: null },
      "Release Radar": { override: "auto", last_classification: null }
    });
    triggerToast("Taste Journey and history cleared.");
  };

  const handleSetOverride = (playlistName, val) => {
    setPlaylistOverrides(prev => ({
      ...prev,
      [playlistName]: {
        ...prev[playlistName],
        override: val
      }
    }));
    setOpenOverridePlaylistName(null);
    triggerToast(`Override updated for "${playlistName}"`);
  };

  // Calculate live Insights metrics
  const totalRuns = runHistory.length;
  const shieldedRuns = runHistory.filter(h => h.shielded).length;
  const savedRuns = runHistory.filter(h => h.saved).length;

  const protectionRate = totalRuns > 0 
    ? Math.round((shieldedRuns / runHistory.filter(h => h.classification === "functional").length || 1) * 100) 
    : 100; // Default starts at 100%

  const saveRate = shieldedRuns > 0 
    ? Math.round((savedRuns / shieldedRuns) * 100) 
    : 0;

  // Filter chips for the Reveal Screen
  const revealFilterChips = ["All", "Dream Pop", "Indie Folk", "Indie Hindi", "Carnatic Fusion", "Ghazal Fusion", "Warm", "Soulful", "Dreamy"];

  return (
    <>
      {/* Phone Viewport Status Bar */}
      {currentView !== "nowplaying" && !showShield && !showReveal && <StatusBar />}

      {/* Global Identity Exploration Toast Banner */}
      {showIdentityToast && (
        <div className="identity-toast" style={{ top: currentView === "nowplaying" ? "50px" : "36px" }}>
          <Sparkles size={14} color="var(--spotify-green)" />
          <span>You're actively exploring — this is shaping your real taste.</span>
        </div>
      )}

      {/* Screen 1: Home Screen */}
      {currentView === "home" && (
        <div className="main-view-content" style={{ animation: "fadeIn 0.3s ease-out" }}>
          {/* Header */}
          <div className="app-header" style={{ marginBottom: "16px", borderBottom: "none", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
            <div className="header-profile-section" style={{ display: "flex", alignItems: "center", gap: "10px", flexGrow: 1 }}>
              <div className="profile-avatar" style={{ flexShrink: 0 }}>A</div>
              {/* Quick Filters Inline */}
              <div className="header-tabs" style={{ display: "flex", gap: "6px", margin: 0, padding: 0, border: "none" }}>
                <div className="header-tab active" style={{ padding: "6px 12px", fontSize: "11px" }}>All</div>
                <div className="header-tab" style={{ padding: "6px 12px", fontSize: "11px" }}>Music</div>
                <div className="header-tab" style={{ padding: "6px 12px", fontSize: "11px" }}>Podcasts</div>
              </div>
            </div>
            <Sparkles size={20} color="var(--spotify-green)" style={{ flexShrink: 0 }} />
          </div>

          {/* Recommended Stations */}
          <h3 className="section-title">Recommended Stations</h3>
          <div className="carousel-container">
            <div className="carousel-card" onClick={() => setCurrentView("simulate")}>
              <div className="card-img-wrapper">
                <img src="https://picsum.photos/seed/LoFiLullabies/400/400" alt="Lo-Fi Lullabies" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <span className="card-title">Lo-Fi Lullabies</span>
              <span className="card-subtitle">Relaxing beats for focus and study.</span>
            </div>
            <div className="carousel-card" onClick={() => setCurrentView("simulate")}>
              <div className="card-img-wrapper">
                <img src="https://picsum.photos/seed/GymHypeMix/400/400" alt="Gym Hype Mix" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <span className="card-title">Gym Hype Mix</span>
              <span className="card-subtitle">Energetic electronic and hip-hop.</span>
            </div>
            <div className="carousel-card" onClick={() => setCurrentView("simulate")}>
              <div className="card-img-wrapper">
                <img src="https://picsum.photos/seed/IndianFusionRadio/400/400" alt="Indian Fusion Radio" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <span className="card-title">Indian Fusion Radio</span>
              <span className="card-subtitle">Carnatic, Ghazal & Indie Hindi.</span>
            </div>
          </div>

          {/* Recents Playlists Section */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 20px", marginTop: "16px" }}>
            <h3 className="section-title" style={{ margin: 0, padding: 0 }}>Recents</h3>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", cursor: "pointer" }} onClick={() => setCurrentView("library")}>Show all</span>
          </div>
          <div className="carousel-container" style={{ paddingBottom: "16px" }}>
            {Object.entries(playlistOverrides).map(([name, data]) => (
              <div key={name} className="carousel-card" style={{ position: "relative" }} onClick={() => startSimulation(name)}>
                <div className="card-img-wrapper" style={{ position: "relative" }}>
                  <img src={`https://picsum.photos/seed/${name.replace(/\s+/g, '')}session/400/400`} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  
                  {/* Badge overlay on the card art */}
                  {data.last_classification && (
                    <div style={{
                      position: "absolute",
                      top: "6px",
                      left: "6px",
                      backgroundColor: "rgba(0,0,0,0.85)",
                      borderRadius: "12px",
                      padding: "2px 6px",
                      display: "flex",
                      alignItems: "center",
                      gap: "2px",
                      fontSize: "8px",
                      fontWeight: "bold",
                      border: "1px solid rgba(255,255,255,0.15)",
                      whiteSpace: "nowrap"
                    }}>
                      {data.last_classification === "functional" ? (
                        <span style={{ color: "var(--spotify-green)" }}>🛡️ Protected</span>
                      ) : (
                        <span style={{ color: "#a8e6cf" }}>🌱 Exploring</span>
                      )}
                    </div>
                  )}
                </div>
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: "8px" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span className="card-title" style={{ margin: 0, display: "block", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{name}</span>
                    <span className="card-subtitle" style={{ display: "block", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                      {data.override === "auto" ? "Playlist • Spotify" : 
                       data.override === "force_functional" ? "Always functional" : "Always identity"}
                    </span>
                  </div>
                  
                  <button 
                    className="more-btn"
                    style={{ padding: "4px", margin: "-4px -4px 0 4px" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setPlaylistForOverrideMenu(name);
                    }}
                  >
                    <MoreHorizontal size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Streams (shortcuts to Simulator) */}
          <h3 className="section-title">Quick Simulate Scenarios</h3>
          <div className="carousel-container">
            {seedData.sessions.map((s) => (
              <div key={s.session_id} className="carousel-card" onClick={() => startSimulation(s)}>
                <div className="card-img-wrapper">
                  {s.image_url ? (
                    <img src={s.image_url} alt={s.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div className="card-img-gradient" style={{ background: getGradientForSeed(s.session_id), color: "#ffffff" }}>
                      {renderSessionIcon(s.session_id)}
                    </div>
                  )}
                </div>
                <span className="card-title">{s.label}</span>
                <span className="card-subtitle">
                  {s.playlist_name || "Direct queue"} • {s.session_length_minutes}m
                </span>
              </div>
            ))}
          </div>

          {/* Core Taste Profile info widget */}
          <div style={{ padding: "20px" }}>
            <div style={{ padding: "16px", backgroundColor: "var(--bg-card)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.04)" }}>
              <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "8px" }}>
                <Shield size={18} color="var(--spotify-green)" />
                <span style={{ fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--spotify-green)" }}>
                  TrueTune Taste Guard Active
                </span>
              </div>
              <p style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: "1.4" }}>
                TrueTune is monitoring session telemetry. Any background focus playlists will be excluded from updates to protect your discovery weekly channels.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Screen 2: Simulator Screen */}
      {currentView === "simulate" && (
        <div className="main-view-content" style={{ animation: "fadeIn 0.3s ease-out" }}>
          <div className="app-header">
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: "800" }}>Simulate Session</h2>
            <RefreshCw size={16} color="var(--text-light)" />
          </div>
          
          <p style={{ padding: "0 20px 16px", fontSize: "12px", color: "var(--text-muted)", lineHeight: "1.4" }}>
            Select one of the seeded listening sessions below. The simulation will mimic playback telemetry and execute LLM classification.
          </p>

          <div className="simulator-list">
            {seedData.sessions.map((s) => (
              <div key={s.session_id} className="simulator-card" onClick={() => startSimulation(s)}>
                <div className="simulator-card-icon">
                  {renderSessionIcon(s.session_id)}
                </div>
                <div className="simulator-card-content">
                  <div className="simulator-card-title">{s.label}</div>
                  <div className="simulator-card-subtitle">
                    {s.playlist_name ? `Playlist: "${s.playlist_name}"` : "Direct exploration"}<br />
                    Duration: {s.session_length_minutes} min | Skips: {(s.skip_rate * 100).toFixed(0)}% | Repeats: {(s.repeat_rate * 100).toFixed(0)}%
                  </div>
                </div>
                <div style={{ width: "24px", height: "24px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center" }}>
                  <Play size={12} fill="var(--text-primary)" style={{ marginLeft: "1px" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Screen 3: Now Playing Takeover */}
      {currentView === "nowplaying" && selectedSession && (
        <div className="nowplaying-view">
          <StatusBar />

          <div className="nowplaying-header" style={{ marginTop: "10px" }}>
            <ChevronDown 
              size={24} 
              className="nowplaying-chevron" 
              onClick={() => {
                setIsPlaying(false);
                setSelectedSession(null);
                setCurrentView("simulate");
                setCurrentSessionClassification(null);
              }} 
            />
            <div className="nowplaying-title-section">
              <span className="nowplaying-subtitle">SIMULATOR ACTIVE</span>
              <div className="nowplaying-session-name">{selectedSession.label}</div>
              {currentSessionClassification && (
                <div className="nowplaying-status-badge">
                  {currentSessionClassification === "functional" ? (
                    <span className="badge-pill functional-badge">🛡️ Protected</span>
                  ) : (
                    <span className="badge-pill identity-badge">🌱 Shaping your taste</span>
                  )}
                </div>
              )}
            </div>
            <div style={{ width: "24px" }} /> {/* Spacer */}
          </div>

          <div className="nowplaying-art-wrapper">
            {(() => {
              const trackId = selectedSession.tracks_played[currentTrackIndex];
              const track = getTrackDetails(trackId);
              return track.image_url ? (
                <div className="nowplaying-art" style={{ background: `url(${track.image_url}) center/cover no-repeat` }}>
                  <div style={{ position: "absolute", bottom: "16px", left: "16px", right: "16px", display: "flex", gap: "8px", alignItems: "center" }}>
                    <Activity size={12} color="var(--spotify-green)" />
                    <span style={{ fontSize: "10px", color: "var(--text-light)", fontWeight: "600", textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}>
                      TRACK {currentTrackIndex + 1} OF {selectedSession.tracks_played.length}
                    </span>
                  </div>
                </div>
              ) : (
                <div 
                  className="nowplaying-art"
                  style={{ background: getGradientForSeed(trackId) }}
                >
                  <Music size={64} color="rgba(255,255,255,0.6)" />
                  <div style={{ position: "absolute", bottom: "16px", left: "16px", right: "16px", display: "flex", gap: "8px", alignItems: "center" }}>
                    <Activity size={12} color="var(--spotify-green)" />
                    <span style={{ fontSize: "10px", color: "var(--text-light)", fontWeight: "600" }}>
                      TRACK {currentTrackIndex + 1} OF {selectedSession.tracks_played.length}
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Track details */}
          {(() => {
            const trackId = selectedSession.tracks_played[currentTrackIndex];
            const track = getTrackDetails(trackId);
            return (
              <div className="nowplaying-track-details">
                <div>
                  <div className="nowplaying-track-name">{track.title}</div>
                  <div className="nowplaying-track-artist">{track.artist}</div>
                </div>
                <div style={{ opacity: 0.6 }}>
                  <span style={{ fontSize: "10px", padding: "4px 8px", borderRadius: "10px", backgroundColor: "rgba(255,255,255,0.1)", textTransform: "uppercase" }}>
                    {track.genre}
                  </span>
                </div>
              </div>
            );
          })()}

          {/* Seek progress */}
          <div className="nowplaying-progress-section">
            <div className="progress-bar-bg" onClick={handleSkipNext}>
              <div className="progress-bar-fill" style={{ width: `${trackProgress}%` }}></div>
            </div>
            <div className="nowplaying-progress-time">
              <span>0:{(trackProgress * 0.03).toFixed(0).padStart(2, "0")}</span>
              <span>0:03</span>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="nowplaying-controls">
            <button className="control-btn active" style={{ opacity: 1 }}>
              <RefreshCw size={20} />
            </button>
            
            <button className="control-btn" onClick={handleSkipPrev}>
              <SkipBack size={24} fill="currentColor" />
            </button>

            <button 
              className="control-btn play-pause-btn" 
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause size={24} fill="var(--bg-black)" /> : <Play size={24} fill="var(--bg-black)" style={{ marginLeft: "2px" }} />}
            </button>

            <button className="control-btn" onClick={handleSkipNext}>
              <SkipForward size={24} fill="currentColor" />
            </button>

            <button className="control-btn active" style={{ color: "var(--spotify-green)" }}>
              <Shield size={20} fill="currentColor" />
            </button>
          </div>
        </div>
      )}

      {/* Loading Overlay (Telemetry classification in progress) */}
      {isAnalyzing && (
        <div className="loading-overlay">
          <div className="spinner" />
          <h3 style={{ fontSize: "16px", fontWeight: "700" }}>TrueTune Analysis Active</h3>
          <p style={{ fontSize: "12px", color: "var(--text-light)", textAlign: "center", padding: "0 40px", lineHeight: "1.4" }}>
            Querying Groq ML classifier engine with session telemetry signals...
          </p>
        </div>
      )}

      {/* Bottom Sheet Overlay: Shield Card */}
      {showShield && classificationResult && (
        <div className="bottom-sheet-backdrop">
          <div className="bottom-sheet-panel">
            <div className="bottom-sheet-handle" />
            
            <div className="shield-badge-container">
              <div className="truetune-pill">
                <Shield size={10} style={{ display: "inline-block", marginRight: "4px", verticalAlign: "middle" }} />
                TrueTune Shield
              </div>
              <div className="confidence-badge">
                {Math.round(classificationResult.confidence * 100)}% Confidence
              </div>
            </div>

            <div className="shield-icon-wrapper">
              <Shield size={32} fill="currentColor" />
            </div>

            <h3 className="shield-title">This session was protected</h3>
            <p className="shield-subtitle">
              We identified this as a <strong>functional background session</strong>. Plays will not influence your Taste Profile.
            </p>

            <span className="reasons-title">Signals Detected by AI:</span>
            <div className="reasons-list">
              {classificationResult.reasoning.map((r, i) => (
                <div key={i} className="reason-item">
                  <span className="reason-bullet">•</span>
                  <span>{r}</span>
                </div>
              ))}
            </div>

            <button className="btn-primary" onClick={handleDismissShield}>
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Bottom Sheet Overlay: Reveal Recommendation */}
      {showReveal && revealTrack && (
        <div className="bottom-sheet-backdrop">
          <div className="bottom-sheet-panel" style={{ backgroundColor: "#141c16", borderTop: "1px solid rgba(29, 185, 84, 0.2)" }}>
            <div className="bottom-sheet-handle" style={{ backgroundColor: "rgba(29, 185, 84, 0.3)" }} />

            <div className="shield-badge-container">
              <div className="truetune-pill" style={{ backgroundColor: "rgba(29,185,84,0.15)" }}>
                TrueTune Reveal
              </div>
              <div style={{ fontSize: "10px", color: "var(--text-light)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Protected Taste Pool
              </div>
            </div>

            <h3 className="shield-title" style={{ fontSize: "18px", textAlign: "left", marginBottom: "12px", fontFamily: "var(--font-sans)", fontWeight: "700" }}>
              {revealTrigger === "shield" 
                ? "Since your profile's protected, here's something new:"
                : "You're on a roll — here's another direction worth exploring:"}
            </h3>

            {/* Filter Chips */}
            <div className="chips-row">
              {revealFilterChips.map((chip) => (
                <div 
                  key={chip} 
                  className={`filter-chip ${activeRevealChip === chip ? "active" : ""}`}
                  onClick={() => selectRecommendation(chip)}
                >
                  {chip}
                </div>
              ))}
            </div>

            {/* Recommendation Track Item */}
            <div className="recommendation-card">
              {revealTrack.image_url ? (
                <div className="rec-art" style={{ background: `url(${revealTrack.image_url}) center/cover no-repeat` }} />
              ) : (
                <div className="rec-art" style={{ background: getGradientForSeed(revealTrack.track_id) }}>
                  <Music size={24} color="#ffffff" />
                </div>
              )}
              <div className="rec-details">
                <div className="rec-title">{revealTrack.title}</div>
                <div className="rec-artist">{revealTrack.artist}</div>
                <div className="rec-tagline">
                  <Sparkles size={10} />
                  <span>{revealTrack.genre} • {revealTrack.mood_tags.join(", ")}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="actions-container">
              <button 
                className="btn-primary" 
                style={{ flex: 1, padding: "12px 24px" }}
                onClick={() => triggerToast(`Simulating play: "${revealTrack.title}"`)}
              >
                Play
              </button>
              <button 
                className={`btn-secondary ${savedTracksSet.has(revealTrack.track_id) ? "saved" : ""}`}
                onClick={handleSaveRecommendation}
              >
                <Heart size={16} fill={savedTracksSet.has(revealTrack.track_id) ? "currentColor" : "none"} />
                {savedTracksSet.has(revealTrack.track_id) ? "Saved" : "Save"}
              </button>
            </div>

            <div className="btn-skip" onClick={handleSkipRecommendation}>
              Skip recommendation
            </div>

            <button 
              className="btn-primary" 
              style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "var(--text-primary)", border: "1px solid rgba(255,255,255,0.08)", marginTop: "16px" }}
              onClick={handleCloseReveal}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Screen 6: Your Taste Journey Screen */}
      {currentView === "insights" && (
        <div className="main-view-content" style={{ animation: "fadeIn 0.3s ease-out" }}>
          <div className="app-header">
            <h2 className="taste-journey-title">Your Taste Journey</h2>
            <Compass size={22} color="var(--spotify-green)" />
          </div>

          <p style={{ padding: "0 20px 16px", fontSize: "11px", color: "var(--text-light)", lineHeight: "1.4" }}>
            Monitor how effectively TrueTune shields your focus flows and captures real discovery milestones.
          </p>

          <div className="stats-grid">
            <div className="stat-card-journey">
              <span className="stat-number-large">{functionalSessionsProtected}</span>
              <span className="stat-label-large">Focus Sessions Protected</span>
              <span className="stat-subtext-large">
                Background audio streams isolated from your personal recommendations.
              </span>
            </div>

            <div 
              className="stat-card-journey"
              style={{ cursor: "pointer", transition: "transform 0.2s, background-color 0.2s" }}
              onClick={() => setShowDiscoveredArtistsModal(true)}
              title="Click to view discovered artists"
            >
              <span className="stat-number-large" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span>{new Set(revealSaves.map(t => t.artist.trim())).size}</span>
                <ChevronDown size={14} style={{ opacity: 0.6 }} />
              </span>
              <span className="stat-label-large" style={{ color: "var(--spotify-green)", textDecoration: "underline", textDecorationColor: "rgba(29,185,84,0.3)" }}>New Artists Discovered</span>
              <span className="stat-subtext-large">
                Unique artists introduced through TrueTune Reveal recommended tracks. Click to view list.
              </span>
            </div>
          </div>

          {/* Genre Tag Cloud */}
          <div className="genre-cloud-container">
            <h4 className="genre-cloud-title">Your Growing Genres</h4>
            {revealSaves.length === 0 ? (
              <p style={{ fontSize: "10px", color: "var(--text-muted)", fontStyle: "italic" }}>
                No taste discovery tracks saved yet. Run a protected session to find recommendations!
              </p>
            ) : (
              <div className="tag-cloud">
                {(() => {
                  const genreCounts = {};
                  revealSaves.forEach(t => {
                    if (t.genre) {
                      const normalized = t.genre.toLowerCase();
                      genreCounts[normalized] = (genreCounts[normalized] || 0) + 1;
                    }
                  });
                  const maxCount = Math.max(...Object.values(genreCounts), 1);
                  return Object.entries(genreCounts).map(([genre, count]) => {
                    const fontSize = Math.min(10 + (count / maxCount) * 6, 16);
                    return (
                      <span 
                        key={genre} 
                        className="cloud-tag"
                        style={{ fontSize: `${fontSize}px`, opacity: 0.6 + (count / maxCount) * 0.4 }}
                      >
                        {genre.charAt(0).toUpperCase() + genre.slice(1)} ({count})
                      </span>
                    );
                  });
                })()}
              </div>
            )}
          </div>

          {/* History */}
          <div className="insight-history-label" style={{ margin: "0 20px 8px" }}>Session Guard Log</div>
          {runHistory.length === 0 ? (
            <p style={{ padding: "20px", fontSize: "12px", color: "var(--text-muted)", textAlign: "center" }}>
              No simulations run yet. Go to Simulate to run a session!
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", padding: "0 16px" }}>
              {runHistory.map((item, idx) => (
                <div key={idx} className="history-item" style={{ margin: "0 4px 6px" }}>
                  <div className="history-details">
                    <span className="history-title">{item.label}</span>
                    <span className="history-subtitle">
                      {item.date} | Confidence: {Math.round(item.confidence * 100)}%
                    </span>
                  </div>
                  <span className={`history-badge ${item.shielded ? "shielded" : "identity"}`}>
                    {item.shielded ? "Shielded" : "Identity"}
                  </span>
                </div>
              ))}
            </div>
          )}

          <button className="reset-btn" onClick={handleResetMetrics} style={{ margin: "16px auto 20px" }}>
            <RefreshCw size={12} />
            Reset Taste Journey & History
          </button>
        </div>
      )}

      {/* Screen 7: Your Library Screen */}
      {currentView === "library" && (
        <div className="main-view-content" style={{ animation: "fadeIn 0.3s ease-out" }}>
          <div className="app-header">
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: "800" }}>Your Library</h2>
            <FolderHeart size={20} color="var(--spotify-green)" />
          </div>

          <div className="header-tabs">
            <div 
              className={`header-tab ${activeLibraryTab === "playlists" ? "active" : ""}`}
              onClick={() => {
                setActiveLibraryTab("playlists");
                setOpenOverridePlaylistName(null);
              }}
            >
              Playlists
            </div>
            <div 
              className={`header-tab ${activeLibraryTab === "saved" ? "active" : ""}`}
              onClick={() => {
                setActiveLibraryTab("saved");
                setOpenOverridePlaylistName(null);
              }}
            >
              Saved Discovery
            </div>
            <div 
              className={`header-tab ${activeLibraryTab === "artists" ? "active" : ""}`}
              onClick={() => {
                setActiveLibraryTab("artists");
                setOpenOverridePlaylistName(null);
              }}
            >
              Artists
            </div>
          </div>

          <div style={{ padding: "16px" }}>
            {activeLibraryTab === "playlists" && (
              <div>
                <h3 style={{ fontSize: "14px", fontWeight: "700", marginBottom: "12px", color: "var(--text-primary)" }}>
                  All Playlists ({Object.keys(playlistOverrides).length})
                </h3>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  {Object.entries(playlistOverrides).map(([name, data]) => (
                    <div key={name} className="playlist-item-row" onClick={() => startSimulation(name)} style={{ cursor: "pointer" }}>
                      <div className="playlist-item-left">
                        <div className="playlist-item-art" style={{ background: getGradientForSeed(name) }}>
                          <Music size={20} color="#ffffff" />
                        </div>
                        <div className="playlist-item-info">
                          <span className="playlist-item-name">{name}</span>
                          <span className="playlist-item-sub">
                            {data.override === "auto" ? "Auto-detect active" : 
                             data.override === "force_functional" ? "Always functional" : "Always identity"}
                          </span>
                          {data.last_classification && (
                            <div style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
                              {data.last_classification === "functional" ? (
                                <span className="playlist-status-badge functional">
                                  <Shield size={8} style={{ marginRight: "2px" }} /> Protected
                                </span>
                              ) : (
                                <span className="playlist-status-badge identity">
                                  🌱 Shaping taste
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="playlist-item-right">
                        <button 
                          className="more-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPlaylistForOverrideMenu(name);
                          }}
                        >
                          <MoreHorizontal size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeLibraryTab === "saved" && (
              <div>
                <h3 style={{ fontSize: "14px", fontWeight: "700", marginBottom: "12px", color: "var(--text-primary)" }}>
                  Protected Taste Saves ({savedTracksSet.size})
                </h3>
                
                {savedTracksSet.size === 0 ? (
                  <div style={{ padding: "40px 20px", textAlign: "center", backgroundColor: "var(--bg-card)", borderRadius: "12px" }}>
                    <Heart size={32} color="var(--text-light)" style={{ marginBottom: "12px", opacity: 0.5 }} />
                    <p style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: "1.5" }}>
                      Any recommendations saved during a TrueTune Reveal overlay will appear here, safely integrated with your uncorrupted library.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {Array.from(savedTracksSet).map((tid) => {
                      const track = getTrackDetails(tid);
                      return (
                        <div key={tid} className="simulator-card" style={{ padding: "12px" }}>
                          <div className="simulator-card-icon" style={{ background: getGradientForSeed(tid) }}>
                            <Music size={18} color="#ffffff" />
                          </div>
                          <div className="simulator-card-content">
                            <div className="simulator-card-title">{track.title}</div>
                            <div className="simulator-card-subtitle" style={{ color: "var(--text-light)" }}>
                              {track.artist} • <span style={{ color: "var(--spotify-green)" }}>{track.genre}</span>
                            </div>
                          </div>
                          <Heart 
                            size={16} 
                            fill="var(--spotify-green)" 
                            color="var(--spotify-green)" 
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                              const newSet = new Set(savedTracksSet);
                              newSet.delete(tid);
                              setSavedTracksSet(newSet);
                              setRevealSaves(prev => prev.filter(t => t.track_id !== tid));
                              triggerToast("Removed from Library");
                            }} 
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeLibraryTab === "artists" && (
              <div>
                <h3 style={{ fontSize: "14px", fontWeight: "700", marginBottom: "12px", color: "var(--text-primary)" }}>
                  Discovered Artists ({new Set(revealSaves.map(t => t.artist.trim())).size})
                </h3>
                
                {revealSaves.length === 0 ? (
                  <div style={{ padding: "40px 20px", textAlign: "center", backgroundColor: "var(--bg-card)", borderRadius: "12px" }}>
                    <Compass size={32} color="var(--text-light)" style={{ marginBottom: "12px", opacity: 0.5 }} />
                    <p style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: "1.5" }}>
                      Artists you discover via TrueTune Reveal recommendations will appear here.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {Array.from(new Set(revealSaves.map(t => t.artist.trim()))).map((artistName, idx) => (
                      <div key={idx} className="simulator-card" style={{ padding: "12px", borderRadius: "50px", display: "flex", alignItems: "center" }}>
                        <div className="simulator-card-icon" style={{ borderRadius: "50%", background: getGradientForSeed(artistName), width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <span style={{ color: "#ffffff", fontWeight: "bold", fontSize: "12px" }}>
                            {getInitials(artistName)}
                          </span>
                        </div>
                        <div className="simulator-card-content" style={{ marginLeft: "12px", flexGrow: 1 }}>
                          <div className="simulator-card-title" style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)" }}>{artistName}</div>
                          <div className="simulator-card-subtitle" style={{ color: "var(--spotify-green)", fontSize: "10px", fontWeight: "600", textTransform: "uppercase", marginTop: "2px" }}>
                            Discovered via TrueTune
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Screen 8: Search Screen */}
      {currentView === "search" && (
        <div className="main-view-content" style={{ animation: "fadeIn 0.3s ease-out" }}>
          <div className="app-header">
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: "800" }}>Search</h2>
          </div>
          
          <div style={{ padding: "0 20px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", backgroundColor: "#ffffff", borderRadius: "8px", padding: "10px 12px", gap: "8px", color: "#121212" }}>
              <Search size={18} color="#535353" />
              <span style={{ fontSize: "12px", fontWeight: "600", color: "#535353" }}>What do you want to listen to?</span>
            </div>
          </div>

          <div style={{ padding: "0 20px 20px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: "700", marginBottom: "12px", color: "var(--text-primary)" }}>Browse all</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {[
                { name: "Podcasts", color: "#E1306C" },
                { name: "Made For You", color: "#1E3264" },
                { name: "New Releases", color: "#E8115B" },
                { name: "Discover", color: "#8D67AB" },
                { name: "Live Events", color: "#735B00" },
                { name: "Pop", color: "#148A08" },
                { name: "Hip-Hop", color: "#BC5900" },
                { name: "Rock", color: "#E91429" }
              ].map((category, idx) => (
                <div 
                  key={idx} 
                  style={{ 
                    height: "90px", 
                    backgroundColor: category.color, 
                    borderRadius: "8px", 
                    padding: "12px", 
                    position: "relative", 
                    overflow: "hidden",
                    cursor: "pointer"
                  }}
                >
                  <span style={{ fontSize: "14px", fontWeight: "700", color: "#ffffff", display: "block" }}>{category.name}</span>
                  <div style={{ position: "absolute", bottom: "-10px", right: "-10px", width: "50px", height: "50px", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: "4px", transform: "rotate(25deg)" }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Sheet Overlay: Discovered Artists List */}
      {showDiscoveredArtistsModal && (
        <div className="bottom-sheet-backdrop" onClick={() => setShowDiscoveredArtistsModal(false)}>
          <div className="bottom-sheet-panel" onClick={(e) => e.stopPropagation()} style={{ maxHeight: "75%", backgroundColor: "#1c141a", borderTop: "1px solid rgba(255, 255, 255, 0.1)" }}>
            <div className="bottom-sheet-handle" style={{ backgroundColor: "rgba(255, 255, 255, 0.15)" }} />
            
            <h3 className="shield-title" style={{ fontSize: "18px", textAlign: "left", marginBottom: "8px", fontWeight: "700" }}>
              New Artists Discovered
            </h3>

            <p style={{ fontSize: "11px", color: "var(--text-light)", marginBottom: "16px", lineHeight: "1.4" }}>
              These are unique artists you discovered via TrueTune Reveal recommended tracks. Tapping Save on recommended songs automatically saves them here.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "250px", overflowY: "auto", paddingRight: "4px" }}>
              {Array.from(new Set(revealSaves.map(t => t.artist.trim()))).map((artistName, idx) => (
                <div key={idx} className="simulator-card" style={{ padding: "12px", borderRadius: "50px", display: "flex", alignItems: "center", backgroundColor: "rgba(255,255,255,0.04)" }}>
                  <div className="simulator-card-icon" style={{ borderRadius: "50%", background: getGradientForSeed(artistName), width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ color: "#ffffff", fontWeight: "bold", fontSize: "12px" }}>
                      {getInitials(artistName)}
                    </span>
                  </div>
                  <div className="simulator-card-content" style={{ marginLeft: "12px", flexGrow: 1 }}>
                    <div className="simulator-card-title" style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)" }}>{artistName}</div>
                    <div className="simulator-card-subtitle" style={{ color: "var(--spotify-green)", fontSize: "10px", fontWeight: "600", textTransform: "uppercase" }}>
                      Discovered via TrueTune
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button 
              className="btn-primary" 
              style={{ marginTop: "20px", backgroundColor: "var(--spotify-green)" }}
              onClick={() => setShowDiscoveredArtistsModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Playlist Override Bottom Sheet Options */}
      {playlistForOverrideMenu && (
        <div className="shield-overlay" style={{ display: "flex", justifyContent: "flex-end", padding: 0 }} onClick={() => setPlaylistForOverrideMenu(null)}>
          <div className="shield-card" onClick={(e) => e.stopPropagation()} style={{ 
            animation: "slideUp 0.3s cubic-bezier(0.32, 0.94, 0.6, 1)", 
            maxHeight: "none", 
            borderTopLeftRadius: "24px", 
            borderTopRightRadius: "24px", 
            padding: "24px 20px 32px",
            backgroundColor: "#161616"
          }}>
            <div style={{ width: "40px", height: "4px", backgroundColor: "rgba(255,255,255,0.2)", borderRadius: "2px", margin: "0 auto 20px" }} />
            
            <h3 style={{ fontSize: "16px", fontWeight: "700", textAlign: "center", marginBottom: "6px", color: "var(--text-primary)" }}>
              {playlistForOverrideMenu}
            </h3>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", textAlign: "center", marginBottom: "24px" }}>
              Configure TrueTune Taste Guard override settings
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
              <div 
                className={`override-option-large ${playlistOverrides[playlistForOverrideMenu]?.override === "auto" ? "active" : ""}`}
                onClick={() => {
                  handleSetOverride(playlistForOverrideMenu, "auto");
                  setPlaylistForOverrideMenu(null);
                }}
                style={{ 
                  padding: "14px 16px", 
                  borderRadius: "12px", 
                  backgroundColor: playlistOverrides[playlistForOverrideMenu]?.override === "auto" ? "rgba(29, 185, 84, 0.1)" : "rgba(255,255,255,0.04)", 
                  border: playlistOverrides[playlistForOverrideMenu]?.override === "auto" ? "1px solid var(--spotify-green)" : "1px solid rgba(255,255,255,0.05)",
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center", 
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                <div>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: playlistOverrides[playlistForOverrideMenu]?.override === "auto" ? "var(--spotify-green)" : "var(--text-primary)" }}>Auto-detect (Recommended)</div>
                  <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px" }}>TrueTune will dynamically classify session telemetry</div>
                </div>
                {playlistOverrides[playlistForOverrideMenu]?.override === "auto" && <Check size={16} color="var(--spotify-green)" />}
              </div>

              <div 
                className={`override-option-large ${playlistOverrides[playlistForOverrideMenu]?.override === "force_functional" ? "active" : ""}`}
                onClick={() => {
                  handleSetOverride(playlistForOverrideMenu, "force_functional");
                  setPlaylistForOverrideMenu(null);
                }}
                style={{ 
                  padding: "14px 16px", 
                  borderRadius: "12px", 
                  backgroundColor: playlistOverrides[playlistForOverrideMenu]?.override === "force_functional" ? "rgba(29, 185, 84, 0.1)" : "rgba(255,255,255,0.04)", 
                  border: playlistOverrides[playlistForOverrideMenu]?.override === "force_functional" ? "1px solid var(--spotify-green)" : "1px solid rgba(255,255,255,0.05)",
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center", 
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                <div>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: playlistOverrides[playlistForOverrideMenu]?.override === "force_functional" ? "var(--spotify-green)" : "var(--text-primary)" }}>Always Treat as Functional</div>
                  <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px" }}>Always protect library from this playlist (sleep/work focus)</div>
                </div>
                {playlistOverrides[playlistForOverrideMenu]?.override === "force_functional" && <Check size={16} color="var(--spotify-green)" />}
              </div>

              <div 
                className={`override-option-large ${playlistOverrides[playlistForOverrideMenu]?.override === "force_identity" ? "active" : ""}`}
                onClick={() => {
                  handleSetOverride(playlistForOverrideMenu, "force_identity");
                  setPlaylistForOverrideMenu(null);
                }}
                style={{ 
                  padding: "14px 16px", 
                  borderRadius: "12px", 
                  backgroundColor: playlistOverrides[playlistForOverrideMenu]?.override === "force_identity" ? "rgba(29, 185, 84, 0.1)" : "rgba(255,255,255,0.04)", 
                  border: playlistOverrides[playlistForOverrideMenu]?.override === "force_identity" ? "1px solid var(--spotify-green)" : "1px solid rgba(255,255,255,0.05)",
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center", 
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                <div>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: playlistOverrides[playlistForOverrideMenu]?.override === "force_identity" ? "var(--spotify-green)" : "var(--text-primary)" }}>Always Treat as Identity</div>
                  <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px" }}>Always allow this playlist to shape discovery insights</div>
                </div>
                {playlistOverrides[playlistForOverrideMenu]?.override === "force_identity" && <Check size={16} color="var(--spotify-green)" />}
              </div>
            </div>

            <button 
              className="btn-secondary" 
              style={{ width: "100%", padding: "14px", borderRadius: "25px", fontWeight: "700", border: "1px solid rgba(255,255,255,0.1)", backgroundColor: "transparent" }}
              onClick={() => setPlaylistForOverrideMenu(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Toast Notification Banner */}
      {toastText && (
        <div className="toast-msg">
          <Check size={12} strokeWidth={3} />
          <span>{toastText}</span>
        </div>
      )}

      {/* Bottom Nav Tab Bar */}
      {currentView !== "nowplaying" && !showShield && !showReveal && (
        <div className="bottom-nav">
          <div 
            className={`nav-item ${currentView === "home" ? "active" : ""}`}
            onClick={() => setCurrentView("home")}
          >
            <HomeIcon size={20} />
            <span>Home</span>
          </div>

          <div 
            className={`nav-item ${currentView === "simulate" ? "active" : ""}`}
            onClick={() => setCurrentView("simulate")}
          >
            <Play size={20} />
            <span>Simulate</span>
          </div>

          <div 
            className={`nav-item ${currentView === "insights" ? "active" : ""}`}
            onClick={() => setCurrentView("insights")}
          >
            <Compass size={20} />
            <span>Taste Journey</span>
          </div>

          <div 
            className={`nav-item ${currentView === "library" ? "active" : ""}`}
            onClick={() => setCurrentView("library")}
          >
            <LibraryIcon size={20} />
            <span>Your Library</span>
          </div>

          <div 
            className={`nav-item ${currentView === "search" ? "active" : ""}`}
            onClick={() => setCurrentView("search")}
          >
            <Search size={20} />
            <span>Search</span>
          </div>
        </div>
      )}

      {/* Welcome Modal Overlay */}
      {showWelcomeModal && (
        <div className="tour-overlay" style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: "rgba(0,0,0,0.85)", zIndex: 9999,
          display: "flex", alignItems: "center", justifyContent: "center", padding: "20px"
        }}>
          <div style={{
            backgroundColor: "#282828", borderRadius: "12px", padding: "24px",
            maxWidth: "400px", width: "100%", boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            animation: "fadeIn 0.3s ease-out"
          }}>
            <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "16px", color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
              <Sparkles size={24} color="var(--spotify-green)" /> Welcome to TrueTune
            </h2>
            <p style={{ fontSize: "14px", color: "var(--text-light)", lineHeight: "1.5", marginBottom: "16px" }}>
              This is a functional MVP demonstrating how Spotify can protect a user's taste profile from functional listening sessions.
            </p>
            <div style={{ backgroundColor: "rgba(0,0,0,0.2)", borderRadius: "8px", padding: "16px", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "12px", fontWeight: "700", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "12px", letterSpacing: "1px" }}>How to test the MVP:</h3>
              <ol style={{ paddingLeft: "16px", margin: 0, color: "#fff", fontSize: "13px", lineHeight: "1.6" }}>
                <li style={{ paddingBottom: "8px" }}>Tap <strong>Lo-Fi Lullabies</strong> to simulate a background focus session.</li>
                <li style={{ paddingBottom: "8px" }}>Watch the AI classify the session and trigger the <strong>Shield</strong>.</li>
                <li>Tap <strong>Got it</strong> to see the <strong>Reveal</strong> recommendation pop up.</li>
              </ol>
            </div>
            <button 
              className="btn-primary" 
              style={{ width: "100%", padding: "14px", borderRadius: "25px", fontWeight: "700", fontSize: "15px" }}
              onClick={() => setShowWelcomeModal(false)}
            >
              Start Exploring
            </button>
          </div>
        </div>
      )}
    </>
  );
}
