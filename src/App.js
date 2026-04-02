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
 
const Card = ({ children, style = {}, glow = false }) => (
  <div style={{
    background: C.bgCard, border: `1px solid ${glow ? C.borderLit : C.border}`,
    borderRadius: 8, padding: 16,
    boxShadow: glow ? `0 0 20px ${C.tealGlow}` : '0 2px 8px rgba(0,0,0,0.4)',
    ...style,
  }}>{children}</div>
);
 
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
 
// ─── TIMELINE ─────────────────────────────────────────────────────────────────
function ConcertTimeline({ concerts }) {
  const [hovered, setHovered] = useState(null);
 
  const data = useMemo(() => {
    const m = {};
    concerts.forEach(c => {
      const y = getYear(c.date);
      if (!y) return;
      if (!m[y]) m[y] = { year: y, total: 0, fest: 0, shows: [] };
      m[y].total++;
      if (c.is_festival) m[y].fest++;
      m[y].shows.push(c);
    });
    return Object.values(m).sort((a, b) => a.year - b.year);
  }, [concerts]);
 
  const maxTotal = Math.max(...data.map(d => d.total), 1);
 
  return (
    <div>
      <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', minWidth: data.length * 52, height: 180, position: 'relative', padding: '0 8px' }}>
          {/* baseline */}
          <div style={{ position: 'absolute', bottom: 40, left: 0, right: 0, height: 1, background: C.border }} />
          <div style={{ position: 'absolute', bottom: 40, left: 0, right: 0, height: 1, background: `linear-gradient(to right, transparent, ${C.teal}55, transparent)`, filter: 'blur(1px)' }} />
 
          {data.map((d) => {
            const barH = Math.max(4, (d.total / maxTotal) * 120);
            const festH = Math.max(0, (d.fest / maxTotal) * 120);
            const isHov = hovered === d.year;
            return (
              <div key={d.year} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', cursor: 'pointer' }}
                onMouseEnter={() => setHovered(d.year)} onMouseLeave={() => setHovered(null)}>
                {/* tooltip */}
                {isHov && (
                  <div style={{ position: 'absolute', bottom: barH + 54, left: '50%', transform: 'translateX(-50%)', background: C.bgCard, border: `1px solid ${C.teal}`, borderRadius: 6, padding: '8px 12px', zIndex: 10, whiteSpace: 'nowrap', boxShadow: `0 0 16px ${C.tealGlow}`, pointerEvents: 'none' }}>
                    <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.1rem', color: C.teal, letterSpacing: '0.08em' }}>{d.year}</div>
                    <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: C.white, marginTop: 2 }}>{d.total} shows · {d.fest} fest days</div>
                    <div style={{ fontSize: '0.7rem', color: C.gray, marginTop: 4, maxWidth: 180 }}>
                      {d.shows.slice(0, 3).map(s => (s.bands || []).slice(0, 2).join(', ')).join(' / ')}{d.shows.length > 3 ? '…' : ''}
                    </div>
                  </div>
                )}
                {/* bar */}
                <div style={{ width: 26, height: barH, borderRadius: '3px 3px 0 0', overflow: 'hidden', border: `1px solid ${isHov ? C.teal : 'transparent'}`, transition: 'all 0.2s', boxShadow: isHov ? `0 0 12px ${C.tealGlow}` : 'none', position: 'relative' }}>
                  <div style={{ position: 'absolute', bottom: 0, width: '100%', height: '100%', background: C.grayDim }} />
                  <div style={{ position: 'absolute', bottom: 0, width: '100%', height: `${(festH / barH) * 100}%`, background: `linear-gradient(to top, ${C.teal}cc, ${C.cyan}77)` }} />
                </div>
                {/* dot on baseline */}
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: isHov ? C.teal : C.grayDim, boxShadow: isHov ? `0 0 8px ${C.teal}` : 'none', transition: 'all 0.2s', flexShrink: 0 }} />
                {/* label */}
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 7, color: isHov ? C.teal : C.grayDim, marginTop: 4, transform: 'rotate(-45deg)', transformOrigin: 'top left', whiteSpace: 'nowrap', transition: 'color 0.2s' }}>{d.year}</div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 6 }}>
        {[[C.teal, 'Festival'], [C.grayDim, 'Standalone']].map(([color, label]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 10, height: 10, background: color, borderRadius: 2 }} />
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, color: C.gray, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
 
// ─── FESTIVAL SCHEDULE CARD ───────────────────────────────────────────────────
function FestivalScheduleCard({ event }) {
  const bands = event.bands || [];
  const STAGE_NAMES = ['Main Stage', 'Which Stage', 'This Tent', 'That Tent', 'Other Stage'];
  const STAGE_COLORS = [C.teal, C.cyan, C.purple, C.gold, C.green];
 
  // auto-flow columns based on band count
  const numCols = bands.length <= 2 ? bands.length : bands.length <= 5 ? 3 : bands.length <= 9 ? 4 : 5;
  const columns = Array.from({ length: Math.min(numCols, bands.length) }, () => []);
  bands.forEach((b, i) => columns[i % columns.length].push(b));
 
  return (
    <div className="day-card-hover" style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 8, marginBottom: 12, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>
      <div style={{ background: `linear-gradient(135deg, ${C.bgCardAlt}, ${C.bg})`, borderBottom: `1px solid ${C.border}`, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.1rem', letterSpacing: '0.1em', color: C.white }}>{fmtDate(event.date)}</div>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: C.gray, fontStyle: 'italic', flex: 1 }}>{[event.venue, event.city, event.state].filter(Boolean).join(', ')}</div>
        <Badge color={C.teal}>{event.festival_day || event.festival_name || 'Festival'}</Badge>
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: C.tealDim, background: C.tealFaint, padding: '2px 7px', borderRadius: 3 }}>{bands.length} acts</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns.length}, 1fr)` }}>
        {columns.map((stageBands, ci) => (
          <div key={ci} style={{ borderRight: ci < columns.length - 1 ? `1px solid ${C.border}` : 'none' }}>
            <div style={{ padding: '6px 10px', borderBottom: `2px solid ${STAGE_COLORS[ci % STAGE_COLORS.length]}44`, background: `${STAGE_COLORS[ci % STAGE_COLORS.length]}0a` }}>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase', color: STAGE_COLORS[ci % STAGE_COLORS.length] }}>
                {STAGE_NAMES[ci] || `Stage ${ci + 1}`}
              </div>
            </div>
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
 
// ─── MAIN APP ─────────────────────────────────────────────────────────────────
const TABS = [
  ['dashboard', '⚡ Dashboard'],
  ['byDay',     '📅 By Day'],
  ['byFest',    '🎪 By Festival'],
  ['browse',    '🔍 Browse'],
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
 
            {/* Milestones */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 20 }}>
              {milestones.map((m, i) => (
                <Card key={i} glow={i === 0}>
                  <div style={{ fontSize: '1.4rem', marginBottom: 6 }}>{m.icon}</div>
                  <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, letterSpacing: '0.15em', textTransform: 'uppercase', color: C.tealDim, marginBottom: 4 }}>{m.label}</div>
                  <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.1rem', letterSpacing: '0.06em', color: C.white, lineHeight: 1.2 }}>{m.value}</div>
                  <div style={{ fontSize: '0.72rem', color: C.gray, marginTop: 3, fontStyle: 'italic' }}>{m.sub}</div>
                </Card>
              ))}
            </div>
 
            {/* Timeline */}
            <Card style={{ marginBottom: 18 }}>
              <CardTitle>Concert Timeline — Hover a Year</CardTitle>
              <ConcertTimeline concerts={concerts} />
            </Card>
 
            {/* Charts row 1 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 16 }}>
              <Card>
                <CardTitle>Most Seen Artists</CardTitle>
                {artistCounts.slice(0, 12).map(({ name, count }) => <HBar key={name} name={name} count={count} max={artistCounts[0]?.count || 1} />)}
              </Card>
              <Card>
                <CardTitle>Sets Per Year</CardTitle>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={timelineData} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                    <XAxis dataKey="year" tick={{ fontSize: 9, fontFamily: "'Space Mono', monospace", fill: C.gray }} />
                    <YAxis tick={{ fontSize: 9, fontFamily: "'Space Mono', monospace", fill: C.gray }} />
                    <Tooltip contentStyle={{ fontFamily: "'Space Mono', monospace", fontSize: 11, background: C.bgCard, border: `1px solid ${C.teal}`, color: C.white, borderRadius: 6 }} />
                    <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                      {timelineData.map((_, i) => <Cell key={i} fill={i % 2 === 0 ? C.teal : C.cyan} fillOpacity={0.85} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <CardTitle style={{ marginTop: 14 }}>Festival Days by Fest</CardTitle>
                {festBreakdown.slice(0, 8).map(([name, count]) => <HBar key={name} name={name} count={count} max={festBreakdown[0]?.[1] || 1} color={C.cyan} />)}
              </Card>
              <Card>
                <CardTitle>Festival vs. Standalone</CardTitle>
                {artistCounts.slice(0, 12).map(({ name }) => {
                  const s = artistFestMap[name] || { fest: 0, solo: 0 };
                  const t = s.fest + s.solo;
                  const fp = t ? (s.fest / t) * 100 : 0;
                  return (
                    <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                      <div style={{ fontSize: '0.72rem', color: C.gray, width: 110, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={name}>{name}</div>
                      <div style={{ flex: 1, height: 10, background: C.border, borderRadius: 2, position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', height: '100%', width: `${fp}%`, background: C.teal }} />
                        <div style={{ position: 'absolute', height: '100%', width: `${100 - fp}%`, left: `${fp}%`, background: C.grayDim }} />
                      </div>
                      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, width: 44 }}>
                        <span style={{ color: C.teal }}>{s.fest}F </span><span style={{ color: C.gray }}>{s.solo}S</span>
                      </div>
                    </div>
                  );
                })}
              </Card>
            </div>
 
            {/* Charts row 2 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              <Card><CardTitle>Top Cities</CardTitle>{cityCounts.map(({ name, count }) => <HBar key={name} name={name} count={count} max={cityCounts[0]?.count || 1} color={C.cyan} />)}</Card>
              <Card><CardTitle>Top Venues</CardTitle>{venueCounts.map(({ name, count }) => <HBar key={name} name={name} count={count} max={venueCounts[0]?.count || 1} color={C.purple} />)}</Card>
              <Card>
                <CardTitle>States Visited</CardTitle>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {stateCounts.map(([st, ct]) => (
                    <div key={st} style={{ background: C.bgCardAlt, border: `1px solid ${C.teal}33`, borderRadius: 4, padding: '5px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 36 }}>
                      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, fontWeight: 700, color: C.teal }}>{st}</span>
                      <span style={{ fontSize: 8, color: C.gray, marginTop: 1 }}>{ct}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 14 }}>
                  <CardTitle>Decade Breakdown</CardTitle>
                  {(() => {
                    const dec = { '90s': 0, '00s': 0, '10s': 0, '20s': 0 };
                    sets.forEach(s => { const y = getYear(s.date); if (!y) return; if (y < 2000) dec['90s']++; else if (y < 2010) dec['00s']++; else if (y < 2020) dec['10s']++; else dec['20s']++; });
                    const mx = Math.max(...Object.values(dec));
                    return Object.entries(dec).map(([name, count]) => <HBar key={name} name={name} count={count} max={mx} color={C.gold} />);
                  })()}
                </div>
              </Card>
            </div>
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
              .map(fg => (
                <div key={fg.name} style={{ marginBottom: 32 }}>
                  <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.6rem', letterSpacing: '0.1em', color: C.teal, textShadow: `0 0 12px ${C.teal}44`, marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${C.teal}33`, display: 'flex', alignItems: 'baseline', gap: 10 }}>
                    {fg.name}
                    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: C.gray, fontWeight: 400 }}>
                      {Object.keys(fg.years).length} yr{Object.keys(fg.years).length !== 1 ? 's' : ''} · {Object.values(fg.years).flat().length} days
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
                    {Object.entries(fg.years).sort((a, b) => +a[0] - +b[0]).map(([yr, evs]) => (
                      <div key={yr} style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden' }}>
                        <div style={{ background: `linear-gradient(135deg, ${C.teal}22, ${C.bgCardAlt})`, padding: '10px 14px', borderBottom: `1px solid ${C.border}` }}>
                          <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.1rem', letterSpacing: '0.08em', color: C.white }}>{fg.name} {yr}</div>
                          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, color: C.gray, marginTop: 2 }}>{evs.length} day{evs.length !== 1 ? 's' : ''}</div>
                        </div>
                        {evs.map(ev => (
                          <div key={ev.id} style={{ padding: '10px 14px', borderBottom: `1px solid ${C.border}` }}>
                            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.tealDim, marginBottom: 6 }}>
                              {ev.festival_day || fmtDate(ev.date)}
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                              {(ev.bands || []).map((b, i) => (
                                <span key={i} style={{ fontSize: '0.7rem', color: C.white, background: C.bgCardAlt, border: `1px solid ${C.teal}33`, borderRadius: 3, padding: '2px 7px' }}>{b}</span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
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
                      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.gray, marginTop: 4, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                        <span>Seen <strong style={{ color: C.teal }}>{shows.length}×</strong></span>
                        <span>Fest <strong style={{ color: C.teal }}>{fc}</strong></span>
                        <span>Solo <strong style={{ color: C.teal }}>{shows.length - fc}</strong></span>
                        {slCount > 0 && <span>Setlists <strong style={{ color: C.teal }}>{slCount} 📋</strong></span>}
                        <span>First <strong style={{ color: C.teal }}>{fmtDate(shows[shows.length - 1]?.date)}</strong></span>
                        <span>Last <strong style={{ color: C.teal }}>{fmtDate(shows[0]?.date)}</strong></span>
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
 