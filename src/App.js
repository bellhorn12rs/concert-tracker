import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { supabase } from './supabaseClient';
// NEW: The User Brain Tools
import { createContext, useContext } from 'react';
import LandingPage from './LandingPage';
import PublicProfile from './PublicProfile';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const getBandName = (b) => typeof b === 'string' ? b : (b?.name || '');
// ─── UTILITY ──────────────────────────────────────────────────────────────────
function hexToRgba(hex, alpha) {
  if (!hex || typeof hex !== 'string') return `rgba(255,255,255,${alpha})`;
  try {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  } catch (e) {
    return `rgba(255,255,255,${alpha})`;
  }
}

const handleIWasThere = async (concert) => {
    if (!session?.user) return alert("LOGIN REQUIRED TO ARCHIVE SIGNALS");

    // 1. Sanitize the Data: Strip Eric's DB info AND his personal photos
    const { 
      id, 
      created_at, 
      user_id, 
      personal_photo_url, 
      ...coreEventData 
    } = concert;

    // 2. Build the Clone
    const newRecord = {
      ...coreEventData,
      user_id: session.user.id, // Assign to Tara
      personal_photo_url: null, // Blank slate for Tara's own photos
      is_public: true,
      date_added: new Date().toISOString()
    };

    try {
      const { error } = await supabase.from('concerts').insert([newRecord]);
      if (error) throw error;
      
      alert(`SIGNAL CLONED: ${getBandName(concert.bands?.[0]) || 'Show'} added to your archive!`);
    } catch (err) {
      console.error("Cloning failed:", err);
      alert("Failed to clone: " + err.message);
    }
  };

// ─── THE RETRO TICKET STUB (IDEA #1) ──────────────────────────────────────────
const TicketStub = ({ show }) => {
  if (!show) return null;

  return (
    <div style={{
      width: '100%',
      maxWidth: '450px',
      height: '160px',
      background: '#e0d8b0', // Classic "Manila" ticket color
      borderRadius: '4px',
      display: 'flex',
      color: '#222',
      fontFamily: "'Courier New', Courier, monospace", // The "Printer" font
      boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
      position: 'relative',
      overflow: 'hidden',
      border: '1px solid #c0b890',
      margin: '20px auto',
      userSelect: 'none'
    }}>
      {/* Perforated Edge */}
      <div style={{ position: 'absolute', left: '75%', top: 0, bottom: 0, width: '2px', borderLeft: '2px dotted #a09870' }} />
      
      {/* Left Section (The Main Info) */}
      <div style={{ flex: 3, padding: '15px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '9px', fontWeight: 'bold', marginBottom: '4px', opacity: 0.6 }}>ADMIT ONE - LIVE CONCERT</div>
          <div style={{ fontSize: '1.4rem', fontWeight: '900', letterSpacing: '-1px', lineHeight: 1, textTransform: 'uppercase' }}>
            {show.artist || show.bands?.[0]}
          </div>
        </div>
        
        <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
          {show.venue?.toUpperCase()}<br/>
          {show.city?.toUpperCase()}, {show.state}
        </div>

        <div style={{ display: 'flex', gap: '20px', fontSize: '10px', fontWeight: 'bold', borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '8px' }}>
          <div>DATE: {show.date}</div>
          <div>PRICE: COMPLIMENTARY</div>
        </div>
      </div>

      {/* Right Section (The Stub) */}
      <div style={{ flex: 1, background: 'rgba(0,0,0,0.03)', padding: '15px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
        <div style={{ fontSize: '8px', transform: 'rotate(-90deg)', width: '100px', whiteSpace: 'nowrap', marginBottom: '10px', fontWeight: 'bold' }}>
           SECTION: GA  |  ROW: 01
        </div>
        {/* Fake Barcode */}
        <div style={{ display: 'flex', gap: '1px', marginTop: 'auto' }}>
          {[2,4,1,3,2,5,1,4,2].map((w, i) => (
            <div key={i} style={{ width: w, height: '30px', background: '#333' }} />
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── THE BACKSTAGE PASS (IDEA #3) ────────────────────────────────────────────
const BackstagePass = ({ stats }) => {
  // stats = { totalShows, topArtist, topVenue, dominantGenre, level }
  return (
    <div className="pass-float" style={{
      width: '240px',
      height: '380px',
      background: '#111',
      border: `2px solid ${C.teal}`,
      borderRadius: '12px',
      display: 'flex',
      flexDirection: 'column',
      padding: '0',
      position: 'relative',
      boxShadow: `0 0 40px ${hexToRgba(C.teal, 0.3)}`,
      margin: '40px auto',
      overflow: 'hidden'
    }}>
      {/* Lanyard Hole */}
      <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', width: 40, height: 10, borderRadius: 10, background: '#000', border: '1px solid #333' }} />

      {/* Header Bar */}
      <div style={{ background: C.teal, padding: '25px 10px 10px', textAlign: 'center' }}>
        <div style={{ fontFamily: "'Space Mono'", fontSize: '10px', color: '#000', fontWeight: '900', letterSpacing: 2 }}>
          ACCESS ALL AREAS
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#222', border: `2px dashed ${C.teal}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 15, fontSize: '2rem' }}>
          🎫
        </div>
        
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.8rem', color: '#fff', textAlign: 'center', lineHeight: 1, marginBottom: 5 }}>
          CONCERT ARCHIVIST
        </div>
        <div style={{ fontFamily: "'Space Mono'", fontSize: '8px', color: C.teal, textTransform: 'uppercase', marginBottom: 20 }}>
          {stats.dominantGenre} SPECIALIST
        </div>

        <div style={{ width: '100%', borderTop: '1px solid #333', paddingTop: 15 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: '8px', color: '#666', fontFamily: "'Space Mono'" }}>TOTAL SETS</span>
            <span style={{ fontSize: '12px', color: '#fff', fontWeight: 'bold' }}>{stats.totalShows}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: '8px', color: '#666', fontFamily: "'Space Mono'" }}>TOP ARTIST</span>
            <span style={{ fontSize: '10px', color: '#fff' }}>{stats.topArtist}</span>
          </div>
        </div>
      </div>

      {/* Footer Barcode */}
      <div style={{ background: '#fff', height: '60px', padding: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', gap: '2px', height: '30px' }}>
          {[1,3,1,4,2,6,1,2,5,1,3].map((w, i) => <div key={i} style={{ width: w, background: '#000' }} />)}
        </div>
        <div style={{ fontSize: '8px', color: '#000', fontFamily: "'Space Mono'", marginTop: 5 }}>
          ID: {stats.totalShows}-{stats.topArtist.substring(0,3).toUpperCase()}
        </div>
      </div>
    </div>
  );
};

// ─── THEMES ───────────────────────────────────────────────────────────────────
const THEMES = {
  'neon-noir': {
    name: 'Neon Noir',
    dot: '#00e5cc',
    bg:'#0a0a0f', bgCard:'#111118', bgCardAlt:'#16161f',
    teal:'#00e5cc', tealDim:'#00b5a0', tealGlow:'rgba(0,229,204,0.15)', tealFaint:'rgba(0,229,204,0.07)',
    cyan:'#00cfff', white:'#f0f4f8', gray:'#8899aa', grayDim:'#445566',
    border:'#1e2a38', borderLit:'#00e5cc44', red:'#ff4466', green:'#00cc88', gold:'#ffcc00', purple:'#9966ff',
  },
  'vintage-wax': {
    name: 'Vintage Wax',
    dot: '#c8873a',
    bg:'#1a1008', bgCard:'#231608', bgCardAlt:'#2c1e0d',
    teal:'#c8873a', tealDim:'#a06828', tealGlow:'rgba(200,135,58,0.15)', tealFaint:'rgba(200,135,58,0.07)',
    cyan:'#e8a855', white:'#f5ead8', gray:'#9a8060', grayDim:'#5a4030',
    border:'#3a2810', borderLit:'#c8873a44', red:'#cc3322', green:'#7a9a40', gold:'#e8b840', purple:'#8855aa',
  },
  'midnight-blue': {
    name: 'Midnight Blue',
    dot: '#4488ff',
    bg:'#040818', bgCard:'#080f28', bgCardAlt:'#0c1535',
    teal:'#4488ff', tealDim:'#3366cc', tealGlow:'rgba(68,136,255,0.15)', tealFaint:'rgba(68,136,255,0.07)',
    cyan:'#88ccff', white:'#e8f0ff', gray:'#6688aa', grayDim:'#334466',
    border:'#1a2a4a', borderLit:'#4488ff44', red:'#ff4455', green:'#44aacc', gold:'#aaccff', purple:'#8866ee',
  },
  'desert-sun': {
    name: 'Desert Sun',
    dot: '#ff7733',
    bg:'#130a00', bgCard:'#1e1005', bgCardAlt:'#28160a',
    teal:'#ff7733', tealDim:'#cc5522', tealGlow:'rgba(255,119,51,0.15)', tealFaint:'rgba(255,119,51,0.07)',
    cyan:'#ffaa55', white:'#fff0e0', gray:'#aa7755', grayDim:'#5a3520',
    border:'#3a1a08', borderLit:'#ff773344', red:'#ff3322', green:'#88aa33', gold:'#ffcc44', purple:'#cc6633',
  },
  'monochrome': {
    name: 'Monochrome',
    dot: '#ffffff',
    bg:'#080808', bgCard:'#111111', bgCardAlt:'#1a1a1a',
    teal:'#ffffff', tealDim:'#bbbbbb', tealGlow:'rgba(255,255,255,0.1)', tealFaint:'rgba(255,255,255,0.05)',
    cyan:'#dddddd', white:'#ffffff', gray:'#777777', grayDim:'#444444',
    border:'#2a2a2a', borderLit:'#ffffff33', red:'#ff4444', green:'#aaaaaa', gold:'#ffffff', purple:'#aaaaaa',
  },
};



const THEME_ORDER = ['neon-noir','vintage-wax','midnight-blue','desert-sun','monochrome'];

// Global mutable C — updated by theme switcher, read by all components
let C = { ...THEMES['neon-noir'] };

// --- NEW: AUTH & THEME CONTEXTS ---

// 1. User Context (The Brain)
const UserContext = React.createContext({
  user: null,
  session: null,
  isAdmin: false,
  loading: true
});
const useUser = () => React.useContext(UserContext);

// 2. Theme Context
const ThemeContext = React.createContext({ themeId:'neon-noir', setThemeId:()=>{} });
const useTheme = () => React.useContext(ThemeContext);

// --- SETTINGS ---
const HALL_OF_FAME_MIN = 6;
const PER_PAGE = 40;

// ─── GENRE CONFIG ─────────────────────────────────────────────────────────────
const GENRES = ['Indie Rock','Alternative','Experimental','Electronic','Jam','Folk','Classic Rock','Pop','Hip Hop','Punk','R&B','Country','Metal','Other'];
const GENRE_COLORS = {
  'Indie Rock':'#00f2ff','Alternative':'#9d00ff','Experimental':'#ff00ff',
  'Electronic':'#ff0077','Jam':'#ffcc00','Folk':'#ffaa00','Classic Rock':'#ff4400',
  'Pop':'#00e5ff','Hip Hop':'#a2ff00','Punk':'#ff3300','R&B':'#ff66cc',
  'Country':'#cc8800','Metal':'#888888','Other':'#334455',
};

function buildGenreMap(concerts) {
  const m = {};
  concerts.forEach(c => {
    if (c.genre && Array.isArray(c.bands)) {
      c.bands.forEach(b => { if (b && !m[b]) m[b] = c.genre; });
    }
  });
  return m;
}

function getConcertGenreInfo(concert, genreMap) {
  const bands = Array.isArray(concert.bands) ? concert.bands : [];
  if (concert.genre) return { genre: concert.genre, color: GENRE_COLORS[concert.genre] || GENRE_COLORS['Other'], mixed: false };
  const genres = [...new Set(bands.map(b => {
    const name = getBandName(b);
    return b?.genre || genreMap[name] || null;
  }).filter(Boolean))];
  if (!genres.length) return { genre: null, color: GENRE_COLORS['Other'], mixed: false };
  if (genres.length === 1) return { genre: genres[0], color: GENRE_COLORS[genres[0]] || GENRE_COLORS['Other'], mixed: false };
  return { genre: 'Mixed', color: null, mixed: true, genres };
}

const GenreBadge = ({ genre, color, mixed, small = false }) => {
  if (!genre) return null;
  const sz = small ? { fontSize: 7, padding: '1px 5px' } : { fontSize: 8, padding: '2px 7px' };
  if (mixed) return (
    <span style={{ ...sz, display: 'inline-block', borderRadius: 3, fontFamily: "'Space Mono',monospace", letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, color: '#fff', background: 'linear-gradient(90deg,#00f2ff,#9d00ff,#ff00ff,#ff0077,#ffcc00,#ffaa00)' }}>MIXED</span>
  );
  const col = color || GENRE_COLORS[genre] || GENRE_COLORS['Other'];
  return <span style={{ ...sz, display: 'inline-block', borderRadius: 3, fontFamily: "'Space Mono',monospace", letterSpacing: '0.08em', textTransform: 'uppercase', color: col, background: hexToRgba(col, 0.12), border: `1px solid ${hexToRgba(col, 0.4)}` }}>{genre}</span>;
};

// ─── DATE HELPERS ─────────────────────────────────────────────────────────────
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const fmtDate = d => { if (!d) return '—'; const dt = new Date(d + 'T12:00:00'); return `${MONTHS[dt.getMonth()]} ${dt.getDate()}, ${dt.getFullYear()}`; };
const fmtDateShort = d => { if (!d) return '—'; const dt = new Date(d + 'T12:00:00'); return `${MONTHS_SHORT[dt.getMonth()]} ${dt.getDate()}, ${dt.getFullYear()}`; };
const getYear = d => d ? new Date(d + 'T12:00:00').getFullYear() : null;
const daysSince = d => { if (!d) return 0; return Math.floor((Date.now() - new Date(d + 'T12:00:00')) / 86400000); };
// Helper to generate the exact setlist.fm search link
// Optimized helper for setlist.fm search precision
// 🎯 The "Bullseye" Search Helper (Band + MM/DD/YYYY)
// 🎯 The "Bullseye" Search Helper (Band + MM/DD/YYYY)
  const getSetlistFmUrl = (artist, date) => {
    if (!artist || !date) return "#";
    // Convert "2025-10-17" -> ["2025", "10", "17"]
    const [year, month, day] = date.split('-');
    // Create string: "Lord Huron 10/17/2025"
    const searchString = `${artist} ${month}/${day}/${year}`;
    return `https://www.setlist.fm/search?query=${encodeURIComponent(searchString)}`;
  };

// ─── MASTER LANYARD ───────────────────────────────────────────────────────────
// ─── MASTER LANYARD ───────────────────────────────────────────────────────────
function MasterLanyard({ concerts, artistGenres, genreStats }) {
  const [hovered, setHovered] = useState(false);
  const totalShows = concerts.length;
  const festDays = concerts.filter(c => c.is_festival).length;
  const festPct = totalShows ? Math.round((festDays / totalShows) * 100) : 0;

  const getRank = (n) => {
    if (n <= 5) return 'GATE CRASHER';
    if (n <= 15) return 'BARRICADE REGULAR';
    if (n <= 30) return 'SOUNDBOARD SHADOW';
    if (n <= 50) return 'TOUR BUS TAILGATER';
    if (n <= 75) return 'BACKSTAGE REGULAR';
    if (n <= 100) return 'ALL-ACCESS AUTHORITY';
    if (n <= 150) return 'FLOOR SECTION LEGEND';
    if (n <= 200) return 'PRODUCTION INSIDER';
    if (n <= 300) return 'THE CIRCUIT RIDER';
    if (n <= 500) return 'THE LIVING ARCHIVE';
    return 'CONCERT IMMORTAL';
  };

  const getArchetype = () => {
    const ac = {};
    concerts.forEach(c => (c.bands || []).forEach(b => { if (b) ac[b] = (ac[b] || 0) + 1; }));
    const top = Object.entries(ac).sort((a, b) => b[1] - a[1])[0];
    if (top && top[1] >= 10) return `${top[0].split(' ')[0].toUpperCase()} SUPERFAN`;
    if (festPct >= 50) return 'FESTIVAL OWL';
    if (festPct <= 10) return 'CLUB RAT';
    if (festPct >= 30) return 'FESTIVAL PILGRIM';
    return 'STADIUM SPECIALIST';
  };

  const getColor = () => {
    const topGenre = genreStats?.[0]?.name;
    const map = {
      'Indie Rock': '#00f2ff',
      'Alternative': '#9d00ff',
      'Experimental': '#ff00ff',
      'Electronic': '#9900ff',
      'Jam': '#ffcc00',
      'Folk': '#ffaa00',
      'Classic Rock': '#ff4400',
      'Pop': '#00e5ff',
      'Hip Hop': '#a2ff00',
      'Punk': '#ff3300',
      'R&B': '#ff66cc',
      'Country': '#cc8800',
      'Metal': '#888888',
    };
    return map[topGenre] || '#00e5cc';
  };

  const getSerial = () => {
    const first = [...concerts].sort((a, b) => a.date.localeCompare(b.date))[0];
    const firstYear = first ? new Date(first.date + 'T12:00:00').getFullYear() : '????';
    const city = (first?.city || 'XXX').slice(0, 3).toUpperCase();
    return `${city}-${String(totalShows).padStart(3,'0')}-${firstYear}`;
  };

  if (!totalShows) return null;

  const color = getColor();
  const rank = getRank(totalShows);
  const archetype = getArchetype();
  const serial = getSerial();
  const badgeWidth = 120;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 32,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        transform: hovered ? 'translateY(0px)' : 'translateY(-272px)',
        transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        cursor: 'pointer',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Lanyard strap */}
      <div style={{
        width: 10,
        height: 80,
        background: `linear-gradient(180deg, ${color} 0%, ${hexToRgba(color, 0.6)} 100%)`,
        borderRadius: '0 0 3px 3px',
        boxShadow: `0 0 8px ${hexToRgba(color, 0.4)}`,
        flexShrink: 0,
      }} />

      {/* Metal clip */}
      <div style={{
        width: 18,
        height: 8,
        background: 'linear-gradient(180deg, #d0d0d0 0%, #888 100%)',
        borderRadius: 2,
        border: '1px solid #555',
        boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
        flexShrink: 0,
        marginTop: -1,
      }} />

      {/* Hole punch */}
      <div style={{
        width: 14,
        height: 14,
        borderRadius: '50%',
        background: '#050508',
        border: `2px solid ${hexToRgba(color, 0.4)}`,
        boxShadow: `inset 0 1px 3px rgba(0,0,0,0.8), 0 0 6px ${hexToRgba(color, 0.3)}`,
        flexShrink: 0,
        marginTop: 4,
        zIndex: 2,
      }} />

      {/* Badge body */}
      <div style={{
        width: badgeWidth,
        background: 'linear-gradient(160deg, #1a1a2e 0%, #0d0d1a 60%, #111128 100%)',
        border: `1.5px solid ${hexToRgba(color, 0.6)}`,
        borderRadius: 10,
        overflow: 'hidden',
        boxShadow: `0 0 30px ${hexToRgba(color, 0.4)}, 0 8px 32px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1)`,
        position: 'relative',
        marginTop: -2,
      }}>
        {/* Plastic sheen overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 50%, rgba(255,255,255,0.02) 100%)',
          pointerEvents: 'none',
          zIndex: 10,
          borderRadius: 10,
        }} />

        {/* Color header bar */}
        <div style={{
          background: `linear-gradient(90deg, ${color}, ${hexToRgba(color, 0.6)})`,
          padding: '6px 8px',
          textAlign: 'center',
          boxShadow: `0 0 12px ${hexToRgba(color, 0.5)}`,
        }}>
          <div style={{
            fontFamily: "'Space Mono'",
            fontSize: 7,
            color: '#000',
            fontWeight: 900,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
          }}>
            ACCESS ALL AREAS
          </div>
        </div>

        {/* Badge content */}
        <div style={{ padding: '10px 10px 8px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          {/* Icon */}
          <div style={{ fontSize: '1.8rem', marginBottom: 6, filter: `drop-shadow(0 0 6px ${hexToRgba(color, 0.6)})` }}>🎫</div>

          {/* Rank title */}
          <div style={{
            fontFamily: "'Bebas Neue'",
            fontSize: '0.9rem',
            color: color,
            letterSpacing: '0.05em',
            lineHeight: 1.1,
            marginBottom: 3,
            textShadow: `0 0 10px ${hexToRgba(color, 0.7)}`,
          }}>
            {rank}
          </div>

          {/* Archetype */}
          <div style={{
            fontFamily: "'Space Mono'",
            fontSize: 6,
            color: hexToRgba(color, 0.6),
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: 10,
            lineHeight: 1.4,
          }}>
            {archetype}
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${color}55, transparent)`, marginBottom: 8 }} />

          {/* Stats row */}
          <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 10 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.2rem', color: color, lineHeight: 1 }}>{totalShows}</div>
              <div style={{ fontFamily: "'Space Mono'", fontSize: 5, color: hexToRgba(color, 0.4), letterSpacing: '0.1em', textTransform: 'uppercase' }}>shows</div>
            </div>
            <div style={{ width: 1, background: `${color}33` }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.2rem', color: color, lineHeight: 1 }}>{festDays}</div>
              <div style={{ fontFamily: "'Space Mono'", fontSize: 5, color: hexToRgba(color, 0.4), letterSpacing: '0.1em', textTransform: 'uppercase' }}>fests</div>
            </div>
            <div style={{ width: 1, background: `${color}33` }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.2rem', color: color, lineHeight: 1 }}>{festPct}%</div>
              <div style={{ fontFamily: "'Space Mono'", fontSize: 5, color: hexToRgba(color, 0.4), letterSpacing: '0.1em', textTransform: 'uppercase' }}>ratio</div>
            </div>
          </div>

          {/* Barcode */}
          <div style={{ display: 'flex', gap: '1.5px', justifyContent: 'center', marginBottom: 4 }}>
            {[2,1,3,1,2,4,1,2,1,3,1,2,1,3,2,1].map((w, i) => (
              <div key={i} style={{ width: w, height: 20, background: color, opacity: 0.7 }} />
            ))}
          </div>

          {/* Serial */}
          <div style={{
            fontFamily: "'Space Mono'",
            fontSize: 5.5,
            color: hexToRgba(color, 0.45),
            letterSpacing: '0.08em',
            marginTop: 3,
          }}>
            {serial}
          </div>
        </div>
      </div>

      {/* Peek tab — always visible at top when collapsed */}
      {!hovered && (
        <div style={{
          position: 'absolute',
          bottom: -1,
          left: '50%',
          transform: 'translateX(-50%)',
          background: color,
          borderRadius: '0 0 6px 6px',
          padding: '3px 12px',
          fontFamily: "'Space Mono'",
          fontSize: 6,
          color: '#000',
          fontWeight: 900,
          letterSpacing: '0.15em',
          whiteSpace: 'nowrap',
          boxShadow: `0 4px 12px ${hexToRgba(color, 0.5)}`,
        }}>
          ▼ ID
        </div>
      )}
    </div>
  );
}
// ─── STYLES (PHYSICAL ARCHIVE & STABILIZED EDITION) ───────────────────────────
const MarqueeStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Monoton&family=Bebas+Neue&family=Space+Mono&family=Caveat:wght@600;700&family=UnifrakturMaguntia&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400..700&display=swap');

    body {
      background-color: #050508;
      background-image: 
        linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%),
        linear-gradient(90deg, rgba(255, 0, 0, 0.02), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.02)),
        radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 0);
      background-size: 100% 4px, 3px 100%, 32px 32px;
      background-attachment: fixed;
    }

    body::before {
      content: "";
      position: fixed;
      top: -10%; left: -10%; width: 50%; height: 50%;
      background: radial-gradient(circle, rgba(0, 229, 204, 0.07) 0%, transparent 70%);
      pointer-events: none; z-index: -1;
    }

    .card-texture {
      background-image: radial-gradient(circle at 2px 2px, rgba(255,255,255,0.03) 1px, transparent 0);
      background-size: 8px 8px;
    }

    .big-watermark {
      position: absolute;
      bottom: -15px;
      right: -10px;
      font-family: 'Bebas Neue', sans-serif;
      font-size: 10rem;
      color: rgba(255, 255, 255, 0.12);
      line-height: 0.8;
      pointer-events: none;
      z-index: 0;
      letter-spacing: -0.05em;
    }

    /* ─── ANIMATION KEYFRAMES ─── */

    /* 1. Scrolling Motion */
    @keyframes ticker-scroll {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }

    @keyframes marquee {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }

    /* 2. Theater Lighting */
    @keyframes chasing-bulb {
      0%, 100% { opacity: 0.3; transform: scale(0.8); filter: brightness(0.7); }
      50% { opacity: 1; transform: scale(1.1); filter: brightness(1.3); }
    }

    @keyframes flicker {
      0%, 98%, 100% { opacity: 1; }
      99% { opacity: 0.9; }
    }

    /* 3. Record Player */
    @keyframes spin-record {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    /* 4. Stage & Atmosphere */
    @keyframes beam-sweep {
      0%, 100% { transform: rotate(-10deg); opacity: 0.3; }
      50% { transform: rotate(10deg); opacity: 0.7; }
    }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-6px); }
    }

    @keyframes ferris-rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    /* 5. Transitions */
    @keyframes fade-in-kf {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes peel-and-stick {
      0% { transform: translateY(20px) scale(1.1) rotate(-5deg); opacity: 0; filter: blur(4px); }
      60% { transform: translateY(-2px) scale(1) rotate(2deg); opacity: 1; filter: blur(0); }
      100% { transform: translateY(0) scale(1) rotate(var(--r, 0deg)); opacity: 1; }
    }

    /* 6. POLAROID PHYSICS (Glitch-Free "Living" Gallery) */

    /* 6. POLAROID PHYSICS (Glitch-Killer & Tightened) */

    @keyframes pinDropAndSettle {
      0% { transform: translateY(-80px) rotate(15deg); opacity: 0; }
      60% { transform: translateY(10px) rotate(calc(var(--rotation) * -0.8)); }
      100% { transform: translateY(0) rotate(var(--rotation)); opacity: 1; }
    }

    @keyframes heavySway {
      0%, 100% { transform: scale(1.03) rotate(calc(var(--rotation) - 2deg)); }
      50% { transform: scale(1.03) rotate(calc(var(--rotation) + 2deg)); }
    }

    .polaroid-hitbox {
      position: relative;
      width: 320px;
      height: 440px; /* Reduced height to match tightened photo */
      display: flex;
      justify-content: center;
      align-items: flex-start;
      cursor: zoom-in;
      z-index: 10;
      pointer-events: auto; /* The hitbox is the only thing that sees the mouse */
    }

    .polaroid-gravity-swing {
      transform-origin: top center !important;
      transform: rotate(var(--rotation));
      animation: pinDropAndSettle 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) backwards;
      will-change: transform;
      position: relative;
      pointer-events: none; /* 🟢 CRITICAL: The photo is "ghostly" so it won't flicker the hover */
    }

    /* Stable Hover Trigger */
    .polaroid-hitbox:hover .polaroid-gravity-swing {
      animation: heavySway 3s ease-in-out infinite !important;
    }

    .polaroid-hitbox:hover {
      z-index: 2000 !important;
    }

    .tack-shine {
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at 30% 30%, #fff, transparent 60%);
      opacity: 0.6;
      border-radius: 50%;
    }

    .polaroid-frame {
      position: relative;
    }

    .polaroid-frame::after {
      content: "";
      position: absolute;
      bottom: 12px;
      right: 8px;
      width: 60%;
      height: 15%;
      background: transparent;
      box-shadow: 0 15px 15px rgba(0,0,0,0.7); 
      transform: rotate(4deg);
      z-index: -1;
    }

    /* ─── CSS CLASSES ─── */

    .marquee-text {
      display: inline-block;
      animation: marquee 60s linear infinite;
    }

    .marquee-flicker {
      animation: flicker 6s infinite;
    }

    .record-vinyl-spinning { 
      animation: spin-record 4s linear infinite; 
      transform-origin: center center;
    }

    .crate-sleeve { 
      cursor: pointer; 
      transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), background 0.2s, filter 0.2s; 
      will-change: transform;
    }
    .crate-sleeve:hover { transform: translateY(-5px) !important; filter: brightness(1.2); }

    .stage-light {
      animation: beam-sweep 3s ease-in-out infinite;
      transform-origin: top center;
    }

    .wristband-bin::-webkit-scrollbar { width: 4px; }
    .wristband-bin::-webkit-scrollbar-track { background: transparent; }
    .wristband-bin::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }

    .pass-float { animation: float 3s ease-in-out infinite; }
    .fade-in { animation: fade-in-kf 0.4s ease both; }
    .ferris-wheel-ring { animation: ferris-rotate 20s linear infinite; transform-origin: center center; }

    .scrap-paper {
      background-image: 
        repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(0,0,0,0.01) 20px, rgba(0,0,0,0.01) 21px),
        linear-gradient(160deg, #f5f0e8 0%, #e8e0cc 100%) !important;
      border-radius: 2px 5px 3px 6px / 4px 2px 5px 3px !important;
      filter: contrast(1.05) sepia(0.15);
      position: relative;
    }

    .tab-active::after { 
      content: ''; position: absolute; bottom: 0; left: 15%; right: 15%; height: 2px; 
      background: #00e5cc; 
      box-shadow: 0 0 10px #00e5cc;
    }

    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
    ::-webkit-scrollbar-thumb:hover { background: #444; }
    @media (max-width: 768px) {
      body { font-size: 14px; }
      .card-texture { border-radius: 12px !important; border-width: 1px !important; }
      h1 { font-size: 1.8rem !important; }
      /* Hide scrollbars on mobile for cleaner look */
      .wristband-bin::-webkit-scrollbar { display: none; }
    }
    
    @keyframes pulse {
      0% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.2); opacity: 0.7; }
      100% { transform: scale(1); opacity: 1; }
    }
  `}</style>
);
// ─── SHARED ATOMS ─────────────────────────────────────────────────────────────
// ─── THE SETLIST DNA (IDEA #2) ───────────────────────────────────────────────
const SetlistDNA = ({ genreScores }) => {
  // genreScores = { Rock: 80, Indie: 90, Pop: 30, Electronic: 50, Experimental: 70 }
  
  const labels = Object.keys(genreScores);
  const values = Object.values(genreScores);
  const center = 100;
  const radius = 80;

  // Math for the Radar Points: 
  // We convert the 0-100 scores into X/Y coordinates on a circle
  const points = values.map((val, i) => {
    const angle = (Math.PI * 2 * i) / labels.length - Math.PI / 2;
    const r = (val / 100) * radius;
    return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
  }).join(' ');

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <div style={{ fontFamily: "'Space Mono'", fontSize: 10, color: C.teal, marginBottom: 20 }}>GENRE DNA PROFILE</div>
      <svg width="200" height="200" viewBox="0 0 200 200" style={{ filter: `drop-shadow(0 0 10px ${hexToRgba(C.teal, 0.4)})` }}>
        {/* Background Hexagon Rings */}
        {[0.2, 0.4, 0.6, 0.8, 1].map(scale => (
          <polygon
            key={scale}
            points={labels.map((_, i) => {
              const angle = (Math.PI * 2 * i) / labels.length - Math.PI / 2;
              return `${center + (radius * scale) * Math.cos(angle)},${center + (radius * scale) * Math.sin(angle)}`;
            }).join(' ')}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="1"
          />
        ))}
        
        {/* The DNA Shape */}
        <polygon
          points={points}
          fill={hexToRgba(C.teal, 0.3)}
          stroke={C.teal}
          strokeWidth="2"
        />
        
        {/* Axis Labels */}
        {labels.map((label, i) => {
          const angle = (Math.PI * 2 * i) / labels.length - Math.PI / 2;
          const x = center + (radius + 15) * Math.cos(angle);
          const y = center + (radius + 15) * Math.sin(angle);
          return (
            <text key={label} x={x} y={y} fill={C.gray} fontSize="8" fontFamily="'Space Mono'" textAnchor="middle" dominantBaseline="middle">
              {label.toUpperCase()}
            </text>
          );
        })}
      </svg>
    </div>
  );
};

const Badge = ({ children, color = C.teal, bg = C.tealFaint }) => (
  <span style={{ display:'inline-block', fontFamily:"'Space Mono',monospace", fontSize:9, letterSpacing:'0.1em', textTransform:'uppercase', color, background:bg, border:`1px solid ${color}44`, padding:'2px 6px', borderRadius:3 }}>{children}</span>
);

const NEON_BORDERS = [
  { border:C.teal, glow:'rgba(0,229,204,0.18)' }, { border:C.cyan, glow:'rgba(0,207,255,0.18)' },
  { border:C.purple, glow:'rgba(153,102,255,0.18)' }, { border:C.gold, glow:'rgba(255,204,0,0.18)' },
  { border:C.green, glow:'rgba(0,204,136,0.18)' }, { border:'#ff6699', glow:'rgba(255,102,153,0.18)' },
];
let _cardIdx = 0;

const Card = ({ children, style = {}, glow = false, neon = false, genreColor = null, onClick }) => {
  const nb = neon && !genreColor ? NEON_BORDERS[_cardIdx++ % NEON_BORDERS.length] : null;
  const bc = genreColor || (glow ? C.teal : neon ? nb.border : C.border);
  const gc = genreColor ? hexToRgba(genreColor, 0.2) : glow ? C.tealGlow : neon ? nb?.glow : null;
  return (
    <div onClick={onClick} style={{ background: genreColor ? `linear-gradient(135deg,${C.bgCard},${hexToRgba(genreColor,0.07)})` : C.bgCard, border:`1px solid ${bc}`, borderRadius:8, padding:16, cursor:onClick?'pointer':'default', boxShadow:gc?`0 0 16px ${gc},0 2px 8px rgba(0,0,0,0.4)`:'0 2px 8px rgba(0,0,0,0.4)', ...style }}>{children}</div>
  );
};

const CardTitle = ({ children, style = {} }) => (
  <div style={{ fontFamily:"'Space Mono',monospace", fontSize:9, letterSpacing:'0.25em', textTransform:'uppercase', color:C.tealDim, marginBottom:12, paddingBottom:8, borderBottom:`1px solid ${C.border}`, ...style }}>{children}</div>
);

const Btn = ({ children, onClick, variant = 'primary', style = {}, disabled = false }) => {
  const V = { 
    primary: { background: C.teal, color: C.bg }, 
    secondary: { background: C.bgCardAlt, color: C.gray, border: `1px solid ${C.border}` }, 
    danger: { background: C.red + '22', color: C.red, border: `1px solid ${C.red}44` }, 
    ghost: { background: 'transparent', color: C.teal, border: `1px solid ${C.borderLit}` } 
  };
  return (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      style={{ 
        fontFamily: "'Space Mono',monospace", 
        fontSize: 10, 
        letterSpacing: '0.12em', 
        textTransform: 'uppercase', 
        border: 'none', 
        borderRadius: 4, 
        padding: '8px 16px', 
        cursor: disabled ? 'not-allowed' : 'pointer', 
        opacity: disabled ? 0.5 : 1, 
        transition: 'all 0.15s', 
        ...V[variant], 
        ...style 
      }}
    >
      {children}
    </button>
  );
};
// ─── COUNT-UP STAT ─────────────────────────────────────────────────────────────
function CountUpStat({ value, label, sub, color = C.white }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    let start = 0;
    const end = Number(String(value).replace(/,/g,''));
    if (!end) return;
    const duration = 1200;
    const step = Math.ceil(end / (duration / 16));
    const timer = setInterval(() => {
      start = Math.min(start + step, end);
      setDisplay(start);
      if (start >= end) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [value]);
  return (
    <div ref={ref} style={{ padding:'20px 24px', borderRight:`1px solid ${C.border}`, textAlign:'center' }}>
      <div style={{ fontFamily:"'Bebas Neue'", fontSize:'clamp(2rem,4vw,3rem)', color, lineHeight:1, animation:'count-up 0.6s ease both' }}>{display.toLocaleString()}</div>
      <div style={{ fontFamily:"'Space Mono',monospace", fontSize:8, letterSpacing:'0.2em', textTransform:'uppercase', color:C.tealDim, margin:'6px 0 3px' }}>{label}</div>
      <div style={{ fontFamily:"'Space Mono',monospace", fontSize:7, color:C.grayDim, fontStyle:'italic' }}>{sub}</div>
    </div>
  );
}
//Theater Marquee
function TheaterMarquee({ upcoming, onAdd, onEdit }) {
  const BULB_COUNT = 28;
  const text = upcoming.length
    ? upcoming.map(s => `NOW STAGING: ${s.artist.toUpperCase()} • ${fmtDateShort(s.date).toUpperCase()} • ${(s.venue||'TBA').toUpperCase()} • ${(s.status||'TICKETS').toUpperCase()}`).join('   ★   ')
    : 'LOUD & LIVE • ALL AGES • GIG POSTER INBOUND • TONIGHT ONLY • SOLD OUT • NOW STAGING YOUR NEXT MEMORY';

  return (
    <div style={{ background:'#0a0a0a', borderRadius:8, overflow:'hidden', boxShadow:'0 0 0 4px #111, 0 0 0 6px #222, 0 8px 32px rgba(0,0,0,0.8)' }}>
      {/* Top bulb rail */}
      <div style={{ background:'#111', padding:'6px 12px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        {Array.from({ length: BULB_COUNT }).map((_, i) => (
          <div key={i} style={{ width:8, height:8, borderRadius:'50%', background:'#ffdd88', boxShadow:'0 0 6px #ffdd88, 0 0 12px #ffaa00', animation:`chasing-bulb 1.5s ease-in-out ${(i * 1.5/BULB_COUNT).toFixed(2)}s infinite` }} />
        ))}
      </div>

      {/* Marquee body */}
      <div style={{ background:'#fdfdfd', borderTop:'3px solid #111', borderBottom:'3px solid #111', padding:'10px 0', overflow:'hidden', position:'relative' }} className="marquee-flicker">
        <div className="marquee-text" style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:18, fontWeight:900, letterSpacing:'0.12em', color:'#111', whiteSpace:'nowrap' }}>
          {text} &nbsp;&nbsp;&nbsp;★&nbsp;&nbsp;&nbsp; {text} &nbsp;&nbsp;&nbsp;★&nbsp;&nbsp;&nbsp;
        </div>
      </div>

      {/* Bottom bulb rail */}
      <div style={{ background:'#111', padding:'6px 12px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        {Array.from({ length: BULB_COUNT }).map((_, i) => (
          <div key={i} style={{ width:8, height:8, borderRadius:'50%', background:'#ffdd88', boxShadow:'0 0 6px #ffdd88, 0 0 12px #ffaa00', animation:`chasing-bulb 1.5s ease-in-out ${((BULB_COUNT - i) * 1.5/BULB_COUNT).toFixed(2)}s infinite` }} />
        ))}
      </div>

      {/* Show list */}
      <div style={{ padding:'12px 16px' }}>
        <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:10 }}>
          <button onClick={onAdd} style={{ background:C.gold, color:'#000', border:'none', fontSize:9, fontWeight:'900', padding:'6px 14px', cursor:'pointer', borderRadius:4, fontFamily:"'Space Mono'", letterSpacing:'0.1em' }}>+ ADD SHOW</button>
        </div>
        <div style={{ maxHeight:190, overflowY:'auto' }}>
          {upcoming.sort((a,b) => a.date.localeCompare(b.date)).map((show, i) => (
            <div key={show.id||i} style={{ display:'grid', gridTemplateColumns:'auto 1fr auto auto', alignItems:'center', gap:12, padding:'10px 0', borderBottom:'1px solid #1a1a1a' }}>
              <div style={{ fontFamily:"'Space Mono'", fontSize:9, color:'#888', whiteSpace:'nowrap' }}>{fmtDateShort(show.date)}</div>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontFamily:"'Bebas Neue'", fontSize:'1.15rem', color:C.gold, letterSpacing:'0.06em', lineHeight:1 }}>{show.artist}</div>
                {show.venue && <div style={{ fontFamily:"'Space Mono'", fontSize:7, color:'#555', marginTop:1 }}>{show.venue}</div>}
              </div>
              <span style={{ fontFamily:"'Space Mono'", fontSize:7, color:C.gold, background:'rgba(255,204,0,0.12)', border:'1px solid rgba(255,204,0,0.3)', padding:'2px 6px', borderRadius:3, whiteSpace:'nowrap' }}>
                {show.status || 'TICKETS'}
              </span>
              <button
                onClick={() => onEdit(show)}
                style={{ background:'none', border:'1px solid #333', color:'#888', cursor:'pointer', fontSize:9, borderRadius:3, padding:'3px 8px', fontFamily:"'Space Mono'", transition:'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.color = C.gold; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.color = '#888'; }}
              >
                EDIT
              </button>
            </div>
          ))}
          {!upcoming.length && <div style={{ color:'#333', fontFamily:"'Space Mono'", fontSize:9, textAlign:'center', padding:20 }}>NO SHOWS QUEUED</div>}
        </div>
      </div>
    </div>
  );
}
// ─── FERRIS WHEEL ─────────────────────────────────────────────────────────────
function FerrisWheel({ size = 120 }) {
  const cx = size / 2, cy = size / 2, R = size * 0.38, r = size * 0.06;
  const spokes = 8;
  const gondolas = Array.from({ length: spokes }, (_, i) => {
    const angle = (i / spokes) * 2 * Math.PI;
    return { x: cx + R * Math.cos(angle), y: cy + R * Math.sin(angle), i };
  });
  const COLORS = [C.teal, C.cyan, C.purple, C.gold, C.green, '#ff6699', C.red, C.teal];
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ filter:`drop-shadow(0 0 8px ${C.teal}44)` }}>
      {/* Outer ring */}
      <circle cx={cx} cy={cy} r={R} fill="none" stroke={C.teal} strokeWidth={1.5} strokeDasharray="4 3" opacity={0.5} />
      {/* Spinning group */}
      <g className="ferris-wheel-ring">
        {/* Spokes */}
        {gondolas.map(g => <line key={g.i} x1={cx} y1={cy} x2={g.x} y2={g.y} stroke={C.teal} strokeWidth={0.8} opacity={0.4} />)}
        {/* Gondolas */}
        {gondolas.map(g => (
          <g key={g.i}>
            <rect x={g.x - r*0.7} y={g.y - r*0.5} width={r*1.4} height={r*1.2} rx={2} fill={COLORS[g.i % COLORS.length]} opacity={0.8} />
            <circle cx={g.x} cy={g.y - r*0.5} r={1.5} fill={C.white} opacity={0.9} />
          </g>
        ))}
        {/* Inner ring */}
        <circle cx={cx} cy={cy} r={R*0.25} fill="none" stroke={C.gold} strokeWidth={1.5} opacity={0.6} />
      </g>
      {/* Hub */}
      <circle cx={cx} cy={cy} r={5} fill={C.gold} />
      <circle cx={cx} cy={cy} r={2.5} fill={C.bg} />
      {/* Support legs */}
      <line x1={cx} y1={cy+R} x2={cx-R*0.4} y2={size*0.98} stroke={C.teal} strokeWidth={2} opacity={0.5} />
      <line x1={cx} y1={cy+R} x2={cx+R*0.4} y2={size*0.98} stroke={C.teal} strokeWidth={2} opacity={0.5} />
    </svg>
  );
}

