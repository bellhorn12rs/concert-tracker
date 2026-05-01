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
    if (!concerts.length) return 'INITIALIZING SIGNAL...';
    const bits = [];
    concerts.slice(0, 15).forEach(c => {
      const band = getBandName(c.bands?.[0]) || c.festival_name || 'UNKNOWN';
      const venue = c.venue || 'UNKNOWN VENUE';
      const city = c.city || '';
      bits.push(`${band.toUpperCase()} @ ${venue.toUpperCase()}${city ? ` (${city.toUpperCase()})` : ''}`);
    });
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
      setMessage('Check your email to verify your account and get started.');
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
          padding: ${isMobile ? '18px 36px' : '22px 56px'};
          font-family: 'Bebas Neue', sans-serif;
          font-size: ${isMobile ? '1.3rem' : '1.6rem'};
          letter-spacing: 3px; cursor: pointer; border-radius: 4px; transition: all 0.2s;
        }
        .cta-primary:hover { transform: scale(1.05); box-shadow: 0 0 30px rgba(0,229,204,0.6); }

        .cta-secondary {
          background: transparent; color: ${TEAL}; border: 2px solid ${TEAL};
          padding: ${isMobile ? '16px 32px' : '20px 52px'};
          font-family: 'Bebas Neue', sans-serif;
          font-size: ${isMobile ? '1.2rem' : '1.4rem'};
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
          .stats-row { flex-direction: column !important; gap: 16px !important; }
        }
      `}</style>

      <div className="scanline-overlay" />

      {/* TOP TICKER */}
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

      {/* TOP NAV - LOGIN/LOGOUT */}
      <div style={{ position: 'fixed', top: 50, left: 20, zIndex: 100 }}>
        {currentSession ? (
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
            LOGOUT
          </button>
        ) : (
          <button
            onClick={() => setMode('login')}
            style={{
              background: 'rgba(0, 229, 204, 0.1)',
              border: `1px solid ${TEAL}`,
              color: TEAL,
              padding: '6px 12px',
              fontFamily: "'Space Mono'",
              fontSize: 8,
              borderRadius: 4,
              cursor: 'pointer',
              letterSpacing: 2,
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = TEAL; e.currentTarget.style.color = '#000'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0, 229, 204, 0.1)'; e.currentTarget.style.color = TEAL; }}
          >
            LOG IN
          </button>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* HERO SECTION - TRANSFORMATION FOCUSED */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        position: 'relative', 
        padding: isMobile ? '80px 20px 60px' : '100px 40px 60px',
        overflow: 'hidden'
      }}>
        
        {/* Background glow */}
        <div style={{ 
          position: 'absolute', 
          top: '40%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)', 
          width: 800, 
          height: 800, 
          background: `radial-gradient(circle, rgba(0,229,204,0.08) 0%, transparent 70%)`, 
          pointerEvents: 'none' 
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, width: '100%' }}>
          
          {/* Logo */}
          <div className="fade-in" style={{ textAlign: 'center', marginBottom: 32 }}>
            <img
              src="https://pirqtmtzearmugvzhmgl.supabase.co/storage/v1/object/public/avatars/Screenshot%202026-04-20%20at%209.13.55%20AM.png"
              alt="TrackRecord"
              style={{ height: isMobile ? '50px' : '70px', objectFit: 'contain' }}
            />
          </div>

          {/* Main Headline */}
          <div className="fade-in" style={{ 
            textAlign: 'center', 
            marginBottom: 20,
            animationDelay: '0.1s'
          }}>
            <h1 style={{ 
              fontFamily: "'Bebas Neue'", 
              fontSize: isMobile ? '2.8rem' : '5rem', 
              color: '#fff', 
              lineHeight: 1,
              letterSpacing: 3,
              marginBottom: 16
            }}>
              Your Concert History,<br/>
              <span style={{ color: TEAL }}>All in One Place</span>
            </h1>
            <p style={{ 
              fontFamily: "'Space Mono'", 
              fontSize: isMobile ? 11 : 13, 
              color: GRAY, 
              letterSpacing: 2,
              maxWidth: 600,
              margin: '0 auto',
              lineHeight: 1.8
            }}>
              Track every show. Store ticket stubs, setlists, and photos.<br/>
              See who else was there. Build your live music legacy.
            </p>
          </div>

          {/* THE BIG TRANSFORMATION VISUAL */}
          <div className="fade-in" style={{ 
            marginBottom: 48,
            animationDelay: '0.2s'
          }}>
            <div style={{ 
              display: 'flex', 
              flexDirection: isMobile ? 'column' : 'row',
              gap: isMobile ? 32 : 0,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 40
            }}>

              {/* BEFORE: THE CHAOS */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
                <div style={{ 
                  fontFamily: "'Space Mono'", 
                  fontSize: 8, 
                  color: '#ff4466', 
                  letterSpacing: 4, 
                  marginBottom: 8
                }}>
                  BEFORE
                </div>
                
                <div style={{ position: 'relative', width: isMobile ? 260 : 320, height: isMobile ? 320 : 380 }}>
                  {/* Ticket pile */}
                  <div style={{ 
                    position: 'absolute', 
                    bottom: 0, 
                    left: 0,
                    width: '85%',
                    transform: 'rotate(-3deg)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
                    border: '3px solid #1a1a1a'
                  }}>
                    <img 
                      src="https://pirqtmtzearmugvzhmgl.supabase.co/storage/v1/object/public/avatars/ticketPile.jpeg"
                      alt="Pile of tickets"
                      style={{ width: '100%', height: 'auto', display: 'block' }}
                    />
                  </div>
                  {/* Wristbands */}
                  <div style={{ 
                    position: 'absolute', 
                    top: '-10px', 
                    right: 0,
                    width: '50%',
                    transform: 'rotate(4deg)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
                    border: '3px solid #1a1a1a'
                  }}>
                    <img 
                      src="https://pirqtmtzearmugvzhmgl.supabase.co/storage/v1/object/public/avatars/WristbandMess.jpeg"
                      alt="Wristband pile"
                      style={{ width: '100%', height: 'auto', display: 'block' }}
                    />
                  </div>
                </div>

                <div style={{ 
                  fontFamily: "'Space Mono'", 
                  fontSize: isMobile ? 9 : 10, 
                  color: '#666',
                  textAlign: 'center', 
                  lineHeight: 1.8,
                  marginTop: 8,
                  maxWidth: 280
                }}>
                  Lost in shoeboxes.<br/>
                  Fading. Forgotten.
                </div>
              </div>

              {/* ARROW */}
              <div style={{ 
                flexShrink: 0,
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                gap: 12, 
                padding: isMobile ? '0' : '0 40px'
              }}>
                <div style={{ 
                  fontFamily: "'Bebas Neue'", 
                  fontSize: isMobile ? '3rem' : '5rem',
                  color: TEAL,
                  textShadow: `0 0 30px ${TEAL}`,
                  transform: isMobile ? 'rotate(90deg)' : 'none'
                }}>
                  →
                </div>
              </div>

              {/* AFTER: THE ARCHIVE */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
                <div style={{ 
                  fontFamily: "'Space Mono'", 
                  fontSize: 8, 
                  color: TEAL, 
                  letterSpacing: 4, 
                  marginBottom: 8
                }}>
                  AFTER
                </div>

                <div style={{ width: isMobile ? 260 : 320, position: 'relative' }}>
                  <div style={{
                    background: '#0a0a0f',
                    border: `1px solid ${TEAL}44`,
                    borderRadius: 12,
                    overflow: 'hidden',
                    boxShadow: `0 20px 60px rgba(0,0,0,0.8), 0 0 40px ${TEAL}11`
                  }}>
                    {/* Browser chrome */}
                    <div style={{
                      background: '#050508',
                      padding: '8px 12px',
                      borderBottom: `1px solid ${TEAL}22`,
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 6
                    }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff4466' }} />
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: GOLD }} />
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00cc88' }} />
                      <div style={{ 
                        flex: 1, 
                        background: '#111', 
                        borderRadius: 3, 
                        padding: '2px 8px', 
                        marginLeft: 8 
                      }}>
                        <div style={{ 
                          fontFamily: "'Space Mono'", 
                          fontSize: 6, 
                          color: '#444', 
                          letterSpacing: 1 
                        }}>
                          trackrecord.app
                        </div>
                      </div>
                    </div>
                    <img
                      src="https://pirqtmtzearmugvzhmgl.supabase.co/storage/v1/object/public/avatars/Screenshot%202026-04-22%20at%203.03.33%20PM.png"
                      alt="TrackRecord App"
                      style={{ width: '100%', height: 'auto', display: 'block' }}
                    />
                  </div>
                </div>

                <div style={{
                  fontFamily: "'Space Mono'", 
                  fontSize: isMobile ? 9 : 10, 
                  color: TEAL,
                  textAlign: 'center', 
                  lineHeight: 1.8, 
                  marginTop: 8,
                  maxWidth: 280
                }}>
                  Organized. Searchable.<br/>
                  Shareable. Forever.
                </div>
              </div>
            </div>
          </div>

          {/* CTAs - THREE OPTIONS */}
          <div className="fade-in" style={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 20,
            marginBottom: 40,
            animationDelay: '0.3s'
          }}>
            
            {/* Primary buttons row */}
            <div style={{
              display: 'flex',
              gap: 16,
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}>
              <button
                onClick={() => setMode('signup')}
                className="cta-primary"
              >
                START FREE
              </button>
              <button
                onClick={() => setMode('login')}
                className="cta-secondary"
              >
                LOG IN
              </button>
            </div>

            {/* View example link */}
<button
  onClick={() => onNavigateToUser('eric')}
  style={{
    background: 'transparent',
    border: `1px solid ${GRAY}`,
    color: GRAY,
    fontFamily: "'Space Mono'",
    fontSize: 11,
    cursor: 'pointer',
    letterSpacing: 2,
    padding: '10px 24px',
    borderRadius: 4,
    transition: 'all 0.2s'
  }}
  onMouseEnter={e => {
    e.currentTarget.style.borderColor = TEAL;
    e.currentTarget.style.color = TEAL;
  }}
  onMouseLeave={e => {
    e.currentTarget.style.borderColor = GRAY;
    e.currentTarget.style.color = GRAY;
  }}
>
  VIEW LIVE EXAMPLE
</button>
          </div>

          {/* Free + User count */}
          <div className="fade-in" style={{ 
            textAlign: 'center',
            animationDelay: '0.4s'
          }}>
            <div style={{ 
              fontFamily: "'Space Mono'", 
              fontSize: 9, 
              color: GRAY, 
              letterSpacing: 3 
            }}>
              FREE • NO CREDIT CARD • {concerts.length} SHOWS TRACKED
            </div>
          </div>

        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* HOW IT WORKS */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div style={{ 
        padding: isMobile ? '80px 20px' : '100px 40px', 
        background: '#050508',
        borderTop: '1px solid #111'
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ 
              fontFamily: "'Space Mono'", 
              fontSize: 9, 
              color: TEAL, 
              letterSpacing: 4, 
              marginBottom: 12 
            }}>
              // HOW IT WORKS
            </div>
            <h2 style={{ 
              fontFamily: "'Bebas Neue'", 
              fontSize: isMobile ? '2.5rem' : '3.5rem', 
              color: '#fff', 
              letterSpacing: 2,
              marginBottom: 16
            }}>
              Three Steps to Your Archive
            </h2>
            <p style={{ 
              fontFamily: "'Space Mono'", 
              fontSize: 11, 
              color: GRAY, 
              lineHeight: 1.8 
            }}>
              No scanning. No automation magic. Just you and your memories.
            </p>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', 
            gap: isMobile ? 40 : 48 
          }}>
            {[
              {
                num: '01',
                title: 'Add a Show',
                desc: 'Type the artist, venue, and date. Takes 30 seconds.',
                color: TEAL
              },
              {
                num: '02',
                title: 'Attach Artifacts',
                desc: 'Upload photos of ticket stubs, setlists, posters, wristbands.',
                color: GOLD
              },
              {
                num: '03',
                title: 'Watch It Build',
                desc: 'Your timeline grows. Your stats update. Your collection comes alive.',
                color: PURPLE
              }
            ].map((step, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontFamily: "'Bebas Neue'", 
                  fontSize: '4rem', 
                  color: step.color,
                  lineHeight: 1,
                  marginBottom: 16,
                  textShadow: `0 0 20px ${step.color}66`
                }}>
                  {step.num}
                </div>
                <div style={{ 
                  fontFamily: "'Bebas Neue'", 
                  fontSize: '1.5rem', 
                  color: '#fff', 
                  letterSpacing: 2,
                  marginBottom: 12
                }}>
                  {step.title}
                </div>
                <div style={{ 
                  fontFamily: "'Space Mono'", 
                  fontSize: 10, 
                  color: GRAY, 
                  lineHeight: 1.8,
                  maxWidth: 240,
                  margin: '0 auto'
                }}>
                  {step.desc}
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div style={{ textAlign: 'center', marginTop: 64 }}>
            <button
              onClick={() => setMode('signup')}
              className="cta-primary"
            >
              START TRACKING
            </button>
          </div>

        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* THE SOCIAL HOOK (UNIQUE FEATURE) */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div style={{ 
        padding: isMobile ? '80px 20px' : '100px 40px', 
        background: '#000',
        position: 'relative',
        overflow: 'hidden'
      }}>
        
        <div style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)', 
          width: 600, 
          height: 600, 
          background: `radial-gradient(circle, rgba(153,102,255,0.06) 0%, transparent 70%)`, 
          pointerEvents: 'none' 
        }} />

        <div style={{ maxWidth: 800, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ 
              fontFamily: "'Space Mono'", 
              fontSize: 9, 
              color: PURPLE, 
              letterSpacing: 4, 
              marginBottom: 12 
            }}>
              // THE SOCIAL LAYER
            </div>
            <h2 style={{ 
              fontFamily: "'Bebas Neue'", 
              fontSize: isMobile ? '2.5rem' : '4rem', 
              color: '#fff', 
              letterSpacing: 2,
              marginBottom: 24,
              lineHeight: 1.1
            }}>
              See Who Else Was There
            </h2>
            <p style={{ 
              fontFamily: "'Space Mono'", 
              fontSize: isMobile ? 11 : 13, 
              color: GRAY, 
              lineHeight: 1.8,
              maxWidth: 600,
              margin: '0 auto'
            }}>
              When you log a show, you see everyone else who tracked it too. 
              Connect with people who were in the same room, same night, same moment.
              This is <span style={{ color: PURPLE }}>the only app</span> that does this.
            </p>
          </div>

          {/* Visual representation */}
          <div style={{
            background: 'linear-gradient(135deg, #0a0008, #08000f)',
            border: `1px solid ${PURPLE}44`,
            borderRadius: 12,
            padding: isMobile ? 32 : 48,
            marginBottom: 48
          }}>
            <div style={{ 
              fontFamily: "'Bebas Neue'", 
              fontSize: isMobile ? '1.2rem' : '1.5rem', 
              color: PURPLE,
              letterSpacing: 2,
              marginBottom: 24,
              textAlign: 'center'
            }}>
              YOUR SHOW ORBIT
            </div>
            
            <div style={{ 
              display: 'flex', 
              gap: 12, 
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginBottom: 20
            }}>
              {recentUsers.slice(0, 5).map((u, i) => (
                <div key={i} style={{
                  background: `${u.avatar_color || TEAL}22`,
                  border: `1px solid ${u.avatar_color || TEAL}`,
                  borderRadius: 8,
                  padding: '8px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  <div style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: u.avatar_color || TEAL,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: "'Bebas Neue'",
                    fontSize: '0.9rem',
                    color: '#000'
                  }}>
                    {u.username[0].toUpperCase()}
                  </div>
                  <div style={{ 
                    fontFamily: "'Space Mono'", 
                    fontSize: 9, 
                    color: '#fff' 
                  }}>
                    {u.username}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ 
              fontFamily: "'Space Mono'", 
              fontSize: 9, 
              color: GRAY,
              textAlign: 'center',
              lineHeight: 1.8
            }}>
              "Who else saw Dave Matthews at MSG in 2019?"<br/>
              Now you know.
            </div>
          </div>

          {/* CTA */}
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={() => setMode('signup')}
              className="cta-primary"
            >
              JOIN THE NETWORK
            </button>
          </div>

        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* FEATURES GRID */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div style={{ 
        padding: isMobile ? '80px 20px' : '100px 40px', 
        background: '#050508',
        borderTop: '1px solid #111'
      }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <h2 style={{ 
              fontFamily: "'Bebas Neue'", 
              fontSize: isMobile ? '2.5rem' : '3.5rem', 
              color: '#fff', 
              letterSpacing: 2,
              marginBottom: 16
            }}>
              Everything You Need
            </h2>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', 
            gap: isMobile ? 24 : 32 
          }}>
            {[
              {
                icon: '📅',
                color: TEAL,
                title: 'Interactive Timeline',
                sub: 'Scroll through decades of shows, colored by genre',
              },
              {
                icon: '📊',
                color: GOLD,
                title: 'Stats Dashboard',
                sub: 'Total shows, top artists, states covered, genre breakdown',
              },
              {
                icon: '🎟️',
                color: PURPLE,
                title: 'Artifact Vault',
                sub: 'Upload and store photos of ticket stubs, setlists, posters',
              },
              {
                icon: '🌐',
                color: '#00cfff',
                title: 'Public Profiles',
                sub: 'Share your collection with friends or keep it private',
              },
              {
                icon: '🔍',
                color: '#ff4466',
                title: 'Discovery Feed',
                sub: 'See what shows other people are tracking in real-time',
              },
              {
                icon: '🎨',
                color: '#ff66cc',
                title: 'Genre Fingerprint',
                sub: 'Visual breakdown of your musical DNA',
              },
            ].map((feat, i) => (
              <div
                key={i}
                style={{
                  background: `linear-gradient(135deg, #0a0a0a, #050508)`,
                  border: `1px solid ${feat.color}33`,
                  borderRadius: 12,
                  padding: '32px 24px',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = feat.color;
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = `${feat.color}33`;
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: 16 }}>{feat.icon}</div>
                <div style={{ 
                  fontFamily: "'Bebas Neue'", 
                  fontSize: '1.4rem', 
                  color: '#fff', 
                  letterSpacing: 2, 
                  marginBottom: 8 
                }}>
                  {feat.title}
                </div>
                <div style={{ 
                  fontFamily: "'Space Mono'", 
                  fontSize: 9, 
                  color: GRAY, 
                  lineHeight: 1.8 
                }}>
                  {feat.sub}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* SOCIAL PROOF (USER QUOTE) */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div style={{ 
        padding: isMobile ? '80px 20px' : '100px 40px', 
        background: '#000'
      }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            background: 'linear-gradient(135deg, #0a0008, #08000f)',
            border: `1px solid ${TEAL}44`,
            borderRadius: 16,
            padding: isMobile ? '40px 24px' : '60px 48px',
          }}>
            <div style={{ 
              fontFamily: "'Space Mono'", 
              fontSize: isMobile ? 14 : 16, 
              color: '#fff',
              lineHeight: 1.8,
              marginBottom: 24,
              fontStyle: 'italic'
            }}>
              "Gotta say it's a neat system for concert people. It's been fun remembering 
              some of the older stuff. I didn't realize I went to so many back to back DMB 
              shows; and 2 at MSG."
            </div>
            <div style={{ 
              fontFamily: "'Bebas Neue'", 
              fontSize: '1rem', 
              color: TEAL, 
              letterSpacing: 2 
            }}>
              — EARLY USER
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* FINAL CTA */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div style={{ 
        padding: isMobile ? '100px 20px' : '120px 40px', 
        background: '#000',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        borderTop: '1px solid #111'
      }}>
        
        <div style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)', 
          width: 900, 
          height: 900, 
          background: `radial-gradient(circle, rgba(0,229,204,0.07) 0%, rgba(153,102,255,0.04) 35%, transparent 65%)`, 
          pointerEvents: 'none' 
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          
          <div style={{ 
            fontFamily: "'Bebas Neue'", 
            fontSize: isMobile ? '3rem' : '6rem', 
            color: '#fff', 
            lineHeight: 0.9,
            letterSpacing: isMobile ? 2 : 6,
            marginBottom: 32
          }}>
            START YOUR<br/>
            <span style={{ color: TEAL }}>ARCHIVE TODAY</span>
          </div>

          <div style={{ 
            fontFamily: "'Space Mono'", 
            fontSize: isMobile ? 11 : 13, 
            color: GRAY, 
            letterSpacing: 3,
            marginBottom: 48,
            lineHeight: 2
          }}>
            FREE FOREVER • NO CREDIT CARD • NO SHOEBOX REQUIRED
          </div>

          <div style={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 20,
            marginBottom: 64
          }}>
            
            {/* Primary buttons row */}
            <div style={{
              display: 'flex',
              gap: 20,
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}>
              <button
                onClick={() => setMode('signup')}
                style={{
                  background: TEAL,
                  color: '#000',
                  border: 'none',
                  padding: isMobile ? '24px 48px' : '28px 72px',
                  fontFamily: "'Bebas Neue'",
                  fontSize: isMobile ? '1.6rem' : '2rem',
                  letterSpacing: 5,
                  cursor: 'pointer',
                  borderRadius: 4,
                  transition: 'all 0.3s',
                  boxShadow: `0 0 40px rgba(0,229,204,0.5)`,
                }}
                onMouseEnter={e => { 
                  e.currentTarget.style.transform = 'scale(1.05)'; 
                  e.currentTarget.style.boxShadow = `0 0 80px rgba(0,229,204,0.8)`; 
                }}
                onMouseLeave={e => { 
                  e.currentTarget.style.transform = 'scale(1)'; 
                  e.currentTarget.style.boxShadow = `0 0 40px rgba(0,229,204,0.5)`; 
                }}
              >
                CREATE FREE ACCOUNT
              </button>
              <button
                onClick={() => setMode('login')}
                style={{
                  background: 'transparent',
                  color: TEAL,
                  border: `2px solid ${TEAL}`,
                  padding: isMobile ? '24px 48px' : '28px 72px',
                  fontFamily: "'Bebas Neue'",
                  fontSize: isMobile ? '1.6rem' : '2rem',
                  letterSpacing: 5,
                  cursor: 'pointer',
                  borderRadius: 4,
                  transition: 'all 0.3s',
                }}
                onMouseEnter={e => { 
                  e.currentTarget.style.background = `${TEAL}15`; 
                }}
                onMouseLeave={e => { 
                  e.currentTarget.style.background = 'transparent'; 
                }}
              >
                LOG IN
              </button>
            </div>

            {/* View example link */}
            <button
              onClick={() => onNavigateToUser('eric')}
              style={{
                background: 'none',
                border: 'none',
                color: GRAY,
                fontFamily: "'Space Mono'",
                fontSize: 10,
                cursor: 'pointer',
                textDecoration: 'underline',
                letterSpacing: 1,
                transition: 'color 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.color = TEAL}
              onMouseLeave={e => e.currentTarget.style.color = GRAY}
            >
              or view a live example →
            </button>
          </div>

          {/* Stats strip */}
          <div style={{ 
            display: 'flex', 
            gap: isMobile ? 32 : 80, 
            justifyContent: 'center', 
            flexWrap: 'wrap',
            padding: '40px 0',
            borderTop: `1px solid #111`,
            borderBottom: `1px solid #111`
          }}>
            {[
              [concerts.length, 'SHOWS', TEAL],
              [uniqueArtists, 'ARTISTS', GOLD],
              [uniqueVenues, 'VENUES', PURPLE],
              [uniqueStates, 'STATES', '#ff4466'],
            ].map(([val, label, color]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontFamily: "'Bebas Neue'", 
                  fontSize: isMobile ? '2.5rem' : '4rem', 
                  color, 
                  lineHeight: 1,
                  textShadow: `0 0 20px ${color}88`
                }}>
                  {val}
                </div>
                <div style={{ 
                  fontFamily: "'Space Mono'", 
                  fontSize: 7, 
                  color: GRAY, 
                  letterSpacing: 4, 
                  marginTop: 8 
                }}>
                  {label}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* BOTTOM TICKER */}
      <div style={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        zIndex: 1000, 
        background: '#000', 
        borderTop: `1px solid ${GOLD}22`, 
        height: 28, 
        display: 'flex', 
        alignItems: 'center', 
        overflow: 'hidden' 
      }}>
        <div style={{ 
          background: '#111', 
          color: GOLD, 
          fontFamily: "'Bebas Neue'", 
          fontSize: 10, 
          letterSpacing: 2, 
          padding: '0 12px', 
          height: '100%', 
          display: 'flex', 
          alignItems: 'center', 
          flexShrink: 0, 
          borderRight: `1px solid ${GOLD}33` 
        }}>
          SYSTEM
        </div>
        <div style={{ overflow: 'hidden', flex: 1 }}>
          <div className="ticker-scroll" style={{ 
            fontFamily: "'Space Mono'", 
            fontSize: 9, 
            color: GOLD, 
            paddingLeft: 20, 
            letterSpacing: 1, 
            opacity: 0.6,
            animationDuration: '60s'
          }}>
            {`FREE FOREVER /// ${concerts.length} SHOWS TRACKED /// ${uniqueStates} STATES COVERED /// NO CREDIT CARD REQUIRED /// `.repeat(3)}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* AUTH MODAL */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {mode && (
        <div 
          style={{ 
            position: 'fixed', 
            inset: 0, 
            background: 'rgba(0,0,0,0.92)', 
            zIndex: 10000, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: 20, 
            backdropFilter: 'blur(12px)' 
          }}
          onClick={e => e.target === e.currentTarget && setMode(null)}
        >
          <div className="fade-in" style={{ 
            background: '#0a0a0c', 
            border: `1px solid ${TEAL}`, 
            borderRadius: 12, 
            padding: 40, 
            width: '100%', 
            maxWidth: 400, 
            boxShadow: `0 0 60px rgba(0,229,204,0.2)` 
          }}>
            <div style={{ 
              fontFamily: "'Bebas Neue'", 
              fontSize: '2rem', 
              color: TEAL, 
              marginBottom: 6, 
              letterSpacing: 3 
            }}>
              {mode === 'login' ? 'Welcome Back' : 'Create Your Archive'}
            </div>
            <div style={{ 
              fontSize: 9, 
              color: GRAY, 
              marginBottom: 28, 
              letterSpacing: 2 
            }}>
              {mode === 'login' ? 'Log in to access your collection' : 'Sign up free - no credit card required'}
            </div>

            {message && (
              <div style={{ 
                background: message.includes('verify') || message.includes('Check') 
                  ? 'rgba(0,229,204,0.1)' 
                  : 'rgba(255,68,68,0.1)', 
                border: `1px solid ${message.includes('verify') || message.includes('Check') ? TEAL : '#ff4466'}`, 
                borderRadius: 4, 
                padding: '10px 14px', 
                fontSize: 9, 
                color: message.includes('verify') || message.includes('Check') ? TEAL : '#ff4466', 
                marginBottom: 20, 
                letterSpacing: 1, 
                lineHeight: 1.6 
              }}>
                {message}
              </div>
            )}

            <form onSubmit={mode === 'login' ? handleLogin : handleSignup} style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 12 
            }}>
              {mode === 'signup' && (
                <input 
                  className="modal-input" 
                  placeholder="Username" 
                  value={username} 
                  onChange={e => setUsername(e.target.value)} 
                  required 
                />
              )}
              <input 
                className="modal-input" 
                type="email" 
                placeholder="Email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
              />
              <input 
                className="modal-input" 
                type="password" 
                placeholder="Password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
              />

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button 
                  type="button" 
                  onClick={() => { setMode(null); setMessage(''); }} 
                  style={{ 
                    flex: 1, 
                    background: 'transparent', 
                    border: '1px solid #333', 
                    color: GRAY, 
                    padding: '12px', 
                    cursor: 'pointer', 
                    fontFamily: "'Bebas Neue'", 
                    fontSize: '1.1rem', 
                    borderRadius: 4 
                  }}
                >
                  Cancel
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
                  {loading ? '...' : mode === 'login' ? 'Log In' : 'Sign Up Free'}
                </button>
              </div>
            </form>

            <div style={{ marginTop: 20, textAlign: 'center' }}>
              <button 
                onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setMessage(''); }} 
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: GRAY, 
                  fontSize: 9, 
                  cursor: 'pointer', 
                  letterSpacing: 1, 
                  textDecoration: 'underline' 
                }}
              >
                {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
