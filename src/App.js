import React, { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from './supabaseClient';
window.supabase = supabase;
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';

// --- MARQUEE THEATER STYLES ---
const MarqueeStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Monoton&family=Bebas+Neue&family=Space+Mono&display=swap');

    @keyframes bulb-flicker {
      0%, 100% { opacity: 1; text-shadow: 0 0 5px #fff, 0 0 10px #ffcc00; }
      50% { opacity: 0.3; text-shadow: none; }
    }

    @keyframes marquee-scroll {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }

    .marquee-container {
      overflow: hidden;
      display: flex;
      white-space: nowrap;
      width: 100%;
    }

    .marquee-inner {
      display: inline-block;
      animation: marquee-scroll 30s linear infinite;
    }

    .marquee-letter {
      font-family: 'Monoton', cursive;
      text-transform: uppercase;
      letter-spacing: 3px;
      color: #ffcc00;
      text-shadow: 0 0 10px rgba(255, 204, 0, 0.6);
    }
    
    .bulb {
      animation: bulb-flicker 1.5s infinite;
      margin: 0 10px;
    }
  `}</style>
);

// ─── THEME ────────────────────────────────────────────────────────────────────
const C = {
  bg:        '#0a0a0f',
  bgCard:    '#111118',
  bgCardAlt: '#16161f',
  bgHover:   '#1c1c28',
  teal:      '#00e5cc',
  tealDim:   '#00b5a0',
  tealGlow:  'rgba(0,229,204,0.15)',
  tealFaint: 'rgba(0,229,204,0.07)',
  cyan:      '#00cfff',
  cyanDim:   '#0099cc',
  white:     '#f0f4f8',
  gray:      '#8899aa',
  grayDim:   '#445566',
  border:    '#1e2a38',
  borderLit: '#00e5cc44',
  red:       '#ff4466',
  green:     '#00cc88',
  gold:      '#ffcc00',
  purple:    '#9966ff',
};

const HALL_OF_FAME_MIN = 6;

// ─── GENRE ENGINE ─────────────────────────────────────────────────────────────
const GENRE_COLORS = {
  "Indie Rock":   "#00f2ff", // Teal
  "Alternative":  "#9d00ff", // Purple
  "Experimental": "#ff00ff", // Magenta
  "Electronic":   "#ff0077", // Pink
  "Jam":          "#ffcc00", // Gold
  "Folk":         "#ffaa00", // Amber
  "Classic Rock": "#ff4400", // Red
  "Pop":          "#00e5ff", // Cyan
  "Hip Hop":      "#a2ff00", // Lime
  "Punk":         "#ff3300", // Bright Red/Orange
  "Other":        "#444444"  // Gray
};



// STATIC DEFAULTS (Will be overridden by your 'manualGenres' state)
const GENRE_MAP = {
  "Typhoon": "Indie Rock", "The Happy Fits": "Indie Rock", "Krooked Kings": "Indie Rock",
  "Modest Mouse": "Indie Rock", "Built to Spill": "Indie Rock", "Death Cab for Cutie": "Indie Rock",
  "The Decemberists": "Indie Rock", "Spoon": "Indie Rock", "Guster": "Indie Rock",
  "Dr. Dog": "Indie Rock", "The Shins": "Indie Rock", "The National": "Indie Rock", 
  "The War on Drugs": "Indie Rock", "Bright Eyes": "Indie Rock",
  
  "Radiohead": "Alternative", "Arcade Fire": "Alternative", "Beck": "Alternative", 
  "St. Vincent": "Alternative", "Muse": "Alternative", "The Killers": "Alternative",

  "Ween": "Experimental", "The Flaming Lips": "Experimental", "Animal Collective": "Experimental",
  "Tame Impala": "Experimental", "Mars Volta": "Experimental", "Nine Inch Nails": "Experimental",

  "LCD Soundsystem": "Electronic", "CHVRCHES": "Electronic", "M83": "Electronic",
  "Odesza": "Electronic", "Justice": "Electronic", "Daft Punk": "Electronic",

  "Phish": "Jam", "The Grateful Dead": "Jam", "Umphrey's McGee": "Jam", 
  "Disco Biscuits": "Jam", "Goose": "Jam", "STS9": "Jam",

  "Fleet Foxes": "Folk", "Bon Iver": "Folk", "The Avett Brothers": "Folk", 
  "Father John Misty": "Folk", "Tallest Man on Earth": "Folk",

  "Tom Petty": "Classic Rock", "Tom Petty & The Heartbreakers": "Classic Rock",
  "Neil Young": "Classic Rock", "Bruce Springsteen": "Classic Rock", "Billy Idol": "Classic Rock",

  "Ben Folds": "Pop", "Ben Folds Five": "Pop", "Phoenix": "Pop", 
  "Vampire Weekend": "Pop", "Foster The People": "Pop",

  "IDLES": "Punk", "Turnstile": "Punk", "The Stooges": "Punk", "Fugazi": "Punk"
};

// ─── DATE HELPERS ─────────────────────────────────────────────────────────────
const fmtDate = d => {
  if (!d) return '—';
  // Force local noon to prevent timezone shifts
  return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getYear = d => d ? new Date(d + 'T12:00:00').getFullYear() : null;

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

// 📋 SETLIST SPOTLIGHT WIDGET (The Randomizer)
function SetlistSpotlight({ concerts, onVault }) {
  const [index, setIndex] = useState(0);
  
  const vault = useMemo(() => 
    concerts.filter(c => c.has_setlist || (c.has_setlist_names && c.has_setlist_names.trim() !== ''))
  , [concerts]);

  const slides = useMemo(() => {
    if (vault.length === 0) return [{ label: "ARCHIVE EMPTY", val: "Start collecting!", sub: "Edit a show to log a setlist" }];
    
    // 1. Most Recent
    const recent = [...vault].sort((a,b) => b.date.localeCompare(a.date))[0];
    
    // 2. Top Artist in Vault (Logic to count names in the comma-separated string)
    const artCounts = {};
    vault.forEach(c => { 
      const names = (c.has_setlist_names || "").split(',');
      names.forEach(n => { 
        const name = n.trim(); 
        if(name) artCounts[name] = (artCounts[name] || 0) + 1; 
      });
    });
    const topArt = Object.entries(artCounts).sort((a,b) => b[1] - a[1])[0];

    // 3. Top Venue in Vault
    const venCounts = {};
    vault.forEach(c => { venCounts[c.venue] = (venCounts[c.venue] || 0) + 1; });
    const topVen = Object.entries(venCounts).sort((a,b) => b[1] - a[1])[0];

    // 4. Random Pull
    const random = vault[Math.floor(Math.random() * vault.length)];

    return [
      { label: "LATEST ADDITION", val: recent.has_setlist_names?.split(',')[0] || "Verified Setlist", sub: `${fmtDate(recent.date)} @ ${recent.venue}` },
      { label: "ARCHIVE MVP", val: topArt?.[0] || "Keep digging!", sub: `You have ${topArt?.[1] || 0} setlists from this artist` },
      { label: "LUCKY VENUE", val: topVen?.[0] || "N/A", sub: `${topVen?.[1] || 0} setlists captured here` },
      { label: "RANDOM RECALL", val: random.has_setlist_names?.split(',')[0] || "Setlist", sub: `From ${getYear(random.date)} at ${random.venue}` }
    ];
  }, [vault]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => setIndex(prev => (prev + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const s = slides[index];

  return (
    <div style={{ textAlign: 'center', cursor: 'pointer', padding: '10px 0' }} onClick={onVault}>
      <div style={{ fontFamily: "'Space Mono'", fontSize: 9, color: C.gold, letterSpacing: 2, marginBottom: 12, textTransform: 'uppercase' }}>{s.label}</div>
      <div className="fade-in" key={index} style={{ minHeight: '60px' }}>
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.8rem', color: C.white, lineHeight: 1.1, marginBottom: 4 }}>{s.val}</div>
        <div style={{ fontSize: '0.8rem', color: C.gray, fontStyle: 'italic' }}>{s.sub}</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 5, marginTop: 18 }}>
        {slides.map((_, i) => (
          <div key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: i === index ? C.gold : C.grayDim, transition: '0.3s' }} />
        ))}
      </div>
    </div>
  );
}

// 🏆 HALL OF FAME COMPONENT (With Yellow Dots)
function HallOfFame({ sets, onShare }) {
  const [selected, setSelected] = useState(null);

  const artists = useMemo(() => {
    const m = {};
    sets.forEach(s => {
      if (!m[s.artist]) m[s.artist] = { artist: s.artist, shows: [] };
      m[s.artist].shows.push(s);
    });
    return Object.values(m)
      .filter(a => a.shows.length >= HALL_OF_FAME_MIN)
      .sort((a, b) => b.shows.length - a.shows.length);
  }, [sets]);

  const selectedData = selected ? artists.find(a => a.artist === selected) : null;
  const MEDAL = ['🥇', '🥈', '🥉'];
  const topRef = useRef(null);

  const handleSelect = (artist, isSelected) => {
    if (isSelected) setSelected(null);
    else {
      setSelected(artist);
      setTimeout(() => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    }
  };

  return (
    <div ref={topRef} style={{ padding: '24px 0' }} className="fade-in">
      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: C.gray, marginBottom: 16, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        Artists seen {HALL_OF_FAME_MIN}+ times — click any to see full history
      </div>

      {selectedData && (
        <div className="fade-in" style={{ background: C.bgCard, border: `1px solid ${C.teal}55`, borderRadius: 8, padding: '18px 20px', marginBottom: 24, boxShadow: `0 0 20px ${C.teal}22` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.8rem', letterSpacing: '0.08em', color: C.teal, marginBottom: 4, lineHeight: 1 }}>{selectedData.artist}</div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: C.gray, marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {selectedData.shows.length} sets · first: {fmtDate(selectedData.shows[selectedData.shows.length - 1]?.date)} · last: {fmtDate(selectedData.shows[0]?.date)}
              </div>
            </div>
            <button onClick={() => setSelected(null)} style={{ background: 'none', border: `1px solid ${C.border}`, color: C.gray, fontSize: 10, borderRadius: 4, padding: '4px 8px', cursor: 'pointer' }}>CLOSE</button>
          </div>

          <div style={{ position: 'relative', paddingLeft: 20 }}>
            <div style={{ position: 'absolute', left: 5, top: 0, bottom: 0, width: 1, background: `linear-gradient(to bottom, ${C.teal}, ${C.grayDim})` }} />
            {[...selectedData.shows].reverse().map((s, i) => {
              const hasSet = s.has_setlist || (s.has_setlist_names && s.has_setlist_names.trim() !== '');
              return (
                <div key={i} style={{ position: 'relative', marginBottom: 12, paddingLeft: 14 }}>
                  <div style={{ 
                    position: 'absolute', left: -7, top: 4, width: 8, height: 8, borderRadius: '50%', 
                    background: s.is_festival ? C.teal : (hasSet ? C.gold : C.grayDim), 
                    border: `1px solid ${s.is_festival ? C.teal : (hasSet ? C.gold : C.border)}`,
                    boxShadow: s.is_festival ? `0 0 8px ${C.teal}aa` : (hasSet ? `0 0 8px ${C.gold}aa` : 'none'),
                    zIndex: 2
                  }} />
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: hasSet ? C.gold : C.tealDim }}>{fmtDate(s.date)}</span>
                    <span style={{ fontSize: '0.8rem', color: C.white }}>{s.venue}</span>
                    <span style={{ fontSize: '0.75rem', color: C.grayDim }}>{s.city}, {s.state}</span>
                    {hasSet && <span style={{ fontSize: 11, filter: 'drop-shadow(0 0 2px gold)' }}>📋</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10, marginBottom: 28 }}>
        {artists.map((a, i) => {
          const isSelected = selected === a.artist;
          const festCount = a.shows.filter(s => s.is_festival).length;
          const setlistCount = a.shows.filter(s => s.has_setlist || (s.has_setlist_names && s.has_setlist_names.trim() !== '')).length;
          const pct = Math.round((festCount / a.shows.length) * 100);
          return (
            <div key={a.artist} onClick={() => handleSelect(a.artist, isSelected)} 
                 style={{ background: isSelected ? `${C.teal}18` : C.bgCard, border: `1px solid ${isSelected ? C.teal : (setlistCount > 0 ? `${C.gold}33` : C.border)}`, borderRadius: 8, padding: '12px 14px', cursor: 'pointer', transition: 'all 0.18s', position: 'relative' }}>
              {setlistCount > 0 && (
                <div style={{ position: 'absolute', top: 8, right: 8, width: 6, height: 6, borderRadius: '50%', background: C.gold, boxShadow: `0 0 5px ${C.gold}` }} />
              )}
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: isSelected ? C.teal : C.tealDim, marginBottom: 4 }}>{MEDAL[i] || '🎤'} #{i + 1}</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: C.white, marginBottom: 6, lineHeight: 1.2 }}>{a.artist}</div>
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.8rem', color: isSelected ? C.teal : C.white, lineHeight: 1 }}>{a.shows.length}×</div>
              <div style={{ marginTop: 8, height: 3, background: C.border, borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: C.teal, borderRadius: 2 }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 7, color: C.grayDim }}>{festCount}F · {a.shows.length - festCount}S</div>
                {setlistCount > 0 && <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 7, color: C.gold }}>{setlistCount} SETLISTS</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}



// ─── SHARED ATOMS ─────────────────────────────────────────────────────────────
const Badge = ({ children, color = C.teal, bg = C.tealFaint }) => (
  <span style={{
    display: 'inline-block', fontFamily: "'Space Mono', monospace", fontSize: 9,
    letterSpacing: '0.1em', textTransform: 'uppercase',
    color, background: bg, border: `1px solid ${color}44`,
    padding: '2px 6px', borderRadius: 3,
  }}>{children}</span>
);

const NEON_BORDERS = [
  { border: C.teal,   glow: 'rgba(0,229,204,0.18)' },
  { border: C.cyan,   glow: 'rgba(0,207,255,0.18)' },
  { border: C.purple, glow: 'rgba(153,102,255,0.18)' },
  { border: C.gold,   glow: 'rgba(255,204,0,0.18)' },
  { border: C.green,  glow: 'rgba(0,204,136,0.18)' },
  { border: '#ff6699',glow: 'rgba(255,102,153,0.18)' },
];
let _cardIdx = 0;

const Card = ({ children, style = {}, glow = false, neon = false }) => {
  const nb = neon ? NEON_BORDERS[_cardIdx++ % NEON_BORDERS.length] : null;
  return (
    <div style={{
      background: C.bgCard,
      border: `1px solid ${glow ? C.teal : neon ? nb.border : C.border}`,
      borderRadius: 8, padding: 16,
      boxShadow: glow
        ? `0 0 20px ${C.tealGlow}`
        : neon
          ? `0 0 12px ${nb.glow}, 0 2px 8px rgba(0,0,0,0.4)`
          : '0 2px 8px rgba(0,0,0,0.4)',
      ...style,
    }}>{children}</div>
  );
};

const CardTitle = ({ children, style = {} }) => (
  <div style={{
    fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: '0.25em',
    textTransform: 'uppercase', color: C.tealDim,
    marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${C.border}`,
    ...style,
  }}>{children}</div>
);

