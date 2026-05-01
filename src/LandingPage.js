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

  const [posters, setPosters] = useState([]);

  useEffect(() => {
    const fetchAllPosters = async () => {
      const { data } = await supabase
        .from('posters')
        .select('*')
        .eq('user_id', 'e6497375-65df-4187-8767-1093dd13f97c');
      if (data) setPosters(data);
    };
    fetchAllPosters();
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
    if (!concerts.length) return 'LOADING SIGNAL...';
    const bits = [];
    concerts.slice(0, 15).forEach(c => {
      const band = getBandName(c.bands?.[0]) || c.festival_name || 'UNKNOWN';
      const venue = c.venue || 'UNKNOWN VENUE';
      const city = c.city || '';
      bits.push(`[RECENT] ${band.toUpperCase()} @ ${venue.toUpperCase()}${city ? ` (${city.toUpperCase()})` : ''}`);
    });
    concerts.filter(c => c.image_url || c.setlist_image_url).slice(0, 5).forEach(c => {
      const band = getBandName(c.bands?.[0]) || 'UNKNOWN';
      bits.push(`[ARCHIVED] ${band.toUpperCase()} — ${fmtDateShort(c.date).toUpperCase()}`);
    });
    bits.push(`[STATS] ${concerts.length} SHOWS TRACKED`);
    bits.push(`[STATS] ${uniqueVenues} VENUES DOCUMENTED`);
    bits.push(`[STATS] ${uniqueStates} STATES COVERED`);
    const txt = bits.join('   ///   ') + '   ///   ';
    return txt + txt;
  }, [concerts, uniqueVenues, uniqueStates]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage('Login failed: ' + error.message);
      setLoading(false);
    } else if (data?.session) {
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
      setMessage('Signup failed: ' + error.message);
    } else {
      setMessage('Check your email to verify your account and start tracking!');
    }
    setLoading(false);
  };

  const featuredImg = featured
    ? (featured.image_url?.split(',')[0] || featured.personal_photo_url?.split(',')[0] || featured.setlist_image_url?.split(',')[0])
    : null;
  const featuredBand = featured ? (getBandName(featured.bands?.[0]) || featured.festival_name || 'UNKNOWN') : '';

  return (
    <div style={{ minHeight: '100vh', background: BG, color: '#fff', fontFamily: "'Space Mono', monospace", overflowX: 'hidden', position: 'relative' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono&display=swap');

        @keyframes ticker-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .ticker-scroll { display: inline-block; animation: ticker-scroll 120s linear infinite; white-space: nowrap; }
        .fade-in { animation: fade-in 0.6s ease both; }

        .cta-primary {
          background: ${TEAL}; color: #000; border: none;
          padding: ${isMobile ? '18px 40px' : '24px 64px'};
          font-family: 'Bebas Neue', sans-serif;
          font-size: ${isMobile ? '1.4rem' : '2rem'};
          letter-spacing: 3px; cursor: pointer; border-radius: 4px; transition: all 0.2s;
        }
        .cta-primary:hover { transform: scale(1.05); box-shadow: 0 0 30px rgba(0,229,204,0.6); }

        .cta-secondary {
          background: transparent; color: ${TEAL}; border: 2px solid ${TEAL};
          padding: ${isMobile ? '18px 40px' : '24px 64px'};
          font-family: 'Bebas Neue', sans-serif;
          font-size: ${isMobile ? '1.4rem' : '2rem'};
          letter-spacing: 3px; cursor: pointer; border-radius: 4px; transition: all 0.2s;
        }
        .cta-secondary:hover { background: rgba(0,229,204,0.1); }

        .modal-input {
          width: 100%; background: #0a0a0a; border: 1px solid #333; color: #fff;
          padding: 14px; font-family: 'Space Mono', monospace; font-size: 12px;
          outline: none; border-radius: 4px; box-sizing: border-box; transition: border-color 0.2s;
        }
        .modal-input:focus { border-color: ${TEAL}; }

        .scanline-overlay {
          position: fixed; inset: 0; pointer-events: none; z-index: 9998;
          background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px);
        }

        @media (max-width: 768px) {
          .hero-grid { flex-direction: column !important; }
          .stats-row { gap: 20px !important; }
        }
      `}</style>

      <div className="scanline-overlay" />

      {/* ── TOP TICKER ── */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, background: '#000', borderBottom: `1px solid ${TEAL}44`, height: 36, display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        <div style={{ background: TEAL, color: '#000', fontFamily: "'Bebas Neue'", fontSize: 11, letterSpacing: 2, padding: '0 14px', height: '100%', display: 'flex', alignItems: 'center', fontWeight: 900, flexShrink: 0, boxShadow: `5px 0 15px rgba(0,229,204,0.4)` }}>
          LIVE FEED
        </div>
        <div style={{ overflow: 'hidden', flex: 1 }}>
          <div className="ticker-scroll" style={{ fontFamily: "'Space Mono'", fontSize: 10, color: TEAL, paddingLeft: 20, letterSpacing: 1, textShadow: `0 0 8px rgba(0,229,204,0.5)` }}>
            {tickerItems}
          </div>
        </div>
      </div>



      {/* ── HERO SECTION ── */}
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: isMobile ? '80px 20px 60px' : '100px 40px 80px' }}>
        
        {/* Background glow */}
        <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)', width: 800, height: 800, background: `radial-gradient(circle, rgba(0,229,204,0.08) 0%, transparent 70%)`, pointerEvents: 'none' }} />

        {/* Active Users — top right */}
        {recentUsers.length > 0 && !isMobile && (
          <div style={{ position: 'absolute', top: 50, right: 40, zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}> 
            <div style={{ fontFamily: "'Space Mono'", fontSize: 7, color: GRAY, letterSpacing: 3, marginBottom: 4 }}>// RECENT USERS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>

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

        <div style={{ maxWidth: 1100, width: '100%', position: 'relative', zIndex: 1 }}>
          
          {/* Wordmark */}
          <div className="fade-in" style={{ textAlign: 'center', marginBottom: 32 }}>
            <img
              src="https://pirqtmtzearmugvzhmgl.supabase.co/storage/v1/object/public/avatars/Screenshot%202026-04-20%20at%209.13.55%20AM.png"
              alt="TrackRecord"
              style={{ height: isMobile ? '50px' : '70px', objectFit: 'contain' }}
            />
          </div>

          {/* Main headline */}
          <div className="fade-in" style={{ textAlign: 'center', marginBottom: 20 }}>
            <h1 style={{ fontFamily: "'Bebas Neue'", fontSize: isMobile ? '2.8rem' : '5rem', lineHeight: 1.1, margin: 0, letterSpacing: 2 }}>
              Your Concert History,<br />
              <span style={{ color: TEAL }}>All in One Place</span>
            </h1>
          </div>

          {/* Subheadline */}
          <div className="fade-in" style={{ textAlign: 'center', marginBottom: 48 }}>
            <p style={{ fontFamily: "'Space Mono'", fontSize: isMobile ? 11 : 13, color: GRAY, lineHeight: 1.8, margin: 0, maxWidth: 600, marginLeft: 'auto', marginRight: 'auto' }}>
              Track every show. Upload ticket stubs, setlists, and photos. Explore your timeline. Discover who else was there.
            </p>
          </div>

          {/* CTAs */}
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, marginBottom: 60 }}>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
              {currentSession ? (
                <button
                  onClick={onEnterArchive}
                  className="cta-primary"
                >
                  OPEN YOUR ARCHIVE
                </button>
              ) : (
                <button
                  onClick={() => setMode('signup')}
                  className="cta-primary"
                >
                  START FREE
                </button>
              )}
              <button
                onClick={() => onNavigateToUser('eric')}
                className="cta-secondary"
              >
                SEE WHAT'S POSSIBLE
              </button>
            </div>
            {!currentSession && (
              <button
                onClick={() => setMode('login')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: GRAY,
                  fontSize: 11,
                  cursor: 'pointer',
                  letterSpacing: 1,
                  textDecoration: 'underline',
                  fontFamily: "'Space Mono'",
                  transition: 'color 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.color = TEAL}
                onMouseLeave={e => e.currentTarget.style.color = GRAY}
              >
                Already have an account? Log in
              </button>
            )}
          </div>

          {/* Social proof line */}
          <div style={{ textAlign: 'center', marginBottom: 80 }}>
            <p style={{ fontFamily: "'Space Mono'", fontSize: 9, color: TEAL, letterSpacing: 2, margin: 0 }}>
              {concerts.length} shows tracked by music fans like you · Always free
            </p>
          </div>

          {/* Stats row */}
          <div className="stats-row" style={{ display: 'flex', gap: isMobile ? 32 : 60, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 80 }}>
            {[
              [concerts.length, 'SHOWS', TEAL],
              [uniqueArtists, 'ARTISTS', GOLD],
              [uniqueVenues, 'VENUES', PURPLE],
              [uniqueStates, 'STATES', '#ff4466'],
            ].map(([val, label, color]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: isMobile ? '2.5rem' : '4rem', color, lineHeight: 1, textShadow: `0 0 30px ${color}88` }}>{val}</div>
                <div style={{ fontFamily: "'Space Mono'", fontSize: 7, color: GRAY, letterSpacing: 2, marginTop: 8 }}>{label}</div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* ── TRANSFORMATION SECTION ── */}
      <div style={{ padding: isMobile ? '80px 20px' : '120px 40px', background: '#050508', borderTop: '1px solid #111', position: 'relative', overflow: 'hidden' }}>
        
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 800, height: 400, background: `radial-gradient(ellipse, rgba(0,229,204,0.04) 0%, transparent 70%)`, pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          
          {/* Section header */}
          <div style={{ textAlign: 'center', marginBottom: 80 }}>
            <div style={{ fontFamily: "'Space Mono'", fontSize: 9, color: GOLD, letterSpacing: 4, marginBottom: 16 }}>
              // THE PROBLEM
            </div>
            <h2 style={{ fontFamily: "'Bebas Neue'", fontSize: isMobile ? '2.5rem' : '4.5rem', lineHeight: 1, margin: '0 0 24px 0', letterSpacing: 2 }}>
              Turn <span style={{ color: GOLD }}>This</span> Into <span style={{ color: TEAL }}>This</span>
            </h2>
            <p style={{ fontFamily: "'Space Mono'", fontSize: isMobile ? 10 : 12, color: GRAY, lineHeight: 1.8, margin: 0, maxWidth: 700, marginLeft: 'auto', marginRight: 'auto' }}>
              Your ticket stubs are fading. Your wristbands are buried in a shoebox. Your concert photos are lost in 40,000 camera roll images. Your memories deserve better.
            </p>
          </div>

          {/* Before/After comparison */}
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 40 : 0, alignItems: 'center', justifyContent: 'center', marginBottom: 80 }}>

            {/* BEFORE */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
              <div style={{ fontFamily: "'Space Mono'", fontSize: 8, color: '#ff4466', letterSpacing: 4, marginBottom: 12 }}>
                BEFORE
              </div>
              
              <div style={{ position: 'relative', width: isMobile ? 280 : 340, height: isMobile ? 340 : 400 }}>
                <div style={{ position: 'absolute', bottom: 0, left: 0, width: '85%', transform: 'rotate(-3deg)', boxShadow: '0 20px 60px rgba(0,0,0,0.8)', border: '3px solid #1a1a1a' }}>
                  <img 
                    loading="lazy"
                    src="https://pirqtmtzearmugvzhmgl.supabase.co/storage/v1/object/public/avatars/ticketPile.jpeg"
                    alt="Ticket pile"
                    style={{ width: '100%', height: 'auto', display: 'block' }}
                  />
                </div>
                <div style={{ position: 'absolute', top: '-10px', right: 0, width: '50%', transform: 'rotate(4deg)', boxShadow: '0 20px 60px rgba(0,0,0,0.8)', border: '3px solid #1a1a1a' }}>
                  <img 
                    loading="lazy"
                    src="https://pirqtmtzearmugvzhmgl.supabase.co/storage/v1/object/public/avatars/WristbandMess.jpeg"
                    alt="Wristband mess"
                    style={{ width: '100%', height: 'auto', display: 'block' }}
                  />
                </div>
              </div>

              <div style={{ fontFamily: "'Space Mono'", fontSize: 8, color: '#666', textAlign: 'center', lineHeight: 2, marginTop: 8 }}>
                Buried in boxes<br/>
                Fading, forgotten, lost
              </div>
            </div>

            {/* ARROW */}
            <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: isMobile ? '0' : '0 40px' }}>
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: isMobile ? '3rem' : '5rem', color: TEAL, textShadow: `0 0 30px ${TEAL}`, transform: isMobile ? 'rotate(90deg)' : 'none' }}>
                →
              </div>
            </div>

            {/* AFTER */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
              <div style={{ fontFamily: "'Space Mono'", fontSize: 8, color: TEAL, letterSpacing: 4, marginBottom: 12 }}>
                AFTER
              </div>

              <div style={{ width: isMobile ? 280 : 340, position: 'relative' }}>
                <div style={{ background: '#0a0a0f', border: `1px solid ${TEAL}44`, borderRadius: 12, overflow: 'hidden', boxShadow: `0 20px 60px rgba(0,0,0,0.8), 0 0 40px ${TEAL}11` }}>
                  <div style={{ background: '#050508', padding: '8px 12px', borderBottom: `1px solid ${TEAL}22`, display: 'flex', alignItems: 'center', gap: 6 }}>
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
              </div>

              <div style={{ fontFamily: "'Space Mono'", fontSize: 8, color: TEAL, textAlign: 'center', lineHeight: 2, marginTop: 8 }}>
                Every artifact in one place<br/>
                Searchable, shareable, forever
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <div style={{ padding: isMobile ? '80px 20px' : '100px 40px', background: '#000' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: 80 }}>
            <div style={{ fontFamily: "'Space Mono'", fontSize: 9, color: TEAL, letterSpacing: 4, marginBottom: 16 }}>
              // SIMPLE TO USE
            </div>
            <h2 style={{ fontFamily: "'Bebas Neue'", fontSize: isMobile ? '2.5rem' : '4rem', lineHeight: 1, margin: 0, letterSpacing: 2 }}>
              How It Works
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 40 }}>
            {[
              {
                num: '01',
                title: 'Add a Show',
                desc: 'Enter the artist, venue, and date. Takes 30 seconds.',
                color: TEAL
              },
              {
                num: '02',
                title: 'Upload Artifacts',
                desc: 'Snap photos of your ticket stubs, setlists, wristbands, posters. Keep your collection alive.',
                color: GOLD
              },
              {
                num: '03',
                title: 'Explore & Share',
                desc: 'Browse your timeline, see stats, discover who else was at your shows. Make your history public or private.',
                color: PURPLE
              }
            ].map((step) => (
              <div key={step.num} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: '5rem', color: step.color, opacity: 0.2, lineHeight: 1 }}>
                  {step.num}
                </div>
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.8rem', color: '#fff', letterSpacing: 2, marginBottom: 12 }}>
                  {step.title}
                </div>
                <div style={{ fontFamily: "'Space Mono'", fontSize: 10, color: GRAY, lineHeight: 1.8 }}>
                  {step.desc}
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 60 }}>
            <button onClick={() => setMode('signup')} className="cta-primary">
              START TRACKING
            </button>
          </div>

        </div>
      </div>

      {/* ── SOCIAL DISCOVERY FEATURE ── */}
      <div style={{ padding: isMobile ? '80px 20px' : '100px 40px', background: '#050508', borderTop: '1px solid #111' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          
          <div style={{ fontFamily: "'Space Mono'", fontSize: 9, color: PURPLE, letterSpacing: 4, marginBottom: 16 }}>
            // UNIQUE FEATURE
          </div>
          
          <h2 style={{ fontFamily: "'Bebas Neue'", fontSize: isMobile ? '2.5rem' : '4.5rem', lineHeight: 1.1, margin: '0 0 32px 0', letterSpacing: 2 }}>
            See Who Else Was<br />
            <span style={{ color: PURPLE }}>At Your Shows</span>
          </h2>

          <p style={{ fontFamily: "'Space Mono'", fontSize: isMobile ? 11 : 13, color: GRAY, lineHeight: 1.8, maxWidth: 700, margin: '0 auto 48px' }}>
            TrackRecord shows you other users who were at the same concert. Discover shared experiences, connect over music, see their collections. It's social media for concert history.
          </p>

          <div style={{ background: '#0a0a0a', border: `1px solid ${PURPLE}33`, borderRadius: 12, padding: isMobile ? 32 : 48, marginBottom: 48 }}>
            <div style={{ fontFamily: "'Space Mono'", fontSize: 9, color: PURPLE, letterSpacing: 2, marginBottom: 20 }}>
              "When I logged Radiohead at MSG, I found 3 other users who were there too. We compared setlists and photos. That's when I realized this was something special."
            </div>
            <div style={{ fontFamily: "'Space Mono'", fontSize: 8, color: GRAY }}>
              — Early user
            </div>
          </div>

        </div>
      </div>

      {/* ── FEATURES GRID ── */}
      <div style={{ padding: isMobile ? '80px 20px' : '100px 40px', background: '#000' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: 80 }}>
            <h2 style={{ fontFamily: "'Bebas Neue'", fontSize: isMobile ? '2.5rem' : '4rem', lineHeight: 1, margin: 0, letterSpacing: 2 }}>
              Everything You Need
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 32 }}>
            {[
              {
                icon: '⏳',
                color: TEAL,
                title: 'Interactive Timeline',
                desc: 'Every show on one timeline, colored by genre, spanning decades.',
              },
              {
                icon: '🧬',
                color: GOLD,
                title: 'Genre Breakdown',
                desc: 'See what kind of music person you really are with detailed stats.',
              },
              {
                icon: '🎟️',
                color: PURPLE,
                title: 'Digital Archive',
                desc: 'Upload ticket stubs, setlists, photos, posters. All in one place.',
              },
              {
                icon: '📍',
                color: '#ff4466',
                title: 'Venue Map',
                desc: 'Track every venue you\'ve been to across cities and states.',
              },
              {
                icon: '🔍',
                color: '#00cfff',
                title: 'Search & Filter',
                desc: 'Find any show by artist, venue, date, or genre instantly.',
              },
              {
                icon: '👥',
                color: '#9d00ff',
                title: 'Discover Others',
                desc: 'See who else was at your shows. Share your collection.',
              },
            ].map((item) => (
              <div
                key={item.title}
                style={{
                  background: `linear-gradient(135deg, #0a0a0a, #050508)`,
                  border: `1px solid ${item.color}33`,
                  borderRadius: 12,
                  padding: 32,
                  transition: 'all 0.3s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = item.color;
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = `${item.color}33`;
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>{item.icon}</div>
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.6rem', color: '#fff', letterSpacing: 2, marginBottom: 12 }}>
                  {item.title}
                </div>
                <div style={{ fontFamily: "'Space Mono'", fontSize: 9, color: GRAY, lineHeight: 1.8 }}>
                  {item.desc}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* ── TESTIMONIAL ── */}
      <div style={{ padding: isMobile ? '60px 20px' : '80px 40px', background: '#050508', borderTop: '1px solid #111' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ background: '#0a0a0a', border: `1px solid ${TEAL}33`, borderRadius: 12, padding: isMobile ? 32 : 48 }}>
            <div style={{ fontFamily: "'Space Mono'", fontSize: isMobile ? 10 : 12, color: '#fff', lineHeight: 2, marginBottom: 24 }}>
              "Gotta say it's a neat system for concert people. It's been fun remembering some of the older stuff. I didn't realize I went to so many back to back DMB shows; and 2 at MSG."
            </div>
            <div style={{ fontFamily: "'Space Mono'", fontSize: 8, color: TEAL, letterSpacing: 2 }}>
              — EARLY USER
            </div>
          </div>
        </div>
      </div>

      {/* ── FINAL CTA ── */}
      <div style={{ padding: isMobile ? '100px 20px' : '120px 40px', textAlign: 'center', background: '#000', position: 'relative', overflow: 'hidden' }}>
        
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 900, height: 900, background: 'radial-gradient(circle, rgba(0,229,204,0.07) 0%, rgba(153,102,255,0.04) 35%, transparent 65%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 700, margin: '0 auto' }}>
          
          <div style={{ fontFamily: "'Space Mono'", fontSize: 9, color: TEAL, letterSpacing: 6, marginBottom: 32 }}>
            // START TRACKING TODAY
          </div>

          <h2 style={{ fontFamily: "'Bebas Neue'", fontSize: isMobile ? '3.5rem' : '7rem', color: '#fff', lineHeight: 0.95, letterSpacing: 4, marginBottom: 32 }}>
            Your History<br />
            <span style={{ color: TEAL }}>Is Waiting</span>
          </h2>

          <p style={{ fontFamily: "'Space Mono'", fontSize: isMobile ? 10 : 12, color: GRAY, letterSpacing: 2, lineHeight: 2, marginBottom: 48 }}>
            Free forever. No credit card required.<br />
            Start tracking in under 60 seconds.
          </p>

          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 80 }}>
            {currentSession ? (
              <button onClick={onEnterArchive} className="cta-primary">
                OPEN YOUR ARCHIVE
              </button>
            ) : (
              <button onClick={() => setMode('signup')} className="cta-primary">
                START FREE
              </button>
            )}
            <button onClick={() => onNavigateToUser('eric')} className="cta-secondary">
              SEE WHAT'S POSSIBLE
            </button>
          </div>

          <div style={{ width: 80, height: 2, background: `linear-gradient(90deg, ${TEAL}, ${PURPLE})`, margin: '0 auto 40px' }} />

          <div style={{ fontFamily: "'Space Mono'", fontSize: 8, color: GRAY, letterSpacing: 2, lineHeight: 2 }}>
            {concerts.length} shows · {uniqueArtists} artists · {uniqueVenues} venues · {uniqueStates} states
          </div>

        </div>
      </div>

      {/* ── BOTTOM TICKER ── */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000, background: '#000', borderTop: `1px solid ${TEAL}22`, height: 28, display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        <div style={{ background: '#111', color: GOLD, fontFamily: "'Bebas Neue'", fontSize: 10, letterSpacing: 2, padding: '0 12px', height: '100%', display: 'flex', alignItems: 'center', flexShrink: 0, borderRight: `1px solid ${GOLD}33` }}>
          STATS
        </div>
        <div style={{ overflow: 'hidden', flex: 1 }}>
          <div className="ticker-scroll" style={{ fontFamily: "'Space Mono'", fontSize: 9, color: GOLD, paddingLeft: 20, letterSpacing: 1, opacity: 0.6, animationDuration: '60s' }}>
            {`${concerts.length} SHOWS TRACKED /// ${userCount} USERS /// ${uniqueGenres} GENRES /// ${uniqueStates} STATES /// ${concerts.filter(c => c.image_url || c.personal_photo_url).length} ARTIFACTS ARCHIVED /// `.repeat(3)}
          </div>
        </div>
      </div>

      {/* ── AUTH MODAL ── */}
      {mode && (
        <div 
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, backdropFilter: 'blur(12px)' }}
          onClick={e => e.target === e.currentTarget && setMode(null)}
        >
          <div className="fade-in" style={{ background: '#0a0a0c', border: `1px solid ${TEAL}`, borderRadius: 12, padding: 40, width: '100%', maxWidth: 400, boxShadow: `0 0 60px rgba(0,229,204,0.2)` }}>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: '2.2rem', color: TEAL, marginBottom: 6, letterSpacing: 3 }}>
              {mode === 'login' ? 'Welcome Back' : 'Start Tracking'}
            </div>
            <div style={{ fontSize: 8, color: GRAY, marginBottom: 28, letterSpacing: 2 }}>
              {mode === 'login' ? 'Log in to access your collection' : 'Create your free account'}
            </div>

            {message && (
              <div style={{ 
                background: message.includes('email') ? 'rgba(0,229,204,0.1)' : 'rgba(255,68,68,0.1)', 
                border: `1px solid ${message.includes('email') ? TEAL : '#ff4466'}`, 
                borderRadius: 4, 
                padding: '10px 14px', 
                fontSize: 9, 
                color: message.includes('email') ? TEAL : '#ff4466', 
                marginBottom: 20, 
                letterSpacing: 1, 
                lineHeight: 1.6 
              }}>
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
                <button 
                  type="button" 
                  onClick={() => { setMode(null); setMessage(''); }} 
                  style={{ flex: 1, background: 'transparent', border: '1px solid #333', color: GRAY, padding: '12px', cursor: 'pointer', fontFamily: "'Bebas Neue'", fontSize: '1.1rem', borderRadius: 4 }}
                >
                  CANCEL
                </button>
                <button 
                  type="submit" 
                  disabled={loading} 
                  style={{ 
                    flex: 2, 
                    background: loading ? '#222' : TEAL, 
                    border: 'none', 
                    color: '#000', 
                    padding: '12px', 
                    cursor: loading ? 'not-allowed' : 'pointer', 
                    fontFamily: "'Bebas Neue'", 
                    fontSize: '1.3rem', 
                    fontWeight: 900, 
                    borderRadius: 4, 
                    letterSpacing: 2 
                  }}
                >
                  {loading ? '...' : mode === 'login' ? 'LOG IN' : 'START FREE'}
                </button>
              </div>
            </form>

            <div style={{ marginTop: 20, textAlign: 'center' }}>
              <button 
                onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setMessage(''); }} 
                style={{ background: 'none', border: 'none', color: GRAY, fontSize: 9, cursor: 'pointer', letterSpacing: 1, textDecoration: 'underline' }}
              >
                {mode === 'login' ? 'Need an account? Sign up' : 'Have an account? Log in'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
