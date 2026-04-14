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

export default function LandingPage({ concerts = [] }) {
  const [mode, setMode] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [featuredIdx, setFeaturedIdx] = useState(0);
  const [tickerPaused, setTickerPaused] = useState(false);
  const [recentUsers, setRecentUsers] = useState([]);

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

  // Permanent record — pick 4 shows with real stubs
  const permanentRecord = useMemo(() => {
    return concerts
      .filter(c => c.image_url)
      .sort(() => 0.5 - Math.random())
      .slice(0, 4);
  }, [concerts]);

  // Artifact scrub — pick 5 shows with images
  const scrubArtifacts = useMemo(() => {
    return concerts
      .filter(c => c.image_url || c.personal_photo_url)
      .slice(0, 5);
  }, [concerts]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMessage('ACCESS DENIED: ' + error.message);
    setLoading(false);
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
        .ticker-scroll { display: inline-block; animation: ticker-scroll 80s linear infinite; white-space: nowrap; }
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
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 80, paddingBottom: 60, position: 'relative', padding: isMobile ? '80px 20px 60px' : '80px 40px 60px' }}>

        <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%, -50%)', width: 600, height: 600, background: `radial-gradient(circle, rgba(0,229,204,0.06) 0%, transparent 70%)`, pointerEvents: 'none' }} />

        {/* Wordmark */}
        <div className="fade-in" style={{ textAlign: 'center', marginBottom: 48, position: 'relative', zIndex: 1 }}>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: isMobile ? '3.5rem' : 'clamp(3rem, 8vw, 6rem)', letterSpacing: 8, color: '#fff', lineHeight: 0.9, textShadow: `0 0 40px rgba(0,229,204,0.3)` }}>
            TRACK<span style={{ color: TEAL }}>RECORD</span>
          </div>
          <div style={{ fontFamily: "'Space Mono'", fontSize: 9, color: GRAY, letterSpacing: 4, marginTop: 12 }}>
            YOUR CONCERT HISTORY. MUSEUM GRADE.
          </div>
        </div>

        {/* Hero grid — artifact + stats side by side on desktop */}
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
        <div className="fade-in" style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
          <button className="cta-primary" onClick={() => setMode('signup')}>INITIALIZE ARCHIVE</button>
          <button className="cta-secondary" onClick={() => setMode('login')}>ACCESS YOUR COLLECTION</button>
        </div>
        {/* ── RECENT ARCHIVISTS ── */}
      {recentUsers.length > 0 && (
        <div style={{ width: '100%', maxWidth: 900, margin: '40px auto 0', padding: isMobile ? '0 20px' : '0' }}>
          <div style={{ fontFamily: "'Space Mono'", fontSize: 8, color: GRAY, letterSpacing: 3, marginBottom: 16, textAlign: 'center' }}>
            // ACTIVE ARCHIVISTS
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            {recentUsers.map(u => (
              <button
                key={u.username}
                onClick={() => { window.location.hash = `#/u/${u.username}`; window.location.reload(); }}
                style={{
                  background: '#0a0a0a',
                  border: `1px solid ${u.avatar_color || TEAL}44`,
                  borderRadius: 6,
                  padding: '10px 16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = u.avatar_color || TEAL; e.currentTarget.style.background = `${u.avatar_color || TEAL}11`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = `${u.avatar_color || TEAL}44`; e.currentTarget.style.background = '#0a0a0a'; }}
              >
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${u.avatar_color || TEAL}22`, border: `1px solid ${u.avatar_color || TEAL}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue'", fontSize: '1rem', color: u.avatar_color || TEAL, flexShrink: 0 }}>
                  {u.username[0].toUpperCase()}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontFamily: "'Space Mono'", fontSize: 9, color: '#fff', letterSpacing: 1 }}>@{u.username}</div>
                  {u.last_artist && (
                    <div style={{ fontFamily: "'Space Mono'", fontSize: 7, color: GRAY, marginTop: 2 }}>
                      Last: {u.last_artist.slice(0, 20)}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
      </div>

      {/* ── SECTION 1: TEMPORAL DRIFT ── */}
      <div style={{ padding: isMobile ? '60px 20px' : '80px 40px', background: '#050508', borderTop: '1px solid #111', borderBottom: '1px solid #111' }}>
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
          <div style={{ padding: '0 20px', marginBottom: 32 }}>
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

          {/* Year artifact + show list */}
          <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', flexWrap: 'wrap', justifyContent: 'center' }}>
            {sliderImg && (
              <div style={{ background: '#fff', padding: '8px 8px 40px 8px', boxShadow: '0 20px 60px rgba(0,0,0,0.8)', borderRadius: 2, width: isMobile ? 160 : 200, flexShrink: 0, transform: 'rotate(-1.5deg)', transition: 'all 0.5s' }}>
                <img src={sliderImg} alt={sliderBand} style={{ width: '100%', height: isMobile ? 120 : 150, objectFit: 'cover', display: 'block' }} />
                <div style={{ position: 'absolute', bottom: 8, left: 0, right: 0, textAlign: 'center', fontFamily: "'Bebas Neue'", fontSize: '0.9rem', color: '#111' }}>
                  {sliderBand.toUpperCase()}
                </div>
              </div>
            )}
            <div style={{ flex: 1, minWidth: 200 }}>
              {sliderConcerts.slice(0, 6).map((c, i) => {
                const band = getBandName(c.bands?.[0]) || c.festival_name || 'Unknown';
                const color = GENRE_COLORS[c.genre] || TEAL;
                return (
                  <div key={c.id || i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid #111' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0, boxShadow: `0 0 6px ${color}` }} />
                    <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.1rem', color: '#fff', flex: 1 }}>{band.toUpperCase()}</div>
                    <div style={{ fontFamily: "'Space Mono'", fontSize: 8, color: GRAY }}>{c.venue?.slice(0, 20)}</div>
                    <div style={{ fontFamily: "'Space Mono'", fontSize: 8, color: color }}>{fmtDateShort(c.date)}</div>
                  </div>
                );
              })}
              {sliderConcerts.length > 6 && (
                <div style={{ fontFamily: "'Space Mono'", fontSize: 8, color: GRAY, marginTop: 8, letterSpacing: 2 }}>
                  + {sliderConcerts.length - 6} MORE SIGNALS THIS YEAR
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 2: ARTIFACT SCRUB ── */}
      <div style={{ padding: isMobile ? '60px 20px' : '80px 40px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ fontFamily: "'Space Mono'", fontSize: 9, color: GOLD, letterSpacing: 4, marginBottom: 8 }}>🎟️ FEATURE 02</div>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: isMobile ? '2.5rem' : '3.5rem', color: '#fff', letterSpacing: 2 }}>THE ARTIFACT VAULT</div>
            <div style={{ fontFamily: "'Space Mono'", fontSize: 9, color: GRAY, marginTop: 8, letterSpacing: 2 }}>HOVER TO DEVELOP // EVERY SHOW LEAVES A MARK</div>
          </div>

          <div className="scrub-row" style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            {scrubArtifacts.map((c, i) => {
              const img = c.image_url?.split(',')[0] || c.personal_photo_url?.split(',')[0];
              const band = getBandName(c.bands?.[0]) || c.festival_name || 'UNKNOWN';
              const isHovered = hoveredArtifact === i;
              return (
                <div
                  key={c.id || i}
                  className="scrub-artifact"
                  onMouseEnter={() => setHoveredArtifact(i)}
                  onMouseLeave={() => setHoveredArtifact(null)}
                  style={{ width: isMobile ? '45%' : 150, borderRadius: 4, overflow: 'hidden', position: 'relative', border: `1px solid ${isHovered ? GOLD : '#222'}`, transition: 'border-color 0.3s', boxShadow: isHovered ? `0 0 20px rgba(255,204,0,0.3)` : 'none' }}
                >
                  {img ? (
                    <img src={img} alt={band} style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block', filter: isHovered ? 'none' : 'blur(8px) brightness(0.3)', transition: 'filter 0.5s ease' }} />
                  ) : (
                    <div style={{ width: '100%', height: 180, background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '2rem' }}>🎫</span>
                    </div>
                  )}
                  {!isHovered && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <div style={{ fontFamily: "'Space Mono'", fontSize: 8, color: GOLD, letterSpacing: 2, textAlign: 'center' }}>SIGNAL_ENCRYPTED</div>
                      <div style={{ width: 30, height: 30, border: `1px solid ${GOLD}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: GOLD }}>⊕</div>
                    </div>
                  )}
                  {isHovered && (
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.9))', padding: '20px 10px 10px' }}>
                      <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1rem', color: '#fff', letterSpacing: 1 }}>{band.toUpperCase()}</div>
                      <div style={{ fontFamily: "'Space Mono'", fontSize: 7, color: GOLD }}>{fmtDateShort(c.date)}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── SECTION 3: THE PERMANENT RECORD ── */}
      <div style={{ padding: isMobile ? '60px 20px' : '80px 40px', background: '#050508', borderTop: '1px solid #111', borderBottom: '1px solid #111' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <div style={{ fontFamily: "'Space Mono'", fontSize: 9, color: PURPLE, letterSpacing: 4, marginBottom: 8 }}>🏛️ FEATURE 03</div>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: isMobile ? '2.5rem' : '3.5rem', color: '#fff', letterSpacing: 2 }}>THE PERMANENT RECORD</div>
          </div>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: isMobile ? '1.2rem' : '1.8rem', color: GRAY, textAlign: 'center', marginBottom: 48, letterSpacing: 2, lineHeight: 1.4 }}>
            Social media feeds disappear.<br />
            <span style={{ color: '#fff' }}>The Archive is forever.</span>
          </div>

          <div className="permanent-grid" style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: isMobile ? 16 : 24 }}>
            {permanentRecord.map((c, i) => {
              const img = c.image_url?.split(',')[0];
              const band = getBandName(c.bands?.[0]) || c.festival_name || 'UNKNOWN';
              const rotations = [-2, 1.5, -1, 2.5];
              return (
                <div key={c.id || i} style={{ transform: `rotate(${rotations[i]}deg)`, transition: 'transform 0.3s' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'rotate(0deg) scale(1.05)'}
                  onMouseLeave={e => e.currentTarget.style.transform = `rotate(${rotations[i]}deg)`}
                >
                  <div style={{ background: '#fff', padding: '8px 8px 36px 8px', boxShadow: '0 15px 40px rgba(0,0,0,0.7)', borderRadius: 2 }}>
                    {img ? (
                      <img src={img} alt={band} style={{ width: '100%', height: isMobile ? 100 : 140, objectFit: 'cover', display: 'block' }} />
                    ) : (
                      <div style={{ width: '100%', height: isMobile ? 100 : 140, background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>🎫</div>
                    )}
                    <div style={{ textAlign: 'center', marginTop: 6, fontFamily: "'Bebas Neue'", fontSize: '0.8rem', color: '#111', letterSpacing: 1 }}>
                      {band.slice(0, 14).toUpperCase()}
                    </div>
                    <div style={{ textAlign: 'center', fontFamily: "'Space Mono'", fontSize: 6, color: '#888' }}>
                      {getYear(c.date)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── FINAL CTA ── */}
      <div style={{ padding: isMobile ? '60px 20px' : '100px 40px', textAlign: 'center' }}>
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: isMobile ? '2rem' : '3rem', color: '#fff', marginBottom: 8, letterSpacing: 3 }}>
          YOUR HISTORY IS WAITING.
        </div>
        <div style={{ fontFamily: "'Space Mono'", fontSize: 9, color: GRAY, letterSpacing: 3, marginBottom: 40 }}>
          START YOUR ARCHIVE TODAY. IT'S FREE.
        </div>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="cta-primary" onClick={() => setMode('signup')}>INITIALIZE ARCHIVE</button>
          <button className="cta-secondary" onClick={() => setMode('login')}>ACCESS YOUR COLLECTION</button>
        </div>
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
