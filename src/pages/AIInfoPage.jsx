// src/pages/AIInfoPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AIInfoPage.module.css';

const AIInfoPage = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.aiInfoPage}>
      <div className={styles.container}>
        <header className={styles.header}>
          <button 
            className={styles.backButton} 
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            ← Back
          </button>
          <h1 className={styles.title}>
            <span className={styles.aiIcon}>🤖</span>
            AI Prediction System
          </h1>
        </header>

        <div className={styles.content}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>⚡</span>
              AI Pick Predictions
            </h2>
            <div className={styles.card}>
              <p className={styles.description}>
                Our advanced AI model analyzes 60+ engineered features to predict the most likely winner of each match:
              </p>
              
              <div className={styles.featureDetails}>
                <h3>Key Feature Categories:</h3>
                <div className={styles.featureGrid}>
                  <div className={styles.featureCategory}>
                    <h4>📈 Rolling Form Metrics</h4>
                    <ul>
                      <li>3-game rolling averages (recent form)</li>
                      <li>5-game rolling averages (medium-term form)</li>
                      <li>8-game rolling averages (long-term form)</li>
                      <li>Points for/against, win rates, margins</li>
                    </ul>
                  </div>
                  <div className={styles.featureCategory}>
                    <h4>🏆 Streak Analysis</h4>
                    <ul>
                      <li>Current winning/losing streaks</li>
                      <li>Games since last win/loss</li>
                      <li>Recent wins in last 3 games</li>
                      <li>Momentum indicators</li>
                    </ul>
                  </div>
                  <div className={styles.featureCategory}>
                    <h4>⚖️ ELO & Market Data</h4>
                    <ul>
                      <li>Pre-match ELO ratings</li>
                      <li>ELO differential between teams</li>
                      <li>Bookmaker implied probabilities</li>
                      <li>Market spread analysis</li>
                    </ul>
                  </div>
                  <div className={styles.featureCategory}>
                    <h4>🗺️ Context Factors</h4>
                    <ul>
                      <li>Rest days between matches</li>
                      <li>Travel distance for away teams</li>
                      <li>Home advantage effects</li>
                      <li>Venue-specific factors</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className={styles.confidenceExplanation}>
                <h3>Confidence Levels:</h3>
                <div className={styles.confidenceGrid}>
                  <div className={styles.confidenceItem}>
                    <span className={`${styles.confidenceBadge} ${styles.high}`}>High</span>
                    <p>85%+ certainty - Strong statistical evidence supports the prediction</p>
                  </div>
                  <div className={styles.confidenceItem}>
                    <span className={`${styles.confidenceBadge} ${styles.medium}`}>Medium</span>
                    <p>65-84% certainty - Moderate confidence with some uncertainty factors</p>
                  </div>
                  <div className={styles.confidenceItem}>
                    <span className={`${styles.confidenceBadge} ${styles.low}`}>Low</span>
                    <p>50-64% certainty - Highly competitive match with unpredictable outcome</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>💰</span>
              Betting Recommendations
            </h2>
            <div className={styles.card}>
              <p className={styles.description}>
                Our betting recommendations are based on the Kelly Criterion, a mathematical formula that determines the optimal bet size to maximize long-term growth while managing risk.
              </p>
              
              <div className={styles.kellyExplanation}>
                <h3>How the Kelly Criterion Works:</h3>
                <ul className={styles.features}>
                  <li><strong>Value Assessment:</strong> Compares our AI prediction probability with bookmaker odds</li>
                  <li><strong>Risk Management:</strong> Calculates bet size to minimize risk of significant losses</li>
                  <li><strong>Bankroll Growth:</strong> Optimizes for maximum long-term bankroll growth</li>
                  <li><strong>Conservative Approach:</strong> Recommends smaller stakes for uncertain outcomes</li>
                </ul>
              </div>

              <div className={styles.stakeExplanation}>
                <h3>Stake Percentages:</h3>
                <div className={styles.stakeGrid}>
                  <div className={styles.stakeItem}>
                    <span className={styles.stakeRange}>5%+</span>
                    <p>High value bet - Significant edge over bookmaker odds</p>
                  </div>
                  <div className={styles.stakeItem}>
                    <span className={styles.stakeRange}>2-5%</span>
                    <p>Good value - Moderate edge with acceptable risk</p>
                  </div>
                  <div className={styles.stakeItem}>
                    <span className={styles.stakeRange}>0-2%</span>
                    <p>Small value - Minor edge, minimal recommended stake</p>
                  </div>
                  <div className={styles.stakeItem}>
                    <span className={styles.stakeRange}>No Bet</span>
                    <p>No value - Bookmaker odds don't provide profitable opportunity</p>
                  </div>
                </div>
              </div>

              <div className={styles.warning}>
                <h3>⚠️ Important Disclaimer:</h3>
                <p>
                  These recommendations are for educational purposes only. Sports betting involves risk, and you should never bet more than you can afford to lose. Past performance does not guarantee future results. Please gamble responsibly.
                </p>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>📊</span>
              Understanding Win Probabilities
            </h2>
            <div className={styles.card}>
              <p className={styles.description}>
                The probability bars show the likelihood of each team winning based on our AI analysis:
              </p>
              <ul className={styles.features}>
                <li><strong>Dynamic Calculation:</strong> Probabilities are updated based on the latest available data</li>
                <li><strong>Percentage Display:</strong> Shows exact win probability for each team</li>
                <li><strong>Visual Representation:</strong> Bar length corresponds to win likelihood</li>
                <li><strong>Close Match Indicator:</strong> Special badge when teams are closely matched (&lt;10% difference)</li>
              </ul>
              
              <div className={styles.exampleBar}>
                <h3>Example Probability Bar:</h3>
                <div className={styles.demoBar}>
                  <div className={styles.homeDemo} style={{width: '65%'}}>Team A: 65%</div>
                  <div className={styles.awayDemo} style={{width: '35%'}}>Team B: 35%</div>
                </div>
                <p className={styles.exampleText}>
                  In this example, Team A has a 65% chance of winning, while Team B has a 35% chance.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AIInfoPage;
