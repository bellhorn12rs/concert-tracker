import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from './supabaseClient';

const TEAL = '#00e5cc';
const GOLD = '#ffcc00';
const BG = '#000000';
const GRAY = '#8899aa';

const getBandName = (b) => typeof b === 'string' ? b : (b?.name || '');

const fmtDateShort = d => {
  if (!d) return '—';
  const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const dt = new Date(d + 'T12:00:00');
  return `${MONTHS_SHORT[dt.getMonth()]} ${dt.getDate()}, ${dt.getFullYear()}`;
};

export default function LandingPage({ concerts = [] }) {
  const [mode, setMode] = useState(null); // 'login' or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [featuredIdx, setFeaturedIdx] = useState(0);
  const [tickerPaused, setTickerPaused] = useState(false);

  // Pick concerts that have a real artifact
  const artifacts = useMemo(() => {
    return concerts.filter(c =>
      c.image_url || c.personal_photo_url || c.setlist_image_url
    ).slice(0, 20);
  }, [concerts]);

  // Rotate featured artifact
  useEffect(() => {
    if (!artifacts.length) return;
    const t = setInterval(() => {
      if (!tickerPaused) setFeaturedIdx(p => (p + 1) % artifacts.length);
    }, 4000);
    return () => clearInterval(t);
  }, [artifacts.length, tickerPaused]);

  const featured = artifacts[featuredIdx] || concerts[0];

  // Build ticker items from real data
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

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage('ACCESS DENIED: ' + error.message);
    }
    setLoading(false);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const { error } = await supabase.auth.signUp({
      email,
      password,
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

  const featuredBand = featured
    ? (getBandName(featured.bands?.[0]) || featured.festival_name || 'UNKNOWN')
    : '';

  return (
    <div style={{
      minHeight: '100vh',
      background: BG,
      color: '#fff',
      fontFamily: "'Space Mono', monospace",
      overflow: 'hidden',
      position: 'relative'
    }}>
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

        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(0,229,204,0.3); }
          50% { box-shadow: 0 0 60px rgba(0,229,204,0.7); }
        }

        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }

        .ticker-scroll {
          display: inline-block;
          animation: ticker-scroll 40s linear infinite;
          white-space: nowrap;
        }

        .artifact-drift {
          animation: drift 6s ease-in-out infinite;
        }

        .fade-in {
          animation: fade-in 0.6s ease both;
        }

        .cta-primary {
          background: ${TEAL};
          color: #000;
          border: none;
          padding: 16px 40px;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.4rem;
          letter-spacing: 3px;
          cursor: pointer;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .cta-primary:hover {
          transform: scale(1.05);
          box-shadow: 0 0 30px rgba(0,229,204,0.6);
        }

        .cta-secondary {
          background: transparent;
          color: ${TEAL};
          border: 1px solid ${TEAL};
          padding: 14px 32px;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.2rem;
          letter-spacing: 3px;
          cursor: pointer;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .cta-secondary:hover {
          background: rgba(0,229,204,0.1);
        }

        .modal-input {
          width: 100%;
          background: #0a0a0a;
          border: 1px solid #333;
          color: #fff;
          padding: 14px;
          font-family: 'Space Mono', monospace;
          font-size: 12px;
          outline: none;
          border-radius: 4px;
          box-sizing: border-box;
          transition: border-color 0.2s;
        }

        .modal-input:focus {
          border-color: ${TEAL};
        }

        .scanline-overlay {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 9998;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0,0,0,0.03) 2px,
            rgba(0,0,0,0.03) 4px
          );
        }
      `}</style>

      {/* Scanline overlay */}
      <div className="scanline-overlay" />

      {/* ── TOP TICKER ── */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: '#000',
        borderBottom: `1px solid ${TEAL}44`,
        height: 36,
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden'
      }}>
        <div style={{
          background: TEAL,
          color: '#000',
          fontFamily: "'Bebas Neue'",
          fontSize: 11,
          letterSpacing: 2,
          padding: '0 14px',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          fontWeight: 900,
          flexShrink: 0,
          boxShadow: `5px 0 15px rgba(0,229,204,0.4)`
        }}>
          LIVE SIGNAL
        </div>
        <div style={{ overflow: 'hidden', flex: 1 }}>
          <div className="ticker-scroll" style={{
            fontFamily: "'Space Mono'",
            fontSize: 10,
            color: TEAL,
            paddingLeft: 20,
            letterSpacing: 1,
            textShadow: `0 0 8px rgba(0,229,204,0.5)`
          }}>
            {tickerItems}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 80,
        paddingBottom: 60,
        position: 'relative'
      }}>

        {/* Background glow */}
        <div style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600,
          height: 600,
          background: `radial-gradient(circle, rgba(0,229,204,0.06) 0%, transparent 70%)`,
          pointerEvents: 'none'
        }} />

        {/* Logo / Wordmark */}
        <div className="fade-in" style={{ textAlign: 'center', marginBottom: 48, position: 'relative', zIndex: 1 }}>
          <div style={{
            fontFamily: "'Bebas Neue'",
            fontSize: 'clamp(3rem, 8vw, 6rem)',
            letterSpacing: 8,
            color: '#fff',
            lineHeight: 0.9,
            textShadow: `0 0 40px rgba(0,229,204,0.3)`
          }}>
            TRACK<span style={{ color: TEAL }}>RECORD</span>
          </div>
          <div style={{
            fontFamily: "'Space Mono'",
            fontSize: 9,
            color: GRAY,
            letterSpacing: 4,
            marginTop: 12,
            textTransform: 'uppercase'
          }}>
            Your Concert History. Museum Grade.
          </div>
        </div>

        {/* ── ARTIFACT CENTERPIECE ── */}
        {featuredImg && (
          <div
            className="artifact-drift fade-in"
            style={{ position: 'relative', marginBottom: 40, zIndex: 1 }}
            onMouseEnter={() => setTickerPaused(true)}
            onMouseLeave={() => setTickerPaused(false)}
          >
            {/* Artifact frame */}
            <div style={{
              background: '#fff',
              padding: '10px 10px 50px 10px',
              boxShadow: '0 30px 80px rgba(0,0,0,0.8), 0 0 40px rgba(0,229,204,0.2)',
              borderRadius: 2,
              position: 'relative',
              width: 280
            }}>
              <img
                src={featuredImg}
                alt={featuredBand}
                style={{
                  width: '100%',
                  height: 220,
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
              {/* Polaroid caption */}
              <div style={{
                position: 'absolute',
                bottom: 10,
                left: 0,
                right: 0,
                textAlign: 'center',
                fontFamily: "'Bebas Neue'",
                fontSize: '1.1rem',
                color: '#111',
                letterSpacing: 2
              }}>
                {featuredBand.toUpperCase()}
              </div>
            </div>

            {/* Readout strip */}
            <div style={{
              marginTop: 16,
              background: '#0a0a0a',
              border: `1px solid ${TEAL}33`,
              borderRadius: 4,
              padding: '10px 16px',
              display: 'flex',
              gap: 20,
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              {[
                ['DATE', fmtDateShort(featured?.date)],
                ['VENUE', (featured?.venue || 'UNKNOWN').slice(0, 20)],
                ['QUALITY', 'MUSEUM_GRADE'],
              ].map(([label, val]) => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 7, color: TEAL, letterSpacing: 2, marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 9, color: '#fff', letterSpacing: 1 }}>{val?.toUpperCase()}</div>
                </div>
              ))}
            </div>

            {/* Artifact navigation dots */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 12 }}>
              {artifacts.slice(0, 8).map((_, i) => (
                <div
                  key={i}
                  onClick={() => setFeaturedIdx(i)}
                  style={{
                    width: i === featuredIdx ? 16 : 6,
                    height: 6,
                    borderRadius: 3,
                    background: i === featuredIdx ? TEAL : '#333',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── CTAs ── */}
        <div className="fade-in" style={{
          display: 'flex',
          gap: 16,
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginBottom: 24,
          position: 'relative',
          zIndex: 1
        }}>
          <button className="cta-primary" onClick={() => setMode('signup')}>
            INITIALIZE ARCHIVE
          </button>
          <button className="cta-secondary" onClick={() => setMode('login')}>
            ACCESS VAULT
          </button>
        </div>

        {/* Stats row */}
        <div className="fade-in" style={{
          display: 'flex',
          gap: 32,
          justifyContent: 'center',
          flexWrap: 'wrap',
          position: 'relative',
          zIndex: 1
        }}>
          {[
            [concerts.length, 'SHOWS ARCHIVED'],
            [new Set(concerts.map(c => getBandName(c.bands?.[0])).filter(Boolean)).size, 'UNIQUE ARTISTS'],
            [new Set(concerts.map(c => c.venue).filter(Boolean)).size, 'VENUES LOGGED'],
          ].map(([val, label]) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: "'Bebas Neue'",
                fontSize: '2.5rem',
                color: TEAL,
                lineHeight: 1,
                textShadow: `0 0 20px rgba(0,229,204,0.4)`
              }}>{val}</div>
              <div style={{ fontSize: 7, color: GRAY, letterSpacing: 2, marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── BOTTOM TICKER ── */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: '#000',
        borderTop: `1px solid ${TEAL}22`,
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
          SYS
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
            {`ARCHIVE STATUS: ACTIVE /// TOTAL SIGNALS: ${concerts.length} /// GENRES MAPPED: ${new Set(concerts.map(c => c.genre).filter(Boolean)).size} /// STATES COVERED: ${new Set(concerts.map(c => c.state).filter(Boolean)).size} /// ARTIFACTS STORED: ${concerts.filter(c => c.image_url || c.personal_photo_url).length} /// SYSTEM: NOMINAL /// `.repeat(3)}
          </div>
        </div>
      </div>

      {/* ── AUTH MODAL ── */}
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
              fontSize: '2.2rem',
              color: TEAL,
              marginBottom: 6,
              letterSpacing: 3
            }}>
              {mode === 'login' ? 'ACCESS VAULT' : 'INITIALIZE ARCHIVE'}
            </div>
            <div style={{ fontSize: 8, color: GRAY, marginBottom: 28, letterSpacing: 2 }}>
              {mode === 'login'
                ? 'ENTER YOUR CREDENTIALS TO CONTINUE'
                : 'CREATE YOUR ACCOUNT TO START ARCHIVING'}
            </div>

            {message && (
              <div style={{
                background: message.includes('SENT') ? 'rgba(0,229,204,0.1)' : 'rgba(255,68,68,0.1)',
                border: `1px solid ${message.includes('SENT') ? TEAL : '#ff4466'}`,
                borderRadius: 4,
                padding: '10px 14px',
                fontSize: 9,
                color: message.includes('SENT') ? TEAL : '#ff4466',
                marginBottom: 20,
                letterSpacing: 1,
                lineHeight: 1.6
              }}>
                {message}
              </div>
            )}

            <form onSubmit={mode === 'login' ? handleLogin : handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {mode === 'signup' && (
                <input
                  className="modal-input"
                  placeholder="USERNAME"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                />
              )}
              <input
                className="modal-input"
                type="email"
                placeholder="EMAIL"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <input
                className="modal-input"
                type="password"
                placeholder="PASSWORD"
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
                  {loading ? '...' : mode === 'login' ? 'ENTER' : 'CREATE ARCHIVE'}
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
                {mode === 'login' ? 'NO ACCOUNT? INITIALIZE ARCHIVE' : 'ALREADY HAVE AN ACCOUNT? ACCESS VAULT'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}