// src/components/MatchItem.jsx
import React, { useState } from 'react';
import api from '../services/api';
import styles from './MatchItem.module.css'; // Optional CSS Module
import { useAuth } from '../hooks/useAuth'; // To check if user is authenticated
import { getTeamLogo } from '../assets/logoMap';
import { useNavigate } from 'react-router-dom';

const MatchItem = ({ match, liveScoreData, onBetPlaced, bettingAllowed, roundInfo}) => {
  const { isAuthenticated } = useAuth(); // Check login status
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [betAmount, setBetAmount] = useState('');
  const [potentialPayout, setPotentialPayout] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isMatchTimePassed = new Date(match.start_time) <= new Date();

  // Betting is allowed if the round is active, the match hasn't started, AND the user is logged in.
  const overallBettingAllowed = isAuthenticated && bettingAllowed && !isMatchTimePassed;

  // Determine current scores to display
  let displayHomeScore = match.result_home_score;
  let displayAwayScore = match.result_away_score;
  let displayStatus = match.status;

  if (liveScoreData) { // If live score data exists for this match
      if (liveScoreData.status === 'Live') {
          displayHomeScore = liveScoreData.home;
          displayAwayScore = liveScoreData.away;
          displayStatus = 'Live';
      } else if (liveScoreData.status === 'Completed' || liveScoreData.status === 'Finished') {
          displayHomeScore = liveScoreData.home;
          displayAwayScore = liveScoreData.away;
          displayStatus = 'Completed'; // Standardize to 'Completed'
      }
  }

  //Handler Functions

  const handleTeamSelect = (team, odds) => {
    if (!overallBettingAllowed) return; // Prevent selection if betting not allowed
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

  const handleLoggedOutBetClick = () => {
      // Navigate to the login page when a logged-out user clicks an odds button
      navigate('/login');
  };

  // End Handler Functions

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
  const matchKickoffTime = new Date(match.start_time);
  const formattedKickoffTime = matchKickoffTime.toLocaleTimeString('en-US', { // 'en-US' for 12-hour format with AM/PM
    hour: 'numeric',
    minute: '2-digit',
    hour12: true, // Explicitly use 12-hour format
  }).toLowerCase(); // e.g., "7:50pm"

  const formattedKickoffDate = matchKickoffTime.toLocaleDateString('en-US', {
      weekday: 'long', // e.g., Thursday
      day: 'numeric',   // e.g., 5
      month: 'long',   // e.g., June
  }).toUpperCase(); // THURSDAY 5TH JUNE

  const homeLogo = getTeamLogo(match.home_team);
  const awayLogo = getTeamLogo(match.away_team);

  // --- Determine dynamic class for the match item based on status ---
   let matchItemClasses = styles.matchItem;
   if (match.status === 'Live') {
       matchItemClasses += ` ${styles.liveMatch}`;
   } else if (match.status === 'Completed') {
       matchItemClasses += ` ${styles.completedMatch}`;
   }
   

  return (
    <div className={matchItemClasses}>
      <div className={styles.matchDateHeader}>
          {formattedKickoffDate}
      </div>

      <div className={styles.matchDetailsRow}> {/* This is our main flex container for top part */}
        {/* Home Team Name (far left) */}
        <div className={`${styles.teamNameBlock} ${styles.homeTeamNameBlock}`}>
          <span className={styles.teamName}>{match.home_team}</span>
        </div>

        {/* Home Team Logo (closer to center) */}
        {homeLogo && <img src={homeLogo} alt={`${match.home_team} logo`} className={`${styles.teamLogo} ${styles.homeLogo}`} />}

        {/* Center Area: Time / Scores */}
        <div className={styles.matchCenter}>
            {match.status === 'Scheduled' && (
                <span className={styles.kickoffTime}>{formattedKickoffTime}</span>
            )}
            {(match.status === 'Live' || match.status === 'Completed') && (
                <div className={styles.liveScoreDisplay}>  {/* This will be flex-direction: column */}
                    {/* New wrapper for the scores to be in a row */}
                    <div className={styles.scoreRow}>
                        <span className={`${styles.score} ${match.winner === match.home_team && match.status === 'Completed' ? styles.winningScore : ''}`}>
                            {displayHomeScore ?? '-'}
                        </span>
                        <span className={styles.scoreSeparator}>-</span> {/* Separator for scores */}
                        <span className={`${styles.score} ${match.winner === match.away_team && match.status === 'Completed' ? styles.winningScore : ''}`}>
                            {displayAwayScore ?? '-'}
                        </span>
                    </div>
                    {/* Status text will be the next item in the column flow */}
                    <span className={styles.centerStatusText}>
                        {match.status === 'Live' ? 'LIVE' :
                         match.status === 'Completed' ? 'FULL TIME' :
                         match.status}
                    </span>
                </div>
            )}
            {match.status === 'Postponed' && <span className={styles.centerStatusText}>POSTPONED</span>}
            {match.status === 'Cancelled' && <span className={styles.centerStatusText}>CANCELLED</span>}
        </div>

        {/* Away Team Logo (closer to center) */}
        {awayLogo && <img src={awayLogo} alt={`${match.away_team} logo`} className={`${styles.teamLogo} ${styles.awayLogo}`} />}

        {/* Away Team Name (far right) */}
        <div className={`${styles.teamNameBlock} ${styles.awayTeamNameBlock}`}>
           <span className={styles.teamName}>{match.away_team}</span>
        </div>
      </div>

      {/* Odds Buttons Area */}
      {isAuthenticated && match.status === 'Scheduled' && !isMatchTimePassed && (
        <div className={styles.oddsRow}> {/* New wrapper for centering odds blocks */}
            <div className={styles.oddsBlock}> {/* Block for home team odds */}
                <button
                    onClick={isAuthenticated ? () => handleTeamSelect(match.home_team, match.home_odds) : handleLoggedOutBetClick}
                    className={`${styles.oddsButton} ${selectedTeam === match.home_team ? styles.selected : ''}`}
                    disabled={!overallBettingAllowed || !match.home_odds || loading}
                >
                    ${match.home_odds?.toFixed(2) || 'N/A'}
                </button>
            </div>

            <div className={styles.oddsSeparator}></div> {/* Keeps its role */}

            <div className={styles.oddsBlock}> {/* Block for away team odds */}
                <button
                    onClick={() => handleTeamSelect(match.away_team, match.away_odds)}
                    className={`${styles.oddsButton} ${selectedTeam === match.away_team ? styles.selected : ''}`}
                    disabled={!overallBettingAllowed || !match.away_odds || loading}
                >
                    ${match.away_odds?.toFixed(2) || 'N/A'}
                </button>
            </div>
        </div>
      )}

      {/* Betting Input Area (Conditional) */}
      {isAuthenticated && selectedTeam && overallBettingAllowed && match.status === 'Scheduled' && (
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

       {isAuthenticated && error && <p className={styles.error}>{error}</p>}
       {isAuthenticated && success && <p className={styles.success}>{success}</p>}

       {/* Login Prompt or reason why betting is disabled */}
       {!isAuthenticated && (
           <p className={styles.loginPrompt}>Please log in to place bets.</p>
       )}
       {isAuthenticated && match.status === 'Scheduled' && !overallBettingAllowed && bettingAllowed && isMatchTimePassed && (
          <p className={styles.bettingDisabledReason}>Betting closed: Match has started.</p>
       )}
       {isAuthenticated && match.status === 'Scheduled' && !overallBettingAllowed && !bettingAllowed && (
           <p className={styles.bettingDisabledReason}>Betting only allowed for 'Active' rounds.</p>
       )}
       {/* Display message if match is not scheduled (e.g., Live, Completed) */}
       {isAuthenticated && match.status !== 'Scheduled' && (
           <p className={styles.bettingDisabledReason}>Betting not available: Match is {match.status.toLowerCase()}.</p>
       )}
    </div>
  );
};

export default MatchItem;