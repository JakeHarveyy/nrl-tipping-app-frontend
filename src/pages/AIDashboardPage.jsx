// src/pages/AIDashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import BankrollChart from '../components/BankrollChart';
import styles from './AIDashboardPage.module.css';

const AIDashboardPage = () => {
  const navigate = useNavigate();
  const [aiPredictions, setAiPredictions] = useState([]);
  const [aiBets, setAiBets] = useState([]);
  const [aiStats, setAiStats] = useState({
    totalPredictions: 0,
    correctPredictions: 0,
    accuracy: 0,
    totalBets: 0,
    winningBets: 0,
    currentBankroll: 0,
    totalProfit: 0,
    averageConfidence: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAIData();
  }, []);

  const fetchAIData = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Try to fetch AI bot from leaderboard first
      let aiBot = null;
      try {
        const leaderboardResponse = await api.get('/leaderboard/global');
        console.log('Leaderboard data:', leaderboardResponse.data);
        aiBot = leaderboardResponse.data.leaderboard.find(user => 
          user.username === 'LogisticsRegressionBot' || 
          user.username === 'LogisticRegressionBot' ||
          user.is_bot === true || 
          user.bot === true ||
          user.username?.toLowerCase().includes('bot')
        );
        console.log('Found AI bot:', aiBot);
      } catch (err) {
        console.log('Could not fetch leaderboard data:', err.message);
      }

      // Try to fetch AI predictions from available endpoints
      let predictions = [];
      const currentYear = new Date().getFullYear();
      
      try {
        // Try to fetch from the available AI predictions endpoint
        const roundsToTry = Array.from({length: 27}, (_, i) => i + 1); // Try rounds 1-27 (full NRL season)
        for (const round of roundsToTry) {
          try {
            console.log(`Trying to fetch AI predictions for year ${currentYear}, round ${round}`);
            const predResponse = await api.get(`/ai-predictions/year/${currentYear}/round/${round}`);
            if (predResponse.data.predictions) {
              const roundPredictions = Object.values(predResponse.data.predictions).map(pred => ({
                ...pred,
                round_number: round,
                year: currentYear
              }));
              predictions = [...predictions, ...roundPredictions];
              console.log(`Found ${roundPredictions.length} predictions for round ${round}`);
            }
          } catch (roundErr) {
            // Silently continue - this round might not have predictions yet
            console.log(`No predictions for round ${round}:`, roundErr.message);
          }
        }
        console.log('Total AI predictions found:', predictions.length);
      } catch (err) {
        console.log('AI predictions endpoint error:', err.message);
      }

      // Try to fetch AI bets
      let bets = [];
      try {
        const betsResponse = await api.get('/bets');
        console.log('All bets data:', betsResponse.data);
        if (betsResponse.data.bets && aiBot) {
          console.log('AI bot user_id:', aiBot.user_id);
          bets = betsResponse.data.bets.filter(bet => bet.user_id === aiBot.user_id) || [];
          console.log('Filtered AI bets:', bets);
        } else if (betsResponse.data.bets && !aiBot) {
          console.log('No AI bot found, but bets exist. All bets:', betsResponse.data.bets);
          // Fallback: try to find bets by user_id = 1 (LogisticsRegressionBot)
          bets = betsResponse.data.bets.filter(bet => bet.user_id === 1) || [];
          console.log('Fallback: bets for user_id = 1:', bets);
        }
      } catch (err) {
        console.log('Bets endpoint not available:', err.message);
      }

      // Set the data (even if empty)
      setAiPredictions(predictions);
      setAiBets(bets);

      // Calculate statistics
      const stats = calculateAIStats(predictions, bets, aiBot);
      setAiStats(stats);

      // Set appropriate status message
      if (predictions.length === 0 && bets.length === 0) {
        setError('AI Dashboard ready - No AI predictions or bets found yet for the current season');
      } else if (predictions.length === 0) {
        setError('No AI predictions found for current rounds - AI bot may not have analyzed recent matches yet');
      } else if (bets.length === 0) {
        setError('AI predictions loaded successfully - No bets placed yet');
      } else {
        setError(''); // Clear error if we have both predictions and bets
      }

    } catch (err) {
      console.error("Error fetching AI data:", err);
      setError('Dashboard ready - AI endpoints need to be implemented in the backend');
    } finally {
      setLoading(false);
    }
  };

  const calculateAIStats = (predictions, bets, aiBot) => {
    const totalPredictions = predictions.length;
    const correctPredictions = predictions.filter(pred => 
      pred.predicted_winner === pred.actual_winner
    ).length;
    const accuracy = totalPredictions > 0 ? (correctPredictions / totalPredictions) * 100 : 0;

    const totalBets = bets.length;
    const winningBets = bets.filter(bet => bet.status === 'Won').length;
    const totalProfit = bets.reduce((sum, bet) => {
      if (bet.status === 'Won') return sum + (bet.potential_payout - bet.amount);
      if (bet.status === 'Lost') return sum - bet.amount;
      return sum;
    }, 0);

    const averageConfidence = predictions.length > 0 
      ? predictions.reduce((sum, pred) => sum + (pred.model_confidence || 0), 0) / predictions.length * 100
      : 0;

    const startingBankroll = 10000; // Assuming starting bankroll of $10,000
    const currentBankroll = aiBot?.bankroll || (startingBankroll + totalProfit);

    return {
      totalPredictions,
      correctPredictions,
      accuracy,
      totalBets,
      winningBets,
      currentBankroll,
      totalProfit,
      averageConfidence
    };
  };

  const renderOverview = () => (
    <div className={styles.overview}>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>${aiStats.currentBankroll.toLocaleString()}</div>
          <div className={styles.statLabel}>Current Bankroll</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{aiStats.accuracy.toFixed(1)}%</div>
          <div className={styles.statLabel}>Prediction Accuracy</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{aiStats.totalPredictions}</div>
          <div className={styles.statLabel}>Total Predictions</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>${aiStats.totalProfit.toLocaleString()}</div>
          <div className={styles.statLabel}>Total Profit</div>
        </div>
      </div>

      <div className={styles.chartSection}>
        <h3>AI Bankroll Performance</h3>
        <BankrollChart />
      </div>
    </div>
  );

  const renderPredictions = () => (
    <div className={styles.predictions}>
      <div className={styles.predictionStats}>
        <h3>Prediction Analysis</h3>
        <div className={styles.accuracyBreakdown}>
          <div className={styles.accuracyBar}>
            <div 
              className={styles.accuracyFill} 
              style={{ width: `${aiStats.accuracy}%` }}
            />
          </div>
          <p>{aiStats.correctPredictions} correct out of {aiStats.totalPredictions} predictions</p>
        </div>
      </div>

      <div className={styles.predictionsList}>
        <h4>Recent Predictions</h4>
        {aiPredictions.length > 0 ? (
          aiPredictions.slice(0, 10).map((prediction, index) => (
            <div key={index} className={styles.predictionItem}>
              <div className={styles.predictionHeader}>
                <span className={styles.teams}>
                  {prediction.home_team} vs {prediction.away_team}
                </span>
                <span className={styles.date}>
                  {new Date(prediction.match_date).toLocaleDateString()}
                </span>
              </div>
              <div className={styles.predictionDetails}>
                <div className={styles.prediction}>
                  <strong>Predicted:</strong> {prediction.predicted_winner}
                  <span className={styles.confidence}>
                    ({((prediction.model_confidence || 0) * 100).toFixed(1)}% confidence)
                  </span>
                </div>
                <div className={styles.result}>
                  <strong>Actual:</strong> {prediction.actual_winner || 'TBD'}
                  <span className={
                    prediction.actual_winner === prediction.predicted_winner 
                      ? styles.correct 
                      : prediction.actual_winner ? styles.incorrect : styles.pending
                  }>
                    {prediction.actual_winner 
                      ? (prediction.actual_winner === prediction.predicted_winner ? '✓' : '✗')
                      : '⏳'
                    }
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.noData}>
            <h4>🔮 No AI Predictions Found</h4>
            <p>The AI prediction system is active but no predictions were found for the current season rounds.</p>
            <p>This could mean:</p>
            <ul>
              <li>The AI bot hasn't analyzed recent matches yet</li>
              <li>No matches are available for prediction in the current rounds</li>
              <li>The AI system is still being trained on current season data</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );

  const renderBets = () => (
    <div className={styles.bets}>
      <h3>AI Betting Activity</h3>
      <div className={styles.betsStats}>
        <div className={styles.betStat}>
          <span className={styles.betStatValue}>{aiStats.totalBets}</span>
          <span className={styles.betStatLabel}>Total Bets</span>
        </div>
        <div className={styles.betStat}>
          <span className={styles.betStatValue}>{aiStats.winningBets}</span>
          <span className={styles.betStatLabel}>Winning Bets</span>
        </div>
        <div className={styles.betStat}>
          <span className={styles.betStatValue}>
            {aiStats.totalBets > 0 ? ((aiStats.winningBets / aiStats.totalBets) * 100).toFixed(1) : 0}%
          </span>
          <span className={styles.betStatLabel}>Win Rate</span>
        </div>
      </div>

      <div className={styles.betsList}>
        {aiBets.length > 0 ? (
          aiBets.slice(0, 10).map((bet, index) => {
            console.log('Displaying bet:', bet); // Debug log
            return (
              <div key={index} className={styles.betItem}>
                <div className={styles.betHeader}>
                  <span className={styles.betTeams}>
                    {bet.home_team && bet.away_team ? `${bet.home_team} vs ${bet.away_team}` : `Match ID: ${bet.match_id}`}
                  </span>
                  <span className={`${styles.betStatus} ${styles[bet.status?.toLowerCase()]}`}>
                    {bet.status}
                  </span>
                </div>
                <div className={styles.betDetails}>
                  <div>Bet: {bet.team_selected}</div>
                  <div>Stake: ${bet.amount} | Potential: ${bet.potential_payout}</div>
                  <div>Odds: {bet.odds_at_placement}</div>
                </div>
              </div>
            );
          })
        ) : (
          <div className={styles.noData}>
            <h4>💰 No AI Bets Yet</h4>
            <p>The AI betting system is ready and waiting for predictions to generate betting opportunities.</p>
            <p>Once the AI bot identifies value bets, they will appear here with stakes, odds, and performance tracking.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderModelInfo = () => (
    <div className={styles.modelInfo}>
      <h3>Model Information</h3>
      <div className={styles.modelDetails}>
        <div className={styles.modelCard}>
          <h4>🧠 Logistic Regression Model</h4>
          <p>
            Our AI uses advanced logistic regression algorithms to analyze historical match data, 
            team statistics, player performance, and various other factors to predict match outcomes.
          </p>
        </div>
        
        <div className={styles.modelCard}>
          <h4>📊 Key Features</h4>
          <ul>
            <li>Team form and recent performance</li>
            <li>Head-to-head historical records</li>
            <li>Player injury reports and lineup changes</li>
            <li>Weather conditions and venue factors</li>
            <li>Betting market movements</li>
          </ul>
        </div>

        <div className={styles.modelCard}>
          <h4>💡 Betting Strategy</h4>
          <p>
            The AI employs Kelly Criterion for optimal bet sizing, only placing bets when 
            the model confidence exceeds 60% and identifies value in the market odds.
          </p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading AI Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button 
          onClick={() => navigate('/dashboard')} 
          className={styles.backButton}
        >
          ← Back to Dashboard
        </button>
        <h1>🤖 AI Dashboard</h1>
        <p className={styles.subtitle}>
          Comprehensive analysis of our logistic regression betting bot
        </p>
        {error && (
          <div className={styles.errorBanner}>
            ℹ️ {error}
          </div>
        )}
      </div>

      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'overview' ? styles.active : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'predictions' ? styles.active : ''}`}
          onClick={() => setActiveTab('predictions')}
        >
          Predictions
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'bets' ? styles.active : ''}`}
          onClick={() => setActiveTab('bets')}
        >
          Bets
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'model' ? styles.active : ''}`}
          onClick={() => setActiveTab('model')}
        >
          Model Info
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'predictions' && renderPredictions()}
        {activeTab === 'bets' && renderBets()}
        {activeTab === 'model' && renderModelInfo()}
      </div>
    </div>
  );
};

export default AIDashboardPage;
