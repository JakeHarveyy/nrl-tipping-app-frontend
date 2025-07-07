// src/components/AIPredictionDisplay.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AIPredictionDisplay.module.css';

const AIPredictionDisplay = ({ prediction }) => {
  const navigate = useNavigate();

  if (!prediction) {
    // Render nothing or a placeholder if no prediction is available
    return null;
  }

  const {
    home_win_probability,
    away_win_probability,
    predicted_winner,
    model_confidence,
    betting_recommendation,
    confidence_level,
    kelly_criterion_stake
  } = prediction;

  // Determine colors and styles based on confidence level
  const confidenceClass = styles[confidence_level?.toLowerCase()] || styles.low;

  const home_percent = (home_win_probability * 100).toFixed(1);
  const away_percent = (away_win_probability * 100).toFixed(1);

  return (
    <div className={styles.aiPredictionContainer}>
      <div className={styles.aiHeader}>
        <span className={styles.aiIcon}>🤖</span>
        <span className={styles.aiTitle}>AI Analysis</span>
        <button 
          className={styles.infoButton}
          onClick={() => navigate('/ai-info')}
          aria-label="Learn more about AI predictions"
        >
          ℹ️
        </button>
      </div>

      {/* Probability Progress Bar */}
      <div className={styles.probabilityBar}>
        <div className={styles.homeProb} style={{ width: `${home_percent}%` }}>
          {home_percent}%
        </div>
        <div className={styles.awayProb} style={{ width: `${away_percent}%` }}>
          {away_percent}%
        </div>
      </div>

      {/* AI Pick Details */}
      <div className={styles.predictionDetails}>
        <span className={styles.pickIcon}>⚡</span>
        <div className={styles.predictionContent}>
          <p>
            <strong>AI Pick:</strong> <span className={styles.predictedWinner}>{predicted_winner}</span>
            <span className={`${styles.confidenceBadge} ${confidenceClass}`}>
              {confidence_level} - {(model_confidence * 100).toFixed(0)}%
            </span>
          </p>
        </div>
      </div>

      {/* Betting Recommendation */}
      {betting_recommendation && betting_recommendation !== 'No Bet' && (
        <div className={styles.betRecommendation}>
          <span className={styles.betIcon}>💰</span>
          <div className={styles.predictionContent}>
            <p>
              <strong>Recommended Bet:</strong> <span className={styles.recommendedTeam}>{betting_recommendation.replace(' Bet', '')}</span>
              <span className={styles.stake}>
                {(kelly_criterion_stake * 100).toFixed(1)}% of bankroll
              </span>
            </p>
          </div>
        </div>
      )}

      {betting_recommendation === 'No Bet' && (
        <div className={styles.noBetRecommendation}>
          <span className={styles.warningIcon}>⚠️</span>
          <p><strong>No Bet Recommended</strong> - Odds don't provide good value</p>
        </div>
      )}
    </div>
  );
};

export default AIPredictionDisplay;