const HBar = ({ name, count, max, color = C.teal }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
    <div style={{ fontSize: '0.72rem', color: C.gray, width: 120, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={name}>{name}</div>
    <div style={{ flex: 1, height: 10, background: C.border, borderRadius: 2, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${(count / max) * 100}%`, background: `linear-gradient(to right, ${C.tealDim}, ${color})`, borderRadius: 2, transition: 'width 0.4s ease' }} />
    </div>
    <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color, width: 22, textAlign: 'right', flexShrink: 0 }}>{count}</div>
  </div>
);

const Btn = ({ children, onClick, variant = 'primary', style = {}, disabled = false }) => {
  const base = {
    fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: '0.12em',
    textTransform: 'uppercase', border: 'none', borderRadius: 4,
    padding: '8px 16px', cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1, transition: 'all 0.15s', ...style,
  };
  const variants = {
    primary:   { background: C.teal, color: C.bg },
    secondary: { background: C.bgCardAlt, color: C.gray, border: `1px solid ${C.border}` },
    danger:    { background: C.red + '22', color: C.red, border: `1px solid ${C.red}44` },
    ghost:     { background: 'transparent', color: C.teal, border: `1px solid ${C.borderLit}` },
  };
  return (
    <button style={{ ...base, ...variants[variant] }} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
};

// ─── INPUT STYLE ──────────────────────────────────────────────────────────────
const inputSt = {
  background: C.bgCard, border: `1px solid ${C.border}`,
  borderRadius: 4, padding: '7px 10px', color: C.white,
  fontSize: '0.85rem', outline: 'none',
};

// ─── EDIT MODAL ───────────────────────────────────────────────────────────────
function EditModal({ concert, onClose, onSave, onDelete }) {
  const [form, setForm] = useState({
    date:              concert?.date || '',
    bands:             (concert?.bands || []).join(', '),
    venue:             concert?.venue || '',
    city:              concert?.city || '',
    state:             concert?.state || '',
    is_festival:       concert?.is_festival || false,
    festival_name:     concert?.festival_name || '',
    festival_day:      concert?.festival_day || '',
    has_setlist:       concert?.has_setlist || false,
    has_setlist_names: concert?.has_setlist_names || '', 
  });
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);
  
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    const bandList = form.bands.split(',').map(b => b.trim()).filter(Boolean);
    const hasAnySetlist = !!form.has_setlist_names?.trim();

    await onSave(concert?.id, { 
      ...form, 
      bands: bandList,
      has_setlist: hasAnySetlist,
      has_setlist_names: form.has_setlist_names 
    });
    setSaving(false);
  };

  const fld = { marginBottom: 14 };
  const lbl = { display: 'block', fontFamily: "'Space Mono', monospace", fontSize: 8, letterSpacing: '0.15em', textTransform: 'uppercase', color: C.tealDim, marginBottom: 4 };
  const inp = { ...inputSt, width: '100%' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="fade-in" style={{ background: C.bgCard, border: `1px solid ${C.teal}`, borderRadius: 10, padding: 24, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', boxShadow: `0 0 40px ${C.tealGlow}` }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.4rem', letterSpacing: '0.08em', color: C.teal }}>
            {concert?.id ? 'Edit Show' : 'Add Show'}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.gray, fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
        </div>

        <div style={fld}><label style={lbl}>Date</label><input style={inp} type="date" value={form.date} onChange={e => set('date', e.target.value)} /></div>
        <div style={fld}><label style={lbl}>Artists (comma separated)</label><input style={inp} value={form.bands} onChange={e => set('bands', e.target.value)} placeholder="Arcade Fire, LCD Soundsystem" /></div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
          <div><label style={lbl}>Venue</label><input style={inp} value={form.venue} onChange={e => set('venue', e.target.value)} placeholder="Zilker Park" /></div>
          <div><label style={lbl}>City</label><input style={inp} value={form.city} onChange={e => set('city', e.target.value)} placeholder="Austin" /></div>
        </div>
        <div style={fld}><label style={lbl}>State</label><input style={{ ...inp, width: 80 }} value={form.state} onChange={e => set('state', e.target.value)} placeholder="TX" maxLength={2} /></div>

        <div style={{ ...fld, display: 'flex', alignItems: 'center', gap: 10 }}>
          <input type="checkbox" id="is_fest" checked={form.is_festival} onChange={e => set('is_festival', e.target.checked)} style={{ accentColor: C.teal, width: 16, height: 16 }} />
          <label htmlFor="is_fest" style={{ ...lbl, marginBottom: 0, cursor: 'pointer' }}>Festival Day</label>
        </div>

        {form.is_festival && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div><label style={lbl}>Festival Name</label><input style={inp} value={form.festival_name} onChange={e => set('festival_name', e.target.value)} placeholder="Bonnaroo" /></div>
            <div><label style={lbl}>Day Label</label><input style={inp} value={form.festival_day} onChange={e => set('festival_day', e.target.value)} placeholder="Bonnaroo Friday" /></div>
          </div>
        )}

        <div style={fld}>
          <label style={lbl}>Setlists Obtained (Band Names, comma separated)</label>
          <input 
            style={inp} 
            value={form.has_setlist_names || ''} 
            onChange={e => set('has_setlist_names', e.target.value)} 
            placeholder="e.g. Ween, Guster" 
          />
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', marginTop: 20 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {concert?.id && !confirming && <Btn variant="danger" onClick={() => setConfirming(true)}>Delete</Btn>}
            {confirming && <>
              <Btn variant="danger" onClick={() => onDelete(concert.id)}>Confirm Delete</Btn>
              <Btn variant="secondary" onClick={() => setConfirming(false)}>Cancel</Btn>
            </>}
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

// ─── FESTIVAL SCHEDULE CARD ───────────────────────────────────────────────────
function FestivalScheduleCard({ event, compact = false }) {
  const bands = event.bands || [];
  const STAGE_COLORS = [C.teal, C.cyan, C.purple, C.gold, C.green];

  // auto-flow columns based on band count
  const numCols = bands.length <= 2 ? bands.length : bands.length <= 5 ? 3 : bands.length <= 9 ? 4 : 5;
  const columns = Array.from({ length: Math.min(numCols, bands.length) }, () => []);
  bands.forEach((b, i) => columns[i % columns.length].push(b));

  return (
    <div className="day-card-hover" style={{ background: compact ? C.bgCardAlt : C.bgCard, border: `1px solid ${compact ? C.border : C.border}`, borderRadius: 6, marginBottom: compact ? 8 : 12, overflow: 'hidden', boxShadow: compact ? '0 1px 4px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.5)' }}>
      <div style={{ background: `linear-gradient(135deg, ${C.bgCardAlt}, ${C.bg})`, borderBottom: `1px solid ${C.border}`, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.1rem', letterSpacing: '0.1em', color: C.white }}>{fmtDate(event.date)}</div>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: C.gray, fontStyle: 'italic', flex: 1 }}>{[event.venue, event.city, event.state].filter(Boolean).join(', ')}</div>
        <Badge color={C.teal}>{event.festival_day || event.festival_name || 'Festival'}</Badge>
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: C.tealDim, background: C.tealFaint, padding: '2px 7px', borderRadius: 3 }}>{bands.length} acts</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns.length}, 1fr)` }}>
        {columns.map((stageBands, ci) => (
          <div key={ci} style={{ borderRight: ci < columns.length - 1 ? `1px solid ${C.border}` : 'none' }}>
            <div style={{ height: 4, background: `${STAGE_COLORS[ci % STAGE_COLORS.length]}66`, borderBottom: `2px solid ${STAGE_COLORS[ci % STAGE_COLORS.length]}` }} />
            <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 5 }}>
              {stageBands.map((band, bi) => (
                <div key={bi} style={{ background: C.bgCardAlt, borderRadius: 4, padding: '6px 8px', borderLeft: `2px solid ${STAGE_COLORS[ci % STAGE_COLORS.length]}`, fontSize: '0.75rem', color: C.white, lineHeight: 1.3, boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>
                  {band}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── DAY CARD (standalone) ────────────────────────────────────────────────────
function DayCard({ event }) {
  const bands = event.bands || [];
  return (
    <div className="day-card-hover" style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 8, marginBottom: 8, overflow: 'hidden' }}>
      <div style={{ padding: '10px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1rem', letterSpacing: '0.08em', color: C.white }}>{fmtDate(event.date)}</div>
        <div style={{ fontSize: '0.76rem', color: C.gray, fontStyle: 'italic', flex: 1 }}>{[event.venue, event.city, event.state].filter(Boolean).join(', ') || 'No location'}</div>
        <Badge color={C.grayDim} bg="transparent">{bands.length} {bands.length === 1 ? 'act' : 'acts'}</Badge>
      </div>
      <div style={{ padding: '8px 16px 12px', display: 'flex', flexWrap: 'wrap', gap: 5 }}>
        {bands.map((b, i) => (
          <span key={i} style={{ fontSize: '0.78rem', color: C.white, background: C.bgCardAlt, border: `1px solid ${C.border}`, borderRadius: 4, padding: '4px 9px' }}>{b}</span>
        ))}
      </div>
    </div>
  );
}

// ─── ON THIS DAY ──────────────────────────────────────────────────────────────
function OnThisDay({ concerts }) {
  const today = new Date();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const matches = concerts.filter(c => c.date && c.date.endsWith(`-${mm}-${dd}`)).sort((a, b) => a.date.localeCompare(b.date));
  if (!matches.length) return null;
  return (
    <div style={{ background: `linear-gradient(135deg, ${C.bgCard}, ${C.bgCardAlt})`, border: `1px solid ${C.teal}`, borderRadius: 8, padding: '14px 18px', marginBottom: 20, boxShadow: `0 0 24px ${C.tealGlow}`, animation: 'pulse-teal 3s ease-in-out infinite' }}>
      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', color: C.teal, marginBottom: 10 }}>
        📅 On This Day — {today.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
      </div>
      {matches.map((ev, idx) => (
        <div key={ev.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 8, paddingBottom: 8, borderBottom: idx < matches.length - 1 ? `1px solid ${C.border}` : 'none' }}>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.4rem', color: C.teal, width: 50, flexShrink: 0, lineHeight: 1 }}>{getYear(ev.date)}</div>
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: C.white, marginBottom: 2 }}>{(ev.bands || []).join(', ')}</div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, color: C.gray, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {[ev.venue, ev.city, ev.state].filter(Boolean).join(' · ')}{ev.is_festival ? ` · ${ev.festival_day}` : ''}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── MANAGE TAB ───────────────────────────────────────────────────────────────
function ManageTab({ concerts, onEdit, onAdd }) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const PER = 30;
  const filtered = useMemo(() => {
    if (!search) return concerts;
    const q = search.toLowerCase();
    return concerts.filter(c => (c.bands || []).some(b => b.toLowerCase().includes(q)) || (c.venue || '').toLowerCase().includes(q) || (c.city || '').toLowerCase().includes(q) || (c.festival_name || '').toLowerCase().includes(q));
  }, [concerts, search]);
  const paged = filtered.slice((page - 1) * PER, page * PER);
  const totalPages = Math.ceil(filtered.length / PER);
  return (
    <div style={{ padding: '24px 0' }} className="fade-in">
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <input style={{ ...inputSt, flex: 1 }} placeholder="Search shows to edit..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        <Btn onClick={onAdd}>+ Add Show</Btn>
      </div>
      <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
          <thead>
            <tr style={{ background: C.bgCardAlt }}>
              {['Date', 'Artists', 'Venue', 'City', 'Type', 'Setlist', 'Edit'].map(h => (
                <th key={h} style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, letterSpacing: '0.15em', textTransform: 'uppercase', padding: '10px 12px', textAlign: 'left', color: C.tealDim, borderBottom: `1px solid ${C.border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((c, i) => (
              <tr key={c.id} className="row-hover" style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 1 ? C.bgCardAlt : 'transparent' }} onClick={() => onEdit(c)}>
                <td style={{ padding: '9px 12px', fontFamily: "'Space Mono', monospace", fontSize: '0.7rem', color: C.gray, whiteSpace: 'nowrap' }}>{fmtDate(c.date)}</td>
                <td style={{ padding: '9px 12px', color: C.white, fontWeight: 500 }}>{(c.bands || []).slice(0, 3).join(', ')}{c.bands?.length > 3 ? ` +${c.bands.length - 3}` : ''}</td>
                <td style={{ padding: '9px 12px', color: C.gray }}>{c.venue || '—'}</td>
                <td style={{ padding: '9px 12px', color: C.gray }}>{c.city || '—'}</td>
                <td style={{ padding: '9px 12px' }}>{c.is_festival ? <Badge color={C.teal}>Fest</Badge> : <Badge color={C.grayDim} bg="transparent">Solo</Badge>}</td>
                <td style={{ padding: '9px 12px' }}>{c.has_setlist ? <span style={{ color: C.teal }}>📋</span> : <span style={{ color: C.grayDim }}>—</span>}</td>
                <td style={{ padding: '9px 12px', color: C.tealDim }}>✎</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 5, marginTop: 14 }}>
          <Btn variant="secondary" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '5px 10px' }}>←</Btn>
          {Array.from({ length: Math.min(7, totalPages) }, (_, i) => { const p = page <= 4 ? i + 1 : page + i - 3; if (p < 1 || p > totalPages) return null; return <Btn key={p} variant={p === page ? 'primary' : 'secondary'} onClick={() => setPage(p)} style={{ padding: '5px 10px' }}>{p}</Btn>; })}
          <Btn variant="secondary" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: '5px 10px' }}>→</Btn>
        </div>
      )}
    </div>
  );
}


// ─── ARCHIVE INSIGHTS WIDGET ──────────────────────────────────────────────────
function ArtistInsights({ concerts }) {
  const [index, setIndex] = useState(0);

  const insights = useMemo(() => {
    if (!concerts.length) return [];

    // 1. Peak Year Calculation
    const years = {};
    concerts.forEach(c => {
      const y = getYear(c.date);
      if (y) years[y] = (years[y] || 0) + 1;
    });
    const peakYear = Object.entries(years).sort((a, b) => b[1] - a[1])[0];

    // 2. Most Visited City
    const cities = {};
    concerts.forEach(c => {
      if (c.city) cities[c.city] = (cities[c.city] || 0) + 1;
    });
    const topCity = Object.entries(cities).sort((a, b) => b[1] - a[1])[0];

    // 3. Festival Addiction
    const festDays = concerts.filter(c => c.is_festival).length;
    const festPct = Math.round((festDays / concerts.length) * 100);

    return [
      { 
        label: "PEAK INTENSITY", 
        val: peakYear?.[0], 
        sub: `Your busiest year on record with ${peakYear?.[1]} shows logged.` 
      },
      { 
        label: "HOME TURF", 
        val: topCity?.[0].toUpperCase(), 
        sub: `You've caught ${topCity?.[1]} shows here. A true local legend.` 
      },
      { 
        label: "FESTIVAL RATIO", 
        val: `${festPct}%`, 
        sub: `Nearly ${festPct}% of your live music history happened in a field.` 
      },
      { 
        label: "TOTAL LEGACY", 
        val: concerts.length, 
        sub: `Unique show days recorded since your journey began in 1999.` 
      }
    ];
  }, [concerts]);

  // Auto-cycle effect
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex(prev => (prev + 1) % insights.length);
    }, 6000); // Cycles every 6 seconds
    return () => clearInterval(timer);
  }, [insights.length]);

  const active = insights[index] || { label: "LOADING", val: "...", sub: "" };

  return (
    <Card neon style={{ minHeight: 150, display: 'flex', flexDirection: 'column', justifyContent: 'center', border: `1px solid ${C.teal}33` }}>
      <div style={{ fontFamily: "'Space Mono'", fontSize: 8, color: C.teal, letterSpacing: 2, marginBottom: 12 }}>
        ⚡ {active.label}
      </div>
      
      <div className="fade-in" key={index}>
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: '2.4rem', color: C.white, lineHeight: 1, marginBottom: 4 }}>
          {active.val}
        </div>
        <div style={{ fontSize: '0.8rem', color: C.gray, lineHeight: 1.4, maxWidth: '90%' }}>
          {active.sub}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 4, marginTop: 15 }}>
        {insights.map((_, i) => (
          <div key={i} style={{ 
            width: i === index ? 12 : 4, 
            height: 4, 
            borderRadius: 2, 
            background: i === index ? C.teal : C.grayDim, 
            transition: '0.3s' 
          }} />
        ))}
      </div>
    </Card>
  );
}

// ─── RANDOM RECALL WIDGET ─────────────────────────────────────────────────────
function RandomShow({ concerts }) {
  const [show, setShow] = useState(null);
  const [spinning, setSpinning] = useState(false);

  const spin = () => {
    if (!concerts.length) return;
    setSpinning(true);
    let iterations = 0;
    const interval = setInterval(() => {
      setShow(concerts[Math.floor(Math.random() * concerts.length)]);
      iterations++;
      if (iterations >= 12) {
        clearInterval(interval);
        setSpinning(false);
      }
    }, 70);
  };

  useEffect(() => { 
    if (concerts.length && !show) spin(); 
  }, [concerts.length]);

  if (!show) return null;

  // This handles your specific data structure (bands vs artist)
  const artistName = Array.isArray(show.bands) ? show.bands[0] : (show.artist || "Unknown Artist");

  return (
    <Card 
      neon 
      glow={!spinning}
      style={{ 
        minHeight: 150, 
        border: `1px solid ${spinning ? C.grayDim : C.purple + '66'}`, 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center',
        transition: '0.3s'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ fontFamily: "'Space Mono'", fontSize: 8, color: C.purple, letterSpacing: 2 }}>
          🎲 {spinning ? 'SPINNING...' : 'RANDOM RECALL'}
        </div>
        <button onClick={spin} disabled={spinning} style={{ background: 'none', border: `1px solid ${C.purple}44`, color: C.purple, fontSize: 7, padding: '2px 8px', borderRadius: 3, cursor: 'pointer', fontFamily: "'Space Mono'" }}>
          {spinning ? '•••' : 'SPIN'}
        </button>
      </div>

      <div style={{ opacity: spinning ? 0.3 : 1, transition: '0.2s' }}>
        <div style={{ 
          fontFamily: "'Bebas Neue'", 
          fontSize: '2.2rem', 
          color: C.white, 
          lineHeight: 1, 
          marginBottom: 4,
          textShadow: !spinning ? `0 0 10px ${C.purple}33` : 'none'
        }}>
          {artistName}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: "'Space Mono'", fontSize: 9 }}>
          <span style={{ color: C.white }}>{fmtDate(show.date)}</span>
          <span style={{ color: C.purple, opacity: 0.8 }}>📍 {show.venue?.toUpperCase()}</span>
        </div>
      </div>
    </Card>
  );
}
// ─── SHAREABLE ARTIST CARD ────────────────────────────────────────────────────
function ShareCard({ artist, shows, onClose }) {
  const festCount = shows.filter(s => s.is_festival).length;
  const cities = [...new Set(shows.map(s => s.city).filter(Boolean))];
  const years = [...new Set(shows.map(s => getYear(s.date)).filter(Boolean))].sort();
  const firstDate = fmtDate(shows[shows.length - 1]?.date);
  const lastDate = fmtDate(shows[0]?.date);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="fade-in" style={{ width: '100%', maxWidth: 420 }}>
        {/* The card itself */}
        <div id="share-card" style={{
          background: `linear-gradient(135deg, ${C.bg} 0%, ${C.bgCard} 50%, ${C.bgCardAlt} 100%)`,
          border: `1px solid ${C.teal}`,
          borderRadius: 12, padding: '28px 24px',
          boxShadow: `0 0 40px ${C.tealGlow}`,
          position: 'relative', overflow: 'hidden',
        }}>
          {/* glow orb */}
          <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, background: `radial-gradient(circle, ${C.tealGlow}, transparent)`, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -40, left: -40, width: 150, height: 150, background: `radial-gradient(circle, rgba(153,102,255,0.08), transparent)`, pointerEvents: 'none' }} />

          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, letterSpacing: '0.25em', textTransform: 'uppercase', color: C.tealDim, marginBottom: 8, position: 'relative', zIndex: 1 }}>
            🎸 Eric's Concert History
          </div>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: 'clamp(1.8rem, 6vw, 2.6rem)', letterSpacing: '0.06em', color: C.white, lineHeight: 1, marginBottom: 16, position: 'relative', zIndex: 1 }}>
            {artist}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16, position: 'relative', zIndex: 1 }}>
            {[
              [shows.length, 'Times Seen'],
              [festCount, 'Festival Sets'],
              [shows.length - festCount, 'Standalone'],
              [cities.length, `${cities.length === 1 ? 'City' : 'Cities'}`],
            ].map(([val, label]) => (
              <div key={label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 6, padding: '10px 12px', border: `1px solid ${C.border}` }}>
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.8rem', color: C.teal, lineHeight: 1 }}>{val}</div>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 7, letterSpacing: '0.15em', textTransform: 'uppercase', color: C.gray, marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>

          <div style={{ position: 'relative', zIndex: 1, marginBottom: 12 }}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, color: C.gray, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Show History</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {years.map(y => (
                <span key={y} style={{ fontFamily: "'Space Mono', monospace", fontSize: 7, background: `${C.teal}22`, color: C.teal, border: `1px solid ${C.teal}44`, padding: '2px 5px', borderRadius: 3 }}>{y}</span>
              ))}
            </div>
          </div>

          <div style={{ position: 'relative', zIndex: 1, fontFamily: "'Space Mono', monospace", fontSize: 7, color: C.grayDim, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            First: {firstDate} · Last: {lastDate}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'center' }}>
          <button onClick={() => {
            // Copy stats to clipboard as text
            const text = `I've seen ${artist} ${shows.length} times (${festCount} festival, ${shows.length - festCount} standalone) across ${cities.length} cities. First: ${firstDate}. Last: ${lastDate}. #ConcertHistory`;
            navigator.clipboard?.writeText(text).then(() => alert('Copied to clipboard!'));
          }} style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', background: C.teal, color: C.bg, border: 'none', borderRadius: 4, padding: '8px 16px', cursor: 'pointer' }}>
            📋 Copy Stats
          </button>
          <button onClick={onClose} style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', background: C.bgCard, color: C.gray, border: `1px solid ${C.border}`, borderRadius: 4, padding: '8px 16px', cursor: 'pointer' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}



// ─── LOCATION HEATMAP ─────────────────────────────────────────────────────────
// US state centroids (approximate) for dot placement on SVG map
const STATE_COORDS = {
  AK:{x:120,y:430}, AL:{x:540,y:348}, AR:{x:482,y:308}, AZ:{x:178,y:308},
  CA:{x:90,y:258},  CO:{x:268,y:248}, CT:{x:706,y:188}, DC:{x:660,y:238},
  DE:{x:678,y:218}, FL:{x:572,y:408}, GA:{x:572,y:348}, HI:{x:210,y:445},
  IA:{x:460,y:205}, ID:{x:178,y:148}, IL:{x:510,y:222}, IN:{x:538,y:220},
  KS:{x:390,y:252}, KY:{x:552,y:268}, LA:{x:488,y:375}, MA:{x:720,y:170},
  MD:{x:660,y:228}, ME:{x:742,y:128}, MI:{x:540,y:168}, MN:{x:448,y:138},
  MO:{x:478,y:258}, MS:{x:510,y:345}, MT:{x:228,y:120}, NC:{x:620,y:288},
  ND:{x:390,y:118}, NE:{x:388,y:210}, NH:{x:728,y:148}, NJ:{x:690,y:205},
  NM:{x:240,y:318}, NV:{x:145,y:232}, NY:{x:672,y:172}, OH:{x:568,y:208},
  OK:{x:400,y:298}, ON:{x:618,y:140}, OR:{x:100,y:165}, PA:{x:648,y:200},
  RI:{x:718,y:183}, SC:{x:612,y:320}, SD:{x:388,y:158}, TN:{x:548,y:300},
  TX:{x:395,y:360}, UT:{x:198,y:232}, VA:{x:638,y:252}, VT:{x:710,y:142},
  WA:{x:108,y:108}, WI:{x:495,y:168}, WV:{x:604,y:238}, WY:{x:248,y:178},
};


// ─── TOP FESTIVALS BIG STAT BLOCKS ────────────────────────────────────────────
function TopFestBlocks({ festBreakdown }) {
  const top3 = festBreakdown.slice(0, 3);
  const colors = [C.teal, C.cyan, C.purple];
  const medals = ['🥇', '🥈', '🥉'];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {top3.map(([name, count], i) => (
        <div key={name} style={{
          display: 'flex', alignItems: 'center', gap: 12,
          background: `${colors[i]}0a`, border: `1px solid ${colors[i]}33`,
          borderLeft: `3px solid ${colors[i]}`, borderRadius: 4, padding: '10px 14px',
        }}>
          <span style={{ fontSize: '1.1rem' }}>{medals[i]}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1rem', letterSpacing: '0.06em', color: C.white }}>{name}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.6rem', color: colors[i], lineHeight: 1 }}>{count}</div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 7, color: C.gray, textTransform: 'uppercase', letterSpacing: '0.1em' }}>days</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── DONUT CHART ──────────────────────────────────────────────────────────────
function DonutChart({ fest, solo }) {
  const total = fest + solo;
  const festPct = total ? fest / total : 0;
  const r = 52;
  const cx = 70;
  const cy = 70;
  const circumference = 2 * Math.PI * r;
  const festDash = festPct * circumference;
  const soloDash = (1 - festPct) * circumference;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <svg width={140} height={140} viewBox="0 0 140 140">
        {/* background ring */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.border} strokeWidth={14} />
        {/* solo arc */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.grayDim} strokeWidth={14}
          strokeDasharray={`${soloDash} ${circumference}`}
          strokeDashoffset={-festDash}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`} />
        {/* fest arc */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.teal} strokeWidth={14}
          strokeDasharray={`${festDash} ${circumference}`}
          strokeDashoffset={0}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ filter: `drop-shadow(0 0 4px ${C.teal}66)` }} />
        {/* center text */}
        <text x={cx} y={cy - 6} textAnchor="middle" style={{ fontFamily: "'Bebas Neue'", fontSize: 18, fill: C.teal }}>{Math.round(festPct * 100)}%</text>
        <text x={cx} y={cy + 10} textAnchor="middle" style={{ fontFamily: "'Space Mono', monospace", fontSize: 7, fill: C.gray }}>FESTIVAL</text>
      </svg>
      <div style={{ flex: 1 }}>
        {[[C.teal, 'Festival Days', fest], [C.grayDim, 'Standalone', solo]].map(([color, label, val]) => (
          <div key={label} style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, color: C.gray, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
              <span style={{ fontFamily: "'Bebas Neue'", fontSize: '1rem', color }}>{val}</span>
            </div>
            <div style={{ height: 3, background: C.border, borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${(val / total) * 100}%`, background: color, borderRadius: 2 }} />
            </div>
          </div>
        ))}
        <div style={{ marginTop: 12, fontFamily: "'Bebas Neue'", fontSize: '1.4rem', color: C.white, lineHeight: 1 }}>{total}</div>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 7, color: C.gray, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 2 }}>Total Show Days</div>
      </div>
    </div>
  );
}

