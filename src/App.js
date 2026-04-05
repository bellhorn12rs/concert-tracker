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
  'neon-noir': { name: 'Neon Noir', dot: '#00e5cc', bg:'#0a0a0f', bgCard:'#111118', bgCardAlt:'#16161f', teal:'#00e5cc', tealDim:'#00b5a0', tealGlow:'rgba(0,229,204,0.15)', tealFaint:'rgba(0,229,204,0.07)', cyan:'#00cfff', white:'#f0f4f8', gray:'#8899aa', grayDim:'#445566', border:'#1e2a38', borderLit:'#00e5cc44', red:'#ff4466', green:'#00cc88', gold:'#ffcc00', purple:'#9966ff' },
  'vintage-wax': { name: 'Vintage Wax', dot: '#c8873a', bg:'#1a1008', bgCard:'#231608', bgCardAlt:'#2c1e0d', teal:'#c8873a', tealDim:'#a06828', tealGlow:'rgba(200,135,58,0.15)', tealFaint:'rgba(200,135,58,0.07)', cyan:'#e8a855', white:'#f5ead8', gray:'#9a8060', grayDim:'#5a4030', border:'#3a2810', borderLit:'#c8873a44', red:'#cc3322', green:'#7a9a40', gold:'#e8b840', purple:'#8855aa' },
  'midnight-blue': { name: 'Midnight Blue', dot: '#4488ff', bg:'#040818', bgCard:'#080f28', bgCardAlt:'#0c1535', teal:'#4488ff', tealDim:'#3366cc', tealGlow:'rgba(68,136,255,0.15)', tealFaint:'rgba(68,136,255,0.07)', cyan:'#88ccff', white:'#e8f0ff', gray:'#6688aa', grayDim:'#334466', border:'#1a2a4a', borderLit:'#4488ff44', red:'#ff4455', green:'#44aacc', gold:'#aaccff', purple:'#8866ee' },
  'desert-sun': { name: 'Desert Sun', dot: '#ff7733', bg:'#130a00', bgCard:'#1e1005', bgCardAlt:'#28160a', teal:'#ff7733', tealDim:'#cc5522', tealGlow:'rgba(255,119,51,0.15)', tealFaint:'rgba(255,119,51,0.07)', cyan:'#ffaa55', white:'#fff0e0', gray:'#aa7755', grayDim:'#5a3520', border:'#3a1a08', borderLit:'#ff773344', red:'#ff3322', green:'#88aa33', gold:'#ffcc44', purple:'#cc6633' },
  'monochrome': { name: 'Monochrome', dot: '#ffffff', bg:'#080808', bgCard:'#111111', bgCardAlt:'#1a1a1a', teal:'#ffffff', tealDim:'#bbbbbb', tealGlow:'rgba(255,255,255,0.1)', tealFaint:'rgba(255,255,255,0.05)', cyan:'#dddddd', white:'#ffffff', gray:'#777777', grayDim:'#444444', border:'#2a2a2a', borderLit:'#ffffff33', red:'#ff4444', green:'#aaaaaa', gold:'#ffffff', purple:'#aaaaaa' }
};
const THEME_ORDER = ['neon-noir','vintage-wax','midnight-blue','desert-sun','monochrome'];
let C = { ...THEMES['neon-noir'] };
const ThemeContext = React.createContext({ themeId:'neon-noir', setThemeId:()=>{} });
const useTheme = () => React.useContext(ThemeContext);

// ─── CONFIG & HELPERS ─────────────────────────────────────────────────────────
const HALL_OF_FAME_MIN = 6;
const PER_PAGE = 40;
const GENRES = ['Indie Rock','Alternative','Experimental','Electronic','Jam','Folk','Classic Rock','Pop','Hip Hop','Punk','R&B','Country','Metal','Other'];
const GENRE_COLORS = { 'Indie Rock':'#00f2ff','Alternative':'#9d00ff','Experimental':'#ff00ff','Electronic':'#ff0077','Jam':'#ffcc00','Folk':'#ffaa00','Classic Rock':'#ff4400','Pop':'#00e5ff','Hip Hop':'#a2ff00','Punk':'#ff3300','R&B':'#ff66cc','Country':'#cc8800','Metal':'#888888','Other':'#334455' };

const fmtDate = d => { if (!d) return '—'; const dt = new Date(d + 'T12:00:00'); return `${dt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`; };
const fmtDateShort = d => { if (!d) return '—'; const dt = new Date(d + 'T12:00:00'); return `${dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`; };
const getYear = d => d ? new Date(d + 'T12:00:00').getFullYear() : null;
const daysSince = d => d ? Math.floor((Date.now() - new Date(d + 'T12:00:00')) / 86400000) : 0;

