import React, { useState, useEffect, useMemo } from 'react';
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

export default function LandingPage({ 
  currentSession, 
  onEnterArchive, 
  onNavigateToUser, 
  onLogout 
}) {
  const [mode, setMode] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [inviteToken, setInviteToken] = useState(null);
  const [inviteShow, setInviteShow] = useState(null);
  const [featuredIdx, setFeaturedIdx] = useState(0);
  const [tickerPaused, setTickerPaused] = useState(false);
  const [recentUsers, setRecentUsers] = useState([]);
  const [shows, setShows] = useState([]);

  useEffect(() => {
    const fetchShows = async () => {
      const { data } = await supabase
        .from('shows')
        .select('id, date, artist, bands, venue, city, state, is_festival, festival_name, genre')
        .order('date', { ascending: false })
        .limit(1000);
      if (data) setShows(data);
    };
    fetchShows();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (!token) return;
    setInviteToken(token);
    setMode('signup');
    const fetchInviteDetails = async () => {
      const { data } = await supabase
        .from('show_companions')
        .select('show_id, shows(artist, date, venue, city, state)')
        .eq('invite_token', token)
        .eq('status', 'pending')
        .single();
      if (data?.shows) setInviteShow(data.shows);
    };
    fetchInviteDetails();
  }, []);

  const [ericArtifacts, setEricArtifacts] = useState([]);
  useEffect(() => {
    const fetchEricArtifacts = async () => {
      const { data } = await supabase
        .from('artifacts')
        .select('id, image_url, artifact_type')
        .eq('user_id', 'e6497375-65df-4187-8767-1093dd13f97c')
        .in('artifact_type', ['stub', 'photo', 'relic'])
        .not('image_url', 'is', null)
        .limit(20);
      if (data) setEricArtifacts(data);
    };
    fetchEricArtifacts();
  }, []);

  const [posters, setPosters] = useState([]);
  useEffect(() => {
    const fetchAllPosters = async () => {
      const { data } = await supabase
        .from('posters')
        .select('id, image_url, artist')
        .eq('user_id', 'e6497375-65df-4187-8767-1093dd13f97c')
        .limit(50);
      if (data) setPosters(data);
    };
    fetchAllPosters();
  }, []);

  const [userCount, setUserCount] = useState(0);
  useEffect(() => {
    const fetchRecentUsers = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('username, avatar_color, last_seen, last_artist, last_venue')
        .order('last_seen', { ascending: false })
        .limit(1000);
      if (data) {
        setRecentUsers(data);
        setUserCount(data.length);
      }
    };
    fetchRecentUsers();
  }, []);

  const isMobile = window.innerWidth < 768;

  const artifacts = useMemo(() => {
    if (!ericArtifacts.length) return [];
    return [...ericArtifacts].sort(() => 0.5 - Math.random()).slice(0, 8);
  }, [ericArtifacts]);

  const uniqueArtists = useMemo(() =>
    new Set(shows.flatMap(s => [s.artist, ...(s.bands || []).map(getBandName)].filter(Boolean))).size
  , [shows]);

  const uniqueVenues = useMemo(() =>
    new Set(shows.map(s => s.venue).filter(Boolean)).size
  , [shows]);

  const uniqueStates = useMemo(() =>
    new Set(shows.map(s => s.state).filter(Boolean)).size
  , [shows]);

  const festivalCount = useMemo(() =>
    new Set(shows.filter(s => s.is_festival && s.festival_name).map(s => s.festival_name.toLowerCase().trim())).size
  , [shows]);

  const tickerItems = useMemo(() => {
    if (!shows.length) return 'INITIALIZING SIGNAL...';
    const bits = shows.slice(0, 20).map(s => {
      const band = s.artist || getBandName(s.bands?.[0]) || s.festival_name || 'UNKNOWN';
      const venue = s.venue || 'UNKNOWN VENUE';
      const city = s.city || '';
      return `${band.toUpperCase()} @ ${venue.toUpperCase()}${city ? ` (${city.toUpperCase()})` : ''}`;
    });
    const txt = bits.join('   ///   ') + '   ///   ';
    return txt + txt;
  }, [shows]);

  useEffect(() => {
    if (!artifacts.length) return;
    const t = setInterval(() => {
      if (!tickerPaused) setFeaturedIdx(p => (p + 1) % artifacts.length);
    }, 4000);
    return () => clearInterval(t);
  }, [artifacts.length, tickerPaused]);

  const processInviteToken = async (userId, token) => {
    if (!token || !userId) return;
    try {
      await supabase.rpc('claim_companion_invite', { p_token: token, p_user_id: userId });
      window.history.replaceState({}, '', '/');
      setInviteToken(null);
      setInviteShow(null);
    } catch (err) {
      console.error('Failed to claim invite:', err.message);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage('Login failed: ' + error.message);
      setLoading(false);
    } else if (data?.session) {
      await processInviteToken(data.session.user.id, inviteToken);
      onEnterArchive();
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: {
        data: { username },
        emailRedirectTo: 'https://mytrackrecord.live'
      }
    });
    if (error) {
      setMessage('Signup failed: ' + error.message);
    } else {
      await processInviteToken(data.user?.id, inviteToken);
      setMessage('Welcome to the archive! Redirecting you now...');
      setTimeout(() => { onEnterArchive(); }, 1500);
    }
    setLoading(false);
  };

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
        .feature-card { transition: all 0.3s ease; }
        .feature-card:hover { transform: translateY(-4px); }
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

      {/* TOP NAV */}
      <div style={{ position: 'fixed', top: 50, left: 20, zIndex: 100 }}>
        {currentSession ? (
          <button onClick={onLogout} style={{ background: 'rgba(255,68,68,0.1)', border: '1px solid #ff4466', color: '#ff4466', padding: '6px 12px', fontFamily: "'Space Mono'", fontSize: 8, borderRadius: 4, cursor: 'pointer', letterSpacing: 2 }}
            onMouseEnter={e => { e.currentTarget.style.background = '#ff4466'; e.currentTarget.style.color = '#000'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,68,68,0.1)'; e.currentTarget.style.color = '#ff4466'; }}>
            LOGOUT
          </button>
        ) : (
          <button onClick={() => setMode('login')} style={{ background: `rgba(0,229,204,0.1)`, border: `1px solid ${TEAL}`, color: TEAL, padding: '6px 12px', fontFamily: "'Space Mono'", fontSize: 8, borderRadius: 4, cursor: 'pointer', letterSpacing: 2 }}
            onMouseEnter={e => { e.currentTarget.style.background = TEAL; e.currentTarget.style.color = '#000'; }}
            onMouseLeave={e => { e.currentTarget.style.background = `rgba(0,229,204,0.1)`; e.currentTarget.style.color = TEAL; }}>
            LOG IN
          </button>
        )}
      </div>

      {/* ── HERO ── */}
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: isMobile ? '80px 20px 60px' : '100px 40px 60px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)', width: 800, height: 800, background: `radial-gradient(circle, rgba(0,229,204,0.08) 0%, transparent 70%)`, pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, width: '100%' }}>

          {/* Logo */}
          <div className="fade-in" style={{ textAlign: 'center', marginBottom: 32 }}>
            <img src="https://pirqtmtzearmugvzhmgl.supabase.co/storage/v1/object/public/avatars/Screenshot%202026-04-20%20at%209.13.55%20AM.png" alt="TrackRecord" style={{ height: isMobile ? '50px' : '70px', objectFit: 'contain' }} />
          </div>

          {/* Headline */}
          <div className="fade-in" style={{ textAlign: 'center', marginBottom: 20, animationDelay: '0.1s' }}>
            <h1 style={{ fontFamily: "'Bebas Neue'", fontSize: isMobile ? '2.8rem' : '5rem', color: '#fff', lineHeight: 1, letterSpacing: 3, marginBottom: 16 }}>
              Your Concert History,<br/><span style={{ color: TEAL }}>All in One Place</span>
            </h1>
            <p style={{ fontFamily: "'Space Mono'", fontSize: isMobile ? 11 : 13, color: GRAY, letterSpacing: 2, maxWidth: 600, margin: '0 auto', lineHeight: 1.8 }}>
              Track every show. Store ticket stubs, setlists, and photos.<br/>
              See who else was there. Build your live music legacy.
            </p>
          </div>

          {/* BEFORE → AFTER */}
          <div className="fade-in" style={{ marginBottom: 48, animationDelay: '0.2s' }}>
            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 32 : 0, alignItems: 'center', justifyContent: 'center', marginBottom: 40 }}>

              {/* BEFORE */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
                <div style={{ fontFamily: "'Space Mono'", fontSize: 8, color: '#ff4466', letterSpacing: 4, marginBottom: 8 }}>BEFORE</div>
                <div style={{ position: 'relative', width: isMobile ? 240 : 300, height: isMobile ? 460 : 560, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ position: 'absolute', top: '2%', left: '10%', width: '55%', transform: 'rotate(-10deg)', boxShadow: '0 12px 40px rgba(0,0,0,0.8)', border: '2px solid #1a1a1a', zIndex: 3 }}>
                    <img src="https://pirqtmtzearmugvzhmgl.supabase.co/storage/v1/object/public/avatars/WristbandMess.jpeg" alt="Wristband pile" style={{ width: '100%', height: 'auto', display: 'block' }} />
                  </div>
                  <div style={{ position: 'absolute', top: '32%', right: '5%', width: '58%', transform: 'rotate(7deg)', boxShadow: '0 12px 40px rgba(0,0,0,0.8)', border: '2px solid #1a1a1a', zIndex: 2 }}>
                    <img src="https://pirqtmtzearmugvzhmgl.supabase.co/storage/v1/object/public/avatars/ticketPile.jpeg" alt="Ticket pile" style={{ width: '100%', height: 'auto', display: 'block' }} />
                  </div>
                  <div style={{ position: 'absolute', bottom: '2%', left: '8%', width: '62%', transform: 'rotate(-5deg)', boxShadow: '0 12px 40px rgba(0,0,0,0.8)', border: '2px solid #1a1a1a', zIndex: 1 }}>
                    <img src="https://pirqtmtzearmugvzhmgl.supabase.co/storage/v1/object/public/avatars/postersonfloor.jpeg" alt="Posters on floor" style={{ width: '100%', height: 'auto', display: 'block' }} />
                  </div>
                </div>
                <div style={{ fontFamily: "'Space Mono'", fontSize: isMobile ? 9 : 10, color: '#666', textAlign: 'center', lineHeight: 1.8, marginTop: 8, maxWidth: 280 }}>
                  Lost in shoeboxes.<br/>Fading. Forgotten.
                </div>
              </div>

              {/* ARROW */}
              <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: isMobile ? '0' : '0 40px' }}>
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: isMobile ? '3rem' : '5rem', color: TEAL, textShadow: `0 0 30px ${TEAL}`, transform: isMobile ? 'rotate(90deg)' : 'none' }}>→</div>
              </div>

              {/* AFTER */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
                <div style={{ fontFamily: "'Space Mono'", fontSize: 8, color: TEAL, letterSpacing: 4, marginBottom: 8 }}>AFTER</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12, width: isMobile ? 280 : 340 }}>
                  {[
                    { src: "https://pirqtmtzearmugvzhmgl.supabase.co/storage/v1/object/public/avatars/Screenshot%202026-04-22%20at%203.03.33%20PM.png", alt: "Stub wall organized", rot: '-1deg' },
                    { src: "https://pirqtmtzearmugvzhmgl.supabase.co/storage/v1/object/public/avatars/posterwall.png", alt: "Poster wall organized", rot: '1deg' },
                    { src: "https://pirqtmtzearmugvzhmgl.supabase.co/storage/v1/object/public/avatars/Screenshot%202026-05-03%20at%2011.14.54%20AM.png", alt: "Heavy rotation tab", rot: '-0.5deg' },
                  ].map((img, i) => (
                    <div key={i} style={{ background: '#0a0a0f', border: `1px solid ${TEAL}44`, borderRadius: 8, overflow: 'hidden', boxShadow: `0 12px 40px rgba(0,0,0,0.8), 0 0 20px ${TEAL}11`, transform: `rotate(${img.rot})` }}>
                      <div style={{ background: '#050508', padding: '6px 10px', borderBottom: `1px solid ${TEAL}22`, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#ff4466' }} />
                        <div style={{ width: 5, height: 5, borderRadius: '50%', background: GOLD }} />
                        <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#00cc88' }} />
                      </div>
                      <img src={img.src} alt={img.alt} style={{ width: '100%', height: 'auto', display: 'block' }} />
                    </div>
                  ))}
                </div>
                <div style={{ fontFamily: "'Space Mono'", fontSize: isMobile ? 9 : 10, color: TEAL, textAlign: 'center', lineHeight: 1.8, marginTop: 8, maxWidth: 300 }}>
                  Organized. Searchable.<br/>Shareable. Forever.
                </div>
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, marginBottom: 40, animationDelay: '0.3s' }}>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
              <button onClick={() => setMode('signup')} className="cta-primary">START FREE</button>
              <button onClick={() => setMode('login')} className="cta-secondary">LOG IN</button>
            </div>
            <button onClick={() => onNavigateToUser('eric')}
              style={{ background: 'transparent', border: `1px solid ${GRAY}`, color: GRAY, fontFamily: "'Space Mono'", fontSize: 11, cursor: 'pointer', letterSpacing: 2, padding: '10px 24px', borderRadius: 4, transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = TEAL; e.currentTarget.style.color = TEAL; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = GRAY; e.currentTarget.style.color = GRAY; }}>
              VIEW LIVE EXAMPLE
            </button>
          </div>

          <div className="fade-in" style={{ textAlign: 'center', animationDelay: '0.4s' }}>
            <div style={{ fontFamily: "'Space Mono'", fontSize: 9, color: GRAY, letterSpacing: 3 }}>
              FREE • NO CREDIT CARD • {shows.length} SHOWS TRACKED
            </div>
          </div>
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <div style={{ padding: isMobile ? '80px 20px' : '100px 40px', background: '#050508', borderTop: '1px solid #111' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ fontFamily: "'Space Mono'", fontSize: 9, color: TEAL, letterSpacing: 4, marginBottom: 12 }}>// HOW IT WORKS</div>
            <h2 style={{ fontFamily: "'Bebas Neue'", fontSize: isMobile ? '2.5rem' : '3.5rem', color: '#fff', letterSpacing: 2, marginBottom: 16 }}>Three Steps to Your Archive</h2>
            <p style={{ fontFamily: "'Space Mono'", fontSize: 11, color: GRAY, lineHeight: 1.8 }}>No scanning. No automation magic. Just you and your memories.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? 40 : 48 }}>
            {[
              { num: '01', title: 'Add a Show', desc: 'Type the artist, venue, and date. Takes 30 seconds. Go back as far as you want.', color: TEAL },
              { num: '02', title: 'Attach Artifacts', desc: 'Upload photos of ticket stubs, setlists, posters, wristbands, and polaroids.', color: GOLD },
              { num: '03', title: 'Watch It Build', desc: 'Your timeline grows. Stats update. Your collection becomes a living archive.', color: PURPLE }
            ].map((step, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: '4rem', color: step.color, lineHeight: 1, marginBottom: 16, textShadow: `0 0 20px ${step.color}66` }}>{step.num}</div>
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.5rem', color: '#fff', letterSpacing: 2, marginBottom: 12 }}>{step.title}</div>
                <div style={{ fontFamily: "'Space Mono'", fontSize: 10, color: GRAY, lineHeight: 1.8, maxWidth: 240, margin: '0 auto' }}>{step.desc}</div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 64 }}>
            <button onClick={() => setMode('signup')} className="cta-primary">START TRACKING</button>
          </div>
        </div>
      </div>

      {/* ── SOCIAL WEB SECTION ── */}
      <div style={{ padding: isMobile ? '80px 20px' : '100px 40px', background: '#000', borderTop: '1px solid #111', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 700, height: 700, background: `radial-gradient(circle, rgba(153,102,255,0.07) 0%, transparent 70%)`, pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ fontFamily: "'Space Mono'", fontSize: 9, color: PURPLE, letterSpacing: 4, marginBottom: 12 }}>// THE NETWORK</div>
            <h2 style={{ fontFamily: "'Bebas Neue'", fontSize: isMobile ? '2.5rem' : '4rem', color: '#fff', letterSpacing: 2, marginBottom: 24, lineHeight: 1.1 }}>
              See Who Else Was There
            </h2>
            <p style={{ fontFamily: "'Space Mono'", fontSize: isMobile ? 11 : 13, color: GRAY, lineHeight: 1.8, maxWidth: 700, margin: '0 auto' }}>
              Every show you log connects you to everyone else who was in that room.<br/>
              <span style={{ color: PURPLE }}>Your archive builds itself</span> — when a friend tags you at a show, it appears in your history automatically. No manual entry required.
            </p>
          </div>

          {/* Web + Galaxy screenshots */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 24, marginBottom: 60 }}>
            <div style={{ background: '#0a0a0f', border: `1px solid ${PURPLE}44`, borderRadius: 12, overflow: 'hidden', boxShadow: `0 20px 60px rgba(0,0,0,0.8), 0 0 30px ${PURPLE}22` }}>
              <div style={{ background: '#050508', padding: '8px 12px', borderBottom: `1px solid ${PURPLE}22`, display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#ff4466' }} />
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: GOLD }} />
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#00cc88' }} />
                <span style={{ fontFamily: "'Space Mono'", fontSize: 8, color: PURPLE, marginLeft: 8, letterSpacing: 2 }}>COLLABORATION WEB</span>
              </div>
              <img src="https://pirqtmtzearmugvzhmgl.supabase.co/storage/v1/object/public/avatars/web.png" alt="Collaboration web" style={{ width: '100%', height: 'auto', display: 'block' }} />
            </div>
            <div style={{ background: '#0a0a0f', border: `1px solid ${TEAL}44`, borderRadius: 12, overflow: 'hidden', boxShadow: `0 20px 60px rgba(0,0,0,0.8), 0 0 30px ${TEAL}22` }}>
              <div style={{ background: '#050508', padding: '8px 12px', borderBottom: `1px solid ${TEAL}22`, display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#ff4466' }} />
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: GOLD }} />
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#00cc88' }} />
                <span style={{ fontFamily: "'Space Mono'", fontSize: 8, color: TEAL, marginLeft: 8, letterSpacing: 2 }}>3D GALAXY VIEW</span>
              </div>
              <img src="https://pirqtmtzearmugvzhmgl.supabase.co/storage/v1/object/public/avatars/galaxy.png" alt="3D galaxy view" style={{ width: '100%', height: 'auto', display: 'block' }} />
            </div>
          </div>

          {/* The compounding value prop */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 24, marginBottom: 60 }}>
            {[
              { icon: '🎟️', color: TEAL, title: 'Tag Friends at Shows', desc: 'Add a co-attendee when logging a show. They get an email and the show appears in their archive automatically — no manual entry needed.' },
              { icon: '🌐', color: PURPLE, title: 'The More People Join, The Better It Gets', desc: 'Every new user on the platform means more overlap, more connections, more shows linked across archives. The network compounds.' },
              { icon: '📡', color: GOLD, title: 'Follow Friends\' Upcoming Shows', desc: 'See what everyone in your network is seeing next, all in one live feed on your dashboard.' },
            ].map((item, i) => (
              <div key={i} className="feature-card" style={{ background: `linear-gradient(135deg, #0a0a0a, #050508)`, border: `1px solid ${item.color}33`, borderRadius: 12, padding: '28px 24px' }}>
                <div style={{ fontSize: '2rem', marginBottom: 16 }}>{item.icon}</div>
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.3rem', color: '#fff', letterSpacing: 2, marginBottom: 10 }}>{item.title}</div>
                <div style={{ fontFamily: "'Space Mono'", fontSize: 9, color: GRAY, lineHeight: 1.8 }}>{item.desc}</div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <button onClick={() => setMode('signup')} className="cta-primary">JOIN THE NETWORK</button>
          </div>
        </div>
      </div>

      {/* ── UPCOMING MARQUEES SECTION ── */}
      <div style={{ padding: isMobile ? '80px 20px' : '100px 40px', background: '#050508', borderTop: '1px solid #111' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ fontFamily: "'Space Mono'", fontSize: 9, color: GOLD, letterSpacing: 4, marginBottom: 12 }}>// WHAT'S COMING UP</div>
            <h2 style={{ fontFamily: "'Bebas Neue'", fontSize: isMobile ? '2.5rem' : '4rem', color: '#fff', letterSpacing: 2, marginBottom: 24, lineHeight: 1.1 }}>
              Your Shows & Your Friends'<br/><span style={{ color: GOLD }}>Side by Side</span>
            </h2>
            <p style={{ fontFamily: "'Space Mono'", fontSize: isMobile ? 11 : 13, color: GRAY, lineHeight: 1.8, maxWidth: 650, margin: '0 auto' }}>
              Your upcoming shows on the left. Your friends' upcoming shows on the right.<br/>
              Follow people on The Station and their shows appear in your feed automatically.
            </p>
          </div>

          {/* Marquee screenshot */}
          <div style={{ background: '#0a0a0f', border: `1px solid ${GOLD}44`, borderRadius: 12, overflow: 'hidden', boxShadow: `0 20px 60px rgba(0,0,0,0.8), 0 0 30px ${GOLD}22`, marginBottom: 48 }}>
            <div style={{ background: '#050508', padding: '8px 12px', borderBottom: `1px solid ${GOLD}22`, display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#ff4466' }} />
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: GOLD }} />
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#00cc88' }} />
              <span style={{ fontFamily: "'Space Mono'", fontSize: 8, color: GOLD, marginLeft: 8, letterSpacing: 2 }}>UPCOMING DASHBOARD</span>
            </div>
            <img src="https://pirqtmtzearmugvzhmgl.supabase.co/storage/v1/object/public/avatars/marquees.png" alt="Upcoming shows marquee" style={{ width: '100%', height: 'auto', display: 'block' }} />
          </div>

          <div style={{ textAlign: 'center' }}>
            <button onClick={() => setMode('signup')} className="cta-primary">START TRACKING</button>
          </div>
        </div>
      </div>

      {/* ── FEATURES GRID ── */}
      <div style={{ padding: isMobile ? '80px 20px' : '100px 40px', background: '#000', borderTop: '1px solid #111' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <h2 style={{ fontFamily: "'Bebas Neue'", fontSize: isMobile ? '2.5rem' : '3.5rem', color: '#fff', letterSpacing: 2, marginBottom: 16 }}>Everything You Need</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? 24 : 32 }}>
            {[
              { icon: '🎟️', color: TEAL, title: 'Physical Artifact Vault', sub: 'Upload ticket stubs, setlists, posters, wristbands, and polaroids. Your physical collection, digitized.' },
              { icon: '🎪', color: GOLD, title: 'Festival Passport', sub: 'Every festival you\'ve attended becomes a box set — day by day, year by year, with full lineups.' },
              { icon: '🏆', color: PURPLE, title: 'Hall of Fame', sub: 'Artists you\'ve seen 5+ times get their own timeline with every show, every venue, every artifact.' },
              { icon: '⏳', color: '#00cfff', title: 'Interactive Timeline', sub: 'Scroll through decades of shows, colored by genre. Jump to any year, any festival.' },
              { icon: '📊', color: '#ff4466', title: 'Stats Dashboard', sub: 'Total shows, top artists, states covered, peak year, genre DNA breakdown — all live.' },
              { icon: '🌐', color: '#ff66cc', title: 'Public Profiles', sub: 'Share your full archive at mytrackrecord.live/u/yourname. Every show, every artifact, public.' },
            ].map((feat, i) => (
              <div key={i} className="feature-card" style={{ background: `linear-gradient(135deg, #0a0a0a, #050508)`, border: `1px solid ${feat.color}33`, borderRadius: 12, padding: '32px 24px' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = feat.color; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = `${feat.color}33`; }}>
                <div style={{ fontSize: '2rem', marginBottom: 16 }}>{feat.icon}</div>
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.4rem', color: '#fff', letterSpacing: 2, marginBottom: 8 }}>{feat.title}</div>
                <div style={{ fontFamily: "'Space Mono'", fontSize: 9, color: GRAY, lineHeight: 1.8 }}>{feat.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── SOCIAL PROOF ── */}
      <div style={{ padding: isMobile ? '80px 20px' : '100px 40px', background: '#050508', borderTop: '1px solid #111' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ background: 'linear-gradient(135deg, #0a0008, #08000f)', border: `1px solid ${TEAL}44`, borderRadius: 16, padding: isMobile ? '40px 24px' : '60px 48px' }}>
            <div style={{ fontFamily: "'Space Mono'", fontSize: isMobile ? 14 : 16, color: '#fff', lineHeight: 1.8, marginBottom: 24, fontStyle: 'italic' }}>
              "Gotta say it's a neat system for concert people. It's been fun remembering some of the older stuff. I didn't realize I went to so many back to back DMB shows — and 2 at MSG."
            </div>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1rem', color: TEAL, letterSpacing: 2 }}>— EARLY USER</div>
          </div>
        </div>
      </div>

      {/* ── FINAL CTA ── */}
      <div style={{ padding: isMobile ? '100px 20px' : '120px 40px', background: '#000', textAlign: 'center', position: 'relative', overflow: 'hidden', borderTop: '1px solid #111' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 900, height: 900, background: `radial-gradient(circle, rgba(0,229,204,0.07) 0%, rgba(153,102,255,0.04) 35%, transparent 65%)`, pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: isMobile ? '3rem' : '6rem', color: '#fff', lineHeight: 0.9, letterSpacing: isMobile ? 2 : 6, marginBottom: 32 }}>
            START YOUR<br/><span style={{ color: TEAL }}>ARCHIVE TODAY</span>
          </div>
          <div style={{ fontFamily: "'Space Mono'", fontSize: isMobile ? 11 : 13, color: GRAY, letterSpacing: 3, marginBottom: 48, lineHeight: 2 }}>
            FREE FOREVER • NO CREDIT CARD • NO SHOEBOX REQUIRED
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, marginBottom: 64 }}>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
              <button onClick={() => setMode('signup')}
                style={{ background: TEAL, color: '#000', border: 'none', padding: isMobile ? '24px 48px' : '28px 72px', fontFamily: "'Bebas Neue'", fontSize: isMobile ? '1.6rem' : '2rem', letterSpacing: 5, cursor: 'pointer', borderRadius: 4, transition: 'all 0.3s', boxShadow: `0 0 40px rgba(0,229,204,0.5)` }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = `0 0 80px rgba(0,229,204,0.8)`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = `0 0 40px rgba(0,229,204,0.5)`; }}>
                CREATE FREE ACCOUNT
              </button>
              <button onClick={() => setMode('login')}
                style={{ background: 'transparent', color: TEAL, border: `2px solid ${TEAL}`, padding: isMobile ? '24px 48px' : '28px 72px', fontFamily: "'Bebas Neue'", fontSize: isMobile ? '1.6rem' : '2rem', letterSpacing: 5, cursor: 'pointer', borderRadius: 4, transition: 'all 0.3s' }}
                onMouseEnter={e => { e.currentTarget.style.background = `${TEAL}15`; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                LOG IN
              </button>
            </div>
            <button onClick={() => onNavigateToUser('eric')}
              style={{ background: 'none', border: 'none', color: GRAY, fontFamily: "'Space Mono'", fontSize: 10, cursor: 'pointer', textDecoration: 'underline', letterSpacing: 1, transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = TEAL}
              onMouseLeave={e => e.currentTarget.style.color = GRAY}>
              or view a live example →
            </button>
          </div>

          {/* Stats strip */}
          <div style={{ display: 'flex', gap: isMobile ? 32 : 60, justifyContent: 'center', flexWrap: 'wrap', padding: '40px 0', borderTop: '1px solid #111', borderBottom: '1px solid #111' }}>
            {[
              [shows.length, 'SHOWS', TEAL],
              [uniqueArtists, 'ARTISTS', GOLD],
              [uniqueVenues, 'VENUES', PURPLE],
              [festivalCount, 'FESTIVALS', '#ff4466'],
              [uniqueStates, 'STATES', '#00cfff'],
              [userCount, 'ARCHIVISTS', '#ff66cc'],
            ].map(([val, label, color]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: isMobile ? '2.5rem' : '4rem', color, lineHeight: 1, textShadow: `0 0 20px ${color}88` }}>{val}</div>
                <div style={{ fontFamily: "'Space Mono'", fontSize: 7, color: GRAY, letterSpacing: 4, marginTop: 8 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BOTTOM TICKER */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000, background: '#000', borderTop: `1px solid ${GOLD}22`, height: 28, display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        <div style={{ background: '#111', color: GOLD, fontFamily: "'Bebas Neue'", fontSize: 10, letterSpacing: 2, padding: '0 12px', height: '100%', display: 'flex', alignItems: 'center', flexShrink: 0, borderRight: `1px solid ${GOLD}33` }}>SYSTEM</div>
        <div style={{ overflow: 'hidden', flex: 1 }}>
          <div className="ticker-scroll" style={{ fontFamily: "'Space Mono'", fontSize: 9, color: GOLD, paddingLeft: 20, letterSpacing: 1, opacity: 0.6, animationDuration: '60s' }}>
            {`FREE /// ${shows.length} SHOWS TRACKED /// ${festivalCount} FESTIVALS /// ${uniqueStates} STATES COVERED /// NO CREDIT CARD REQUIRED /// `.repeat(3)}
          </div>
        </div>
      </div>

      {/* FOOTERr */}
      <div style={{ padding: '40px 20px 80px', background: '#000', borderTop: '1px solid #111', textAlign: 'center', position: 'relative', zIndex: 999 }}>
        <div style={{ fontFamily: "'Space Mono'", fontSize: 9, color: GRAY, letterSpacing: 2, marginBottom: 12 }}>Questions? Ideas? Found a bug?</div>
        <a href="mailto:trackrecordlive@gmail.com" style={{ fontFamily: "'Space Mono'", fontSize: 11, color: TEAL, textDecoration: 'none', letterSpacing: 1 }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
          trackrecordlive@gmail.com
        </a>
        <div style={{ fontFamily: "'Space Mono'", fontSize: 7, color: '#333', letterSpacing: 2, marginTop: 20 }}>
          © 2026 TRACKRECORD • BUILT BY ERIC PAUL • PORTLAND, OR
        </div>
      </div>

      {/* AUTH MODAL */}
      {mode && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, backdropFilter: 'blur(12px)' }}
          onClick={e => e.target === e.currentTarget && setMode(null)}>
          <div className="fade-in" style={{ background: '#0a0a0c', border: `1px solid ${TEAL}`, borderRadius: 12, padding: 40, width: '100%', maxWidth: 400, boxShadow: `0 0 60px rgba(0,229,204,0.2)` }}>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: '2rem', color: TEAL, marginBottom: 6, letterSpacing: 3 }}>
              {mode === 'login' ? 'Welcome Back' : 'Create Your Archive'}
            </div>
            <div style={{ fontSize: 9, color: GRAY, marginBottom: inviteShow ? 16 : 28, letterSpacing: 2 }}>
              {mode === 'login' ? 'Log in to access your collection' : 'Sign up free - no credit card required'}
            </div>

            {inviteShow && (
              <div style={{ background: 'rgba(0,229,204,0.08)', border: '1px solid rgba(0,229,204,0.3)', borderRadius: 8, padding: '12px 16px', marginBottom: 20 }}>
                <div style={{ fontFamily: "'Space Mono'", fontSize: 9, color: TEAL, letterSpacing: 1, marginBottom: 4 }}>🎵 YOU WERE TAGGED AT A SHOW</div>
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.2rem', color: '#fff', letterSpacing: 1 }}>{inviteShow.artist}</div>
                <div style={{ fontFamily: "'Space Mono'", fontSize: 8, color: GRAY }}>
                  {new Date(inviteShow.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} · {inviteShow.venue}
                </div>
                <div style={{ fontFamily: "'Space Mono'", fontSize: 8, color: TEAL, marginTop: 6 }}>This show will be added to your archive automatically.</div>
              </div>
            )}

            {message && (
              <div style={{ background: message.includes('Welcome') ? 'rgba(0,229,204,0.1)' : 'rgba(255,68,68,0.1)', border: `1px solid ${message.includes('Welcome') ? TEAL : '#ff4466'}`, borderRadius: 4, padding: '10px 14px', fontSize: 9, color: message.includes('Welcome') ? TEAL : '#ff4466', marginBottom: 20, letterSpacing: 1, lineHeight: 1.6 }}>
                {message}
              </div>
            )}

            <form onSubmit={mode === 'login' ? handleLogin : handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {mode === 'signup' && (
                <input className="modal-input" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
              )}
              <input className="modal-input" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
              <input className="modal-input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="button" onClick={() => { setMode(null); setMessage(''); }} style={{ flex: 1, background: 'transparent', border: '1px solid #333', color: GRAY, padding: '12px', cursor: 'pointer', fontFamily: "'Bebas Neue'", fontSize: '1.1rem', borderRadius: 4 }}>Cancel</button>
                <button type="submit" disabled={loading} style={{ flex: 2, background: loading ? '#222' : TEAL, border: 'none', color: '#000', padding: '12px', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: "'Bebas Neue'", fontSize: '1.3rem', fontWeight: 900, borderRadius: 4, letterSpacing: 2 }}>
                  {loading ? '...' : mode === 'login' ? 'Log In' : 'Sign Up Free'}
                </button>
              </div>
            </form>

            <div style={{ marginTop: 20, textAlign: 'center' }}>
              <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setMessage(''); }} style={{ background: 'none', border: 'none', color: GRAY, fontSize: 9, cursor: 'pointer', letterSpacing: 1, textDecoration: 'underline' }}>
                {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}