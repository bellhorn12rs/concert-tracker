import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { supabase } from './supabaseClient';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// ─── UTILITY ──────────────────────────────────────────────────────────────────
function hexToRgba(hex, alpha) {
  if (!hex || typeof hex !== 'string' || hex.length < 7) return `rgba(255,255,255,${alpha})`;
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${alpha})`;
}

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
// ─── SETLIST SPOTLIGHT ATOM (HANDWRITTEN POSTER EDITION) ──────────────────────
const SpotlightScrap = ({ data, isTop, TAPE_COLORS }) => {
  if (!data) return null;
  const charCode = data.id?.charCodeAt(data.id.length - 1) || 0;
  const r = isTop ? (charCode % 4) - 3 : (charCode % 4) + 1;
  const tapeColor = TAPE_COLORS[charCode % TAPE_COLORS.length];
  const hasImg = data.image_url && data.image_url.trim() !== "";

  // Helper for the "Notebook Fallback" (Keeps the archive mixed-media)
  const PaperFallback = () => {
    const doodle = ['♪', '✦', '★', '♡', '✌', '⚡', '♫', '◈'][charCode % 8];
    return (
      <div className="scrap-paper" style={{ background: 'linear-gradient(160deg,#f5f0e8,#e8e0cc)', padding: '22px 16px 14px', boxShadow: '4px 8px 20px rgba(0,0,0,0.5)', position: 'relative', overflow: 'hidden', minHeight: 115, display: 'flex', flexDirection: 'column', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 3 }}>
        {[0,1,2,3].map(j => <div key={j} style={{ position:'absolute', left:32, right:8, top:44+j*22, height:1, background:'rgba(150,180,220,0.45)' }} />)}
        <div style={{ position: 'absolute', left: 28, top: 0, bottom: 0, width: 1.5, background: 'rgba(220,60,60,0.25)' }} />
        <div style={{ position:'absolute', left:8, top:'40%', width:10, height:10, borderRadius:'50%', background:'rgba(0,0,0,0.08)', boxShadow:'inset 0 1px 2px rgba(0,0,0,0.15)' }} />
        <div style={{ position:'absolute', bottom:8, right:10, fontFamily:"'Caveat',cursive", fontSize:'1.4rem', color:'rgba(0,0,0,0.12)', transform:'rotate(15deg)', userSelect:'none' }}>{doodle}</div>
        <div style={{ paddingLeft: 14, flex: 1, position: 'relative', zIndex: 1 }}>
          <div style={{ fontFamily: "'Caveat',cursive", fontSize: '2.2rem', fontWeight: 700, color: '#1a1a2e', lineHeight: 1, marginBottom: 4 }}>{data.band}</div>
          <svg height="6" width="100%" style={{ marginBottom: 8, overflow:'visible' }}><path d="M2,3 Q30,1 60,4 Q90,6 120,3 Q150,1 180,4" stroke="#1a1a2e" strokeWidth="1.2" fill="none" strokeOpacity="0.15" strokeLinecap="round"/></svg>
          <div style={{ fontFamily: "'Caveat',cursive", fontSize: '1rem', color: '#3a3a6e', lineHeight: 1.2 }}>{fmtDateShort(data.date)}</div>
          <div style={{ fontFamily: "'Caveat',cursive", fontSize: '0.9rem', color: '#5a5a7e', lineHeight: 1.2 }}>{data.venue?.toUpperCase()}</div>
        </div>
        <a href={data.sfmUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ alignSelf: 'flex-end', background: 'rgba(0,0,0,0.06)', color: '#1a1a2e', fontSize: 6, fontFamily: "'Space Mono'", padding: '3px 7px', borderRadius: 2, textDecoration: 'none', border: '1px solid rgba(0,0,0,0.1)', fontWeight: 700, marginTop: 6 }}>SETLIST ↗</a>
      </div>
    );
  };

  return (
    <div style={{ flex: 1, position: 'relative', zIndex: isTop ? 2 : 1, transform: `rotate(${r}deg)`, transition: 'transform 0.3s ease', animation: 'peel-and-stick 0.8s cubic-bezier(0.23, 1, 0.32, 1) forwards', '--r': `${r}deg` }}>
      <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', width: 46, height: 16, background: tapeColor, opacity: 0.85, borderRadius: 1, zIndex: 30, boxShadow: '0 2px 4px rgba(0,0,0,0.2)', animation: 'tape-slam 0.4s 0.6s both' }} />

      {hasImg ? (
        <div style={{ background: '#fff', padding: '5px', boxShadow: '0 12px 40px rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column', borderRadius: 2, border: '1px solid #ddd' }}>
          {/* HEADER: Handwritten Band Name */}
          <div style={{ padding: '8px 4px 2px', textAlign: 'center' }}>
            <div style={{ fontFamily: "'Caveat', cursive", fontSize: '2.4rem', color: '#111', fontWeight: 700, lineHeight: 0.8, letterSpacing: '-0.02em' }}>
              {data.band}
            </div>
          </div>

          {/* IMAGE AREA */}
          <div style={{ flex: 1, background: '#000', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '8px 0' }}>
            <img src={data.image_url} alt={data.band} style={{ width: '100%', height: 'auto', maxHeight: '240px', objectFit: 'contain' }} />
          </div>

          {/* FOOTER: Handwritten Venue/Date */}
          <div style={{ padding: '4px 8px 10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div style={{ fontFamily: "'Caveat', cursive", color: '#2a2a4e', lineHeight: 1 }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{data.venue}</div>
                <div style={{ fontSize: '1rem', opacity: 0.8 }}>{fmtDateShort(data.date)}</div>
              </div>
              <a href={data.sfmUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ background: C.gold, color: '#000', fontSize: 7, fontFamily: "'Space Mono'", padding: '4px 8px', borderRadius: 2, textDecoration: 'none', fontWeight: 900 }}>SETLIST ↗</a>
            </div>
            {data.is_festival && (
              <div style={{ fontFamily: "'Caveat', cursive", fontSize: '1.1rem', color: C.teal, marginTop: 4, borderTop: '1px dashed #eee', paddingTop: 4 }}>✎ {data.festival_name}</div>
            )}
          </div>
        </div>
      ) : (
        <PaperFallback />
      )}
    </div>
  );
};
// ─── MAIN SETLIST SPOTLIGHT COMPONENT (HORIZONTAL EDITION) ──────────────────
function SetlistSpotlight({ concerts, onVault }) {
  const [topIdx, setTopIdx] = useState(0);
  const [botIdx, setBotIdx] = useState(1);

  const vault = useMemo(() => concerts.filter(c => c.has_setlist || c.has_setlist_names?.trim()), [concerts]);
  const TAPE_COLORS = ['#ffcc00', '#00e5cc', '#9966ff', '#ff4466', '#00cfff'];

  const slides = useMemo(() => {
    if (!vault.length) return [];
    const sorted = [...vault].sort((a, b) => b.date.localeCompare(a.date));
    const randomPool = [...vault].sort(() => 0.5 - Math.random());
    
    return [sorted[0], ...randomPool.slice(0, 19)].map(s => ({
      id: s.id,
      band: s.has_setlist_names?.split(',')[0]?.trim() || s.bands?.[0] || '?',
      date: s.date,
      venue: s.venue,
      is_festival: s.is_festival,
      festival_name: s.festival_name,
      image_url: s.image_url, 
      sfmUrl: `https://www.setlist.fm/search?query=${encodeURIComponent(s.has_setlist_names?.split(',')[0]?.trim() || s.bands?.[0])}+${encodeURIComponent(s.date)}`
    }));
  }, [vault]);

  // THE RECURSIVE SYNC-KILLER (Logic remains untouched so it doesn't break)
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

  return (
    <div style={{ cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column' }} onClick={onVault}>
      <div style={{ fontFamily: "'Space Mono'", fontSize: 8, color: C.gold, letterSpacing: 3, marginBottom: 20, textTransform: 'uppercase', textAlign: 'center', opacity: 0.4 }}>
        📋 BACKSTAGE LOG
      </div>
      
      {/* ── CHANGED TO ROW LAYOUT ── */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'row', // Horizontal!
        gap: '12px',         // Space between left and right cards
        padding: '0 4px',
        alignItems: 'flex-start' 
      }}>
        <SpotlightScrap 
          key={`left-${topIdx}`} 
          data={slides[topIdx % slides.length]} 
          isTop={true} 
          TAPE_COLORS={TAPE_COLORS} 
        />
        <SpotlightScrap 
          key={`right-${botIdx}`} 
          data={slides[botIdx % slides.length]} 
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

// ─── HALL OF FAME ─────────────────────────────────────────────────────────────
// ─── HALL OF FAME (SYNCED EDITION) ─────────────────────────────────────────────
function HallOfFame({ sets, genreMap, onShare }) {
  const [selected, setSelected] = useState(null);
  const topRef = useRef(null);

  const artists = useMemo(() => {
    const m = {};
    // 1. Group all shows by artist
    sets.forEach(s => { 
      if (!m[s.artist]) m[s.artist] = { artist: s.artist, shows: [] }; 
      m[s.artist].shows.push(s); 
    });

    // 2. Assign the Master Genre from your new table
    return Object.values(m).map(a => {
      // MASTER FIX: Look at the master genreMap first!
      const masterGenre = genreMap[a.artist];
      return {
        ...a,
        genre: masterGenre || null
      };
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
            padding: '18px 20px', 
            marginBottom: 24, 
            boxShadow: `0 0 24px ${hexToRgba(gc, 0.2)}`,
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Poster Watermark in background */}
            <div style={{ position: 'absolute', right: -10, bottom: -20, fontFamily: "'Bebas Neue'", fontSize: '8rem', color: hexToRgba(gc, 0.03), pointerEvents: 'none' }}>
              {selectedData.shows.length}x
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
              <div>
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: '2.2rem', letterSpacing: '0.08em', color: gc, marginBottom: 4, lineHeight: 1 }}>
                  {selectedData.artist}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  {selectedData.genre && <GenreBadge genre={selectedData.genre} color={gc} />}
                  <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: C.gray, textTransform: 'uppercase' }}>
                    {selectedData.shows.length} sets · {fmtDate(selectedData.shows[selectedData.shows.length - 1]?.date)} → {fmtDate(selectedData.shows[0]?.date)}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {onShare && <button onClick={() => onShare(selectedData.artist, selectedData.shows)} style={{ fontFamily: "'Space Mono'", fontSize: 9, background: hexToRgba(gc, 0.15), border: `1px solid ${gc}44`, color: gc, borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }}>📤 Share</button>}
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: `1px solid ${C.border}`, color: C.gray, fontSize: 10, borderRadius: 4, padding: '4px 8px', cursor: 'pointer' }}>CLOSE</button>
              </div>
            </div>

            <div style={{ position: 'relative', paddingLeft: 20, zIndex: 1 }}>
              <div style={{ position: 'absolute', left: 5, top: 0, bottom: 0, width: 1, background: `linear-gradient(to bottom, ${gc}, ${C.grayDim})` }} />
              {[...selectedData.shows].reverse().map((s, i) => {
                const hasSet = s.has_setlist || (s.has_setlist_names?.trim());
                return (
                  <div key={i} style={{ position: 'relative', marginBottom: 12, paddingLeft: 14 }}>
                    <div style={{ position: 'absolute', left: -7, top: 4, width: 8, height: 8, borderRadius: '50%', background: s.is_festival ? gc : (hasSet ? C.gold : C.grayDim), zIndex: 2 }} />
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: hasSet ? C.gold : C.tealDim }}>{fmtDate(s.date)}</span>
                      <span style={{ fontSize: '0.85rem', color: C.white }}>{s.venue}</span>
                      <span style={{ fontSize: '0.75rem', color: C.grayDim }}>{s.city}, {s.state}</span>
                      {s.is_festival && <Badge color={gc}>{s.festival_name}</Badge>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
        {artists.map((a, i) => {
          const gc = a.genre ? (GENRE_COLORS[a.genre] || C.teal) : null;
          const isSelected = selected === a.artist;
          const festCount = a.shows.filter(s => s.is_festival).length;
          const pct = Math.round((festCount / a.shows.length) * 100);
          const cardColor = isSelected ? (gc || C.teal) : gc;
          
          return (
            <div key={a.artist} onClick={() => handleSelect(a.artist, isSelected)}
              className="card-texture"
              style={{ 
                background: cardColor ? `linear-gradient(135deg, ${C.bgCard}, ${hexToRgba(cardColor, 0.1)})` : C.bgCard, 
                border: `1px solid ${cardColor ? hexToRgba(cardColor, 0.6) : C.border}`, 
                boxShadow: cardColor ? `0 0 14px ${hexToRgba(cardColor, 0.25)}` : 'none', 
                borderRadius: 8, padding: '15px', cursor: 'pointer', transition: 'all 0.2s', position: 'relative', overflow: 'hidden' 
              }}>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: cardColor || C.tealDim, marginBottom: 4 }}>{MEDAL[i] || '🎤'} #{i + 1}</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: C.white, marginBottom: 4, lineHeight: 1.1 }}>{a.artist}</div>
              {a.genre && <GenreBadge genre={a.genre} color={gc} small />}
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: '2.2rem', color: cardColor || C.white, lineHeight: 1, marginTop: 10 }}>{a.shows.length}×</div>
              
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

// ─── TICKET STUB CARD (By Day) ─────────────────────────────────────────────────
function TicketStubCard({ event, onEdit, genreMap }) {
  const bands = event.bands||[];
  const hasSetlist = event.has_setlist||(event.has_setlist_names?.trim());
  const gi = getConcertGenreInfo(event, genreMap);
  const borderColor = gi.mixed ? C.teal : (gi.color||C.border);
  const serial = event.id?.slice(0,8).toUpperCase() || 'XXXXXXXX';
  const sfmUrl = hasSetlist ? `https://www.setlist.fm/search?query=${encodeURIComponent(bands[0]||'')}` : null;

  return (
    <div className="ticket-hover" data-date={event.date}
      onClick={() => onEdit && onEdit(event)}
      style={{ display:'flex', marginBottom:10, cursor:'pointer', filter:`drop-shadow(0 4px 12px rgba(0,0,0,0.5))` }}>

      {/* Main ticket body */}
      <div style={{ flex:1, background:`linear-gradient(135deg, ${C.bgCard}, ${hexToRgba(borderColor,0.08)})`, border:`1px solid ${borderColor}44`, borderRight:'none', borderRadius:'6px 0 0 6px', padding:'12px 16px', position:'relative', overflow:'hidden' }}>
        
        {/* 📸 GIG PHOTO PREVIEW (Polaroid Style) */}
        {event.image_url && (
          <div style={{
            position: 'absolute',
            right: 12,
            top: '50%',
            transform: 'translateY(-50%) rotate(3deg)',
            width: 52,
            height: 52,
            padding: '3px 3px 10px 3px',
            background: '#fff',
            boxShadow: '0 4px 10px rgba(0,0,0,0.4)',
            border: '1px solid #ddd',
            zIndex: 10,
            pointerEvents: 'none' 
          }}>
            <img 
              src={event.image_url} 
              alt="Gig" 
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '1px' }} 
              onError={(e) => e.target.parentElement.style.display = 'none'}
            />
          </div>
        )}

        {/* Background watermark */}
        <div style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', fontFamily:"'Bebas Neue'", fontSize:'5rem', color:'rgba(255,255,255,0.02)', lineHeight:1, userSelect:'none', whiteSpace:'nowrap' }}>ADMIT ONE</div>

        {/* Top row */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:8, position: 'relative', zIndex: 2 }}>
          <div>
            <div style={{ fontFamily:"'Bebas Neue'", fontSize:'1.3rem', letterSpacing:'0.08em', color:C.white, lineHeight:1 }}>{fmtDate(event.date)}</div>
            <div style={{ fontFamily:"'Space Mono',monospace", fontSize:8, color:C.gray, marginTop:2 }}>{[event.venue,event.city,event.state].filter(Boolean).join(' · ')||'No location'}</div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4 }}>
            <GenreBadge genre={gi.genre} color={gi.color} mixed={gi.mixed} small />
            {event.is_festival && <Badge color={C.teal}>{event.festival_day||event.festival_name||'Festival'}</Badge>}
          </div>
        </div>

        {/* Artist names */}
        <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:8, position: 'relative', zIndex: 2, maxWidth: '85%' }}>
          {bands.map((b,i) => {
            const bg = genreMap[b] ? GENRE_COLORS[genreMap[b]] : null;
            return <span key={i} style={{ fontSize:i===0?'1rem':'0.78rem', fontFamily:i===0?"'Bebas Neue'":"'Space Mono',monospace", color:bg||C.white, letterSpacing:i===0?'0.06em':'0', fontWeight:i===0?900:400 }}>{b}{i<bands.length-1&&i!==0?' •':''}</span>;
          })}
        </div>

        {/* Bottom row */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', position: 'relative', zIndex: 2 }}>
          <div style={{ fontFamily:"'Space Mono',monospace", fontSize:7, color:C.grayDim, letterSpacing:'0.1em' }}>#{serial}</div>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            {hasSetlist && (
              <a href={sfmUrl} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()}
                style={{ textDecoration:'none', fontSize:11, filter:'drop-shadow(0 0 3px gold)' }} title="View on setlist.fm">📋</a>
            )}
          </div>
        </div>

        {/* Left accent bar */}
        <div style={{ position:'absolute', left:0, top:0, bottom:0, width:3, background:`linear-gradient(to bottom,${borderColor},${hexToRgba(borderColor,0.3)})` }} />
      </div>

      {/* Perforated stub */}
      <div style={{ width:60, background:`linear-gradient(135deg,${hexToRgba(borderColor,0.15)},${hexToRgba(borderColor,0.05)})`, border:`1px solid ${borderColor}44`, borderLeft:`1px dashed ${borderColor}33`, borderRadius:'0 6px 6px 0', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:4, padding:'8px 4px' }}>
        <div style={{ fontFamily:"'Space Mono',monospace", fontSize:6, color:borderColor, textTransform:'uppercase', letterSpacing:'0.15em', writingMode:'vertical-rl', transform:'rotate(180deg)', textAlign:'center', lineHeight:1.4 }}>ADMIT ONE</div>
        <div style={{ width:1, height:20, background:`${borderColor}44` }} />
        <div style={{ fontFamily:"'Space Mono',monospace", fontSize:5, color:C.grayDim, textAlign:'center' }}>{getYear(event.date)}</div>
      </div>
    </div>
  );
}
// ─── FESTIVAL WRISTBAND CARD ───────────────────────────────────────────────────
function WristbandCard({ event, genreMap, compact = false }) {
  const bands = event.bands||[];
  const STAGE_COLORS = [C.teal,C.cyan,C.purple,C.gold,C.green];
  const numCols = Math.max(1, bands.length<=2?bands.length:bands.length<=5?3:bands.length<=9?4:5);
  const columns = Array.from({length:Math.min(numCols,bands.length)},()=>[]);
  bands.forEach((b,i) => columns[i%columns.length].push(b));
  const gi = getConcertGenreInfo(event, genreMap);
  const wristColor = gi.mixed ? C.cyan : (gi.color||C.teal);

  return (
    <div className="day-card-hover" style={{ background:compact?C.bgCardAlt:C.bgCard, border:`1px solid ${C.border}`, borderRadius:6, marginBottom:compact?8:12, overflow:'hidden' }}>
      {/* Wristband strip */}
      <div className="wristband" style={{ background:`linear-gradient(90deg,${hexToRgba(wristColor,0.4)},${hexToRgba(wristColor,0.25)},${hexToRgba(wristColor,0.4)})`, borderBottom:`2px solid ${wristColor}`, padding:'7px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          {/* Plastic locking bead */}
          <div style={{ width:14, height:14, borderRadius:'50%', background:`radial-gradient(circle at 35% 35%,${hexToRgba(wristColor,0.9)},${hexToRgba(wristColor,0.4)})`, border:`1.5px solid ${wristColor}`, boxShadow:`0 0 6px ${wristColor}66`, flexShrink:0 }} />
          <div style={{ fontFamily:"'Bebas Neue'", fontSize:'1rem', letterSpacing:'0.12em', color:C.white }}>{fmtDate(event.date)}</div>
          <div style={{ fontFamily:"'Space Mono',monospace", fontSize:8, color:hexToRgba(C.white,0.7) }}>{[event.venue,event.city,event.state].filter(Boolean).join(', ')}</div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <Badge color={wristColor}>{event.festival_day||event.festival_name||'Festival'}</Badge>
          <GenreBadge genre={gi.genre} color={gi.color} mixed={gi.mixed} small />
          <span style={{ fontFamily:"'Space Mono',monospace", fontSize:8, color:hexToRgba(C.white,0.6) }}>{bands.length} acts</span>
        </div>
      </div>

      {/* Band columns */}
      {columns.length > 0 && (
        <div style={{ display:'grid', gridTemplateColumns:`repeat(${columns.length},1fr)` }}>
          {columns.map((stageBands,ci) => (
            <div key={ci} style={{ borderRight:ci<columns.length-1?`1px solid ${C.border}`:'none' }}>
              <div style={{ height:3, background:`${STAGE_COLORS[ci%STAGE_COLORS.length]}66`, borderBottom:`2px solid ${STAGE_COLORS[ci%STAGE_COLORS.length]}` }} />
              <div style={{ padding:'8px 10px', display:'flex', flexDirection:'column', gap:5 }}>
                {stageBands.map((band,bi) => <div key={bi} style={{ background:C.bgCardAlt, borderRadius:4, padding:'6px 8px', borderLeft:`2px solid ${STAGE_COLORS[ci%STAGE_COLORS.length]}`, fontSize:'0.75rem', color:C.white, lineHeight:1.3 }}>{band}</div>)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
// ─── SETLIST VAULT (UNIFIED POSTER GRID) ─────────────────────────────────────
function SetlistVaultTab({ concerts, genreMap }) {
  const setlists = useMemo(() => {
    const results = [];
    concerts.forEach(c => {
      if (!c.has_setlist_names?.trim()) return;
      c.has_setlist_names.split(',').map(b => b.trim()).filter(Boolean).forEach(band => {
        results.push({ 
          id: `${c.id}-${band}`, 
          band, 
          date: c.date, 
          venue: c.venue, 
          city: c.city, 
          state: c.state, 
          festival_name: c.festival_name, 
          is_festival: c.is_festival, 
          genre: c.genre, 
          image_url: c.image_url 
        });
      });
    });
    return results.sort((a, b) => b.date.localeCompare(a.date));
  }, [concerts]);

  if (!setlists.length) return (
    <div style={{ padding: '80px 0', textAlign: 'center' }} className="fade-in">
      <div style={{ fontSize: '4rem', marginBottom: 20 }}>📋</div>
      <div style={{ fontFamily: "'Bebas Neue'", fontSize: '2rem', color: C.white }}>VAULT IS EMPTY</div>
    </div>
  );

  const cols = [[], [], []];
  setlists.forEach((s, i) => cols[i % 3].push({ ...s, colIdx: i }));

  const PosterCard = ({ s, i }) => {
    const rot = [-2, 1.5, -1, 2, -0.5, 3][i % 6];
    const tapeColor = ['#ffcc00', '#00e5cc', '#9966ff', '#ff4466', '#00cfff'][i % 5];
    const hasImg = s.image_url && s.image_url.trim() !== "";

    return (
      <div style={{ position: 'relative', transform: `rotate(${rot}deg)`, marginBottom: 50, zIndex: 1 }}>
        <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', width: 56, height: 20, background: tapeColor, opacity: 0.85, borderRadius: 2, zIndex: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }} />
        <div style={{ background: hasImg ? '#fff' : 'linear-gradient(160deg,#f5f0e8,#e8e0cc)', padding: '6px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', borderRadius: 2, border: '1px solid #ddd', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '12px 8px 4px', textAlign: 'center' }}>
            <div style={{ fontFamily: "'Caveat', cursive", fontSize: '2.8rem', fontWeight: 700, color: '#111', lineHeight: 0.8 }}>{s.band}</div>
          </div>
          <div style={{ background: '#000', margin: '10px 4px', minHeight: hasImg ? 0 : 120, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {hasImg ? (
              <img src={s.image_url} alt={s.band} style={{ width: '100%', height: 'auto', display: 'block' }} />
            ) : (
              <div style={{ padding: '40px', textAlign: 'center', opacity: 0.1 }}><div style={{ fontSize: '3rem' }}>🎸</div></div>
            )}
          </div>
          <div style={{ padding: '4px 10px 12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div style={{ fontFamily: "'Caveat', cursive", color: '#1a1a2e', lineHeight: 1.1 }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{s.venue}</div>
                <div style={{ fontSize: '1.1rem', opacity: 0.7 }}>{fmtDateShort(s.date)}</div>
              </div>
              <a href={`https://www.setlist.fm/search?query=${encodeURIComponent(s.band)}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                style={{ background: 'rgba(0,0,0,0.05)', color: '#000', textDecoration: 'none', fontFamily: "'Space Mono'", fontSize: 7, padding: '5px 10px', borderRadius: 4, border: '1px solid #ccc' }}>SETLIST ↗</a>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '40px 0 80px' }} className="fade-in">
      <div style={{ textAlign: 'center', marginBottom: 60 }}>
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: '4rem', color: C.white, letterSpacing: '0.05em' }}>📋 THE <span style={{ color: C.teal }}>ARCHIVE</span></div>
        <div style={{ fontFamily: "'Space Mono'", fontSize: 9, color: C.gray, opacity: 0.5, letterSpacing: 4 }}>{setlists.length} GIG POSTERS COLLECTED</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0 50px' }}>
        {cols.map((col, ci) => (
          <div key={ci} style={{ display: 'flex', flexDirection: 'column' }}>
            {col.map((s, idx) => <PosterCard key={s.id} s={s} i={idx + ci} />)}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── TIMELINE COMPONENTS ──────────────────────────────────────────────────────
function GenreLegend() {
  return (
    <div style={{ display:'flex', flexWrap:'wrap', gap:15, justifyContent:'center', padding:20, background: hexToRgba(C.bgCard, 0.5), borderRadius:12, margin:'0 auto 40px auto', maxWidth:900, border:`1px solid ${C.border}`, boxShadow: `0 4px 20px rgba(0,0,0,0.3)` }}>
      {Object.entries(GENRE_COLORS).map(([name,color]) => (
        <div key={name} style={{ display:'flex', alignItems:'center', gap:6 }}>
          <div style={{ width:8, height:8, borderRadius:'50%', background:color, boxShadow:`0 0 8px ${color}` }} />
          <span style={{ fontFamily:"'Space Mono'", fontSize:9, color:C.gray }}>{name.toUpperCase()}</span>
        </div>
      ))}
    </div>
  );
}

function TimelineCard({ item, isLeft, marginTop, onTeleport, genreMap }) {
  const [hovered, setHovered] = useState(false);
  const bands = item.bands||[];
  const gi = getConcertGenreInfo(item, genreMap);
  const themeColor = gi.mixed ? '#9d00ff' : (gi.color||GENRE_COLORS['Other']);
  const ds = daysSince(item.date);
  return (
    <div onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)} onClick={onTeleport}
      style={{ marginTop, display:'flex', justifyContent:isLeft?'flex-start':'flex-end', alignItems:'center', width:'100%', position:'relative', cursor:'pointer' }}>
      <div style={{ position:'absolute', left:'calc(50% - 6px)', width:12, height:12, borderRadius:'50%', background:themeColor, zIndex:5, boxShadow:`0 0 10px ${themeColor}`, border:`2px solid ${C.bg}` }} />
      <div style={{ width:'43%', padding:20, borderRadius:12, background: C.bgCard, border: `1px solid ${hovered ? themeColor : C.border}`, transform: hovered ? 'scale(1.03)' : 'scale(1)', transition: '0.3s' }}>
        <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:12 }}>
          {bands.map((band,idx) => (
            <span key={idx} style={{ fontFamily: idx===0 ? "'Bebas Neue'" : "'Space Mono'", fontSize: idx===0 ? '2rem' : '0.8rem', color: C.white }}>{band}</span>
          ))}
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:12, borderTop:`1px solid ${C.border}`, paddingTop:12 }}>
          <span style={{ fontFamily:"'Space Mono'", fontSize:9, color:C.gray }}>{item.venue?.toUpperCase()}</span>
          <span style={{ fontFamily:"'Space Mono'", fontSize:7, color: themeColor }}>{ds} DAYS AGO</span>
        </div>
      </div>
    </div>
  );
}

function TimelineTab({ concerts, setActiveTab, genreMap }) {
  const yearsData = useMemo(() => {
    if (!concerts.length) return [];
    const groups = {};
    [...concerts].sort((a,b)=>b.date.localeCompare(a.date)).forEach(show => { 
      const yr = new Date(show.date+'T12:00:00').getFullYear(); 
      if(!groups[yr]) groups[yr]=[]; 
      groups[yr].push(show); 
    });
    return Object.entries(groups).sort((a,b)=>b[0]-a[0]).map(([year, yearShows]) => {
      const flow=[]; let counter=0;
      yearShows.forEach((show) => {
        counter++; flow.push({...show, side: counter % 2 === 0 ? 'right' : 'left'});
      });
      return [year, flow];
    });
  }, [concerts]);

  const teleport = date => { 
    setActiveTab('byDay');
    setTimeout(() => { const el = document.querySelector(`[data-date="${date}"]`); if(el) el.scrollIntoView({behavior:'smooth', block:'center'}); }, 150);
  };

  return (
    <div style={{ padding:'40px 0 80px', position: 'relative' }}>
      <GenreLegend />
      <div style={{ maxWidth:1100, margin:'0 auto', position:'relative' }}>
        <div style={{ position:'absolute', left:'50%', top:0, bottom:0, width:2, background:C.border, transform:'translateX(-50%)', opacity:0.15 }} />
        {yearsData.map(([year, flow]) => (
          <div key={year}>
            <div style={{ textAlign:'center', margin:'60px 0' }}><span style={{ fontFamily:"'Bebas Neue'", fontSize:'4rem', color:C.teal, opacity:0.3 }}>{year}</span></div>
            {flow.map(item => <TimelineCard key={item.id} item={item} isLeft={item.side === 'left'} marginTop={40} onTeleport={() => teleport(item.date)} genreMap={genreMap} />)}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── TAB HELPERS ──────────────────────────────────────────────────────────────
function ByDayTab({ dayGroups, onEdit, genreMap, search, setSearch, yearFilter, setYearFilter, festFilter, setFestFilter, genreFilter, setGenreFilter, concerts }) {
  return (
    <div style={{ padding: '24px 0' }} className="fade-in">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {dayGroups.map(event => (
          <div key={event.id} data-date={event.date}>
            {event.is_festival ? <WristbandCard event={event} genreMap={genreMap} /> : <TicketStubCard event={event} onEdit={onEdit} genreMap={genreMap} />}
          </div>
        ))}
      </div>
    </div>
  );
}

function ByFestTab({ festGroupings, genreMap = {} }) {
  return (
    <div style={{ marginTop:20 }} className="fade-in">
      {festGroupings.map((fest) => (
        <div key={fest.name} id={`fest-${fest.name.replace(/\s+/g,'-')}`} style={{ marginBottom:40 }}>
          <div style={{ fontFamily:"'Bebas Neue'", fontSize:'3rem', color:C.gold, marginBottom:20 }}>{fest.name}</div>
          {Object.entries(fest.years).map(([yr, shows]) => (
            <div key={yr}>
              <div style={{ fontFamily:"'Space Mono'", fontSize:12, color:C.gray, marginBottom:10 }}>{yr}</div>
              {shows.map(s => <WristbandCard key={s.id} event={s} genreMap={genreMap} compact />)}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function PassportTab({ passport, onNavigateToFest }) {
  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(250px,1fr))', gap:15, marginTop:20 }}>
      {passport.map(f => (
        <div key={f.name} onClick={()=>onNavigateToFest(f.name)} style={{ background:C.bgCard, border:`1px solid ${C.border}`, padding:20, borderRadius:8, cursor:'pointer' }}>
          <div style={{ fontFamily:"'Bebas Neue'", fontSize:'1.5rem', color:C.teal }}>{f.name}</div>
          <div style={{ fontFamily:"'Space Mono'", fontSize:10, color:C.gray }}>{f.days} DAYS ATTENDED</div>
        </div>
      ))}
    </div>
  );
}

function BrowseTab({ browseView, setBrowseView, search, setSearch, yearFilter, setYearFilter, festFilter, setFestFilter, sortCol, setSortCol, sortDir, setSortDir, paged, page, setPage, totalPages, artistRows, years, onShare, onEdit, onSetGenre, genreMap, genreFilter, setGenreFilter }) {
  return (
    <div style={{ marginTop:20 }}>
      <div style={{ display:'flex', gap:10, marginBottom:20 }}>
        <input style={{...inputSt, flex:1}} placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)} />
        <select style={inputSt} value={yearFilter} onChange={e=>setYearFilter(e.target.value)}><option value="all">All Years</option>{years.map(y=><option key={y} value={y}>{y}</option>)}</select>
        <div style={{ display:'flex', background:C.bgCardAlt, borderRadius:4, padding:2 }}><button onClick={()=>setBrowseView('shows')} style={{ padding:'6px 12px', fontSize:10, background:browseView==='shows'?C.teal:'transparent', border:'none', cursor:'pointer' }}>Shows</button><button onClick={()=>setBrowseView('artists')} style={{ padding:'6px 12px', fontSize:10, background:browseView==='artists'?C.teal:'transparent', border:'none', cursor:'pointer' }}>Artists</button></div>
      </div>
      {browseView==='shows' ? (
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead><tr style={{ textAlign:'left', borderBottom:`1px solid ${C.border}` }}><th style={{ padding:10 }}>Date</th><th style={{ padding:10 }}>Artist</th><th style={{ padding:10 }}>Venue</th></tr></thead>
          <tbody>{paged.map(s => <tr key={s.id} onClick={()=>onEdit(s)} style={{ borderBottom:`1px solid ${C.border}`, cursor:'pointer' }}><td style={{ padding:10 }}>{s.date}</td><td style={{ padding:10 }}>{s.artist}</td><td style={{ padding:10 }}>{s.venue}</td></tr>)}</tbody>
        </table>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:10 }}>
          {artistRows.map(r => <div key={r.artist} style={{ background:C.bgCard, padding:15, borderRadius:8 }}><div style={{ fontFamily:"'Bebas Neue'", fontSize:'1.2rem' }}>{r.artist}</div><div style={{ fontSize:10, color:C.gray }}>{r.shows.length} shows</div></div>)}
        </div>
      )}
    </div>
  );
}

function ManageTab({ concerts, onEdit, onAdd, onDuplicate }) {
  return (
    <div style={{ marginTop:20 }}>
      <Btn onClick={onAdd} style={{ marginBottom:20 }}>+ Add New Show</Btn>
      <div style={{ display:'grid', gap:10 }}>
        {concerts.slice(0,20).map(c => <div key={c.id} onClick={()=>onEdit(c)} style={{ background:C.bgCard, padding:15, borderRadius:8, cursor:'pointer', display:'flex', justifyContent:'space-between' }}><span>{c.date} - {c.bands?.join(', ')}</span><span>✎</span></div>)}
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [themeId, setThemeIdRaw] = useState(() => localStorage.getItem('concert-theme') || 'neon-noir');
  const setThemeId = (id) => { Object.assign(C, THEMES[id]); setThemeIdRaw(id); localStorage.setItem('concert-theme', id); };
  useEffect(() => { Object.assign(C, THEMES[themeId]); }, []);
  const themeCtx = useMemo(() => ({ themeId, setThemeId }), [themeId]);

  const [concerts, setConcerts] = useState([]), [artistGenres, setArtistGenres] = useState({}), [upcoming, setUpcoming] = useState([]), [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard'), [editTarget, setEditTarget] = useState(null), [shareCard, setShareCard] = useState(null), [upcomingModal, setUpcomingModal] = useState(null);
  const [search, setSearch] = useState(''), [yearFilter, setYearFilter] = useState('all'), [festFilter, setFestFilter] = useState('all'), [genreFilter, setGenreFilter] = useState('all'), [browseView, setBrowseView] = useState('shows'), [sortCol, setSortCol] = useState('date'), [sortDir, setSortDir] = useState('desc'), [page, setPage] = useState(1);

  useEffect(() => { const init = async () => { setLoading(true); await Promise.all([fetchConcerts(), fetchUpcoming(), fetchGenres()]); setLoading(false); }; init(); }, []);

  const genreMap = artistGenres;
  const allSetsList = useMemo(() => { const r = []; concerts.forEach(c => { const bands = Array.isArray(c.bands) ? c.bands : [c.artist].filter(Boolean); bands.forEach(band => { if (band) r.push({ ...c, artist: band }); }); }); return r; }, [concerts]);
  const years = useMemo(() => [...new Set(concerts.map(c => getYear(c.date)).filter(Boolean))].sort(), [concerts]);
  const stateCounts = useMemo(() => { const m = {}; concerts.forEach(c => { if (c.state) m[c.state] = (m[c.state] || 0) + 1; }); return Object.entries(m).sort((a, b) => b[1] - a[1]); }, [concerts]);
  const headerStats = useMemo(() => ({ totalShows: concerts.length, totalSets: allSetsList.length, uniqueArtists: new Set(allSetsList.map(s => s.artist)).size, festDays: concerts.filter(c => c.is_festival).length, setlistCount: concerts.filter(c => c.has_setlist || c.has_setlist_names).length }), [concerts, allSetsList]);
  const genreStats = useMemo(() => { const counts = {}; allSetsList.forEach(s => { const g = artistGenres[s.artist] || 'Other'; counts[g] = (counts[g] || 0) + 1; }); return Object.entries(counts).map(([name, count]) => ({ name, count, color: GENRE_COLORS[name] || GENRE_COLORS['Other'] })).sort((a, b) => b.count - a.count); }, [allSetsList, artistGenres]);
  const timelineData = useMemo(() => { const m = {}; allSetsList.forEach(s => { const y = getYear(s.date); if (y) m[y] = (m[y] || 0) + 1; }); return Object.entries(m).sort((a, b) => +a[0] - +b[0]).map(([year, count]) => ({ year: String(year).slice(2), count, fullYear: +year })); }, [allSetsList]);
  const artistCounts = useMemo(() => { const m = {}; allSetsList.forEach(s => { m[s.artist] = (m[s.artist] || 0) + 1; }); return Object.entries(m).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count })); }, [allSetsList]);
  const festBreakdown = useMemo(() => { const m = {}; concerts.filter(c => c.is_festival && c.festival_name).forEach(c => { m[c.festival_name] = (m[c.festival_name] || 0) + 1; }); return Object.entries(m).sort((a, b) => b[1] - a[1]); }, [concerts]);
  const passport = useMemo(() => { const m = {}; concerts.filter(c => c.is_festival && c.festival_name).forEach(c => { if (!m[c.festival_name]) m[c.festival_name] = { name: c.festival_name, days: 0, years: new Set() }; m[c.festival_name].days++; const y = getYear(c.date); if (y) m[c.festival_name].years.add(y); }); return Object.values(m).map(f => ({ ...f, years: [...f.years].sort() })).sort((a, b) => b.days - a.days); }, [concerts]);
  const festGroupings = useMemo(() => { const m = {}; concerts.filter(c => c.is_festival && c.festival_name).forEach(c => { const yr = getYear(c.date) || 'Unknown'; if (!m[c.festival_name]) m[c.festival_name] = { name: c.festival_name, years: {} }; if (!m[c.festival_name].years[yr]) m[c.festival_name].years[yr] = []; m[c.festival_name].years[yr].push(c); }); return Object.values(m).sort((a, b) => Object.values(b.years).flat().length - Object.values(a.years).flat().length); }, [concerts]);

  const applyFilters = useCallback((list, isSet = false) => {
    let d = list;
    if (yearFilter !== 'all') d = d.filter(r => getYear(r.date) === +yearFilter);
    if (festFilter === 'fest') d = d.filter(r => r.is_festival);
    if (festFilter === 'solo') d = d.filter(r => !r.is_festival);
    if (genreFilter !== 'all') d = d.filter(r => (isSet ? artistGenres[r.artist] : r.genre) === genreFilter);
    if (search) { const q = search.toLowerCase(); d = d.filter(r => (isSet ? [r.artist] : (r.bands || [])).some(b => b.toLowerCase().includes(q)) || (r.venue || '').toLowerCase().includes(q) || (r.city || '').toLowerCase().includes(q) || (r.festival_name || '').toLowerCase().includes(q)); }
    return d;
  }, [yearFilter, festFilter, genreFilter, search, artistGenres]);

  const filteredSets = useMemo(() => applyFilters(allSetsList, true), [allSetsList, applyFilters]);
  const artistRows = useMemo(() => { if (browseView !== 'artists') return []; const m = {}; applyFilters(allSetsList, true).forEach(s => { if (!m[s.artist]) m[s.artist] = { artist: s.artist, shows: [] }; m[s.artist].shows.push(s); }); return Object.values(m).sort((a, b) => b.shows.length - a.shows.length); }, [allSetsList, applyFilters, browseView]);
  const dayGroups = useMemo(() => applyFilters(concerts).sort((a, b) => (b.date || '').localeCompare(a.date || '')), [concerts, applyFilters]);
  const paged = filteredSets.slice((page - 1) * PER_PAGE, page * PER_PAGE), totalPages = Math.ceil(filteredSets.length / PER_PAGE);

  async function fetchConcerts() { const { data } = await supabase.from('concerts').select('*').order('date', { ascending: false }); if (data) setConcerts(data); }
  async function fetchGenres() { const { data } = await supabase.from('artist_genres').select('*'); if (data) { const gMap = {}; data.forEach(row => { gMap[row.artist_name] = row.genre; }); setArtistGenres(gMap); } }
  async function fetchUpcoming() { const { data } = await supabase.from('upcoming_concerts').select('*').order('date', { ascending: true }); if (data) setUpcoming(data); }
  async function handleSave(id, payload) { if (id) await supabase.from('concerts').update(payload).eq('id', id); else await supabase.from('concerts').insert([payload]); fetchConcerts(); setEditTarget(null); }
  async function handleDelete(id) { if (window.confirm('Delete?')) { await supabase.from('concerts').delete().eq('id', id); fetchConcerts(); setEditTarget(null); } }
  async function handleSetGenre(artist, genre) { if (!artist) return; const { error } = await supabase.from('artist_genres').upsert({ artist_name: artist, genre: genre }, { onConflict: 'artist_name' }); if (!error) setArtistGenres(prev => ({ ...prev, [artist]: genre })); }
  async function handleUpcomingSave(id, payload) { if (id) await supabase.from('upcoming_concerts').update(cleanPayload).eq('id', id); else await supabase.from('upcoming_concerts').insert([payload]); await fetchUpcoming(); setUpcomingModal(null); }
  async function handleUpcomingDelete(id) { if (window.confirm('Remove?')) { await supabase.from('upcoming_concerts').delete().eq('id', id); await fetchUpcoming(); setUpcomingModal(null); } }
  async function handleDuplicate(concert) { const { id, created_at, ...rest } = concert; await supabase.from('concerts').insert([{ ...rest, date: '', festival_day: '' }]); fetchConcerts(); }

  const handleGenreClick = (genre) => { setGenreFilter(genre); setBrowseView('artists'); setActiveTab('browse'); };

  if (loading) return <div style={{ background: C.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue'", fontSize: '2rem', color: C.teal }}>LOADING</div>;

  return (
    <ThemeContext.Provider value={themeCtx}>
      <div key={themeId} style={{ background: C.bg, minHeight: '100vh', paddingBottom: 60 }}>
        <MarqueeStyles />
        {shareCard && <ShareCard artist={shareCard.artist} shows={shareCard.shows} onClose={() => setShareCard(null)} />}
        {editTarget && <EditModal concert={editTarget === 'new' ? null : editTarget} onClose={() => setEditTarget(null)} onSave={handleSave} onDelete={handleDelete} />}
        {upcomingModal !== null && <UpcomingModal show={upcomingModal === 'new' ? null : upcomingModal} onClose={() => setUpcomingModal(null)} onSave={handleUpcomingSave} onDelete={handleUpcomingDelete} />}

        <div style={{ background: `linear-gradient(180deg,#050508 0%,${C.bgCard} 100%)`, borderBottom: `1px solid ${C.teal}22`, padding: '36px 24px 0', textAlign: 'center' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <h1 style={{ fontFamily: "'Bebas Neue'", fontSize: 'clamp(3rem,8vw,6rem)', color: C.white, margin: '0 0 8px', lineHeight: 1 }}>🎸 LIVE <span style={{ color: C.teal }}>IN CONCERT</span></h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 0, borderTop: `1px solid ${C.border}` }}>
              {[{ v: headerStats.totalSets, l: 'SETS' }, { v: headerStats.uniqueArtists, l: 'ARTISTS' }, { v: headerStats.totalShows, l: 'DAYS' }, { v: headerStats.setlistCount, l: 'SETLISTS', click: () => setActiveTab('vault') }].map((s, i) => (
                <div key={i} onClick={s.click} style={{ padding: '20px 16px', textAlign: 'center', cursor: s.click ? 'pointer' : 'default', borderRight: i < 3 ? `1px solid ${C.border}` : 'none' }}>
                  <CountUpStat value={s.v} label={s.l} color={C.teal} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <nav style={{ background: C.bgCard, borderBottom: `1px solid ${C.teal}22`, display: 'flex', position: 'sticky', top: 0, zIndex: 200 }}>
          <div style={{ display: 'flex', flex: 1, overflowX: 'auto' }}>
            {TABS.filter(([,, g]) => g !== 'right').map(([id, label, group, color]) => (<button key={id} onClick={() => setActiveTab(id)} style={{ fontFamily: "'Space Mono'", fontSize: 10, color: activeTab === id ? color : C.gray, background: 'none', border: 'none', padding: '12px 16px', cursor: 'pointer', borderBottom: activeTab === id ? `2px solid ${color}` : 'none' }}>{label}</button>))}
          </div>
          <div style={{ display:'flex' }}><ThemeSwitcher /></div>
        </nav>

        <main style={{ maxWidth: 1300, margin: '20px auto', padding: '24px', background: `${hexToRgba(C.bgCard, 0.7)}`, border: `1px solid ${C.border}`, borderRadius: '16px', backdropFilter: 'blur(12px)', minHeight: '80vh' }}>
          {activeTab === 'dashboard' && (
            <div className="fade-in">
              <OnThisDay concerts={concerts} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: 16, marginBottom: 16 }}><ArtistInsights concerts={concerts} /><TheaterMarquee upcoming={upcoming} onAdd={() => setUpcomingModal('new')} onEdit={setUpcomingModal} /><RandomShow concerts={concerts} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: 16, marginBottom: 16 }}><SonicDNA stats={genreStats} onGenreClick={handleGenreClick} /><Card neon><ResponsiveContainer width="100%" height={200}><BarChart data={timelineData}><XAxis dataKey="year" tick={{ fontSize: 8, fill: C.gray }} /><YAxis tick={{ fontSize: 8, fill: C.gray }} /><Bar dataKey="count" fill={C.teal} radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></Card></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}><Card neon><DonutChart fest={headerStats.festDays} solo={headerStats.totalShows - headerStats.festDays} /></Card><Card neon><TopFestBlocks festBreakdown={festBreakdown} /></Card><Card neon><SetlistSpotlight concerts={concerts} onVault={() => setActiveTab('vault')} /></Card></div>
              <NewsTicker concerts={concerts} artistCounts={artistCounts} genreStats={genreStats} />
            </div>
          )}
          {activeTab === 'timeline' && <TimelineTab concerts={concerts} setActiveTab={setActiveTab} genreMap={artistGenres} />}
          {activeTab === 'byDay' && <ByDayTab dayGroups={dayGroups} onEdit={setEditTarget} genreMap={artistGenres} search={search} setSearch={setSearch} yearFilter={yearFilter} setYearFilter={setYearFilter} festFilter={festFilter} setFestFilter={setFestFilter} genreFilter={genreFilter} setGenreFilter={setGenreFilter} concerts={concerts} />}
          {activeTab === 'byFest' && <ByFestTab festGroupings={festGroupings} genreMap={artistGenres} />}
          {activeTab === 'passport' && <PassportTab passport={passport} onNavigateToFest={name => { setActiveTab('byFest'); setTimeout(() => { const el = document.getElementById(`fest-${name.replace(/\s+/g, '-')}`); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 150); }} />}
          {activeTab === 'hof' && <HallOfFame sets={allSetsList} genreMap={artistGenres} onShare={(a, s) => setShareCard({ artist: a, shows: s })} />}
          {activeTab === 'vault' && <SetlistVaultTab concerts={concerts} genreMap={artistGenres} />}
          {activeTab === 'poster' && <PosterGeneratorTab concerts={concerts} genreMap={artistGenres} allSetsList={allSetsList} />}
          {activeTab === 'browse' && <BrowseTab browseView={browseView} setBrowseView={setBrowseView} search={search} setSearch={setSearch} yearFilter={yearFilter} setYearFilter={setYearFilter} festFilter={festFilter} setFestFilter={setFestFilter} genreFilter={genreFilter} setGenreFilter={setGenreFilter} sortCol={sortCol} setSortCol={setSortCol} sortDir={sortDir} setSortDir={setSortDir} paged={paged} page={page} setPage={setPage} totalPages={totalPages} artistRows={artistRows} years={years} onShare={(a, s) => setShareCard({ artist: a, shows: s })} onEdit={setEditTarget} onSetGenre={handleSetGenre} genreMap={artistGenres} />}
          {activeTab === 'manage' && <ManageTab concerts={concerts} onEdit={setEditTarget} onAdd={() => setEditTarget('new')} onDuplicate={handleDuplicate} />}
        </main>
      </div>
    </ThemeContext.Provider>
  );
}