// ─── NEWS TICKER ──────────────────────────────────────────────────────────────
function NewsTicker({ concerts, artistCounts, genreStats }) {
  const items = useMemo(() => {
    if (concerts.length === 0) return "INITIALIZING LIVE FEED... STAND BY...   ///   INITIALIZING LIVE FEED... STAND BY... ";
    
    const bits = [];
    if (artistCounts[0]) bits.push(`🏆 ALL-TIME LEADER: ${artistCounts[0].name.toUpperCase()} — SEEN ${artistCounts[0].count} TIMES`);
    if (artistCounts[1]) bits.push(`🎸 ${artistCounts[1].name.toUpperCase()} — ${artistCounts[1].count} SHOWS AND COUNTING`);
    if (genreStats[0]) bits.push(`🧬 DOMINANT GENRE: ${genreStats[0].name.toUpperCase()} WITH ${genreStats[0].count} SETS`);
    
    concerts.slice(0,3).forEach(c => {
const bands = Array.isArray(c.bands) ? c.bands.map(b => getBandName(b)).filter(Boolean).join(', ') : (c.artist || 'UNKNOWN');        bits.push(`⚡ RECENTLY ATTENDED: ${bands.toUpperCase()} — ${fmtDateShort(c.date).toUpperCase()}`);
    });

    bits.push(`📍 ${new Set(concerts.map(c=>c.state).filter(Boolean)).size} STATES CONQUERED`);
    bits.push(`🎪 ${new Set(concerts.filter(c=>c.is_festival&&c.festival_name).map(c=>c.festival_name)).size} UNIQUE FESTIVALS`);
    
    const txt = bits.join('   ///   ') + '   ///   ';
    return txt + txt;
  }, [concerts, artistCounts, genreStats]);

  return (
    <div style={{ 
      background: '#000', 
      borderBottom: `1px solid ${hexToRgba(C.teal, 0.3)}`, 
      overflow: 'hidden', 
      width: '100%',
      height: '32px',
      display: 'flex',
      alignItems: 'center',
      zIndex: 10000, // Above absolutely everything
      flexShrink: 0
    }}>
      <div style={{ display: 'flex', alignItems: 'stretch', height: '100%', width: '100%' }}>
        <div style={{ 
          background: C.teal, 
          color: '#000', 
          fontFamily: "'Bebas Neue'", 
          fontSize: '12px', 
          letterSpacing: '2px', 
          padding: '0 15px', 
          display: 'flex', 
          alignItems: 'center', 
          fontWeight: 900,
          boxShadow: `5px 0 15px ${hexToRgba(C.teal, 0.4)}`,
          zIndex: 10
        }}>
          LIVE FEED
        </div>
        <div style={{ overflow: 'hidden', flex: 1, background: `rgba(0,0,0,0.8)`, display: 'flex', alignItems: 'center' }}>
          <div style={{ 
            display: 'inline-block', 
            whiteSpace: 'nowrap', 
            animation: 'ticker-scroll 60s linear infinite', // Speed tuned for global bar
            fontFamily: "'Space Mono', monospace", 
            fontSize: '11px', 
            color: C.teal, 
            paddingLeft: '20px',
            letterSpacing: '1px',
            textShadow: `0 0 8px ${hexToRgba(C.teal, 0.5)}` 
          }}>
            {items}
          </div>
        </div>
      </div>
    </div>
  );
}
// ─── ON THIS DAY ──────────────────────────────────────────────────────────────
function OnThisDay({ concerts }) {
  const today = new Date(), mm = String(today.getMonth()+1).padStart(2,'0'), dd = String(today.getDate()).padStart(2,'0');
  const matches = concerts.filter(c => c.date?.endsWith(`-${mm}-${dd}`)).sort((a,b) => a.date.localeCompare(b.date));
  if (!matches.length) return null;
  const dateLabel = today.toLocaleDateString('en-US', { month:'long', day:'numeric' });
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8, margin:'16px 0' }}>
      <div style={{ fontFamily:"'Space Mono',monospace", fontSize:8, letterSpacing:'0.3em', textTransform:'uppercase', color:C.tealDim }}>📅 On This Day — {dateLabel}</div>
      {matches.map(ev => {
        const bands = (ev.bands||[]).map(b => getBandName(b)).filter(Boolean).join(', ');
        const location = [ev.venue, ev.city, ev.state].filter(Boolean).join(', ');
        const year = getYear(ev.date);
        const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${bands} ${ev.venue||ev.city} ${year} live`)}`;
        return (
          <div key={ev.id} style={{ display:'inline-flex', alignItems:'center', gap:14, background:`linear-gradient(135deg,${C.bgCard},${hexToRgba(C.teal,0.07)})`, border:`1px solid ${C.teal}44`, borderRadius:40, padding:'10px 18px 10px 14px', boxShadow:`0 0 20px ${C.tealGlow}`, animation:'pulse-teal 3s ease-in-out infinite' }}>
            <div style={{ fontFamily:"'Bebas Neue'", fontSize:'1.6rem', color:C.teal, lineHeight:1, flexShrink:0 }}>{year}</div>
            <div style={{ width:1, height:28, background:C.border, flexShrink:0 }} />
            <div style={{ fontFamily:"'Bebas Neue'", fontSize:'1.2rem', letterSpacing:'0.06em', color:C.white, lineHeight:1, flexShrink:0 }}>{bands}</div>
            <div style={{ width:1, height:28, background:C.border, flexShrink:0 }} />
            <div style={{ fontFamily:"'Space Mono',monospace", fontSize:8, color:C.gray, textTransform:'uppercase', letterSpacing:'0.08em', flexShrink:0 }}>{location}</div>
            <a href={ytUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
              style={{ display:'inline-flex', alignItems:'center', gap:5, background:'rgba(255,0,0,0.15)', border:'1px solid rgba(255,0,0,0.35)', borderRadius:20, padding:'4px 10px', textDecoration:'none', fontFamily:"'Space Mono',monospace", fontSize:7, letterSpacing:'0.1em', textTransform:'uppercase', color:'#ff4444', flexShrink:0, transition:'all 0.15s' }}>
              ▶ Search
            </a>
          </div>
        );
      })}
    </div>
  );
}

// ─── SETLIST SPOTLIGHT ATOM (POSTER EDITION) ──────────────────────────
// ─── SETLIST SPOTLIGHT ATOM (RESIZED POSTER EDITION) ──────────────────────────
const SpotlightScrap = ({ data, isTop, TAPE_COLORS }) => {
  if (!data) return null;
  const charCode = data.id?.charCodeAt(data.id.length - 1) || 0;
  const r = isTop ? (charCode % 4) - 3 : (charCode % 4) + 1;
  const tapeColor = TAPE_COLORS[charCode % TAPE_COLORS.length];
  const hasImg = data.image_url && data.image_url.trim() !== "";

  // Helper for the "Notebook Fallback" (to keep things clean)
  const PaperFallback = () => {
    const doodles = ['♪', '✦', '★', '♡', '✌', '⚡', '♫', '◈'];
    const doodle = doodles[charCode % doodles.length];
    return (
      <div className="scrap-paper" style={{ background: 'linear-gradient(160deg,#f5f0e8,#e8e0cc)', padding: '22px 16px 14px', boxShadow: '4px 8px 20px rgba(0,0,0,0.5)', position: 'relative', overflow: 'hidden', minHeight: 115, display: 'flex', flexDirection: 'column', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 3 }}>
        {[0,1,2,3].map(j => <div key={j} style={{ position:'absolute', left:32, right:8, top:44+j*22, height:1, background:'rgba(150,180,220,0.45)' }} />)}
        <div style={{ position: 'absolute', left: 28, top: 0, bottom: 0, width: 1.5, background: 'rgba(220,60,60,0.25)' }} />
        <div style={{ position:'absolute', left:8, top:'40%', width:10, height:10, borderRadius:'50%', background:'rgba(0,0,0,0.08)', boxShadow:'inset 0 1px 2px rgba(0,0,0,0.15)' }} />
        <div style={{ position:'absolute', bottom:8, right:10, fontFamily:"'Caveat',cursive", fontSize:'1.4rem', color:'rgba(0,0,0,0.12)', transform:'rotate(15deg)', userSelect:'none' }}>{doodle}</div>
        <div style={{ paddingLeft: 14, flex: 1, position: 'relative', zIndex: 1 }}>
          <div style={{ fontFamily: "'Caveat',cursive", fontSize: '1.8rem', fontWeight: 700, color: '#1a1a2e', lineHeight: 1, marginBottom: 4 }}>{data.band}</div>
          <svg height="6" width="100%" style={{ marginBottom: 8, overflow:'visible' }}><path d="M2,3 Q30,1 60,4 Q90,6 120,3 Q150,1 180,4" stroke="#1a1a2e" strokeWidth="1.2" fill="none" strokeOpacity="0.15" strokeLinecap="round"/></svg>
          <div style={{ fontFamily: "'Caveat',cursive", fontSize: '0.85rem', color: '#3a3a6e', lineHeight: 1.2 }}>{fmtDateShort(data.date)}</div>
          <div style={{ fontFamily: "'Caveat',cursive", fontSize: '0.8rem', color: '#5a5a7e', lineHeight: 1.2 }}>{data.venue?.toUpperCase()}</div>
        </div>
        <a href={data.sfmUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ alignSelf: 'flex-end', background: 'rgba(0,0,0,0.06)', color: '#1a1a2e', fontSize: 6, fontFamily: "'Space Mono'", padding: '3px 7px', borderRadius: 2, textDecoration: 'none', border: '1px solid rgba(0,0,0,0.1)', fontWeight: 700, marginTop: 6 }}>SETLIST ↗</a>
      </div>
    );
  };

  return (
    <div style={{
      flex: 1,
      position: 'relative',
      zIndex: isTop ? 2 : 1,
      transform: `rotate(${r}deg)`,
      transition: 'transform 0.3s ease',
      animation: 'peel-and-stick 0.8s cubic-bezier(0.23, 1, 0.32, 1) forwards',
      '--r': `${r}deg` 
    }}>
      {/* Physical Tape */}
      <div style={{
        position: 'absolute', top: -10, left: '50%',
        transform: 'translateX(-50%)',
        width: 46, height: 16,
        background: tapeColor,
        opacity: 0.85, borderRadius: 1, zIndex: 30,
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        animation: 'tape-slam 0.4s 0.6s both'
      }} />

      {hasImg ? (
        /* THE POSTER STACK */
        <div style={{
          background: '#fff',
          padding: '4px',
          boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 2,
          border: '1px solid #ddd',
          minHeight: 320
        }}>
          {/* HEADER: Dedicated space for the band */}
          <div style={{ 
            padding: '10px 4px 8px', 
            textAlign: 'center',
            background: '#111', // High contrast black header
            marginBottom: 4
          }}>
            <div style={{ 
              fontFamily: "'Bebas Neue', sans-serif", 
              fontSize: '1.4rem', 
              color: '#fff', 
              letterSpacing: '0.08em',
              lineHeight: 1
            }}>
              {data.band.toUpperCase()}
            </div>
          </div>

          {/* IMAGE: Constrained to its own box */}
          <div style={{ 
            flex: 1, 
            background: '#000', 
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <img 
              src={data.image_url} 
              alt={data.band}
              style={{ 
                width: '100%', 
                height: 'auto', 
                maxHeight: '220px', 
                objectFit: 'contain' // Contain ensures the full setlist text is visible
              }}
            />
          </div>

          {/* FOOTER: White-out info area */}
          <div style={{
            padding: '8px 6px',
            borderTop: '2px solid #f0f0f0'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', color: '#000', fontWeight: 900, lineHeight: 1 }}>
                  {data.venue?.toUpperCase() || 'UNKNOWN VENUE'}
                </div>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '8px', color: '#888', marginTop: 3 }}>
                  {fmtDateShort(data.date).toUpperCase()}
                </div>
              </div>
              
              <a
                href={data.sfmUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                style={{
                  background: C.gold, color: '#000',
                  fontSize: 7, fontFamily: "'Space Mono'", padding: '3px 7px',
                  borderRadius: 2, textDecoration: 'none', fontWeight: 900,
                  boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                }}
              >
                SETLIST ↗
              </a>
            </div>
            
            {data.is_festival && (
              <div style={{ fontFamily: "'Caveat', cursive", fontSize: '11px', color: C.teal, marginTop: 4, borderTop: '1px dashed #eee', paddingTop: 3 }}>
                ✎ {data.festival_name}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Fallback to Notebook if no image */
        <PaperFallback />
      )}
    </div>
  );
};
// ─── MAIN SETLIST SPOTLIGHT COMPONENT (HORIZONTAL MULTI-IMAGE EDITION) ──────
function SetlistSpotlight({ concerts, onVault }) {
  const [topIdx, setTopIdx] = useState(0);
  const [botIdx, setBotIdx] = useState(1);

  const vault = useMemo(() => 
    concerts.filter(c => c.has_setlist || c.has_setlist_names?.trim()), 
    [concerts]
  );
  
  const TAPE_COLORS = ['#ffcc00', '#00e5cc', '#9966ff', '#ff4466', '#00cfff'];

  const slides = useMemo(() => {
    if (!vault.length) return [];
    
    // 1. Flatten the vault into individual band slides
    const flattened = [];
    vault.forEach(s => {
      const bandNames = s.has_setlist_names?.split(',').map(b => b.trim()).filter(Boolean) || [];
      const imageLinks = (s.image_url || '').split(',').map(img => img.trim()).filter(Boolean);

      bandNames.forEach((band, idx) => {
        // Pair band with its image, or fall back to the first image
        const img = imageLinks[idx] || (imageLinks.length === 1 ? imageLinks[0] : null);
        
        flattened.push({
          id: `${s.id}-${band}`, // Unique ID for this specific setlist
          band: band,
          date: s.date,
          venue: s.venue,
          is_festival: s.is_festival,
          festival_name: s.festival_name,
          image_url: img, 
          sfmUrl: `https://www.setlist.fm/search?query=${encodeURIComponent(band)}+${encodeURIComponent(s.date)}`
        });
      });
    });

    // 2. Sort by date so the newest is always available for the first slot
    const sorted = [...flattened].sort((a, b) => b.date.localeCompare(a.date));
    
    // 3. Keep the newest, and shuffle the rest for the remaining 19 slots
    const newest = sorted[0];
    const pool = sorted.slice(1).sort(() => 0.5 - Math.random());
    
    return [newest, ...pool].slice(0, 20);
  }, [vault]);

  // Logic remains untouched (Recursive Sync-Killer)
  useEffect(() => {
    if (slides.length < 2) return;
    let timer;

    const flipTop = () => {
      setTopIdx(prev => (prev + 2) % slides.length);
      timer = setTimeout(flipBot, 5000); 
    };

    const flipBot = () => {
      setBotIdx(prev => (prev + 2) % slides.length);
      timer = setTimeout(flipTop, 5000); 
    };

    timer = setTimeout(flipTop, 2000); 
    return () => clearTimeout(timer);
  }, [slides.length]);

  if (!slides.length) return null;

  const leftSlide = slides[topIdx % slides.length];
  const rightSlide = slides[botIdx % slides.length];

  return (
    <div style={{ cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column' }} onClick={onVault}>
      <div style={{ fontFamily: "'Space Mono'", fontSize: 8, color: C.gold, letterSpacing: 3, marginBottom: 20, textTransform: 'uppercase', textAlign: 'center', opacity: 0.4 }}>
        📋 BACKSTAGE LOG
      </div>
      
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'row', 
        gap: '12px',         
        padding: '0 4px',
        alignItems: 'flex-start' 
      }}>
        <SpotlightScrap 
          key={`left-${leftSlide.id}`} // Using slide ID ensures the "peel-and-stick" animation triggers correctly
          data={leftSlide} 
          isTop={true} 
          TAPE_COLORS={TAPE_COLORS} 
        />
        <SpotlightScrap 
          key={`right-${rightSlide.id}`} 
          data={rightSlide} 
          isTop={false} 
          TAPE_COLORS={TAPE_COLORS} 
        />
      </div>
    </div>
  );
}
// ─── ARTIST INSIGHTS (POSTER EDITION) ─────────────────────────────────────────
function ArtistInsights({ concerts }) {
  const [index, setIndex] = useState(0);
  const insights = useMemo(() => {
    if (!concerts.length) return [];
    const yrMap = {};
    concerts.forEach(c => { const y=getYear(c.date); if(y) yrMap[y]=(yrMap[y]||0)+1; });
    const peakYear = Object.entries(yrMap).sort((a,b)=>b[1]-a[1])[0];
    const cityMap = {};
    concerts.forEach(c => { if(c.city) cityMap[c.city]=(cityMap[c.city]||0)+1; });
    const topCity = Object.entries(cityMap).sort((a,b)=>b[1]-a[1])[0];
    const festDays = concerts.filter(c=>c.is_festival).length;
    const festPct = Math.round((festDays/concerts.length)*100);
    const venueMap = {};
    concerts.forEach(c => { if(c.venue) venueMap[c.venue]=(venueMap[c.venue]||0)+1; });
    const topVenue = Object.entries(venueMap).sort((a,b)=>b[1]-a[1])[0];
    const allSets = [];
    concerts.forEach(c => (c.bands||[]).forEach(b => { if(b) allSets.push({...c, artist:b}); }));
    const artistDates = {};
    allSets.forEach(s => { if(!artistDates[s.artist]) artistDates[s.artist]=[]; artistDates[s.artist].push(s.date); });
    let longestRel = { artist:'', span:0, shows:0 };
    Object.entries(artistDates).forEach(([artist,dates]) => {
      if(dates.length<2) return;
      const span = Math.round((new Date(dates.reduce((a,b)=>a>b?a:b))-new Date(dates.reduce((a,b)=>a<b?a:b)))/(1000*60*60*24*365));
      if(span>longestRel.span) longestRel={artist,span,shows:dates.length};
    });
    const years = Object.keys(yrMap).map(Number).sort();
    let maxStreak=1, cur=1;
    for(let i=1;i<years.length;i++){if(years[i]===years[i-1]+1){cur++;maxStreak=Math.max(maxStreak,cur);}else cur=1;}
    const uniqueArtists = new Set(allSets.map(s=>s.artist));
    const oneTimers = Object.values(artistDates).filter(d=>d.length===1).length;
    const weekend = concerts.filter(c=>{const d=new Date(c.date+'T12:00:00');return[4,5,6].includes(d.getDay());}).length;
    const uniqueFests = new Set(concerts.filter(c=>c.is_festival&&c.festival_name).map(c=>c.festival_name));
    // NEW: Find the user's actual busiest month
    const monthMap = {};
    concerts.forEach(c => {
      const d = new Date(c.date + 'T12:00:00');
      const m = d.toLocaleString('default', { month: 'long' }).toUpperCase();
      monthMap[m] = (monthMap[m] || 0) + 1;
    });
    const peakMonth = Object.entries(monthMap).sort((a, b) => b[1] - a[1])[0] || ['NONE', 0];
    const avgBands = (allSets.length/concerts.length).toFixed(1);
    const heavy = Object.entries(artistDates).filter(([,d])=>d.length>=10).length;
    return [
      { label:'PEAK INTENSITY', val:peakYear?.[0], sub:`Your busiest year on record with ${peakYear?.[1]} shows logged.` },
      { label:'HOME TURF', val:topCity?.[0]?.toUpperCase(), sub:`${topCity?.[1]} shows in your most-visited city.` },
      { label:'FESTIVAL RATIO', val:`${festPct}%`, sub:`${festPct}% of your history happened in a field.` },
      { label:'TOTAL LEGACY', val:concerts.length, sub:`Unique show days logged since you started.` },
      { label:'MOST LOYAL STAGE', val:topVenue?.[0], sub:`You've been to ${topVenue?.[0]} ${topVenue?.[1]} times.` },
      { label:'LONGEST STREAK', val:`${maxStreak} YRS`, sub:`${maxStreak} consecutive years without missing a single year.` },
      { label:'RIDE OR DIE', val:longestRel.artist, sub:`${longestRel.span}-year relationship across ${longestRel.shows} shows.` },
      { label:'UNIQUE ARTISTS', val:uniqueArtists.size, sub:`${oneTimers} of them you've only seen once.` },
      { label:'WEEKEND WARRIOR', val:`${Math.round((weekend/concerts.length)*100)}%`, sub:`${Math.round((weekend/concerts.length)*100)}% of your shows fall on a Friday, Saturday, or Sunday.` },
      { label:'FESTIVAL PASSPORT', val:`${uniqueFests.size} FESTS`, sub:`${uniqueFests.size} unique festivals across ${festDays} total days.` },
      { label:'BANDS PER DAY', val:avgBands, sub:`Average ${avgBands} acts per show day. You never leave early.` },
      { label:'HEAVY ROTATION', val:`${heavy} ARTISTS`, sub:`${heavy} artists you've seen 10 or more times.` },
      { label:'PEAK MONTH', val:peakMonth[0], sub: `${peakMonth[1]} shows logged in ${peakMonth[0].toLowerCase()} across your history.` },
      { label:'HOME TURF', val:topCity?.[0]?.toUpperCase() || 'UNKNOWN', sub:`${topCity?.[1] || 0} shows logged in your most-frequented city.` },
      { label:'VENUE LOYALTY', val:topVenue?.[0]?.toUpperCase() || 'NONE', sub:`You have returned to this stage ${topVenue?.[1] || 0} times.` },
    ];
  }, [concerts]);

  useEffect(() => {
    if (!insights.length) return;
    const t = setInterval(() => setIndex(p => (p+1) % insights.length), 5500);
    return () => clearInterval(t);
  }, [insights.length]);

  const active = insights[index] || { label:'LOADING', val:'...', sub:'' };

  return (
    <Card neon className="card-texture" style={{ minHeight: 220, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      <div className="big-watermark">{active.label.split(' ')[0]}</div>
      <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: C.teal, color: C.bg, fontFamily: "'Space Mono'", fontSize: 9, padding: '4px 10px', width: 'fit-content', fontWeight: 900, marginBottom: 15, borderRadius: '2px' }}>
          ⚡ {active.label}
        </div>
        <div className="fade-in" key={index} style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: (active.val?.length || 0) > 8 ? '2.5rem' : '4rem', color: C.white, lineHeight: 0.9, marginBottom: 10, textShadow: `0 0 20px ${hexToRgba(C.teal, 0.3)}` }}>
            {active.val}
          </div>
          <div style={{ fontSize: '0.95rem', color: C.white, lineHeight: 1.4, maxWidth: '90%', fontFamily: "'Space Mono'", borderLeft: `2px solid ${C.teal}33`, paddingLeft: 12 }}>
            {active.sub}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4, marginTop: 20 }}>
          {insights.map((_, i) => (
            <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i === index ? C.teal : C.grayDim, transition: '0.3s' }} />
          ))}
        </div>
      </div>
    </Card>
  );
}

