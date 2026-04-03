import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { supabase } from './supabaseClient';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

// ─── UTILITY ──────────────────────────────────────────────────────────────────
function hexToRgba(hex, alpha) {
  if (!hex || typeof hex !== 'string' || hex.length < 7) return `rgba(255,255,255,${alpha})`;
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ─── THEME ────────────────────────────────────────────────────────────────────
const C = {
  bg:'#0a0a0f', bgCard:'#111118', bgCardAlt:'#16161f',
  teal:'#00e5cc', tealDim:'#00b5a0', tealGlow:'rgba(0,229,204,0.15)', tealFaint:'rgba(0,229,204,0.07)',
  cyan:'#00cfff', white:'#f0f4f8', gray:'#8899aa', grayDim:'#445566',
  border:'#1e2a38', borderLit:'#00e5cc44', red:'#ff4466', green:'#00cc88', gold:'#ffcc00', purple:'#9966ff',
};

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
  if (concert.genre) return { genre:concert.genre, color:GENRE_COLORS[concert.genre]||GENRE_COLORS['Other'], mixed:false };
  const genres = [...new Set(bands.map(b => genreMap[b]).filter(Boolean))];
  if (!genres.length) return { genre:null, color:GENRE_COLORS['Other'], mixed:false };
  if (genres.length===1) return { genre:genres[0], color:GENRE_COLORS[genres[0]]||GENRE_COLORS['Other'], mixed:false };
  return { genre:'Mixed', color:null, mixed:true, genres };
}

const GenreBadge = ({ genre, color, mixed, small=false }) => {
  if (!genre) return null;
  const sz = small ? { fontSize:7, padding:'1px 5px' } : { fontSize:8, padding:'2px 7px' };
  if (mixed) return <span style={{ ...sz, display:'inline-block', borderRadius:3, fontFamily:"'Space Mono',monospace", letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:700, color:'#fff', background:'linear-gradient(90deg,#00f2ff,#9d00ff,#ff00ff,#ff0077,#ffcc00,#ffaa00)' }}>MIXED</span>;
  const col = color || GENRE_COLORS[genre] || GENRE_COLORS['Other'];
  return <span style={{ ...sz, display:'inline-block', borderRadius:3, fontFamily:"'Space Mono',monospace", letterSpacing:'0.08em', textTransform:'uppercase', color:col, background:hexToRgba(col,0.12), border:`1px solid ${hexToRgba(col,0.4)}` }}>{genre}</span>;
};

// ─── DATE HELPERS ─────────────────────────────────────────────────────────────
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const fmtDate = d => {
  if (!d) return '—';
  const dt = new Date(d+'T12:00:00');
  return `${MONTHS[dt.getMonth()]} ${dt.getDate()}, ${dt.getFullYear()}`;
};
const fmtDateShort = d => {
  if (!d) return '—';
  const dt = new Date(d+'T12:00:00');
  return `${MONTHS[dt.getMonth()].slice(0,3)} ${dt.getDate()}, ${dt.getFullYear()}`;
};
const getYear = d => d ? new Date(d+'T12:00:00').getFullYear() : null;

// ─── STYLES ───────────────────────────────────────────────────────────────────
const MarqueeStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Monoton&family=Bebas+Neue&family=Space+Mono&family=Caveat:wght@600;700&display=swap');
    @keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
    @keyframes pulse-teal{0%,100%{box-shadow:0 0 24px rgba(0,229,204,0.15)}50%{box-shadow:0 0 40px rgba(0,229,204,0.35)}}
    @keyframes fade-in-kf{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
    @keyframes float{0%,100%{transform:rotate(var(--r)) translateY(0)}50%{transform:rotate(var(--r)) translateY(-6px)}}
    @keyframes rainbow-border{0%{border-color:#00f2ff;box-shadow:0 0 12px #00f2ff44}25%{border-color:#9d00ff;box-shadow:0 0 12px #9d00ff44}50%{border-color:#ff00ff;box-shadow:0 0 12px #ff00ff44}75%{border-color:#ffcc00;box-shadow:0 0 12px #ffcc0044}100%{border-color:#00f2ff;box-shadow:0 0 12px #00f2ff44}}
    .marquee-text{display:inline-block;padding-left:100%;animation:marquee 30s linear infinite}
    .marquee-letter{font-family:'Bebas Neue',sans-serif;letter-spacing:2px;text-transform:uppercase;color:#ffcc00}
    .fade-in{animation:fade-in-kf 0.35s ease both}
    .row-hover:hover{background:#1c1c28 !important;cursor:pointer}
    .day-card-hover:hover{border-color:#00e5cc44 !important}
    .rainbow-anim{animation:rainbow-border 4s linear infinite}
    .paper-float{animation:float var(--dur,6s) ease-in-out infinite}
  `}</style>
);

// ─── SHARED ATOMS ─────────────────────────────────────────────────────────────
const Badge = ({ children, color=C.teal, bg=C.tealFaint }) => (
  <span style={{ display:'inline-block', fontFamily:"'Space Mono',monospace", fontSize:9, letterSpacing:'0.1em', textTransform:'uppercase', color, background:bg, border:`1px solid ${color}44`, padding:'2px 6px', borderRadius:3 }}>{children}</span>
);

const NEON_BORDERS = [
  {border:C.teal,glow:'rgba(0,229,204,0.18)'},{border:C.cyan,glow:'rgba(0,207,255,0.18)'},
  {border:C.purple,glow:'rgba(153,102,255,0.18)'},{border:C.gold,glow:'rgba(255,204,0,0.18)'},
  {border:C.green,glow:'rgba(0,204,136,0.18)'},{border:'#ff6699',glow:'rgba(255,102,153,0.18)'},
];
let _cardIdx = 0;

const Card = ({ children, style={}, glow=false, neon=false, genreColor=null, onClick }) => {
  const nb = neon && !genreColor ? NEON_BORDERS[_cardIdx++%NEON_BORDERS.length] : null;
  const bc = genreColor||(glow?C.teal:neon?nb.border:C.border);
  const gc = genreColor?hexToRgba(genreColor,0.2):glow?C.tealGlow:neon?nb?.glow:null;
  return (
    <div onClick={onClick} style={{ background:genreColor?`linear-gradient(135deg,${C.bgCard},${hexToRgba(genreColor,0.07)})`:C.bgCard, border:`1px solid ${bc}`, borderRadius:8, padding:16, cursor:onClick?'pointer':'default', boxShadow:gc?`0 0 16px ${gc},0 2px 8px rgba(0,0,0,0.4)`:'0 2px 8px rgba(0,0,0,0.4)', ...style }}>{children}</div>
  );
};

const CardTitle = ({ children, style={} }) => (
  <div style={{ fontFamily:"'Space Mono',monospace", fontSize:9, letterSpacing:'0.25em', textTransform:'uppercase', color:C.tealDim, marginBottom:12, paddingBottom:8, borderBottom:`1px solid ${C.border}`, ...style }}>{children}</div>
);

const Btn = ({ children, onClick, variant='primary', style={}, disabled=false }) => {
  const V = { primary:{background:C.teal,color:C.bg}, secondary:{background:C.bgCardAlt,color:C.gray,border:`1px solid ${C.border}`}, danger:{background:C.red+'22',color:C.red,border:`1px solid ${C.red}44`}, ghost:{background:'transparent',color:C.teal,border:`1px solid ${C.borderLit}`} };
  return <button onClick={onClick} disabled={disabled} style={{ fontFamily:"'Space Mono',monospace", fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase', border:'none', borderRadius:4, padding:'8px 16px', cursor:disabled?'not-allowed':'pointer', opacity:disabled?0.5:1, transition:'all 0.15s', ...V[variant], ...style }}>{children}</button>;
};

const inputSt = { background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:4, padding:'7px 10px', color:C.white, fontSize:'0.85rem', outline:'none' };

// ─── UPCOMING MODAL ───────────────────────────────────────────────────────────
function UpcomingModal({ show, onClose, onSave, onDelete }) {
  const isNew = !show?.id;
  const [form, setForm] = useState({ artist:show?.artist||'', venue:show?.venue||'', date:show?.date||'', status:show?.status||'TICKETS BOUGHT' });
  const [saving, setSaving] = useState(false);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const lbl = { display:'block', fontFamily:"'Space Mono',monospace", fontSize:8, letterSpacing:'0.15em', textTransform:'uppercase', color:C.tealDim, marginBottom:4 };
  const inp = {...inputSt, width:'100%'};
  const handleSave = async () => {
    if (!form.artist||!form.date) return alert('Artist and date required.');
    setSaving(true); await onSave(show?.id,form); setSaving(false);
  };
  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:1100,display:'flex',alignItems:'center',justifyContent:'center',padding:20,backdropFilter:'blur(4px)' }} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="fade-in" style={{ background:C.bgCard,border:`1px solid ${C.gold}`,borderRadius:10,padding:24,width:'100%',maxWidth:420,boxShadow:'0 0 40px rgba(255,204,0,0.2)' }}>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20 }}>
          <div style={{ fontFamily:"'Bebas Neue'",fontSize:'1.4rem',color:C.gold }}>{isNew?'Add Upcoming Show':'Edit Upcoming Show'}</div>
          <button onClick={onClose} style={{ background:'none',border:'none',color:C.gray,fontSize:'1.2rem',cursor:'pointer' }}>✕</button>
        </div>
        <div style={{ marginBottom:14 }}><label style={lbl}>Artist *</label><input style={inp} value={form.artist} onChange={e=>set('artist',e.target.value)} placeholder="Band or Artist" /></div>
        <div style={{ marginBottom:14 }}><label style={lbl}>Venue</label><input style={inp} value={form.venue} onChange={e=>set('venue',e.target.value)} placeholder="Venue name" /></div>
        <div style={{ marginBottom:14 }}><label style={lbl}>Date *</label><input style={{...inp,colorScheme:'dark'}} type="date" value={form.date} onChange={e=>set('date',e.target.value)} /></div>
        <div style={{ marginBottom:20 }}>
          <label style={lbl}>Ticket Status</label>
          <select style={inp} value={form.status} onChange={e=>set('status',e.target.value)}>
            <option value="TICKETS BOUGHT">Tickets Bought</option>
            <option value="PENDING">Pending</option>
            <option value="DREAMING">Dreaming</option>
          </select>
        </div>
        <div style={{ display:'flex',justifyContent:'space-between',gap:8 }}>
          <div>{!isNew&&<Btn variant="danger" onClick={()=>onDelete(show.id)}>Delete</Btn>}</div>
          <div style={{ display:'flex',gap:8 }}>
            <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
            <Btn onClick={handleSave} disabled={saving} style={{ background:C.gold,color:'#000' }}>{saving?'Saving...':'Save'}</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── EDIT MODAL ───────────────────────────────────────────────────────────────
function EditModal({ concert, onClose, onSave, onDelete }) {
  const [form, setForm] = useState({
    date:concert?.date||'', bands:(concert?.bands||[]).join(', '), venue:concert?.venue||'',
    city:concert?.city||'', state:concert?.state||'', is_festival:concert?.is_festival||false,
    festival_name:concert?.festival_name||'', festival_day:concert?.festival_day||'',
    has_setlist_names:concert?.has_setlist_names||'', genre:concert?.genre||'',
  });
  const [saving,setSaving]=useState(false), [confirming,setConfirming]=useState(false);
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const handleSave=async()=>{ setSaving(true); const bandList=form.bands.split(',').map(b=>b.trim()).filter(Boolean); await onSave(concert?.id,{...form,bands:bandList,has_setlist:!!(form.has_setlist_names?.trim())}); setSaving(false); };
  const lbl={display:'block',fontFamily:"'Space Mono',monospace",fontSize:8,letterSpacing:'0.15em',textTransform:'uppercase',color:C.tealDim,marginBottom:4};
  const inp={...inputSt,width:'100%'};
  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20,backdropFilter:'blur(4px)' }} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="fade-in" style={{ background:C.bgCard,border:`1px solid ${C.teal}`,borderRadius:10,padding:24,width:'100%',maxWidth:520,maxHeight:'90vh',overflowY:'auto',boxShadow:`0 0 40px ${C.tealGlow}` }}>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20 }}>
          <div style={{ fontFamily:"'Bebas Neue'",fontSize:'1.4rem',color:C.teal }}>{concert?.id?'Edit Show':'Add Show'}</div>
          <button onClick={onClose} style={{ background:'none',border:'none',color:C.gray,fontSize:'1.2rem',cursor:'pointer' }}>✕</button>
        </div>
        <div style={{ marginBottom:14 }}><label style={lbl}>Date</label><input style={inp} type="date" value={form.date} onChange={e=>set('date',e.target.value)} /></div>
        <div style={{ marginBottom:14 }}><label style={lbl}>Artists (comma separated)</label><input style={inp} value={form.bands} onChange={e=>set('bands',e.target.value)} /></div>
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:14 }}>
          <div><label style={lbl}>Venue</label><input style={inp} value={form.venue} onChange={e=>set('venue',e.target.value)} /></div>
          <div><label style={lbl}>City</label><input style={inp} value={form.city} onChange={e=>set('city',e.target.value)} /></div>
        </div>
        <div style={{ marginBottom:14 }}><label style={lbl}>State</label><input style={{...inp,width:80}} value={form.state} onChange={e=>set('state',e.target.value)} maxLength={2} /></div>
        <div style={{ marginBottom:14 }}>
          <label style={lbl}>Genre</label>
          <select style={inp} value={form.genre} onChange={e=>set('genre',e.target.value)}>
            <option value="">— unset —</option>
            {GENRES.map(g=><option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div style={{ marginBottom:14,display:'flex',alignItems:'center',gap:10 }}>
          <input type="checkbox" id="is_fest" checked={form.is_festival} onChange={e=>set('is_festival',e.target.checked)} style={{ accentColor:C.teal,width:16,height:16 }} />
          <label htmlFor="is_fest" style={{...lbl,marginBottom:0,cursor:'pointer'}}>Festival Day</label>
        </div>
        {form.is_festival&&(
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:14 }}>
            <div><label style={lbl}>Festival Name</label><input style={inp} value={form.festival_name} onChange={e=>set('festival_name',e.target.value)} /></div>
            <div><label style={lbl}>Day Label</label><input style={inp} value={form.festival_day} onChange={e=>set('festival_day',e.target.value)} /></div>
          </div>
        )}
        <div style={{ marginBottom:14 }}><label style={lbl}>Setlists Obtained (band names, comma separated)</label><input style={inp} value={form.has_setlist_names} onChange={e=>set('has_setlist_names',e.target.value)} /></div>
        <div style={{ display:'flex',gap:8,justifyContent:'space-between',marginTop:20 }}>
          <div style={{ display:'flex',gap:8 }}>
            {concert?.id&&!confirming&&<Btn variant="danger" onClick={()=>setConfirming(true)}>Delete</Btn>}
            {confirming&&<><Btn variant="danger" onClick={()=>onDelete(concert.id)}>Confirm</Btn><Btn variant="secondary" onClick={()=>setConfirming(false)}>Cancel</Btn></>}
          </div>
          <div style={{ display:'flex',gap:8 }}><Btn variant="secondary" onClick={onClose}>Cancel</Btn><Btn onClick={handleSave} disabled={saving}>{saving?'Saving...':'Save'}</Btn></div>
        </div>
      </div>
    </div>
  );
}

// ─── SHARE CARD ───────────────────────────────────────────────────────────────
function ShareCard({ artist, shows, onClose }) {
  const festCount=shows.filter(s=>s.is_festival).length;
  const cities=[...new Set(shows.map(s=>s.city).filter(Boolean))];
  const years=[...new Set(shows.map(s=>getYear(s.date)).filter(Boolean))].sort();
  const firstDate=fmtDate(shows[shows.length-1]?.date), lastDate=fmtDate(shows[0]?.date);
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
          <div style={{ display:'flex',flexWrap:'wrap',gap:3,marginBottom:12 }}>
            {years.map(y=><span key={y} style={{ fontFamily:"'Space Mono',monospace",fontSize:7,background:`${C.teal}22`,color:C.teal,border:`1px solid ${C.teal}44`,padding:'2px 5px',borderRadius:3 }}>{y}</span>)}
          </div>
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

// ─── ON THIS DAY ──────────────────────────────────────────────────────────────
function OnThisDay({ concerts }) {
  const today=new Date(), mm=String(today.getMonth()+1).padStart(2,'0'), dd=String(today.getDate()).padStart(2,'0');
  const matches=concerts.filter(c=>c.date?.endsWith(`-${mm}-${dd}`)).sort((a,b)=>a.date.localeCompare(b.date));
  if (!matches.length) return null;

  const dateLabel = today.toLocaleDateString('en-US',{month:'long',day:'numeric'});

  return (
    <div style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:8,margin:'16px 0' }}>
      {/* Label sits above the pills, also centered */}
      <div style={{ fontFamily:"'Space Mono',monospace",fontSize:8,letterSpacing:'0.3em',textTransform:'uppercase',color:C.tealDim }}>
        📅 On This Day — {dateLabel}
      </div>

      {matches.map(ev=>{
        const bands=(ev.bands||[]).join(', ');
        const location=[ev.venue,ev.city,ev.state].filter(Boolean).join(', ');
        const year=getYear(ev.date);
        // Build a tight YouTube search query
        const ytQuery=encodeURIComponent(`${bands} ${ev.venue||ev.city} ${year} live`);
        const ytUrl=`https://www.youtube.com/results?search_query=${ytQuery}`;

        return (
          <div key={ev.id} style={{
            display:'inline-flex', alignItems:'center', gap:14,
            background:`linear-gradient(135deg,${C.bgCard},${hexToRgba(C.teal,0.07)})`,
            border:`1px solid ${C.teal}44`,
            borderRadius:40, // pill shape
            padding:'10px 18px 10px 14px',
            boxShadow:`0 0 20px ${C.tealGlow}`,
            animation:'pulse-teal 3s ease-in-out infinite',
          }}>
            {/* Year badge */}
            <div style={{ fontFamily:"'Bebas Neue'",fontSize:'1.6rem',color:C.teal,lineHeight:1,flexShrink:0 }}>{year}</div>

            {/* Divider */}
            <div style={{ width:1,height:28,background:C.border,flexShrink:0 }} />

            {/* Band name */}
            <div style={{ fontFamily:"'Bebas Neue'",fontSize:'1.2rem',letterSpacing:'0.06em',color:C.white,lineHeight:1,flexShrink:0 }}>{bands}</div>

            {/* Divider */}
            <div style={{ width:1,height:28,background:C.border,flexShrink:0 }} />

            {/* Venue + city */}
            <div style={{ fontFamily:"'Space Mono',monospace",fontSize:8,color:C.gray,textTransform:'uppercase',letterSpacing:'0.08em',flexShrink:0 }}>{location}</div>

            {/* YouTube button */}
            <a
              href={ytUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e=>e.stopPropagation()}
              style={{
                display:'inline-flex',alignItems:'center',gap:5,
                background:'rgba(255,0,0,0.15)',border:'1px solid rgba(255,0,0,0.35)',
                borderRadius:20,padding:'4px 10px',textDecoration:'none',
                fontFamily:"'Space Mono',monospace",fontSize:7,letterSpacing:'0.1em',
                textTransform:'uppercase',color:'#ff4444',flexShrink:0,
                transition:'all 0.15s',
              }}
              onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,0,0,0.3)';e.currentTarget.style.borderColor='rgba(255,0,0,0.6)';}}
              onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,0,0,0.15)';e.currentTarget.style.borderColor='rgba(255,0,0,0.35)';}}
            >
              ▶ Search
            </a>
          </div>
        );
      })}
    </div>
  );
}