// ─── BUBBLE CITY CHART ────────────────────────────────────────────────────────
function CityBubbles({ cityCounts }) {
  const [hov, setHov] = useState(null);
  const max = cityCounts[0]?.count || 1;
  const colors = [C.teal, C.cyan, C.purple, C.gold, C.green, '#ff6699', C.tealDim, '#ff9944', C.cyanDim, '#cc44ff', C.grayDim, '#44ffaa'];
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'flex-end', minHeight: 80, padding: '8px 0' }}>
      {cityCounts.slice(0, 12).map(({ name, count }, i) => {
        const size = Math.max(36, (count / max) * 90);
        const isHov = hov === name;
        return (
          <div key={name} onMouseEnter={() => setHov(name)} onMouseLeave={() => setHov(null)}
            style={{
              width: size, height: size, borderRadius: '50%',
              background: `${colors[i % colors.length]}${isHov ? 'dd' : '33'}`,
              border: `2px solid ${colors[i % colors.length]}${isHov ? 'ff' : '88'}`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              cursor: 'default', transition: 'all 0.2s', flexShrink: 0,
              boxShadow: isHov ? `0 0 12px ${colors[i % colors.length]}66` : 'none',
            }}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: size > 55 ? 9 : 7, color: colors[i % colors.length], fontWeight: 700, textAlign: 'center', lineHeight: 1.1, padding: '0 2px' }}>
              {name.split(',')[0]}
            </div>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: size > 55 ? 14 : 11, color: C.white, lineHeight: 1 }}>{count}</div>
          </div>
        );
      })}
    </div>
  );
}

