import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { supabase } from './supabaseClient';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// ─── UTILITY ──────────────────────────────────────────────────────────────────
function hexToRgba(hex, alpha) {
  if (!hex || typeof hex !== 'string' || hex.length < 7) return `rgba(255,255,255,${alpha})`;
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${alpha})`;
}

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

// Theme context
const ThemeContext = React.createContext({ themeId:'neon-noir', setThemeId:()=>{} });
const useTheme = () => React.useContext(ThemeContext);

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
  const genres = [...new Set(bands.map(b => genreMap[b]).filter(Boolean))];
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
// ─── STYLES (POSTER & TEXTURE EDITION) ─────────────────────────────────────────
const MarqueeStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Monoton&family=Bebas+Neue&family=Space+Mono&family=Caveat:wght@600;700&family=UnifrakturMaguntia&display=swap');

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
    body::after {
      content: "";
      position: fixed;
      bottom: -10%; right: -10%; width: 50%; height: 50%;
      background: radial-gradient(circle, rgba(153, 102, 255, 0.07) 0%, transparent 70%);
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

    /* ── PHYSICAL ARCHIVE ANIMATIONS ── */
    @keyframes peel-and-stick {
      0% { transform: translateY(20px) scale(1.1) rotate(-5deg); opacity: 0; filter: blur(4px); }
      60% { transform: translateY(-2px) scale(1) rotate(2deg); opacity: 1; filter: blur(0); }
      100% { transform: translateY(0) scale(1) rotate(var(--r)); opacity: 1; }
    }

    @keyframes tape-slam {
      0% { transform: scale(3) translateY(-20px) translateX(-50%); opacity: 0; }
      100% { transform: scale(1) translateY(0) translateX(-50%); opacity: 0.8; }
    }

    @keyframes scrap-fall {
      0% { transform: translateY(-40px) rotate(var(--r, 0deg)); opacity: 0; }
      65% { transform: translateY(5px) rotate(var(--r, 0deg)); opacity: 1; }
      100% { transform: translateY(0) rotate(var(--r, 0deg)); opacity: 1; }
    }

    @keyframes tape-drop {
      0% { transform: translateX(-50%) translateY(-10px) scaleX(0.5); opacity: 0; }
      70% { transform: translateX(-50%) translateY(2px) scaleX(1.06); opacity: 0.9; }
      100% { transform: translateX(-50%) translateY(0) scaleX(1); opacity: 0.75; }
    }

    .scrap-paper {
      background-image: 
        repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(0,0,0,0.01) 20px, rgba(0,0,0,0.01) 21px),
        linear-gradient(160deg, #f5f0e8 0%, #e8e0cc 100%) !important;
      border-radius: 2px 5px 3px 6px / 4px 2px 5px 3px !important;
      filter: contrast(1.05) sepia(0.15);
      position: relative;
    }

    .scrap-paper::before {
      content: "";
      position: absolute;
      inset: 0;
      opacity: 0.04;
      pointer-events: none;
      background: url("https://www.transparenttextures.com/patterns/stardust.png");
    }

    @keyframes slot-machine {
      0% { transform: translateY(0); opacity: 1; }
      20% { transform: translateY(-10px); opacity: 0.5; }
      21% { transform: translateY(10px); opacity: 0; }
      100% { transform: translateY(0); opacity: 1; }
    }
    .spinning-text { animation: slot-machine 0.1s infinite; }

    @keyframes marquee { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
    @keyframes ticker-scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
    @keyframes chasing-bulb { 0%,100%{opacity:0.3; transform:scale(0.8)} 50%{opacity:1; transform:scale(1.1)} }
    @keyframes ferris-rotate { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
    @keyframes flicker { 0%,98%,100%{opacity:1} 99%{opacity:0.8} }

    .fade-in { animation: fade-in-kf 0.4s ease both; }
    @keyframes fade-in-kf { from{opacity:0; transform:translateY(10px)} to{opacity:1; transform:translateY(0)} }

    .ticket-hover:hover { transform: perspective(1000px) rotateX(2deg) rotateY(-2deg) scale(1.02); }
    .ticket-hover { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }

    .marquee-text { display: inline-block; padding-left: 100%; animation: marquee 75s linear infinite; }
    .marquee-flicker { animation: flicker 6s infinite; }
    .ferris-wheel-ring { animation: ferris-rotate 20s linear infinite; transform-origin: center; }

    .tab-active { position: relative; }
    .tab-active::after { 
      content: ''; position: absolute; bottom: 0; left: 15%; right: 15%; height: 2px; 
      background: var(--tab-color, #00e5cc); 
      box-shadow: 0 0 10px var(--tab-color, #00e5cc), 0 0 20px var(--tab-color, #00e5cc);
    }

    .sticky-year {
      position: sticky;
      top: 120px;
      font-family: 'Bebas Neue', sans-serif;
      font-size: 6rem;
      line-height: 1;
      writing-mode: vertical-rl;
      transform: rotate(180deg);
      white-space: nowrap;
      user-select: none;
      pointer-events: none;
    }

    .perf-edge { background-image: radial-gradient(circle at 0 50%, transparent 8px, #111118 8px); background-size: 1px 20px; }
    .wristband { background-image: repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px); }
    
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
    ::-webkit-scrollbar-thumb:hover { background: #444; }
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
  const V = { primary:{ background:C.teal, color:C.bg }, secondary:{ background:C.bgCardAlt, color:C.gray, border:`1px solid ${C.border}` }, danger:{ background:C.red+'22', color:C.red, border:`1px solid ${C.red}44` }, ghost:{ background:'transparent', color:C.teal, border:`1px solid ${C.borderLit}` } };
  return <button onClick={onClick} disabled={disabled} style={{ fontFamily:"'Space Mono',monospace", fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase', border:'none', borderRadius:4, padding:'8px 16px', cursor:disabled?'not-allowed':'pointer', opacity:disabled?0.5:1, transition:'all 0.15s', ...V[variant], ...style }}>{children}</button>;
};

const inputSt = { background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:4, padding:'7px 10px', color:C.white, fontSize:'0.85rem', outline:'none' };

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
    // Safety check: show a standby message if data hasn't loaded yet
    if (concerts.length === 0) return "INITIALIZING LIVE FEED... STAND BY...   ///   INITIALIZING LIVE FEED... STAND BY... ";
    
    const bits = [];
    if (artistCounts[0]) bits.push(`🏆 ALL-TIME LEADER: ${artistCounts[0].name.toUpperCase()} — SEEN ${artistCounts[0].count} TIMES`);
    if (artistCounts[1]) bits.push(`🎸 ${artistCounts[1].name.toUpperCase()} — ${artistCounts[1].count} SHOWS AND COUNTING`);
    if (genreStats[0]) bits.push(`🧬 DOMINANT GENRE: ${genreStats[0].name.toUpperCase()} WITH ${genreStats[0].count} SETS`);
    
    concerts.slice(0,3).forEach(c => {
        const bands = Array.isArray(c.bands) ? c.bands.join(', ') : (c.artist || 'UNKNOWN');
        bits.push(`⚡ RECENTLY ATTENDED: ${bands.toUpperCase()} — ${fmtDateShort(c.date).toUpperCase()}`);
    });

    bits.push(`📍 ${new Set(concerts.map(c=>c.state).filter(Boolean)).size} STATES CONQUERED ACROSS ${concerts.length} SHOW DAYS`);
    bits.push(`🎪 ${new Set(concerts.filter(c=>c.is_festival&&c.festival_name).map(c=>c.festival_name)).size} UNIQUE FESTIVALS ATTENDED`);
    bits.push(`🎯 ${new Set(concerts.flatMap(c=>c.bands||[])).size} UNIQUE ARTISTS WITNESSED LIVE`);
    
    const txt = bits.join('   ///   ') + '   ///   ';
    return txt + txt; // Double the string for the seamless loop
  }, [concerts, artistCounts, genreStats]);

  return (
    <div style={{ background:C.bgCard, border:`1px solid ${C.teal}33`, borderRadius:6, overflow:'hidden', marginTop:16 }}>
      <div style={{ display:'flex', alignItems:'stretch' }}>
        <div style={{ 
          background:C.teal, 
          color:C.bg, 
          fontFamily:"'Bebas Neue'", 
          fontSize:15, 
          letterSpacing:'0.2em', 
          padding:'12px 18px', 
          flexShrink:0, 
          display:'flex', 
          alignItems:'center', 
          whiteSpace:'nowrap', 
          boxShadow:`4px 0 12px ${C.tealGlow}`,
          zIndex: 10 
        }}>
          LIVE FEED
        </div>
        <div style={{ overflow:'hidden', flex:1, background:`${C.teal}08`, display:'flex', alignItems:'center' }}>
          <div style={{ 
            display:'inline-block', 
            whiteSpace:'nowrap', 
            animation:'ticker-scroll 90s linear infinite', 
            fontFamily:"'Space Mono',monospace", 
            fontSize:12, 
            color:C.teal, 
            padding:'12px 24px', 
            letterSpacing:'0.06em', 
            textShadow:`0 0 8px ${C.tealGlow}` 
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
        const bands = (ev.bands||[]).join(', ');
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
    const austinShows = concerts.filter(c=>c.city==='Austin').length;
    const austinPct = Math.round((austinShows/concerts.length)*100);
    const avgBands = (allSets.length/concerts.length).toFixed(1);
    const heavy = Object.entries(artistDates).filter(([,d])=>d.length>=10).length;
    return [
      { label:'PEAK INTENSITY', val:peakYear?.[0], sub:`Your busiest year on record with ${peakYear?.[1]} shows logged.` },
      { label:'HOME TURF', val:topCity?.[0]?.toUpperCase(), sub:`${topCity?.[1]} shows in your most-visited city.` },
      { label:'FESTIVAL RATIO', val:`${festPct}%`, sub:`${festPct}% of your history happened in a field.` },
      { label:'TOTAL LEGACY', val:concerts.length, sub:`Unique show days logged since you started.` },
      { label:'JUNE IS YOUR MONTH', val:'JUNE', sub:`76 shows in June — more than any other month by a mile.` },
      { label:'MOST LOYAL STAGE', val:topVenue?.[0], sub:`You've been to ${topVenue?.[0]} ${topVenue?.[1]} times.` },
      { label:'LONGEST STREAK', val:`${maxStreak} YRS`, sub:`${maxStreak} consecutive years without missing a single year.` },
      { label:'SXSW CHAMPION', val:'9 BANDS', sub:`Your personal record — 9 acts in a single day at SXSW 2008.` },
      { label:'RIDE OR DIE', val:longestRel.artist, sub:`${longestRel.span}-year relationship across ${longestRel.shows} shows.` },
      { label:'UNIQUE ARTISTS', val:uniqueArtists.size, sub:`${oneTimers} of them you've only seen once.` },
      { label:'WEEKEND WARRIOR', val:`${Math.round((weekend/concerts.length)*100)}%`, sub:`${Math.round((weekend/concerts.length)*100)}% of your shows fall on a Friday, Saturday, or Sunday.` },
      { label:'FESTIVAL PASSPORT', val:`${uniqueFests.size} FESTS`, sub:`${uniqueFests.size} unique festivals across ${festDays} total days.` },
      { label:'AUSTIN DOMINANCE', val:`${austinPct}%`, sub:`${austinShows} of ${concerts.length} shows happened in Austin, TX.` },
      { label:'BANDS PER DAY', val:avgBands, sub:`Average ${avgBands} acts per show day. You never leave early.` },
      { label:'HEAVY ROTATION', val:`${heavy} ARTISTS`, sub:`${heavy} artists you've seen 10 or more times.` },
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

