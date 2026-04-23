import React, { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from './supabaseClient';

const TEAL = '#00e5cc';
const GOLD = '#ffcc00';
const PURPLE = '#9966ff';
const BG = '#000000';
const GRAY = '#8899aa';

const getBandName = (b) => typeof b === 'string' ? b : (b?.name || '');

const fmtDateShort = d => {
  if (!d) return '—';
  const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const dt = new Date(d + 'T12:00:00');
  return `${MONTHS_SHORT[dt.getMonth()]} ${dt.getDate()}, ${dt.getFullYear()}`;
};

const getYear = d => d ? new Date(d + 'T12:00:00').getFullYear() : null;

const GENRE_COLORS = {
  'Indie Rock':'#00f2ff','Alternative':'#9d00ff','Experimental':'#ff00ff',
  'Electronic':'#ff0077','Jam':'#ffcc00','Folk':'#ffaa00','Classic Rock':'#ff4400',
  'Pop':'#00e5ff','Hip Hop':'#a2ff00','Punk':'#ff3300','R&B':'#ff66cc',
  'Country':'#cc8800','Metal':'#888888','Other':'#334455','Festival':'#ffcc00',
};

const FounderEntrance = ({ onEnter }) => {
  return (
    <div 
      onClick={onEnter}
      style={{
        width: '100%',
        maxWidth: '500px',
        margin: '60px auto',
        cursor: 'pointer',
        perspective: '1000px', // 3D Effect
        position: 'relative'
      }}
    >
      <div style={{
        fontFamily: "'Space Mono'",
        fontSize: '11px',
        color: '#ffcc00',
        textAlign: 'center',
        letterSpacing: '6px',
        marginBottom: '20px',
        textShadow: '0 0 10px rgba(255,204,0,0.5)'
      }}>
        [ UNLOCK THE FOUNDER'S GATE ]
      </div>

      <div 
        className="castle-gate"
        style={{
          height: '320px',
          background: '#050508',
          border: '4px solid #1a1a1a',
          borderRadius: '4px',
          display: 'flex',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 30px 100px rgba(0,0,0,0.8), inset 0 0 50px rgba(0,0,0,1)',
          transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#ffcc00';
          e.currentTarget.style.transform = 'translateZ(20px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#1a1a1a';
          e.currentTarget.style.transform = 'translateZ(0)';
        }}
      >
        {/* Left Heavy Door */}
        <div style={{ 
          flex: 1, 
          background: 'linear-gradient(90deg, #111 0%, #1a1a1a 100%)', 
          borderRight: '2px solid #000',
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          padding: '20px',
          gap: '20px'
        }}>
          {/* Iron Studs */}
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: '#000', boxShadow: 'inset -2px -2px 2px #333' }} />
          ))}
        </div>

        {/* The Crest Portal */}
        <div style={{ 
          position: 'absolute', 
          inset: 0, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 10,
          pointerEvents: 'none'
        }}>
          <div style={{ 
            width: 120, height: 160, 
            border: '2px solid #ffcc00', 
            borderRadius: '60px 60px 10px 10px',
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 40px rgba(255,204,0,0.2)'
          }}>
             <div style={{ fontSize: '3rem', marginBottom: 5 }}>🏰</div>
             <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.8rem', color: '#fff', letterSpacing: 2 }}>FOUNDER</div>
             <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.2rem', color: '#ffcc00', letterSpacing: 5 }}>ERIC</div>
          </div>
        </div>

        {/* Right Heavy Door */}
        <div style={{ 
          flex: 1, 
          background: 'linear-gradient(-90deg, #111 0%, #1a1a1a 100%)', 
          borderLeft: '2px solid #000',
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          padding: '20px',
          gap: '20px',
          justifyItems: 'end'
        }}>
          {/* Iron Studs */}
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: '#000', boxShadow: 'inset 2px -2px 2px #333' }} />
          ))}
        </div>

        {/* Under-Door Light Leak */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: '#ffcc00',
          boxShadow: '0 0 20px #ffcc00',
          opacity: 0.6
        }} />
      </div>

      <div style={{
        marginTop: '30px',
        textAlign: 'center',
        fontFamily: "'Space Mono'",
        fontSize: '10px',
        color: '#444',
        textTransform: 'uppercase'
      }}>
        // Protocol: Secure Spectator Entry // Clearance: Level 1
      </div>
    </div>
  );
};
export default function LandingPage({ 
  currentSession, 
  onEnterArchive, 
  onNavigateToUser, 
  onLogout 
}) {
  // 🟢 Removed internal session state because it now comes from App.js as a prop
  const sessionChecked = true; 

  const [mode, setMode] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [featuredIdx, setFeaturedIdx] = useState(0);
  const [tickerPaused, setTickerPaused] = useState(false);
  const [recentUsers, setRecentUsers] = useState([]);
  const [concerts, setConcerts] = useState([]);
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
  const fetchPublicConcerts = async () => {
    const { data } = await supabase
      .from('concerts')
      .select('id, date, bands, venue, city, state, genre, is_festival, festival_name, image_url, personal_photo_url, setlist_image_url, festival_poster_url, wristband_image_url, user_id')
      .order('date', { ascending: false })
      .limit(600);
    if (data) setConcerts(data);
  };
  fetchPublicConcerts();
}, []);

  useEffect(() => {
    const fetchRecentUsers = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('username, avatar_color, last_seen, last_artist, last_venue')
        .order('last_seen', { ascending: false })
        .limit(10);
      if (data) {
        setRecentUsers(data);
        setUserCount(data.length);
      }
    };
    fetchRecentUsers();
  }, []);

  const [sliderYear, setSliderYear] = useState(null);
  const [hoveredArtifact, setHoveredArtifact] = useState(null);
  const isMobile = window.innerWidth < 768;

  const artifacts = useMemo(() =>
  concerts
    .filter(c => c.user_id === 'e6497375-65df-4187-8767-1093dd13f97c' && (c.image_url || c.personal_photo_url || c.setlist_image_url))
    .sort(() => 0.5 - Math.random())
    .slice(0, 8)
, [concerts]);

  const years = useMemo(() => {
    const ys = [...new Set(concerts.map(c => getYear(c.date)).filter(Boolean))].sort();
    return ys;
  }, [concerts]);

  const minYear = years[0] || 2000;
  const maxYear = years[years.length - 1] || 2026;

  useEffect(() => {
    if (years.length) setSliderYear(maxYear);
  }, [years.length]);

  const sliderConcerts = useMemo(() => {
    if (!sliderYear) return concerts;
    return concerts.filter(c => getYear(c.date) === sliderYear);
  }, [concerts, sliderYear]);

  const sliderArtifact = useMemo(() => {
  const withImg = sliderConcerts.filter(c => 
    c.user_id === 'e6497375-65df-4187-8767-1093dd13f97c' && 
    (c.image_url || c.personal_photo_url)
  );
  return withImg[0] || null;
}, [sliderConcerts]);

  useEffect(() => {
    if (!artifacts.length) return;
    const t = setInterval(() => {
      if (!tickerPaused) setFeaturedIdx(p => (p + 1) % artifacts.length);
    }, 4000);
    return () => clearInterval(t);
  }, [artifacts.length, tickerPaused]);

  const featured = artifacts[featuredIdx] || concerts[0];
  const uniqueArtists = new Set(concerts.flatMap(c => (c.bands || []).map(getBandName)).filter(Boolean)).size;
  const uniqueVenues = useMemo(() => new Set(concerts.map(c => c.venue).filter(Boolean)).size, [concerts]);
  const uniqueStates = useMemo(() => new Set(concerts.map(c => c.state).filter(Boolean)).size, [concerts]);
  const uniqueGenres = useMemo(() => new Set(concerts.map(c => c.genre).filter(Boolean)).size, [concerts]);


  const tickerItems = useMemo(() => {
    if (!concerts.length) return 'INITIALIZING GLOBAL SIGNAL...';
    const bits = [];
    concerts.slice(0, 15).forEach(c => {
      const band = getBandName(c.bands?.[0]) || c.festival_name || 'UNKNOWN';
      const venue = c.venue || 'UNKNOWN VENUE';
      const city = c.city || '';
      bits.push(`[NEW_SIGNAL] ${band.toUpperCase()} @ ${venue.toUpperCase()}${city ? ` (${city.toUpperCase()})` : ''}`);
    });
    concerts.filter(c => c.image_url || c.setlist_image_url).slice(0, 5).forEach(c => {
  const band = getBandName(c.bands?.[0]) || 'UNKNOWN';
  bits.push(`[ARTIFACT_ARCHIVED] ${band.toUpperCase()} — ${fmtDateShort(c.date).toUpperCase()}`);
});
bits.push(`[NETWORK_STAT] ${concerts.length} SIGNALS IN ARCHIVE`);
bits.push(`[NETWORK_STAT] ${uniqueVenues} UNIQUE STAGES DOCUMENTED`);
bits.push(`[NETWORK_STAT] ${uniqueStates} STATES ON THE MAP`);
const txt = bits.join('   ///   ') + '   ///   ';
return txt + txt;
}, [concerts, uniqueVenues, uniqueStates]);

  const permanentRecord = useMemo(() => {
    return concerts
      .filter(c => c.image_url)
      .sort(() => 0.5 - Math.random())
      .slice(0, 4);
  }, [concerts]);

  const scrubArtifacts = useMemo(() => {
    return concerts
      .filter(c => c.image_url || c.personal_photo_url)
      .slice(0, 5);
  }, [concerts]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage('ACCESS DENIED: ' + error.message);
      setLoading(false);
    } else if (data?.session) {
      // 🟢 The "Teleport" logic: Tell App.js to move to the interior
      onEnterArchive(); 
    }
  };
  
  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const { error } = await supabase.auth.signUp({
      email, password,
      options: {
        data: { username },
        emailRedirectTo: 'https://concert-tracker-eight.vercel.app'
      }
    });
    if (error) {
      setMessage('SIGNAL REJECTED: ' + error.message);
    } else {
      setMessage('VERIFICATION EMAIL SENT. CHECK YOUR INBOX TO ACTIVATE YOUR ARCHIVE.');
    }
    setLoading(false);
  };

  const featuredImg = featured
    ? (featured.image_url?.split(',')[0] || featured.personal_photo_url?.split(',')[0] || featured.setlist_image_url?.split(',')[0])
    : null;
  const featuredBand = featured ? (getBandName(featured.bands?.[0]) || featured.festival_name || 'UNKNOWN') : '';

  const sliderImg = sliderArtifact
    ? (sliderArtifact.image_url?.split(',')[0] || sliderArtifact.personal_photo_url?.split(',')[0])
    : null;
  const sliderBand = sliderArtifact ? (getBandName(sliderArtifact.bands?.[0]) || sliderArtifact.festival_name || '') : '';

  return (
    <div style={{ minHeight: '100vh', background: BG, color: '#fff', fontFamily: "'Space Mono', monospace", overflowX: 'hidden', position: 'relative' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono&display=swap');

        @keyframes ticker-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes drift {
          0% { transform: translateY(0px) rotate(-1deg); }
          50% { transform: translateY(-12px) rotate(1deg); }
          100% { transform: translateY(0px) rotate(-1deg); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-dot {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.4); opacity: 1; }
        }
        .ticker-scroll { display: inline-block; animation: ticker-scroll 120s linear infinite; white-space: nowrap; }
        .artifact-drift { animation: drift 6s ease-in-out infinite; }
        .fade-in { animation: fade-in 0.6s ease both; }

        .cta-primary {
          background: ${TEAL}; color: #000; border: none;
          padding: ${isMobile ? '14px 28px' : '16px 40px'};
          font-family: 'Bebas Neue', sans-serif;
          font-size: ${isMobile ? '1.2rem' : '1.4rem'};
          letter-spacing: 3px; cursor: pointer; border-radius: 4px; transition: all 0.2s;
        }
        .cta-primary:hover { transform: scale(1.05); box-shadow: 0 0 30px rgba(0,229,204,0.6); }

        .cta-secondary {
          background: transparent; color: ${TEAL}; border: 1px solid ${TEAL};
          padding: ${isMobile ? '12px 24px' : '14px 32px'};
          font-family: 'Bebas Neue', sans-serif;
          font-size: ${isMobile ? '1.1rem' : '1.2rem'};
          letter-spacing: 3px; cursor: pointer; border-radius: 4px; transition: all 0.2s;
        }
        .cta-secondary:hover { background: rgba(0,229,204,0.1); }

        .modal-input {
          width: 100%; background: #0a0a0a; border: 1px solid #333; color: #fff;
          padding: 14px; font-family: 'Space Mono', monospace; font-size: 12px;
          outline: none; border-radius: 4px; box-sizing: border-box; transition: border-color 0.2s;
        }
        .modal-input:focus { border-color: ${TEAL}; }

        .scrub-artifact { position: relative; overflow: hidden; cursor: crosshair; }
        .scrub-artifact .encrypted { 
          position: absolute; inset: 0; 
          backdrop-filter: blur(12px) brightness(0.4);
          transition: all 0.4s ease;
          display: flex; align-items: center; justify-content: center;
        }
        .scrub-artifact:hover .encrypted { backdrop-filter: blur(0px) brightness(1); }

        .timeline-dot { 
          cursor: pointer; transition: all 0.2s;
          animation: pulse-dot 3s ease-in-out infinite;
        }
        .timeline-dot:hover { transform: scale(2) !important; }

        .scanline-overlay {
          position: fixed; inset: 0; pointer-events: none; z-index: 9998;
          background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px);
        }

        input[type='range'] {
          -webkit-appearance: none; width: 100%; height: 4px;
          background: linear-gradient(90deg, ${TEAL}, ${PURPLE});
          border-radius: 2px; outline: none;
        }
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none; width: 20px; height: 20px;
          border-radius: 50%; background: ${TEAL};
          box-shadow: 0 0 10px ${TEAL}; cursor: pointer;
        }

        .section-divider {
          width: 100%; max-width: 900px; margin: 0 auto;
          border: none; border-top: 1px solid #111; 
        }

        @media (max-width: 768px) {
          .hero-grid { flex-direction: column !important; align-items: center !important; }
          .scrub-row { flex-direction: column !important; gap: 12px !important; }
          .permanent-grid { grid-template-columns: 1fr 1fr !important; }
          .stats-row { gap: 20px !important; }
        }
      `}</style>

      <div className="scanline-overlay" />

      {/* ── TOP TICKER ── */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, background: '#000', borderBottom: `1px solid ${TEAL}44`, height: 36, display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        <div style={{ background: TEAL, color: '#000', fontFamily: "'Bebas Neue'", fontSize: 11, letterSpacing: 2, padding: '0 14px', height: '100%', display: 'flex', alignItems: 'center', fontWeight: 900, flexShrink: 0, boxShadow: `5px 0 15px rgba(0,229,204,0.4)` }}>
          LIVE SIGNAL
        </div>
        <div style={{ overflow: 'hidden', flex: 1 }}>
          <div className="ticker-scroll" style={{ fontFamily: "'Space Mono'", fontSize: 10, color: TEAL, paddingLeft: 20, letterSpacing: 1, textShadow: `0 0 8px rgba(0,229,204,0.5)` }}>
            {tickerItems}
          </div>
        </div>
      </div>

     {/* ── HERO ── */}
<div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: isMobile ? '80px 20px 60px' : '80px 40px 60px' }}>

  {/* Background glow */}
  <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%, -50%)', width: 600, height: 600, background: `radial-gradient(circle, rgba(0,229,204,0.06) 0%, transparent 70%)`, pointerEvents: 'none' }} />

{/* ── EMERGENCY LOGOUT (Landing Page) ── */}
{currentSession && (
  <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 100 }}>
    <button
      onClick={onLogout}
      style={{
        background: 'rgba(255, 68, 68, 0.1)',
        border: '1px solid #ff4466',
        color: '#ff4466',
        padding: '6px 12px',
        fontFamily: "'Space Mono'",
        fontSize: 8,
        borderRadius: 4,
        cursor: 'pointer',
        letterSpacing: 2,
        transition: 'all 0.2s'
      }}
      onMouseEnter={e => { e.currentTarget.style.background = '#ff4466'; e.currentTarget.style.color = '#000'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255, 68, 68, 0.1)'; e.currentTarget.style.color = '#ff4466'; }}
    >
      ⏻ TERMINATE SESSION
    </button>
  </div>
)}

  {/* Active Archivists — top right */}
  {recentUsers.length > 0 && (
    <div style={{ position: 'absolute', top: 20, right: isMobile ? 16 : 40, zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
      <div style={{ fontFamily: "'Space Mono'", fontSize: 7, color: GRAY, letterSpacing: 3, marginBottom: 4 }}>// ACTIVE ARCHIVISTS</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {sessionChecked && recentUsers.slice(0, 5).map(u => (
          <button
            key={u.username}
            onClick={() => {
  if (currentSession) {
    window.location.href = `https://concert-tracker-eight.vercel.app/#/u/${u.username}`;
  } else {
    window.location.hash = `#/u/${u.username}`;
    window.location.reload();
  }
}}
            style={{ background: '#0a0a0a', border: `1px solid ${u.avatar_color || TEAL}44`, borderRadius: 6, padding: '6px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = u.avatar_color || TEAL; e.currentTarget.style.background = `${u.avatar_color || TEAL}11`; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = `${u.avatar_color || TEAL}44`; e.currentTarget.style.background = '#0a0a0a'; }}
          >
            <div style={{ width: 20, height: 20, borderRadius: '50%', background: `${u.avatar_color || TEAL}22`, border: `1px solid ${u.avatar_color || TEAL}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue'", fontSize: '0.8rem', color: u.avatar_color || TEAL, flexShrink: 0 }}>
              {u.username[0].toUpperCase()}
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontFamily: "'Space Mono'", fontSize: 8, color: '#fff', letterSpacing: 1 }}>@{u.username}</div>
{sessionChecked && currentSession && u.last_artist && (
  <div style={{ fontFamily: "'Space Mono'", fontSize: 6, color: GRAY, marginTop: 1 }}>
    {u.last_artist.slice(0, 18)}
  </div>
)}
            </div>
          </button>
        ))}
      </div>
    </div>
  )}

  {/* Wordmark */}
  <div className="fade-in" style={{ textAlign: 'center', marginBottom: 48, position: 'relative', zIndex: 1 }}>
    <div style={{ fontFamily: "'Bebas Neue'", fontSize: isMobile ? '3.5rem' : 'clamp(3rem, 8vw, 6rem)', letterSpacing: 8, color: '#fff', lineHeight: 0.9, textShadow: `0 0 40px rgba(0,229,204,0.3)` }}>
      TRACK<span style={{ color: TEAL }}>RECORD</span>
    </div>
    <div style={{ fontFamily: "'Space Mono'", fontSize: 9, color: GRAY, letterSpacing: 4, marginTop: 12 }}>
      YOUR CONCERT HISTORY. MUSEUM GRADE.
    </div>
  </div>

  {/* Hero grid */}
  <div className="hero-grid fade-in" style={{ display: 'flex', gap: 60, alignItems: 'center', justifyContent: 'center', width: '100%', maxWidth: 900, position: 'relative', zIndex: 1, marginBottom: 48 }}
    onMouseEnter={() => setTickerPaused(true)}
    onMouseLeave={() => setTickerPaused(false)}
  >
    {/* Artifact */}
    {featuredImg && (
      <div className="artifact-drift" style={{ flexShrink: 0 }}>
        <div style={{ background: '#fff', padding: '10px 10px 50px 10px', boxShadow: '0 30px 80px rgba(0,0,0,0.8), 0 0 40px rgba(0,229,204,0.2)', borderRadius: 2, position: 'relative', width: isMobile ? 220 : 260 }}>
          <img src={featuredImg} alt={featuredBand} style={{ width: '100%', height: isMobile ? 160 : 200, objectFit: 'contain', display: 'block', background: '#000' }} />
          <div style={{ position: 'absolute', bottom: 10, left: 0, right: 0, textAlign: 'center', fontFamily: "'Bebas Neue'", fontSize: '1rem', color: '#111', letterSpacing: 2 }}>
            {featuredBand.toUpperCase()}
          </div>
        </div>
        {/* Readout */}
        <div style={{ marginTop: 12, background: '#0a0a0a', border: `1px solid ${TEAL}33`, borderRadius: 4, padding: '8px 12px', display: 'flex', gap: 16, justifyContent: 'center' }}>
          {[['DATE', fmtDateShort(featured?.date)], ['VENUE', (featured?.venue || 'UNKNOWN').slice(0, 18)], ['GRADE', 'MUSEUM']].map(([l, v]) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 7, color: TEAL, letterSpacing: 2, marginBottom: 2 }}>{l}</div>
              <div style={{ fontSize: 8, color: '#fff', letterSpacing: 1 }}>{v?.toUpperCase()}</div>
            </div>
          ))}
        </div>
        {/* Dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 10 }}>
          {artifacts.slice(0, 8).map((_, i) => (
            <div key={i} onClick={() => setFeaturedIdx(i)} style={{ width: i === featuredIdx ? 16 : 6, height: 6, borderRadius: 3, background: i === featuredIdx ? TEAL : '#333', cursor: 'pointer', transition: 'all 0.3s' }} />
          ))}
        </div>
      </div>
    )}

    {/* Right side — stats + one liner */}
    <div style={{ flex: 1, textAlign: isMobile ? 'center' : 'left' }}>
      <div style={{ fontFamily: "'Bebas Neue'", fontSize: isMobile ? '1rem' : '1.2rem', color: GRAY, letterSpacing: 4, marginBottom: 24 }}>
        THE ARCHIVE // LIVE READOUT
      </div>
      <div className="stats-row" style={{ display: 'flex', gap: 32, flexWrap: 'wrap', justifyContent: isMobile ? 'center' : 'flex-start', marginBottom: 32 }}>
  {[
    [concerts.length, 'SHOWS'],
    [uniqueArtists, 'ARTISTS'],
    [uniqueVenues, 'VENUES'],
    [uniqueStates, 'STATES'],
  ].map(([val, label]) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: isMobile ? '2rem' : '3rem', color: TEAL, lineHeight: 1, textShadow: `0 0 20px rgba(0,229,204,0.4)` }}>{val}</div>
            <div style={{ fontSize: 7, color: GRAY, letterSpacing: 2, marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>
      <div style={{ fontFamily: "'Bebas Neue'", fontSize: isMobile ? '1.4rem' : '2rem', color: '#fff', lineHeight: 1.2, marginBottom: 8, opacity: 0.9 }}>
  {concerts.length} SHOWS.<br />
  {uniqueArtists} ARTISTS.<br />
  {uniqueStates} STATES.<br />
  <span style={{ color: TEAL }}>ONE ARCHIVE.</span>
</div>
    </div>
  </div>

  {/* CTAs */}
<div className="fade-in" style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center', position: 'relative', zIndex: 1, marginTop: 40 }}>
  <button
    onClick={() => setMode('signup')}
    style={{
      background: TEAL,
      color: '#000',
      border: 'none',
      padding: isMobile ? '18px 40px' : '24px 64px',
      fontFamily: "'Bebas Neue'",
      fontSize: isMobile ? '1.4rem' : '2rem',
      letterSpacing: 5,
      cursor: 'pointer',
      borderRadius: 4,
      transition: 'all 0.3s',
      boxShadow: `0 0 40px rgba(0,229,204,0.4), 0 10px 40px rgba(0,0,0,0.4)`,
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05) translateY(-3px)'; e.currentTarget.style.boxShadow = `0 0 70px rgba(0,229,204,0.7), 0 20px 60px rgba(0,0,0,0.5)`; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1) translateY(0)'; e.currentTarget.style.boxShadow = `0 0 40px rgba(0,229,204,0.4), 0 10px 40px rgba(0,0,0,0.4)`; }}
  >
    INITIALIZE ARCHIVE
  </button>
  <button
    onClick={() => {
  if (currentSession) window.location.href = 'https://concert-tracker-eight.vercel.app';
  else setMode('login');
}}
    style={{
      background: 'transparent',
      color: TEAL,
      border: `2px solid ${TEAL}`,
      padding: isMobile ? '18px 40px' : '24px 64px',
      fontFamily: "'Bebas Neue'",
      fontSize: isMobile ? '1.4rem' : '2rem',
      letterSpacing: 5,
      cursor: 'pointer',
      borderRadius: 4,
      transition: 'all 0.3s',
    }}
    onMouseEnter={e => { e.currentTarget.style.background = `${TEAL}15`; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 0 30px ${TEAL}33`; }}
    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
  >
    ACCESS YOUR COLLECTION
  </button>
</div>

<FounderEntrance onEnter={() => onNavigateToUser('eric')} />

</div> {/* closes hero section */}


{/* ── THE SHOEBOX NARRATIVE ── */}
<div style={{ padding: isMobile ? '80px 20px' : '120px 40px', background: '#080808', borderTop: '1px solid #111', position: 'relative' }}>
  <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.2fr 1fr', gap: 60, alignItems: 'center' }}>
    
    <div>
      <div style={{ fontFamily: "'Space Mono'", fontSize: 10, color: GOLD, letterSpacing: 5, marginBottom: 20 }}>// THE PROBLEM</div>
      <div style={{ fontFamily: "'Bebas Neue'", fontSize: isMobile ? '2.5rem' : '4rem', lineHeight: 1, color: '#fff' }}>
        STILL DIGGING THROUGH <span style={{ color: GOLD }}>SHOEBOXES?</span>
      </div>
      <p style={{ fontFamily: "'Space Mono'", fontSize: 12, color: GRAY, lineHeight: 2, marginTop: 24 }}>
        The physical world is messy. Faded stubs, lost wristbands, and photos buried in a camera roll of 40,000 images. Your musical legacy deserves more than a cardboard box in the closet.
      </p>
    </div>

    <div style={{ background: '#000', border: `1px solid ${GOLD}22`, padding: 40, borderRadius: 12, textAlign: 'center', boxShadow: `0 20px 50px rgba(0,0,0,0.5)` }}>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20, marginBottom: 20 }}>
        <div style={{ fontSize: '2rem', opacity: 0.4 }}>📦</div>
        <div style={{ fontSize: '1.5rem', color: GOLD }}>→</div>
        <div style={{ fontSize: '2.5rem', textShadow: `0 0 20px ${TEAL}` }}>🏛️</div>
      </div>
      <div style={{ fontFamily: "'Space Mono'", fontSize: 9, color: TEAL, letterSpacing: 2 }}>
        [ DEPLOYING DIGITAL PRESERVATION ]
      </div>
      <div style={{ width: '100%', height: 1, background: 'linear-gradient(90deg, transparent, #222, transparent)', margin: '20px 0' }} />
      <div style={{ fontFamily: "'Space Mono'", fontSize: 7, color: GRAY, lineHeight: 2 }}>
        CONVERTING ANALOG CLUTTER<br/>
        TO ARCHIVAL SIGNALS
      </div>
    </div>

  </div>
