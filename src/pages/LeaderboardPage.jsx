// src/pages/LeaderboardPage.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import styles from './LeaderboardPage.module.css';
import { useAuth } from '../hooks/useAuth';

const LeaderboardPage = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [currentUserEntry, setCurrentUserEntry] = useState(null);
  const { user } = useAuth();
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

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Effect to find and mark the current user's entry in the leaderboard
  useEffect(() => {
    if (user && leaderboard.length > 0) {
      // Try to find user by username (most reliable) or ID
      const userEntry = leaderboard.find(entry => 
        entry.username === user.username ||
        String(entry.user_id) === String(user.id)
      );
      
      setCurrentUserEntry(userEntry || null);
    }
  }, [user, leaderboard]);

  const formatCurrency = (amount) => {
    return `$${Number(amount).toFixed(2)}`;
  };

  const getRankIcon = (rank) => {
    // Convert rank to number to handle string values
    const numRank = Number(rank);
    
    switch (numRank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return rank;
    }
  };

  const isCurrentUser = (entry) => {
    // Check if this entry matches our known current user entry
    if (currentUserEntry) {
      return String(entry.user_id) === String(currentUserEntry.user_id);
    }
    
    // Fallback to username comparison if we haven't identified the current user entry
    return user && entry.username === user.username;
  };

  const isBot = (entry) => {
    // Check multiple possible field names and values
    const botResult = entry.is_bot === true || 
                     entry.is_bot === 1 || 
                     entry.is_bot === "true" ||
                     entry.bot === true ||
                     entry.bot === 1 ||
                     entry.username === 'LogisticsRegressionBot' ||
                     entry.username?.toLowerCase().includes('bot');
    return botResult;
  };

  const getPodiumEntries = () => {
    return leaderboard.slice(0, 3).sort((a, b) => {
      // Sort for podium display: 2nd, 1st, 3rd
      const order = { 1: 2, 2: 1, 3: 3 };
      return order[a.rank] - order[b.rank];
    });
  };

  const getRemainingEntries = () => {
    return leaderboard.slice(3);
  };


  if (loading) return (
    <div className={styles.leaderboardContainer}>
      <div className={styles.loading}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading leaderboard...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className={styles.leaderboardContainer}>
      <div className={styles.error}>
        <h3>Oops! Something went wrong</h3>
        <p>{error}</p>
      </div>
    </div>
  );

  return (
    <div className={styles.leaderboardContainer}>
      <div className={styles.header}>
        <h2>🏆 Global Leaderboard</h2>
        <p className={styles.subtitle}>See how you stack up against other tippers!</p>
      </div>

      {leaderboard.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🎯</div>
          <h3>No rankings yet!</h3>
          <p>Be the first to place some bets and climb the leaderboard!</p>
        </div>
      ) : (
        <>
          {/* Podium Section for Top 3 */}
          {leaderboard.length >= 3 && (
            <div className={styles.podiumSection}>
              <h3 className={styles.podiumTitle}>🏆 Top 3 Champions</h3>
              <div className={styles.podium}>
                {getPodiumEntries().map((entry) => (
                  <div 
                    key={entry.user_id} 
                    className={`${styles.podiumPosition} ${styles[`position${entry.rank}`]} ${isCurrentUser(entry) ? styles.currentUser : ''} ${isBot(entry) ? styles.botUser : ''}`}
                  >
                    <div className={styles.podiumRank}>
                      {getRankIcon(entry.rank)}
                    </div>
                    <div className={styles.podiumUser}>
                      <div className={styles.podiumUsername}>
                        {entry.username}
                        {isCurrentUser(entry) && <span className={styles.youBadge}>YOU</span>}
                        {isBot(entry) && <span className={styles.botBadge}>AI</span>}
                      </div>
                      <div className={styles.podiumBankroll}>
                        {formatCurrency(entry.bankroll)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Full Leaderboard Table */}
          <div className={styles.tableSection}>
            <h3 className={styles.tableTitle}>Complete Rankings</h3>
            
            <div className={styles.tableWrapper}>
              <table className={styles.leaderboardTable}>
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Player</th>
                    <th>Bankroll</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry) => (
                    <tr 
                      key={entry.user_id} 
                      className={`${isCurrentUser(entry) ? styles.currentUserRow : entry.rank <= 3 ? styles.topThree : isBot(entry) ? styles.botUserRow : ''}`}
                    >
                      <td className={styles.rankCell}>
                        <span className={styles.rankDisplay}>
                          {getRankIcon(entry.rank)}
                        </span>
                      </td>
                      <td className={styles.usernameCell}>
                        <span className={styles.username}>
                          {entry.username}
                          {isCurrentUser(entry) && <span className={styles.youBadge}>YOU</span>}
                          {isBot(entry) && <span className={styles.botBadge}>AI</span>}
                        </span>
                      </td>
                      <td className={styles.bankrollCell}>
                        <span className={styles.bankrollAmount}>
                          {formatCurrency(entry.bankroll)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Mobile Card Layout (shown on very small screens) */}
            <div className={styles.mobileCardList}>
              {leaderboard.map((entry) => (
                <div 
                  key={`mobile-${entry.user_id}`} 
                  className={`${styles.mobileCard} ${isCurrentUser(entry) ? styles.currentUserCard : entry.rank <= 3 ? styles.topThreeCard : isBot(entry) ? styles.botUserCard : ''}`}
                >
                  <div className={styles.mobileCardLeft}>
                    <div className={styles.mobileCardRank}>
                      {getRankIcon(entry.rank)}
                    </div>
                    <div className={styles.mobileCardUsername}>
                      {entry.username}
                      {isCurrentUser(entry) && <span className={styles.youBadge}>YOU</span>}
                      {isBot(entry) && <span className={styles.botBadge}>AI</span>}
                    </div>
                  </div>
                  <div className={styles.mobileCardRight}>
                    <div className={styles.mobileCardBankroll}>
                      {formatCurrency(entry.bankroll)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      {/* TODO: Add pagination controls here later */}
    </div>
  );
};

export default LeaderboardPage;