// ─── DECADE BLOCKS ────────────────────────────────────────────────────────────
function DecadeBlocks({ sets }) {
  const dec = { '90s': 0, '00s': 0, '10s': 0, '20s': 0 };
  sets.forEach(s => {
    const y = getYear(s.date);
    if (!y) return;
    if (y < 2000) dec['90s']++;
    else if (y < 2010) dec['00s']++;
    else if (y < 2020) dec['10s']++;
    else dec['20s']++;
  });
  const max = Math.max(...Object.values(dec));
  const colors = [C.purple, C.cyan, C.teal, C.gold];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
      {Object.entries(dec).map(([decade, count], i) => {
        const pct = count / max;
        return (
          <div key={decade} style={{
            background: `${colors[i]}18`,
            border: `1px solid ${colors[i]}44`,
            borderBottom: `3px solid ${colors[i]}`,
            borderRadius: 4, padding: '10px 8px', textAlign: 'center',
          }}>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.6rem', color: colors[i], lineHeight: 1 }}>{count}</div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 7, color: C.gray, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 2 }}>{decade}</div>
            <div style={{ marginTop: 6, height: 2, background: C.border, borderRadius: 1, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct * 100}%`, background: colors[i], borderRadius: 1 }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
// timeline helper
function GenreLegend() {
  return (
    <div style={{ 
      display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'center', 
      padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px',
      margin: '0 auto 40px auto', maxWidth: '900px', border: '1px solid rgba(255,255,255,0.05)'
    }}>
      {Object.entries(GENRE_COLORS).map(([name, color]) => (
        <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}` }} />
          <span style={{ fontFamily: "'Space Mono'", fontSize: '9px', color: '#888', letterSpacing: '1px' }}>{name.toUpperCase()}</span>
        </div>
      ))}
    </div>
  );
}
// ─── THE BULLETPROOF TIMELINE ────────────────────────────────────────────────
function TimelineTab({ concerts, setActiveTab }) {
  // 1. DATA ENGINE (Ensures 100% of shows are captured)
  const yearsData = React.useMemo(() => {
    if (!concerts || concerts.length === 0) return [];

    // Sort Newest to Oldest
    const sorted = [...concerts].sort((a, b) => b.date.localeCompare(a.date));
    
    const groups = {};
    sorted.forEach(show => {
      const yr = new Date(show.date + 'T12:00:00').getFullYear();
      if (!groups[yr]) groups[yr] = [];
      groups[yr].push(show);
    });

    const quarterlyTargetMonths = [9, 6, 3, 0]; // Oct, Jul, Apr, Jan
    const monthNames = { 9: "OCTOBER", 6: "JULY", 3: "APRIL", 0: "JANUARY" };

    return Object.entries(groups).sort((a, b) => b[0] - a[0]).map(([year, yearShows]) => {
      const finalFlow = [];
      let usedMarkers = new Set();
      let showCounter = 0;

      yearShows.forEach((show, idx) => {
        const d = new Date(show.date + 'T12:00:00');
        const showMonth = d.getMonth();

        // Inject Month Markers
        quarterlyTargetMonths.forEach(m => {
          if (showMonth <= m && !usedMarkers.has(m)) {
            finalFlow.push({ type: 'MONTH_MARKER', label: monthNames[m], id: `marker-${year}-${m}` });
            usedMarkers.add(m);
          }
        });

        // Calculate Spacing Gap
        const nextShow = yearShows[idx + 1];
        let gap = 0;
        if (nextShow) {
          const d1 = new Date(show.date + 'T12:00:00');
          const d2 = new Date(nextShow.date + 'T12:00:00');
          gap = Math.ceil(Math.abs(d1 - d2) / (1000 * 60 * 60 * 24));
        }

        showCounter++;
        finalFlow.push({ 
          ...show, 
          type: 'SHOW', 
          gapDays: gap, 
          side: showCounter % 2 === 0 ? 'right' : 'left' 
        });
      });

      return [year, finalFlow];
    });
  }, [concerts]);

  // Tab Teleport Logic
  const teleport = (date) => {
    if (typeof setActiveTab === 'function') {
      setActiveTab('byDay');
      setTimeout(() => {
        const el = document.querySelector(`[data-date="${date}"]`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 150);
    }
  };

  if (!yearsData.length) return <div style={{color: 'white', padding: 100}}>Loading Timeline...</div>;

  return (
    <div style={{ padding: '40px 0 80px 0', background: '#0a0a0c' }} className="fade-in">
      
      {/* --- GENRE LEGEND --- */}
      <GenreLegend />

      <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative' }}>
        
        {/* --- CENTRAL SPINE --- */}
        <div style={{ 
          position: 'absolute', left: '50%', top: 0, bottom: 0, width: 2,
          background: 'linear-gradient(to bottom, #00f2ff, #9d00ff, #ffcc00, transparent)',
          transform: 'translateX(-50%)', opacity: 0.15
        }} />

        {yearsData.map(([year, flow], yIdx) => (
          <div key={year} style={{ position: 'relative', marginBottom: 120 }}>
            
            {/* LEFT STICKY YEAR */}
            <div style={{ position: 'absolute', left: '-180px', top: 0, bottom: 0, width: '100px', zIndex: 1 }}>
              <div style={{ 
                position: 'sticky', top: '250px', fontFamily: "'Bebas Neue'", fontSize: '6.5rem', 
                color: 'transparent', WebkitTextStroke: `2px ${yIdx % 2 === 0 ? '#00f2ff' : '#9d00ff'}`,
                filter: `drop-shadow(0 0 15px ${yIdx % 2 === 0 ? '#00f2ff' : '#9d00ff'}44)`,
                opacity: 0.6, transform: 'rotate(-90deg)', transformOrigin: 'center'
              }}>{year}</div>
            </div>

            {/* RIGHT STICKY YEAR */}
            <div style={{ position: 'absolute', right: '-180px', top: 0, bottom: 0, width: '100px', zIndex: 1 }}>
              <div style={{ 
                position: 'sticky', top: '250px', fontFamily: "'Bebas Neue'", fontSize: '6.5rem', 
                color: 'transparent', WebkitTextStroke: `2px ${yIdx % 2 === 0 ? '#00f2ff' : '#9d00ff'}`,
                filter: `drop-shadow(0 0 15px ${yIdx % 2 === 0 ? '#00f2ff' : '#9d00ff'}44)`,
                opacity: 0.6, transform: 'rotate(90deg)', transformOrigin: 'center'
              }}>{year}</div>
            </div>

            <div style={{ width: '100%', padding: '0 20px' }}>
              {flow.map((item) => {
                if (item.type === 'MONTH_MARKER') {
                  return (
                    <div key={item.id} style={{ margin: '80px 0 40px 0', textAlign: 'center', position: 'relative', zIndex: 10 }}>
                      <span style={{
                        fontFamily: "'Space Mono'", fontSize: '14px', color: '#fff',
                        background: '#0a0a0c', padding: '8px 24px', borderRadius: '4px',
                        border: '2px solid #9d00ff', fontWeight: 700,
                        boxShadow: '0 0 20px rgba(157, 0, 255, 0.3)', letterSpacing: '6px'
                      }}>{item.label}</span>
                    </div>
                  );
                }

                return (
                  <TimelineCard 
                    key={item.id} 
                    item={item} 
                    isLeft={item.side === 'left'} 
                    marginTop={item.gapDays <= 2 ? 20 : Math.min(item.gapDays * 2, 150)}
                    onTeleport={() => teleport(item.date)}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

//genre section
// ─── GENRE DNA COMPONENT ──────────────────────────────────────────────────
function GenreDNA({ concerts }) {
  const genreData = useMemo(() => {
    const counts = {};
    concerts.forEach(c => {
      (c.bands || []).forEach(artist => {
        const g = GENRE_MAP[artist] || "Other";
        counts[g] = (counts[g] || 0) + 1;
      });
    });
    
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count, color: GENRE_COLORS[name] || "#444" }))
      .sort((a, b) => b.count - a.count);
  }, [concerts]);

  if (!genreData.length) return null;

  return (
    <div style={{ 
      background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '12px', padding: '20px', marginTop: '20px' 
    }}>
      <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.5rem', color: '#fff', marginBottom: '15px', letterSpacing: '1px' }}>
        SONIC DNA // TOP GENRES
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {genreData.slice(0, 10).map((g) => (
          <div key={g.name}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '9px', fontFamily: "'Space Mono'" }}>
              <span style={{ color: g.color }}>{g.name.toUpperCase()}</span>
              <span style={{ color: '#888' }}>{g.count} SETS</span>
            </div>
            <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
              <div style={{ 
                width: `${(g.count / genreData[0].count) * 100}%`, height: '100%', 
                background: g.color, boxShadow: `0 0 10px ${g.color}44`, borderRadius: 2 
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── INTERNAL CARD COMPONENT ──────────────────────────────────────────────
function TimelineCard({ item, isLeft, marginTop, onTeleport }) {
  const [hovered, setHovered] = React.useState(false);
  const bands = item.bands || [];
  const headliner = bands[0] || "";
  const genre = GENRE_MAP[headliner] || "Other";
  const themeColor = GENRE_COLORS[genre] || "#444444";

  return (
    <div 
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onTeleport}
      style={{ 
        marginTop, display: 'flex', justifyContent: isLeft ? 'flex-start' : 'flex-end', 
        alignItems: 'center', width: '100%', position: 'relative', cursor: 'pointer'
      }}
    >
      <div style={{ 
        position: 'absolute', left: '50%', width: 12, height: 12, 
        borderRadius: '50%', background: themeColor, 
        transform: 'translateX(-50%)', zIndex: 5, 
        boxShadow: `0 0 ${hovered ? '20px' : '10px'} ${themeColor}`,
        border: '2px solid #0a0a0c', transition: '0.3s'
      }} />
      
      <div style={{ 
        width: '43%', padding: '20px', borderRadius: '12px',
        background: hovered ? hexToRgba(themeColor, 0.15) : hexToRgba(themeColor, 0.05),
        border: `1px solid ${hovered ? themeColor : hexToRgba(themeColor, 0.3)}`,
        borderLeft: isLeft ? `6px solid ${themeColor}` : `1px solid ${hovered ? themeColor : hexToRgba(themeColor, 0.3)}`,
        borderRight: !isLeft ? `6px solid ${themeColor}` : `1px solid ${hovered ? themeColor : hexToRgba(themeColor, 0.3)}`,
        transform: hovered ? `scale(1.03) translateY(-5px)` : 'scale(1)',
        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        boxShadow: hovered ? `0 15px 40px -15px ${themeColor}66` : 'none',
        zIndex: hovered ? 20 : 1
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: 15 }}>
          {bands.map((band, idx) => (
            <span key={idx} style={{ 
              fontFamily: idx === 0 ? "'Bebas Neue'" : "'Inter'", 
              fontSize: idx === 0 ? '2rem' : '1rem',
              color: '#ffffff', lineHeight: 1,
              opacity: idx !== 0 && !hovered ? 0.4 : 1
            }}>
              {band}{idx < bands.length - 1 ? (idx === 0 ? '' : ' • ') : ''}
            </span>
          ))}
        </div>
        <div style={{ 
          marginTop: 10, paddingTop: 10, borderTop: `1px solid ${hexToRgba(themeColor, 0.2)}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <span style={{ fontFamily: "'Space Mono'", fontSize: 9, color: '#ffffff', opacity: 0.7 }}>
            {item.venue?.toUpperCase()} // {item.city?.toUpperCase()}
          </span>
          <span style={{ fontFamily: "'Space Mono'", fontSize: 8, color: themeColor, fontWeight: 'bold' }}>
            {genre.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
const TABS = [
  ['dashboard', '⚡ Dashboard'],
  ['timeline',  '⏳ Timeline'],
  ['byDay',     '📅 By Day'],
  ['byFest',    '🎪 By Festival'],
  ['browse',    '🔍 Browse'],
  ['hof',       '🏆 Hall of Fame'],
  ['passport',  '🗺️ Passport'],
  ['manage',    '⚙️ Manage'],
];
const PER_PAGE = 40;

export default function App() {
  const [concerts, setConcerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [search, setSearch] = useState('');
  const [manualGenres, setManualGenres] = useState(GENRE_MAP);
  const [yearFilter, setYearFilter] = useState('all');
  const [festFilter, setFestFilter] = useState('all');
  const [browseView, setBrowseView] = useState('shows');
  const [sortCol, setSortCol] = useState('date');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);
  const [editTarget, setEditTarget] = useState(null);
  const [shareCard, setShareCard] = useState(null);
  const [upcoming, setUpcoming] = useState([]);
  const [newUpcoming, setNewUpcoming] = useState({ artist: '', venue: '', date: '', status: 'TICKETS' });

  // ── 2. LOGIC / MEMO (RENAMED TO AVOID DUPLICATES) ──
  
  const genreStats = useMemo(() => {
    if (!concerts || concerts.length === 0) return [];
    const counts = {};
    concerts.forEach(c => {
      const artistName = Array.isArray(c.bands) ? c.bands[0] : c.artist;
      const g = manualGenres[artistName] || "Other";
      counts[g] = (counts[g] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count, color: GENRE_COLORS[name] || "#444" }))
      .sort((a, b) => b.count - a.count);
  }, [concerts, manualGenres]);

  const dashboardStats = useMemo(() => {
    if (!concerts || concerts.length === 0) return {
      topBand: 'None', topCount: 0, totalSets: 0, uniqueBands: 0, 
      stateCount: 0, cityCount: 0, venueCount: 0, newDiscoveries: 0, 
      activeSpan: 0, avgPerYear: 0
    };

    // 1. Count every set (Headliners + Openers)
    const bandCounts = {};
    allSetsList.forEach(s => { 
      if(s.artist) bandCounts[s.artist] = (bandCounts[s.artist] || 0) + 1; 
    });
    
    // 2. Heavy Rotation
    const topEntry = Object.entries(bandCounts).sort((a, b) => b[1] - a[1])[0];
    
    // 3. Location Mastery
    const states = [...new Set(concerts.map(c => c.state).filter(Boolean))];
    const cities = [...new Set(concerts.map(c => c.city).filter(Boolean))];
    const venues = [...new Set(concerts.map(c => c.venue).filter(Boolean))];

    // 4. Fresh Blood (New for '25/'26)
    const recentBands = new Set(concerts
      .filter(c => c.date.startsWith('2025') || c.date.startsWith('2026'))
      .flatMap(c => Array.isArray(c.bands) ? c.bands : [c.artist]));
    
    const historicalBands = new Set(concerts
      .filter(c => !c.date.startsWith('2025') && !c.date.startsWith('2026'))
      .flatMap(c => Array.isArray(c.bands) ? c.bands : [c.artist]));
    
    const newDiscoveries = [...recentBands].filter(b => !historicalBands.has(b)).length;

    // 5. Active Timeline
    const years = concerts.map(c => new Date(c.date + 'T12:00:00').getFullYear()).sort((a,b) => a-b);
    const activeSpan = years.length > 0 ? (years[years.length - 1] - years[0]) : 0;

    return {
      topBand: topEntry ? topEntry[0] : 'None',
      topCount: topEntry ? topEntry[1] : 0,
      totalSets: allSetsList.length,
      uniqueBands: Object.keys(bandCounts).length,
      stateCount: states.length,
      cityCount: cities.length,
      venueCount: venues.length,
      newDiscoveries,
      activeSpan,
      avgPerYear: (concerts.length / (activeSpan || 1)).toFixed(1)
    };
  }, [concerts, allSetsList]);

    const allBands = concerts.flatMap(c => Array.isArray(c.bands) ? c.bands : [c.artist]);
    const bandCounts = {};
    allBands.forEach(b => { if(b) bandCounts[b] = (bandCounts[b] || 0) + 1; });
    const topEntry = Object.entries(bandCounts).sort((a, b) => b[1] - a[1])[0];
    const states = [...new Set(concerts.map(c => c.state).filter(Boolean))];
    const cities = [...new Set(concerts.map(c => c.city).filter(Boolean))];
    const venues = [...new Set(concerts.map(c => c.venue).filter(Boolean))];

    const recentBands = new Set(concerts
      .filter(c => c.date.startsWith('2025') || c.date.startsWith('2026'))
      .flatMap(c => Array.isArray(c.bands) ? c.bands : [c.artist]));
    const historicalBands = new Set(concerts
      .filter(c => !c.date.startsWith('2025') && !c.date.startsWith('2026'))
      .flatMap(c => Array.isArray(c.bands) ? c.bands : [c.artist]));
    const newDiscoveries = [...recentBands].filter(b => !historicalBands.has(b)).length;

    const years = concerts.map(c => new Date(c.date).getFullYear()).sort((a,b) => a-b);
    const activeSpan = years.length > 0 ? (years[years.length - 1] - years[0]) : 0;

    return {
      topBand: topEntry ? topEntry[0] : 'None',
      topCount: topEntry ? topEntry[1] : 0,
      totalSets: allBands.length,
      uniqueBands: Object.keys(bandCounts).length,
      stateCount: states.length,
      cityCount: cities.length,
      venueCount: venues.length,
      newDiscoveries,
      activeSpan,
      avgPerYear: (concerts.length / (activeSpan || 1)).toFixed(1)
    };
  }, [concerts]);

  const summaryStats = useMemo(() => {
    const ac = {}, venues = new Set();
    const setsFlat = [];
    concerts.forEach(c => (c.bands || []).forEach(band => setsFlat.push({ ...c, artist: band })));
    setsFlat.forEach(s => { ac[s.artist] = (ac[s.artist] || 0) + 1; });
    concerts.forEach(c => { if (c.venue) venues.add(c.venue); });
    return {
      totalShows: concerts.length, 
      totalSets: setsFlat.length,
      uniqueArtists: Object.keys(ac).length, 
      venueCount: venues.size,
      topArtist: Object.entries(ac).sort((a, b) => b[1] - a[1])[0] || ['—', 0],
      festDays: concerts.filter(c => c.is_festival).length,
      setlistCount: concerts.filter(c => c.has_setlist || (c.has_setlist_names && c.has_setlist_names.trim() !== '')).length,
    };
  }, [concerts]);
// --- 1. CORE DATA PREP (MUST BE FIRST) ---
  const allSetsList = useMemo(() => {
    const r = [];
    concerts.forEach(c => (c.bands || []).forEach(band => r.push({ ...c, artist: band })));
    return r;
  }, [concerts]);

  // --- 2. HEADER/SUMMARY CALCULATIONS ---
  const headerStats = useMemo(() => {
    const ac = {}, venues = new Set();
    allSetsList.forEach(s => { ac[s.artist] = (ac[s.artist] || 0) + 1; });
    concerts.forEach(c => { if (c.venue) venues.add(c.venue); });
    
    return {
      totalShows: concerts.length, 
      totalSets: allSetsList.length,
      uniqueArtists: Object.keys(ac).length, 
      venueCount: venues.size,
      topArtist: Object.entries(ac).sort((a, b) => b[1] - a[1])[0] || ['—', 0],
      festDays: concerts.filter(c => c.is_festival).length,
      setlistCount: concerts.filter(c => c.has_setlist || (c.has_setlist_names && c.has_setlist_names.trim() !== '')).length,
    };
  }, [concerts, allSetsList]);

  // --- 3. DASHBOARD SPECIFIC CALCULATIONS ---
  const dashboardStats = useMemo(() => {
    if (!concerts || concerts.length === 0) return {
      topBand: 'None', topCount: 0, totalSets: 0, uniqueBands: 0, 
      stateCount: 0, cityCount: 0, venueCount: 0, newDiscoveries: 0, 
      activeSpan: 0, avgPerYear: 0
    };

    const bandCounts = {};
    allSetsList.forEach(s => { if(s.artist) bandCounts[s.artist] = (bandCounts[s.artist] || 0) + 1; });
    const topEntry = Object.entries(bandCounts).sort((a, b) => b[1] - a[1])[0];
    
    const states = [...new Set(concerts.map(c => c.state).filter(Boolean))];
    const cities = [...new Set(concerts.map(c => c.city).filter(Boolean))];
    const venues = [...new Set(concerts.map(c => c.venue).filter(Boolean))];

    const recentBands = new Set(concerts
      .filter(c => c.date.startsWith('2025') || c.date.startsWith('2026'))
      .flatMap(c => Array.isArray(c.bands) ? c.bands : [c.artist]));
    
    const historicalBands = new Set(concerts
      .filter(c => !c.date.startsWith('2025') && !c.date.startsWith('2026'))
      .flatMap(c => Array.isArray(c.bands) ? c.bands : [c.artist]));
    
    const newDiscoveries = [...recentBands].filter(b => !historicalBands.has(b)).length;

    const years = concerts.map(c => new Date(c.date + 'T12:00:00').getFullYear()).sort((a,b) => a-b);
    const activeSpan = years.length > 0 ? (years[years.length - 1] - years[0]) : 0;

    return {
      topBand: topEntry ? topEntry[0] : 'None',
      topCount: topEntry ? topEntry[1] : 0,
      totalSets: allSetsList.length,
      uniqueBands: Object.keys(bandCounts).length,
      stateCount: states.length,
      cityCount: cities.length,
      venueCount: venues.length,
      newDiscoveries,
      activeSpan,
      avgPerYear: (concerts.length / (activeSpan || 1)).toFixed(1)
    };
  }, [concerts, allSetsList]);

  // --- 4. APP STARTUP & SIDE EFFECTS ---
  useEffect(() => {
    const initApp = async () => {
      const adminEmail = process.env.REACT_APP_ADMIN_EMAIL;
      const adminPw = process.env.REACT_APP_ADMIN_PASSWORD;

      if (adminEmail && adminPw) {
        const { data } = await supabase.auth.signInWithPassword({
          email: adminEmail,
          password: adminPw,
        });
        if (data?.session) console.log("Welcome back, Admin 🤘");
      }
      fetchConcerts();
      fetchUpcoming();
    };
    initApp();
  }, []);

  // --- 5. DATABASE FUNCTIONS ---
  async function fetchConcerts() {
    try {
      const { data, error } = await supabase
        .from('concerts')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      if (data) {
        setConcerts(data);
        const dbGenres = {};
        data.forEach(show => {
          if (show.genre) {
            const headliner = show.bands?.[0] || show.artist;
            if (headliner) dbGenres[headliner] = show.genre;
          }
        });
        setManualGenres(prev => ({ ...GENRE_MAP, ...dbGenres }));
      }
    } catch (err) {
      console.error("Fetch Error:", err.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchUpcoming() {
    const { data, error } = await supabase
      .from('upcoming_concerts')
      .select('*')
      .order('date', { ascending: true });
    if (data) setUpcoming(data);
    if (error) console.error("Error fetching upcoming:", error.message);
  }

  const addUpcomingShow = async () => {
    if (!newUpcoming.artist || !newUpcoming.date) {
      alert("Please enter at least an Artist and a Date! 📅");
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("Session expired! Please login via console again.");
      return;
    }
    const { error } = await supabase.from('upcoming_concerts').insert([newUpcoming]);
    if (error) {
      alert("Database Error: " + error.message);
    } else {
      setNewUpcoming({ artist: '', venue: '', date: '', status: 'TICKETS BOUGHT' });
      fetchUpcoming(); 
    }
  };

  async function handleSave(id, payload) {
    try {
      let result;
      if (id) {
        result = await supabase.from('concerts').update(payload).eq('id', id).select();
      } else {
        result = await supabase.from('concerts').insert([payload]).select();
      }
      if (result.error) throw result.error;
      if (id) {
        setConcerts(p => p.map(c => c.id === id ? { ...c, ...payload } : c));
      } else {
        setConcerts(p => [result.data[0], ...p]);
      }
      alert("✅ SAVED");
      setEditTarget(null);
    } catch (err) {
      alert('❌ FAILED: ' + err.message);
    }
  }

  async function handleDelete(id) {
    try {
      const { error } = await supabase.from('concerts').delete().eq('id', id);
      if (error) throw error;
      setConcerts(p => p.filter(c => c.id !== id));
      setEditTarget(null);
    } catch (err) { alert('Delete failed: ' + err.message); }
  }

  async function toggleSetlist(concert) {
    const newVal = !concert.has_setlist;
    try {
      const { error } = await supabase.from('concerts').update({ has_setlist: newVal }).eq('id', concert.id);
      if (error) throw error;
      setConcerts(p => p.map(c => c.id === concert.id ? { ...c, has_setlist: newVal } : c));
    } catch (err) { console.error(err.message); }
  }

  // --- 6. RENDER DATA (DERIVED) ---
  const years = useMemo(() => [...new Set(concerts.map(c => getYear(c.date)).filter(Boolean))].sort(), [concerts]);

  const artistCounts = useMemo(() => {
    const m = {};
    allSetsList.forEach(s => { m[s.artist] = (m[s.artist] || 0) + 1; });
    return Object.entries(m).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count }));
  }, [allSetsList]);

  const timelineData = useMemo(() => {
    const m = {};
    allSetsList.forEach(s => { const y = getYear(s.date); if (y) m[y] = (m[y] || 0) + 1; });
    return Object.entries(m).sort((a, b) => +a[0] - +b[0]).map(([year, count]) => ({ year: String(year).slice(2), count, fullYear: +year }));
  }, [allSetsList]);

  const festBreakdown = useMemo(() => {
    const m = {};
    concerts.filter(c => c.is_festival && c.festival_name).forEach(c => { m[c.festival_name] = (m[c.festival_name] || 0) + 1; });
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [concerts]);

  const stateCounts = useMemo(() => {
    const m = {};
    concerts.forEach(c => { if (c.state) m[c.state] = (m[c.state] || 0) + 1; });
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

  const applyFilters = (list, isSet = false) => {
    let d = list;
    if (yearFilter !== 'all') d = d.filter(r => getYear(r.date) === +yearFilter);
    if (festFilter === 'fest') d = d.filter(r => r.is_festival);
    if (festFilter === 'solo') d = d.filter(r => !r.is_festival);
    if (search) {
      const q = search.toLowerCase();
      d = d.filter(r => {
        const bands = isSet ? [r.artist] : (r.bands || []);
        return bands.some(b => b.toLowerCase().includes(q)) ||
          (r.venue || '').toLowerCase().includes(q) ||
          (r.city || '').toLowerCase().includes(q) ||
          (r.festival_name || '').toLowerCase().includes(q);
      });
    }
    return d;
  };

  const filteredSets = useMemo(() => {
    const d = applyFilters(allSetsList, true);
    return [...d].sort((a, b) => {
      let av = sortCol === 'artist' ? (a.artist || '').toLowerCase() : (String(a[sortCol] || '')).toLowerCase();
      let bv = sortCol === 'artist' ? (b.artist || '').toLowerCase() : (String(b[sortCol] || '')).toLowerCase();
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [allSetsList, yearFilter, festFilter, search, sortCol, sortDir]);

  const dayGroups = useMemo(() => applyFilters(concerts).sort((a, b) => (b.date || '').localeCompare(a.date || '')), [concerts, yearFilter, festFilter, search]);
  const paged = filteredSets.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(filteredSets.length / PER_PAGE);
  const years = useMemo(() => [...new Set(concerts.map(c => getYear(c.date)).filter(Boolean))].sort(), [concerts]);

  const allSetsList = useMemo(() => {
    const r = [];
    concerts.forEach(c => (c.bands || []).forEach(band => r.push({ ...c, artist: band })));
    return r;
  }, [concerts]);

  // --- LOGIC CALCULATIONS ---
  const headerStats = useMemo(() => {
    const ac = {}, venues = new Set();
    allSetsList.forEach(s => { ac[s.artist] = (ac[s.artist] || 0) + 1; });
    concerts.forEach(c => { if (c.venue) venues.add(c.venue); });
    return {
      totalShows: concerts.length, 
      totalSets: allSetsList.length,
      uniqueArtists: Object.keys(ac).length, 
      venueCount: venues.size,
      topArtist: Object.entries(ac).sort((a, b) => b[1] - a[1])[0] || ['—', 0],
      festDays: concerts.filter(c => c.is_festival).length,
      setlistCount: concerts.filter(c => c.has_setlist || (c.has_setlist_names && c.has_setlist_names.trim() !== '')).length,
    };
  }, [concerts, allSetsList]);

  const artistCounts = useMemo(() => {
    const m = {};
    allSetsList.forEach(s => { m[s.artist] = (m[s.artist] || 0) + 1; });
    return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 14).map(([name, count]) => ({ name, count }));
  }, [allSetsList]);

  const timelineData = useMemo(() => {
    const m = {};
    allSetsList.forEach(s => { const y = getYear(s.date); if (y) m[y] = (m[y] || 0) + 1; });
    return Object.entries(m).sort((a, b) => +a[0] - +b[0]).map(([year, count]) => ({ year: String(year).slice(2), count, fullYear: +year }));
  }, [allSetsList]);

  const festBreakdown = useMemo(() => {
    const m = {};
    concerts.filter(c => c.is_festival && c.festival_name).forEach(c => { m[c.festival_name] = (m[c.festival_name] || 0) + 1; });
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [concerts]);

  const stateCounts = useMemo(() => {
    const m = {};
    concerts.forEach(c => { if (c.state) m[c.state] = (m[c.state] || 0) + 1; });
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

  const applyFilters = (list, isSet = false) => {
    let d = list;
    if (yearFilter !== 'all') d = d.filter(r => getYear(r.date) === +yearFilter);
    if (festFilter === 'fest') d = d.filter(r => r.is_festival);
    if (festFilter === 'solo') d = d.filter(r => !r.is_festival);
    if (search) {
      const q = search.toLowerCase();
      d = d.filter(r => {
        const bands = isSet ? [r.artist] : (r.bands || []);
        return bands.some(b => b.toLowerCase().includes(q)) ||
          (r.venue || '').toLowerCase().includes(q) ||
          (r.city || '').toLowerCase().includes(q) ||
          (r.festival_name || '').toLowerCase().includes(q) ||
          (r.festival_day || '').toLowerCase().includes(q);
      });
    }
    return d;
  };

  const filteredSets = useMemo(() => {
    const d = applyFilters(allSetsList, true);
    return [...d].sort((a, b) => {
      let av = sortCol === 'artist' ? (a.artist || '').toLowerCase() : (String(a[sortCol] || '')).toLowerCase();
      let bv = sortCol === 'artist' ? (b.artist || '').toLowerCase() : (String(b[sortCol] || '')).toLowerCase();
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [allSetsList, yearFilter, festFilter, search, sortCol, sortDir]);

  const artistRows = useMemo(() => {
    if (browseView !== 'artists') return [];
    const m = {};
    applyFilters(allSetsList, true).forEach(s => { if (!m[s.artist]) m[s.artist] = { artist: s.artist, shows: [] }; m[s.artist].shows.push(s); });
    return Object.values(m).sort((a, b) => b.shows.length - a.shows.length);
  }, [allSetsList, yearFilter, festFilter, search, browseView]);

  const dayGroups = useMemo(() => applyFilters(concerts).sort((a, b) => (b.date || '').localeCompare(a.date || '')), [concerts, yearFilter, festFilter, search]);
  const paged = filteredSets.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(filteredSets.length / PER_PAGE);

  if (loading) return (
    <div style={{ background: C.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: '2rem', color: C.teal, letterSpacing: '0.15em', marginBottom: 8 }}>LOADING</div>
      </div>
    </div>
  );

  return (
    <div style={{ background: C.bg, minHeight: '100vh', paddingBottom: 60 }}>
      <MarqueeStyles />
      {shareCard && <ShareCard artist={shareCard.artist} shows={shareCard.shows} onClose={() => setShareCard(null)} />}
      {editTarget && <EditModal concert={editTarget === 'new' ? null : editTarget} onClose={() => setEditTarget(null)} onSave={handleSave} onDelete={handleDelete} />}

      <div style={{ background: `linear-gradient(180deg, #050508 0%, ${C.bgCard} 100%)`, borderBottom: `2px solid ${C.teal}33`, padding: '45px 24px 35px', textAlign: 'center', position: 'relative' }}>
        <h1 style={{ fontFamily: "'Bebas Neue'", fontSize: 'clamp(2.5rem, 8vw, 5rem)', color: C.white, margin: 0 }}>
          <span style={{ color: C.teal }}>🎸</span> LIVE // <span style={{ color: C.teal }}>IN CONCERT</span>
        </h1>
        <div style={{ marginTop: 18, fontFamily: "'Space Mono'", fontSize: '0.75rem', color: C.gray, display: 'flex', justifyContent: 'center', gap: '15px' }}>
          <span>{years.length > 0 ? `${years[years.length - 1] - years[0]} YEARS` : '0 YEARS'}</span>
          <span>{stateCounts.length} STATES</span>
          <span style={{ color: C.white }}>{headerStats.totalSets.toLocaleString()}+ SETS 🤘</span>
        </div>
      </div>

      <nav style={{ background: C.bgCard, borderBottom: `1px solid ${C.teal}33`, display: 'flex', overflowX: 'auto', position: 'sticky', top: 0, zIndex: 200 }}>
        {TABS.map(([id, label]) => (
          <button key={id} style={{ fontFamily: "'Space Mono'", fontSize: 10, color: activeTab === id ? C.teal : C.gray, background: 'none', border: 'none', borderBottom: activeTab === id ? `2px solid ${C.teal}` : '2px solid transparent', padding: '12px 16px', cursor: 'pointer' }} onClick={() => setActiveTab(id)}>{label}</button>
        ))}
      </nav>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
        {activeTab === 'dashboard' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 20, marginTop: 20 }}>
              <Card neon color="#00e5ff">
                <div style={{ fontSize: 8, color: C.tealDim }}>HEAVY ROTATION</div>
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.2rem', color: '#fff' }}>{dashboardStats.topBand}</div>
                <div style={{ fontSize: 7, color: C.gray }}>SEEN {dashboardStats.topCount} TIMES</div>
              </Card>
              <Card neon color="#ff00ff">
                <div style={{ fontSize: 8, color: C.tealDim }}>TRAVELER</div>
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.2rem', color: '#fff' }}>{dashboardStats.stateCount} STATES</div>
              </Card>
              <Card neon color="#ffcc00">
                <div style={{ fontSize: 8, color: C.tealDim }}>VENUE MASTERY</div>
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.2rem', color: '#fff' }}>{dashboardStats.venueCount} STAGES</div>
              </Card>
              <Card neon color="#00ffab">
                <div style={{ fontSize: 8, color: C.tealDim }}>FRESH BLOOD</div>
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.2rem', color: '#fff' }}>{dashboardStats.newDiscoveries} NEW ACTS</div>
                <div style={{ fontSize: 7, color: C.gray }}>FIRST SEEN IN '25/'26</div>
              </Card>
              <Card neon color="#7000ff">
                <div style={{ fontSize: 8, color: C.tealDim }}>TOTAL VOLUME</div>
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.2rem', color: '#fff' }}>{dashboardStats.totalSets} SETS</div>
              </Card>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: 15, marginBottom: 20 }}>
              <ArtistInsights concerts={concerts} />
              <div style={{ background: '#0a0a0a', border: '3px solid #222', borderRadius: 12, position: 'relative', overflow: 'hidden', boxShadow: '0 0 30px rgba(255, 204, 0, 0.15), inset 0 0 20px #000' }}>
                <div style={{ background: '#ffcc00', color: '#000', padding: '4px 0', overflow: 'hidden', display: 'flex', borderBottom: '2px solid #000' }}>
                   <div className="marquee-text" style={{ fontFamily: "'Space Mono'", fontSize: 10, fontWeight: '900', whiteSpace: 'nowrap', letterSpacing: '1px' }}>
                     FOR YOUR CONSIDERATION • STAGING THE VIBE • TICKETS SECURED? • TOUR BUS INBOUND •&nbsp;
                     FOR YOUR CONSIDERATION • STAGING THE VIBE • TICKETS SECURED? • TOUR BUS INBOUND •&nbsp;
                   </div>
                </div>
                <div style={{ padding: '20px' }}>
                   <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 15 }}>
                     <input placeholder="Artist" value={newUpcoming.artist} onChange={e => setNewUpcoming({...newUpcoming, artist: e.target.value})} style={{ background: '#111', border: '1px solid #333', color: '#ffcc00', fontSize: 10, padding: '8px', flex: '2 1 120px', borderRadius: 4 }} />
                     <input placeholder="Venue" value={newUpcoming.venue} onChange={e => setNewUpcoming({...newUpcoming, venue: e.target.value})} style={{ background: '#111', border: '1px solid #333', color: '#fff', fontSize: 10, padding: '8px', flex: '1 1 100px', borderRadius: 4 }} />
                     <input type="date" value={newUpcoming.date} onChange={e => setNewUpcoming({...newUpcoming, date: e.target.value})} style={{ background: '#111', border: '1px solid #333', color: '#fff', fontSize: 10, padding: '7px', flex: '1 1 110px', borderRadius: 4, colorScheme: 'dark' }} />
                     <select value={newUpcoming.status} onChange={e => setNewUpcoming({...newUpcoming, status: e.target.value})} style={{ background: '#111', border: '1px solid #333', color: '#ffcc00', fontSize: 10, padding: '8px', borderRadius: 4 }}>
                       <option value="TICKETS BOUGHT">TICKETS BOUGHT</option>
                       <option value="PENDING">PENDING</option>
                       <option value="DREAMING">DREAMING</option>
                     </select>
                     <button onClick={addUpcomingShow} style={{ background: '#ffcc00', color: '#000', border: 'none', fontSize: 9, fontWeight: '900', padding: '0 15px', cursor: 'pointer', borderRadius: 4 }}>STAMP IT</button>
                   </div>
                   <div style={{ maxHeight: '100px', overflowY: 'auto' }}>
                     {upcoming.map((show, i) => (
                       <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid #1a1a1a' }}>
                         <div>
                           <div className="marquee-letter" style={{ fontSize: '1.2rem', lineHeight: 1 }}>{show.artist}</div>
                           <div style={{ color: '#666', fontSize: 8 }}>@{show.venue || 'TBA'}</div>
                         </div>
                         <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: 10 }}>
                           <div style={{ color: '#fff', fontSize: 10 }}>{show.date}</div>
                           <button onClick={async () => { if(window.confirm("Delete?")) { await supabase.from('upcoming_concerts').delete().eq('id', show.id); fetchUpcoming(); } }} style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer' }}>✕</button>
                         </div>
                       </div>
                     ))}
                   </div>
                </div>
              </div>
              <RandomShow concerts={concerts} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: 16, marginBottom: 16 }}>
              <SonicDNA stats={genreStats} />
              <Card neon>
                <CardTitle>Sets Per Year</CardTitle>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={timelineData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                    <XAxis dataKey="year" tick={{ fontSize: 8, fontFamily: "'Space Mono'", fill: C.gray }} />
                    <YAxis tick={{ fontSize: 8, fontFamily: "'Space Mono'", fill: C.gray }} />
                    <Tooltip contentStyle={{ background: C.bgCard, border: `1px solid ${C.teal}`, fontSize: 10 }} />
                    <Bar dataKey="count" fill={C.teal} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
              <Card neon><CardTitle>Fest vs Standalone</CardTitle>
                <DonutChart fest={headerStats.festDays} solo={headerStats.totalShows - headerStats.festDays} />
              </Card>
              <Card neon><CardTitle>Top Festivals</CardTitle>
                <TopFestBlocks festBreakdown={festBreakdown} />
              </Card>
              <Card neon><CardTitle>By Decade</CardTitle>
                <DecadeBlocks sets={allSetsList} />
              </Card>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 20 }}>
              <Card neon><CardTitle>Most Seen Artists</CardTitle>
                {artistCounts.slice(0, 5).map(a => (
                  <div key={a.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>
                    <span style={{ color: '#fff' }}>{a.name}</span>
                    <span style={{ color: C.gold, fontFamily: "'Bebas Neue'", fontSize: '1.4rem' }}>{a.count}×</span>
                  </div>
                ))}
              </Card>
              <Card neon><CardTitle>Setlist Spotlight 📋</CardTitle>
                <SetlistSpotlight concerts={concerts} onVault={() => setActiveTab('setlist_vault')} />
              </Card>
            </div>
          </>
        )}

        {activeTab === 'timeline' && <TimelineTab concerts={concerts} setActiveTab={setActiveTab} />}
        {activeTab === 'manage' && <ManageTab concerts={concerts} onEdit={setEditTarget} onAdd={() => setEditTarget('new')} />}
        {/* Add any other tabs like browse/hof here if needed using the same format */}

      </main>
    </div>
  );
}

function hexToRgba(hex, alpha) {
  if (!hex || typeof hex !== 'string' || hex.length < 7) return `rgba(255,255,255,${alpha})`;
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}