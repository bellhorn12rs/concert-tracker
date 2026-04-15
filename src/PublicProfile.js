import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from './supabaseClient';

// Helper constants (Assuming these aren't global in your file)
const TEAL = '#00e5cc';
const GRAY = '#888';
const GOLD = '#ffcc00';

// Global helpers (Assumed defined in your project)
const getBandName = (b) => typeof b === 'string' ? b : (b?.name || '');
const getYear = d => d ? new Date(d + 'T12:00:00').getFullYear() : null;
const fmtDateShort = d => { 
  if (!d) return '—'; 
  const dt = new Date(d + 'T12:00:00'); 
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase(); 
};
const GENRE_COLORS = { 'Indie Rock':'#00f2ff','Alternative':'#9d00ff','Experimental':'#ff00ff','Electronic':'#ff0077','Jam':'#ffcc00','Folk':'#ffaa00','Classic Rock':'#ff4400','Pop':'#00e5ff','Hip Hop':'#a2ff00','Punk':'#ff3300','R&B':'#ff66cc','Country':'#cc8800','Metal':'#888888','Other':'#334455' };

export default function PublicProfile({ username, currentSession }) {
  const [profile, setProfile] = useState(null);
  const [concerts, setConcerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const isMobile = window.innerWidth < 768;

  const isOwner = currentSession?.user && profile?.id === currentSession.user.id;

  // ── 1. THE ARCHIVE LOADER ──
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setNotFound(false);

      try {
        // A. Fetch the profile by username
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', username)
          .single();

        if (profileError || !profileData) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        setProfile(profileData);

        // B. Fetch their FULL museum archaeology
        const { data: museumData, error: museumError } = await supabase
          .from('concerts')
          .select('*')
          .eq('user_id', profileData.id)
          .order('date', { ascending: false });

        if (museumError) throw museumError;
        setConcerts(museumData || []);

      } catch (err) {
        console.error("ARCHIVE ACCESS DENIED:", err);
      } finally {
        setLoading(false);
      }
    };
    
    if (username) load();
  }, [username]);

  // ── 2. THE STATS ENGINE ──
  const stats = useMemo(() => {
    if (!concerts.length) return { 
      totalShows: 0, uniqueArtists: 0, uniqueVenues: 0, 
      uniqueStates: 0, festDays: 0, topArtists: [], topGenres: [] 
    };

    const artists = new Set(concerts.flatMap(c => (Array.isArray(c.bands) ? c.bands : []).map(getBandName)).filter(Boolean));
    const venues = new Set(concerts.map(c => c.venue).filter(Boolean));
    const states = new Set(concerts.map(c => c.state).filter(Boolean));
    const fests = concerts.filter(c => c.is_festival).length;

    // Artist counts
    const artistCounts = {};
    concerts.forEach(c => (Array.isArray(c.bands) ? c.bands : []).forEach(b => {
      const name = getBandName(b);
      if (name) artistCounts[name] = (artistCounts[name] || 0) + 1;
    }));
    const topArtists = Object.entries(artistCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

    // Genre counts
    const genreCounts = {};
    concerts.forEach(c => {
      const g = c.genre || 'Other';
      genreCounts[g] = (genreCounts[g] || 0) + 1;
    });
    const topGenres = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]);

    // Hero artifact
    const withArtifact = concerts.filter(c => c.image_url || c.personal_photo_url);
    const hero = withArtifact[0] || concerts[0];

    // Year breakdown
    const yearCounts = {};
    concerts.forEach(c => {
      const y = getYear(c.date);
      if (y) yearCounts[y] = (yearCounts[y] || 0) + 1;
    });
    const peakYear = Object.entries(yearCounts).sort((a, b) => b[1] - a[1])[0];

    return {
      totalShows: concerts.length,
      uniqueArtists: artists.size,
      uniqueVenues: venues.size,
      uniqueStates: states.size,
      festDays: fests,
      topArtists,
      topGenres,
      hero,
      peakYear: peakYear?.[0],
      peakYearCount: peakYear?.[1],
    };
  }, [concerts]);

  const heroImg = stats.hero
    ? (stats.hero.image_url?.split(',')[0] || stats.hero.personal_photo_url?.split(',')[0])
    : null;
  const heroBand = stats.hero
    ? (getBandName(stats.hero.bands?.[0]) || stats.hero.festival_name || '')
    : '';

  const avatarColor = profile?.avatar_color || TEAL;

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: "'Bebas Neue'", fontSize: '2rem', color: TEAL, letterSpacing: 4 }}>LOADING ARCHIVE...</div>
    </div>
  );

  if (notFound) return (
    <div style={{ minHeight: '100vh', background: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
      <div style={{ fontFamily: "'Bebas Neue'", fontSize: '3rem', color: '#fff', letterSpacing: 4 }}>SIGNAL NOT FOUND</div>
      <div style={{ fontFamily: "'Space Mono'", fontSize: 10, color: GRAY, letterSpacing: 2 }}>NO ARCHIVE EXISTS FOR @{username}</div>
      <button onClick={() => { window.location.hash = ''; window.location.reload(); }} style={{ background: TEAL, color: '#000', border: 'none', padding: '12px 28px', fontFamily: "'Bebas Neue'", fontSize: '1.2rem', letterSpacing: 3, cursor: 'pointer', borderRadius: 4, marginTop: 20 }}>
        RETURN TO TRACKRECORD
      </button>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', fontFamily: "'Space Mono', monospace" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono&display=swap');
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fade-in 0.5s ease both; }
        .tab-btn { background: transparent; border: none; cursor: pointer; transition: all 0.2s; }
        .tab-btn:hover { opacity: 1 !important; }
        .show-row:hover { background: rgba(255,255,255,0.04) !important; }
      `}</style>

      {/* ── MUSEUM EXIT NAV ── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(10px)',
        borderBottom: `1px solid #111`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: isMobile ? '0 16px' : '0 32px', height: 52
      }}>
        <button
          onClick={() => { window.location.hash = ''; window.location.reload(); }}
          style={{ background: 'none', border: 'none', color: TEAL, cursor: 'pointer', fontFamily: "'Bebas Neue'", fontSize: '1.1rem', letterSpacing: 3, display: 'flex', alignItems: 'center', gap: 8 }}
        >
          ← TRACKRECORD
        </button>
        <div style={{ fontFamily: "'Space Mono'", fontSize: 9, color: GRAY, letterSpacing: 2 }}>@{username}</div>
        {isOwner && (
          <button
            onClick={() => { window.location.hash = ''; window.location.reload(); }}
            style={{ background: 'rgba(0,229,204,0.15)', color: TEAL, border: `1px solid ${TEAL}44`, padding: '6px 16px', fontFamily: "'Bebas Neue'", fontSize: '0.9rem', letterSpacing: 2, cursor: 'pointer', borderRadius: 3 }}
          >
            ← MY ARCHIVE
          </button>
        )}
      </div>

      {/* ── PROFILE HEADER ── */}
      <div style={{
        background: `linear-gradient(180deg, ${avatarColor}11 0%, #000 100%)`,
        borderBottom: `1px solid #111`,
        padding: isMobile ? '32px 20px' : '48px 40px',
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: isMobile ? 20 : 40, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{
              width: isMobile ? 64 : 80, height: isMobile ? 64 : 80,
              borderRadius: '50%', background: `${avatarColor}22`,
              border: `2px solid ${avatarColor}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'Bebas Neue'", fontSize: isMobile ? '1.8rem' : '2.2rem',
              color: avatarColor, flexShrink: 0,
              boxShadow: `0 0 20px ${avatarColor}44`
            }}>
              {username[0].toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: isMobile ? '2rem' : '3rem', color: '#fff', lineHeight: 1, letterSpacing: 2 }}>
                {username.toUpperCase()}
              </div>
              <div style={{ fontFamily: "'Space Mono'", fontSize: 8, color: avatarColor, letterSpacing: 3, marginTop: 4 }}>
                CONCERT ARCHIVIST // {stats.totalShows} SIGNALS LOGGED
              </div>
              <div style={{ display: 'flex', gap: isMobile ? 16 : 32, marginTop: 20, flexWrap: 'wrap' }}>
                {[
                  [stats.totalShows, 'SHOWS'],
                  [stats.uniqueArtists, 'ARTISTS'],
                  [stats.uniqueVenues, 'VENUES'],
                  [stats.uniqueStates, 'STATES'],
                  [stats.festDays, 'FEST DAYS'],
                ].map(([val, label]) => (
                  <div key={label} style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: "'Bebas Neue'", fontSize: isMobile ? '1.5rem' : '2rem', color: avatarColor, lineHeight: 1 }}>{val}</div>
                    <div style={{ fontFamily: "'Space Mono'", fontSize: 6, color: GRAY, letterSpacing: 2, marginTop: 2 }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
            {heroImg && !isMobile && (
              <div style={{ flexShrink: 0, transform: 'rotate(2deg)' }}>
                <div style={{ background: '#fff', padding: '6px 6px 36px 6px', boxShadow: '0 20px 60px rgba(0,0,0,0.8)', borderRadius: 2, width: 140 }}>
                  <img src={heroImg} alt={heroBand} style={{ width: '100%', height: 100, objectFit: 'cover', display: 'block' }} />
                  <div style={{ textAlign: 'center', fontFamily: "'Bebas Neue'", fontSize: '0.75rem', color: '#111', marginTop: 4 }}>
                    {heroBand.slice(0, 16).toUpperCase()}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── TABS ── */}
      <div style={{ borderBottom: `1px solid #111`, background: '#000', position: 'sticky', top: 52, zIndex: 99 }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', overflowX: 'auto' }}>
          {[
            ['overview', '⚡ OVERVIEW'],
            ['heavy', '🏆 HEAVY ROTATION'],
            ['trail', '📅 PAPER TRAIL'],
            ['artifacts', '🎟️ ARTIFACTS'],
          ].map(([id, label]) => (
            <button
              key={id}
              className="tab-btn"
              onClick={() => setActiveTab(id)}
              style={{
                padding: isMobile ? '12px 16px' : '14px 24px',
                fontFamily: "'Space Mono'",
                fontSize: isMobile ? 8 : 9,
                letterSpacing: 1,
                color: activeTab === id ? avatarColor : GRAY,
                borderBottom: activeTab === id ? `2px solid ${avatarColor}` : '2px solid transparent',
                whiteSpace: 'nowrap',
                opacity: activeTab === id ? 1 : 0.6
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: isMobile ? '24px 16px 80px' : '40px 40px 80px' }}>
        {activeTab === 'overview' && (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
            <div>
              <div style={{ fontFamily: "'Space Mono'", fontSize: 9, color: avatarColor, letterSpacing: 3, marginBottom: 16 }}>// SONIC DNA</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {stats.topGenres?.slice(0, 6).map(([genre, count]) => {
                  const color = GENRE_COLORS[genre] || TEAL;
                  const pct = Math.round((count / stats.totalShows) * 100);
                  return (
                    <div key={genre} style={{ position: 'relative', height: 28, background: '#0a0a0a', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${pct}%`, background: `linear-gradient(90deg, ${color}66, ${color})`, transition: 'width 1s ease' }} />
                      <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', padding: '0 12px', lineHeight: '28px', fontSize: 9, fontFamily: "'Space Mono'", color: '#fff' }}>
                        <span>{genre}</span>
                        <span>{count} shows</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {stats.peakYear && (
              <div style={{ background: '#0a0a0a', border: `1px solid ${avatarColor}22`, borderRadius: 8, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 24 }}>
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: '4rem', color: avatarColor, lineHeight: 1 }}>{stats.peakYear}</div>
                <div>
                  <div style={{ fontFamily: "'Space Mono'", fontSize: 9, color: GRAY, letterSpacing: 2 }}>PEAK YEAR</div>
                  <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.5rem', color: '#fff' }}>{peakYearCount} SHOWS LOGGED</div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'heavy' && (
          <div className="fade-in">
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
              {stats.topArtists?.map(([artist, count], i) => (
                <div key={artist} style={{ background: '#0a0a0a', border: `1px solid #111`, borderRadius: 8, padding: '20px', position: 'relative' }}>
                  <div style={{ fontFamily: "'Space Mono'", fontSize: 8, color: avatarColor, marginBottom: 8 }}>#{i+1}</div>
                  <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.2rem', color: '#fff', lineHeight: 1, marginBottom: 4 }}>{artist.toUpperCase()}</div>
                  <div style={{ fontFamily: "'Bebas Neue'", fontSize: '2rem', color: avatarColor, lineHeight: 1 }}>{count}×</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'trail' && (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {concerts.map((c, i) => {
              const band = getBandName(c.bands?.[0]) || c.festival_name || 'Unknown';
              const color = GENRE_COLORS[c.genre] || avatarColor;
              const img = c.image_url?.split(',')[0] || c.personal_photo_url?.split(',')[0];
              return (
                <div key={c.id || i} className="show-row" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px', background: '#050505', borderRadius: 6, border: `1px solid #111` }}>
                  {img && <img src={img} alt={band} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 3 }} />}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.1rem', color: '#fff' }}>{band.toUpperCase()}</div>
                    <div style={{ fontFamily: "'Space Mono'", fontSize: 7, color: GRAY }}>{c.venue}</div>
                  </div>
                  <div style={{ fontFamily: "'Space Mono'", fontSize: 8, color: color }}>{fmtDateShort(c.date)}</div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'artifacts' && (
          <div className="fade-in">
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fill, minmax(200px, 1fr))', gap: 24 }}>
              {concerts.filter(c => c.image_url || c.personal_photo_url).map((c, i) => {
                const img = c.image_url?.split(',')[0] || c.personal_photo_url?.split(',')[0];
                const band = getBandName(c.bands?.[0]) || c.festival_name || 'Unknown';
                return (
                  <div key={c.id || i} style={{ background: '#fff', padding: '6px 6px 32px 6px', boxShadow: '0 10px 30px rgba(0,0,0,0.7)', borderRadius: 2, transform: `rotate(${i%2===0?-1.5:1.5}deg)` }}>
                    <img src={img} alt={band} style={{ width: '100%', height: 120, objectFit: 'cover' }} />
                    <div style={{ textAlign: 'center', fontFamily: "'Bebas Neue'", fontSize: '0.75rem', color: '#111', marginTop: 4 }}>{band.toUpperCase()}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}