// src/components/MatchItem.jsx
import React, { useState } from 'react';
import api from '../services/api';
import styles from './MatchItem.module.css'; // Optional CSS Module
import { useAuth } from '../hooks/useAuth'; // To check if user is authenticated
import { getTeamLogo } from '../assets/logoMap';

const MatchItem = ({ match, onBetPlaced, bettingAllowed, roundInfo}) => {
  const { isAuthenticated } = useAuth(); // Check login status
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [betAmount, setBetAmount] = useState('');
  const [potentialPayout, setPotentialPayout] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const isMatchTimePassed = new Date(match.start_time) <= new Date();

  const handleTeamSelect = (team, odds) => {
    if (team === selectedTeam) {
      // Deselect if clicked again
      setSelectedTeam(null);
      setPotentialPayout(0);
    } else {
      setSelectedTeam(team);
      calculatePayout(betAmount, odds);
    }
    setError(''); // Clear error on new selection
    setSuccess('');
  };

  const handleAmountChange = (e) => {
    const amount = e.target.value;
     // Allow only numbers and one decimal point (basic validation)
    if (/^\d*\.?\d{0,2}$/.test(amount) || amount === '') {
      setBetAmount(amount);
      const odds = teamToOdds(selectedTeam);
      calculatePayout(amount, odds);
    }
    setError(''); // Clear error on amount change
    setSuccess('');
  };

  const teamToOdds = (teamName) => {
      if (teamName === match.home_team) return match.home_odds;
      if (teamName === match.away_team) return match.away_odds;
      return 0;
  }

  const calculatePayout = (amount, odds) => {
    const numAmount = parseFloat(amount);
    const numOdds = parseFloat(odds);
    if (!isNaN(numAmount) && numAmount > 0 && !isNaN(numOdds) && numOdds > 0) {
      setPotentialPayout((numAmount * numOdds).toFixed(2));
    } else {
      setPotentialPayout(0);
    }
  };

  const handlePlaceBet = async () => {
    if (!selectedTeam || !betAmount || parseFloat(betAmount) <= 0) {
      setError('Please select a team and enter a valid positive bet amount.');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await api.post('/bets/place', {
        match_id: match.match_id,
        team_selected: selectedTeam,
        amount: betAmount, // Send as string, backend converts to Decimal
      });
      console.log("Bet placement response:", response.data);
      setSuccess(`Bet placed successfully on ${selectedTeam} for $${betAmount}!`);
      // Clear form after successful bet
      setSelectedTeam(null);
      setBetAmount('');
      setPotentialPayout(0);
      // Notify parent component (e.g., Dashboard) to refresh bankroll/bets
      if(onBetPlaced) onBetPlaced();

    } catch (err) {
      console.error("Bet placement failed:", err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Could not place bet. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Format date/time nicely
  const matchTime = new Date(match.start_time);
  const formattedTime = matchTime.toLocaleString(undefined, {
    dateStyle: 'medium', // e.g., Apr 20, 2025
    timeStyle: 'short',   // e.g., 7:50 PM
  });

  const homeLogo = getTeamLogo(match.home_team);
  const awayLogo = getTeamLogo(match.away_team);

  // TODO: Add countdown timer later

  return (
    <div className={styles.matchItem}>
      {/* Top section: Teams and Time */}
      <div className={styles.matchDetails}>
        {/* Home Team */}
        <div className={`${styles.teamInfo} ${styles.homeTeam}`}>
          <span className={styles.teamName}>{match.home_team}</span>
          {homeLogo && <img src={homeLogo} alt={`${match.home_team} logo`} className={styles.teamLogo} />}
        </div>

        {/* Time */}
        <div className={styles.matchTime}>
            {formattedTime}
        </div>

        {/* Away Team */}
        <div className={`${styles.teamInfo} ${styles.awayTeam}`}>
           {awayLogo && <img src={awayLogo} alt={`${match.away_team} logo`} className={styles.teamLogo} />}
           <span className={styles.teamName}>{match.away_team}</span>
        </div>
      </div>

      {/* Odds Buttons Area */}
      {/* Disable if not authenticated OR bettingNotAllowed OR match has started */}
      {isAuthenticated && (
        <div className={styles.oddsArea}>
           <button
             onClick={() => handleTeamSelect(match.home_team, match.home_odds)}
             className={`${styles.oddsButton} ${selectedTeam === match.home_team ? styles.selected : ''}`}
             disabled={!bettingAllowed || isMatchTimePassed || !match.home_odds || loading} // <<< MODIFIED
           >
              ${match.home_odds?.toFixed(2) || 'N/A'}
           </button>
           <button
             onClick={() => handleTeamSelect(match.away_team, match.away_odds)}
             className={`${styles.oddsButton} ${selectedTeam === match.away_team ? styles.selected : ''}`}
             disabled={!bettingAllowed || isMatchTimePassed || !match.away_odds || loading} // <<< MODIFIED
           >
              ${match.away_odds?.toFixed(2) || 'N/A'}
           </button>
        </div>
      )}

      {/* Betting Input Area (Conditional) */}
      {isAuthenticated && selectedTeam && bettingAllowed && !isMatchTimePassed && (
        <div className={styles.betInputArea}>
             <label htmlFor={`amount-${match.match_id}`}>Bet Amount ($):</label>
             <input
               type="text"
               inputMode="decimal"
               id={`amount-${match.match_id}`}
               value={betAmount}
               onChange={handleAmountChange}
               placeholder="0.00"
               className={styles.amountInput}
               disabled={loading}
             />
             <button
               onClick={handlePlaceBet}
               disabled={!bettingAllowed || isMatchTimePassed || !selectedTeam || !betAmount || parseFloat(betAmount) <= 0 || loading}
               className={styles.placeBetButton}
             >
               {loading ? 'Placing...' : 'Place Bet'}
             </button>
             {potentialPayout > 0 && (
                 <span className={styles.payout}>Returns: ${potentialPayout}</span>
             )}
        </div>
      )}

       {/* Error/Success Messages */}
       {isAuthenticated && error && <p className={styles.error}>{error}</p>}
       {isAuthenticated && success && <p className={styles.success}>{success}</p>}

       {/* Show reason if betting is not allowed */}
      {isAuthenticated && !isMatchTimePassed && !bettingAllowed && roundInfo?.status !== 'Active' && (
          <p className={styles.bettingDisabledReason}>Betting only allowed for 'Active' rounds.</p>
      )}
      {isAuthenticated && isMatchTimePassed && (
          <p className={styles.bettingDisabledReason}>Betting closed: Match has started or finished.</p>
      )}

       {/* Login Prompt */}
       {!isAuthenticated && (
           <p className={styles.loginPrompt}>Please log in to place bets.</p>
       )}
    </div>
  );
};

export default MatchItem;