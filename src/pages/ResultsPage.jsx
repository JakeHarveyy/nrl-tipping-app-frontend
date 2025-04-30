// src/pages/ResultsPage.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import styles from './ResultsPage.module.css'; // Create this CSS module

const ResultsPage = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // TODO: Add filtering by round later

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch matches with status 'Completed'
        // Add query params for specific round later if needed (?round_number=X&year=Y)
        const response = await api.get('/matches?status=Completed');
        // Sort by start time descending (most recent first)
        const sortedResults = (response.data.matches || []).sort((a, b) =>
            new Date(b.start_time) - new Date(a.start_time)
        );
        setResults(sortedResults);
      } catch (err) {
        console.error("Error fetching results:", err);
        setError('Could not load match results. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []); // Run once on mount

  const formatDateTime = (isoString) => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
    });
  };

  if (loading) return <div className={styles.loading}>Loading results...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.resultsContainer}>
      <h2>Match Results</h2>
      {/* TODO: Add Round filter dropdown here */}
      {results.length === 0 ? (
        <p>No completed matches found.</p>
      ) : (
        <ul className={styles.resultsList}>
          {results.map((match) => (
            <li key={match.match_id} className={styles.resultItem}>
              <div className={styles.matchHeader}>
                 <span>Round {match.round_number} ({match.year})</span>
                 <span>{formatDateTime(match.start_time)}</span>
              </div>
              <div className={styles.matchScore}>
                  <span className={match.winner === match.home_team ? styles.winner : ''}>
                      {match.home_team}
                  </span>
                  <strong className={styles.score}>
                      {match.result_home_score ?? '-'} | {match.result_away_score ?? '-'}
                  </strong>
                   <span className={match.winner === match.away_team ? styles.winner : ''}>
                       {match.away_team}
                  </span>
              </div>
              {match.winner && match.winner !== 'Draw' && (
                <div className={styles.winnerInfo}>Winner: <strong>{match.winner}</strong></div>
              )}
               {match.winner === 'Draw' && (
                <div className={styles.winnerInfo}><strong>Draw</strong></div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ResultsPage;