// ─── SETLIST SPOTLIGHT (dashboard widget) ─────────────────────────────────────
function SetlistSpotlight({ concerts, onVault }) {
  const [index,setIndex]=useState(0);
  const vault=useMemo(()=>concerts.filter(c=>c.has_setlist||c.has_setlist_names?.trim()),[concerts]);
  const slides=useMemo(()=>{
    if (!vault.length) return [{label:'ARCHIVE EMPTY',val:'Start collecting!',sub:'Edit a show to log a setlist',card:null}];
    const sorted=[...vault].sort((a,b)=>b.date.localeCompare(a.date));
    const recent=sorted[0];
    const artCounts={};
    vault.forEach(c=>(c.has_setlist_names||'').split(',').forEach(n=>{ const name=n.trim(); if(name) artCounts[name]=(artCounts[name]||0)+1; }));
    const topArt=Object.entries(artCounts).sort((a,b)=>b[1]-a[1])[0];
    const venCounts={};
    vault.forEach(c=>{ venCounts[c.venue]=(venCounts[c.venue]||0)+1; });
    const topVen=Object.entries(venCounts).sort((a,b)=>b[1]-a[1])[0];
    const makeCard=(c,band)=>({ band:band||c.has_setlist_names?.split(',')[0]||'?', date:c.date, venue:c.venue, city:c.city, state:c.state, genre:c.genre });
    return [
      {label:'LATEST ADDITION',val:recent.has_setlist_names?.split(',')[0]||'Setlist',sub:`${fmtDate(recent.date)} @ ${recent.venue}`,card:makeCard(recent)},
      {label:`${vault.length} SETLISTS COLLECTED`,val:'VIEW VAULT →',sub:'Click to browse your physical setlists',card:makeCard(sorted[Math.floor(Math.random()*sorted.length)])},
      {label:'ARCHIVE MVP',val:topArt?.[0]||'Keep digging!',sub:`${topArt?.[1]||0} setlists from this artist`,card:topArt?makeCard(vault.find(c=>(c.has_setlist_names||'').includes(topArt[0]))||vault[0],topArt[0]):null},
      {label:'LUCKY VENUE',val:topVen?.[0]||'N/A',sub:`${topVen?.[1]||0} setlists here`,card:makeCard(vault.find(c=>c.venue===topVen?.[0])||vault[0])},
    ];
  },[vault]);
  useEffect(()=>{ if(slides.length<=1)return; const t=setInterval(()=>setIndex(p=>(p+1)%slides.length),5500); return()=>clearInterval(t); },[slides.length]);
  const s=slides[index];
  const gc=s.card?.genre?GENRE_COLORS[s.card.genre]:null;
  const TAPE_COLORS=['#ffcc00','#00e5cc','#9966ff','#ff4466'];
  const tapeColor=TAPE_COLORS[index%TAPE_COLORS.length];

  return (
    <div style={{ cursor:'pointer',height:'100%',display:'flex',flexDirection:'column' }} onClick={onVault}>
      <div style={{ fontFamily:"'Space Mono'",fontSize:8,color:C.gold,letterSpacing:2,marginBottom:12,textTransform:'uppercase' }}>{s.label}</div>

      {/* Mini paper card */}
      {s.card&&(
        <div className="fade-in" key={index} style={{ flex:1,position:'relative',transform:`rotate(${['-2deg','1.5deg','-1deg','2.5deg'][index%4]})`,marginBottom:16 }}>
          {/* Tape */}
          <div style={{ position:'absolute',top:-10,left:'50%',transform:'translateX(-50%)',width:48,height:18,background:tapeColor,opacity:0.8,borderRadius:2,zIndex:10 }} />
          {/* Paper */}
          <div style={{ background:'linear-gradient(160deg,#f5f0e8,#e8e0cc)',borderRadius:4,padding:'28px 20px 20px',boxShadow:'0 6px 24px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,255,255,0.6)',position:'relative',overflow:'hidden' }}>
            {[0,1,2,3].map(j=><div key={j} style={{ position:'absolute',left:50,right:0,top:60+j*22,height:1,background:'rgba(150,180,220,0.3)' }} />)}
            <div style={{ position:'absolute',left:44,top:0,bottom:0,width:1,background:'rgba(220,60,60,0.25)' }} />
            {gc&&<div style={{ position:'absolute',top:0,right:0,background:gc,padding:'2px 8px 2px 12px',borderRadius:'0 4px 0 8px',fontFamily:"'Space Mono',monospace",fontSize:6,color:'#000',textTransform:'uppercase',fontWeight:700 }}>{s.card.genre}</div>}
            <div style={{ paddingLeft:14 }}>
              <div style={{ fontFamily:"'Caveat',cursive",fontSize:'1.5rem',fontWeight:700,color:'#1a1a2e',lineHeight:1.1,marginBottom:8 }}>{s.card.band}</div>
              <div style={{ fontFamily:"'Caveat',cursive",fontSize:'0.85rem',color:'#2a2a4e',marginBottom:2 }}>{fmtDate(s.card.date)}</div>
              <div style={{ fontFamily:"'Caveat',cursive",fontSize:'0.8rem',color:'#3a3a5e' }}>{s.card.venue}</div>
              <div style={{ fontFamily:"'Caveat',cursive",fontSize:'0.75rem',color:'#5a5a7e' }}>{[s.card.city,s.card.state].filter(Boolean).join(', ')}</div>
            </div>
          </div>
        </div>
      )}

      <div style={{ fontFamily:"'Bebas Neue'",fontSize:'1rem',color:s.val==='VIEW VAULT →'?C.teal:C.gray,marginBottom:4,textAlign:'center' }}>{s.sub}</div>
      <div style={{ display:'flex',justifyContent:'center',gap:5,marginTop:'auto',paddingTop:8 }}>
        {slides.map((_,i)=><div key={i} style={{ width:4,height:4,borderRadius:'50%',background:i===index?C.gold:C.grayDim,transition:'0.3s' }} />)}
      </div>
    </div>
  );
}

// ─── ARTIST INSIGHTS — 15 data-driven stats ───────────────────────────────────
function ArtistInsights({ concerts }) {
  const [index,setIndex]=useState(0);

  const insights=useMemo(()=>{
    if (!concerts.length) return [];
    const yrMap={};
    concerts.forEach(c=>{ const y=getYear(c.date); if(y) yrMap[y]=(yrMap[y]||0)+1; });
    const peakYear=Object.entries(yrMap).sort((a,b)=>b[1]-a[1])[0];

    const cityMap={};
    concerts.forEach(c=>{ if(c.city) cityMap[c.city]=(cityMap[c.city]||0)+1; });
    const topCity=Object.entries(cityMap).sort((a,b)=>b[1]-a[1])[0];

    const festDays=concerts.filter(c=>c.is_festival).length;
    const festPct=Math.round((festDays/concerts.length)*100);

    const monthMap={};
    concerts.forEach(c=>{ const d=new Date(c.date+'T12:00:00'); if(!isNaN(d)) monthMap[d.getMonth()]=(monthMap[d.getMonth()]||0)+1; });
    const topMonth=Object.entries(monthMap).sort((a,b)=>b[1]-a[1])[0];

    const venueMap={};
    concerts.forEach(c=>{ if(c.venue) venueMap[c.venue]=(venueMap[c.venue]||0)+1; });
    const topVenue=Object.entries(venueMap).sort((a,b)=>b[1]-a[1])[0];

    // All sets flattened
    const allSets=[];
    concerts.forEach(c=>{ (c.bands||[]).forEach(b=>{ if(b) allSets.push({...c,artist:b}); }); });

    const artistDates={};
    allSets.forEach(s=>{ if(!artistDates[s.artist]) artistDates[s.artist]=[]; artistDates[s.artist].push(s.date); });

    // Longest relationship
    let longestRel={artist:'',span:0,shows:0};
    Object.entries(artistDates).forEach(([artist,dates])=>{
      if(dates.length<2) return;
      const span=Math.round((new Date(dates.reduce((a,b)=>a>b?a:b))-new Date(dates.reduce((a,b)=>a<b?a:b)))/(1000*60*60*24*365));
      if(span>longestRel.span) longestRel={artist,span,shows:dates.length};
    });

    // Streak of consecutive years
    const years=Object.keys(yrMap).map(Number).sort();
    let maxStreak=1,cur=1;
    for(let i=1;i<years.length;i++){ if(years[i]===years[i-1]+1){cur++;maxStreak=Math.max(maxStreak,cur);}else cur=1; }

    // Max bands one day
    const maxBandsDay=concerts.reduce((a,b)=>(b.bands||[]).length>(a.bands||[]).length?b:a,concerts[0]);

    // Unique artists
    const uniqueArtists=new Set(allSets.map(s=>s.artist));

    // One-timers
    const oneTimers=Object.values(artistDates).filter(d=>d.length===1).length;

    // Weekend pct
    const weekend=concerts.filter(c=>{ const d=new Date(c.date+'T12:00:00'); return[4,5,6].includes(d.getDay()); }).length;
    const weekendPct=Math.round((weekend/concerts.length)*100);

    // Unique festivals
    const uniqueFests=new Set(concerts.filter(c=>c.is_festival&&c.festival_name).map(c=>c.festival_name));

    // Austin dominance
    const austinShows=concerts.filter(c=>c.city==='Austin').length;
    const austinPct=Math.round((austinShows/concerts.length)*100);

    // Avg bands per day
    const avgBands=(allSets.length/concerts.length).toFixed(1);

    // States
    const stateSet=new Set(concerts.map(c=>c.state).filter(Boolean));

    // Seen 10+ times
    const heavy=Object.entries(artistDates).filter(([,d])=>d.length>=10).length;

    return [
      {label:'PEAK INTENSITY',val:peakYear?.[0],sub:`Your busiest year on record with ${peakYear?.[1]} shows logged.`},
      {label:'HOME TURF',val:topCity?.[0]?.toUpperCase(),sub:`${topCity?.[1]} shows in your most-visited city.`},
      {label:'FESTIVAL RATIO',val:`${festPct}%`,sub:`${festPct}% of your history happened in a field.`},
      {label:'TOTAL LEGACY',val:concerts.length,sub:`Unique show days logged since you started.`},
      {label:'JUNE IS YOUR MONTH',val:'JUNE',sub:`76 shows in June — more than any other month by a mile.`},
      {label:'MOST LOYAL STAGE',val:topVenue?.[0],sub:`You've been to ${topVenue?.[0]} ${topVenue?.[1]} times.`},
      {label:'LONGEST STREAK',val:`${maxStreak} YRS`,sub:`${maxStreak} consecutive years without missing a single year.`},
      {label:'SXSW CHAMPION',val:'9 BANDS',sub:`Your personal record — 9 acts in a single day at SXSW 2008.`},
      {label:'RIDE OR DIE',val:longestRel.artist,sub:`${longestRel.span}-year relationship across ${longestRel.shows} shows.`},
      {label:'UNIQUE ARTISTS',val:uniqueArtists.size,sub:`${oneTimers} of them you've only seen once.`},
      {label:'WEEKEND WARRIOR',val:`${weekendPct}%`,sub:`${weekendPct}% of your shows fall on a Friday, Saturday, or Sunday.`},
      {label:'FESTIVAL PASSPORT',val:`${uniqueFests.size} FESTS`,sub:`${uniqueFests.size} unique festivals across ${festDays} total days.`},
      {label:'AUSTIN DOMINANCE',val:`${austinPct}%`,sub:`${austinShows} of ${concerts.length} shows happened in Austin, TX.`},
      {label:'BANDS PER DAY',val:avgBands,sub:`Average ${avgBands} acts per show day. You never leave early.`},
      {label:'HEAVY ROTATION',val:`${heavy} ARTISTS`,sub:`${heavy} artists you've seen 10 or more times.`},
    ];
  },[concerts]);

  useEffect(()=>{ if(!insights.length)return; const t=setInterval(()=>setIndex(p=>(p+1)%insights.length),5500); return()=>clearInterval(t); },[insights.length]);
  const active=insights[index]||{label:'LOADING',val:'...',sub:''};

  return (
    <Card neon style={{ minHeight:150,display:'flex',flexDirection:'column',justifyContent:'center' }}>
      <div style={{ fontFamily:"'Space Mono'",fontSize:8,color:C.teal,letterSpacing:2,marginBottom:12 }}>⚡ {active.label}</div>
      <div className="fade-in" key={index}>
        <div style={{ fontFamily:"'Bebas Neue'",fontSize:'2.2rem',color:C.white,lineHeight:1,marginBottom:4 }}>{active.val}</div>
        <div style={{ fontSize:'0.78rem',color:C.gray,lineHeight:1.4 }}>{active.sub}</div>
      </div>
      <div style={{ display:'flex',gap:4,marginTop:15,flexWrap:'wrap' }}>
        {insights.map((_,i)=><div key={i} style={{ width:i===index?10:3,height:3,borderRadius:2,background:i===index?C.teal:C.grayDim,transition:'0.3s' }} />)}
      </div>
    </Card>
  );
}

// ─── RANDOM SHOW ──────────────────────────────────────────────────────────────
function RandomShow({ concerts }) {
  const [show,setShow]=useState(null), [spinning,setSpinning]=useState(false);
  const spin=()=>{ if(!concerts.length)return; setSpinning(true); let i=0; const iv=setInterval(()=>{ setShow(concerts[Math.floor(Math.random()*concerts.length)]); if(++i>=12){clearInterval(iv);setSpinning(false);} },70); };
  useEffect(()=>{ if(concerts.length&&!show) spin(); },[concerts.length]);
  if(!show) return null;
  const artistName=Array.isArray(show.bands)?show.bands[0]:(show.artist||'Unknown');
  return (
    <Card neon style={{ minHeight:150,border:`1px solid ${spinning?C.grayDim:C.purple+'66'}`,display:'flex',flexDirection:'column',justifyContent:'center',transition:'0.3s' }}>
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8 }}>
        <div style={{ fontFamily:"'Space Mono'",fontSize:8,color:C.purple,letterSpacing:2 }}>🎲 {spinning?'SPINNING...':'RANDOM RECALL'}</div>
        <button onClick={spin} disabled={spinning} style={{ background:spinning?'transparent':`${C.purple}33`,border:`1px solid ${C.purple}88`,color:C.purple,fontSize:9,padding:'4px 12px',borderRadius:3,cursor:'pointer',fontFamily:"'Space Mono'",letterSpacing:'0.08em',fontWeight:700,transition:'all 0.2s' }}>{spinning?'•••':'SPIN'}</button>
      </div>
      <div style={{ opacity:spinning?0.3:1,transition:'0.2s' }}>
        <div style={{ fontFamily:"'Bebas Neue'",fontSize:'2.2rem',color:C.white,lineHeight:1,marginBottom:4 }}>{artistName}</div>
        <div style={{ fontFamily:"'Space Mono'",fontSize:9 }}>
          <span style={{ color:C.white }}>{fmtDate(show.date)}</span>
          <span style={{ color:C.purple,opacity:0.8,marginLeft:8 }}>📍 {show.venue?.toUpperCase()}</span>
        </div>
      </div>
    </Card>
  );
}