// ─── RANDOM SHOW (WHEEL OF MEMORIES) ──────────────────────────────────────────
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

  return (
    <Card neon className="card-texture" style={{ minHeight: 220, position: 'relative', overflow: 'hidden' }}>
      <div className="big-watermark">{getYear(show.date)}</div>
      <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
          <div style={{ fontFamily: "'Space Mono'", fontSize: 8, color: C.purple, letterSpacing: 2, fontWeight: 700 }}>
            {spinning ? "🧠 RECALLING..." : "🎲 RANDOM RECALL"}
          </div>
          <button onClick={spin} disabled={spinning} style={{ background: spinning ? C.white : `linear-gradient(45deg, ${C.purple}, #ff00ff)`, border: 'none', color: '#fff', fontSize: 8, padding: '5px 12px', borderRadius: 4, cursor: 'pointer', fontFamily: "'Space Mono'", fontWeight: 900 }}>
            {spinning ? "•••" : "SPIN"}
          </button>
        </div>
        <div className={spinning ? "spinning-text" : "fade-in"} style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span style={{ background: C.white, color: C.bg, fontFamily: "'Bebas Neue'", fontSize: '1.4rem', padding: '0 8px' }}>{getYear(show.date)}</span>
            {show.is_festival && <Badge color={C.gold}>FESTIVAL</Badge>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 15 }}>
            {bands.slice(0, 3).map((b, i) => (
              <div key={i} style={{ fontFamily: "'Bebas Neue'", fontSize: bands.length > 2 ? '1.5rem' : '2.2rem', color: C.white, lineHeight: 1, letterSpacing: '0.05em', background: 'rgba(255,255,255,0.03)', padding: '4px 8px', borderLeft: `3px solid ${C.purple}` }}>
                {b.toUpperCase()}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 'auto' }}>
            <div style={{ fontFamily: "'Space Mono'", fontSize: 10, color: C.purple, fontWeight: 700 }}>
              📍 {show.venue?.toUpperCase() || 'UNKNOWN VENUE'}
            </div>
            <div style={{ fontFamily: "'Space Mono'", fontSize: 8, color: C.grayDim, textTransform: 'uppercase' }}>
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

// ─── DONUT / TOP FESTS / DECADES ──────────────────────────────────────────────
function DonutChart({ fest, solo }) {
  const total=fest+solo||1, festPct=fest/total, r=52,cx=70,cy=70,circ=2*Math.PI*r;
  const festDash=festPct*circ, soloDash=(1-festPct)*circ;
  return (
    <div style={{ display:'flex', alignItems:'center', gap:20 }}>
      <svg width={140} height={140} viewBox="0 0 140 140">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.border} strokeWidth={14} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.grayDim} strokeWidth={14} strokeDasharray={`${soloDash} ${circ}`} strokeDashoffset={-festDash} strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.teal} strokeWidth={14} strokeDasharray={`${festDash} ${circ}`} strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`} style={{ filter:`drop-shadow(0 0 4px ${C.teal}66)` }} />
        <text x={cx} y={cy-6} textAnchor="middle" style={{ fontFamily:"'Bebas Neue'", fontSize:18, fill:C.teal }}>{Math.round(festPct*100)}%</text>
        <text x={cx} y={cy+10} textAnchor="middle" style={{ fontFamily:"'Space Mono',monospace", fontSize:7, fill:C.gray }}>FESTIVAL</text>
      </svg>
      <div style={{ flex:1 }}>
        {[[C.teal,'Festival Days',fest],[C.grayDim,'Standalone',solo]].map(([color,label,val]) => (
          <div key={label} style={{ marginBottom:10 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}><span style={{ fontFamily:"'Space Mono',monospace", fontSize:8, color:C.gray, textTransform:'uppercase' }}>{label}</span><span style={{ fontFamily:"'Bebas Neue'", fontSize:'1rem', color }}>{val}</span></div>
            <div style={{ height:3, background:C.border, borderRadius:2, overflow:'hidden' }}><div style={{ height:'100%', width:`${(val/total)*100}%`, background:color, borderRadius:2 }} /></div>
          </div>
        ))}
        <div style={{ marginTop:12, fontFamily:"'Bebas Neue'", fontSize:'1.4rem', color:C.white, lineHeight:1 }}>{fest+solo}</div>
        <div style={{ fontFamily:"'Space Mono',monospace", fontSize:7, color:C.gray, textTransform:'uppercase', marginTop:2 }}>Total Show Days</div>
      </div>
    </div>
  );
}

function TopFestBlocks({ festBreakdown }) {
  const top3=festBreakdown.slice(0,3), colors=[C.teal,C.cyan,C.purple], medals=['🥇','🥈','🥉'];
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
      {top3.map(([name,count],i) => (
        <div key={name} style={{ display:'flex', alignItems:'center', gap:12, background:`${colors[i]}0a`, border:`1px solid ${colors[i]}33`, borderLeft:`3px solid ${colors[i]}`, borderRadius:4, padding:'10px 14px' }}>
          <span style={{ fontSize:'1.1rem' }}>{medals[i]}</span>
          <div style={{ flex:1 }}><div style={{ fontFamily:"'Bebas Neue'", fontSize:'1rem', color:C.white }}>{name}</div></div>
          <div style={{ textAlign:'right' }}><div style={{ fontFamily:"'Bebas Neue'", fontSize:'1.6rem', color:colors[i], lineHeight:1 }}>{count}</div><div style={{ fontFamily:"'Space Mono',monospace", fontSize:7, color:C.gray }}>days</div></div>
        </div>
      ))}
      {!top3.length && <div style={{ color:C.gray }}>No festival data yet.</div>}
    </div>
  );
}

function DecadeBlocks({ sets }) {
  const dec={'90s':0,'00s':0,'10s':0,'20s':0};
  sets.forEach(s => { const y=getYear(s.date); if(!y)return; if(y<2000)dec['90s']++; else if(y<2010)dec['00s']++; else if(y<2020)dec['10s']++; else dec['20s']++; });
  const max=Math.max(...Object.values(dec),1), colors=[C.purple,C.cyan,C.teal,C.gold];
  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:6 }}>
      {Object.entries(dec).map(([decade,count],i) => (
        <div key={decade} style={{ background:`${colors[i]}18`, border:`1px solid ${colors[i]}44`, borderBottom:`3px solid ${colors[i]}`, borderRadius:4, padding:'10px 8px', textAlign:'center' }}>
          <div style={{ fontFamily:"'Bebas Neue'", fontSize:'1.6rem', color:colors[i], lineHeight:1 }}>{count}</div>
          <div style={{ fontFamily:"'Space Mono',monospace", fontSize:7, color:C.gray, textTransform:'uppercase', marginTop:2 }}>{decade}</div>
          <div style={{ marginTop:6, height:2, background:C.border, borderRadius:1, overflow:'hidden' }}><div style={{ height:'100%', width:`${(count/max)*100}%`, background:colors[i] }} /></div>
        </div>
      ))}
    </div>
  );
}

// ─── HALL OF FAME (CLEANUP EDITION) ───────────────────────────────────────────
function HallOfFame({ sets, genreMap, onShare }) {
  const [selected, setSelected] = useState(null);
  const topRef = useRef(null);

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
    .filter(a => a.shows.length >= HALL_OF_FAME_MIN)
    .sort((a, b) => b.shows.length - a.shows.length);
  }, [sets, genreMap]);

  const selectedData = selected ? artists.find(a => a.artist === selected) : null;
  const MEDAL = ['🥇', '🥈', '🥉'];
  
  const handleSelect = (artist, isSelected) => { 
    if (isSelected) { setSelected(null); return; } 
    setSelected(artist); 
    setTimeout(() => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50); 
  };

  const artistMemories = useMemo(() => {
    if (!selectedData) return [];
    const pics = [];
    selectedData.shows.forEach(s => {
      const bandNames = (s.has_setlist_names || '').split(',').map(b => b.trim()).filter(Boolean);
      // Only include image if this artist is explicitly listed in has_setlist_names
      const artistIsListed = bandNames.some(b => b.toLowerCase() === selectedData.artist.toLowerCase());
      if (!artistIsListed) return;
      const imageLinks = (s.image_url || '').split(',').map(img => img.trim()).filter(Boolean);
      const bandIdx = bandNames.findIndex(b => b.toLowerCase() === selectedData.artist.toLowerCase());
      // Use the image at the matching index, or the first image if only one exists
      const img = imageLinks[bandIdx] || (imageLinks.length === 1 ? imageLinks[0] : null);
      if (img) pics.push({ url: img, date: s.date, venue: s.venue });
    });
    return pics;
  }, [selectedData]);

  return (
    <div ref={topRef} style={{ padding: '24px 0' }} className="fade-in">
      <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: C.gray, marginBottom: 16, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        Artists seen {HALL_OF_FAME_MIN}+ times — synced with your master artist genres
      </div>

      {selectedData && (() => {
        const gc = selectedData.genre ? (GENRE_COLORS[selectedData.genre] || C.teal) : C.teal;
        return (
          <div className="fade-in" style={{ 
            background: `linear-gradient(135deg, ${C.bgCard}, ${hexToRgba(gc, 0.08)})`, 
            border: `1px solid ${gc}55`, 
            borderRadius: 8, 
            padding: '30px', 
            marginBottom: 32, 
            boxShadow: `0 0 40px ${hexToRgba(gc, 0.25)}`,
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Background stats watermark */}
            <div style={{ position: 'absolute', right: -10, bottom: -20, fontFamily: "'Bebas Neue'", fontSize: '10rem', color: hexToRgba(gc, 0.04), pointerEvents: 'none', userSelect: 'none' }}>
              {selectedData.shows.length}X
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, position: 'relative', zIndex: 1 }}>
              <div>
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: '3rem', letterSpacing: '0.08em', color: gc, marginBottom: 4, lineHeight: 1 }}>
                  {selectedData.artist.toUpperCase()}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {selectedData.genre && <GenreBadge genre={selectedData.genre} color={gc} />}
                  <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: C.gray, textTransform: 'uppercase' }}>
                    {selectedData.shows.length} SETS RECORDED
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                {onShare && <button onClick={() => onShare(selectedData.artist, selectedData.shows)} style={{ fontFamily: "'Space Mono'", fontSize: 9, background: hexToRgba(gc, 0.15), border: `1px solid ${gc}44`, color: gc, borderRadius: 4, padding: '6px 12px', cursor: 'pointer', fontWeight: 700 }}>📤 SHARE HISTORY</button>}
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: `1px solid ${C.border}`, color: C.gray, fontSize: 10, borderRadius: 4, padding: '6px 12px', cursor: 'pointer' }}>CLOSE</button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '40px', position: 'relative', zIndex: 1 }}>
              {/* TIMELINE */}
              <div style={{ flex: 1.2, position: 'relative', paddingLeft: 20 }}>
                <div style={{ position: 'absolute', left: 5, top: 0, bottom: 0, width: 1, background: `linear-gradient(to bottom, ${gc}, ${C.grayDim})`, opacity: 0.3 }} />
                {[...selectedData.shows].reverse().map((s, i) => {
                  const hasSet = s.has_setlist || (s.has_setlist_names?.trim());
                  return (
                    <div key={i} style={{ position: 'relative', marginBottom: 14, paddingLeft: 14 }}>
                      <div style={{ position: 'absolute', left: -7, top: 4, width: 8, height: 8, borderRadius: '50%', background: s.is_festival ? gc : (hasSet ? C.gold : C.grayDim), zIndex: 2, boxShadow: hasSet ? `0 0 10px ${C.gold}88` : 'none' }} />
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: hasSet ? C.gold : C.tealDim, fontWeight: 700 }}>{fmtDate(s.date)}</span>
                        <span style={{ fontSize: '0.95rem', color: C.white }}>{s.venue}</span>
                        {s.is_festival && <Badge color={gc} small>{s.festival_name}</Badge>}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* MEMORY GALLERY */}
              <div style={{ flex: 1, borderLeft: '1px solid rgba(255,255,255,0.05)', paddingLeft: '24px' }}>
                <div style={{ fontFamily: "'Space Mono'", fontSize: 8, color: gc, letterSpacing: 2, marginBottom: 20, opacity: 0.6, textTransform: 'uppercase' }}>
                   Captured Artifacts ({artistMemories.length})
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignContent: 'start' }}>
                  {artistMemories.length > 0 ? (
                    artistMemories.map((m, idx) => (
                      <div key={idx} style={{ width: '110px', background: '#fff', padding: '5px 5px 12px 5px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', transform: `rotate(${(idx % 2 === 0 ? 2 : -2)}deg)`, transition: 'all 0.3s ease', cursor: 'pointer' }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.25) rotate(0deg)'; e.currentTarget.style.zIndex = 10; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = `rotate(${(idx % 2 === 0 ? 2 : -2)}deg)`; e.currentTarget.style.zIndex = 1; }}>
                        <img src={m.url} alt="setlist" style={{ width: '100%', height: '85px', objectFit: 'cover', display: 'block' }} />
                        <div style={{ fontFamily: "'Space Mono'", fontSize: '7px', color: '#000', marginTop: '6px', textAlign: 'center', fontWeight: 900 }}>{fmtDateShort(m.date)}</div>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '60px 20px', textAlign: 'center', width: '100%', opacity: 0.2 }}>
                      <div style={{ fontSize: '2.5rem', marginBottom: 15 }}>📷</div>
                      <div style={{ fontFamily: "'Space Mono'", fontSize: 9 }}>NO IMAGES FOUND</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* THE GRID VIEW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
        {artists.map((a, i) => {
          const gc = a.genre ? (GENRE_COLORS[a.genre] || C.teal) : null;
          const isSelected = selected === a.artist;
          const festCount = a.shows.filter(s => s.is_festival).length;
          const pct = Math.round((festCount / a.shows.length) * 100);
          const cardColor = isSelected ? (gc || C.teal) : gc;
          return (
            <div key={a.artist} onClick={() => handleSelect(a.artist, isSelected)} className="card-texture"
              style={{ background: cardColor ? `linear-gradient(135deg, ${C.bgCard}, ${hexToRgba(cardColor, 0.1)})` : C.bgCard, border: `1px solid ${cardColor ? hexToRgba(cardColor, 0.6) : C.border}`, boxShadow: cardColor ? `0 0 14px ${hexToRgba(cardColor, 0.25)}` : 'none', borderRadius: 8, padding: '15px', cursor: 'pointer', transition: 'all 0.2s', position: 'relative', overflow: 'hidden' }}>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: cardColor || C.tealDim, marginBottom: 4 }}>{MEDAL[i] || '🎤'} #{i + 1}</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: C.white, marginBottom: 4, lineHeight: 1.1 }}>{a.artist}</div>
              {a.genre && <GenreBadge genre={a.genre} color={gc} small />}
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: '2.2rem', color: cardColor || C.white, lineHeight: 1, marginTop: 10 }}>{a.shows.length}×</div>
              {(() => {
                const setlistCount = a.shows.filter(s => s.has_setlist || s.has_setlist_names?.trim()).length;
                if (!setlistCount) return null;
                return (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 6, background: `${C.gold}22`, border: `1px solid ${C.gold}44`, borderRadius: 10, padding: '2px 8px' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.gold, boxShadow: `0 0 6px ${C.gold}` }} />
                    <span style={{ fontFamily: "'Space Mono'", fontSize: 7, color: C.gold, fontWeight: 700 }}>{setlistCount} SETLIST{setlistCount > 1 ? 'S' : ''}</span>
                  </div>
                );
              })()}
              <div style={{ marginTop: 12, height: 3, background: C.border, borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: cardColor || C.teal, borderRadius: 2 }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontFamily: "'Space Mono',monospace", fontSize: 8, color: C.grayDim }}>
                <span>{festCount} FEST</span>
                <span>{a.shows.length - festCount} SOLO</span>
              </div>
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
  const headliner = bands[0] || 'UNKNOWN ARTIST';
  return (
    <div style={{ width: 260, flexShrink: 0, background: tpl.bg, borderRadius: 3, overflow: 'hidden', boxShadow: '2px 4px 12px rgba(0,0,0,0.4)', border: `1px solid ${hexToRgba(tpl.ink, 0.2)}`, fontFamily: "'Courier New', Courier, monospace", color: tpl.ink, position: 'relative', transform: 'rotate(-1.5deg)', userSelect: 'none' }}>
      <div style={{ background: tpl.accent, height: 6 }} />
      <div style={{ padding: '4px 6px 0', fontSize: 6, fontWeight: 900, color: tpl.accent, textTransform: 'uppercase' }}>{tpl.label}</div>
      <div style={{ padding: '2px 6px', fontSize: 11, fontWeight: 900, lineHeight: 1.1, textTransform: 'uppercase' }}>{headliner.length > 14 ? headliner.slice(0, 14) + '…' : headliner}</div>
      <div style={{ padding: '2px 6px', fontSize: 6, opacity: 0.75 }}>
        <div>{event.venue?.toUpperCase()}</div>
        <div>{event.city?.toUpperCase()}, {event.state}</div>
        <div>{fmtDateShort(event.date).toUpperCase()}</div>
      </div>
      <div style={{ borderTop: `1px dashed ${hexToRgba(tpl.ink, 0.25)}`, margin: '3px 0' }} />
      <div style={{ padding: '2px 6px 6px', display: 'flex', gap: '1px', justifyContent: 'center' }}>
        {[2,1,3,1,2,1,4,1,2,3,1,2].map((w, i) => (<div key={i} style={{ width: w, height: 14, background: tpl.ink, opacity: 0.85 }} />))}
      </div>
    </div>
  );
}

function TicketStubCard({ event, onEdit, genreMap, stubIdx = 0 }) {
  const bands = event.bands||[];
  const gi = getConcertGenreInfo(event, genreMap);
  const borderColor = gi.mixed ? C.teal : (gi.color||C.border);
  return (
    <div className="ticket-hover" onClick={() => onEdit && onEdit(event)} style={{ display:'flex', marginBottom:10, cursor:'pointer', filter:`drop-shadow(0 4px 12px rgba(0,0,0,0.5))`, gap: 10 }}>
      <DecorativeTicket event={event} templateIdx={stubIdx} />
      <div style={{ flex:1, background:`linear-gradient(135deg, ${C.bgCard}, ${hexToRgba(borderColor,0.08)})`, border:`1px solid ${borderColor}44`, borderLeft:`3px solid ${borderColor}`, borderRadius:6, padding:'12px 16px', position:'relative', overflow:'hidden' }}>
        <div style={{ fontFamily:"'Bebas Neue'", fontSize:'1.3rem', color:C.white }}>{fmtDate(event.date)}</div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginTop:8 }}>
          {bands.map((b,i) => (<span key={i} style={{ fontSize:i===0?'1rem':'0.78rem', fontFamily:i===0?"'Bebas Neue'":"'Space Mono'", color:C.white }}>{b}{i<bands.length-1&&i!==0?' •':''}</span>))}
        </div>
      </div>
    </div>
  );
}

function WristbandCard({ event, genreMap, compact = false }) {
  const bands = event.bands || [];
  const STAGE_COLORS = [C.teal, C.cyan, C.purple, C.gold, C.green];
  
  // Logic: Multi-column grid for Festival Tab, single column/compact for elsewhere
  const numCols = compact ? 1 : Math.max(1, bands.length <= 5 ? 3 : 4);
  const columns = Array.from({ length: numCols }, () => []);
  bands.forEach((b, i) => columns[i % numCols].push(b));
  
  const gi = getConcertGenreInfo(event, genreMap);
  const wristColor = gi.mixed ? C.cyan : (gi.color || C.teal);

  return (
    <div style={{ background: compact ? C.bgCardAlt : C.bgCard, border: `1px solid ${C.border}`, borderRadius: 6, marginBottom: compact ? 8 : 16, overflow: 'hidden' }}>
      {/* 1. PHYSICAL WRISTBAND HEADER */}
      <div style={{ padding: '12px 16px', background: hexToRgba(wristColor, 0.05), borderBottom: `1px solid ${C.border}` }}>
        <PhysicalWristband color={wristColor} label={event.festival_name} year={getYear(event.date)} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.2rem', color: C.white }}>{fmtDate(event.date)}</div>
          <div style={{ display: 'flex', gap: 6 }}>
            <GenreBadge genre={gi.genre} color={gi.color} mixed={gi.mixed} small />
            <Badge color={wristColor}>{event.festival_name || 'FESTIVAL'}</Badge>
          </div>
        </div>
      </div>
      
      {/* 2. THE LINEUP GRID (Restored for Festival Tab) */}
      {!compact && columns.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns.length}, 1fr)`, borderTop: `1px solid ${C.border}`, background: 'rgba(0,0,0,0.15)' }}>
          {columns.map((stageBands, ci) => (
            <div key={ci} style={{ borderRight: ci < columns.length - 1 ? `1px solid ${C.border}` : 'none', padding: '12px' }}>
              {/* Stage Accent Line */}
              <div style={{ height: 2, background: STAGE_COLORS[ci % STAGE_COLORS.length], marginBottom: 10, opacity: 0.7 }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {stageBands.map((band, bi) => (
                  <div key={bi} style={{ fontSize: '0.75rem', color: C.white, lineHeight: 1.2, fontFamily: "'Space Mono'", opacity: 0.9 }}>
                    • {band}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
// ─── 2. SETLIST VAULT (CLEAN IMAGE LOGIC) ────────────────────────────────────
function SetlistVaultTab({ concerts, genreMap }) {
  const setlists = useMemo(() => {
    const results = [];
    concerts.forEach(c => {
      if (!c.has_setlist_names?.trim()) return;
      const bands = c.has_setlist_names.split(',').map(b => b.trim()).filter(Boolean);
      const images = (c.image_url || '').split(',').map(img => img.trim()).filter(Boolean);
      bands.forEach((band, idx) => {
        const img = images[idx] || (images.length === 1 ? images[0] : null);
        results.push({ id: `${c.id}-${band}`, band, date: c.date, venue: c.venue, city: c.city, state: c.state, festival_name: c.festival_name, is_festival: c.is_festival, image_url: img });
      });
    });
    return results.sort((a, b) => b.date.localeCompare(a.date));
  }, [concerts]);

  if (!setlists.length) return <div style={{ padding:'80px 0', textAlign:'center' }}><div style={{ fontSize:'4rem' }}>📋</div><div style={{ fontFamily:"'Bebas Neue'", fontSize:'2rem', color:C.white }}>VAULT IS EMPTY</div></div>;

  return (
    <div style={{ padding:'40px 0' }} className="fade-in">
      <div style={{ textAlign:'center', marginBottom:48 }}><div style={{ fontFamily:"'Bebas Neue'", fontSize:'4rem', color:C.white }}>SETLIST <span style={{ color:C.teal }}>VAULT</span></div></div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'40px' }}>
        {setlists.map((s, i) => (
          <div key={s.id} style={{ position:'relative', transform:`rotate(${(i%2===0?1:-1)*(i%3)}deg)`, marginBottom:30 }}>
            <div style={{ background: '#fff', padding: '5px', boxShadow: '0 10px 20px rgba(0,0,0,0.5)', borderRadius: 2 }}>
              <div style={{ padding: '8px 4px', textAlign: 'center', background: '#111', color: '#fff', fontFamily: "'Bebas Neue'", fontSize: '1.2rem' }}>{s.band.toUpperCase()}</div>
              {s.image_url ? <img src={s.image_url} alt={s.band} style={{ width: '100%', height: 'auto', maxHeight: '300px', objectFit: 'contain', background: '#000' }} /> : <div style={{ height: '150px', background: '#f5f0e8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: '10px' }}>NO IMAGE</div>}
              <div style={{ padding: '10px 6px', color: '#000', fontSize: '9px', fontFamily: "'Space Mono'" }}>{fmtDateShort(s.date)} • {s.venue}</div>
            </div>
          </div>
        ))}
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

// ─── 1. HORIZONTAL TIMELINE CARD (UP/DOWN ALTERNATING) ───────────────────────
function TimelineCard({ item, isUp, onTeleport, genreMap }) {
  const [isHovered, setIsHovered] = useState(false);
  const gi = getConcertGenreInfo(item, genreMap);
  const themeColor = gi.mixed ? '#9d00ff' : (gi.color || C.teal);
  const bands = item.bands || [];

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)} 
      onMouseLeave={() => setIsHovered(false)}
      onClick={onTeleport}
      style={{ 
        position: 'relative', 
        height: '100%', 
        width: '60px', // Spacing between days
        flexShrink: 0,
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: isHovered ? 100 : 1,
        cursor: 'pointer'
      }}
    >
      {/* THE SPINE BUBBLE (On the center rail) */}
      <div style={{ 
        width: isHovered ? '14px' : '8px', 
        height: isHovered ? '14px' : '8px', 
        borderRadius: '50%', 
        background: themeColor, 
        zIndex: 10, 
        boxShadow: isHovered ? `0 0 20px ${themeColor}` : `0 0 5px ${themeColor}44`,
        transition: 'all 0.2s ease',
        border: `1px solid ${C.bg}`,
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)'
      }} />

      {/* THE VERTICAL CONNECTOR LINE */}
      <div style={{ 
        position: 'absolute',
        left: '50%',
        bottom: isUp ? '50%' : 'auto',
        top: isUp ? 'auto' : '50%',
        width: '1px',
        height: isHovered ? '60px' : '30px',
        background: `linear-gradient(${isUp ? 'to top' : 'to bottom'}, ${themeColor}, transparent)`,
        opacity: isHovered ? 1 : 0.3,
        transition: 'all 0.3s ease'
      }} />

      {/* THE CONTENT BOX */}
      <div style={{ 
        position: 'absolute',
        bottom: isUp ? 'calc(50% + 30px)' : 'auto',
        top: isUp ? 'auto' : 'calc(50% + 30px)',
        width: isHovered ? '320px' : '140px',
        padding: isHovered ? '18px' : '4px 0',
        background: isHovered ? C.bgCard : 'transparent',
        border: isHovered ? `1px solid ${themeColor}` : 'none',
        borderRadius: '8px',
        textAlign: 'center',
        transform: isHovered ? (isUp ? 'translateY(-10px)' : 'translateY(10px)') : 'none',
        transition: 'all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        boxShadow: isHovered ? `0 15px 40px rgba(0,0,0,0.9)` : 'none',
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        
        {/* RESTING STATE */}
        {!isHovered && (
          <div className="fade-in">
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: '0.85rem', color: C.white, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>
              {bands[0]?.toUpperCase()}
            </div>
            <div style={{ fontFamily: "'Space Mono'", fontSize: '7px', color: themeColor, opacity: 0.7 }}>
              {item.date.split('-')[1]}/{item.date.split('-')[2]}
            </div>
          </div>
        )}

        {/* HOVER STATE */}
        {isHovered && (
          <div className="fade-in" style={{ width: '100%' }}>
             <div style={{ marginBottom: 12, transform: 'scale(0.85)' }}>
                {item.is_festival 
                  ? <WristbandCard event={item} genreMap={genreMap} compact={true} /> 
                  : <DecorativeTicket event={item} templateIdx={0} />
                }
             </div>
             <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.5rem', color: C.white, lineHeight: 1.1, marginBottom: 6 }}>
               {bands[0]?.toUpperCase()}
             </div>
             {bands.length > 1 && (
               <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '4px 8px', marginBottom: 10, borderTop: `1px solid ${C.border}`, paddingTop: 8 }}>
                 {bands.slice(1, 4).map((b, bi) => (
                   <span key={bi} style={{ fontFamily: "'Space Mono'", fontSize: '7px', color: C.gray }}>{b.toUpperCase()}</span>
                 ))}
                 {bands.length > 4 && <span style={{ fontFamily: "'Space Mono'", fontSize: '7px', color: C.teal }}>+{bands.length-4} MORE</span>}
               </div>
             )}
             <div style={{ borderTop: `1px dashed ${C.border}`, paddingTop: 8, display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '7px', fontFamily: "'Space Mono'", color: C.grayDim }}>
                <GenreBadge genre={gi.genre} color={gi.color} small />
                <span>{item.venue?.toUpperCase()}</span>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── 2. THE PANORAMIC HORIZONTAL TIMELINE ────────────────────────────────────
function TimelineTab({ concerts, setActiveTab, genreMap }) {
  const horizontalFlow = useMemo(() => {
    if (!concerts || concerts.length === 0) return [];
    
    // Sort chronological (Left to Right)
    const sorted = [...concerts].sort((a, b) => a.date.localeCompare(b.date));
    const result = [];
    let lastYear = -1;
    let lastMonth = -1;
    const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

    sorted.forEach((s, i) => {
      const dt = new Date(s.date + 'T12:00:00');
      const yr = dt.getFullYear();
      const mo = dt.getMonth();

      // Inject Year Break
      if (yr !== lastYear) {
        result.push({ type: 'YEAR_MARKER', label: yr, id: `yr-${yr}` });
        lastYear = yr;
        lastMonth = -1; // Reset month marker on new year
      }

      // Inject Month Break
      if (mo !== lastMonth) {
        result.push({ type: 'MONTH_MARKER', label: monthNames[mo], id: `mo-${yr}-${mo}` });
        lastMonth = mo;
      }

      result.push({ ...s, type: 'SHOW', side: i % 2 === 0 ? 'up' : 'down' });
    });

    return result;
  }, [concerts]);

  const teleport = date => { 
    setActiveTab('byDay');
    setTimeout(() => {
      const el = document.querySelector(`[data-date="${date}"]`);
      if(el) el.scrollIntoView({behavior:'smooth', block:'center'});
    }, 150);
  };

  return (
    <div style={{ width: '100%', padding: '40px 0' }} className="fade-in">
      <GenreLegend />
      
      {/* SCROLL CONTAINER */}
      <div style={{ 
        width: '100%', 
        height: '650px', 
        overflowX: 'auto', 
        overflowY: 'hidden',
        position: 'relative',
        background: 'rgba(255,255,255,0.02)',
        borderRadius: '16px',
        border: `1px solid ${C.border}`,
        padding: '0 100px' // Initial padding so first item isn't glued to wall
      }}>
        
        {/* THE CENTER RAIL (HORIZONTAL SPINE) */}
        <div style={{ 
          position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', 
          background: `linear-gradient(to right, transparent, ${C.teal}, ${C.purple}, ${C.gold}, transparent)`, 
          opacity: 0.3, zIndex: 1 
        }} />

        {/* THE TRACK */}
        <div style={{ display: 'flex', height: '100%', alignItems: 'center' }}>
          {horizontalFlow.map((item) => {
            if (item.type === 'YEAR_MARKER') {
              return (
                <div key={item.id} style={{ 
                  display: 'flex', flexDirection: 'column', alignItems: 'center', 
                  margin: '0 60px', position: 'relative', zIndex: 2 
                }}>
                  <div style={{ 
                    fontFamily: "'Bebas Neue'", fontSize: '6rem', color: C.teal, 
                    lineHeight: 1, textShadow: `0 0 20px ${hexToRgba(C.teal, 0.5)}` 
                  }}>{item.label}</div>
                  <div style={{ width: '2px', height: '400px', background: C.border, opacity: 0.1, position: 'absolute', top: '-150px' }} />
                </div>
              );
            }
            if (item.type === 'MONTH_MARKER') {
              return (
                <div key={item.id} style={{ margin: '0 30px', textAlign: 'center' }}>
                  <div style={{ 
                    fontFamily: "'Space Mono'", fontSize: '10px', color: C.gray, 
                    transform: 'rotate(-90deg)', letterSpacing: '4px', fontWeight: 900,
                    width: '20px', whiteSpace: 'nowrap'
                  }}>
                    {item.label}
                  </div>
                </div>
              );
            }
            return (
              <TimelineCard 
                key={item.id} 
                item={item} 
                isUp={item.side === 'up'} 
                onTeleport={() => teleport(item.date)} 
                genreMap={genreMap} 
              />
            );
          })}
        </div>
      </div>
      
      <div style={{ textAlign: 'center', marginTop: 20, fontFamily: "'Space Mono'", fontSize: 8, color: C.grayDim, letterSpacing: '0.2em' }}>
        ↔ SCROLL HORIZONTALLY TO EXPLORE HISTORY
      </div>
    </div>
  );
}
// ─── 4. BY DAY TAB ────────────────────────────────────────────────────────────
function ByDayTab({ dayGroups, onEdit, genreMap, search, setSearch, yearFilter, setYearFilter, festFilter, setFestFilter, genreFilter, setGenreFilter, concerts }) {
  return (
    <div style={{ padding: '24px 0' }} className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', padding: '15px 20px', background: hexToRgba(C.teal, 0.03), border: `1px solid ${C.border}`, borderRadius: '8px' }}>
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.5rem', color: C.white }}>DAILY <span style={{ color: C.teal }}>ARCHIVE</span></div>
        <div style={{ fontFamily: "'Space Mono'", fontSize: '9px', color: C.gray }}>{dayGroups.length} ENTRIES FOUND</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {dayGroups.map((event, idx) => (
          <div key={event.id} style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: '-20px', top: '50%', width: '15px', height: '1px', background: C.border }} />
            {event.is_festival ? <WristbandCard event={event} genreMap={genreMap} /> : <TicketStubCard event={event} onEdit={onEdit} genreMap={genreMap} stubIdx={idx} />}
          </div>
        ))}
      </div>
    </div>
  );
}
function ByFestTab({ festGroupings, genreMap = {} }) {
  const [collapsed, setCollapsed] = useState({});
  const toggle = (name, year) => setCollapsed(p => ({ ...p, [`${name}-${year}`]: !p[`${name}-${year}`] }));
  const FEST_COLORS = [C.teal, C.cyan, C.purple, C.gold, C.green, '#ff6699', '#ff4400', '#a2ff00'];

  return (
    <div style={{ marginTop: 20 }} className="fade-in">
      {festGroupings.map((fest, fi) => {
        const color = FEST_COLORS[fi % FEST_COLORS.length];
        const allShows = Object.values(fest.years).flat();
        const yearsSorted = Object.keys(fest.years).sort((a, b) => b.localeCompare(a));
        const firstYear = yearsSorted[yearsSorted.length - 1], lastYear = yearsSorted[0];
        const uniqueArtists = new Set(allShows.flatMap(s => s.bands || [])).size;

        return (
          <div key={fest.name} style={{ marginBottom: 48 }}>
            {/* Festival Passport Header (No changes to your styles) */}
            <div id={`fest-${fest.name.replace(/\s+/g, '-')}`} style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', marginBottom: 20, background: `linear-gradient(135deg,${hexToRgba(color, 0.12)},${C.bgCard})`, border: `1px solid ${hexToRgba(color, 0.5)}`, boxShadow: `0 0 40px ${hexToRgba(color, 0.2)},0 4px 20px rgba(0,0,0,0.6)`, padding: '32px 36px' }}>
              <div style={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300, background: `radial-gradient(circle,${hexToRgba(color, 0.15)},transparent)`, pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: `linear-gradient(to bottom,${color},${hexToRgba(color, 0.2)})`, borderRadius: '12px 0 0 12px' }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: hexToRgba(color, 0.8), marginBottom: 10 }}>🎪 FESTIVAL PASSPORT</div>
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: 'clamp(2.5rem,6vw,4.5rem)', letterSpacing: '0.06em', color: C.white, lineHeight: 1, marginBottom: 16, textShadow: `0 0 30px ${hexToRgba(color, 0.4)}` }}>{fest.name}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, marginBottom: 20 }}>
                  {[[allShows.length, allShows.length === 1 ? 'DAY' : 'DAYS ATTENDED'], [yearsSorted.length, yearsSorted.length === 1 ? 'YEAR' : 'YEARS'], [uniqueArtists, 'UNIQUE ARTISTS'], [firstYear === lastYear ? firstYear : `${firstYear}–${lastYear}`, 'SPAN']].map(([val, label]) => (
                    <div key={label}><div style={{ fontFamily: "'Bebas Neue'", fontSize: '2rem', color, lineHeight: 1 }}>{val}</div><div style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: C.gray, textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: 2 }}>{label}</div></div>
                  ))}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {yearsSorted.map(yr => <span key={yr} onClick={() => toggle(fest.name, yr)} style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, background: hexToRgba(color, 0.18), color, border: `1px solid ${hexToRgba(color, 0.45)}`, padding: '3px 10px', borderRadius: 4, cursor: 'pointer' }}>{yr} {collapsed[`${fest.name}-${yr}`] ? '▸' : '▾'}</span>)}
                </div>
              </div>
            </div>

            {/* Individual Years */}
            {yearsSorted.map(yr => {
              const isCollapsed = collapsed[`${fest.name}-${yr}`];
              const shows = fest.years[yr];
              return (
                <div key={yr} style={{ marginBottom: 16 }}>
                  <div onClick={() => toggle(fest.name, yr)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 16px', background: hexToRgba(color, 0.07), border: `1px solid ${hexToRgba(color, 0.2)}`, borderRadius: 6, cursor: 'pointer', marginBottom: isCollapsed ? 0 : 10 }}>
                    <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.3rem', color, lineHeight: 1 }}>{yr}</div>
                    <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: C.gray }}>{shows.length} {shows.length === 1 ? 'DAY' : 'DAYS'} · {new Set(shows.flatMap(s => s.bands || [])).size} ARTISTS</div>
                    <div style={{ marginLeft: 'auto', color: C.grayDim, fontSize: 10 }}>{isCollapsed ? '▸' : '▾'}</div>
                  </div>
                  
                  {/* 🟢 FIXED: compact={false} ensures the grid shows up here */}
                  {!isCollapsed && shows.sort((a, b) => a.date.localeCompare(b.date)).map(s => (
                    <WristbandCard key={s.id} event={s} genreMap={genreMap} compact={false} />
                  ))}
                </div>
              );
            })}
          </div>
        );
      })}
      {!festGroupings.length && <div style={{ textAlign: 'center', color: C.gray, padding: 60 }}>No festival data yet.</div>}
    </div>
  );
}
// ─── PASSPORT TAB ─────────────────────────────────────────────────────────────
function PassportTab({ passport, genreStats, onNavigateToFest }) {  return (
    <div style={{ padding:'24px 0' }} className="fade-in">
      <div style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:C.gray, marginBottom:20, letterSpacing:'0.1em', textTransform:'uppercase' }}>Your festival attendance record — click any card to view full history</div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:14 }}>
        {passport.map(f => (
          <div key={f.name} onClick={()=>onNavigateToFest(f.name)}
            style={{ background:C.bgCard, border:`1px solid ${C.teal}33`, borderRadius:8, padding:16, cursor:'pointer', transition:'all 0.18s' }}
            onMouseEnter={e=>{e.currentTarget.style.border=`1px solid ${C.teal}88`;e.currentTarget.style.boxShadow=`0 0 16px ${C.tealGlow}`;}}
            onMouseLeave={e=>{e.currentTarget.style.border=`1px solid ${C.teal}33`;e.currentTarget.style.boxShadow='none';}}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
              <div style={{ fontFamily:"'Bebas Neue'", fontSize:'1.3rem', color:C.gold, lineHeight:1 }}>{f.name}</div>
              <div style={{ textAlign:'right' }}><div style={{ fontFamily:"'Bebas Neue'", fontSize:'1.6rem', color:C.teal, lineHeight:1 }}>{f.days}</div><div style={{ fontFamily:"'Space Mono',monospace", fontSize:7, color:C.gray, textTransform:'uppercase' }}>days</div></div>
            </div>
            <div style={{ fontFamily:"'Space Mono',monospace", fontSize:8, color:C.gray, marginBottom:8, textTransform:'uppercase' }}>{f.years.length} {f.years.length===1?'year':'years'} attended</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:4, marginBottom:10 }}>{f.years.map(y=><span key={y} style={{ fontFamily:"'Space Mono',monospace", fontSize:8, background:`${C.gold}22`, color:C.gold, border:`1px solid ${C.gold}44`, padding:'2px 6px', borderRadius:3 }}>{y}</span>)}</div>
            <div style={{ fontFamily:"'Space Mono',monospace", fontSize:7, color:C.tealDim, textTransform:'uppercase', letterSpacing:'0.1em' }}>↗ View full festival history</div>
          </div>
        ))}
        {!passport.length && <div style={{ color:C.gray, textAlign:'center', gridColumn:'1/-1', padding:60 }}>No festival passport stamps yet.</div>}
      </div>
    </div>
  );
}

