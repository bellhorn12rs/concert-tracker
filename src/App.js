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
            {show.artist || (show.bands && show.bands[0])}
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
const HALL_OF_FAME_MIN = 5;
const PER_PAGE = 40;

// ─── GENRE CONFIG ─────────────────────────────────────────────────────────────
const GENRES = [
  'Indie Rock', 
  'Alternative', 
  'Experimental', 
  'Electronic', 
  'Indietronica',
  'EDM',
  'Jam', 
  'Folk', 
  'Americana & Folk',
  'Indie Pop',
  'Pop', 
  'Chamber Pop',
  'Post-Punk & Garage', 
  'Pop-Punk & Emo', 
  'Punk',
  'Classic Rock', 
  'Hard Rock / Metal',
  'Psychedelic', 
  'Hip Hop / R&B', 
  'Soul & Funk', 
  'Country', 
  'Specialty',
  'Other'
];
const GENRE_COLORS = {
  'Indie Rock':'#00f2ff','Alternative':'#9d00ff','Experimental':'#ff00ff',
  'Electronic':'#ff0077','Jam':'#ffcc00','Folk':'#ffaa00','Classic Rock':'#ff4400',
  'Pop':'#00e5ff','Hip Hop':'#a2ff00','Punk':'#ff3300','R&B':'#ff66cc',
  'Country':'#cc8800','Metal':'#888888','Other':'#334455',
};


function getConcertGenreInfo(concert, genreMap) {
  const bands = Array.isArray(concert.bands) ? concert.bands : [];
  
  // Get genre for each individual band from artist_genres (the source of truth)
  // Fall back to the embedded band genre, then nothing
  const genres = [...new Set(
    bands.map(b => {
      const name = getBandName(b);
      return genreMap[name] || b?.genre || null;
    }).filter(Boolean)
  )];

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

// ─── ONBOARDING FLOW (NEW USER WELCOME) ──────────────────────────────────────
// Replace the "MUSEUM VACANT" empty state with this component

function OnboardingFlow({ onComplete, onSkip }) {
  const [step, setStep] = useState('welcome');
  const [firstShow, setFirstShow] = useState({
    band: '',
    date: '',
    venue: '',
    city: '',
    state: ''
  });
  const [uploadedArtifact, setUploadedArtifact] = useState(null);
  const [uploading, setUploading] = useState(false);

  const isMobile = window.innerWidth < 768;

  // Upload helper
  async function uploadFirstArtifact(file, type) {
    if (!file) return null;
    setUploading(true);
    
    const bucketMap = { 
      'stub': 'Ticket Stubs', 
      'relic': 'setlists', 
      'photo': 'polaroids', 
      'poster': 'Posters'
    };
    
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
      return data.publicUrl;
    } catch (error) {
      console.error("Upload error:", error);
      setUploading(false);
      alert("Upload failed: " + error.message);
      return null;
    }
  }

  // Save first show + artifact
  const saveFirstShow = async () => {
    if (!firstShow.band || !firstShow.date) {
      alert("Band and date required");
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        alert("Session expired");
        return;
      }

      // Create show
      const { data: newShow, error: showError } = await supabase
        .from('shows')
        .insert([{
          date: firstShow.date,
          artist: firstShow.band,
          bands: [{ name: firstShow.band, genre: 'Indie Rock' }],
          venue: firstShow.venue || 'Unknown Venue',
          city: firstShow.city || '',
          state: firstShow.state || '',
          is_festival: false,
          genre: 'Indie Rock',
          created_by: session.user.id
        }])
        .select()
        .single();

      if (showError) throw showError;

      // Create attendance
      await supabase.from('attendances').insert([{
        user_id: session.user.id,
        show_id: newShow.id,
        is_public: true
      }]);

      // If artifact was uploaded, save it
      if (uploadedArtifact) {
        const artifactType = uploadedArtifact.type;
        await supabase.from('artifacts').insert([{
          user_id: session.user.id,
          show_id: newShow.id,
          artifact_type: artifactType,
          image_url: uploadedArtifact.url,
          band_name: artifactType === 'relic' || artifactType === 'photo' ? firstShow.band : null,
          is_public: true
        }]);
      }

      setStep('complete');
      
      // Refresh after celebration
      setTimeout(() => {
        onComplete();
      }, 2000);

    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save: " + err.message);
    }
  };

  const btnStyle = (color, isSecondary = false) => ({
    background: isSecondary ? 'transparent' : color,
    border: `2px solid ${color}`,
    color: isSecondary ? color : '#000',
    padding: isMobile ? '16px 32px' : '20px 40px',
    borderRadius: 8,
    fontFamily: "'Bebas Neue'",
    fontSize: isMobile ? '1.3rem' : '1.6rem',
    letterSpacing: 3,
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontWeight: 900
  });

  const inputStyle = {
    width: '100%',
    background: '#000',
    border: `1px solid ${C.teal}44`,
    color: '#fff',
    padding: '14px',
    borderRadius: 8,
    fontFamily: "'Space Mono'",
    fontSize: '13px',
    outline: 'none',
    marginBottom: '12px'
  };

  return (
    <div style={{ 
      minHeight: '80vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: isMobile ? 20 : 40
    }}>
      
      {/* STEP 1: Welcome */}
      {step === 'welcome' && (
        <div className="fade-in" style={{ 
          textAlign: 'center', 
          maxWidth: 600,
          background: hexToRgba(C.teal, 0.05),
          border: `2px solid ${C.teal}44`,
          borderRadius: 16,
          padding: isMobile ? 40 : 60
        }}>
          <div style={{ fontSize: '4rem', marginBottom: 20 }}>🎸</div>
          <div style={{ 
            fontFamily: "'Bebas Neue'", 
            fontSize: isMobile ? '2.5rem' : '3.5rem', 
            color: '#fff', 
            letterSpacing: 2,
            marginBottom: 16
          }}>
            WELCOME TO TRACKRECORD
          </div>
          <div style={{ 
            fontFamily: "'Space Mono'", 
            fontSize: 11, 
            color: C.gray, 
            lineHeight: 1.8,
            marginBottom: 40
          }}>
            Build your concert archive. Track shows,<br/>
            upload artifacts, preserve your history.
          </div>
          <div style={{ 
            fontFamily: "'Space Mono'", 
            fontSize: 10, 
            color: C.teal, 
            marginBottom: 20,
            letterSpacing: 2
          }}>
            Want help getting started?
          </div>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => setStep('path-choice')} style={btnStyle(C.teal)}>
              YES, GUIDE ME
            </button>
            <button onClick={onSkip} style={btnStyle(C.gray, true)}>
              NO, I'LL EXPLORE
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Path Choice */}
      {step === 'path-choice' && (
        <div className="fade-in" style={{ 
          textAlign: 'center', 
          maxWidth: 600,
          background: hexToRgba(C.purple, 0.05),
          border: `2px solid ${C.purple}44`,
          borderRadius: 16,
          padding: isMobile ? 40 : 60
        }}>
          <div style={{ 
            fontFamily: "'Bebas Neue'", 
            fontSize: isMobile ? '2rem' : '2.5rem', 
            color: '#fff', 
            letterSpacing: 2,
            marginBottom: 24
          }}>
            DO YOU ALREADY HAVE A LIST OF SHOWS?
          </div>
          <div style={{ 
            fontFamily: "'Space Mono'", 
            fontSize: 10, 
            color: C.gray, 
            lineHeight: 1.8,
            marginBottom: 40
          }}>
            If you have a spreadsheet, notes app, or CSV file<br/>
            with your concert history, we can bulk import it.
          </div>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => {
              // Navigate to bulk import in Office
              onComplete();
              setTimeout(() => {
                // Trigger office tab open
                const officeBtn = document.querySelector('[data-tab="manage"]');
                if (officeBtn) officeBtn.click();
              }, 100);
            }} style={btnStyle(C.gold)}>
              YES, BULK IMPORT
            </button>
            <button onClick={() => setStep('first-show')} style={btnStyle(C.teal, true)}>
              NO, START FRESH
            </button>
          </div>
          <button 
            onClick={() => setStep('welcome')} 
            style={{ 
              background: 'none', 
              border: 'none', 
              color: C.grayDim, 
              marginTop: 20, 
              cursor: 'pointer', 
              fontFamily: "'Space Mono'", 
              fontSize: 9 
            }}
          >
            ← BACK
          </button>
        </div>
      )}

      {/* STEP 3: First Show */}
      {step === 'first-show' && (
        <div className="fade-in" style={{ 
          maxWidth: 500,
          background: hexToRgba(C.teal, 0.05),
          border: `2px solid ${C.teal}44`,
          borderRadius: 16,
          padding: isMobile ? 30 : 50
        }}>
          <div style={{ 
            fontFamily: "'Bebas Neue'", 
            fontSize: isMobile ? '2rem' : '2.5rem', 
            color: C.teal, 
            letterSpacing: 2,
            marginBottom: 12,
            textAlign: 'center'
          }}>
            LOG YOUR FIRST SHOW
          </div>
          <div style={{ 
            fontFamily: "'Space Mono'", 
            fontSize: 9, 
            color: C.gray, 
            marginBottom: 30,
            textAlign: 'center',
            lineHeight: 1.6
          }}>
            Start with any show you've been to.<br/>
            Recent, old, doesn't matter.
          </div>

          <label style={{ 
            fontFamily: "'Space Mono'", 
            fontSize: 8, 
            color: C.teal, 
            letterSpacing: 2, 
            display: 'block', 
            marginBottom: 6 
          }}>
            BAND / ARTIST
          </label>
          <input 
            style={inputStyle}
            value={firstShow.band}
            onChange={e => setFirstShow(prev => ({ ...prev, band: e.target.value }))}
            placeholder="e.g. Radiohead"
            autoFocus
          />

          <label style={{ 
            fontFamily: "'Space Mono'", 
            fontSize: 8, 
            color: C.teal, 
            letterSpacing: 2, 
            display: 'block', 
            marginBottom: 6 
          }}>
            DATE
          </label>
          <input 
            type="date"
            style={{ ...inputStyle, colorScheme: 'dark' }}
            value={firstShow.date}
            onChange={e => setFirstShow(prev => ({ ...prev, date: e.target.value }))}
          />

          <label style={{ 
            fontFamily: "'Space Mono'", 
            fontSize: 8, 
            color: C.teal, 
            letterSpacing: 2, 
            display: 'block', 
            marginBottom: 6 
          }}>
            VENUE
          </label>
          <input 
            style={inputStyle}
            value={firstShow.venue}
            onChange={e => setFirstShow(prev => ({ ...prev, venue: e.target.value }))}
            placeholder="e.g. Madison Square Garden"
          />

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
            <div>
              <label style={{ 
                fontFamily: "'Space Mono'", 
                fontSize: 8, 
                color: C.teal, 
                letterSpacing: 2, 
                display: 'block', 
                marginBottom: 6 
              }}>
                CITY (OPTIONAL)
              </label>
              <input 
                style={inputStyle}
                value={firstShow.city}
                onChange={e => setFirstShow(prev => ({ ...prev, city: e.target.value }))}
                placeholder="New York"
              />
            </div>
            <div>
              <label style={{ 
                fontFamily: "'Space Mono'", 
                fontSize: 8, 
                color: C.teal, 
                letterSpacing: 2, 
                display: 'block', 
                marginBottom: 6 
              }}>
                STATE
              </label>
              <input 
                style={{ ...inputStyle, textTransform: 'uppercase' }}
                value={firstShow.state}
                onChange={e => setFirstShow(prev => ({ ...prev, state: e.target.value.toUpperCase() }))}
                placeholder="NY"
                maxLength={2}
              />
            </div>
          </div>

          <button 
            onClick={() => setStep('first-artifact')}
            disabled={!firstShow.band || !firstShow.date}
            style={{
              ...btnStyle(C.teal),
              width: '100%',
              marginTop: 20,
              opacity: (!firstShow.band || !firstShow.date) ? 0.5 : 1,
              cursor: (!firstShow.band || !firstShow.date) ? 'not-allowed' : 'pointer'
            }}
          >
            LOCK FIRST SIGNAL →
          </button>
        </div>
      )}

      {/* STEP 4: First Artifact */}
      {step === 'first-artifact' && (
        <div className="fade-in" style={{ 
          maxWidth: 550,
          background: hexToRgba(C.gold, 0.05),
          border: `2px solid ${C.gold}44`,
          borderRadius: 16,
          padding: isMobile ? 30 : 50,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: 20 }}>🎉</div>
          <div style={{ 
            fontFamily: "'Bebas Neue'", 
            fontSize: isMobile ? '2rem' : '2.8rem', 
            color: C.gold, 
            letterSpacing: 2,
            marginBottom: 8
          }}>
            FIRST SIGNAL LOCKED
          </div>
          <div style={{ 
            fontFamily: "'Space Mono'", 
            fontSize: 10, 
            color: '#fff', 
            marginBottom: 40
          }}>
            {firstShow.band} • {fmtDateShort(firstShow.date)}
          </div>

          <div style={{ 
            fontFamily: "'Bebas Neue'", 
            fontSize: isMobile ? '1.5rem' : '1.8rem', 
            color: '#fff', 
            letterSpacing: 2,
            marginBottom: 12
          }}>
            NOW LET'S ADD YOUR FIRST ARTIFACT
          </div>
          <div style={{ 
            fontFamily: "'Space Mono'", 
            fontSize: 9, 
            color: C.gray, 
            lineHeight: 1.8,
            marginBottom: 30
          }}>
            Upload a setlist, ticket stub, poster, or photo<br/>
            from any show in your history.
          </div>

          {uploadedArtifact ? (
            <div style={{ 
              marginBottom: 30,
              padding: 20,
              background: hexToRgba(C.green, 0.1),
              border: `1px solid ${C.green}`,
              borderRadius: 8
            }}>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>✅</div>
              <div style={{ 
                fontFamily: "'Space Mono'", 
                fontSize: 10, 
                color: C.green,
                letterSpacing: 2
              }}>
                ARTIFACT UPLOADED
              </div>
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', 
              gap: 12,
              marginBottom: 30
            }}>
              {[
                { type: 'stub', label: 'STUB', icon: '🎟️' },
                { type: 'relic', label: 'SETLIST', icon: '🏺' },
                { type: 'photo', label: 'PHOTO', icon: '📸' },
                { type: 'poster', label: 'POSTER', icon: '🎨' }
              ].map(item => (
                <label
                  key={item.type}
                  style={{
                    background: uploadedArtifact?.type === item.type ? hexToRgba(C.teal, 0.2) : '#0a0a0a',
                    border: `1px solid ${uploadedArtifact?.type === item.type ? C.teal : '#222'}`,
                    borderRadius: 8,
                    padding: '20px 10px',
                    cursor: uploading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'center'
                  }}
                  onMouseEnter={e => {
                    if (!uploading) e.currentTarget.style.borderColor = C.teal;
                  }}
                  onMouseLeave={e => {
                    if (!uploadedArtifact || uploadedArtifact.type !== item.type) {
                      e.currentTarget.style.borderColor = '#222';
                    }
                  }}
                >
                  <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>
                    {uploadedArtifact?.type === item.type ? '✅' : item.icon}
                  </div>
                  <div style={{ 
                    fontFamily: "'Space Mono'", 
                    fontSize: 7, 
                    color: C.gray,
                    letterSpacing: 1
                  }}>
                    {item.label}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    disabled={uploading}
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const url = await uploadFirstArtifact(file, item.type);
                        if (url) {
                          setUploadedArtifact({ type: item.type, url });
                        }
                      }
                    }}
                  />
                </label>
              ))}
            </div>
          )}

          {uploading && (
            <div style={{ 
              fontFamily: "'Space Mono'", 
              fontSize: 9, 
              color: C.teal,
              marginBottom: 20,
              letterSpacing: 2
            }}>
              📡 UPLOADING...
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              onClick={saveFirstShow}
              disabled={uploading}
              style={btnStyle(C.gold)}
            >
              {uploadedArtifact ? 'INITIALIZE ARCHIVE' : 'SKIP ARTIFACT'}
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: Complete */}
      {step === 'complete' && (
        <div className="fade-in" style={{ 
          textAlign: 'center',
          maxWidth: 500
        }}>
          <div style={{ fontSize: '5rem', marginBottom: 20 }}>🏆</div>
          <div style={{ 
            fontFamily: "'Bebas Neue'", 
            fontSize: isMobile ? '3rem' : '4rem', 
            color: C.gold, 
            letterSpacing: 3,
            marginBottom: 16,
            textShadow: `0 0 40px ${hexToRgba(C.gold, 0.6)}`
          }}>
            ARCHIVE INITIALIZED
          </div>
          <div style={{ 
            fontFamily: "'Space Mono'", 
            fontSize: 11, 
            color: '#fff',
            marginBottom: 8
          }}>
            {firstShow.band}
          </div>
          <div style={{ 
            fontFamily: "'Space Mono'", 
            fontSize: 9, 
            color: C.gray
          }}>
            {fmtDateShort(firstShow.date)} • {firstShow.venue}
          </div>
          {uploadedArtifact && (
            <div style={{ 
              fontFamily: "'Space Mono'", 
              fontSize: 8, 
              color: C.gold,
              marginTop: 20,
              letterSpacing: 2
            }}>
              + 1 ARTIFACT PRESERVED
            </div>
          )}
        </div>
      )}

    </div>
  );
}


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
    // 🟢 THE FIX: Instead of a hardcoded map, use the global GENRE_COLORS
    // This ensures your lanyard color always matches your #1 genre on the dashboard
    return GENRE_COLORS[topGenre] || '#00e5cc';
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

