// src/pages/LeaderboardPage.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import styles from './LeaderboardPage.module.css'; // Create this CSS module

const LeaderboardPage = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // TODO: Add state for pagination later

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch global leaderboard (add pagination params later: ?page=X&limit=Y)
        const response = await api.get('/leaderboard/global');
        setLeaderboard(response.data.leaderboard || []); // Ensure it's an array
        // Store pagination info if needed later
        // setPaginationInfo({
        //   currentPage: response.data.current_page,
        //   totalPages: response.data.total_pages,
        //   totalUsers: response.data.total_users
        // });
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
        setError('Could not load the leaderboard. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []); // Run once on mount

  const formatCurrency = (amount) => {
    return `$${Number(amount).toFixed(2)}`;
  };


  if (loading) return <div className={styles.loading}>Loading leaderboard...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.leaderboardContainer}>
      <h2>Global Leaderboard</h2>
      {leaderboard.length === 0 ? (
        <p>The leaderboard is currently empty.</p>
      ) : (
        <table className={styles.leaderboardTable}>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Username</th>
              <th>Bankroll</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry) => (
              <tr key={entry.user_id}>
                <td>{entry.rank}</td>
                <td>{entry.username}</td>
                 {/* TODO: Make username a Link to a profile page later */}
                 {/* <td><Link to={`/profile/${entry.user_id}`}>{entry.username}</Link></td> */}
                <td>{formatCurrency(entry.bankroll)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
       {/* TODO: Add pagination controls here later */}
    </div>
  );
};

export default LeaderboardPage;