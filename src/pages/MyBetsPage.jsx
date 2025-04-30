// src/pages/MyBetsPage.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import BetItem from '../components/BetItem';
import styles from './MyBetsPage.module.css'; // Create this CSS module

const MyBetsPage = () => {
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBets = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get('/bets'); // Fetch all bets for user
        setBets(response.data.bets || []); // Ensure bets is an array
      } catch (err) {
        console.error("Error fetching bets:", err);
        setError('Could not load your bets. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBets();
  }, []);

  // Filter bets into categories
  const pendingBets = bets.filter(bet => bet.status === 'Pending' || bet.status === 'Active');
  const settledBets = bets.filter(bet => ['Won', 'Lost', 'Void'].includes(bet.status));

  if (loading) return <div className={styles.loading}>Loading your bets...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.myBetsContainer}>
      <h2>My Bets</h2>

      <section className={styles.betsSection}>
        <h3>Pending Bets</h3>
        {pendingBets.length > 0 ? (
          pendingBets.map(bet => <BetItem key={bet.bet_id} bet={bet} />)
        ) : (
          <p>No pending bets.</p>
        )}
      </section>

      <section className={styles.betsSection}>
        <h3>Settled Bets</h3>
        {settledBets.length > 0 ? (
          settledBets.map(bet => <BetItem key={bet.bet_id} bet={bet} />)
        ) : (
          <p>No settled bets yet.</p>
        )}
      </section>
    </div>
  );
};

export default MyBetsPage;