// ─── RANDOM SHOW (FULL FESTIVAL & SCROLLABLE EDITION) ────────────────────────
// ─── RANDOM SHOW (SPECIFIC FESTIVAL & WATERMARK FIX) ────────────────────────
function RandomShow({ concerts }) {
  const [show, setShow] = useState(null);
  const [spinning, setSpinning] = useState(false);

  const spin = () => {
    if (!concerts.length) return;
    setSpinning(true);
    let iterations = 0;
    const maxIterations = 15;
    const interval = setInterval(() => {
      setShow(concerts[Math.floor(Math.random() * concerts.length)]);
      iterations++;
      if (iterations >= maxIterations) {
        clearInterval(interval);
        setSpinning(false);
      }
    }, 80);
  };

  useEffect(() => { if (concerts.length && !show) spin(); }, [concerts.length]);

  if (!show) return null;

  const bands = show.bands || [show.artist];
  const displayImg = (show.personal_photo_url?.split(',')[0]) || (show.image_url?.split(',')[0]);
  
  // Use specific festival name if it exists, otherwise fallback to "FESTIVAL"
  const festLabel = show.festival_name || "FESTIVAL";

  return (
    <Card neon className="card-texture" style={{ 
      minHeight: 240, 
      position: 'relative', 
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      
      {/* 📸 THE IMAGE (Placed in the black space on the right) */}
      {displayImg && !spinning && (
        <div style={{
          position: 'absolute',
          right: 15,
          top: '50%',
          transform: 'translateY(-50%)',
          width: '140px',
          height: '160px',
          background: `url(${displayImg}) center/cover no-repeat`,
          borderRadius: '4px',
          border: `1px solid ${show.is_festival ? C.gold : C.purple}44`,
          boxShadow: `0 0 20px rgba(0,0,0,0.6)`,
          zIndex: 1,
          animation: 'fade-in 0.5s ease'
        }} />
      )}

      {/* 🗓 THE BIG FAINT YEAR WATERMARK (Moved to z-index 2 so it shows over the image/card) */}
      <div style={{ 
        position: 'absolute', 
        right: 10, 
        bottom: -10, 
        fontFamily: "'Bebas Neue'",
        fontSize: '10rem',
        zIndex: 2,
        color: show.is_festival ? C.gold : C.purple,
        opacity: 0.1,
        pointerEvents: 'none',
        lineHeight: 1,
        userSelect: 'none'
      }}>
        {getYear(show.date)}
      </div>

      <div style={{ position: 'relative', zIndex: 10, height: '100%', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Header Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontFamily: "'Space Mono'", fontSize: 8, color: show.is_festival ? C.gold : C.purple, letterSpacing: 2, fontWeight: 700 }}>
            {spinning ? "🧠 RECALLING..." : "🎲 RANDOM RECALL"}
          </div>
          <button onClick={spin} disabled={spinning} style={{ background: spinning ? C.white : (show.is_festival ? C.gold : C.purple), border: 'none', color: '#000', fontSize: 8, padding: '5px 12px', borderRadius: 4, cursor: 'pointer', fontFamily: "'Space Mono'", fontWeight: 900 }}>
            {spinning ? "•••" : "SPIN"}
          </button>
        </div>

        <div className={spinning ? "spinning-text" : "fade-in"} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* DATE & SPECIFIC FESTIVAL NAME */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <span style={{ background: C.white, color: C.bg, fontFamily: "'Bebas Neue'", fontSize: '1.4rem', padding: '0 8px' }}>
              {getYear(show.date)}
            </span>
            <span style={{ fontFamily: "'Space Mono'", fontSize: 9, color: C.white, opacity: 0.8 }}>
              {fmtDateShort(show.date).toUpperCase()}
            </span>
            {show.is_festival && (
              <span style={{ 
                background: `${C.gold}22`, 
                color: C.gold, 
                border: `1px solid ${C.gold}`, 
                fontFamily: "'Space Mono'", 
                fontSize: '7px', 
                padding: '2px 8px', 
                borderRadius: '4px',
                fontWeight: 900,
                letterSpacing: '1px',
                boxShadow: `0 0 10px ${hexToRgba(C.gold, 0.3)}`
              }}>
                {festLabel.toUpperCase()}
              </span>
            )}
          </div>

          {/* ARTISTS (Scrollable list) */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 4, 
            marginBottom: 10, 
            maxWidth: displayImg ? '50%' : '100%',
            maxHeight: '110px',
            overflowY: 'auto',
            paddingRight: '5px',
            scrollbarWidth: 'none'
          }}>
            {bands.map((b, i) => (
              <div key={i} style={{ 
                fontFamily: "'Bebas Neue'", 
                fontSize: bands.length > 3 ? '1.3rem' : '1.8rem', 
                color: C.white, 
                lineHeight: 1, 
                letterSpacing: '0.05em',
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                borderLeft: `2px solid ${show.is_festival ? C.gold : C.purple}`,
                paddingLeft: '8px'
              }}>
                {getBandName(b).toUpperCase()}
              </div>
            ))}
          </div>

          {/* VENUE PIN */}
          <div style={{ marginTop: 'auto' }}>
            <div style={{ 
              fontFamily: "'Bebas Neue'", 
              fontSize: '1.5rem', 
              color: show.is_festival ? C.gold : C.purple, 
              letterSpacing: '1px',
              lineHeight: 1.1 
            }}>
              📍 {show.venue?.toUpperCase() || 'UNKNOWN VENUE'}
            </div>
            <div style={{ fontFamily: "'Space Mono'", fontSize: 8, color: C.gray, textTransform: 'uppercase', marginTop: 2 }}>
              {show.city}, {show.state}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
// ─── SONIC DNA ────────────────────────────────────────────────────────────────
function SonicDNA({ stats, onGenreClick }) {
  return (
    <Card neon>
      <CardTitle>Sonic DNA 🧬</CardTitle>
      <div style={{ display:'flex', flexDirection:'column', gap:8, marginTop:4 }}>
        {stats.slice(0,8).map((g,i) => (
          <div key={i} onClick={() => onGenreClick && onGenreClick(g.name)} style={{ position:'relative', height:24, background:'#111', borderRadius:4, overflow:'hidden', cursor:onGenreClick?'pointer':'default' }}
            onMouseEnter={e => e.currentTarget.style.opacity='0.85'} onMouseLeave={e => e.currentTarget.style.opacity='1'}>
            <div style={{ position:'absolute', left:0, top:0, bottom:0, width:`${(g.count/(stats[0]?.count||1))*100}%`, background:`linear-gradient(90deg,${g.color}99,${g.color})`, transition:'width 1s ease-out' }} />
            <div style={{ position:'relative', zIndex:1, display:'flex', justifyContent:'space-between', padding:'0 10px', lineHeight:'24px', fontSize:9, fontFamily:"'Space Mono'", color:'#fff' }}>
              <span>{g.name}</span><span>{g.count}</span>
            </div>
          </div>
        ))}
      </div>
      {onGenreClick && <div style={{ fontFamily:"'Space Mono',monospace", fontSize:7, color:C.grayDim, textAlign:'center', marginTop:8 }}>click genre to browse artists</div>}
    </Card>
  );
}

// ─── 1. THE TURNTABLE (LEFT) ───────────────────────────────────────────
function DonutChart({ fest, solo, concerts }) {
  const [mode, setMode] = useState('fest');
  if (!concerts || concerts.length === 0) return null;

  const stats = useMemo(() => {
    const total = concerts.length;
    const getTop3 = (list, key) => {
      const counts = {};
      list.forEach(c => { if(c[key]) counts[c[key]] = (counts[c[key]] || 0) + 1; });
      return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(entry => entry[0]);
    };

    if (mode === 'legacy') {
      const filtered = concerts.filter(c => getYear(c.date) <= 2014);
      return { val1: filtered.length, val2: total - filtered.length, label1: 'LEGACY', label2: 'MODERN', title: 'ERA BREAKDOWN', color: '#ffcc00', topLabel: "TOP LEGACY ACTS", top: getTop3(filtered, 'artist') };
    }
    if (mode === 'city') {
      const filtered = concerts.filter(c => c.city === "Austin");
      return { val1: filtered.length, val2: total - filtered.length, label1: 'AUSTIN', label2: 'ON ROAD', title: 'GEOGRAPHIC FOCUS', color: '#00cfff', topLabel: "TOP ATX VENUES", top: getTop3(filtered, 'venue') };
    }
    if (mode === 'weekend') {
      const wknd = concerts.filter(c => [0, 5, 6].includes(new Date(c.date + 'T12:00:00').getDay()));
      return { val1: wknd.length, val2: total - wknd.length, label1: 'WEEKEND', label2: 'WEEKDAY', title: 'TEMPORAL VIBE', color: '#9966ff', topLabel: "PRIME DAYS", top: ["SATURDAY", "SUNDAY", "FRIDAY"] };
    }
    const filtered = concerts.filter(c => c.is_festival);
    return { val1: fest, val2: solo, label1: 'FEST', label2: 'SOLO', title: 'STAGING RATIO', color: '#00e5cc', topLabel: "TOP FESTIVALS", top: getTop3(filtered, 'festival_name') };
  }, [mode, fest, solo, concerts]);

  const pct1 = Math.round((stats.val1 / (stats.val1 + stats.val2 || 1)) * 100);
  const r = 46, cx = 70, cy = 70, circ = 2 * Math.PI * r;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', padding: '5px' }}>
      
      {/* 🔴 HEADER READOUT (High Contrast) */}
      <div style={{ textAlign: 'center', marginBottom: 5 }}>
        <div style={{ fontFamily: "'Space Mono'", fontSize: 9, color: stats.color, letterSpacing: '3px', fontWeight: 900, marginBottom: 8, textShadow: `0 0 10px ${hexToRgba(stats.color, 0.3)}` }}>{stats.title}</div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 25 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: "'Space Mono'", fontSize: 7, color: stats.color, fontWeight: 700 }}>{stats.label1}</div>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: '2.2rem', color: '#fff', lineHeight: 1 }}>{stats.val1}</div>
          </div>
          <div style={{ width: 2, height: 30, background: 'rgba(255,255,255,0.1)' }} />
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontFamily: "'Space Mono'", fontSize: 7, color: '#666', fontWeight: 700 }}>{stats.label2}</div>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: '2.2rem', color: '#444', lineHeight: 1 }}>{stats.val2}</div>
          </div>
        </div>
      </div>

      {/* 📀 THE PHYSICAL TURNTABLE UNIT (Brighter & More Depth) */}
      <div style={{ 
        position: 'relative', width: '220px', height: '200px', 
        background: 'linear-gradient(135deg, #1a1a1e 0%, #111114 100%)', // Lighter brushed finish
        alignSelf: 'center', borderRadius: '6px',
        border: '1px solid #333',
        // High intensity underglow
        boxShadow: `
          0 25px 50px rgba(0,0,0,0.9), 
          0 0 20px ${hexToRgba(stats.color, 0.15)},
          inset 0 1px 1px rgba(255,255,255,0.1)
        `,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        {/* Hardware Detail: Power Light */}
        <div style={{ position: 'absolute', top: 12, left: 12, width: 6, height: 6, borderRadius: '50%', background: stats.color, boxShadow: `0 0 8px ${stats.color}` }} />
        
        {/* Hardware Detail: Start Button */}
        <div style={{ position: 'absolute', bottom: 15, left: 15, width: 32, height: 22, background: '#222', border: '1px solid #444', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, color: '#888', fontFamily: "'Space Mono'", fontWeight: 900, boxShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>START</div>

        {/* Hardware Detail: Pitch Slider */}
        <div style={{ position: 'absolute', top: 30, right: 15, width: 12, height: 80, background: '#080808', border: '1px solid #222', borderRadius: 2 }}>
           <div style={{ position: 'absolute', top: '30%', left: -4, width: 20, height: 10, background: '#444', borderRadius: 1, border: '1px solid #666', boxShadow: '0 2px 4px rgba(0,0,0,0.8)' }} />
        </div>

        {/* 🕳️ THE PLATTER WELL (Deep Carved Effect) */}
        <div style={{ 
          width: 165, height: 165, background: '#000', borderRadius: '50%',
          boxShadow: `
            inset 0 0 30px rgba(0,0,0,1), 
            0 0 0 6px #1a1a1f,
            0 0 20px ${hexToRgba(stats.color, 0.1)}
          `,
          position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          
          {/* 🦾 CHROME TONE ARM (High Shine) */}
          <div style={{ 
            position: 'absolute', top: -5, right: -5, width: 7, height: 95, 
            background: 'linear-gradient(to right, #666 0%, #eee 40%, #fff 50%, #eee 60%, #666 100%)', 
            transform: `rotate(${25 + (pct1 * 0.14)}deg)`, transformOrigin: 'top center', 
            borderRadius: 12, zIndex: 100, border: '1px solid #333',
            boxShadow: '10px 10px 20px rgba(0,0,0,0.8)', transition: 'transform 0.8s ease'
          }}>
             <div style={{ position: 'absolute', bottom: -5, left: -5, width: 18, height: 24, background: '#111', borderRadius: 3, border: '1px solid #444', boxShadow: '0 4px 8px rgba(0,0,0,0.5)' }}>
                <div style={{ width: 4, height: 4, background: stats.color, borderRadius: '50%', margin: '6px auto', boxShadow: `0 0 10px ${stats.color}` }} />
             </div>
          </div>

          {/* SVG RECORD */}
          <svg className="record-vinyl-spinning" width="155" height="155" viewBox="0 0 140 140">
            <circle cx={cx} cy={cy} r={69} fill="#0a0a0a" />
            
            {/* Brightened Strobe Pattern */}
            {[...Array(40)].map((_, i) => (
              <rect key={i} x={70} y={1} width={2.5} height={4} fill="#333" transform={`rotate(${i * 9} 70 70)`} />
            ))}

            {/* High-Vis Vinyl Grooves */}
            {[62, 58, 54, 50, 42, 38].map(rad => (
              <circle key={rad} cx={cx} cy={cy} r={rad} fill="none" stroke="#181818" strokeWidth={1} />
            ))}

            {/* ⚪ THE "OTHER" STAT TRACK (Now highly visible grey) */}
            <circle 
              cx={cx} cy={cy} r={r} fill="none" 
              stroke="#333338" 
              strokeWidth={11} 
              style={{ filter: `drop-shadow(0 0 2px rgba(255,255,255,0.1))` }}
            />
            
            {/* 🟢 THE PRIMARY NEON TRACK */}
            <circle 
              cx={cx} cy={cy} r={r} fill="none" 
              stroke={stats.color} 
              strokeWidth={11} 
              strokeDasharray={`${(pct1 / 100) * circ} ${circ}`} 
              strokeLinecap="round" 
              transform={`rotate(-90 ${cx} ${cy})`} 
              style={{ filter: `drop-shadow(0 0 15px ${stats.color})`, transition: 'all 0.8s ease' }} 
            />
            
            {/* Center Label */}
            <circle cx={cx} cy={cy} r={20} fill="#000" stroke={stats.color} strokeWidth={1.5} />
            <text x={cx} y={cy + 5} textAnchor="middle" style={{ fontFamily: "'Bebas Neue'", fontSize: 13, fill: stats.color, filter: `drop-shadow(0 0 8px ${stats.color})`, fontWeight: 900 }}>{pct1}%</text>
          </svg>
        </div>
      </div>

      {/* 🎶 TRACKLIST (Tightened & Brightened) */}
      <div style={{ padding: '0 20px', marginTop: 5 }}>
        <div style={{ fontFamily: "'Space Mono'", fontSize: 7, color: '#555', borderBottom: '1px solid #222', paddingBottom: 4, marginBottom: 8, letterSpacing: 1, fontWeight: 900 }}>{stats.topLabel}</div>
        {stats.top.map((name, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
             <span style={{ fontFamily: "'Space Mono'", fontSize: 8, color: stats.color, fontWeight: 900 }}>0{i+1}</span>
             <span style={{ fontFamily: "'Bebas Neue'", fontSize: '1rem', color: '#fff', letterSpacing: 1 }}>{name?.toUpperCase() || '---'}</span>
          </div>
        ))}
      </div>

      {/* 🎚️ MODE SELECTORS (High Contrast) */}
      <div style={{ display: 'flex', gap: 6, height: 40, marginTop: 10 }}>
        {[{ id: 'fest', icon: '🎪' }, { id: 'legacy', icon: '📜' }, { id: 'city', icon: '📍' }, { id: 'weekend', icon: '🍺' }].map((item) => (
          <div key={item.id} onMouseDown={() => setMode(item.id)} style={{ 
            flex: 1, height: mode === item.id ? '100%' : '85%', 
            background: mode === item.id ? stats.color : 'rgba(255,255,255,0.05)', 
            borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.2s',
            border: mode === item.id ? `1px solid #fff` : '1px solid transparent',
            boxShadow: mode === item.id ? `0 0 15px ${hexToRgba(stats.color, 0.4)}` : 'none'
          }}>
            <span style={{ fontSize: 14, filter: mode === item.id ? 'none' : 'grayscale(100%) opacity(0.3)' }}>{item.icon}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
// ─── 2. THE PHYSICAL WRISTBANDS (MIDDLE) ──────────────────────────
function TopFestBlocks({ festBreakdown, concerts }) {
  if (!concerts || !festBreakdown || festBreakdown.length === 0) return null;
  const colors = ['#00e5cc', '#00cfff', '#9966ff', '#ffcc00', '#00cc88', '#ff6699'];

  const stats = useMemo(() => {
    const totalDays = festBreakdown.reduce((sum, f) => sum + f[1], 0);
    const festShows = concerts.filter(c => c.is_festival);
    return { totalFests: festBreakdown.length, avgSets: totalDays > 0 ? (festShows.length / totalDays).toFixed(1) : 0 };
  }, [festBreakdown, concerts]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '440px', justifyContent: 'space-between', overflow: 'hidden' }}>
      <div className="wristband-bin" style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, overflowY: 'auto', paddingRight: 8, marginBottom: 15 }}>
        {festBreakdown.map(([name, days], i) => {
          const color = colors[i % colors.length];
          const uniqueActs = new Set(concerts.filter(c => c.festival_name === name).flatMap(s => s.bands || [])).size;
          return (
            <div key={name} style={{ display: 'flex', alignItems: 'center', position: 'relative', flexShrink: 0 }}>
              <div style={{ position: 'absolute', left: 38, width: 14, height: 20, background: '#111', border: `1px solid ${color}`, borderRadius: 2, zIndex: 10 }} />
              <div style={{ width: 45, height: 42, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', borderRadius: 4, zIndex: 5 }}>
                 <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.2rem', color: '#000', lineHeight: 0.8 }}>{days}</div>
                 <div style={{ fontFamily: "'Space Mono'", fontSize: 5, color: '#000', fontWeight: 900 }}>DAYS</div>
              </div>
              <div style={{ flex: 1, height: 32, marginLeft: -10, padding: '0 20px 0 35px', background: color, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '0 4px 4px 0' }}>
                 <div style={{ fontFamily: "'Bebas Neue'", fontSize: '0.9rem', color: '#000', overflow: 'hidden', whiteSpace: 'nowrap' }}>{name.toUpperCase()}</div>
                 <div style={{ fontFamily: "'Space Mono'", fontSize: 8, color: 'rgba(0,0,0,0.4)', fontWeight: 900 }}>{uniqueActs} ACTS</div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ paddingTop: 15, borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)', padding: '10px' }}>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ fontFamily: "'Space Mono'", fontSize: 6, color: C.grayDim }}>TOTAL FESTS</div>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.5rem', color: C.teal }}>{stats.totalFests}</div>
        </div>
        <div style={{ width: 1, height: 25, background: '#222' }} />
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ fontFamily: "'Space Mono'", fontSize: 6, color: C.grayDim }}>AVG SETS/DAY</div>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.5rem', color: C.purple }}>{stats.avgSets}</div>
        </div>
      </div>
    </div>
  );
}

// ─── 3. THE DECADE STAGE (RIGHT) ────────────────────────────────
function DecadeBlocks({ sets, headerStats, concerts }) {
  const [statIdx, setStatIdx] = useState(0);
  if (!sets || !headerStats || !concerts) return null;

  const counts = useMemo(() => {
    const c = {'90s': 0, '00s': 0, '10s': 0, '20s': 0};
    sets.forEach(s => {
      const y = getYear(s.date); if (!y) return;
      if (y < 2000) c['90s']++; else if (y < 2010) c['00s']++; 
      else if (y < 2020) c['10s']++; else c['20s']++;
    });
    return c;
  }, [sets]);

  const rotatingStats = useMemo(() => [
    { label: 'TOTAL ACTS', val: headerStats.uniqueArtists || 0, color: C.cyan },
    { label: 'UNIQUE VENUES', val: new Set(concerts.map(c => c.venue).filter(Boolean)).size, color: C.red },
    { label: 'CALENDAR DAYS', val: headerStats.totalShows || 0, color: C.purple },
    { label: 'SETLIST FILES', val: headerStats.setlistCount || 0, color: C.gold },
    { label: 'ARCHIVED SETS', val: headerStats.totalSets || 0, color: C.teal },
  ], [headerStats, concerts]);

  useEffect(() => {
    const timer = setInterval(() => setStatIdx(p => (p + 1) % rotatingStats.length), 3000);
    return () => clearInterval(timer);
  }, [rotatingStats.length]);

  const currentStat = rotatingStats[statIdx] || rotatingStats[0];
  const maxVal = Math.max(...Object.values(counts), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', gap: 10 }}>
      <style>{`
        @keyframes woofer-pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.08); filter: brightness(1.5) drop-shadow(0 0 8px ${C.teal}); } }
        .speaker-cone { animation: woofer-pulse 0.4s ease-in-out infinite; }
        
        @keyframes beam-swing { 0%, 100% { transform: rotate(-8deg); } 50% { transform: rotate(8deg); } }
        .moving-light { animation: beam-swing 3s ease-in-out infinite; transform-origin: top center; }
        
        @keyframes truss-flash { 0%, 100% { background: #fff; box-shadow: 0 0 10px #fff; } 50% { background: #333; box-shadow: none; } }
        .truss-bulb { animation: truss-flash 1.5s infinite; }
      `}</style>

      {/* 🟢 TOP DECADE BARS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, flexShrink: 0 }}>
        {Object.entries(counts).map(([decade, count]) => {
          const m = { '90s': {label:'ANALOG', col:C.purple}, '00s': {label:'DIGITAL', col:C.cyan}, '10s': {label:'STREAM', col:C.teal}, '20s': {label:'HYPER', col:C.gold} }[decade];
          return (
            <div key={decade} style={{ background: 'rgba(255,255,255,0.03)', padding: '6px 10px', borderRadius: 4, border: `1px solid ${hexToRgba(m.col, 0.2)}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontFamily: "'Space Mono'", fontSize: 6, color: m.col, fontWeight: 900 }}>{m.label}</span>
                <span style={{ fontFamily: "'Bebas Neue'", fontSize: '0.8rem', color: '#fff' }}>{decade}</span>
              </div>
              <div style={{ height: 2, background: '#000', borderRadius: 1, overflow: 'hidden', marginTop: 3 }}>
                <div style={{ height: '100%', width: `${(count/maxVal)*100}%`, background: m.col, boxShadow: `0 0 10px ${m.col}` }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* 🏟️ THE MAIN STAGE PRODUCTION */}
      <div style={{ 
        flex: 1, 
        borderTop: `1px solid ${C.border}`, 
        paddingTop: 10, 
        position: 'relative', 
        overflow: 'hidden', 
        background: '#010102', 
        borderRadius: 8,
        display: 'flex',
        flexDirection: 'column'
      }}>
        
        {/* 1. OVERHEAD TRUSS & BULBS */}
        <div style={{ position: 'absolute', top: 0, width: '100%', height: '20px', background: '#111', borderBottom: '1.5px solid #444', zIndex: 100, display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
           {[...Array(12)].map((_, i) => (
             <div key={i} className="truss-bulb" style={{ width: 3, height: 3, borderRadius: '50%', animationDelay: `${i*0.15}s` }} />
           ))}
        </div>

        {/* 2. MULTI-BEAM LIGHTING ARRAY */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 5 }}>
          <svg width="100%" height="100%" viewBox="0 0 1000 1000" preserveAspectRatio="none">
             {/* Center Wash */}
             <polygon points="500,0 200,1000 800,1000" fill="rgba(255,255,255,0.1)" style={{ filter: 'blur(40px)' }} />
             
             {/* Dynamic Beams */}
             {[...Array(6)].map((_, i) => {
                const isLeft = i < 3;
                const col = isLeft ? C.purple : C.cyan;
                const xBase = isLeft ? (150 + i * 100) : (550 + (i-3) * 100);
                return (
                  <g key={i} className="moving-light" style={{ animationDelay: `${i*0.4}s` }}>
                    <polygon 
                      points={`${xBase},0 ${xBase-180},1000 ${xBase+180},1000`} 
                      fill={hexToRgba(col, 0.4)} 
                      style={{ mixBlendMode: 'screen', filter: 'blur(15px)' }} 
                    />
                  </g>
                );
             })}
          </svg>
        </div>

        {/* 3. IMAG SCREENS (STAT DISPLAYS) */}
        <div style={{ 
          position: 'absolute', top: 40, left: '6%', width: '25%', height: '65px', 
          background: '#000', border: `2px solid ${currentStat.color}`, borderRadius: 4, 
          zIndex: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 0 20px ${hexToRgba(currentStat.color, 0.3)}`
        }}>
           <div style={{ fontFamily: "'Space Mono'", fontSize: 8, color: currentStat.color, fontWeight: 900, textAlign: 'center' }}>{currentStat.label}</div>
        </div>
        
        <div style={{ 
          position: 'absolute', top: 40, right: '6%', width: '25%', height: '65px', 
          background: '#000', border: `2px solid ${currentStat.color}`, borderRadius: 4, 
          zIndex: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 0 20px ${hexToRgba(currentStat.color, 0.3)}`
        }}>
           <div style={{ fontFamily: "'Bebas Neue'", fontSize: '2.2rem', color: '#fff', textShadow: `0 0 10px ${currentStat.color}` }}>{currentStat.val}</div>
        </div>

        {/* 4. SPEAKER STACKS (PULSING) */}
        {[ {side: 'left'}, {side: 'right'} ].map(s => (
          <div key={s.side} style={{ 
            position: 'absolute', [s.side]: 10, bottom: 42, width: 34, height: 115, 
            background: '#0a0a0c', border: '1.5px solid #222', borderRadius: 4, 
            display: 'flex', flexDirection: 'column', gap: 6, padding: 5, zIndex: 40, 
            boxShadow: '0 10px 30px #000' 
          }}>
            {[1,2,3,4].map(i => (
              <div key={i} style={{ flex: 1, background: '#000', borderRadius: '50%', border: '1px solid #1a1a1c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="speaker-cone" style={{ width: 14, height: 14, borderRadius: '50%', border: `1.8px solid ${C.teal}`, background: 'radial-gradient(circle, #333, #000)' }} />
              </div>
            ))}
          </div>
        ))}

        {/* 5. ILLUMINATED STAGE FLOOR */}
        <div style={{ 
          position: 'absolute', bottom: 32, width: '100%', height: '65px', 
          background: '#121216', borderTop: '2px solid #333', zIndex: 20, 
          clipPath: 'polygon(8% 0%, 92% 0%, 100% 100%, 0% 100%)' 
        }}>
           <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at center top, ${hexToRgba(currentStat.color, 0.35)}, transparent 80%)` }} />
           <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 20px)' }} />
        </div>

        {/* 6. FOH STATUS BAR (ALIGNED TO BOTTOM) */}
        <div style={{ 
          marginTop: 'auto', width: '100%', height: '32px', background: '#000', 
          zIndex: 60, borderTop: `2px solid ${C.border}`, 
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>
           <div style={{ fontFamily: "'Space Mono'", fontSize: '7px', color: currentStat.color, letterSpacing: '4px', fontWeight: 900, textShadow: `0 0 8px ${currentStat.color}` }}>
              {currentStat.label} // RIG STATUS: ACTIVE
           </div>
        </div>
      </div>
    </div>
  );
}
// ─── HALL OFFAME (RESTORED & ARMORED) ───────────────────────────────────────
function HallOfFame({ sets, genreMap, onShare }) {
  const [selected, setSelected] = useState(null);
  const topRef = useRef(null);

  // 1. Grouping Logic
  const artists = useMemo(() => {
    const m = {};
    sets.forEach(s => { 
      if (!m[s.artist]) m[s.artist] = { artist: s.artist, shows: [] }; 
      m[s.artist].shows.push(s); 
    });

    return Object.values(m).map(a => {
      const masterGenre = genreMap[a.artist];
      return { ...a, genre: masterGenre || null };
    })
    // Use a fallback for the MIN constant if it's missing
    .filter(a => a.shows.length >= (typeof HALL_OF_FAME_MIN !== 'undefined' ? HALL_OF_FAME_MIN : 3))
    .sort((a, b) => b.shows.length - a.shows.length);
  }, [sets, genreMap]);

  const selectedData = selected ? artists.find(a => a.artist === selected) : null;
  const MEDAL = ['🥇', '🥈', '🥉'];
  
  const handleSelect = (artist, isSelected) => { 
    if (isSelected) { setSelected(null); return; } 
    setSelected(artist); 
    setTimeout(() => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50); 
  };

  // 2. 🟢 ROBUST MEDIA ARCHIVE
  // This checks EVERY bucket. Even if it's in the old "image_url" slot, we find it.
  const archive = useMemo(() => {
    if (!selectedData) return { setlists: [], photos: [] };
    
    const setlists = [];
    const photos = [];

    selectedData.shows.forEach(s => {
      // Logic for Setlists: Check new bucket FIRST, then fallback to old image_url
      const slSource = s.setlist_image_url || s.image_url;
      if (slSource && typeof slSource === 'string') {
        slSource.split(',').forEach(url => {
          if (url.trim()) setlists.push({ url: url.trim(), date: s.date });
        });
      }
      
      // Logic for Polaroids
      if (s.personal_photo_url && typeof s.personal_photo_url === 'string') {
        s.personal_photo_url.split(',').forEach(url => {
          if (url.trim()) photos.push({ url: url.trim(), date: s.date });
        });
      }
    });

    return { setlists, photos };
  }, [selectedData]);

  return (
    <div ref={topRef} style={{ padding: '24px 0' }} className="fade-in">
      <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: C.gray, marginBottom: 20, letterSpacing: '0.1em', textTransform: 'uppercase', textAlign: 'center' }}>
        // ARTISTS SEEN {HALL_OF_FAME_MIN || 3}+ TIMES //
      </div>

      {selectedData && (() => {
        const gc = selectedData.genre ? (GENRE_COLORS[selectedData.genre] || C.teal) : C.teal;
        return (
          <div className="fade-in" style={{ 
            background: `linear-gradient(135deg, ${C.bgCard}, ${hexToRgba(gc, 0.05)})`, 
            border: `2px solid ${gc}44`, borderRadius: 16, padding: '40px', marginBottom: 40, 
            boxShadow: `0 30px 100px rgba(0,0,0,0.5), 0 0 40px ${hexToRgba(gc, 0.15)}`,
            position: 'relative'
          }}>
            {/* Watermark */}
            <div style={{ position: 'absolute', right: 20, bottom: -10, fontFamily: "'Bebas Neue'", fontSize: '12rem', color: hexToRgba(gc, 0.03), pointerEvents: 'none', userSelect: 'none', lineHeight: 1 }}>
              {selectedData.shows.length}X
            </div>

            {/* Header Area */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, position: 'relative', zIndex: 5 }}>
              <div>
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: '4rem', color: C.white, lineHeight: 0.9 }}>
                  {selectedData.artist.toUpperCase()}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 15, marginTop: 10 }}>
                  {selectedData.genre && <GenreBadge genre={selectedData.genre} color={gc} />}
                  <span style={{ fontFamily: "'Space Mono'", fontSize: 11, color: gc, fontWeight: 900 }}>
                    {selectedData.shows.length} SETS IN ARCHIVE
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                {onShare && <button onClick={() => onShare(selectedData.artist, selectedData.shows)} style={{ fontFamily: "'Space Mono'", fontSize: 10, background: hexToRgba(gc, 0.2), border: `2px solid ${gc}`, color: '#fff', borderRadius: 6, padding: '8px 16px', cursor: 'pointer', fontWeight: 700 }}>SHARE HISTORY</button>}
                <button onClick={() => setSelected(null)} style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid rgba(255,255,255,0.1)`, color: '#fff', fontSize: 10, borderRadius: 6, padding: '8px 16px', cursor: 'pointer' }}>CLOSE</button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '50px', position: 'relative', zIndex: 5 }}>
              {/* TIMELINE */}
              <div style={{ flex: 1, position: 'relative', paddingLeft: 25 }}>
                <div style={{ position: 'absolute', left: 5, top: 0, bottom: 0, width: 2, background: `linear-gradient(to bottom, ${gc}, transparent)`, opacity: 0.4 }} />
                {[...selectedData.shows].reverse().map((s, i) => (
                  <div key={i} style={{ position: 'relative', marginBottom: 18, paddingLeft: 20 }}>
                    <div style={{ position: 'absolute', left: -24, top: 4, width: 10, height: 10, borderRadius: '50%', background: s.is_festival ? gc : '#fff', boxShadow: `0 0 15px ${s.is_festival ? gc : '#fff'}` }} />
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                      <span style={{ fontFamily: "'Space Mono'", fontSize: 11, color: gc, fontWeight: 900 }}>{fmtDate(s.date)}</span>
                      <span style={{ fontSize: '1.1rem', color: C.white }}>{s.venue}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* MEDIA VAULT (REPAIRED) */}
              <div style={{ flex: 1.2, display: 'flex', flexDirection: 'column', gap: '30px' }}>
                {archive.setlists.length > 0 && (
                  <div>
                    <div style={{ fontFamily: "'Space Mono'", fontSize: 9, color: gc, letterSpacing: 2, marginBottom: 15, fontWeight: 900 }}>// STAGE ARTIFACTS</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
                      {archive.setlists.map((m, idx) => (
                        <SetlistPaper key={`${idx}-${m.url}`} src={m.url} index={idx} total={archive.setlists.length} />
                      ))}
                    </div>
                  </div>
                )}
                
                {archive.photos.length > 0 && (
                  <div>
                    <div style={{ fontFamily: "'Space Mono'", fontSize: 9, color: '#9d00ff', letterSpacing: 2, marginBottom: 15, fontWeight: 900 }}>// PERSONAL MEMORIES</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
                      {archive.photos.map((m, idx) => (
                        <PersonalPolaroid key={`${idx}-${m.url}`} src={m.url} index={idx} total={archive.photos.length} caption={fmtDateShort(m.date)} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* 3. 🟡 THE GRID VIEW (Restored Badge & Counter) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 15 }}>
        {artists.map((a, i) => {
          const gc = a.genre ? (GENRE_COLORS[a.genre] || C.teal) : null;
          const isSelected = selected === a.artist;
          const cardColor = isSelected ? (gc || C.teal) : gc;
          
          // 🟢 RESTORED COUNTER LOGIC
          // Checks ALL possible setlist indicators
          const setlistCount = a.shows.filter(s => 
            s.has_setlist || 
            (s.has_setlist_names && s.has_setlist_names.trim().length > 0) || 
            s.setlist_image_url || 
            s.image_url
          ).length;

          return (
            <div key={a.artist} onClick={() => handleSelect(a.artist, isSelected)}
              style={{ 
                background: cardColor ? `linear-gradient(135deg, ${C.bgCard}, ${hexToRgba(cardColor, 0.12)})` : C.bgCard, 
                border: `1px solid ${cardColor ? hexToRgba(cardColor, 0.5) : C.border}`, 
                borderRadius: 12, padding: '20px', cursor: 'pointer', transition: 'all 0.2s', position: 'relative'
              }}>
              <div style={{ fontFamily: "'Space Mono'", fontSize: 9, color: cardColor || C.tealDim, marginBottom: 8, fontWeight: 900 }}>{MEDAL[i] || 'RECORD'} #{i + 1}</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: C.white, marginBottom: 4, lineHeight: 1 }}>{a.artist.toUpperCase()}</div>
              {a.genre && <GenreBadge genre={a.genre} color={gc} small />}
              
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: '2.5rem', color: cardColor || C.white, lineHeight: 1, marginTop: 10 }}>{a.shows.length}×</div>
              
              {/* 🟡 RESTORED YELLOW BADGE */}
              {setlistCount > 0 && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 10, background: `${C.gold}15`, border: `1px solid ${C.gold}44`, borderRadius: 10, padding: '4px 10px' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.gold, boxShadow: `0 0 8px ${C.gold}` }} />
                  <span style={{ fontFamily: "'Space Mono'", fontSize: 8, color: C.gold, fontWeight: 900, textTransform: 'uppercase' }}>{setlistCount} SETLISTS</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
// ─── 1. TICKET & WRISTBAND DESIGN SYSTEM ─────────────────────────────────────
const STUB_TEMPLATES = [
  { bg: '#e8dfa0', ink: '#1a1a1a', accent: '#8b0000', label: 'TICKETMASTER' },
  { bg: '#d4e8d4', ink: '#1a2a1a', accent: '#004400', label: 'TICKETRON' },
  { bg: '#d0d8f0', ink: '#0a0a2a', accent: '#000080', label: 'BASS TICKETS' },
  { bg: '#f0d8cc', ink: '#2a0a00', accent: '#8b3300', label: 'GOOD TIMES' },
  { bg: '#e8e8e8', ink: '#111', accent: '#444', label: 'CONCERT TICKET' },
];

// The High-Fidelity Wristband (RFID Chip + Woven Strap)
const PhysicalWristband = ({ color, label, year, size = 'large' }) => {
  const isLarge = size === 'large';
  return (
    <div style={{ width: '100%', height: isLarge ? '42px' : '32px', position: 'relative', display: 'flex', alignItems: 'center', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))', margin: isLarge ? '10px 0' : '5px 0' }}>
      <div style={{ width: '100%', height: isLarge ? '24px' : '18px', background: `repeating-linear-gradient(90deg, ${color}, ${color} 10px, ${hexToRgba(color, 0.8)} 10px, ${hexToRgba(color, 0.8)} 20px)`, borderRadius: '2px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3), inset 0 -2px 4px rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', padding: '0 10px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.2)' }}>
        <span style={{ fontFamily: "'Bebas Neue'", fontSize: isLarge ? '10px' : '8px', color: 'rgba(0,0,0,0.6)', whiteSpace: 'nowrap', letterSpacing: '1px', fontWeight: 900 }}>{label?.toUpperCase()} • {year} • {label?.toUpperCase()} • {year}</span>
      </div>
      <div style={{ position: 'absolute', left: '20%', width: isLarge ? '36px' : '28px', height: isLarge ? '36px' : '28px', background: '#1a1a1a', borderRadius: '4px', border: `1px solid ${color}`, boxShadow: '0 4px 12px rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: isLarge ? '11px' : '9px', color: color, lineHeight: 1 }}>{year}</div>
        <div style={{ width: isLarge ? '10px' : '6px', height: isLarge ? '10px' : '6px', marginTop: 2, background: color, borderRadius: '1px', opacity: 0.8 }} />
      </div>
      <div style={{ position: 'absolute', right: '15%', width: isLarge ? '12px' : '10px', height: isLarge ? '32px' : '24px', background: '#050505', borderRadius: '3px', boxShadow: '2px 0 5px rgba(0,0,0,0.5)', zIndex: 1 }} />
    </div>
  );
};

function DecorativeTicket({ event, templateIdx }) {
  const tpl = STUB_TEMPLATES[templateIdx % STUB_TEMPLATES.length];
  const bands = event.bands || [];
  const headliner = (getBandName(bands[0]) || 'UNKNOWN ARTIST').toUpperCase();
  
  // 🛰️ PRIORITY 1: THE REAL SCAN
  const hasRealStub = event.image_url && event.image_url.trim() !== "";
  
  // 🟢 1. Extract saved rotation from the URL hack (e.g., "url.jpg#rot=90")
  const initialRot = hasRealStub ? parseInt(event.image_url.split('#rot=')[1] || '0', 10) : 0;
  const [rot, setRot] = useState(initialRot);
  const [isSaving, setIsSaving] = useState(false);

  // 🟢 2. Save to Database instantly without refreshing
  const handleRotate = async (e) => {
    e.stopPropagation(); // Stops the Edit Modal from opening
    if (isSaving || !event.id) return;
    
    setIsSaving(true);
    const newRot = (rot + 90) % 360;
    setRot(newRot);

    // Build the new URL with the rotation hash appended
    const baseUrl = event.image_url.split('#rot=')[0];
    const newUrl = newRot === 0 ? baseUrl : `${baseUrl}#rot=${newRot}`;

    // Update the database quietly in the background
    await supabase.from('concerts').update({ image_url: newUrl }).eq('id', event.id);
    
    // Update local event object so it doesn't flicker back on re-render
    event.image_url = newUrl;
    setIsSaving(false);
  };

  if (hasRealStub) {
    const isSideways = rot % 180 !== 0;

    return (
      <div style={{ 
        width: 260, height: 130, background: '#0a0a0a', borderRadius: 2, 
        overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', 
        border: '1px solid rgba(255,255,255,0.1)', transform: 'rotate(-1deg)',
        position: 'relative', cursor: 'zoom-in',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <img 
          src={event.image_url.split('#rot=')[0]} // Strip the hash for the actual image source so it loads clean
          alt="Stub" 
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'contain', 
            transform: `rotate(${rot}deg) scale(${isSideways ? 1.7 : 1})`,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }} 
        />
        {/* Physical Paper Overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(45deg, rgba(255,255,255,0.05) 0%, transparent 100%)', pointerEvents: 'none' }} />
        
        {/* 🟢 ROTATE BUTTON */}
        <button 
          onClick={handleRotate}
          disabled={isSaving}
          style={{
            position: 'absolute', bottom: 6, right: 6, 
            background: 'rgba(0,0,0,0.7)', color: '#fff', 
            border: '1px solid rgba(255,255,255,0.3)', borderRadius: 4, 
            width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: isSaving ? 'wait' : 'pointer', zIndex: 10, fontSize: 14,
            backdropFilter: 'blur(4px)', transition: 'background 0.2s',
            opacity: isSaving ? 0.5 : 1
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,229,204,0.5)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.7)'}
          title="Rotate & Save"
        >
          ↻
        </button>
      </div>
    );
  }

  // 🛰️ PRIORITY 2: THE HIGH-FIDELITY FAKE
  const fontSize = headliner.length > 20 ? '0.7rem' : headliner.length > 12 ? '0.9rem' : '1.1rem';

  return (
    <div style={{ 
      width: 280, height: 130, background: tpl.bg, borderRadius: '2px', 
      display: 'flex', color: tpl.ink, fontFamily: "'Courier New', Courier, monospace",
      boxShadow: '4px 8px 20px rgba(0,0,0,0.4)', position: 'relative', 
      overflow: 'hidden', border: `1px solid ${hexToRgba(tpl.ink, 0.1)}`,
      transform: 'rotate(-1.5deg)', userSelect: 'none'
    }}>
      {/* 🎭 Texture Overlay (Dust/Grain) */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.03, backgroundImage: `url("https://www.transparenttextures.com/patterns/dust.png")`, pointerEvents: 'none' }} />

      {/* Main Info Section */}
      <div style={{ flex: 1, padding: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRight: `1.5px dotted ${hexToRgba(tpl.ink, 0.2)}` }}>
        <div>
          <div style={{ fontSize: '6px', fontWeight: 900, color: tpl.accent, letterSpacing: 1, marginBottom: 4 }}>
            {tpl.label} // ADMIT ONE
          </div>
          <div style={{ 
            fontSize: fontSize, 
            fontWeight: 900, 
            lineHeight: 1, 
            wordBreak: 'break-word',
            maxHeight: '45px',
            overflow: 'hidden'
          }}>
            {headliner}
          </div>
        </div>

        <div style={{ fontSize: '7px', fontWeight: 700, opacity: 0.8, lineHeight: 1.3 }}>
          <div style={{ color: tpl.accent }}>{event.venue?.toUpperCase()}</div>
          <div>{event.city?.toUpperCase()}, {event.state}</div>
          <div style={{ marginTop: 4, borderTop: `1px solid ${hexToRgba(tpl.ink, 0.1)}`, paddingTop: 4 }}>
            DATE: {fmtDateShort(event.date).toUpperCase()}
          </div>
        </div>
      </div>

      {/* 🧾 The Stub Section (Far Right) */}
      <div style={{ width: '60px', background: 'rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10px 5px' }}>
        {/* Vertical Text */}
        <div style={{ 
          fontSize: '7px', transform: 'rotate(-90deg)', whiteSpace: 'nowrap', 
          fontWeight: 900, marginBottom: 10, opacity: 0.5, letterSpacing: 1 
        }}>
          SEC: GA | ROW: 01
        </div>
        
        {/* 🔢 Vertical Barcode */}
        <div style={{ display: 'flex', gap: '1.5px', height: '50px' }}>
          {[2, 4, 1, 3, 2, 5, 1, 2].map((w, i) => (
            <div key={i} style={{ width: w, background: tpl.ink, opacity: 0.7, borderRadius: '0.5px' }} />
          ))}
        </div>
      </div>

      {/* Top/Bottom Perforation Notches */}
      <div style={{ position: 'absolute', right: '56px', top: '-6px', width: '12px', height: '12px', borderRadius: '50%', background: '#050508', boxShadow: 'inset 0 -2px 3px rgba(0,0,0,0.3)' }} />
      <div style={{ position: 'absolute', right: '56px', bottom: '-6px', width: '12px', height: '12px', borderRadius: '50%', background: '#050508', boxShadow: 'inset 0 2px 3px rgba(0,0,0,0.3)' }} />
    </div>
  );
}
// ─── CLEAN TICKET STUB (No Sidecar) ──────────────────────────────────────────
function TicketStubCard({ event, onEdit, genreMap, stubIdx }) {
  const gi = getConcertGenreInfo(event, genreMap);
  return (
    <div 
      onClick={() => onEdit(event)}
      style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
    >
      <DecorativeTicket event={event} templateIdx={stubIdx % 3} />
    </div>
  );
}

// ─── CLEAN WRISTBAND (Lineup Edition - No Sidecar) ────────────────────────────
function WristbandCard({ event, genreMap, compact, onEdit }) {
  const gi = getConcertGenreInfo(event, genreMap);
  const themeColor = gi.mixed ? '#9d00ff' : (gi.color || C.teal);
  
  // Logic to handle the lineup display
  const bands = event.bands || [];
  const lineup = bands.map(b => getBandName(b)).filter(Boolean).join(' · ').toUpperCase();
  return (
    <div 
      onClick={onEdit ? () => onEdit(event) : null}
      style={{ 
        width: '100%', 
        background: '#1a1a1a', 
        borderRadius: 8, 
        border: `1.5px solid ${themeColor}`,
        boxShadow: `0 0 20px ${hexToRgba(themeColor, 0.15)}`,
        overflow: 'hidden',
        cursor: onEdit ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        position: 'relative'
      }}
      onMouseEnter={onEdit ? (e) => e.currentTarget.style.borderColor = '#fff' : null}
      onMouseLeave={onEdit ? (e) => e.currentTarget.style.borderColor = themeColor : null}
    >
      {/* Mini Wristband Header */}
      <div style={{ background: themeColor, height: compact ? 6 : 8 }} />
      
      <div style={{ padding: compact ? '12px' : '20px', textAlign: 'center' }}>
        <div style={{ 
          fontFamily: "'Bebas Neue'", 
          fontSize: compact ? '0.9rem' : '1.4rem', 
          color: themeColor, 
          letterSpacing: '2px',
          lineHeight: 1
        }}>
          {event.festival_name?.toUpperCase() || 'FESTIVAL'}
        </div>
        
        <div style={{ 
          fontFamily: "'Space Mono'", 
          fontSize: compact ? '9px' : '10px', 
          color: '#fff', 
          marginTop: 4, 
          opacity: 0.6 
        }}>
          {event.festival_day?.toUpperCase() || 'ALL DAYS'}
        </div>

        {/* 🟢 THE LINEUP BAR (The Fix) */}
        {bands.length > 0 && (
          <div style={{ 
            marginTop: compact ? 10 : 15,
            paddingTop: compact ? 10 : 15,
            borderTop: `1px solid ${hexToRgba(themeColor, 0.2)}`,
            fontFamily: "'Space Mono'",
            fontSize: compact ? '8px' : '11px',
            color: '#fff',
            lineHeight: 1.4,
            letterSpacing: '0.5px',
            opacity: 0.9
          }}>
            {lineup}
          </div>
        )}
      </div>
    </div>
  );
}
// 🛠️ HELPER: Turns "url1, url2" into a clean array [url1, url2]
const parseMedia = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  return val.split(',').map(u => u.trim()).filter(Boolean);
};
// ─── 2. SETLIST VAULT (FULL-IMAGE & BULLSEYE SEARCH) ────────────────────────
function SetlistVaultTab({ concerts, genreMap }) {
  // 1. CRITICAL SAFETY CHECK: Prevent crash if data is missing/loading
  if (!concerts || !Array.isArray(concerts)) {
    return (
      // Inside SetlistVaultTab, find the image container
<div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
  {parseMedia(c.setlist_image_url).map((url, idx) => (
    <img 
      key={idx}
      src={url} 
      alt="Setlist" 
      style={{ 
        maxWidth: '100%', 
        height: 'auto', 
        border: `1px solid ${C.border}`,
        filter: 'grayscale(1) contrast(1.2)' // Keeps that "Stage Artifact" vibe
      }} 
    />
  ))}
</div>
    );
  }

  const setlists = useMemo(() => {
    const results = [];
    concerts.forEach(c => {
      if (!c || !c.has_setlist_names?.trim()) return;
      
      const bands = c.has_setlist_names.split(',').map(b => b.trim()).filter(Boolean);
      const rawImages = c.setlist_image_url || c.image_url || '';
      const images = rawImages.split(',').map(img => img.trim()).filter(Boolean);
      
      bands.forEach((band, idx) => {
        const img = images[idx] || (images.length === 1 ? images[0] : null);
        results.push({ 
          id: `${c.id}-${band}`, 
          band, 
          date: c.date || '', 
          venue: c.venue || 'UNKNOWN VENUE', 
          image_url: img 
        });
      });
    });
    // Sort by date (descending)
    return results.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }, [concerts]);

  // 2. EMPTY STATE
  if (setlists.length === 0) {
    return (
      <div style={{ padding: '120px 0', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📁</div>
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: '2.5rem', color: C.white || '#fff', letterSpacing: '2px' }}>
          VAULT EMPTY
        </div>
        <div style={{ fontFamily: "'Space Mono'", fontSize: '10px', color: C.gray || '#8899aa', marginTop: '10px' }}>
          ARCHIVE EMPTY // AWAITING SIGNAL
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 0' }} className="fade-in">
      {/* HEADER */}
      <div style={{ textAlign: 'center', marginBottom: 60 }}>
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: '4.5rem', color: C.white || '#fff', lineHeight: 1 }}>
          SETLIST <span style={{ color: C.gold || '#ffcc00' }}>VAULT</span>
        </div>
        <div style={{ fontFamily: "'Space Mono'", fontSize: '10px', color: C.gray || '#8899aa', marginTop: 15, letterSpacing: '4px', fontWeight: 900 }}>
          {setlists.length} ARTIFACTS ARCHIVED // LIVE SIGNAL DETECTED
        </div>
      </div>

      {/* GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '60px', alignItems: 'start' }}>
        {setlists.map((s, i) => {
          // Dynamic rotations for the "scattered paper" look
          const rotation = (i % 2 === 0 ? 1 : -1) * (i % 3 + 1);
          
          // Bulletproof search URL construction
          const [yr, mo, dy] = (s.date || '2026-01-01').split('-');
          const searchUrl = `https://www.setlist.fm/search?query=${encodeURIComponent(`${s.band} ${mo}/${dy}/${yr}`)}`;

          return (
            <div key={s.id} style={{ 
              position: 'relative', 
              transform: `rotate(${rotation}deg)`,
              transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              zIndex: 1
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'scale(1.06) rotate(0deg)';
              e.currentTarget.style.zIndex = 100;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = `rotate(${rotation}deg)`;
              e.currentTarget.style.zIndex = 1;
            }}
            >
              {/* 📄 THE PAPER CONTAINER */}
              <div style={{ 
                background: '#fdfdfd', 
                padding: '12px', 
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)', 
                borderRadius: 2,
                border: '1px solid #e0e0e0'
              }}>
                
                {/* Visual "Blue Painter's Tape" */}
                <div style={{ 
                  position: 'absolute', top: -12, left: '35%', width: '30%', height: '22px', 
                  background: 'rgba(0, 110, 255, 0.3)', backdropFilter: 'blur(1px)', 
                  transform: 'rotate(-1deg)', zIndex: 10, border: '1px solid rgba(255,255,255,0.2)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }} />
                
                {/* High-Contrast Artist Header */}
                <div style={{ 
                  padding: '14px 6px', textAlign: 'center', background: '#111', 
                  color: '#fff', fontFamily: "'Bebas Neue'", fontSize: '1.8rem', 
                  marginBottom: 12, letterSpacing: '1px' 
                }}>
                  {s.band.toUpperCase()}
                </div>

                {/* IMAGE AREA */}
                {s.image_url ? (
                  <div style={{ width: '100%', overflow: 'hidden', border: '1px solid #eee', background: '#f0f0f0' }}>
                    <img 
                      src={s.image_url} 
                      alt={s.band} 
                      loading="lazy"
                      style={{ 
                        width: '100%', 
                        height: 'auto', 
                        display: 'block',
                        filter: 'sepia(0.08) contrast(1.05)',
                        mixBlendMode: 'multiply' // Makes the paper texture show through the image
                      }} 
                    />
                  </div>
                ) : (
                  <div style={{ height: '220px', background: '#f5f0e8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: '10px', fontFamily: "'Space Mono'", textAlign: 'center', padding: 25, border: '1px dashed #ccc' }}>
                    [ ARTIFACT IMAGE MISSING ]
                  </div>
                )}

                {/* Footer Metadata */}
                <div style={{ padding: '18px 10px 8px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid #eee', marginTop: 5 }}>
                  <div style={{ color: '#000', fontSize: '10px', fontFamily: "'Space Mono'", fontWeight: 900, lineHeight: 1.5 }}>
                    {typeof fmtDateShort === 'function' ? fmtDateShort(s.date) : s.date}<br/>
                    <span style={{ opacity: 0.5, fontSize: '8px' }}>{s.venue.toUpperCase()}</span>
                  </div>
                  
                  <a 
                    href={searchUrl}
                    target="_blank" rel="noreferrer"
                    style={{ 
                      fontFamily: "'Space Mono'", fontSize: '9px', color: '#006eff', 
                      textDecoration: 'none', borderBottom: '2px solid rgba(0,110,255,0.2)',
                      paddingBottom: 2, fontWeight: 900, letterSpacing: '0.5px'
                    }}
                  >
                    DIGITAL LOG ↗
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
// ─── 3. TIMELINE TAB ──────────────────────────────────────────────────────────
function GenreLegend() {
  return (
    <div style={{ display:'flex', flexWrap:'wrap', gap:15, justifyContent:'center', padding:20, background: hexToRgba(C.bgCard, 0.5), borderRadius:12, margin:'0 auto 40px auto', maxWidth:900, border:`1px solid ${C.border}` }}>
      {Object.entries(GENRE_COLORS).map(([name,color]) => (
        <div key={name} style={{ display:'flex', alignItems:'center', gap:6 }}><div style={{ width:8, height:8, borderRadius:'50%', background:color }} /><span style={{ fontFamily:"'Space Mono'", fontSize:9, color:C.gray }}>{name.toUpperCase()}</span></div>
      ))}
    </div>
  );
}

// ─── 1. TIMELINE DOT ────────────────────────────────────────────────────────
// ─── 1. TIMELINE DOT (Full Lineup Edition) ───────────────────────────────────
function TimelineDot({ item, onTeleport, genreMap, xPos }) {
  const [isHovered, setIsHovered] = useState(false);
  if (!item || !item.date) return null;

  const gi = getConcertGenreInfo(item, genreMap);
  const themeColor = gi.mixed ? '#9d00ff' : (gi.color || C.teal);
  
  // 🟢 Logic to join all bands for the display title
  const bands = item.bands || [];
  const lineupTitle = bands.length > 0 ? bands.map(b => getBandName(b)).filter(Boolean).join(' · ').toUpperCase() : 'UNKNOWN ARTIST';

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onTeleport}
      style={{
        position: 'absolute',
        left: (xPos || 0) - 5,
        top: '50%',
        transform: 'translateY(-50%)',
        width: 10,
        height: 10,
        zIndex: isHovered ? 1000 : 50,
        cursor: 'pointer',
      }}
    >
      <div style={{
        width: isHovered ? 12 : 8,
        height: isHovered ? 12 : 8,
        borderRadius: '50%',
        background: themeColor,
        border: `1.5px solid ${isHovered ? '#fff' : hexToRgba(themeColor, 0.7)}`,
        boxShadow: `0 0 ${isHovered ? 20 : 5}px ${themeColor}`,
        transition: 'all 0.15s ease',
        position: 'relative',
        top: '50%',
        transform: 'translateY(-50%)',
      }} />

      {isHovered && (
        <div className="fade-in" style={{
          position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: 400, padding: 20, background: C.bgCard, borderRadius: 12,
          border: `2px solid ${themeColor}`, boxShadow: `0 0 80px rgba(0,0,0,1)`,
          zIndex: 9999, pointerEvents: 'none',
        }}>
          {item.is_festival ? (
            <WristbandCard event={item} genreMap={genreMap} compact={false} />
          ) : (
            <div style={{ background: '#e8dfa0', borderRadius: 3, overflow: 'hidden', color: '#1a1a1a', marginBottom: 15 }}>
               <div style={{ background: '#8b0000', height: 6 }} />
               <div style={{ padding: '8px 12px', fontFamily: "'Courier New', monospace" }}>
                 <div style={{ fontSize: 7, fontWeight: 900, color: '#8b0000' }}>ADMIT ONE</div>
                 {/* Show full lineup on the mini ticket too */}
                 <div style={{ fontSize: 14, fontWeight: 900, textTransform: 'uppercase', lineHeight: 1.1 }}>{lineupTitle}</div>
               </div>
            </div>
          )}
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 15, marginTop: 10 }}>
            <div style={{ flex: 1 }}>
              {/* 🟢 THE FIXED HEADER: Now shows the full lineup */}
              <div style={{ 
                fontFamily: "'Bebas Neue'", 
                fontSize: bands.length > 2 ? '1.3rem' : '1.7rem', // Auto-shrink if lineup is long
                color: '#fff', 
                lineHeight: 1.1 
              }}>
                {lineupTitle}
              </div>
              <div style={{ fontFamily: "'Space Mono'", fontSize: 9, color: C.gray, marginTop: 4 }}>
                {item.venue?.toUpperCase()} — {fmtDateShort(item.date)}
              </div>
            </div>
            <GenreBadge genre={gi.genre} color={gi.color} small />
          </div>

          {/* Add a little "Memory Indicator" if you have a photo for this show */}
          {item.personal_photo_url && (
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 5 }}>
               <span style={{ fontSize: '10px' }}>📸</span>
               <span style={{ fontFamily: "'Space Mono'", fontSize: '7px', color: C.teal, letterSpacing: '1px' }}>PHOTO ARCHIVED</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
// ─── 2. PANORAMIC TIMELINE TAB (High-Contrast Years & Months) ──────────────
// ─── 2. PANORAMIC TIMELINE TAB (With Jump Drive Navigation) ──────────────
function TimelineTab({ concerts, setActiveTab, genreMap }) {
  const scrollRef = useRef(null);
  const [currentYear, setCurrentYear] = useState(null);
  const [showNavigator, setShowNavigator] = useState(true); // Control the entry overlay
  const PX_PER_DAY = 3.5; 

  const data = useMemo(() => {
    if (!concerts?.length) return { sortedShows: [], yearBlocks: [], monthMarkers: [], highlights: [], totalWidth: 0 };

    const sorted = [...concerts].filter(c => c && c.date).sort((a, b) => a.date.localeCompare(b.date));
    const firstDate = new Date(sorted[0].date + 'T12:00:00');
    const lastDate = new Date(sorted[sorted.length - 1].date + 'T12:00:00');
    const minTs = firstDate.getTime();
    const MS_PER_DAY = 86400000;
    const PADDING = 600; // Increased padding for better start/end views

    const dateToX = (dateStr) => (PADDING + Math.round((new Date(dateStr + 'T12:00:00').getTime() - minTs) / MS_PER_DAY) * PX_PER_DAY);
    const totalWidth = PADDING * 2 + Math.round((lastDate.getTime() - minTs) / MS_PER_DAY) * PX_PER_DAY;
    const withX = sorted.map((s, i) => ({ ...s, globalIndex: i, xPos: dateToX(s.date) }));

    const yearBlocks = [];
    for (let yr = firstDate.getFullYear(); yr <= lastDate.getFullYear(); yr++) {
      const xStart = dateToX(`${yr}-01-01`);
      const xEnd = dateToX(`${yr}-12-31`);
      yearBlocks.push({ year: yr, x: xStart, width: xEnd - xStart, isAlt: yr % 2 === 1 });
    }

    const monthMarkers = [];
    const MONTHS_LBL = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
    let iter = new Date(firstDate.getFullYear(), firstDate.getMonth(), 1);
    while (iter <= lastDate) {
      const ds = iter.toISOString().split('T')[0];
      monthMarkers.push({ x: dateToX(ds), label: MONTHS_LBL[iter.getMonth()], isJan: iter.getMonth() === 0 });
      iter.setMonth(iter.getMonth() + 1);
    }

    const highlights = [];
    const laneLastX = { up: [-1000,-1000,-1000,-1000], down: [-1000,-1000,-1000,-1000] };
    const MIN_GAP = 140;

    // Highlights logic remains same...
    const festGroups = [];
    withX.forEach(s => {
      if (s.is_festival) {
        const last = festGroups[festGroups.length-1];
        if (last && last.name === s.festival_name && getYear(last.date) === getYear(s.date)) last.shows.push(s);
        else festGroups.push({ name: s.festival_name, date: s.date, shows: [s] });
      }
    });
    festGroups.forEach((fg, i) => {
      const x = fg.shows.reduce((a, s) => a + s.xPos, 0) / fg.shows.length;
      const side = i % 2 === 0 ? 'up' : 'down';
      for (let l=0; l<4; l++) {
        if (x - laneLastX[side][l] > MIN_GAP) {
          highlights.push({ label: fg.name, x, date: fg.date, color: C.gold, side, lane: l });
          laneLastX[side][l] = x + 40; break;
        }
      }
    });
    withX.forEach((s, i) => {
      if (s.is_festival) return;
      const side = i % 2 === 0 ? 'up' : 'down';
      for (let l=0; l<4; l++) {
        if (s.xPos - laneLastX[side][l] > MIN_GAP) {
          highlights.push({ label: getBandName((s.bands||[''])[0]), x: s.xPos, date: s.date, color: getConcertGenreInfo(s, genreMap).color || C.teal, side, lane: l });
          laneLastX[side][l] = s.xPos; break;
        }
      }
    });

    return { sortedShows: withX, yearBlocks, monthMarkers, highlights, totalWidth };
  }, [concerts, genreMap]);

  // 🟢 TELEPORT FUNCTION
  const jumpTo = (targetX) => {
    setShowNavigator(false);
    setTimeout(() => {
      if (scrollRef.current) {
        const centerOffset = scrollRef.current.clientWidth / 2;
        scrollRef.current.scrollTo({
          left: targetX - centerOffset,
          behavior: 'smooth'
        });
      }
    }, 100);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !data.sortedShows.length) return;
    const onScroll = () => {
      const cx = el.scrollLeft + el.clientWidth / 2;
      const closest = data.sortedShows.reduce((best, s) => {
        const d = Math.abs(s.xPos - cx);
        return d < best.d ? { s, d } : best;
      }, { s: null, d: Infinity }).s;
      if (closest) setCurrentYear(getYear(closest.date));
    };
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, [data.sortedShows]);

  return (
    <div style={{ padding: '20px 0', position: 'relative' }} className="fade-in">
      <GenreLegend />

      {/* 🟢 JUMP DRIVE OVERLAY */}
      {showNavigator && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 2000, 
          background: 'rgba(5,5,8,0.95)', backdropFilter: 'blur(10px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          borderRadius: 16, border: `1px solid ${C.border}`
        }}>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: '4rem', color: '#fff', marginBottom: 10, letterSpacing: 4 }}>TIME MACHINE JUMP</div>
          <div style={{ fontFamily: "'Space Mono'", fontSize: 10, color: C.teal, marginBottom: 40, letterSpacing: 2 }}>SELECT TEMPORAL DESTINATION</div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20, width: '100%', maxWidth: 600 }}>
            <button onClick={() => jumpTo(data.sortedShows[0].xPos)} style={navBtnSt}>
              <span style={navIconSt}>📜</span>
              <span style={navLabelSt}>FIRST RECORD</span>
              <span style={navSubSt}>{getYear(data.sortedShows[0].date)}</span>
            </button>

            <button onClick={() => jumpTo(data.sortedShows[data.sortedShows.length - 1].xPos)} style={navBtnSt}>
              <span style={navIconSt}>⚡</span>
              <span style={navLabelSt}>MOST RECENT</span>
              <span style={navSubSt}>{getYear(data.sortedShows[data.sortedShows.length - 1].date)}</span>
            </button>

            <button onClick={() => {
              const rand = data.sortedShows[Math.floor(Math.random() * data.sortedShows.length)];
              jumpTo(rand.xPos);
            }} style={navBtnSt}>
              <span style={navIconSt}>🎲</span>
              <span style={navLabelSt}>RANDOM POINT</span>
              <span style={navSubSt}>LUCK OF THE DRAW</span>
            </button>

            <div style={{ ...navBtnSt, cursor: 'default' }}>
              <span style={navIconSt}>🗓️</span>
              <span style={navLabelSt}>SPECIFIC YEAR</span>
              <select 
                onChange={(e) => {
                  const block = data.yearBlocks.find(b => b.year === parseInt(e.target.value));
                  if (block) jumpTo(block.x + (block.width / 2));
                }}
                style={{ background: '#000', border: `1px solid ${C.teal}`, color: '#fff', fontFamily: "'Space Mono'", fontSize: 10, padding: '4px 8px', marginTop: 5, borderRadius: 4 }}
              >
                <option value="">SELECT...</option>
                {data.yearBlocks.map(yb => <option key={yb.year} value={yb.year}>{yb.year}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* 🟢 RE-JUMP TRIGGER (Bottom Corner) */}
      {!showNavigator && (
        <button 
          onClick={() => setShowNavigator(true)}
          style={{ position: 'absolute', bottom: 40, right: 40, zIndex: 1001, background: '#000', border: `2px solid ${C.teal}`, borderRadius: '50%', width: 50, height: 50, cursor: 'pointer', boxShadow: `0 0 20px ${C.teal}66`, fontSize: '1.5rem' }}
        >
          🚀
        </button>
      )}

      <div style={{ position: 'absolute', top: 80, left: 40, zIndex: 1000, pointerEvents: 'none' }}>
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: '4.5rem', color: C.teal, opacity: 0.6, textShadow: `0 0 20px ${C.teal}44` }}>{currentYear}</div>
      </div>

      <div ref={scrollRef} style={{ 
        width: '100%', height: '750px', overflowX: 'auto', overflowY: 'hidden', 
        background: 'rgba(0,0,0,0.5)', border: `1px solid ${C.border}`, borderRadius: 16, position: 'relative' 
      }}>
        <div style={{ width: data.totalWidth, height: '100%', position: 'relative' }}>
          {/* ... [Rest of the Timeline SVG/Dot rendering remains identical] ... */}
          <div style={{ position: 'absolute', top: '50%', left: 0, width: '100%', height: 2, background: `linear-gradient(90deg, transparent, ${C.teal}66, ${C.purple}66, transparent)`, zIndex: 10, transform: 'translateY(-50%)' }} />
          {data.yearBlocks.map(yb => (
            <div key={yb.year} style={{ position: 'absolute', left: yb.x, top: 0, bottom: 0, width: yb.width, zIndex: 5, pointerEvents: 'none', borderLeft: `2px solid ${yb.isAlt ? C.purple : C.teal}44` }}>
              <div style={{ position: 'sticky', left: 40, width: 'fit-content', top: yb.isAlt ? '62%' : '22%' }}>
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: '9rem', color: `${yb.isAlt ? C.purple : C.teal}33`, textShadow: `0 0 30px ${yb.isAlt ? C.purple : C.teal}22`, whiteSpace: 'nowrap' }}>{yb.year}</div>
              </div>
            </div>
          ))}
          {data.monthMarkers.map(mm => (
            <div key={`${mm.x}-${mm.label}`} style={{ position: 'absolute', left: mm.x, top: '50%', transform: 'translateY(-50%)', zIndex: 11 }}>
              <div style={{ width: 2, height: mm.isJan ? 35 : 18, background: mm.isJan ? C.teal : C.grayDim, boxShadow: mm.isJan ? `0 0 10px ${C.teal}` : 'none', opacity: 0.8 }} />
              <div style={{ position: 'absolute', top: 22, left: -12, fontFamily: "'Space Mono'", fontSize: '11px', color: mm.isJan ? C.teal : C.gray, fontWeight: 900, transform: 'rotate(-45deg)', whiteSpace: 'nowrap' }}>{mm.label}</div>
            </div>
          ))}
          {data.highlights.map((h, i) => {
            const laneH = 40 - (h.lane * 8); 
            return (
              <div key={i} style={{ position: 'absolute', left: h.x, top: h.side === 'up' ? `${50 - laneH}%` : '50%', height: `${laneH}%`, zIndex: 100, pointerEvents: 'none' }}>
                <div style={{ width: 2, height: '100%', background: `linear-gradient(${h.side === 'up' ? 'to top' : 'to bottom'}, ${h.color}, transparent)`, boxShadow: `0 0 15px ${h.color}`, opacity: 0.8 }} />
                <div style={{ position: 'absolute', left: 12, [h.side === 'up' ? 'top' : 'bottom']: -15, whiteSpace: 'nowrap' }}>
                  <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.3rem', color: '#fff', textShadow: '2px 2px 4px #000' }}>{h.label?.toUpperCase()}</div>
                  <div style={{ fontFamily: "'Space Mono'", fontSize: 8, color: h.color, fontWeight: 900 }}>{fmtDateShort(h.date)}</div>
                </div>
              </div>
            );
          })}
          {data.sortedShows.map(show => (
            <TimelineDot key={show.id} item={show} xPos={show.xPos} onTeleport={() => setActiveTab('byDay')} genreMap={genreMap} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── NAVIGATOR STYLES ───
const navBtnSt = {
  background: 'rgba(255,255,255,0.03)',
  border: `1px solid ${hexToRgba('#fff', 0.1)}`,
  borderRadius: 12,
  padding: '30px 20px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s ease'
};
const navIconSt = { fontSize: '2rem', marginBottom: 10 };
const navLabelSt = { fontFamily: "'Bebas Neue'", fontSize: '1.5rem', color: '#fff', letterSpacing: 1 };
const navSubSt = { fontFamily: "'Space Mono'", fontSize: 8, color: C.teal, marginTop: 5, letterSpacing: 2 };

// ─── 4. MEDIA COMPONENTS (SCRAPBOOK EXPANSION) ───────────────────────────────

// 📄 The Upgraded "Taped-Up" Setlist (Handles Multiple)
// 📄 The Upgraded "Taped-Up" Setlist (Handles Multiple)
// ─── 1. MEDIA COMPONENTS (TRIPLE-THREAT ARCHIVE) ─────────────────────────────

// 💡 SHARED LIGHTBOX (The High-Fidelity Viewer)
// ─── 💡 THE HIGH-FIDELITY LIGHTBOX ──────────────────────────────────────────
function Lightbox({ src, caption, onClose, type }) {
  return (
    <div 
      onClick={onClose} 
      style={{ 
        position: 'fixed', 
        inset: 0, 
        background: 'rgba(0,0,0,0.98)', 
        zIndex: 10000, // Ensure it's above everything
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        cursor: 'zoom-out', 
        padding: '40px',
        animation: 'fade-in 0.2s ease-out'
      }}
    >
      <div 
        onClick={(e) => { e.stopPropagation(); setIsFull(true); }} // Prevents closing when clicking the image
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          maxWidth: '95vw', 
          maxHeight: '95vh' 
        }}
      >
        <img 
          src={src} 
          alt="Enlarged Artifact"
          style={{ 
            maxWidth: '100%', 
            maxHeight: '80vh', 
            objectFit: 'contain', 
            boxShadow: '0 20px 80px rgba(0,0,0,1)',
            border: type === 'POLAROID' ? '15px solid #fff' : '2px solid #333',
            borderRadius: type === 'POLAROID' ? '2px' : '4px'
          }} 
        />
        {caption && (
          <div style={{ 
            fontFamily: "'Bebas Neue'", 
            fontSize: '2.5rem', 
            color: '#fff', 
            marginTop: '20px', 
            textAlign: 'center',
            textShadow: '0 4px 15px rgba(0,0,0,0.5)'
          }}>
            {caption}
          </div>
        )}
        <div style={{ marginTop: 15, fontFamily: "'Space Mono'", fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: 2 }}>
          CLICK ANYWHERE TO DISMISS
        </div>
      </div>
    </div>
  );
}

// ─── 📄 STACKED SETLISTS ────────────────────────────────────────────────────
function SetlistPaper({ src, index = 0, total = 1 }) {
  const [isFull, setIsFull] = React.useState(false);
  if (!src) return null;

  const rotation = (index % 2 === 0 ? -1.5 : 1.5) + (index * 0.5);
  const xOffset = index * -20;

  return (
    <>
      <div 
        onClick={() => setIsFull(true)}
        style={{
          width: '120px', height: '160px', background: '#fdfdfd', 
          boxShadow: '2px 5px 15px rgba(0,0,0,0.4)',
          transform: `rotate(${rotation}deg) translateX(${xOffset}px)`, 
          padding: '5px', position: 'relative',
          marginRight: index === total - 1 ? '0' : '-30px', 
          flexShrink: 0, zIndex: 5 + index, border: '1px solid #eee', 
          cursor: 'zoom-in', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        onMouseEnter={e => { 
          e.currentTarget.style.transform = `rotate(0deg) scale(1.1) translateY(-10px)`; 
          e.currentTarget.style.zIndex = 1000; 
        }}
        onMouseLeave={e => { 
          e.currentTarget.style.transform = `rotate(${rotation}deg) translateX(${xOffset}px)`; 
          e.currentTarget.style.zIndex = 5 + index; 
        }}
      >
        <div style={{ 
          position: 'absolute', top: -10, left: '25%', width: '40px', height: '14px', 
          background: 'rgba(0, 100, 255, 0.4)', backdropFilter: 'blur(1px)', 
          transform: 'rotate(2deg)', border: '1px solid rgba(0,100,255,0.1)' 
        }} />
        <div style={{ 
          width: '100%', height: '100%', 
          background: `url(${src}) center/cover no-repeat`, 
          filter: 'sepia(0.05) contrast(1.05)' 
        }} />
      </div>
      {isFull && <Lightbox src={src} onClose={() => setIsFull(false)} type="SETLIST" />}
    </>
  );
}

// ─── 📸 STACKED POLAROIDS (PHYSICS & 3D EDITION) ────────────────────────────────
function PersonalPolaroid({ src, caption, date, venue, index = 0, onZoom }) {
  if (!src) return null;

  const markerColors = ['#1a1a1a', '#2140ab', '#b02525', '#1e6337', '#732ba1', '#cc6600'];
  const myColor = markerColors[index % markerColors.length];

  return (
    <div 
      className="polaroid-gravity-swing"
      style={{
        padding: '12px 12px 55px 12px', // 🟢 Tightened bottom (was 75px)
        background: '#fff', 
        boxShadow: '0 15px 40px rgba(0,0,0,0.5), 0 0 5px rgba(0,0,0,0.1)',
        width: '320px', 
        border: '1px solid #efefef', 
        position: 'relative'
      }}
    >
      {/* 📌 THE THUMB TACK */}
      <div style={{
        position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
        width: 20, height: 20, background: '#d11111', borderRadius: '50%',
        boxShadow: 'inset -4px -4px 6px rgba(0,0,0,0.5), 2px 8px 12px rgba(0,0,0,0.4)',
        zIndex: 100, border: '1px solid #900'
      }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 4, height: 4, background: '#400', borderRadius: '50%', opacity: 0.5 }} />
        <div className="tack-shine" />
      </div>

      {/* PHOTO AREA */}
      <div className="polaroid-frame" style={{ 
        width: '100%', aspectRatio: '1/1', 
        background: `url(${src}) center/cover no-repeat`,
        border: '1px solid rgba(0,0,0,0.1)'
      }} />

      {/* 🖊️ HANDWRITTEN LABELS */}
      <div style={{ 
        fontFamily: "'Caveat', cursive", textAlign: 'center', 
        marginTop: '15px', color: myColor, padding: '0 5px'
      }}>
        <div style={{ fontSize: '2.3rem', fontWeight: 700, lineHeight: 0.8, transform: 'rotate(-1.5deg)', marginBottom: 6 }}>
          {caption}
        </div>
        <div style={{ fontSize: '1.1rem', opacity: 0.9, transform: 'rotate(1deg)', fontWeight: 600 }}>
          {date ? fmtDateShort(date) : ''} — {venue?.split(',')[0].toUpperCase()}
        </div>
      </div>
    </div>
  );
}
// ─── 4. BY DAY TAB (SCRAPBOOK EDITION - FULL MULTI-MEDIA) ────────────────────
// ─── 4. BY DAY TAB (SCRAPBOOK TIMELINE & FESTIVAL CLUSTERS) ──────────────────

// ─── 4. BY DAY TAB (SCRAPBOOK TIMELINE & MULTI-SET LOGIC) ──────────────────

function ByDayTab({ dayGroups, onEdit, genreMap, isAdmin }) {
  // 🟢 Mobile Detection
  const isMobile = window.innerWidth < 768;

  const clusters = useMemo(() => {
    const results = [];
    let currentFestKey = null;
    let currentGroup = [];

    dayGroups.forEach((event) => {
      const festKey = event.is_festival 
        ? `${event.festival_name}-${new Date(event.date).getFullYear()}` 
        : null;

      if (festKey && festKey === currentFestKey) {
        currentGroup.push(event);
      } else {
        if (currentGroup.length) results.push({ type: 'festival', events: currentGroup });
        if (festKey) {
          currentFestKey = festKey;
          currentGroup = [event];
        } else {
          currentFestKey = null;
          currentGroup = [];
          results.push({ type: 'solo', event });
        }
      }
    });
    if (currentGroup.length) results.push({ type: 'festival', events: currentGroup });
    return results;
  }, [dayGroups]);

  return (
    <div style={{ padding: isMobile ? '10px' : '24px 0' }} className="fade-in">
      <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '30px' : '60px' }}>
        {clusters.map((cluster, ci) => {
          if (cluster.type === 'solo') {
            return (
              <ScrapbookRow 
                key={cluster.event.id} 
                event={cluster.event} 
                idx={ci} 
                isAdmin={isAdmin} 
                onEdit={onEdit} 
                genreMap={genreMap} 
              />
            );
          }

          const firstEvent = cluster.events[0];
          const festColor = GENRE_COLORS[genreMap[firstEvent.bands?.[0]]] || C.teal;

          return (
            <div key={`cluster-${ci}`} style={{ 
              position: 'relative', 
              padding: isMobile ? '20px 15px' : '40px', // 🟢 Tighter padding on mobile
              background: 'rgba(255,255,255,0.01)', 
              border: `1px solid ${hexToRgba(festColor, 0.2)}`, 
              borderRadius: isMobile ? '12px' : '24px',
              boxShadow: `inset 0 0 60px ${hexToRgba(festColor, 0.03)}`
            }}>
              {/* SHARED FESTIVAL HEADER AREA */}
              <div style={{ 
                display: 'flex', 
                flexDirection: isMobile ? 'column' : 'row', // 🟢 Stack header on mobile
                alignItems: isMobile ? 'flex-start' : 'baseline', 
                gap: isMobile ? '5px' : '25px', 
                marginBottom: isMobile ? '25px' : '40px' 
              }}>
                <div style={{ 
                  fontFamily: "'Bebas Neue'", 
                  fontSize: isMobile ? '2.5rem' : '5rem', // 🟢 Shrunken font
                  color: festColor, 
                  lineHeight: 1, 
                  textShadow: `0 0 30px ${hexToRgba(festColor, 0.3)}` 
                }}>
                  {firstEvent.festival_name.toUpperCase()}
                </div>
                <div style={{ fontFamily: "'Space Mono'", fontSize: '10px', color: C.gray, letterSpacing: '2px', fontWeight: 900 }}>
                  {new Date(firstEvent.date).getFullYear()} // {cluster.events.length} DAYS
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {cluster.events.map((event, ei) => (
                  <ScrapbookRow 
                    key={event.id} 
                    event={event} 
                    idx={ei} 
                    isAdmin={isAdmin} 
                    onEdit={onEdit} 
                    genreMap={genreMap} 
                    isClustered={true}
                    clusterColor={festColor}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── 🖼️ THE SCRAPBOOK ROW COMPONENT (With Multi-Artist Setlinks) ─────────────

// ─── 🖼️ THE SCRAPBOOK ROW COMPONENT (With "I Was There" Trigger) ─────────────

function ScrapbookRow({ event, idx, isAdmin, onEdit, genreMap, isClustered = false, clusterColor = null }) {
  const isMobile = window.innerWidth < 768;
  const venueLabel = event.is_festival ? event.festival_name : event.venue;
  const primaryColor = clusterColor || C.teal;
  
  // 🛰️ DATA SCAVENGING
  const finalSetlists = (event.setlist_image_url || "").split(',').map(u => u.trim()).filter(Boolean);
  const finalPhotos = (event.personal_photo_url || "").split(',').map(u => u.trim()).filter(Boolean);
  const bands = Array.isArray(event.bands) ? event.bands : [event.artist].filter(Boolean);
  const headlinerName = (getBandName(bands[0]) || "LIVE").toUpperCase();

  // 🟢 SELF-CONTAINED CLONE LOGIC
  // This grabs the active session and duplicates the event into Tara's DB
  const cloneSignal = async (e) => {
    e.stopPropagation();
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      alert("LOGIN REQUIRED TO ARCHIVE SIGNALS");
      return;
    }

    // Sanitize: Strip Eric's IDs and Personal Photos
    const { 
      id, 
      created_at, 
      user_id, 
      personal_photo_url, 
      ...coreEventData 
    } = event;

    const newRecord = {
      ...coreEventData,
      user_id: session.user.id,
      personal_photo_url: null, // Clean slate for Tara
      is_public: true,
      date_added: new Date().toISOString()
    };

    try {
      const { error } = await supabase.from('concerts').insert([newRecord]);
      if (error) throw error;
      alert(`⚡ SIGNAL CLONED: ${headlinerName} added to your archive!`);
    } catch (err) {
      alert("Failed to clone: " + err.message);
    }
  };

  // Detect if we are on a curator's page (spectator mode)
  const isSpectator = window.location.hash.includes('#/u/');

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: isMobile ? 'column' : 'row', 
      alignItems: isMobile ? 'stretch' : 'center', 
      padding: isMobile ? '15px' : '40px 30px',
      background: isClustered ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.02)',
      borderRadius: '24px', 
      border: `1px solid ${isClustered ? hexToRgba(primaryColor, 0.3) : C.border}`,
      position: 'relative', 
      overflow: 'hidden', 
      gap: isMobile ? '20px' : '0',
      marginBottom: isMobile ? '10px' : '0'
    }}>
      
      {/* 🟢 THE GHOST POSTER */}
      {!isMobile && (
        <div style={{
          position: 'absolute', left: '-2%', top: '-10%', width: '100%', height: '120%',
          fontFamily: "'Bebas Neue'", fontSize: '22rem', color: primaryColor, opacity: 0.05, 
          whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 0, letterSpacing: '-12px', 
          lineHeight: 0.8, display: 'flex', alignItems: 'flex-start',
          WebkitMaskImage: 'linear-gradient(to right, black 20%, transparent 80%)',
          animation: 'pulse-ghost 4s ease-in-out infinite' 
        }}>
          {headlinerName}
        </div>
      )}

      {/* 🟢 LEFT: THE TICKET STUB / WRISTBAND */}
      <div style={{ 
        flexShrink: 0, width: isMobile ? '100%' : '320px', position: 'relative', zIndex: 2,
        display: 'flex', flexDirection: 'column', gap: '15px', alignItems: isMobile ? 'center' : 'flex-start'
      }}>
        <div style={{ transform: isMobile ? 'scale(0.9)' : 'none' }}>
          {event.is_festival 
            ? <WristbandCard event={event} genreMap={genreMap} compact={true} onEdit={isAdmin ? onEdit : null} /> 
            : <TicketStubCard event={event} onEdit={isAdmin ? onEdit : null} genreMap={genreMap} stubIdx={idx} />
          }
        </div>
      </div>

      {/* 🟢 MIDDLE: THE INTERACTIVE LINEUP */}
      <div style={{ flex: 1, paddingLeft: isMobile ? '0' : '50px', zIndex: 2, textAlign: isMobile ? 'center' : 'left' }}>
        <div style={{ 
          fontFamily: "'Bebas Neue'", fontSize: isMobile ? '2.2rem' : '3.8rem', lineHeight: 0.85,
          letterSpacing: '1px', marginBottom: '15px', color: '#fff',
          textShadow: `0 0 30px ${hexToRgba(primaryColor, 0.4)}, 2px 2px 10px rgba(0,0,0,0.8)`,
          display: 'flex', flexWrap: 'wrap', justifyContent: isMobile ? 'center' : 'flex-start', columnGap: '15px'
        }}>
          {bands.map((band, bIdx) => (
            <React.Fragment key={`${event.id}-link-${bIdx}`}>
              <a 
                href={getSetlistFmUrl(getBandName(band), event.date)} 
                target="_blank" rel="noreferrer"
                style={{ color: '#fff', textDecoration: 'none', cursor: 'pointer', transition: '0.2s' }}
                onMouseEnter={e => { e.target.style.color = C.gold; e.target.style.textShadow = `0 0 20px ${C.gold}`; }}
                onMouseLeave={e => { e.target.style.color = '#fff'; e.target.style.textShadow = `0 0 30px ${hexToRgba(primaryColor, 0.4)}`; }}
              >
                {getBandName(band).toUpperCase()}
              </a>
              {bIdx < bands.length - 1 && <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>}
            </React.Fragment>
          ))}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'center' : 'flex-start', gap: '15px', flexWrap: 'wrap' }}>
          <div style={{ fontFamily: "'Space Mono'", fontSize: '12px', color: primaryColor, fontWeight: 900 }}>{fmtDateShort(event.date)}</div>
          <div style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.1)' }} />
          <div style={{ fontFamily: "'Space Mono'", fontSize: '11px', color: C.gray }}>{event.venue?.toUpperCase()}</div>
          
          {/* 🟢 THE CLONE BUTTON */}
          {isSpectator && !isAdmin && (
            <button
              onClick={cloneSignal}
              style={{
                background: 'transparent',
                border: `1px solid ${primaryColor}`,
                color: primaryColor,
                padding: '4px 10px',
                fontFamily: "'Space Mono'",
                fontSize: '9px',
                cursor: 'pointer',
                borderRadius: 4,
                transition: 'all 0.2s',
                textTransform: 'uppercase',
                letterSpacing: 1,
                marginLeft: '5px'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = primaryColor; e.currentTarget.style.color = '#000'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = primaryColor; }}
            >
              + I WAS THERE
            </button>
          )}
        </div>
      </div>

      {/* 🟢 RIGHT: MEDIA CLUSTER */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'center' : 'flex-end', minWidth: isMobile ? '100%' : '400px', zIndex: 2, marginLeft: 'auto' }}>
        <div style={{ display: 'flex', transform: isMobile ? 'scale(0.8)' : 'none', transformOrigin: 'right' }}>
          {finalSetlists.map((url, sIdx) => (
            <SetlistPaper key={`${event.id}-s-${sIdx}`} src={url} index={sIdx} total={finalSetlists.length} />
          ))}
          <div style={{ marginLeft: finalSetlists.length > 0 ? '-30px' : '0', display: 'flex' }}>
            {finalPhotos.map((url, pIdx) => (
              <PersonalPolaroid key={`${event.id}-p-${pIdx}`} src={url} index={pIdx} total={finalPhotos.length} caption={venueLabel?.split(',')[0].toUpperCase()} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
// ─── HELPER: COLOR STAIRCASE ────────────────────────────────────────────────
// This makes sure Day 1 is bright and Day 3 is a deep, moody variant of the same color
const getDayColor = (baseHex, index) => {
  const variants = [1.0, 0.8, 0.6, 0.45, 0.3]; 
  return hexToRgba(baseHex || C.teal, variants[index % variants.length]);
};

// ─── 1. THE DRILL-DOWN (BYFESTTAB - THE BOX SET ARCHIVE) ────────────────────
// ─── 1. BY FEST TAB (BOX SET EDITION + MEDIA CLUSTER) ───────────────────────

function ByFestTab({ festGroupings, genreMap = {}, onEdit, isAdmin }) {
  const FEST_COLORS = [C.teal, C.cyan, C.purple, C.gold, C.green, '#ff6699', '#ff4400', '#a2ff00'];

  if (!festGroupings.length) return <div style={{ textAlign: 'center', color: C.gray, padding: 60 }}>No festival data yet.</div>;

  return (
    <div style={{ marginTop: 40 }} className="fade-in">
      {festGroupings.map((fest, fi) => {
        const themeColor = FEST_COLORS[fi % FEST_COLORS.length];
        const yearsSorted = Object.keys(fest.years).sort((a, b) => b.localeCompare(a));
        const allShows = Object.values(fest.years).flat();
        
        // 🎨 BOXSET COVER LOGIC: Scavenge the cluster for a poster signal
        const boxsetPoster = allShows.find(s => s.festival_poster_url)?.festival_poster_url;
        
        const festSlug = `fest-${fest.name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]/g, '')}`;

        return (
          <div 
            key={fest.name} 
            id={festSlug} 
            style={{ 
              marginBottom: 120, 
              scrollMarginTop: '120px' 
            }}
          >
            
            {/* 🏆 FESTIVAL BOXSET HEADER */}
            <div style={{ 
              display: 'flex', 
              flexDirection: window.innerWidth < 768 ? 'column' : 'row',
              gap: '40px', 
              alignItems: window.innerWidth < 768 ? 'flex-start' : 'flex-end', 
              marginBottom: '60px', 
              borderLeft: `10px solid ${themeColor}`, 
              paddingLeft: '30px' 
            }}>
              
              {/* THE COVER ART (High-Fidelity Physical Look) */}
              {boxsetPoster && (
                <div style={{ 
                  width: '220px', 
                  height: '310px', 
                  background: `url(${boxsetPoster}) center/cover no-repeat`,
                  borderRadius: '4px',
                  boxShadow: `0 30px 60px rgba(0,0,0,0.8), 0 0 20px ${hexToRgba(themeColor, 0.2)}`,
                  border: '1px solid rgba(255,255,255,0.1)',
                  transform: 'rotate(-1.5deg)',
                  flexShrink: 0,
                  position: 'relative'
                }}>
                  {/* Visual Detail: Archive Identification Sticker */}
                  <div style={{ position: 'absolute', top: 15, right: -20, background: C.gold, color: '#000', padding: '5px 12px', fontFamily: "'Space Mono'", fontSize: '9px', fontWeight: 900, borderRadius: '2px', transform: 'rotate(12deg)', boxShadow: '0 5px 15px rgba(0,0,0,0.4)', border: '1px solid rgba(0,0,0,0.1)' }}>
                    SIGNAL MASTER
                  </div>
                </div>
              )}

              <div style={{ flex: 1 }}>
                <div style={{ 
                  fontFamily: "'Bebas Neue'", 
                  fontSize: 'clamp(3.5rem, 8vw, 6.5rem)', 
                  lineHeight: 0.85, 
                  color: C.white, 
                  textShadow: `0 0 40px ${hexToRgba(themeColor, 0.4)}` 
                }}>
                  {fest.name.toUpperCase()}
                </div>
                <div style={{ fontFamily: "'Space Mono'", fontSize: '11px', color: themeColor, marginTop: '20px', letterSpacing: '5px', fontWeight: 900 }}>
                  {allShows.length} DAYS ATTENDED // {yearsSorted.length} YEARS ARCHIVED
                </div>
              </div>
            </div>

            {/* 📦 THE YEAR BOX SETS (Remaining code same as before) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '80px' }}>
              {yearsSorted.map(yr => {
                const shows = fest.years[yr].sort((a, b) => a.date.localeCompare(b.date));
                return (
                  <div key={yr} style={{ 
                    position: 'relative', border: `6px solid ${hexToRgba(themeColor, 0.2)}`, borderRadius: '24px',
                    padding: '80px 40px 40px 40px', background: 'rgba(255,255,255,0.01)',
                    boxShadow: `0 30px 100px rgba(0,0,0,0.5), inset 0 0 50px ${hexToRgba(themeColor, 0.05)}`,
                    overflow: 'visible' 
                  }}>
                    {/* ... (Existing Year Tab and Day Rows Logic) ... */}
                    <div style={{ position: 'absolute', top: '-40px', left: '40px', display: 'flex', alignItems: 'baseline', gap: '15px' }}>
                      <div style={{ background: themeColor, color: '#000', fontFamily: "'Bebas Neue'", fontSize: '4rem', padding: '0 30px', borderRadius: '8px', boxShadow: `0 10px 30px rgba(0,0,0,0.5)` }}>{yr}</div>
                      <div style={{ fontFamily: "'Bebas Neue'", fontSize: '2rem', color: C.white, opacity: 0.5 }}>{fest.name.toUpperCase()}</div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {shows.map((show, idx) => {
                        const dayColor = getDayColor(themeColor, idx);
                        const photos = show.personal_photo_url ? show.personal_photo_url.split(',').map(u => u.trim()).filter(Boolean) : [];
                        const setlists = show.setlist_image_url ? show.setlist_image_url.split(',').map(u => u.trim()).filter(Boolean) : [];
                        return (
                          <div key={show.id} onClick={isAdmin ? () => onEdit(show) : null} style={{ width: '100%', background: 'rgba(0,0,0,0.4)', borderRadius: '16px', border: `2px solid ${dayColor}`, overflow: 'visible', cursor: isAdmin ? 'pointer' : 'default', transition: 'all 0.3s ease', display: 'flex', alignItems: 'stretch' }}>
                            <div style={{ width: '8px', background: dayColor, flexShrink: 0 }} />
                            <div style={{ padding: '25px 35px', flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.8rem', color: dayColor, lineHeight: 1 }}>{show.festival_day?.toUpperCase() || `DAY ${idx + 1}`}</div>
                                <div style={{ fontFamily: "'Space Mono'", fontSize: '10px', color: C.gray, marginTop: '5px' }}>{fmtDateShort(show.date)}</div>
                                <div style={{ fontFamily: "'Space Mono'", fontSize: '11px', color: '#fff', lineHeight: 1.5, borderTop: `1px solid ${hexToRgba(dayColor, 0.2)}`, marginTop: '15px', paddingTop: '10px' }}>
                                  {(show.bands || []).map(b => getBandName(b)).filter(Boolean).join(' · ').toUpperCase()}
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', marginLeft: '30px' }}>
                                {setlists.length > 0 && <div style={{ display: 'flex' }}>{setlists.map((url, sIdx) => <SetlistPaper key={`${show.id}-s-${sIdx}`} src={url} index={sIdx} />)}</div>}
                                {photos.length > 0 && <div style={{ display: 'flex' }}>{photos.map((url, pIdx) => <PersonalPolaroid key={`${show.id}-p-${pIdx}`} src={url} index={pIdx} caption={fest.name.toUpperCase()} />)}</div>}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── 2. THE OVERVIEW (PASSPORTTAB - THE GRID) ───────────────────────────────
// ─── PASSPORT TAB (REPAIRED STATS EDITION) ──────────────────────────────────
function PassportTab({ passport, onNavigateToFest }) {  
  return (
    <div style={{ padding:'40px 0' }} className="fade-in">
      <div style={{ fontFamily:"'Space Mono'", fontSize:11, color:C.teal, marginBottom:40, letterSpacing:'0.2em', textAlign: 'center', opacity: 0.8 }}>
        // SELECT A STAMP TO VIEW COLLECTION //
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:30 }}>
        {passport.map((f, i) => {
          
          // 🟢 THE FIX: Robust stats calculation so "DAYS" never stays blank
          const yearCount = f.years?.length || 0;
          const dayCount = f.days || (f.years ? f.years.length : 0);
          
          const color = [C.teal, C.purple, C.gold, C.cyan, C.green, '#ff6699'][i % 6];
          
          return (
            <div key={f.name} onClick={()=>onNavigateToFest(f.name)}
              style={{ 
                background: `linear-gradient(135deg, ${C.bgCard}, #0b0b0b)`, 
                border:`2px solid ${hexToRgba(color, 0.25)}`, borderRadius:20, padding:30, cursor:'pointer', transition:'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative', overflow: 'hidden', boxShadow: `0 10px 30px rgba(0,0,0,0.4)`
              }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=color; e.currentTarget.style.transform='translateY(-10px)'; e.currentTarget.style.boxShadow=`0 20px 60px ${hexToRgba(color, 0.2)}`;}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=hexToRgba(color, 0.25); e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow=`0 10px 30px rgba(0,0,0,0.4)`;}}>
              
              <div style={{ fontFamily:"'Bebas Neue'", fontSize:'2.4rem', color: C.white, lineHeight:1.1, marginBottom: 5, letterSpacing: '1px' }}>{f.name}</div>
              <div style={{ fontFamily:"'Space Mono'", fontSize:9, color: color, letterSpacing: '2.5px', marginBottom: 20, fontWeight: 900, opacity: 0.9 }}>
                {yearCount} {yearCount === 1 ? 'YEAR' : 'YEARS'} RECORDED
              </div>
              
              <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:25 }}>
                {(f.years || []).map(y=><span key={y} style={{ fontFamily:"'Space Mono'", fontSize:9, background:`${color}15`, color: color, border:`1px solid ${color}33`, padding:'4px 10px', borderRadius:5 }}>{y}</span>)}
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid rgba(255,255,255,0.1)`, paddingTop: 20 }}>
                 <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.8rem', color: color, lineHeight: 1 }}>
                   {dayCount} <span style={{ fontSize: '0.9rem', color: '#666', marginLeft: 4 }}>DAYS</span>
                 </div>
                 <div style={{ fontFamily: "'Space Mono'", fontSize: 8, color: '#666', letterSpacing: '1px' }}>EXPLORE BOX SET ↗</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
// ─── BROWSE TAB ───────────────────────────────────────────────────────────────
// ─── BROWSE TAB (Public View + Admin Lockdown) ──────────────────────────────
function BrowseTab({ 
  browseView, setBrowseView, search, setSearch, 
  yearFilter, setYearFilter, festFilter, setFestFilter, 
  genreFilter, setGenreFilter, sortCol, setSortCol, sortDir, setSortDir, 
  paged, page, setPage, totalPages, artistRows, years, 
  onShare, onEdit, onSetGenre, genreMap,
  isAdmin // 🟢 Added Admin Prop
}) {
  
  // ── 1. SAFETY GATES ──
  const safePaged = Array.isArray(paged) ? paged : [];
  const safeArtistRows = Array.isArray(artistRows) ? artistRows : [];
  const safeYears = Array.isArray(years) ? years : [];
  const safeGenreMap = genreMap || {};

  // ── 2. INTERNAL STYLING ──
  const internalInputSt = { 
    background: 'rgba(0,0,0,0.3)', 
    border: `1px solid ${C.border || '#333'}`, 
    borderRadius: 4, 
    padding: '7px 10px', 
    color: '#fff', 
    fontSize: '0.85rem', 
    outline: 'none' 
  };

  return (
    <div style={{ marginTop: 20 }} className="fade-in">
      {/* FILTER BAR */}
      <div style={{ 
        display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20, 
        background: C.bgCard, padding: 15, borderRadius: 8, border: `1px solid ${C.border}` 
      }}>
        <input 
          placeholder="Search artists, venues, cities..." 
          value={search || ''} 
          onChange={e => setSearch(e.target.value)} 
          style={{ ...internalInputSt, flex: '1 1 260px' }} 
        />
        
        <select value={yearFilter} onChange={e => setYearFilter(e.target.value)} style={{ ...internalInputSt, minWidth: 100 }}>
          <option value="all">All Years</option>
          {safeYears.map(y => <option key={y} value={y}>{y}</option>)}
        </select>

        <select value={festFilter} onChange={e => setFestFilter(e.target.value)} style={{ ...internalInputSt, minWidth: 130 }}>
          <option value="all">All Types</option>
          <option value="fest">Festival Only</option>
          <option value="solo">Standalone Only</option>
        </select>

        <select value={genreFilter} onChange={e => setGenreFilter(e.target.value)} style={{ ...internalInputSt, minWidth: 130 }}>
          <option value="all">All Genres</option>
          {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
        </select>

        <div style={{ display: 'flex', background: C.bgCardAlt, borderRadius: 4, padding: 2, border: `1px solid ${C.border}` }}>
          {['shows', 'artists'].map(v => (
            <button 
              key={v} 
              onClick={() => setBrowseView(v)} 
              style={{ 
                padding: '6px 14px', fontSize: 10, fontFamily: "'Space Mono'", letterSpacing: '0.1em', 
                textTransform: 'uppercase', background: browseView === v ? C.teal : 'transparent', 
                color: browseView === v ? C.bg : C.gray, border: 'none', cursor: 'pointer', borderRadius: 3, transition: '0.15s' 
              }}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* VIEW: SHOWS (SETS) */}
      {browseView === 'shows' && (
        <>
          <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
              <thead>
                <tr style={{ background: C.bgCardAlt }}>
                  {[['date', 'Date'], ['artist', 'Artist'], ['venue', 'Venue'], ['city', 'City']].map(([col, label]) => (
                    <th 
                      key={col} 
                      onClick={() => { setSortCol(col); setSortDir(d => d === 'asc' ? 'desc' : 'asc'); }} 
                      style={{ 
                        fontFamily: "'Space Mono',monospace", fontSize: 8, letterSpacing: '0.15em', 
                        textTransform: 'uppercase', padding: '10px 12px', textAlign: 'left', 
                        color: sortCol === col ? C.teal : C.tealDim, borderBottom: `1px solid ${C.border}`, 
                        cursor: 'pointer', userSelect: 'none' 
                      }}
                    >
                      {label} {sortCol === col ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                    </th>
                  ))}
                  <th style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, letterSpacing: '0.15em', textTransform: 'uppercase', padding: '10px 12px', textAlign: 'left', color: C.tealDim, borderBottom: `1px solid ${C.border}` }}>Genre</th>
                  <th style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, letterSpacing: '0.15em', textTransform: 'uppercase', padding: '10px 12px', textAlign: 'left', color: C.tealDim, borderBottom: `1px solid ${C.border}` }}>📋</th>
                  <th style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, letterSpacing: '0.15em', textTransform: 'uppercase', padding: '10px 12px', textAlign: 'left', color: C.tealDim, borderBottom: `1px solid ${C.border}` }}>Type</th>
                </tr>
              </thead>
              <tbody>
                {safePaged.map((s, i) => {
                  const artistGenre = safeGenreMap[s.artist] || null;
                  return (
                    <tr 
                      key={`${s.id}-${s.artist}-${i}`} 
                      className={isAdmin ? "row-hover" : ""} 
                      onClick={() => isAdmin && onEdit(s)} // 🟢 Admin only trigger
                      style={{ 
                        borderBottom: `1px solid ${C.border}`, 
                        background: i % 2 === 1 ? C.bgCardAlt : 'transparent', 
                        cursor: isAdmin ? 'pointer' : 'default' // 🟢 Change cursor for public
                      }}
                    >
                      <td style={{ padding: '9px 12px', fontFamily: "'Space Mono',monospace", fontSize: '0.7rem', color: C.gray, whiteSpace: 'nowrap' }}>{fmtDate(s.date)}</td>
                      <td style={{ padding: '9px 12px', color: C.teal, fontWeight: 600 }}>{s.artist}</td>
                      <td style={{ padding: '9px 12px', color: C.gray }}>{s.venue || '—'}</td>
                      <td style={{ padding: '9px 12px', color: C.gray }}>{s.city || '—'}{s.state ? `, ${s.state}` : ''}</td>
                      <td style={{ padding: '9px 12px' }}>
                        {artistGenre ? <GenreBadge genre={artistGenre} color={GENRE_COLORS[artistGenre]} small /> : <span style={{ color: C.grayDim, fontSize: 8 }}>—</span>}
                      </td>
                      <td style={{ padding: '9px 12px', textAlign: 'center' }}>
                        {(s.has_setlist || (s.has_setlist_names?.trim())) ? (
                          <a 
                            href={getSetlistFmUrl(s.artist, s.date)} 
                            target="_blank" rel="noopener noreferrer" 
                            onClick={e => e.stopPropagation()} 
                            style={{ textDecoration: 'none', fontSize: 12, filter: 'drop-shadow(0 0 3px gold)' }} 
                            title="setlist.fm"
                          >📋</a>
                        ) : <span style={{ color: C.grayDim }}>—</span>}
                      </td>
                      <td style={{ padding: '9px 12px' }}>{s.is_festival ? <Badge color={C.teal}>Fest</Badge> : <Badge color={C.grayDim} bg="transparent">Solo</Badge>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 16 }}>
              <Btn variant="secondary" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '5px 12px' }}>← Prev</Btn>
              <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: C.gray }}>Page {page} of {totalPages}</span>
              <Btn variant="secondary" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: '5px 12px' }}>Next →</Btn>
            </div>
          )}
        </>
      )}

      {/* VIEW: ARTISTS (ACTS) */}
      {browseView === 'artists' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
          {safeArtistRows.map(row => {
            const genre = safeGenreMap[row.artist] || null;
            const gc = genre ? (GENRE_COLORS[genre] || null) : null;
            return (
              <div key={row.artist} style={{ 
                background: gc ? `linear-gradient(135deg, ${C.bgCard}, ${hexToRgba(gc, 0.1)})` : C.bgCard, 
                border: `1px solid ${gc ? hexToRgba(gc, 0.5) : C.border}`, 
                boxShadow: gc ? `0 0 12px ${hexToRgba(gc, 0.2)}` : 'none', 
                borderRadius: 8, padding: '14px 16px', position: 'relative' 
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <div 
                      style={{ fontFamily: "'Bebas Neue'", fontSize: '1.2rem', color: gc || C.teal, marginBottom: 4, cursor: 'pointer' }} 
                      onClick={() => onShare(row.artist, row.shows)}
                    >
                      {row.artist}
                    </div>
                    <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: C.gray }}>{row.shows.length} shows</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.border}` }}>
                  <select 
                    value={genre || ''} 
                    disabled={!isAdmin} // 🟢 Public cannot edit genres
                    onChange={e => onSetGenre(row.artist, e.target.value || null)} 
                    style={{ 
                      flex: 1, background: gc ? hexToRgba(gc, 0.15) : C.bgCardAlt, 
                      border: `1px solid ${gc ? hexToRgba(gc, 0.4) : C.border}`, 
                      borderRadius: 4, color: gc || C.gray, fontSize: 9, padding: '3px 6px', 
                      fontFamily: "'Space Mono'", cursor: isAdmin ? 'pointer' : 'default',
                      opacity: isAdmin ? 1 : 0.7 
                    }}
                  >
                    <option value="">{isAdmin ? '— unset —' : 'No Genre'}</option>
                    {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── VENUE DONUT CARD (MATCHED TOP 15 EDITION) ────────────────────────────────
function VenueDonutCard({ concerts, onNavigateToVenues }) {
  const venueData = useMemo(() => {
    const m = {};
    concerts.forEach(c => {
      if (!c.venue) return;
      const key = c.venue.trim();
      m[key] = (m[key] || 0) + 1;
    });
    const sorted = Object.entries(m).sort((a, b) => b[1] - a[1]);
    
    // Sync with Bar Chart: Expanded to Top 15
    const top15 = sorted.slice(0, 15);
    const otherCount = sorted.slice(15).reduce((acc, [, n]) => acc + n, 0);
    if (otherCount > 0) top15.push(['Other Venues', otherCount]);
    return top15;
  }, [concerts]);

  const total = venueData.reduce((acc, [, n]) => acc + n, 0) || 1;
  
  // The Exact Same Palette as your Stacked Bar Chart
  const COLORS = [
    '#00f2ff', '#9d00ff', '#ffcc00', '#ff4466', '#00cc88', 
    '#4488ff', '#ff7733', '#9966ff', '#00e5cc', '#ffcc44',
    '#ff6699', '#a2ff00', '#00cfff', '#888888', '#cc8800',
    '#334455' // color for 'Other'
  ];

  const cx = 70, cy = 70, r = 52;
  const circ = 2 * Math.PI * r;

  let cumulative = 0;
  const slices = venueData.map(([name, count], i) => {
    const pct = count / total;
    const dash = pct * circ;
    const offset = -cumulative * circ;
    cumulative += pct;
    // Map the color: if it's the last item and named "Other...", use the last color
    const isOther = name.includes('Other');
    const color = isOther ? COLORS[15] : COLORS[i % 15];
    return { name, count, pct, dash, offset, color };
  });

  return (
    <Card neon onClick={onNavigateToVenues} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
      className="card-texture">
      <CardTitle>Top Venues 📍</CardTitle>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1 }}>
        <svg width={140} height={140} viewBox="0 0 140 140" style={{ flexShrink: 0 }}>
          {slices.map((s, i) => (
            <circle
              key={i}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={14}
              strokeDasharray={`${s.dash} ${circ}`}
              strokeDashoffset={s.offset}
              transform={`rotate(-90 ${cx} ${cy})`}
              style={{ filter: `drop-shadow(0 0 4px ${s.color}66)` }}
            />
          ))}
          <text x={cx} y={cy - 6} textAnchor="middle" style={{ fontFamily: "'Bebas Neue'", fontSize: 16, fill: C.white }}>
            {new Set(concerts.map(c => c.venue).filter(Boolean)).size}
          </text>
          <text x={cx} y={cy + 10} textAnchor="middle" style={{ fontFamily: "'Space Mono'", fontSize: 7, fill: C.gray }}>
            VENUES
          </text>
        </svg>
        
        {/* Scrollable list if the Top 15 gets too tall for the card */}
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 4, 
          maxHeight: '220px', 
          overflowY: 'auto',
          paddingRight: '5px' 
        }}>
          {slices.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: s.color, flexShrink: 0, boxShadow: `0 0 4px ${s.color}` }} />
              <div style={{ 
                fontFamily: "'Space Mono'", 
                fontSize: '7px', 
                color: C.gray, 
                flex: 1, 
                overflow: 'hidden', 
                textOverflow: 'ellipsis', 
                whiteSpace: 'nowrap' 
              }}>
                {s.name.toUpperCase()}
              </div>
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: '0.85rem', color: s.color, flexShrink: 0 }}>{s.count}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ fontFamily: "'Space Mono'", fontSize: 7, color: C.tealDim, textAlign: 'center', marginTop: 10, letterSpacing: '0.1em' }}>
        ↗ CLICK TO VIEW ALL VENUES
      </div>
    </Card>
  );
}
// ─── VENUES TAB (COMPLETE STABILIZED VERSION) ─────────────────────────────────
function VenuesTab({ concerts }) {
  const [sortBy, setSortBy] = useState('count');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState({});

  // 1. SAFETY GATES
  if (!concerts || !Array.isArray(concerts)) {
    return <div style={{ padding: '80px 0', textAlign: 'center', color: '#8899aa', fontFamily: "'Space Mono'" }}>INITIALIZING...</div>;
  }

  const toggle = (name) => setExpanded(p => ({ ...p, [name]: !p[name] }));

  // 2. DATA AGGREGATION
  const venues = useMemo(() => {
    const m = {};
    concerts.forEach(c => {
      if (!c || !c.venue) return;
      const key = c.venue.trim();
      if (!m[key]) {
        m[key] = {
          name: key, city: c.city || '', state: c.state || '',
          count: 0, shows: [],
        };
      }
      m[key].count++;
      m[key].shows.push(c);
    });
    return Object.values(m).map(v => ({
      ...v,
      shows: [...v.shows].sort((a, b) => (b.date || '').localeCompare(a.date || '')),
    }));
  }, [concerts]);

  const filtered = useMemo(() => {
    let list = venues;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(v => v.name.toLowerCase().includes(q) || v.city.toLowerCase().includes(q));
    }
    if (sortBy === 'count') return [...list].sort((a, b) => b.count - a.count);
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }, [venues, sortBy, search]);

  // Fallback for internal input styling
  const currentInputSt = typeof inputSt !== 'undefined' ? inputSt : { background: 'rgba(0,0,0,0.4)', border: '1px solid #333', color: '#fff', padding: '12px', borderRadius: '6px' };

  return (
    <div style={{ padding: '24px 0' }} className="fade-in">
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: '3.5rem', color: C.white, letterSpacing: '0.05em' }}>
          📍 THE <span style={{ color: C.teal }}>VENUE LOG</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <input 
          placeholder="Search venues..." 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          style={{ ...currentInputSt, flex: 1 }} 
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map((v, i) => {
          const rowColor = i < 3 ? [C.gold, C.purple, C.cyan][i] : C.teal;
          const isOpen = expanded[v.name];

          return (
            <div key={v.name} style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderLeft: `4px solid ${rowColor}`, borderRadius: 8, overflow: 'hidden' }}>
              {/* VENUE HEADER BOX */}
              <div onClick={() => toggle(v.name)} style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.4rem', color: '#fff' }}>{v.name}</div>
                  <div style={{ fontFamily: "'Space Mono'", fontSize: 9, color: C.gray }}>{v.city.toUpperCase()}, {v.state}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: "'Bebas Neue'", fontSize: '2.2rem', color: rowColor, lineHeight: 1 }}>{v.count}</div>
                  <div style={{ fontFamily: "'Space Mono'", fontSize: 7, color: C.grayDim }}>SETS</div>
                </div>
              </div>

              {/* THE SCRAPBOOK GRID (EXPANDED) */}
              {isOpen && (
                <div style={{ 
                  padding: '50px 25px', 
                  background: 'rgba(0,0,0,0.5)', 
                  borderTop: `1px solid ${C.border}`,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: '40px',
                  alignItems: 'start'
                }}>
                   {v.shows.map((show, idx) => {
                     const bands = Array.isArray(show.bands) ? show.bands : [];
                     const headliner = getBandName(bands[0]) || 'UNKNOWN ARTIST';
                     const support = bands.slice(1).map(b => getBandName(b)).filter(Boolean);
                     const hasImg = show.image_url && show.image_url.trim() !== "";

                     return (
                       <div key={show.id} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                         
                         {/* 1. THE ARTIFACT HEADER */}
                         {show.is_festival ? (
                           <div style={{ position: 'relative' }}>
                             <PhysicalWristband 
                               color={rowColor} 
                               label={show.festival_name} 
                               year={getYear(show.date)} 
                               size="small" 
                             />
                             {/* High-Visibility Day Tag */}
                             <div style={{ position: 'absolute', top: -5, right: 10, background: '#000', color: rowColor, border: `1px solid ${rowColor}`, padding: '2px 8px', borderRadius: 2, fontFamily: "'Space Mono'", fontSize: 8, fontWeight: 900, boxShadow: '0 4px 10px rgba(0,0,0,0.5)', zIndex: 10 }}>
                               {show.festival_day?.toUpperCase() || 'LIVE'}
                             </div>
                           </div>
                         ) : hasImg ? (
  /* 📸 FULL-VIEW PHOTO HEADER (No Cropping) */
  <div style={{ 
    padding: '8px', 
    background: '#fff', 
    boxShadow: '0 12px 24px rgba(0,0,0,0.5)', 
    borderRadius: 2, 
    transform: 'rotate(-0.5deg)', 
    border: '1px solid #ddd' 
  }}>
    <div style={{ 
      background: '#000', 
      width: '100%', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      overflow: 'hidden' 
    }}>
      <img 
        src={show.image_url.split(',')[0]} 
        alt="artifact" 
        style={{ 
          width: '100%', 
          height: 'auto', 
          maxHeight: '220px',
          objectFit: 'contain',
          display: 'block'
        }} 
      />
    </div>
    <div style={{ 
      fontFamily: "'Space Mono'", 
      fontSize: 8, 
      color: '#000', 
      textAlign: 'center', 
      padding: '10px 0 2px 0', 
      fontWeight: 900 
    }}>
      {fmtDateShort(show.date)}
    </div>
  </div>
) : (
                           <DecorativeTicket event={show} templateIdx={idx} />
                         )}

                         {/* 2. THE FULL LINEUP LIST (Prevents cutoffs) */}
                         <div style={{ padding: '0 8px' }}>
                            <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.3rem', color: show.is_festival ? rowColor : '#fff', letterSpacing: '0.5px', lineHeight: 1.1 }}>
                              {headliner.toUpperCase()}
                            </div>
                            
                            {support.length > 0 && (
                              <div style={{ fontFamily: "'Space Mono'", fontSize: 8, color: C.gray, marginTop: 4, lineHeight: 1.5, borderLeft: `1px solid ${hexToRgba(rowColor, 0.3)}`, paddingLeft: 8 }}>
                                {support.join(' • ').toUpperCase()}
                              </div>
                            )}

                            <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 6 }}>
                               <span style={{ fontFamily: "'Space Mono'", fontSize: 7, color: C.grayDim }}>
                                 {show.is_festival ? fmtDateShort(show.date) : show.venue?.toUpperCase()}
                               </span>
                               {show.personal_photo_url && <span style={{ fontSize: 10 }} title="Photo Archived">📸</span>}
                            </div>
                         </div>
                       </div>
                     );
                   })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
// ─── COMMUNITY / CRATE DIGGING HUB ───────────────────────────────────────────
function CommunityTab({ onEnterMuseum }) {
  const [curators, setCurators] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCurators() {
      // 📡 Signal Scan: Fetching all public curators from the profiles table
      const { data, error } = await supabase
        .from('profiles')
        .select('username, avatar_color, last_seen, last_artist, last_venue')
        .order('last_seen', { ascending: false });

      if (data) setCurators(data);
      setLoading(false);
    }
    fetchCurators();
  }, []);

  if (loading) return (
    <div style={{ padding: 60, textAlign: 'center' }}>
      <div style={{ fontFamily: "'Space Mono'", fontSize: 10, color: C.teal, letterSpacing: 4 }}>SCANNING NETWORK...</div>
    </div>
  );

  return (
    <div className="fade-in" style={{ padding: '20px 0' }}>
      <div style={{ textAlign: 'center', marginBottom: 60 }}>
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: '4.5rem', color: '#fff', lineHeight: 1 }}>
          THE <span style={{ color: C.gold }}>NETWORK</span>
        </div>
        <div style={{ fontFamily: "'Space Mono'", fontSize: 10, color: C.grayDim, letterSpacing: 4, marginTop: 10 }}>
          EXPLORE THE ARCHIVES OF OTHER CURATORS // LIVE FEED ACTIVE
        </div>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
        gap: 30,
        padding: '0 10px'
      }}>
        {curators.map(u => {
          const userColor = u.avatar_color || C.teal;
          return (
            <div 
              key={u.username}
              onClick={() => onEnterMuseum(u.username)}
              style={{
                background: `linear-gradient(135deg, ${C.bgCard}, #050508)`,
                border: `1px solid ${hexToRgba(userColor, 0.3)}`,
                borderRadius: 16,
                padding: 30,
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-10px)';
                e.currentTarget.style.borderColor = userColor;
                e.currentTarget.style.boxShadow = `0 20px 40px ${hexToRgba(userColor, 0.15)}`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = hexToRgba(userColor, 0.3);
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
              }}
            >
              {/* Header: Identity */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 15, marginBottom: 25 }}>
                <div style={{ 
                  width: 55, height: 55, borderRadius: '50%', 
                  background: hexToRgba(userColor, 0.1),
                  border: `2px solid ${userColor}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Bebas Neue'", fontSize: '1.8rem', color: userColor,
                  boxShadow: `0 0 15px ${hexToRgba(userColor, 0.3)}`
                }}>
                  {u.username[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontFamily: "'Bebas Neue'", fontSize: '2rem', color: '#fff', lineHeight: 1 }}>
                    @{u.username.toUpperCase()}
                  </div>
                  <div style={{ fontFamily: "'Space Mono'", fontSize: 8, color: C.gray, marginTop: 5, letterSpacing: 1 }}>
                    CURATOR ARCHETYPE: <span style={{ color: userColor }}>ANALOG</span>
                  </div>
                </div>
              </div>

              {/* Latest Intel */}
              <div style={{ 
                background: 'rgba(0,0,0,0.4)', 
                borderRadius: 8, padding: 20, 
                borderLeft: `4px solid ${userColor}` 
              }}>
                <div style={{ fontFamily: "'Space Mono'", fontSize: 7, color: userColor, letterSpacing: 2, marginBottom: 8, fontWeight: 900 }}>
                  LATEST SIGNAL DETECTED
                </div>
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.5rem', color: '#fff', letterSpacing: 1, lineHeight: 1.1 }}>
                  {u.last_artist?.toUpperCase() || 'INITIALIZING...'}
                </div>
                <div style={{ fontFamily: "'Space Mono'", fontSize: 8, color: C.grayDim, marginTop: 4 }}>
                  {u.last_venue?.toUpperCase() || 'UNKNOWN STAGE'}
                </div>
              </div>

              <div style={{ marginTop: 25, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ height: 1, flex: 1, background: `linear-gradient(90deg, ${hexToRgba(userColor, 0.2)}, transparent)` }} />
                <div style={{ fontFamily: "'Space Mono'", fontSize: 8, color: userColor, letterSpacing: 2, marginLeft: 15 }}>
                  VIEW ARCHIVE ↗
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── POSTER GENERATOR ─────────────────────────────────────────────────────────
const POSTER_TEMPLATES = [
  { id:0, name:'COACHELLA GRID', bg:'#f5f0e8', accent:'#1a1a2e', accent2:'#8b0000', font:'Bebas Neue', style:'grid', dark:false },
  { id:1, name:'LOLLA BOLD', bg:'#050510', accent:'#ff0055', accent2:'#ffffff', font:'Monoton', style:'bold', dark:true },
  { id:2, name:'BONNAROO FOREST', bg:'#0a1a08', accent:'#88cc44', accent2:'#ffcc00', font:'Caveat', style:'forest', dark:true },
];

const FEST_NAME_PARTS = {
  'Indie Rock':[['Cedar','Silver','Hollow','Petal'],['Wire','Bloom','Pines','Dusk']],
  'Electronic':[['Neon','Circuit','Static','Pulse'],['Grid','Wave','Surge','Flux']],
  'Jam':[['Rolling','Wandering','Spiral','Endless'],['Current','River','Flow','Grove']],
  'Folk':[['Timber','Ember','Moss','Willow'],['Creek','Ridge','Vale','Hearth']],
  'Alternative':[['Fault','Storm','Drift','Void'],['Line','Break','Surge','Shift']],
  'Punk':[['Concrete','Iron','Rust','Voltage'],['Teeth','Wire','Fist','Noise']],
  'Classic Rock':[['Thunder','Stone','Chrome','Road'],['Mountain','Highway','Peak','Mile']],
  'Hip Hop':[['Block','Crown','Signal','Cipher'],['Party','Summit','Session','Verse']],
  'Experimental':[['Strange','Liminal','Fractal','Echo'],['Ritual','Chamber','Loop','Signal']],
  'default':[['Open','Free','Wild','Lost'],['Ground','Field','Valley','Plains']],
};

function generateFestName(dominantGenre) {
  const parts=FEST_NAME_PARTS[dominantGenre]||FEST_NAME_PARTS['default'];
  const a=parts[0][Math.floor(Math.random()*parts[0].length)];
  const b=parts[1][Math.floor(Math.random()*parts[1].length)];
  const suffixes=['Festival','Fest','Music Festival','Gathering','Sessions'];
  return `${a} ${b} ${suffixes[Math.floor(Math.random()*suffixes.length)]}`;
}

function PosterGeneratorTab({ concerts, genreMap, allSetsList }) {
  const [genreMix, setGenreMix] = useState({ 'Indie Rock': 30, 'Electronic': 20, 'Folk': 20, 'Jam': 15, 'Alternative': 15 });
  const [templateIdx, setTemplateIdx] = useState(0);
  const [festName, setFestName] = useState('');
  const [generated, setGenerated] = useState(null);
  const [headlinerCount, setHeadlinerCount] = useState(2);
  const [totalActs, setTotalActs] = useState(24);

  // Local style to prevent Reference Errors
  const localInputStyle = { 
    background: 'rgba(0,0,0,0.4)', 
    border: `1px solid ${C.border || '#333'}`, 
    color: '#fff', 
    padding: '12px', 
    borderRadius: '6px', 
    fontFamily: "'Space Mono'", 
    fontSize: '13px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box'
  };

  const totalPct = Object.values(genreMix).reduce((a, b) => a + b, 0);

  const artistPool = useMemo(() => {
    const m = {};
    if (!allSetsList) return [];
    allSetsList.forEach(s => {
      const g = genreMap[s.artist] || s.genre || 'Other';
      if (g === 'Other') return;
      if (!m[s.artist]) m[s.artist] = { artist: s.artist, genre: g, count: 0 };
      m[s.artist].count++;
    });
    return Object.values(m).sort((a, b) => b.count - a.count);
  }, [allSetsList, genreMap]);

  const generate = () => {
    const tpl = POSTER_TEMPLATES[templateIdx];
    const total = Object.values(genreMix).reduce((a, b) => a + b, 0) || 100;
    
    const picked = [];
    const used = new Set();

    // Pick artists based on weighted genre mix
    Object.entries(genreMix).forEach(([genre, weight]) => {
      if (weight <= 0) return;
      const targetCount = Math.round((weight / total) * totalActs);
      const candidates = artistPool.filter(a => a.genre === genre && !used.has(a.artist));
      
      candidates.slice(0, targetCount).forEach(a => {
        picked.push({ ...a });
        used.add(a.artist);
      });
    });

    // Final sorting: Most seen artists at the top (Headliners)
    picked.sort((a, b) => b.count - a.count);
    
    const dominantGenre = Object.entries(genreMix).sort((a, b) => b[1] - a[1])[0]?.[0] || 'default';
    
    setGenerated({ 
      tpl, 
      artists: picked.slice(0, totalActs), 
      name: festName.trim() || generateFestName(dominantGenre), 
      headlinerCount 
    });
  };

  const PosterPreview = ({ tpl: t, artists, name, headlinerCount: hc }) => {
    const headliners = artists.slice(0, hc);
    const midTier = artists.slice(hc, hc + Math.ceil(artists.length * 0.4));
    const undercard = artists.slice(hc + Math.ceil(artists.length * 0.4));

    const containerStyle = {
      background: t.bg,
      borderRadius: 12,
      overflow: 'hidden',
      border: t.dark ? `1px solid ${t.accent}44` : `2px solid ${t.accent}`,
      padding: '40px 30px',
      fontFamily: t.font === 'Bebas Neue' ? "'Bebas Neue', sans-serif" : t.font,
      textAlign: 'center',
      minHeight: 650,
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
      color: t.accent
    };

    if (t.style === 'grid') {
      return (
        <div style={containerStyle}>
          <div style={{ borderBottom: `3px solid ${t.accent}`, paddingBottom: 15, marginBottom: 25 }}>
            <div style={{ fontSize: '4.5rem', letterSpacing: '4px', lineHeight: 0.9 }}>{name.toUpperCase()}</div>
            <div style={{ fontFamily: "'Space Mono'", fontSize: 8, color: '#666', letterSpacing: '3px', marginTop: 10 }}>
              EST. {new Date().getFullYear()} // {allSetsList.length} SHOW HISTORY SOURCE
            </div>
          </div>
          <div style={{ marginBottom: 30 }}>
            {headliners.map(a => <div key={a.artist} style={{ fontSize: '3.5rem', lineHeight: 1.1, letterSpacing: '1px' }}>{a.artist.toUpperCase()}</div>)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px 20px', borderTop: `1px solid ${t.accent}22`, paddingTop: 20, marginBottom: 20 }}>
            {midTier.map(a => <div key={a.artist} style={{ fontSize: '1.2rem', color: t.accent2 }}>{a.artist.toUpperCase()}</div>)}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px 12px', opacity: 0.7 }}>
            {undercard.map(a => <span key={a.artist} style={{ fontFamily: "'Space Mono'", fontSize: 9 }}>{a.artist.toUpperCase()}</span>)}
          </div>
        </div>
      );
    }

    if (t.style === 'forest') {
      return (
        <div style={containerStyle}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.05), transparent)', pointerEvents: 'none' }} />
          <div style={{ fontFamily: "'Caveat'", fontSize: '5rem', marginBottom: 10, textShadow: '2px 2px 0px rgba(0,0,0,0.1)' }}>{name}</div>
          <div style={{ height: 2, background: t.accent2, width: '40%', margin: '0 auto 30px auto' }} />
          <div style={{ marginBottom: 40 }}>
            {headliners.map(a => <div key={a.artist} style={{ fontSize: '3rem', lineHeight: 1.2 }}>{a.artist}</div>)}
          </div>
          <div style={{ fontSize: '1.5rem', lineHeight: 1.6, marginBottom: 25, color: t.accent2 }}>
            {midTier.map(a => a.artist).join('  ·  ')}
          </div>
          <div style={{ fontFamily: "'Space Mono'", fontSize: 10, opacity: 0.6, lineHeight: 2 }}>
            {undercard.map(a => a.artist).join(' / ')}
          </div>
        </div>
      );
    }

    // Default: Lolla Bold
    return (
      <div style={containerStyle}>
        <div style={{ height: 4, background: t.accent, marginBottom: 20 }} />
        <div style={{ fontFamily: "'Monoton'", fontSize: '2.5rem', marginBottom: 10 }}>{name.toUpperCase()}</div>
        <div style={{ fontFamily: "'Space Mono'", fontSize: 10, letterSpacing: 5, marginBottom: 40 }}>{new Date().getFullYear()} CIRCUIT</div>
        <div style={{ marginBottom: 40 }}>
          {headliners.map(a => <div key={a.artist} style={{ fontSize: '4.5rem', lineHeight: 0.9, color: t.accent2 }}>{a.artist.toUpperCase()}</div>)}
        </div>
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.8rem', letterSpacing: 2, lineHeight: 1.4, marginBottom: 20 }}>
          {midTier.map(a => a.artist.toUpperCase()).join('  •  ')}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '5px 15px', fontFamily: "'Space Mono'", fontSize: 9, opacity: 0.5 }}>
          {undercard.map(a => a.artist.toUpperCase()).join('  ')}
        </div>
        <div style={{ height: 4, background: t.accent, marginTop: 'auto' }} />
      </div>
    );
  };

  return (
    <div style={{ padding: '24px 0' }} className="fade-in">
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: '3.5rem', color: C.white, letterSpacing: '2px' }}>
          ARTIST <span style={{ color: C.teal }}>POSTER GEN</span>
        </div>
        <div style={{ fontFamily: "'Space Mono'", fontSize: 9, color: C.grayDim, textTransform: 'uppercase', letterSpacing: 3 }}>
          Turn your history into a headliner event
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 1000 ? '1fr' : '400px 1fr', gap: 30 }}>
        
        {/* LEFT COLUMN: CONTROLS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Card neon>
            <CardTitle>1. GENRE MIX ({totalPct}%)</CardTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {GENRES.filter(g => g !== 'Other').map(g => (
                <div key={g} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: GENRE_COLORS[g] }} />
                  <span style={{ fontFamily: "'Space Mono'", fontSize: 9, color: C.gray, width: 100 }}>{g.toUpperCase()}</span>
                  <input 
                    type="range" min={0} max={100} 
                    value={genreMix[g] || 0} 
                    onChange={e => setGenreMix(p => ({ ...p, [g]: +e.target.value }))} 
                    style={{ flex: 1, accentColor: GENRE_COLORS[g] }} 
                  />
                  <span style={{ fontFamily: "'Space Mono'", fontSize: 10, color: GENRE_COLORS[g], width: 35, textAlign: 'right' }}>{genreMix[g] || 0}%</span>
                </div>
              ))}
            </div>
          </Card>

          <Card neon>
            <CardTitle>2. STAGE OPTIONS</CardTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={{ fontFamily: "'Space Mono'", fontSize: 8, color: C.grayDim, display: 'block', marginBottom: 8 }}>FESTIVAL NAME (AUTOGEN IF BLANK)</label>
                <input value={festName} onChange={e => setFestName(e.target.value)} placeholder="e.g. Desert Trip 2026" style={localInputStyle} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
                <div>
                  <label style={{ fontFamily: "'Space Mono'", fontSize: 8, color: C.grayDim, display: 'block', marginBottom: 8 }}>ACTS: {totalActs}</label>
                  <input type="range" min={10} max={50} value={totalActs} onChange={e => setTotalActs(+e.target.value)} style={{ width: '100%', accentColor: C.teal }} />
                </div>
                <div>
                  <label style={{ fontFamily: "'Space Mono'", fontSize: 8, color: C.grayDim, display: 'block', marginBottom: 8 }}>HEADLINERS: {headlinerCount}</label>
                  <input type="range" min={1} max={4} value={headlinerCount} onChange={e => setHeadlinerCount(+e.target.value)} style={{ width: '100%', accentColor: C.gold }} />
                </div>
              </div>
            </div>
          </Card>

          <Card neon>
            <CardTitle>3. ART DIRECTION</CardTitle>
            <div style={{ display: 'flex', gap: 10 }}>
              {POSTER_TEMPLATES.map((t, i) => (
                <div 
                  key={t.id} 
                  onClick={() => setTemplateIdx(i)} 
                  style={{ 
                    flex: 1, padding: '12px 8px', borderRadius: 6, cursor: 'pointer', textAlign: 'center',
                    background: i === templateIdx ? t.bg : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${i === templateIdx ? t.accent : C.border}`,
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ fontFamily: "'Bebas Neue'", fontSize: '0.8rem', color: i === templateIdx ? t.accent : '#fff' }}>{t.name}</div>
                </div>
              ))}
            </div>
          </Card>

          <Btn onClick={generate} style={{ padding: '20px', fontSize: '1.2rem', letterSpacing: 4 }}>⚡ STAGE LINEUP</Btn>
        </div>

        {/* RIGHT COLUMN: PREVIEW */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
          {generated ? (
            <div className="fade-in" style={{ width: '100%', maxWidth: 500 }}>
              <PosterPreview {...generated} />
              <div style={{ marginTop: 20, textAlign: 'center', fontFamily: "'Space Mono'", fontSize: 9, color: C.grayDim }}>
                📸 SCREENSHOT TO SHARE YOUR LEGACY
              </div>
            </div>
          ) : (
            <div style={{ 
              width: '100%', height: 650, border: `2px dashed ${C.border}`, borderRadius: 12,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              color: C.grayDim, gap: 20
            }}>
              <div style={{ fontSize: '4rem', opacity: 0.2 }}>🎨</div>
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.5rem', letterSpacing: 2 }}>PREVIEW PENDING</div>
              <div style={{ fontFamily: "'Space Mono'", fontSize: 9 }}>SET YOUR MIX AND GENERATE</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
// ─── MANAGE TAB ───────────────────────────────────────────────────────────────
function ManageTab({ concerts, onEdit, onAdd, onDuplicate }) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const PER = 30;

  const filtered = useMemo(() => {
    if (!search) return concerts;
    const q = search.toLowerCase();
    return concerts.filter(c => 
      (c.bands || []).some(b => getBandName(b).toLowerCase().includes(q)) ||
      (c.venue || '').toLowerCase().includes(q) ||
      (c.city || '').toLowerCase().includes(q) ||
      (c.festival_name || '').toLowerCase().includes(q)
    );
  }, [concerts, search]);

  const paged = filtered.slice((page - 1) * PER, page * PER);
  const totalPages = Math.ceil(filtered.length / PER);

  // Self-contained style to prevent Reference Errors
  const localInputStyle = { 
    background: 'rgba(0,0,0,0.4)', 
    border: `1px solid ${C.border}`, 
    color: '#fff', 
    padding: '12px', 
    borderRadius: '6px', 
    fontFamily: "'Space Mono'",
    outline: 'none'
  };

  return (
    <div style={{ padding: '24px 0' }} className="fade-in">
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <input 
          style={{ ...localInputStyle, flex: 1 }} 
          placeholder="Search shows to edit..." 
          value={search} 
          onChange={e => { setSearch(e.target.value); setPage(1); }} 
        />
        <Btn onClick={onAdd}>+ Add Show</Btn>
      </div>
      <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
          <thead>
            <tr style={{ background: C.bgCardAlt }}>
              {['Date','Artists','Venue','City','Genre','Type','📋','Dup','Edit'].map(h => (
                <th key={h} style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, letterSpacing: '0.15em', textTransform: 'uppercase', padding: '10px 12px', textAlign: 'left', color: C.tealDim, borderBottom: `1px solid ${C.border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((c, i) => (
              <tr key={c.id} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 1 ? C.bgCardAlt : 'transparent' }}>
                <td style={{ padding: '9px 12px', fontFamily: "'Space Mono',monospace", fontSize: '0.7rem', color: C.gray, whiteSpace: 'nowrap' }}>{fmtDate(c.date)}</td>
                <td className="row-hover" onClick={() => onEdit(c)} style={{ padding: '9px 12px', color: C.white, fontWeight: 500, cursor: 'pointer' }}>
                  {(c.bands || []).slice(0, 3).map(b => typeof b === 'string' ? b : b.name).join(', ')}
{c.bands?.length > 3 ? ` +${c.bands.length - 3}` : ''}
                </td>
                <td style={{ padding: '9px 12px', color: C.gray }}>{c.venue || '—'}</td>
                <td style={{ padding: '9px 12px', color: C.gray }}>{c.city || '—'}</td>
                <td style={{ padding: '9px 12px' }}>{c.genre ? <GenreBadge genre={c.genre} color={GENRE_COLORS[c.genre]} small /> : <span style={{ color: C.grayDim }}>—</span>}</td>
                <td style={{ padding: '9px 12px' }}>{c.is_festival ? <Badge color={C.teal}>Fest</Badge> : <Badge color={C.grayDim} bg="transparent">Solo</Badge>}</td>
                <td style={{ padding: '9px 12px' }}>{c.has_setlist ? <span style={{ color: C.gold }}>📋</span> : <span style={{ color: C.grayDim }}>—</span>}</td>
                <td style={{ padding: '9px 12px' }}>
                  <button onClick={() => onDuplicate(c)} style={{ background: 'none', border: `1px solid ${C.border}`, color: C.gray, cursor: 'pointer', fontSize: 14, borderRadius: 3, padding: '2px 6px' }} title="Duplicate">⧉</button>
                </td>
                <td style={{ padding: '9px 12px' }}>
                  <button onClick={() => onEdit(c)} style={{ background: 'none', border: `1px solid ${C.border}`, color: C.tealDim, cursor: 'pointer', fontSize: 14, borderRadius: 3, padding: '2px 6px' }}>✎</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
// ─── MODALS ───────────────────────────────────────────────────────────────────
// ─── UPCOMING MODAL (CLEAN & ARMORED) ───────────────────────────────────
function UpcomingModal({ show, onClose, onSave, onDelete }) {
  const isNew = !show?.id;
  
  // Initialize form with show data or defaults
  const [form, setForm] = useState({ 
    artist: '', 
    venue: '', 
    date: '', 
    status: 'TICKETS BOUGHT' 
  });
  const [saving, setSaving] = useState(false);

  // Sync state when "show" prop changes
  useEffect(() => {
    if (show && show.id) {
      setForm({
        artist: show.artist || '',
        venue: show.venue || '',
        date: show.date || '',
        status: show.status || 'TICKETS BOUGHT'
      });
    } else {
      setForm({ artist: '', venue: '', date: '', status: 'TICKETS BOUGHT' });
    }
  }, [show]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));


  
  const lbl = { 
    display: 'block', 
    fontFamily: "'Space Mono', monospace", 
    fontSize: 8, 
    letterSpacing: '0.15em', 
    textTransform: 'uppercase', 
    color: C.gold, 
    marginBottom: 4 
  };

  const inpStLocal = { 
    width: '100%', 
    background: 'rgba(0,0,0,0.5)', 
    border: `1px solid ${C.gold}44`, 
    color: '#fff', 
    padding: '12px', 
    fontFamily: "'Space Mono'", 
    borderRadius: '6px', 
    outline: 'none',
    marginBottom: 15,
    boxSizing: 'border-box'
  };

  return (
    <div
      style={{ 
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', 
        zIndex: 9000, display: 'flex', alignItems: 'center', 
        justifyContent: 'center', padding: 20, backdropFilter: 'blur(10px)' 
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="fade-in"
        style={{ 
          background: C.bgCard, border: `1px solid ${C.gold}`, 
          borderRadius: 16, padding: 35, width: '100%', maxWidth: 420, 
          boxShadow: `0 0 50px ${hexToRgba(C.gold, 0.2)}`, position: 'relative' 
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 }}>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: '2.5rem', color: C.white, letterSpacing: '1px' }}>
            {isNew ? 'NEW PLAN' : 'UPDATE INTEL'}
          </div>
          <div style={{ fontFamily: "'Space Mono'", fontSize: 8, color: C.gold, letterSpacing: 2 }}>
            STATUS: ACTIVE
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave}>
          <label style={lbl}>Artist / Band *</label>
          <input 
            style={inpStLocal} 
            value={form.artist} 
            onChange={e => set('artist', e.target.value)} 
            placeholder="e.g. Tame Impala" 
            required
          />

          <label style={lbl}>Venue</label>
          <input 
            style={inpStLocal} 
            value={form.venue} 
            onChange={e => set('venue', e.target.value)} 
            placeholder="e.g. Red Rocks" 
          />

          <label style={lbl}>Target Date *</label>
          <input 
            style={{ ...inpStLocal, colorScheme: 'dark' }} 
            type="date" 
            value={form.date} 
            onChange={e => set('date', e.target.value)} 
            required
          />

          <label style={lbl}>Logistics Status</label>
          <select 
            style={inpStLocal} 
            value={form.status} 
            onChange={e => set('status', e.target.value)}
          >
            <option value="TICKETS BOUGHT">TICKETS BOUGHT</option>
            <option value="ON SALE SOON">ON SALE SOON</option>
            <option value="DREAMING">DREAMING</option>
            <option value="MANIFESTING">MANIFESTING</option>
          </select>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
            {!isNew && (
              <button
                type="button"
                onClick={() => { if(window.confirm('Delete this show?')) onDelete(show.id); }}
                style={{ 
                  background: 'rgba(255,68,68,0.1)', border: `1px solid ${C.red}`, 
                  color: C.red, padding: '12px 20px', borderRadius: 8, cursor: 'pointer', 
                  fontFamily: "'Bebas Neue'", fontSize: '1.2rem' 
                }}
              >
                DELETE
              </button>
            )}
            
            <button
              type="button"
              onClick={onClose}
              style={{ 
                flex: 1, background: 'transparent', border: `1px solid ${C.border}`, 
                color: C.gray, padding: '12px 20px', borderRadius: 8, cursor: 'pointer', 
                fontFamily: "'Bebas Neue'", fontSize: '1.2rem' 
              }}
            >
              CANCEL
            </button>

            <button
              type="submit"
              disabled={saving}
              style={{ 
                flex: 2, background: C.gold, border: 'none', color: '#000', 
                padding: '12px 20px', borderRadius: 8, cursor: saving ? 'not-allowed' : 'pointer', 
                fontFamily: "'Bebas Neue'", fontSize: '1.4rem', fontWeight: 900,
                boxShadow: `0 0 20px ${hexToRgba(C.gold, 0.4)}`
              }}
            >
              {saving ? 'SYNCING...' : isNew ? 'CONFIRM' : 'UPDATE'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
function ShareCard({ artist, shows, onClose }) {
  const festCount=shows.filter(s=>s.is_festival).length, cities=[...new Set(shows.map(s=>s.city).filter(Boolean))], years=[...new Set(shows.map(s=>getYear(s.date)).filter(Boolean))].sort(), firstDate=fmtDate(shows[shows.length-1]?.date), lastDate=fmtDate(shows[0]?.date);
  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.9)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20 }} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="fade-in" style={{ width:'100%',maxWidth:420 }}>
        <div style={{ background:`linear-gradient(135deg,${C.bg},${C.bgCard},${C.bgCardAlt})`,border:`1px solid ${C.teal}`,borderRadius:12,padding:'28px 24px',boxShadow:`0 0 40px ${C.tealGlow}` }}>
          <div style={{ fontFamily:"'Space Mono',monospace",fontSize:8,letterSpacing:'0.25em',textTransform:'uppercase',color:C.tealDim,marginBottom:8 }}>🎸 CONCERT ARCHIVE // SIGNAL STAMP</div>
          <div style={{ fontFamily:"'Bebas Neue'",fontSize:'clamp(1.8rem,6vw,2.6rem)',color:C.white,lineHeight:1,marginBottom:16 }}>{artist}</div>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16 }}>
            {[[shows.length,'Times Seen'],[festCount,'Festival Sets'],[shows.length-festCount,'Standalone'],[cities.length,cities.length===1?'City':'Cities']].map(([val,label])=>(
              <div key={label} style={{ background:'rgba(255,255,255,0.04)',borderRadius:6,padding:'10px 12px',border:`1px solid ${C.border}` }}>
                <div style={{ fontFamily:"'Bebas Neue'",fontSize:'1.8rem',color:C.teal,lineHeight:1 }}>{val}</div>
                <div style={{ fontFamily:"'Space Mono',monospace",fontSize:7,color:C.gray,textTransform:'uppercase',marginTop:2 }}>{label}</div>
              </div>
            ))}
          </div>
          <div style={{ display:'flex',flexWrap:'wrap',gap:3,marginBottom:12 }}>{years.map(y=><span key={y} style={{ fontFamily:"'Space Mono',monospace",fontSize:7,background:`${C.teal}22`,color:C.teal,border:`1px solid ${C.teal}44`,padding:'2px 5px',borderRadius:3 }}>{y}</span>)}</div>
          <div style={{ fontFamily:"'Space Mono',monospace",fontSize:7,color:C.grayDim }}>First: {firstDate} · Last: {lastDate}</div>
        </div>
        <div style={{ display:'flex',gap:8,marginTop:12,justifyContent:'center' }}>
          <button onClick={()=>navigator.clipboard?.writeText(`I've seen ${artist} ${shows.length} times. First: ${firstDate}. Last: ${lastDate}. #ConcertHistory`).then(()=>alert('Copied!'))} style={{ fontFamily:"'Space Mono',monospace",fontSize:9,textTransform:'uppercase',background:C.teal,color:C.bg,border:'none',borderRadius:4,padding:'8px 16px',cursor:'pointer' }}>📋 Copy Stats</button>
          <button onClick={onClose} style={{ fontFamily:"'Space Mono',monospace",fontSize:9,textTransform:'uppercase',background:C.bgCard,color:C.gray,border:`1px solid ${C.border}`,borderRadius:4,padding:'8px 16px',cursor:'pointer' }}>Close</button>
        </div>
      </div>
    </div>
  );
}
// --- PHOTO VAULT TAB ---
// --- PHOTO VAULT TAB (MULTI-MEDIA UPGRADE) ---
function PhotoVaultTab({ concerts }) {
  const safeConcerts = Array.isArray(concerts) ? concerts : [];
  
  // Local state to handle the Lightbox
  const [activePhoto, setActivePhoto] = React.useState(null);

  const photos = useMemo(() => {
    const results = [];
    safeConcerts.forEach(c => {
      if (!c || !c.personal_photo_url) return;
      
      const urls = String(c.personal_photo_url)
        .split(',')
        .map(u => u.trim())
        .filter(Boolean);
      
      urls.forEach((url, idx) => {
        const startRotation = (Math.random() * 10 - 5).toFixed(2);
        results.push({
          id: `${c.id}-photo-${idx}`,
          url,
          artist: getBandName(c.bands?.[0]) || c.festival_name || 'UNKNOWN',
          date: c.date,
          venue: c.venue || c.festival_name,
          rotation: startRotation
        });
      });
    });
    return results.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }, [safeConcerts]);
  // Empty state handler
  if (safeConcerts.length > 0 && photos.length === 0) {
    return (
      <div style={{ padding: 100, textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: 20 }}>📸</div>
        <div style={{ fontFamily: "'Space Mono'", fontSize: 10, color: C.grayDim, letterSpacing: 3 }}>DECK EMPTY // AWAITING SIGNAL</div>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '60px 0', 
      overflowX: 'hidden',
      minHeight: '100vh',
      position: 'relative',
      backgroundColor: '#0a0a0c',
      backgroundImage: `url("https://www.transparenttextures.com/patterns/carbon-fibre.png")`, 
      backgroundAttachment: 'fixed'
    }} className="fade-in">
      
      {/* HEADER SECTION */}
      <div style={{ textAlign: 'center', marginBottom: 100, position: 'relative', zIndex: 10 }}>
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: '5rem', color: '#fff', lineHeight: 1 }}>
          THE <span style={{ color: C.purple }}>POLAROID</span> DECK
        </div>
        <div style={{ fontFamily: "'Space Mono'", fontSize: 10, color: C.purple, letterSpacing: 5 }}>
          {photos.length} MEMORIES ARCHIVED // PHYSICAL SIGNAL
        </div>
      </div>

      {/* THE PHOTO WALL (GRID) */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
        gap: '80px 40px', 
        padding: '0 40px',
        justifyItems: 'center',
        position: 'relative',
        zIndex: 5
      }}>
        {photos.map((p, i) => (
          <div 
            key={p.id} 
            className="polaroid-hitbox"
            style={{ 
              '--rotation': `${p.rotation}deg`, 
              position: 'relative',
              cursor: 'pointer'
            }}
            onClick={() => setActivePhoto(p)}
          >
             <PersonalPolaroid 
               src={p.url} 
               caption={p.artist} 
               date={p.date} 
               venue={p.venue} 
               index={i} 
             />
          </div>
        ))}
      </div>

      {/* LIGHTBOX OVERLAY */}
      {activePhoto && (
        <Lightbox 
          src={activePhoto.url} 
          caption={activePhoto.artist} 
          onClose={() => setActivePhoto(null)} 
          type="POLAROID" 
        />
      )}

      {/* FILM GRAIN OVERLAY */}
      <div style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999,
        opacity: 0.03, 
        backgroundImage: `url("https://upload.wikimedia.org/wikipedia/commons/7/76/1k_Noise_Condition.png")`,
        mixBlendMode: 'overlay'
      }} />
    </div>
  );
}
// ─── THEME SWITCHER ───────────────────────────────────────────────────────────
function ThemeSwitcher({ isMobile }) {
  const { themeId, setThemeId } = useTheme();
  const [open, setOpen] = useState(false);
  const current = THEMES[themeId];

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
      {/* Hide label completely on mobile */}
      {!isMobile && (
        <span style={{ fontFamily: "'Space Mono'", fontSize: 7, color: C.grayDim, letterSpacing: 1, fontWeight: 700, whiteSpace: 'nowrap' }}>
          CONSOLE_VIBE:
        </span>
      )}

      <button
        onClick={() => setOpen(o => !o)}
        style={{ 
          display: 'flex', alignItems: 'center', gap: isMobile ? 4 : 8, 
          background: 'rgba(0,0,0,0.6)', border: `1px solid ${current.dot}`, 
          borderRadius: '4px', padding: isMobile ? '4px 6px' : '4px 10px', cursor: 'pointer', 
          transition: 'all 0.2s',
          boxShadow: `0 0 10px ${hexToRgba(current.dot, 0.2)}`
        }}
      >
        <div style={{ width: 5, height: 5, borderRadius: '50%', background: current.dot, boxShadow: `0 0 8px ${current.dot}` }} />
        
        {/* Shorten name/font on mobile */}
        <span style={{ 
          fontFamily: "'Bebas Neue'", 
          fontSize: isMobile ? '0.75rem' : '0.9rem', 
          color: '#fff', 
          letterSpacing: '0.5px', 
          textTransform: 'uppercase' 
        }}>
          {current.name}
        </span>
        <span style={{ color: C.gray, fontSize: 8 }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div style={{ 
          position: 'absolute', top: 'calc(100% + 8px)', right: 0, 
          background: '#050508', border: `1px solid ${C.border}`, 
          borderRadius: 4, padding: 6, minWidth: isMobile ? 130 : 180, zIndex: 10000, 
          boxShadow: `0 20px 50px rgba(0,0,0,0.9)`
        }}>
          {THEME_ORDER.map(id => {
            const t = THEMES[id];
            return (
              <button key={id} onClick={() => { setThemeId(id); setOpen(false); }}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: 10, width: '100%', 
                  background: id === themeId ? `${t.dot}15` : 'transparent', 
                  border: 'none', borderRadius: 2, padding: '10px', cursor: 'pointer'
                }}
              >
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: t.dot }} />
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: '0.8rem', color: '#fff' }}>{t.name}</div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
// ─── TAB CONFIG ───────────────────────────────────────────────────────────────
const TAB_GROUPS = [
  {
    header: "HEADLINER",
    tabs: [
      ['dashboard', '⚡ CENTER STAGE', '#00e5cc'],
      ['timeline', '⏳ TIME MACHINE', '#00cfff'],
    ]
  },
  {
    header: "CHRONICLE",
    tabs: [
      ['byDay', '📅 PAPER TRAIL', '#00e5cc'],
      ['browse', '🔍 DIGGING', '#00cfff'],
    ]
  },
  {
    header: "Festival Season",
    tabs: [
      ['passport', '🗺️ STAMP BOOK', '#ffcc00'],
      ['byFest', '🎪 BOX SETS', '#ffcc00'],
    ]
  },
  {
    header: "ARCHIVE",
    tabs: [
      ['hof', '🏆 HEAVY ROTATION', '#9966ff'],
      ['vault', '📋 ARTIFACTS', '#00cc88'],
      ['photos', '📸 POLAROIDS', '#9966ff'],
      ['venues', '📍 STAGE DOOR', '#00cfff'],
    ]
  },
  {
    header: "Hitting the Road",
    tabs: [
      ['community', '🌐 CRATE DIGGING', '#ffcc00'],
    ]
  }, // 🟢 Added missing comma here
  {
    header: "STUDIO",
    tabs: [
      ['poster', '🎨 GIG POSTER', '#ff6699'],
    ]
  }
];

const RIGHT_TABS = [
  ['manage', '⚙️ THE OFFICE', '#888'],
];

function TrackRecordLogo({ size = 40 }) {
  const { themeId } = useTheme();
  const currentTheme = THEMES[themeId];
  const color = currentTheme.dot;
  
  const isMobile = window.innerWidth < 768;
  const logoSize = isMobile ? (size * 0.9) : size;

  const getAlpha = (hex, alpha) => {
    if (typeof hexToRgba === 'function') return hexToRgba(hex, alpha);
    return hex;
  };

  return (
    <svg width={logoSize} height={logoSize} viewBox="0 0 100 100" fill="none" style={{ overflow: 'visible' }}>
      <defs>
        <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <style>
          {`
            @keyframes pulseSignal {
              0% { opacity: 0.6; stroke-width: 2px; }
              50% { opacity: 1; stroke-width: 3px; }
              100% { opacity: 0.6; stroke-width: 2px; }
            }
            .active-signal { animation: pulseSignal 2s infinite ease-in-out; }
          `}
        </style>
      </defs>
      <circle cx="50" cy="50" r="48" stroke={getAlpha('#ffffff', 0.1)} strokeWidth="0.5" />
      <circle cx="50" cy="50" r="30" stroke={getAlpha('#ffffff', 0.05)} strokeWidth="0.5" />
      <path d="M15 50L25 45L35 55L45 48L55 52L65 45L75 55L85 50" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" filter="url(#neonGlow)" opacity="0.4" />
      <path className="active-signal" d="M15 50L25 45L35 55L45 48L55 52L65 45L75 55L85 50" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <polygon points="50,38 47,32 53,32" fill={color} filter="url(#neonGlow)" />
    </svg>
  );
}

function EditModal({ concert, onClose, onSave, onDelete, allConcerts = [] }) {
  const isMobile = window.innerWidth < 768;

  const initialState = {
    date: '', 
    artist: '', 
    venue: '', 
    city: '', 
    state: '',
    bands: [], // Array of objects: [{name: '', genre: 'Jam'}]
    is_festival: false, 
    festival_name: '',
    image_url: '', 
    personal_photo_url: '', 
    setlist_image_url: '', 
    festival_poster_url: ''
  };

  const [form, setForm] = useState(initialState);
  const [uploading, setUploading] = useState(false);
  const [entryStep, setEntryStep] = useState(concert === 'new' ? 'gate' : 'form');

  const set = (k, v) => {
    setForm(prev => {
      const newForm = { ...prev, [k]: v };
      if (k === 'venue' && v && v.length > 2) {
        const match = allConcerts.find(c => c.venue?.toLowerCase() === v.toLowerCase());
        if (match) {
          newForm.city = match.city || '';
          newForm.state = match.state || '';
        }
      }
      return newForm;
    });
  };

  async function uploadToArchive(file, type) {
    if (!file) return null;
    setUploading(true);
    
    // 🟢 THE FIX: Only check EXIF for Polaroids, and ONLY if the date is currently blank.
    // Ticket stubs and posters are usually photographed after the fact!
    if (type === 'POLAROID') {
      try {
        if (typeof EXIF !== 'undefined') {
          await new Promise((resolve) => {
            EXIF.getData(file, function() {
              const rawDate = EXIF.getTag(this, "DateTimeOriginal"); 
              if (rawDate) {
                const extractedDate = rawDate.split(' ')[0].replace(/:/g, '-');
                // Only auto-fill if the user hasn't manually entered a date yet
                setForm(prev => prev.date ? prev : { ...prev, date: extractedDate });
              }
              resolve();
            });
          });
        }
      } catch (e) { console.log("📡 NO EXIF"); }
    }

    const bucketMap = { 'TICKET': 'Ticket Stubs', 'SETLIST': 'setlists', 'POLAROID': 'polaroids', 'POSTER': 'posters' };
    
    try {
      const bucket = bucketMap[type];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
      const { data: { session } } = await supabase.auth.getSession();
      const filePath = `${session?.user?.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      setUploading(false);
      setEntryStep('form'); 
      return data.publicUrl;
    } catch (error) {
      console.error("Upload error:", error);
      setUploading(false);
      return null;
    }
  }

  // 🟢 PRE-FILL LOGIC: Ensures existing bands/genres load correctly on edit
  useEffect(() => {
  if (concert && concert !== 'new') {
    
    // Normalize bands — handle strings, objects, and empty arrays
    let loadedBands = [];
    if (Array.isArray(concert.bands) && concert.bands.length > 0) {
      loadedBands = concert.bands.map(b => {
        if (typeof b === 'string') {
          // Legacy string format — convert to object
          return { name: b, genre: concert.genre || 'Indie Rock' };
        }
        if (typeof b === 'object' && b.name) {
          // Already the new object format
          return b;
        }
        return { name: '', genre: 'Indie Rock' };
      });
    } else if (concert.artist) {
      // Very old entries with no bands array at all
      loadedBands = [{ name: concert.artist, genre: concert.genre || 'Indie Rock' }];
    }

    setForm({
      ...initialState,
      ...concert,
      artist: loadedBands[0]?.name || concert.artist || '',
      bands: loadedBands
    });

  } else {
    setForm(initialState);
  }
}, [concert]);

  const gateBtn = (color) => ({
    background: hexToRgba(color, 0.1), border: `1px solid ${color}`, color: '#fff',
    padding: '30px', borderRadius: '12px', cursor: 'pointer', fontFamily: "'Bebas Neue'",
    fontSize: '1.5rem', letterSpacing: '2px'
  });

  const labelStyle = { fontSize: 9, color: C.teal, fontFamily: "'Space Mono'", display: 'block', marginBottom: 4, letterSpacing: 1 };
  const inputStyle = { width: '100%', background: '#000', border: '1px solid #333', color: '#fff', padding: '10px', borderRadius: '6px', outline: 'none', marginBottom: '10px', fontFamily: "'Space Mono'", fontSize: '12px' };

  if (!concert) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(15px)' }}>
      <div className="fade-in" style={{ background: '#0a0a0c', border: `2px solid ${C.teal}`, borderRadius: 16, padding: isMobile ? 20 : 40, width: '95%', maxWidth: 750, maxHeight: '95vh', overflowY: 'auto' }}>
        
        {entryStep === 'gate' && (
          <div className="fade-in" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: 20 }}>📸</div>
            <h2 style={{ fontFamily: "'Bebas Neue'", fontSize: '2.5rem', color: '#fff' }}>DO YOU HAVE A PHOTO?</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 30 }}>
              <button onClick={() => setEntryStep('type')} style={gateBtn(C.teal)}>YES</button>
              <button onClick={() => setEntryStep('form')} style={gateBtn(C.grayDim)}>NO, SKIP</button>
            </div>
          </div>
        )}

        {entryStep === 'type' && (
          <div className="fade-in" style={{ textAlign: 'center' }}>
            <h2 style={{ fontFamily: "'Bebas Neue'", fontSize: '2rem', color: '#fff', marginBottom: 30 }}>SELECT ARTIFACT</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div onClick={() => document.getElementById('init-stub').click()} style={gateBtn(C.teal)}>
                TICKET STUB
                <input id="init-stub" type="file" hidden onChange={async (e) => {
                  const url = await uploadToArchive(e.target.files[0], 'TICKET');
                  if (url) set('image_url', url);
                }} />
              </div>
              <div onClick={() => document.getElementById('init-pic').click()} style={gateBtn(C.purple)}>
                PHOTO
                <input id="init-pic" type="file" hidden onChange={async (e) => {
                  const url = await uploadToArchive(e.target.files[0], 'POLAROID');
                  if (url) set('personal_photo_url', url);
                }} />
              </div>
            </div>
            <button onClick={() => setEntryStep('gate')} style={{ background: 'none', border: 'none', color: '#666', marginTop: 20, cursor: 'pointer', fontFamily: "'Space Mono'", fontSize: 10 }}>← GO BACK</button>
          </div>
        )}

        {entryStep === 'form' && (
          <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 }}>
              <h2 style={{ fontFamily: "'Bebas Neue'", fontSize: '2rem', color: C.teal }}>
                {concert === 'new' ? 'INITIALIZE SIGNAL' : 'RE-SYNC ARCHIVE'}
              </h2>
              <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.2fr 1fr', gap: 30 }}>
              
              {/* LEFT COLUMN: INTEL */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 15 }}>
                  <label style={labelStyle}>FESTIVAL MODE</label>
                  <input type="checkbox" checked={form.is_festival} onChange={e => set('is_festival', e.target.checked)} style={{ accentColor: C.teal }} />
                </div>

                <label style={labelStyle}>{form.is_festival ? 'FESTIVAL NAME' : 'HEADLINER'}</label>
                <input style={inputStyle} value={form.is_festival ? form.festival_name : form.artist} onChange={e => set(form.is_festival ? 'festival_name' : 'artist', e.target.value)} placeholder="e.g. Eggy" />

                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 10 }}>
                  <div>
                    <label style={labelStyle}>DATE</label>
                    <input type="date" style={{ ...inputStyle, colorScheme: 'dark' }} value={form.date} onChange={e => set('date', e.target.value)} />
                  </div>
                  <div>
                    <label style={labelStyle}>VENUE</label>
                    <input style={inputStyle} value={form.venue} onChange={e => set('venue', e.target.value)} placeholder="Aladdin Theater" />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 }}>
                  <input style={inputStyle} value={form.city} onChange={e => set('city', e.target.value)} placeholder="City" />
                  <input style={inputStyle} value={form.state} onChange={e => set('state', e.target.value)} placeholder="ST" maxLength={2} />
                </div>

                {/* 🎸 SMART BILL LINEUP */}
                <label style={{ ...labelStyle, color: C.teal, marginTop: 10 }}>LINEUP & GENRES</label>
                <div style={{ background: '#000', border: '1px solid #222', borderRadius: 8, padding: 12 }}>
                  {form.bands.map((b, idx) => (
                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 30px', gap: 8, marginBottom: 8 }}>
                      <input 
                        style={{ ...inputStyle, marginBottom: 0, fontSize: '11px' }} 
                        value={b.name || ''}
                        placeholder="Band Name"
                        onChange={e => {
                          const updated = [...form.bands];
                          updated[idx].name = e.target.value;
                          setForm(prev => ({ ...prev, bands: updated }));
                        }}
                      />
                      <select 
                        style={{ ...inputStyle, marginBottom: 0, fontSize: '10px' }} 
                        value={b.genre || ''} 
                        onChange={e => {
                          const updated = [...form.bands];
                          updated[idx].genre = e.target.value;
                          setForm(prev => ({ ...prev, bands: updated }));
                        }}
                      >
                        {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                      <button onClick={() => set('bands', form.bands.filter((_, i) => i !== idx))} style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer' }}>×</button>
                    </div>
                  ))}
                  <button 
                    onClick={() => set('bands', [...form.bands, { name: '', genre: 'Jam' }])} 
                    style={{ width: '100%', padding: '8px', background: '#0a0a0a', color: C.teal, border: '1px dashed #333', borderRadius: 4, fontSize: 9, cursor: 'pointer' }}
                  >
                    + ADD BAND TO BILL
                  </button>
                </div>
              </div>

              {/* RIGHT COLUMN: ARTIFACTS */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                <label style={labelStyle}>// PHYSICAL ARTIFACTS</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[ 
                    {k:'image_url', l:'STUB', i:'🎟️', id:'e-stub', t:'TICKET'}, 
                    {k:'personal_photo_url', l:'PHOTO', i:'📸', id:'e-pic', t:'POLAROID'}, 
                    {k:'setlist_image_url', l:'SETLIST', i:'📋', id:'e-set', t:'SETLIST'}, 
                    {k:'festival_poster_url', l:'POSTER', i:'🎨', id:'e-post', t:'POSTER'} 
                  ].map(item => (
                    <div key={item.k} onClick={() => document.getElementById(item.id).click()} style={{ background: form[item.k] ? '#00cc8811' : '#000', padding: 15, borderRadius: 8, border: `1px solid ${form[item.k] ? '#00cc88' : '#222'}`, textAlign: 'center', cursor: 'pointer' }}>
                      <div style={{ fontSize: '1.2rem' }}>{form[item.k] ? '✅' : item.i}</div>
                      <div style={{ fontSize: 7, marginTop: 5, color: '#666' }}>{item.l}</div>
                      <input id={item.id} type="file" hidden onChange={async (e) => { const url = await uploadToArchive(e.target.files[0], item.t); if (url) set(item.k, url); }} />
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <button onClick={() => onSave((concert && concert !== 'new') ? concert.id : null, form)} disabled={uploading} style={{ width: '100%', padding: '18px', background: uploading ? '#222' : C.teal, color: '#000', borderRadius: '8px', fontFamily: "'Bebas Neue'", fontSize: '1.5rem', cursor: 'pointer' }}>
                    {uploading ? 'SYNCING...' : 'COMMIT TO ARCHIVE'}
                  </button>
                  {concert !== 'new' && (
                    <button onClick={() => onDelete(concert.id)} style={{ background: 'none', border: '1px solid #441111', color: '#ff4444', padding: '10px', borderRadius: '6px', fontSize: '9px', cursor: 'pointer' }}>
                      DELETE SIGNAL PERMANENTLY
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
// ─── MAIN APP ────────────────────────────────────────────────────
export default function App() {
  // ── 1. AUTH & SYSTEM STATE ──
  const [session, setSession] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [onLanding, setOnLanding] = useState(true);
  const [themeId, setThemeIdRaw] = useState(() => localStorage.getItem('concert-theme') || 'neon-noir');
  const [navCollapsed, setNavCollapsed] = useState(window.innerWidth < 768); 
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [viewingUser, setViewingUser] = useState(null); // The UUID of the person we are visiting
  const [viewingUsername, setViewingUsername] = useState(null); // Their handle

  // ── 2. DATA STATE ──
  const [concerts, setConcerts] = useState([]);
  const [artistGenres, setArtistGenres] = useState({});
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);
const [authLoading, setAuthLoading] = useState(true);
  
  // ── 3. UI & NAVIGATION STATE ──
  const [activeTab, setActiveTab] = useState('dashboard');
  const [editTarget, setEditTarget] = useState(null);
  const [shareCard, setShareCard] = useState(null);
  const [upcomingModal, setUpcomingModal] = useState(null);
  const [nudgeTarget, setNudgeTarget] = useState(null);

  // ── 4. BROWSER & FILTER STATE ──
  const [search, setSearch] = useState('');
  const [yearFilter, setYearFilter] = useState('all');
  const [festFilter, setFestFilter] = useState('all');
  const [genreFilter, setGenreFilter] = useState('all');
  const [browseView, setBrowseView] = useState('shows');
  const [sortCol, setSortCol] = useState('date');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);

  // ── OWNER CHECK ──
  const isOwner = session?.user?.email === 'bellhorn12rs@gmail.com';
const isAdmin = !!session?.user; // any logged-in user can edit their own data

  const userValue = useMemo(() => {
    return {
      user: session?.user || null,
      session: session,
      isAdmin: isOwner,
      loading: loading
    };
  }, [session, loading, isOwner]);

  // ── 5. SYSTEM HANDLERS & EFFECTS ──

  // EFFECT A: The URL Listener (Watches the Address Bar)
  useEffect(() => {
    const syncView = async () => {
      const hash = window.location.hash;
      const match = hash.match(/^#\/u\/(.+)$/);
      
      if (match) {
        const username = match[1];
        // 1. Find the UUID for the username in the URL
        const { data } = await supabase.from('profiles').select('id').eq('username', username).single();
        if (data) {
          setViewingUser(data.id);
          setViewingUsername(username);
          setOnLanding(false);
        }
      } else {
        // 2. No username in URL? Back to your own archive.
        setViewingUser(null);
        setViewingUsername(null);
      }
    };

    // Listen for the "Back" button or Link clicks
    window.addEventListener('hashchange', syncView);
    syncView(); 

    // Clean up when the app closes
    return () => window.removeEventListener('hashchange', syncView);
  }, [session]); // Re-sync if the user logs in/out

  // EFFECT B: The Data Refresher (Loads the Shows)
  useEffect(() => {
    // Only fetch if we have a valid session or are viewing a public user
    if (session || viewingUser) {
      fetchConcerts();
      fetchUpcoming();
    }
  }, [viewingUser, session]);
  
  // 🔍 THE TEMPORAL SCANNER (Post-Show Nudge)
  useEffect(() => {
    if (upcoming.length > 0 && !loading && isAdmin) {
      const today = new Date().toISOString().split('T')[0];
      // Find the first upcoming show that happened yesterday or earlier
      const staleShow = upcoming.find(s => s.date < today);
      
      if (staleShow) {
        console.log("⚠️ STALE SIGNAL DETECTED:", staleShow.artist);
        setNudgeTarget(staleShow);
      }
    }
  }, [upcoming, loading]);

 // --- START OF UNIFIED SYSTEM BLOCK ---
// --- START OF REPAIRED SYSTEM BLOCK ---

// 1. HARDWARE & AUTH HEARTBEAT
useEffect(() => {
  // Check for active session on boot
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session) {
      setSession(session);
      // 🔥 CRITICAL: Don't just set loading false; trigger data check
    }
    setAuthLoading(false);
  });

  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
    console.log("SIGNAL EVENT:", event);
    setSession(session);
    setAuthLoading(false);
    
    if (session?.user?.id) {
      // If we just signed in or recovered a session from another tab
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        initRan.current = false; // Reset gate to ensure data is fetched
      }
    } else if (event === 'SIGNED_OUT') {
      setConcerts([]); // Clear history on logout
      initRan.current = false;
    }
  });

  const handleResize = () => {
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);
    if (mobile) setNavCollapsed(true);
  };

  window.addEventListener('resize', handleResize);
  return () => {
    window.removeEventListener('resize', handleResize);
    subscription.unsubscribe();
  };
}, []);

// 2. DATA SYNCHRONIZATION
const initRan = useRef(false);

useEffect(() => { 
  if (THEMES[themeId]) Object.assign(C, THEMES[themeId]);

  const init = async () => {
    // If we have no session, don't try to fetch user-specific data
    if (!session?.user?.id) return;

    setLoading(true);
    console.log("DATABASE FETCH: Initializing for user", session.user.id);
    
    try {
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Signal Timeout')), 8000)
      );
      
      // Promise.all ensures we don't resolve until we actually have the data
      await Promise.race([
        Promise.all([
          fetchConcerts(),
          fetchUpcoming(),
          fetchGenres().catch(e => console.warn('Genres failed silently:', e))
        ]),
        timeout
      ]);
    } catch (e) {
      console.error('ARCHIVE ERROR:', e);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 THE FIX: If we have a user and haven't run init yet, run it.
  if (session?.user?.id && !initRan.current && !authLoading) {
    initRan.current = true;
    init();
  }
}, [session, authLoading, themeId]);

// --- END OF REPAIRED SYSTEM BLOCK ---
  // 3. THEME & CONTEXT SETUP
  const setThemeId = (id) => {
    if (THEMES[id]) {
      Object.assign(C, THEMES[id]);
      setThemeIdRaw(id);
      localStorage.setItem('concert-theme', id);
    }
  };

  const themeCtx = useMemo(() => ({ themeId, setThemeId }), [themeId]);
  // --- END OF UNIFIED SYSTEM BLOCK ---
// ── 6. DATA DERIVATION ENGINE ──
  const PER_PAGE = 50; 

  const genreMap = useMemo(() => artistGenres || {}, [artistGenres]);

  const allSetsList = useMemo(() => {
    const r = [];
    if (!concerts || !Array.isArray(concerts)) return [];
    concerts.forEach(c => { 
      if (!c) return; 
      const bands = Array.isArray(c.bands) ? c.bands : [c.artist].filter(Boolean);
      bands.forEach(band => { 
        const name = getBandName(band);
        if (name) r.push({ ...c, artist: name }); 
      });
    });
    return r;
  }, [concerts]);

  const years = useMemo(() => {
    const ySet = new Set();
    if (Array.isArray(concerts)) {
      concerts.forEach(c => { const y = getYear(c.date); if (y) ySet.add(String(y)); });
    }
    return [...ySet].sort((a, b) => b - a);
  }, [concerts]);

  const applyFilters = useCallback((list, isSet = false) => {
    if (!list || !Array.isArray(list)) return [];
    let d = [...list];
    
    if (yearFilter !== 'all') d = d.filter(r => String(getYear(r.date)) === String(yearFilter));
    if (festFilter === 'fest') d = d.filter(r => r.is_festival);
    if (festFilter === 'solo') d = d.filter(r => !r.is_festival);
    
    if (genreFilter !== 'all') {
      d = d.filter(r => { 
        const g = isSet ? (artistGenres[r.artist] || 'Other') : (r.genre || 'Other'); 
        return g === genreFilter; 
      });
    }
    
    if (search) {
      const q = search.toLowerCase();
      d = d.filter(r => {
        const bandsMatch = isSet ? String(r.artist || '').toLowerCase().includes(q) : (r.bands || []).some(b => String(b).toLowerCase().includes(q));
        const v = String(r.venue || '').toLowerCase().includes(q);
        const ci = String(r.city || '').toLowerCase().includes(q);
        return bandsMatch || v || ci;
      });
    }
    return d;
  }, [yearFilter, festFilter, genreFilter, search, artistGenres]);

  const filteredSets = useMemo(() => {
    const d = applyFilters(allSetsList, true) || [];
    return [...d].sort((a, b) => { 
      const col = sortCol || 'date';
      const av = String(a[col] || '').toLowerCase();
      const bv = String(b[col] || '').toLowerCase();
      if (col === 'date') return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      return sortDir === 'asc' ? (av < bv ? -1 : 1) : (av > bv ? -1 : 1);
    });
  }, [allSetsList, applyFilters, sortCol, sortDir]);

  const paged = useMemo(() => {
    if (!filteredSets) return [];
    const start = (page - 1) * PER_PAGE;
    return filteredSets.slice(start, start + PER_PAGE);
  }, [filteredSets, page]);

  const totalPages = Math.max(1, Math.ceil((filteredSets?.length || 0) / PER_PAGE));

  const artistRows = useMemo(() => {
    const m = {};
    const filtered = applyFilters(allSetsList, true) || [];
    filtered.forEach(s => { 
      if (!s.artist) return;
      if (!m[s.artist]) m[s.artist] = { artist: s.artist, shows: [] }; 
      m[s.artist].shows.push(s); 
    });
    return Object.values(m).sort((a, b) => b.shows.length - a.shows.length);
  }, [allSetsList, applyFilters]);

  const dayGroups = useMemo(() => applyFilters(concerts) || [], [concerts, applyFilters]);

  const headerStats = useMemo(() => ({
    totalShows: concerts?.length || 0,
    totalSets: allSetsList?.length || 0,
    uniqueArtists: new Set(allSetsList?.map(s => s.artist)).size,
    festDays: concerts?.filter(c => c.is_festival).length || 0,
    setlistCount: concerts?.filter(c => c.has_setlist || c.has_setlist_names).length || 0,
  }), [concerts, allSetsList]);

  const artistCounts = useMemo(() => {
    const m = {};
    allSetsList.forEach(s => { m[s.artist] = (m[s.artist] || 0) + 1; });
    return Object.entries(m).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count }));
  }, [allSetsList]);

  const festBreakdown = useMemo(() => {
    const m = {};
    concerts.filter(c => c.is_festival && c.festival_name).forEach(c => { m[c.festival_name] = (m[c.festival_name] || 0) + 1; });
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [concerts]);

  const passport = useMemo(() => {
    const m = {};
    concerts.filter(c => c.is_festival && c.festival_name).forEach(c => { 
      if (!m[c.festival_name]) m[c.festival_name] = { name: c.festival_name, days: 0, years: new Set() }; 
      m[c.festival_name].days++; 
      const y = getYear(c.date); if (y) m[c.festival_name].years.add(y); 
    });
    return Object.values(m).map(f => ({ ...f, years: [...f.years].sort() })).sort((a, b) => b.days - a.days);
  }, [concerts]);

  const festGroupings = useMemo(() => {
    const m = {};
    concerts.filter(c => c.is_festival && c.festival_name).forEach(c => { 
      const yr = getYear(c.date) || 'Unknown'; 
      if (!m[c.festival_name]) m[c.festival_name] = { name: c.festival_name, years: {} }; 
      if (!m[c.festival_name].years[yr]) m[c.festival_name].years[yr] = []; 
      m[c.festival_name].years[yr].push(c); 
    });
    return Object.values(m).sort((a, b) => Object.values(b.years).flat().length - Object.values(a.years).flat().length);
  }, [concerts]);

  const stackedTimelineData = useMemo(() => {
    const yearsMap = {};
    allSetsList.forEach(s => {
      const y = getYear(s.date); if (!y) return;
      if (!yearsMap[y]) yearsMap[y] = { year: String(y).slice(2), fullYear: y };
      const v = s.venue || 'Unknown Venue';
      yearsMap[y][v] = (yearsMap[y][v] || 0) + 1;
    });
    const venueTotals = {};
    allSetsList.forEach(s => { const v = s.venue || 'Unknown Venue'; venueTotals[v] = (venueTotals[v] || 0) + 1; });
    const topVenues = Object.entries(venueTotals).sort((a, b) => b[1] - a[1]).slice(0, 15).map(v => v[0]);
    return Object.values(yearsMap).sort((a, b) => a.fullYear - b.fullYear).map(yearData => {
      const formatted = { ...yearData, other: 0 };
      Object.keys(yearData).forEach(key => {
        if (key !== 'year' && key !== 'fullYear' && !topVenues.includes(key)) { formatted.other += yearData[key]; delete formatted[key]; }
      });
      return formatted;
    });
  }, [allSetsList]);

  const venueKeys = useMemo(() => {
    const keys = new Set();
    stackedTimelineData.forEach(d => {
      Object.keys(d).forEach(k => { if (k !== 'year' && k !== 'fullYear' && k !== 'other') keys.add(k); });
    });
    return [...keys, 'other'];
  }, [stackedTimelineData]);

  const genreStats = useMemo(() => {
    const counts = {};
    allSetsList.forEach(s => { const g = artistGenres[s.artist] || 'Other'; counts[g] = (counts[g] || 0) + 1; });
    return Object.entries(counts).map(([name, count]) => ({ name, count, color: GENRE_COLORS[name] || GENRE_COLORS['Other'] })).sort((a, b) => b.count - a.count);
  }, [allSetsList, artistGenres]);

  const timelineData = useMemo(() => {
    const m = {};
    allSetsList.forEach(s => { const y = getYear(s.date); if (y) m[y] = (m[y] || 0) + 1; });
    return Object.entries(m).sort((a, b) => +a[0] - +b[0]).map(([year, count]) => ({ year: String(year).slice(2), count, fullYear: +year }));
  }, [allSetsList]);

  const handleGenreClick = (genre) => {
    setGenreFilter(genre);
    setBrowseView('artists');
    setActiveTab('browse');
  };
// ── 7. DB ACTIONS ──
// ── URL WATCHER: Detects when we click a curator card ──
  useEffect(() => {
    const handleHashChange = () => {
      // Force a re-render when the URL hash changes
      setSession(prev => ({ ...prev })); 
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

// ── THE TELEPORT BRIDGE ──
  const handleNavigateToUser = (targetUsername) => {
    // 1. Update the URL to the user's museum path
    window.location.hash = `#/u/${targetUsername}`;
    
    // 2. 🟢 THE FORCE: Tell React to look at the URL immediately
    // This ensures the App re-runs its "Gate" checks
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  };

  const handleSave = async (id, payload) => {
    if (!isAdmin) return;
    try {
      // 📡 THE FINAL HANDSHAKE: Mapping payload to DB columns
      const dataToStamp = {
        date: payload.date || null,
        bands: Array.isArray(payload.bands) ? payload.bands : [],
        venue: payload.venue || null,
        city: payload.city || null,
        state: payload.state || null,
        genre: payload.is_festival ? 'Festival' : (payload.bands[0]?.genre || payload.genre || 'Indie Rock'),
        is_festival: Boolean(payload.is_festival),
        festival_name: payload.festival_name || null,
        festival_day: payload.festival_day || null,
        
        // ARCHAEOLOGY MAPPING
        image_url: payload.image_url || null,
        setlist_image_url: payload.setlist_image_url || null,
        personal_photo_url: payload.personal_photo_url || null,
        festival_poster_url: payload.festival_poster_url || null,
        
        has_setlist: Boolean(payload.setlist_image_url || payload.has_setlist_names?.trim()),
        has_setlist_names: payload.has_setlist_names || null,
        user_id: session?.user?.id || null,
      };

      let result;
      if (id && id !== 'new') {
        result = await supabase.from('concerts').update(dataToStamp).eq('id', id);
      } else {
        result = await supabase.from('concerts').insert([dataToStamp]);
      }

      if (result.error) throw result.error;

      setEditTarget(null);
      await fetchConcerts(); 

    } catch (error) {
      console.error("DATABASE REJECTED SAVE:", error.message);
      alert('DATABASE REJECTED SAVE: ' + error.message);
    }
  };
  // ── 1. MAIN DATA FETCH (THE PIVOT) ──
  async function fetchConcerts() {
    // 🟢 Use viewingUser (Tara) if it exists, otherwise use your ID (Eric)
    const targetId = viewingUser || session?.user?.id;
    if (!targetId) return;

    const { data, error } = await supabase
      .from('concerts')
      .select('*')
      .eq('user_id', targetId) 
      .order('date', { ascending: false });
    
    if (data) setConcerts(data);
  }

  async function fetchGenres() {
    try {
      const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000));
      const query = supabase.from('artist_genres').select('*');
      const { data, error } = await Promise.race([query, timeout]);
      if (error) {
        console.error('fetchGenres error:', error);
        return;
      }
      if (data) {
        const gMap = {};
        data.forEach(row => { gMap[row.artist_name] = row.genre; });
        setArtistGenres(gMap);
      }
    } catch (e) {
      console.error('fetchGenres failed:', e.message);
      return; 
    }
  }

  async function fetchUpcoming() {
    // 🟢 Pivot check for Upcoming shows as well
    const targetId = viewingUser || session?.user?.id;
    if (!targetId) { console.log('fetchUpcoming: no target id'); return; }
    
    console.log('fetchUpcoming: starting');
    const { data } = await supabase
      .from('upcoming_concerts')
      .select('*')
      .eq('user_id', targetId) // 🟢 Pivoted
      .order('date', { ascending: true });
      
    console.log('fetchUpcoming: done', data?.length);
    if (data) setUpcoming(data);
  }

  // ── 2. MODIFICATION HANDLERS (ADMIN ONLY) ──
  async function handleDelete(id) {
    // 🛡️ SECURITY: Don't let someone delete while viewing another museum
    if (viewingUser) return; 
    
    if (!id || id === 'new') {
      setEditTarget(null);
      return;
    }

    if (window.confirm('PERMANENTLY DELETE THIS SHOW FROM ARCHIVE?')) {
      try {
        const { error } = await supabase
          .from('concerts')
          .delete()
          .eq('id', id);

        if (error) throw error;

        await fetchConcerts();
        setEditTarget(null);
      } catch (err) {
        console.error("Delete Error:", err);
        alert(`DELETE FAILED: ${err.message}`);
      }
    }
  }

  async function handleSetGenre(artist, genre) {
    if (!artist) return;
    const { error } = await supabase.from('artist_genres').upsert({ artist_name: artist, genre: genre }, { onConflict: 'artist_name' });
    if (!error) setArtistGenres(prev => ({ ...prev, [artist]: genre }));
  }

  const handleUpcomingSave = async (id, formData) => {
    if (viewingUser) return; // 🛡️ Stay in spectator mode
    try {
      if (id) {
        const { error } = await supabase
          .from('upcoming_concerts')
          .update(formData)
          .eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('upcoming_concerts')
          .insert([formData]);
        if (error) throw error;
      }
      await fetchUpcoming();
      setUpcomingModal(null);
    } catch (err) {
      alert("Save failed: " + err.message);
    }
  };

  const handleReconcile = async (upcomingId, payload) => {
    if (viewingUser) return;
    await handleSave(null, payload); 
    const { error } = await supabase
      .from('upcoming_concerts')
      .delete()
      .eq('id', upcomingId);

    if (!error) {
      setNudgeTarget(null);
      fetchUpcoming();
    }
  };

  async function handleUpcomingDelete(id) {
    if (viewingUser) return;
    if (window.confirm('Remove show?')) {
      await supabase.from('upcoming_concerts').delete().eq('id', id);
      fetchUpcoming();
      setUpcomingModal(null);
    }
  }

  async function handleDuplicate(concert) {
    if (viewingUser) return;
    const { id, created_at, ...rest } = concert;
    await supabase.from('concerts').insert([{ ...rest, date: '', festival_day: '' }]);
    fetchConcerts();
  }
// ── 7. NAVIGATION GATES ──

  
  // Gate B: Auth Bootup
  if (authLoading) return (
    <div style={{ background: '#050508', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: "'Bebas Neue'", fontSize: '2rem', color: '#00e5cc', letterSpacing: '0.15em' }}>RECOVERING SIGNAL...</div>
    </div>
  );

  // Gate C: The Entry Hall (Landing Page)
  // Condition: Show if no session OR if we are explicitly in "Landing" mode
  if (!session || onLanding) {
    return (
      <LandingPage 
        currentSession={session}
        onEnterArchive={() => setOnLanding(false)}
        onNavigateToUser={handleNavigateToUser}
        onLogout={async () => {
          await supabase.auth.signOut();
          window.location.reload(); // Hard reset to clear any stuck state
        }}
      />
    );
  }
  // Gate D: Data Synchronization (Interior)
  if (loading) return (
    <div style={{ background: C.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: "'Bebas Neue'", fontSize: '2rem', color: C.teal, letterSpacing: '0.15em' }}>SYNCHRONIZING ARCHIVE...</div>
    </div>
  );

  return (
    <ThemeContext.Provider value={themeCtx}>
      {/* ── 1. GLOBAL WRAPPER (Vertical Stack) ── */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100vh', 
        width: '100vw', 
        background: C.bg, 
        overflow: 'hidden' 
      }}>
        {/* ── 2. GLOBAL NEWS TICKER (Absolute Top) ── */}
        <NewsTicker concerts={concerts} artistCounts={artistCounts} genreStats={genreStats} />

        {/* ── 3. APPLICATION CONTENT (Sidebar + Stage) ── */}
        <div key={themeId} style={{ 
          flex: 1, 
          display: 'flex', 
          color: C.white,
          overflow: 'hidden', 
          width: '100%',
          position: 'relative'
        }}>       <MarqueeStyles />

          {/* ── VERTICAL SIDEBAR ── */}
<aside style={{
  width: isMobile ? (navCollapsed ? '0px' : '280px') : (navCollapsed ? '80px' : '280px'),
  minWidth: isMobile ? (navCollapsed ? '0px' : '280px') : (navCollapsed ? '80px' : '280px'),
  height: '100%',
  position: isMobile ? 'fixed' : 'relative',
  top: 0,
  left: isMobile && navCollapsed ? '-280px' : '0', 
  background: `linear-gradient(to right, ${C.bgCard} 0%, #050508 100%)`,
  borderRight: `1px solid ${C.border}`,
  display: 'flex',
  flexDirection: 'column',
  padding: '0',
  zIndex: 5000, 
  transition: 'all 0.3s ease-in-out',
  overflow: 'hidden',
  flexShrink: 0 
}}>
  {/* Toggle Button */}
  <button onClick={() => setNavCollapsed(!navCollapsed)} style={{ position: 'absolute', right: 15, top: 15, background: 'none', border: 'none', color: C.teal, cursor: 'pointer', fontSize: '1.2rem', zIndex: 10 }}>
    {isMobile ? '✕' : (navCollapsed ? '→' : '←')}
  </button>

  {/* 🟢 STEP 1: THE LOGO TRIGGER (Double-click to Login) */}
  <div 
    onDoubleClick={() => setShowLogin(true)} 
    style={{ 
      height: isMobile ? '70px' : '80px', 
      borderBottom: `1px solid ${C.border}`, 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      gap: '2px', 
      flexShrink: 0,
      cursor: 'pointer' 
    }}
  >
     <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '24px' }}>
        <TrackRecordLogo size={34} />
     </div>
     
     {(!navCollapsed || isMobile) && (
       <div className="fade-in">
         <h1 style={{ 
           fontFamily: "'Bebas Neue', sans-serif", 
           fontSize: '1.5rem', 
           margin: 0, 
           lineHeight: 0.8, 
           letterSpacing: '4px', 
           color: isAdmin ? C.teal : C.white, // Turns teal when you're logged in
           textTransform: 'uppercase' 
         }}>
           TRACK<span style={{ color: C.teal }}>RECORD</span>
         </h1>
       </div>
     )}
  </div>

  {/* ── MAIN NAV AREA ── */}
<div style={{ flex: 1, overflowY: 'auto', padding: '20px 0' }} className="wristband-bin">
  {TAB_GROUPS.map((group) => {
    // 🟢 Filter individual tabs: show everything except 'manage' to the public
    const visibleTabs = group.tabs.filter(([id]) => {
      if (id === 'manage' && !isAdmin) return false;
      return true;
    });

    if (visibleTabs.length === 0) return null;

    return (
      <div key={group.header} style={{ marginBottom: 35 }}>
        {(!navCollapsed || isMobile) && (
          <div style={{ 
            fontFamily: "'Bebas Neue'", fontSize: '1.1rem', color: C.teal, 
            letterSpacing: '3px', padding: '0 20px 14px' 
          }}>
            {group.header}
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {visibleTabs.map(([id, label, color]) => (
            <button key={id} onClick={() => { setActiveTab(id); if(isMobile) setNavCollapsed(true); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 14, fontFamily: "'Space Mono'", fontSize: '11px',
                color: activeTab === id ? '#fff' : C.gray, 
                background: activeTab === id ? hexToRgba(color, 0.15) : 'transparent', 
                border: 'none', borderLeft: `3px solid ${activeTab === id ? color : 'transparent'}`,
                padding: '12px 20px', cursor: 'pointer', textAlign: 'left', borderRadius: '0 4px 4px 0'
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>{label.split(' ')[0]}</span>
              {(!navCollapsed || isMobile) && <span style={{ textTransform: 'uppercase' }}>{label.split(' ').slice(1).join(' ')}</span>}
            </button>
          ))}
        </div>
      </div>
    );
  })}
</div>

{/* ── SYSTEM BOOTH (ADMIN ONLY) ── */}
{isAdmin && (
  <div style={{ 
    padding: '20px 12px', borderTop: `1px solid ${hexToRgba(C.teal, 0.3)}`, 
    background: 'rgba(0,0,0,0.3)', marginTop: 'auto' 
  }}>
    <div style={{ fontFamily: "'Bebas Neue'", fontSize: '0.9rem', color: C.teal, letterSpacing: 2, padding: '0 12px 10px' }}>
      SYSTEM BOOTH
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {RIGHT_TABS.map(([id, label, color]) => (
        <button key={id} onClick={() => setActiveTab(id)}
          style={{
            display: 'flex', alignItems: 'center', gap: 14, fontFamily: "'Space Mono'", fontSize: '11px',
            color: activeTab === id ? '#fff' : C.grayDim, 
            background: activeTab === id ? hexToRgba(color, 0.1) : 'transparent',
            border: 'none', borderLeft: `3px solid ${activeTab === id ? color : 'transparent'}`,
            padding: '10px 18px', cursor: 'pointer', borderRadius: '0 4px 4px 0', textAlign: 'left', textTransform: 'uppercase'
          }}>
          <span style={{ fontSize: '1.2rem' }}>{label.split(' ')[0]}</span>
          {(!navCollapsed || isMobile) && <span>{label.split(' ').slice(1).join(' ')}</span>}
        </button>
      ))}
      
      {/* Logout functionality tucked into the bottom of the Booth */}
      <button 
        onClick={async () => { if(window.confirm("TERMINATE SESSION?")) await supabase.auth.signOut(); }}
        style={{
          marginTop: 10, padding: '10px 18px', background: 'rgba(255, 68, 68, 0.05)', 
          border: 'none', borderLeft: '3px solid #ff4444', color: '#ff4444', 
          fontFamily: "'Space Mono'", fontSize: '10px', fontWeight: 900, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 14
        }}
      >
        <span style={{ fontSize: '1.2rem' }}>⏻</span>
        {(!navCollapsed || isMobile) && <span>LOGOUT</span>}
      </button>
    </div>
  </div>
)}
</aside>
          {/* ── 4. THE MAIN STAGE ── */}
          <div style={{ flex: 1, height: '100%', overflowY: 'auto', overflowX: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column', background: C.bg }}>
            
            {/* STICKY HEADER */}
            <header style={{ 
              padding: '0', background: '#050508', position: 'sticky', top: 0, zIndex: 100,
              display: 'flex', alignItems: 'stretch', borderBottom: `2px solid ${C.border}`,
              height: isMobile ? '75px' : '90px', flexShrink: 0, boxSizing: 'border-box', overflow: 'visible'
            }}>
              {/* Identity / Mobile Menu Trigger */}
              <div onClick={() => isMobile && setNavCollapsed(false)} style={{ width: isMobile ? '75px' : '280px', borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: isMobile ? `linear-gradient(135deg, ${hexToRgba(C.teal, 0.2)} 0%, #08080c 100%)` : `linear-gradient(135deg, ${C.bgCard} 0%, #08080c 100%)`, flexShrink: 0, cursor: isMobile ? 'pointer' : 'default', gap: 2 }}>
                <div style={{ transform: isMobile ? 'scale(0.7)' : 'none', lineHeight: 0 }}>
                  <TrackRecordLogo size={40} />
                </div>
                {isMobile && <div style={{ fontFamily: "'Space Mono'", fontSize: '7px', color: C.teal, letterSpacing: '1px', fontWeight: 900, opacity: 0.8 }}>MENU</div>}
              </div>

              {/* Header Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', flex: 1, gap: '1px', background: C.border, minWidth: 0 }}>
                {[
                  { value: headerStats.totalSets, label: 'SETS', color: C.teal, onClick: () => { setBrowseView('shows'); setActiveTab('browse'); } },
                  { value: headerStats.uniqueArtists, label: 'ACTS', color: C.cyan, onClick: () => { setBrowseView('artists'); setActiveTab('browse'); } },
                  { value: headerStats.totalShows, label: 'DAYS', color: C.purple, onClick: () => setActiveTab('timeline') },
                  { value: new Set(concerts.map(c => c.venue).filter(Boolean)).size, label: 'VENUES', color: C.red, onClick: () => setActiveTab('venues') },
                  { value: headerStats.setlistCount, label: 'FILES', color: C.gold, onClick: () => setActiveTab('vault') }
                ].map((s) => (
                  <div key={s.label} onClick={s.onClick} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative', background: `linear-gradient(180deg, ${hexToRgba(s.color, 0.08)} 0%, #050508 100%)`, transition: 'all 0.3s ease', overflow: 'hidden', padding: isMobile ? '0 2px' : '0' }}>
                    <div style={{ position: 'absolute', bottom: 0, left: '10%', right: '10%', height: '2px', background: s.color, boxShadow: `0 0 10px ${s.color}`, opacity: 0.8 }} />
                    <div style={{ fontFamily: "'Bebas Neue'", fontSize: isMobile ? '1.1rem' : '3rem', color: s.color, lineHeight: 1, textShadow: isMobile ? 'none' : `0 0 20px ${hexToRgba(s.color, 0.4)}` }}>{s.value}</div>
                    <div style={{ fontFamily: "'Space Mono'", fontSize: isMobile ? '5px' : '8px', color: '#fff', letterSpacing: isMobile ? '1px' : '3px', fontWeight: 900, marginTop: 4, opacity: 0.5 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', padding: isMobile ? '0 10px' : '0 30px', background: `linear-gradient(225deg, ${hexToRgba(C.teal, 0.05)} 0%, #050508 100%)`, borderLeft: `1px solid ${C.border}`, flexShrink: 0 }}>
                <ThemeSwitcher isMobile={isMobile} />
              </div>
            </header>
<main style={{ padding: '20px', width: '100%', boxSizing: 'border-box' }}>
  
  {/* 1. THE DASHBOARD (CENTER STAGE) */}

  {activeTab === 'community' && (
    <CommunityTab 
      onEnterMuseum={handleNavigateToUser} 
    />
  )}
  {activeTab === 'dashboard' && (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <OnThisDay concerts={concerts} />
      
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 2fr 1fr', gap: 20 }}>
        <ArtistInsights concerts={concerts} />
        <TheaterMarquee 
          upcoming={upcoming} 
          onAdd={isAdmin ? () => setUpcomingModal('new') : null} 
          onEdit={isAdmin ? setUpcomingModal : null} 
        />
        <RandomShow concerts={concerts} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 2fr', gap: 20 }}>
        <VenueDonutCard concerts={concerts} onNavigateToVenues={() => setActiveTab('venues')} />
        <Card neon>
          <CardTitle>Sets Per Year by Venue </CardTitle>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stackedTimelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                <XAxis dataKey="year" tick={{ fontSize: 8, fontFamily: "'Space Mono'", fill: C.gray }} />
                <YAxis tick={{ fontSize: 8, fontFamily: "'Space Mono'", fill: C.gray }} />
                <Tooltip contentStyle={{ background: C.bgCard, border: `1px solid ${C.teal}`, fontSize: 10 }} />
                {venueKeys.map((v, i) => (
                  <Bar key={v} dataKey={v} stackId="a" fill={v === 'other' ? '#334' : ['#00f2ff', '#9d00ff', '#ffcc00', '#ff4466', '#00cc88'][i % 5]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', 
        gap: 20,
        alignItems: 'stretch',
        height: isMobile ? 'auto' : '480px', 
        marginBottom: 20
      }}>
        <Card neon>
          <DonutChart fest={headerStats.festDays} solo={headerStats.totalShows - headerStats.festDays} concerts={concerts} />
        </Card>
        <Card neon>
          <CardTitle>Festival Passports</CardTitle>
          <TopFestBlocks festBreakdown={festBreakdown} concerts={concerts} />
        </Card>
        <Card neon>
          <CardTitle>By Decade</CardTitle>
          <DecadeBlocks sets={allSetsList} headerStats={headerStats} concerts={concerts} />
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20 }}>
        <Card neon style={{ height: 480, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <CardTitle>HEAVY ROTATION</CardTitle>
          <div className="wristband-bin" style={{ flex: 1, overflowY: 'auto', paddingRight: 8 }}>
            {artistCounts.filter(a => a.count >= 5).map((a, i) => (
              <div key={a.name} onClick={() => { setSearch(a.name); setBrowseView('shows'); setActiveTab('browse'); }} style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, marginBottom: 8, cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: "'Bebas Neue'", fontSize: '1.1rem' }}>{a.name}</span>
                  <span style={{ color: C.teal }}>{a.count}×</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card neon style={{ height: 480, display: 'flex', flexDirection: 'column' }}>
          <CardTitle>SETLIST SPOTLIGHT</CardTitle>
          <SetlistSpotlight concerts={concerts} onVault={() => setActiveTab('vault')} />
        </Card>
      </div>
    </div>
  )}

  {/* 2. CHRONICLE & TOUR BUS TABS */}
  {activeTab === 'timeline' && <TimelineTab concerts={concerts} setActiveTab={setActiveTab} genreMap={artistGenres} />}
  
  {activeTab === 'byDay' && <ByDayTab dayGroups={dayGroups} onEdit={isAdmin ? setEditTarget : null} genreMap={artistGenres} isAdmin={isAdmin} />}
  
  {/* 🟢 NEW PAPERTRAIL BLOCK GOES HERE */}
  {activeTab === 'papertrail' && (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {concerts.map((c, i) => {
        const band = getBandName(c.bands?.[0]) || c.festival_name || 'Unknown';
        const color = GENRE_COLORS[c.genre] || C.teal;
        const img = c.image_url?.split(',')[0] || c.personal_photo_url?.split(',')[0];
        
        return (
          <div key={c.id || i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px', background: C.bgCard, borderRadius: 6, border: `1px solid ${C.border}` }}>
            {img && <img src={img} alt={band} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 3 }} />}
            
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.1rem', color: C.white }}>{band.toUpperCase()}</div>
              <div style={{ fontFamily: "'Space Mono'", fontSize: 7, color: C.gray }}>{c.venue}</div>
            </div>
            
            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
              <div style={{ fontFamily: "'Space Mono'", fontSize: 8, color }}>{fmtDateShort(c.date)}</div>
              
              {/* 🟢 THE CLONE TRIGGER (Spectator Mode Only) */}
              {viewingUser && viewingUser !== session?.user?.id && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleIWasThere(c);
                  }}
                  style={{
                    background: 'transparent',
                    border: `1px solid ${C.teal}`,
                    color: C.teal,
                    padding: '4px 10px',
                    fontFamily: "'Space Mono'",
                    fontSize: 8,
                    cursor: 'pointer',
                    borderRadius: 4,
                    transition: 'all 0.2s',
                    textTransform: 'uppercase',
                    letterSpacing: 1
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = C.teal; e.currentTarget.style.color = '#000'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.teal; }}
                >
                  + I WAS THERE
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  )}

  {activeTab === 'byFest' && <ByFestTab festGroupings={festGroupings} genreMap={artistGenres} isAdmin={isAdmin} onEdit={isAdmin ? setEditTarget : null} />}
  
  {activeTab === 'passport' && (
    <PassportTab 
      passport={passport} 
      onNavigateToFest={name => { 
        setActiveTab('byFest'); 
        setTimeout(() => { 
          const el = document.getElementById(`fest-${name.toLowerCase().replace(/\s+/g, '-')}`); 
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); 
        }, 450); 
      }} 
    />
  )}

  {/* 3. ARCHIVE TABS */}
  {activeTab === 'hof' && <HallOfFame sets={allSetsList} genreMap={artistGenres} onShare={(a, s) => setShareCard({ artist: a, shows: s })} />}
  
  {activeTab === 'vault' && <SetlistVaultTab concerts={concerts} genreMap={artistGenres} />}
  
  {activeTab === 'photos' && <PhotoVaultTab concerts={concerts} />}
  
  {activeTab === 'venues' && <VenuesTab concerts={concerts} />}
  
  {/* 4. STUDIO TABS */}
  {activeTab === 'poster' && <PosterGeneratorTab concerts={concerts} genreMap={artistGenres} allSetsList={allSetsList} />}

  {/* 5. THE SEARCH ENGINE (BROWSE) */}
  {activeTab === 'browse' && (
    <BrowseTab 
      browseView={browseView}
      setBrowseView={setBrowseView}
      search={search}
      setSearch={setSearch}
      yearFilter={yearFilter}
      setYearFilter={setYearFilter}
      festFilter={festFilter}
      setFestFilter={setFestFilter}
      genreFilter={genreFilter}
      setGenreFilter={setGenreFilter}
      sortCol={sortCol}
      setSortCol={setSortCol}
      sortDir={sortDir}
      setSortDir={setSortDir}
      page={page}
      setPage={setPage}
      totalPages={totalPages}
      paged={paged} 
      artistRows={artistRows}
      years={years}
      onShare={(a, s) => setShareCard({ artist: a, shows: s })}
      onEdit={isAdmin ? setEditTarget : null} 
      isAdmin={isAdmin}
      onSetGenre={handleSetGenre}
      genreMap={artistGenres}
    />
  )}

  {/* 6. ADMIN OFFICE */}
  {isAdmin && activeTab === 'manage' && (
    <ManageTab 
      concerts={concerts} 
      onEdit={setEditTarget} 
      onAdd={() => setEditTarget('new')} 
      onDuplicate={handleDuplicate} 
    />
  )}
</main>

        {/* ── MODALS LAYER -── */}
       {isAdmin && nudgeTarget && (
  <div style={{ position: 'fixed', inset: 0, zIndex: 20000, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(20px)' }}>
    <div style={{ textAlign: 'center', maxWidth: 500, padding: 40 }}>
      <div style={{ fontSize: '4rem', marginBottom: 20, animation: 'pulse 2s infinite' }}>📡</div>
      <h2 style={{ fontFamily: "'Bebas Neue'", fontSize: '3rem', color: C.teal, lineHeight: 1 }}>SIGNAL DETECTED</h2>
      <p style={{ fontFamily: "'Space Mono'", fontSize: 12, color: '#fff', marginBottom: 30 }}>
        THE ARCHIVE DETECTED A RECENT SHOW: <br/>
        <span style={{ color: C.gold, fontSize: '1.5rem' }}>{nudgeTarget.artist.toUpperCase()}</span><br/>
        WAS AT {nudgeTarget.venue.toUpperCase()} ON {nudgeTarget.date}.
      </p>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
        <button 
          onClick={() => {
            setEditTarget({ ...nudgeTarget, isNudge: true });
            setNudgeTarget(null);
          }}
          style={{ padding: '20px', background: C.teal, color: '#000', border: 'none', borderRadius: 8, fontFamily: "'Bebas Neue'", fontSize: '1.2rem', cursor: 'pointer' }}
        >
          ARCHIVE NOW
        </button>
        <button 
          onClick={() => setNudgeTarget(null)}
          style={{ padding: '20px', background: 'transparent', border: `1px solid ${C.border}`, color: C.gray, borderRadius: 8, fontFamily: "'Bebas Neue'", fontSize: '1.2rem', cursor: 'pointer' }}
        >
          IGNORE SIGNAL
        </button>
      </div>
      <p style={{ marginTop: 20, fontFamily: "'Space Mono'", fontSize: 8, color: '#444' }}>THE SIGNAL WILL PERSIST UNTIL RECONCILED</p>
    </div>
  </div>
)}
        {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
        
        {shareCard && (
          <ShareCard 
            artist={shareCard.artist} 
            shows={shareCard.shows} 
            onClose={() => setShareCard(null)} 
          />
        )}
        
        {editTarget && (
          <EditModal 
            concert={editTarget === 'new' ? 'new' : editTarget} 
            onClose={() => setEditTarget(null)} 
            onSave={editTarget?.isNudge ? (id, payload) => handleReconcile(editTarget.id, payload) : handleSave}
            onDelete={handleDelete} 
            allConcerts={concerts}
          />
        )}
        
        {upcomingModal !== null && (
          <UpcomingModal 
            show={upcomingModal === 'new' ? null : upcomingModal} 
            onClose={() => setUpcomingModal(null)} 
            onSave={handleUpcomingSave} 
            onDelete={handleUpcomingDelete} 
          />
        )}
      </div> {/* Closes main content div */}
     </div> {/* Closes flex wrapper */}
    </div> {/* Closes root div */}
  </ThemeContext.Provider>
 );
}

// ── AUTHENTICATION COMPONENT ──
function LoginModal({ onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert("ACCESS DENIED: " + error.message);
    } else {
      onClose();
    }
    setLoading(false);
  };

  return (
    <div style={{ 
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', 
      zIndex: 20000, display: 'flex', alignItems: 'center', 
      justifyContent: 'center', backdropFilter: 'blur(12px)' 
    }}>
      <div style={{ 
        background: '#0a0a0c', border: `1px solid ${C.teal}`, padding: 40, 
        borderRadius: 12, width: '100%', maxWidth: 360, 
        boxShadow: '0 0 60px 0px rgba(0,242,255,0.2)',
        textAlign: 'center'
      }}>
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: '2.5rem', color: C.teal, marginBottom: 10, letterSpacing: 3 }}>
          ADMIN LOGIN
        </div>
        <div style={{ fontFamily: "'Space Mono'", fontSize: 9, color: '#555', marginBottom: 25, textTransform: 'uppercase' }}>
          Authorized Personnel Only // System Override Active
        </div>
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
          <input 
            type="email" placeholder="ADMIN EMAIL" value={email} 
            onChange={e => setEmail(e.target.value)}
            style={{ 
              background: '#000', border: '1px solid #222', color: '#fff', 
              padding: '14px', fontFamily: "'Space Mono'", fontSize: '12px', outline: 'none' 
            }}
          />
          <input 
            type="password" placeholder="PASSWORD" value={password} 
            onChange={e => setPassword(e.target.value)}
            style={{ 
              background: '#000', border: '1px solid #222', color: '#fff', 
              padding: '14px', fontFamily: "'Space Mono'", fontSize: '12px', outline: 'none' 
            }}
          />
          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            <button 
              type="button" onClick={onClose}
              style={{ flex: 1, background: 'transparent', border: '1px solid #333', color: '#666', padding: '12px', cursor: 'pointer', fontFamily: "'Space Mono'", fontSize: '10px' }}
            >
              ABORT
            </button>
            <button 
              type="submit" disabled={loading}
              style={{ flex: 2, background: C.teal, border: 'none', color: '#000', padding: '12px', cursor: 'pointer', fontFamily: "'Bebas Neue'", fontSize: '1.2rem', fontWeight: 900 }}
            >
              {loading ? 'VERIFYING...' : 'INITIALIZE'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}