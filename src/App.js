import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from './supabaseClient';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend
} from 'recharts';

// ─── THEME ────────────────────────────────────────────────────────────────────
const C = {
  cream: '#f5efe0',
  parchment: '#ede3c8',
  amber: '#c8841a',
  amberLt: '#e8a83a',
  rust: '#8b3a1a',
  ink: '#1e140a',
  inkMid: '#3d2b14',
  inkFaint: '#6b5032',
  border: '#c4a96a',
  green: '#3a6b3e',
  white: '#ffffff',
};

const CHART_COLORS = [C.rust, C.amber, C.amberLt, C.inkMid, C.inkFaint, C.border, '#a0522d', '#cd853f', '#daa520', '#8b6914'];

// ─── STYLES ───────────────────────────────────────────────────────────────────
const S = {
  app: { fontFamily: "'Georgia', 'Times New Roman', serif", backgroundColor: C.cream, minHeight: '100vh', paddingBottom: 60 },
  header: { background: C.ink, borderBottom: `4px solid ${C.amber}`, padding: '28px 24px 20px', textAlign: 'center', position: 'relative' },
  headerTitle: { fontFamily: "'Georgia', serif", fontSize: 'clamp(1.6rem, 4vw, 2.8rem)', fontWeight: 900, color: C.cream, margin: 0 },
  headerSub: { marginTop: 6, fontStyle: 'italic', fontSize: '0.9rem', color: C.border },
  headerRule: { width: 60, height: 2, background: C.amber, margin: '12px auto 0' },

  statStrip: { background: C.parchment, borderBottom: `2px solid ${C.border}`, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' },
  statCell: { padding: '18px 12px', textAlign: 'center', borderRight: `1px solid ${C.border}` },
  statNum: { fontFamily: "'Georgia', serif", fontSize: 'clamp(1.6rem, 3vw, 2.6rem)', fontWeight: 900, color: C.rust, lineHeight: 1 },
  statLabel: { fontFamily: 'monospace', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.inkFaint, marginTop: 4 },
  statSub: { fontStyle: 'italic', fontSize: '0.74rem', color: C.amber, marginTop: 2 },

  nav: { background: C.inkMid, borderBottom: `3px solid ${C.amber}`, display: 'flex', overflowX: 'auto', position: 'sticky', top: 0, zIndex: 200 },
  navTab: (active) => ({
    fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase',
    color: active ? C.amberLt : C.border,
    background: 'none', border: 'none',
    borderBottom: active ? `3px solid ${C.amberLt}` : '3px solid transparent',
    padding: '12px 16px', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
    marginBottom: -3, transition: 'color 0.15s',
  }),

  content: { maxWidth: 1200, margin: '0 auto', padding: '0 20px' },
  section: { padding: '24px 0' },
  sectionTitle: { fontFamily: "'Georgia', serif", fontSize: '1.3rem', fontWeight: 700, color: C.ink, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 },

  chartGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18, marginBottom: 22 },
  card: { background: C.parchment, border: `1px solid ${C.border}`, borderRadius: 2, padding: 16, boxShadow: `3px 3px 0 rgba(30,20,10,0.12)` },
  cardTitle: { fontFamily: 'monospace', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.inkFaint, marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${C.border}` },

  milestones: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 22 },
  milestone: { background: C.ink, border: `1px solid ${C.amber}`, borderRadius: 2, padding: '13px 15px', boxShadow: `3px 3px 0 rgba(30,20,10,0.15)` },
  milestoneIcon: { fontSize: '1.3rem', marginBottom: 5 },
  milestoneLabel: { fontFamily: 'monospace', fontSize: 8, letterSpacing: '0.18em', textTransform: 'uppercase', color: C.amber, marginBottom: 3 },
  milestoneValue: { fontFamily: "'Georgia', serif", fontSize: '0.95rem', fontWeight: 700, color: C.cream, lineHeight: 1.2 },
  milestoneSub: { fontStyle: 'italic', fontSize: '0.72rem', color: C.border, marginTop: 2 },

  otd: { background: C.ink, border: `2px solid ${C.amber}`, borderRadius: 2, padding: '14px 18px', marginBottom: 18, boxShadow: `4px 4px 0 rgba(30,20,10,0.15)` },
  otdLabel: { fontFamily: 'monospace', fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: C.amber, marginBottom: 9 },
  otdRow: { display: 'flex', alignItems: 'flex-start', gap: 11, marginBottom: 7, paddingBottom: 7, borderBottom: `1px solid rgba(196,169,106,0.2)` },
  otdYear: { fontFamily: "'Georgia', serif", fontSize: '1.2rem', fontWeight: 900, color: C.rust, width: 48, flexShrink: 0 },
  otdActs: { fontFamily: "'Georgia', serif", fontSize: '0.85rem', fontWeight: 700, color: C.cream, marginBottom: 1 },
  otdMeta: { fontFamily: 'monospace', fontSize: 8, letterSpacing: '0.08em', color: C.border, textTransform: 'uppercase' },

  controls: { display: 'flex', gap: 9, flexWrap: 'wrap', marginBottom: 14, alignItems: 'center' },
  searchInput: { flex: 1, minWidth: 160, fontFamily: "'Georgia', serif", fontSize: '0.86rem', color: C.ink, background: C.parchment, border: `1px solid ${C.border}`, borderRadius: 1, padding: '7px 10px', outline: 'none' },
  select: { fontFamily: 'monospace', fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.ink, background: C.parchment, border: `1px solid ${C.border}`, borderRadius: 1, padding: '7px 9px', outline: 'none', cursor: 'pointer' },
  toggleGroup: { display: 'flex', border: `1px solid ${C.border}` },
  toggleBtn: (active) => ({
    fontFamily: 'monospace', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase',
    background: active ? C.ink : C.parchment,
    color: active ? C.amberLt : C.inkFaint,
    border: 'none', padding: '7px 11px', cursor: 'pointer',
  }),
  resultCount: { fontFamily: 'monospace', fontSize: 9, letterSpacing: '0.12em', color: C.inkFaint, marginLeft: 'auto' },

  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' },
  thead: { background: C.ink, color: C.amberLt },
  th: { fontFamily: 'monospace', fontSize: 8, letterSpacing: '0.15em', textTransform: 'uppercase', padding: '9px 10px', textAlign: 'left', whiteSpace: 'nowrap', cursor: 'pointer', userSelect: 'none', color: C.amberLt, borderBottom: 'none' },
  tr: (even) => ({ background: even ? `rgba(237,227,200,0.35)` : 'transparent', borderBottom: `1px solid rgba(196,169,106,0.22)` }),
  td: { fontFamily: "'Georgia', serif", color: C.inkMid, padding: '8px 10px', verticalAlign: 'top' },
  tdDate: { fontFamily: 'monospace', fontSize: '0.7rem', color: C.inkFaint, whiteSpace: 'nowrap' },
  tdArtist: { fontWeight: 700, color: C.ink },

  badge: (fest) => ({
    display: 'inline-block', fontFamily: 'monospace', fontSize: 7, letterSpacing: '0.08em', textTransform: 'uppercase',
    background: fest ? C.rust : C.inkFaint, color: C.cream, padding: '2px 4px', borderRadius: 1,
  }),

  dayCard: { background: C.parchment, border: `1px solid ${C.border}`, borderRadius: 2, marginBottom: 8, boxShadow: `2px 2px 0 rgba(30,20,10,0.12)`, overflow: 'hidden' },
  dayHeader: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderBottom: `1px solid rgba(196,169,106,0.35)`, flexWrap: 'wrap' },
  dayDate: { fontFamily: "'Georgia', serif", fontSize: '0.95rem', fontWeight: 700, color: C.ink, minWidth: 120, flexShrink: 0 },
  dayLoc: { fontStyle: 'italic', fontSize: '0.76rem', color: C.inkFaint, flex: 1 },
  dayActs: { padding: '8px 14px 12px', display: 'flex', flexWrap: 'wrap', gap: 5 },
  actChip: (fest) => ({
    fontFamily: "'Georgia', serif", fontSize: '0.76rem', color: C.inkMid,
    background: fest ? 'rgba(139,58,26,0.08)' : 'rgba(30,20,10,0.06)',
    border: `1px solid ${fest ? 'rgba(139,58,26,0.3)' : 'rgba(196,169,106,0.5)'}`,
    borderRadius: 1, padding: '3px 7px',
  }),
  dayCount: { fontFamily: 'monospace', fontSize: 8, color: C.amber, background: 'rgba(200,132,26,0.1)', padding: '2px 5px', borderRadius: 1, flexShrink: 0 },

  festSection: { marginBottom: 28 },
  festSectionTitle: { fontFamily: "'Georgia', serif", fontSize: '1.1rem', fontWeight: 700, color: C.rust, marginBottom: 10, paddingBottom: 6, borderBottom: `2px solid ${C.border}` },
  festYrGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 10 },
  festYrCard: { background: C.parchment, border: `1px solid ${C.border}`, borderRadius: 2, padding: '12px 14px', boxShadow: `2px 2px 0 rgba(30,20,10,0.12)` },
  festYrTitle: { fontFamily: "'Georgia', serif", fontSize: '0.9rem', fontWeight: 700, color: C.ink, marginBottom: 6 },
  festDayLabel: { fontFamily: 'monospace', fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.inkFaint, marginBottom: 3 },
  festActsWrap: { display: 'flex', flexWrap: 'wrap', gap: 3, marginBottom: 6 },
  festAct: { fontFamily: "'Georgia', serif", fontSize: '0.7rem', color: C.inkMid, background: 'rgba(139,58,26,0.09)', border: `1px solid rgba(139,58,26,0.25)`, borderRadius: 1, padding: '1px 5px' },

  artistCard: { background: C.parchment, border: `1px solid ${C.border}`, borderRadius: 2, padding: '11px 14px', marginBottom: 5, boxShadow: `2px 2px 0 rgba(30,20,10,0.12)` },
  artistName: { fontFamily: "'Georgia', serif", fontSize: '1rem', fontWeight: 700, color: C.ink },
  artistMeta: { fontFamily: 'monospace', fontSize: 8, letterSpacing: '0.08em', color: C.inkFaint, marginTop: 3, display: 'flex', gap: 12, flexWrap: 'wrap', textTransform: 'uppercase' },
  artistShows: { marginTop: 7, display: 'flex', flexWrap: 'wrap', gap: 3 },
  artistChip: (fest) => ({
    fontFamily: "'Georgia', serif", fontSize: '0.68rem',
    background: fest ? 'rgba(139,58,26,0.09)' : 'rgba(30,20,10,0.06)',
    border: `1px solid ${fest ? C.rust : C.border}`,
    borderRadius: 1, padding: '2px 5px', color: C.inkMid,
  }),

  passportGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 },
  stamp: { background: C.parchment, border: `2px solid ${C.border}`, borderRadius: 3, padding: 13, textAlign: 'center', position: 'relative', boxShadow: `2px 2px 0 rgba(30,20,10,0.12)` },
  stampInner: { position: 'absolute', inset: 4, border: `1px dashed rgba(196,169,106,0.4)`, borderRadius: 2, pointerEvents: 'none' },
  stampName: { fontFamily: "'Georgia', serif", fontSize: '0.9rem', fontWeight: 700, color: C.ink, marginBottom: 5, lineHeight: 1.2, position: 'relative', zIndex: 1 },
  stampDays: { fontFamily: 'monospace', fontSize: '1.3rem', fontWeight: 700, color: C.rust, margin: '3px 0', position: 'relative', zIndex: 1 },
  stampLabel: { fontFamily: 'monospace', fontSize: 8, letterSpacing: '0.18em', textTransform: 'uppercase', color: C.inkFaint, position: 'relative', zIndex: 1 },
  stampYears: { display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center', marginTop: 7, position: 'relative', zIndex: 1 },
  stampYr: { fontFamily: 'monospace', fontSize: 7, background: C.rust, color: C.cream, padding: '2px 4px', borderRadius: 1 },

  pag: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 5, marginTop: 14, flexWrap: 'wrap' },
  pagBtn: (active) => ({
    fontFamily: 'monospace', fontSize: 9,
    background: active ? C.ink : C.parchment,
    color: active ? C.amberLt : C.inkFaint,
    border: `1px solid ${active ? C.ink : C.border}`,
    padding: '5px 8px', cursor: 'pointer', borderRadius: 1,
  }),
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const fmtDate = (d) => {
  if (!d) return '—';
  const dt = new Date(d + 'T12:00:00');
  return dt.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const fmtDateShort = (d) => {
  if (!d) return '—';
  return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getYear = (d) => d ? parseInt(d.slice(0, 4)) : null;

const SETLIST_START = '2015-10-09'; // Billy Idol at ACL

// ─── CHART COMPONENTS ─────────────────────────────────────────────────────────
const HBarChart = ({ data, max }) => (
  <div>
    {data.map(({ name, count }) => (
      <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
        <div style={{ fontFamily: "'Georgia',serif", fontSize: '0.72rem', color: C.inkMid, width: 110, flexShrink: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={name}>{name}</div>
        <div style={{ flex: 1, height: 11, background: 'rgba(196,169,106,0.2)', borderRadius: 1, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${(count / max) * 100}%`, background: `linear-gradient(to right, ${C.rust}, ${C.amber})`, borderRadius: 1 }} />
        </div>
        <div style={{ fontFamily: 'monospace', fontSize: 9, color: C.amber, width: 18, textAlign: 'right', flexShrink: 0 }}>{count}</div>
      </div>
    ))}
  </div>
);

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
const TABS = [
  ['dashboard', 'Dashboard'],
  ['byDay', 'By Day'],
  ['byFest', 'By Festival'],
  ['browse', 'Browse'],
  ['passport', 'Passport'],
];