function getConcertGenreInfo(concert, genreMap) {
  const bands = Array.isArray(concert.bands) ? concert.bands : [];
  if (concert.genre) return { genre: concert.genre, color: GENRE_COLORS[concert.genre] || GENRE_COLORS['Other'], mixed: false };
  const genres = [...new Set(bands.map(b => genreMap[b]).filter(Boolean))];
  if (!genres.length) return { genre: null, color: GENRE_COLORS['Other'], mixed: false };
  if (genres.length === 1) return { genre: genres[0], color: GENRE_COLORS[genres[0]] || GENRE_COLORS['Other'], mixed: false };
  return { genre: 'Mixed', color: null, mixed: true, genres };
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const MarqueeStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Monoton&family=Bebas+Neue&family=Space+Mono&family=Caveat:wght@600;700&display=swap');
    body { background-color: #050508; background-image: linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.25) 50%), radial-gradient(rgba(255,255,255,0.05) 1px, transparent 0); background-size: 100% 4px, 32px 32px; background-attachment: fixed; }
    .card-texture { background-image: radial-gradient(circle at 2px 2px, rgba(255,255,255,0.03) 1px, transparent 0); background-size: 8px 8px; }
    .big-watermark { position: absolute; bottom: -15px; right: -10px; font-family: 'Bebas Neue'; font-size: 10rem; color: rgba(255,255,255,0.12); line-height: 0.8; pointer-events: none; z-index: 0; }
    @keyframes peel-and-stick { 0% { transform: translateY(20px) scale(1.1) rotate(-5deg); opacity: 0; } 100% { transform: translateY(0) scale(1) rotate(var(--r)); opacity: 1; } }
    @keyframes tape-slam { 0% { transform: scale(3) translateY(-20px) translateX(-50%); opacity: 0; } 100% { transform: scale(1) translateY(0) translateX(-50%); opacity: 0.8; } }
    .scrap-paper { background: linear-gradient(160deg, #f5f0e8 0%, #e8e0cc 100%); position: relative; border-radius: 2px 5px; }
    @keyframes ticker-scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
    .marquee-text { display: inline-block; padding-left: 100%; animation: marquee 60s linear infinite; }
    @keyframes marquee { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
    .ferris-wheel-ring { animation: ferris-rotate 20s linear infinite; transform-origin: center; }
    @keyframes ferris-rotate { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
    .sticky-year { position: sticky; top: 120px; font-family: 'Bebas Neue'; font-size: 6rem; line-height: 1; writing-mode: vertical-rl; transform: rotate(180deg); color: transparent; -webkit-text-stroke: 1.5px rgba(255,255,255,0.1); }
    .fade-in { animation: fade-in-kf 0.4s ease both; }
    @keyframes fade-in-kf { from{opacity:0; transform:translateY(10px)} to{opacity:1; transform:translateY(0)} }
    .ticket-hover:hover { transform: perspective(1000px) rotateX(2deg) rotateY(-2deg) scale(1.02); }
    .ticket-hover { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
  `}</style>
);

// ─── SHARED UI ATOMS ──────────────────────────────────────────────────────────
const Badge = ({ children, color = C.teal, bg = C.tealFaint }) => (
  <span style={{ display:'inline-block', fontFamily:"'Space Mono'", fontSize:9, letterSpacing:'0.1em', textTransform:'uppercase', color, background:bg, border:`1px solid ${color}44`, padding:'2px 6px', borderRadius:3 }}>{children}</span>
);
const GenreBadge = ({ genre, color, mixed, small = false }) => {
  if (!genre) return null;
  const sz = small ? { fontSize: 7, padding: '1px 5px' } : { fontSize: 8, padding: '2px 7px' };
  const col = color || GENRE_COLORS[genre] || GENRE_COLORS['Other'];
  return <span style={{ ...sz, display: 'inline-block', borderRadius: 3, fontFamily: "'Space Mono'", letterSpacing: '0.08em', textTransform: 'uppercase', color: col, background: hexToRgba(col, 0.12), border: `1px solid ${hexToRgba(col, 0.4)}` }}>{genre}</span>;
};
const Card = ({ children, style = {}, glow = false, neon = false, genreColor = null, onClick }) => {
  const bc = genreColor || (glow ? C.teal : C.border);
  return <div onClick={onClick} style={{ background: C.bgCard, border:`1px solid ${bc}`, borderRadius:8, padding:16, cursor:onClick?'pointer':'default', boxShadow: glow ? `0 0 16px ${C.tealGlow}` : '0 2px 8px rgba(0,0,0,0.4)', position:'relative', ...style }}>{children}</div>;
};
const CardTitle = ({ children, style = {} }) => (
  <div style={{ fontFamily:"'Space Mono'", fontSize:9, letterSpacing:'0.25em', textTransform:'uppercase', color:C.tealDim, marginBottom:12, paddingBottom:8, borderBottom:`1px solid ${C.border}`, ...style }}>{children}</div>
);
const Btn = ({ children, onClick, variant = 'primary', style = {}, disabled = false }) => {
  const V = { primary:{ background:C.teal, color:C.bg }, secondary:{ background:C.bgCardAlt, color:C.gray, border:`1px solid ${C.border}` }, danger:{ background:C.red+'22', color:C.red, border:`1px solid ${C.red}44` } };
  return <button onClick={onClick} disabled={disabled} style={{ fontFamily:"'Space Mono'", fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase', border:'none', borderRadius:4, padding:'8px 16px', cursor:disabled?'not-allowed':'pointer', transition:'0.15s', ...V[variant], ...style }}>{children}</button>;
};
function CountUpStat({ value, label, color = C.white }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0; const end = Number(String(value).replace(/,/g,'')); if (!end) return;
    const t = setInterval(() => { start = Math.min(start + Math.ceil(end/40), end); setDisplay(start); if (start >= end) clearInterval(t); }, 20);
    return () => clearInterval(t);
  }, [value]);
  return (<div style={{ textAlign:'center' }}><div style={{ fontFamily:"'Bebas Neue'", fontSize:'2.5rem', color, lineHeight:1 }}>{display.toLocaleString()}</div><div style={{ fontFamily:"'Space Mono'", fontSize:8, color:C.tealDim }}>{label}</div></div>);
}

// ─── DASHBOARD WIDGETS ────────────────────────────────────────────────────────
function TheaterMarquee({ upcoming, onAdd, onEdit }) {
  const text = upcoming.length ? upcoming.map(s => `${s.artist.toUpperCase()} • ${fmtDateShort(s.date).toUpperCase()}`).join('   ★   ') : 'LOUD & LIVE • ALL AGES • ARCHIVE INBOUND';
  return (
    <div style={{ background:'#0a0a0a', borderRadius:8, overflow:'hidden', boxShadow:'0 8px 32px rgba(0,0,0,0.8)' }}>
      <div style={{ background:'#111', padding:'6px', display:'flex', justifyContent:'space-between' }}>
        {Array.from({length:20}).map((_,i) => <div key={i} style={{ width:6, height:6, borderRadius:'50%', background:'#ffdd88', animation:`chasing-bulb 1.5s infinite ${i*0.05}s` }} />)}
      </div>
      <div style={{ background:'#fff', padding:'10px 0', overflow:'hidden' }}><div className="marquee-text" style={{ fontFamily:"'Bebas Neue'", fontSize:18, color:'#111', whiteSpace:'nowrap' }}>{text}</div></div>
      <div style={{ padding:'12px 16px', maxHeight:180, overflowY:'auto' }}>
        <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:8 }}><button onClick={onAdd} style={{ background:C.gold, fontSize:8, fontWeight:900, padding:'4px 10px', borderRadius:4, cursor:'pointer', border:'none' }}>+ ADD</button></div>
        {upcoming.map(s => <div key={s.id} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid #222' }}><span style={{ fontSize:9, color:C.gold }}>{s.artist}</span><button onClick={()=>onEdit(s)} style={{ fontSize:7, background:'none', color:C.gray, border:'none', cursor:'pointer' }}>EDIT</button></div>)}
      </div>
    </div>
  );
}

const SpotlightScrap = ({ data, isTop, TAPE_COLORS }) => {
  if (!data) return null;
  const charCode = data.id?.charCodeAt(data.id.length - 1) || 0;
  const r = isTop ? (charCode % 4) - 3 : (charCode % 4) + 1;
  const tapeColor = TAPE_COLORS[charCode % TAPE_COLORS.length];
  const hasImg = data.image_url && data.image_url.trim() !== "";

  return (
    <div style={{ flex: 1, position: 'relative', transform: `rotate(${r}deg)`, animation: 'peel-and-stick 0.8s forwards', '--r': `${r}deg` }}>
      <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', width: 46, height: 16, background: tapeColor, opacity: 0.8, borderRadius: 1, zIndex: 10, animation: 'tape-slam 0.4s 0.6s both' }} />
      {hasImg ? (
        <div style={{ background: '#fff', padding: '5px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', borderRadius: 2 }}>
          <div style={{ padding: '8px 4px 2px', textAlign: 'center' }}><div style={{ fontFamily: "'Caveat', cursive", fontSize: '2.2rem', fontWeight: 700, color: '#111', lineHeight: 0.8 }}>{data.band}</div></div>
          <div style={{ background: '#000', margin: '8px 0', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={data.image_url} alt={data.band} style={{ width: '100%', maxHeight: '220px', objectFit: 'contain' }} />
          </div>
          <div style={{ padding: '4px 8px 10px', fontFamily: "'Caveat', cursive", color: '#2a2a4e' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{data.venue}</div>
            <div style={{ fontSize: '1rem', opacity: 0.8 }}>{fmtDateShort(data.date)}</div>
          </div>
        </div>
      ) : (
        <div className="scrap-paper" style={{ padding: '22px 16px 14px', border: '1px solid rgba(0,0,0,0.1)', minHeight: 120 }}>
           <div style={{ fontFamily: "'Caveat', cursive", fontSize: '2rem', fontWeight: 700, color: '#1a1a2e' }}>{data.band}</div>
           <div style={{ fontFamily: "'Caveat', cursive", fontSize: '1rem', color: '#5a5a7e' }}>{data.venue} • {fmtDateShort(data.date)}</div>
        </div>
      )}
    </div>
  );
};

function SetlistSpotlight({ concerts, onVault }) {
  const [topIdx, setTopIdx] = useState(0); const [botIdx, setBotIdx] = useState(1);
  const vault = useMemo(() => concerts.filter(c => c.has_setlist || c.has_setlist_names?.trim()), [concerts]);
  const TAPE_COLORS = ['#ffcc00', '#00e5cc', '#9966ff', '#ff4466', '#00cfff'];
  const slides = useMemo(() => {
    if (!vault.length) return [];
    return [...vault].sort((a,b) => b.date.localeCompare(a.date)).slice(0, 20).map(s => ({
      id: s.id, band: s.has_setlist_names?.split(',')[0]?.trim() || s.bands?.[0] || '?', date: s.date, venue: s.venue, image_url: s.image_url,
      sfmUrl: `https://www.setlist.fm/search?query=${encodeURIComponent(s.bands?.[0])}`
    }));
  }, [vault]);
  useEffect(() => {
    if (slides.length < 2) return;
    const t = setInterval(() => { setTopIdx(p => (p + 2) % slides.length); setBotIdx(p => (p + 1) % slides.length); }, 7000);
    return () => clearInterval(t);
  }, [slides.length]);
  if (!slides.length) return null;
  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column' }} onClick={onVault}>
      <div style={{ fontFamily:"'Space Mono'", fontSize:8, color:C.gold, letterSpacing:3, marginBottom:15, textAlign:'center', opacity:0.4 }}>📋 BACKSTAGE LOG</div>
      <div style={{ flex:1, display:'flex', flexDirection:'row', gap:12, alignItems:'flex-start' }}>
        <SpotlightScrap key={`L-${topIdx}`} data={slides[topIdx % slides.length]} isTop={true} TAPE_COLORS={TAPE_COLORS} />
        <SpotlightScrap key={`R-${botIdx}`} data={slides[botIdx % slides.length]} isTop={false} TAPE_COLORS={TAPE_COLORS} />
      </div>
    </div>
  );
}

