import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from './supabaseClient';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie
} from 'recharts';

// --- STYLES ---
const styles = {
  container: { padding: '20px', fontFamily: 'system-ui, sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh' },
  header: { textAlign: 'center', marginBottom: '30px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' },
  card: { background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' },
  cardTitle: { fontSize: '0.875rem', color: '#64748b', marginBottom: '5px', textTransform: 'uppercase' },
  cardValue: { fontSize: '1.875rem', fontWeight: '700', color: '#1e293b' },
  chartSection: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '30px' },
  tableContainer: { background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  th: { padding: '12px 15px', background: '#f1f5f9', color: '#475569', fontWeight: '600', fontSize: '0.875rem' },
  td: { padding: '12px 15px', borderBottom: '1px solid #e2e8f0', fontSize: '0.875rem' },
  searchBar: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '20px', fontSize: '1rem' }
};

const App = () => {
  const [concerts, setConcerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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
    } catch (error) {
      console.error('Error fetching data:', error.message);
    } finally {
      setLoading(false);
    }
  }

  // --- DATA PROCESSING ---
  const stats = useMemo(() => {
    const totalShows = concerts.length;
    const artists = new Set();
    const venues = new Set();
    const artistCounts = {};

    concerts.forEach(c => {
      c.bands?.forEach(b => {
        artists.add(b);
        artistCounts[b] = (artistCounts[b] || 0) + 1;
      });
      if (c.venue) venues.add(c.venue);
    });

    const topArtist = Object.entries(artistCounts)
      .sort((a, b) => b[1] - a[1])[0] || ['None', 0];

    return { totalShows, artistCount: artists.size, venueCount: venues.size, topArtist };
  }, [concerts]);

  const filteredConcerts = concerts.filter(c => 
    c.bands?.some(b => b.toLowerCase().includes(searchTerm.toLowerCase())) ||
    c.venue?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.fest_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Tuning the instruments...</div>;

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>🎸 Eric's Concert Tracker</h1>
        <p>A history of live music since 1999</p>
      </header>

      {/* STATS ROW */}
      <div style={styles.statsGrid}>
        <div style={styles.card}>
          <div style={styles.cardTitle}>Total Shows</div>
          <div style={styles.cardValue}>{stats.totalShows}</div>
        </div>
        <div style={styles.card}>
          <div style={styles.cardTitle}>Unique Artists</div>
          <div style={styles.cardValue}>{stats.artistCount}</div>
        </div>
        <div style={styles.card}>
          <div style={styles.cardTitle}>Venues Visited</div>
          <div style={styles.cardValue}>{stats.venueCount}</div>
        </div>
        <div style={styles.card}>
          <div style={styles.cardTitle}>Most Seen</div>
          <div style={styles.cardValue}>{stats.topArtist[0]} ({stats.topArtist[1]}x)</div>
        </div>
      </div>

      <input 
        type="text" 
        placeholder="Search by artist, venue, or festival..." 
        style={styles.searchBar}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* TABLE */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Event / Festival</th>
              <th style={styles.th}>Bands Seen</th>
              <th style={styles.th}>Venue</th>
              <th style={styles.th}>Location</th>
            </tr>
          </thead>
          <tbody>
            {filteredConcerts.map((c, i) => (
              <tr key={i}>
                <td style={styles.td}>{new Date(c.date).toLocaleDateString()}</td>
                <td style={styles.td}>{c.fest_name || 'Individual Show'}</td>
                <td style={styles.td}>{c.bands?.join(', ')}</td>
                <td style={styles.td}>{c.venue}</td>
                <td style={styles.td}>{c.city}, {c.state}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default App;