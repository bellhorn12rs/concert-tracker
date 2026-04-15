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

  useEffect(() => {
    const fetchPublicConcerts = async () => {
      const { data } = await supabase.from('concerts').select('*').order('date', { ascending: false });
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
      if (data) setRecentUsers(data);
    };
    fetchRecentUsers();
  }, []);

  const [sliderYear, setSliderYear] = useState(null);
  const [hoveredArtifact, setHoveredArtifact] = useState(null);
  const isMobile = window.innerWidth < 768;

  const artifacts = useMemo(() =>
    concerts.filter(c => c.image_url || c.personal_photo_url || c.setlist_image_url).slice(0, 20)
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
    const withImg = sliderConcerts.filter(c => c.image_url || c.personal_photo_url);
    return withImg[0] || sliderConcerts[0] || null;
  }, [sliderConcerts]);

  useEffect(() => {
    if (!artifacts.length) return;
    const t = setInterval(() => {
      if (!tickerPaused) setFeaturedIdx(p => (p + 1) % artifacts.length);
    }, 4000);
    return () => clearInterval(t);
  }, [artifacts.length, tickerPaused]);

  const featured = artifacts[featuredIdx] || concerts[0];

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
    bits.push(`[NETWORK_STAT] ${new Set(concerts.map(c => c.venue).filter(Boolean)).size} UNIQUE STAGES DOCUMENTED`);
    bits.push(`[NETWORK_STAT] ${new Set(concerts.map(c => c.state).filter(Boolean)).size} STATES ON THE MAP`);
    const txt = bits.join('   ///   ') + '   ///   ';
    return txt + txt;
  }, [concerts]);

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

  const uniqueArtists = new Set(concerts.flatMap(c => (c.bands || []).map(getBandName)).filter(Boolean)).size;

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
          <img src={featuredImg} alt={featuredBand} style={{ width: '100%', height: isMobile ? 160 : 200, objectFit: 'cover', display: 'block' }} />
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
          [new Set(concerts.map(c => c.venue).filter(Boolean)).size, 'VENUES'],
          [new Set(concerts.map(c => c.state).filter(Boolean)).size, 'STATES'],
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
        {new Set(concerts.map(c => c.state).filter(Boolean)).size} STATES.<br />
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
</div> {/* closes hero section */}

      {/* ── SECTION 1: TEMPORAL DRIFT ── */}
