import React, { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from './supabaseClient';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';

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

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const fmtDate = d => {
  if (!d) return '—';
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
// ─── TIMELINE TAB (CRUSH VERSION) ─────────────────────────────────────────────
function TimelineTab({ concerts, setActiveTab }) {
  // 1. Process Data into Years and Months
  const yearsData = useMemo(() => {
    if (!concerts.length) return [];
    
    // Sort everything chronologically first
    const sorted = [...concerts].sort((a, b) => a.date.localeCompare(b.date));
    
    // Group into years
    const byYear = {};
    sorted.forEach(show => {
      const yr = new Date(show.date + 'T12:00:00').getFullYear();
      if (!byYear[yr]) byYear[yr] = [];
      byYear[yr].push(show);
    });

    const quarterlyTargetMonths = [0, 3, 6, 9]; // Jan, Apr, Jul, Oct
    const monthNames = ["JANUARY", "APRIL", "JULY", "OCTOBER"];

    // Build the "Flow" for each year
    return Object.entries(byYear).sort((a, b) => b[0] - a[0]).map(([year, shows]) => {
      const yearFlow = [];
      const showsByMonth = {};
      
      shows.forEach(s => {
        const m = new Date(s.date + 'T12:00:00').getMonth();
        if (!showsByMonth[m]) showsByMonth[m] = [];
        showsByMonth[m].push(s);
      });

      // Loop through all 12 months to ensure NO SHOW IS LEFT BEHIND
      for (let m = 0; m <= 11; m++) {
        // Add Marker if it's a Quarterly month
        if (quarterlyTargetMonths.includes(m)) {
          yearFlow.push({ 
            type: 'MONTH_MARKER', 
            label: monthNames[quarterlyTargetMonths.indexOf(m)] 
          });
        }
        
        // Add all shows for this month
        if (showsByMonth[m]) {
          showsByMonth[m].forEach((show) => {
            // Find gap from previous show in the flow
            const allPreviousShows = yearFlow.filter(item => item.type === 'SHOW');
            const lastShow = allPreviousShows[allPreviousShows.length - 1];
            let gap = 0;
            if (lastShow) {
              gap = Math.ceil(Math.abs(new Date(show.date) - new Date(lastShow.date)) / (1000*60*60*24));
            }
            yearFlow.push({ ...show, type: 'SHOW', gapDays: gap });
          });
        }
      }
      return [year, yearFlow];
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

  return (
    <div style={{ padding: '80px 0', background: C.bg }} className="fade-in">
      <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative' }}>
        
        {/* The Central Spine */}
        <div style={{ 
          position: 'absolute', left: '50%', top: 0, bottom: 0, width: 2,
          background: `linear-gradient(to bottom, ${C.teal}, ${C.purple}, ${C.gold}, transparent)`,
          transform: 'translateX(-50%)', opacity: 0.15
        }} />

        {yearsData.map(([year, flow], yIdx) => (
          <div key={year} style={{ position: 'relative', marginBottom: 150 }}>
            
            {/* LEFT STICKY YEAR */}
            <div style={{ position: 'absolute', left: '-180px', top: 0, bottom: 0, width: '100px' }}>
              <div style={{ 
                position: 'sticky', top: '250px', fontFamily: "'Bebas Neue'", fontSize: '6.5rem', 
                color: 'transparent', WebkitTextStroke: `2px ${yIdx % 2 === 0 ? C.teal : C.purple}`,
                filter: `drop-shadow(0 0 15px ${yIdx % 2 === 0 ? C.teal : C.purple}44)`,
                opacity: 0.6, transform: 'rotate(-90deg)', transformOrigin: 'center', userSelect: 'none'
              }}>{year}</div>
            </div>

            {/* RIGHT STICKY YEAR */}
            <div style={{ position: 'absolute', right: '-180px', top: 0, bottom: 0, width: '100px' }}>
              <div style={{ 
                position: 'sticky', top: '250px', fontFamily: "'Bebas Neue'", fontSize: '6.5rem', 
                color: 'transparent', WebkitTextStroke: `2px ${yIdx % 2 === 0 ? C.teal : C.purple}`,
                filter: `drop-shadow(0 0 15px ${yIdx % 2 === 0 ? C.teal : C.purple}44)`,
                opacity: 0.6, transform: 'rotate(90deg)', transformOrigin: 'center', userSelect: 'none'
              }}>{year}</div>
            </div>

            <div style={{ width: '100%', padding: '0 20px' }}>
              {flow.map((item, i) => {
                if (item.type === 'MONTH_MARKER') {
                  return (
                    <div key={`${year}-${item.label}`} style={{ margin: '80px 0 40px 0', textAlign: 'center', position: 'relative', zIndex: 10 }}>
                      <span style={{
                        fontFamily: "'Space Mono'", fontSize: '14px', color: C.white,
                        background: C.bg, padding: '8px 24px', borderRadius: '4px',
                        border: `2px solid ${C.purple}`, fontWeight: 700,
                        boxShadow: `0 0 20px ${C.purple}44`, letterSpacing: '6px'
                      }}>{item.label}</span>
                    </div>
                  );
                }

                // Layout alternating logic based on "SHOW" index only
                const showIndex = flow.filter((f, idx) => f.type === 'SHOW' && idx <= i).length;
                const isLeft = showIndex % 2 !== 0;
                const marginTop = item.gapDays <= 2 ? 15 : Math.min(item.gapDays * 2, 150);

                return (
                  <TimelineCard 
                    key={item.id} 
                    item={item} 
                    isLeft={isLeft} 
                    marginTop={marginTop}
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

// ─── INTERACTIVE CARD COMPONENT ──────────────────────────────────────────────
function TimelineCard({ item, isLeft, marginTop, onTeleport }) {
  const [hovered, setHovered] = useState(false);
  const bands = item.bands || [];

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
      {/* Glow Connector Dot */}
      <div style={{ 
        position: 'absolute', left: '50%', width: hovered ? 16 : 12, height: hovered ? 16 : 12, 
        borderRadius: '50%', background: item.is_festival ? C.gold : C.teal, 
        transform: 'translateX(-50%)', zIndex: 5, 
        boxShadow: hovered ? `0 0 20px ${item.is_festival ? C.gold : C.teal}` : `0 0 10px ${item.is_festival ? C.gold : C.teal}`,
        border: `2px solid ${C.bg}`, transition: '0.2s'
      }} />
      
      <Card 
        glow={hovered || item.is_festival} 
        style={{ 
          width: '43%', 
          borderLeft: isLeft ? `4px solid ${item.is_festival ? C.gold : C.teal}` : `1px solid ${C.border}`,
          borderRight: !isLeft ? `4px solid ${item.is_festival ? C.gold : C.purple}` : `1px solid ${C.border}`,
          background: hovered ? C.bgHover : (item.gapDays <= 3 ? C.bgCardAlt : C.bgCard),
          transform: hovered ? `scale(1.05) rotate(${isLeft ? '1deg' : '-1deg'})` : 'scale(1) rotate(0deg)',
          transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          zIndex: hovered ? 20 : 1
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontFamily: "'Space Mono'", fontSize: 8, color: hovered ? C.white : C.gray }}>{fmtDate(item.date)}</span>
          {item.is_festival && <Badge color={C.gold}>FESTIVAL</Badge>}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {bands.map((band, idx) => (
            <span key={idx} style={{ 
              fontFamily: idx === 0 ? "'Bebas Neue'" : "'Inter'", 
              fontSize: idx === 0 ? '1.8rem' : '0.95rem',
              color: idx === 0 ? C.white : (hovered ? C.gray : C.grayDim), 
              lineHeight: 1, letterSpacing: idx === 0 ? '1px' : '0',
              opacity: idx !== 0 && !hovered ? 0.6 : 1,
              transition: '0.2s'
            }}>
              {band}{idx < bands.length - 1 ? (idx === 0 ? '' : ' • ') : ''}
            </span>
          ))}
        </div>

        <div style={{ 
          marginTop: 12, fontSize: 10, color: hovered ? C.teal : C.tealDim, 
          fontFamily: "'Space Mono'", borderTop: `1px solid ${C.border}`, paddingTop: 8,
          transition: '0.2s'
        }}>
          {item.venue} <span style={{color: C.grayDim}}>//</span> {item.city}
        </div>
      </Card>
    </div>
  );
}
// ─── MAIN APP ─────────────────────────────────────────────────────────────────
const TABS = [
  ['dashboard', '⚡ Dashboard'],
  ['timeline',     '⏳ Timeline'],
  ['byDay',     '📅 By Day'],
  ['byFest',    '🎪 By Festival'],
  ['browse',    '🔍 Browse'],
  ['hof',       '🏆 Hall of Fame'],
  ['passport',  '🗺️ Passport'],
  ['manage',    '⚙️ Manage'],
];
const PER_PAGE = 40;

export default function App() {
  const [concerts, setConcerts]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [activeTab, setActiveTab]   = useState('dashboard');
  const [search, setSearch]         = useState('');
  const [yearFilter, setYearFilter] = useState('all');
  const [festFilter, setFestFilter] = useState('all');
  const [browseView, setBrowseView] = useState('shows');
  const [sortCol, setSortCol]       = useState('date');
  const [sortDir, setSortDir]       = useState('desc');
  const [page, setPage]             = useState(1);
  const [editTarget, setEditTarget] = useState(null);
  const [shareCard, setShareCard] = useState(null); 

  // --- AUTOMATIC ADMIN LOGIN ---
  useEffect(() => {
    const login = async () => {
      const { error } = await supabase.auth.signInWithPassword({
        email: 'bellhorn12rs@gmail.com',
        password: 'Kapanen24!!'
      });
      if (error) console.error("Admin Login Failed:", error.message);
      else console.log("Admin Session Authenticated 🤘");
    };
    login();
    fetchConcerts(); 
  }, []);

  async function fetchConcerts() {
    try {
      const { data, error } = await supabase.from('concerts').select('*').order('date', { ascending: false });
      if (error) throw error;
      setConcerts(data || []);
    } catch (err) { console.error(err.message); }
    finally { setLoading(false); }
  }

 async function handleSave(id, payload) {
    try {
      let result;
      if (id) {
        // Update existing
        result = await supabase.from('concerts').update(payload).eq('id', id).select();
      } else {
        // Insert new
        result = await supabase.from('concerts').insert([payload]).select();
      }

      if (result.error) throw result.error;
      
      // Check if anything actually changed in the database
      if (!result.data || result.data.length === 0) {
        throw new Error("Database accepted the request but 0 rows were updated. Check your Row Level Security (RLS) policies.");
      }

      // Success! Update the screen
      if (id) {
        setConcerts(p => p.map(c => c.id === id ? { ...c, ...payload } : c));
      } else {
        setConcerts(p => [result.data[0], ...p]);
      }
      
      alert("✅ SAVED TO DATABASE SUCCESSFULLY");
      setEditTarget(null);
    } catch (err) { 
      console.error("FULL ERROR:", err);
      alert('❌ SAVE FAILED: ' + err.message); 
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

 // ── DERIVED ────────────────────────────────────────────────────────────────
  const years = useMemo(() => [...new Set(concerts.map(c => getYear(c.date)).filter(Boolean))].sort(), [concerts]);

  const sets = useMemo(() => {
    const r = [];
    concerts.forEach(c => (c.bands || []).forEach(band => r.push({ ...c, artist: band })));
    return r;
  }, [concerts]);

  const stats = useMemo(() => {
    const ac = {}, venues = new Set();
    sets.forEach(s => { ac[s.artist] = (ac[s.artist] || 0) + 1; });
    concerts.forEach(c => { if (c.venue) venues.add(c.venue); });
    return {
      totalShows: concerts.length, 
      totalSets: sets.length,
      uniqueArtists: Object.keys(ac).length, 
      venueCount: venues.size,
      topArtist: Object.entries(ac).sort((a, b) => b[1] - a[1])[0] || ['—', 0],
      festDays: concerts.filter(c => c.is_festival).length,
      // UPDATED: Counts if checkbox is TRUE OR if the text field has content
      setlistCount: concerts.filter(c => c.has_setlist || (c.has_setlist_names && c.has_setlist_names.trim() !== '')).length,
    };
  }, [concerts, sets]);

  const artistCounts = useMemo(() => {
    const m = {};
    sets.forEach(s => { m[s.artist] = (m[s.artist] || 0) + 1; });
    return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 14).map(([name, count]) => ({ name, count }));
  }, [sets]);

  const timelineData = useMemo(() => {
    const m = {};
    sets.forEach(s => { const y = getYear(s.date); if (y) m[y] = (m[y] || 0) + 1; });
    return Object.entries(m).sort((a, b) => +a[0] - +b[0]).map(([year, count]) => ({ year: String(year).slice(2), count, fullYear: +year }));
  }, [sets]);

  const festBreakdown = useMemo(() => {
    const m = {};
    concerts.filter(c => c.is_festival && c.festival_name).forEach(c => { m[c.festival_name] = (m[c.festival_name] || 0) + 1; });
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [concerts]);

  const cityCounts = useMemo(() => {
    const m = {};
    concerts.forEach(c => { if (c.city) m[c.city] = (m[c.city] || 0) + 1; });
    return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([name, count]) => ({ name, count }));
  }, [concerts]);

  const venueCounts = useMemo(() => {
    const m = {};
    concerts.forEach(c => { if (c.venue) m[c.venue] = (m[c.venue] || 0) + 1; });
    return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([name, count]) => ({ name, count }));
  }, [concerts]);

  const stateCounts = useMemo(() => {
    const m = {};
    concerts.forEach(c => { if (c.state) m[c.state] = (m[c.state] || 0) + 1; });
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [concerts]);

  const artistFestMap = useMemo(() => {
    const m = {};
    sets.forEach(s => { if (!m[s.artist]) m[s.artist] = { fest: 0, solo: 0 }; if (s.is_festival) m[s.artist].fest++; else m[s.artist].solo++; });
    return m;
  }, [sets]);

  const milestones = useMemo(() => {
    const sorted = [...concerts].sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    const first = sorted[0];
    const bestYear = timelineData.reduce((best, d) => d.count > (best?.count || 0) ? d : best, null);
    const biggestDay = concerts.reduce((best, c) => (c.bands?.length || 0) > (best?.bands?.length || 0) ? c : best, null);
    const dec = { '90s': 0, '00s': 0, '10s': 0, '20s': 0 };
    sets.forEach(s => { const y = getYear(s.date); if (!y) return; if (y < 2000) dec['90s']++; else if (y < 2010) dec['00s']++; else if (y < 2020) dec['10s']++; else dec['20s']++; });
    const topDec = Object.entries(dec).sort((a, b) => b[1] - a[1])[0];
    return [
      { icon: '🎸', label: 'First Show', value: (first?.bands || []).slice(0, 2).join(', '), sub: fmtDate(first?.date) },
      { icon: '🔥', label: 'Biggest Year', value: String(bestYear?.fullYear || '—'), sub: `${bestYear?.count || 0} sets` },
      { icon: '🏟️', label: 'Wildest Day', value: fmtDate(biggestDay?.date), sub: `${biggestDay?.bands?.length || 0} acts` },
      { icon: '🗺️', label: 'States Hit', value: stateCounts.length, sub: stateCounts.slice(0, 4).map(([s]) => s).join(' · ') },
      { icon: '🎪', label: 'Festival Days', value: stats.festDays, sub: `${festBreakdown.length} different fests` },
      // UPDATED: Milestone now uses the reactive stats.setlistCount
      { icon: '📋', label: 'Setlists', value: stats.setlistCount, sub: 'Physical Archive' },
    ];
  }, [concerts, sets, timelineData, stateCounts, stats, festBreakdown]);

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
    const d = applyFilters(sets, true);
    return [...d].sort((a, b) => {
      let av = sortCol === 'artist' ? (a.artist || '').toLowerCase() : (String(a[sortCol] || '')).toLowerCase();
      let bv = sortCol === 'artist' ? (b.artist || '').toLowerCase() : (String(b[sortCol] || '')).toLowerCase();
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [sets, yearFilter, festFilter, search, sortCol, sortDir]);

  const artistRows = useMemo(() => {
    if (browseView !== 'artists') return [];
    const m = {};
    applyFilters(sets, true).forEach(s => { if (!m[s.artist]) m[s.artist] = { artist: s.artist, shows: [] }; m[s.artist].shows.push(s); });
    return Object.values(m).sort((a, b) => b.shows.length - a.shows.length);
  }, [sets, yearFilter, festFilter, search, browseView]);

  const dayGroups = useMemo(() => applyFilters(concerts).sort((a, b) => (b.date || '').localeCompare(a.date || '')), [concerts, yearFilter, festFilter, search]);

  const paged = filteredSets.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(filteredSets.length / PER_PAGE);
  const handleSort = col => { if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortCol(col); setSortDir('asc'); } setPage(1); };
  // ── LOADING ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ background: C.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: '2rem', color: C.teal, letterSpacing: '0.15em', marginBottom: 8 }}>LOADING</div>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: C.gray }}>Tuning the instruments...</div>
      </div>
    </div>
  );

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ background: C.bg, minHeight: '100vh', paddingBottom: 60 }}>

      {shareCard && (
        <ShareCard
          artist={shareCard.artist}
          shows={shareCard.shows}
          onClose={() => setShareCard(null)}
        />
      )}

      {editTarget && (
        <EditModal
          concert={editTarget === 'new' ? null : editTarget}
          onClose={() => setEditTarget(null)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}

     {/* HEADER */}
      <div style={{ 
        background: `linear-gradient(180deg, #050508 0%, ${C.bgCard} 100%)`, 
        borderBottom: `2px solid ${C.teal}33`, 
        padding: '45px 24px 35px', 
        textAlign: 'center', 
        position: 'relative', 
        overflow: 'hidden' 
      }}>
        {/* Neon background glow */}
        <div style={{ 
          position: 'absolute', top: -50, left: '50%', transform: 'translateX(-50%)', 
          width: 500, height: 150, background: `radial-gradient(ellipse, ${C.tealGlow}, transparent)`, 
          pointerEvents: 'none' 
        }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ 
            fontFamily: "'Bebas Neue'", 
            fontSize: 'clamp(2.5rem, 8vw, 5rem)', 
            letterSpacing: '0.12em', 
            color: C.white, 
            margin: 0, 
            lineHeight: 0.85,
            textShadow: `0 0 20px rgba(255,255,255,0.1)`
          }}>
            <span style={{ color: C.teal }}>🎸</span> LIVE // <span style={{ color: C.teal, textShadow: `0 0 30px ${C.teal}aa` }}>IN CONCERT</span>
          </h1>
          
          <div style={{ 
            marginTop: 18, 
            fontFamily: "'Space Mono', monospace", 
            fontSize: '0.75rem', 
            color: C.gray, 
            letterSpacing: '0.25em', 
            textTransform: 'uppercase',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '15px',
            flexWrap: 'wrap'
          }}>
            <span>{years.length > 0 ? `${years[years.length - 1] - years[0]} YEARS` : '0 YEARS'}</span>
            <span style={{ color: C.tealDim }}>•</span>
            <span>{stateCounts.length} STATES</span>
            <span style={{ color: C.tealDim }}>•</span>
            <span style={{ color: C.white }}>{stats.totalSets.toLocaleString()}+ SETS 🤘</span>
          </div>
          
          <div style={{ 
            width: 200, 
            height: 2, 
            background: `linear-gradient(to right, transparent, ${C.teal}, ${C.cyan}, transparent)`, 
            margin: '25px auto 0', 
            opacity: 0.8 
          }} />
        </div>
      </div>

      {/* STAT STRIP */}
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', background: C.bgCard, borderBottom: `1px solid ${C.border}` }}>
  {[
    [stats.totalSets,     'Total Sets',      'individual performances'],
    [stats.uniqueArtists, 'Unique Artists',  'bands & performers'],
    [stats.totalShows,    'Show Days',       `${stats.festDays} fest · ${stats.totalShows - stats.festDays} solo`],
    [stats.setlistCount,  'Setlists',        'physical collection 📋'],
  ].map(([num, label, sub], i) => (
    <div 
      key={label}
      onClick={() => label === 'Setlists' ? setActiveTab('setlist_vault') : null}
      style={{ 
        padding: '20px 10px', 
        textAlign: 'center', 
        borderRight: i < 3 ? `1px solid ${C.border}` : 'none',
        cursor: label === 'Setlists' ? 'pointer' : 'default',
        transition: 'background 0.2s'
      }}
      onMouseEnter={(e) => label === 'Setlists' ? e.currentTarget.style.background = '#ffffff05' : null}
      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
    >
      <div style={{ fontSize: '1.8rem', fontFamily: "'Bebas Neue'", color: label === 'Setlists' ? C.gold : '#fff', lineHeight: 1 }}>{num}</div>
      <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: C.gray, letterSpacing: 1, marginTop: 4 }}>{label}</div>
      <div style={{ fontSize: '0.6rem', color: C.grayDim, marginTop: 2, fontStyle: 'italic' }}>{sub}</div>
    </div>
  ))}
</div>

      {/* NAV */}
      <nav style={{ background: C.bgCard, borderBottom: `1px solid ${C.teal}33`, display: 'flex', overflowX: 'auto', position: 'sticky', top: 0, zIndex: 200 }}>
        {TABS.map(([id, label]) => (
          <button key={id} className="nav-tab-btn" style={{
            fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase',
            color: activeTab === id ? C.teal : C.gray,
            background: activeTab === id ? `${C.teal}0f` : 'none', border: 'none',
            borderBottom: activeTab === id ? `2px solid ${C.teal}` : '2px solid transparent',
            padding: '12px 16px', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
            textShadow: activeTab === id ? `0 0 8px ${C.teal}66` : 'none',
          }} onClick={() => setActiveTab(id)}>{label}</button>
        ))}
      </nav>

      {/* CONTENT */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>

        {/* ── DASHBOARD ── */}
{activeTab === 'dashboard' && (
  <div style={{ padding: '24px 0' }} className="fade-in">
    <OnThisDay concerts={concerts} />

    {/* You Were There + Random Show row */}
   {/* Artist Insights + Random Show row */}
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
  <ArtistInsights concerts={concerts} />
  <RandomShow concerts={concerts} />
</div>

    {/* Milestones */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 20 }}>
      {milestones.map((m, i) => (
        <Card key={i} glow={i === 0} neon>
          <div style={{ fontSize: '1.4rem', marginBottom: 6 }}>{m.icon}</div>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, letterSpacing: '0.15em', textTransform: 'uppercase', color: C.tealDim, marginBottom: 4 }}>{m.label}</div>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.1rem', letterSpacing: '0.06em', color: C.white, lineHeight: 1.2 }}>{m.value}</div>
          <div style={{ fontSize: '0.72rem', color: C.gray, marginTop: 3, fontStyle: 'italic' }}>{m.sub}</div>
        </Card>
      ))}
    </div>

    {/* ── ROW 1: Artist podium + Archive Completion (balanced) ── */}
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

      {/* Artist podium — top 5 */}
      <Card neon>
        <CardTitle>Most Seen Artists</CardTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {artistCounts.slice(0, 5).map(({ name, count }, i) => {
            const podColors = [C.gold, C.gray, '#cd7f32', C.tealDim, C.grayDim];
            const sizes = ['1.5rem', '1.2rem', '1.1rem', '1rem', '0.95rem'];
            return (
              <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: i === 0 ? `${C.gold}0f` : C.bgCardAlt, border: `1px solid ${i === 0 ? C.gold + '44' : C.border}`, borderRadius: 5 }}>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: podColors[i], width: 18, flexShrink: 0 }}>#{i + 1}</span>
                <span style={{ flex: 1, fontFamily: i === 0 ? "'Bebas Neue'" : "'Inter', sans-serif", fontSize: i === 0 ? '1rem' : '0.82rem', fontWeight: i < 2 ? 700 : 400, color: C.white, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
                <span style={{ fontFamily: "'Bebas Neue'", fontSize: sizes[i], color: podColors[i], flexShrink: 0, lineHeight: 1 }}>{count}×</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* ── SETLIST SPOTLIGHT WIDGET ── */}
      <Card neon>
        <CardTitle>Setlist Spotlight 📋</CardTitle>
        <div style={{ 
          height: '100%', 
          minHeight: '140px', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          padding: '0 10px' 
        }}>
          <SetlistSpotlight 
            concerts={concerts} 
            onVault={() => setActiveTab('setlist_vault')} 
          />
        </div>
      </Card>
    </div>
    {/* ── ROW 2: Sets Per Year (Full Width) ── */}
    <Card neon style={{ marginBottom: 16 }}>
      <CardTitle>Sets Per Year</CardTitle>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={timelineData} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
          <defs>
            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={C.teal} stopOpacity={0.95} />
              <stop offset="100%" stopColor={C.teal} stopOpacity={0.15} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
          <XAxis dataKey="year" tick={{ fontSize: 8, fontFamily: "'Space Mono', monospace", fill: C.gray }} interval={2} />
          <YAxis tick={{ fontSize: 8, fontFamily: "'Space Mono', monospace", fill: C.gray }} />
          <Tooltip
            contentStyle={{ fontFamily: "'Space Mono', monospace", fontSize: 11, background: C.bgCard, border: `1px solid ${C.teal}`, color: C.white, borderRadius: 6 }}
            formatter={(v) => [`${v} sets`, '']}
            labelFormatter={(l) => `'${l}`}
          />
          <Bar dataKey="count" fill="url(#barGrad)" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>

    {/* ── ROW 3: Donut + Top 3 Fests + Decade blocks ── */}
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
      <Card neon>
        <CardTitle>Festival vs. Standalone</CardTitle>
        <DonutChart fest={stats.festDays} solo={stats.totalShows - stats.festDays} />
      </Card>
      <Card neon>
        <CardTitle>Top Festivals — Days Attended</CardTitle>
        <TopFestBlocks festBreakdown={festBreakdown} />
      </Card>
      <Card neon>
        <CardTitle>By Decade</CardTitle>
        <DecadeBlocks sets={sets} />
      </Card>
    </div>

   {/* ── ROW 4: City bubbles (full width) ── */}
    <Card neon>
      <CardTitle>Cities — Bubble = Show Count</CardTitle>
      <CityBubbles cityCounts={cityCounts} />
    </Card>
  </div>
)}

{/* ── TIMELINE TAB ── */}
{activeTab === 'timeline' && (
  <TimelineTab concerts={concerts} setActiveTab={setActiveTab} />
)}

{/* ── BY DAY ── */}
{activeTab === 'byDay' && (
  <div style={{ padding: '24px 0' }} className="fade-in">
    <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap', marginBottom: 16, alignItems: 'center' }}>
      <input style={{ ...inputSt, flex: 1, minWidth: 160 }} placeholder="Search artist, venue, city..." value={search} onChange={e => setSearch(e.target.value)} />
      <select style={inputSt} value={yearFilter} onChange={e => setYearFilter(e.target.value)}>
        <option value="all">All Years</option>
        {years.map(y => <option key={y} value={y}>{y}</option>)}
      </select>
      <select style={inputSt} value={festFilter} onChange={e => setFestFilter(e.target.value)}>
        <option value="all">All Shows</option>
        <option value="fest">Festival Only</option>
        <option value="solo">Standalone Only</option>
      </select>
      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: C.gray, marginLeft: 'auto' }}>{dayGroups.length} days</span>
    </div>
    {dayGroups.map(ev => ev.is_festival
      ? <FestivalScheduleCard key={ev.id} event={ev} />
      : <DayCard key={ev.id} event={ev} />
    )}
  </div>
)}

{/* ── BY FESTIVAL ── */}
{activeTab === 'byFest' && (
  <div style={{ padding: '24px 0' }} className="fade-in">
    <div style={{ display: 'flex', gap: 9, marginBottom: 16, alignItems: 'center' }}>
      <input style={{ ...inputSt, flex: 1 }} placeholder="Search festival or artist..." value={search} onChange={e => setSearch(e.target.value)} />
      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: C.gray }}>{festGroupings.length} festivals</span>
    </div>
    {festGroupings
      .filter(fg => !search || fg.name.toLowerCase().includes(search.toLowerCase()) || Object.values(fg.years).flat().some(ev => (ev.bands || []).some(b => b.toLowerCase().includes(search.toLowerCase()))))
      .map((fg, fgIdx) => {
        const FEST_COLORS = [C.teal, C.cyan, C.purple, C.gold, C.green, '#ff6699', '#ff9944'];
        const fColor = FEST_COLORS[fgIdx % FEST_COLORS.length];
        const totalDays = Object.values(fg.years).flat().length;
        const allYears = Object.keys(fg.years).map(Number);
        return (
          <div key={fg.name} style={{ marginBottom: 40 }}>
            {/* ── CONCERT POSTER DIVIDER ── */}
            <div id={`fest-${fg.name.replace(/\s+/g, '-')}`} style={{position: 'relative', overflow: 'hidden',
              background: `linear-gradient(135deg, ${C.bg} 0%, ${fColor}18 50%, ${C.bg} 100%)`,
              borderTop: `2px solid ${fColor}`,
              borderBottom: `2px solid ${fColor}`,
              padding: '20px 24px',
              marginBottom: 20
            }}>
              <div style={{ position: 'absolute', top: 6, left: 6, width: 24, height: 24, borderTop: `1px solid ${fColor}66`, borderLeft: `1px solid ${fColor}66` }} />
              <div style={{ position: 'absolute', top: 6, right: 6, width: 24, height: 24, borderTop: `1px solid ${fColor}66`, borderRight: `1px solid ${fColor}66` }} />
              <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: 'clamp(2rem, 5vw, 3.2rem)', letterSpacing: '0.15em', color: fColor, textShadow: `0 0 20px ${fColor}55`, lineHeight: 1, marginBottom: 8 }}>
                  {fg.name}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: C.white }}>{totalDays} DAYS</span>
                  <span style={{ color: fColor }}>·</span>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: C.gray }}>{Object.keys(fg.years).length} YEARS</span>
                  <span style={{ color: fColor }}>·</span>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: C.gray }}>{Math.min(...allYears)}–{Math.max(...allYears)}</span>
                </div>
              </div>
            </div>

            {Object.entries(fg.years).sort((a, b) => +a[0] - +b[0]).map(([yr, evs]) => (
              <div key={yr} style={{
                marginBottom: 28,
                border: `1px solid ${fColor}55`,
                borderTop: `4px solid ${fColor}`,
                borderRadius: 10,
                overflow: 'hidden',
                background: `linear-gradient(180deg, ${fColor}0a 0%, ${C.bg} 80px)`,
                boxShadow: `0 4px 24px rgba(0,0,0,0.4)`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 18px', borderBottom: `1px solid ${fColor}33`, background: `${fColor}0f` }}>
                  <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.6rem', color: fColor, lineHeight: 1 }}>{fg.name} {yr}</div>
                  <div style={{ fontFamily: "'Space Mono'", fontSize: 8, color: C.gray, background: C.bgCardAlt, padding: '3px 8px', borderRadius: 3 }}>{evs.length} DAYS</div>
                </div>
                <div style={{ padding: '14px 14px 6px' }}>
                  {evs.map(ev => <FestivalScheduleCard key={ev.id} event={ev} compact={true} />)}
                </div>
              </div>
            ))}
          </div>
        );
      })}
  </div>
)}
        {/* ── BROWSE ── */}
        {activeTab === 'browse' && (
          <div style={{ padding: '24px 0' }} className="fade-in">
            <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap', marginBottom: 14, alignItems: 'center' }}>
              <input style={{ ...inputSt, flex: 1, minWidth: 160 }} placeholder="Search artist, venue, city, festival..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
              <select style={inputSt} value={yearFilter} onChange={e => { setYearFilter(e.target.value); setPage(1); }}>
                <option value="all">All Years</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <select style={inputSt} value={festFilter} onChange={e => { setFestFilter(e.target.value); setPage(1); }}>
                <option value="all">All Shows</option>
                <option value="fest">Festival Only</option>
                <option value="solo">Standalone Only</option>
              </select>
              <div style={{ display: 'flex', border: `1px solid ${C.border}`, borderRadius: 4, overflow: 'hidden' }}>
                {[['shows', 'By Set'], ['artists', 'By Artist']].map(([v, l]) => (
                  <button key={v} style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', background: browseView === v ? C.teal : C.bgCard, color: browseView === v ? C.bg : C.gray, border: 'none', padding: '7px 12px', cursor: 'pointer' }} onClick={() => setBrowseView(v)}>{l}</button>
                ))}
              </div>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: C.gray, marginLeft: 'auto' }}>{browseView === 'shows' ? `${filteredSets.length} sets` : `${artistRows.length} artists`}</span>
            </div>

            {browseView === 'shows' && (
              <>
                <div style={{ overflowX: 'auto', borderRadius: 8, border: `1px solid ${C.border}` }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                    <thead>
                      <tr style={{ background: C.bgCardAlt }}>
                        {[['date','Date'],['artist','Artist'],['venue','Venue'],['city','City'],['state','ST'],['is_festival','Type'],['festival_day','Festival'],['has_setlist','📋']].map(([col, lbl]) => (
                          <th key={col} style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, letterSpacing: '0.15em', textTransform: 'uppercase', padding: '10px 12px', textAlign: 'left', color: C.tealDim, borderBottom: `1px solid ${C.border}`, cursor: 'pointer', whiteSpace: 'nowrap', userSelect: 'none' }} onClick={() => handleSort(col)}>
                            {lbl}{sortCol === col ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}
                          </th>
                        ))}
                        <th style={{ padding: '10px 12px', borderBottom: `1px solid ${C.border}` }} />
                      </tr>
                    </thead>
                    <tbody>
                      {paged.map((s, i) => (
                        <tr key={`${s.id}-${s.artist}`} className="row-hover" style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 1 ? C.bgCardAlt : 'transparent' }} onClick={() => setEditTarget(s)}>
                          <td style={{ padding: '8px 12px', fontFamily: "'Space Mono', monospace", fontSize: '0.7rem', color: C.gray, whiteSpace: 'nowrap' }}>{fmtDate(s.date)}</td>
                          <td style={{ padding: '8px 12px', color: C.white, fontWeight: 500 }}>{s.artist}</td>
                          <td style={{ padding: '8px 12px', color: C.gray }}>{s.venue || '—'}</td>
                          <td style={{ padding: '8px 12px', color: C.gray }}>{s.city || '—'}</td>
                          <td style={{ padding: '8px 12px', color: C.gray }}>{s.state || '—'}</td>
                          <td style={{ padding: '8px 12px' }}>{s.is_festival ? <Badge color={C.teal}>Fest</Badge> : <Badge color={C.grayDim} bg="transparent">Solo</Badge>}</td>
                          <td style={{ padding: '8px 12px', fontStyle: 'italic', fontSize: '0.72rem', color: C.tealDim }}>{s.festival_day || '—'}</td>
                          
                          {/* 📋 THE UPDATED SETLIST LOGIC 📋 */}
                          <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                            {(() => {
                              const names = s.has_setlist_names ? s.has_setlist_names.split(',').map(n => n.trim().toLowerCase()) : [];
                              const isThisSet = names.includes(s.artist.toLowerCase());
                              return (
                                <span 
                                  style={{ 
                                    fontSize: 16, 
                                    opacity: isThisSet ? 1 : 0.1,
                                    filter: isThisSet ? `drop-shadow(0 0 5px ${C.teal})` : 'none',
                                    transition: 'all 0.2s'
                                  }} 
                                  title={isThisSet ? `Setlist confirmed for ${s.artist}` : 'No setlist recorded'}
                                >
                                  📋
                                </span>
                              );
                            })()}
                          </td>

                          <td style={{ padding: '8px 12px', color: C.tealDim, fontSize: 12 }}>✎</td>
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
                    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: C.gray, alignSelf: 'center' }}>pg {page} / {totalPages}</span>
                  </div>
                )}
              </>
            )}

            {browseView === 'artists' && (
              <div>
                {artistRows.map(({ artist, shows }) => {
                  const fc = shows.filter(s => s.is_festival).length;
                  const slCount = shows.filter(s => s.has_setlist).length;
                  return (
                    <div key={artist} style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 8, padding: '12px 14px', marginBottom: 6 }}>
                      <div style={{ fontSize: '1rem', fontWeight: 600, color: C.white }}>{artist}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.gray, marginTop: 4, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                        <span>Seen <strong style={{ color: C.teal }}>{shows.length}×</strong></span>
                        <span>Fest <strong style={{ color: C.teal }}>{fc}</strong></span>
                        <span>Solo <strong style={{ color: C.teal }}>{shows.length - fc}</strong></span>
                        {slCount > 0 && <span>Setlists <strong style={{ color: C.teal }}>{slCount} 📋</strong></span>}
                        <span>First <strong style={{ color: C.teal }}>{fmtDate(shows[shows.length - 1]?.date)}</strong></span>
                        <span>Last <strong style={{ color: C.teal }}>{fmtDate(shows[0]?.date)}</strong></span>
                      </div>
                      <button onClick={e => { e.stopPropagation(); setShareCard({ artist, shows }); }} style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, letterSpacing: '0.08em', textTransform: 'uppercase', background: `${C.teal}18`, border: `1px solid ${C.teal}44`, color: C.teal, borderRadius: 3, padding: '3px 8px', cursor: 'pointer', flexShrink: 0, marginTop: 4 }}>Share ↗</button>
                      </div>
                      <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {shows.map((s, i) => (
                          <span key={i} style={{ fontSize: '0.68rem', background: s.is_festival ? `${C.teal}11` : C.bgCardAlt, border: `1px solid ${s.is_festival ? C.teal + '44' : C.border}`, borderRadius: 3, padding: '2px 6px', color: C.gray }}>
                            {fmtDate(s.date)}{s.city ? ` · ${s.city}` : ''}{s.has_setlist ? ' 📋' : ''}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── HALL OF FAME ── */}
        {activeTab === 'hof' && (
          <HallOfFame 
            sets={sets} 
            concerts={concerts} // Pass concerts to HOF for setlist check
            onShare={(artist, shows) => setShareCard({ artist, shows })} 
          />
        )}

        {/* ── SETLIST VAULT (NEW) ── */}
        {activeTab === 'setlist_vault' && (
          <div style={{ padding: '24px 0' }} className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <h2 style={{ fontFamily: "'Bebas Neue'", fontSize: '2.5rem', color: C.gold, margin: 0, lineHeight: 1 }}>THE SETLIST VAULT</h2>
                <div style={{ fontFamily: "'Space Mono'", fontSize: 10, color: C.gray, marginTop: 4 }}>
                  {stats.setlistCount} PHYSICAL ITEMS RECOVERED
                </div>
              </div>
              <button 
                onClick={() => setActiveTab('dashboard')}
                style={{ background: 'none', border: `1px solid ${C.border}`, color: C.gray, padding: '8px 16px', borderRadius: 4, cursor: 'pointer', fontFamily: "'Space Mono'", fontSize: 10 }}
              >
                ← DASHBOARD
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {concerts
                .filter(c => c.has_setlist || (c.has_setlist_names && c.has_setlist_names.trim() !== ''))
                .sort((a, b) => b.date.localeCompare(a.date))
                .map(c => (
                  <div 
                    key={c.id} 
                    onClick={() => { setEditTarget(c); }}
                    className="setlist-card"
                    style={{ 
                      background: C.bgCard, border: `1px solid ${C.gold}33`, borderRadius: 10, padding: 20, 
                      cursor: 'pointer', position: 'relative', overflow: 'hidden', transition: 'transform 0.2s' 
                    }}
                  >
                    <div style={{ fontSize: 9, color: C.gold, fontFamily: "'Space Mono'", marginBottom: 10, letterSpacing: '0.1em' }}>{fmtDate(c.date)}</div>
                    <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.6rem', color: C.white, marginBottom: 4, lineHeight: 1 }}>
                      {c.has_setlist_names || "VERIFIED SETLIST"}
                    </div>
                    <div style={{ fontSize: 11, color: C.gray, fontFamily: "'Space Mono'" }}>{c.venue} • {c.city}</div>
                    <div style={{ position: 'absolute', right: -10, bottom: -10, opacity: 0.1, fontSize: '4rem', transform: 'rotate(-15deg)' }}>📋</div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ── PASSPORT ── */}
        {activeTab === 'passport' && (
          <div style={{ padding: '24px 0' }} className="fade-in">
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: C.gray, marginBottom: 18 }}>
              {passport.length} festivals · {stats.festDays} total days
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
              {passport.map(f => (
                <div 
                  key={f.name} 
                  className="stamp-card" 
                  onClick={() => {
                    setActiveTab('byFest');
                    setTimeout(() => {
                      const el = document.getElementById(`fest-${f.name.replace(/\s+/g, '-')}`);
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  style={{ 
                    background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 8, 
                    padding: 14, textAlign: 'center', position: 'relative', 
                    boxShadow: '0 2px 8px rgba(0,0,0,0.4)', cursor: 'pointer' 
                  }}
                >
                  <div style={{ position: 'absolute', inset: 5, border: `1px dashed ${C.teal}33`, borderRadius: 5, pointerEvents: 'none' }} />
                  <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1rem', letterSpacing: '0.06em', color: C.white, marginBottom: 5, lineHeight: 1.2, position: 'relative', zIndex: 1 }}>{f.name}</div>
                  <div style={{ fontFamily: "'Bebas Neue'", fontSize: '2rem', color: C.teal, textShadow: `0 0 10px ${C.teal}55`, margin: '4px 0', position: 'relative', zIndex: 1 }}>{f.days}</div>
                  <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, letterSpacing: '0.18em', textTransform: 'uppercase', color: C.gray, position: 'relative', zIndex: 1 }}>{f.days === 1 ? 'day' : 'days'}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center', marginTop: 8, position: 'relative', zIndex: 1 }}>
                    {f.years.map(y => (
                      <span key={y} style={{ fontFamily: "'Space Mono', monospace", fontSize: 7, background: `${C.teal}22`, color: C.teal, border: `1px solid ${C.teal}44`, padding: '2px 5px', borderRadius: 3 }}>{y}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── MANAGE ── */}
        {activeTab === 'manage' && (
          <ManageTab concerts={concerts} onEdit={setEditTarget} onAdd={() => setEditTarget('new')} />
        )}

      </div>
    </div>
  );
}