@keyframes system-startup {
  0% { filter: brightness(0) blur(10px); background: #000; }
  50% { filter: brightness(2) blur(2px); background: ${C.teal}; }
  100% { filter: brightness(1) blur(0); background: transparent; }
}

.system-online-flash {
  animation: system-startup 1.2s cubic-bezier(0.23, 1, 0.32, 1) both;
}

   @keyframes orb-pulse {
  0% { transform: scale(1); box-shadow: 0 0 40px rgba(0, 229, 204, 0.4), inset 0 0 20px rgba(0, 229, 204, 0.2); }
  50% { transform: scale(1.05); box-shadow: 0 0 80px rgba(0, 229, 204, 0.6), inset 0 0 40px rgba(0, 229, 204, 0.4); }
  100% { transform: scale(1); box-shadow: 0 0 40px rgba(0, 229, 204, 0.4), inset 0 0 20px rgba(0, 229, 204, 0.2); }
}

@keyframes signal-drift {
  from { opacity: 0.2; transform: translateY(10px); }
  to { opacity: 0.8; transform: translateY(-10px); }
}

    @keyframes peel-and-stick {
      0% { transform: translateY(20px) scale(1.1) rotate(-5deg); opacity: 0; filter: blur(4px); }
      60% { transform: translateY(-2px) scale(1) rotate(2deg); opacity: 1; filter: blur(0); }
      100% { transform: translateY(0) scale(1) rotate(var(--r, 0deg)); opacity: 1; }
    }

    @keyframes gold-pedestal-float {
  0% { transform: translateY(0px) rotateX(10deg); opacity: 0.8; }
  50% { transform: translateY(-15px) rotateX(20deg); opacity: 1; }
  100% { transform: translateY(0px) rotateX(10deg); opacity: 0.8; }
}

@keyframes artifact-float {
  0%, 100% { transform: translateY(0px) scale(1); filter: brightness(1); }
  50% { transform: translateY(-20px) scale(1.05); filter: brightness(1.2); }
}

@keyframes gold-glimmer {
  0% { stop-color: #ffcc00; }
  50% { stop-color: #fff700; }
  100% { stop-color: #ffcc00; }
}

.shrine-active {
  animation: artifact-float 4s ease-in-out infinite;
  transition: all 0.3s ease;
}

.shrine-active:hover {
  filter: drop-shadow(0 0 30px #ffcc00);
}

@keyframes hypnotic-breathing {
  0%, 100% { 
    box-shadow: 0 0 50px rgba(255, 204, 0, 0.5), inset 0 0 20px rgba(255, 204, 0, 0.3); 
    filter: brightness(1); 
  }
  50% { 
    box-shadow: 0 0 100px rgba(255, 204, 0, 0.8), inset 0 0 40px rgba(255, 204, 0, 0.6); 
    filter: brightness(1.2); 
  }
}

@keyframes geode-pulse {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.02); }
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
// ─── UPGRADED SONIC DNA WEB (THE "GEODE" EDITION) ──────────────────────────
const SetlistDNA = ({ genreScores }) => {
  // 1. Filter for valid scores and pick the Top 8 to keep the shape clean
  const sortedEntries = Object.entries(genreScores)
    .filter(([_, score]) => score > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8); 

  if (sortedEntries.length < 3) return <div style={{color: '#555', fontSize: 10}}>AWAITING MORE DATA...</div>;

  // 2. Map labels to shorter versions so they don't overlap
  const labels = sortedEntries.map(([name]) => 
    name.replace('Post-Punk & Garage', 'Post-Punk')
        .replace('Pop-Punk & Emo', 'Punk/Emo')
        .replace('Americana & Folk', 'Americana')
        .replace('Hard Rock / Metal', 'Hard Rock')
        .replace('Hip Hop / R&B', 'Hip Hop')
        .toUpperCase()
  );
  
  const values = sortedEntries.map(([, score]) => score);
  const topGenre = sortedEntries[0][0];
  const mainColor = GENRE_COLORS[topGenre] || '#00f2ff';

  const size = 260; // Slightly larger for better readability
  const center = size / 2;
  const radius = size * 0.32;
  const numPoints = labels.length;

  const getPoint = (index, value, rOffset = 0) => {
    const angle = (Math.PI * 2 * index) / numPoints - Math.PI / 2;
    const r = (radius * value) / 100 + rOffset;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    };
  };

  const webLevels = [25, 50, 75, 100];
  const dataPoints = values.map((v, i) => {
    const p = getPoint(i, v);
    return `${p.x},${p.y}`;
  }).join(' ');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <radialGradient id="dnaGradient">
            <stop offset="0%" stopColor={mainColor} stopOpacity="0.6" />
            <stop offset="100%" stopColor={mainColor} stopOpacity="0.1" />
          </radialGradient>
        </defs>

        {/* Background Grid Rings */}
        {webLevels.map(level => (
          <polygon
            key={level}
            points={labels.map((_, i) => {
              const p = getPoint(i, level);
              return `${p.x},${p.y}`;
            }).join(' ')}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1"
          />
        ))}

        {/* The Pulsing Data Shape */}
        <polygon 
          points={dataPoints} 
          fill="url(#dnaGradient)" 
          stroke={mainColor} 
          strokeWidth="3" 
          strokeLinejoin="round"
          style={{ filter: `drop-shadow(0 0 12px ${mainColor}66)`, transition: 'all 0.8s ease' }}
        />

        {/* Axis Labels */}
        {labels.map((label, i) => {
          const p = getPoint(i, 100, 20); // Push labels 20px outside the 100% ring
          const isTop = i === 0;
          return (
            <text
              key={i} x={p.x} y={p.y}
              fill={isTop ? mainColor : "#666"}
              fontSize={isTop ? "10" : "8"}
              fontFamily="'Space Mono'"
              textAnchor="middle"
              alignmentBaseline="middle"
              style={{ fontWeight: isTop ? 900 : 400, letterSpacing: '1px' }}
            >
              {label}
            </text>
          );
        })}
      </svg>
      <div style={{ fontFamily: "'Space Mono'", fontSize: 9, color: mainColor, marginTop: -10, letterSpacing: 2, opacity: 0.8 }}>
        PRIMARY: {topGenre.toUpperCase()}
      </div>
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
// Theater Marquee (RECONFIGURED WITH FULL-WIDTH CALL TO ACTION)
function TheaterMarquee({ upcoming, onAdd, onEdit }) {
  const BULB_COUNT = 28;
  const isEmpty = upcoming.length === 0;

  const text = !isEmpty
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

      {/* 🎫 FULL-WIDTH GIG BILLBOARD (The Catchy Add Button) */}
      <button 
        onClick={onAdd} 
        style={{
          width: '100%',
          background: `linear-gradient(90deg, rgba(255,204,0,0.05) 0%, rgba(255,204,0,0.15) 50%, rgba(255,204,0,0.05) 100%)`,
          borderBottom: '1px solid #1a1a1a',
          borderTop: 'none',
          borderLeft: 'none',
          borderRight: 'none',
          padding: '20px 16px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          outline: 'none'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255,204,0,0.2)';
          e.currentTarget.firstChild.style.textShadow = '0 0 15px #ffcc00';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = `linear-gradient(90deg, rgba(255,204,0,0.05) 0%, rgba(255,204,0,0.15) 50%, rgba(255,204,0,0.05) 100%)`;
          e.currentTarget.firstChild.style.textShadow = 'none';
        }}
      >
        <div style={{ 
          fontFamily: "'Bebas Neue'", 
          fontSize: '1.6rem', 
          color: C.gold, 
          letterSpacing: '0.1em',
          transition: 'all 0.3s ease'
        }}>
          {isEmpty ? "YOUR FUTURE IS A BLANK STAGE" : "WHAT'S ON YOUR HORIZON?"}
        </div>
        
        <div style={{ 
          fontFamily: "'Space Mono'", 
          fontSize: '9px', 
          color: '#888', 
          textTransform: 'uppercase',
          letterSpacing: '0.2em'
        }}>
          {isEmpty ? "[ INITIALIZE YOUR UPCOMING TOUR + ]" : "[ ADD A FUTURE SIGNAL TO THE ARCHIVE + ]"}
        </div>
      </button>

      {/* Bottom bulb rail */}
      <div style={{ background:'#111', padding:'6px 12px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        {Array.from({ length: BULB_COUNT }).map((_, i) => (
          <div key={i} style={{ width:8, height:8, borderRadius:'50%', background:'#ffdd88', boxShadow:'0 0 6px #ffdd88, 0 0 12px #ffaa00', animation:`chasing-bulb 1.5s ease-in-out ${((BULB_COUNT - i) * 1.5/BULB_COUNT).toFixed(2)}s infinite` }} />
        ))}
      </div>

      {/* Show list */}
      <div style={{ padding:'0 16px 16px' }}>
        <div style={{ maxHeight:190, overflowY:'auto' }}>
          {upcoming.sort((a,b) => a.date.localeCompare(b.date)).map((show, i) => (
            <div key={show.id||i} style={{ display:'grid', gridTemplateColumns:'auto 1fr auto auto', alignItems:'center', gap:12, padding:'12px 0', borderBottom: i === upcoming.length -1 ? 'none' : '1px solid #1a1a1a' }}>
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
          {isEmpty && (
            <div style={{ color:'#333', fontFamily:"'Space Mono'", fontSize:9, textAlign:'center', padding:'30px 20px', letterSpacing:'0.1em' }}>
              NO FUTURE SIGNALS DETECTED
            </div>
          )}
        </div>
      </div>
    </div>
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
  // 🟢 Add Mobile Detection
  const isMobile = window.innerWidth < 768;

  const today = new Date(), mm = String(today.getMonth()+1).padStart(2,'0'), dd = String(today.getDate()).padStart(2,'0');
  const matches = concerts.filter(c => c.date?.endsWith(`-${mm}-${dd}`)).sort((a,b) => a.date.localeCompare(b.date));
  
  if (!matches.length) return null;
  const dateLabel = today.toLocaleDateString('en-US', { month:'long', day:'numeric' });

  return (
    <div style={{ 
      display:'flex', 
      flexDirection:'column', 
      alignItems:'center', 
      gap:8, 
      // 🟢 INCREASED MARGIN: 40px top margin on mobile to prevent header overlap
      margin: isMobile ? '40px 0 20px 0' : '16px 0' 
    }}>
      <div style={{ fontFamily:"'Space Mono',monospace", fontSize:8, letterSpacing:'0.3em', textTransform:'uppercase', color:C.tealDim }}>📅 On This Day — {dateLabel}</div>
      
      {matches.map(ev => {
        const bands = (ev.bands||[]).map(b => getBandName(b)).filter(Boolean).join(', ');
        const location = [ev.venue, ev.city, ev.state].filter(Boolean).join(', ');
        const year = getYear(ev.date);
        const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${bands} ${ev.venue||ev.city} ${year} live`)}`;
        
        return (
          <div key={ev.id} style={{ 
            display:'inline-flex', 
            // 🟢 STACK ON MOBILE: Switch to column if the text is too long for a single line
            flexDirection: isMobile ? 'column' : 'row',
            alignItems:'center', 
            gap: isMobile ? 8 : 14, 
            background:`linear-gradient(135deg,${C.bgCard},${hexToRgba(C.teal,0.07)})`, 
            border:`1px solid ${C.teal}44`, 
            borderRadius: isMobile ? 12 : 40, 
            padding: isMobile ? '15px' : '10px 18px 10px 14px', 
            boxShadow:`0 0 20px ${C.tealGlow}`, 
            animation:'pulse-teal 3s ease-in-out infinite',
            textAlign: 'center'
          }}>
            <div style={{ fontFamily:"'Bebas Neue'", fontSize:'1.6rem', color:C.teal, lineHeight:1, flexShrink:0 }}>{year}</div>
            
            {/* 🟢 HIDE DIVIDERS ON MOBILE: They look messy when stacked */}
            {!isMobile && <div style={{ width:1, height:28, background:C.border, flexShrink:0 }} />}
            
            <div style={{ 
              fontFamily:"'Bebas Neue'", 
              fontSize: isMobile ? '1.4rem' : '1.2rem', 
              letterSpacing:'0.06em', 
              color:C.white, 
              lineHeight:1, 
              flexShrink:0 
            }}>
              {bands}
            </div>
            
            {!isMobile && <div style={{ width:1, height:28, background:C.border, flexShrink:0 }} />}
            
            <div style={{ fontFamily:"'Space Mono',monospace", fontSize:8, color:C.gray, textTransform:'uppercase', letterSpacing:'0.08em', flexShrink:0 }}>
              {location}
            </div>

            <a href={ytUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
              style={{ 
                display:'inline-flex', 
                alignItems:'center', 
                gap:5, 
                background:'rgba(255,0,0,0.15)', 
                border:'1px solid rgba(255,0,0,0.35)', 
                borderRadius:20, 
                padding:'4px 10px', 
                textDecoration:'none', 
                fontFamily:"'Space Mono',monospace", 
                fontSize:7, 
                letterSpacing:'0.1em', 
                textTransform:'uppercase', 
                color:'#ff4444', 
                flexShrink:0, 
                transition:'all 0.15s',
                marginTop: isMobile ? 5 : 0 
              }}>
              ▶ Search
            </a>
          </div>
        );
      })}
    </div>
  );
}

const SpotlightScrap = ({ data, isTop, TAPE_COLORS }) => {
  if (!data) return null;
  const charCode = data.id?.charCodeAt(data.id.length - 1) || 0;
  const r = isTop ? (charCode % 4) - 3 : (charCode % 4) + 1;
  const tapeColor = TAPE_COLORS[charCode % TAPE_COLORS.length];
  
  const hasImg = data.url && data.url.trim() !== "";
  const isSideways = (data.rotation || 0) % 180 !== 0;
  const isTicket = data.label?.toUpperCase() === 'TICKET STUB' || data.type === 'TICKET';

  return (
    <div style={{
      flex: 'none',
      position: 'relative',
      zIndex: isTop ? 2 : 1,
      transform: `rotate(${r}deg)`,
      transition: 'transform 0.3s ease',
      animation: 'peel-and-stick 0.8s cubic-bezier(0.23, 1, 0.32, 1) forwards',
      '--r': `${r}deg`,
      /* 🟢 THE CRITICAL ADDITION: This stops the card from stretching vertically 
         to match its neighbor in a Flex row (the Paper Trail view) */
      alignSelf: 'flex-start',
      width: '100%'
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
        <div style={{
          background: '#fff', padding: '4px', boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
          /* 🟢 BACK TO BLOCK: Flex on this specific div was causing 
             vertical stretching issues in some browsers */
          display: 'block', 
          borderRadius: 2, border: '1px solid #ddd',
          width: '100%', boxSizing: 'border-box'
        }}>
          {/* HEADER */}
          <div style={{ padding: '8px 4px 6px', textAlign: 'center', background: '#111', marginBottom: 4 }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.4rem', color: '#fff', letterSpacing: '0.08em', lineHeight: 1 }}>
              {data.band.toUpperCase()}
            </div>
            <div style={{ fontFamily: "'Space Mono'", fontSize: 7, color: tapeColor, letterSpacing: 1, marginTop: 3, fontWeight: 900 }}>
              {data.label || 'ARTIFACT'}
            </div>
          </div>

          {/* 🟢 IMAGE BOX: Centers rotated images without pushing the footer down */}
          <div style={{ 
            background: '#000', 
            overflow: 'hidden', display: 'flex', 
            alignItems: 'center', justifyContent: 'center',
            width: '100%',
            /* 🟢 ONLY force ratio for tickets on the dashboard. 
               Setlists get 'auto' so the paper trims to the image height. */
            aspectRatio: isTicket ? '2.5 / 1' : 'auto',
            minHeight: hasImg ? 100 : 0
          }}>
            <img 
              src={data.url} 
              alt={data.band}
              style={{ 
                width: '100%', 
                height: 'auto', 
                display: 'block',
                objectFit: 'contain', 
                /* Rotation and Scaling logic from your working build */
                transform: `rotate(${data.rotation || 0}deg) scale(${isSideways ? 1.6 : 1})`,
                transition: 'transform 0.3s ease'
              }}
            />
          </div>

          {/* FOOTER */}
          <div style={{ padding: '8px 6px', borderTop: '1px solid #f0f0f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div style={{ overflow: 'hidden', paddingRight: 10 }}>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', color: '#000', fontWeight: 900, lineHeight: 1, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {data.venue?.toUpperCase() || 'UNKNOWN VENUE'}
                </div>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '8px', color: '#888', marginTop: 3 }}>
                  {fmtDateShort(data.date).toUpperCase()}
                </div>
              </div>
              <a
                href={`https://www.setlist.fm/search?query=${encodeURIComponent(`${data.band} ${data.date?.replace(/-/g, '/')}`)}`}
                target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                style={{ background: C.gold, color: '#000', fontSize: 7, fontFamily: "'Space Mono'", padding: '3px 7px', borderRadius: 2, textDecoration: 'none', fontWeight: 900, boxShadow: '0 2px 5px rgba(0,0,0,0.1)', flexShrink: 0 }}
              >
                ARCHIVE ↗
              </a>
            </div>
          </div>
        </div>
      ) : (
        <PaperFallback />
      )}
    </div>
  );
};
// ─── MAIN ARTIFACT SPOTLIGHT COMPONENT ────────────────────────────────────────
// ─── ARTIFACT SLOT MACHINE ──────────────────────────────────────────────────
function ArtifactSpotlight({ concerts, posters = [], onVault }) {
  const [leftItems, setLeftItems] = useState([]);
  const [rightItems, setRightItems] = useState([]);
  const [spinningL, setSpinningL] = useState(false);
  const [spinningR, setSpinningR] = useState(false);

  const TAPE_COLORS = ['#ffcc00', '#00e5cc', '#9966ff', '#ff4466', '#00cfff'];

  // 1. Process the pool once
  const pool = useMemo(() => {
    const artifacts = [];
    concerts.forEach(c => {
      const headliner = getBandName(c.bands?.[0]) || c.artist || 'UNKNOWN';
      // Tickets (Shorts)
      if (c.image_url) {
        artifacts.push({ id: `s-${c.id}`, url: c.image_url.split(',')[0], type: 'SHORT', band: headliner, date: c.date });
      }
      // Setlists (Talls)
      if (c.setlist_image_url) {
        artifacts.push({ id: `t-${c.id}`, url: c.setlist_image_url.split(',')[0], type: 'TALL', band: headliner, date: c.date });
      }
    });
    posters.forEach(p => {
      artifacts.push({ id: `p-${p.id}`, url: p.image_url, type: 'TALL', band: p.artist || 'POSTER', date: p.date });
    });
    return artifacts;
  }, [concerts, posters]);

  // 2. The logic to pick a "Slot" (Either 1 Tall or 2 Shorts)
  const getRandomPackage = useCallback(() => {
    if (!pool.length) return [];
    const talls = pool.filter(a => a.type === 'TALL');
    const shorts = pool.filter(a => a.type === 'SHORT');

    // 50/50 chance for Tall vs Shorts layout
    if (Math.random() > 0.5 && talls.length > 0) {
      return [talls[Math.floor(Math.random() * talls.length)]];
    } else if (shorts.length > 0) {
      const s1 = shorts[Math.floor(Math.random() * shorts.length)];
      const s2 = shorts[Math.floor(Math.random() * shorts.length)];
      return [s1, s2]; // Always try to fill both spots if shorts exist
    }
    return [pool[Math.floor(Math.random() * pool.length)]];
  }, [pool]);

  // 3. The Slot Machine Spin Logic
  const spin = () => {
    if (spinningL || spinningR || !pool.length) return;

    setSpinningL(true);
    setSpinningR(true);

    let iterL = 0;
    let iterR = 0;

    // Left Reel: Stops at 12 iterations
    const intervalL = setInterval(() => {
      setLeftItems(getRandomPackage());
      iterL++;
      if (iterL >= 12) {
        clearInterval(intervalL);
        setSpinningL(false);
      }
    }, 100);

    // Right Reel: Stops at 20 iterations (delays the finish)
    const intervalR = setInterval(() => {
      setRightItems(getRandomPackage());
      iterR++;
      if (iterR >= 20) {
        clearInterval(intervalR);
        setSpinningR(false);
      }
    }, 100);
  };

  // Initial Spin
  useEffect(() => { if (pool.length && !leftItems.length) spin(); }, [pool.length]);

  if (!pool.length) return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <div style={{ fontSize: '2rem', marginBottom: 10, opacity: 0.3 }}>📦</div>
      <div style={{ fontFamily: "'Space Mono'", fontSize: 9, color: C.grayDim }}>
        NO ARTIFACTS TO SPOTLIGHT
      </div>
    </div>
  );

  return (
    <div style={{ cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column' }} onClick={onVault}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
        <div style={{ fontFamily: "'Space Mono'", fontSize: 8, color: C.gold, letterSpacing: 3, opacity: 0.4 }}>
           ARTIFACT SPOTLIGHT
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); spin(); }} 
          disabled={spinningL || spinningR}
          style={{ 
            background: 'transparent', border: `1px solid ${C.gold}44`, color: C.gold, 
            fontSize: 7, padding: '2px 8px', borderRadius: 4, cursor: 'pointer', fontFamily: "'Space Mono'" 
          }}
        >
          {spinningL || spinningR ? "ROLLING..." : "RE-ROLL"}
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', gap: '12px', overflow: 'hidden' }}>
        {/* LEFT REEL */}
        <Reel items={leftItems} spinning={spinningL} TAPE_COLORS={TAPE_COLORS} />
        
        {/* RIGHT REEL */}
        <Reel items={rightItems} spinning={spinningR} TAPE_COLORS={TAPE_COLORS} />
      </div>
    </div>
  );
}

// ─── SUB-COMPONENTS ─────────────────────────────────────────────────────────

function Reel({ items, spinning, TAPE_COLORS }) {
  return (
    <div style={{ 
      flex: 1, 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '12px',
      opacity: spinning ? 0.7 : 1,
      filter: spinning ? 'blur(1px)' : 'none',
      transition: 'filter 0.2s ease'
    }}>
      {items.map((item, idx) => (
        <div key={`${item.id}-${idx}`} style={{ flex: items.length === 1 ? 1 : 0.5, minHeight: 0 }}>
          <SpotlightScrap 
            data={item} 
            isTop={idx === 0} 
            TAPE_COLORS={TAPE_COLORS} 
            spinning={spinning} 
          />
        </div>
      ))}
    </div>
  );
}
// ─── ARTIST INSIGHTS (REFINED EDITION) ────────────────────────────────────────
function ArtistInsights({ concerts }) {
  const [index, setIndex] = useState(0);
  
  const insights = useMemo(() => {
    if (!concerts.length) return [];
    
    // Year analysis
    const yrMap = {};
    concerts.forEach(c => { 
      const y = getYear(c.date); 
      if (y) yrMap[y] = (yrMap[y] || 0) + 1; 
    });
    const peakYear = Object.entries(yrMap).sort((a, b) => b[1] - a[1])[0];
    
    // City analysis
    const cityMap = {};
    concerts.forEach(c => { 
      if (c.city) cityMap[c.city] = (cityMap[c.city] || 0) + 1; 
    });
    const topCity = Object.entries(cityMap).sort((a, b) => b[1] - a[1])[0];
    
    // Venue analysis
    const venueMap = {};
    concerts.forEach(c => { 
      if (c.venue) venueMap[c.venue] = (venueMap[c.venue] || 0) + 1; 
    });
    const topVenue = Object.entries(venueMap).sort((a, b) => b[1] - a[1])[0];
    
    // Festival analysis
    const festDays = concerts.filter(c => c.is_festival).length;
    const festPct = Math.round((festDays / concerts.length) * 100);
    const uniqueFests = new Set(concerts.filter(c => c.is_festival && c.festival_name).map(c => c.festival_name));
    
    // Artist relationship analysis
    const allSets = [];
    concerts.forEach(c => (c.bands || []).forEach(b => { 
      const bandName = typeof b === 'string' ? b : b?.name;
      if (bandName) allSets.push({ ...c, artist: bandName }); 
    }));
    
    const artistDates = {};
    allSets.forEach(s => { 
      if (!artistDates[s.artist]) artistDates[s.artist] = []; 
      artistDates[s.artist].push(s.date); 
    });
    
    // Longest relationship
    let longestRel = { artist: '', span: 0, shows: 0 };
    Object.entries(artistDates).forEach(([artist, dates]) => {
      if (dates.length < 2) return;
      const sorted = dates.sort();
      const span = Math.round((new Date(sorted[sorted.length - 1]) - new Date(sorted[0])) / (1000 * 60 * 60 * 24 * 365));
      if (span > longestRel.span) longestRel = { artist, span, shows: dates.length };
    });
    
    // Consecutive years streak
    const years = Object.keys(yrMap).map(Number).sort();
    let maxStreak = 1, curStreak = 1;
    for (let i = 1; i < years.length; i++) {
      if (years[i] === years[i - 1] + 1) {
        curStreak++;
        maxStreak = Math.max(maxStreak, curStreak);
      } else {
        curStreak = 1;
      }
    }
    
    // Month analysis
    const monthMap = {};
    concerts.forEach(c => {
      const d = new Date(c.date + 'T12:00:00');
      const m = d.toLocaleString('default', { month: 'long' }).toUpperCase();
      monthMap[m] = (monthMap[m] || 0) + 1;
    });
    const peakMonth = Object.entries(monthMap).sort((a, b) => b[1] - a[1])[0] || ['NONE', 0];
    
    // Other stats
    const uniqueArtists = new Set(allSets.map(s => s.artist));
    const oneTimers = Object.values(artistDates).filter(d => d.length === 1).length;
    const weekend = concerts.filter(c => {
      const d = new Date(c.date + 'T12:00:00');
      return [5, 6, 0].includes(d.getDay()); // Fri, Sat, Sun
    }).length;
    const weekendPct = Math.round((weekend / concerts.length) * 100);
    const avgBands = (allSets.length / concerts.length).toFixed(1);
    const heavy = Object.entries(artistDates).filter(([, d]) => d.length >= 10).length;
    
    // State analysis
    const stateMap = {};
    concerts.forEach(c => { 
      if (c.state) stateMap[c.state] = (stateMap[c.state] || 0) + 1; 
    });
    const uniqueStates = Object.keys(stateMap).length;
    
    // Build insight array (NO DUPLICATES)
    return [
      { 
        label: 'TOTAL LEGACY', 
        val: concerts.length, 
        sub: `Unique show days logged since you started tracking.` 
      },
      { 
        label: 'PEAK YEAR', 
        val: peakYear?.[0], 
        sub: `Your busiest year on record with ${peakYear?.[1]} shows logged.` 
      },
      { 
        label: 'HOME TURF', 
        val: topCity?.[0]?.toUpperCase() || 'NOMAD', 
        sub: `${topCity?.[1] || 0} shows logged in your most-visited city.` 
      },
      { 
        label: 'FESTIVAL RATIO', 
        val: `${festPct}%`, 
        sub: `${festPct}% of your history happened in a field.` 
      },
      { 
        label: 'VENUE LOYALTY', 
        val: topVenue?.[0]?.substring(0, 20) || 'NONE', 
        sub: `You've returned to this stage ${topVenue?.[1] || 0} times.` 
      },
      { 
        label: 'LONGEST RELATIONSHIP', 
        val: longestRel.artist || 'N/A', 
        sub: longestRel.artist 
          ? `${longestRel.span}-year journey across ${longestRel.shows} shows.` 
          : 'No multi-year relationships yet.' 
      },
      { 
        label: 'CONSECUTIVE YEARS', 
        val: `${maxStreak} YRS`, 
        sub: `${maxStreak} years in a row without missing a show.` 
      },
      { 
        label: 'UNIQUE ARTISTS', 
        val: uniqueArtists.size, 
        sub: `${oneTimers} of them you've only seen once.` 
      },
      { 
        label: 'WEEKEND WARRIOR', 
        val: `${weekendPct}%`, 
        sub: `${weekendPct}% of shows fall on Friday, Saturday, or Sunday.` 
      },
      { 
        label: 'FESTIVAL PASSPORT', 
        val: `${uniqueFests.size} STAMPS`, 
        sub: `${uniqueFests.size} unique festivals across ${festDays} total days.` 
      },
      { 
        label: 'BANDS PER DAY', 
        val: avgBands, 
        sub: `Average ${avgBands} acts per show. You stick around.` 
      },
      { 
        label: 'HEAVY ROTATION', 
        val: `${heavy} ACTS`, 
        sub: `${heavy} artists you've seen 10+ times each.` 
      },
      { 
        label: 'PEAK MONTH', 
        val: peakMonth[0], 
        sub: `${peakMonth[1]} shows logged in ${peakMonth[0].toLowerCase()}.` 
      },
      { 
        label: 'STATE COUNT', 
        val: `${uniqueStates} STATES`, 
        sub: `You've seen live music in ${uniqueStates} different states.` 
      }
    ].filter(i => i.val && i.val !== 'undefined' && i.val !== 'NaN'); // Remove invalid entries
    
  }, [concerts]);

  useEffect(() => {
    if (!insights.length) return;
    const timer = setInterval(() => setIndex(p => (p + 1) % insights.length), 5500);
    return () => clearInterval(timer);
  }, [insights.length]);

  if (!insights.length) return null;
  
  const active = insights[index];

  return (
    <Card neon className="card-texture" style={{ 
      minHeight: 220, 
      display: 'flex', 
      flexDirection: 'column', 
      position: 'relative', 
      overflow: 'hidden' 
    }}>
      <div className="big-watermark">{active.label.split(' ')[0]}</div>
      <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ 
          background: C.teal, 
          color: C.bg, 
          fontFamily: "'Space Mono'", 
          fontSize: 9, 
          padding: '4px 10px', 
          width: 'fit-content', 
          fontWeight: 900, 
          marginBottom: 15, 
          borderRadius: '2px' 
        }}>
          ⚡ {active.label}
        </div>
        <div className="fade-in" key={index} style={{ flex: 1 }}>
          <div style={{ 
            fontFamily: "'Bebas Neue'", 
            fontSize: String(active.val).length > 12 ? '2.5rem' : '4rem', 
            color: C.white, 
            lineHeight: 0.9, 
            marginBottom: 10, 
            textShadow: `0 0 20px ${hexToRgba(C.teal, 0.3)}` 
          }}>
            {active.val}
          </div>
          <div style={{ 
            fontSize: '0.95rem', 
            color: C.white, 
            lineHeight: 1.4, 
            maxWidth: '90%', 
            fontFamily: "'Space Mono'", 
            borderLeft: `2px solid ${C.teal}33`, 
            paddingLeft: 12 
          }}>
            {active.sub}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4, marginTop: 20 }}>
          {insights.map((_, i) => (
            <div 
              key={i} 
              style={{ 
                flex: 1, 
                height: 3, 
                borderRadius: 2, 
                background: i === index ? C.teal : C.grayDim, 
                transition: '0.3s' 
              }} 
            />
          ))}
        </div>
      </div>
    </Card>
  );
}

function RandomShow({ concerts, posters = [], onAdd }) {
  const [show, setShow] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [imageRotation, setImageRotation] = useState(2);

  // Helper for transparency logic
  const hexToRgba = (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };
  
  // Detect image orientation and set rotation
  const handleImageLoad = (e) => {
    const img = e.target;
    const isWide = img.naturalWidth > img.naturalHeight;
    setImageRotation(isWide ? 2 : -2);
  };

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

  useEffect(() => { 
    if (concerts.length && !show) spin(); 
  }, [concerts.length]);

  // 🛰️ ARTIFACT SELECTION PROTOCOL
  const displayImg = useMemo(() => {
    if (!show) return null;

    // 1. Priority: Relational Master Poster (The ACL/Okeechobee Fix)
    if (show.is_festival && show.festival_name && posters.length > 0) {
      const festYear = new Date(show.date.replace(/-/g, '/')).getFullYear();
      const masterPoster = posters.find(p => 
        p.poster_type === 'festival_year' && 
        (
          p.festival_name?.toLowerCase().trim() === show.festival_name?.toLowerCase().trim() || 
          show.festival_name?.toLowerCase().includes(p.festival_name?.toLowerCase()) ||
          p.festival_name?.toLowerCase().includes(show.festival_name?.toLowerCase())
        ) &&
        getYear(p.date) === festYear
      );
      if (masterPoster) return masterPoster.image_url;
    }

    // 2. Choice: Personal Photo (Polaroid)
    if (show.personal_photo_url) return show.personal_photo_url.split(',')[0];

    // 3. Choice: Ticket Stub
    if (show.image_url) return show.image_url.split(',')[0];

    // 4. Choice: Relic/Setlist
    if (show.setlist_image_url) return show.setlist_image_url.split(',')[0];

    return null;
  }, [show, posters]);

  if (!show) return null;

  const bands = show.bands || [show.artist];
  const festLabel = show.festival_name || "FESTIVAL";
  const themeColor = show.is_festival ? C.gold : C.purple;

  return (
    <Card neon className="card-texture" style={{ 
      minHeight: 280, 
      position: 'relative', 
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      background: '#050508'
    }}>
      
      {/* 📸 IMAGE SLOT (REAL OR PLACEHOLDER) */}
      {!spinning && (
        <div style={{
          position: 'absolute',
          right: 20,
          top: '50%',
          transform: 'translateY(-50%)',
          width: '160px',
          height: '210px',
          zIndex: 5,
          animation: 'fade-in 0.5s ease'
        }}>
          {displayImg ? (
            <div style={{
              width: '100%',
              height: '100%',
              background: '#000',
              borderRadius: '4px',
              border: `1px solid ${hexToRgba(themeColor, 0.5)}`,
              boxShadow: `0 20px 50px rgba(0,0,0,0.8), 0 0 20px ${hexToRgba(themeColor, 0.2)}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              transform: `rotate(${imageRotation}deg)`,
              transition: 'transform 0.3s ease'
            }}>
              <img 
                src={displayImg} 
                alt="Artifact" 
                onLoad={handleImageLoad}
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'contain'
                }} 
              />
              <div style={{ position: 'absolute', top: 5, right: 5, background: 'rgba(0,0,0,0.7)', padding: '2px 6px', fontSize: 6, fontFamily: "'Space Mono'", color: themeColor }}>
                // SIGNAL_RECOVERED
              </div>
            </div>
          ) : (
            <div 
              onClick={onAdd}
              style={{
                width: '100%',
                height: '100%',
                background: '#0a0a0f',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: `1px dashed ${hexToRgba(themeColor, 0.3)}`,
                borderRadius: '4px',
                opacity: 0.6,
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = 1}
              onMouseLeave={e => e.currentTarget.style.opacity = 0.6}
            >
              <div style={{ opacity: 0.4 }}><TrackRecordLogo size={30} /></div>
              <div style={{ fontFamily: "'Space Mono'", fontSize: 7, color: themeColor, marginTop: 12, letterSpacing: 2, textAlign: 'center' }}>
                NO_VISUAL_SIGNAL<br/>[ CLICK TO ADD ]
              </div>
            </div>
          )}
        </div>
      )}

      {/* 🗓 BIG YEAR WATERMARK */}
      <div style={{ 
        position: 'absolute', 
        right: 10, 
        bottom: -20, 
        fontFamily: "'Bebas Neue'",
        fontSize: '12rem',
        zIndex: 1,
        color: themeColor,
        opacity: 0.07,
        pointerEvents: 'none',
        lineHeight: 1,
        userSelect: 'none'
      }}>
        {getYear(show.date)}
      </div>

      <div style={{ position: 'relative', zIndex: 10, height: '100%', display: 'flex', flexDirection: 'column', flex: 1, padding: '5px' }}>
        {/* Header Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
          <div style={{ fontFamily: "'Space Mono'", fontSize: 8, color: themeColor, letterSpacing: 3, fontWeight: 900 }}>
            {spinning ? ">> RECALLING_SIGNAL..." : "// RANDOM_RECALL"}
          </div>
          <button onClick={spin} disabled={spinning} style={{ background: spinning ? '#222' : themeColor, border: 'none', color: '#000', fontSize: 9, padding: '6px 16px', borderRadius: 4, cursor: 'pointer', fontFamily: "'Space Mono'", fontWeight: 900, boxShadow: spinning ? 'none' : `0 0 15px ${hexToRgba(themeColor, 0.4)}` }}>
            {spinning ? "..." : "RE-SPIN"}
          </button>
        </div>

        <div className={spinning ? "spinning-text" : "fade-in"} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* DATE & FESTIVAL */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 15 }}>
            <span style={{ background: C.white, color: '#000', fontFamily: "'Bebas Neue'", fontSize: '1.6rem', padding: '0 10px', borderRadius: 2 }}>
              {getYear(show.date)}
            </span>
            {show.is_festival && (
              <span style={{ 
                background: `${C.gold}22`, 
                color: C.gold, 
                border: `1px solid ${C.gold}`, 
                fontFamily: "'Space Mono'", 
                fontSize: '8px', 
                padding: '3px 10px', 
                borderRadius: '4px',
                fontWeight: 900,
                letterSpacing: '1px'
              }}>
                {festLabel.toUpperCase()}
              </span>
            )}
          </div>

          {/* ARTISTS */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 6, 
            marginBottom: 15, 
            maxWidth: '55%', 
            maxHeight: '120px',
            overflowY: 'auto',
            paddingRight: '10px',
            scrollbarWidth: 'none'
          }}>
            {bands.map((b, i) => (
              <div key={i} style={{ 
                fontFamily: "'Bebas Neue'", 
                fontSize: bands.length > 3 ? '1.4rem' : '2.2rem', 
                color: C.white, 
                lineHeight: 0.9, 
                letterSpacing: '0.05em',
                textShadow: '0 4px 10px rgba(0,0,0,0.5)',
                borderLeft: `3px solid ${themeColor}`,
                paddingLeft: '12px'
              }}>
                {getBandName(b).toUpperCase()}
              </div>
            ))}
          </div>

          {/* VENUE PIN */}
          <div style={{ marginTop: 'auto', paddingBottom: 5 }}>
            <div style={{ 
              fontFamily: "'Bebas Neue'", 
              fontSize: '1.8rem', 
              color: themeColor, 
              letterSpacing: '1px',
              lineHeight: 1 
            }}>
              📍 {show.venue?.toUpperCase() || 'UNKNOWN VENUE'}
            </div>
            <div style={{ fontFamily: "'Space Mono'", fontSize: 9, color: C.gray, textTransform: 'uppercase', marginTop: 4, letterSpacing: 1 }}>
              {show.city}, {show.state}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
// ─── SONIC DNA BAR CHART (ALL GENRES EDITION) ───────────────────────────
// ─── SONIC DNA BAR CHART (FLEXIBLE HEIGHT EDITION) ───────────────────────────
function SonicDNA({ stats, onGenreClick }) {
  if (!stats || !stats.length) return null;
  const activeStats = stats.filter(s => s.count > 0);
  const max = Math.max(...stats.map(s => s.count));

  // 🛰️ DATA THRESHOLD: We want at least 3 data points to make the DNA look "mapped"
  const isInitializing = activeStats.length < 3;

  return (
    <Card neon style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <CardTitle>SONIC DNA 🧬</CardTitle>

      {/* 🟢 OVERLAY: Awaiting Data Challenge */}
      {isInitializing && (
        <div style={{ 
          position: 'absolute', 
          inset: 0, 
          zIndex: 10, 
          background: 'rgba(5,5,8,0.85)', 
          backdropFilter: 'blur(4px)',
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{ 
            fontFamily: "'Space Mono'", 
            fontSize: 10, 
            color: C.gold, 
            letterSpacing: 2, 
            fontWeight: 900,
            animation: 'pulse 2s infinite'
          }}>
            [ MAPPING_IN_PROGRESS ]
          </div>
          <div style={{ 
            fontFamily: "'Space Mono'", 
            fontSize: 8, 
            color: C.grayDim, 
            marginTop: 10, 
            lineHeight: 1.5,
            maxWidth: '180px'
          }}>
            {3 - activeStats.length} MORE UNIQUE GENRE SIGNALS REQUIRED TO COMPLETE DNA SEQUENCING.
          </div>
        </div>
      )}

      {/* Main List Container */}
      <div className="hide-scroll" style={{ 
        flex: 1, 
        overflowY: 'auto', 
        paddingRight: 15, 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 10,
        opacity: isInitializing ? 0.3 : 1, // Ghost the bars while initializing
        filter: isInitializing ? 'grayscale(1)' : 'none'
      }}>
        <style>{`.hide-scroll::-webkit-scrollbar { display: none; }`}</style>
        
        {activeStats.map((s, i) => {
          const pct = Math.round((s.count / max) * 100);
          const color = GENRE_COLORS[s.name] || C.teal;
          return (
            <div key={s.name} 
                 onClick={() => !isInitializing && onGenreClick && onGenreClick(s.name)} 
                 style={{ cursor: isInitializing ? 'default' : 'pointer', transition: 'all 0.2s' }} 
                 onMouseEnter={e => { if(!isInitializing) { e.currentTarget.style.transform = 'translateX(5px)'; e.currentTarget.style.filter = 'brightness(1.3)'; } }} 
                 onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.filter = 'none'; }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontFamily: "'Space Mono'", fontSize: 9, fontWeight: 900 }}>
                <span style={{ color: '#fff', textShadow: isInitializing ? 'none' : `0 0 8px ${color}`, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name.toUpperCase()}</span>
                <span style={{ color: isInitializing ? C.grayDim : color }}>{s.count}</span>
              </div>
              <div style={{ width: '100%', background: 'rgba(255,255,255,0.05)', height: 8, borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ 
                  width: `${pct}%`, 
                  height: '100%', 
                  background: isInitializing ? C.grayDim : color, 
                  boxShadow: isInitializing ? 'none' : `0 0 10px ${color}`,
                  transition: 'width 1s ease-out' 
                }} />
              </div>
            </div>
          );
        })}

        {/* 🟢 GHOST SLOTS: Makes the chart look like it has "space to grow" */}
        {isInitializing && activeStats.length < 5 && Array.from({ length: 5 - activeStats.length }).map((_, i) => (
          <div key={`ghost-${i}`} style={{ opacity: 0.1 }}>
            <div style={{ width: '40%', height: 6, background: C.grayDim, marginBottom: 6, borderRadius: 2 }} />
            <div style={{ width: '100%', height: 8, background: C.grayDim, borderRadius: 4 }} />
          </div>
        ))}
      </div>
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
  if (!festBreakdown || festBreakdown.length === 0) return (
  <div style={{ padding: '40px 20px', textAlign: 'center', border: `1px dashed ${C.grayDim}33`, borderRadius: 8 }}>
    <div style={{ fontSize: '2rem', marginBottom: 10 }}>🎪</div>
    <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.2rem', color: C.white }}>FESTIVAL WING CLOSED</div>
    <div style={{ fontFamily: "'Space Mono'", fontSize: 8, color: C.grayDim, marginTop: 8 }}>
      ADD YOUR FIRST MULTI-DAY EVENT <br/> TO UNLOCK THE WRISTBAND COLLECTION
    </div>
    <button 
      onClick={() => setEditTarget('new')}
      style={{ marginTop: 15, background: 'none', border: `1px solid ${C.teal}`, color: C.teal, fontSize: 8, padding: '4px 10px', borderRadius: 4, fontFamily: "'Space Mono'", cursor: 'pointer' }}
    >
      + LOG FESTIVAL
    </button>
  </div>
);
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
// ─── EXHIBITION WALL ARTIFACT CLUSTER ────────────────────────────────────────────────
function ArtifactCluster({ artifacts, show, index, gc }) {
  const [lightboxSrc, setLightboxSrc] = useState(null);
  const isMobile = window.innerWidth < 768;
  
  return (
    <>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: isMobile ? '12px' : '16px',
        alignItems: 'center',
        marginBottom: isMobile ? '16px' : '20px',
        position: 'relative'
      }}>
        
        {/* Date label with pin effect */}
        <div style={{ 
          fontFamily: "'Space Mono'", 
          fontSize: isMobile ? 8 : 9,
          color: gc, 
          letterSpacing: 1,
          opacity: 0.7,
          marginBottom: '8px',
          background: hexToRgba(gc, 0.1),
          padding: '4px 10px',
          borderRadius: 6,
          border: `1px solid ${hexToRgba(gc, 0.3)}`,
          fontWeight: 700
        }}>
          {fmtDateShort(show.date).replace(', ', ' ')}
        </div>

        {/* Setlists - BIGGER, more overlapped */}
        {artifacts.setlists.length > 0 && (
          <div style={{ 
            display: 'flex', 
            marginLeft: `-${Math.min(artifacts.setlists.length * 12, 30)}px`,
            position: 'relative'
          }}>
            {artifacts.setlists.map((url, i) => (
              <div
                key={i}
                onClick={() => setLightboxSrc(url)}
                style={{
                  marginLeft: i === 0 ? 0 : isMobile ? '-25px' : '-35px',
                  transform: `rotate(${(i % 2 === 0 ? -2 : 2) * (i % 3)}deg)`,
                  cursor: 'zoom-in',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  zIndex: i,
                  filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.6))'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'rotate(0deg) scale(1.15) translateY(-4px)';
                  e.currentTarget.style.zIndex = 100;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = `rotate(${(i % 2 === 0 ? -2 : 2) * (i % 3)}deg)`;
                  e.currentTarget.style.zIndex = i;
                }}
              >
                {/* Tape on top */}
                <div style={{
                  position: 'absolute',
                  top: '-4px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: isMobile ? '35px' : '45px',
                  height: isMobile ? '12px' : '16px',
                  background: 'rgba(255,255,255,0.15)',
                  borderLeft: '1px solid rgba(255,255,255,0.3)',
                  borderRight: '1px solid rgba(255,255,255,0.3)',
                  opacity: 0.6,
                  zIndex: 10
                }} />

                <div style={{ 
                  background: '#fefefe', 
                  padding: isMobile ? '6px' : '8px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.7)',
                  width: isMobile ? '140px' : '180px',
                  border: '1px solid rgba(0,0,0,0.1)'
                }}>
                  <img 
                    src={url} 
                    alt="setlist" 
                    style={{ 
                      width: '100%', 
                      height: 'auto',
                      maxHeight: isMobile ? '200px' : '260px',
                      objectFit: 'contain',
                      display: 'block'
                    }} 
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Posters - BIGGER, festival poster style */}
        {artifacts.posters.length > 0 && (
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap',
            gap: isMobile ? '8px' : '12px',
            justifyContent: 'center',
            marginLeft: `-${Math.min(artifacts.posters.length * 8, 20)}px`
          }}>
            {artifacts.posters.map((url, i) => (
              <div
                key={i}
                onClick={() => setLightboxSrc(url)}
                style={{
                  marginLeft: i === 0 ? 0 : isMobile ? '-20px' : '-30px',
                  transform: `rotate(${(i % 2 === 0 ? 2 : -2) * (i % 3)}deg)`,
                  cursor: 'zoom-in',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  zIndex: i,
                  position: 'relative'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'rotate(0deg) scale(1.12) translateY(-6px)';
                  e.currentTarget.style.zIndex = 100;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = `rotate(${(i % 2 === 0 ? 2 : -2) * (i % 3)}deg)`;
                  e.currentTarget.style.zIndex = i;
                }}
              >
                {/* Push pin */}
                <div style={{
                  position: 'absolute',
                  top: isMobile ? '6px' : '8px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: isMobile ? '8px' : '10px',
                  height: isMobile ? '8px' : '10px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ff4444, #cc0000)',
                  boxShadow: `0 2px 8px rgba(255,0,0,0.5), inset 0 -2px 4px rgba(0,0,0,0.3)`,
                  zIndex: 10,
                  border: '1px solid rgba(0,0,0,0.2)'
                }} />

                <img 
                  src={url} 
                  alt="poster" 
                  style={{ 
                    width: isMobile ? '120px' : '160px',
                    height: 'auto',
                    maxHeight: isMobile ? '180px' : '240px',
                    objectFit: 'contain',
                    display: 'block',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.7)',
                    border: '2px solid rgba(0,0,0,0.1)'
                  }} 
                />
              </div>
            ))}
          </div>
        )}

        {/* Wristband - bigger */}
        {artifacts.wristband && (
          <div 
            onClick={() => setLightboxSrc(artifacts.wristband)}
            style={{ 
              cursor: 'zoom-in', 
              marginTop: '8px',
              transform: `rotate(${index % 2 === 0 ? -3 : 3}deg)`,
              transition: 'all 0.3s'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'rotate(0deg) scale(1.1)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = `rotate(${index % 2 === 0 ? -3 : 3}deg)`;
            }}
          >
            <img 
              src={artifacts.wristband} 
              alt="wristband" 
              style={{ 
                width: isMobile ? '150px' : '200px',
                height: 'auto',
                display: 'block',
                borderRadius: 4,
                border: `2px solid ${hexToRgba(gc, 0.4)}`,
                boxShadow: `0 8px 24px rgba(0,0,0,0.5), 0 0 20px ${hexToRgba(gc, 0.2)}`
              }} 
            />
          </div>
        )}

        {/* Photos - BIGGER polaroid style */}
        {artifacts.photos.length > 0 && (
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: artifacts.photos.length === 1 ? '1fr' : 'repeat(2, 1fr)',
            gap: isMobile ? '10px' : '14px',
            marginTop: '8px'
          }}>
            {artifacts.photos.slice(0, 4).map((url, i) => (
              <div
                key={i}
                onClick={() => setLightboxSrc(url)}
                style={{
                  cursor: 'zoom-in',
                  transform: `rotate(${(i % 2 === 0 ? -3 : 3) + (i % 3)}deg)`,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'rotate(0deg) scale(1.12) translateY(-4px)';
                  e.currentTarget.style.zIndex = 100;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = `rotate(${(i % 2 === 0 ? -3 : 3) + (i % 3)}deg)`;
                  e.currentTarget.style.zIndex = 1;
                }}
              >
                {/* Tape corner */}
                <div style={{
                  position: 'absolute',
                  top: '-3px',
                  right: isMobile ? '8px' : '12px',
                  width: isMobile ? '20px' : '25px',
                  height: isMobile ? '10px' : '12px',
                  background: 'rgba(255,255,255,0.2)',
                  transform: 'rotate(35deg)',
                  opacity: 0.6,
                  zIndex: 10,
                  borderLeft: '1px solid rgba(255,255,255,0.3)',
                  borderRight: '1px solid rgba(255,255,255,0.3)'
                }} />

                <div style={{ 
                  background: '#fff', 
                  padding: isMobile ? '5px 5px 20px 5px' : '6px 6px 24px 6px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                  width: isMobile ? '100px' : '130px'
                }}>
                  <img 
                    src={url} 
                    alt="photo" 
                    style={{ 
                      width: '100%',
                      height: isMobile ? '100px' : '130px',
                      objectFit: 'cover',
                      display: 'block'
                    }} 
                  />
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Lightbox */}
      {lightboxSrc && (
        <div
          onClick={() => setLightboxSrc(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.95)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'zoom-out',
            padding: isMobile ? 20 : 40,
            backdropFilter: 'blur(10px)'
          }}
        >
          <img 
            src={lightboxSrc} 
            alt="enlarged" 
            style={{ 
              maxWidth: '90vw',
              maxHeight: '90vh',
              objectFit: 'contain',
              boxShadow: '0 30px 100px rgba(0,0,0,1)',
              border: '4px solid rgba(255,255,255,0.1)'
            }} 
          />
        </div>
      )}
    </>
  );
}
// ─── HALL OF FAME (DENSE LAYOUT) ─────────────────────────────────────────────
function HallOfFame({ sets, genreMap, onShare, posters = [] }) {
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
    .filter(a => a.shows.length >= (typeof HALL_OF_FAME_MIN !== 'undefined' ? HALL_OF_FAME_MIN : 5))
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
      <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: C.gray, marginBottom: 20, letterSpacing: '0.1em', textTransform: 'uppercase', textAlign: 'center' }}>
        // ARTISTS SEEN {HALL_OF_FAME_MIN || 3}+ TIMES //
      </div>

      {/* DETAIL VIEW - Dense 3 Column */}
      {selectedData && (() => {
        const gc = selectedData.genre ? (GENRE_COLORS[selectedData.genre] || C.teal) : C.teal;
        
        // Build artifact packages
        const showPackages = [...selectedData.shows]
  .sort((a, b) => new Date(b.date) - new Date(a.date))
  .map((show, idx) => {

          const artifacts = {
            setlists: [],
            posters: [],
            photos: [],
            wristband: null
          };
          
          const slSource = show.setlist_image_url || show.image_url;
          if (slSource) {
            slSource.split(',').forEach(url => {
              if (url.trim()) artifacts.setlists.push(url.trim());
            });
          }
          
          if (show.personal_photo_url) {
            show.personal_photo_url.split(',').forEach(url => {
              if (url.trim()) artifacts.photos.push(url.trim());
            });
          }
          
          if (show.wristband_image_url) {
            artifacts.wristband = show.wristband_image_url;
          }
          
          if (show.is_festival && show.festival_name) {
            const festYear = getYear(show.date);
            const matchedPosters = posters.filter(p => 
              p.poster_type === 'festival_year' && 
              (
                p.festival_name?.toLowerCase().trim() === show.festival_name?.toLowerCase().trim() || 
                show.festival_name?.toLowerCase().includes(p.festival_name?.toLowerCase()) ||
                p.festival_name?.toLowerCase().includes(show.festival_name?.toLowerCase())
              ) &&
              getYear(p.date) === festYear
            );
            artifacts.posters = matchedPosters.map(p => p.image_url);
          } else {
            const artistPosters = posters.filter(p => 
              p.artist === selectedData.artist && p.date === show.date
            );
            artifacts.posters = artistPosters.map(p => p.image_url);
          }
          
          const hasArtifacts = artifacts.setlists.length > 0 || 
                              artifacts.posters.length > 0 || 
                              artifacts.photos.length > 0 ||
                              artifacts.wristband;
          
          return {
            show,
            artifacts,
            hasArtifacts,
            isLeft: idx % 2 === 0
          };
        });

        
          return (
  <div className="fade-in" style={{ 
    background: `
      radial-gradient(ellipse at 50% 30%, ${hexToRgba(gc, 0.12)} 0%, transparent 60%),
      linear-gradient(135deg, 
        rgba(30,30,35,1) 0%, 
        rgba(20,20,25,1) 50%, 
        rgba(15,15,20,1) 100%
      ),
      repeating-linear-gradient(
        90deg,
        rgba(255,255,255,0.02) 0px,
        rgba(255,255,255,0.02) 1px,
        transparent 1px,
        transparent 3px
      ),
      repeating-linear-gradient(
        180deg,
        rgba(255,255,255,0.01) 0px,
        rgba(255,255,255,0.01) 1px,
        transparent 1px,
        transparent 2px
      )
    `,
    border: `2px solid ${gc}66`, 
    borderRadius: 16, 
    padding: window.innerWidth < 768 ? '24px' : '40px', 
    marginBottom: 40, 
    boxShadow: `
      0 40px 120px rgba(0,0,0,0.7),
      0 0 60px ${hexToRgba(gc, 0.2)},
      inset 0 1px 1px rgba(255,255,255,0.05),
      inset 0 -1px 1px rgba(0,0,0,0.5)
    `,
    position: 'relative',
    overflow: 'hidden'
  }}>
            <div style={{ position: 'absolute', right: 20, bottom: -10, fontFamily: "'Bebas Neue'", fontSize: '12rem', color: hexToRgba(gc, 0.03), pointerEvents: 'none', userSelect: 'none', lineHeight: 1 }}>
              {selectedData.shows.length}X
            </div>

            {/* Compact Header */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start', 
              marginBottom: 32, 
              position: 'relative', 
              zIndex: 5,
              paddingBottom: 16,
              borderBottom: `1px solid ${hexToRgba(gc, 0.2)}`
            }}>
              <div>
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: '3.5rem', color: C.white, lineHeight: 0.9 }}>
                  {selectedData.artist.toUpperCase()}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
                  {selectedData.genre && <GenreBadge genre={selectedData.genre} color={gc} />}
                  <span style={{ fontFamily: "'Space Mono'", fontSize: 10, color: gc, fontWeight: 900 }}>
                    {selectedData.shows.length} SETS
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                {onShare && (
                  <button 
                    onClick={() => onShare(selectedData.artist, selectedData.shows)} 
                    style={{ 
                      fontFamily: "'Space Mono'", 
                      fontSize: 9, 
                      background: hexToRgba(gc, 0.2), 
                      border: `2px solid ${gc}`, 
                      color: '#fff', 
                      borderRadius: 6, 
                      padding: '6px 12px', 
                      cursor: 'pointer', 
                      fontWeight: 700 
                    }}
                  >
                    SHARE
                  </button>
                )}
                <button 
                  onClick={() => setSelected(null)} 
                  style={{ 
                    background: 'rgba(255,255,255,0.05)', 
                    border: `1px solid rgba(255,255,255,0.1)`, 
                    color: '#fff', 
                    fontSize: 9, 
                    borderRadius: 6, 
                    padding: '6px 12px', 
                    cursor: 'pointer' 
                  }}
                >
                  CLOSE
                </button>
              </div>
            </div>

            {/* DENSE 3-Column Grid */}
            <div style={{ 
  display: 'grid',
  gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 1.2fr 1fr',
  gap: window.innerWidth < 768 ? '20px' : '40px',
  position: 'relative',
  alignItems: 'start',
  justifyItems: window.innerWidth < 768 ? 'stretch' : 'center'
}}>
              
              {/* LEFT COLUMN - Compact */}
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '16px'
              }}>
                {showPackages.filter(pkg => pkg.isLeft && pkg.hasArtifacts).map((pkg, idx) => (
                  <ArtifactCluster 
                    key={`left-${pkg.show.id}`}
                    artifacts={pkg.artifacts}
                    show={pkg.show}
                    index={idx}
                    gc={gc}
                  />
                ))}
              </div>

              {/* CENTER - Compact Timeline */}
              <div style={{ 
                position: 'relative',
                paddingLeft: '20px',
              }}>
                <div style={{ 
                  position: 'absolute', 
                  left: 5, 
                  top: 0, 
                  bottom: 0, 
                  width: 2, 
                  background: `linear-gradient(to bottom, ${gc}, transparent)`, 
                  opacity: 0.4 
                }} />
                
                {[...selectedData.shows].sort((a, b) => new Date(b.date) - new Date(a.date)).map((s, i) => (

                  <div key={i} style={{ 
                    position: 'relative', 
                    marginBottom: 18, 
                    paddingLeft: 18 
                  }}>
                    <div style={{ 
                      position: 'absolute', 
                      left: -22, 
                      top: 3, 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      background: s.is_festival ? gc : '#fff', 
                      boxShadow: `0 0 12px ${s.is_festival ? gc : '#fff'}` 
                    }} />
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <span style={{ 
                        fontFamily: "'Space Mono'", 
                        fontSize: 10, 
                        color: gc, 
                        fontWeight: 900 
                      }}>
                        {fmtDate(s.date)}
                      </span>
                      
                      {s.is_festival ? (
                        <div>
                          <span style={{ 
                            fontSize: '1rem', 
                            color: C.gold, 
                            fontWeight: 700,
                            fontFamily: "'Bebas Neue'"
                          }}>
                            {s.festival_name?.toUpperCase()} {getYear(s.date)}
                          </span>
                          {s.festival_day && (
                            <div style={{ 
                              fontFamily: "'Space Mono'", 
                              fontSize: 7, 
                              color: gc, 
                              opacity: 0.6,
                              marginTop: 1
                            }}>
                              {s.festival_day.toUpperCase()}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          <div style={{ fontSize: '1rem', color: C.white, fontWeight: 600 }}>
                            {s.venue}
                          </div>
                          <div style={{ 
                            fontFamily: "'Space Mono'", 
                            fontSize: 8, 
                            color: C.grayDim,
                            marginTop: 1
                          }}>
                            {s.city}, {s.state}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* RIGHT COLUMN - Compact */}
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '16px'
              }}>
                {showPackages.filter(pkg => !pkg.isLeft && pkg.hasArtifacts).map((pkg, idx) => (
                  <ArtifactCluster 
                    key={`right-${pkg.show.id}`}
                    artifacts={pkg.artifacts}
                    show={pkg.show}
                    index={idx}
                    gc={gc}
                  />
                ))}
              </div>

            </div>
          </div>
        );
      })()}

      {/* MASONRY EXHIBITION WALL */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: window.innerWidth < 768 
          ? 'repeat(2, 1fr)' 
          : 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: window.innerWidth < 768 ? '16px' : '24px',
        padding: window.innerWidth < 768 ? '0' : '0 20px'
      }}>
        {artists.map((a, i) => {
          const gc = a.genre ? (GENRE_COLORS[a.genre] || C.teal) : null;
          const isSelected = selected === a.artist;
          const cardColor = isSelected ? (gc || C.teal) : gc;
          
          const setlistCount = a.shows.filter(s => 
            s.has_setlist || 
            (s.has_setlist_names && s.has_setlist_names.trim().length > 0) || 
            s.setlist_image_url || 
            s.image_url
          ).length;

          // Rotation for exhibition feel (less on mobile)
          const rotation = window.innerWidth < 768 
            ? (i % 2 === 0 ? -0.5 : 0.5)
            : (i % 3 === 0 ? -1.5 : i % 3 === 1 ? 1 : -0.8);

          // Varying heights for masonry effect
          const heightMultiplier = i % 4 === 0 ? 1.2 : i % 3 === 0 ? 1.1 : 1;
          
          return (
            <div 
              key={a.artist} 
              onClick={() => handleSelect(a.artist, isSelected)}
              style={{ 
                background: cardColor 
                  ? `linear-gradient(135deg, ${C.bgCard}, ${hexToRgba(cardColor, 0.15)})` 
                  : C.bgCard,
                border: isSelected 
                  ? `3px solid ${cardColor || C.teal}` 
                  : `2px solid ${cardColor ? hexToRgba(cardColor, 0.4) : C.border}`,
                borderRadius: 16,
                padding: window.innerWidth < 768 ? '20px 16px' : '32px 24px',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                transform: isSelected 
                  ? `rotate(0deg) scale(1.02)` 
                  : `rotate(${rotation}deg)`,
                boxShadow: isSelected
                  ? `0 20px 60px rgba(0,0,0,0.4), 0 0 40px ${hexToRgba(cardColor || C.teal, 0.3)}`
                  : `0 8px 24px rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.2)`,
                minHeight: window.innerWidth < 768 ? '180px' : `${200 * heightMultiplier}px`,
                overflow: 'hidden',
                backdropFilter: 'blur(10px)',
                // Texture overlay
                backgroundImage: `
                  linear-gradient(135deg, ${cardColor ? hexToRgba(cardColor, 0.15) : 'rgba(255,255,255,0.02)'} 0%, transparent 100%),
                  repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.015) 2px, rgba(255,255,255,0.015) 4px)
                `,
              }}
              onMouseEnter={(e) => {
                if (window.innerWidth >= 768) {
                  e.currentTarget.style.transform = `rotate(0deg) scale(1.05) translateY(-4px)`;
                  e.currentTarget.style.zIndex = '10';
                }
              }}
              onMouseLeave={(e) => {
                if (window.innerWidth >= 768 && !isSelected) {
                  e.currentTarget.style.transform = `rotate(${rotation}deg) scale(1)`;
                  e.currentTarget.style.zIndex = '1';
                }
              }}
            >
              {/* Tape effect on top corners */}
              <div style={{
                position: 'absolute',
                top: window.innerWidth < 768 ? '8px' : '12px',
                right: window.innerWidth < 768 ? '8px' : '16px',
                width: window.innerWidth < 768 ? '30px' : '40px',
                height: window.innerWidth < 768 ? '12px' : '16px',
                background: 'rgba(255,255,255,0.1)',
                transform: 'rotate(45deg)',
                opacity: 0.4,
                borderLeft: '1px solid rgba(255,255,255,0.2)',
                borderRight: '1px solid rgba(255,255,255,0.2)'
              }} />

              {/* Medal/Rank Badge */}
              <div style={{ 
                position: 'absolute',
                top: window.innerWidth < 768 ? '12px' : '16px',
                left: window.innerWidth < 768 ? '12px' : '16px',
                fontFamily: "'Space Mono'", 
                fontSize: window.innerWidth < 768 ? 10 : 11,
                color: cardColor || C.tealDim,
                fontWeight: 900,
                background: cardColor 
                  ? hexToRgba(cardColor, 0.2) 
                  : 'rgba(255,255,255,0.05)',
                padding: '6px 10px',
                borderRadius: 8,
                border: `1px solid ${cardColor ? hexToRgba(cardColor, 0.4) : 'rgba(255,255,255,0.1)'}`,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}>
                <span style={{ fontSize: window.innerWidth < 768 ? 14 : 16 }}>
                  {MEDAL[i] || '🎸'}
                </span>
                <span>#{i + 1}</span>
              </div>

              {/* Artist Name - Bigger */}
              <div style={{ 
                fontSize: window.innerWidth < 768 ? '1.3rem' : '1.8rem',
                fontWeight: 900,
                color: C.white,
                marginBottom: window.innerWidth < 768 ? 8 : 12,
                marginTop: window.innerWidth < 768 ? 36 : 48,
                lineHeight: 1.1,
                fontFamily: "'Bebas Neue'",
                letterSpacing: '0.02em',
                textShadow: `2px 2px 8px rgba(0,0,0,0.5)`
              }}>
                {a.artist.toUpperCase()}
              </div>
              
              {/* Genre Badge */}
              {a.genre && (
                <div style={{ marginBottom: window.innerWidth < 768 ? 10 : 16 }}>
                  <GenreBadge genre={a.genre} color={gc} small={window.innerWidth < 768} />
                </div>
              )}
              
              {/* Show Count - HUGE */}
              <div style={{ 
                fontFamily: "'Bebas Neue'", 
                fontSize: window.innerWidth < 768 ? '3.5rem' : '5rem',
                color: cardColor || C.white,
                lineHeight: 1,
                marginTop: window.innerWidth < 768 ? 8 : 12,
                textShadow: `0 4px 20px ${hexToRgba(cardColor || C.white, 0.4)}`,
                opacity: 0.95
              }}>
                {a.shows.length}×
              </div>
              
              {/* Setlist Badge */}
              {setlistCount > 0 && (
                <div style={{ 
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  marginTop: window.innerWidth < 768 ? 12 : 16,
                  background: `${C.gold}15`,
                  border: `1px solid ${C.gold}44`,
                  borderRadius: 10,
                  padding: window.innerWidth < 768 ? '6px 10px' : '8px 14px',
                  boxShadow: `0 0 16px ${hexToRgba(C.gold, 0.2)}`
                }}>
                  <div style={{ 
                    width: window.innerWidth < 768 ? 6 : 8,
                    height: window.innerWidth < 768 ? 6 : 8,
                    borderRadius: '50%',
                    background: C.gold,
                    boxShadow: `0 0 12px ${C.gold}`
                  }} />
                  <span style={{ 
                    fontFamily: "'Space Mono'",
                    fontSize: window.innerWidth < 768 ? 8 : 9,
                    color: C.gold,
                    fontWeight: 900,
                    textTransform: 'uppercase'
                  }}>
                    {setlistCount} SETLIST{setlistCount !== 1 ? 'S' : ''}
                  </span>
                </div>
              )}

              {/* Paper grain overlay */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                opacity: 0.03,
                pointerEvents: 'none',
                mixBlendMode: 'overlay',
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
              }} />
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

function WristbandCard({ event, genreMap, compact, onEdit }) {
  const gi = getConcertGenreInfo(event, genreMap);
  const themeColor = gi.mixed ? '#9d00ff' : (gi.color || C.teal);
  const bands = event.bands || [];
  const lineup = bands.map(b => getBandName(b)).filter(Boolean).join(' · ').toUpperCase();
  const hasRealWristband = event.wristband_image_url && event.wristband_image_url.trim() !== '';

  if (hasRealWristband) {
    return (
      <div
        onClick={onEdit ? () => onEdit(event) : null}
        style={{
          width: '100%',
          cursor: onEdit ? 'pointer' : 'default',
          display: 'flex',
          flexDirection: 'column',
          gap: 8
        }}
      >
        {/* REAL WRISTBAND IMAGE */}
        <div style={{
          width: '100%',
          background: '#000',
          borderRadius: 4,
          overflow: 'hidden',
          border: `1px solid ${hexToRgba(themeColor, 0.4)}`,
          boxShadow: `0 4px 20px rgba(0,0,0,0.5), 0 0 15px ${hexToRgba(themeColor, 0.2)}`,
          position: 'relative'
        }}>
          <img loading="lazy"
            src={event.wristband_image_url}
            alt="Wristband"
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              objectFit: 'contain'
            }}
          />
          {/* Subtle color overlay at bottom */}
          <div style={{
            position: 'absolute',
            bottom: 0, left: 0, right: 0,
            height: '30%',
            background: `linear-gradient(to top, ${hexToRgba(themeColor, 0.3)}, transparent)`,
            pointerEvents: 'none'
          }} />
        </div>

        {/* NAMEPLATE */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: "'Bebas Neue'",
            fontSize: compact ? '0.9rem' : '1.2rem',
            color: themeColor,
            letterSpacing: 2,
            lineHeight: 1
          }}>
            {event.festival_name?.toUpperCase() || 'FESTIVAL'}
          </div>
          {event.festival_day && (
            <div style={{
              fontFamily: "'Space Mono'",
              fontSize: '8px',
              color: '#666',
              marginTop: 2
            }}>
              {event.festival_day.toUpperCase()}
            </div>
          )}
        </div>
      </div>
    );
  }

  // FALLBACK: existing fake wristband render
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
// ─── SETLIST VAULT TAB (ARTIFACT TABLE EDITION) ──────────────────────────────
// Replace your entire SetlistVaultTab function with this:

function SetlistVaultTab({ genreMap }) {
  const [relics, setRelics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRelics() {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.id) return;

        // Query artifacts table for relics
        const { data } = await supabase
          .from('artifacts')
          .select(`
            id,
            image_url,
            band_name,
            show:shows (
              id,
              date,
              venue,
              city,
              state,
              festival_name,
              festival_day,
              is_festival,
              bands
            )
          `)
          .eq('user_id', session.user.id)
          .eq('artifact_type', 'relic')
          .order('id', { ascending: false });

        if (data) {
          // Transform into display format
          const formatted = data
            .filter(r => r.show && r.image_url)
            .map(r => ({
              id: r.id,
              band: r.band_name || r.show.bands?.[0]?.name || r.show.bands?.[0] || 'Unknown',
              date: r.show.date,
              venue: r.show.venue || r.show.festival_name || 'Unknown Venue',
              city: r.show.city,
              state: r.show.state,
              festival_name: r.show.festival_name,
              festival_day: r.show.festival_day,
              is_festival: r.show.is_festival,
              image_url: r.image_url
            }))
            .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

          setRelics(formatted);
        }
      } catch (err) {
        console.error('Relics fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchRelics();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 100, textAlign: 'center' }}>
        <div style={{ fontFamily: "'Space Mono'", fontSize: 10, color: C.gray }}>
          LOADING RELICS...
        </div>
      </div>
    );
  }

  if (relics.length === 0) {
    return (
      <div style={{ padding: '120px 0', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🏺</div>
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: '2.5rem', color: C.white, letterSpacing: '2px' }}>
          RELIC VAULT EMPTY
        </div>
        <div style={{ fontFamily: "'Space Mono'", fontSize: '10px', color: C.gray, marginTop: '10px' }}>
          UPLOAD SETLISTS, DRUMSTICKS, PASSES TO BEGIN
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 0' }} className="fade-in">
      <div style={{ textAlign: 'center', marginBottom: 60 }}>
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: '4.5rem', color: C.white, lineHeight: 1 }}>
          RELIC <span style={{ color: C.gold }}>VAULT</span>
        </div>
        <div style={{ fontFamily: "'Space Mono'", fontSize: '10px', color: C.gray, marginTop: 15, letterSpacing: '4px', fontWeight: 900 }}>
          {relics.length} ARTIFACTS ARCHIVED
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '60px', alignItems: 'start' }}>
        {relics.map((s, i) => {
          const rotation = (i % 2 === 0 ? 1 : -1) * (i % 3 + 1);
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
              <div style={{ 
                background: '#fdfdfd', 
                padding: '12px', 
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)', 
                borderRadius: 2,
                border: '1px solid #e0e0e0',
                display: 'block',
              }}>
                <div style={{ 
                  position: 'absolute', top: -12, left: '35%', width: '30%', height: '22px', 
                  background: 'rgba(0, 110, 255, 0.3)', backdropFilter: 'blur(1px)', 
                  transform: 'rotate(-1deg)', zIndex: 10, border: '1px solid rgba(255,255,255,0.2)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }} />
                
                <div style={{ 
                  padding: '14px 6px', textAlign: 'center', background: '#111', 
                  color: '#fff', fontFamily: "'Bebas Neue'", fontSize: '1.8rem', 
                  marginBottom: 12, letterSpacing: '1px' 
                }}>
                  {s.band.toUpperCase()}
                </div>

                {s.image_url ? (
                  <div style={{ 
                    width: '100%', 
                    overflow: 'hidden', 
                    border: '1px solid #eee', 
                    background: '#000',
                    lineHeight: 0,
                  }}>
                    <img 
                      src={s.image_url} 
                      alt={s.band} 
                      loading="lazy"
                      style={{ 
                        width: '100%', 
                        height: 'auto',
                        maxHeight: '600px',
                        display: 'block',
                        objectFit: 'contain',
                        filter: 'sepia(0.08) contrast(1.05)',
                      }} 
                    />
                  </div>
                ) : (
                  <div style={{ height: '220px', background: '#f5f0e8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: '10px', fontFamily: "'Space Mono'", textAlign: 'center', padding: 25, border: '1px dashed #ccc' }}>
                    [ ARTIFACT IMAGE MISSING ]
                  </div>
                )}

                <div style={{ padding: '18px 10px 8px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid #eee', marginTop: 5 }}>
                  <div style={{ color: '#000', fontSize: '10px', fontFamily: "'Space Mono'", fontWeight: 900, lineHeight: 1.5 }}>
                    {fmtDateShort(s.date)}<br/>
                    <span style={{ opacity: 0.5, fontSize: '8px' }}>
                      {s.is_festival 
                        ? `${s.festival_name?.toUpperCase()} ${s.festival_day ? '• ' + s.festival_day.toUpperCase() : ''}`
                        : s.venue.toUpperCase()
                      }
                    </span>
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
  const [showNavigator, setShowNavigator] = useState(true); 
  const PX_PER_DAY = 3.5; 

  // 🟢 INTERNAL STYLES (Moved inside to prevent ReferenceErrors)
  const navBtnSt = {
    background: 'rgba(255,255,255,0.03)',
    border: `1px solid ${hexToRgba('#fff', 0.1)}`,
    borderRadius: 12,
    padding: '30px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'center'
  };
  const navIconSt = { fontSize: '2rem', marginBottom: 10 };
  const navLabelSt = { fontFamily: "'Bebas Neue'", fontSize: '1.5rem', color: '#fff', letterSpacing: 1 };
  const navSubSt = { fontFamily: "'Space Mono'", fontSize: 8, color: C.teal, marginTop: 5, letterSpacing: 2 };

  const data = useMemo(() => {
    if (!concerts || concerts.length === 0) {
      return { sortedShows: [], yearBlocks: [], monthMarkers: [], highlights: [], totalWidth: 0 };
    }

    const sorted = [...concerts].filter(c => c && c.date).sort((a, b) => a.date.localeCompare(b.date));
    if (sorted.length === 0) return { sortedShows: [], yearBlocks: [], monthMarkers: [], highlights: [], totalWidth: 0 };

    try {
      const firstDate = new Date(sorted[0].date + 'T12:00:00');
      const lastDate = new Date(sorted[sorted.length - 1].date + 'T12:00:00');
      const minTs = firstDate.getTime();
      const MS_PER_DAY = 86400000;
      const PADDING = 600; 

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
    } catch (e) {
      console.error("Timeline calc error:", e);
      return { sortedShows: [], yearBlocks: [], monthMarkers: [], highlights: [], totalWidth: 0 };
    }
  }, [concerts, genreMap]);

  const jumpTo = (targetX) => {
    if (data.totalWidth === 0) return;
    setShowNavigator(false);
    setTimeout(() => {
      if (scrollRef.current) {
        const centerOffset = scrollRef.current.clientWidth / 2;
        scrollRef.current.scrollTo({ left: targetX - centerOffset, behavior: 'smooth' });
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

  // EMPTY STATE UI
  if (data.sortedShows.length === 0) {
    return (
      <div style={{ height: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', background: 'rgba(0,0,0,0.3)', borderRadius: 16, border: `1px dashed ${C.border}` }}>
        <div style={{ fontSize: '3rem', marginBottom: 20 }}>⏳</div>
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: '2.5rem', color: '#fff', letterSpacing: 3 }}>TIME MACHINE OFFLINE</div>
        <div style={{ fontFamily: "'Space Mono'", fontSize: 10, color: C.teal, marginTop: 10, letterSpacing: 2 }}>[ NO TEMPORAL COORDINATES DETECTED ]</div>
        <button onClick={() => setActiveTab('dashboard')} style={{ marginTop: 30, background: 'transparent', border: `1px solid ${C.teal}`, color: C.teal, padding: '10px 20px', fontFamily: "'Space Mono'", fontSize: 10, cursor: 'pointer', borderRadius: 4 }}>RETURN TO CENTER STAGE</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px 0', position: 'relative' }} className="fade-in">
      <GenreLegend />

      {showNavigator && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 2000, background: 'rgba(5,5,8,0.95)', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: 16, border: `1px solid ${C.border}` }}>
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

      {!showNavigator && (
        <button onClick={() => setShowNavigator(true)} style={{ position: 'absolute', bottom: 40, right: 40, zIndex: 1001, background: '#000', border: `2px solid ${C.teal}`, borderRadius: '50%', width: 50, height: 50, cursor: 'pointer', boxShadow: `0 0 20px ${C.teal}66`, fontSize: '1.5rem' }}>🚀</button>
      )}

      <div style={{ position: 'absolute', top: 80, left: 40, zIndex: 1000, pointerEvents: 'none' }}>
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: '4.5rem', color: C.teal, opacity: 0.6, textShadow: `0 0 20px ${C.teal}44` }}>{currentYear}</div>
      </div>

      <div ref={scrollRef} style={{ width: '100%', height: '750px', overflowX: 'auto', overflowY: 'hidden', background: 'rgba(0,0,0,0.5)', border: `1px solid ${C.border}`, borderRadius: 16, position: 'relative' }}>
        <div style={{ width: data.totalWidth, height: '100%', position: 'relative' }}>
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

// ─── 📄 STACKED SETLISTS & ARTIFACTS ────────────────────────────────────────
// ─── 📄 STACKED SETLISTS & ARTIFACTS (TRIMMED EDITION) ────────────────────────
function SetlistPaper({ src, index = 0, total = 1 }) {
  const [isFull, setIsFull] = React.useState(false);
  if (!src) return null;

  const rotation = (index % 2 === 0 ? -1.5 : 1.5) + (index * 0.5);
  const xOffset = index * -20;
  
  // Clean URL (strips the rotation hash)
  const cleanSrc = src.split('#rot=')[0];

  return (
    <>
      <div 
        onClick={() => setIsFull(true)}
        style={{
          display: 'inline-block',
          background: '#fdfdfd', 
          boxShadow: '2px 5px 15px rgba(0,0,0,0.4)',
          transform: `rotate(${rotation}deg) translateX(${xOffset}px)`, 
          padding: '6px',
          lineHeight: 0,
          position: 'relative',
          marginRight: index === total - 1 ? '0' : '-30px', 
          flexShrink: 0,
          zIndex: 5 + index,
          border: '1px solid #eee', 
          cursor: 'zoom-in',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          /* 🟢 THE FIX: Snap to content height */
          alignSelf: 'flex-start'
        }}
        onMouseEnter={e => { 
          e.currentTarget.style.transform = `rotate(0deg) scale(1.05) translateY(-5px)`; 
          e.currentTarget.style.zIndex = 1000; 
        }}
        onMouseLeave={e => { 
          e.currentTarget.style.transform = `rotate(${rotation}deg) translateX(${xOffset}px) scale(1)`; 
          e.currentTarget.style.zIndex = 5 + index; 
        }}
      >
        {/* Blue Tape */}
        <div style={{ 
          position: 'absolute', top: -8, left: '50%', marginLeft: '-20px', 
          width: '40px', height: '14px', 
          background: 'rgba(0, 100, 255, 0.4)', backdropFilter: 'blur(1px)', 
          transform: 'rotate(2deg)', border: '1px solid rgba(0,100,255,0.1)',
          zIndex: 10 
        }} />
        
        {/* 🟢 THE IMAGE: Removed width/maxHeight constraints that caused the chin */}
        <img 
          src={cleanSrc} 
          alt="Stage Artifact" 
          style={{
            display: 'block',
            width: '140px', // A consistent width for the stack
            height: 'auto', // 🟢 Snap height to the image
            objectFit: 'contain',
            filter: 'sepia(0.05) contrast(1.05)'
          }}
        />
      </div>
      
      {isFull && <Lightbox src={src} onClose={() => setIsFull(false)} type="SETLIST" />}
    </>
  );
}

function GigPoster({ src, artist, date, index = 0 }) {
  const [isFull, setIsFull] = React.useState(false);
  if (!src) return null;

  const cleanSrc = src.split('#rot=')[0];
  const rotation = (index % 2 === 0 ? -1.2 : 1.2);

  return (
    <>
      <div
        onClick={() => setIsFull(true)}
        style={{
          display: 'inline-block',
          position: 'relative',
          transform: `rotate(${rotation}deg)`,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'zoom-in',
          flexShrink: 0,
          alignSelf: 'flex-start',
          marginRight: '-20px',
          zIndex: 5 + index,
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = `rotate(0deg) scale(1.05) translateY(-5px)`;
          e.currentTarget.style.zIndex = 1000;
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = `rotate(${rotation}deg)`;
          e.currentTarget.style.zIndex = 5 + index;
        }}
      >
        {/* OUTER FRAME */}
        <div style={{
          padding: '6px',
          background: 'linear-gradient(145deg, #4a4a4a 0%, #1a1a1a 40%, #3a3a3a 60%, #111 100%)',
          borderRadius: '3px',
          boxShadow: `
            0 0 0 1px #666,
            0 0 0 2px #111,
            4px 8px 20px rgba(0,0,0,0.7),
            inset 0 1px 0 rgba(255,255,255,0.15),
            inset 0 -1px 0 rgba(0,0,0,0.5)
          `,
          width: '130px',
        }}>
          {/* MATTE */}
          <div style={{
            padding: '5px',
            background: '#0a0a0a',
            border: '1px solid #2a2a2a',
          }}>
            {/* IMAGE */}
            <img loading="lazy"
              src={cleanSrc}
              alt={artist}
              style={{
                display: 'block',
                width: '100%',
                height: 'auto',
                maxHeight: '180px',
                objectFit: 'cover',
              }}
            />
          </div>

          {/* NAMEPLATE */}
          <div style={{
            marginTop: '5px',
            padding: '4px 6px',
            background: 'linear-gradient(90deg, #2a2a2a, #1a1a1a, #2a2a2a)',
            border: '1px solid #3a3a3a',
            borderRadius: '1px',
            textAlign: 'center',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
          }}>
            <div style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '7px',
              color: '#aaa',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              lineHeight: 1.4,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {artist?.toUpperCase()}
            </div>
            <div style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '6px',
              color: '#666',
              letterSpacing: '1px',
              marginTop: '1px',
            }}>
              {date ? fmtDateShort(date).toUpperCase() : 'GIG POSTER'}
            </div>
          </div>
        </div>
      </div>

      {isFull && <Lightbox src={cleanSrc} caption={artist} onClose={() => setIsFull(false)} type="POSTER" />}
    </>
  );
}

// ─── 📸 STACKED POLAROIDS (PHYSICS & 3D EDITION) ────────────────────────────────
// ─── 📸 STACKED POLAROIDS (PHYSICS & 3D EDITION + PRIVACY) ────────────────────────────────
function PersonalPolaroid({ src, caption, date, venue, index = 0, isPublic = true, shouldBlur = false, isAdmin = false, onTogglePrivacy, onZoom }) {
  if (!src) return null;

  const markerColors = ['#1a1a1a', '#2140ab', '#b02525', '#1e6337', '#732ba1', '#cc6600'];
  const myColor = markerColors[index % markerColors.length];

  const handleLockClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    console.log('Lock button clicked! Current state:', isPublic);
    if (onTogglePrivacy) {
      onTogglePrivacy(e);
    }
  };

  return (
    <div 
      className="polaroid-gravity-swing"
      style={{
        padding: '12px 12px 20px 12px',
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
        zIndex: 100, border: '1px solid #900',
        pointerEvents: 'none'
      }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 4, height: 4, background: '#400', borderRadius: '50%', opacity: 0.5 }} />
        <div className="tack-shine" />
      </div>

      {/* PRIVACY LOCK (Admin only) - OUTSIDE polaroid frame */}
      {isAdmin && onTogglePrivacy && (
        <div
          onClick={handleLockClick}
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: isPublic ? 'rgba(0,204,136,0.95)' : 'rgba(255,68,68,0.95)',
            border: `3px solid ${isPublic ? '#00cc88' : '#ff4444'}`,
            color: '#fff',
            fontSize: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 200,
            boxShadow: '0 6px 16px rgba(0,0,0,0.5)',
            transition: 'all 0.2s',
            pointerEvents: 'all',
            userSelect: 'none'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'scale(1.15)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.7)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.5)';
          }}
        >
          {isPublic ? '🔓' : '🔒'}
        </div>
      )}

      {/* PHOTO AREA - Click handler here */}
      <div 
        className="polaroid-frame" 
        onClick={onZoom}
        style={{ 
          width: '100%', 
          aspectRatio: '1/1', 
          background: `url(${src}) center/cover no-repeat`,
          border: '1px solid rgba(0,0,0,0.1)',
          filter: shouldBlur ? 'blur(20px)' : 'none',  // Changed from isPublic check
          transition: 'filter 0.3s',
          cursor: 'pointer',
          position: 'relative'
        }} 
      >
        {/* Private overlay badge - only show to non-owners */}
        {shouldBlur && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(0,0,0,0.9)',
            padding: '12px 20px',
            borderRadius: 8,
            fontFamily: "'Space Mono'",
            fontSize: 10,
            color: '#ff4444',
            fontWeight: 900,
            letterSpacing: 2,
            border: '2px solid #ff4444',
            pointerEvents: 'none',
            zIndex: 10
          }}>
            🔒 PRIVATE
          </div>
        )}
      </div>

      {/* 🖊️ HANDWRITTEN LABELS */}
      <div style={{ 
        fontFamily: "'Caveat', cursive", textAlign: 'center', 
        marginTop: '15px', color: myColor, padding: '0 5px',
        pointerEvents: 'none'
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

function ByDayTab({ 
  dayGroups, onEdit, genreMap, isAdmin, viewingUser, 
  bulkMode, setBulkMode, selectedSignals, setSelectedSignals, 
  onSync, posters = [] 
}) {
  const isMobile = window.innerWidth < 768;
  const [showJumpMenu, setShowJumpMenu] = useState(false);

  // ─── 1. CLUSTERING LOGIC ───────────────────────────────────────────────────
  const clusters = useMemo(() => {
    const results = [];
    let currentFestKey = null;
    let currentGroup = [];
    const soloBuffer = [];

    dayGroups.forEach((event) => {
      const festKey = event.is_festival 
        ? `${event.festival_name}-${new Date(event.date).getFullYear()}` 
        : null;

      if (festKey && festKey === currentFestKey) {
        soloBuffer.forEach(s => results.push({ type: 'solo', event: s }));
        soloBuffer.length = 0;
        currentGroup.push(event);
      } else if (festKey && festKey !== currentFestKey) {
        if (currentGroup.length) results.push({ type: 'festival', events: currentGroup });
        soloBuffer.forEach(s => results.push({ type: 'solo', event: s }));
        soloBuffer.length = 0;
        currentFestKey = festKey;
        currentGroup = [event];
      } else {
        soloBuffer.push(event);
      }
    });

    if (currentGroup.length) results.push({ type: 'festival', events: currentGroup });
    soloBuffer.forEach(s => results.push({ type: 'solo', event: s }));
    return results;
  }, [dayGroups]);

  // ─── 2. HELPER FUNCTIONS ───────────────────────────────────────────────────
  const teleportTo = (targetId) => {
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.style.transition = 'box-shadow 0.5s ease, transform 0.5s ease';
      el.style.boxShadow = `0 0 40px ${hexToRgba(C.gold, 0.4)}`;
      el.style.transform = 'scale(1.01)';
      setTimeout(() => {
        el.style.boxShadow = 'none';
        el.style.transform = 'scale(1)';
      }, 2000);
    }
    setShowJumpMenu(false);
  };

  const handleRandomTeleport = () => {
    if (!clusters.length) return;
    const randomIdx = Math.floor(Math.random() * clusters.length);
    teleportTo(`cluster-${randomIdx}`);
  };

  // ─── 3. THE RENDER BLOCK ───────────────────────────────────────────────────
  return (
    <div style={{ padding: isMobile ? '10px' : '24px 0' }} className="fade-in">
      
      {/* 🛸 TELEPORT SYSTEM BAR */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15px', position: 'relative', zIndex: 1000 }}>
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowJumpMenu(!showJumpMenu)}
            style={{ 
              background: 'rgba(255,255,255,0.03)', border: `1px solid ${hexToRgba(C.teal, 0.3)}`, color: C.teal, 
              fontFamily: "'Space Mono'", fontSize: 10, padding: '8px 16px', borderRadius: '4px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 10, letterSpacing: 1
            }}
          >
            TAKE ME TO... <span style={{ opacity: 0.5, fontSize: 8 }}>{showJumpMenu ? '▲' : '▼'}</span>
          </button>

          {showJumpMenu && (
            <div style={{ 
              position: 'absolute', top: '100%', right: 0, marginTop: 10, background: '#0d0d12', 
              border: `1px solid ${C.border}`, borderRadius: '8px', width: '220px', overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(0,0,0,0.8)', zIndex: 1001
            }}>
              {[
                { label: '📡 LATEST SIGNAL', action: () => teleportTo('cluster-0') },
                { label: '🏺 THE BEGINNING', action: () => teleportTo(`cluster-${clusters.length - 1}`) },
                { label: '🎲 RANDOM RECALL', action: handleRandomTeleport }
              ].map((opt, i) => (
                <div 
                  key={i} onClick={opt.action}
                  style={{ padding: '14px 18px', color: '#fff', fontFamily: "'Space Mono'", fontSize: 9, cursor: 'pointer', borderBottom: `1px solid ${C.border}`, transition: 'all 0.2s' }}
                  onMouseEnter={(e) => { e.target.style.background = hexToRgba(C.teal, 0.1); e.target.style.color = C.teal; }}
                  onMouseLeave={(e) => { e.target.style.background = 'none'; e.target.style.color = '#fff'; }}
                >
                  {opt.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 📡 BULK SYNC RAIL */}
      {viewingUser && (
        <div style={{ 
          background: bulkMode ? hexToRgba(C.gold, 0.1) : 'rgba(255,255,255,0.03)', 
          border: `1px solid ${bulkMode ? C.gold : C.border}`,
          padding: '15px 25px', borderRadius: '12px', marginBottom: '30px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: '20px', zIndex: 100, backdropFilter: 'blur(10px)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.5rem', color: bulkMode ? C.gold : '#fff' }}>
              {bulkMode ? 'SIGNAL SELECTION ACTIVE' : 'MASS ARCHIVE PROTOCOL'}
            </div>
            {bulkMode && <div style={{ fontFamily: "'Space Mono'", fontSize: 10, color: C.gold }}>{selectedSignals.length} SIGNALS CAPTURED</div>}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => { setBulkMode(!bulkMode); setSelectedSignals([]); }} style={{ background: 'none', border: `1px solid ${bulkMode ? C.gold : C.teal}`, color: bulkMode ? C.gold : C.teal, padding: '8px 16px', borderRadius: 4, fontFamily: "'Space Mono'", fontSize: 10, cursor: 'pointer' }}>
              {bulkMode ? '[ ABORT ]' : '[ INITIALIZE SYNC ]'}
            </button>
            {bulkMode && selectedSignals.length > 0 && (
              <button onClick={onSync} style={{ background: C.gold, border: 'none', color: '#000', padding: '8px 20px', borderRadius: 4, fontFamily: "'Bebas Neue'", fontSize: '1.1rem', fontWeight: 900, cursor: 'pointer', boxShadow: `0 0 20px ${hexToRgba(C.gold, 0.4)}` }}>
                COMMIT TO ARCHIVE
              </button>
            )}
          </div>
        </div>
      )}

      {/* 📜 CLUSTER LIST RENDER */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '30px' : '60px' }}>
        {clusters.map((cluster, ci) => {
          if (cluster.type === 'solo') {
            return (
              <div key={`cluster-${ci}`} id={`cluster-${ci}`}>
                <ScrapbookRow 
                  event={cluster.event} idx={ci} isAdmin={isAdmin} onEdit={onEdit} genreMap={genreMap}
                  bulkMode={bulkMode} selectedSignals={selectedSignals} setSelectedSignals={setSelectedSignals}
                />
              </div>
            );
          }

          // 🛰️ FESTIVAL CLUSTER LOGIC
          const firstEvent = cluster.events[0];
          const festYear = new Date(firstEvent.date).getFullYear();
          const themeColor = GENRE_COLORS[genreMap[firstEvent.bands?.[0]]] || C.teal;
          
          // 🟢 FUZZY MATCH: Find 'festival_year' poster for header
          const masterPoster = posters.find(p => 
            p.poster_type === 'festival_year' && 
            (p.festival_name?.toLowerCase().trim() === firstEvent.festival_name?.toLowerCase().trim() || 
             firstEvent.festival_name?.toLowerCase().includes(p.festival_name?.toLowerCase()) ||
             p.festival_name?.toLowerCase().includes(firstEvent.festival_name?.toLowerCase())) &&
            getYear(p.date) === festYear
          )?.image_url;

          return (
            <div key={`cluster-${ci}`} id={`cluster-${ci}`} style={{ 
              position: 'relative', padding: isMobile ? '20px 15px' : '40px', background: 'rgba(255,255,255,0.01)', 
              border: `1px solid ${hexToRgba(themeColor, 0.2)}`, borderRadius: isMobile ? '12px' : '24px'
            }}>
              <div style={{ display: 'flex', gap: '30px', marginBottom: '40px', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '25px', alignItems: 'baseline' }}>
                  <div style={{ fontFamily: "'Bebas Neue'", fontSize: isMobile ? '2.5rem' : '5rem', color: themeColor, lineHeight: 1 }}>
                    {firstEvent.festival_name.toUpperCase()}
                  </div>
                  <div style={{ fontFamily: "'Space Mono'", fontSize: '10px', color: C.gray }}>
                    {festYear} // {cluster.events.length} DAYS
                  </div>
                </div>

                {/* 🖼️ CLUSTER POSTER (The Header Fix) */}
                {masterPoster && (
                  <img 
                    src={masterPoster} 
                    style={{ 
                      width: isMobile ? '80px' : '120px', 
                      height: 'auto', 
                      borderRadius: 4, 
                      border: `1px solid ${themeColor}`, 
                      boxShadow: `0 10px 30px rgba(0,0,0,0.5)`,
                      transform: 'rotate(2deg)'
                    }} 
                    alt="Poster" 
                  />
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {cluster.events.map((event, ei) => (
                  <ScrapbookRow 
                    key={event.id} event={event} idx={ei} isAdmin={isAdmin} onEdit={onEdit} genreMap={genreMap} 
                    isClustered={true} clusterColor={themeColor}
                    bulkMode={bulkMode} selectedSignals={selectedSignals} setSelectedSignals={setSelectedSignals}
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
  // 🛡️ CRITICAL SAFETY GATES - Must be FIRST
  if (!event) {
    console.error('ScrapbookRow: event is null/undefined');
    return null;
  }
  
  if (!event.date) {
    console.error('ScrapbookRow: Missing date', event);
    return null;
  }

  const isMobile = window.innerWidth < 768;
  const venueLabel = event.is_festival ? (event.festival_name || 'FESTIVAL') : (event.venue || 'UNKNOWN VENUE');
  const primaryColor = clusterColor || C.teal;
  
  // 🛰️ DATA SCAVENGING
  // 1. Establish Naming Hierarchy
  const bands = Array.isArray(event.bands) ? event.bands : (event.artist ? [event.artist] : []);
  
  // 🛡️ Ensure we always have at least one band
  if (bands.length === 0) {
    bands.push(event.festival_name || event.venue || 'UNKNOWN');
  }
  
  const headlinerName = (getBandName(bands[0]) || "LIVE").toUpperCase();

  // 2. Standardize Media Sources
  const rawSetlists = (event.setlist_image_url || "").split(',').map(u => u.trim()).filter(Boolean);
  const rawPhotos = (event.personal_photo_url || "").split(',').map(u => u.trim()).filter(Boolean);
  
  // 🛡️ Safety: Ensure personal photos don't duplicate setlist images
  const finalPhotos = rawPhotos.filter(url => !rawSetlists.includes(url));
  const finalSetlists = rawSetlists;

  // 🎨 RELATIONAL POSTER CONSOLIDATION
  const finalPosters = useMemo(() => {
    const list = [];
    if (event.festival_poster_url) {
      event.festival_poster_url.split(',').forEach(url => {
        if (url.trim()) list.push({ url: url.trim(), artist: headlinerName, date: event.date, poster_type: 'artist' });
      });
    }
    if (event.matchedPosters) {
      event.matchedPosters.forEach(p => {
        if (!list.some(item => item.url === p.image_url)) {
          list.push({ url: p.image_url, artist: p.artist || headlinerName, date: p.date, poster_type: p.poster_type });
        }
      });
    }
    
    // 🟢 HIDE FESTIVAL-WIDE POSTERS FROM ROWS
    return list.filter(p => p.poster_type !== 'festival_year');
  }, [event.festival_poster_url, event.matchedPosters, event.date, headlinerName]);

  // 🟢 SELF-CONTAINED CLONE LOGIC
  const cloneSignal = async (e) => {
    e.stopPropagation();
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      alert("LOGIN REQUIRED");
      return;
    }

    try {
      const primaryArtist = (event.bands?.[0]?.name || event.bands?.[0] || event.artist || 'Unknown').toString();
      const safeVenue = event.venue || event.festival_name || 'Unknown Venue';
      
      const { data: matchingShows } = await supabase
        .from('shows')
        .select('*')
        .eq('date', event.date);
      
      let showId = null;
      if (matchingShows) {
        const match = matchingShows.find(s => 
          s.venue?.toLowerCase().includes(safeVenue.toLowerCase().substring(0, 10)) &&
          s.artist?.toLowerCase().includes(primaryArtist.toLowerCase().substring(0, 10))
        );
        showId = match?.id;
      }
      
      if (!showId) {
        const { data: newShow } = await supabase
          .from('shows')
          .insert([{
            date: event.date,
            artist: primaryArtist,
            bands: event.bands || [primaryArtist],
            venue: safeVenue,
            city: event.city || '',
            state: event.state || '',
            is_festival: event.is_festival || false,
            festival_name: event.festival_name || null,
            festival_day: event.festival_day || null,
            genre: event.genre || 'Indie Rock',
            created_by: session.user.id
          }])
          .select()
          .single();
        
        showId = newShow.id;
      }
      
      await supabase.from('attendances').insert([{
        user_id: session.user.id,
        show_id: showId,
        is_public: true
      }]);
      
      alert(`⚡ CLONED: ${primaryArtist}`);
if (typeof onRefresh === 'function') await onRefresh();
      
    } catch (err) {
      if (err.code === '23505') {
        alert("ALREADY IN YOUR ARCHIVE");
      } else {
        alert("CLONE FAILED: " + err.message);
      }
    }
  };

const onSync = async () => {
  if (selectedSignals.length === 0) return;
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) {
    alert("LOGIN REQUIRED");
    return;
  }

  console.log('🔄 Starting bulk sync for', selectedSignals.length, 'shows');

  let succeeded = 0;
  let failed = 0;

  for (const signal of selectedSignals) {
    try {
      console.log('Processing:', signal.artist, signal.date);
      
      const primaryArtist = signal.bands?.[0]?.name || signal.artist || 'Unknown';
      const safeVenue = signal.venue || signal.festival_name || 'Unknown Venue';
      
      const { data: matchingShows } = await supabase
        .from('shows')
        .select('*')
        .eq('date', signal.date);
      
      let showId = null;
      if (matchingShows) {
        const match = matchingShows.find(s => 
          s.venue?.toLowerCase().includes(safeVenue.toLowerCase()) &&
          s.artist?.toLowerCase().includes(primaryArtist.toLowerCase())
        );
        showId = match?.id;
      }
      
      if (!showId) {
        console.log('Creating new show for', primaryArtist);
        const { data: newShow, error } = await supabase
          .from('shows')
          .insert([{
            date: signal.date,
            artist: primaryArtist,
            bands: signal.bands,
            venue: safeVenue,
            city: signal.city,
            state: signal.state,
            is_festival: signal.is_festival,
            festival_name: signal.festival_name,
            genre: signal.genre || 'Indie Rock',
            created_by: session.user.id
          }])
          .select()
          .single();
        
        if (error) throw error;
        showId = newShow.id;
      }
      
      console.log('Inserting attendance for show', showId);
      const { error: attError } = await supabase
        .from('attendances')
        .insert([{
          user_id: session.user.id,
          show_id: showId,
          is_public: true
        }]);
      
      if (attError) {
        if (attError.code === '23505') {
          console.log('Already exists, skipping');
        } else {
          throw attError;
        }
      }
      
      succeeded++;
      console.log('✅ Success:', primaryArtist);
      
    } catch (err) {
      failed++;
      console.error('❌ Failed:', signal.artist, err.message);
    }
  }
  
  alert(`✅ ${succeeded} synced, ${failed} failed`);
  console.log('Final:', { succeeded, failed });
  window.location.reload();
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
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: isMobile ? 'center' : 'flex-end', 
        width: isMobile ? '100%' : 'auto',
        minWidth: isMobile ? 'auto' : '400px',
        zIndex: 2, 
        marginLeft: isMobile ? '0' : 'auto',
        overflow: isMobile ? 'visible' : 'visible'
      }}>
        <div style={{ 
          display: 'flex', 
          flexWrap: isMobile ? 'wrap' : 'nowrap',
          alignItems: 'flex-start', 
          justifyContent: isMobile ? 'center' : 'flex-start',
          transform: isMobile ? 'scale(0.7)' : 'none',
          transformOrigin: isMobile ? 'center' : 'right',
          gap: isMobile ? '10px' : '0',
          width: isMobile ? '100%' : 'auto'
        }}>
          {finalSetlists.map((url, sIdx) => (
            <SetlistPaper key={`${event.id}-s-${sIdx}`} src={url} index={sIdx} total={finalSetlists.length} />
          ))}
          {finalPosters.map((poster, pIdx) => (
            <GigPoster
              key={`${event.id}-poster-${pIdx}`}
              src={poster.url}
              artist={poster.artist}
              date={poster.date}
              index={pIdx}
            />
          ))}
          <div style={{ 
            marginLeft: isMobile ? '0' : ((finalSetlists.length > 0 || finalPosters.length > 0) ? '-20px' : '0'),
            display: 'flex',
            flexWrap: isMobile ? 'wrap' : 'nowrap',
            gap: isMobile ? '10px' : '0',
            justifyContent: isMobile ? 'center' : 'flex-start'
          }}>
            {finalPhotos.map((url, pIdx) => (
              <PersonalPolaroid 
  src={p.url} 
  caption={p.artist} 
  date={p.date} 
  venue={p.venue} 
  index={i}
  isPublic={p.isPublic}
  shouldBlur={p.shouldBlur}  // Add this
  isAdmin={isAdmin}
  onTogglePrivacy={(e) => {
    e.stopPropagation();
    togglePrivacy(p.url, p.isPublic);
  }}
  onZoom={() => setActivePhoto(p)}
/>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const getDayColor = (baseHex, index) => {
  const variants = [1.0, 0.8, 0.6, 0.45, 0.3]; 
  return hexToRgba(baseHex || C.teal, variants[index % variants.length]);
};
// ─── 1. BY FEST TAB (BOX SET EDITION + MEDIA CLUSTER) ───────────────────────
function ByFestTab({ festGroupings, genreMap = {}, onEdit, isAdmin, posters = [] }) {
  const FEST_COLORS = [C.teal, C.cyan, C.purple, C.gold, C.green, '#ff6699', '#ff4400', '#a2ff00'];

  if (!festGroupings.length) return <div style={{ textAlign: 'center', color: C.gray, padding: 60 }}>No festival data yet.</div>;

  return (
    <div style={{ marginTop: 40 }} className="fade-in">
      {festGroupings.map((fest, fi) => {
        const themeColor = FEST_COLORS[fi % FEST_COLORS.length];
        const yearsSorted = Object.keys(fest.years).sort((a, b) => b.localeCompare(a));
        
        // 🛰️ SUPER FUZZY MASTER POSTER SCAVENGER
        const getMasterPoster = (year) => {
          return posters.find(p => {
            const pName = (p.festival_name || "").toLowerCase().trim();
            const fName = (fest.name || "").toLowerCase().trim();
            const pYear = p.date ? new Date(p.date).getFullYear() : null;
            
            // 1. Check Year Match
            if (pYear !== parseInt(year)) return false;
            if (p.poster_type !== 'festival_year') return false;

            // 2. Direct Match (ACL === ACL)
            if (pName === fName) return true;

            // 3. Partial Match (Austin City Limits includes ACL?)
            if (pName.includes(fName) || fName.includes(pName)) return true;

            // 4. Acronym Match (ACL matches first letters of Austin City Limits)
            const acronym = pName.split(/\s+/).map(word => word[0]).join('');
            if (acronym === fName) return true;

            return false;
          })?.image_url;
        };

        const latestPoster = getMasterPoster(yearsSorted[0]);
        const festSlug = `fest-${fest.name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]/g, '')}`;

        return (
          <div key={fest.name} id={festSlug} style={{ marginBottom: 120, scrollMarginTop: '120px' }}>
            
            {/* 🏆 FESTIVAL BOXSET HEADER */}
            <div style={{ 
              display: 'flex', 
              flexDirection: window.innerWidth < 768 ? 'column' : 'row',
              gap: '40px', 
              alignItems: window.innerWidth < 768 ? 'flex-start' : 'center', 
              marginBottom: '60px', 
              borderLeft: `10px solid ${themeColor}`, 
              paddingLeft: '30px',
              position: 'relative'
            }}>
              
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
                  {Object.values(fest.years).flat().length} DAYS ATTENDED // {yearsSorted.length} YEARS ARCHIVED
                </div>
              </div>

              {/* 🖼️ RELATIONAL POSTER (The ACL Fix) */}
              {latestPoster && (
                <div style={{ 
                  width: '200px', 
                  height: '280px', 
                  background: `url(${latestPoster}) center/cover no-repeat`,
                  borderRadius: '4px',
                  boxShadow: `0 30px 60px rgba(0,0,0,0.8), 0 0 20px ${hexToRgba(themeColor, 0.2)}`,
                  border: '1px solid rgba(255,255,255,0.1)',
                  transform: window.innerWidth < 768 ? 'none' : 'rotate(2deg)',
                  flexShrink: 0
                }} />
              )}
            </div>

            {/* 📦 THE YEAR BOX SETS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '80px' }}>
              {yearsSorted.map(yr => {
                const shows = fest.years[yr].sort((a, b) => a.date.localeCompare(b.date));
                const yearPoster = getMasterPoster(yr); // Poster for this specific year

                return (
                  <div key={yr} style={{ 
                    position: 'relative', border: `6px solid ${hexToRgba(themeColor, 0.2)}`, borderRadius: '24px',
                    padding: '80px 40px 40px 40px', background: 'rgba(255,255,255,0.01)',
                    boxShadow: `0 30px 100px rgba(0,0,0,0.5), inset 0 0 50px ${hexToRgba(themeColor, 0.05)}`,
                    overflow: 'visible' 
                  }}>
                    
                    {/* Floating Year Tab */}
                    <div style={{ position: 'absolute', top: '-40px', left: '40px', display: 'flex', alignItems: 'baseline', gap: '15px' }}>
                      <div style={{ background: themeColor, color: '#000', fontFamily: "'Bebas Neue'", fontSize: '4rem', padding: '0 30px', borderRadius: '8px', boxShadow: `0 10px 30px rgba(0,0,0,0.5)` }}>{yr}</div>
                      <div style={{ fontFamily: "'Bebas Neue'", fontSize: '2rem', color: C.white, opacity: 0.5 }}>{fest.name.toUpperCase()}</div>
                    </div>

                    {/* 🟢 NEW: Small poster icon next to the year if multiple years have different posters */}
                    {yearPoster && yearPoster !== latestPoster && (
                       <img src={yearPoster} style={{ position: 'absolute', top: 10, right: 20, height: 60, borderRadius: 2, border: `1px solid ${themeColor}` }} />
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {shows.map((show, idx) => {
                        const dayColor = getDayColor(themeColor, idx);
                        const photos = show.personal_photo_url ? show.personal_photo_url.split(',').map(u => u.trim()).filter(Boolean) : [];
                        const setlists = show.setlist_image_url ? show.setlist_image_url.split(',').map(u => u.trim()).filter(Boolean) : [];
                        const wristband = show.wristband_image_url || null;

                        return (
                          <div key={show.id} onClick={isAdmin ? () => onEdit(show) : null} style={{ width: '100%', background: 'rgba(0,0,0,0.4)', borderRadius: '16px', border: `2px solid ${dayColor}`, overflow: 'visible', cursor: isAdmin ? 'pointer' : 'default', transition: 'all 0.3s ease', display: 'flex', alignItems: 'stretch' }}>
                            <div style={{ width: '8px', background: dayColor, flexShrink: 0 }} />
                            <div style={{ padding: '25px 35px', flex: 1, display: 'flex', flexDirection: window.innerWidth < 768 ? 'column' : 'row', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
                              
                              <div style={{ flex: 1, width: '100%' }}>
                                {wristband && (
                                  <div style={{ marginBottom: 15 }}>
                                    <img src={wristband} alt="Wristband" style={{ width: '100%', maxWidth: '280px', borderRadius: 3, border: `1px solid ${hexToRgba(dayColor, 0.4)}`, boxShadow: `0 4px 15px rgba(0,0,0,0.5)` }} />
                                  </div>
                                )}
                                <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.8rem', color: dayColor, lineHeight: 1 }}>{show.festival_day?.toUpperCase() || `DAY ${idx + 1}`}</div>
                                <div style={{ fontFamily: "'Space Mono'", fontSize: '10px', color: C.gray, marginTop: '5px' }}>{fmtDateShort(show.date)}</div>
                                <div style={{ fontFamily: "'Space Mono'", fontSize: '11px', color: '#fff', lineHeight: 1.5, borderTop: `1px solid ${hexToRgba(dayColor, 0.2)}`, marginTop: '15px', paddingTop: '10px' }}>
                                  {(show.bands || []).map(b => getBandName(b)).filter(Boolean).join(' · ').toUpperCase()}
                                </div>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                {setlists.length > 0 && (
                                  <div style={{ display: 'flex' }}>
                                    {setlists.map((url, sIdx) => <SetlistPaper key={`${show.id}-s-${sIdx}`} src={url} index={sIdx} total={setlists.length} />)}
                                  </div>
                                )}
                                {photos.length > 0 && (
                                  <div style={{ display: 'flex' }}>
                                    {photos.map((url, pIdx) => <PersonalPolaroid 
  src={p.url} 
  caption={p.artist} 
  date={p.date} 
  venue={p.venue} 
  index={i}
  isPublic={p.isPublic}
  shouldBlur={p.shouldBlur}  // Add this
  isAdmin={isAdmin}
  onTogglePrivacy={(e) => {
    e.stopPropagation();
    togglePrivacy(p.url, p.isPublic);
  }}
  onZoom={() => setActivePhoto(p)}
/>)}
                                  </div>
                                )}
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
  onShare, onEdit, onSetGenre, genreMap, isAdmin,
  /* 🟢 NEW BULK PROPS */
  viewingUser, bulkMode, setBulkMode, selectedSignals, setSelectedSignals, onSync 
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
          {/* 📡 MASS ARCHIVE RAIL (Only shown when viewing another curator) */}
          {/* 📡 MASS ARCHIVE RAIL */}
          {viewingUser && (
            <div style={{ 
              background: bulkMode ? hexToRgba(C.gold, 0.1) : 'rgba(255,255,255,0.03)', 
              border: `1px solid ${bulkMode ? C.gold : C.border}`,
              padding: '15px 25px', borderRadius: '12px', marginBottom: '20px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              backdropFilter: 'blur(10px)'
            }}>
              {/* LEFT SIDE: The Arming Button & Status */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <button 
                  onClick={() => { setBulkMode(!bulkMode); setSelectedSignals([]); }}
                  style={{ background: 'none', border: `1px solid ${bulkMode ? C.gold : C.teal}`, color: bulkMode ? C.gold : C.teal, padding: '8px 16px', borderRadius: 4, fontFamily: "'Space Mono'", fontSize: 10, cursor: 'pointer', transition: '0.2s' }}
                >
                  {bulkMode ? '[ ABORT ]' : '[ INITIALIZE BULK SYNC ]'}
                </button>

                {bulkMode && (
                  <div className="fade-in" style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                    <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.5rem', color: C.gold, letterSpacing: '1px' }}>
                      SIGNAL SELECTION ACTIVE
                    </div>
                    <div style={{ fontFamily: "'Space Mono'", fontSize: 10, color: C.gold, fontWeight: 900, opacity: 0.8 }}>
                      // {selectedSignals.length} SIGNALS CAPTURED
                    </div>
                  </div>
                )}
              </div>
              
              {/* RIGHT SIDE: The Commit Button */}
              <div style={{ display: 'flex', gap: 10 }}>
                {bulkMode && selectedSignals.length > 0 && (
                  <button 
                    onClick={onSync}
                    style={{ 
                      background: C.gold, border: 'none', color: '#000', padding: '8px 25px', borderRadius: 4, 
                      fontFamily: "'Bebas Neue'", fontSize: '1.2rem', fontWeight: 900, cursor: 'pointer', 
                      boxShadow: `0 0 25px ${hexToRgba(C.gold, 0.5)}`,
                      animation: 'pulse 2s infinite'
                    }}
                  >
                    COMMIT {selectedSignals.length} SIGNALS
                  </button>
                )}
              </div>
            </div>
          )}

          <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
              <thead>
                <tr style={{ background: C.bgCardAlt }}>
                  {/* 🟢 NEW: Checkbox Column Header */}
                  {bulkMode && viewingUser && <th style={{ width: '40px', borderBottom: `1px solid ${C.border}` }}></th>}
                  
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
                  const isSelected = !!selectedSignals.find(sig => sig.id === s.id);
                  
                  return (
                    <tr 
                      key={`${s.id}-${s.artist}-${i}`} 
                      className={(isAdmin || bulkMode) ? "row-hover" : ""} 
                      onClick={() => {
                        if (isAdmin) onEdit(s);
                        if (bulkMode) {
                          if (isSelected) setSelectedSignals(selectedSignals.filter(sig => sig.id !== s.id));
                          else setSelectedSignals([...selectedSignals, s]);
                        }
                      }}
                      style={{ 
                        borderBottom: `1px solid ${C.border}`, 
                        background: isSelected ? hexToRgba(C.gold, 0.08) : (i % 2 === 1 ? C.bgCardAlt : 'transparent'), 
                        cursor: (isAdmin || bulkMode) ? 'pointer' : 'default',
                        transition: 'background 0.2s'
                      }}
                    >
                      {/* 🟢 NEW: Checkbox Cell */}
                      {bulkMode && viewingUser && (
                        <td style={{ padding: '9px 12px', textAlign: 'center' }}>
                          <div style={{ 
                            width: 16, height: 16, borderRadius: 3, 
                            border: `1.5px solid ${isSelected ? C.gold : C.grayDim}`,
                            background: isSelected ? C.gold : 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.1s'
                          }}>
                            {isSelected && <span style={{ color: '#000', fontSize: '10px', fontWeight: 900 }}>✓</span>}
                          </div>
                        </td>
                      )}

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
  show.wristband_image_url ? (
    <div style={{
      width: '100%',
      maxWidth: '280px',
      borderRadius: 3,
      overflow: 'hidden',
      border: `1px solid ${hexToRgba(rowColor, 0.4)}`,
      boxShadow: `0 4px 15px rgba(0,0,0,0.5)`
    }}>
      <img loading="lazy"
        src={show.wristband_image_url}
        alt="Wristband"
        style={{ width: '100%', height: 'auto', display: 'block' }}
      />
    </div>
  ) : (
    <div style={{ position: 'relative' }}>
      <PhysicalWristband 
        color={rowColor} 
        label={show.festival_name} 
        year={getYear(show.date)} 
        size="small" 
      />
      <div style={{ position: 'absolute', top: -5, right: 10, background: '#000', color: rowColor, border: `1px solid ${rowColor}`, padding: '2px 8px', borderRadius: 2, fontFamily: "'Space Mono'", fontSize: 8, fontWeight: 900, boxShadow: '0 4px 10px rgba(0,0,0,0.5)', zIndex: 10 }}>
        {show.festival_day?.toUpperCase() || 'LIVE'}
      </div>
    </div>
  )
) : hasImg ? (
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
// ─── THE STATION: REGIONAL TERMINAL BOARD ───
function CommunityTab({ onEnterMuseum }) {
  const [curators, setCurators] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCurators() {
      const { data } = await supabase
        .from('profiles')
        .select('username, avatar_color, last_seen, last_artist, last_venue, total_shows, total_sets, total_venues')
        .order('last_seen', { ascending: false });
      if (data) setCurators(data);
      setLoading(false);
    }
    fetchCurators();
  }, []);

  if (loading) return (
    <div style={{ padding: 100, textAlign: 'center' }}>
      <div style={{ fontFamily: "'Space Mono'", fontSize: 10, color: C.purple, letterSpacing: 4 }}>
        [ ESTABLISHING CONNECTION TO REMOTE TERMINALS... ]
      </div>
    </div>
  );

  return (
    <div className="fade-in" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ borderLeft: `4px solid ${C.purple}`, paddingLeft: '25px', marginBottom: '50px', marginTop: '20px' }}>
        <h2 style={{ fontFamily: "'Bebas Neue'", fontSize: '4rem', color: '#fff', margin: 0, letterSpacing: '4px' }}>
          REGIONAL TERMINAL
        </h2>
        <div style={{ fontFamily: "'Space Mono'", fontSize: '11px', color: C.purple, fontWeight: 900, letterSpacing: '3px' }}>
          CONNECTED MUSEUMS // SELECT A SIGNAL TO BOARD
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
        {curators.map((u, i) => {
          const userColor = u.avatar_color || C.teal;
          return (
            <div 
              key={u.username}
              onClick={() => onEnterMuseum(u.username)}
              style={{
                background: '#07070a',
                border: `1px solid ${hexToRgba(C.purple, 0.15)}`,
                padding: '25px 35px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = C.purple;
                e.currentTarget.style.transform = 'translateX(10px)';
                e.currentTarget.style.background = hexToRgba(C.purple, 0.05);
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = hexToRgba(C.purple, 0.15);
                e.currentTarget.style.transform = 'translateX(0)';
                e.currentTarget.style.background = '#07070a';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '40px', zIndex: 2 }}>
                <div style={{ color: C.purple, fontFamily: "'Space Mono'", fontSize: '14px', fontWeight: 900, opacity: 0.5 }}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div>
                  <div style={{ fontFamily: "'Bebas Neue'", fontSize: '2.5rem', color: '#fff', letterSpacing: '2px', lineHeight: 1 }}>
                    {u.username?.toUpperCase()}'S ARCHIVE
                  </div>
                  <div style={{ fontFamily: "'Space Mono'", fontSize: '10px', color: userColor, fontWeight: 900, marginTop: 6, letterSpacing: '1px' }}>
                    LATEST: {u.last_artist?.toUpperCase() || 'UNKNOWN'} @ {u.last_venue?.toUpperCase() || 'PRIVATE STAGE'}
                  </div>
                </div>
              </div>

              {/* 📊 REAL HERO STATS */}
              <div style={{ display: 'flex', gap: 30, textAlign: 'center', zIndex: 2, marginRight: '40px' }}>
                {[
                  { label: 'DAYS', val: u.total_shows || 0, color: C.purple },
                  { label: 'SETS', val: u.total_sets || 0, color: C.teal },
                  { label: 'VENUES', val: u.total_venues || 0, color: C.red }
                ].map(stat => (
                  <div key={stat.label}>
                    <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.8rem', color: stat.color, lineHeight: 1 }}>{stat.val}</div>
                    <div style={{ fontFamily: "'Space Mono'", fontSize: '7px', color: '#fff', opacity: 0.4, letterSpacing: '2px' }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              <div style={{ textAlign: 'right', zIndex: 2 }}>
                <div style={{ fontFamily: "'Space Mono'", fontSize: '11px', color: C.gold, letterSpacing: '2px', fontWeight: 900 }}>
                  BOARDING →
                </div>
              </div>
              
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(rgba(153, 102, 255, 0.02) 50%, transparent 50%)', backgroundSize: '100% 4px', pointerEvents: 'none' }} />
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

// ─── MANAGE TAB (WITH AVATAR UPLOAD) ──────────────────────────────────────────
function ManageTab({ concerts, onEdit, onAdd, onDuplicate, session, onFetchData, setActiveTab }) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const PER = 30;
  const isMobile = window.innerWidth < 768;

  const handleCSVUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target.result;
        const rows = text.split(/\r?\n/).map(r => r.trim()).filter(Boolean);
        const headers = rows[0].split(',').map(h => h.trim().toLowerCase());
        const dataRows = rows.slice(1);
        
        const newShows = dataRows.map(row => {
          const values = row.split(',');
          const entry = {};
          headers.forEach((h, i) => { entry[h] = values[i]; });

          return {
            date: entry.date || null,
            bands: entry.lineup ? entry.lineup.split(';').map(b => b.trim()) : [entry.headliner],
            venue: entry.venue || null,
            city: entry.city || null,
            state: entry.state || null,
            is_festival: entry.is_festival?.toUpperCase() === 'TRUE',
            festival_name: entry.festival_name || null,
          };
        });

        if (newShows.length > 0) {
          const previewShow = newShows[0];
          const msg = `📡 SIGNAL ANALYZED: Found ${newShows.length} total shows.\n\n` +
                      `PREVIEWING FIRST ENTRY:\n` +
                      `Artist: ${previewShow.bands.join(', ')}\n` +
                      `Venue: ${previewShow.venue}\n` +
                      `Date: ${previewShow.date}\n\n` +
                      `Ready to synchronize these to your museum archive?`;

          if (window.confirm(msg)) {
            for (const show of newShows) {
              try {
                const primaryArtist = show.bands[0] || 'Unknown';
                
                const { data: existingShow } = await supabase
                  .from('shows')
                  .select('id')
                  .eq('date', show.date)
                  .ilike('venue', show.venue || 'Unknown')
                  .ilike('artist', primaryArtist)
                  .single();
                
                let showId = existingShow?.id;
                
                if (!showId) {
                  const { data: newShow } = await supabase
                    .from('shows')
                    .insert([{
                      date: show.date,
                      artist: primaryArtist,
                      bands: show.bands,
                      venue: show.venue,
                      city: show.city,
                      state: show.state,
                      is_festival: show.is_festival,
                      festival_name: show.festival_name,
                      genre: 'Indie Rock',
                      created_by: session.user.id
                    }])
                    .select()
                    .single();
                  
                  showId = newShow.id;
                }
                
                await supabase.from('attendances').insert([{
                  user_id: session.user.id,
                  show_id: showId,
                  is_public: true
                }]);
                
              } catch (err) {
                console.error(`Failed to import ${show.bands[0]}:`, err);
              }
            }
            
            alert("✅ ARCHIVE UPDATED: Your historical signals have been curated.");
            if (onFetchData) await onFetchData(); 
            if (setActiveTab) setActiveTab('dashboard');
          }
        }
      } catch (err) {
        console.error("Office sync failed:", err);
        alert("❌ SYNC ERROR: Check your CSV format. " + err.message);
      }
    };
    reader.readAsText(file);
  };
  
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

  const localInputStyle = { 
    background: 'rgba(0,0,0,0.4)', border: `1px solid ${C.border}`, color: '#fff', 
    padding: '12px', borderRadius: '6px', fontFamily: "'Space Mono'", outline: 'none'
  };

  return (
    <div style={{ padding: '24px 0' }} className="fade-in">
      
      {/* 🎨 AVATAR UPLOAD SECTION */}
      <Card neon style={{ marginBottom: 30 }}>
        <CardTitle>YOUR PROFILE AVATAR</CardTitle>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            {session?.user?.user_metadata?.avatar_url ? (
              <div style={{ 
                width: 120, 
                height: 120, 
                borderRadius: '50%', 
                backgroundImage: `url(${session.user.user_metadata.avatar_url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                border: `3px solid ${C.teal}`,
                boxShadow: `0 0 30px ${C.teal}66`
              }} />
            ) : (
              <div style={{ 
                width: 120, 
                height: 120, 
                borderRadius: '50%', 
                background: C.teal,
                border: `3px solid ${C.teal}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'Bebas Neue'",
                fontSize: '3rem',
                color: '#000'
              }}>
                {session?.user?.email?.[0].toUpperCase()}
              </div>
            )}
          </div>
          
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Space Mono'", fontSize: 10, color: C.gray, marginBottom: 10 }}>
              YOUR AVATAR APPEARS IN THE 3D GALAXY VIEW
            </div>
            
            <label style={{ 
              display: 'inline-block',
              background: C.teal, 
              color: '#000', 
              padding: '10px 20px', 
              borderRadius: 6, 
              fontFamily: "'Space Mono'", 
              fontSize: 10, 
              cursor: 'pointer',
              fontWeight: 900
            }}>
              📸 UPLOAD PHOTO
              <input 
                type="file" 
                accept="image/*" 
                hidden 
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  
                  try {
                    const fileExt = file.name.split('.').pop();
                    const fileName = `avatar-${Date.now()}.${fileExt}`;
                    const filePath = `${session.user.id}/${fileName}`;
                    
                    const { error: uploadError } = await supabase.storage
                      .from('avatars')
                      .upload(filePath, file);
                    
                    if (uploadError) throw uploadError;
                    
                    const { data } = supabase.storage
                      .from('avatars')
                      .getPublicUrl(filePath);
                    
                    const { error: updateError } = await supabase
                      .from('profiles')
                      .update({ avatar_url: data.publicUrl })
                      .eq('id', session.user.id);
                    
                    if (updateError) throw updateError;
                    
                    alert('✅ AVATAR UPLOADED! Refresh to see it.');
                    window.location.reload();
                  } catch (err) {
                    alert('Upload failed: ' + err.message);
                  }
                }}
              />
            </label>
          </div>
        </div>
      </Card>

      {/* 🤝 CURATOR ONBOARDING GUIDE */}
      {(!concerts || concerts.length < 50) && (
        <div style={{ 
          background: 'rgba(0, 229, 204, 0.05)', 
          border: `1px dashed ${C.teal}44`, 
          borderRadius: 12, 
          padding: 25, 
          marginBottom: 30
        }}>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.8rem', color: C.teal, marginBottom: 10 }}>
            WELCOME TO THE BACK OFFICE, CURATOR.
          </div>
          <p style={{ fontFamily: "'Space Mono'", fontSize: 11, color: C.gray, lineHeight: 1.6, maxWidth: 600 }}>
            The archive is currently at low capacity. To populate your museum floors quickly, follow the bulk processing protocol below:
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: 20, marginTop: 20 }}>
            {[
              { 
                step: "01", 
                title: "DOWNLOAD BLUEPRINT", 
                desc: "Use our standardized template to organize your history.", 
                action: "GET TEMPLATE", 
                link: "/template.xlsx" 
              },
              { 
                step: "02", 
                title: "COMPILE DATA", 
                desc: "Ensure dates are YYYY-MM-DD and lineups use semicolons.", 
                action: "VIEW GUIDE", 
                isAction: true,
                onClick: () => alert(
                  "📝 CURATOR'S COMPILATION GUIDE:\n\n" +
                  "1. DATE: Use YYYY-MM-DD (Ex: 2026-04-17)\n" +
                  "2. LINEUP: Use a semicolon (;) to separate bands (Ex: Eggy; Tapers Choice)\n" +
                  "3. FESTIVALS: Write 'TRUE' in the is_festival column to unlock a Stamp.\n" +
                  "4. SAVE: Export as .CSV (Comma Separated Values) before uploading."
                )
              },
              { 
                step: "03", 
                title: "SYNC SIGNALS", 
                desc: "Upload your finalized .CSV file to initialize the museum.", 
                action: "READY TO SYNC", 
                trigger: true 
              }
            ].map((item, i) => (
              <div key={i} style={{ background: 'rgba(0,0,0,0.3)', padding: 15, borderRadius: 8, border: `1px solid ${C.border}` }}>
                <div style={{ fontFamily: "'Space Mono'", fontSize: 10, color: C.teal, fontWeight: 900, marginBottom: 5 }}>{item.step}</div>
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.1rem', color: '#fff' }}>{item.title}</div>
                <div style={{ fontFamily: "'Space Mono'", fontSize: 8, color: C.grayDim, margin: '8px 0 12px' }}>{item.desc}</div>
                
                {item.trigger ? (
                  <label style={{ cursor: 'pointer', color: C.gold, fontSize: 9, fontFamily: "'Space Mono'", fontWeight: 900 }}>
                     [ INITIALIZE UPLOAD ]
                     <input type="file" accept=".csv" hidden onChange={handleCSVUpload} />
                  </label>
                ) : item.isAction ? (
                  <button 
                    onClick={item.onClick}
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: C.teal, fontSize: 9, fontFamily: "'Space Mono'", fontWeight: 900, textAlign: 'left' }}
                  >
                    [ {item.action} ]
                  </button>
                ) : (
                  <a 
                    href={item.link} 
                    download 
                    style={{ textDecoration: 'none', color: C.teal, fontSize: 9, fontFamily: "'Space Mono'", fontWeight: 900 }}
                  >
                    [ {item.action} ]
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Standard Table Controls */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <input 
          style={{ ...localInputStyle, flex: 1 }} 
          placeholder="Search existing records..." 
          value={search} 
          onChange={e => { setSearch(e.target.value); setPage(1); }} 
        />
        <Btn onClick={onAdd}>+ Add Single Entry</Btn>
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
                  {(c.bands || []).slice(0, 3).map(b => getBandName(b)).join(', ')}
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
        <form onSubmit={(e) => {
  e.preventDefault();
  setSaving(true);
  onSave(show?.id, form);
}}>
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
// --- PHOTO VAULT TAB (MULTI-MEDIA UPGRADE + PRIVACY) ---
function PhotoVaultTab({ concerts, shouldBlurPhoto, currentUserId }) {
  const safeConcerts = Array.isArray(concerts) ? concerts : [];
  
  // Local state to handle the Lightbox
  const [activePhoto, setActivePhoto] = React.useState(null);
  const isAdmin = !!currentUserId;

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
        rotation: startRotation,
        shouldBlur: shouldBlurPhoto(url)
      });
    });
  });
  return results.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
}, [safeConcerts, shouldBlurPhoto]);

  // Toggle privacy for a photo
const togglePrivacy = async (url, currentState) => {
  console.log('=== TOGGLE PRIVACY DEBUG ===');
  console.log('URL:', url);
  console.log('Current state:', currentState);
  
  const { data: { session } } = await supabase.auth.getSession();
  console.log('User ID:', session?.user?.id);
  
  if (!session?.user?.id) {
    alert('You must be logged in to change privacy settings');
    return;
  }

  const newState = !currentState;
  console.log('Attempting to update to:', newState);

  // Use RPC function to bypass RLS
  const { data: updateData, error: updateError } = await supabase.rpc('toggle_artifact_privacy', {
    p_image_url: url,
    p_new_state: newState
  });

  console.log('Update data:', updateData);
  console.log('Update error:', updateError);

  if (!updateError) {
window.location.reload();
    console.log('✅ Privacy updated successfully');
  } else {
    console.error('❌ Privacy toggle error:', updateError);
    alert(`Failed to update privacy: ${updateError.message}\n\nCheck console for details.`);
  }
};

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
          >
            <PersonalPolaroid 
  src={p.url} 
  caption={p.artist} 
  date={p.date} 
  venue={p.venue} 
  index={i}
  isPublic={!p.shouldBlur}
  shouldBlur={p.shouldBlur}
  isAdmin={isAdmin}
  onTogglePrivacy={(e) => {
    e.stopPropagation();
    togglePrivacy(p.url, !p.shouldBlur);
  }}
  onZoom={() => setActivePhoto(p)}
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
const TAB_GROUPS = [
  {
    header: "YOUR ARCHIVE",
    tabs: [
      ['dashboard', '⚡ CENTER STAGE', '#00e5cc'],
      ['byDay', '📅 PAPER TRAIL', '#00e5cc'],
      ['timeline', '⏳ TIME MACHINE', '#00cfff'],
      ['venues', '📍 STAGE DOOR', '#00cfff'],
    ]
  },
  {
    header: "BROWSE",
    tabs: [
      ['browse', '🔍 DIGGING', '#00cfff'],
      ['hof', '🏆 HEAVY ROTATION', '#9966ff'],
    ]
  },
  {
    header: "FESTIVAL SEASON",
    tabs: [
      ['passport', '🗺️ STAMP BOOK', '#ffcc00'],
      ['byFest', '🎪 BOX SETS', '#ffcc00'],
    ]
  },
  {
    header: "COLLECTION",
    tabs: [
      ['vault', '📋 RELICS', '#00cc88'],
      ['photos', '📸 POLAROIDS', '#9966ff'],
      ['stubs', '🎟️ STUB CASE', '#ffcc00'],
      ['posterwall', '🎨 POSTER WALL', '#ff6699'],
    ]
  },
  {
    header: "COMMUNITY",
    tabs: [
      ['community', '🚉 THE STATION', '#9966ff'],
      ['shows', '🤝 SHARED SHOWS', '#ffcc00'],
      ['poster', '🎨 GIG POSTER', '#ff6699'],
    ]
  },
];

const RIGHT_TABS = [
  ['manage', '⚙️ THE OFFICE', '#888'],
  ['tagger', '🏷️ RELIC TAGGER', '#ffcc00'],
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

// ─── EDIT MODAL (ARTIFACT-AWARE EDITION) ─────────────────────────────────────
// Replace your entire EditModal function with this

function EditModal({ concert, onClose, onSave, onDelete, allConcerts = [] }) {
  const isMobile = window.innerWidth < 768;

  const initialState = {
    date: '', 
    artist: '', 
    venue: '', 
    city: '', 
    state: '',
    bands: [], 
    is_festival: false, 
    festival_name: '',
    image_url: '', 
    personal_photo_url: '', 
    setlist_image_url: '', 
    festival_poster_url: '',
    wristband_image_url: ''
  };

  const [form, setForm] = useState(initialState);
  const [uploading, setUploading] = useState(false);
const [entryStep, setEntryStep] = useState('form');
  const [photoPrivacySettings, setPhotoPrivacySettings] = useState({});
  
  // NEW: Track band assignments for relics
  const [relicBandSelections, setRelicBandSelections] = useState({});
  const [showRelicBandPicker, setShowRelicBandPicker] = useState(null);

  const getHomeTurf = () => {
    if (allConcerts.length === 0) return { city: '', state: '' };
    const last = allConcerts[0];
    return { city: last.city || '', state: last.state || '' };
  };

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

      if (!prev.is_festival && k === 'artist') {
         if (newForm.bands.length <= 1) {
            newForm.bands = [{ name: v, genre: prev.bands[0]?.genre || 'Indie Rock' }];
         }
      }

      return newForm;
    });
  };

  async function uploadToArchive(file, type) {
    if (!file) return null;
    setUploading(true);
    
    if (type === 'POLAROID' || type === 'TICKET') {
      try {
        if (typeof EXIF !== 'undefined') {
          await new Promise((resolve) => {
            EXIF.getData(file, function() {
              const rawDate = EXIF.getTag(this, "DateTimeOriginal"); 
              if (rawDate) {
                const extractedDate = rawDate.split(' ')[0].replace(/:/g, '-');
                setForm(prev => prev.date ? prev : { ...prev, date: extractedDate });
              }
              resolve();
            });
          });
        }
      } catch (e) { console.log("📡 NO EXIF"); }
    }

    const bucketMap = { 
      'TICKET': 'Ticket Stubs', 
      'SETLIST': 'setlists', 
      'POLAROID': 'polaroids', 
      'POSTER': 'Posters', 
      'WRISTBAND': 'Wristbands' 
    };
    
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

  // NEW: Handle relic upload with band selection
  async function handleRelicUpload(files) {
    const urls = [];
    for (const file of files) {
      const url = await uploadToArchive(file, 'SETLIST');
      if (url) urls.push(url);
    }
    
    if (urls.length > 0) {
      const existing = form.setlist_image_url ? form.setlist_image_url.split(',').map(s => s.trim()).filter(Boolean) : [];
      const allUrls = [...existing, ...urls];
      set('setlist_image_url', allUrls.join(', '));
      
      // If festival with multiple bands, ask which band for each new relic
      if (form.is_festival && form.bands.length > 1) {
        // Show picker for the first new URL
        setShowRelicBandPicker(urls[0]);
      } else if (!form.is_festival && form.bands.length > 0) {
        // Solo show - auto-assign to headliner
        const newSelections = {};
        urls.forEach(url => {
          newSelections[url] = form.bands[0].name;
        });
        setRelicBandSelections(prev => ({ ...prev, ...newSelections }));
      }
    }
  }

  const handlePosterDirectUpload = async (file) => {
    if (!file) return;
    if (!form.date) return alert("DATE REQUIRED: Set a show date before pinning a poster.");
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return alert("SESSION EXPIRED // RE-LOGIN REQUIRED");

    const url = await uploadToArchive(file, 'POSTER');
    
    if (url) {
      const insertData = {
        image_url: url,
        poster_type: form.is_festival ? 'festival_year' : 'artist',
        artist: form.artist || (form.bands?.[0]?.name) || 'Unknown Artist',
        festival_name: form.festival_name || '',
        date: form.date,
        venue: form.venue || 'Unknown Venue',
        city: form.city || '',
        state: form.state || '',
        user_id: session.user.id,
        is_public: true,
      };

      const { error } = await supabase.from('posters').insert([insertData]);

      if (error) {
        console.error("Poster save error:", error);
        alert(`POSTER SYNC FAILED: ${error.message || 'Database connection error'}`);
      } else {
        console.log("✅ POSTER PINNED");
        onClose(); 
      }
    }
  };

  // NEW: Enhanced save that writes to BOTH old fields AND artifacts table
  const handleSave = async () => {
    const showId = (concert && concert !== 'new') ? concert.id : null;
    
    // 1. Save to shows table (old way - keeps existing code working)
    await onSave(showId, form);
    
    // 2. Get the show ID (either existing or newly created)
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return;
    
    let targetShowId = showId;
    
    // If new show, we need to get its ID after creation
    if (!showId) {
      // Query for the show we just created
      const { data: newShow } = await supabase
        .from('shows')
        .select('id')
        .eq('date', form.date)
        .eq('venue', form.venue)
        .eq('created_by', session.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (newShow) targetShowId = newShow.id;
    }
    
    if (!targetShowId) {
      console.error("No show ID - artifacts not saved");
      return;
    }
    
    // 3. Save artifacts to artifacts table
    const artifactsToInsert = [];
    
    // Stubs
    if (form.image_url) {
      form.image_url.split(',').forEach(url => {
        if (url.trim()) {
          artifactsToInsert.push({
            user_id: session.user.id,
            show_id: targetShowId,
            artifact_type: 'stub',
            image_url: url.trim(),
            band_name: form.is_festival ? null : (form.bands[0]?.name || null),
            is_public: true
          });
        }
      });
    }
    
    // Photos
    if (form.personal_photo_url) {
  form.personal_photo_url.split(',').forEach(url => {
    if (url.trim()) {
      const isPublic = photoPrivacySettings[url.trim()] !== false; // Default to true if not set
      artifactsToInsert.push({
        user_id: session.user.id,
        show_id: targetShowId,
        artifact_type: 'photo',
        image_url: url.trim(),
        band_name: form.is_festival ? null : (form.bands[0]?.name || null),
        is_public: isPublic  // Changed from hardcoded true
      });
    }
  });

    }
    
    // Relics (with band selection)
    if (form.setlist_image_url) {
      form.setlist_image_url.split(',').forEach(url => {
        if (url.trim()) {
          const bandName = relicBandSelections[url.trim()] || (form.is_festival ? null : (form.bands[0]?.name || null));
          artifactsToInsert.push({
            user_id: session.user.id,
            show_id: targetShowId,
            artifact_type: 'relic',
            image_url: url.trim(),
            band_name: bandName,
            is_public: true
          });
        }
      });
    }
    
    // Wristband
    if (form.wristband_image_url && form.wristband_image_url.trim()) {
      artifactsToInsert.push({
        user_id: session.user.id,
        show_id: targetShowId,
        artifact_type: 'wristband',
        image_url: form.wristband_image_url.trim(),
        band_name: null,
        is_public: true
      });
    }
    
    // Insert all artifacts
    if (artifactsToInsert.length > 0) {
      const { error: artifactError } = await supabase
        .from('artifacts')
        .upsert(artifactsToInsert, { 
          onConflict: 'user_id,show_id,artifact_type,image_url',
          ignoreDuplicates: true 
        });
      
      if (artifactError) {
        console.error("Artifact save error:", artifactError);
      } else {
        console.log(`✅ ${artifactsToInsert.length} artifacts saved`);
      }
    }
  };

  useEffect(() => {
    if (concert && concert !== 'new') {
      let loadedBands = [];
      if (Array.isArray(concert.bands) && concert.bands.length > 0) {
        loadedBands = concert.bands.map(b => {
          if (typeof b === 'string') return { name: b, genre: concert.genre || 'Indie Rock' };
          if (typeof b === 'object' && b.name) return b;
          return { name: '', genre: 'Indie Rock' };
        });
      } else if (concert.artist) {
        loadedBands = [{ name: concert.artist, genre: concert.genre || 'Indie Rock' }];
      }

      setForm({ 
        ...initialState, 
        ...concert, 
        artist: loadedBands[0]?.name || concert.artist || '', 
        bands: loadedBands 
      });
    } else {
      const turf = getHomeTurf();
      setForm({ ...initialState, city: turf.city, state: turf.state, bands: [{ name: '', genre: 'Indie Rock' }] });
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
                    {k:'image_url', l:'STUB', i:'🎟️', id:'e-stub', t:'TICKET', multi: true}, 
                    {k:'personal_photo_url', l:'PHOTO', i:'📸', id:'e-pic', t:'POLAROID', multi: true, needsPrivacy: true}, 
                    {k:'setlist_image_url', l:'RELIC', i:'🏺', id:'e-set', t:'SETLIST', multi: true, handler: handleRelicUpload}, 
                    ...(form.is_festival ? [{k:'wristband_image_url', l:'WRISTBAND', i:'🎫', id:'e-wrist', t:'WRISTBAND', multi: false}] : [])
                  ].map(item => {
                    const count = item.multi && form[item.k] ? form[item.k].split(',').filter(Boolean).length : 0;
                    const hasAny = form[item.k] && form[item.k] !== '';
                    
                    return (
                      <div key={item.k} onClick={() => document.getElementById(item.id).click()} style={{ background: hasAny ? '#00cc8811' : '#000', padding: 15, borderRadius: 8, border: `1px solid ${hasAny ? '#00cc88' : '#222'}`, textAlign: 'center', cursor: 'pointer' }}>
                        <div style={{ fontSize: '1.2rem' }}>{hasAny ? '✅' : item.i}</div>
                        <div style={{ fontSize: 7, marginTop: 5, color: '#666' }}>{item.l}</div>
                        {item.multi && count > 0 && (
                          <div style={{ fontSize: 6, marginTop: 3, color: '#00cc88', fontFamily: "'Space Mono'" }}>
                            {count} UPLOADED
                          </div>
                        )}
                        <input 
                          id={item.id} 
                          type="file" 
                          multiple={item.multi}
                          hidden 
                          onChange={async (e) => {
  console.log('Upload triggered for:', item.k, item.t);
  
  // Use custom handler for relics
  if (item.handler) {
    await item.handler(Array.from(e.target.files));
    return;
  }
  
  // Default handler for other types
  if (item.multi) {
    const files = Array.from(e.target.files);
    console.log('Files selected:', files.length);
    const urls = [];
    
    // If photos need privacy setting, handle specially
    if (item.needsPrivacy) {
      console.log('Photo upload detected');
      for (const file of files) {
        const url = await uploadToArchive(file, item.t);
        console.log('Photo uploaded, URL:', url);
        if (url) {
          urls.push(url);
          // Default to public
          setPhotoPrivacySettings(prev => ({ 
            ...prev, 
            [url]: true 
          }));
        }
      }
      
      if (urls.length > 0) {
        const existing = form[item.k] ? form[item.k].split(',').map(s => s.trim()).filter(Boolean) : [];
        const newValue = [...existing, ...urls].join(', ');
        console.log('Setting photo URLs:', newValue);
        set(item.k, newValue);
      }
    } else {
      // Non-photo artifacts
      for (const file of files) {
        const url = await uploadToArchive(file, item.t);
        if (url) urls.push(url);
      }
      if (urls.length > 0) {
        const existing = form[item.k] ? form[item.k].split(',').map(s => s.trim()).filter(Boolean) : [];
        set(item.k, [...existing, ...urls].join(', '));
      }
    }
  } else {
    const url = await uploadToArchive(e.target.files[0], item.t);
    if (url) set(item.k, url);
  }
}}
                          
                        />
                      </div>
                    );
                  })}
                </div>

                {/* NEW: Photo Privacy Toggles */}
                {form.personal_photo_url && form.personal_photo_url.trim() && (
                  <div style={{
                    background: 'rgba(100,100,255,0.05)',
                    border: '1px solid rgba(100,100,255,0.3)',
                    borderRadius: 8,
                    padding: 12,
                    marginTop: 10
                  }}>
                    <div style={{
                      fontFamily: "'Space Mono'",
                      fontSize: 8,
                      color: '#8888ff',
                      marginBottom: 10,
                      letterSpacing: 1
                    }}>
                      📸 PHOTO PRIVACY SETTINGS
                    </div>
                    {form.personal_photo_url.split(',').map((url, idx) => {
                      const trimmedUrl = url.trim();
                      if (!trimmedUrl) return null;
                      const isPublic = photoPrivacySettings[trimmedUrl] !== false;
                      
                      return (
                        <div key={idx} style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px',
                          background: '#000',
                          borderRadius: 6,
                          marginBottom: 8,
                          border: `1px solid ${isPublic ? '#00cc88' : '#ff4444'}`
                        }}>
                          <div style={{
                            fontFamily: "'Space Mono'",
                            fontSize: 8,
                            color: '#999',
                            flex: 1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            marginRight: 10
                          }}>
                            Photo {idx + 1}
                          </div>
                          <button
                            onClick={() => {
                              setPhotoPrivacySettings(prev => ({
                                ...prev,
                                [trimmedUrl]: !isPublic
                              }));
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                              padding: '6px 12px',
                              background: isPublic ? 'rgba(0,204,136,0.1)' : 'rgba(255,68,68,0.1)',
                              border: `1px solid ${isPublic ? '#00cc88' : '#ff4444'}`,
                              borderRadius: 6,
                              color: isPublic ? '#00cc88' : '#ff4444',
                              fontFamily: "'Space Mono'",
                              fontSize: 8,
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                          >
                            <span>{isPublic ? '🔓' : '🔒'}</span>
                            <span>{isPublic ? 'PUBLIC' : 'PRIVATE'}</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* NEW: Relic band picker */}
                {showRelicBandPicker && form.is_festival && form.bands.length > 1 && (
                  <div style={{ 
                    background: hexToRgba(C.gold, 0.1), 
                    border: `1px solid ${C.gold}`, 
                    borderRadius: 8, 
                    padding: 12 
                  }}>
                    <div style={{ 
                      fontFamily: "'Space Mono'", 
                      fontSize: 8, 
                      color: C.gold, 
                      marginBottom: 8, 
                      letterSpacing: 2 
                    }}>
                      WHICH BAND IS THIS SETLIST FOR?
                    </div>
                    <select
                      value={relicBandSelections[showRelicBandPicker] || ''}
                      onChange={e => {
                        setRelicBandSelections(prev => ({
                          ...prev,
                          [showRelicBandPicker]: e.target.value
                        }));
                        setShowRelicBandPicker(null);
                      }}
                      style={{
                        width: '100%',
                        background: '#000',
                        border: `1px solid ${C.teal}`,
                        color: '#fff',
                        padding: 10,
                        borderRadius: 6,
                        fontFamily: "'Space Mono'",
                        fontSize: 10
                      }}
                    >
                      <option value="">Select band...</option>
                      {form.bands.map((band, i) => (
                        <option key={i} value={band.name}>
                          {band.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Poster upload */}
                <div style={{ marginTop: 10 }}>
                  <label style={{ 
                    width: '100%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    gap: '10px',
                    padding: '12px', 
                    background: 'rgba(255, 102, 153, 0.1)', 
                    border: '1px dashed #ff6699', 
                    color: '#ff6699', 
                    borderRadius: 8, 
                    fontFamily: "'Space Mono'", 
                    fontSize: 10, 
                    cursor: 'pointer',
                    transition: '0.2s'
                  }}>
                    <span>{uploading ? '📡 UPLOADING SIGNAL...' : '🎨 PIN POSTER TO WALL'}</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      hidden 
                      disabled={uploading || !form.date} 
                      onChange={(e) => handlePosterDirectUpload(e.target.files[0])} 
                    />
                  </label>
                  {!form.date && (
                    <div style={{ fontSize: 7, color: '#666', textAlign: 'center', marginTop: 5 }}>
                      [ DATE REQUIRED TO ANCHOR POSTER ]
                    </div>
                  )}
                </div>

                {/* Save/Delete buttons */}
                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <button 
                    onClick={handleSave}
                    disabled={uploading} 
                    style={{ width: '100%', padding: '18px', background: uploading ? '#222' : C.teal, color: '#000', borderRadius: '8px', fontFamily: "'Bebas Neue'", fontSize: '1.5rem', cursor: uploading ? 'not-allowed' : 'pointer' }}
                  >
                    {uploading ? 'SYNCING...' : 'COMMIT TO ARCHIVE'}
                  </button>
                  {concert !== 'new' && (
                    <button 
                      onClick={() => onDelete(concert.id)} 
                      style={{ background: 'none', border: '1px solid #441111', color: '#ff4444', padding: '10px', borderRadius: '6px', fontSize: '9px', cursor: 'pointer' }}
                    >
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

// 🟢 Helper 1: Navigation Button Styling
// This handles the "Active" glow and color switching for the Terminal row
const navBtnStyle = (isActive, color) => ({
  background: isActive ? color : 'transparent',
  border: `1px solid ${color}`,
  color: isActive ? '#000' : color,
  padding: '6px 12px',
  borderRadius: '6px',
  fontFamily: "'Space Mono'",
  fontSize: '10px',
  fontWeight: 900,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  transition: 'all 0.2s',
  boxShadow: isActive ? `0 0 15px ${color}66` : 'none',
  letterSpacing: '1px'
});

// 🟢 Helper 4: The Live System Ticker
// This creates the scrolling "Pulse" at the very top of the header
const LiveTicker = ({ upcoming }) => {
  const tickerText = useMemo(() => {
    if (!upcoming || upcoming.length === 0) return "SYSTEM ONLINE // STANDBY FOR SIGNALS // ARCHIVE READY";
    return upcoming.map(s => 
      `UPCOMING: ${s.bands?.[0] || s.artist} @ ${s.venue} — ${s.date}`
    ).join(' // ');
  }, [upcoming]);

  return (
    <div style={{ whiteSpace: 'nowrap', display: 'flex' }}>
      <style>
        {`
          @keyframes scrollTicker {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}
      </style>
      <div style={{
        display: 'inline-block',
        paddingLeft: '100%',
        animation: 'scrollTicker 30s linear infinite',
        fontFamily: "'Space Mono'",
        fontSize: '9px',
        color: C.teal,
        letterSpacing: '2px',
        fontWeight: 900,
        textTransform: 'uppercase'
      }}>
        {tickerText} // {tickerText}
      </div>
    </div>
  );
};


// 🟢 Helper 2: Standard Hero Stat Block
// The "muscle" of the header - showing DAYS, ACTS, and SETS
const StatBlock = ({ value, label, color, onClick }) => (
  <div onClick={onClick} style={{ 
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
    background: '#050508', cursor: 'pointer', position: 'relative', transition: 'all 0.2s'
  }}>
    <div style={{ position: 'absolute', bottom: 0, left: '10%', right: '10%', height: '2px', background: color, boxShadow: `0 0 10px ${color}` }} />
    <div style={{ fontFamily: "'Bebas Neue'", fontSize: '2.2rem', color, lineHeight: 1 }}>{value}</div>
    <div style={{ fontFamily: "'Space Mono'", fontSize: '8px', color: '#fff', opacity: 0.5, letterSpacing: '2px', marginTop: 4 }}>{label}</div>
  </div>
);

// 🟢 Helper 3: The Artifact Quadrant (The 4-Way Square)
// This packs 4 metrics into the space of 1 Hero block
const QuadStat = ({ val, label, color }) => (
  <div style={{ 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center', 
    background: hexToRgba(color, 0.1), // Slightly more background tint
    borderRadius: 4, 
    padding: '4px',
    border: `1px solid ${hexToRgba(color, 0.2)}` // Subtle individual borders
  }}>
    <div style={{ 
      color, 
      fontSize: '1.2rem', // 🟢 BUMPED from 11px
      fontFamily: "'Bebas Neue'", 
      lineHeight: 1,
      textShadow: `0 0 10px ${hexToRgba(color, 0.3)}` 
    }}>{val}</div>
    <div style={{ 
      color: '#fff', 
      fontSize: '7px', // 🟢 BUMPED from 5px
      fontFamily: "'Space Mono'", 
      opacity: 0.6, 
      fontWeight: 900,
      letterSpacing: '1px'
    }}>{label}</div>
  </div>
);

function PosterWallTab({ posters, concerts, isAdmin, onRefresh }) {
  const [selected, setSelected] = useState(null);
  const [typeFilter, setTypeFilter] = useState('all');
  const [showUpload, setShowUpload] = useState(false);
  const [spotlight, setSpotlight] = useState({ x: 50, y: 0 });

  const ACCENT = '#ff6699';

  const filtered = useMemo(() => {
    let list = [...posters];
    if (typeFilter === 'artist') list = list.filter(p => p.poster_type === 'artist');
    if (typeFilter === 'festival') list = list.filter(p => p.poster_type === 'festival_year' || p.poster_type === 'festival_day');
    return list;
  }, [posters, typeFilter]);

  const [layout, setLayout] = useState([]);
  useEffect(() => {
    setLayout(filtered.map((p) => ({
      ...p,
      rotation: (Math.random() * 16) - 8,
      scale: 0.85 + (Math.random() * 0.3),
      depth: Math.random(),
    })));
  }, [filtered]);

  const getLabel = (p) => {
    if (!p) return '';
    if (p.poster_type === 'festival_year') return p.festival_name;
    if (p.poster_type === 'festival_day') return p.artist || p.festival_day || p.festival_name;
    return p.artist;
  };

  const getMatchedWristband = (poster) => {
    if (poster.poster_type !== 'festival_year' || !poster.festival_name) return null;
    const festYear = getYear(poster.date);
    const match = concerts.find(c =>
      c.festival_name === poster.festival_name &&
      getYear(c.date) === festYear &&
      c.wristband_image_url
    );
    return match?.wristband_image_url || null;
  };

  const getDetailLines = (p) => {
    if (!p) return [];
    const lines = [];
    if (p.poster_type === 'festival_year') {
      const festYear = getYear(p.date);
      const days = concerts.filter(c =>
        c.festival_name === p.festival_name && getYear(c.date) === festYear
      ).sort((a, b) => a.date.localeCompare(b.date));
      days.forEach(d => {
        const bands = (d.bands || []).map(b => getBandName(b)).filter(Boolean);
        lines.push({ day: d.festival_day || fmtDateShort(d.date), bands });
      });
    }
    return lines;
  };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setSpotlight({ x, y });
  };

  const filterBtnStyle = (active, color = ACCENT) => ({
    background: active ? color : 'rgba(0,0,0,0.7)',
    border: `1px solid ${active ? color : '#555'}`,
    color: active ? '#000' : '#fff',
    fontFamily: "'Space Mono'",
    fontSize: 9,
    padding: '5px 12px',
    borderRadius: 4,
    cursor: 'pointer',
    fontWeight: active ? 900 : 400,
    transition: 'all 0.15s',
    backdropFilter: 'blur(4px)'
  });

  return (
    <div
      onMouseMove={handleMouseMove}
      style={{ position: 'relative', minHeight: '100vh', background: '#0d0905', overflow: 'hidden' }}
    >
      <style>{`
        @keyframes posterDrop {
          0% { opacity: 0; transform: translateY(-30px) scale(var(--scale)) rotate(var(--rot)); }
          70% { opacity: 1; transform: translateY(3px) scale(var(--scale)) rotate(var(--rot)); }
          100% { opacity: 1; transform: translateY(0) scale(var(--scale)) rotate(var(--rot)); }
        }
        .poster-card:hover { z-index: 100 !important; }
      `}</style>

      {/* BRICK WALL BACKGROUND */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundColor: '#8B3A2B',
          backgroundImage: `url("https://www.transparenttextures.com/patterns/brick-wall.png")`,
          backgroundRepeat: 'repeat',
          filter: 'brightness(1.1) contrast(1.2) saturate(1.4)',
          opacity: 1
        }} />
        
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(ellipse 700px 600px at ${spotlight.x}% ${spotlight.y}%, rgba(255,220,120,0.3) 0%, rgba(255,180,100,0.2) 25%, rgba(255,140,80,0.1) 50%, transparent 75%)`,
          transition: 'background 0.2s ease',
          pointerEvents: 'none',
          mixBlendMode: 'screen'
        }} />
      </div>
      
      {/* HEADER - MINIMAL */}
      <div style={{ 
        position: 'relative', 
        zIndex: 10, 
        padding: '20px 40px 15px',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 60%, transparent 100%)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 15 }}>
          <div>
            <div style={{ fontFamily: "'Space Mono'", fontSize: 8, color: ACCENT, letterSpacing: 4, marginBottom: 6 }}>
              GALLERY // {filtered.length} ON THE WALL
            </div>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: '3.5rem', color: '#fff', lineHeight: 0.9, letterSpacing: 2 }}>
              POSTER <span style={{ color: ACCENT }}>WALL</span>
            </div>
          </div>
          
          {/* SIMPLE 3-BUTTON FILTER */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button style={filterBtnStyle(typeFilter === 'all')} onClick={() => setTypeFilter('all')}>ALL</button>
            <button style={filterBtnStyle(typeFilter === 'artist')} onClick={() => setTypeFilter('artist')}>SOLO</button>
            <button style={filterBtnStyle(typeFilter === 'festival')} onClick={() => setTypeFilter('festival')}>FESTIVAL</button>
            {isAdmin && (
              <button onClick={() => setShowUpload(true)} style={{
                background: ACCENT, border: 'none', color: '#000',
                fontFamily: "'Bebas Neue'", fontSize: '1rem', letterSpacing: 1,
                padding: '6px 16px', borderRadius: 4, cursor: 'pointer', fontWeight: 900, marginLeft: 8
              }}>+ POSTER</button>
            )}
          </div>
        </div>
      </div>

      {/* THE WALL */}
      <div style={{
        position: 'relative', zIndex: 5,
        columnCount: 3,
        columnGap: '20px',
        padding: '20px 40px 80px',
      }}>
        {layout.map((poster, idx) => {
          const wristband = getMatchedWristband(poster);
          const shadowIntensity = poster.depth;
          
          return (
            <div
              key={poster.id}
              className="poster-card"
              onClick={() => setSelected(poster)}
              style={{
                display: 'inline-block',
                width: '100%',
                marginBottom: '24px',
                breakInside: 'avoid',
                '--rot': `${poster.rotation}deg`,
                '--scale': poster.scale,
                transform: `rotate(${poster.rotation}deg) scale(${poster.scale})`,
                animation: `posterDrop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${idx * 0.04}s both`,
                cursor: 'zoom-in',
                position: 'relative',
                transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = `rotate(0deg) scale(${poster.scale * 1.08}) translateY(-8px)`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = `rotate(${poster.rotation}deg) scale(${poster.scale})`;
              }}
            >
              <img
                loading="lazy"
                src={poster.image_url}
                alt={getLabel(poster)}
                style={{
                  display: 'block',
                  width: '100%',
                  height: 'auto',
                  boxShadow: `0 ${10 + shadowIntensity * 40}px ${30 + shadowIntensity * 70}px rgba(0,0,0,${0.7 + shadowIntensity * 0.3}), 0 4px 12px rgba(0,0,0,0.7)`,
                }}
              />

              {wristband && (
                <img
                  loading="lazy"
                  src={wristband}
                  alt="wristband"
                  style={{
                    display: 'block',
                    width: '100%',
                    height: 'auto',
                    marginTop: 4,
                    boxShadow: '0 4px 15px rgba(0,0,0,0.7)',
                    border: `1px solid rgba(255,102,153,0.2)`
                  }}
                />
              )}

              <div style={{
                background: 'rgba(0,0,0,0.88)',
                padding: '7px 10px',
                backdropFilter: 'blur(6px)',
              }}>
                <div style={{
                  fontFamily: "'Space Mono'",
                  fontSize: 8,
                  color: ACCENT,
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {getLabel(poster)}
                </div>
                <div style={{ fontFamily: "'Space Mono'", fontSize: 7, color: '#444', marginTop: 2 }}>
                  {fmtDateShort(poster.date)}
                </div>
              </div>
            </div>
          );
        })}

        {posters.length === 0 && (
          <div style={{ columnSpan: 'all', padding: '100px 0', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: 20 }}>🎨</div>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: '2rem', letterSpacing: 3, color: '#fff' }}>WALL IS BARE</div>
            <div style={{ fontFamily: "'Space Mono'", fontSize: 9, marginTop: 10, color: '#555' }}>START UPLOADING YOUR POSTER COLLECTION</div>
          </div>
        )}
      </div>

      {/* LIGHTBOX */}
      {selected && (
        <div
          onClick={() => setSelected(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 20000,
            background: 'rgba(0,0,0,0.96)',
            backdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'zoom-out', padding: 40,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ display: 'flex', gap: 40, alignItems: 'flex-start', maxWidth: '90vw', cursor: 'default' }}
          >
            <img
              src={selected.image_url}
              alt={getLabel(selected)}
              style={{
                maxWidth: '55vw',
                maxHeight: '80vh',
                objectFit: 'contain',
                boxShadow: '0 40px 100px rgba(0,0,0,1), 0 0 60px rgba(255,102,153,0.2)',
              }}
            />

            <div style={{ minWidth: 260, maxWidth: 320, paddingTop: 10 }}>
              <div style={{ fontFamily: "'Space Mono'", fontSize: 7, color: ACCENT, letterSpacing: 3, marginBottom: 10 }}>
                {selected.poster_type === 'festival_year' ? 'FESTIVAL POSTER' : selected.poster_type === 'festival_day' ? 'FESTIVAL DAY' : 'ARTIST POSTER'}
              </div>
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: '2.8rem', color: '#fff', lineHeight: 0.9, letterSpacing: 2, marginBottom: 12 }}>
                {getLabel(selected)?.toUpperCase()}
              </div>
              <div style={{ fontFamily: "'Space Mono'", fontSize: 9, color: ACCENT, marginBottom: 4 }}>
                {fmtDateShort(selected.date)}
                {selected.venue ? ` · ${selected.venue.toUpperCase()}` : ''}
              </div>
              {selected.city && (
                <div style={{ fontFamily: "'Space Mono'", fontSize: 8, color: '#555', marginBottom: 20 }}>
                  {selected.city.toUpperCase()}{selected.state ? `, ${selected.state}` : ''}
                </div>
              )}

              {(() => {
                const lines = getDetailLines(selected);
                if (!lines.length) return null;
                return (
                  <div style={{ borderTop: `1px solid rgba(255,102,153,0.2)`, paddingTop: 16 }}>
                    <div style={{ fontFamily: "'Space Mono'", fontSize: 7, color: '#555', letterSpacing: 3, marginBottom: 12 }}>LINEUP</div>
                    {lines.map((l, i) => (
                      <div key={i} style={{ marginBottom: 14 }}>
                        <div style={{ fontFamily: "'Space Mono'", fontSize: 7, color: '#ffcc00', letterSpacing: 2, marginBottom: 4 }}>{l.day?.toUpperCase()}</div>
                        <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.1rem', color: '#ccc', lineHeight: 1.4 }}>
                          {l.bands.join(' · ').toUpperCase()}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {(() => {
                const wb = getMatchedWristband(selected);
                if (!wb) return null;
                return (
                  <div style={{ marginTop: 20 }}>
                    <div style={{ fontFamily: "'Space Mono'", fontSize: 7, color: '#555', letterSpacing: 3, marginBottom: 8 }}>WRISTBAND</div>
                    <img src={wb} alt="wristband" style={{ width: '100%', height: 'auto', borderRadius: 4, border: `1px solid rgba(255,102,153,0.3)` }} />
                  </div>
                );
              })()}

              <div style={{ marginTop: 30, fontFamily: "'Space Mono'", fontSize: 7, color: '#333', letterSpacing: 2 }}>
                CLICK OUTSIDE TO CLOSE
              </div>
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD MODAL */}
      {showUpload && isAdmin && (
        <PosterUploadModal
          concerts={concerts}
          onClose={() => setShowUpload(false)}
          onSaved={() => { setShowUpload(false); onRefresh(); }}
        />
      )}
    </div>
  );
}

// ─── RELIC TAGGER (ONE-TIME CLEANUP TOOL) ────────────────────────────────────
// Add this as a new component, then add a tab for it in your SYSTEM BOOTH section

function RelicTaggerTab() {
  const [untaggedRelics, setUntaggedRelics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selections, setSelections] = useState({});

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      try {
        // Get all untagged relics on festival shows
        const { data: relics } = await supabase
          .from('artifacts')
          .select(`
            id,
            image_url,
            artifact_type,
            show:shows (
              id,
              date,
              festival_name,
              festival_day,
              bands,
              venue
            )
          `)
          .eq('artifact_type', 'relic')
          .is('band_name', null);

        if (relics) {
          // Filter only festivals with multiple bands
          const festivalRelics = relics.filter(r => 
            r.show?.bands && 
            Array.isArray(r.show.bands) && 
            r.show.bands.length > 1
          );
          
          setUntaggedRelics(festivalRelics);
          
          // Initialize selections (default to first band)
          const initialSelections = {};
          festivalRelics.forEach(r => {
            initialSelections[r.id] = r.show.bands[0]?.name || '';
          });
          setSelections(initialSelections);
        }
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      // Update each relic with its selected band
      for (const relic of untaggedRelics) {
        const bandName = selections[relic.id];
        if (bandName) {
          await supabase
            .from('artifacts')
            .update({ band_name: bandName })
            .eq('id', relic.id);
        }
      }
      
      alert('✅ ALL RELICS TAGGED');
      // Refresh
      window.location.reload();
    } catch (err) {
      alert('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 100, textAlign: 'center' }}>
        <div style={{ fontFamily: "'Space Mono'", fontSize: 10, color: C.teal, letterSpacing: 3 }}>
          SCANNING FOR UNTAGGED RELICS...
        </div>
      </div>
    );
  }

  if (untaggedRelics.length === 0) {
    return (
      <div style={{ padding: 100, textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: 20 }}>✅</div>
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: '2.5rem', color: '#fff' }}>
          ALL RELICS TAGGED
        </div>
        <div style={{ fontFamily: "'Space Mono'", fontSize: 10, color: C.gray, marginTop: 10 }}>
          No orphaned artifacts detected
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ padding: '24px 0' }}>
      
      {/* Header */}
      <div style={{ 
        background: hexToRgba(C.gold, 0.1), 
        border: `1px solid ${C.gold}`, 
        borderRadius: 12, 
        padding: 24, 
        marginBottom: 30,
        textAlign: 'center'
      }}>
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: '2.5rem', color: C.gold, letterSpacing: 3 }}>
          RELIC TAGGING PROTOCOL
        </div>
        <div style={{ fontFamily: "'Space Mono'", fontSize: 10, color: C.gray, marginTop: 8, letterSpacing: 2 }}>
          {untaggedRelics.length} FESTIVAL RELICS AWAITING BAND ASSIGNMENT
        </div>
        <div style={{ fontFamily: "'Space Mono'", fontSize: 9, color: C.grayDim, marginTop: 12, lineHeight: 1.6 }}>
          These setlists are from festival days with multiple bands.<br/>
          Select which band each relic belongs to, then save all at once.
        </div>
      </div>

      {/* Relic Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(3, 1fr)', 
        gap: 24 
      }}>
        {untaggedRelics.map((relic, idx) => {
          const show = relic.show;
          const bands = show?.bands || [];
          
          return (
            <div 
              key={relic.id}
              style={{
                background: C.bgCard,
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
              }}
            >
              {/* Image Preview */}
              <div style={{ 
                background: '#000', 
                padding: 12, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                minHeight: 200,
                maxHeight: 300,
                overflow: 'hidden'
              }}>
                <img 
                  src={relic.image_url} 
                  alt="relic" 
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '280px', 
                    objectFit: 'contain' 
                  }} 
                />
              </div>

              {/* Info + Selector */}
              <div style={{ padding: 16 }}>
                {/* Festival info */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ 
                    fontFamily: "'Bebas Neue'", 
                    fontSize: '1.3rem', 
                    color: C.gold, 
                    lineHeight: 1 
                  }}>
                    {show.festival_name?.toUpperCase()}
                  </div>
                  <div style={{ 
                    fontFamily: "'Space Mono'", 
                    fontSize: 8, 
                    color: C.gray, 
                    marginTop: 4 
                  }}>
                    {show.festival_day?.toUpperCase()} • {fmtDateShort(show.date)}
                  </div>
                </div>

                {/* Band selector */}
                <div style={{ marginBottom: 8 }}>
                  <label style={{ 
                    fontFamily: "'Space Mono'", 
                    fontSize: 7, 
                    color: C.teal, 
                    letterSpacing: 2, 
                    display: 'block', 
                    marginBottom: 6 
                  }}>
                    WHICH BAND IS THIS SETLIST FOR?
                  </label>
                  <select
                    value={selections[relic.id] || ''}
                    onChange={e => setSelections(prev => ({ 
                      ...prev, 
                      [relic.id]: e.target.value 
                    }))}
                    style={{
                      width: '100%',
                      background: '#000',
                      border: `1px solid ${C.teal}44`,
                      color: '#fff',
                      padding: 10,
                      borderRadius: 6,
                      fontFamily: "'Space Mono'",
                      fontSize: 10,
                      cursor: 'pointer'
                    }}
                  >
                    {bands.map((band, i) => {
                      const bandName = typeof band === 'string' ? band : band.name;
                      return (
                        <option key={i} value={bandName}>
                          {bandName}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Status indicator */}
                <div style={{ 
                  fontFamily: "'Space Mono'", 
                  fontSize: 7, 
                  color: selections[relic.id] ? C.green : C.grayDim,
                  textAlign: 'center',
                  padding: '4px',
                  background: selections[relic.id] ? hexToRgba(C.green, 0.1) : 'transparent',
                  borderRadius: 4
                }}>
                  {selections[relic.id] ? '✓ READY' : '○ SELECT BAND'}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Save All Button */}
      <div style={{ 
        position: 'sticky', 
        bottom: 20, 
        marginTop: 40,
        display: 'flex',
        justifyContent: 'center'
      }}>
        <button
          onClick={handleSaveAll}
          disabled={saving || Object.keys(selections).length === 0}
          style={{
            background: saving ? '#222' : C.gold,
            border: 'none',
            color: '#000',
            padding: '20px 60px',
            borderRadius: 8,
            fontFamily: "'Bebas Neue'",
            fontSize: '1.8rem',
            letterSpacing: 4,
            cursor: saving ? 'not-allowed' : 'pointer',
            boxShadow: saving ? 'none' : `0 0 40px ${hexToRgba(C.gold, 0.5)}`,
            fontWeight: 900,
            transition: 'all 0.2s'
          }}
          onMouseEnter={e => {
            if (!saving) {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = `0 0 60px ${hexToRgba(C.gold, 0.7)}`;
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = `0 0 40px ${hexToRgba(C.gold, 0.5)}`;
          }}
        >
          {saving ? 'SYNCING...' : `COMMIT ${untaggedRelics.length} RELICS`}
        </button>
      </div>
    </div>
  );
}


// ─── POSTER UPLOAD MODAL ──────────────────────────────────────────────────────
function PosterUploadModal({ concerts, onClose, onSaved }) {
  const [form, setForm] = useState({
    poster_type: 'artist',
    artist: '',
    festival_name: '',
    festival_day: '',
    date: '',
    venue: '',
    city: '',
    state: '',
    concert_id: '',
  });
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPosterUpload, setShowPosterUpload] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Auto-fill from concert selection
  const handleConcertSelect = (concertId) => {
    set('concert_id', concertId);
    if (!concertId) return;
    const c = concerts.find(c => c.id === concertId);
    if (!c) return;
    set('date', c.date || '');
    set('venue', c.venue || '');
    set('city', c.city || '');
    set('state', c.state || '');
    set('festival_name', c.festival_name || '');
    set('festival_day', c.festival_day || '');
    if (c.is_festival) {
      set('poster_type', 'festival_day');
    } else {
      set('artist', getBandName(c.bands?.[0]) || '');
      set('poster_type', 'artist');
    }
  };

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
      const filePath = `${session?.user?.id}/${fileName}`;
      const { error } = await supabase.storage.from('Posters').upload(filePath, file);
      if (error) throw error;
      const { data } = supabase.storage.from('Posters').getPublicUrl(filePath);
      setImageUrl(data.publicUrl);
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!imageUrl) return alert('Please upload an image first');
    if (!form.date) return alert('Date is required');
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { error } = await supabase.from('posters').insert([{
        ...form,
        image_url: imageUrl,
        user_id: session?.user?.id,
        is_public: true,
      }]);
      if (error) throw error;
      onSaved();
    } catch (err) {
      alert('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const inputSt = {
    width: '100%', background: '#000', border: '1px solid #333',
    color: '#fff', padding: '10px', borderRadius: 6,
    fontFamily: "'Space Mono'", fontSize: 11, outline: 'none',
    marginBottom: 10, boxSizing: 'border-box'
  };
  const labelSt = {
    fontFamily: "'Space Mono'", fontSize: 8, color: '#ff6699',
    letterSpacing: 1, display: 'block', marginBottom: 4
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)',
      zIndex: 20001, display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(10px)', padding: 20
    }}>
      <div style={{
        background: '#0a0a0c', border: '1px solid #ff6699',
        borderRadius: 16, padding: 35, width: '100%', maxWidth: 600,
        maxHeight: '90vh', overflowY: 'auto',
        boxShadow: `0 0 60px ${hexToRgba('#ff6699', 0.2)}`
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 }}>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: '2rem', color: '#ff6699', letterSpacing: 2 }}>
            ADD POSTER
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
        </div>

        {/* LINK TO SHOW */}
        <label style={labelSt}>LINK TO A SHOW (OPTIONAL BUT RECOMMENDED)</label>
        <select style={inputSt} value={form.concert_id} onChange={e => handleConcertSelect(e.target.value)}>
          <option value="">— Select a show to auto-fill —</option>
          {[...concerts].sort((a, b) => b.date.localeCompare(a.date)).map(c => {
            const label = `${c.date} · ${getBandName(c.bands?.[0]) || c.festival_name || 'Unknown'}`;
            return <option key={c.id} value={c.id}>{label}</option>;
          })}
        </select>

        {/* POSTER TYPE */}
        <label style={labelSt}>POSTER TYPE</label>
        <div style={{ display: 'flex', gap: 8, marginBottom: 15 }}>
          {['artist', 'festival_day', 'festival_year'].map(t => (
            <button
              key={t}
              onClick={() => set('poster_type', t)}
              style={{
                flex: 1, padding: '8px', borderRadius: 4, cursor: 'pointer',
                fontFamily: "'Space Mono'", fontSize: 8, textTransform: 'uppercase',
                background: form.poster_type === t ? '#ff6699' : 'transparent',
                border: `1px solid ${form.poster_type === t ? '#ff6699' : '#333'}`,
                color: form.poster_type === t ? '#000' : '#666',
              }}
            >
              {t.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* CONDITIONAL FIELDS */}
        {form.poster_type === 'artist' && (
          <>
            <label style={labelSt}>ARTIST</label>
            <input style={inputSt} value={form.artist} onChange={e => set('artist', e.target.value)} placeholder="e.g. Ween" />
          </>
        )}
        {(form.poster_type === 'festival_day' || form.poster_type === 'festival_year') && (
          <>
            <label style={labelSt}>FESTIVAL NAME</label>
            <input style={inputSt} value={form.festival_name} onChange={e => set('festival_name', e.target.value)} placeholder="e.g. Bonnaroo" />
          </>
        )}
        {form.poster_type === 'festival_day' && (
          <>
            <label style={labelSt}>FESTIVAL DAY / LABEL</label>
            <input style={inputSt} value={form.festival_day} onChange={e => set('festival_day', e.target.value)} placeholder="e.g. Friday" />
          </>
        )}

        {/* DATE + VENUE */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label style={labelSt}>DATE</label>
            <input type="date" style={{ ...inputSt, colorScheme: 'dark' }} value={form.date} onChange={e => set('date', e.target.value)} />
          </div>
          <div>
            <label style={labelSt}>VENUE</label>
            <input style={inputSt} value={form.venue} onChange={e => set('venue', e.target.value)} placeholder="e.g. Red Rocks" />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 }}>
          <div>
            <label style={labelSt}>CITY</label>
            <input style={inputSt} value={form.city} onChange={e => set('city', e.target.value)} placeholder="City" />
          </div>
          <div>
            <label style={labelSt}>STATE</label>
            <input style={inputSt} value={form.state} onChange={e => set('state', e.target.value)} placeholder="ST" maxLength={2} />
          </div>
        </div>

        {/* IMAGE UPLOAD */}
        <label style={labelSt}>POSTER IMAGE</label>
        <div
          onClick={() => document.getElementById('poster-upload-input').click()}
          style={{
            width: '100%', padding: '20px', borderRadius: 8, cursor: 'pointer',
            border: `2px dashed ${imageUrl ? '#ff6699' : '#333'}`,
            background: imageUrl ? hexToRgba('#ff6699', 0.05) : '#000',
            textAlign: 'center', marginBottom: 15,
            transition: 'all 0.2s'
          }}
        >
          {uploading ? (
            <div style={{ fontFamily: "'Space Mono'", fontSize: 10, color: '#ff6699' }}>UPLOADING...</div>
          ) : imageUrl ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <img src={imageUrl} alt="preview" style={{ maxHeight: 200, maxWidth: '100%', objectFit: 'contain' }} />
              <div style={{ fontFamily: "'Space Mono'", fontSize: 8, color: '#ff6699' }}>✅ UPLOADED — CLICK TO REPLACE</div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>🎨</div>
              <div style={{ fontFamily: "'Space Mono'", fontSize: 9, color: '#555' }}>CLICK TO UPLOAD POSTER IMAGE</div>
            </div>
          )}
          <input
            id="poster-upload-input"
            type="file"
            accept="image/*"
            hidden
            onChange={e => handleUpload(e.target.files[0])}
          />
        </div>

        {/* SAVE */}
        <button
          onClick={handleSave}
          disabled={saving || uploading || !imageUrl}
          style={{
            width: '100%', padding: '16px', background: saving || !imageUrl ? '#222' : '#ff6699',
            border: 'none', color: saving || !imageUrl ? '#555' : '#000',
            borderRadius: 8, fontFamily: "'Bebas Neue'", fontSize: '1.5rem',
            cursor: saving || !imageUrl ? 'not-allowed' : 'pointer', letterSpacing: 2
          }}
        >
          {saving ? 'SAVING...' : 'PIN TO WALL'}
        </button>
      </div>
    </div>
  );
}
// ─── SHOWS TAB (COLLABORATIVE VIEW) - WITH FESTIVAL CLUSTERING ───────────────
function ShowsTab() {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🟢 CLUSTERING LOGIC - Runs whenever shows updates
  const clustered = useMemo(() => {
    if (!shows || shows.length === 0) {
      console.log('⚠️ No shows to cluster');
      return [];
    }
    
    console.log('🔍 CLUSTERING:', shows.length, 'total shows');
    
    const groups = [];
    const festMap = {};
    
    shows.forEach((s, idx) => {
      console.log(`[${idx}] ${s.artist || s.festival_name} - is_festival: ${s.is_festival}, name: ${s.festival_name}`);
      
      if (s.is_festival && s.festival_name) {
        const key = `${s.festival_name}-${getYear(s.date)}`;
        console.log('  ✅ Festival key:', key);
        
        if (!festMap[key]) {
          festMap[key] = {
            festival_name: s.festival_name,
            year: getYear(s.date),
            days: [],
            allAttendances: new Map()
          };
        }
        
        festMap[key].days.push(s);
        
        // Collect unique attendances across all days
        (s.attendances || []).forEach(att => {
          festMap[key].allAttendances.set(att.user_id, att);
        });
      } else {
        console.log('  ❌ Solo show');
        groups.push({ type: 'solo', show: s });
      }
    });
    
    console.log('📊 Festival groups created:', Object.keys(festMap).length);
    console.log('📊 Solo shows:', groups.filter(g => g.type === 'solo').length);
    
    // Convert festival groups
    Object.entries(festMap).forEach(([key, fg]) => {
      console.log(`  Adding festival group: ${key} with ${fg.days.length} days`);
      groups.push({ 
        type: 'festival', 
        festival_name: fg.festival_name,
        year: fg.year,
        days: fg.days.sort((a, b) => a.date.localeCompare(b.date)),
        attendances: Array.from(fg.allAttendances.values())
      });
    });
    
    console.log('✅ Final clustered groups:', groups.length);
    return groups;
  }, [shows]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.id) return;
        
        const myUserId = session.user.id;
        
        const { data: myAttendances } = await supabase
          .from('attendances')
          .select('show_id')
          .eq('user_id', myUserId);
        
        if (!myAttendances || myAttendances.length === 0) {
          setLoading(false);
          return;
        }
        
        const myShowIds = myAttendances.map(a => a.show_id);
        
        const { data: allShows } = await supabase
          .from('shows')
          .select('*')
          .in('id', myShowIds)
          .order('date', { ascending: false });
        
        if (!allShows) {
          setLoading(false);
          return;
        }

        const { data: allAttendances } = await supabase
          .from('attendances')
          .select('*')
          .in('show_id', myShowIds);
        
        const userIds = [...new Set(allAttendances?.map(a => a.user_id) || [])];
        const { data: allProfiles } = await supabase
          .from('profiles')
          .select('id, username, avatar_color')
          .in('id', userIds);
        
        const profileMap = {};
        (allProfiles || []).forEach(p => {
          profileMap[p.id] = p;
        });
        
        const result = [];
        allShows.forEach(show => {
          const attendances = (allAttendances || []).filter(a => a.show_id === show.id);
          
          if (attendances.length > 1) {
            result.push({
              ...show,
              attendances: attendances.map(a => ({
                ...a,
                profile: profileMap[a.user_id] || { username: 'Unknown', avatar_color: C.gray }
              }))
            });
          }
        });
        
        console.log('SHARED SHOWS FETCHED:', result.length);
        setShows(result);
        setLoading(false);
      } catch (err) {
        console.error('Error:', err);
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <div style={{ padding: 100, textAlign: 'center', color: C.teal }}>SCANNING...</div>;

  if (shows.length === 0) {
    return (
      <div style={{ padding: 100, textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: 20 }}>🤝</div>
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: '2.5rem', color: '#fff' }}>NO SHARED SHOWS</div>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ padding: 24 }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: '4rem', color: '#fff' }}>
          SHARED <span style={{ color: C.gold }}>SIGNALS</span>
        </div>
        <div style={{ fontFamily: "'Space Mono'", fontSize: 10, color: C.gold, letterSpacing: 3 }}>
          {shows.length} COLLABORATIVE SHOWS // {clustered.length} GROUPS
        </div>
      </div>

      {clustered.slice(0, 30).map((item, i) => {
        if (item.type === 'festival') {
          return (
            <Card key={`fest-${item.festival_name}-${item.year}-${i}`} neon style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20, marginBottom: 15 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Bebas Neue'", fontSize: '2.5rem', color: C.gold, lineHeight: 1 }}>
                    {item.festival_name?.toUpperCase()} {item.year}
                  </div>
                  <div style={{ fontFamily: "'Space Mono'", fontSize: 10, color: C.teal, marginTop: 6 }}>
                    {item.days.length} {item.days.length === 1 ? 'DAY' : 'DAYS'} ATTENDED
                  </div>
                </div>
                
                <div style={{ 
                  background: hexToRgba(C.gold, 0.1), 
                  border: `1px solid ${C.gold}`, 
                  borderRadius: 8, 
                  padding: '12px 20px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontFamily: "'Bebas Neue'", fontSize: '2rem', color: C.gold, lineHeight: 1 }}>
                    {item.attendances?.length}
                  </div>
                  <div style={{ fontFamily: "'Space Mono'", fontSize: 7, color: C.gold }}>
                    CURATORS
                  </div>
                </div>
              </div>
              
              {/* Days List */}
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 8, 
                marginTop: 15, 
                paddingTop: 15, 
                borderTop: `1px solid ${C.border}` 
              }}>
                {item.days.map((day, di) => (
                  <div key={day.id} style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    paddingLeft: 12, 
                    borderLeft: `2px solid ${C.gold}` 
                  }}>
                    <div style={{ fontFamily: "'Space Mono'", fontSize: 9, color: C.gold, fontWeight: 900, minWidth: 80 }}>
                      {day.festival_day?.toUpperCase() || fmtDateShort(day.date)}
                    </div>
                    <div style={{ fontFamily: "'Space Mono'", fontSize: 8, color: C.gray }}>
                      {day.venue?.toUpperCase() || ''}
                    </div>
                  </div>
                ))}
              </div>

              {/* Curators */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 15 }}>
                {item.attendances?.map(att => (
                  <div 
                    key={att.user_id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      background: hexToRgba(att.profile.avatar_color, 0.1),
                      border: `1px solid ${att.profile.avatar_color}`,
                      borderRadius: 6,
                      padding: '8px 12px'
                    }}
                  >
                    <div style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: att.profile.avatar_color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: "'Bebas Neue'",
                      fontSize: '1rem',
                      color: '#000'
                    }}>
                      {att.profile.username[0].toUpperCase()}
                    </div>
                    <span style={{ fontFamily: "'Space Mono'", fontSize: 10, color: '#fff', fontWeight: 900 }}>
                      {att.profile.username.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          );
        }
        
        // Solo show
        const show = item.show;
        if (!show) return null;
        
        return (
          <Card key={show.id} neon style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20, marginBottom: 15 }}>
              <div>
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: '2.5rem', color: '#fff', lineHeight: 1 }}>
                  {show.artist?.toUpperCase()}
                </div>
                <div style={{ fontFamily: "'Space Mono'", fontSize: 10, color: C.teal, marginTop: 6 }}>
                  {fmtDateShort(show.date)} · {show.venue?.toUpperCase()}
                </div>
                {show.city && (
                  <div style={{ fontFamily: "'Space Mono'", fontSize: 9, color: C.gray, marginTop: 3 }}>
                    {show.city.toUpperCase()}, {show.state}
                  </div>
                )}
              </div>

              <div style={{ 
                background: hexToRgba(C.gold, 0.1), 
                border: `1px solid ${C.gold}`, 
                borderRadius: 8, 
                padding: '12px 20px',
                textAlign: 'center'
              }}>
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: '2rem', color: C.gold, lineHeight: 1 }}>
                  {show.attendances?.length}
                </div>
                <div style={{ fontFamily: "'Space Mono'", fontSize: 7, color: C.gold }}>
                  CURATORS
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {show.attendances?.map(att => (
                <div 
                  key={att.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    background: hexToRgba(att.profile.avatar_color, 0.1),
                    border: `1px solid ${att.profile.avatar_color}`,
                    borderRadius: 6,
                    padding: '8px 12px'
                  }}
                >
                  <div style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: att.profile.avatar_color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: "'Bebas Neue'",
                    fontSize: '1rem',
                    color: '#000'
                  }}>
                    {att.profile.username[0].toUpperCase()}
                  </div>
                  <span style={{ fontFamily: "'Space Mono'", fontSize: 10, color: '#fff', fontWeight: 900 }}>
                    {att.profile.username.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
// ─── COLLABORATION WEB - MOBILE RESPONSIVE ────────────────────────────────────
// ─── COLLABORATION WEB - WITH AVATARS & MESH ───────────────────────────────────
function CollaborationWebTab() {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collaborators, setCollaborators] = useState([]);
  const [collabLinks, setCollabLinks] = useState([]);
  const [detailView, setDetailView] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [particles, setParticles] = useState([]);
  const [totalShows, setTotalShows] = useState(0);
  const [viewMode, setViewMode] = useState('2d');
  const [myAvatar, setMyAvatar] = useState(null);
  const canvasRef = useRef(null);
  const threeMountRef = useRef(null);
  const animationRef = useRef(null);

  // Fetch data with avatars
  useEffect(() => {
    const fetch = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.id) {
          setLoading(false);
          return;
        }
        
        const myUserId = session.user.id;
        
        // Fetch MY profile for avatar
        const { data: myProfile } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', myUserId)
          .single();
        
        if (myProfile?.avatar_url) {
          setMyAvatar(myProfile.avatar_url);
        }
        
        const { data: myAttendances } = await supabase
          .from('attendances')
          .select('show_id')
          .eq('user_id', myUserId);
        
        if (!myAttendances || myAttendances.length === 0) {
          setLoading(false);
          return;
        }
        
        const myShowIds = myAttendances.map(a => a.show_id);
        setTotalShows(myShowIds.length);
        
        const batchSize = 100;
        const showBatches = [];
        
        for (let i = 0; i < myShowIds.length; i += batchSize) {
          const batch = myShowIds.slice(i, i + batchSize);
          const { data: batchShows } = await supabase
            .from('shows')
            .select('*')
            .in('id', batch);
          
          if (batchShows) showBatches.push(...batchShows);
        }
        
        const showsData = showBatches;
        
        const attendanceBatches = [];
        
        for (let i = 0; i < myShowIds.length; i += batchSize) {
          const batch = myShowIds.slice(i, i + batchSize);
          const { data: batchAttendances } = await supabase
            .from('attendances')
            .select('*')
            .in('show_id', batch);
          
          if (batchAttendances) attendanceBatches.push(...batchAttendances);
        }
        
        const allAttendances = attendanceBatches;
        
        const userIds = [...new Set(allAttendances.map(a => a.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username, avatar_color, avatar_url')
          .in('id', userIds);
        
        const profileMap = {};
        (profiles || []).forEach(p => {
          profileMap[p.id] = p;
        });
        
        const attendancesByShow = {};
        allAttendances.forEach(att => {
          if (!attendancesByShow[att.show_id]) {
            attendancesByShow[att.show_id] = [];
          }
          attendancesByShow[att.show_id].push({
            ...att,
            profile: profileMap[att.user_id] || { username: 'Unknown', avatar_color: C.gray }
          });
        });
        
        const collabMap = {};
        const mySharedShows = [];
        const collabConnections = {};
        
        showsData.forEach(show => {
          const attendances = attendancesByShow[show.id] || [];
          
          if (attendances.length > 1) {
            mySharedShows.push(show);
            
            const showCollaborators = [];
            
            attendances.forEach(att => {
              if (att.user_id === myUserId) return;
              
              showCollaborators.push(att.user_id);
              
              if (!collabMap[att.user_id]) {
                collabMap[att.user_id] = {
                  id: att.user_id,
                  username: att.profile.username,
                  color: att.profile.avatar_color,
                  avatar_url: att.profile.avatar_url,
                  count: 0,
                  showIds: [],
                  shows: []
                };
              }
              collabMap[att.user_id].count++;
              collabMap[att.user_id].showIds.push(show.id);
              collabMap[att.user_id].shows.push(show);
            });
            
            // Track mesh connections
            if (showCollaborators.length >= 2) {
              for (let i = 0; i < showCollaborators.length; i++) {
                for (let j = i + 1; j < showCollaborators.length; j++) {
                  const userA = showCollaborators[i];
                  const userB = showCollaborators[j];
                  const key = [userA, userB].sort().join('-');
                  
                  if (!collabConnections[key]) {
                    collabConnections[key] = {
                      userA: userA,
                      userB: userB,
                      count: 0,
                      showIds: []
                    };
                  }
                  collabConnections[key].count++;
                  collabConnections[key].showIds.push(show.id);
                }
              }
            }
          }
        });
        
        console.log('🕸️ Mesh connections:', Object.keys(collabConnections).length);
        
        setShows(mySharedShows);
        setCollaborators(Object.values(collabMap).sort((a, b) => b.count - a.count));
        setCollabLinks(Object.values(collabConnections));
        setLoading(false);
      } catch (err) {
        console.error('💥 ERROR:', err);
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // 🌊 2D ORBITAL ANIMATION (unchanged, add avatar background later)
  useEffect(() => {
    if (collaborators.length === 0 || totalShows === 0 || viewMode !== '2d') return;

    const isMobile = window.innerWidth < 768;
    const containerWidth = isMobile ? window.innerWidth - 40 : 800;
    const containerHeight = isMobile ? 400 : 700;
    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2;
    const baseOrbitRadius = isMobile ? 120 : 220;
    const baseSize = isMobile ? 100 : 160;

    const maxCollabCount = Math.max(...collaborators.map(c => c.count));

    const nodeData = [
      { 
        id: 'you', 
        label: 'YOU', 
        color: C.teal, 
        size: baseSize,
        x: centerX, 
        y: centerY,
        isCenter: true,
        count: totalShows,
        avatar: myAvatar
      },
      ...collaborators.map((c, i) => {
        const angle = (i / collaborators.length) * Math.PI * 2;
        const sizeFactor = Math.sqrt(c.count / maxCollabCount);
        const proportionalSize = Math.max(
          sizeFactor * (isMobile ? 60 : 110),
          isMobile ? 35 : 60
        );
        
        const mostRecentShow = c.shows.sort((a, b) => b.date.localeCompare(a.date))[0];
        const daysSinceLastShow = mostRecentShow ? daysSince(mostRecentShow.date) : 9999;
        
        let distanceFactor = 1.0;
        if (daysSinceLastShow < 30) distanceFactor = 0.75;
        else if (daysSinceLastShow < 180) distanceFactor = 1.0;
        else distanceFactor = 1.2;
        
        const orbitRadius = baseOrbitRadius * distanceFactor;
        
        return {
          id: c.id,
          label: c.username,
          color: c.color,
          count: c.count,
          showIds: c.showIds,
          size: proportionalSize,
          baseAngle: angle,
          orbitRadius: orbitRadius,
          daysSince: daysSinceLastShow,
          avatar: c.avatar_url,
          x: centerX + Math.cos(angle) * orbitRadius,
          y: centerY + Math.sin(angle) * orbitRadius
        };
      })
    ];

    setNodes(nodeData);

    const particlePool = [];
    collaborators.forEach((c, i) => {
      for (let p = 0; p < c.count; p++) {
        particlePool.push({
          nodeIndex: i,
          progress: p / c.count,
          speed: 0.015 + Math.random() * 0.01,
          direction: p % 2 === 0 ? 1 : -1,
          color: c.color
        });
      }
    });
    setParticles(particlePool);

    let time = 0;
    const animate = () => {
      time += 0.0006;

      const updatedNodes = nodeData.map(node => {
        if (node.isCenter) return node;
        const angle = node.baseAngle + time;
        return {
          ...node,
          x: centerX + Math.cos(angle) * node.orbitRadius,
          y: centerY + Math.sin(angle) * node.orbitRadius
        };
      });

      setNodes(updatedNodes);

      setParticles(prevParticles => 
        prevParticles.map(p => {
          let newProgress = p.progress + (p.speed * p.direction);
          let newDirection = p.direction;
          
          if (newProgress >= 1) {
            newProgress = 0.99;
            newDirection = -1;
          } else if (newProgress <= 0) {
            newProgress = 0.01;
            newDirection = 1;
          }
          
          return {
            ...p,
            progress: newProgress,
            direction: newDirection
          };
        })
      );

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, containerWidth, containerHeight);
        
        particles.forEach(p => {
          const collabNode = updatedNodes[p.nodeIndex + 1];
          if (!collabNode) return;
          
          const x = centerX + (collabNode.x - centerX) * p.progress;
          const y = centerY + (collabNode.y - centerY) * p.progress;
          
          ctx.beginPath();
          ctx.arc(x, y, 5, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.shadowBlur = 20;
          ctx.shadowColor = p.color;
          ctx.fill();
          
          ctx.beginPath();
          ctx.arc(x, y, 10, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = 0.25;
          ctx.fill();
          ctx.globalAlpha = 1.0;
        });
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [collaborators, collabLinks, particles.length, totalShows, viewMode, myAvatar]);

  // 🌍 3D GALAXY WITH AVATAR TEXTURES
  useEffect(() => {
    if (viewMode !== '3d' || !window.THREE || !threeMountRef.current || collaborators.length === 0 || totalShows === 0) return;
    
    const container = threeMountRef.current;
    
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    
    const width = container.clientWidth;
    const height = container.clientHeight;
    const isMobile = window.innerWidth < 768;
    
    const scene = new window.THREE.Scene();
    scene.background = new window.THREE.Color(0x020204);
    scene.fog = new window.THREE.Fog(0x020204, 800, 1500);
    
    const camera = new window.THREE.PerspectiveCamera(60, width / height, 1, 2000);
    camera.position.z = isMobile ? 350 : 500;
    
    const renderer = new window.THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);
    
    // Starfield
    const starGeo = new window.THREE.BufferGeometry();
    const starCount = 800;
    const starPositions = new Float32Array(starCount * 3);
    
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 2000;
      starPositions[i + 1] = (Math.random() - 0.5) * 2000;
      starPositions[i + 2] = (Math.random() - 0.5) * 1000 - 200;
    }
    
    starGeo.setAttribute('position', new window.THREE.BufferAttribute(starPositions, 3));
    const starMat = new window.THREE.PointsMaterial({ color: 0xffffff, size: 2, transparent: true, opacity: 0.6 });
    const stars = new window.THREE.Points(starGeo, starMat);
    scene.add(stars);
    
    const ambientLight = new window.THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    const youLight = new window.THREE.PointLight(0x00e5cc, 3, 800);
    scene.add(youLight);
    
    const galaxyRadius = isMobile ? 180 : 280;
    const ringGeo = new window.THREE.RingGeometry(galaxyRadius, galaxyRadius + 2, 64);
    const ringMat = new window.THREE.MeshBasicMaterial({ color: 0x00e5cc, opacity: 0.15, transparent: true, side: window.THREE.DoubleSide });
    const ring1 = new window.THREE.Mesh(ringGeo, ringMat);
    ring1.rotation.x = Math.PI / 2;
    scene.add(ring1);
    
    const ring2Geo = new window.THREE.RingGeometry(galaxyRadius * 0.6, galaxyRadius * 0.6 + 2, 64);
    const ring2 = new window.THREE.Mesh(ring2Geo, ringMat);
    ring2.rotation.x = Math.PI / 2;
    scene.add(ring2);
    
    // 🎨 YOU sphere with avatar texture
    const youSize = isMobile ? 40 : 60;
    const youGeo = new window.THREE.SphereGeometry(youSize, 32, 32);
    
    let youMesh;
    if (myAvatar) {
      const textureLoader = new window.THREE.TextureLoader();
      textureLoader.load(myAvatar, (texture) => {
        const youMat = new window.THREE.MeshPhongMaterial({ 
          map: texture,
          emissive: 0x00e5cc,
          emissiveIntensity: 0.3,
          shininess: 100
        });
        youMesh.material = youMat;
      });
      
      // Temporary material while loading
      const tempMat = new window.THREE.MeshPhongMaterial({ 
        color: 0x00e5cc,
        emissive: 0x00e5cc,
        emissiveIntensity: 0.8
      });
      youMesh = new window.THREE.Mesh(youGeo, tempMat);
    } else {
      const youMat = new window.THREE.MeshPhongMaterial({ 
        color: 0x00e5cc,
        emissive: 0x00e5cc,
        emissiveIntensity: 0.8
      });
      youMesh = new window.THREE.Mesh(youGeo, youMat);
    }
    
    scene.add(youMesh);
    
    const glowGeo = new window.THREE.SphereGeometry(youSize + 15, 32, 32);
    const glowMat = new window.THREE.MeshBasicMaterial({ color: 0x00e5cc, transparent: true, opacity: 0.1 });
    const glowMesh = new window.THREE.Mesh(glowGeo, glowMat);
    scene.add(glowMesh);
    
    // Collaborators with avatars
    const maxCount = Math.max(...collaborators.map(c => c.count));
    const collabMeshes = [];
    const collabGlows = [];
    const collabPositions = {};
    
    collaborators.forEach((c, i) => {
      const sizeFactor = Math.sqrt(c.count / maxCount);
      const size = Math.max(sizeFactor * (isMobile ? 30 : 50), isMobile ? 15 : 20);
      
      const phi = Math.acos(-1 + (2 * (i + 1)) / (collaborators.length + 1));
      const theta = Math.sqrt((collaborators.length + 1) * Math.PI) * phi;
      
      const x = galaxyRadius * Math.cos(theta) * Math.sin(phi);
      const y = galaxyRadius * Math.sin(theta) * Math.sin(phi);
      const z = galaxyRadius * Math.cos(phi);
      
      collabPositions[c.id] = { x, y, z };
      
      const colorInt = parseInt(c.color.replace('#', ''), 16);
      
      const geo = new window.THREE.SphereGeometry(size, 28, 28);
      
      let mesh;
      if (c.avatar_url) {
        const textureLoader = new window.THREE.TextureLoader();
        textureLoader.load(c.avatar_url, (texture) => {
          const mat = new window.THREE.MeshPhongMaterial({ 
            map: texture,
            emissive: colorInt,
            emissiveIntensity: 0.2
          });
          mesh.material = mat;
        });
        
        const tempMat = new window.THREE.MeshPhongMaterial({ color: colorInt, emissive: colorInt, emissiveIntensity: 0.7 });
        mesh = new window.THREE.Mesh(geo, tempMat);
      } else {
        const mat = new window.THREE.MeshPhongMaterial({ color: colorInt, emissive: colorInt, emissiveIntensity: 0.7 });
        mesh = new window.THREE.Mesh(geo, mat);
      }
      
      mesh.position.set(x, y, z);
      scene.add(mesh);
      collabMeshes.push(mesh);
      
      const glowGeo2 = new window.THREE.SphereGeometry(size + 12, 20, 20);
      const glowMat2 = new window.THREE.MeshBasicMaterial({ color: colorInt, transparent: true, opacity: 0.12 });
      const glowMesh2 = new window.THREE.Mesh(glowGeo2, glowMat2);
      glowMesh2.position.set(x, y, z);
      scene.add(glowMesh2);
      collabGlows.push(glowMesh2);
      
      // Line to YOU
      const points = [new window.THREE.Vector3(0, 0, 0), new window.THREE.Vector3(x, y, z)];
      const lineGeo = new window.THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new window.THREE.LineBasicMaterial({ color: colorInt, opacity: 0.4, transparent: true });
      const line = new window.THREE.Line(lineGeo, lineMat);
      scene.add(line);
      
      const collabLight = new window.THREE.PointLight(colorInt, 1.5, 200);
      collabLight.position.set(x, y, z);
      scene.add(collabLight);
      
      // Labels
      const countCanvas = document.createElement('canvas');
      const countCtx = countCanvas.getContext('2d');
      countCanvas.width = 128;
      countCanvas.height = 64;
      countCtx.fillStyle = '#ffcc00';
      countCtx.font = 'bold 48px monospace';
      countCtx.textAlign = 'center';
      countCtx.textBaseline = 'middle';
      countCtx.fillText(c.count.toString(), 64, 32);
      
      const countTexture = new window.THREE.CanvasTexture(countCanvas);
      const countMat = new window.THREE.SpriteMaterial({ map: countTexture });
      const countSprite = new window.THREE.Sprite(countMat);
      countSprite.position.set(x * 0.55, y * 0.55, z * 0.55);
      countSprite.scale.set(isMobile ? 35 : 50, isMobile ? 17 : 25, 1);
      scene.add(countSprite);
      
      const nameCanvas = document.createElement('canvas');
      const nameCtx = nameCanvas.getContext('2d');
      nameCanvas.width = 256;
      nameCanvas.height = 64;
      nameCtx.fillStyle = c.color;
      nameCtx.font = 'bold 36px monospace';
      nameCtx.textAlign = 'center';
      nameCtx.textBaseline = 'middle';
      nameCtx.fillText(c.username.toUpperCase(), 128, 32);
      
      const nameTexture = new window.THREE.CanvasTexture(nameCanvas);
      const nameMat = new window.THREE.SpriteMaterial({ map: nameTexture });
      const nameSprite = new window.THREE.Sprite(nameMat);
      nameSprite.position.set(x * 1.4, y * 1.4, z * 1.4);
      nameSprite.scale.set(isMobile ? 60 : 80, isMobile ? 15 : 20, 1);
      scene.add(nameSprite);
    });
    
    // 🕸️ MESH LINES between collaborators
    collabLinks.forEach(link => {
      const posA = collabPositions[link.userA];
      const posB = collabPositions[link.userB];
      
      if (!posA || !posB) return;
      
      const points = [
        new window.THREE.Vector3(posA.x, posA.y, posA.z),
        new window.THREE.Vector3(posB.x, posB.y, posB.z)
      ];
      const meshLineGeo = new window.THREE.BufferGeometry().setFromPoints(points);
      const meshLineMat = new window.THREE.LineBasicMaterial({ 
        color: 0xffcc00,
        opacity: 0.25,
        transparent: true
      });
      const meshLine = new window.THREE.Line(meshLineGeo, meshLineMat);
      scene.add(meshLine);
    });
    
    // Mouse/touch controls
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    let rotation = { x: 0.2, y: 0 };
    
    const onStart = (e) => {
      isDragging = true;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      prevMouse = { x: clientX, y: clientY };
    };
    
    const onMove = (e) => {
      if (!isDragging) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      rotation.y += (clientX - prevMouse.x) * 0.008;
      rotation.x += (clientY - prevMouse.y) * 0.008;
      rotation.x = Math.max(-1.5, Math.min(1.5, rotation.x));
      prevMouse = { x: clientX, y: clientY };
    };
    
    const onEnd = () => { isDragging = false; };
    
    const onWheel = (e) => {
      e.preventDefault();
      camera.position.z = Math.max(isMobile ? 250 : 300, Math.min(800, camera.position.z + e.deltaY * 0.5));
    };
    
    renderer.domElement.addEventListener('mousedown', onStart);
    renderer.domElement.addEventListener('mousemove', onMove);
    renderer.domElement.addEventListener('mouseup', onEnd);
    renderer.domElement.addEventListener('touchstart', onStart, { passive: true });
    renderer.domElement.addEventListener('touchmove', onMove, { passive: true });
    renderer.domElement.addEventListener('touchend', onEnd);
    renderer.domElement.addEventListener('wheel', onWheel);
    
    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      
      if (!isDragging) {
        rotation.y += 0.004;
      }
      
      scene.rotation.x = rotation.x;
      scene.rotation.y = rotation.y;
      
      const pulse = 1 + Math.sin(Date.now() * 0.0025) * 0.15;
      youMesh.scale.set(pulse, pulse, pulse);
      glowMesh.scale.set(pulse * 1.1, pulse * 1.1, pulse * 1.1);
      
      collabMeshes.forEach((mesh, i) => {
        const phase = i * 1.2;
        const p = 1 + Math.sin(Date.now() * 0.002 + phase) * 0.08;
        mesh.scale.set(p, p, p);
        collabGlows[i].scale.set(p * 1.15, p * 1.15, p * 1.15);
      });
      
      stars.rotation.y += 0.0001;
      
      const ringPulse = 0.1 + Math.sin(Date.now() * 0.001) * 0.08;
      ring1.material.opacity = ringPulse;
      ring2.material.opacity = ringPulse * 0.8;
      
      renderer.render(scene, camera);
    };
    
    animate();
    
    return () => {
      renderer.domElement.removeEventListener('mousedown', onStart);
      renderer.domElement.removeEventListener('mousemove', onMove);
      renderer.domElement.removeEventListener('mouseup', onEnd);
      renderer.domElement.removeEventListener('touchstart', onStart);
      renderer.domElement.removeEventListener('touchmove', onMove);
      renderer.domElement.removeEventListener('touchend', onEnd);
      renderer.domElement.removeEventListener('wheel', onWheel);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [viewMode, collaborators, collabLinks, totalShows, myAvatar]);

  if (loading) return <div style={{ padding: 100, textAlign: 'center', color: C.teal }}>SCANNING...</div>;

  if (collaborators.length === 0) {
    return (
      <div style={{ padding: 100, textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: 20 }}>🤝</div>
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: '2.5rem', color: '#fff' }}>NO COLLABORATIONS YET</div>
      </div>
    );
  }

  const isMobile = window.innerWidth < 768;
  const containerWidth = isMobile ? window.innerWidth - 40 : 800;
  const containerHeight = isMobile ? 500 : 700;

  return (
  <div className="fade-in" style={{ padding: isMobile ? 20 : 40 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 15 }}>
      <div style={{ textAlign: 'center', flex: 1 }}>
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: isMobile ? '2.5rem' : '4rem', color: '#fff' }}>
          COLLABORATION <span style={{ color: C.gold }}>WEB</span>
        </div>
        <div style={{ fontFamily: "'Space Mono'", fontSize: isMobile ? 8 : 10, color: C.gold }}>
          {shows.length} SHARED · {collaborators.length} COLLABORATORS
        </div>
        {collabLinks.length > 0 && (
          <div style={{ fontFamily: "'Space Mono'", fontSize: 7, color: C.purple, marginTop: 5 }}>
            🕸️ {collabLinks.length} MESH LINKS
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 6, background: C.bgCard, padding: 4, borderRadius: 6, border: `1px solid ${C.border}` }}>
        <button onClick={() => setViewMode('2d')} style={{ background: viewMode === '2d' ? C.teal : 'transparent', color: viewMode === '2d' ? '#000' : C.gray, border: 'none', padding: '8px 16px', borderRadius: 4, fontFamily: "'Space Mono'", fontSize: 10, fontWeight: 900, cursor: 'pointer' }}>
          🌊 ORBITAL
        </button>
        <button onClick={() => setViewMode('3d')} style={{ background: viewMode === '3d' ? C.purple : 'transparent', color: viewMode === '3d' ? '#000' : C.gray, border: 'none', padding: '8px 16px', borderRadius: 4, fontFamily: "'Space Mono'", fontSize: 10, fontWeight: 900, cursor: 'pointer' }}>
          🌍 GALAXY
        </button>
      </div>
    </div>

    <div style={{ width: '100%', maxWidth: `${containerWidth}px`, height: `${containerHeight}px`, margin: '0 auto', position: 'relative', background: '#050508', border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden',marginTop: isMobile ? '20px' : '0'  }}>
      
      {viewMode === '2d' ? (
        <>
          <canvas ref={canvasRef} width={containerWidth} height={containerHeight} style={{ position: 'absolute', inset: 0, zIndex: 5, pointerEvents: 'none' }} />

          <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
            {nodes.length > 1 && nodes.slice(1).map((node) => {
              const you = nodes[0];
              if (!you || !node.x || !node.y) return null;
              
              return (
                <line key={`you-${node.id}`} x1={you.x} y1={you.y} x2={node.x} y2={node.y} stroke={node.color} strokeWidth={Math.max(node.count / 4, 2)} opacity="0.3" />
              );
            })}
            
            {collabLinks.map((link, i) => {
              const nodeA = nodes.find(n => n.id === link.userA);
              const nodeB = nodes.find(n => n.id === link.userB);
              if (!nodeA || !nodeB) return null;
              
              return <line key={`mesh-${i}`} x1={nodeA.x} y1={nodeA.y} x2={nodeB.x} y2={nodeB.y} stroke="#ffcc00" strokeWidth={Math.max(link.count / 2, 1.5)} opacity="0.25" strokeDasharray="4 4" />;
            })}
          </svg>

          <style>{`@keyframes orbitPulse { 0%, 100% { box-shadow: 0 0 30px var(--node-color); } 50% { box-shadow: 0 0 50px var(--node-color); } }`}</style>

          {nodes.map((node) => {
            const isYou = node.id === 'you';
            if (!node.x || !node.y) return null;
            
            return (
              <div key={node.id} onClick={() => !isYou && setDetailView(collaborators.find(c => c.id === node.id))} style={{ position: 'absolute', left: node.x - (node.size / 2), top: node.y - (node.size / 2), width: node.size, height: node.size, borderRadius: '50%', background: node.avatar ? `url(${node.avatar}) center/cover` : node.color, border: `3px solid ${node.color}`, boxShadow: `0 0 35px ${node.color}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: isYou ? 'flex-end' : 'center', fontFamily: "'Space Mono'", color: node.avatar ? '#fff' : '#000', fontWeight: 900, cursor: isYou ? 'default' : 'pointer', zIndex: isYou ? 100 : 80, userSelect: 'none', '--node-color': node.color, animation: 'orbitPulse 2s ease-in-out infinite', gap: '4px', textShadow: node.avatar ? '0 2px 4px rgba(0,0,0,0.8)' : 'none' }}>
                
                {!isYou && (
                  <div style={{ fontSize: node.size > 90 ? (isMobile ? 11 : 16) : (isMobile ? 8 : 11) }}>{node.label.toUpperCase()}</div>
                )}
                
                <div style={{ 
  position: node.avatar ? 'absolute' : 'relative',
  top: node.avatar ? '8px' : 'auto',
  right: node.avatar ? '8px' : 'auto',
  background: 'rgba(0,0,0,0.85)', 
  borderRadius: '12px', 
  padding: node.size > 90 ? '4px 10px' : '3px 7px', 
  fontFamily: "'Bebas Neue'", 
  fontSize: node.size > 90 ? '1.2rem' : (isMobile ? '0.85rem' : '1rem'), 
  color: '#ffcc00',
  border: '1px solid rgba(0,0,0,0.9)',
  boxShadow: '0 2px 6px rgba(0,0,0,0.5)'
}}>
  {node.count}
</div>
                
                {!isYou && node.daysSince !== undefined && (
                  <div style={{ fontFamily: "'Space Mono'", fontSize: isMobile ? 5 : 6, color: node.avatar ? '#fff' : 'rgba(0,0,0,0.5)', textShadow: node.avatar ? '0 1px 2px rgba(0,0,0,0.8)' : 'none' }}>
                    {node.daysSince < 30 ? 'RECENT' : node.daysSince < 180 ? 'MONTHS' : 'YEARS'}
                  </div>
                )}
              </div>
            );
          })}
        </>
      ) : (
        <div ref={threeMountRef} style={{ width: '100%', height: '100%' }} />
      )}
    </div>

    <div style={{ textAlign: 'center', marginTop: 15, fontFamily: "'Space Mono'", fontSize: 8, color: C.grayDim, letterSpacing: 1.5 }}>
      {viewMode === '2d' ? '🕸️ GOLD MESH = COLLABORATORS WHO ATTENDED TOGETHER' : '🌍 YOUR AVATAR MAPPED TO SPHERE // DRAG TO ROTATE'}
    </div>

    {detailView && (() => {
  // 🟢 CLUSTERING LOGIC FOR DETAIL VIEW
  const detailShows = shows.filter(s => detailView.showIds.includes(s.id));
  
  console.log('🔍 DETAIL VIEW CLUSTERING:', detailShows.length, 'shows for', detailView.username);
  
  const clustered = [];
  const festMap = {};
  
  detailShows.forEach((s, idx) => {
    console.log(`[${idx}] ${s.artist || s.festival_name} - fest: ${s.is_festival}, name: ${s.festival_name}`);
    
    if (s.is_festival && s.festival_name) {
      const key = `${s.festival_name}-${getYear(s.date)}`;
      console.log('  ✅ Fest key:', key);
      
      if (!festMap[key]) {
        festMap[key] = {
          festival_name: s.festival_name,
          year: getYear(s.date),
          days: []
        };
      }
      festMap[key].days.push(s);
    } else {
      console.log('  ❌ Solo');
      clustered.push({ type: 'solo', show: s });
    }
  });
  
  Object.values(festMap).forEach(fg => {
    clustered.push({
      type: 'festival',
      festival_name: fg.festival_name,
      year: fg.year,
      days: fg.days.sort((a, b) => a.date.localeCompare(b.date))
    });
  });
  
  console.log('✅ Clustered groups:', clustered.length);
  console.log('📊 Festival clusters:', Object.keys(festMap).length);
  console.log('📊 Solo shows:', clustered.filter(c => c.type === 'solo').length);
  
  return (
    <div style={{ marginTop: 40 }}>
      <Card neon style={{ border: `2px solid ${detailView.color}`, boxShadow: `0 0 30px ${hexToRgba(detailView.color, 0.3)}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: isMobile ? '2rem' : '3rem', color: detailView.color }}>{detailView.username.toUpperCase()}</div>
            <div style={{ fontFamily: "'Space Mono'", fontSize: 10, color: C.gray }}>{detailView.count} SHARED ({Math.round((detailView.count / totalShows) * 100)}%)</div>
          </div>
          <button onClick={() => setDetailView(null)} style={{ background: 'none', border: `1px solid ${C.border}`, color: C.gray, padding: '8px 16px', borderRadius: 4, cursor: 'pointer', fontFamily: "'Space Mono'", fontSize: 10 }}>CLOSE</button>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {clustered.map((cluster, ci) => {
            if (cluster.type === 'festival') {
              // FESTIVAL CLUSTER CARD
              return (
                <div key={`fest-${cluster.festival_name}-${cluster.year}`} style={{ 
                  background: hexToRgba(C.gold, 0.05), 
                  border: `2px solid ${C.gold}`, 
                  borderRadius: 12, 
                  padding: 20 
                }}>
                  <div style={{ fontFamily: "'Bebas Neue'", fontSize: '2rem', color: C.gold, marginBottom: 10, lineHeight: 1 }}>
                    {cluster.festival_name.toUpperCase()} {cluster.year}
                  </div>
                  <div style={{ fontFamily: "'Space Mono'", fontSize: 9, color: C.gray, marginBottom: 15 }}>
                    {cluster.days.length} DAYS ATTENDED TOGETHER
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {cluster.days.map(day => {
                      const otherAttendees = collaborators.filter(c => 
                        c.id !== detailView.id && c.showIds.includes(day.id)
                      );
                      
                      return (
                        <div key={day.id} style={{ 
                          background: hexToRgba(detailView.color, 0.05), 
                          border: `1px solid ${hexToRgba(detailView.color, 0.3)}`, 
                          borderRadius: 8, 
                          padding: 12,
                          borderLeft: `3px solid ${C.gold}`
                        }}>
                          <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.1rem', color: '#fff' }}>
                            {day.festival_day?.toUpperCase() || fmtDateShort(day.date)}
                          </div>
                          <div style={{ fontFamily: "'Space Mono'", fontSize: 8, color: C.gray, marginTop: 3 }}>
                            {day.venue?.toUpperCase()}
                          </div>
                          
                          {otherAttendees.length > 0 && (
                            <div style={{ 
                              marginTop: 8, 
                              paddingTop: 8, 
                              borderTop: `1px solid ${hexToRgba(detailView.color, 0.2)}`,
                              display: 'flex',
                              gap: 4,
                              alignItems: 'center',
                              flexWrap: 'wrap'
                            }}>
                              <span style={{ fontFamily: "'Space Mono'", fontSize: 7, color: C.gold }}>ALSO WITH:</span>
                              {otherAttendees.map(att => (
                                <span key={att.id} style={{ 
                                  fontFamily: "'Space Mono'", 
                                  fontSize: 7, 
                                  color: att.color,
                                  background: hexToRgba(att.color, 0.15),
                                  padding: '2px 6px',
                                  borderRadius: 4,
                                  border: `1px solid ${hexToRgba(att.color, 0.4)}`
                                }}>
                                  {att.username.toUpperCase()}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            }
            
            // SOLO SHOW CARD
            const s = cluster.show;
            const otherAttendees = collaborators.filter(c => 
              c.id !== detailView.id && c.showIds.includes(s.id)
            );
            
            return (
              <div key={s.id} style={{ 
                background: hexToRgba(detailView.color, 0.05), 
                border: `1px solid ${hexToRgba(detailView.color, 0.3)}`, 
                borderRadius: 8, 
                padding: 15 
              }}>
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.3rem', color: '#fff' }}>
                  {s.is_festival ? s.festival_name?.toUpperCase() : s.artist?.toUpperCase()}
                </div>
                <div style={{ fontFamily: "'Space Mono'", fontSize: 8, color: C.gray, marginTop: 5 }}>
                  {fmtDateShort(s.date)}
                </div>
                <div style={{ fontFamily: "'Space Mono'", fontSize: 8, color: detailView.color, marginTop: 3 }}>
                  {s.venue?.toUpperCase()}
                </div>
                
                {otherAttendees.length > 0 && (
                  <div style={{ 
                    marginTop: 8, 
                    paddingTop: 8, 
                    borderTop: `1px solid ${hexToRgba(detailView.color, 0.2)}`,
                    display: 'flex',
                    gap: 4,
                    alignItems: 'center',
                    flexWrap: 'wrap'
                  }}>
                    <span style={{ fontFamily: "'Space Mono'", fontSize: 7, color: C.gold }}>WITH:</span>
                    {otherAttendees.map(att => (
                      <span key={att.id} style={{ 
                        fontFamily: "'Space Mono'", 
                        fontSize: 7, 
                        color: att.color,
                        background: hexToRgba(att.color, 0.15),
                        padding: '2px 6px',
                        borderRadius: 4,
                        border: `1px solid ${hexToRgba(att.color, 0.4)}`
                      }}>
                        {att.username.toUpperCase()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
})()}
  </div>
);
}
// ─── STUB CASE TAB ────────────────────────────────────────────────────────────
function StubCaseTab({ concerts, isAdmin, onEdit, artistGenres }) {
  const [selected, setSelected] = useState(null);
  const [tossing, setTossing] = useState(false);
  const [yearFilter, setYearFilter] = useState('all');
  const [festFilter, setFestFilter] = useState('all');
  const [items, setItems] = useState([]);
 const ACCENT = '#ff6699'; // 🔥 Define the accent color


  // Build the pile from real images only
  const allItems = useMemo(() => {
  const pile = [];
  concerts.forEach(c => {
    // Real ticket stubs
    if (c.image_url) {
      c.image_url.split(',').map(u => u.trim()).filter(Boolean).forEach((url, i) => {
        const cleanUrl = url.split('#rot=')[0];
        const rotation = url.includes('#rot=') ? parseInt(url.split('#rot=')[1], 10) : 0;
        pile.push({
          id: `stub-${c.id}-${i}`,
          url: cleanUrl,
          imgRotation: rotation,
          type: 'stub',
          artist: getBandName(c.bands?.[0]) || c.festival_name || 'Unknown',
          date: c.date,
          venue: c.venue || c.festival_name,
          city: c.city,
          state: c.state,
          is_festival: c.is_festival,
          festival_name: c.festival_name,
          concertId: c.id
        });
      });
    }
    // Real wristbands
    if (c.wristband_image_url) {
      c.wristband_image_url.split(',').map(u => u.trim()).filter(Boolean).forEach((url, i) => {
        if (pile.some(p => p.url === url)) return;
        pile.push({
          id: `wrist-${c.id}-${i}`,
          url,
          imgRotation: 0,
          type: 'wristband',
          artist: c.festival_name || getBandName(c.bands?.[0]) || 'Unknown',
          date: c.date,
          venue: c.venue || c.festival_name,
          city: c.city,
          state: c.state,
          is_festival: true,
          festival_name: c.festival_name,
          concertId: c.id
        });
      });
    }
  });
  return pile;
}, [concerts]);

  const years = useMemo(() => {
    const ySet = new Set(allItems.map(i => getYear(i.date)).filter(Boolean));
    return [...ySet].sort((a, b) => b - a);
  }, [allItems]);

  // Filter + randomize on load or filter change
  useEffect(() => {
    let filtered = [...allItems];
    if (yearFilter !== 'all') filtered = filtered.filter(i => String(getYear(i.date)) === yearFilter);
    if (festFilter === 'fest') filtered = filtered.filter(i => i.is_festival);
    if (festFilter === 'solo') filtered = filtered.filter(i => !i.is_festival);
    // Shuffle
    for (let i = filtered.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
    }
    // Assign random physics to each item
    setItems(filtered.map((item, idx) => ({
      ...item,
      rotation: (Math.random() * 16) - 8,
      zIndex: idx,
      throwX: (Math.random() - 0.5) * 200,
      throwY: (Math.random() * 100) + 100,
      throwRot: (Math.random() - 0.5) * 40,
    })));
  }, [allItems, yearFilter, festFilter]);

  const handleSelect = (item) => {
    setSelected(item);
    setTossing(false);
  };

  const handleDismiss = () => {
    setTossing(true);
    setTimeout(() => {
      setSelected(null);
      setTossing(false);
    }, 400);
  };

  // Escape key to dismiss
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape' && selected) handleDismiss(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selected]);

  const filterBtnStyle = (active, color = ACCENT) => ({
    background: active ? color : 'rgba(0,0,0,0.7)',
    border: `1px solid ${active ? color : '#555'}`,
    color: active ? '#000' : '#fff',
    fontFamily: "'Space Mono'",
    fontSize: 9,
    padding: '5px 12px',
    borderRadius: 4,
    cursor: 'pointer',
    fontWeight: active ? 900 : 400,
    transition: 'all 0.15s',
    backdropFilter: 'blur(4px)'
  });

  return (
<div style={{ position: 'relative', minHeight: 'auto', background: '#050508', paddingBottom: 40 }}>
      <style>{`
        @keyframes stubDrop {
          0% { opacity: 0; transform: translateY(-30px) rotate(var(--rot)); }
          60% { opacity: 1; transform: translateY(4px) rotate(var(--rot)); }
          100% { opacity: 1; transform: translateY(0) rotate(var(--rot)); }
        }
        @keyframes stubToss {
          0% { opacity: 1; transform: scale(1.1) rotate(0deg); }
          100% { opacity: 0; transform: translateX(var(--tx)) translateY(var(--ty)) rotate(var(--tr)); }
        }
        @keyframes stubHover {
          0% { transform: translateY(0) rotate(var(--rot)); }
          100% { transform: translateY(-8px) rotate(calc(var(--rot) * 0.5)); }
        }
        @keyframes neonPulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }
      `}</style>

      {/* Neon underglow — stronger */}
<div style={{
  position: 'absolute',
  bottom: 0, left: 0, right: 0,
  height: '60%',
  background: `radial-gradient(ellipse at 30% 100%, ${hexToRgba(C.teal, 0.25)} 0%, transparent 50%), radial-gradient(ellipse at 70% 100%, ${hexToRgba(C.purple, 0.2)} 0%, transparent 50%)`,
  animation: 'neonPulse 4s ease-in-out infinite'
}} />
{/* Glass surface sheen */}
<div style={{
  position: 'absolute',
  top: '20%', left: 0, right: 0,
  height: '2px',
  background: `linear-gradient(90deg, transparent 0%, ${hexToRgba(C.teal, 0.4)} 30%, ${hexToRgba(C.purple, 0.3)} 70%, transparent 100%)`,
  filter: 'blur(1px)'
}} />
{/* Grid — more visible */}
<div style={{
  position: 'absolute', inset: 0,
  backgroundImage: `linear-gradient(${hexToRgba(C.teal, 0.07)} 1px, transparent 1px), linear-gradient(90deg, ${hexToRgba(C.teal, 0.07)} 1px, transparent 1px)`,
  backgroundSize: '40px 40px'
}} />
{/* Corner glows */}
<div style={{
  position: 'absolute', bottom: 0, left: 0,
  width: '300px', height: '300px',
  background: `radial-gradient(circle, ${hexToRgba(C.teal, 0.15)} 0%, transparent 70%)`,
  pointerEvents: 'none'
}} />
<div style={{
  position: 'absolute', bottom: 0, right: 0,
  width: '300px', height: '300px',
  background: `radial-gradient(circle, ${hexToRgba(C.purple, 0.15)} 0%, transparent 70%)`,
  pointerEvents: 'none'
}} />

      {/* HEADER */}
      <div style={{ position: 'relative', zIndex: 10, padding: '30px 30px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20, marginBottom: 20 }}>
          <div>
            <div style={{ fontFamily: "'Space Mono'", fontSize: 8, color: C.teal, letterSpacing: 4, marginBottom: 6 }}>
              PHYSICAL ARCHIVE // {items.length} ITEMS ON TABLE
            </div>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: '3.5rem', color: C.white, lineHeight: 0.9, letterSpacing: 2 }}>
              STUB <span style={{ color: C.gold }}>CASE</span>
            </div>
          </div>

          {/* FILTERS */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <button style={filterBtnStyle(yearFilter === 'all')} onClick={() => setYearFilter('all')}>ALL YEARS</button>
            {years.map(y => (
              <button key={y} style={filterBtnStyle(String(yearFilter) === String(y))} onClick={() => setYearFilter(String(y))}>{y}</button>
            ))}
            <div style={{ width: 1, height: 20, background: C.border }} />
            <button style={filterBtnStyle(festFilter === 'all')} onClick={() => setFestFilter('all')}>ALL</button>
            <button style={filterBtnStyle(festFilter === 'fest')} onClick={() => setFestFilter('fest')}>FESTS</button>
            <button style={filterBtnStyle(festFilter === 'solo')} onClick={() => setFestFilter('solo')}>SOLO</button>
          </div>
        </div>
      </div>

      {/* THE PILE */}
      <div style={{
        position: 'relative', zIndex: 5,
        display: 'flex', flexWrap: 'wrap',
        gap: '0px',
        padding: '20px 40px 80px',
        alignItems: 'flex-start',
        justifyContent: 'center',
      }}>
        {items.map((item, idx) => (
          <div
            key={item.id}
            onClick={() => handleSelect(item)}
            style={{
              position: 'relative',
              display: 'inline-block',
              margin: item.type === 'wristband' ? '10px -20px' : '10px -15px',
              cursor: 'zoom-in',
              zIndex: item.zIndex,
              '--rot': `${item.rotation}deg`,
              '--tx': `${item.throwX}px`,
              '--ty': `${item.throwY}px`,
              '--tr': `${item.throwRot}deg`,
              animation: `stubDrop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${idx * 0.03}s both`,
              transition: 'transform 0.2s ease, z-index 0s',
              transform: `rotate(${item.rotation}deg)`,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.zIndex = 1000;
              e.currentTarget.style.transform = `translateY(-8px) rotate(${item.rotation * 0.5}deg)`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.zIndex = item.zIndex;
              e.currentTarget.style.transform = `rotate(${item.rotation}deg)`;
            }}
          >
            <img loading="lazy"
  src={item.url}
  alt={item.artist}
  style={{
    display: 'block',
    width: item.type === 'wristband' ? '220px' : '160px',
height: item.type === 'wristband' ? 'auto' : '80px',
objectFit: 'contain',
    borderRadius: 2,
    boxShadow: '0 8px 30px rgba(0,0,0,0.7), 0 2px 8px rgba(0,0,0,0.5)',
border: item.type === 'wristband' ? `2px solid ${hexToRgba(C.teal, 0.5)}` : '1px solid rgba(255,255,255,0.08)',
boxShadow: item.type === 'wristband' ? `0 8px 30px rgba(0,0,0,0.7), 0 0 15px ${hexToRgba(C.teal, 0.3)}` : '0 8px 30px rgba(0,0,0,0.7), 0 2px 8px rgba(0,0,0,0.5)',    userSelect: 'none',
    pointerEvents: 'none',
    transform: item.imgRotation ? `rotate(${item.imgRotation}deg)` : 'none',
  }}
/>
          </div>
        ))}

        {items.length === 0 && (
          <div style={{ padding: '100px 0', textAlign: 'center', color: C.grayDim }}>
            <div style={{ fontSize: '3rem', marginBottom: 20 }}>🎟️</div>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: '2rem', letterSpacing: 3 }}>CASE EMPTY</div>
            <div style={{ fontFamily: "'Space Mono'", fontSize: 9, marginTop: 10 }}>UPLOAD A TICKET STUB TO START YOUR COLLECTION</div>
          </div>
        )}
      </div>

      {/* LIGHTBOX */}
      {selected && (
        <div
          onClick={handleDismiss}
          style={{
            position: 'fixed', inset: 0, zIndex: 20000,
            background: 'rgba(0,0,0,0.92)',
            backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'zoom-out',
            padding: 40
          }}
        >
          <div
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
              animation: tossing
                ? `stubToss 0.4s cubic-bezier(0.4, 0, 1, 1) forwards`
                : 'fade-in-kf 0.3s ease both',
              '--tx': `${selected.throwX}px`,
              '--ty': `${selected.throwY}px`,
              '--tr': `${selected.throwRot * 3}deg`,
            }}
          >
            <img loading="lazy"
              src={selected.url}
              alt={selected.artist}
              style={{
                maxWidth: '85vw',
                maxHeight: '70vh',
                objectFit: 'contain',
                boxShadow: `0 30px 80px rgba(0,0,0,0.9), 0 0 40px ${hexToRgba(C.gold, 0.2)}`,
                border: '2px solid rgba(255,255,255,0.1)',
                borderRadius: 3
              }}
            />
            {/* Info plate */}
            <div style={{
              background: 'rgba(0,0,0,0.8)',
              border: `1px solid ${hexToRgba(C.gold, 0.3)}`,
              borderRadius: 6,
              padding: '12px 24px',
              textAlign: 'center',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.8rem', color: C.white, letterSpacing: 2, lineHeight: 1 }}>
                {selected.artist.toUpperCase()}
              </div>
              <div style={{ fontFamily: "'Space Mono'", fontSize: 9, color: C.gold, marginTop: 4, letterSpacing: 2 }}>
                {fmtDateShort(selected.date)} · {selected.venue?.toUpperCase()}
              </div>
              {selected.city && (
                <div style={{ fontFamily: "'Space Mono'", fontSize: 8, color: C.gray, marginTop: 3 }}>
                  {selected.city.toUpperCase()}, {selected.state}
                </div>
              )}
            </div>
            <div style={{ fontFamily: "'Space Mono'", fontSize: 8, color: 'rgba(255,255,255,0.3)', letterSpacing: 2 }}>
              CLICK ANYWHERE TO TOSS BACK
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── GLOBAL PRIVACY HOOK ─────────────────────────────────────────────────────
function usePhotoPrivacy() {
  const [photoPrivacy, setPhotoPrivacy] = React.useState({});
  const [currentUserId, setCurrentUserId] = React.useState(null);

  useEffect(() => {
    const fetchPrivacy = async () => {
      // Get ALL photos and their privacy settings (not just current user's)
      const { data, error } = await supabase
        .from('artifacts')
        .select('image_url, is_public, user_id')
        .eq('artifact_type', 'photo');

      if (!error && data) {
        const privacyMap = {};
        data.forEach(artifact => {
          privacyMap[artifact.image_url] = {
            isPublic: artifact.is_public,
            ownerId: artifact.user_id
          };
        });
        setPhotoPrivacy(privacyMap);
      }

      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUserId(session?.user?.id || null);
    };

    fetchPrivacy();
  }, []);

  // Helper function: should this photo be blurred for current viewer?
  const shouldBlurPhoto = (url) => {
    const photoData = photoPrivacy[url];
    if (!photoData) return false; // Default to visible if not in artifacts table
    if (photoData.isPublic) return false; // Public photos never blur
    if (currentUserId === photoData.ownerId) return false; // Owner sees their own
    return true; // Private photo, not the owner = blur it
  };

  return { photoPrivacy, shouldBlurPhoto, currentUserId };
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
  const [posters, setPosters] = useState([]);
  
  // ── 3. UI & NAVIGATION STATE ──
  const [activeTab, setActiveTab] = useState('dashboard');
  const [editTarget, setEditTarget] = useState(null);
  const [shareCard, setShareCard] = useState(null);
  const [upcomingModal, setUpcomingModal] = useState(null);
  const [nudgeTarget, setNudgeTarget] = useState(null);
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedSignals, setSelectedSignals] = useState([]);

  const { photoPrivacy, shouldBlurPhoto, currentUserId } = usePhotoPrivacy();


  const handleBulkSync = async () => {
  if (!selectedSignals || selectedSignals.length === 0) {
    alert("NO SIGNALS SELECTED");
    return;
  }
  if (!session?.user?.id) {
    alert("LOGIN REQUIRED TO CLONE SIGNALS");
    return;
  }

  console.log('🔄 Starting bulk sync for', selectedSignals.length, 'shows');

  let succeeded = 0;
  let failed = 0;

  for (const signal of selectedSignals) {
    try {
      console.log('Processing:', signal.artist, signal.date);
      
      const primaryArtist = signal.bands?.[0]?.name || signal.bands?.[0] || signal.artist || 'Unknown';
      const safeVenue = signal.venue || signal.festival_name || 'Unknown Venue';
      
      // Check if show already exists
      const { data: matchingShows } = await supabase
        .from('shows')
        .select('*')
        .eq('date', signal.date);
      
      let showId = null;
      if (matchingShows) {
        const match = matchingShows.find(s => 
          s.venue?.toLowerCase().includes(safeVenue.toLowerCase().substring(0, 10)) &&
          s.artist?.toLowerCase().includes(primaryArtist.toLowerCase().substring(0, 10))
        );
        showId = match?.id;
      }
      
      // Create show if it doesn't exist
      if (!showId) {
        console.log('Creating new show for', primaryArtist);
        const { data: newShow, error } = await supabase
          .from('shows')
          .insert([{
            date: signal.date,
            artist: primaryArtist,
            bands: signal.bands || [primaryArtist],
            venue: safeVenue,
            city: signal.city || '',
            state: signal.state || '',
            is_festival: signal.is_festival || false,
            festival_name: signal.festival_name || null,
            festival_day: signal.festival_day || null,
            genre: signal.genre || 'Indie Rock',
            created_by: session.user.id
          }])
          .select()
          .single();
        
        if (error) throw error;
        showId = newShow.id;
      }
      
      // Add your attendance
      console.log('Inserting attendance for show', showId);
      const { error: attError } = await supabase
        .from('attendances')
        .insert([{
          user_id: session.user.id,
          show_id: showId,
          is_public: true
        }]);
      
      if (attError) {
        if (attError.code === '23505') {
          console.log('Already exists, skipping');
        } else {
          throw attError;
        }
      }
      
      succeeded++;
      console.log('✅ Success:', primaryArtist);
      
    } catch (err) {
      failed++;
      console.error('❌ Failed:', signal.artist, err.message);
    }
  }
  
  alert(`✅ ${succeeded} synced, ${failed} failed`);
  console.log('Final:', { succeeded, failed });
  window.location.reload();
};

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
  const isAdmin = !!session?.user && !viewingUser;

  const userValue = useMemo(() => {
    return {
      user: session?.user || null,
      session: session,
      isAdmin: isOwner,
      loading: loading
    };
  }, [session, loading, isOwner]);

  const copyProfileLink = () => {
  // Logic: Gets the current user's profile URL
  const handle = session?.user?.user_metadata?.username || 'curator';
  const url = `${window.location.origin}/#/u/${handle}`;
  
  navigator.clipboard.writeText(url);
  alert("SIGNAL LINK COPIED: Share your museum with the network.");
 };

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

// 2. DATA SYNCHRONIZATION (THE BYPASS EDITION)
const initRan = useRef(false);

useEffect(() => { 
  if (THEMES[themeId]) Object.assign(C, THEMES[themeId]);

  const init = async () => {
    // 🟢 THE FIX: Let spectators in even if session is null
    if (!session?.user?.id && !viewingUser) return;

    setLoading(true);
    console.log("DATABASE FETCH: Initializing archive...");
    
    try {
  await Promise.all([
    fetchConcerts(),
    fetchUpcoming(),
    fetchPosters(),
    fetchGenres().catch(e => console.warn('Genres failed silently:', e))
  ]);
} catch (e) {
  console.error('ARCHIVE ERROR:', e);
} finally {
  setLoading(false);
}
};

  // Trigger if we have a session OR if we are teleporting to a public user
  // Reset initRan when viewingUser changes to allow re-fetching
  if ((session?.user?.id || viewingUser) && !authLoading) {
    if (!initRan.current || initRan.viewingUser !== viewingUser) {
      initRan.current = true;
      initRan.viewingUser = viewingUser;
      init();
    }
  }
}, [session, authLoading, themeId, viewingUser]);

// --- END OF REPAIRED SYSTEM BLOCK ---


const getCuratorTitle = (stats, concerts) => {
  if (stats.totalShows < 5) return "GHOST IN THE STACK";
  if (stats.festDays > (stats.totalShows * 0.5)) return "FESTIVAL NOMAD";
  if (stats.setlists > 10) return "SETLIST SCHOLAR";
  if (stats.photos > (stats.totalShows * 0.8)) return "FRONT ROW FREQUENCY";
  if (stats.uniqueArtists > (stats.totalShows * 0.9)) return "CRATE DIGGER";
  if (stats.totalShows > 100) return "LIFELONG HEADLINER";
  
  // Default fallback
  return "THE ARCHIVIST";
};
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
  if (!concerts || concerts.length === 0) return []; // 🟢 Add this line
  const ySet = new Set();
  concerts.forEach(c => { 
    const y = getYear(c?.date); // Use optional chaining
    if (y) ySet.add(String(y)); 
  });
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
        const g = isSet ? (artistGenres[r.artist] || 'Other') : (getConcertGenreInfo(r, artistGenres).genre || 'Other'); 
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

  const dayGroups = useMemo(() => {
  const filtered = applyFilters(concerts) || [];
  
  return filtered.map(concert => {
    // Safety check for missing dates
    if (!concert.date) return { ...concert, matchedPosters: [] };

    const concertYear = getYear(concert.date);
    
    return {
      ...concert,
      // 🛰️ POSTER SCAVENGER: Link master posters to this specific concert
      matchedPosters: posters.filter(p => {
        if (!p.date) return false;
        const posterYear = getYear(p.date);

        // Rule A: MULTI-DAY (Festival Year Anchor)
        if (p.poster_type === 'festival_year') {
          return (
            concert.is_festival &&
            p.festival_name === concert.festival_name && 
            posterYear === concertYear
          );
        }

        // Rule B: SINGLE DAY (Festival Day or Artist Gig Anchor)
        if (p.poster_type === 'festival_day' || p.poster_type === 'artist') {
          // festival_day needs a name + date match; artist just needs the date
          return p.poster_type === 'festival_day' 
            ? (p.date === concert.date && p.festival_name === concert.festival_name)
            : (p.date === concert.date);
        }

        return false;
      })
    };
  });
}, [concerts, applyFilters, posters]);
  const headerStats = useMemo(() => ({
    // ── YOUR ORIGINAL LOGIC (UNTOUCHED) ──
    totalShows: concerts?.length || 0,
    totalSets: allSetsList?.length || 0,
    uniqueArtists: new Set(allSetsList?.map(s => s.artist)).size,
    festDays: concerts?.filter(c => c.is_festival).length || 0,
    setlistCount: concerts?.filter(c => c.has_setlist || c.has_setlist_names).length || 0,

    // ── NEW ARTIFACT QUADRANT DATA ──
    tickets: concerts?.filter(c => c.image_url && c.image_url !== '').length || 0,
    setlists: concerts?.filter(c => c.has_setlist || c.has_setlist_names || c.setlist_image_url).length || 0,
   posters: posters?.length || 0,
    photos: concerts?.filter(c => c.personal_photo_url && c.personal_photo_url !== '').length || 0,
  }), [concerts, allSetsList, posters]);

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

// ── 🛡️ NEW HERO STATS (Calculated safely without touching existing code) ──
  const uniqueFestBrands = useMemo(() => {
    // Counts unique names (Bonnaroo = 1, regardless of how many times you went)
    return new Set(concerts.filter(c => c.is_festival && c.festival_name).map(c => c.festival_name.trim().toLowerCase())).size;
  }, [concerts]);

  const totalFestAttendances = useMemo(() => {
    // Counts unique name + year combos (Bonnaroo 2022 and Bonnaroo 2024 = 2)
    return new Set(concerts.filter(c => c.is_festival && c.festival_name).map(c => {
      const yr = c.date ? c.date.substring(0, 4) : 'Unknown';
      return `${c.festival_name.trim().toLowerCase()}-${yr}`;
    })).size;
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
  allSetsList.forEach(s => {
    // 🟢 THE FIX: Prioritize the show's actual genre, then the lookup, then 'Other'
    // This ensures all the SQL work we did actually shows up in the chart.
    const g = artistGenres[s.artist] || s.genre || 'Other';
    counts[g] = (counts[g] || 0) + 1;
  });

  return Object.entries(counts)
    .map(([name, count]) => ({
      name,
      count,
      // Fallback to a teal/cyan if the specific color is missing
      color: GENRE_COLORS[name] || GENRE_COLORS['Other'] || '#00f2ff'
    }))
    .sort((a, b) => b.count - a.count);
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
  window.location.hash = `#/u/${targetUsername}`;
  setActiveTab('dashboard');
  setOnLanding(false); // ← ADD THIS LINE
  window.dispatchEvent(new HashChangeEvent('hashchange'));
};

const handleSave = async (id, payload) => {
  console.log('🔍 handleSave called:', { id, isAdmin, hasSession: !!session });
  
  if (!session?.user?.id) {
    alert('No session - please refresh and login');
    return;
  }
  
  try {
    const primaryArtist = payload.bands?.[0]?.name || payload.artist || 'Unknown';
    
    if (id) {
      console.log('📝 Updating show:', id);
      
      const { error } = await supabase
        .from('shows')
        .update({
          date: payload.date,
          artist: primaryArtist,
          bands: payload.bands,
          venue: payload.venue || 'Unknown Venue',
          city: payload.city,
          state: payload.state,
          is_festival: payload.is_festival,
          festival_name: payload.festival_name,
          festival_day: payload.festival_day,
          genre: payload.is_festival ? 'Festival' : (payload.bands[0]?.genre || 'Indie Rock')
        })
        .eq('id', id);
      
      if (error) {
        console.error('Update error:', error);
        throw error;
      }
      
      console.log('✅ Show updated');
      
      // Handle artifacts
      await supabase.from('artifacts').delete().eq('show_id', id).eq('user_id', session.user.id);
      
      const artifacts = [];
      if (payload.image_url) payload.image_url.split(',').forEach(url => url.trim() && artifacts.push({ user_id: session.user.id, show_id: id, artifact_type: 'stub', image_url: url.trim(), is_public: true }));
      if (payload.personal_photo_url) payload.personal_photo_url.split(',').forEach(url => url.trim() && artifacts.push({ user_id: session.user.id, show_id: id, artifact_type: 'photo', image_url: url.trim(), is_public: true }));
      if (payload.setlist_image_url) payload.setlist_image_url.split(',').forEach(url => url.trim() && artifacts.push({ user_id: session.user.id, show_id: id, artifact_type: 'relic', image_url: url.trim(), is_public: true }));
      if (payload.wristband_image_url?.trim()) artifacts.push({ user_id: session.user.id, show_id: id, artifact_type: 'wristband', image_url: payload.wristband_image_url.trim(), is_public: true });
      
      if (artifacts.length > 0) {
        console.log('Adding artifacts:', artifacts.length);
        const { error: artError } = await supabase.from('artifacts').insert(artifacts);
        if (artError) console.error('Artifact error:', artError);
      }
      
      alert('✅ UPDATED');
      setEditTarget(null);
      if (typeof fetchData === 'function') await fetchData();
      if (typeof fetchConcerts === 'function') await fetchConcerts();
      return;
    }
    
    // NEW MODE
    const safeVenue = payload.venue || payload.festival_name || 'Unknown Venue';
    const { data: existingShow } = await supabase
      .from('shows')
      .select('id')
      .eq('date', payload.date)
      .ilike('venue', safeVenue)
      .ilike('artist', primaryArtist)
      .single();
    
    let showId = existingShow?.id;
    
    if (!showId) {
      const { data: newShow, error: showError } = await supabase
        .from('shows')
        .insert([{
          date: payload.date,
          artist: primaryArtist,
          bands: payload.bands,
          venue: safeVenue,
          city: payload.city,
          state: payload.state,
          is_festival: payload.is_festival,
          festival_name: payload.festival_name,
          festival_day: payload.festival_day,
          genre: payload.is_festival ? 'Festival' : (payload.bands[0]?.genre || 'Indie Rock'),
          created_by: session.user.id
        }])
        .select()
        .single();
      
      if (showError) throw showError;
      showId = newShow.id;
    }
    
    await supabase.from('attendances').upsert([{
      user_id: session.user.id,
      show_id: showId,
      is_public: true
    }], { onConflict: 'user_id,show_id' });
    
    const artifacts = [];
    if (payload.image_url) payload.image_url.split(',').forEach(url => artifacts.push({ user_id: session.user.id, show_id: showId, artifact_type: 'stub', image_url: url.trim(), is_public: true }));
    if (payload.personal_photo_url) payload.personal_photo_url.split(',').forEach(url => artifacts.push({ user_id: session.user.id, show_id: showId, artifact_type: 'photo', image_url: url.trim(), is_public: true }));
    if (payload.setlist_image_url) payload.setlist_image_url.split(',').forEach(url => artifacts.push({ user_id: session.user.id, show_id: showId, artifact_type: 'relic', image_url: url.trim(), is_public: true }));
    if (payload.wristband_image_url) artifacts.push({ user_id: session.user.id, show_id: showId, artifact_type: 'wristband', image_url: payload.wristband_image_url, is_public: true });
    
    if (artifacts.length > 0) {
      await supabase.from('artifacts').insert(artifacts);
    }
    
    setEditTarget(null);
    await fetchConcerts();

  } catch (error) {
    console.error("💥 SAVE ERROR:", error);
    alert('SAVE FAILED: ' + error.message);
  }
};
// ═══════════════════════════════════════════════════════════
// COLLABORATIVE ARCHIVE FETCHERS (New System)
// ═══════════════════════════════════════════════════════════

async function fetchShowArtifacts(showId) {
  const { data } = await supabase
    .from('artifacts')
    .select(`
      *,
      profile:profiles(username, avatar_color)
    `)
    .eq('show_id', showId)
    .eq('is_public', true);
  
  return data || [];
}

// ═══════════════════════════════════════════════════════

async function fetchConcerts() {
  const targetId = viewingUser || session?.user?.id;
  if (!targetId) return;
  
  // ✅ OPTIMIZED: Fetch attendances with shows joined in Postgres
  const { data: attendances } = await supabase
    .from('attendances')
    .select(`
      id,
      is_public,
      show:shows(
        id,
        date,
        artist,
        bands,
        venue,
        city,
        state,
        is_festival,
        festival_name,
        festival_day,
        genre
      )
    `)
    .eq('user_id', targetId)
    .eq('is_public', true)
    .order('date_added', { ascending: false });  // ✅ ADD THIS;
  
  console.log('COLLABORATIVE:', attendances?.length);
  
  // ✅ OPTIMIZED: Only fetch artifacts for shows the user attended
  const showIds = (attendances || []).map(a => a.show?.id).filter(Boolean);
  
  const { data: userArtifacts } = await supabase
  .from('artifacts')
  .select('*')
  .eq('user_id', targetId)
  .in('show_id', showIds);

// Filter by privacy - if viewing someone else, only show public artifacts
const filteredArtifacts = viewingUser 
  ? (userArtifacts || []).filter(art => art.is_public === true)
  : (userArtifacts || []);
  
  const collaborativeShows = (attendances || []).map(a => {
    const showArtifacts = (userArtifacts || []).filter(art => art.show_id === a.show.id);
    
    return {
      ...a.show,
      id: a.show.id,
      attendance_id: a.id,
      is_collaborative: true,
      user_id: targetId,
      image_url: showArtifacts.filter(art => art.artifact_type === 'stub').map(art => art.image_url).join(', '),
      personal_photo_url: showArtifacts.filter(art => art.artifact_type === 'photo').map(art => art.image_url).join(', '),
      setlist_image_url: showArtifacts.filter(art => art.artifact_type === 'relic').map(art => art.image_url).join(', '),
      wristband_image_url: showArtifacts.find(art => art.artifact_type === 'wristband')?.image_url || ''
    };
  });
  
// Sort by date descending (newest first)
const sorted = collaborativeShows.sort((a, b) => b.date.localeCompare(a.date));
setConcerts(sorted);

  console.log('FETCH:', { 
    collaborative: collaborativeShows.length, 
    total: collaborativeShows.length 
  });
  
  // 📡 AUTO-SYNC STATS TO PROFILE
  if (!viewingUser && session?.user?.id && collaborativeShows) {
    const totalShows = collaborativeShows.length;
    const totalSets = collaborativeShows.reduce((acc, c) => acc + (Array.isArray(c.bands) ? c.bands.length : 1), 0);
    const totalVenues = new Set(collaborativeShows.map(c => c.venue).filter(Boolean)).size;

    await supabase.from('profiles').update({
      total_shows: totalShows,
      total_sets: totalSets,
      total_venues: totalVenues,
      last_seen: new Date().toISOString()
    }).eq('id', session.user.id);
  }
}

// ✅ OPTIMIZED: Only fetch recent posters with limit
async function fetchPosters() {
  const targetId = viewingUser || session?.user?.id;
  if (!targetId) return;
  
  setPosters([]);
  
  const { data } = await supabase
    .from('posters')
    .select('*')
    .eq('user_id', targetId)
    .order('date', { ascending: false })
    .limit(200); // ✅ Cap at 200 most recent posters
  
  console.log('POSTERS FETCHED:', data?.length);
  if (data) setPosters(data);
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
  const targetId = viewingUser || session?.user?.id;
  if (!targetId) { console.log('fetchUpcoming: no target id'); return; }
  
  console.log('fetchUpcoming: starting');
  const { data } = await supabase
    .from('upcoming_concerts')
    .select('*')
    .eq('user_id', targetId)
    .order('date', { ascending: true });
    
  console.log('fetchUpcoming: done', data?.length);
  if (data) setUpcoming(data);
}

// ── 2. MODIFICATION HANDLERS (ADMIN ONLY) ──
async function handleDelete(id) {
  if (viewingUser) return; 
  if (!id || id === 'new') {
    setEditTarget(null);
    return;
  }

  const warningMsg = 
    "⚠️ CRITICAL SYSTEM WARNING\n\n" +
    "YOU ARE ABOUT TO PERMANENTLY ERASE THIS SIGNAL FROM THE ARCHIVE.\n" +
    "THIS ACTION CANNOT BE UNDONE.\n\n" +
    "DO YOU WISH TO PURGE THIS RECORD?";

  if (window.confirm(warningMsg)) {
    try {
      console.log(`PURGING SIGNAL: ${id}`);

      const concert = concerts.find(c => c.id === id);
      
      if (concert?.is_collaborative) {
        // Delete attendance (cascades to artifacts)
        await supabase
          .from('attendances')
          .delete()
          .eq('user_id', session.user.id)
          .eq('show_id', id);
        
        // Check if anyone else attended
        const { data: otherAttendees } = await supabase
          .from('attendances')
          .select('id')
          .eq('show_id', id);
        
        // If you were the only one, delete the show
        if (!otherAttendees || otherAttendees.length === 0) {
          await supabase.from('shows').delete().eq('id', id);
        }
      } else {
        // Old system fallback
        await supabase.from('concerts').delete().eq('id', id);
      }

      await fetchConcerts();
      setEditTarget(null);
      console.log("✅ SIGNAL PURGED");
      
    } catch (err) {
      console.error("Delete Error:", err);
      alert(`SYSTEM ERROR: PURGE FAILED // ${err.message.toUpperCase()}`);
    }
  }
}
  async function handleSetGenre(artist, genre) {
  if (!artist) return;
  
  // 1. Update the lookup table (existing behavior)
  const { error } = await supabase
    .from('artist_genres')
    .upsert({ artist_name: artist, genre: genre }, { onConflict: 'artist_name' });
  
  if (!error) {
    // 2. Update local state immediately (existing behavior)
    setArtistGenres(prev => ({ ...prev, [artist]: genre }));
    
    // 3. NEW: Update the embedded genre in concerts.bands for this artist
    // Find all concerts that contain this artist
    const affectedConcerts = concerts.filter(c =>
      (c.bands || []).some(b => getBandName(b) === artist)
    );
    
    for (const concert of affectedConcerts) {
      const updatedBands = concert.bands.map(b => {
        if (getBandName(b) === artist) {
          return typeof b === 'string' ? { name: b, genre } : { ...b, genre };
        }
        return b;
      });
      await supabase
        .from('concerts')
        .update({ bands: updatedBands })
        .eq('id', concert.id);
    }
  }
}

  const handleUpcomingSave = async (id, formData) => {
  if (viewingUser) return; // 🛡️ Stay in spectator mode
  try {
    // 🟢 THE FIX: Ensure the show is linked to the logged-in user
    const finalData = { 
      ...formData, 
      user_id: session?.user?.id 
    };

    if (id) {
      const { error } = await supabase
        .from('upcoming_concerts')
        .update(finalData) // Use stamped data
        .eq('id', id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('upcoming_concerts')
        .insert([finalData]); // Use stamped data
      if (error) throw error;
    }

    // Refresh the local list so the Marquee sees it
    await fetchUpcoming();
    
    // Close the modal
    setUpcomingModal(null);
    
    console.log("📡 SIGNAL SYNCED: Upcoming show added to archive.");
  } catch (err) {
    console.error("Save failed:", err);
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

  // Gate A: Auth Bootup
  if (authLoading) return (
    <div style={{ background: '#050508', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: "'Bebas Neue'", fontSize: '2rem', color: '#00e5cc', letterSpacing: '0.15em' }}>RECOVERING SIGNAL...</div>
    </div>
  );

  // Gate B: The Entry Hall (Landing Page)
  // 🟢 GATEKEEPER: Show landing page UNLESS they are viewing a public user
if ((!session && !viewingUser && !viewingUsername) || onLanding) {
    return (
      <LandingPage 
        currentSession={session}
        onEnterArchive={() => setOnLanding(false)}
        onNavigateToUser={handleNavigateToUser}
        onLogout={async () => {
          await supabase.auth.signOut();
          window.location.reload();
        }}
      />
    );
  }

  // Gate C: Data Synchronization (Interior)
  if (loading) return (
    <div style={{ background: C.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: "'Bebas Neue'", fontSize: '2rem', color: C.teal, letterSpacing: '0.15em' }}>SYNCHRONIZING ARCHIVE...</div>
    </div>
  );

  // ── 8. FINAL STAGE RENDER ──
  return (
    <ThemeContext.Provider value={themeCtx}>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100vh', 
        width: '100vw', 
        background: C.bg, 
        overflow: 'hidden' 
      }}>
        {/* News Ticker Bar */}
        <NewsTicker concerts={concerts} artistCounts={artistCounts} genreStats={genreStats} />

        {/* Main Application Content */}
        <div key={themeId} style={{ 
          flex: 1, 
          display: 'flex', 
          color: C.white,
          overflow: 'hidden', 
          width: '100%',
          position: 'relative'
        }}>
          <MarqueeStyles />

{/* Mobile drawer backdrop */}
{isMobile && !navCollapsed && (
  <div 
    onClick={() => setNavCollapsed(true)}
    style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      zIndex: 9999, backdropFilter: 'blur(4px)'
    }}
  />
)}

          {/* ── VERTICAL SIDEBAR ── */}
          <aside style={{
            // 🟢 Always 280px wide when visible. No more 0px or 80px on mobile.
            width: isMobile ? '280px' : (navCollapsed ? '80px' : '280px'),
            minWidth: isMobile ? '280px' : (navCollapsed ? '80px' : '280px'),
            height: '100%',
            position: isMobile ? 'fixed' : 'relative',
            top: 0,
            // 🟢 Move the whole drawer off-screen by its full width when collapsed
            left: isMobile && navCollapsed ? '-280px' : '0', 
            background: `linear-gradient(to right, ${C.bgCard} 0%, #050508 100%)`,
            borderRight: `1px solid ${C.border}`,
            display: 'flex',
            flexDirection: 'column',
            padding: '0',
            // 🟢 Sit on top of the header/content
            zIndex: 10002, 
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
          <div style={{ flex: 1, height: '100%', overflowY: 'auto', overflowX: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column', background: C.bg }}>
            
    {/* ─── FIXED NAVIGATION ─── */}
<header style={{ 
  background: '#050508', 
  position: 'sticky', 
  top: 0, 
  zIndex: 10001,
  display: 'flex', 
  flexDirection: 'column', 
  borderBottom: `1px solid ${C.border}`,
  flexShrink: 0 
}}>
  {isMobile ? (
    <>
      {/* MOBILE HEADER BAR */}
      <div style={{ 
        height: '56px',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        padding: '0 16px',
        background: '#050508',
        borderBottom: `1px solid ${C.border}`,
      }}>
        {/* Left: Hamburger */}
        <button 
          onClick={() => setNavCollapsed(false)}
          style={{ 
            background: 'none', border: 'none', color: C.teal, 
            fontSize: '22px', cursor: 'pointer', padding: '4px 8px',
            lineHeight: 1
          }}
        >
          ☰
        </button>

        {/* Center: Logo */}
        <img 
          src="https://pirqtmtzearmugvzhmgl.supabase.co/storage/v1/object/public/avatars/Screenshot%202026-04-20%20at%209.13.55%20AM.png"
          alt="TrackRecord"
          style={{ height: '28px', objectFit: 'contain' }}
        />

        {/* Right: Station + Add Signal */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button 
            onClick={() => { setActiveTab('community'); setNavCollapsed(true); }}
            style={{ 
              background: hexToRgba(C.purple, 0.15), 
              border: `1px solid ${C.purple}`, 
              color: C.purple, borderRadius: '4px',
              padding: '5px 8px', fontSize: '14px', cursor: 'pointer',
              lineHeight: 1
            }}
          >
            🚉
          </button>
          {!viewingUser && (
            <button 
              onClick={() => setEditTarget('new')}
              style={{ 
                background: C.teal, border: 'none', color: '#000', 
                borderRadius: '4px', padding: '5px 10px', 
                fontFamily: "'Bebas Neue'", fontSize: '1.1rem',
                cursor: 'pointer', fontWeight: 900, letterSpacing: 1
              }}
            >
              + SIGNAL
            </button>
          )}
        </div>
      </div>

      {/* MOBILE CURATOR TITLE */}
      <div style={{ 
        textAlign: 'center', 
        padding: '8px 0 4px',
        background: '#050508',
      }}>
        <div style={{ fontFamily: "'Space Mono'", fontSize: '6px', color: C.teal, letterSpacing: '4px', opacity: 0.6 }}>
          CURRENT CURATOR STATUS
        </div>
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.3rem', color: '#fff', letterSpacing: '3px', lineHeight: 1, textShadow: `0 0 15px ${hexToRgba(C.purple, 0.5)}` }}>
          {getCuratorTitle(headerStats, concerts)}
        </div>
      </div>
    </>
  ) : (
    /* DESKTOP HEADER — unchanged */
    <div style={{ 
      height: '60px', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      padding: '0 20px',
      background: `linear-gradient(90deg, #050508, ${hexToRgba(C.purple, 0.05)})`,
      position: 'relative', 
      gap: 10
    }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', zIndex: 2 }}>
        {viewingUser && (
          <button 
            onClick={() => {
              window.location.hash = '';
              setViewingUser(null);
              setActiveTab('dashboard');
              window.dispatchEvent(new HashChangeEvent('hashchange'));
            }}
            style={{
              background: C.gold,
              border: 'none',
              color: '#000',
              borderRadius: '4px',
              padding: '6px 14px',
              fontFamily: "'Space Mono'",
              fontSize: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 900,
              letterSpacing: '1px',
              animation: 'pulse 2s ease-in-out infinite',
              boxShadow: `0 0 20px ${C.gold}66`
            }}
          >
            <span style={{ fontSize: '12px' }}>🏠</span> GO HOME
          </button>
        )}
        <button onClick={() => setActiveTab('community')} style={navBtnStyle(activeTab === 'community', C.purple)}>
          <span>🚉</span> THE STATION
        </button>
        {!viewingUser && (
          <button 
            onClick={() => setEditTarget('new')}
            style={{
              background: 'none', border: `1px solid ${C.teal}`, color: C.teal, borderRadius: '4px',
              padding: '4px 10px', fontFamily: "'Space Mono'", fontSize: '10px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '5px'
            }}
          >
            <span style={{ fontSize: '14px', fontWeight: 'bold' }}>+</span> SIGNAL
          </button>
        )}
      </div>

      <div style={{
        position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
        width: '300px', pointerEvents: 'none', zIndex: 1
      }}>
        <div style={{ fontFamily: "'Space Mono'", fontSize: '7px', color: C.teal, letterSpacing: '4px', opacity: 0.6, marginBottom: 2 }}>
          CURRENT CURATOR STATUS:
        </div>
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.4rem', color: '#fff', letterSpacing: '3px', textShadow: `0 0 15px ${hexToRgba(C.purple, 0.5)}`, lineHeight: 1 }}>
          {getCuratorTitle(headerStats, concerts)}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', zIndex: 2 }}>
        {!viewingUser && (
          <button onClick={() => setActiveTab('manage')} style={navBtnStyle(activeTab === 'manage', C.teal)}>
            <span>⚙️</span> THE OFFICE
          </button>
        )}
        <ThemeSwitcher isMobile={false} />
      </div>
    </div>
  )}
</header>

{/* ─── MOBILE ONLY: HERO STATS (SCROLLABLE) ─── */}
{isMobile && (
  <div style={{
    background: '#000',
    borderBottom: `1px solid ${C.border}`,
    padding: '8px 10px',
  }}>
    {/* Row 1 — SHOW COUNTS */}
    <div style={{
      border: `2px solid ${C.purple}`,
      borderRadius: '8px',
      padding: '6px',
      marginBottom: headerStats.tickets + headerStats.setlists + headerStats.posters + headerStats.photos > 1 ? '6px' : '0',
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '6px',
      boxShadow: `0 0 20px ${hexToRgba(C.purple, 0.3)}, inset 0 0 20px ${hexToRgba(C.purple, 0.05)}`,
    }}>
      {[
        { val: headerStats.totalShows, lbl: 'DAYS', col: C.purple, click: () => setActiveTab('timeline') },
        { val: headerStats.uniqueArtists, lbl: 'ACTS', col: C.cyan, click: () => { setBrowseView('artists'); setActiveTab('browse'); }},
        { val: headerStats.totalSets, lbl: 'SETS', col: C.teal, click: () => { setBrowseView('shows'); setActiveTab('browse'); }},
        { val: new Set(concerts.map(c => c.venue).filter(Boolean)).size, lbl: 'VENUES', col: C.red, click: () => setActiveTab('venues') },
      ].map(s => (
        <div key={s.lbl} onClick={s.click} style={{
          background: hexToRgba(s.col, 0.05), border: `1.5px solid ${s.col}`,
          borderRadius: '6px', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          minHeight: '52px', boxShadow: `inset 0 0 10px ${hexToRgba(s.col, 0.15)}`
        }}>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.4rem', color: s.col, lineHeight: 1 }}>{s.val}</div>
          <div style={{ fontFamily: "'Space Mono'", fontSize: '6px', color: '#fff', opacity: 0.5, letterSpacing: '1px' }}>{s.lbl}</div>
        </div>
      ))}
    </div>

    {/* Row 2 — ARTIFACT COUNTS */}
    {[headerStats.tickets, headerStats.setlists, headerStats.posters, headerStats.photos].filter(v => v > 0).length >= 2 && (
      <div style={{
        border: `2px solid ${C.teal}`,
        borderRadius: '8px',
        padding: '6px',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '6px',
        boxShadow: `0 0 20px ${hexToRgba(C.teal, 0.3)}, inset 0 0 20px ${hexToRgba(C.teal, 0.05)}`,
      }}>
        {[
          { val: headerStats.tickets, lbl: 'TICKETS', col: C.gold, click: () => setActiveTab('stubs') },
          { val: headerStats.setlists, lbl: 'RELICS', col: C.teal, click: () => setActiveTab('vault') },
          { val: headerStats.posters, lbl: 'POSTERS', col: C.purple, click: () => setActiveTab('posterwall') },
          { val: headerStats.photos, lbl: 'PHOTOS', col: C.cyan, click: () => setActiveTab('photos') },
        ].map(s => (
          <div key={s.lbl} onClick={s.click} style={{
            background: hexToRgba(s.col, 0.05), border: `1.5px solid ${s.col}`,
            borderRadius: '6px', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            minHeight: '52px', boxShadow: `inset 0 0 10px ${hexToRgba(s.col, 0.15)}`
          }}>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.4rem', color: s.col, lineHeight: 1 }}>{s.val}</div>
            <div style={{ fontFamily: "'Space Mono'", fontSize: '6px', color: '#fff', opacity: 0.5, letterSpacing: '1px' }}>{s.lbl}</div>
          </div>
        ))}
      </div>
    )}
  </div>
)}

{/* ─── DESKTOP ONLY: HERO STATS BAR ─── */}
{!isMobile && (
  <div style={{ 
    display: 'grid', 
    gridTemplateColumns: 'repeat(7, 1fr)', 
    gap: '8px', 
    padding: '10px',
    background: '#000',
    borderBottom: `1px solid ${C.border}`
  }}>
    {[
  { val: new Set(concerts.map(c => c.venue).filter(Boolean)).size, lbl: 'VENUES', col: C.red, click: () => setActiveTab('venues') },
  { val: headerStats.totalShows, lbl: 'DAYS', col: C.purple, click: () => setActiveTab('timeline') },
  { val: headerStats.uniqueArtists, lbl: 'ACTS', col: C.cyan, click: () => { setBrowseView('artists'); setActiveTab('browse'); } },
  { val: headerStats.totalSets, lbl: 'SETS', col: C.teal, click: () => { setBrowseView('shows'); setActiveTab('browse'); } },
  { val: uniqueFestBrands, lbl: 'DIFFERENT FESTIVALS', col: C.gold, click: () => setActiveTab('passport') },
  { val: totalFestAttendances, lbl: 'FESTIVAL EDITIONS', col: C.gold, click: () => setActiveTab('passport') },
].map(s => (
      <div key={s.lbl} onClick={s.click} style={{
        background: hexToRgba(s.col, 0.05), border: `2px solid ${s.col}`,
        borderRadius: '8px', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        boxShadow: `inset 0 0 15px ${hexToRgba(s.col, 0.2)}`,
        minHeight: '90px'
      }}>
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: '2.2rem', color: s.col, lineHeight: 1, textShadow: `0 0 10px ${s.col}` }}>{s.val}</div>
        <div style={{ fontFamily: "'Space Mono'", fontSize: '7px', color: '#fff', opacity: 0.6, letterSpacing: '1px' }}>{s.lbl}</div>
      </div>
    ))}
    <div style={{ 
      background: hexToRgba(C.teal, 0.05), border: `2px solid ${C.teal}`, borderRadius: '8px',
      display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', 
      padding: '6px', gap: '6px', cursor: 'pointer', 
      boxShadow: `inset 0 0 15px ${hexToRgba(C.teal, 0.2)}`,
      minHeight: '90px'
    }} onClick={() => setActiveTab('vault')}>
      <QuadStat val={headerStats.tickets} label="STUBS" color={C.gold} />
<QuadStat val={headerStats.setlists} label="RELICS" color={C.teal} />
<QuadStat val={headerStats.posters} label="PRINTS" color={C.purple} />
<QuadStat val={headerStats.photos} label="CAPTURES" color={C.cyan} />
    </div>
  </div>
)}

<main style={{ padding: '20px', width: '100%', boxSizing: 'border-box' }}>
  {activeTab === 'dashboard' && (
  <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
    

    {concerts.length === 0 && !viewingUser ? (
  <OnboardingFlow 
    onComplete={() => window.location.reload()}
    onSkip={() => setActiveTab('manage')}
  />
) : (

      /* ─── EXISTING USER FLOW: THE FULL MUSEUM ─── */
      <>
        <OnThisDay concerts={concerts} />
        
        {/* ROW 1: SPINNER, MARQUEE, INSIGHTS */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 2fr 1fr', gap: 20 }}>
          
          {/* 🟢 1. RANDOM SHOW (NOW TOP LEFT / FIRST ON MOBILE) */}
          <RandomShow concerts={concerts} posters={posters} onAdd={() => setEditTarget('new')} />



          {/* ⚪ 2. THEATER MARQUEE (REMAINS MIDDLE) */}
          <TheaterMarquee 
            upcoming={upcoming} 
            onAdd={isAdmin ? () => setUpcomingModal('new') : null} 
            onEdit={isAdmin ? setUpcomingModal : null} 
          />

          {/* 🟡 3. ARTIST INSIGHTS (NOW TOP RIGHT / THIRD ON MOBILE) */}
          <ArtistInsights concerts={concerts} />
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

        {/* ─── ROW 2: ROTATION, SPOTLIGHT, CITIES (3 COLUMNS) ─── */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: 20, marginBottom: 20 }}>
          
          {/* 1. HEAVY ROTATION (LEFT) */}
          <Card neon style={{ height: 380, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <CardTitle>HEAVY ROTATION</CardTitle>
            <div className="hide-scroll" style={{ flex: 1, overflowY: 'auto', paddingRight: 4, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {artistCounts.filter(a => a.count >= 3).map((a, i) => {
                const VIP_PALETTE = [
                  { main: '#00f2ff', bg: 'rgba(0, 242, 255, 0.15)' },
                  { main: '#ff0055', bg: 'rgba(255, 0, 85, 0.15)' },
                  { main: '#ccff00', bg: 'rgba(204, 255, 0, 0.15)' },
                  { main: '#9d00ff', bg: 'rgba(157, 0, 255, 0.15)' },
                  { main: '#ffaa00', bg: 'rgba(255, 170, 0, 0.15)' }
                ];
                const c = VIP_PALETTE[i % VIP_PALETTE.length];

                return (
                  <div key={a.name} onClick={() => { setSearch(a.name); setBrowseView('shows'); setActiveTab('browse'); }} 
                       style={{ 
                         flexShrink: 0,
                         display: 'flex', alignItems: 'center', background: `linear-gradient(135deg, rgba(20,20,25,0.8) 0%, ${c.bg} 100%)`, border: `1px solid ${c.main}`, borderLeft: `4px solid ${c.main}`, borderRadius: 6, padding: '8px 10px', cursor: 'pointer', position: 'relative', overflow: 'hidden' 
                       }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#0a0a0a', border: `1.5px solid ${c.main}`, marginRight: 10, flexShrink: 0 }} />
                    <div style={{ flex: 1, zIndex: 2, minWidth: 0 }}>
                      <div style={{ fontFamily: "'Space Mono'", fontSize: 7, color: '#fff', letterSpacing: 1, marginBottom: 1, fontWeight: 900 }}>ALL ACCESS</div>
                      <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.2rem', color: '#fff', textShadow: `0 0 8px ${c.main}`, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: '1.2', paddingTop: '2px' }}>
                        {a.name.toUpperCase()}
                      </div>
                    </div>
                    <div style={{ zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#000', border: `1px solid ${c.main}`, padding: '2px 8px', borderRadius: 4, marginLeft: 8 }}>
                      <span style={{ fontFamily: "'Bebas Neue'", fontSize: '1.4rem', color: c.main, lineHeight: 1 }}>{a.count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* 2. ARTIFACT SPOTLIGHT (MIDDLE) */}
          <Card neon style={{ height: 380, display: 'flex', flexDirection: 'column' }}>
<ArtifactSpotlight concerts={concerts} posters={posters} onVault={() => setActiveTab('vault')} />
          </Card>

          {/* 3. CITY FOOTPRINT (RIGHT) */}
          <Card neon style={{ height: 380, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', background: '#08080c' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(0, 242, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 242, 255, 0.03) 1px, transparent 1px)', backgroundSize: '20px 20px', zIndex: 0, pointerEvents: 'none' }} />
            <svg style={{ position: 'absolute', top: 15, right: 15, width: 32, height: 32, zIndex: 1, filter: 'drop-shadow(0 0 6px rgba(0, 242, 255, 0.4))' }} viewBox="0 0 24 24" fill="none" stroke="rgba(0, 242, 255, 0.8)" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" /><ellipse cx="12" cy="12" rx="4" ry="10" /><path d="M2 12h20" /><path d="M4 7h16" /><path d="M4 17h16" />
            </svg>
            <CardTitle style={{ zIndex: 1 }}>CITY FOOTPRINT 📍</CardTitle>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', zIndex: 1, padding: '10px 0 5px' }}>
              {(() => {
                const counts = {};
                concerts.forEach(c => { if(c.city) { const city = c.city.split(',')[0].toUpperCase(); counts[city] = (counts[city] || 0) + 1; } });
                const topCities = Object.entries(counts).sort((a,b) => b[1]-a[1]).slice(0, 5);
                if (!topCities.length) return null;
                const COLORS = ['#ff4477', '#ffcc00', '#00f2ff', '#00cc88', '#00e5cc'];
                const SKYLINES = [
                  "M0,35 L5,35 L5,20 L12,20 L12,35 L16,35 L16,10 L22,10 L22,35 L28,35 L28,15 L35,15 L35,35 L40,35 L40,5 L48,5 L48,35 L52,35 L52,25 L60,25 L60,35 L65,35 L65,12 L72,12 L72,35 L78,35 L78,22 L85,22 L85,35 L90,35 L90,18 L98,18 L98,35 L100,35",
                  "M0,35 L8,35 L8,25 L15,25 L15,35 L20,35 L20,15 L28,15 L28,35 L32,35 L32,8 L36,8 L36,5 L42,5 L42,8 L46,8 L46,35 L52,35 L52,20 L60,20 L60,35 L68,35 L68,22 L75,22 L75,35 L80,35 L80,10 L88,10 L88,35 L92,35 L92,28 L100,28 L100,35",
                  "M0,35 L6,35 L6,22 L14,22 L14,35 L18,35 L18,10 L25,10 L25,35 L30,35 L30,28 L38,28 L38,35 L44,35 L44,15 L50,15 L50,35 L56,35 L56,8 L64,8 L64,35 L70,35 L70,25 L78,25 L78,35 L82,35 L82,18 L90,18 L90,35 L95,35 L95,20 L100,20",
                  "M0,35 L10,35 L10,25 L16,25 L16,35 L22,35 L22,12 L30,12 L30,35 L35,35 L35,20 L42,20 L42,35 L48,35 L48,10 L54,10 L54,5 L58,5 L58,10 L64,10 L64,35 L70,35 L70,22 L78,22 L78,35 L85,35 L85,15 L92,15 L92,35 L100,35",
                  "M0,35 L5,35 L5,28 L12,28 L12,35 L18,35 L18,18 L26,18 L26,35 L32,35 L32,25 L40,25 L40,35 L45,35 L45,8 L52,8 L52,35 L58,35 L58,22 L65,22 L65,35 L72,35 L72,15 L80,15 L80,35 L88,35 L88,20 L96,20 L96,35 L100,35"
                ];
                return topCities.map(([city, count], idx) => {
                  const cityHash = city.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                  const color = COLORS[idx % COLORS.length]; 
                  const path = SKYLINES[cityHash % SKYLINES.length]; 
                  return (
                    <div key={city} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 120 }}>
                        <div style={{ border: `1px solid ${color}`, borderRadius: 4, padding: '2px 6px', fontFamily: "'Space Mono'", fontSize: 11, color: color, boxShadow: `0 0 10px ${color}33, inset 0 0 5px ${color}22` }}>{String(idx + 1).padStart(2, '0')}</div>
                        <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.4rem', color: '#fff', letterSpacing: 1, textShadow: `0 0 8px ${color}44`, whiteSpace: 'nowrap' }}>{city}</div>
                      </div>
                      <div style={{ flex: 1, height: 40, position: 'relative', opacity: 0.8 }}>
                        <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 100 40" style={{ filter: `drop-shadow(0 0 4px ${color})` }}><path d={path} fill="none" stroke={color} strokeWidth="1.2" /></svg>
                      </div>
                      <div style={{ border: `1px solid rgba(0, 242, 255, 0.4)`, borderRadius: 4, padding: '3px 8px', fontFamily: "'Space Mono'", fontSize: 12, color: '#00f2ff', fontWeight: 900, minWidth: 45, textAlign: 'center' }}>{count}</div>
                    </div>
                  );
                });
              })()}
            </div>
          </Card>
        </div>

        {/* ─── ROW 3: DNA, WEB, RHYTHM, VAULT (4 COLUMNS) ─── */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr 1fr', gap: 20, paddingBottom: 40 }}>
          <div style={{ height: 300 }}><SonicDNA stats={genreStats} onGenreClick={handleGenreClick} /></div>
          <Card neon style={{ height: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 15, fontFamily: "'Space Mono'", fontSize: 9, color: C.teal, letterSpacing: 2, fontWeight: 900 }}>// FULL SPECTRUM</div>
            {(() => {
              const allValid = genreStats.filter(g => g.count > 0);
              if (allValid.length < 3) return <div style={{ fontSize: 10, color: C.grayDim }}>AWAITING DATA...</div>;
              const maxCount = allValid[0].count;
              const scores = {};
              allValid.forEach(g => { scores[g.name] = Math.round((g.count / maxCount) * 100); });
              return <div style={{ transform: 'scale(0.85)', marginTop: 20 }}><SetlistDNA genreScores={scores} /></div>;
            })()}
          </Card>
          <Card neon style={{ height: 300, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <CardTitle>THE RHYTHM 🔊</CardTitle>
            <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '20px 10px 0' }}>
              {(() => {
                const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
                const counts = [0,0,0,0,0,0,0];
                concerts.forEach(c => { if(c.date) counts[new Date(c.date + 'T12:00:00').getDay()]++; });
                const max = Math.max(...counts, 1);
                return days.map((day, i) => {
                  const heightPct = Math.max((counts[i] / max) * 100, 5);
                  const isWeekend = day === 'FRI' || day === 'SAT';
                  const barColor = isWeekend ? C.gold : C.teal;
                  return (
                    <div key={day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, width: '12%', height: '100%', justifyContent: 'flex-end' }}>
                      <div style={{ fontFamily: "'Space Mono'", fontSize: 8, color: '#fff' }}>{counts[i] || ''}</div>
                      <div style={{ width: '100%', height: `${heightPct}%`, background: `linear-gradient(to top, ${barColor}22, ${barColor})`, borderRadius: '4px 4px 0 0', boxShadow: `0 -5px 15px ${barColor}66` }} />
                      <div style={{ fontFamily: "'Space Mono'", fontSize: 8, color: isWeekend ? '#fff' : C.gray, fontWeight: isWeekend ? 900 : 400 }}>{day[0]}</div>
                    </div>
                  );
                });
              })()}
            </div>
          </Card>
          <Card neon style={{ height: 300, display: 'flex', flexDirection: 'column', background: '#050508' }}>
            <CardTitle>DIAGNOSTICS 💻</CardTitle>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 15, fontFamily: "'Space Mono'", fontSize: 11 }}>
              {(() => {
                const uniqueBands = new Set();
                let firstDate = '2099-01-01';
                let totalMedia = 0;
                concerts.forEach(c => {
                  (c.bands || []).forEach(b => uniqueBands.add(b));
                  if (c.date && c.date < firstDate) firstDate = c.date;
                  if (c.image_url) totalMedia++;
                  if (c.setlist_image_url) totalMedia++;
                  if (c.personal_photo_url) totalMedia++;
                });
                return (
                  <>
                    <div><span style={{ color: C.gray }}>SYS.BANDS_LOGGED:</span> <span style={{ color: C.gold, fontWeight: 900, textShadow: `0 0 8px ${C.gold}` }}>{uniqueBands.size}</span></div>
                    <div><span style={{ color: C.gray }}>SYS.TOTAL_EVENTS:</span> <span style={{ color: C.teal, fontWeight: 900, textShadow: `0 0 8px ${C.teal}` }}>{concerts.length}</span></div>
                    <div><span style={{ color: C.gray }}>SYS.MEDIA_VAULT:</span> <span style={{ color: '#9d00ff', fontWeight: 900, textShadow: `0 0 8px #9d00ff` }}>{totalMedia} FILES</span></div>
                    <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px dashed ${C.border}` }}>
                      <span style={{ color: C.gray, fontSize: 9 }}>ARCHIVE_GENESIS:</span><br/>
                      <span style={{ color: '#fff', fontSize: 10 }}>{firstDate !== '2099-01-01' ? fmtDate(firstDate).toUpperCase() : 'UNKNOWN'}</span>
                    </div>
                  </>
                );
              })()}
            </div>
          </Card>
        </div>
      </>
    )}
  </div>
)}

  {/* 2. CHRONICLE & TOUR BUS TABS */}
  {activeTab === 'timeline' && <TimelineTab concerts={concerts} setActiveTab={setActiveTab} genreMap={artistGenres} />}
  
  {activeTab === 'byDay' && (
  <ByDayTab 
    dayGroups={dayGroups} 
    onEdit={isAdmin ? setEditTarget : null} 
    genreMap={artistGenres} 
    isAdmin={isAdmin}
    viewingUser={viewingUser}
    bulkMode={bulkMode}
    setBulkMode={setBulkMode}
    selectedSignals={selectedSignals}
    setSelectedSignals={setSelectedSignals}
    onSync={handleBulkSync}
    posters={posters} // 🟢 CRITICAL: Ensure this prop is passed
  />
)}
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
                  onClick={async (e) => {
  e.stopPropagation();
  
  const { data: { session: currentSession } } = await supabase.auth.getSession();
  if (!currentSession?.user) {
    alert("LOGIN REQUIRED");
    return;
  }

  try {
    const primaryArtist = (c.bands?.[0]?.name || c.bands?.[0] || c.artist || 'Unknown').toString();
    const safeVenue = c.venue || c.festival_name || 'Unknown Venue';
    
    const { data: matchingShows } = await supabase
      .from('shows')
      .select('*')
      .eq('date', c.date);
    
    let showId = null;
    if (matchingShows) {
      const match = matchingShows.find(s => 
        s.venue?.toLowerCase().includes(safeVenue.toLowerCase().substring(0, 10)) &&
        s.artist?.toLowerCase().includes(primaryArtist.toLowerCase().substring(0, 10))
      );
      showId = match?.id;
    }
    
    if (!showId) {
      const { data: newShow } = await supabase
        .from('shows')
        .insert([{
          date: c.date,
          artist: primaryArtist,
          bands: c.bands || [primaryArtist],
          venue: safeVenue,
          city: c.city || '',
          state: c.state || '',
          is_festival: c.is_festival || false,
          festival_name: c.festival_name || null,
          festival_day: c.festival_day || null,
          genre: c.genre || 'Indie Rock',
          created_by: currentSession.user.id
        }])
        .select()
        .single();
      
      showId = newShow.id;
    }
    
    await supabase.from('attendances').insert([{
      user_id: currentSession.user.id,
      show_id: showId,
      is_public: true
    }]);
    
    alert(`⚡ CLONED: ${primaryArtist}`);
    
  } catch (err) {
    if (err.code === '23505') {
      alert("ALREADY IN YOUR ARCHIVE");
    } else {
      alert("CLONE FAILED: " + err.message);
    }
  }
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

  {activeTab === 'byFest' && (
  <ByFestTab 
    festGroupings={festGroupings} 
    genreMap={artistGenres} 
    isAdmin={isAdmin} 
    onEdit={isAdmin ? setEditTarget : null} 
    posters={posters} // 🟢 Ensure this is passed
  />
)}
  {activeTab === 'community' && <CommunityTab onEnterMuseum={handleNavigateToUser} />}
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
{activeTab === 'hof' && <HallOfFame sets={allSetsList} genreMap={artistGenres} posters={posters} onShare={(a, s) => setShareCard({ artist: a, shows: s })} />}
  
  {activeTab === 'vault' && <SetlistVaultTab concerts={concerts} genreMap={artistGenres} />}
  
{activeTab === 'photos' && <PhotoVaultTab concerts={concerts} shouldBlurPhoto={shouldBlurPhoto} currentUserId={currentUserId} />}

{activeTab === 'shows' && <CollaborationWebTab />}


  {activeTab === 'stubs' && (
  <StubCaseTab 
    concerts={concerts} 
    isAdmin={isAdmin} 
    onEdit={setEditTarget}
    artistGenres={artistGenres}
  />
)}

{activeTab === 'posterwall' && (
  <PosterWallTab 
    posters={posters}
    concerts={concerts}
    isAdmin={isAdmin}
    onRefresh={fetchPosters}
  />
)}
  
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
    /* 🟢 THE CRITICAL CONNECTIONS */
    viewingUser={viewingUser}
    bulkMode={bulkMode}
    setBulkMode={setBulkMode}
    selectedSignals={selectedSignals}
    setSelectedSignals={setSelectedSignals}
    onSync={handleBulkSync} // <-- Ensure this line is exactly handleBulkSync
  />
)}

  {/* 6. ADMIN OFFICE */}
{isAdmin && activeTab === 'manage' && (
  <ManageTab 
    concerts={concerts} 
    onEdit={setEditTarget} 
    onAdd={() => setEditTarget('new')} 
    onDuplicate={handleDuplicate}
    session={session}
    onFetchData={fetchConcerts} // 🟢 Passes the data refresher down
  />
)}

{isAdmin && activeTab === 'tagger' && <RelicTaggerTab />}

{/* ── DEBUG (REMOVE AFTER TESTING) ── */}
{console.log('DEBUG:', { 
  viewingUser: viewingUser, 
  session: session, 
  shouldShow: viewingUser && !session 
})}

{/* ── SPECTATOR CTA BANNER (Only on public profiles when not logged in) ── */}
{viewingUser && !session?.user?.id && (
  <div style={{
    position: 'fixed',
    bottom: 0,
    left: isMobile ? 0 : (navCollapsed ? '80px' : '280px'),
    right: 0,
    zIndex: 10000,
    background: `linear-gradient(135deg, ${C.teal}22 0%, ${C.purple}22 100%)`,
    backdropFilter: 'blur(20px)',
    borderTop: `3px solid ${C.teal}`,
    padding: isMobile ? '20px 20px' : '24px 40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 20,
    flexWrap: 'wrap',
    boxShadow: `0 -20px 60px rgba(0,229,204,0.3), 0 0 100px rgba(153,102,255,0.2)`,
    transition: 'left 0.3s ease-in-out'
  }}>
    <div>
      <div style={{
        fontFamily: "'Bebas Neue'",
        fontSize: isMobile ? '1.2rem' : '1.5rem',
        color: '#fff',
        letterSpacing: 2,
        marginBottom: 4
      }}>
        Want Your Own Concert Archive?
      </div>
      <div style={{
        fontFamily: "'Space Mono'",
        fontSize: isMobile ? 9 : 10,
        color: C.gray,
        letterSpacing: 1
      }}>
        Track your shows, upload artifacts, build your timeline
      </div>
    </div>
    
    <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
      <button
        onClick={() => {
          window.location.href = 'https://concert-tracker-eight.vercel.app';
        }}
        style={{
          background: C.teal,
          color: '#000',
          border: 'none',
          padding: isMobile ? '12px 24px' : '14px 32px',
          fontFamily: "'Bebas Neue'",
          fontSize: isMobile ? '1.1rem' : '1.3rem',
          letterSpacing: 3,
          cursor: 'pointer',
          borderRadius: 4,
          transition: 'all 0.2s',
          boxShadow: `0 0 20px rgba(0,229,204,0.4)`,
          fontWeight: 900
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = `0 0 30px rgba(0,229,204,0.6)`;
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = `0 0 20px rgba(0,229,204,0.4)`;
        }}
      >
        START FREE
      </button>
      
      <button
        onClick={() => {
          window.location.href = 'https://concert-tracker-eight.vercel.app';
        }}
        style={{
          background: 'transparent',
          color: C.gray,
          border: `1px solid ${C.gray}`,
          padding: isMobile ? '12px 24px' : '14px 32px',
          fontFamily: "'Space Mono'",
          fontSize: 9,
          letterSpacing: 2,
          cursor: 'pointer',
          borderRadius: 4,
          transition: 'all 0.2s'
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = C.teal;
          e.currentTarget.style.color = C.teal;
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = C.gray;
          e.currentTarget.style.color = C.gray;
        }}
      >
        ← BACK
      </button>
    </div>
  </div>
)}

</main>

            {/* ── MODALS LAYER ── */}
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
                    <button onClick={() => { setEditTarget({ ...nudgeTarget, isNudge: true }); setNudgeTarget(null); }} style={{ padding: '20px', background: C.teal, color: '#000', border: 'none', borderRadius: 8, fontFamily: "'Bebas Neue'", fontSize: '1.2rem', cursor: 'pointer' }}>ARCHIVE NOW</button>
                    <button onClick={() => setNudgeTarget(null)} style={{ padding: '20px', background: 'transparent', border: `1px solid ${C.border}`, color: C.gray, borderRadius: 8, fontFamily: "'Bebas Neue'", fontSize: '1.2rem', cursor: 'pointer' }}>IGNORE SIGNAL</button>
                  </div>
                </div>
              </div>
            )}
            {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
            {shareCard && <ShareCard artist={shareCard.artist} shows={shareCard.shows} onClose={() => setShareCard(null)} />}
            {editTarget && <EditModal concert={editTarget === 'new' ? 'new' : editTarget} onClose={() => setEditTarget(null)} onSave={editTarget?.isNudge ? (id, payload) => handleReconcile(editTarget.id, payload) : handleSave} onDelete={handleDelete} allConcerts={concerts} />}
            {upcomingModal !== null && <UpcomingModal show={upcomingModal === 'new' ? null : upcomingModal} onClose={() => setUpcomingModal(null)} onSave={handleUpcomingSave} onDelete={handleUpcomingDelete} />}
          </div>
        </div>
      </div>
    </ThemeContext.Provider>
  );
}

// ── AUTHENTICATION COMPONENT (Defined ONCE) ──
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
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 20000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(12px)' }}>
      <div style={{ background: '#0a0a0c', border: `1px solid ${C.teal}`, padding: 40, borderRadius: 12, width: '100%', maxWidth: 360, boxShadow: '0 0 60px 0px rgba(0,242,255,0.2)', textAlign: 'center' }}>
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: '2.5rem', color: C.teal, marginBottom: 10, letterSpacing: 3 }}>ADMIN LOGIN</div>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
          <input type="email" placeholder="ADMIN EMAIL" value={email} onChange={e => setEmail(e.target.value)} style={{ background: '#000', border: '1px solid #222', color: '#fff', padding: '14px', fontFamily: "'Space Mono'", fontSize: '12px', outline: 'none' }} />
          <input type="password" placeholder="PASSWORD" value={password} onChange={e => setPassword(e.target.value)} style={{ background: '#000', border: '1px solid #222', color: '#fff', padding: '14px', fontFamily: "'Space Mono'", fontSize: '12px', outline: 'none' }} />
          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, background: 'transparent', border: '1px solid #333', color: '#666', padding: '12px', cursor: 'pointer', fontFamily: "'Space Mono'", fontSize: '10px' }}>ABORT</button>
            <button type="submit" disabled={loading} style={{ flex: 2, background: C.teal, border: 'none', color: '#000', padding: '12px', cursor: 'pointer', fontFamily: "'Bebas Neue'", fontSize: '1.2rem', fontWeight: 900 }}>{loading ? 'VERIFYING...' : 'INITIALIZE'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}