<div style={{ padding: isMobile ? '60px 20px' : '80px 40px', background: '#050508', borderTop: '1px solid #111', borderBottom: '1px solid #111', position: 'relative', overflow: 'hidden' }}>

  {/* Side quote — left */}
  {!isMobile && (
    <div style={{ position: 'absolute', left: -60, top: '50%', transform: 'translateY(-50%) rotate(-90deg)', fontFamily: "'Bebas Neue'", fontSize: '1.2rem', color: TEAL, letterSpacing: 8, opacity: 0.7, whiteSpace: 'nowrap' }}>
      EVERY SHOW TELLS A STORY
    </div>
  )}

  {/* Side quote — right */}
  {!isMobile && (
    <div style={{ position: 'absolute', right: -80, top: '50%', transform: 'translateY(-50%) rotate(90deg)', fontFamily: "'Bebas Neue'", fontSize: '1.2rem', color: PURPLE, letterSpacing: 8, opacity: 0.7, whiteSpace: 'nowrap' }}>
      20 YEARS IN 2 SECONDS
    </div>
  )}

  <div style={{ maxWidth: 900, margin: '0 auto' }}>
    <div style={{ textAlign: 'center', marginBottom: 40 }}>
      <div style={{ fontFamily: "'Space Mono'", fontSize: 9, color: TEAL, letterSpacing: 4, marginBottom: 8 }}>⏳ FEATURE 01</div>
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

    {/* Show list below timeline */}
    <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', flexWrap: 'wrap', justifyContent: 'center' }}>
      {sliderImg && (
        <div style={{ position: 'relative', background: '#fff', padding: '8px 8px 40px 8px', boxShadow: '0 20px 60px rgba(0,0,0,0.8)', borderRadius: 2, width: isMobile ? 140 : 180, flexShrink: 0, transform: 'rotate(-1.5deg)', transition: 'all 0.5s' }}>
          <img src={sliderImg} alt={sliderBand} style={{ width: '100%', height: isMobile ? 100 : 130, objectFit: 'cover', display: 'block' }} />
          <div style={{ position: 'absolute', bottom: 8, left: 0, right: 0, textAlign: 'center', fontFamily: "'Bebas Neue'", fontSize: '0.85rem', color: '#111' }}>
            {sliderBand.toUpperCase()}
          </div>
        </div>
      )}

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
      <div style={{ fontFamily: "'Space Mono'", fontSize: 9, color: GOLD, letterSpacing: 4, marginBottom: 12 }}>🎟️ FEATURE 02</div>
      <div style={{ fontFamily: "'Bebas Neue'", fontSize: isMobile ? '2.5rem' : '4rem', color: '#fff', letterSpacing: 2, lineHeight: 0.9 }}>
        THE PHYSICAL <span style={{ color: GOLD }}>ARCHIVE</span>
      </div>
      <div style={{ fontFamily: "'Space Mono'", fontSize: 9, color: GRAY, marginTop: 12, letterSpacing: 2 }}>
        TICKET STUBS. SETLISTS. POLAROIDS. POSTERS. // HOVER TO DEVELOP
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

    {/* All artifacts grid — stubs, polaroids, setlists, posters */}
    {(() => {
      const allArtifacts = [];
      concerts.forEach(c => {
        if (c.image_url) {
          c.image_url.split(',').forEach(url => {
            if (url.trim()) allArtifacts.push({ url: url.trim(), type: 'STUB', c });
          });
        }
        if (c.personal_photo_url) {
          c.personal_photo_url.split(',').forEach(url => {
            if (url.trim()) allArtifacts.push({ url: url.trim(), type: 'POLAROID', c });
          });
        }
        if (c.setlist_image_url) {
          c.setlist_image_url.split(',').forEach(url => {
            if (url.trim()) allArtifacts.push({ url: url.trim(), type: 'SETLIST', c });
          });
        }
        if (c.festival_poster_url) {
          c.festival_poster_url.split(',').forEach(url => {
            if (url.trim()) allArtifacts.push({ url: url.trim(), type: 'POSTER', c });
          });
        }
      });

      const typeColors = { STUB: TEAL, POLAROID: PURPLE, SETLIST: GOLD, POSTER: '#ff4466' };
      const rotations = [-3, 1.5, -1, 2.5, -2, 3, -1.5, 2, -2.5, 1];
      const tapeColors = [TEAL, GOLD, PURPLE, '#ff4466', '#00cfff'];
      const shuffled = [...allArtifacts].sort(() => 0.5 - Math.random());
const displayed = shuffled.slice(0, isMobile ? 6 : 10);

      return (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(5, 1fr)', gap: isMobile ? 20 : 28, alignItems: 'start' }}>
          {displayed.map((artifact, i) => {
            const band = getBandName(artifact.c.bands?.[0]) || artifact.c.festival_name || 'UNKNOWN';
            const rotation = rotations[i % rotations.length];
            const accent = typeColors[artifact.type];
            const tape = tapeColors[i % tapeColors.length];
            const isHovered = hoveredArtifact === i;

            return (
              <div
                key={i}
                style={{
                  transform: isHovered ? 'rotate(0deg) scale(1.08) translateY(-10px)' : `rotate(${rotation}deg)`,
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  position: 'relative',
                  zIndex: isHovered ? 10 : 1,
                  cursor: 'crosshair'
                }}
                onMouseEnter={() => setHoveredArtifact(i)}
                onMouseLeave={() => setHoveredArtifact(null)}
              >
                {/* Tape */}
                <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', width: 44, height: 14, background: tape, opacity: 0.8, borderRadius: 1, zIndex: 20, boxShadow: `0 2px 6px rgba(0,0,0,0.3)` }} />

                {/* Card */}
                <div style={{
                  background: '#fff',
                  padding: artifact.type === 'POLAROID' ? '8px 8px 44px 8px' : '8px 8px 32px 8px',
                  boxShadow: isHovered
                    ? `0 30px 80px rgba(0,0,0,0.9), 0 0 30px ${accent}44`
                    : '0 10px 40px rgba(0,0,0,0.7)',
                  borderRadius: 2,
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'box-shadow 0.4s'
                }}>
                  {/* Image — blurred until hover */}
                  <img
                    src={artifact.url}
                    alt={band}
                    style={{
                      width: '100%',
                      height: isMobile ? 100 : 130,
                      objectFit: 'cover',
                      display: 'block',
                      filter: isHovered ? 'none' : 'blur(6px) brightness(0.4)',
                      transition: 'filter 0.5s ease',
                    }}
                  />

                  {/* Encrypted overlay */}
                  {!isHovered && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      <div style={{ fontFamily: "'Space Mono'", fontSize: 6, color: accent, letterSpacing: 2 }}>SIGNAL_ENCRYPTED</div>
                      <div style={{ width: 24, height: 24, border: `1px solid ${accent}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: accent }}>⊕</div>
                    </div>
                  )}

                  {/* Caption area */}
                  <div style={{ padding: '6px 4px 0', background: '#fff' }}>
                    <div style={{ textAlign: 'center', fontFamily: "'Bebas Neue'", fontSize: '0.75rem', color: '#111', letterSpacing: 1, lineHeight: 1 }}>
                      {band.slice(0, 14).toUpperCase()}
                    </div>
                    <div style={{ textAlign: 'center', fontFamily: "'Space Mono'", fontSize: 6, color: '#666', marginTop: 2 }}>
                      {getYear(artifact.c.date)}
                    </div>
                  </div>

                  {/* Type badge */}
                  <div style={{ position: 'absolute', bottom: 4, right: 4, fontFamily: "'Space Mono'", fontSize: 5, color: accent, letterSpacing: 1, opacity: isHovered ? 1 : 0, transition: 'opacity 0.3s' }}>
                    {artifact.type}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      );
    })()}

    {/* Bottom stat */}
    <div style={{ textAlign: 'center', marginTop: 48 }}>
      <div style={{ fontFamily: "'Space Mono'", fontSize: 8, color: GRAY, letterSpacing: 3 }}>
        {concerts.filter(c => c.image_url || c.personal_photo_url || c.setlist_image_url || c.festival_poster_url).length} SHOWS WITH PHYSICAL ARTIFACTS IN THE ARCHIVE
      </div>
    </div>
  </div>
</div>
      {/* ── WHAT'S INSIDE ── */}
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
      <div style={{ fontFamily: "'Space Mono'", fontSize: 9, color: '#ff4466', letterSpacing: 4, marginBottom: 12 }}>// INSIDE THE ARCHIVE</div>
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
        onClick={() => {
  if (currentSession) window.location.href = 'https://concert-tracker-eight.vercel.app';
  else setMode('login');
}}
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
        ACCESS YOUR COLLECTION
      </button>
    </div>

    {/* Stat strip */}
    <div style={{ display: 'flex', gap: isMobile ? 24 : 80, justifyContent: 'center', flexWrap: 'wrap', padding: '40px 0', borderTop: `1px solid #111`, borderBottom: `1px solid #111`, marginBottom: 48 }}>
      {[
        [concerts.length, 'SHOWS', TEAL],
        [new Set(concerts.flatMap(c => (c.bands || []).map(getBandName)).filter(Boolean)).size, 'ARTISTS', GOLD],
        [new Set(concerts.map(c => c.venue).filter(Boolean)).size, 'VENUES', PURPLE],
        [new Set(concerts.map(c => c.state).filter(Boolean)).size, 'STATES', '#ff4466'],
      ].map(([val, label, color]) => (
        <div key={label} style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: isMobile ? '3rem' : '5rem', color, lineHeight: 1, textShadow: `0 0 30px ${color}88` }}>{val}</div>
          <div style={{ fontFamily: "'Space Mono'", fontSize: 7, color: GRAY, letterSpacing: 4, marginTop: 8 }}>{label}</div>
        </div>
      ))}
    </div>

    {/* Bottom manifesto */}
    <div style={{ fontFamily: "'Bebas Neue'", fontSize: isMobile ? '0.9rem' : '1.1rem', color: GRAY, letterSpacing: 6, lineHeight: 2.5, opacity: 0.5 }}>
      TRACKRECORD // MUSEUM OF SOUND // EST. 2024<br />
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
            {`ARCHIVE STATUS: ACTIVE /// TOTAL SIGNALS: ${concerts.length} /// GENRES MAPPED: ${new Set(concerts.map(c => c.genre).filter(Boolean)).size} /// STATES COVERED: ${new Set(concerts.map(c => c.state).filter(Boolean)).size} /// ARTIFACTS STORED: ${concerts.filter(c => c.image_url || c.personal_photo_url).length} /// SYSTEM: NOMINAL /// `.repeat(3)}
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