// ─── BROWSE TAB ───────────────────────────────────────────────────────────────
// ─── BROWSE TAB (Fixed for Artist Genres) ─────────────────────────────────────
function BrowseTab({ browseView, setBrowseView, search, setSearch, yearFilter, setYearFilter, festFilter, setFestFilter, sortCol, setSortCol, sortDir, setSortDir, paged, page, setPage, totalPages, artistRows, years, onShare, onEdit, onSetGenre, genreMap, genreFilter, setGenreFilter }) {
  return (
    <div style={{ marginTop:20 }} className="fade-in">
      <div style={{ display:'flex', flexWrap:'wrap', gap:10, marginBottom:20, background:C.bgCard, padding:15, borderRadius:8, border:`1px solid ${C.border}` }}>
        <input placeholder="Search artists, venues, cities..." value={search} onChange={e=>setSearch(e.target.value)} style={{ ...inputSt, flex:'1 1 260px' }} />
        <select value={yearFilter} onChange={e=>setYearFilter(e.target.value)} style={{ ...inputSt, minWidth:100 }}><option value="all">All Years</option>{years.map(y=><option key={y} value={y}>{y}</option>)}</select>
        <select value={festFilter} onChange={e=>setFestFilter(e.target.value)} style={{ ...inputSt, minWidth:130 }}><option value="all">All Types</option><option value="fest">Festival Only</option><option value="solo">Standalone Only</option></select>
        <select value={genreFilter} onChange={e=>setGenreFilter(e.target.value)} style={{ ...inputSt, minWidth:130 }}><option value="all">All Genres</option>{GENRES.map(g=><option key={g} value={g}>{g}</option>)}</select>
        <div style={{ display:'flex', background:C.bgCardAlt, borderRadius:4, padding:2, border:`1px solid ${C.border}` }}>
          {['shows','artists'].map(v=><button key={v} onClick={()=>setBrowseView(v)} style={{ padding:'6px 14px', fontSize:10, fontFamily:"'Space Mono'", letterSpacing:'0.1em', textTransform:'uppercase', background:browseView===v?C.teal:'transparent', color:browseView===v?C.bg:C.gray, border:'none', cursor:'pointer', borderRadius:3, transition:'0.15s' }}>{v}</button>)}
        </div>
      </div>

      {browseView==='shows' && (
        <>
          <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:8, overflow:'hidden' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.78rem' }}>
              <thead>
                <tr style={{ background:C.bgCardAlt }}>
                  {[['date','Date'],['artist','Artist'],['venue','Venue'],['city','City']].map(([col,label]) => (
                    <th key={col} onClick={()=>{setSortCol(col);setSortDir(d=>d==='asc'?'desc':'asc');}} style={{ fontFamily:"'Space Mono',monospace", fontSize:8, letterSpacing:'0.15em', textTransform:'uppercase', padding:'10px 12px', textAlign:'left', color:sortCol===col?C.teal:C.tealDim, borderBottom:`1px solid ${C.border}`, cursor:'pointer', userSelect:'none' }}>{label} {sortCol===col?(sortDir==='asc'?'▲':'▼'):''}</th>
                  ))}
                  <th style={{ fontFamily:"'Space Mono',monospace", fontSize:8, letterSpacing:'0.15em', textTransform:'uppercase', padding:'10px 12px', textAlign:'left', color:C.tealDim, borderBottom:`1px solid ${C.border}` }}>Genre</th>
                  <th style={{ fontFamily:"'Space Mono',monospace", fontSize:8, letterSpacing:'0.15em', textTransform:'uppercase', padding:'10px 12px', textAlign:'left', color:C.tealDim, borderBottom:`1px solid ${C.border}` }}>📋</th>
                  <th style={{ fontFamily:"'Space Mono',monospace", fontSize:8, letterSpacing:'0.15em', textTransform:'uppercase', padding:'10px 12px', textAlign:'left', color:C.tealDim, borderBottom:`1px solid ${C.border}` }}>Type</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((s,i) => {
                  // HERE IS THE FIX: Pull genre from the artist-specific map
                  const artistGenre = genreMap[s.artist] || null;
                  return (
                    <tr key={`${s.id}-${s.artist}`} className="row-hover" onClick={()=>onEdit(s)} style={{ borderBottom:`1px solid ${C.border}`, background:i%2===1?C.bgCardAlt:'transparent' }}>
                      <td style={{ padding:'9px 12px', fontFamily:"'Space Mono',monospace", fontSize:'0.7rem', color:C.gray, whiteSpace:'nowrap' }}>{fmtDate(s.date)}</td>
                      <td style={{ padding:'9px 12px', color:C.teal, fontWeight:600 }}>{s.artist}</td>
                      <td style={{ padding:'9px 12px', color:C.gray }}>{s.venue||'—'}</td>
                      <td style={{ padding:'9px 12px', color:C.gray }}>{s.city||'—'}{s.state?`, ${s.state}`:''}</td>
                      <td style={{ padding:'9px 12px' }}>{artistGenre ? <GenreBadge genre={artistGenre} color={GENRE_COLORS[artistGenre]} small /> : <span style={{ color:C.grayDim, fontSize:8 }}>—</span>}</td>
                      <td style={{ padding:'9px 12px', textAlign:'center' }}>{(s.has_setlist||(s.has_setlist_names?.trim()))?<a href={`https://www.setlist.fm/search?query=${encodeURIComponent(s.artist)}`} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} style={{ textDecoration:'none', fontSize:12, filter:'drop-shadow(0 0 3px gold)' }} title="setlist.fm">📋</a>:<span style={{ color:C.grayDim }}>—</span>}</td>
                      <td style={{ padding:'9px 12px' }}>{s.is_festival?<Badge color={C.teal}>Fest</Badge>:<Badge color={C.grayDim} bg="transparent">Solo</Badge>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {totalPages>1 && (
            <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:10, marginTop:16 }}>
              <Btn variant="secondary" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} style={{ padding:'5px 12px' }}>← Prev</Btn>
              <span style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:C.gray }}>Page {page} of {totalPages}</span>
              <Btn variant="secondary" onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} style={{ padding:'5px 12px' }}>Next →</Btn>
            </div>
          )}
        </>
      )}

      {browseView==='artists' && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:12 }}>
          {artistRows.map(row => {
            const genre = genreMap[row.artist] || null;
            const gc = genre ? (GENRE_COLORS[genre] || null) : null;
            return (
              <div key={row.artist} style={{ background:gc?`linear-gradient(135deg,${C.bgCard},${hexToRgba(gc,0.1)})`:C.bgCard, border:`1px solid ${gc?hexToRgba(gc,0.5):C.border}`, boxShadow:gc?`0 0 12px ${hexToRgba(gc,0.2)}`:'none', borderRadius:8, padding:'14px 16px', position:'relative' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                  <div>
                    <div style={{ fontFamily:"'Bebas Neue'", fontSize:'1.2rem', color:gc||C.teal, marginBottom:4, cursor:'pointer' }} onClick={()=>onShare(row.artist,row.shows)}>{row.artist}</div>
                    <div style={{ fontFamily:"'Space Mono',monospace", fontSize:8, color:C.gray }}>{row.shows.length} shows</div>
                  </div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:10, paddingTop:10, borderTop:`1px solid ${C.border}` }}>
                  <select value={genre||''} onChange={e=>onSetGenre(row.artist, e.target.value||null)} style={{ flex:1, background:gc?hexToRgba(gc,0.15):C.bgCardAlt, border:`1px solid ${gc?hexToRgba(gc,0.4):C.border}`, borderRadius:4, color:gc||C.gray, fontSize:9, padding:'3px 6px', fontFamily:"'Space Mono'", cursor:'pointer' }}>
                    <option value="">— unset —</option>
                    {GENRES.map(g=><option key={g} value={g}>{g}</option>)}
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

// ─── VENUE DONUT CARD ─────────────────────────────────────────────────────────
function VenueDonutCard({ concerts, onNavigateToVenues }) {
  const venueData = useMemo(() => {
    const m = {};
    concerts.forEach(c => {
      if (!c.venue) return;
      const key = c.venue.trim();
      m[key] = (m[key] || 0) + 1;
    });
    const sorted = Object.entries(m).sort((a, b) => b[1] - a[1]);
    const top5 = sorted.slice(0, 5);
    const otherCount = sorted.slice(5).reduce((acc, [, n]) => acc + n, 0);
    if (otherCount > 0) top5.push(['Other Venues', otherCount]);
    return top5;
  }, [concerts]);

  const total = venueData.reduce((acc, [, n]) => acc + n, 0) || 1;
  const COLORS = ['#00f2ff', '#9d00ff', '#ffcc00', '#ff4466', '#00cc88', '#445566'];

  const cx = 70, cy = 70, r = 52;
  const circ = 2 * Math.PI * r;

  let cumulative = 0;
  const slices = venueData.map(([name, count], i) => {
    const pct = count / total;
    const dash = pct * circ;
    const offset = -cumulative * circ;
    cumulative += pct;
    return { name, count, pct, dash, offset, color: COLORS[i % COLORS.length] };
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
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {slices.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: s.color, flexShrink: 0, boxShadow: `0 0 4px ${s.color}` }} />
              <div style={{ fontFamily: "'Space Mono'", fontSize: 7, color: C.gray, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {s.name.length > 18 ? s.name.slice(0, 18) + '…' : s.name}
              </div>
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: '0.9rem', color: s.color, flexShrink: 0 }}>{s.count}</div>
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

  const toggle = (name) => setExpanded(p => ({ ...p, [name]: !p[name] }));

  // ─── 1. COMPLETE METADATA LOGIC ───
  const venues = useMemo(() => {
    const m = {};
    concerts.forEach(c => {
      if (!c.venue) return;
      const key = c.venue.trim();
      if (!m[key]) {
        m[key] = {
          name: key, city: c.city || '', state: c.state || '',
          count: 0, years: new Set(), artists: new Set(),
          festivals: 0, shows: [], firstDate: c.date, lastDate: c.date,
        };
      }
      m[key].count++;
      if (c.date < m[key].firstDate) m[key].firstDate = c.date;
      if (c.date > m[key].lastDate) m[key].lastDate = c.date;
      const yr = getYear(c.date);
      if (yr) m[key].years.add(yr);
      (c.bands || []).forEach(b => m[key].artists.add(b));
      if (c.is_festival) m[key].festivals++;
      m[key].shows.push(c);
    });
    return Object.values(m).map(v => ({
      ...v,
      years: [...v.years].sort(),
      artists: [...v.artists],
      shows: [...v.shows].sort((a, b) => b.date.localeCompare(a.date)),
    }));
  }, [concerts]);

  const filtered = useMemo(() => {
    let list = venues;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(v => v.name.toLowerCase().includes(q) || v.city.toLowerCase().includes(q) || v.state.toLowerCase().includes(q));
    }
    if (sortBy === 'count') return [...list].sort((a, b) => b.count - a.count);
    if (sortBy === 'alpha') return [...list].sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === 'recent') return [...list].sort((a, b) => b.lastDate.localeCompare(a.lastDate));
    if (sortBy === 'first') return [...list].sort((a, b) => a.firstDate.localeCompare(b.firstDate));
    return list;
  }, [venues, sortBy, search]);

  const VENUE_MEDALS = ['🥇','🥈','🥉'];

  return (
    <div style={{ padding: '24px 0' }} className="fade-in">
      {/* ─── HEADER ─── */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: 'clamp(2.5rem,6vw,4rem)', color: C.white, letterSpacing: '0.05em' }}>
          📍 THE <span style={{ color: C.teal }}>VENUE LOG</span>
        </div>
        <div style={{ fontFamily: "'Space Mono'", fontSize: 9, color: C.gray, letterSpacing: '0.2em', marginTop: 4 }}>
          {venues.length} VENUES · {new Set(venues.map(v => v.city)).size} CITIES
        </div>
      </div>

      {/* ─── TOP 3 PODIUM ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 40 }}>
        {filtered.slice(0, 3).map((v, i) => {
          const colors = [C.gold, C.gray, C.cyan];
          return (
            <div key={v.name} onClick={() => toggle(v.name)} style={{
              background: `linear-gradient(135deg, ${C.bgCard}, ${hexToRgba(colors[i], 0.08)})`,
              border: `1px solid ${hexToRgba(colors[i], 0.5)}`,
              borderRadius: 8, padding: 20, position: 'relative', overflow: 'hidden',
              boxShadow: `0 0 20px ${hexToRgba(colors[i], 0.15)}`, cursor: 'pointer',
              transition: 'all 0.2s',
            }}>
              <div style={{ position: 'absolute', right: -10, bottom: -20, fontFamily: "'Bebas Neue'", fontSize: '6rem', color: hexToRgba(colors[i], 0.05), pointerEvents: 'none' }}>{v.count}×</div>
              <div style={{ fontFamily: "'Space Mono'", fontSize: 9, color: colors[i], marginBottom: 8 }}>{VENUE_MEDALS[i]} #{i + 1}</div>
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.8rem', color: C.white, lineHeight: 1.1, marginBottom: 6 }}>{v.name}</div>
              <div style={{ fontFamily: "'Space Mono'", fontSize: 8, color: C.gray, marginBottom: 12 }}>{[v.city, v.state].filter(Boolean).join(', ')}</div>
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: '2.5rem', color: colors[i], lineHeight: 1 }}>{v.count}<span style={{ fontFamily: "'Space Mono'", fontSize: 9, color: C.grayDim, marginLeft: 4 }}>shows</span></div>
              <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Badge color={colors[i]}>{v.artists.length} artists</Badge>
                {v.festivals > 0 && <Badge color={C.gold}>{v.festivals} fest days</Badge>}
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── FILTERS ─── */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <input placeholder="Search venues or cities..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...inputSt, flex: '1 1 240px' }} />
        <div style={{ display: 'flex', background: C.bgCardAlt, borderRadius: 4, padding: 2, border: `1px solid ${C.border}` }}>
          {[['count','Most Visited'],['alpha','A–Z'],['recent','Most Recent'],['first','Oldest First']].map(([val, label]) => (
            <button key={val} onClick={() => setSortBy(val)} style={{ padding: '5px 12px', fontSize: 9, fontFamily: "'Space Mono'", letterSpacing: '0.08em', textTransform: 'uppercase', background: sortBy === val ? C.teal : 'transparent', color: sortBy === val ? C.bg : C.gray, border: 'none', cursor: 'pointer', borderRadius: 3 }}>{label}</button>
          ))}
        </div>
      </div>

      {/* ─── STABILIZED LIST & ARTIFACT RENDERING ─── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map((v, i) => {
          const rowColor = i < 3 ? [C.gold, C.gray, C.cyan][i] : C.teal;
          const isOpen = expanded[v.name];

          return (
            <div key={v.name} style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderLeft: `4px solid ${rowColor}`, borderRadius: 6, overflow: 'hidden' }}>
              <div onClick={() => toggle(v.name)} style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.1rem', color: C.white, lineHeight: 1 }}>{v.name}</div>
                  <div style={{ fontFamily: "'Space Mono'", fontSize: 7, color: C.gray }}>{[v.city, v.state].filter(Boolean).join(', ')}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.8rem', color: rowColor, lineHeight: 1 }}>{v.count}</div>
                </div>
                <div style={{ fontSize: 9, color: C.grayDim }}>{isOpen ? '▲' : '▼'}</div>
              </div>

              {isOpen && (
                <div style={{ borderTop: `1px solid ${C.border}`, padding: '40px 20px', background: 'rgba(0,0,0,0.3)', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '40px' }}>
                  {v.shows.map((show, idx) => {
                    const hasImg = show.image_url && show.image_url.trim() !== "";
                    const rotation = idx < 20 ? (idx % 2 === 0 ? 1.5 : -1.5) : 0; 
                    
                    return (
                      <div key={show.id} style={{ transform: `rotate(${rotation}deg)`, transition: 'transform 0.3s' }}>
                        {show.is_festival ? (
                          /* 🎪 FESTIVAL ENTRY: Wristband + List */
                          <div style={{ background: C.bgCardAlt, borderRadius: 6, border: `1px solid ${C.border}`, padding: '10px', overflow: 'hidden' }}>
                            <PhysicalWristband color={C.gold} label={show.festival_name} year={getYear(show.date)} size="small" />
                            <div style={{ marginTop: 10, borderTop: `1px solid ${C.border}`, paddingTop: 10 }}>
                              {(show.bands || []).map((b, bi) => (
                                <div key={bi} style={{ fontSize: '0.7rem', color: C.gray, fontFamily: "'Space Mono'", marginBottom: 3 }}>
                                  {b.toUpperCase()}
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : hasImg ? (
                          /* 📸 SHOW PHOTO ARTIFACT */
                          <div style={{ background: '#fff', padding: '5px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', borderRadius: 2 }}>
                            <div style={{ padding: '8px 2px', textAlign: 'center', background: '#111', color: '#fff', fontFamily: "'Bebas Neue'", fontSize: '1.2rem', marginBottom: 5 }}>
                              {(show.bands || [])[0]?.toUpperCase()}
                            </div>
                            <img 
                              src={show.image_url.split(',')[0]} 
                              alt="setlist" 
                              loading="lazy"
                              style={{ width: '100%', height: 'auto', maxHeight: '250px', objectFit: 'contain', background: '#000' }} 
                            />
                            <div style={{ padding: '8px 4px 2px', fontFamily: "'Space Mono'", fontSize: '9px', color: '#000', fontWeight: 900 }}>
                              {fmtDateShort(show.date)}
                            </div>
                          </div>
                        ) : (
                          <DecorativeTicket event={show} templateIdx={idx} />
                        )}
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
  const [genreMix, setGenreMix] = useState({ 'Indie Rock':30,'Electronic':20,'Folk':20,'Jam':15,'Alternative':15 });
  const [templateIdx, setTemplateIdx] = useState(0);
  const [festName, setFestName] = useState('');
  const [generated, setGenerated] = useState(null);
  const [headlinerCount, setHeadlinerCount] = useState(2);
  const [totalActs, setTotalActs] = useState(20);

  const totalPct = Object.values(genreMix).reduce((a,b)=>a+b,0);

  const artistPool = useMemo(() => {
    const m = {};
    allSetsList.forEach(s => {
      const g=genreMap[s.artist]||s.genre||null;
      if(!g||g==='Other') return;
      if(!m[s.artist])m[s.artist]={artist:s.artist,genre:g,count:0};
      m[s.artist].count++;
    });
    return Object.values(m).sort((a,b)=>b.count-a.count);
  }, [allSetsList, genreMap]);

  const generate = () => {
    const tpl=POSTER_TEMPLATES[templateIdx];
    const total=Object.values(genreMix).reduce((a,b)=>a+b,0)||100;
    const normalized={};
    Object.entries(genreMix).forEach(([g,v])=>{normalized[g]=Math.max(0,Math.round((v/total)*totalActs));});
    const picked=[], used=new Set();
    Object.entries(normalized).forEach(([genre,count])=>{
      if(count<=0) return;
      artistPool.filter(a=>a.genre===genre&&!used.has(a.artist)).slice(0,count).forEach(a=>{picked.push({...a});used.add(a.artist);});
    });
    picked.sort((a,b)=>b.count-a.count);
    const dominantGenre=Object.entries(genreMix).sort((a,b)=>b[1]-a[1])[0]?.[0]||'default';
    setGenerated({ tpl, artists:picked, name:festName.trim()||generateFestName(dominantGenre), headlinerCount });
  };

  const tpl=POSTER_TEMPLATES[templateIdx];

  const PosterPreview = ({ tpl:t, artists, name, headlinerCount:hc }) => {
    const headliners=artists.slice(0,hc);
    const midTier=artists.slice(hc,hc+Math.ceil((artists.length-hc)/2));
    const undercard=artists.slice(hc+Math.ceil((artists.length-hc)/2));

    if (t.style==='grid') {
      // Coachella grid: light background, black typography, tight grid
      return (
        <div style={{ background:t.bg, borderRadius:12, overflow:'hidden', border:'2px solid #1a1a2e', padding:'32px 28px', fontFamily:"'Bebas Neue'", textAlign:'center', minHeight:600 }}>
          <div style={{ borderBottom:'3px solid #1a1a2e', paddingBottom:12, marginBottom:16 }}>
            <div style={{ fontSize:'clamp(2rem,5vw,3.2rem)', letterSpacing:'0.12em', color:t.accent, lineHeight:1 }}>{name.toUpperCase()}</div>
            <div style={{ fontFamily:"'Space Mono',monospace", fontSize:8, color:'#666', letterSpacing:'0.3em', marginTop:4 }}>JUNE 2026 · FROM YOUR 27-YEAR CONCERT HISTORY</div>
          </div>
          {headliners.map((a,i) => <div key={a.artist} style={{ fontSize:i===0?'clamp(2rem,6vw,4rem)':'clamp(1.5rem,4vw,2.5rem)', letterSpacing:'0.06em', color:t.accent, lineHeight:1.1, marginBottom:6 }}>{a.artist.toUpperCase()}</div>)}
          <div style={{ height:2, background:'#1a1a2e', margin:'12px 0' }} />
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'6px 12px', marginBottom:12 }}>
            {midTier.map(a => <div key={a.artist} style={{ fontSize:'clamp(0.8rem,2vw,1.1rem)', letterSpacing:'0.06em', color:t.accent2, lineHeight:1.2, borderBottom:'1px solid #ddd', paddingBottom:4 }}>{a.artist.toUpperCase()}</div>)}
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', justifyContent:'center', gap:'4px 12px' }}>
            {undercard.map(a => <span key={a.artist} style={{ fontFamily:"'Space Mono',monospace", fontSize:'clamp(6px,1.2vw,9px)', color:'#555', letterSpacing:'0.12em' }}>{a.artist.toUpperCase()}</span>)}
          </div>
        </div>
      );
    }

    if (t.style==='forest') {
      // Bonnaroo forest: rough, handwritten feel, earthy
      return (
        <div style={{ background:t.bg, borderRadius:12, overflow:'hidden', border:`3px solid ${t.accent}`, padding:'32px 28px', textAlign:'center', minHeight:600, position:'relative' }}>
          <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at 50% 0%,rgba(136,204,68,0.1),transparent 60%)', pointerEvents:'none' }} />
          <div style={{ fontFamily:"'Caveat',cursive", fontSize:'clamp(2.5rem,7vw,4.5rem)', fontWeight:700, color:t.accent, lineHeight:1, marginBottom:8, textShadow:`0 0 20px ${hexToRgba(t.accent,0.4)}` }}>{name}</div>
          <div style={{ fontFamily:"'Space Mono',monospace", fontSize:8, color:hexToRgba(t.accent2,0.7), letterSpacing:'0.2em', marginBottom:24 }}>JUNE 2026</div>
          {headliners.map((a,i) => <div key={a.artist} style={{ fontFamily:"'Caveat',cursive", fontSize:i===0?'clamp(2rem,5vw,3.5rem)':'clamp(1.5rem,3.5vw,2.5rem)', fontWeight:700, color:i===0?t.accent2:t.accent, lineHeight:1.1, marginBottom:6 }}>{a.artist}</div>)}
          <div style={{ height:2, background:`${t.accent}55`, margin:'16px 0', borderRadius:1 }} />
          <div style={{ fontFamily:"'Caveat',cursive", fontSize:'clamp(1rem,2.5vw,1.5rem)', color:hexToRgba(t.accent,0.8), lineHeight:1.8, marginBottom:12 }}>
            {midTier.map(a=>a.artist).join(' · ')}
          </div>
          <div style={{ fontFamily:"'Space Mono',monospace", fontSize:'clamp(6px,1.2vw,8px)', color:hexToRgba(t.accent,0.5), letterSpacing:'0.1em', lineHeight:2 }}>
            {undercard.map(a=>a.artist).join('  ·  ')}
          </div>
        </div>
      );
    }

    // Lolla Bold: dark, massive type, high impact
    return (
      <div style={{ background:t.bg, borderRadius:12, overflow:'hidden', border:`2px solid ${t.accent}`, padding:'32px 28px', textAlign:'center', minHeight:600, position:'relative' }}>
        <div style={{ position:'absolute', inset:0, background:`radial-gradient(ellipse at 50% 0%,${hexToRgba(t.accent,0.2)},transparent 60%)`, pointerEvents:'none' }} />
        <div style={{ position:'absolute', inset:0, background:`radial-gradient(ellipse at 50% 100%,${hexToRgba(t.accent2,0.05)},transparent 60%)`, pointerEvents:'none' }} />
        <div style={{ position:'relative', zIndex:1 }}>
          <div style={{ height:2, background:`linear-gradient(90deg,transparent,${t.accent},transparent)`, marginBottom:20 }} />
          <div style={{ fontFamily:"'Monoton',cursive", fontSize:'clamp(1.5rem,4vw,2.5rem)', letterSpacing:'0.1em', color:t.accent, lineHeight:1.2, marginBottom:6, textShadow:`0 0 20px ${hexToRgba(t.accent,0.5)}` }}>{name.toUpperCase()}</div>
          <div style={{ fontFamily:"'Space Mono',monospace", fontSize:8, color:hexToRgba(t.accent2,0.5), letterSpacing:'0.3em', marginBottom:28 }}>JUNE 2026</div>
          {headliners.map((a,i) => <div key={a.artist} style={{ fontFamily:"'Bebas Neue'", fontSize:i===0?'clamp(3rem,8vw,6rem)':'clamp(2rem,5vw,3.5rem)', letterSpacing:'0.04em', color:i===0?t.accent2:t.accent, lineHeight:1, marginBottom:4, textShadow:i===0?`0 0 30px ${hexToRgba(t.accent,0.3)}`:'none' }}>{a.artist.toUpperCase()}</div>)}
          <div style={{ height:1, background:`${t.accent}66`, margin:'20px 0' }} />
          <div style={{ fontFamily:"'Bebas Neue'", fontSize:'clamp(1rem,2.5vw,1.6rem)', color:hexToRgba(t.accent2,0.7), letterSpacing:'0.06em', lineHeight:1.8, marginBottom:16 }}>{midTier.map(a=>a.artist.toUpperCase()).join(' · ')}</div>
          <div style={{ fontFamily:"'Space Mono',monospace", fontSize:'clamp(6px,1.2vw,8px)', color:hexToRgba(t.accent2,0.35), letterSpacing:'0.15em', lineHeight:2 }}>{undercard.map(a=>a.artist.toUpperCase()).join('  ·  ')}</div>
          <div style={{ height:2, background:`linear-gradient(90deg,transparent,${t.accent},transparent)`, marginTop:20 }} />
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding:'24px 0' }} className="fade-in">
      <div style={{ textAlign:'center', marginBottom:32 }}>
        <div style={{ fontFamily:"'Bebas Neue'", fontSize:'clamp(2rem,5vw,3.5rem)', color:C.white, letterSpacing:'0.06em', marginBottom:8 }}>🎨 POSTER <span style={{ color:C.teal }}>GENERATOR</span></div>
        <div style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:C.gray }}>Build your dream festival from your concert history</div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, marginBottom:32 }}>
        <div>
          <Card neon style={{ marginBottom:16 }}>
            <CardTitle>Genre Mix</CardTitle>
            <div style={{ fontFamily:"'Space Mono',monospace", fontSize:8, color:totalPct===100?C.green:totalPct>100?C.red:C.gold, marginBottom:12 }}>Total: {totalPct}% {totalPct!==100&&'(should equal 100)'}</div>
            {GENRES.filter(g=>g!=='Other').map(g => (
              <div key={g} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                <div style={{ width:10, height:10, borderRadius:'50%', background:GENRE_COLORS[g], flexShrink:0 }} />
                <span style={{ fontFamily:"'Space Mono',monospace", fontSize:8, color:C.gray, width:90, flexShrink:0 }}>{g}</span>
                <input type="range" min={0} max={100} value={genreMix[g]||0} onChange={e=>setGenreMix(p=>({...p,[g]:+e.target.value}))} style={{ flex:1, accentColor:GENRE_COLORS[g] }} />
                <span style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:GENRE_COLORS[g], width:32, textAlign:'right', flexShrink:0 }}>{genreMix[g]||0}%</span>
              </div>
            ))}
          </Card>
          <Card neon style={{ marginBottom:16 }}>
            <CardTitle>Options</CardTitle>
            <div style={{ marginBottom:12 }}>
              <div style={{ fontFamily:"'Space Mono',monospace", fontSize:8, color:C.gray, marginBottom:6 }}>TOTAL ACTS: {totalActs}</div>
              <input type="range" min={5} max={40} value={totalActs} onChange={e=>setTotalActs(+e.target.value)} style={{ width:'100%', accentColor:C.teal }} />
            </div>
            <div style={{ marginBottom:12 }}>
              <div style={{ fontFamily:"'Space Mono',monospace", fontSize:8, color:C.gray, marginBottom:6 }}>HEADLINERS: {headlinerCount}</div>
              <input type="range" min={1} max={4} value={headlinerCount} onChange={e=>setHeadlinerCount(+e.target.value)} style={{ width:'100%', accentColor:C.gold }} />
            </div>
            <div style={{ marginBottom:12 }}>
              <div style={{ fontFamily:"'Space Mono',monospace", fontSize:8, color:C.gray, marginBottom:6 }}>FESTIVAL NAME (leave blank to auto-generate)</div>
              <input value={festName} onChange={e=>setFestName(e.target.value)} placeholder="e.g. Neon Pines Festival" style={{ ...inputSt, width:'100%' }} />
            </div>
          </Card>
          <Card neon>
            <CardTitle>Template</CardTitle>
            <div style={{ display:'flex', gap:8 }}>
              {POSTER_TEMPLATES.map((t,i) => (
                <div key={t.id} onClick={()=>setTemplateIdx(i)} style={{ flex:1, background:t.bg, border:`2px solid ${i===templateIdx?t.accent:C.border}`, borderRadius:6, padding:'10px 6px', cursor:'pointer', textAlign:'center', boxShadow:i===templateIdx?`0 0 12px rgba(0,0,0,0.5)`:'none', transition:'all 0.2s' }}>
                  <div style={{ fontFamily:"'Space Mono',monospace", fontSize:7, color:t.dark?t.accent:'#1a1a2e', textTransform:'uppercase', letterSpacing:1, lineHeight:1.4 }}>{t.name}</div>
                </div>
              ))}
            </div>
          </Card>
          <div style={{ marginTop:20 }}>
            <Btn onClick={generate} style={{ width:'100%', padding:'14px', fontSize:13, letterSpacing:'0.2em' }}>⚡ GENERATE POSTER</Btn>
          </div>
        </div>
        <div>
          {generated
            ? <PosterPreview {...generated} />
            : <div style={{ background:C.bgCard, border:`2px dashed ${C.border}`, borderRadius:12, minHeight:600, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16 }}>
                <div style={{ fontSize:'4rem' }}>🎨</div>
                <div style={{ fontFamily:"'Bebas Neue'", fontSize:'1.5rem', color:C.grayDim }}>YOUR POSTER APPEARS HERE</div>
                <div style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:C.grayDim }}>Configure your mix and hit Generate</div>
              </div>
          }
        </div>
      </div>
    </div>
  );
}