// ─── SONIC DNA ────────────────────────────────────────────────────────────────
const SonicDNA = ({ stats }) => (
  <Card neon>
    <CardTitle>Sonic DNA 🧬</CardTitle>
    <div style={{ display:'flex',flexDirection:'column',gap:8,marginTop:4 }}>
      {stats.slice(0,8).map((g,i)=>(
        <div key={i} style={{ position:'relative',height:24,background:'#111',borderRadius:4,overflow:'hidden' }}>
          <div style={{ position:'absolute',left:0,top:0,bottom:0,width:`${(g.count/(stats[0]?.count||1))*100}%`,background:`linear-gradient(90deg,${g.color}99,${g.color})`,transition:'width 1s ease-out' }} />
          <div style={{ position:'relative',zIndex:1,display:'flex',justifyContent:'space-between',padding:'0 10px',lineHeight:'24px',fontSize:9,fontFamily:"'Space Mono'",color:'#fff' }}><span>{g.name}</span><span>{g.count}</span></div>
        </div>
      ))}
    </div>
  </Card>
);

// ─── DONUT CHART ──────────────────────────────────────────────────────────────
function DonutChart({ fest, solo }) {
  const total=fest+solo||1, festPct=fest/total, r=52,cx=70,cy=70,circ=2*Math.PI*r;
  const festDash=festPct*circ, soloDash=(1-festPct)*circ;
  return (
    <div style={{ display:'flex',alignItems:'center',gap:20 }}>
      <svg width={140} height={140} viewBox="0 0 140 140">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.border} strokeWidth={14} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.grayDim} strokeWidth={14} strokeDasharray={`${soloDash} ${circ}`} strokeDashoffset={-festDash} strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.teal} strokeWidth={14} strokeDasharray={`${festDash} ${circ}`} strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`} style={{ filter:`drop-shadow(0 0 4px ${C.teal}66)` }} />
        <text x={cx} y={cy-6} textAnchor="middle" style={{ fontFamily:"'Bebas Neue'",fontSize:18,fill:C.teal }}>{Math.round(festPct*100)}%</text>
        <text x={cx} y={cy+10} textAnchor="middle" style={{ fontFamily:"'Space Mono',monospace",fontSize:7,fill:C.gray }}>FESTIVAL</text>
      </svg>
      <div style={{ flex:1 }}>
        {[[C.teal,'Festival Days',fest],[C.grayDim,'Standalone',solo]].map(([color,label,val])=>(
          <div key={label} style={{ marginBottom:10 }}>
            <div style={{ display:'flex',justifyContent:'space-between',marginBottom:3 }}><span style={{ fontFamily:"'Space Mono',monospace",fontSize:8,color:C.gray,textTransform:'uppercase' }}>{label}</span><span style={{ fontFamily:"'Bebas Neue'",fontSize:'1rem',color }}>{val}</span></div>
            <div style={{ height:3,background:C.border,borderRadius:2,overflow:'hidden' }}><div style={{ height:'100%',width:`${(val/total)*100}%`,background:color,borderRadius:2 }} /></div>
          </div>
        ))}
        <div style={{ marginTop:12,fontFamily:"'Bebas Neue'",fontSize:'1.4rem',color:C.white,lineHeight:1 }}>{fest+solo}</div>
        <div style={{ fontFamily:"'Space Mono',monospace",fontSize:7,color:C.gray,textTransform:'uppercase',marginTop:2 }}>Total Show Days</div>
      </div>
    </div>
  );
}

// ─── TOP FEST BLOCKS ──────────────────────────────────────────────────────────
function TopFestBlocks({ festBreakdown }) {
  const top3=festBreakdown.slice(0,3), colors=[C.teal,C.cyan,C.purple], medals=['🥇','🥈','🥉'];
  return (
    <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
      {top3.map(([name,count],i)=>(
        <div key={name} style={{ display:'flex',alignItems:'center',gap:12,background:`${colors[i]}0a`,border:`1px solid ${colors[i]}33`,borderLeft:`3px solid ${colors[i]}`,borderRadius:4,padding:'10px 14px' }}>
          <span style={{ fontSize:'1.1rem' }}>{medals[i]}</span>
          <div style={{ flex:1 }}><div style={{ fontFamily:"'Bebas Neue'",fontSize:'1rem',color:C.white }}>{name}</div></div>
          <div style={{ textAlign:'right' }}><div style={{ fontFamily:"'Bebas Neue'",fontSize:'1.6rem',color:colors[i],lineHeight:1 }}>{count}</div><div style={{ fontFamily:"'Space Mono',monospace",fontSize:7,color:C.gray }}>days</div></div>
        </div>
      ))}
      {!top3.length&&<div style={{ color:C.gray }}>No festival data yet.</div>}
    </div>
  );
}

// ─── DECADE BLOCKS ────────────────────────────────────────────────────────────
function DecadeBlocks({ sets }) {
  const dec={'90s':0,'00s':0,'10s':0,'20s':0};
  sets.forEach(s=>{ const y=getYear(s.date); if(!y)return; if(y<2000)dec['90s']++; else if(y<2010)dec['00s']++; else if(y<2020)dec['10s']++; else dec['20s']++; });
  const max=Math.max(...Object.values(dec),1), colors=[C.purple,C.cyan,C.teal,C.gold];
  return (
    <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:6 }}>
      {Object.entries(dec).map(([decade,count],i)=>(
        <div key={decade} style={{ background:`${colors[i]}18`,border:`1px solid ${colors[i]}44`,borderBottom:`3px solid ${colors[i]}`,borderRadius:4,padding:'10px 8px',textAlign:'center' }}>
          <div style={{ fontFamily:"'Bebas Neue'",fontSize:'1.6rem',color:colors[i],lineHeight:1 }}>{count}</div>
          <div style={{ fontFamily:"'Space Mono',monospace",fontSize:7,color:C.gray,textTransform:'uppercase',marginTop:2 }}>{decade}</div>
          <div style={{ marginTop:6,height:2,background:C.border,borderRadius:1,overflow:'hidden' }}><div style={{ height:'100%',width:`${(count/max)*100}%`,background:colors[i] }} /></div>
        </div>
      ))}
    </div>
  );
}

// ─── HALL OF FAME ─────────────────────────────────────────────────────────────
function HallOfFame({ sets, genreMap, onShare }) {
  const [selected,setSelected]=useState(null);
  const topRef=useRef(null);

  const artists=useMemo(()=>{
    const m={};
    sets.forEach(s=>{ if(!m[s.artist])m[s.artist]={artist:s.artist,shows:[],genre:null}; m[s.artist].shows.push(s); if(s.genre&&!m[s.artist].genre)m[s.artist].genre=s.genre; });
    Object.values(m).forEach(a=>{ if(!a.genre)a.genre=genreMap[a.artist]||null; });
    return Object.values(m).filter(a=>a.shows.length>=HALL_OF_FAME_MIN).sort((a,b)=>b.shows.length-a.shows.length);
  },[sets,genreMap]);

  const selectedData=selected?artists.find(a=>a.artist===selected):null;
  const MEDAL=['🥇','🥈','🥉'];

  const handleSelect=(artist,isSelected)=>{ if(isSelected){setSelected(null);return;} setSelected(artist); setTimeout(()=>topRef.current?.scrollIntoView({behavior:'smooth',block:'start'}),50); };

  return (
    <div ref={topRef} style={{ padding:'24px 0' }} className="fade-in">
      <div style={{ fontFamily:"'Space Mono',monospace",fontSize:10,color:C.gray,marginBottom:16,letterSpacing:'0.1em',textTransform:'uppercase' }}>Artists seen {HALL_OF_FAME_MIN}+ times — click any to expand</div>

      {selectedData&&(()=>{
        const gc=selectedData.genre?(GENRE_COLORS[selectedData.genre]||C.teal):C.teal;
        return (
          <div className="fade-in" style={{ background:`linear-gradient(135deg,${C.bgCard},${hexToRgba(gc,0.08)})`,border:`1px solid ${gc}55`,borderRadius:8,padding:'18px 20px',marginBottom:24,boxShadow:`0 0 24px ${hexToRgba(gc,0.2)}` }}>
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start' }}>
              <div>
                <div style={{ fontFamily:"'Bebas Neue'",fontSize:'1.8rem',letterSpacing:'0.08em',color:gc,marginBottom:4,lineHeight:1 }}>{selectedData.artist}</div>
                <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:12 }}>
                  {selectedData.genre&&<GenreBadge genre={selectedData.genre} color={gc} />}
                  <span style={{ fontFamily:"'Space Mono',monospace",fontSize:9,color:C.gray,textTransform:'uppercase' }}>{selectedData.shows.length} sets · {fmtDate(selectedData.shows[selectedData.shows.length-1]?.date)} → {fmtDate(selectedData.shows[0]?.date)}</span>
                </div>
              </div>
              <div style={{ display:'flex',gap:8 }}>
                {onShare&&<button onClick={()=>onShare(selectedData.artist,selectedData.shows)} style={{ fontFamily:"'Space Mono'",fontSize:9,background:hexToRgba(gc,0.15),border:`1px solid ${gc}44`,color:gc,borderRadius:4,padding:'4px 10px',cursor:'pointer' }}>📤 Share</button>}
                <button onClick={()=>setSelected(null)} style={{ background:'none',border:`1px solid ${C.border}`,color:C.gray,fontSize:10,borderRadius:4,padding:'4px 8px',cursor:'pointer' }}>CLOSE</button>
              </div>
            </div>
            <div style={{ position:'relative',paddingLeft:20 }}>
              <div style={{ position:'absolute',left:5,top:0,bottom:0,width:1,background:`linear-gradient(to bottom,${gc},${C.grayDim})` }} />
              {[...selectedData.shows].reverse().map((s,i)=>{
                const hasSet=s.has_setlist||(s.has_setlist_names?.trim());
                return (
                  <div key={i} style={{ position:'relative',marginBottom:12,paddingLeft:14 }}>
                    <div style={{ position:'absolute',left:-7,top:4,width:8,height:8,borderRadius:'50%',background:s.is_festival?gc:(hasSet?C.gold:C.grayDim),border:`1px solid ${s.is_festival?gc:(hasSet?C.gold:C.border)}`,boxShadow:s.is_festival?`0 0 8px ${gc}aa`:(hasSet?`0 0 8px ${C.gold}aa`:'none'),zIndex:2 }} />
                    <div style={{ display:'flex',alignItems:'baseline',gap:8,flexWrap:'wrap' }}>
                      <span style={{ fontFamily:"'Space Mono',monospace",fontSize:10,color:hasSet?C.gold:C.tealDim }}>{fmtDate(s.date)}</span>
                      <span style={{ fontSize:'0.8rem',color:C.white }}>{s.venue}</span>
                      <span style={{ fontSize:'0.75rem',color:C.grayDim }}>{s.city}, {s.state}</span>
                      {s.is_festival&&<Badge color={gc}>{s.festival_name}</Badge>}
                      {hasSet&&<span style={{ fontSize:11 }}>📋</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:10 }}>
        {artists.map((a,i)=>{
          const gc=a.genre?(GENRE_COLORS[a.genre]||C.teal):null;
          const isSelected=selected===a.artist;
          const festCount=a.shows.filter(s=>s.is_festival).length;
          const setlistCount=a.shows.filter(s=>s.has_setlist||(s.has_setlist_names?.trim())).length;
          const pct=Math.round((festCount/a.shows.length)*100);
          const cardColor=isSelected?(gc||C.teal):gc;
          return (
            <div key={a.artist} onClick={()=>handleSelect(a.artist,isSelected)}
              className={!gc&&!isSelected?'rainbow-anim':''}
              style={{ background:cardColor?`linear-gradient(135deg,${C.bgCard},${hexToRgba(cardColor,0.1)})`:C.bgCard, border:`1px solid ${cardColor?hexToRgba(cardColor,0.6):C.border}`, boxShadow:cardColor?`0 0 14px ${hexToRgba(cardColor,0.25)}`:'none', borderRadius:8,padding:'12px 14px',cursor:'pointer',transition:'all 0.18s',position:'relative' }}>
              {setlistCount>0&&<div style={{ position:'absolute',top:8,right:8,width:6,height:6,borderRadius:'50%',background:C.gold,boxShadow:`0 0 5px ${C.gold}` }} />}
              <div style={{ fontFamily:"'Space Mono',monospace",fontSize:9,color:cardColor||C.tealDim,marginBottom:4 }}>{MEDAL[i]||'🎤'} #{i+1}</div>
              <div style={{ fontSize:'0.9rem',fontWeight:600,color:C.white,marginBottom:4,lineHeight:1.2 }}>{a.artist}</div>
              {a.genre&&<GenreBadge genre={a.genre} color={gc} small />}
              <div style={{ fontFamily:"'Bebas Neue'",fontSize:'1.8rem',color:cardColor||C.white,lineHeight:1,marginTop:6 }}>{a.shows.length}×</div>
              <div style={{ marginTop:8,height:3,background:C.border,borderRadius:2,overflow:'hidden' }}><div style={{ height:'100%',width:`${pct}%`,background:cardColor||C.teal,borderRadius:2 }} /></div>
              <div style={{ display:'flex',justifyContent:'space-between',marginTop:4 }}>
                <div style={{ fontFamily:"'Space Mono',monospace",fontSize:7,color:C.grayDim }}>{festCount}F · {a.shows.length-festCount}S</div>
                {setlistCount>0&&<div style={{ fontFamily:"'Space Mono',monospace",fontSize:7,color:C.gold }}>{setlistCount} 📋</div>}
              </div>
            </div>
          );
        })}
        {!artists.length&&<div style={{ color:C.gray,gridColumn:'1/-1',textAlign:'center',padding:60 }}>See {HALL_OF_FAME_MIN}+ shows to unlock.</div>}
      </div>
    </div>
  );
}

// ─── SETLIST VAULT TAB ────────────────────────────────────────────────────────
function SetlistVaultTab({ concerts }) {
  const setlists=useMemo(()=>{
    const results=[];
    concerts.forEach(c=>{
      if (!c.has_setlist_names?.trim()) return;
      const bands=c.has_setlist_names.split(',').map(b=>b.trim()).filter(Boolean);
      bands.forEach(band=>{ results.push({ id:`${c.id}-${band}`, band, date:c.date, venue:c.venue, city:c.city, state:c.state, festival_name:c.festival_name, is_festival:c.is_festival, genre:c.genre }); });
    });
    return results.sort((a,b)=>b.date.localeCompare(a.date));
  },[concerts]);

  const ROTATIONS=[-3,-1.5,2,0.5,-2.5,1,-0.5,2.5,-1,3,-2,1.5];
  const DURATIONS=['6s','7s','5.5s','8s','6.5s','7.5s','5s','9s'];
  const TAPE_COLORS=['#ffcc00','#00e5cc','#9966ff','#ff4466','#00cfff','#ffaa00'];

  if (!setlists.length) return (
    <div style={{ padding:'80px 0',textAlign:'center' }} className="fade-in">
      <div style={{ fontSize:'4rem',marginBottom:20 }}>📋</div>
      <div style={{ fontFamily:"'Bebas Neue'",fontSize:'2rem',color:C.white,marginBottom:12 }}>VAULT IS EMPTY</div>
      <div style={{ fontFamily:"'Space Mono',monospace",fontSize:10,color:C.gray }}>Edit a show and add band names to "Setlists Obtained" to start your collection.</div>
    </div>
  );

  // Split into 3 columns for masonry feel
  const cols = [[], [], []];
  setlists.forEach((s, i) => cols[i % 3].push({ ...s, colIdx: i }));

  const PaperCard = ({ s, i }) => {
    const rot=ROTATIONS[i%ROTATIONS.length];
    const dur=DURATIONS[i%DURATIONS.length];
    const tapeColor=TAPE_COLORS[i%TAPE_COLORS.length];
    const gc=s.genre?GENRE_COLORS[s.genre]:null;
    return (
      <div className="paper-float" style={{ '--r':`${rot}deg`,'--dur':dur, position:'relative', transform:`rotate(${rot}deg)`, marginBottom:40, zIndex:1 }}>
        <div style={{ position:'absolute',top:-12,left:'50%',transform:'translateX(-50%)',width:56,height:22,background:tapeColor,opacity:0.75,borderRadius:3,zIndex:10,boxShadow:`0 2px 8px ${hexToRgba(tapeColor,0.4)}` }} />
        <div style={{ background:'linear-gradient(160deg,#f5f0e8 0%,#ede8d8 40%,#e8e0cc 100%)', borderRadius:4, padding:'32px 28px 24px', boxShadow:`0 8px 32px rgba(0,0,0,0.5),0 2px 8px rgba(0,0,0,0.3),inset 0 1px 0 rgba(255,255,255,0.6)`, position:'relative', overflow:'hidden' }}>
          {[0,1,2,3,4].map(j=><div key={j} style={{ position:'absolute',left:60,right:0,top:72+j*26,height:1,background:'rgba(150,180,220,0.35)' }} />)}
          <div style={{ position:'absolute',left:54,top:0,bottom:0,width:1.5,background:'rgba(220,60,60,0.3)' }} />
          <div style={{ position:'absolute',left:18,top:'28%',width:16,height:16,borderRadius:'50%',background:'rgba(0,0,0,0.12)',boxShadow:'inset 0 1px 3px rgba(0,0,0,0.2)' }} />
          {gc&&<div style={{ position:'absolute',top:0,right:0,background:gc,padding:'3px 10px 3px 14px',borderRadius:'0 4px 0 10px',fontFamily:"'Space Mono',monospace",fontSize:7,color:'#000',letterSpacing:'0.1em',textTransform:'uppercase',fontWeight:700 }}>{s.genre}</div>}
          <div style={{ paddingLeft:18 }}>
            <div style={{ fontFamily:"'Caveat',cursive",fontSize:'clamp(1.4rem,3vw,1.9rem)',fontWeight:700,color:'#1a1a2e',lineHeight:1.1,marginBottom:12 }}>{s.band}</div>
            <div style={{ fontFamily:"'Caveat',cursive",fontSize:'1rem',color:'#2a2a4e',marginBottom:3 }}>{fmtDate(s.date)}</div>
            <div style={{ fontFamily:"'Caveat',cursive",fontSize:'0.9rem',color:'#3a3a5e',marginBottom:2 }}>{s.venue}</div>
            <div style={{ fontFamily:"'Caveat',cursive",fontSize:'0.85rem',color:'#5a5a7e' }}>{[s.city,s.state].filter(Boolean).join(', ')}{s.is_festival?` · ${s.festival_name}`:''}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding:'40px 0 80px' }} className="fade-in">
      <div style={{ textAlign:'center',marginBottom:48 }}>
        <div style={{ fontFamily:"'Bebas Neue'",fontSize:'clamp(2.5rem,6vw,4rem)',color:C.white,letterSpacing:'0.06em',marginBottom:8 }}>📋 SETLIST <span style={{ color:C.teal }}>VAULT</span></div>
        <div style={{ fontFamily:"'Space Mono',monospace",fontSize:9,color:C.gray,letterSpacing:'0.2em',textTransform:'uppercase' }}>{setlists.length} setlist{setlists.length!==1?'s':''} in the archive</div>
      </div>
      {/* 3-column masonry */}
      <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'0 40px',alignItems:'start' }}>
        {cols.map((col,ci)=>(
          <div key={ci} style={{ display:'flex',flexDirection:'column' }}>
            {col.map(s=><PaperCard key={s.id} s={s} i={s.colIdx} />)}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── FESTIVAL SCHEDULE CARD ───────────────────────────────────────────────────
function FestivalScheduleCard({ event, compact=false, genreMap={} }) {
  const bands=event.bands||[];
  const STAGE_COLORS=[C.teal,C.cyan,C.purple,C.gold,C.green];
  const numCols=Math.max(1,bands.length<=2?bands.length:bands.length<=5?3:bands.length<=9?4:5);
  const columns=Array.from({length:Math.min(numCols,bands.length)},()=>[]);
  bands.forEach((b,i)=>columns[i%columns.length].push(b));
  const gi=getConcertGenreInfo(event,genreMap);
  return (
    <div className="day-card-hover" style={{ background:compact?C.bgCardAlt:C.bgCard,border:`1px solid ${C.border}`,borderRadius:6,marginBottom:compact?8:12,overflow:'hidden' }}>
      <div style={{ background:`linear-gradient(135deg,${C.bgCardAlt},${C.bg})`,borderBottom:`1px solid ${C.border}`,padding:'10px 16px',display:'flex',alignItems:'center',gap:12,flexWrap:'wrap' }}>
        <div style={{ fontFamily:"'Bebas Neue'",fontSize:'1.1rem',color:C.white }}>{fmtDate(event.date)}</div>
        <div style={{ fontFamily:"'Space Mono',monospace",fontSize:9,color:C.gray,fontStyle:'italic',flex:1 }}>{[event.venue,event.city,event.state].filter(Boolean).join(', ')}</div>
        <Badge color={C.teal}>{event.festival_day||event.festival_name||'Festival'}</Badge>
        <GenreBadge genre={gi.genre} color={gi.color} mixed={gi.mixed} small />
        <span style={{ fontFamily:"'Space Mono',monospace",fontSize:9,color:C.tealDim,background:C.tealFaint,padding:'2px 7px',borderRadius:3 }}>{bands.length} acts</span>
      </div>
      {columns.length>0&&(
        <div style={{ display:'grid',gridTemplateColumns:`repeat(${columns.length},1fr)` }}>
          {columns.map((stageBands,ci)=>(
            <div key={ci} style={{ borderRight:ci<columns.length-1?`1px solid ${C.border}`:'none' }}>
              <div style={{ height:4,background:`${STAGE_COLORS[ci%STAGE_COLORS.length]}66`,borderBottom:`2px solid ${STAGE_COLORS[ci%STAGE_COLORS.length]}` }} />
              <div style={{ padding:'8px 10px',display:'flex',flexDirection:'column',gap:5 }}>
                {stageBands.map((band,bi)=><div key={bi} style={{ background:C.bgCardAlt,borderRadius:4,padding:'6px 8px',borderLeft:`2px solid ${STAGE_COLORS[ci%STAGE_COLORS.length]}`,fontSize:'0.75rem',color:C.white,lineHeight:1.3 }}>{band}</div>)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── DAY CARD ─────────────────────────────────────────────────────────────────
function DayCard({ event, onEdit, genreMap={} }) {
  const bands=event.bands||[];
  const hasSetlist=event.has_setlist||(event.has_setlist_names?.trim());
  const gi=getConcertGenreInfo(event,genreMap);
  const borderColor=gi.mixed?C.teal:(gi.color||C.border);
  return (
    <div className="day-card-hover" data-date={event.date} style={{ background:C.bgCard,border:`1px solid ${C.border}`,borderLeft:`3px solid ${borderColor}`,borderRadius:8,marginBottom:8,overflow:'hidden' }} onClick={()=>onEdit&&onEdit(event)}>
      <div style={{ padding:'10px 16px',borderBottom:`1px solid ${C.border}`,display:'flex',alignItems:'center',gap:10,flexWrap:'wrap' }}>
        <div style={{ fontFamily:"'Bebas Neue'",fontSize:'1rem',color:C.white }}>{fmtDate(event.date)}</div>
        <div style={{ fontSize:'0.76rem',color:C.gray,fontStyle:'italic',flex:1 }}>{[event.venue,event.city,event.state].filter(Boolean).join(', ')||'No location'}</div>
        {event.is_festival&&<Badge color={C.teal}>{event.festival_day||event.festival_name||'Festival'}</Badge>}
        <GenreBadge genre={gi.genre} color={gi.color} mixed={gi.mixed} small />
        {hasSetlist&&<span style={{ fontSize:12 }}>📋</span>}
      </div>
      <div style={{ padding:'8px 16px 12px',display:'flex',flexWrap:'wrap',gap:5 }}>
        {bands.map((b,i)=>{ const bg=genreMap[b]?GENRE_COLORS[genreMap[b]]:null; return <span key={i} style={{ fontSize:'0.78rem',color:C.white,background:bg?hexToRgba(bg,0.15):C.bgCardAlt,border:`1px solid ${bg?hexToRgba(bg,0.4):C.border}`,borderRadius:4,padding:'4px 9px' }}>{b}</span>; })}
      </div>
    </div>
  );
}

// ─── TIMELINE ─────────────────────────────────────────────────────────────────
function GenreLegend() {
  return (
    <div style={{ display:'flex',flexWrap:'wrap',gap:15,justifyContent:'center',padding:20,background:'rgba(255,255,255,0.02)',borderRadius:12,margin:'0 auto 40px auto',maxWidth:900,border:'1px solid rgba(255,255,255,0.05)' }}>
      {Object.entries(GENRE_COLORS).map(([name,color])=>(
        <div key={name} style={{ display:'flex',alignItems:'center',gap:6 }}>
          <div style={{ width:8,height:8,borderRadius:'50%',background:color,boxShadow:`0 0 8px ${color}` }} />
          <span style={{ fontFamily:"'Space Mono'",fontSize:9,color:'#888',letterSpacing:1 }}>{name.toUpperCase()}</span>
        </div>
      ))}
    </div>
  );
}

function TimelineCard({ item, isLeft, marginTop, onTeleport, genreMap }) {
  const [hovered,setHovered]=useState(false);
  const bands=item.bands||[];
  const gi=getConcertGenreInfo(item,genreMap);
  const themeColor=gi.mixed?'#9d00ff':(gi.color||GENRE_COLORS['Other']);
  return (
    <div onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)} onClick={onTeleport} style={{ marginTop,display:'flex',justifyContent:isLeft?'flex-start':'flex-end',alignItems:'center',width:'100%',position:'relative',cursor:'pointer' }}>
      <div style={{ position:'absolute',left:'50%',width:12,height:12,borderRadius:'50%',background:themeColor,transform:'translateX(-50%)',zIndex:5,boxShadow:`0 0 ${hovered?'20px':'10px'} ${themeColor}`,border:'2px solid #0a0a0c',transition:'0.3s' }} />
      <div style={{ width:'43%',padding:20,borderRadius:12,background:hovered?hexToRgba(themeColor,0.15):hexToRgba(themeColor,0.05),border:`1px solid ${hovered?themeColor:hexToRgba(themeColor,0.3)}`,borderLeft:isLeft?`6px solid ${themeColor}`:`1px solid ${hovered?themeColor:hexToRgba(themeColor,0.3)}`,borderRight:!isLeft?`6px solid ${themeColor}`:`1px solid ${hovered?themeColor:hexToRgba(themeColor,0.3)}`,transform:hovered?'scale(1.03) translateY(-5px)':'scale(1)',transition:'all 0.4s cubic-bezier(0.175,0.885,0.32,1.275)',boxShadow:hovered?`0 15px 40px -15px ${themeColor}66`:'none',zIndex:hovered?20:1 }}>
        <div style={{ display:'flex',flexWrap:'wrap',gap:6,marginBottom:12 }}>
          {bands.map((band,idx)=><span key={idx} style={{ fontFamily:idx===0?"'Bebas Neue'":"'Space Mono'",fontSize:idx===0?'2rem':'0.75rem',color:'#fff',lineHeight:1,opacity:idx!==0&&!hovered?0.4:1 }}>{band}{idx<bands.length-1&&idx!==0?' •':''}</span>)}
        </div>
        <div style={{ display:'flex',alignItems:'center',gap:6,marginBottom:8 }}><GenreBadge genre={gi.genre} color={gi.color} mixed={gi.mixed} small /></div>
        <div style={{ paddingTop:8,borderTop:`1px solid ${hexToRgba(themeColor,0.2)}`,display:'flex',justifyContent:'space-between' }}>
          <span style={{ fontFamily:"'Space Mono'",fontSize:9,color:'#fff',opacity:0.7 }}>{item.venue?.toUpperCase()} // {item.city?.toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
}

function TimelineTab({ concerts, setActiveTab, genreMap }) {
  const yearsData=useMemo(()=>{
    if (!concerts.length) return [];
    const sorted=[...concerts].sort((a,b)=>b.date.localeCompare(a.date));
    const groups={};
    sorted.forEach(show=>{ const yr=new Date(show.date+'T12:00:00').getFullYear(); if(!groups[yr])groups[yr]=[]; groups[yr].push(show); });
    const qMonths=[9,6,3,0],monthNames={9:'OCTOBER',6:'JULY',3:'APRIL',0:'JANUARY'};
    return Object.entries(groups).sort((a,b)=>b[0]-a[0]).map(([year,yearShows])=>{
      const finalFlow=[],usedMarkers=new Set(); let showCounter=0;
      yearShows.forEach((show,idx)=>{
        const showMonth=new Date(show.date+'T12:00:00').getMonth();
        qMonths.forEach(m=>{ if(showMonth<=m&&!usedMarkers.has(m)){finalFlow.push({type:'MONTH_MARKER',label:monthNames[m],id:`marker-${year}-${m}`});usedMarkers.add(m);} });
        const nextShow=yearShows[idx+1]; let gap=0;
        if(nextShow){const d1=new Date(show.date+'T12:00:00'),d2=new Date(nextShow.date+'T12:00:00');gap=Math.ceil(Math.abs(d1-d2)/86400000);}
        showCounter++;
        finalFlow.push({...show,type:'SHOW',gapDays:gap,side:showCounter%2===0?'right':'left'});
      });
      return [year,finalFlow];
    });
  },[concerts]);

  const teleport=date=>{ if(typeof setActiveTab==='function'){setActiveTab('byDay');setTimeout(()=>{ const el=document.querySelector(`[data-date="${date}"]`); if(el)el.scrollIntoView({behavior:'smooth',block:'center'}); },150);} };

  if (!yearsData.length) return <div style={{ color:C.white,padding:100,textAlign:'center' }}>No concerts yet.</div>;
  return (
    <div style={{ padding:'40px 0 80px',background:'#0a0a0c' }} className="fade-in">
      <GenreLegend />
      <div style={{ maxWidth:1100,margin:'0 auto',position:'relative' }}>
        <div style={{ position:'absolute',left:'50%',top:0,bottom:0,width:2,background:'linear-gradient(to bottom,#00f2ff,#9d00ff,#ffcc00,transparent)',transform:'translateX(-50%)',opacity:0.15 }} />
        {yearsData.map(([year,flow],yIdx)=>(
          <div key={year} style={{ position:'relative',marginBottom:120 }}>
            <div style={{ position:'absolute',left:'-180px',top:0,bottom:0,width:'100px',zIndex:1 }}><div style={{ position:'sticky',top:'250px',fontFamily:"'Bebas Neue'",fontSize:'6.5rem',color:'transparent',WebkitTextStroke:`2px ${yIdx%2===0?'#00f2ff':'#9d00ff'}`,opacity:0.6,transform:'rotate(-90deg)',transformOrigin:'center' }}>{year}</div></div>
            <div style={{ position:'absolute',right:'-180px',top:0,bottom:0,width:'100px',zIndex:1 }}><div style={{ position:'sticky',top:'250px',fontFamily:"'Bebas Neue'",fontSize:'6.5rem',color:'transparent',WebkitTextStroke:`2px ${yIdx%2===0?'#00f2ff':'#9d00ff'}`,opacity:0.6,transform:'rotate(90deg)',transformOrigin:'center' }}>{year}</div></div>
            <div style={{ width:'100%',padding:'0 20px' }}>
              {flow.map(item=>item.type==='MONTH_MARKER'
                ?<div key={item.id} style={{ margin:'80px 0 40px',textAlign:'center',position:'relative',zIndex:10 }}><span style={{ fontFamily:"'Space Mono'",fontSize:14,color:'#fff',background:'#0a0a0c',padding:'8px 24px',borderRadius:4,border:'2px solid #9d00ff',fontWeight:700,boxShadow:'0 0 20px rgba(157,0,255,0.3)',letterSpacing:6 }}>{item.label}</span></div>
                :<TimelineCard key={item.id} item={item} isLeft={item.side==='left'} marginTop={item.gapDays<=2?20:Math.min(item.gapDays*2,150)} onTeleport={()=>teleport(item.date)} genreMap={genreMap} />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── BY DAY / BY FEST / PASSPORT ──────────────────────────────────────────────
function ByDayTab({ dayGroups, onEdit, genreMap }) {
  return (
    <div style={{ padding:'24px 0' }} className="fade-in">
      {dayGroups.map(event=>event.is_festival?<FestivalScheduleCard key={event.id} event={event} genreMap={genreMap} />:<DayCard key={event.id} event={event} onEdit={onEdit} genreMap={genreMap} />)}
      {!dayGroups.length&&<div style={{ textAlign:'center',color:C.gray,padding:60 }}>No shows match your filters.</div>}
    </div>
  );
}

function ByFestTab({ festGroupings }) {
  const [collapsed,setCollapsed]=useState({});
  const toggle=(name,year)=>setCollapsed(p=>({...p,[`${name}-${year}`]:!p[`${name}-${year}`]}));
  const FEST_COLORS=[C.teal,C.cyan,C.purple,C.gold,C.green,'#ff6699','#ff4400','#a2ff00'];
  return (
    <div style={{ marginTop:20 }} className="fade-in">
      {festGroupings.map((fest,fi)=>{
        const color=FEST_COLORS[fi%FEST_COLORS.length];
        const allShows=Object.values(fest.years).flat();
        const totalDays=allShows.length;
        const yearsSorted=Object.keys(fest.years).sort((a,b)=>b.localeCompare(a));
        const firstYear=yearsSorted[yearsSorted.length-1], lastYear=yearsSorted[0];
        const yearRange=firstYear===lastYear?firstYear:`${firstYear}–${lastYear}`;
        const uniqueArtists=new Set(allShows.flatMap(s=>s.bands||[])).size;
        return (
          <div key={fest.name} style={{ marginBottom:48 }}>
            <div id={`fest-${fest.name.replace(/\s+/g,'-')}`} style={{ position:'relative',borderRadius:12,overflow:'hidden',marginBottom:20,background:`linear-gradient(135deg,${hexToRgba(color,0.12)},${C.bgCard})`,border:`1px solid ${hexToRgba(color,0.5)}`,boxShadow:`0 0 40px ${hexToRgba(color,0.2)},0 4px 20px rgba(0,0,0,0.6)`,padding:'32px 36px' }}>
              <div style={{ position:'absolute',top:-60,right:-60,width:300,height:300,background:`radial-gradient(circle,${hexToRgba(color,0.15)},transparent)`,pointerEvents:'none' }} />
              <div style={{ position:'absolute',left:0,top:0,bottom:0,width:4,background:`linear-gradient(to bottom,${color},${hexToRgba(color,0.2)})`,borderRadius:'12px 0 0 12px' }} />
              <div style={{ position:'relative',zIndex:1 }}>
                <div style={{ fontFamily:"'Space Mono',monospace",fontSize:9,letterSpacing:'0.3em',textTransform:'uppercase',color:hexToRgba(color,0.8),marginBottom:10 }}>🎪 FESTIVAL PASSPORT</div>
                <div style={{ fontFamily:"'Bebas Neue'",fontSize:'clamp(2.5rem,6vw,4.5rem)',letterSpacing:'0.06em',color:C.white,lineHeight:1,marginBottom:16,textShadow:`0 0 30px ${hexToRgba(color,0.4)}` }}>{fest.name}</div>
                <div style={{ display:'flex',flexWrap:'wrap',gap:24,marginBottom:20 }}>
                  {[[totalDays,totalDays===1?'DAY':'DAYS ATTENDED'],[yearsSorted.length,yearsSorted.length===1?'YEAR':'YEARS'],[uniqueArtists,'UNIQUE ARTISTS'],[yearRange,'SPAN']].map(([val,label])=>(
                    <div key={label}><div style={{ fontFamily:"'Bebas Neue'",fontSize:'2rem',color,lineHeight:1 }}>{val}</div><div style={{ fontFamily:"'Space Mono',monospace",fontSize:8,color:C.gray,textTransform:'uppercase',letterSpacing:'0.12em',marginTop:2 }}>{label}</div></div>
                  ))}
                </div>
                <div style={{ display:'flex',flexWrap:'wrap',gap:6 }}>
                  {yearsSorted.map(yr=><span key={yr} onClick={()=>toggle(fest.name,yr)} style={{ fontFamily:"'Space Mono',monospace",fontSize:9,background:hexToRgba(color,0.18),color,border:`1px solid ${hexToRgba(color,0.45)}`,padding:'3px 10px',borderRadius:4,cursor:'pointer' }}>{yr} {collapsed[`${fest.name}-${yr}`]?'▸':'▾'}</span>)}
                </div>
              </div>
            </div>
            {yearsSorted.map(yr=>{
              const isCollapsed=collapsed[`${fest.name}-${yr}`];
              const shows=fest.years[yr];
              return (
                <div key={yr} style={{ marginBottom:16 }}>
                  <div onClick={()=>toggle(fest.name,yr)} style={{ display:'flex',alignItems:'center',gap:12,padding:'8px 16px',background:hexToRgba(color,0.07),border:`1px solid ${hexToRgba(color,0.2)}`,borderRadius:6,cursor:'pointer',marginBottom:isCollapsed?0:10 }}>
                    <div style={{ fontFamily:"'Bebas Neue'",fontSize:'1.3rem',color,lineHeight:1 }}>{yr}</div>
                    <div style={{ fontFamily:"'Space Mono',monospace",fontSize:8,color:C.gray }}>{shows.length} {shows.length===1?'DAY':'DAYS'} · {new Set(shows.flatMap(s=>s.bands||[])).size} ARTISTS</div>
                    <div style={{ marginLeft:'auto',color:C.grayDim,fontSize:10 }}>{isCollapsed?'▸':'▾'}</div>
                  </div>
                  {!isCollapsed&&shows.sort((a,b)=>a.date.localeCompare(b.date)).map(s=><FestivalScheduleCard key={s.id} event={s} compact />)}
                </div>
              );
            })}
          </div>
        );
      })}
      {!festGroupings.length&&<div style={{ textAlign:'center',color:C.gray,padding:60 }}>No festival data yet.</div>}
    </div>
  );
}

function PassportTab({ passport, onNavigateToFest }) {
  return (
    <div style={{ padding:'24px 0' }} className="fade-in">
      <div style={{ fontFamily:"'Space Mono',monospace",fontSize:10,color:C.gray,marginBottom:20,letterSpacing:'0.1em',textTransform:'uppercase' }}>Your festival attendance record — click any card to view full history</div>
      <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:14 }}>
        {passport.map(f=>(
          <div key={f.name} onClick={()=>onNavigateToFest(f.name)}
            style={{ background:C.bgCard,border:`1px solid ${C.teal}33`,borderRadius:8,padding:16,cursor:'pointer',transition:'all 0.18s' }}
            onMouseEnter={e=>{e.currentTarget.style.border=`1px solid ${C.teal}88`;e.currentTarget.style.boxShadow=`0 0 16px ${C.tealGlow}`;}}
            onMouseLeave={e=>{e.currentTarget.style.border=`1px solid ${C.teal}33`;e.currentTarget.style.boxShadow='none';}}>
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10 }}>
              <div style={{ fontFamily:"'Bebas Neue'",fontSize:'1.3rem',color:C.gold,lineHeight:1 }}>{f.name}</div>
              <div style={{ textAlign:'right' }}><div style={{ fontFamily:"'Bebas Neue'",fontSize:'1.6rem',color:C.teal,lineHeight:1 }}>{f.days}</div><div style={{ fontFamily:"'Space Mono',monospace",fontSize:7,color:C.gray,textTransform:'uppercase' }}>days</div></div>
            </div>
            <div style={{ fontFamily:"'Space Mono',monospace",fontSize:8,color:C.gray,marginBottom:8,textTransform:'uppercase' }}>{f.years.length} {f.years.length===1?'year':'years'} attended</div>
            <div style={{ display:'flex',flexWrap:'wrap',gap:4,marginBottom:10 }}>{f.years.map(y=><span key={y} style={{ fontFamily:"'Space Mono',monospace",fontSize:8,background:`${C.gold}22`,color:C.gold,border:`1px solid ${C.gold}44`,padding:'2px 6px',borderRadius:3 }}>{y}</span>)}</div>
            <div style={{ fontFamily:"'Space Mono',monospace",fontSize:7,color:C.tealDim,textTransform:'uppercase',letterSpacing:'0.1em' }}>↗ View full festival history</div>
          </div>
        ))}
        {!passport.length&&<div style={{ color:C.gray,textAlign:'center',gridColumn:'1/-1',padding:60 }}>No festival passport stamps yet.</div>}
      </div>
    </div>
  );
}

// ─── BROWSE TAB ───────────────────────────────────────────────────────────────
function BrowseTab({ browseView, setBrowseView, search, setSearch, yearFilter, setYearFilter, festFilter, setFestFilter, sortCol, setSortCol, sortDir, setSortDir, paged, page, setPage, totalPages, artistRows, years, onShare, onEdit, onSetGenre, genreMap }) {
  return (
    <div style={{ marginTop:20 }} className="fade-in">
      <div style={{ display:'flex',flexWrap:'wrap',gap:10,marginBottom:20,background:C.bgCard,padding:15,borderRadius:8,border:`1px solid ${C.border}` }}>
        <input placeholder="Search artists, venues, cities..." value={search} onChange={e=>setSearch(e.target.value)} style={{ ...inputSt,flex:'1 1 260px' }} />
        <select value={yearFilter} onChange={e=>setYearFilter(e.target.value)} style={{ ...inputSt,minWidth:100 }}><option value="all">All Years</option>{years.map(y=><option key={y} value={y}>{y}</option>)}</select>
        <select value={festFilter} onChange={e=>setFestFilter(e.target.value)} style={{ ...inputSt,minWidth:130 }}><option value="all">All Types</option><option value="fest">Festival Only</option><option value="solo">Standalone Only</option></select>
        <div style={{ display:'flex',background:C.bgCardAlt,borderRadius:4,padding:2,border:`1px solid ${C.border}` }}>
          {['shows','artists'].map(v=><button key={v} onClick={()=>setBrowseView(v)} style={{ padding:'6px 14px',fontSize:10,fontFamily:"'Space Mono'",letterSpacing:'0.1em',textTransform:'uppercase',background:browseView===v?C.teal:'transparent',color:browseView===v?C.bg:C.gray,border:'none',cursor:'pointer',borderRadius:3,transition:'0.15s' }}>{v}</button>)}
        </div>
      </div>

      {browseView==='shows'&&(
        <>
          <div style={{ background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:8,overflow:'hidden' }}>
            <table style={{ width:'100%',borderCollapse:'collapse',fontSize:'0.78rem' }}>
              <thead>
                <tr style={{ background:C.bgCardAlt }}>
                  {[['date','Date'],['artist','Artist'],['venue','Venue'],['city','City']].map(([col,label])=>(
                    <th key={col} onClick={()=>{ setSortCol(col); setSortDir(d=>d==='asc'?'desc':'asc'); }} style={{ fontFamily:"'Space Mono',monospace",fontSize:8,letterSpacing:'0.15em',textTransform:'uppercase',padding:'10px 12px',textAlign:'left',color:sortCol===col?C.teal:C.tealDim,borderBottom:`1px solid ${C.border}`,cursor:'pointer',userSelect:'none' }}>{label} {sortCol===col?(sortDir==='asc'?'▲':'▼'):''}</th>
                  ))}
                  <th style={{ fontFamily:"'Space Mono',monospace",fontSize:8,letterSpacing:'0.15em',textTransform:'uppercase',padding:'10px 12px',textAlign:'left',color:C.tealDim,borderBottom:`1px solid ${C.border}` }}>Genre</th>
                  <th style={{ fontFamily:"'Space Mono',monospace",fontSize:8,letterSpacing:'0.15em',textTransform:'uppercase',padding:'10px 12px',textAlign:'left',color:C.tealDim,borderBottom:`1px solid ${C.border}` }}>Setlist</th>
                  <th style={{ fontFamily:"'Space Mono',monospace",fontSize:8,letterSpacing:'0.15em',textTransform:'uppercase',padding:'10px 12px',textAlign:'left',color:C.tealDim,borderBottom:`1px solid ${C.border}` }}>Type</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((s,i)=>(
                  <tr key={`${s.id}-${s.artist}`} className="row-hover" onClick={()=>onEdit(s)} style={{ borderBottom:`1px solid ${C.border}`,background:i%2===1?C.bgCardAlt:'transparent' }}>
                    <td style={{ padding:'9px 12px',fontFamily:"'Space Mono',monospace",fontSize:'0.7rem',color:C.gray,whiteSpace:'nowrap' }}>{fmtDate(s.date)}</td>
                    <td style={{ padding:'9px 12px',color:C.teal,fontWeight:600 }}>{s.artist}</td>
                    <td style={{ padding:'9px 12px',color:C.gray }}>{s.venue||'—'}</td>
                    <td style={{ padding:'9px 12px',color:C.gray }}>{s.city||'—'}{s.state?`, ${s.state}`:''}</td>
                    <td style={{ padding:'9px 12px' }}>{s.genre?<GenreBadge genre={s.genre} color={GENRE_COLORS[s.genre]} small />:<span style={{ color:C.grayDim,fontSize:8 }}>—</span>}</td>
                    <td style={{ padding:'9px 12px',textAlign:'center' }}>{(s.has_setlist||(s.has_setlist_names?.trim()))?<span style={{ color:C.gold }}>📋</span>:<span style={{ color:C.grayDim }}>—</span>}</td>
                    <td style={{ padding:'9px 12px' }}>{s.is_festival?<Badge color={C.teal}>Fest</Badge>:<Badge color={C.grayDim} bg="transparent">Solo</Badge>}</td>
                  </tr>
                ))}
                {!paged.length&&<tr><td colSpan={7} style={{ textAlign:'center',color:C.gray,padding:40 }}>No results.</td></tr>}
              </tbody>
            </table>
          </div>
          {totalPages>1&&(
            <div style={{ display:'flex',justifyContent:'center',alignItems:'center',gap:10,marginTop:16 }}>
              <Btn variant="secondary" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} style={{ padding:'5px 12px' }}>← Prev</Btn>
              <span style={{ fontFamily:"'Space Mono',monospace",fontSize:9,color:C.gray }}>Page {page} of {totalPages}</span>
              <Btn variant="secondary" onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} style={{ padding:'5px 12px' }}>Next →</Btn>
            </div>
          )}
        </>
      )}

      {browseView==='artists'&&(
        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:12 }}>
          {artistRows.map(row=>{
            const genre=genreMap[row.artist]||null;
            const gc=genre?(GENRE_COLORS[genre]||null):null;
            const hasSetlist=row.shows.some(s=>s.has_setlist||(s.has_setlist_names?.trim()));
            return (
              <div key={row.artist} style={{ background:gc?`linear-gradient(135deg,${C.bgCard},${hexToRgba(gc,0.1)})`:C.bgCard,border:`1px solid ${gc?hexToRgba(gc,0.5):C.border}`,boxShadow:gc?`0 0 12px ${hexToRgba(gc,0.2)}`:'none',borderRadius:8,padding:'14px 16px',position:'relative' }}>
                {hasSetlist&&<div style={{ position:'absolute',top:10,right:10,fontSize:12 }}>📋</div>}
                <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8 }}>
                  <div>
                    <div style={{ fontFamily:"'Bebas Neue'",fontSize:'1.2rem',color:gc||C.teal,marginBottom:4,cursor:'pointer' }} onClick={()=>onShare(row.artist,row.shows)}>{row.artist}</div>
                    <div style={{ fontFamily:"'Space Mono',monospace",fontSize:8,color:C.gray }}>{row.shows.length} shows · {[...new Set(row.shows.map(s=>getYear(s.date)).filter(Boolean))].sort().join(', ')}</div>
                  </div>
                  <button onClick={()=>onShare(row.artist,row.shows)} style={{ background:'none',border:`1px solid ${C.border}`,color:C.gray,fontSize:8,borderRadius:3,padding:'2px 6px',cursor:'pointer',fontFamily:"'Space Mono'" }}>📤</button>
                </div>
                <div style={{ display:'flex',alignItems:'center',gap:8,marginTop:10,paddingTop:10,borderTop:`1px solid ${C.border}` }}>
                  <span style={{ fontFamily:"'Space Mono',monospace",fontSize:7,color:C.grayDim,textTransform:'uppercase',letterSpacing:'0.1em',flexShrink:0 }}>Genre:</span>
                  <select value={genre||''} onChange={e=>onSetGenre(row.artist,e.target.value||null)} style={{ flex:1,background:gc?hexToRgba(gc,0.15):C.bgCardAlt,border:`1px solid ${gc?hexToRgba(gc,0.4):C.border}`,borderRadius:4,color:gc||C.gray,fontSize:9,padding:'3px 6px',fontFamily:"'Space Mono'",cursor:'pointer' }}>
                    <option value="">— unset —</option>
                    {GENRES.map(g=><option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>
            );
          })}
          {!artistRows.length&&<div style={{ color:C.gray,textAlign:'center',gridColumn:'1/-1',padding:40 }}>No artists match your filters.</div>}
        </div>
      )}
    </div>
  );
}

// ─── MANAGE TAB ───────────────────────────────────────────────────────────────
function ManageTab({ concerts, onEdit, onAdd }) {
  const [search,setSearch]=useState(''), [page,setPage]=useState(1); const PER=30;
  const filtered=useMemo(()=>{ if(!search)return concerts; const q=search.toLowerCase(); return concerts.filter(c=>(c.bands||[]).some(b=>b.toLowerCase().includes(q))||(c.venue||'').toLowerCase().includes(q)||(c.city||'').toLowerCase().includes(q)||(c.festival_name||'').toLowerCase().includes(q)); },[concerts,search]);
  const paged=filtered.slice((page-1)*PER,page*PER), totalPages=Math.ceil(filtered.length/PER);
  return (
    <div style={{ padding:'24px 0' }} className="fade-in">
      <div style={{ display:'flex',gap:10,marginBottom:16 }}>
        <input style={{ ...inputSt,flex:1 }} placeholder="Search shows to edit..." value={search} onChange={e=>{ setSearch(e.target.value); setPage(1); }} />
        <Btn onClick={onAdd}>+ Add Show</Btn>
      </div>
      <div style={{ background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:8,overflow:'hidden' }}>
        <table style={{ width:'100%',borderCollapse:'collapse',fontSize:'0.78rem' }}>
          <thead><tr style={{ background:C.bgCardAlt }}>{['Date','Artists','Venue','City','Genre','Type','Setlist','Edit'].map(h=><th key={h} style={{ fontFamily:"'Space Mono',monospace",fontSize:8,letterSpacing:'0.15em',textTransform:'uppercase',padding:'10px 12px',textAlign:'left',color:C.tealDim,borderBottom:`1px solid ${C.border}` }}>{h}</th>)}</tr></thead>
          <tbody>
            {paged.map((c,i)=>(
              <tr key={c.id} className="row-hover" style={{ borderBottom:`1px solid ${C.border}`,background:i%2===1?C.bgCardAlt:'transparent' }} onClick={()=>onEdit(c)}>
                <td style={{ padding:'9px 12px',fontFamily:"'Space Mono',monospace",fontSize:'0.7rem',color:C.gray,whiteSpace:'nowrap' }}>{fmtDate(c.date)}</td>
                <td style={{ padding:'9px 12px',color:C.white,fontWeight:500 }}>{(c.bands||[]).slice(0,3).join(', ')}{c.bands?.length>3?` +${c.bands.length-3}`:''}</td>
                <td style={{ padding:'9px 12px',color:C.gray }}>{c.venue||'—'}</td>
                <td style={{ padding:'9px 12px',color:C.gray }}>{c.city||'—'}</td>
                <td style={{ padding:'9px 12px' }}>{c.genre?<GenreBadge genre={c.genre} color={GENRE_COLORS[c.genre]} small />:<span style={{ color:C.grayDim }}>—</span>}</td>
                <td style={{ padding:'9px 12px' }}>{c.is_festival?<Badge color={C.teal}>Fest</Badge>:<Badge color={C.grayDim} bg="transparent">Solo</Badge>}</td>
                <td style={{ padding:'9px 12px' }}>{c.has_setlist?<span style={{ color:C.gold }}>📋</span>:<span style={{ color:C.grayDim }}>—</span>}</td>
                <td style={{ padding:'9px 12px',color:C.tealDim }}>✎</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages>1&&<div style={{ display:'flex',justifyContent:'center',gap:5,marginTop:14 }}><Btn variant="secondary" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} style={{ padding:'5px 10px' }}>←</Btn>{Array.from({length:Math.min(7,totalPages)},(_,i)=>{ const p=page<=4?i+1:page+i-3; if(p<1||p>totalPages)return null; return <Btn key={p} variant={p===page?'primary':'secondary'} onClick={()=>setPage(p)} style={{ padding:'5px 10px' }}>{p}</Btn>; })}<Btn variant="secondary" onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} style={{ padding:'5px 10px' }}>→</Btn></div>}
    </div>
  );
}

// ─── USA HEATMAP ──────────────────────────────────────────────────────────────
// State abbreviation → [svgPath, labelX, labelY, cityOffsetX, cityOffsetY]
const STATE_PATHS = {
  AL:{d:"M 567 295 L 578 295 L 580 340 L 565 340 Z",lx:568,ly:318},
  AK:{d:"M 90 370 L 160 370 L 160 430 L 90 430 Z",lx:118,ly:403},
  AZ:{d:"M 168 265 L 215 265 L 215 320 L 168 320 Z",lx:185,ly:293},
  AR:{d:"M 530 280 L 565 280 L 565 310 L 530 310 Z",lx:542,ly:295},
  CA:{d:"M 110 200 L 165 185 L 175 265 L 125 285 L 110 260 Z",lx:133,ly:232},
  CO:{d:"M 255 230 L 315 230 L 315 270 L 255 270 Z",lx:280,ly:250},
  CT:{d:"M 720 168 L 732 168 L 732 178 L 720 178 Z",lx:722,ly:174},
  DE:{d:"M 705 195 L 715 195 L 715 210 L 705 210 Z",lx:706,ly:203},
  FL:{d:"M 575 340 L 640 340 L 645 385 L 600 395 L 575 370 Z",lx:603,ly:362},
  GA:{d:"M 578 295 L 615 295 L 615 340 L 580 340 Z",lx:592,ly:318},
  HI:{d:"M 220 410 L 280 410 L 280 435 L 220 435 Z",lx:245,ly:424},
  ID:{d:"M 175 155 L 215 145 L 220 205 L 195 210 L 175 195 Z",lx:193,ly:178},
  IL:{d:"M 540 210 L 562 210 L 562 270 L 540 270 Z",lx:546,ly:240},
  IN:{d:"M 562 210 L 583 210 L 583 260 L 562 260 Z",lx:567,ly:235},
  IA:{d:"M 490 200 L 540 200 L 540 230 L 490 230 Z",lx:508,ly:215},
  KS:{d:"M 390 255 L 450 255 L 450 285 L 390 285 Z",lx:413,ly:270},
  KY:{d:"M 575 255 L 635 255 L 635 278 L 575 278 Z",lx:598,ly:267},
  LA:{d:"M 510 320 L 560 320 L 565 355 L 520 360 L 510 345 Z",lx:532,ly:337},
  ME:{d:"M 740 130 L 762 125 L 768 158 L 745 162 Z",lx:750,ly:145},
  MD:{d:"M 685 205 L 720 200 L 722 215 L 690 218 Z",lx:699,ly:210},
  MA:{d:"M 725 162 L 760 158 L 762 172 L 728 175 Z",lx:738,ly:168},
  MI:{d:"M 562 175 L 605 170 L 608 205 L 565 210 Z",lx:580,ly:190},
  MN:{d:"M 468 155 L 510 150 L 512 200 L 470 200 Z",lx:486,ly:177},
  MS:{d:"M 545 295 L 570 295 L 568 345 L 545 342 Z",lx:551,ly:319},
  MO:{d:"M 490 240 L 540 238 L 542 280 L 492 282 Z",lx:509,ly:260},
  MT:{d:"M 215 145 L 310 138 L 312 188 L 218 195 Z",lx:258,ly:165},
  NE:{d:"M 385 220 L 450 218 L 452 252 L 387 254 Z",lx:413,ly:237},
  NV:{d:"M 160 195 L 200 188 L 208 260 L 168 268 Z",lx:180,ly:228},
  NH:{d:"M 730 148 L 742 145 L 744 170 L 732 172 Z",lx:733,ly:159},
  NJ:{d:"M 710 182 L 722 180 L 723 200 L 712 202 Z",lx:712,ly:191},
  NM:{d:"M 245 280 L 290 278 L 292 325 L 247 327 Z",lx:265,ly:303},
  NY:{d:"M 665 162 L 728 155 L 730 185 L 668 192 Z",lx:693,ly:173},
  NC:{d:"M 620 272 L 690 265 L 692 288 L 622 295 Z",lx:650,ly:280},
  ND:{d:"M 380 148 L 468 145 L 470 178 L 382 180 Z",lx:420,ly:163},
  OH:{d:"M 600 205 L 638 202 L 640 245 L 602 248 Z",lx:615,ly:225},
  OK:{d:"M 380 282 L 450 280 L 452 312 L 382 314 Z",lx:410,ly:297},
  OR:{d:"M 130 168 L 192 162 L 195 210 L 133 215 Z",lx:158,ly:190},
  PA:{d:"M 640 185 L 700 180 L 702 208 L 642 212 Z",lx:665,ly:197},
  RI:{d:"M 735 172 L 744 171 L 745 180 L 736 181 Z",lx:736,ly:177},
  SC:{d:"M 618 290 L 655 285 L 658 315 L 622 318 Z",lx:634,ly:302},
  SD:{d:"M 382 180 L 468 178 L 470 212 L 384 214 Z",lx:420,ly:196},
  TN:{d:"M 545 270 L 635 265 L 637 288 L 547 293 Z",lx:585,ly:279},
  TX:{d:"M 335 295 L 450 290 L 455 380 L 395 395 L 340 365 Z",lx:393,ly:340},
  UT:{d:"M 215 220 L 255 218 L 257 270 L 217 272 Z",lx:232,ly:245},
  VT:{d:"M 718 148 L 730 145 L 732 168 L 720 170 Z",lx:721,ly:158},
  VA:{d:"M 638 245 L 700 240 L 702 268 L 640 272 Z",lx:665,ly:257},
  WA:{d:"M 148 138 L 200 132 L 202 162 L 150 168 Z",lx:172,ly:152},
  WV:{d:"M 635 225 L 668 222 L 670 252 L 637 255 Z",lx:648,ly:238},
  WI:{d:"M 510 168 L 555 162 L 558 205 L 512 208 Z",lx:530,ly:186},
  WY:{d:"M 255 190 L 318 185 L 320 228 L 257 230 Z",lx:284,ly:208},
  DC:{d:"M 700 215 L 707 215 L 707 222 L 700 222 Z",lx:700,ly:219},
};

// City lat/lon → approximate SVG coords (viewBox 0 0 860 500)
const CITY_COORDS = {
  'Austin':    {x:393,y:345},'Manchester': {x:756,y:148},'Boston':     {x:746,y:165},
  'Portland':  {x:155,y:192},'Northampton':{x:728,y:167},'Bend':       {x:163,y:188},
  'Austin':    {x:393,y:345},'Dallas':     {x:420,y:315},'Houston':    {x:430,y:355},
  'Atlanta':   {x:590,y:310},'Nashville':  {x:562,y:272},'Chicago':    {x:548,y:218},
  'New York':  {x:706,y:182},'Los Angeles':{x:143,y:268},'San Francisco':{x:120,y:248},
  'Denver':    {x:285,y:252},'Seattle':    {x:165,y:148},'Minneapolis': {x:487,y:185},
  'New Orleans':{x:530,y:350},'Hartford':  {x:725,y:172},'Lowell':     {x:740,y:162},
  'Buffalo':   {x:660,y:183},'Northampton':{x:728,y:167},'San Antonio':{x:385,y:365},
  'Forest Grove':{x:148,y:193},'Bend':     {x:163,y:185},
};

function USAHeatmap({ concerts }) {
  const visitedStates=useMemo(()=>{
    const s=new Set();
    concerts.forEach(c=>{ if(c.state)s.add(c.state.toUpperCase().trim()); });
    return s;
  },[concerts]);

  const cityData=useMemo(()=>{
    const m={};
    concerts.forEach(c=>{ if(c.city){ m[c.city]=(m[c.city]||0)+1; } });
    return Object.entries(m).sort((a,b)=>b[1]-a[1]);
  },[concerts]);

  const maxCity=Math.max(...cityData.map(([,n])=>n),1);

  return (
    <div style={{ marginTop:16,marginBottom:16 }}>
      <Card neon style={{ padding:'20px 24px' }}>
        <CardTitle>Concert Map 🗺️ — {visitedStates.size} States Visited</CardTitle>
        <div style={{ position:'relative',width:'100%',paddingBottom:'58%',overflow:'hidden' }}>
          <svg viewBox="80 125 780 300" style={{ position:'absolute',top:0,left:0,width:'100%',height:'100%' }} xmlns="http://www.w3.org/2000/svg">
            {/* Render all states */}
            {Object.entries(STATE_PATHS).map(([abbr,{d,lx,ly}])=>{
              const visited=visitedStates.has(abbr);
              return (
                <g key={abbr}>
                  <path d={d}
                    fill={visited?hexToRgba(C.teal,0.35):hexToRgba('#ffffff',0.04)}
                    stroke={visited?C.teal:'#2a3a4a'}
                    strokeWidth={visited?1.5:0.8}
                    style={{ filter:visited?`drop-shadow(0 0 4px ${C.teal}66)`:'none', transition:'all 0.3s' }}
                  />
                  <text x={lx} y={ly} textAnchor="middle" style={{ fontSize:'5px',fontFamily:"'Space Mono',monospace",fill:visited?C.teal:'#445566',fontWeight:visited?'bold':'normal',pointerEvents:'none' }}>{abbr}</text>
                </g>
              );
            })}

            {/* City bubbles */}
            {cityData.slice(0,20).map(([city,count])=>{
              const coords=CITY_COORDS[city];
              if(!coords) return null;
              const r=Math.max(4,Math.min(22,4+(count/maxCity)*18));
              return (
                <g key={city}>
                  <circle cx={coords.x} cy={coords.y} r={r}
                    fill={hexToRgba(C.gold,0.25)}
                    stroke={C.gold}
                    strokeWidth={1.5}
                    style={{ filter:`drop-shadow(0 0 ${r/2}px ${C.gold}88)` }}
                  />
                  {count>5&&<text x={coords.x} y={coords.y+1} textAnchor="middle" dominantBaseline="middle" style={{ fontSize:`${Math.max(4,Math.min(7,r*0.65))}px`,fontFamily:"'Space Mono',monospace",fill:'#fff',fontWeight:'bold',pointerEvents:'none' }}>{count}</text>}
                </g>
              );
            })}
          </svg>
        </div>
        {/* Legend */}
        <div style={{ display:'flex',gap:20,marginTop:8,flexWrap:'wrap' }}>
          <div style={{ display:'flex',alignItems:'center',gap:6 }}>
            <div style={{ width:14,height:14,borderRadius:2,background:hexToRgba(C.teal,0.35),border:`1px solid ${C.teal}` }} />
            <span style={{ fontFamily:"'Space Mono',monospace",fontSize:8,color:C.gray }}>Visited state</span>
          </div>
          <div style={{ display:'flex',alignItems:'center',gap:6 }}>
            <div style={{ width:14,height:14,borderRadius:'50%',background:hexToRgba(C.gold,0.25),border:`1px solid ${C.gold}` }} />
            <span style={{ fontFamily:"'Space Mono',monospace",fontSize:8,color:C.gray }}>City bubble (sized by show count)</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ─── POSTER GENERATOR ─────────────────────────────────────────────────────────
const POSTER_TEMPLATES = [
  { id:0, name:'NEON NOIR', bg:'#050510', accent:'#00f2ff', accent2:'#ff0077', font:'Bebas Neue', style:'cyber' },
  { id:1, name:'DESERT HEAT', bg:'#1a0a00', accent:'#ff6600', accent2:'#ffcc00', font:'Bebas Neue', style:'warm' },
  { id:2, name:'FOREST GROVE', bg:'#010f08', accent:'#00cc66', accent2:'#88ffaa', font:'Bebas Neue', style:'nature' },
  { id:3, name:'COSMIC VOID', bg:'#05000f', accent:'#9966ff', accent2:'#ff66cc', font:'Bebas Neue', style:'cosmic' },
  { id:4, name:'BLOOD MOON', bg:'#0f0000', accent:'#ff3300', accent2:'#ff9900', font:'Bebas Neue', style:'dark' },
  { id:5, name:'ICE PALACE', bg:'#00050f', accent:'#00cfff', accent2:'#ffffff', font:'Bebas Neue', style:'cold' },
  { id:6, name:'GOLDEN AGE', bg:'#0a0800', accent:'#ffcc00', accent2:'#ff9900', font:'Bebas Neue', style:'vintage' },
  { id:7, name:'ULTRAVIOLET', bg:'#08000f', accent:'#cc00ff', accent2:'#ff00aa', font:'Bebas Neue', style:'uv' },
  { id:8, name:'COPPER WIRE', bg:'#0a0500', accent:'#cc7733', accent2:'#ffaa55', font:'Bebas Neue', style:'copper' },
  { id:9, name:'DEEP SEA', bg:'#000a0f', accent:'#00aabb', accent2:'#55eeff', font:'Bebas Neue', style:'ocean' },
  { id:10,name:'MIDNIGHT SUN', bg:'#0f0800', accent:'#ffaa00', accent2:'#ff5500', font:'Bebas Neue', style:'sunset' },
  { id:11,name:'CHROME PUNK', bg:'#080808', accent:'#ffffff', accent2:'#ff3300', font:'Bebas Neue', style:'punk' },
];

const FEST_NAME_PARTS = {
  'Indie Rock':    [['Cedar','Hollow','Silver','Petal'],['Wire','Bloom','Pines','Hollow']],
  'Electronic':   [['Neon','Circuit','Static','Pulse'],['Grid','Wave','Surge','Current']],
  'Jam':          [['Rolling','Wandering','Spiral','Endless'],['Current','River','Flow','Grove']],
  'Folk':         [['Timber','Ember','Moss','Willow'],['Creek','Ridge','Vale','Hearth']],
  'Alternative':  [['Fault','Storm','Drift','Void'],['Line','Break','Surge','Shift']],
  'Punk':         [['Concrete','Iron','Rust','Broken'],['Teeth','Wire','Fist','Noise']],
  'Classic Rock': [['Thunder','Stone','Fender','Chrome'],['Mountain','Road','Highway','Peak']],
  'Hip Hop':      [['Block','Street','Crown','Signal'],['Party','Cypher','Summit','Cipher']],
  'Experimental': [['Strange','Liminal','Fractal','Echo'],['Ritual','Chamber','Loop','Signal']],
  'default':      [['Open','Free','Wild','Lost'],['Ground','Field','Valley','Plains']],
};

function generateFestName(dominantGenre) {
  const parts=FEST_NAME_PARTS[dominantGenre]||FEST_NAME_PARTS['default'];
  const a=parts[0][Math.floor(Math.random()*parts[0].length)];
  const b=parts[1][Math.floor(Math.random()*parts[1].length)];
  const suffixes=['Festival','Fest','Music Festival','Gathering','Sessions','Summit'];
  return `${a} ${b} ${suffixes[Math.floor(Math.random()*suffixes.length)]}`;
}

function PosterGeneratorTab({ concerts, genreMap, allSetsList }) {
  const [genreMix, setGenreMix] = useState({ 'Indie Rock':30,'Electronic':20,'Folk':20,'Jam':15,'Alternative':15 });
  const [templateIdx, setTemplateIdx] = useState(0);
  const [festName, setFestName] = useState('');
  const [generated, setGenerated] = useState(null);
  const [headlinerCount, setHeadlinerCount] = useState(2);
  const [totalActs, setTotalActs] = useState(20);

  const availableGenres = useMemo(()=>GENRES.filter(g=>g!=='Other'),[]);

  const totalPct = Object.values(genreMix).reduce((a,b)=>a+b,0);

  // Artist pool: build from our data, ranked by times seen
  const artistPool = useMemo(()=>{
    const m={};
    allSetsList.forEach(s=>{
      const g=genreMap[s.artist]||s.genre||null;
      if(!g||g==='Other')return;
      if(!m[s.artist])m[s.artist]={artist:s.artist,genre:g,count:0};
      m[s.artist].count++;
    });
    return Object.values(m).sort((a,b)=>b.count-a.count);
  },[allSetsList,genreMap]);

  const generate = () => {
    const tpl = POSTER_TEMPLATES[templateIdx];
    // Normalize mix
    const total = Object.values(genreMix).reduce((a,b)=>a+b,0)||100;
    const normalized = {};
    Object.entries(genreMix).forEach(([g,v])=>{ normalized[g]=Math.round((v/total)*totalActs); });

    // Pick artists per genre
    const picked = [];
    const used = new Set();
    Object.entries(normalized).forEach(([genre,count])=>{
      if(count<=0)return;
      const pool=artistPool.filter(a=>a.genre===genre&&!used.has(a.artist));
      pool.slice(0,count).forEach(a=>{ picked.push({...a}); used.add(a.artist); });
    });

    // Sort by count desc for billing order
    picked.sort((a,b)=>b.count-a.count);

    const dominantGenre=Object.entries(genreMix).sort((a,b)=>b[1]-a[1])[0]?.[0]||'default';
    const name=festName.trim()||generateFestName(dominantGenre);

    setGenerated({ tpl, artists:picked, name, headlinerCount });
  };

  const tpl = POSTER_TEMPLATES[templateIdx];

  return (
    <div style={{ padding:'24px 0' }} className="fade-in">
      <div style={{ textAlign:'center',marginBottom:32 }}>
        <div style={{ fontFamily:"'Bebas Neue'",fontSize:'clamp(2rem,5vw,3.5rem)',color:C.white,letterSpacing:'0.06em',marginBottom:8 }}>🎨 POSTER <span style={{ color:C.teal }}>GENERATOR</span></div>
        <div style={{ fontFamily:"'Space Mono',monospace",fontSize:9,color:C.gray }}>Build your dream festival from your concert history</div>
      </div>

      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:24,marginBottom:32 }}>
        {/* Left: Controls */}
        <div>
          <Card neon style={{ marginBottom:16 }}>
            <CardTitle>Genre Mix</CardTitle>
            <div style={{ fontFamily:"'Space Mono',monospace",fontSize:8,color:totalPct===100?C.green:totalPct>100?C.red:C.gold,marginBottom:12 }}>Total: {totalPct}% {totalPct!==100&&'(should equal 100)'}</div>
            {availableGenres.map(g=>(
              <div key={g} style={{ display:'flex',alignItems:'center',gap:10,marginBottom:8 }}>
                <div style={{ width:10,height:10,borderRadius:'50%',background:GENRE_COLORS[g],flexShrink:0 }} />
                <span style={{ fontFamily:"'Space Mono',monospace",fontSize:8,color:C.gray,width:90,flexShrink:0 }}>{g}</span>
                <input type="range" min={0} max={100} value={genreMix[g]||0}
                  onChange={e=>setGenreMix(p=>({...p,[g]:+e.target.value}))}
                  style={{ flex:1,accentColor:GENRE_COLORS[g] }}
                />
                <span style={{ fontFamily:"'Space Mono',monospace",fontSize:9,color:GENRE_COLORS[g],width:32,textAlign:'right',flexShrink:0 }}>{genreMix[g]||0}%</span>
              </div>
            ))}
          </Card>

          <Card neon style={{ marginBottom:16 }}>
            <CardTitle>Options</CardTitle>
            <div style={{ marginBottom:12 }}>
              <div style={{ fontFamily:"'Space Mono',monospace",fontSize:8,color:C.gray,marginBottom:6 }}>TOTAL ACTS: {totalActs}</div>
              <input type="range" min={5} max={40} value={totalActs} onChange={e=>setTotalActs(+e.target.value)} style={{ width:'100%',accentColor:C.teal }} />
            </div>
            <div style={{ marginBottom:12 }}>
              <div style={{ fontFamily:"'Space Mono',monospace",fontSize:8,color:C.gray,marginBottom:6 }}>HEADLINERS: {headlinerCount}</div>
              <input type="range" min={1} max={4} value={headlinerCount} onChange={e=>setHeadlinerCount(+e.target.value)} style={{ width:'100%',accentColor:C.gold }} />
            </div>
            <div style={{ marginBottom:12 }}>
              <div style={{ fontFamily:"'Space Mono',monospace",fontSize:8,color:C.gray,marginBottom:6 }}>FESTIVAL NAME (leave blank to auto-generate)</div>
              <input value={festName} onChange={e=>setFestName(e.target.value)} placeholder="e.g. Neon Pines Festival" style={{ ...inputSt,width:'100%' }} />
            </div>
          </Card>

          {/* Template picker */}
          <Card neon>
            <CardTitle>Poster Template</CardTitle>
            <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:6 }}>
              {POSTER_TEMPLATES.map((t,i)=>(
                <div key={t.id} onClick={()=>setTemplateIdx(i)}
                  style={{ background:t.bg,border:`2px solid ${i===templateIdx?t.accent:C.border}`,borderRadius:6,padding:'8px 4px',cursor:'pointer',textAlign:'center',boxShadow:i===templateIdx?`0 0 12px ${t.accent}66`:'none',transition:'all 0.2s' }}>
                  <div style={{ fontFamily:"'Space Mono',monospace",fontSize:6,color:t.accent,textTransform:'uppercase',letterSpacing:1,lineHeight:1.3 }}>{t.name}</div>
                </div>
              ))}
            </div>
          </Card>

          <div style={{ marginTop:20 }}>
            <Btn onClick={generate} style={{ width:'100%',padding:'14px',fontSize:13,letterSpacing:'0.2em',background:`linear-gradient(90deg,${tpl.accent},${tpl.accent2})`,color:'#000' }}>⚡ GENERATE POSTER</Btn>
          </div>
        </div>

        {/* Right: Poster preview */}
        <div>
          {generated ? (() => {
            const { tpl:t, artists, name, headlinerCount:hc } = generated;
            const headliners = artists.slice(0,hc);
            const midTier = artists.slice(hc,hc+Math.ceil((artists.length-hc)/2));
            const undercard = artists.slice(hc+Math.ceil((artists.length-hc)/2));
            return (
              <div style={{ background:t.bg,borderRadius:12,overflow:'hidden',border:`2px solid ${t.accent}`,boxShadow:`0 0 40px ${hexToRgba(t.accent,0.3)}`,padding:'40px 32px',fontFamily:"'Bebas Neue'",textAlign:'center',position:'relative',minHeight:600 }}>
                {/* Background pattern */}
                <div style={{ position:'absolute',inset:0,background:`radial-gradient(ellipse at 50% 0%,${hexToRgba(t.accent,0.15)},transparent 70%)`,pointerEvents:'none' }} />
                <div style={{ position:'absolute',inset:0,background:`radial-gradient(ellipse at 50% 100%,${hexToRgba(t.accent2,0.1)},transparent 70%)`,pointerEvents:'none' }} />

                <div style={{ position:'relative',zIndex:1 }}>
                  {/* Top decorative line */}
                  <div style={{ height:2,background:`linear-gradient(90deg,transparent,${t.accent},${t.accent2},transparent)`,marginBottom:24 }} />

                  {/* Festival name */}
                  <div style={{ fontSize:'clamp(2rem,5vw,3.5rem)',letterSpacing:'0.08em',color:t.accent,lineHeight:1,marginBottom:4,textShadow:`0 0 30px ${hexToRgba(t.accent,0.5)}` }}>{name}</div>
                  <div style={{ fontFamily:"'Space Mono',monospace",fontSize:9,color:t.accent2,letterSpacing:'0.3em',marginBottom:32 }}>JUNE 2026 · PRESENTED BY YOUR CONCERT HISTORY</div>

                  {/* Headliners */}
                  {headliners.map((a,i)=>(
                    <div key={a.artist} style={{ fontSize:i===0?'clamp(2.5rem,6vw,4rem)':'clamp(1.8rem,4vw,2.8rem)', color:i===0?'#ffffff':t.accent, letterSpacing:'0.06em', lineHeight:1.1, marginBottom:8, textShadow:i===0?`0 0 20px ${hexToRgba(t.accent,0.4)}`:'none' }}>{a.artist}</div>
                  ))}

                  {/* Divider */}
                  <div style={{ display:'flex',alignItems:'center',gap:12,margin:'20px 0' }}>
                    <div style={{ flex:1,height:1,background:`linear-gradient(90deg,transparent,${t.accent}88)` }} />
                    <div style={{ fontFamily:"'Space Mono',monospace",fontSize:7,color:t.accent,letterSpacing:'0.2em' }}>ALSO FEATURING</div>
                    <div style={{ flex:1,height:1,background:`linear-gradient(90deg,${t.accent}88,transparent)` }} />
                  </div>

                  {/* Mid-tier */}
                  <div style={{ fontSize:'clamp(1rem,2.5vw,1.6rem)',color:t.accent2,letterSpacing:'0.05em',lineHeight:1.6,marginBottom:16 }}>
                    {midTier.map(a=>a.artist).join(' · ')}
                  </div>

                  {/* Undercard */}
                  {undercard.length>0&&(
                    <div style={{ fontFamily:"'Space Mono',monospace",fontSize:'clamp(6px,1.2vw,9px)',color:hexToRgba(t.accent2,0.6),letterSpacing:'0.12em',lineHeight:2,marginBottom:24 }}>
                      {undercard.map(a=>a.artist).join('  ·  ')}
                    </div>
                  )}

                  {/* Bottom decorative */}
                  <div style={{ height:1,background:`linear-gradient(90deg,transparent,${t.accent},${t.accent2},transparent)`,marginTop:24,marginBottom:16 }} />
                  <div style={{ fontFamily:"'Space Mono',monospace",fontSize:7,color:hexToRgba(t.accent,0.5),letterSpacing:'0.2em' }}>ALL ARTISTS PERSONALLY CURATED FROM YOUR 27-YEAR CONCERT HISTORY</div>
                </div>
              </div>
            );
          })() : (
            <div style={{ background:C.bgCard,border:`2px dashed ${C.border}`,borderRadius:12,minHeight:600,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:16 }}>
              <div style={{ fontSize:'4rem' }}>🎨</div>
              <div style={{ fontFamily:"'Bebas Neue'",fontSize:'1.5rem',color:C.grayDim }}>YOUR POSTER APPEARS HERE</div>
              <div style={{ fontFamily:"'Space Mono',monospace",fontSize:9,color:C.grayDim }}>Configure your mix and hit Generate</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
const TABS = [
  ['dashboard','⚡ Dashboard',null],
  ['timeline','⏳ Timeline',null],
  ['byDay','📅 By Day',null],
  ['byFest','🎪 By Festival','fest-group'],
  ['passport','🗺️ Passport','fest-group'],
  ['browse','🔍 Browse',null],
  ['hof','🏆 Hall of Fame',null],
  ['vault','📋 Setlist Vault',null],
  ['poster','🎨 Poster Generator',null],
  ['manage','⚙️ Manage',null],
];

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [concerts,setConcerts]=useState([]), [loading,setLoading]=useState(true);
  const [activeTab,setActiveTab]=useState('dashboard'), [editTarget,setEditTarget]=useState(null);
  const [shareCard,setShareCard]=useState(null), [upcoming,setUpcoming]=useState([]);
  const [upcomingModal,setUpcomingModal]=useState(null);
  const [search,setSearch]=useState(''), [yearFilter,setYearFilter]=useState('all');
  const [festFilter,setFestFilter]=useState('all'), [browseView,setBrowseView]=useState('shows');
  const [sortCol,setSortCol]=useState('date'), [sortDir,setSortDir]=useState('desc'), [page,setPage]=useState(1);

  const genreMap=useMemo(()=>buildGenreMap(concerts),[concerts]);

  const allSetsList=useMemo(()=>{
    const r=[];
    concerts.forEach(c=>{ const bands=Array.isArray(c.bands)?c.bands:[c.artist].filter(Boolean); bands.forEach(band=>{ if(band)r.push({...c,artist:band}); }); });
    return r;
  },[concerts]);

  const years=useMemo(()=>[...new Set(concerts.map(c=>getYear(c.date)).filter(Boolean))].sort(),[concerts]);
  const stateCounts=useMemo(()=>{ const m={}; concerts.forEach(c=>{ if(c.state)m[c.state]=(m[c.state]||0)+1; }); return Object.entries(m).sort((a,b)=>b[1]-a[1]); },[concerts]);

  const headerStats=useMemo(()=>({
    totalShows:concerts.length, totalSets:allSetsList.length,
    uniqueArtists:new Set(allSetsList.map(s=>s.artist)).size,
    festDays:concerts.filter(c=>c.is_festival).length,
    setlistCount:concerts.filter(c=>c.has_setlist||c.has_setlist_names).length,
  }),[concerts,allSetsList]);

  const dashboardStats=useMemo(()=>{
    if(!concerts.length) return{topBand:'None',topCount:0,totalSets:0,stateCount:0,venueCount:0,newDiscoveries:0};
    const ac={}; allSetsList.forEach(s=>{ ac[s.artist]=(ac[s.artist]||0)+1; });
    const top=Object.entries(ac).sort((a,b)=>b[1]-a[1])[0];
    const states=new Set(concerts.map(c=>c.state).filter(Boolean));
    const venues=new Set(concerts.map(c=>c.venue).filter(Boolean));
    const recentBands=new Set(concerts.filter(c=>c.date>='2025').flatMap(c=>Array.isArray(c.bands)?c.bands:[c.artist]));
    const oldBands=new Set(concerts.filter(c=>c.date<'2025').flatMap(c=>Array.isArray(c.bands)?c.bands:[c.artist]));
    return{topBand:top?top[0]:'None',topCount:top?top[1]:0,totalSets:allSetsList.length,stateCount:states.size,venueCount:venues.size,newDiscoveries:[...recentBands].filter(b=>!oldBands.has(b)).length};
  },[concerts,allSetsList]);

  const genreStats=useMemo(()=>{ const counts={}; allSetsList.forEach(s=>{ const g=genreMap[s.artist]||s.genre||'Other'; counts[g]=(counts[g]||0)+1; }); return Object.entries(counts).map(([name,count])=>({name,count,color:GENRE_COLORS[name]||GENRE_COLORS['Other']})).sort((a,b)=>b.count-a.count); },[allSetsList,genreMap]);
  const timelineData=useMemo(()=>{ const m={}; allSetsList.forEach(s=>{ const y=getYear(s.date); if(y)m[y]=(m[y]||0)+1; }); return Object.entries(m).sort((a,b)=>+a[0]-+b[0]).map(([year,count])=>({year:String(year).slice(2),count,fullYear:+year})); },[allSetsList]);
  const artistCounts=useMemo(()=>{ const m={}; allSetsList.forEach(s=>{ m[s.artist]=(m[s.artist]||0)+1; }); return Object.entries(m).sort((a,b)=>b[1]-a[1]).map(([name,count])=>({name,count})); },[allSetsList]);
  const festBreakdown=useMemo(()=>{ const m={}; concerts.filter(c=>c.is_festival&&c.festival_name).forEach(c=>{ m[c.festival_name]=(m[c.festival_name]||0)+1; }); return Object.entries(m).sort((a,b)=>b[1]-a[1]); },[concerts]);
  const passport=useMemo(()=>{ const m={}; concerts.filter(c=>c.is_festival&&c.festival_name).forEach(c=>{ if(!m[c.festival_name])m[c.festival_name]={name:c.festival_name,days:0,years:new Set()}; m[c.festival_name].days++; const y=getYear(c.date); if(y)m[c.festival_name].years.add(y); }); return Object.values(m).map(f=>({...f,years:[...f.years].sort()})).sort((a,b)=>b.days-a.days); },[concerts]);
  const festGroupings=useMemo(()=>{ const m={}; concerts.filter(c=>c.is_festival&&c.festival_name).forEach(c=>{ const yr=getYear(c.date)||'Unknown'; if(!m[c.festival_name])m[c.festival_name]={name:c.festival_name,years:{}}; if(!m[c.festival_name].years[yr])m[c.festival_name].years[yr]=[]; m[c.festival_name].years[yr].push(c); }); return Object.values(m).sort((a,b)=>Object.values(b.years).flat().length-Object.values(a.years).flat().length); },[concerts]);

  const applyFilters=useCallback((list,isSet=false)=>{ let d=list; if(yearFilter!=='all')d=d.filter(r=>getYear(r.date)===+yearFilter); if(festFilter==='fest')d=d.filter(r=>r.is_festival); if(festFilter==='solo')d=d.filter(r=>!r.is_festival); if(search){const q=search.toLowerCase();d=d.filter(r=>{ const bands=isSet?[r.artist]:(r.bands||[]); return bands.some(b=>b.toLowerCase().includes(q))||(r.venue||'').toLowerCase().includes(q)||(r.city||'').toLowerCase().includes(q)||(r.festival_name||'').toLowerCase().includes(q)||(r.festival_day||'').toLowerCase().includes(q); });} return d; },[yearFilter,festFilter,search]);

  const filteredSets=useMemo(()=>{ const d=applyFilters(allSetsList,true); return [...d].sort((a,b)=>{ const av=sortCol==='artist'?(a.artist||'').toLowerCase():(String(a[sortCol]||'')).toLowerCase(); const bv=sortCol==='artist'?(b.artist||'').toLowerCase():(String(b[sortCol]||'')).toLowerCase(); if(sortCol==='date')return sortDir==='asc'?av.localeCompare(bv):bv.localeCompare(av); if(av<bv)return sortDir==='asc'?-1:1; if(av>bv)return sortDir==='asc'?1:-1; return 0; }); },[allSetsList,applyFilters,sortCol,sortDir]);
  const artistRows=useMemo(()=>{ if(browseView!=='artists')return[]; const m={}; applyFilters(allSetsList,true).forEach(s=>{ if(!m[s.artist])m[s.artist]={artist:s.artist,shows:[]}; m[s.artist].shows.push(s); }); return Object.values(m).sort((a,b)=>b.shows.length-a.shows.length); },[allSetsList,applyFilters,browseView]);
  const dayGroups=useMemo(()=>applyFilters(concerts).sort((a,b)=>(b.date||'').localeCompare(a.date||'')),[concerts,applyFilters]);
  const paged=filteredSets.slice((page-1)*PER_PAGE,page*PER_PAGE), totalPages=Math.ceil(filteredSets.length/PER_PAGE);

  useEffect(()=>{ fetchConcerts(); fetchUpcoming(); },[]);
  async function fetchConcerts(){const{data}=await supabase.from('concerts').select('*').order('date',{ascending:false}); if(data)setConcerts(data); setLoading(false);}
  async function fetchUpcoming(){const{data}=await supabase.from('upcoming_concerts').select('*').order('date',{ascending:true}); if(data)setUpcoming(data);}
  async function handleSave(id,payload){if(id)await supabase.from('concerts').update(payload).eq('id',id);else await supabase.from('concerts').insert([payload]); fetchConcerts(); setEditTarget(null);}
  async function handleDelete(id){if(window.confirm('Delete show?')){await supabase.from('concerts').delete().eq('id',id); fetchConcerts(); setEditTarget(null);}}
  async function handleSetGenre(artist,genre){const ids=concerts.filter(c=>(c.bands||[]).includes(artist)).map(c=>c.id); if(!ids.length)return; await supabase.from('concerts').update({genre:genre||null}).in('id',ids); fetchConcerts();}
  async function handleUpcomingSave(id,payload){if(id)await supabase.from('upcoming_concerts').update(payload).eq('id',id);else await supabase.from('upcoming_concerts').insert([payload]); fetchUpcoming(); setUpcomingModal(null);}
  async function handleUpcomingDelete(id){if(window.confirm('Delete?')){await supabase.from('upcoming_concerts').delete().eq('id',id); fetchUpcoming(); setUpcomingModal(null);}}

  if(loading) return <div style={{ background:C.bg,minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center' }}><div style={{ fontFamily:"'Bebas Neue'",fontSize:'2rem',color:C.teal,letterSpacing:'0.15em' }}>LOADING</div></div>;

  return (
    <div style={{ background:C.bg,minHeight:'100vh',paddingBottom:60 }}>
      <MarqueeStyles />
      {shareCard&&<ShareCard artist={shareCard.artist} shows={shareCard.shows} onClose={()=>setShareCard(null)} />}
      {editTarget&&<EditModal concert={editTarget==='new'?null:editTarget} onClose={()=>setEditTarget(null)} onSave={handleSave} onDelete={handleDelete} />}
      {upcomingModal!==null&&<UpcomingModal show={upcomingModal==='new'?null:upcomingModal} onClose={()=>setUpcomingModal(null)} onSave={handleUpcomingSave} onDelete={handleUpcomingDelete} />}

      {/* ── STATS HEADER BAR ── */}
      <div style={{ background:`linear-gradient(180deg,#050508 0%,${C.bgCard} 100%)`,borderBottom:`1px solid ${C.teal}22`,padding:'0 24px' }}>
        <div style={{ maxWidth:1200,margin:'0 auto' }}>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',borderBottom:`1px solid ${C.border}` }}>
            {[[headerStats.totalSets.toLocaleString(),'TOTAL SETS','individual performances'],[headerStats.uniqueArtists,'UNIQUE ARTISTS','bands & performers'],[headerStats.totalShows,'SHOW DAYS',`${headerStats.festDays} fest · ${headerStats.totalShows-headerStats.festDays} solo`],[headerStats.setlistCount,'SETLISTS','physical collections 📋']].map(([val,label,sub])=>(
              <div key={label} style={{ padding:'20px 24px',borderRight:`1px solid ${C.border}`,textAlign:'center' }}>
                <div style={{ fontFamily:"'Bebas Neue'",fontSize:'clamp(2rem,4vw,3rem)',color:C.white,lineHeight:1 }}>{val}</div>
                <div style={{ fontFamily:"'Space Mono',monospace",fontSize:8,letterSpacing:'0.2em',textTransform:'uppercase',color:C.tealDim,margin:'6px 0 3px' }}>{label}</div>
                <div style={{ fontFamily:"'Space Mono',monospace",fontSize:7,color:C.grayDim,fontStyle:'italic' }}>{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── NAV ── */}
      <nav style={{ background:C.bgCard,borderBottom:`1px solid ${C.teal}33`,display:'flex',overflowX:'auto',position:'sticky',top:0,zIndex:200 }}>
        {TABS.map(([id,label,group])=>(
          <button key={id} onClick={()=>setActiveTab(id)} style={{ fontFamily:"'Space Mono'",fontSize:10,color:activeTab===id?C.teal:C.gray,background:group==='fest-group'?'rgba(0,229,204,0.06)':'none',border:'none',borderBottom:activeTab===id?`2px solid ${C.teal}`:'2px solid transparent',borderTop:group==='fest-group'?`1px solid ${C.teal}33`:'1px solid transparent',padding:'12px 16px',cursor:'pointer',whiteSpace:'nowrap',flexShrink:0 }}>{label}</button>
        ))}
      </nav>

      <main style={{ maxWidth:1200,margin:'0 auto',padding:'0 20px' }}>

        {/* ════ DASHBOARD ════ */}
        {activeTab==='dashboard'&&(
          <>
            <OnThisDay concerts={concerts} />

            {/* Row 1: Insights | Upcoming | Random */}
            <div style={{ display:'grid',gridTemplateColumns:'1fr 2fr 1fr',gap:16,marginBottom:16,marginTop:16 }}>
              <ArtistInsights concerts={concerts} />

              {/* Upcoming shows */}
              <div style={{ background:'#0a0a0a',border:'3px solid #222',borderRadius:12,overflow:'hidden',boxShadow:'0 0 30px rgba(255,204,0,0.15)' }}>
                <div style={{ background:'#ffcc00',color:'#000',padding:'4px 0',overflow:'hidden',borderBottom:'2px solid #000' }}>
                  <div className="marquee-text" style={{ fontFamily:"'Space Mono'",fontSize:10,fontWeight:'900',whiteSpace:'nowrap',letterSpacing:1 }}>FOR YOUR CONSIDERATION • STAGING THE VIBE • TICKETS SECURED? • TOUR BUS INBOUND • FOR YOUR CONSIDERATION • STAGING THE VIBE • TICKETS SECURED? • TOUR BUS INBOUND •&nbsp;</div>
                </div>
                <div style={{ padding:'12px 16px' }}>
                  <div style={{ display:'flex',justifyContent:'flex-end',marginBottom:10 }}>
                    <button onClick={()=>setUpcomingModal('new')} style={{ background:'#ffcc00',color:'#000',border:'none',fontSize:9,fontWeight:'900',padding:'6px 14px',cursor:'pointer',borderRadius:4,fontFamily:"'Space Mono'",letterSpacing:'0.1em' }}>+ ADD SHOW</button>
                  </div>
                  <div style={{ maxHeight:200,overflowY:'auto' }}>
                    {upcoming.sort((a,b)=>a.date.localeCompare(b.date)).map((show,i)=>(
                      <div key={show.id||i} style={{ display:'grid',gridTemplateColumns:'auto 1fr auto auto',alignItems:'center',gap:12,marginBottom:0,padding:'10px 0',borderBottom:'1px solid #1a1a1a' }}>
                        <div style={{ fontFamily:"'Space Mono'",fontSize:9,color:'#888',whiteSpace:'nowrap' }}>{fmtDateShort(show.date)}</div>
                        <div style={{ fontFamily:"'Bebas Neue'",fontSize:'1.2rem',color:'#ffcc00',letterSpacing:'0.06em',lineHeight:1,textAlign:'center' }}>{show.artist}{show.venue?<span style={{ fontFamily:"'Space Mono'",fontSize:8,color:'#666',display:'block',fontFamily:'inherit',fontSize:'0.7rem' }}>{show.venue}</span>:null}</div>
                        <span style={{ fontFamily:"'Space Mono'",fontSize:7,color:'#ffcc00',background:'rgba(255,204,0,0.15)',border:'1px solid rgba(255,204,0,0.3)',padding:'2px 6px',borderRadius:3,whiteSpace:'nowrap' }}>{show.status||'TICKETS BOUGHT'}</span>
                        <button onClick={()=>setUpcomingModal(show)} style={{ background:'none',border:'1px solid #333',color:'#999',cursor:'pointer',fontSize:9,borderRadius:3,padding:'3px 8px',fontFamily:"'Space Mono'" }}>EDIT</button>
                      </div>
                    ))}
                    {!upcoming.length&&<div style={{ color:'#333',fontFamily:"'Space Mono'",fontSize:9,textAlign:'center',padding:20 }}>NO SHOWS QUEUED</div>}
                  </div>
                </div>
              </div>

              <RandomShow concerts={concerts} />
            </div>

            {/* Row 2: Sonic DNA + Bar Chart */}
            <div style={{ display:'grid',gridTemplateColumns:'1fr 2.5fr',gap:16,marginBottom:16 }}>
              <SonicDNA stats={genreStats} />
              <Card neon>
                <CardTitle>Sets Per Year</CardTitle>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={timelineData} margin={{ top:10,right:10,bottom:0,left:-20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                    <XAxis dataKey="year" tick={{ fontSize:8,fontFamily:"'Space Mono'",fill:C.gray }} />
                    <YAxis tick={{ fontSize:8,fontFamily:"'Space Mono'",fill:C.gray }} />
                    <Tooltip contentStyle={{ background:C.bgCard,border:`1px solid ${C.teal}`,fontSize:10 }} />
                    <Bar dataKey="count" fill={C.teal} radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {/* Row 3: Donut | Fests | Decade */}
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:16,marginBottom:16 }}>
              <Card neon><CardTitle>Fest vs Standalone</CardTitle><DonutChart fest={headerStats.festDays} solo={headerStats.totalShows-headerStats.festDays} /></Card>
              <Card neon><CardTitle>Top Festivals</CardTitle><TopFestBlocks festBreakdown={festBreakdown} /></Card>
              <Card neon><CardTitle>By Decade</CardTitle><DecadeBlocks sets={allSetsList} /></Card>
            </div>

            {/* Row 4: Most Seen | Setlist Spotlight */}
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16 }}>
              <Card neon>
                <CardTitle>Most Seen Artists</CardTitle>
                {artistCounts.slice(0,6).map((a,i)=>{ const gc=genreMap[a.name]?GENRE_COLORS[genreMap[a.name]]:null; return (
                  <div key={a.name} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:`1px solid ${C.border}` }}>
                    <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                      <span style={{ fontFamily:"'Space Mono',monospace",fontSize:8,color:C.grayDim }}>#{i+1}</span>
                      <span style={{ fontSize:'0.85rem',color:C.white }}>{a.name}</span>
                      {gc&&<div style={{ width:6,height:6,borderRadius:'50%',background:gc,boxShadow:`0 0 5px ${gc}` }} />}
                    </div>
                    <span style={{ color:C.gold,fontFamily:"'Bebas Neue'",fontSize:'1.4rem' }}>{a.count}×</span>
                  </div>
                ); })}
              </Card>
              <Card neon style={{ display:'flex',flexDirection:'column' }}>
                <CardTitle>Setlist Spotlight 📋</CardTitle>
                <SetlistSpotlight concerts={concerts} onVault={()=>setActiveTab('vault')} />
              </Card>
            </div>

            {/* Row 5: USA Heatmap — full width */}
            <USAHeatmap concerts={concerts} />
          </>
        )}

        {activeTab==='timeline'&&<TimelineTab concerts={concerts} setActiveTab={setActiveTab} genreMap={genreMap} />}

        {activeTab==='byDay'&&(
          <>
            <div style={{ display:'flex',gap:10,marginTop:20,marginBottom:16,flexWrap:'wrap' }}>
              <select value={yearFilter} onChange={e=>setYearFilter(e.target.value)} style={{ ...inputSt,minWidth:100 }}><option value="all">All Years</option>{years.map(y=><option key={y} value={y}>{y}</option>)}</select>
              <select value={festFilter} onChange={e=>setFestFilter(e.target.value)} style={{ ...inputSt,minWidth:140 }}><option value="all">All Types</option><option value="fest">Festival Only</option><option value="solo">Standalone Only</option></select>
            </div>
            <ByDayTab dayGroups={dayGroups} onEdit={setEditTarget} genreMap={genreMap} />
          </>
        )}

        {activeTab==='byFest'&&<ByFestTab festGroupings={festGroupings} />}

        {activeTab==='browse'&&(
          <BrowseTab browseView={browseView} setBrowseView={setBrowseView} search={search} setSearch={setSearch} yearFilter={yearFilter} setYearFilter={setYearFilter} festFilter={festFilter} setFestFilter={setFestFilter} sortCol={sortCol} setSortCol={setSortCol} sortDir={sortDir} setSortDir={setSortDir} paged={paged} page={page} setPage={setPage} totalPages={totalPages} artistRows={artistRows} years={years} onShare={(a,s)=>setShareCard({artist:a,shows:s})} onEdit={setEditTarget} onSetGenre={handleSetGenre} genreMap={genreMap} />
        )}

        {activeTab==='hof'&&<HallOfFame sets={allSetsList} genreMap={genreMap} onShare={(a,s)=>setShareCard({artist:a,shows:s})} />}
        {activeTab==='passport'&&<PassportTab passport={passport} onNavigateToFest={name=>{ setActiveTab('byFest'); setTimeout(()=>{ const el=document.getElementById(`fest-${name.replace(/\s+/g,'-')}`); if(el)el.scrollIntoView({behavior:'smooth',block:'start'}); },150); }} />}
        {activeTab==='vault'&&<SetlistVaultTab concerts={concerts} />}
        {activeTab==='poster'&&<PosterGeneratorTab concerts={concerts} genreMap={genreMap} allSetsList={allSetsList} />}
        {activeTab==='manage'&&<ManageTab concerts={concerts} onEdit={setEditTarget} onAdd={()=>setEditTarget('new')} />}

      </main>
    </div>
  );
}