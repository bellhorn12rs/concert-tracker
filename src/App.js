import React, { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from './supabaseClient';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
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

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&family=Bebas+Neue&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0a0a0f; color: #f0f4f8; font-family: 'Inter', sans-serif; }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: #0a0a0f; }
  ::-webkit-scrollbar-thumb { background: #445566; border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: #00b5a0; }
  input, select, textarea, button { font-family: inherit; }
  @keyframes pulse-teal {
    0%, 100% { box-shadow: 0 0 0 0 rgba(0,229,204,0.15); }
    50%       { box-shadow: 0 0 20px 6px rgba(0,229,204,0.12); }
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .fade-in { animation: fadeIn 0.3s ease forwards; }
  .row-hover:hover { background: #1c1c28 !important; cursor: pointer; }
  .stamp-card { transition: all 0.2s; }
  .stamp-card:hover { border-color: #00e5cc !important; transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,229,204,0.15) !important; }
  .day-card-hover { transition: border-color 0.2s; }
  .day-card-hover:hover { border-color: #00e5cc44 !important; }
  .nav-tab-btn:hover { color: #00e5cc !important; }
  .setlist-btn { transition: all 0.15s; }
  .setlist-btn:hover { transform: scale(1.2); }
`;

if (!document.getElementById('app-global-css')) {
  const tag = document.createElement('style');
  tag.id = 'app-global-css';
  tag.textContent = GLOBAL_CSS;
  document.head.appendChild(tag);
}

// ─── YOU WERE THERE FACTS ─────────────────────────────────────────────────────
const YOU_WERE_THERE = [
  {
    emoji: '🎸',
    headline: "Radiohead's Greatest Show Ever",
    body: "The Bonnaroo 2006 Radiohead set — nearly 3 hours, 29 songs — is widely called the best performance in Bonnaroo history. Jonny Greenwood called it the best festival experience he had ever had in America. Thom Yorke said it was his favourite gig for years. You were there.",
    match: (c) => c.bands?.includes('Radiohead') && c.festival_name === 'Bonnaroo',
  },
  {
    emoji: '💧',
    headline: "The Mud. The Tears. The Final Phish Show.",
    body: "Coventry 2004 was billed as Phish's last shows ever. The grounds flooded, traffic backed up 30 miles, thousands hiked in on foot. Trey wept onstage during Velvet Sea. You stood in ankle-deep mud watching what everyone thought was the end. It wasn't — but you were there.",
    match: (c) => c.festival_name === 'Coventry',
  },
  {
    emoji: '🪦',
    headline: "Tom Petty at Bonnaroo 2006",
    body: "Tom Petty headlined Bonnaroo 2006. He died October 2, 2017 — one week after his final show, which he completed with a fractured hip rather than cancel on his crew and fans. His widow said he was pounding his chest going, I'm on top of the world the day before he died. You caught him at peak Heartbreakers.",
    match: (c) => c.bands?.includes('Tom Petty') && c.festival_name === 'Bonnaroo' && c.date?.startsWith('2006'),
  },
  {
    emoji: '🪦',
    headline: "Tom Petty at Bonnaroo 2013",
    body: "One of Tom Petty's last major festival appearances — four years before he died. He finished his final 2017 tour with a fractured hip, refusing surgery because he felt he owed it to his crew and fans. You saw him twice at Bonnaroo across seven years. That is a gift.",
    match: (c) => c.bands?.includes('Tom Petty') && c.date?.startsWith('2013'),
  },
  {
    emoji: '🕊️',
    headline: "The Last Frightened Rabbit Set You'll Ever See",
    body: "Frightened Rabbit played FPSF 2017 — one of their final US shows. Scott Hutchison, whose brutally honest lyrics about depression helped thousands of fans feel less alone, died by suicide in May 2018. His last tweet read: Be so good to everyone you love. You were in that crowd.",
    match: (c) => c.bands?.includes('Frightened Rabbit'),
  },
  {
    emoji: '🎪',
    headline: "You've Done Bonnaroo 14 Times",
    body: "From 2005 through 2019, missing only 2017, you hit Bonnaroo 14 times — 55 total days in the field. That is more than a full work week in the mud every year for a decade and a half. The Farm basically knows your name.",
    static: true,
    match: () => false,
  },
  {
    emoji: '🐺',
    headline: "You've Seen Ween 16 Times",
    body: "Ween is your most-seen band with 16 sets — festivals, clubs, Red Rocks, multiple nights in Denver, Austin residencies. You have a relationship with Dean and Gene that most people only dream about.",
    static: true,
    match: () => false,
  },
  {
    emoji: '🎙️',
    headline: "Guster and Dr. Dog: Tied at 15",
    body: "Your second and third most-seen artists — Guster (15 sets) and Dr. Dog (15 sets) — are exactly tied. You even attended the Guster on the Ocean event in Portland ME in 2018. Three days on the water with one band. That is devotion.",
    static: true,
    match: () => false,
  },
  {
    emoji: '⚡',
    headline: "2017 Was Your Peak Year",
    body: "47 sets in 2017 — your personal record. ACL weekend 1, ACL weekend 2, Willie Nelson 4th of July, Roger Waters, Ween at Red Rocks three nights running, and a dozen standalone Austin shows. You were everywhere that year.",
    static: true,
    match: () => false,
  },
  {
    emoji: '💍',
    headline: "You Got Married at a Show",
    body: "November 10, 2021: Chvrches at ACL Live at the Moody Theater, Austin. Your data has it labeled GOT MARRIED. A concert was the backdrop for one of the biggest nights of your life. Extremely on brand.",
    match: (c) => c.bands?.includes('Chvrches') && c.date === '2021-11-10',
  },
  {
    emoji: '🗺️',
    headline: "17 States and Counting",
    body: "Texas leads with 210 shows, Massachusetts with 68, Tennessee with 55 from all that Bonnaroo. You have seen live music in 17 US states plus Ontario. Your concert map looks like a life well traveled.",
    static: true,
    match: () => false,
  },
  {
    emoji: '🎶',
    headline: "Over 1,000 Individual Sets Witnessed",
    body: "425 show days translates to 1,046 individual sets seen live. That is an average of 2.5 bands every single show night for 25 years straight. You have seen more live music than most people see in a lifetime.",
    static: true,
    match: () => false,
  },
  {
    emoji: '🌊',
    headline: "SXSW Veteran: 29 Days Deep",
    body: "You have done SXSW seriously — 29 days across 2006, 2008, 2010, 2011, 2015, 2016, 2017, and 2019. That means bands in parking lots, record store stages, and bat bars at 2am. Real SXSW.",
    static: true,
    match: () => false,
  },
  {
    emoji: '📋',
    headline: "Your Setlist Collection Starts With Billy Idol",
    body: "October 9, 2015. ACL Friday. Billy Idol. That is where the physical setlist collection began and you have been building it ever since. There is something special about a piece of paper someone played off a stage.",
    match: (c) => c.bands?.includes('Billy Idol'),
  },
  {
    emoji: '🔄',
    headline: "Arcade Fire: 10 Times, Multiple States",
    body: "Arcade Fire is your most-traveled-for band. 10 sets across Boston, NYC, Bridgeport, Brooklyn, Austin, Dallas, and New Orleans. You followed them across the country and through three different eras of the band.",
    static: true,
    match: () => false,
  },
];


// ─── HALL OF FAME ARTISTS ─────────────────────────────────────────────────────
// These get the full timeline treatment in the Hall of Fame tab
const HALL_OF_FAME_MIN = 7; // seen 7+ times



// ─── HELPERS ──────────────────────────────────────────────────────────────────
const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};
const getYear = (d) => d ? parseInt(d.slice(0, 4)) : null;
const SETLIST_START = '2015-10-09';

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
    date:          concert?.date || '',
    bands:         (concert?.bands || []).join(', '),
    venue:         concert?.venue || '',
    city:          concert?.city || '',
    state:         concert?.state || '',
    is_festival:   concert?.is_festival || false,
    festival_name: concert?.festival_name || '',
    festival_day:  concert?.festival_day || '',
    has_setlist:   concert?.has_setlist || false,
  });
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    await onSave(concert?.id, { ...form, bands: form.bands.split(',').map(b => b.trim()).filter(Boolean) });
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

        <div style={{ ...fld, display: 'flex', alignItems: 'center', gap: 10 }}>
          <input type="checkbox" id="has_sl" checked={form.has_setlist} onChange={e => set('has_setlist', e.target.checked)}
            disabled={form.date && form.date < SETLIST_START}
            style={{ accentColor: C.teal, width: 16, height: 16 }} />
          <label htmlFor="has_sl" style={{ ...lbl, marginBottom: 0, cursor: 'pointer', opacity: form.date && form.date < SETLIST_START ? 0.4 : 1 }}>
            Got physical setlist 📋 {form.date && form.date < SETLIST_START ? '(pre-2015, not tracked)' : ''}
          </label>
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


// ─── YOU WERE THERE WIDGET ────────────────────────────────────────────────────
function YouWereThere({ concerts }) {
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * YOU_WERE_THERE.length));
  const [fading, setFading] = useState(false);

  const fact = YOU_WERE_THERE[idx];

  // Try to match a real concert from user's data, fall back to showing the static fact
  const matchedConcert = useMemo(() => {
    if (!fact.match) return null;
    return concerts.find(c => fact.match(c)) || null;
  }, [fact, concerts]);

  const next = () => {
    setFading(true);
    setTimeout(() => {
      setIdx(i => (i + 1) % YOU_WERE_THERE.length);
      setFading(false);
    }, 250);
  };

  return (
    <div style={{
      background: `linear-gradient(135deg, ${C.bgCard} 0%, ${C.bgCardAlt} 100%)`,
      border: `1px solid ${C.gold}55`,
      borderRadius: 8, padding: '16px 20px', marginBottom: 20,
      boxShadow: `0 0 20px rgba(255,204,0,0.08)`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', color: C.gold }}>
          ⭐ You Were There
        </div>
        <button onClick={next} style={{
          fontFamily: "'Space Mono', monospace", fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase',
          background: 'transparent', border: `1px solid ${C.grayDim}`, borderRadius: 3,
          color: C.gray, padding: '3px 8px', cursor: 'pointer', transition: 'all 0.15s',
        }} onMouseEnter={e => { e.target.style.borderColor = C.gold; e.target.style.color = C.gold; }}
           onMouseLeave={e => { e.target.style.borderColor = C.grayDim; e.target.style.color = C.gray; }}>
          Next →
        </button>
      </div>
      <div style={{ opacity: fading ? 0 : 1, transition: 'opacity 0.25s' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ fontSize: '2rem', flexShrink: 0, lineHeight: 1 }}>{fact.emoji}</div>
          <div>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.2rem', letterSpacing: '0.06em', color: C.gold, marginBottom: 6, lineHeight: 1.1 }}>{fact.headline}</div>
            <div style={{ fontSize: '0.82rem', color: C.gray, lineHeight: 1.6 }}>{fact.body}</div>
            {matchedConcert && (
              <div style={{ marginTop: 8, fontFamily: "'Space Mono', monospace", fontSize: 8, color: C.tealDim, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                📍 {fmtDate(matchedConcert.date)} · {[matchedConcert.venue, matchedConcert.city].filter(Boolean).join(', ')}
              </div>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8, gap: 4 }}>
          {YOU_WERE_THERE.map((_, i) => (
            <div key={i} onClick={() => { setFading(true); setTimeout(() => { setIdx(i); setFading(false); }, 250); }}
              style={{ width: i === idx ? 16 : 5, height: 5, borderRadius: 3, background: i === idx ? C.gold : C.grayDim, cursor: 'pointer', transition: 'all 0.2s' }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── RANDOM SHOW ─────────────────────────────────────────────────────────────
function RandomShow({ concerts }) {
  const [show, setShow] = useState(null);
  const [spinning, setSpinning] = useState(false);

  const spin = () => {
    setSpinning(true);
    let count = 0;
    const interval = setInterval(() => {
      setShow(concerts[Math.floor(Math.random() * concerts.length)]);
      count++;
      if (count > 10) {
        clearInterval(interval);
        setSpinning(false);
      }
    }, 80);
  };

  useEffect(() => { if (concerts.length) spin(); }, [concerts.length]);

  if (!show) return null;

  return (
    <div style={{ background: C.bgCard, border: `1px solid ${C.purple}55`, borderRadius: 8, padding: '16px 20px', marginBottom: 20, boxShadow: `0 0 16px rgba(153,102,255,0.08)` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', color: C.purple }}>🎲 Random Show</div>
        <button onClick={spin} style={{
          fontFamily: "'Space Mono', monospace", fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase',
          background: C.purple + '22', border: `1px solid ${C.purple}55`, borderRadius: 3,
          color: C.purple, padding: '4px 10px', cursor: 'pointer', transition: 'all 0.15s',
        }} onMouseEnter={e => { e.target.style.background = C.purple + '44'; }}
           onMouseLeave={e => { e.target.style.background = C.purple + '22'; }}>
          🎲 Spin Again
        </button>
      </div>
      <div style={{ opacity: spinning ? 0.4 : 1, transition: 'opacity 0.1s' }}>
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.3rem', letterSpacing: '0.08em', color: C.white, marginBottom: 4 }}>
          {fmtDate(show.date)}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 8 }}>
          {(show.bands || []).map((b, i) => (
            <span key={i} style={{ fontSize: '0.8rem', color: C.white, background: C.bgCardAlt, border: `1px solid ${C.purple}44`, borderRadius: 4, padding: '3px 9px', fontWeight: 500 }}>{b}</span>
          ))}
        </div>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, color: C.gray, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {show.venue && <span>📍 {show.venue}</span>}
          {show.city && <span>{show.city}{show.state ? `, ${show.state}` : ''}</span>}
          {show.is_festival && show.festival_day && <span style={{ color: C.tealDim }}>🎪 {show.festival_day}</span>}
        </div>
      </div>
    </div>
  );
}

// ─── HALL OF FAME ─────────────────────────────────────────────────────────────
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
    setSelected(isSelected ? null : artist);
    if (!isSelected) setTimeout(() => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 30);
  };

  return (
    <div ref={topRef} style={{ padding: '24px 0' }} className="fade-in">
      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: C.gray, marginBottom: 16, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        Artists seen {HALL_OF_FAME_MIN}+ times — click any to see full history
      </div>

      {/* Timeline for selected artist — shown ABOVE the grid */}
      {selectedData && (
        <div className="fade-in" style={{ background: C.bgCard, border: `1px solid ${C.teal}55`, borderRadius: 8, padding: '18px 20px', marginBottom: 24, boxShadow: `0 0 20px ${C.tealGlow}` }}>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.5rem', letterSpacing: '0.08em', color: C.teal, marginBottom: 4 }}>{selectedData.artist}</div>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: C.gray, marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {selectedData.shows.length} sets · first: {fmtDate(selectedData.shows[selectedData.shows.length - 1]?.date)} · last: {fmtDate(selectedData.shows[0]?.date)}
          </div>

          {/* Full show list as vertical timeline */}
          <div style={{ position: 'relative', paddingLeft: 20 }}>
            {/* timeline spine */}
            <div style={{ position: 'absolute', left: 5, top: 0, bottom: 0, width: 1, background: `linear-gradient(to bottom, ${C.teal}, ${C.grayDim})` }} />
            {[...selectedData.shows].reverse().map((s, i) => (
              <div key={i} style={{ position: 'relative', marginBottom: 10, paddingLeft: 14 }}>
                {/* dot */}
                <div style={{ position: 'absolute', left: -7, top: 4, width: 8, height: 8, borderRadius: '50%', background: s.is_festival ? C.teal : C.grayDim, border: `1px solid ${s.is_festival ? C.teal : C.border}`, boxShadow: s.is_festival ? `0 0 6px ${C.teal}` : 'none' }} />
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: C.tealDim, whiteSpace: 'nowrap' }}>{fmtDate(s.date)}</span>
                  {s.is_festival && s.festival_day && <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, color: C.teal, background: `${C.teal}18`, padding: '1px 5px', borderRadius: 2 }}>{s.festival_day}</span>}
                  <span style={{ fontSize: '0.75rem', color: C.gray }}>{[s.venue, s.city, s.state].filter(Boolean).join(', ')}</span>
                  {s.has_setlist && <span style={{ fontSize: 11 }} title="Got setlist">📋</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Artist grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10, marginBottom: 28 }}>
        {artists.map((a, i) => {
          const isSelected = selected === a.artist;
          const festCount = a.shows.filter(s => s.is_festival).length;
          const pct = Math.round((festCount / a.shows.length) * 100);
          return (
            <div key={a.artist} onClick={() => handleSelect(a.artist, isSelected)} style={{ background: isSelected ? `${C.teal}18` : C.bgCard, border: `1px solid ${isSelected ? C.teal : C.border}`, borderRadius: 8, padding: '12px 14px', cursor: 'pointer', transition: 'all 0.18s', boxShadow: isSelected ? `0 0 16px ${C.tealGlow}` : 'none' }}>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: isSelected ? C.teal : C.tealDim, marginBottom: 4 }}>{MEDAL[i] || '🎤'} #{i + 1}</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: C.white, marginBottom: 6, lineHeight: 1.2 }}>{a.artist}</div>
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.6rem', color: isSelected ? C.teal : C.gray, lineHeight: 1 }}>{a.shows.length}×</div>
              <div style={{ marginTop: 6, height: 3, background: C.border, borderRadius: 2, overflow: 'hidden' }}><div style={{ height: '100%', width: `${pct}%`, background: C.teal, borderRadius: 2 }} /></div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 7, color: C.grayDim, marginTop: 3 }}>{festCount}F · {a.shows.length - festCount}S</div>
              {onShare && <button onClick={e => { e.stopPropagation(); onShare(a.artist, a.shows); }} style={{ marginTop: 6, fontFamily: "'Space Mono', monospace", fontSize: 7, textTransform: 'uppercase', background: 'transparent', border: `1px solid ${C.teal}44`, color: C.tealDim, borderRadius: 2, padding: '2px 7px', cursor: 'pointer', width: '100%' }}>Share ↗</button>}
            </div>
          );
        })}
      </div>
    </div>
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

function LocationHeatmap({ concerts }) {
  // 1. Calculate State Colors
  const stateCounts = useMemo(() => {
    const m = {};
    concerts.forEach(c => { if (c.state) m[c.state] = (m[c.state] || 0) + 1; });
    return m;
  }, [concerts]);

  // 2. Calculate City Bubbles
  const cityData = useMemo(() => {
    const m = {};
    concerts.forEach(c => {
      if (c.city && c.state && STATE_COORDS[c.state]) {
        const key = `${c.city}, ${c.state}`;
        if (!m[key]) m[key] = { name: c.city, state: c.state, count: 0, x: STATE_COORDS[c.state].x, y: STATE_COORDS[c.state].y };
        m[key].count++;
      }
    });
    return Object.values(m);
  }, [concerts]);

  const maxState = Math.max(...Object.values(stateCounts), 1);
  const maxCity = Math.max(...cityData.map(d => d.count), 1);

  return (
    <div style={{ position: 'relative', background: '#050508', borderRadius: '12px', padding: '24px', border: `1px solid ${C.border}` }}>
      <svg viewBox="0 0 960 600" style={{ width: '100%', height: 'auto', display: 'block' }}>
        {/* PHYSICAL US OUTLINE (The "Map" Look) */}
        <path 
          d="M165,100 L795,100 L840,150 L840,400 L700,500 L300,500 L120,400 Z" 
          fill="#111118" 
          stroke={C.border} 
          strokeWidth="2" 
          opacity="0.5"
        />
        
        {/* SUBTLE STATE GRID LINES */}
        <line x1="300" y1="100" x2="300" y2="500" stroke={C.border} strokeWidth="0.5" opacity="0.2" />
        <line x1="550" y1="100" x2="550" y2="500" stroke={C.border} strokeWidth="0.5" opacity="0.2" />
        <line x1="165" y1="300" x2="840" y2="300" stroke={C.border} strokeWidth="0.5" opacity="0.2" />

        {/* STATE SQUARES (Heatmap Layer) */}
        {Object.entries(STATE_COORDS).map(([abbr, pos]) => {
          const count = stateCounts[abbr] || 0;
          const isVisited = count > 0;
          const stateFill = isVisited 
            ? (count / maxState > 0.6 ? C.teal : C.purple) 
            : 'transparent';

          return (
            <g key={abbr}>
              <rect
                x={pos.x - 16} y={pos.y - 16} width={32} height={32} rx={6}
                fill={stateFill}
                stroke={isVisited ? C.white : C.grayDim}
                strokeWidth={isVisited ? 1.5 : 0.5}
                opacity={isVisited ? 1 : 0.2}
                style={{ filter: isVisited ? `drop-shadow(0 0 8px ${stateFill}66)` : 'none' }}
              />
              <text 
                x={pos.x} y={pos.y + 4} 
                textAnchor="middle" 
                style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, fill: isVisited ? C.white : C.grayDim, fontWeight: 700, pointerEvents: 'none' }}
              >
                {abbr}
              </text>
            </g>
          );
        })}

        {/* CITY BUBBLES (Quantity Layer) */}
        {cityData.map((city, i) => {
          const radius = Math.sqrt(city.count / maxCity) * 45 + 5;
          return (
            <circle
              key={`city-${i}`}
              cx={city.x}
              cy={city.y}
              r={radius}
              fill="transparent"
              stroke={C.cyan}
              strokeWidth="2"
              opacity="0.6"
              style={{ pointerEvents: 'none', filter: `drop-shadow(0 0 10px ${C.cyan})` }}
            />
          );
        })}
      </svg>

      <div style={{ display: 'flex', gap: 24, marginTop: 20, justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 14, height: 14, background: C.teal, borderRadius: 3 }} />
          <span style={{ fontSize: 10, color: C.white, fontFamily: "'Space Mono'", letterSpacing: '1px' }}>HEAVY PRESENCE</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 14, height: 14, background: C.purple, borderRadius: 3 }} />
          <span style={{ fontSize: 10, color: C.white, fontFamily: "'Space Mono'", letterSpacing: '1px' }}>VISITED</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 16, height: 16, border: `2px solid ${C.cyan}`, borderRadius: '50%' }} />
          <span style={{ fontSize: 10, color: C.white, fontFamily: "'Space Mono'", letterSpacing: '1px' }}>SHOW DENSITY</span>
        </div>
      </div>
    </div>
  );
}

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

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
const TABS = [
  ['dashboard', '⚡ Dashboard'],
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
  const [shareCard, setShareCard] = useState(null); // { artist, shows }

  useEffect(() => { fetchConcerts(); }, []);

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
      if (id) {
        const { error } = await supabase.from('concerts').update(payload).eq('id', id);
        if (error) throw error;
        setConcerts(p => p.map(c => c.id === id ? { ...c, ...payload } : c));
      } else {
        const { data, error } = await supabase.from('concerts').insert([payload]).select();
        if (error) throw error;
        if (data?.[0]) setConcerts(p => [data[0], ...p]);
      }
      setEditTarget(null);
    } catch (err) { alert('Save failed: ' + err.message); }
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
      totalShows: concerts.length, totalSets: sets.length,
      uniqueArtists: Object.keys(ac).length, venueCount: venues.size,
      topArtist: Object.entries(ac).sort((a, b) => b[1] - a[1])[0] || ['—', 0],
      festDays: concerts.filter(c => c.is_festival).length,
      setlistCount: concerts.filter(c => c.has_setlist).length,
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
      { icon: '📋', label: 'Setlists', value: stats.setlistCount, sub: 'since Billy Idol ACL 2015' },
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
      <div style={{ background: `linear-gradient(180deg, #050508 0%, ${C.bgCard} 100%)`, borderBottom: `1px solid ${C.teal}33`, padding: '28px 24px 20px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, left: '50%', transform: 'translateX(-50%)', width: 400, height: 120, background: `radial-gradient(ellipse, ${C.tealGlow}, transparent)`, pointerEvents: 'none' }} />
        <h1 style={{ fontFamily: "'Bebas Neue'", fontSize: 'clamp(2rem, 6vw, 3.5rem)', letterSpacing: '0.12em', color: C.white, margin: 0, position: 'relative' }}>
          🎸 Eric's <span style={{ color: C.teal, textShadow: `0 0 20px ${C.teal}66` }}>Concert</span> History
        </h1>
        <div style={{ marginTop: 6, fontFamily: "'Space Mono', monospace", fontSize: '0.78rem', color: C.gray, letterSpacing: '0.1em' }}>Every show. Every set. Every memory.</div>
        <div style={{ width: 80, height: 1, background: `linear-gradient(to right, transparent, ${C.teal}, transparent)`, margin: '12px auto 0' }} />
      </div>

      {/* STAT STRIP */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', background: C.bgCard, borderBottom: `1px solid ${C.border}` }}>
        {[
          [stats.totalSets,      'Total Sets',     'individual performances'],
          [stats.uniqueArtists,  'Unique Artists',  'bands & performers'],
          [stats.totalShows,     'Show Days',       `${stats.festDays} fest · ${stats.totalShows - stats.festDays} solo`],
          [stats.setlistCount,   'Setlists',        'physical collection 📋'],
        ].map(([num, label, sub], i) => (
          <div key={i} style={{ padding: '16px 12px', textAlign: 'center', borderRight: i < 3 ? `1px solid ${C.border}` : 'none' }}>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', color: C.teal, lineHeight: 1, textShadow: `0 0 12px ${C.teal}44` }}>{typeof num === 'number' ? num.toLocaleString() : num}</div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.gray, marginTop: 4 }}>{label}</div>
            <div style={{ fontSize: '0.72rem', color: C.grayDim, marginTop: 2, fontStyle: 'italic' }}>{sub}</div>
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16, marginBottom: 4 }}>
              <YouWereThere concerts={concerts} />
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

            {/* ── ROW 1: Artist podium (big) + Sets Per Year (wide bar) ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16, marginBottom: 16 }}>

              {/* Artist podium — top 5 as ranked stat blocks */}
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

              {/* Sets per year — area-style bar chart */}
              <Card neon>
                <CardTitle>Sets Per Year</CardTitle>
                <ResponsiveContainer width="100%" height={180}>
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
            </div>

            {/* ── ROW 2: Location heatmap (full width) ── */}
            <Card neon style={{ marginBottom: 16 }}>
              <CardTitle>Shows by Location — hover any state for count</CardTitle>
              <LocationHeatmap concerts={concerts} />
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
                <div key={fg.name} style={{ marginBottom: 0 }}>
                  {/* ── CONCERT POSTER DIVIDER ── */}
                  <div style={{
                    position: 'relative', overflow: 'hidden',
                    background: `linear-gradient(135deg, ${C.bg} 0%, ${fColor}18 50%, ${C.bg} 100%)`,
                    borderTop: fgIdx > 0 ? `2px solid ${fColor}` : 'none',
                    borderBottom: `2px solid ${fColor}`,
                    padding: '20px 24px',
                    marginBottom: 20,
                    marginTop: fgIdx > 0 ? 40 : 0,
                  }}>
                    {/* decorative corner lines */}
                    <div style={{ position: 'absolute', top: 6, left: 6, width: 24, height: 24, borderTop: `1px solid ${fColor}66`, borderLeft: `1px solid ${fColor}66` }} />
                    <div style={{ position: 'absolute', top: 6, right: 6, width: 24, height: 24, borderTop: `1px solid ${fColor}66`, borderRight: `1px solid ${fColor}66` }} />
                    <div style={{ position: 'absolute', bottom: 6, left: 6, width: 24, height: 24, borderBottom: `1px solid ${fColor}66`, borderLeft: `1px solid ${fColor}66` }} />
                    <div style={{ position: 'absolute', bottom: 6, right: 6, width: 24, height: 24, borderBottom: `1px solid ${fColor}66`, borderRight: `1px solid ${fColor}66` }} />
                    {/* glow orb */}
                    <div style={{ position: 'absolute', top: -30, left: '50%', transform: 'translateX(-50%)', width: 200, height: 80, background: `radial-gradient(ellipse, ${fColor}22, transparent)`, pointerEvents: 'none' }} />

                    <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                      <div style={{ fontFamily: "'Bebas Neue'", fontSize: 'clamp(2rem, 5vw, 3.2rem)', letterSpacing: '0.15em', color: fColor, textShadow: `0 0 20px ${fColor}55`, lineHeight: 1, marginBottom: 8 }}>
                        {fg.name}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: C.white, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                          {totalDays} {totalDays === 1 ? 'day' : 'days attended'}
                        </span>
                        <span style={{ color: fColor, fontSize: 10 }}>·</span>
                        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: C.gray, letterSpacing: '0.1em' }}>
                          {Object.keys(fg.years).length} {Object.keys(fg.years).length === 1 ? 'year' : 'years'}
                        </span>
                        <span style={{ color: fColor, fontSize: 10 }}>·</span>
                        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: C.gray, letterSpacing: '0.1em' }}>
                          {Math.min(...allYears)}–{Math.max(...allYears)}
                        </span>
                      </div>
                      {/* year tags row */}
                      <div style={{ display: 'flex', justifyContent: 'center', gap: 4, flexWrap: 'wrap', marginTop: 10 }}>
                        {Object.keys(fg.years).sort().map(yr => (
                          <span key={yr} style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, background: `${fColor}22`, color: fColor, border: `1px solid ${fColor}44`, padding: '2px 7px', borderRadius: 3 }}>{yr}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* Year sections — each year is a fully boxed container */}
                  {Object.entries(fg.years).sort((a, b) => +a[0] - +b[0]).map(([yr, evs]) => (
                    <div key={yr} style={{
                      marginBottom: 28,
                      border: `1px solid ${fColor}55`,
                      borderTop: `4px solid ${fColor}`,
                      borderRadius: 10,
                      overflow: 'hidden',
                      background: `linear-gradient(180deg, ${fColor}0a 0%, ${C.bg} 80px)`,
                      boxShadow: `0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 ${fColor}22`,
                    }}>
                      {/* Year header bar */}
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 14,
                        padding: '12px 18px',
                        borderBottom: `1px solid ${fColor}33`,
                        background: `${fColor}0f`,
                      }}>
                        <div style={{
                          fontFamily: "'Bebas Neue'", fontSize: '1.6rem',
                          letterSpacing: '0.12em', color: fColor,
                          textShadow: `0 0 12px ${fColor}55`, lineHeight: 1,
                        }}>
                          {fg.name} {yr}
                        </div>
                        <div style={{
                          fontFamily: "'Space Mono', monospace", fontSize: 8,
                          color: C.gray, textTransform: 'uppercase', letterSpacing: '0.14em',
                          background: C.bgCardAlt, border: `1px solid ${C.border}`,
                          padding: '3px 8px', borderRadius: 3,
                        }}>
                          {evs.length} {evs.length === 1 ? 'day' : 'days'}
                        </div>
                        <div style={{
                          fontFamily: "'Space Mono', monospace", fontSize: 8,
                          color: C.gray, textTransform: 'uppercase', letterSpacing: '0.1em',
                        }}>
                          {evs[0]?.city ? `${evs[0].city}, ${evs[0].state}` : ''}
                        </div>
                      </div>
                      {/* Days inside the box */}
                      <div style={{ padding: '14px 14px 6px' }}>
                        {evs.map(ev => (
                          <FestivalScheduleCard key={ev.id} event={ev} compact={true} />
                        ))}
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
                          <td style={{ padding: '8px 12px', textAlign: 'center' }} onClick={e => { e.stopPropagation(); if (s.date >= SETLIST_START) toggleSetlist(s); }}>
                            {s.date >= SETLIST_START
                              ? <span className="setlist-btn" style={{ fontSize: 16, cursor: 'pointer', opacity: s.has_setlist ? 1 : 0.25 }} title={s.has_setlist ? 'Got it!' : 'Click to mark'}>📋</span>
                              : <span style={{ color: C.grayDim, fontSize: 10 }}>—</span>}
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
          <HallOfFame sets={sets} onShare={(artist, shows) => setShareCard({ artist, shows })} />
        )}

        {/* ── PASSPORT ── */}
        {activeTab === 'passport' && (
          <div style={{ padding: '24px 0' }} className="fade-in">
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: C.gray, marginBottom: 18 }}>
              {passport.length} festivals · {stats.festDays} total days
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
              {passport.map(f => (
                <div key={f.name} className="stamp-card" style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 8, padding: 14, textAlign: 'center', position: 'relative', boxShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
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