// ─── MANAGE TAB ───────────────────────────────────────────────────────────────
function ManageTab({ concerts, onEdit, onAdd, onDuplicate }) {
  const [search, setSearch] = useState(''), [page, setPage] = useState(1); const PER=30;
  const filtered = useMemo(() => { if(!search)return concerts; const q=search.toLowerCase(); return concerts.filter(c=>(c.bands||[]).some(b=>b.toLowerCase().includes(q))||(c.venue||'').toLowerCase().includes(q)||(c.city||'').toLowerCase().includes(q)||(c.festival_name||'').toLowerCase().includes(q)); }, [concerts,search]);
  const paged=filtered.slice((page-1)*PER,page*PER), totalPages=Math.ceil(filtered.length/PER);
  return (
    <div style={{ padding:'24px 0' }} className="fade-in">
      <div style={{ display:'flex', gap:10, marginBottom:16 }}>
        <input style={{ ...inputSt, flex:1 }} placeholder="Search shows to edit..." value={search} onChange={e=>{ setSearch(e.target.value); setPage(1); }} />
        <Btn onClick={onAdd}>+ Add Show</Btn>
      </div>
      <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:8, overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.78rem' }}>
          <thead>
            <tr style={{ background:C.bgCardAlt }}>
              {['Date','Artists','Venue','City','Genre','Type','📋','Dup','Edit'].map(h => <th key={h} style={{ fontFamily:"'Space Mono',monospace", fontSize:8, letterSpacing:'0.15em', textTransform:'uppercase', padding:'10px 12px', textAlign:'left', color:C.tealDim, borderBottom:`1px solid ${C.border}` }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {paged.map((c,i) => (
              <tr key={c.id} style={{ borderBottom:`1px solid ${C.border}`, background:i%2===1?C.bgCardAlt:'transparent' }}>
                <td style={{ padding:'9px 12px', fontFamily:"'Space Mono',monospace", fontSize:'0.7rem', color:C.gray, whiteSpace:'nowrap' }}>{fmtDate(c.date)}</td>
                <td className="row-hover" onClick={()=>onEdit(c)} style={{ padding:'9px 12px', color:C.white, fontWeight:500, cursor:'pointer' }}>{(c.bands||[]).slice(0,3).join(', ')}{c.bands?.length>3?` +${c.bands.length-3}`:''}</td>
                <td style={{ padding:'9px 12px', color:C.gray }}>{c.venue||'—'}</td>
                <td style={{ padding:'9px 12px', color:C.gray }}>{c.city||'—'}</td>
                <td style={{ padding:'9px 12px' }}>{c.genre?<GenreBadge genre={c.genre} color={GENRE_COLORS[c.genre]} small />:<span style={{ color:C.grayDim }}>—</span>}</td>
                <td style={{ padding:'9px 12px' }}>{c.is_festival?<Badge color={C.teal}>Fest</Badge>:<Badge color={C.grayDim} bg="transparent">Solo</Badge>}</td>
                <td style={{ padding:'9px 12px' }}>{c.has_setlist?<span style={{ color:C.gold }}>📋</span>:<span style={{ color:C.grayDim }}>—</span>}</td>
                <td style={{ padding:'9px 12px' }}><button onClick={()=>onDuplicate(c)} style={{ background:'none', border:`1px solid ${C.border}`, color:C.gray, cursor:'pointer', fontSize:9, borderRadius:3, padding:'2px 6px', fontFamily:"'Space Mono'" }} title="Duplicate">⧉</button></td>
                <td style={{ padding:'9px 12px' }}><button onClick={()=>onEdit(c)} style={{ background:'none', border:`1px solid ${C.border}`, color:C.tealDim, cursor:'pointer', fontSize:9, borderRadius:3, padding:'2px 6px', fontFamily:"'Space Mono'" }}>✎</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages>1 && <div style={{ display:'flex', justifyContent:'center', gap:5, marginTop:14 }}><Btn variant="secondary" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} style={{ padding:'5px 10px' }}>←</Btn>{Array.from({length:Math.min(7,totalPages)},(_,i)=>{ const p=page<=4?i+1:page+i-3; if(p<1||p>totalPages)return null; return <Btn key={p} variant={p===page?'primary':'secondary'} onClick={()=>setPage(p)} style={{ padding:'5px 10px' }}>{p}</Btn>; })}<Btn variant="secondary" onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} style={{ padding:'5px 10px' }}>→</Btn></div>}
    </div>
  );
}

// ─── MODALS ───────────────────────────────────────────────────────────────────
function UpcomingModal({ show, onClose, onSave, onDelete }) {
  const isNew = !show?.id;
  const [form, setForm] = useState({ artist: '', venue: '', date: '', status: 'TICKETS BOUGHT' });
  const [saving, setSaving] = useState(false);

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

  const handleSave = async () => {
    if (!form.artist || !form.date) return alert('Artist and date required.');
    setSaving(true);
    await onSave(show?.id, form);
    setSaving(false);
  };

  const handleDelete = () => {
    onDelete(show.id);
  };

  const lbl = { display: 'block', fontFamily: "'Space Mono',monospace", fontSize: 8, letterSpacing: '0.15em', textTransform: 'uppercase', color: C.tealDim, marginBottom: 4 };
  const inp = { ...inputSt, width: '100%', marginBottom: 15 };

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, backdropFilter: 'blur(10px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="fade-in"
        style={{ background: C.bgCard, border: `1px solid ${C.gold}`, borderRadius: 12, padding: 32, width: '100%', maxWidth: 420, boxShadow: `0 0 50px ${hexToRgba(C.gold, 0.2)}`, position: 'relative' }}
      >
        {/* Watermark */}
        <div style={{ position: 'absolute', top: -10, right: -10, fontFamily: "'Bebas Neue'", fontSize: '6rem', color: 'rgba(255,204,0,0.03)', pointerEvents: 'none', zIndex: 0 }}>
          {isNew ? 'NEW' : 'EDIT'}
        </div>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25, position: 'relative', zIndex: 1 }}>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: '2rem', color: C.gold, letterSpacing: '0.05em' }}>
            {isNew ? 'STAGING NEW SHOW' : 'REVISING SHOW'}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.gray, fontSize: '1.5rem', cursor: 'pointer', lineHeight: 1 }}>✕</button>
        </div>

        {/* Form */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <label style={lbl}>Artist / Band *</label>
          <input style={inp} value={form.artist} onChange={e => set('artist', e.target.value)} placeholder="e.g. Tame Impala" />

          <label style={lbl}>Venue</label>
          <input style={inp} value={form.venue} onChange={e => set('venue', e.target.value)} placeholder="e.g. Red Rocks" />

          <label style={lbl}>Date *</label>
          <input style={{ ...inp, colorScheme: 'dark' }} type="date" value={form.date} onChange={e => set('date', e.target.value)} />

          <label style={lbl}>Status</label>
          <select style={inp} value={form.status} onChange={e => set('status', e.target.value)}>
            <option value="TICKETS">TICKETS</option>
            <option value="PENDING">PENDING</option>
            <option value="DREAMING">DREAMING</option>
          </select>
        </div>

        {/* Buttons — outside the zIndex stacking, plain siblings */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginTop: 20 }}>
          <div>
            {!isNew && (
              <button
                type="button"
                onClick={handleDelete}
                style={{ background: 'none', border: `1px solid ${C.red}`, color: C.red, padding: '10px 16px', borderRadius: 4, cursor: 'pointer', fontFamily: "'Space Mono'", fontSize: 9, fontWeight: 700, letterSpacing: '0.1em' }}
              >
                DELETE
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              type="button"
              onClick={onClose}
              style={{ background: C.bgCardAlt, border: `1px solid ${C.border}`, color: C.gray, padding: '10px 16px', borderRadius: 4, cursor: 'pointer', fontFamily: "'Space Mono'", fontSize: 9, letterSpacing: '0.1em' }}
            >
              CANCEL
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              style={{ background: C.gold, color: '#000', border: 'none', padding: '10px 24px', borderRadius: 4, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: "'Space Mono'", fontSize: 10, fontWeight: 900, letterSpacing: '0.1em', opacity: saving ? 0.7 : 1 }}
            >
              {saving ? 'SAVING...' : 'SAVE SHOW'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EditModal({ concert, onClose, onSave, onDelete }) {
  const [form, setForm] = useState({ 
    date: concert?.date || '', 
    bands: (concert?.bands || []).join(', '), 
    venue: concert?.venue || '', 
    city: concert?.city || '', 
    state: concert?.state || '', 
    is_festival: concert?.is_festival || false, 
    festival_name: concert?.festival_name || '', 
    festival_day: concert?.festival_day || '', 
    has_setlist_names: concert?.has_setlist_names || '', 
    genre: concert?.genre || '', 
    // FIXED: Changed key to 'image_url' to match database column
    image_url: concert?.image_url || '' 
  });

  const [saving, setSaving] = useState(false), [confirming, setConfirming] = useState(false);
  
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => { 
    setSaving(true); 
    const bandList = form.bands.split(',').map(b => b.trim()).filter(Boolean); 
    
    // This sends the updated form (including image_url) to the handleSave in App.js
    await onSave(concert?.id, {
      ...form,
      bands: bandList,
      has_setlist: !!(form.has_setlist_names?.trim())
    }); 
    setSaving(false); 
  };

  const lbl = { display: 'block', fontFamily: "'Space Mono',monospace", fontSize: 8, letterSpacing: '0.15em', textTransform: 'uppercase', color: C.tealDim, marginBottom: 4 };
  const inp = { ...inputSt, width: '100%' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, backdropFilter: 'blur(4px)' }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="fade-in" style={{ background: C.bgCard, border: `1px solid ${C.teal}`, borderRadius: 10, padding: 24, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', boxShadow: `0 0 40px ${C.tealGlow}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.4rem', color: C.teal }}>{concert?.id ? 'Edit Show' : 'Add Show'}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.gray, fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
        </div>
        
        <div style={{ marginBottom: 14 }}><label style={lbl}>Date</label><input style={inp} type="date" value={form.date} onChange={e => set('date', e.target.value)} /></div>
        <div style={{ marginBottom: 14 }}><label style={lbl}>Artists (comma separated)</label><input style={inp} value={form.bands} onChange={e => set('bands', e.target.value)} /></div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
          <div><label style={lbl}>Venue</label><input style={inp} value={form.venue} onChange={e => set('venue', e.target.value)} /></div>
          <div><label style={lbl}>City</label><input style={inp} value={form.city} onChange={e => set('city', e.target.value)} /></div>
        </div>
        
        <div style={{ marginBottom: 14 }}><label style={lbl}>State</label><input style={{ ...inp, width: 80 }} value={form.state} onChange={e => set('state', e.target.value)} maxLength={2} /></div>
        
        <div style={{ marginBottom: 14 }}><label style={lbl}>Genre</label><select style={inp} value={form.genre} onChange={e => set('genre', e.target.value)}><option value="">— unset —</option>{GENRES.map(g => <option key={g} value={g}>{g}</option>)}</select></div>
        
        <div style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}><input type="checkbox" id="is_fest" checked={form.is_festival} onChange={e => set('is_festival', e.target.checked)} style={{ accentColor: C.teal, width: 16, height: 16 }} /><label htmlFor="is_fest" style={{ ...lbl, marginBottom: 0, cursor: 'pointer' }}>Festival Day</label></div>
        
        {form.is_festival && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div><label style={lbl}>Festival Name</label><input style={inp} value={form.festival_name} onChange={e => set('festival_name', e.target.value)} /></div>
            <div><label style={lbl}>Day Label</label><input style={inp} value={form.festival_day} onChange={e => set('festival_day', e.target.value)} /></div>
          </div>
        )}
        
        <div style={{ marginBottom: 14 }}><label style={lbl}>Setlists Obtained (band names, comma separated)</label><input style={inp} value={form.has_setlist_names} onChange={e => set('has_setlist_names', e.target.value)} /></div>
        
        {/* FIXED: Input field now correctly targets image_url */}
        <div style={{ marginBottom: 14 }}>
          <label style={lbl}>Gig Photo / Poster URL (Imgur Direct Link)</label>
          <input 
            style={inp} 
            value={form.image_url} 
            onChange={e => set('image_url', e.target.value)} 
            placeholder="https://i.imgur.com/abc123.jpg" 
          />
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', marginTop: 20 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {concert?.id && !confirming && <Btn variant="danger" onClick={() => setConfirming(true)}>Delete</Btn>}
            {confirming && <><Btn variant="danger" onClick={() => onDelete(concert.id)}>Confirm</Btn><Btn variant="secondary" onClick={() => setConfirming(false)}>Cancel</Btn></>}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
            <Btn onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Btn>
          </div>
        </div>
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
          <div style={{ fontFamily:"'Space Mono',monospace",fontSize:8,letterSpacing:'0.25em',textTransform:'uppercase',color:C.tealDim,marginBottom:8 }}>🎸 Eric's Concert History</div>
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

// ─── THEME SWITCHER ───────────────────────────────────────────────────────────
function ThemeSwitcher() {
  const { themeId, setThemeId } = useTheme();
  const [open, setOpen] = useState(false);
  const current = THEMES[themeId];

  return (
    <div style={{ position:'relative', display:'flex', alignItems:'center', padding:'0 12px', borderLeft:`1px solid ${C.border}`, flexShrink:0 }}>
      <button
        onClick={() => setOpen(o => !o)}
        title="Switch theme"
        style={{ display:'flex', alignItems:'center', gap:7, background:'none', border:`1px solid ${C.border}`, borderRadius:20, padding:'5px 10px', cursor:'pointer', transition:'all 0.2s' }}
        onMouseEnter={e => e.currentTarget.style.borderColor = C.teal}
        onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
      >
        <div style={{ width:10, height:10, borderRadius:'50%', background:current.dot, boxShadow:`0 0 6px ${current.dot}` }} />
        <span style={{ fontFamily:"'Space Mono',monospace", fontSize:8, color:C.gray, letterSpacing:'0.1em', textTransform:'uppercase', whiteSpace:'nowrap' }}>{current.name}</span>
        <span style={{ color:C.grayDim, fontSize:8 }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div style={{ position:'absolute', top:'calc(100% + 8px)', right:0, background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:8, padding:8, minWidth:160, zIndex:300, boxShadow:`0 8px 32px rgba(0,0,0,0.6)` }}
          className="fade-in">
          <div style={{ fontFamily:"'Space Mono',monospace", fontSize:7, color:C.grayDim, letterSpacing:'0.15em', textTransform:'uppercase', padding:'4px 8px 8px', borderBottom:`1px solid ${C.border}`, marginBottom:6 }}>Theme</div>
          {THEME_ORDER.map(id => {
            const t = THEMES[id];
            const isActive = id === themeId;
            return (
              <button key={id} onClick={() => { setThemeId(id); setOpen(false); }}
                style={{ display:'flex', alignItems:'center', gap:10, width:'100%', background:isActive?`${t.dot}15`:'none', border:'none', borderRadius:4, padding:'8px 10px', cursor:'pointer', transition:'all 0.15s' }}
                onMouseEnter={e => { if(!isActive)e.currentTarget.style.background=`${t.dot}0a`; }}
                onMouseLeave={e => { if(!isActive)e.currentTarget.style.background='none'; }}>
                <div style={{ width:12, height:12, borderRadius:'50%', background:t.dot, boxShadow:isActive?`0 0 8px ${t.dot}`:'none', flexShrink:0 }} />
                <span style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:isActive?t.dot:C.gray, letterSpacing:'0.08em' }}>{t.name}</span>
                {isActive && <span style={{ marginLeft:'auto', fontSize:10, color:t.dot }}>✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── TAB CONFIG ───────────────────────────────────────────────────────────────
// [id, label, group, color]
const TABS = [
  ['dashboard','⚡ Dashboard',null,C.teal],
  ['timeline','⏳ Timeline',null,C.cyan],
  ['byDay','📅 By Day',null,C.teal],
  ['byFest','🎪 By Festival','fest',C.gold],
  ['passport','🗺️ Passport','fest',C.gold],
  ['hof','🏆 Hall of Fame',null,C.purple],
  ['vault','📋 Setlist Vault',null,C.green],
['venues','📍 Venues',null,C.cyan],
  ['poster','🎨 Poster Generator',null,'#ff6699'],  
  ['browse','🔍 Browse','right',C.cyan],
  ['manage','⚙️ Manage','right',C.gray],
];

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  // ── THEME ────────────────────────────────────────────────────────────────────
  const [themeId, setThemeIdRaw] = useState(() => localStorage.getItem('concert-theme') || 'neon-noir');

  const setThemeId = (id) => {
    Object.assign(C, THEMES[id]);
    setThemeIdRaw(id);
    localStorage.setItem('concert-theme', id);
  };

  useEffect(() => { Object.assign(C, THEMES[themeId]); }, []);

  const themeCtx = useMemo(() => ({ themeId, setThemeId }), [themeId]);

  // ── DATA STATE ───────────────────────────────────────────────────────────────
  const [concerts, setConcerts]         = useState([]);
  const [artistGenres, setArtistGenres] = useState({}); // <── THIS WAS MISSING
  const [upcoming, setUpcoming]         = useState([]);
  const [loading, setLoading]           = useState(true);
  
  // ── UI STATE ─────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab]       = useState('dashboard');
  const [editTarget, setEditTarget]     = useState(null);
  const [shareCard, setShareCard]       = useState(null);
  const [upcomingModal, setUpcomingModal] = useState(null);

  // ── FILTER STATE ─────────────────────────────────────────────────────────────
  const [search, setSearch]             = useState('');
  const [yearFilter, setYearFilter]     = useState('all');
  const [festFilter, setFestFilter]     = useState('all');
  const [genreFilter, setGenreFilter]   = useState('all');
  const [browseView, setBrowseView]     = useState('shows');
  const [sortCol, setSortCol]           = useState('date');
  const [sortDir, setSortDir]           = useState('desc');
  const [page, setPage]                 = useState(1);

  // ── INITIAL FETCH ───────────────────────────────────────────────────────────
  // This replaces your old useEffect to make sure genres load first
  useEffect(() => { 
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchConcerts(), fetchUpcoming(), fetchGenres()]);
      setLoading(false);
    };
    init();
  }, []);
  // ── DERIVED DATA ────────────────────────────────────────────────────────────
  // ── DERIVED DATA ────────────────────────────────────────────────────────────
  // This now pulls from the dedicated artist_genres table instead of concert rows
  const genreMap = useMemo(() => artistGenres, [artistGenres]);

  const allSetsList = useMemo(() => {
    const r = [];
    concerts.forEach(c => { 
      const bands = Array.isArray(c.bands) ? c.bands : [c.artist].filter(Boolean); 
      bands.forEach(band => { if (band) r.push({ ...c, artist: band }); }); 
    });
    return r;
  }, [concerts]);

  const years = useMemo(() => [...new Set(concerts.map(c => getYear(c.date)).filter(Boolean))].sort(), [concerts]);
  const stateCounts = useMemo(() => { const m = {}; concerts.forEach(c => { if (c.state) m[c.state] = (m[c.state] || 0) + 1; }); return Object.entries(m).sort((a, b) => b[1] - a[1]); }, [concerts]);

  const headerStats = useMemo(() => ({
    totalShows: concerts.length,
    totalSets: allSetsList.length,
    uniqueArtists: new Set(allSetsList.map(s => s.artist)).size,
    festDays: concerts.filter(c => c.is_festival).length,
    setlistCount: concerts.filter(c => c.has_setlist || c.has_setlist_names).length,
  }), [concerts, allSetsList]);

  // Per-band genre counts (Now using the dedicated genre table)
  const genreStats = useMemo(() => {
    const counts = {};
    allSetsList.forEach(s => { 
      const g = artistGenres[s.artist] || 'Other'; 
      counts[g] = (counts[g] || 0) + 1; 
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count, color: GENRE_COLORS[name] || GENRE_COLORS['Other'] }))
      .sort((a, b) => b.count - a.count);
  }, [allSetsList, artistGenres]);

  const timelineData = useMemo(() => {
    const m = {};
    allSetsList.forEach(s => { const y = getYear(s.date); if (y) m[y] = (m[y] || 0) + 1; });
    return Object.entries(m).sort((a, b) => +a[0] - +b[0]).map(([year, count]) => ({ year: String(year).slice(2), count, fullYear: +year }));
  }, [allSetsList]);

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
    concerts.filter(c => c.is_festival && c.festival_name).forEach(c => { if (!m[c.festival_name]) m[c.festival_name] = { name: c.festival_name, days: 0, years: new Set() }; m[c.festival_name].days++; const y = getYear(c.date); if (y) m[c.festival_name].years.add(y); });
    return Object.values(m).map(f => ({ ...f, years: [...f.years].sort() })).sort((a, b) => b.days - a.days);
  }, [concerts]);

  const festGroupings = useMemo(() => {
    const m = {};
    concerts.filter(c => c.is_festival && c.festival_name).forEach(c => { const yr = getYear(c.date) || 'Unknown'; if (!m[c.festival_name]) m[c.festival_name] = { name: c.festival_name, years: {} }; if (!m[c.festival_name].years[yr]) m[c.festival_name].years[yr] = []; m[c.festival_name].years[yr].push(c); });
    return Object.values(m).sort((a, b) => Object.values(b.years).flat().length - Object.values(a.years).flat().length);
  }, [concerts]);

  const applyFilters = useCallback((list, isSet = false) => {
    let d = list;
    if (yearFilter !== 'all') d = d.filter(r => getYear(r.date) === +yearFilter);
    if (festFilter === 'fest') d = d.filter(r => r.is_festival);
    if (festFilter === 'solo') d = d.filter(r => !r.is_festival);
    if (genreFilter !== 'all') d = d.filter(r => { const g = isSet ? (artistGenres[r.artist]) : (r.genre); return g === genreFilter; });
    if (search) {
      const q = search.toLowerCase();
      d = d.filter(r => {
        const bands = isSet ? [r.artist] : (r.bands || []);
        return bands.some(b => b.toLowerCase().includes(q)) || (r.venue || '').toLowerCase().includes(q) || (r.city || '').toLowerCase().includes(q) || (r.festival_name || '').toLowerCase().includes(q);
      });
    }
    return d;
  }, [yearFilter, festFilter, genreFilter, search, artistGenres]);

  const filteredSets = useMemo(() => {
    const d = applyFilters(allSetsList, true);
    return [...d].sort((a, b) => { const av = sortCol === 'artist' ? (a.artist || '').toLowerCase() : (String(a[sortCol] || '')).toLowerCase(); const bv = sortCol === 'artist' ? (b.artist || '').toLowerCase() : (String(b[sortCol] || '')).toLowerCase(); if (sortCol === 'date') return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av); if (av < bv) return sortDir === 'asc' ? -1 : 1; if (av > bv) return sortDir === 'asc' ? 1 : -1; return 0; });
  }, [allSetsList, applyFilters, sortCol, sortDir]);

  const artistRows = useMemo(() => {
    if (browseView !== 'artists') return [];
    const m = {};
    applyFilters(allSetsList, true).forEach(s => { if (!m[s.artist]) m[s.artist] = { artist: s.artist, shows: [] }; m[s.artist].shows.push(s); });
    return Object.values(m).sort((a, b) => b.shows.length - a.shows.length);
  }, [allSetsList, applyFilters, browseView]);

  const dayGroups = useMemo(() => applyFilters(concerts).sort((a, b) => (b.date || '').localeCompare(a.date || '')), [concerts, applyFilters]);
  const paged = filteredSets.slice((page - 1) * PER_PAGE, page * PER_PAGE), totalPages = Math.ceil(filteredSets.length / PER_PAGE);

  // ── DB ACTIONS ──────────────────────────────────────────────────────────────

  async function fetchInitialData() {
    setLoading(true);
    await Promise.all([fetchConcerts(), fetchUpcoming(), fetchGenres()]);
    setLoading(false);
  }

  async function fetchConcerts() {
    const { data } = await supabase.from('concerts').select('*').order('date', { ascending: false });
    if (data) setConcerts(data);
  }

  async function fetchGenres() {
    const { data } = await supabase.from('artist_genres').select('*');
    if (data) {
      const gMap = {};
      data.forEach(row => { gMap[row.artist_name] = row.genre; });
      setArtistGenres(gMap);
    }
  }

  async function fetchUpcoming() {
    const { data } = await supabase.from('upcoming_concerts').select('*').order('date', { ascending: true });
    if (data) setUpcoming(data);
  }

  async function handleSave(id, payload) {
    if (id) await supabase.from('concerts').update(payload).eq('id', id);
    else await supabase.from('concerts').insert([payload]);
    fetchConcerts();
    setEditTarget(null);
  }

  async function handleDelete(id) {
    if (window.confirm('Delete show?')) {
      await supabase.from('concerts').delete().eq('id', id);
      fetchConcerts();
      setEditTarget(null);
    }
  }

  async function handleSetGenre(artist, genre) {
    if (!artist) return;
    const { error } = await supabase
      .from('artist_genres')
      .upsert({ artist_name: artist, genre: genre }, { onConflict: 'artist_name' });
    if (error) {
      console.error('Genre error:', error);
    } else {
      setArtistGenres(prev => ({ ...prev, [artist]: genre }));
    }
  }

  async function handleUpcomingSave(id, payload) {
  const cleanPayload = {
    artist: payload.artist,
    venue: payload.venue,
    date: payload.date,
    status: payload.status,
  };
  if (id) {
    const { data, error } = await supabase
      .from('upcoming_concerts')
      .update(cleanPayload)
      .eq('id', id)
      .select();
    if (error) alert('Save failed: ' + error.message);
    console.log('update result:', data, error);
  } else {
    const { data, error } = await supabase
      .from('upcoming_concerts')
      .insert([cleanPayload])
      .select();
    if (error) alert('Insert failed: ' + error.message);
    console.log('insert result:', data, error);
  }
  await fetchUpcoming();
  setUpcomingModal(null);
}

async function handleUpcomingDelete(id) {
  if (window.confirm('Remove this show?')) {
    const { error } = await supabase
      .from('upcoming_concerts')
      .delete()
      .eq('id', id);
    if (error) alert('Delete failed: ' + error.message);
    console.log('delete id:', id, 'error:', error);
    await fetchUpcoming();
    setUpcomingModal(null);
  }
}

  async function handleDuplicate(concert) {
    const { id, created_at, ...rest } = concert;
    await supabase.from('concerts').insert([{ ...rest, date: '', festival_day: '' }]);
    fetchConcerts();
    alert('Duplicated! Find it in Manage and update the date.');
  }

  const handleGenreClick = (genre) => {
    setGenreFilter(genre);
    setBrowseView('artists');
    setActiveTab('browse');
  };

  if (loading) return (
    <div style={{ background: C.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: "'Bebas Neue'", fontSize: '2rem', color: C.teal, letterSpacing: '0.15em' }}>LOADING</div>
    </div>
  );

  return (
    <ThemeContext.Provider value={themeCtx}>
      <div key={themeId} style={{ background: C.bg, minHeight: '100vh', paddingBottom: 60 }}>
        <MarqueeStyles />

        {shareCard && <ShareCard artist={shareCard.artist} shows={shareCard.shows} onClose={() => setShareCard(null)} />}
        {editTarget && <EditModal concert={editTarget === 'new' ? null : editTarget} onClose={() => setEditTarget(null)} onSave={handleSave} onDelete={handleDelete} />}
        {upcomingModal !== null && <UpcomingModal show={upcomingModal === 'new' ? null : upcomingModal} onClose={() => setUpcomingModal(null)} onSave={handleUpcomingSave} onDelete={handleUpcomingDelete} />}

        {/* ── HERO HEADER ── */}
            <div style={{ background: `linear-gradient(180deg,#050508 0%,${C.bgCard} 100%)`, borderBottom: `1px solid ${C.teal}22`, padding: '36px 24px 0', textAlign: 'center', position: 'relative' }}>          <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative' }}>
            <h1 style={{ fontFamily: "'Bebas Neue'", fontSize: 'clamp(3rem,8vw,6rem)', color: C.white, margin: '0 0 8px', lineHeight: 1, letterSpacing: '0.04em' }}>
              🎸 LIVE <span style={{ color: C.gray, fontSize: '0.7em' }}>//</span> <span style={{ color: C.teal }}>IN CONCERT</span>
            </h1>
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.75rem', color: C.gray, display: 'flex', justifyContent: 'center', gap: 20, flexWrap: 'wrap', marginBottom: 28 }}>
              <span>{years.length > 0 ? `${years[years.length - 1] - years[0]} YEARS` : '0 YEARS'}</span>
              <span style={{ color: C.grayDim }}>·</span>
              <span>{stateCounts.length} STATES</span>
              <span style={{ color: C.grayDim }}>·</span>
              <span style={{ color: C.white, fontWeight: 700 }}>{headerStats.totalSets.toLocaleString()} SETS 🤘</span>
            </div>

           {/* Neon stat tiles */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 0, borderTop: `1px solid ${C.border}`, marginTop: 0 }}>
              {[
                { value: headerStats.totalSets, label: 'TOTAL SETS', sub: 'individual performances', color: C.teal, icon: '🎵' },
                { value: headerStats.uniqueArtists, label: 'UNIQUE ARTISTS', sub: 'bands & performers', color: C.cyan, icon: '🎤' },
                { value: headerStats.totalShows, label: 'SHOW DAYS', sub: `${headerStats.festDays} fest · ${headerStats.totalShows - headerStats.festDays} solo`, color: C.purple, icon: '📅' },
                { value: headerStats.setlistCount, label: 'SETLISTS', sub: 'click to view vault', color: C.gold, icon: '📋', onClick: () => setActiveTab('vault') },
              ].map((s, i) => (
                <div key={s.label} onClick={s.onClick}
                  style={{ padding: '20px 16px', borderRight: i < 3 ? `1px solid ${C.border}` : 'none', textAlign: 'center', cursor: s.onClick ? 'pointer' : 'default', position: 'relative', overflow: 'hidden', transition: 'background 0.2s' }}
                  onMouseEnter={e => { if (s.onClick) e.currentTarget.style.background = hexToRgba(s.color, 0.06); }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                  <div style={{ position: 'absolute', bottom: 0, left: '10%', right: '10%', height: 2, background: s.color, boxShadow: `0 0 8px ${s.color}, 0 0 16px ${s.color}`, borderRadius: 2 }} />
                  <div style={{ fontSize: '1.2rem', marginBottom: 4 }}>{s.icon}</div>
                  <CountUpStat value={s.value} label={s.label} sub={s.sub} color={s.color} />
                  {s.onClick && <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 7, color: s.color, letterSpacing: '0.15em', marginTop: 4, opacity: 0.7 }}>↗ VIEW VAULT</div>}
                </div>
              ))}
            </div>
            <MasterLanyard concerts={concerts} artistGenres={artistGenres} genreStats={genreStats} />
          </div>
        </div>

        {/* ── NAV ── */}
        {/* ── NAV ── */}
        <nav style={{ background: C.bgCard, borderBottom: `1px solid ${C.teal}22`, display: 'flex', position: 'sticky', top: 0, zIndex: 200 }}>
        <div style={{ display: 'flex', flex: 1, overflowX: 'auto', scrollbarWidth: 'none', alignItems: 'stretch' }}>
            {(() => {
              const nonRightTabs = TABS.filter(([,, g]) => g !== 'right');
              const festTabs = nonRightTabs.filter(([,, g]) => g === 'fest');
              const otherTabs = nonRightTabs.filter(([,, g]) => g !== 'fest');

              const renderTab = ([id, label, group, color]) => {
                const isActive = activeTab === id;
                return (
                  <button key={id} onClick={() => setActiveTab(id)}
                    style={{
                      fontFamily: "'Space Mono'", fontSize: 10,
                      color: isActive ? color : C.gray,
                      background: 'none', border: 'none',
                      borderBottom: isActive ? `2px solid ${color}` : '2px solid transparent',
                      padding: '12px 16px', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                      position: 'relative', transition: 'color 0.2s'
                    }}>
                    {label}
                    {isActive && <div className="tab-active" style={{ '--tab-color': color }} />}
                  </button>
                );
              };

              return (
                <>
                  {otherTabs.map(renderTab)}

                  {/* ── FESTIVAL ZONE ── */}
                  <div style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'stretch',
                    border: `1.5px solid ${C.gold}`,
                    borderRadius: 4,
                    margin: '4px 6px',
                    boxShadow: `0 0 10px ${hexToRgba(C.gold, 0.4)}, 0 0 20px ${hexToRgba(C.gold, 0.2)}, inset 0 0 10px ${hexToRgba(C.gold, 0.05)}`,
                    background: hexToRgba(C.gold, 0.06),
                  }}>
                    {/* FESTIVAL ZONE label */}
                    <div style={{
                      position: 'absolute',
                      top: -8,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: C.bgCard,
                      padding: '0 6px',
                      fontFamily: "'Space Mono'",
                      fontSize: 6,
                      color: C.gold,
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                      whiteSpace: 'nowrap',
                      textShadow: `0 0 8px ${hexToRgba(C.gold, 0.8)}`,
                    }}>
                      ★ FESTIVAL ZONE ★
                    </div>
                    {festTabs.map(renderTab)}
                  </div>
                </>
              );
            })()}
          </div>
          <div style={{ display: 'flex', borderLeft: `1px solid ${C.border}`, background: C.bgCard }}>
            {TABS.filter(([,, g]) => g === 'right').map(([id, label,, color]) => {
              const isActive = activeTab === id;
              return (
                <button key={id} onClick={() => setActiveTab(id)}
                  style={{
                    fontFamily: "'Space Mono'", fontSize: 10, color: isActive ? color : C.grayDim,
                    background: 'none', border: 'none',
                    borderBottom: isActive ? `2px solid ${color}` : '2px solid transparent',
                    padding: '12px 16px', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0
                  }}>
                  {label}
                </button>
              );
            })}
            <ThemeSwitcher />
          </div>
        </nav>

        {/* ── THE MAIN STAGE ── */}
        <main style={{
          maxWidth: 1300,
          margin: '20px auto',
          padding: '24px',
          background: `linear-gradient(180deg, ${hexToRgba(C.bgCard, 0.7)} 0%, ${hexToRgba(C.bg, 0.9)} 100%)`,
          border: `1px solid ${C.border}`,
          borderRadius: '16px',
          boxShadow: '0 30px 100px rgba(0,0,0,0.8)',
          backdropFilter: 'blur(12px)',
          position: 'relative',
          zIndex: 1,
          minHeight: '80vh'
        }}>
          <div style={{
            position: 'absolute',
            top: 0, right: 0,
            width: '300px', height: '300px',
            background: `radial-gradient(circle at top right, ${hexToRgba(C.teal, 0.03)}, transparent 70%)`,
            pointerEvents: 'none'
          }} />

          {/* ════ DASHBOARD ════ */}
          {activeTab === 'dashboard' && (
            <div className="fade-in">
              <OnThisDay concerts={concerts} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: 16, marginBottom: 16, marginTop: 8 }}>
                <ArtistInsights concerts={concerts} />
                <TheaterMarquee upcoming={upcoming} onAdd={() => setUpcomingModal('new')} onEdit={setUpcomingModal} />
                <RandomShow concerts={concerts} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: 16, marginBottom: 16 }}>
                <VenueDonutCard concerts={concerts} onNavigateToVenues={() => setActiveTab('venues')} />
                <Card neon>
                  <CardTitle>Sets Per Year — click a bar to jump to that year</CardTitle>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={timelineData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }} onClick={data => { if (data?.activePayload?.[0]?.payload?.fullYear) { setActiveTab('timeline'); } }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                      <XAxis dataKey="year" tick={{ fontSize: 8, fontFamily: "'Space Mono'", fill: C.gray }} />
                      <YAxis tick={{ fontSize: 8, fontFamily: "'Space Mono'", fill: C.gray }} />
                      <Tooltip contentStyle={{ background: C.bgCard, border: `1px solid ${C.teal}`, fontSize: 10 }} cursor={{ fill: 'rgba(0,229,204,0.08)' }} />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]} style={{ cursor: 'pointer' }}>
                        {timelineData.map((entry, index) => <Cell key={`cell-${index}`} fill={C.teal} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
                <Card neon><CardTitle>Fest vs Standalone</CardTitle><DonutChart fest={headerStats.festDays} solo={headerStats.totalShows - headerStats.festDays} /></Card>
                <Card neon><CardTitle>Top Festivals</CardTitle><TopFestBlocks festBreakdown={festBreakdown} /></Card>
                <Card neon>
                  <CardTitle>By Decade</CardTitle>
                  <DecadeBlocks sets={allSetsList} />
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
                    <FerrisWheel size={90} />
                  </div>
                </Card>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Card neon>
                  <CardTitle>Most Seen Artists</CardTitle>
                  <div style={{ display: 'grid', gap: 10 }}>
                    {artistCounts.slice(0, 6).map((a, i) => {
                      const gc = artistGenres[a.name] ? GENRE_COLORS[artistGenres[a.name]] : null;
                      const MEDALS = ['🥇', '🥈', '🥉', '🏅', '🏅', '🏅'];
                      const pct = Math.round((a.count / (artistCounts[0]?.count || 1)) * 100);
                      return (
                        <div key={a.name} style={{ marginBottom: 2, padding: '10px 12px', background: gc ? hexToRgba(gc, 0.06) : C.bgCardAlt, borderRadius: 6, border: `1px solid ${gc ? hexToRgba(gc, 0.25) : C.border}`, position: 'relative', overflow: 'hidden' }}>
                          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${pct}%`, background: gc ? hexToRgba(gc, 0.1) : 'rgba(255,255,255,0.03)', borderRadius: 6, transition: 'width 1s ease' }} />
                          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{MEDALS[i]}</span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: gc || C.white, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.name}</div>
                              {artistGenres[a.name] && <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 7, color: gc, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 1 }}>{artistGenres[a.name]}</div>}
                            </div>
                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                              <span style={{ color: C.gold, fontFamily: "'Bebas Neue'", fontSize: '1.6rem', lineHeight: 1 }}>{a.count}</span>
                              <span style={{ color: C.grayDim, fontFamily: "'Space Mono',monospace", fontSize: 8, marginLeft: 2 }}>×</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
                <Card neon style={{ display: 'flex', flexDirection: 'column', minHeight: 420 }}>
                  <CardTitle>Setlist Spotlight 📋</CardTitle>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <SetlistSpotlight concerts={concerts} onVault={() => setActiveTab('vault')} />
                  </div>
                  <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'center' }}>
                    <button onClick={() => setActiveTab('vault')} style={{ background: 'none', border: `1px solid ${C.teal}44`, color: C.tealDim, fontFamily: "'Space Mono'", fontSize: 8, padding: '5px 16px', borderRadius: 3, cursor: 'pointer', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                      VIEW FULL VAULT ↗
                    </button>
                  </div>
                </Card>
              </div>
              {genreStats.length >= 3 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16, marginTop: 16, marginBottom: 0 }}>
                  <Card neon style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <CardTitle style={{ textAlign: 'center' }}>Genre DNA 🧬</CardTitle>
                    <SetlistDNA genreScores={Object.fromEntries(genreStats.slice(0,6).map(g => [g.name, Math.round((g.count / (genreStats[0]?.count||1)) * 100)]))} />
                  </Card>
                  <Card neon style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 24 }}>
                    <CardTitle>Your Sonic Fingerprint</CardTitle>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {genreStats.slice(0,6).map((g, i) => (
                        <div key={g.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: g.color, boxShadow: `0 0 6px ${g.color}`, flexShrink: 0 }} />
                          <div style={{ fontFamily: "'Space Mono'", fontSize: 8, color: C.gray, width: 100, flexShrink: 0 }}>{g.name}</div>
                          <div style={{ flex: 1, height: 4, background: C.border, borderRadius: 2, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${Math.round((g.count/(genreStats[0]?.count||1))*100)}%`, background: g.color, borderRadius: 2, transition: 'width 1s ease' }} />
                          </div>
                          <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1rem', color: g.color, width: 30, textAlign: 'right' }}>{g.count}</div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              )}
              <NewsTicker concerts={concerts} artistCounts={artistCounts} genreStats={genreStats} />
            </div>
          )}

          {/* ════ TIMELINE ════ */}
          {activeTab === 'timeline' && <TimelineTab concerts={concerts} setActiveTab={setActiveTab} genreMap={artistGenres} />}

          {/* ════ BY DAY ════ */}
          {activeTab === 'byDay' && (
            <div className="fade-in">
              <div style={{ display: 'flex', gap: 10, marginTop: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                <select value={yearFilter} onChange={e => setYearFilter(e.target.value)} style={{ ...inputSt, minWidth: 100 }}><option value="all">All Years</option>{years.map(y => <option key={y} value={y}>{y}</option>)}</select>
                <select value={festFilter} onChange={e => setFestFilter(e.target.value)} style={{ ...inputSt, minWidth: 140 }}><option value="all">All Types</option><option value="fest">Festival Only</option><option value="solo">Standalone Only</option></select>
              </div>
              <ByDayTab
                dayGroups={dayGroups}
                onEdit={setEditTarget}
                genreMap={artistGenres}
                search={search}
                setSearch={setSearch}
                yearFilter={yearFilter}
                setYearFilter={setYearFilter}
                festFilter={festFilter}
                setFestFilter={setFestFilter}
                genreFilter={genreFilter}
                setGenreFilter={setGenreFilter}
                concerts={concerts}
              />
            </div>
          )}

          {/* ════ OTHER TABS ════ */}
          {activeTab === 'byFest' && <ByFestTab festGroupings={festGroupings} genreMap={artistGenres} />}
{activeTab === 'passport' && <PassportTab passport={passport} genreStats={genreStats} onNavigateToFest={name => { setActiveTab('byFest'); setTimeout(() => { const el = document.getElementById(`fest-${name.replace(/\s+/g, '-')}`); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 150); }} />}          {activeTab === 'hof' && <HallOfFame sets={allSetsList} genreMap={artistGenres} onShare={(a, s) => setShareCard({ artist: a, shows: s })} />}
          {activeTab === 'vault' && <SetlistVaultTab concerts={concerts} genreMap={artistGenres} />}
                    {activeTab === 'venues' && <VenuesTab concerts={concerts} />}

          {activeTab === 'poster' && <PosterGeneratorTab concerts={concerts} genreMap={artistGenres} allSetsList={allSetsList} />}
          {activeTab === 'browse' && (
            <BrowseTab browseView={browseView} setBrowseView={setBrowseView} search={search} setSearch={setSearch} yearFilter={yearFilter} setYearFilter={setYearFilter} festFilter={festFilter} setFestFilter={setFestFilter} genreFilter={genreFilter} setGenreFilter={setGenreFilter} sortCol={sortCol} setSortCol={setSortCol} sortDir={sortDir} setSortDir={setSortDir} paged={paged} page={page} setPage={setPage} totalPages={totalPages} artistRows={artistRows} years={years} onShare={(a, s) => setShareCard({ artist: a, shows: s })} onEdit={setEditTarget} onSetGenre={handleSetGenre} genreMap={artistGenres} />
          )}
          {activeTab === 'manage' && <ManageTab concerts={concerts} onEdit={setEditTarget} onAdd={() => setEditTarget('new')} onDuplicate={handleDuplicate} />}

        </main>
      </div>
    </ThemeContext.Provider>
  );
}