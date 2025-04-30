// src/components/MatchList.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api'; // Your Axios instance
import MatchItem from './MatchItem'; // Create this component next
import styles from './MatchList.module.css'; // Optional: Use CSS Modules

const MatchList = ({ onBetPlaced }) => { // Accept callback for after bet placement
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch matches with status 'Scheduled' (or adjust as needed)
        const response = await api.get('/matches/upcoming?status=Scheduled');
        // Filter out matches that might have started just before fetch completes
        const now = new Date();
        const upcomingMatches = response.data.matches.filter(match =>
            new Date(match.start_time) > now
        );
        setMatches(upcomingMatches);
      } catch (err) {
        console.error("Error fetching matches:", err);
        setError('Could not load upcoming matches. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
    // TODO: Optionally add polling or WebSocket for live odds updates later
    // const intervalId = setInterval(fetchMatches, 30000); // Example: Refresh every 30 seconds
    // return () => clearInterval(intervalId); // Cleanup on unmount
  }, []); // Empty dependency array means run once on mount

  if (loading) return <p>Loading matches...</p>;
  if (error) return <p className={styles.error}>{error}</p>;
  if (matches.length === 0) return <p>No upcoming matches scheduled.</p>;

  return (
    <div className={styles.matchListContainer}>
      <h2>Upcoming Matches</h2>
      {matches.map((match) => (
        <MatchItem key={match.match_id} match={match} onBetPlaced={onBetPlaced} />
      ))}
    </div>
  );
};

export default MatchList;