// src/components/BetItem.jsx
import React from 'react';
import styles from './BetItem.module.css'; // We'll create this CSS module

const BetItem = ({ bet }) => {

  const formatCurrency = (amount) => {
    return `$${Number(amount).toFixed(2)}`;
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleString(undefined, {
        dateStyle: 'short',
        timeStyle: 'short',
    });
  };

  // Determine styling and return based on status
  let statusClass = styles.pending;
  let outcomeText = '';
  let returnAmount = 0;

  if (bet.status === 'Won') {
    statusClass = styles.won;
    returnAmount = parseFloat(bet.potential_payout);
    outcomeText = `Won: ${formatCurrency(returnAmount)}`;
  } else if (bet.status === 'Lost') {
    statusClass = styles.lost;
    outcomeText = 'Lost';
    returnAmount = 0; // Lost bets return 0
  } else if (bet.status === 'Void') {
    statusClass = styles.void;
    returnAmount = parseFloat(bet.amount); // Void bets return stake
    outcomeText = `Void (Stake Returned): ${formatCurrency(returnAmount)}`;
  } else {
    // Pending or Active
    statusClass = styles.pending;
    outcomeText = `Potential Payout: ${formatCurrency(bet.potential_payout)}`;
  }

  return (
    <div className={`${styles.betItem} ${statusClass}`}>
      <div className={styles.matchDetails}>
        <strong>{bet.home_team} vs {bet.away_team}</strong>
        <span>(Round {bet.round_number})</span>
        <span className={styles.matchTime}>Starts: {formatDateTime(bet.match_start_time)}</span>
      </div>
      <div className={styles.betDetails}>
        <span>Selected: <strong>{bet.team_selected}</strong></span>
        <span>Stake: {formatCurrency(bet.amount)}</span>
        <span>Odds: {bet.odds_at_placement}</span>
      </div>
      <div className={styles.outcome}>
          <span>Status: <strong>{bet.status}</strong></span>
          <span className={styles.outcomeAmount}>{outcomeText}</span>
      </div>
       <div className={styles.timestamps}>
          <span>Placed: {formatDateTime(bet.placement_time)}</span>
          {bet.settlement_time && <span>Settled: {formatDateTime(bet.settlement_time)}</span>}
       </div>
    </div>
  );
};

export default BetItem;