function ArtistInsights({ concerts }) {
  const [idx, setIdx] = useState(0);
  const insights = useMemo(() => {
    if (!concerts.length) return [];
    const yrMap = {}; concerts.forEach(c => { const y=getYear(c.date); if(y) yrMap[y]=(yrMap[y]||0)+1; });
    const peak = Object.entries(yrMap).sort((a,b)=>b[1]-a[1])[0];
    const festPct = Math.round((concerts.filter(c=>c.is_festival).length/concerts.length)*100);
    return [
      { l:'PEAK INTENSITY', v:peak?.[0], s:`Busiest year on record with ${peak?.[1]} shows logged.` },
      { l:'FESTIVAL RATIO', v:`${festPct}%`, s:`A significant portion of your history happened in a field.` },
      { l:'TOTAL SHOWS', v:concerts.length, s:`Unique show days logged across your history.` }
    ];
  }, [concerts]);
  useEffect(() => { const t = setInterval(() => setIdx(p=>(p+1)%insights.length), 6000); return ()=>clearInterval(t); }, [insights.length]);
  const active = insights[idx] || {l:'...', v:'...', s:'...'};
  return (
    <Card neon style={{ minHeight: 220, overflow:'hidden' }}>
      <div className="big-watermark">{active.l.split(' ')[0]}</div>
      <div style={{ background: C.teal, color: C.bg, fontSize: 9, padding: '4px 8px', width:'fit-content', fontWeight:900, marginBottom:15 }}>⚡ {active.l}</div>
      <div className="fade-in" key={idx}>
        <div style={{ fontFamily:"'Bebas Neue'", fontSize:'4rem', color:C.white, lineHeight:0.9, marginBottom:10 }}>{active.v}</div>
        <div style={{ fontSize:14, color:C.white, fontFamily:"'Space Mono'", borderLeft:`2px solid ${C.teal}44`, paddingLeft:12 }}>{active.s}</div>
      </div>
    </Card>
  );
}