const PER_PAGE = 40;

export default function App() {
  const [concerts, setConcerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [search, setSearch] = useState('');
  const [yearFilter, setYearFilter] = useState('all');
  const [festFilter, setFestFilter] = useState('all');
  const [browseView, setBrowseView] = useState('shows'); // shows | artists
  const [sortCol, setSortCol] = useState('date');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchConcerts();
  }, []);

  async function fetchConcerts() {
    try {
      const { data, error } = await supabase
        .from('concerts')
        .select('*')
        .order('date', { ascending: false });
      if (error) throw error;
      setConcerts(data || []);
    } catch (err) {
      console.error('Error fetching:', err.message);
    } finally {
      setLoading(false);
    }
  }

  // ── DERIVED DATA ────────────────────────────────────────────────────────────
  const years = useMemo(() => {
    const ys = [...new Set(concerts.map(c => getYear(c.date)).filter(Boolean))].sort();
    return ys;
  }, [concerts]);

  // Explode to individual sets (one row per band per show)
  const sets = useMemo(() => {
    const result = [];
    concerts.forEach(c => {
      (c.bands || []).forEach(band => {
        result.push({ ...c, artist: band });
      });
    });
    return result;
  }, [concerts]);

  // ── STATS ───────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const totalShows = concerts.length;
    const totalSets = sets.length;
    const artistCounts = {};
    const venues = new Set();

    sets.forEach(s => {
      artistCounts[s.artist] = (artistCounts[s.artist] || 0) + 1;
    });
    concerts.forEach(c => { if (c.venue) venues.add(c.venue); });

    const topArtist = Object.entries(artistCounts).sort((a, b) => b[1] - a[1])[0] || ['—', 0];
    const uniqueArtists = Object.keys(artistCounts).length;
    const festDays = concerts.filter(c => c.is_festival).length;

    return { totalShows, totalSets, uniqueArtists, venueCount: venues.size, topArtist, festDays };
  }, [concerts, sets]);

  // ── CHART DATA ──────────────────────────────────────────────────────────────
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
    concerts.filter(c => c.is_festival && c.festival_name).forEach(c => {
      m[c.festival_name] = (m[c.festival_name] || 0) + 1;
    });
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
    sets.forEach(s => {
      if (!m[s.artist]) m[s.artist] = { fest: 0, solo: 0 };
      if (s.is_festival) m[s.artist].fest++; else m[s.artist].solo++;
    });
    return m;
  }, [sets]);

  // ── MILESTONES ──────────────────────────────────────────────────────────────
  const milestones = useMemo(() => {
    const sorted = [...concerts].sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    const first = sorted[0];
    const bestYear = timelineData.reduce((best, d) => d.count > (best?.count || 0) ? d : best, null);
    const biggestDay = concerts.reduce((best, c) => (c.bands?.length || 0) > (best?.bands?.length || 0) ? c : best, null);
    const decades = { '90s': 0, '00s': 0, '10s': 0, '20s': 0 };
    sets.forEach(s => {
      const y = getYear(s.date);
      if (!y) return;
      if (y < 2000) decades['90s']++;
      else if (y < 2010) decades['00s']++;
      else if (y < 2020) decades['10s']++;
      else decades['20s']++;
    });
    const topDecade = Object.entries(decades).sort((a, b) => b[1] - a[1])[0];
    return [
      { icon: '🎸', label: 'First Ever Show', value: (first?.bands || []).join(', '), sub: fmtDate(first?.date) },
      { icon: '🔥', label: 'Biggest Year', value: `${bestYear?.fullYear} — ${bestYear?.count} sets`, sub: 'most sets in a single year' },
      { icon: '🏟️', label: 'Wildest Day', value: fmtDate(biggestDay?.date), sub: `${biggestDay?.bands?.length || 0} acts in one day` },
      { icon: '🗺️', label: 'States Visited', value: stateCounts.length, sub: stateCounts.slice(0, 5).map(([s]) => s).join(', ') },
      { icon: '🎪', label: 'Festival Days', value: stats.festDays, sub: `across ${festBreakdown.length} festivals` },
      { icon: '📅', label: `Best Decade`, value: topDecade?.[0], sub: `${topDecade?.[1]} sets` },
    ];
  }, [concerts, sets, timelineData, stateCounts, stats.festDays, festBreakdown]);

  // ── ON THIS DAY ─────────────────────────────────────────────────────────────
  const onThisDay = useMemo(() => {
    const today = new Date();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    const suffix = `-${m}-${d}`;
    return concerts
      .filter(c => c.date && c.date.endsWith(suffix))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [concerts]);

  // ── FESTIVAL PASSPORT ───────────────────────────────────────────────────────
  const passport = useMemo(() => {
    const m = {};
    concerts.filter(c => c.is_festival && c.festival_name).forEach(c => {
      const k = c.festival_name;
      if (!m[k]) m[k] = { name: k, days: 0, years: new Set() };
      m[k].days++;
      const y = getYear(c.date);
      if (y) m[k].years.add(y);
    });
    return Object.values(m)
      .map(f => ({ ...f, years: [...f.years].sort() }))
      .sort((a, b) => b.days - a.days);
  }, [concerts]);

  // ── FESTIVAL GROUPINGS ──────────────────────────────────────────────────────
  const festGroupings = useMemo(() => {
    const m = {};
    concerts.filter(c => c.is_festival && c.festival_name).forEach(c => {
      const name = c.festival_name;
      const yr = getYear(c.date) || 'Unknown';
      if (!m[name]) m[name] = { name, years: {} };
      if (!m[name].years[yr]) m[name].years[yr] = [];
      m[name].years[yr].push(c);
    });
    return Object.values(m).sort((a, b) => {
      const ac = Object.values(a.years).flat().length;
      const bc = Object.values(b.years).flat().length;
      return bc - ac;
    });
  }, [concerts]);

  // ── FILTERS ─────────────────────────────────────────────────────────────────
  const applyFilters = (list, isSet = false) => {
    let d = list;
    const dateField = isSet ? 'date' : 'date';
    if (yearFilter !== 'all') d = d.filter(r => getYear(r[dateField]) === +yearFilter);
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
          (r.festival_day || '').toLowerCase().includes(q) ||
          fmtDate(r.date).toLowerCase().includes(q);
      });
    }
    return d;
  };

  // ── BROWSE DATA ─────────────────────────────────────────────────────────────
  const filteredSets = useMemo(() => {
    const d = applyFilters(sets, true);
    return [...d].sort((a, b) => {
      let av = a[sortCol], bv = b[sortCol];
      if (sortCol === 'date') { av = a.date || ''; bv = b.date || ''; }
      else if (sortCol === 'artist') { av = (a.artist || '').toLowerCase(); bv = (b.artist || '').toLowerCase(); }
      else if (sortCol === 'venue') { av = (a.venue || '').toLowerCase(); bv = (b.venue || '').toLowerCase(); }
      else if (sortCol === 'city') { av = (a.city || '').toLowerCase(); bv = (b.city || '').toLowerCase(); }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [sets, yearFilter, festFilter, search, sortCol, sortDir]);

  const artistRows = useMemo(() => {
    if (browseView !== 'artists') return [];
    const filtered = applyFilters(sets, true);
    const m = {};
    filtered.forEach(s => {
      if (!m[s.artist]) m[s.artist] = { artist: s.artist, shows: [] };
      m[s.artist].shows.push(s);
    });
    return Object.values(m).sort((a, b) => b.shows.length - a.shows.length);
  }, [sets, yearFilter, festFilter, search, browseView]);

  const dayGroups = useMemo(() => applyFilters(concerts).sort((a, b) => (b.date || '').localeCompare(a.date || '')), [concerts, yearFilter, festFilter, search]);

  const paged = filteredSets.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(filteredSets.length / PER_PAGE);

  const handleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
    setPage(1);
  };

  if (loading) return (
    <div style={{ ...S.app, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontStyle: 'italic', color: C.inkFaint }}>
      Tuning the instruments...
    </div>
  );

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div style={S.app}>
      {/* HEADER */}
      <div style={S.header}>
        <h1 style={S.headerTitle}>🎸 Eric's <em style={{ color: C.amberLt }}>Concert</em> History</h1>
        <div style={S.headerSub}>Every show. Every set. Every memory.</div>
        <div style={S.headerRule} />
      </div>

      {/* STAT STRIP */}
      <div style={S.statStrip}>
        {[
          [stats.totalSets, 'Total Sets', 'individual performances'],
          [stats.uniqueArtists, 'Unique Artists', 'bands & performers'],
          [stats.totalShows, 'Show Days', `${stats.festDays} fest · ${stats.totalShows - stats.festDays} standalone`],
          [stats.venueCount, 'Venues', 'distinct stages'],
        ].map(([num, label, sub], i) => (
          <div key={i} style={{ ...S.statCell, borderRight: i < 3 ? `1px solid ${C.border}` : 'none' }}>
            <div style={S.statNum}>{typeof num === 'number' ? num.toLocaleString() : num}</div>
            <div style={S.statLabel}>{label}</div>
            <div style={S.statSub}>{sub}</div>
          </div>
        ))}
      </div>

      {/* NAV */}
      <nav style={S.nav}>
        {TABS.map(([id, label]) => (
          <button key={id} style={S.navTab(activeTab === id)} onClick={() => setActiveTab(id)}>{label}</button>
        ))}
      </nav>

      <div style={S.content}>

        {/* ── DASHBOARD ── */}
        {activeTab === 'dashboard' && (
          <div style={S.section}>
            {/* On This Day */}
            {onThisDay.length > 0 && (
              <div style={S.otd}>
                <div style={S.otdLabel}>📅 On This Day — {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</div>
                {onThisDay.map(ev => (
                  <div key={ev.id} style={{ ...S.otdRow, ...(onThisDay.indexOf(ev) === onThisDay.length - 1 ? { borderBottom: 'none', marginBottom: 0, paddingBottom: 0 } : {}) }}>
                    <div style={S.otdYear}>{getYear(ev.date)}</div>
                    <div>
                      <div style={S.otdActs}>{(ev.bands || []).join(', ')}</div>
                      <div style={S.otdMeta}>{[ev.venue, ev.city, ev.state].filter(Boolean).join(' · ')}{ev.is_festival ? ` · ${ev.festival_day}` : ''}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Milestones */}
            <div style={S.milestones}>
              {milestones.map((m, i) => (
                <div key={i} style={S.milestone}>
                  <div style={S.milestoneIcon}>{m.icon}</div>
                  <div style={S.milestoneLabel}>{m.label}</div>
                  <div style={S.milestoneValue}>{m.value}</div>
                  <div style={S.milestoneSub}>{m.sub}</div>
                </div>
              ))}
            </div>

            {/* Charts row 1 */}
            <div style={S.chartGrid}>
              <div style={S.card}>
                <div style={S.cardTitle}>Most Seen Artists</div>
                <HBarChart data={artistCounts.slice(0, 12)} max={artistCounts[0]?.count || 1} />
              </div>

              <div style={S.card}>
                <div style={S.cardTitle}>Sets Per Year</div>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={timelineData} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(196,169,106,0.3)" />
                    <XAxis dataKey="year" tick={{ fontSize: 9, fontFamily: 'monospace', fill: C.inkFaint }} />
                    <YAxis tick={{ fontSize: 9, fontFamily: 'monospace', fill: C.inkFaint }} />
                    <Tooltip contentStyle={{ fontFamily: 'monospace', fontSize: 11, background: C.ink, border: `1px solid ${C.amber}`, color: C.cream }} />
                    <Bar dataKey="count" radius={[1, 1, 0, 0]}>
                      {timelineData.map((_, i) => <Cell key={i} fill={i % 2 === 0 ? C.rust : C.amber} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>

                <div style={{ ...S.cardTitle, marginTop: 14 }}>Festival Days Breakdown</div>
                <HBarChart data={festBreakdown.slice(0, 8).map(([name, count]) => ({ name, count }))} max={festBreakdown[0]?.[1] || 1} />
              </div>

              <div style={S.card}>
                <div style={S.cardTitle}>Festival vs. Standalone — Top Artists</div>
                {artistCounts.slice(0, 12).map(({ name }) => {
                  const s = artistFestMap[name] || { fest: 0, solo: 0 };
                  const total = s.fest + s.solo;
                  const fp = total ? (s.fest / total) * 100 : 0;
                  return (
                    <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                      <div style={{ fontFamily: "'Georgia',serif", fontSize: '0.72rem', color: C.inkMid, width: 110, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={name}>{name}</div>
                      <div style={{ flex: 1, height: 11, background: 'rgba(196,169,106,0.2)', borderRadius: 1, position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', height: '100%', width: `${fp}%`, background: C.rust, borderRadius: '1px 0 0 1px' }} />
                        <div style={{ position: 'absolute', height: '100%', width: `${100 - fp}%`, left: `${fp}%`, background: C.amberLt }} />
                      </div>
                      <div style={{ fontFamily: 'monospace', fontSize: 8, width: 44 }}>
                        <span style={{ color: C.rust }}>{s.fest}F </span>
                        <span style={{ color: C.amber }}>{s.solo}S</span>
                      </div>
                    </div>
                  );
                })}
                <div style={{ marginTop: 8, display: 'flex', gap: 12 }}>
                  {[[C.rust, 'Festival'], [C.amberLt, 'Standalone']].map(([color, label]) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <div style={{ width: 8, height: 8, background: color, borderRadius: 1 }} />
                      <span style={{ fontFamily: 'monospace', fontSize: 8, color: C.inkFaint, textTransform: 'uppercase' }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Charts row 2 */}
            <div style={S.chartGrid}>
              <div style={S.card}>
                <div style={S.cardTitle}>Top Cities by Shows</div>
                <HBarChart data={cityCounts} max={cityCounts[0]?.count || 1} />
              </div>
              <div style={S.card}>
                <div style={S.cardTitle}>Top Venues by Shows</div>
                <HBarChart data={venueCounts} max={venueCounts[0]?.count || 1} />
              </div>
              <div style={S.card}>
                <div style={S.cardTitle}>States Visited</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 4 }}>
                  {stateCounts.map(([st, ct]) => (
                    <div key={st} style={{ background: C.ink, color: C.amberLt, fontFamily: 'monospace', fontSize: 9, padding: '4px 7px', borderRadius: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 34 }}>
                      <span style={{ fontSize: 10, fontWeight: 700 }}>{st}</span>
                      <span style={{ fontSize: 7, color: C.border, marginTop: 1 }}>{ct}</span>
                    </div>
                  ))}
                </div>
                <div style={{ ...S.cardTitle, marginTop: 14 }}>Decade Breakdown</div>
                {(() => {
                  const dec = { '90s': 0, '00s': 0, '10s': 0, '20s': 0 };
                  sets.forEach(s => {
                    const y = getYear(s.date);
                    if (!y) return;
                    if (y < 2000) dec['90s']++;
                    else if (y < 2010) dec['00s']++;
                    else if (y < 2020) dec['10s']++;
                    else dec['20s']++;
                  });
                  const mx = Math.max(...Object.values(dec));
                  return <HBarChart data={Object.entries(dec).map(([name, count]) => ({ name, count }))} max={mx} />;
                })()}
              </div>
            </div>
          </div>
        )}

        {/* ── BY DAY ── */}
        {activeTab === 'byDay' && (
          <div style={S.section}>
            <div style={S.controls}>
              <input style={S.searchInput} placeholder="Search artist, venue, city..." value={search} onChange={e => setSearch(e.target.value)} />
              <select style={S.select} value={yearFilter} onChange={e => setYearFilter(e.target.value)}>
                <option value="all">All Years</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <select style={S.select} value={festFilter} onChange={e => setFestFilter(e.target.value)}>
                <option value="all">All Shows</option>
                <option value="fest">Festival Only</option>
                <option value="solo">Standalone Only</option>
              </select>
              <div style={S.resultCount}>{dayGroups.length} days</div>
            </div>
            {dayGroups.map(ev => {
              const locStr = [ev.venue, ev.city, ev.state].filter(Boolean).join(', ');
              return (
                <div key={ev.id} style={S.dayCard}>
                  <div style={S.dayHeader}>
                    <div style={S.dayDate}>{fmtDate(ev.date)}</div>
                    <div style={S.dayLoc}>{locStr || <span style={{ color: C.inkFaint }}>No location</span>}</div>
                    <div style={{ display: 'flex', gap: 5, alignItems: 'center', flexShrink: 0 }}>
                      <span style={S.badge(ev.is_festival)}>{ev.is_festival ? (ev.festival_day || 'Festival') : 'Standalone'}</span>
                      <span style={S.dayCount}>{(ev.bands || []).length} {(ev.bands || []).length === 1 ? 'act' : 'acts'}</span>
                    </div>
                  </div>
                  <div style={S.dayActs}>
                    {(ev.bands || []).map((band, bi) => (
                      <div key={bi} style={S.actChip(ev.is_festival)}>{band}</div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── BY FESTIVAL ── */}
        {activeTab === 'byFest' && (
          <div style={S.section}>
            <div style={S.controls}>
              <input style={S.searchInput} placeholder="Search festival or artist..." value={search} onChange={e => setSearch(e.target.value)} />
              <div style={S.resultCount}>{festGroupings.length} festivals</div>
            </div>
            {festGroupings
              .filter(fg => !search || fg.name.toLowerCase().includes(search.toLowerCase()) || Object.values(fg.years).flat().some(ev => (ev.bands || []).some(b => b.toLowerCase().includes(search.toLowerCase()))))
              .map(fg => (
                <div key={fg.name} style={S.festSection}>
                  <div style={S.festSectionTitle}>{fg.name}</div>
                  <div style={S.festYrGrid}>
                    {Object.entries(fg.years).sort((a, b) => +a[0] - +b[0]).map(([yr, evs]) => (
                      <div key={yr} style={S.festYrCard}>
                        <div style={S.festYrTitle}>{fg.name} {yr}</div>
                        {evs.map(ev => (
                          <div key={ev.id} style={{ marginBottom: 6, paddingBottom: 6, borderBottom: `1px solid rgba(196,169,106,0.3)` }}>
                            <div style={S.festDayLabel}>{ev.festival_day || fmtDate(ev.date)}</div>
                            <div style={S.festActsWrap}>
                              {(ev.bands || []).map((b, i) => <span key={i} style={S.festAct}>{b}</span>)}
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
          <div style={S.section}>
            <div style={S.controls}>
              <input style={S.searchInput} placeholder="Search artist, venue, city, festival..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
              <select style={S.select} value={yearFilter} onChange={e => { setYearFilter(e.target.value); setPage(1); }}>
                <option value="all">All Years</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <select style={S.select} value={festFilter} onChange={e => { setFestFilter(e.target.value); setPage(1); }}>
                <option value="all">All Shows</option>
                <option value="fest">Festival Only</option>
                <option value="solo">Standalone Only</option>
              </select>
              <div style={S.toggleGroup}>
                <button style={S.toggleBtn(browseView === 'shows')} onClick={() => setBrowseView('shows')}>By Set</button>
                <button style={{ ...S.toggleBtn(browseView === 'artists'), borderLeft: `1px solid ${C.border}` }} onClick={() => setBrowseView('artists')}>By Artist</button>
              </div>
              <div style={S.resultCount}>{browseView === 'shows' ? `${filteredSets.length} sets` : `${artistRows.length} artists`}</div>
            </div>

            {browseView === 'shows' && (
              <>
                <div style={S.tableWrap}>
                  <table style={S.table}>
                    <thead>
                      <tr style={{ background: C.ink }}>
                        {[['date', 'Date'], ['artist', 'Artist'], ['venue', 'Venue'], ['city', 'City'], ['state', 'ST'], ['festival', 'Type'], ['festival_day', 'Festival']].map(([col, lbl]) => (
                          <th key={col} style={S.th} onClick={() => handleSort(col)}>
                            {lbl}{sortCol === col ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paged.map((s, i) => (
                        <tr key={`${s.id}-${s.artist}`} style={S.tr(i % 2 === 1)}>
                          <td style={{ ...S.td, ...S.tdDate }}>{fmtDate(s.date)}</td>
                          <td style={{ ...S.td, ...S.tdArtist }}>{s.artist}</td>
                          <td style={S.td}>{s.venue || <span style={{ color: C.inkFaint, fontStyle: 'italic' }}>—</span>}</td>
                          <td style={S.td}>{s.city || <span style={{ color: C.inkFaint }}>—</span>}</td>
                          <td style={S.td}>{s.state || <span style={{ color: C.inkFaint }}>—</span>}</td>
                          <td style={S.td}><span style={S.badge(s.is_festival)}>{s.is_festival ? 'Fest' : 'Solo'}</span></td>
                          <td style={{ ...S.td, fontStyle: 'italic', fontSize: '0.72rem', color: C.amber }}>{s.festival_day || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {totalPages > 1 && (
                  <div style={S.pag}>
                    <button style={S.pagBtn(false)} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Prev</button>
                    {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                      const p = page <= 4 ? i + 1 : page + i - 3;
                      if (p < 1 || p > totalPages) return null;
                      return <button key={p} style={S.pagBtn(p === page)} onClick={() => setPage(p)}>{p}</button>;
                    })}
                    <button style={S.pagBtn(false)} onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next →</button>
                    <span style={{ fontFamily: 'monospace', fontSize: 9, color: C.inkFaint }}>pg {page} / {totalPages}</span>
                  </div>
                )}
              </>
            )}

            {browseView === 'artists' && (
              <div>
                {artistRows.map(({ artist, shows }) => {
                  const fc = shows.filter(s => s.is_festival).length;
                  return (
                    <div key={artist} style={S.artistCard}>
                      <div style={S.artistName}>{artist}</div>
                      <div style={S.artistMeta}>
                        <span>Seen <strong style={{ color: C.amber }}>{shows.length}×</strong></span>
                        <span>Festival <strong style={{ color: C.amber }}>{fc}</strong></span>
                        <span>Standalone <strong style={{ color: C.amber }}>{shows.length - fc}</strong></span>
                        <span>First <strong style={{ color: C.amber }}>{fmtDate(shows[shows.length - 1]?.date)}</strong></span>
                        <span>Last <strong style={{ color: C.amber }}>{fmtDate(shows[0]?.date)}</strong></span>
                      </div>
                      <div style={S.artistShows}>
                        {shows.map((s, i) => (
                          <span key={i} style={S.artistChip(s.is_festival)}>
                            {fmtDate(s.date)}{s.city ? ` · ${s.city}` : ''}{s.is_festival && s.festival_day ? ` · ${s.festival_day}` : ''}
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
          <div style={S.section}>
            <div style={{ fontFamily: "'Georgia',serif", fontStyle: 'italic', color: C.inkFaint, marginBottom: 18, fontSize: '0.88rem', lineHeight: 1.7 }}>
              {passport.length} festivals · {stats.festDays} total days
            </div>
            <div style={S.passportGrid}>
              {passport.map(f => (
                <div key={f.name} style={S.stamp}>
                  <div style={S.stampInner} />
                  <div style={S.stampName}>{f.name}</div>
                  <div style={S.stampDays}>{f.days}</div>
                  <div style={S.stampLabel}>{f.days === 1 ? 'day' : 'days'} attended</div>
                  <div style={S.stampYears}>
                    {f.years.map(y => <span key={y} style={S.stampYr}>{y}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}