</div>


{/* ── SECTION 2: THE PHYSICAL ARCHIVE ── */}
<div style={{ padding: isMobile ? '80px 20px' : '80px 40px', background: '#000', position: 'relative', overflow: 'hidden' }}>

  {/* Big background watermark */}
  {!isMobile && (
    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontFamily: "'Bebas Neue'", fontSize: '20rem', color: GOLD, opacity: 0.025, pointerEvents: 'none', whiteSpace: 'nowrap', letterSpacing: -10, userSelect: 'none', lineHeight: 1 }}>
      ARTIFACTS
    </div>
  )}

  {/* Side quotes */}
  {!isMobile && (
    <div style={{ position: 'absolute', left: -50, top: '50%', transform: 'translateY(-50%) rotate(-90deg)', fontFamily: "'Bebas Neue'", fontSize: '1.3rem', color: GOLD, letterSpacing: 8, opacity: 0.7, whiteSpace: 'nowrap' }}>
      THE SHOEBOX DIGITIZED
    </div>
  )}
  {!isMobile && (
    <div style={{ position: 'absolute', right: -70, top: '50%', transform: 'translateY(-50%) rotate(90deg)', fontFamily: "'Bebas Neue'", fontSize: '1.3rem', color: GOLD, letterSpacing: 8, opacity: 0.7, whiteSpace: 'nowrap' }}>
      EVERY SHOW LEAVES A MARK
    </div>
  )}

  <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative', zIndex: 1 }}>

    {/* Header */}
    <div style={{ textAlign: 'center', marginBottom: 24 }}>
      <div style={{ fontFamily: "'Bebas Neue'", fontSize: isMobile ? '2.5rem' : '4rem', color: '#fff', letterSpacing: 2, lineHeight: 0.9 }}>
        THE PHYSICAL <span style={{ color: GOLD }}>ARCHIVE</span>
      </div>
      <div style={{ fontFamily: "'Space Mono'", fontSize: 9, color: GRAY, marginTop: 12, letterSpacing: 2 }}>
        TICKET STUBS. SETLISTS. POLAROIDS. POSTERS. WRISTBANDS.
      </div>
    </div>

    {/* Emotional copy */}
    <div style={{ textAlign: 'center', marginBottom: 64 }}>
      <div style={{ fontFamily: "'Bebas Neue'", fontSize: isMobile ? '1.1rem' : '1.6rem', color: GRAY, letterSpacing: 3, lineHeight: 1.6 }}>
        Social media feeds disappear.
      </div>
      <div style={{ fontFamily: "'Bebas Neue'", fontSize: isMobile ? '1.6rem' : '2.5rem', color: '#fff', letterSpacing: 3, textShadow: `0 0 30px rgba(255,204,0,0.3)` }}>
        THE ARCHIVE IS <span style={{ color: GOLD }}>FOREVER.</span>
      </div>
      <div style={{ width: 60, height: 2, background: GOLD, margin: '20px auto 0', boxShadow: `0 0 10px ${GOLD}` }} />
    </div>

    {/* Real stats */}
    <div style={{ textAlign: 'center', marginBottom: 40 }}>
      <div style={{
        fontFamily: "'Bebas Neue'",
        fontSize: isMobile ? '2rem' : '3.5rem',
        lineHeight: 1.3, letterSpacing: 2,
      }}>
        <span style={{ color: GOLD }}>
          {concerts.filter(c => c.user_id === 'e6497375-65df-4187-8767-1093dd13f97c' && c.image_url && c.image_url !== '').length} TICKET STUBS.
        </span>{' '}
        <span style={{ color: TEAL }}>
          {concerts.filter(c => c.user_id === 'e6497375-65df-4187-8767-1093dd13f97c' && c.wristband_image_url && c.wristband_image_url !== '').length} WRISTBANDS.
        </span>{' '}
        <span style={{ color: PURPLE }}>
          {concerts.filter(c => c.user_id === 'e6497375-65df-4187-8767-1093dd13f97c' && c.setlist_image_url && c.setlist_image_url !== '').length} RELICS.
        </span>{' '}
        <span style={{ color: '#ff6699' }}>
          {concerts.filter(c => c.user_id === 'e6497375-65df-4187-8767-1093dd13f97c' && c.festival_poster_url && c.festival_poster_url !== '').length} POSTERS.
        </span>
      </div>
    </div>

    {/* Still in a box */}
    <div style={{ textAlign: 'center', marginBottom: 80 }}>
      <div style={{
        fontFamily: "'Bebas Neue'",
        fontSize: isMobile ? '1.8rem' : '3rem',
        letterSpacing: 6,
        background: `linear-gradient(90deg, ${GOLD}, ${TEAL})`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}>
        STILL IN A BOX. NOT FOR LONG.
      </div>
    </div>

  </div>
</div>

{/* ── TURN THIS INTO THIS ── */}
<div style={{ 
  padding: isMobile ? '80px 20px' : '120px 40px', 
  background: '#000',
  borderTop: '1px solid #111',
  position: 'relative',
  overflow: 'hidden'
}}>
  {/* Background glow */}
  <div style={{ 
    position: 'absolute', top: '50%', left: '50%', 
    transform: 'translate(-50%, -50%)',
    width: 800, height: 400,
    background: `radial-gradient(ellipse, rgba(0,229,204,0.04) 0%, transparent 70%)`,
    pointerEvents: 'none'
  }} />

  <div style={{ maxWidth: 1000, margin: '0 auto', position: 'relative', zIndex: 1 }}>
    
    {/* Header */}
    <div style={{ textAlign: 'center', marginBottom: 60 }}>
      <div style={{ fontFamily: "'Space Mono'", fontSize: 9, color: TEAL, letterSpacing: 4, marginBottom: 12 }}>
        // THE TRANSFORMATION
      </div>
      <div style={{ fontFamily: "'Bebas Neue'", fontSize: isMobile ? '2.5rem' : '5rem', color: '#fff', lineHeight: 0.9, letterSpacing: 2 }}>
        TURN <span style={{ color: GOLD }}>THIS</span> INTO <span style={{ color: TEAL }}>THIS</span>
      </div>
    </div>

    {/* Main two-panel */}
    <div style={{ 
      display: 'flex', 
      flexDirection: isMobile ? 'column' : 'row',
      gap: isMobile ? 40 : 0,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 80
    }}>

      {/* LEFT: THE CHAOS */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
        <div style={{ 
          fontFamily: "'Space Mono'", fontSize: 8, color: '#ff4466', 
          letterSpacing: 4, marginBottom: 8, textAlign: 'center'
        }}>
          BEFORE // THE SHOEBOX
        </div>
        
        {/* Stacked chaotic photos */}
        <div style={{ position: 'relative', width: isMobile ? 280 : 340, height: isMobile ? 340 : 400 }}>
          {/* Ticket pile — bottom */}
          <div style={{ 
            position: 'absolute', bottom: 0, left: 0,
            width: '85%',
            transform: 'rotate(-3deg)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
            border: '3px solid #1a1a1a'
          }}>
            <img 
              loading="lazy"
              src="https://pirqtmtzearmugvzhmgl.supabase.co/storage/v1/object/public/avatars/ticketPile.jpeg"
              alt="Ticket pile"
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          </div>
          {/* Wristband mess — top right, overlapping */}
          <div style={{ 
            position: 'absolute', top: '-10px', right: 0,
            width: '50%',
            transform: 'rotate(4deg)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
            border: '3px solid #1a1a1a'
          }}>
            <img 
              loading="lazy"
              src="https://pirqtmtzearmugvzhmgl.supabase.co/storage/v1/object/public/avatars/WristbandMess.jpeg"
              alt="Wristband mess"
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          </div>
        </div>

        {/* Chaos stats */}
        <div style={{ 
          fontFamily: "'Space Mono'", fontSize: 8, color: '#666',
          textAlign: 'center', lineHeight: 2, marginTop: 8
        }}>
          BURIED IN BOXES<br/>
          FADING. FORGOTTEN. LOST.
        </div>
      </div>

      {/* CENTER: ARROW */}
      <div style={{ 
        flexShrink: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 12, padding: isMobile ? '0' : '0 40px'
      }}>
        <div style={{ 
          fontFamily: "'Bebas Neue'", 
          fontSize: isMobile ? '3rem' : '5rem',
          color: TEAL,
          textShadow: `0 0 30px ${TEAL}`,
          transform: isMobile ? 'rotate(90deg)' : 'none',
          animation: 'pulse-dot 2s ease-in-out infinite'
        }}>
          →
        </div>
        <div style={{ 
          fontFamily: "'Space Mono'", fontSize: 7, 
          color: TEAL, letterSpacing: 2, textAlign: 'center',
          opacity: 0.6,
          transform: isMobile ? 'none' : 'none'
        }}>
          DIGITIZE
        </div>
      </div>

      {/* RIGHT: THE ARCHIVE */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
        <div style={{ 
          fontFamily: "'Space Mono'", fontSize: 8, color: TEAL, 
          letterSpacing: 4, marginBottom: 8, textAlign: 'center'
        }}>
          AFTER // THE ARCHIVE
        </div>

        {/* App screenshot in browser frame */}
        <div style={{ width: isMobile ? 280 : 340, position: 'relative' }}>
          <div style={{
            background: '#0a0a0f',
            border: `1px solid ${TEAL}44`,
            borderRadius: 12,
            overflow: 'hidden',
            boxShadow: `0 20px 60px rgba(0,0,0,0.8), 0 0 40px ${TEAL}11`
          }}>
            <div style={{
              background: '#050508',
              padding: '8px 12px',
              borderBottom: `1px solid ${TEAL}22`,
              display: 'flex', alignItems: 'center', gap: 6
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff4466' }} />
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: GOLD }} />
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00cc88' }} />
              <div style={{ flex: 1, background: '#111', borderRadius: 3, padding: '2px 8px', marginLeft: 8 }}>
                <div style={{ fontFamily: "'Space Mono'", fontSize: 6, color: '#444', letterSpacing: 1 }}>trackrecord.app</div>
              </div>
            </div>
            <img
              loading="lazy"
              src="https://pirqtmtzearmugvzhmgl.supabase.co/storage/v1/object/public/avatars/Screenshot%202026-04-22%20at%203.03.33%20PM.png"
              alt="TrackRecord Archive"
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          </div>
          <div style={{
            position: 'absolute', bottom: -20, left: '10%', right: '10%', height: 40,
            background: `radial-gradient(ellipse, ${TEAL}33, transparent)`,
            filter: 'blur(10px)', pointerEvents: 'none'
          }} />
        </div>

        <div style={{
          fontFamily: "'Space Mono'", fontSize: 8, color: TEAL,
          textAlign: 'center', lineHeight: 2, marginTop: 8
        }}>
          EVERY ARTIFACT. IN ONE PLACE.<br/>
          SEARCHABLE. FOREVER.
        </div>
      </div>
    </div>
  </div>
</div>

{/* ── SECTION 1: TEMPORAL DRIFT ── */}
<div style={{ padding: isMobile ? '60px 20px' : '80px 40px', background: '#050508', borderTop: '1px solid #111', borderBottom: '1px solid #111', position: 'relative', overflow: 'hidden' }}>

  {/* Side quote — left */}
  {!isMobile && (
    <div style={{ position: 'absolute', left: -60, top: '50%', transform: 'translateY(-50%) rotate(-90deg)', fontFamily: "'Bebas Neue'", fontSize: '1.4rem', color: TEAL, letterSpacing: 8, opacity: 0.7, whiteSpace: 'nowrap' }}>
      EVERY SHOW TELLS A STORY
    </div>
  )}

  {/* Side quote — right */}
  {!isMobile && (
    <div style={{ position: 'absolute', right: -80, top: '50%', transform: 'translateY(-50%) rotate(90deg)', fontFamily: "'Bebas Neue'", fontSize: '1.4rem', color: PURPLE, letterSpacing: 8, opacity: 0.7, whiteSpace: 'nowrap' }}>
      20 YEARS IN 2 SECONDS
    </div>
  )}

  <div style={{ maxWidth: 900, margin: '0 auto' }}>
    <div style={{ textAlign: 'center', marginBottom: 40 }}>
      <div style={{ fontFamily: "'Bebas Neue'", fontSize: isMobile ? '2.5rem' : '3.5rem', color: '#fff', letterSpacing: 2 }}>TEMPORAL DRIFT</div>
      <div style={{ fontFamily: "'Space Mono'", fontSize: 9, color: GRAY, marginTop: 8, letterSpacing: 2 }}>DRAG TO TRAVEL THROUGH YOUR HISTORY</div>
    </div>

    {/* Year display */}
    <div style={{ textAlign: 'center', marginBottom: 24 }}>
      <div style={{ fontFamily: "'Bebas Neue'", fontSize: isMobile ? '5rem' : '8rem', color: TEAL, lineHeight: 1, textShadow: `0 0 40px rgba(0,229,204,0.3)`, transition: 'all 0.3s' }}>
        {sliderYear}
      </div>
      <div style={{ fontFamily: "'Space Mono'", fontSize: 9, color: GRAY, letterSpacing: 2 }}>
        {sliderConcerts.length} SHOWS THIS YEAR
      </div>
    </div>

    {/* Slider */}
    <div style={{ padding: '0 20px', marginBottom: 48 }}>
      <input
        type="range"
        min={minYear}
        max={maxYear}
        value={sliderYear || maxYear}
        onChange={e => setSliderYear(Number(e.target.value))}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
        <span style={{ fontFamily: "'Space Mono'", fontSize: 8, color: GRAY }}>{minYear}</span>
        <span style={{ fontFamily: "'Space Mono'", fontSize: 8, color: GRAY }}>{maxYear}</span>
      </div>
    </div>

    {/* ── MINI PANORAMIC TIMELINE ── */}
    <div style={{ position: 'relative', height: 200, marginBottom: 48, overflowX: 'auto', overflowY: 'visible' }}>
      {/* Center line */}
      <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${TEAL}66, ${PURPLE}66, transparent)`, transform: 'translateY(-50%)', zIndex: 1 }} />

      {/* Dots + labels */}
      <div style={{ position: 'relative', height: '100%', minWidth: isMobile ? 600 : '100%' }}>
        {sliderConcerts.slice(0, 12).map((c, i) => {
          const band = getBandName(c.bands?.[0]) || c.festival_name || '?';
          const color = GENRE_COLORS[c.genre] || TEAL;
          const isUp = i % 2 === 0;
          const leftPct = ((i + 0.5) / Math.max(sliderConcerts.slice(0, 12).length, 1)) * 100;

          return (
            <div key={c.id || i} style={{ position: 'absolute', left: `${leftPct}%`, top: '50%', transform: 'translate(-50%, -50%)', zIndex: 10 }}>
              {/* Line going up or down */}
              <div style={{
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 1,
                height: 60,
                background: `linear-gradient(${isUp ? 'to top' : 'to bottom'}, ${color}, transparent)`,
                [isUp ? 'bottom' : 'top']: '100%',
                opacity: 0.7
              }} />

              {/* Label */}
              <div style={{
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
                [isUp ? 'bottom' : 'top']: 'calc(100% + 65px)',
                whiteSpace: 'nowrap',
                textAlign: 'center'
              }}>
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: '0.75rem', color: '#fff', letterSpacing: 1 }}>
                  {band.slice(0, 12).toUpperCase()}
                </div>
                <div style={{ fontFamily: "'Space Mono'", fontSize: 6, color: color }}>
                  {fmtDateShort(c.date)}
                </div>
              </div>

              {/* Dot */}
              <div style={{
                width: c.is_festival ? 12 : 8,
                height: c.is_festival ? 12 : 8,
                borderRadius: '50%',
                background: color,
                border: `2px solid ${c.is_festival ? GOLD : color}`,
                boxShadow: `0 0 10px ${color}`,
                position: 'relative',
                zIndex: 2,
                transition: 'all 0.2s'
              }} />
            </div>
          );
        })}

        {sliderConcerts.length === 0 && (
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontFamily: "'Space Mono'", fontSize: 9, color: GRAY, letterSpacing: 2 }}>
            NO SIGNALS THIS YEAR
          </div>
        )}
      </div>
    </div>

      <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', flexWrap: 'wrap', justifyContent: 'center' }}>
      <div style={{ flex: 1, minWidth: 200 }}>
        {sliderConcerts.slice(0, 6).map((c, i) => {
          const band = getBandName(c.bands?.[0]) || c.festival_name || 'Unknown';
          const color = GENRE_COLORS[c.genre] || TEAL;
          return (
            <div key={c.id || i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #111' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0, boxShadow: `0 0 6px ${color}` }} />
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.1rem', color: '#fff', flex: 1 }}>{band.toUpperCase()}</div>
              <div style={{ fontFamily: "'Space Mono'", fontSize: 8, color: GRAY, display: isMobile ? 'none' : 'block' }}>{c.venue?.slice(0, 18)}</div>
              <div style={{ fontFamily: "'Space Mono'", fontSize: 8, color: color, flexShrink: 0 }}>{fmtDateShort(c.date)}</div>
            </div>
          );
        })}
        {sliderConcerts.length > 6 && (
          <div style={{ fontFamily: "'Space Mono'", fontSize: 8, color: GRAY, marginTop: 10, letterSpacing: 2 }}>
            + {sliderConcerts.length - 6} MORE SIGNALS THIS YEAR
          </div>
        )}
      </div>
    </div>
  </div>
</div>


      {/* ── WHAT'S INSIDE ── */ }
<div style={{ padding: isMobile ? '80px 20px' : '80px 40px', background: '#000', position: 'relative', overflow: 'hidden' }}>
  
  {/* Side quotes */}
  {!isMobile && (
    <div style={{ position: 'absolute', left: -50, top: '50%', transform: 'translateY(-50%) rotate(-90deg)', fontFamily: "'Bebas Neue'", fontSize: '1.3rem', color: '#ff4466', letterSpacing: 8, opacity: 0.7, whiteSpace: 'nowrap' }}>
      WHAT LIVES INSIDE
    </div>
  )}
  {!isMobile && (
    <div style={{ position: 'absolute', right: -60, top: '50%', transform: 'translateY(-50%) rotate(90deg)', fontFamily: "'Bebas Neue'", fontSize: '1.3rem', color: '#00cfff', letterSpacing: 8, opacity: 0.7, whiteSpace: 'nowrap' }}>
      YOUR MUSEUM AWAITS
    </div>
  )}

  <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative', zIndex: 1 }}>
    <div style={{ textAlign: 'center', marginBottom: 64 }}>
      <div style={{ fontFamily: "'Bebas Neue'", fontSize: isMobile ? '2.5rem' : '4rem', color: '#fff', letterSpacing: 2 }}>
        BUILT FOR PEOPLE WHO <span style={{ color: '#ff4466' }}>FEEL</span> MUSIC
      </div>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? 24 : 32 }}>
      {[
        {
          icon: '⏳',
          color: TEAL,
          title: 'TIME MACHINE',
          sub: 'A panoramic timeline of every show you\'ve ever seen. Colored by genre. Spanning decades.',
          stat: `${concerts.length} SHOWS MAPPED`,
        },
        {
          icon: '🧬',
          color: GOLD,
          title: 'SONIC DNA',
          sub: 'Your genre fingerprint. See exactly what kind of music person you are — in a single glance.',
          stat: `${new Set(concerts.map(c => c.genre).filter(Boolean)).size} GENRES PROFILED`,
        },
        {
          icon: '🎟️',
          color: PURPLE,
          title: 'ARTIFACT VAULT',
          sub: 'Ticket stubs. Setlists. Polaroids. Festival posters. All in one physical archive.',
          stat: `${concerts.filter(c => c.image_url || c.personal_photo_url).length} ARTIFACTS STORED`,
        },
      ].map((item, i) => (
        <div
          key={i}
          style={{
            background: `linear-gradient(135deg, #0a0a0a, #050508)`,
            border: `1px solid ${item.color}33`,
            borderRadius: 12,
            padding: '36px 28px',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.4s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = item.color;
            e.currentTarget.style.transform = 'translateY(-8px)';
            e.currentTarget.style.boxShadow = `0 30px 80px ${item.color}22`;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = `${item.color}33`;
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {/* Background watermark */}
          <div style={{ position: 'absolute', bottom: -20, right: -10, fontFamily: "'Bebas Neue'", fontSize: '8rem', color: item.color, opacity: 0.04, pointerEvents: 'none', lineHeight: 1 }}>
            {item.icon}
          </div>

          {/* Top accent */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, transparent, ${item.color}, transparent)`, boxShadow: `0 0 10px ${item.color}` }} />

          <div style={{ fontSize: '2.5rem', marginBottom: 20 }}>{item.icon}</div>
          
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.8rem', color: '#fff', letterSpacing: 2, marginBottom: 12, lineHeight: 1 }}>
            {item.title}
          </div>
          
          <div style={{ fontFamily: "'Space Mono'", fontSize: 9, color: GRAY, lineHeight: 1.8, marginBottom: 24 }}>
            {item.sub}
          </div>

          <div style={{ fontFamily: "'Space Mono'", fontSize: 8, color: item.color, letterSpacing: 2, padding: '8px 12px', background: `${item.color}11`, border: `1px solid ${item.color}33`, borderRadius: 4, display: 'inline-block' }}>
            {item.stat}
          </div>
        </div>
      ))}
    </div>
  </div>
</div>

{/* ── PULSING MANIFESTO CARD ── */}
<div style={{ padding: isMobile ? '60px 20px' : '60px 40px', background: '#050508', borderTop: '1px solid #111' }}>
  <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
    <style>{`
      @keyframes speaker-pulse {
        0%, 100% { 
          box-shadow: 0 0 20px ${PURPLE}33, 0 0 60px ${PURPLE}11, inset 0 0 20px ${PURPLE}08;
          transform: scale(1);
        }
        50% { 
          box-shadow: 0 0 60px ${PURPLE}66, 0 0 120px ${PURPLE}22, inset 0 0 40px ${PURPLE}15;
          transform: scale(1.01);
        }
      }
      @keyframes text-breathe {
        0%, 100% { opacity: 0.7; letter-spacing: 4px; }
        50% { opacity: 1; letter-spacing: 6px; }
      }
      .manifesto-card {
        animation: speaker-pulse 3s ease-in-out infinite;
      }
      .manifesto-text {
        animation: text-breathe 3s ease-in-out infinite;
      }
    `}</style>
    <div
      className="manifesto-card"
      style={{
        border: `1px solid ${PURPLE}44`,
        borderRadius: 16,
        padding: isMobile ? '40px 24px' : '60px 48px',
        background: `linear-gradient(135deg, #0a0008, #08000f, #0a0008)`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Corner accents */}
      {[['0','0'], ['0','auto'], ['auto','0'], ['auto','auto']].map(([t, b], i) => (
        <div key={i} style={{ position: 'absolute', top: t === '0' ? 12 : 'auto', bottom: b === '0' ? 12 : 'auto', left: i < 2 ? 12 : 'auto', right: i >= 2 ? 12 : 'auto', width: 20, height: 20, borderTop: i < 2 ? `2px solid ${PURPLE}` : 'none', borderBottom: i >= 2 ? `2px solid ${PURPLE}` : 'none', borderLeft: i % 2 === 0 ? `2px solid ${PURPLE}` : 'none', borderRight: i % 2 === 1 ? `2px solid ${PURPLE}` : 'none', opacity: 0.6 }} />
      ))}

      <div className="manifesto-text" style={{ fontFamily: "'Bebas Neue'", fontSize: isMobile ? '1.1rem' : '1.5rem', color: PURPLE, letterSpacing: 4, lineHeight: 2.2, marginBottom: 16 }}>
        RELIVE YOUR LIVE MUSIC JOURNEY
      </div>
      <div style={{ fontFamily: "'Space Mono'", fontSize: isMobile ? 8 : 10, color: '#fff', letterSpacing: 3, lineHeight: 2, opacity: 0.7 }}>
        EVERY SHOW. EVERY STUB. EVERY MEMORY.
      </div>
    </div>
  </div>
</div>

{/* ── FINAL CTA ── */}
<div style={{ padding: isMobile ? '100px 20px' : '100px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden', background: '#000' }}>

  {/* Radial glow */}
  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 900, height: 900, background: 'radial-gradient(circle, rgba(0,229,204,0.07) 0%, rgba(153,102,255,0.04) 35%, transparent 65%)', pointerEvents: 'none' }} />

  {/* Top line */}
  <div style={{ position: 'absolute', top: 0, left: '5%', right: '5%', height: 1, background: `linear-gradient(90deg, transparent, ${TEAL}88, ${PURPLE}88, transparent)`, boxShadow: `0 0 20px ${TEAL}44` }} />

  {/* Side quotes */}
  {!isMobile && (
    <div style={{ position: 'absolute', left: -40, top: '50%', transform: 'translateY(-50%) rotate(-90deg)', fontFamily: "'Bebas Neue'", fontSize: '1.4rem', color: TEAL, letterSpacing: 8, opacity: 0.7, whiteSpace: 'nowrap' }}>
      CURATE YOUR COLLECTION
    </div>
  )}
  {!isMobile && (
    <div style={{ position: 'absolute', right: -60, top: '50%', transform: 'translateY(-50%) rotate(90deg)', fontFamily: "'Bebas Neue'", fontSize: '1.4rem', color: PURPLE, letterSpacing: 8, opacity: 0.7, whiteSpace: 'nowrap' }}>
      YOUR MUSIC. YOUR LEGACY.
    </div>
  )}

  <div style={{ position: 'relative', zIndex: 1 }}>

    <div style={{ fontFamily: "'Space Mono'", fontSize: 9, color: TEAL, letterSpacing: 6, marginBottom: 32, opacity: 0.8 }}>
      // THE ARCHIVE AWAITS
    </div>

    <div style={{ fontFamily: "'Bebas Neue'", fontSize: isMobile ? '4rem' : '9rem', color: '#fff', lineHeight: 0.85, letterSpacing: isMobile ? 2 : 6, marginBottom: 32, textShadow: `0 0 100px rgba(0,229,204,0.15)` }}>
      YOUR<br />
      HISTORY<br />
      <span style={{ color: TEAL, textShadow: `0 0 60px rgba(0,229,204,0.8)` }}>IS WAITING.</span>
    </div>

    <div style={{ fontFamily: "'Space Mono'", fontSize: isMobile ? 9 : 12, color: GRAY, letterSpacing: 5, marginBottom: 20, lineHeight: 2.5 }}>
      START YOUR ARCHIVE TODAY. IT'S FREE.<br />
      <span style={{ color: PURPLE }}>NO SHOEBOX REQUIRED.</span>
    </div>

    {/* Divider */}
    <div style={{ width: 80, height: 2, background: `linear-gradient(90deg, ${TEAL}, ${PURPLE})`, margin: '0 auto 60px', boxShadow: `0 0 15px ${TEAL}88` }} />

    {/* Buttons */}
    <div style={{ display: 'flex', gap: isMobile ? 16 : 24, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 80 }}>
      <button
        onClick={() => setMode('signup')}
        style={{
          background: TEAL,
          color: '#000',
          border: 'none',
          padding: isMobile ? '20px 40px' : '28px 72px',
          fontFamily: "'Bebas Neue'",
          fontSize: isMobile ? '1.4rem' : '2rem',
          letterSpacing: 5,
          cursor: 'pointer',
          borderRadius: 4,
          transition: 'all 0.3s',
          boxShadow: `0 0 40px rgba(0,229,204,0.5), 0 20px 60px rgba(0,0,0,0.5)`,
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.06) translateY(-4px)'; e.currentTarget.style.boxShadow = `0 0 80px rgba(0,229,204,0.8), 0 30px 80px rgba(0,0,0,0.6)`; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1) translateY(0)'; e.currentTarget.style.boxShadow = `0 0 40px rgba(0,229,204,0.5), 0 20px 60px rgba(0,0,0,0.5)`; }}
      >
        INITIALIZE ARCHIVE
      </button>
      <button
        onClick={() => currentSession ? onEnterArchive() : setMode('login')}
        style={{
          background: 'transparent',
          color: TEAL,
          border: `2px solid ${TEAL}`,
          padding: isMobile ? '20px 40px' : '28px 72px',
          fontFamily: "'Bebas Neue'",
          fontSize: isMobile ? '1.4rem' : '2rem',
          letterSpacing: 5,
          cursor: 'pointer',
          borderRadius: 4,
          transition: 'all 0.3s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = `${TEAL}15`; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 0 30px ${TEAL}33`; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
      >
        {currentSession ? 'ENTER THE ARCHIVE' : 'ACCESS YOUR COLLECTION'}
      </button>
    </div>

    {/* Stat strip */}
    <div style={{ display: 'flex', gap: isMobile ? 24 : 80, justifyContent: 'center', flexWrap: 'wrap', padding: '40px 0', borderTop: `1px solid #111`, borderBottom: `1px solid #111`, marginBottom: 48 }}>
  {[
    [concerts.length, 'SHOWS', TEAL],
    [uniqueArtists, 'ARTISTS', GOLD],
    [uniqueVenues, 'VENUES', PURPLE],
    [uniqueStates, 'STATES', '#ff4466'],
  ].map(([val, label, color]) => (
        <div key={label} style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: isMobile ? '3rem' : '5rem', color, lineHeight: 1, textShadow: `0 0 30px ${color}88` }}>{val}</div>
          <div style={{ fontFamily: "'Space Mono'", fontSize: 7, color: GRAY, letterSpacing: 4, marginTop: 8 }}>{label}</div>
        </div>
      ))}
    </div>

    {/* Bottom manifesto */}
    <div style={{ fontFamily: "'Bebas Neue'", fontSize: isMobile ? '0.9rem' : '1.1rem', color: GRAY, letterSpacing: 6, lineHeight: 2.5, opacity: 0.5 }}>
      TRACKRECORD // MUSEUM OF SOUND // EST. 2026<br />
      <span style={{ fontSize: '0.85rem', letterSpacing: 4 }}>EVERY SHOW. EVERY STUB. EVERY MEMORY.</span>
    </div>
  </div>

  {/* Bottom line */}
  <div style={{ position: 'absolute', bottom: 0, left: '5%', right: '5%', height: 1, background: `linear-gradient(90deg, transparent, ${PURPLE}88, ${TEAL}88, transparent)` }} />
</div>
        
      {/* ── BOTTOM TICKER ── */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000, background: '#000', borderTop: `1px solid ${TEAL}22`, height: 28, display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        <div style={{ background: '#111', color: GOLD, fontFamily: "'Bebas Neue'", fontSize: 10, letterSpacing: 2, padding: '0 12px', height: '100%', display: 'flex', alignItems: 'center', flexShrink: 0, borderRight: `1px solid ${GOLD}33` }}>
          SYS
        </div>
        <div style={{ overflow: 'hidden', flex: 1 }}>
          <div className="ticker-scroll" style={{ fontFamily: "'Space Mono'", fontSize: 9, color: GOLD, paddingLeft: 20, letterSpacing: 1, opacity: 0.6, animationDuration: '60s' }}>
  {`ARCHIVE STATUS: ACTIVE /// TOTAL SIGNALS: ${concerts.length} /// MUSEUMS INITIALIZED: ${userCount} /// GENRES MAPPED: ${uniqueGenres} /// STATES COVERED: ${uniqueStates} /// ARTIFACTS STORED: ${concerts.filter(c => c.image_url || c.personal_photo_url).length} /// SYSTEM: NOMINAL /// `.repeat(3)}
</div>
        </div>
      </div>

      {/* ── AUTH MODAL ── */}
      {mode && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, backdropFilter: 'blur(12px)' }}
          onClick={e => e.target === e.currentTarget && setMode(null)}
        >
          <div className="fade-in" style={{ background: '#0a0a0c', border: `1px solid ${TEAL}`, borderRadius: 12, padding: 40, width: '100%', maxWidth: 400, boxShadow: `0 0 60px rgba(0,229,204,0.2)` }}>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: '2.2rem', color: TEAL, marginBottom: 6, letterSpacing: 3 }}>
              {mode === 'login' ? 'ACCESS YOUR COLLECTION' : 'INITIALIZE ARCHIVE'}
            </div>
            <div style={{ fontSize: 8, color: GRAY, marginBottom: 28, letterSpacing: 2 }}>
              {mode === 'login' ? 'ENTER YOUR CREDENTIALS TO CONTINUE' : 'CREATE YOUR ACCOUNT TO START ARCHIVING'}
            </div>

            {message && (
              <div style={{ background: message.includes('SENT') ? 'rgba(0,229,204,0.1)' : 'rgba(255,68,68,0.1)', border: `1px solid ${message.includes('SENT') ? TEAL : '#ff4466'}`, borderRadius: 4, padding: '10px 14px', fontSize: 9, color: message.includes('SENT') ? TEAL : '#ff4466', marginBottom: 20, letterSpacing: 1, lineHeight: 1.6 }}>
                {message}
              </div>
            )}

            <form onSubmit={mode === 'login' ? handleLogin : handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {mode === 'signup' && (
                <input className="modal-input" placeholder="USERNAME" value={username} onChange={e => setUsername(e.target.value)} required />
              )}
              <input className="modal-input" type="email" placeholder="EMAIL" value={email} onChange={e => setEmail(e.target.value)} required />
              <input className="modal-input" type="password" placeholder="PASSWORD" value={password} onChange={e => setPassword(e.target.value)} required />

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="button" onClick={() => { setMode(null); setMessage(''); }} style={{ flex: 1, background: 'transparent', border: '1px solid #333', color: GRAY, padding: '12px', cursor: 'pointer', fontFamily: "'Bebas Neue'", fontSize: '1.1rem', borderRadius: 4 }}>
                  CANCEL
                </button>
                <button type="submit" disabled={loading} style={{ flex: 2, background: loading ? '#222' : TEAL, border: 'none', color: '#000', padding: '12px', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: "'Bebas Neue'", fontSize: '1.3rem', fontWeight: 900, borderRadius: 4, letterSpacing: 2 }}>
                  {loading ? '...' : mode === 'login' ? 'ENTER' : 'CREATE ARCHIVE'}
                </button>
              </div>
            </form>

            <div style={{ marginTop: 20, textAlign: 'center' }}>
              <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setMessage(''); }} style={{ background: 'none', border: 'none', color: GRAY, fontSize: 9, cursor: 'pointer', letterSpacing: 1, textDecoration: 'underline' }}>
                {mode === 'login' ? 'NO ACCOUNT? INITIALIZE ARCHIVE' : 'ALREADY HAVE AN ACCOUNT? ACCESS YOUR COLLECTION'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}