function RandomShow({ concerts }) {
  const [show, setShow] = useState(null);
  useEffect(() => { if (concerts.length && !show) setShow(concerts[Math.floor(Math.random()*concerts.length)]); }, [concerts]);
  if (!show) return null;
  return (
    <Card neon style={{ minHeight: 220, overflow:'hidden' }}>
      <div className="big-watermark">{getYear(show.date)}</div>
      <div style={{ fontSize:8, color:C.purple, fontWeight:700, marginBottom:15 }}>🎲 RANDOM RECALL</div>
      <div style={{ background:C.white, color:C.bg, fontFamily:"'Bebas Neue'", fontSize:'1.2rem', padding:'0 8px', width:'fit-content', marginBottom:10 }}>{getYear(show.date)}</div>
      <div style={{ fontFamily:"'Bebas Neue'", fontSize:'2rem', color:C.white, lineHeight:1 }}>{show.bands?.[0] || show.artist}</div>
      <div style={{ fontSize:10, color:C.purple, marginTop:10, fontFamily:"'Space Mono'" }}>📍 {show.venue}</div>
    </Card>
  );
}

function SonicDNA({ stats, onGenreClick }) {
  return (
    <Card neon>
      <CardTitle>Sonic DNA 🧬</CardTitle>
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {stats.slice(0,8).map((g,i) => (
          <div key={i} onClick={()=>onGenreClick(g.name)} style={{ position:'relative', height:24, background:'#111', borderRadius:4, overflow:'hidden', cursor:'pointer' }}>
            <div style={{ position:'absolute', left:0, top:0, bottom:0, width:`${(g.count/(stats[0]?.count||1))*100}%`, background:g.color, opacity:0.8 }} />
            <div style={{ position:'relative', zIndex:1, display:'flex', justifyContent:'space-between', padding:'0 10px', lineHeight:'24px', fontSize:9, fontFamily:"'Space Mono'", color:'#fff' }}>
              <span>{g.name}</span><span>{g.count}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function NewsTicker({ concerts, artistCounts, genreStats }) {
  const text = useMemo(() => {
    if (!concerts.length) return "INITIALIZING FEED...";
    const bits = [`🏆 LEADER: ${artistCounts[0]?.name.toUpperCase()}`, `🧬 DOMINANT: ${genreStats[0]?.name.toUpperCase()}`, `📍 ${concerts.length} SHOW DAYS LOGGED` ];
    return bits.join('   ///   ') + '   ///   ';
  }, [concerts, artistCounts, genreStats]);
  return (
    <div style={{ background:C.bgCard, border:`1px solid ${C.teal}33`, borderRadius:6, overflow:'hidden', marginTop:16, display:'flex' }}>
      <div style={{ background:C.teal, color:C.bg, fontFamily:"'Bebas Neue'", padding:'10px 15px', fontSize:14 }}>FEED</div>
      <div style={{ overflow:'hidden', flex:1, display:'flex', alignItems:'center' }}>
        <div style={{ whiteSpace:'nowrap', animation:'ticker-scroll 60s linear infinite', fontFamily:"'Space Mono'", color:C.teal, fontSize:12 }}>{text + text + text}</div>
      </div>
    </div>
  );
}

function OnThisDay({ concerts }) {
  const today = new Date(), mm = String(today.getMonth()+1).padStart(2,'0'), dd = String(today.getDate()).padStart(2,'0');
  const matches = concerts.filter(c => c.date?.endsWith(`-${mm}-${dd}`));
  if (!matches.length) return null;
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:10, margin:'20px 0' }}>
      <div style={{ fontSize:9, color:C.tealDim, fontFamily:"'Space Mono'" }}>📅 ON THIS DAY</div>
      {matches.map(m => (
        <div key={m.id} style={{ display:'flex', alignItems:'center', gap:15, background:C.bgCard, border:`1px solid ${C.teal}44`, padding:'10px 20px', borderRadius:30, boxShadow:`0 0 15px ${C.tealGlow}` }}>
          <span style={{ fontFamily:"'Bebas Neue'", fontSize:'1.5rem', color:C.teal }}>{getYear(m.date)}</span>
          <span style={{ fontFamily:"'Bebas Neue'", fontSize:'1.2rem', color:C.white }}>{m.bands?.join(', ')}</span>
          <span style={{ fontSize:9, color:C.gray, fontFamily:"'Space Mono'" }}>{m.venue}</span>
        </div>
      ))}
    </div>
  );
}

function DonutChart({ fest, solo }) {
  const total = fest+solo||1, pct = Math.round((fest/total)*100);
  return (
    <div style={{ display:'flex', alignItems:'center', gap:20 }}>
      <svg width={100} height={100} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" fill="none" stroke={C.border} strokeWidth="10" />
        <circle cx="50" cy="50" r="40" fill="none" stroke={C.teal} strokeWidth="10" strokeDasharray={`${pct*2.51} 251`} strokeLinecap="round" transform="rotate(-90 50 50)" />
        <text x="50" y="55" textAnchor="middle" style={{ fontFamily:"'Bebas Neue'", fontSize:20, fill:C.white }}>{pct}%</text>
      </svg>
      <div>
        <div style={{ fontSize:10, color:C.teal }}>{fest} FESTIVAL DAYS</div>
        <div style={{ fontSize:10, color:C.gray }}>{solo} STANDALONE</div>
      </div>
    </div>
  );
}

// ─── MAIN CONTENT TABS ────────────────────────────────────────────────────────
function SetlistVaultTab({ concerts, genreMap }) {
  const setlists = useMemo(() => {
    const results = [];
    concerts.forEach(c => {
      if (!c.has_setlist_names?.trim()) return;
      c.has_setlist_names.split(',').map(b => b.trim()).filter(Boolean).forEach(band => {
        results.push({ id: `${c.id}-${band}`, band, date: c.date, venue: c.venue, image_url: c.image_url });
      });
    });
    return results.sort((a, b) => b.date.localeCompare(a.date));
  }, [concerts]);

  if (!setlists.length) return <div style={{ padding:'80px 0', textAlign:'center' }}><div style={{ fontFamily:"'Bebas Neue'", fontSize:'2rem', color:C.white }}>VAULT IS EMPTY</div></div>;
  const cols = [[], [], []]; setlists.forEach((s, i) => cols[i % 3].push(s));

  return (
    <div style={{ padding: '40px 0' }} className="fade-in">
      <div style={{ textAlign:'center', marginBottom:60 }}><div style={{ fontFamily:"'Bebas Neue'", fontSize:'4rem', color:C.white }}>📋 THE <span style={{ color:C.teal }}>ARCHIVE</span></div></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '40px' }}>
        {cols.map((col, ci) => (
          <div key={ci} style={{ display:'flex', flexDirection:'column' }}>
            {col.map((s, i) => {
              const rot = [-2, 1.5, -1, 2][(i + ci) % 4];
              return (
                <div key={s.id} style={{ position: 'relative', transform: `rotate(${rot}deg)`, marginBottom: 55 }}>
                  <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', width: 56, height: 20, background: '#ffcc00', opacity: 0.85, borderRadius: 2, zIndex: 10 }} />
                  <div style={{ background: '#fff', padding: '6px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', borderRadius: 2, border: '1px solid #ddd', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '12px 8px 4px', textAlign: 'center' }}><div style={{ fontFamily: "'Caveat', cursive", fontSize: '2.8rem', fontWeight: 700, color: '#111', lineHeight: 0.8 }}>{s.band}</div></div>
                    <div style={{ background: '#000', margin: '10px 4px', display:'flex', justifyContent:'center', minHeight: s.image_url ? 0 : 120 }}>
                      {s.image_url ? <img src={s.image_url} alt={s.band} style={{ width: '100%', height: 'auto', display:'block' }} /> : <div style={{ padding:'40px', opacity:0.1, fontSize:'3rem' }}>🎸</div>}
                    </div>
                    <div style={{ padding: '4px 10px 12px', fontFamily:"'Caveat', cursive", color:'#1a1a2e' }}>
                      <div style={{ fontSize:'1.4rem', fontWeight:700 }}>{s.venue}</div>
                      <div style={{ fontSize:'1.1rem', opacity:0.7 }}>{fmtDateShort(s.date)}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function TimelineCard({ item, isLeft, marginTop, onTeleport, genreMap }) {
  const bands = item.bands||[]; const gi = getConcertGenreInfo(item, genreMap);
  const themeColor = gi.mixed ? '#9d00ff' : (gi.color||GENRE_COLORS['Other']);
  return (
    <div onClick={onTeleport} style={{ marginTop, display:'flex', justifyContent:isLeft?'flex-start':'flex-end', alignItems:'center', width:'100%', position:'relative', cursor:'pointer' }}>
      <div style={{ position:'absolute', left:'calc(50% - 6px)', width:12, height:12, borderRadius:'50%', background:themeColor, zIndex:5, border:`2px solid ${C.bg}` }} />
      <div className="ticket-hover" style={{ width:'43%', padding:20, borderRadius:12, background: C.bgCard, border: `1px solid ${C.border}`, borderLeft: isLeft ? `6px solid ${themeColor}` : `1px solid ${C.border}`, borderRight: !isLeft ? `6px solid ${themeColor}` : `1px solid ${C.border}` }}>
        <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:12 }}>
          {bands.map((b,idx) => <span key={idx} style={{ fontFamily: idx===0 ? "'Bebas Neue'" : "'Space Mono'", fontSize: idx===0 ? '2rem' : '0.8rem', color: C.white, lineHeight: 1 }}>{b}{idx < bands.length-1 ? ' •' : ''}</span>)}
        </div>
        <div style={{ paddingTop:12, borderTop:`1px solid ${C.border}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontSize:9, color:C.gray }}>{item.venue?.toUpperCase()}</span>
          <span style={{ fontSize:7, color: themeColor, fontWeight: 700 }}>{daysSince(item.date)} DAYS AGO</span>
        </div>
      </div>
    </div>
  );
}

function TimelineTab({ concerts, setActiveTab, genreMap }) {
  const yearsData = useMemo(() => {
    if (!concerts.length) return [];
    const groups = {}; [...concerts].sort((a,b)=>b.date.localeCompare(a.date)).forEach(s => { const yr = getYear(s.date); if(!groups[yr]) groups[yr]=[]; groups[yr].push(s); });
    return Object.entries(groups).sort((a,b)=>b[0]-a[0]).map(([yr, shows]) => {
      const flow=[]; shows.forEach((s,i) => flow.push({...s, side: i%2===0?'left':'right'}));
      return [yr, flow];
    });
  }, [concerts]);
  const teleport = d => { setActiveTab('byDay'); setTimeout(() => { const el = document.querySelector(`[data-date="${d}"]`); if(el) el.scrollIntoView({behavior:'smooth', block:'center'}); }, 150); };
  return (
    <div style={{ padding:'40px 0 80px', position: 'relative' }}>
      <div style={{ maxWidth:1100, margin:'0 auto', position:'relative' }}>
        <div style={{ position:'absolute', left:'50%', top:0, bottom:0, width:2, background:C.border, transform:'translateX(-50%)', opacity:0.15 }} />
        {yearsData.map(([yr, flow]) => (
          <div key={yr}>
            <div style={{ textAlign:'center', margin:'60px 0' }}><span className="sticky-year" style={{ opacity:0.4 }}>{yr}</span></div>
            {flow.map(s => <TimelineCard key={s.id} item={s} isLeft={s.side === 'left'} marginTop={40} onTeleport={() => teleport(s.date)} genreMap={genreMap} />)}
          </div>
        ))}
      </div>
    </div>
  );
}

function TicketStubCard({ event, onEdit, genreMap }) {
  const bands = event.bands||[]; const gi = getConcertGenreInfo(event, genreMap);
  const borderColor = gi.mixed ? C.teal : (gi.color||C.border);
  return (
    <div className="ticket-hover" onClick={() => onEdit(event)} style={{ display:'flex', marginBottom:10, cursor:'pointer' }}>
      <div style={{ flex:1, background:`linear-gradient(135deg, ${C.bgCard}, ${hexToRgba(borderColor,0.08)})`, border:`1px solid ${borderColor}44`, borderRadius:'6px 0 0 6px', padding:'12px 16px', position:'relative', overflow:'hidden' }}>
        {event.image_url && (
          <div style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%) rotate(3deg)', width:52, height:52, padding:'3px', background:'#fff', boxShadow:'0 4px 10px rgba(0,0,0,0.4)', border:'1px solid #ddd', zIndex:10 }}>
            <img src={event.image_url} alt="Gig" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
          </div>
        )}
        <div style={{ fontFamily:"'Bebas Neue'", fontSize:'1.3rem', color:C.white }}>{fmtDate(event.date)}</div>
        <div style={{ fontFamily:"'Space Mono'", fontSize:8, color:C.gray }}>{event.venue} • {event.city}</div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginTop:8 }}>
          {bands.map((b,i) => <span key={i} style={{ fontFamily:"'Bebas Neue'", fontSize:i===0?'1.1rem':'0.8rem', color:C.white }}>{b}{i < bands.length-1 ? ' • ' : ''}</span>)}
        </div>
        <div style={{ position:'absolute', left:0, top:0, bottom:0, width:3, background:borderColor }} />
      </div>
      <div style={{ width:60, background:hexToRgba(borderColor,0.1), border:`1px solid ${borderColor}44`, borderLeft:'1px dashed #444', borderRadius:'0 6px 6px 0', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ writingMode:'vertical-rl', transform:'rotate(180deg)', fontFamily:"'Space Mono'", fontSize:7, color:borderColor }}>ADMIT ONE</div>
      </div>
    </div>
  );
}

function WristbandCard({ event, genreMap, compact = false }) {
  const wristColor = getConcertGenreInfo(event, genreMap).color || C.teal;
  return (
    <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:6, marginBottom:compact?8:12, overflow:'hidden' }}>
      <div style={{ background:`linear-gradient(90deg,${hexToRgba(wristColor,0.4)},${hexToRgba(wristColor,0.2)})`, borderBottom:`2px solid ${wristColor}`, padding:'7px 16px', display:'flex', justifyContent:'space-between' }}>
        <div style={{ fontFamily:"'Bebas Neue'", color:C.white }}>{fmtDate(event.date)} • {event.festival_name}</div>
        <Badge color={wristColor}>FESTIVAL</Badge>
      </div>
      <div style={{ padding:'10px', display:'flex', flexWrap:'wrap', gap:6 }}>
        {event.bands?.map((b,i) => <div key={i} style={{ background:C.bgCardAlt, padding:'4px 8px', borderRadius:4, fontSize:10, color:C.white, borderLeft:`2px solid ${wristColor}` }}>{b}</div>)}
      </div>
    </div>
  );
}

function ByDayTab({ dayGroups, onEdit, genreMap }) {
  return (
    <div style={{ padding: '24px 0' }} className="fade-in">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {dayGroups.map(s => (
          <div key={s.id} data-date={s.date}>
            {s.is_festival ? <WristbandCard event={s} genreMap={genreMap} /> : <TicketStubCard event={s} onEdit={onEdit} genreMap={genreMap} />}
          </div>
        ))}
      </div>
    </div>
  );
}

function ManageTab({ concerts, onEdit, onAdd }) {
  return (
    <div style={{ marginTop:20 }}>
      <Btn onClick={onAdd} style={{ marginBottom:20 }}>+ ADD NEW SHOW</Btn>
      <div style={{ display:'grid', gap:10 }}>
        {concerts.slice(0,30).map(c => <div key={c.id} onClick={()=>onEdit(c)} style={{ background:C.bgCard, padding:15, borderRadius:8, cursor:'pointer', display:'flex', justifyContent:'space-between', border:`1px solid ${C.border}` }}><span>{fmtDateShort(c.date)} - {c.bands?.join(', ')}</span><span>✎</span></div>)}
      </div>
    </div>
  );
}

function EditModal({ concert, onClose, onSave, onDelete }) {
  const [form, setForm] = useState({ date: concert?.date || '', bands: (concert?.bands || []).join(', '), venue: concert?.venue || '', city: concert?.city || '', state: concert?.state || '', is_festival: concert?.is_festival || false, festival_name: concert?.festival_name || '', has_setlist_names: concert?.has_setlist_names || '', genre: concert?.genre || '', image_url: concert?.image_url || '' });
  const [saving, setSaving] = useState(false);
  const handleSave = async () => { setSaving(true); await onSave(concert?.id, { ...form, bands: form.bands.split(',').map(b=>b.trim()).filter(Boolean) }); setSaving(false); };
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, backdropFilter: 'blur(4px)' }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: C.bgCard, border: `1px solid ${C.teal}`, borderRadius: 10, padding: 24, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}>
        <h2 style={{ fontFamily:"'Bebas Neue'", color:C.teal }}>{concert?.id ? 'EDIT SHOW' : 'ADD SHOW'}</h2>
        <div style={{ display:'grid', gap:12, marginTop:20 }}>
          <input style={inputSt} type="date" value={form.date} onChange={e=>setForm({...form, date:e.target.value})} />
          <input style={inputSt} placeholder="Artists (comma separated)" value={form.bands} onChange={e=>setForm({...form, bands:e.target.value})} />
          <input style={inputSt} placeholder="Venue" value={form.venue} onChange={e=>setForm({...form, venue:e.target.value})} />
          <input style={inputSt} placeholder="Gig Photo URL (Imgur link)" value={form.image_url} onChange={e=>setForm({...form, image_url:e.target.value})} />
          <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:20 }}>
             <Btn variant="secondary" onClick={onClose}>CANCEL</Btn>
             <Btn onClick={handleSave} disabled={saving}>{saving?'SAVING...':'SAVE'}</Btn>
          </div>
        </div>
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
  const [activeTab, setActiveTab] = useState('dashboard'), [editTarget, setEditTarget] = useState(null), [search, setSearch] = useState(''), [yearFilter, setYearFilter] = useState('all'), [festFilter, setFestFilter] = useState('all');

  useEffect(() => { 
    const init = async () => { 
      setLoading(true); 
      const [c, u, g] = await Promise.all([
        supabase.from('concerts').select('*').order('date', { ascending: false }),
        supabase.from('upcoming_concerts').select('*').order('date', { ascending: true }),
        supabase.from('artist_genres').select('*')
      ]);
      if (c.data) setConcerts(c.data);
      if (u.data) setUpcoming(u.data);
      if (g.data) { const gm = {}; g.data.forEach(r => gm[r.artist_name] = r.genre); setArtistGenres(gm); }
      setLoading(false);
    }; 
    init(); 
  }, []);

  const years = useMemo(() => [...new Set(concerts.map(c => getYear(c.date)).filter(Boolean))].sort(), [concerts]);
  const headerStats = useMemo(() => ({ totalShows: concerts.length, totalSets: concerts.reduce((acc, c) => acc + (c.bands?.length || 1), 0), uniqueArtists: new Set(concerts.flatMap(c => c.bands || [])).size, festDays: concerts.filter(c => c.is_festival).length, setlistCount: concerts.filter(c => c.has_setlist || c.has_setlist_names).length }), [concerts]);
  const genreStats = useMemo(() => { const counts = {}; concerts.forEach(c => { const g = c.genre || 'Other'; counts[g] = (counts[g] || 0) + 1; }); return Object.entries(counts).map(([name, count]) => ({ name, count, color: GENRE_COLORS[name] || GENRE_COLORS['Other'] })).sort((a, b) => b.count - a.count); }, [concerts]);
  const timelineData = useMemo(() => { const m = {}; concerts.forEach(c => { const y = getYear(c.date); if (y) m[y] = (m[y] || 0) + 1; }); return Object.entries(m).sort((a,b)=>+a[0]-+b[0]).map(([year, count]) => ({ year: year.slice(2), count })); }, [concerts]);
  const artistCounts = useMemo(() => { const m = {}; concerts.flatMap(c => c.bands || []).forEach(b => { m[b] = (m[b] || 0) + 1; }); return Object.entries(m).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count })); }, [concerts]);

  const dayGroups = useMemo(() => {
    let d = concerts;
    if (yearFilter !== 'all') d = d.filter(r => getYear(r.date) === +yearFilter);
    if (festFilter === 'fest') d = d.filter(r => r.is_festival);
    if (festFilter === 'solo') d = d.filter(r => !r.is_festival);
    if (search) { const q = search.toLowerCase(); d = d.filter(r => (r.bands || []).some(b => b.toLowerCase().includes(q)) || (r.venue || '').toLowerCase().includes(q)); }
    return d.sort((a, b) => b.date.localeCompare(a.date));
  }, [concerts, yearFilter, festFilter, search]);

  async function handleSave(id, payload) { if (id) await supabase.from('concerts').update(payload).eq('id', id); else await supabase.from('concerts').insert([payload]); const {data} = await supabase.from('concerts').select('*').order('date', {ascending:false}); setConcerts(data); setEditTarget(null); }
  async function handleUpcomingSave(id, payload) { if (id) await supabase.from('upcoming_concerts').update(payload).eq('id', id); else await supabase.from('upcoming_concerts').insert([payload]); const {data} = await supabase.from('upcoming_concerts').select('*').order('date',{ascending:true}); setUpcoming(data); setEditTarget(null); }
  
  if (loading) return <div style={{ background: C.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue'", fontSize: '2rem', color: C.teal }}>LOADING</div>;

  return (
    <ThemeContext.Provider value={themeCtx}>
      <div key={themeId} style={{ background: C.bg, minHeight: '100vh', paddingBottom: 60 }}>
        <MarqueeStyles />
        {editTarget && <EditModal concert={editTarget === 'new' ? null : editTarget} onClose={() => setEditTarget(null)} onSave={handleSave} onDelete={() => {}} />}
        
        <div style={{ background: `linear-gradient(180deg,#050508 0%,${C.bgCard} 100%)`, borderBottom: `1px solid ${C.teal}22`, padding: '36px 24px 0', textAlign: 'center' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <h1 style={{ fontFamily: "'Bebas Neue'", fontSize: '4rem', color: C.white, margin: '0 0 8px', lineHeight: 1 }}>🎸 LIVE <span style={{ color: C.teal }}>IN CONCERT</span></h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 0, borderTop: `1px solid ${C.border}`, marginTop:20 }}>
              {[{ v: headerStats.totalSets, l: 'SETS' }, { v: headerStats.uniqueArtists, l: 'ARTISTS' }, { v: headerStats.totalShows, l: 'DAYS' }, { v: headerStats.setlistCount, l: 'SETLISTS', click: () => setActiveTab('vault') }].map((s, i) => (
                <div key={i} onClick={s.click} style={{ padding: '20px 16px', textAlign: 'center', cursor: s.click ? 'pointer' : 'default', borderRight: i < 3 ? `1px solid ${C.border}` : 'none' }}>
                  <CountUpStat value={s.v} label={s.l} color={C.teal} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <nav style={{ background: C.bgCard, borderBottom: `1px solid ${C.teal}22`, display: 'flex', position: 'sticky', top: 0, zIndex: 200, overflowX:'auto' }}>
          {['dashboard','timeline','byDay','vault','manage'].map(id => (
            <button key={id} onClick={() => setActiveTab(id)} style={{ fontFamily: "'Space Mono'", fontSize: 10, color: activeTab === id ? C.teal : C.gray, background: 'none', border: 'none', padding: '15px 20px', cursor: 'pointer', borderBottom: activeTab === id ? `2px solid ${C.teal}` : 'none', textTransform:'uppercase' }}>{id}</button>
          ))}
          <div style={{ marginLeft:'auto', padding:'0 15px', display:'flex', alignItems:'center' }}><ThemeSwitcher /></div>
        </nav>

        <main style={{ maxWidth: 1300, margin: '20px auto', padding: '24px', background: hexToRgba(C.bgCard, 0.7), border: `1px solid ${C.border}`, borderRadius: '16px', backdropFilter: 'blur(12px)', minHeight: '80vh' }}>
          {activeTab === 'dashboard' && (
            <div className="fade-in">
              <OnThisDay concerts={concerts} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: 16, marginBottom: 16 }}>
                <ArtistInsights concerts={concerts} />
                <TheaterMarquee upcoming={upcoming} onAdd={() => setEditTarget('new')} onEdit={setEditTarget} />
                <RandomShow concerts={concerts} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: 16, marginBottom: 16 }}>
                <SonicDNA stats={genreStats} onGenreClick={(g) => {setGenreFilter(g); setActiveTab('byDay');}} />
                <Card neon><CardTitle>Sets Per Year</CardTitle><ResponsiveContainer width="100%" height={200}><BarChart data={timelineData}><XAxis dataKey="year" tick={{ fontSize: 8, fill: C.gray }} /><YAxis tick={{ fontSize: 8, fill: C.gray }} /><Bar dataKey="count" fill={C.teal} radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></Card>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 2fr', gap: 16 }}>
                <Card neon><CardTitle>Type</CardTitle><DonutChart fest={headerStats.festDays} solo={headerStats.totalShows - headerStats.festDays} /></Card>
                <Card neon><CardTitle>Top Artists</CardTitle>{artistCounts.slice(0,5).map(a => <div key={a.name} style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:C.white, marginBottom:6 }}><span>{a.name}</span><span style={{ color:C.teal }}>{a.count}x</span></div>)}</Card>
                <Card neon><SetlistSpotlight concerts={concerts} onVault={() => setActiveTab('vault')} /></Card>
              </div>
              <NewsTicker concerts={concerts} artistCounts={artistCounts} genreStats={genreStats} />
            </div>
          )}
          {activeTab === 'timeline' && <TimelineTab concerts={concerts} setActiveTab={setActiveTab} genreMap={artistGenres} />}
          {activeTab === 'byDay' && (
             <div className="fade-in">
               <div style={{ display:'flex', gap:10, marginBottom:15 }}>
                 <input placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)} style={{...inputSt, flex:1}} />
                 <select value={yearFilter} onChange={e=>setYearFilter(e.target.value)} style={inputSt}><option value="all">All Years</option>{years.map(y=><option key={y} value={y}>{y}</option>)}</select>
               </div>
               <ByDayTab dayGroups={dayGroups} onEdit={setEditTarget} genreMap={artistGenres} />
             </div>
          )}
          {activeTab === 'vault' && <SetlistVaultTab concerts={concerts} genreMap={artistGenres} />}
          {activeTab === 'manage' && <ManageTab concerts={concerts} onEdit={setEditTarget} onAdd={() => setEditTarget('new')} />}
        </main>
      </div>
    </ThemeContext.Provider>
  );
}

// ─── THEME SWITCHER ───────────────────────────────────────────────────────────
function ThemeSwitcher() {
  const { themeId, setThemeId } = useTheme();
  const [open, setOpen] = useState(false);
  const current = THEMES[themeId];
  return (
    <div style={{ position:'relative' }}>
      <button onClick={() => setOpen(!open)} style={{ background:'none', border:`1px solid ${C.border}`, borderRadius:20, padding:'5px 12px', cursor:'pointer', display:'flex', alignItems:'center', gap:8 }}>
        <div style={{ width:8, height:8, borderRadius:'50%', background:current.dot }} />
        <span style={{ fontSize:8, color:C.gray, textTransform:'uppercase' }}>{current.name}</span>
      </button>
      {open && (
        <div style={{ position:'absolute', bottom:'100%', right:0, background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:8, padding:8, zIndex:300, minWidth:120 }}>
          {THEME_ORDER.map(id => <button key={id} onClick={() => { setThemeId(id); setOpen(false); }} style={{ display:'block', width:'100%', padding:'6px', background:'none', border:'none', color:themeId===id?C.teal:C.gray, cursor:'pointer', textAlign:'left', fontSize:9 }}>{THEMES[id].name}</button>)}
        </div>
      )}
    </div>
  );
}