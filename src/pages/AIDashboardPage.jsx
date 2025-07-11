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
  const [activeTab, setActiveTab] = useState('model');

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
        // Start from round 19 (current season) and work forward
        const startRound = 19;
        const endRound = 27;
        const roundsToTry = Array.from({length: endRound - startRound + 1}, (_, i) => i + startRound);
        
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
        const betsResponse = await api.get('/ai-bot/bets');
        console.log('AI bot bets data:', betsResponse.data);
        bets = betsResponse.data.bets || [];
        console.log('AI bot bets found:', bets.length);
      } catch (err) {
        console.log('AI bot bets endpoint not available:', err.message);
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
        <BankrollChart useAIBot={true} />
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
          aiBets.slice(0, 10).map((bet, index) => (
            <div key={index} className={styles.betItem}>
              <div className={styles.betHeader}>
                <span className={styles.betTeams}>{bet.home_team} vs {bet.away_team}</span>
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
          ))
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

  const renderFutureImprovements = () => (
    <div className={styles.futureImprovements}>
      {/* Hero Section */}
      <div className={styles.heroSection}>
        <div className={styles.heroIcon}>🚀</div>
        <h1 className={styles.heroTitle}>Future Improvements & Testing</h1>
        <p className={styles.heroSubtitle}>
          This is our baseline model - continuous testing and development ahead
        </p>
        <div className={styles.heroStats}>
          <div className={styles.heroStat}>
            <span className={styles.heroStatValue}>Live</span>
            <span className={styles.heroStatLabel}>Testing</span>
          </div>
          <div className={styles.heroStat}>
            <span className={styles.heroStatValue}>R&D</span>
            <span className={styles.heroStatLabel}>Active</span>
          </div>
          <div className={styles.heroStat}>
            <span className={styles.heroStatValue}>Beta</span>
            <span className={styles.heroStatLabel}>Version</span>
          </div>
        </div>
      </div>

      {/* Testing Overview */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>🧪</span>
            Live Testing Platform
          </h2>
          <p className={styles.sectionSubtitle}>Real-world validation of our baseline logistic regression model</p>
        </div>
        
        <div className={styles.improvementOverview}>
          <p>
            <strong>Important:</strong> This website serves as a live testing platform to evaluate our baseline logistic regression model on unseen data. 
            We're continuously analysing performance and identifying areas for enhancement.
          </p>
        </div>
      </section>

      {/* Planned Improvements */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>⚡</span>
            Planned Improvements
          </h2>
          <p className={styles.sectionSubtitle}>Research and development roadmap for enhanced performance</p>
        </div>
        
        <div className={styles.improvementCards}>
          <div className={styles.improvementCard}>
            <div className={styles.improvementIcon}>🌳</div>
            <h3>Model Selection</h3>
            <p>Exploring alternative machine learning algorithms to improve prediction accuracy</p>
            <div className={styles.improvementList}>
              <span className={styles.improvementItem}>• Decision Tree algorithms</span>
              <span className={styles.improvementItem}>• Random Forest ensembles</span>
              <span className={styles.improvementItem}>• Gradient boosting methods</span>
              <span className={styles.improvementItem}>• Neural network architectures</span>
            </div>
          </div>
          
          <div className={styles.improvementCard}>
            <div className={styles.improvementIcon}>⚙️</div>
            <h3>Feature Engineering</h3>
            <p>Developing more sophisticated data points to capture game dynamics and predictability</p>
            <div className={styles.improvementList}>
              <span className={styles.improvementItem}>• Player impacts</span>
              <span className={styles.improvementItem}>• Weather conditions</span>
              <span className={styles.improvementItem}>• Referee tendencies</span>
              <span className={styles.improvementItem}>• Team motivation factors</span>
            </div>
          </div>
          
          <div className={styles.improvementCard}>
            <div className={styles.improvementIcon}>🔬</div>
            <h3>Hypothesis Testing</h3>
            <p>Investigating potential biases and model limitations through data analysis</p>
            <div className={styles.improvementList}>
              <span className={styles.improvementItem}>• Favourite selection bias testing</span>
              <span className={styles.improvementItem}>• Market efficiency analysis</span>
              <span className={styles.improvementItem}>• Prediction confidence validation</span>
              <span className={styles.improvementItem}>• Long-term performance tracking</span>
            </div>
          </div>
        </div>
      </section>

      {/* Current Testing Challenges */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>⚠️</span>
            Current Testing Phase
          </h2>
          <p className={styles.sectionSubtitle}>Known limitations and ongoing validation</p>
        </div>

        <div className={styles.testingNote}>
          <div className={styles.testingIcon}>⚠️</div>
          <h3>Odds Source Considerations</h3>
          <div className={styles.testingContent}>
            <p>
              <strong>Testing Challenge:</strong> Our current system scrapes odds from Pinnacle Sportsbook, 
              known for their sharp, efficient pricing. However, our model was trained on different bookmaker odds, 
              which means our concept of "value" and "edge" is still being validated in real-world conditions.
            </p>
            <div className={styles.testingPoints}>
              <div className={styles.testingPoint}>
                <span className={styles.pointIcon}>📊</span>
                <span>Model trained on historical bookmaker data (not Pinnacle)</span>
              </div>
              <div className={styles.testingPoint}>
                <span className={styles.pointIcon}>🎯</span>
                <span>Live testing against Pinnacle's sharp odds</span>
              </div>
              <div className={styles.testingPoint}>
                <span className={styles.pointIcon}>🔍</span>
                <span>Evaluating true edge detection capabilities</span>
              </div>
            </div>
            <p className={styles.testingFooter}>
              This discrepancy provides valuable insights into market efficiency and helps refine our value detection algorithms.
            </p>
          </div>
        </div>
      </section>

      {/* Development Disclaimer */}
      <div className={styles.disclaimer}>
        <div className={styles.disclaimerIcon}>🔬</div>
        <h3>Research & Development Notice</h3>
        <div className={styles.disclaimerContent}>
          <p>
            This AI system is in <strong>active development and testing</strong>. 
            Performance metrics and betting strategies are continuously being evaluated and improved.
          </p>
          <div className={styles.disclaimerPoints}>
            <div className={styles.disclaimerPoint}>
              <span className={styles.pointIcon}>🧪</span>
              <span>Baseline model currently in live testing phase</span>
            </div>
            <div className={styles.disclaimerPoint}>
              <span className={styles.pointIcon}>📊</span>
              <span>Performance data being collected for future improvements</span>
            </div>
            <div className={styles.disclaimerPoint}>
              <span className={styles.pointIcon}>🔄</span>
              <span>Regular updates and model refinements planned</span>
            </div>
          </div>
          <p className={styles.disclaimerFooter}>
            Expect continuous improvements as we gather more data and refine our algorithms.
          </p>
        </div>
      </div>
    </div>
  );

  const renderModelInfo = () => (
    <div className={styles.modelInfo}>
      {/* Hero Section */}
      <div className={styles.heroSection}>
        <div className={styles.heroIcon}>🤖</div>
        <h1 className={styles.heroTitle}>AI Prediction System</h1>
        <p className={styles.heroSubtitle}>
          Baseline logistic regression model analyzing 60+ Features to predict NRL match outcomes with scientific precision
        </p>
        <div className={styles.heroStats}>
          <div className={styles.heroStat}>
            <span className={styles.heroStatValue}>60+</span>
            <span className={styles.heroStatLabel}>Features</span>
          </div>
          <div className={styles.heroStat}>
            <span className={styles.heroStatValue}>ML</span>
            <span className={styles.heroStatLabel}>Powered</span>
          </div>
          <div className={styles.heroStat}>
            <span className={styles.heroStatValue}>24/7</span>
            <span className={styles.heroStatLabel}>Analysis</span>
          </div>
        </div>
      </div>

      {/* How It Works - Simple Overview */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>🧠</span>
            How Our AI Works
          </h2>
          <p className={styles.sectionSubtitle}>From raw data to intelligent betting decisions in three steps</p>
        </div>
        
        <div className={styles.processGrid}>
          <div className={styles.processStep}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepIcon}>📊</div>
            <h3>Data Collection</h3>
            <p>Automatically gathers 60+ collected and engineered features from team performance, recent form, historical form, and match context. Data contains every match since 2009.</p>
            <div className={styles.stepDetails}>
              <span>• Team statistics</span>
              <span>• Player performance</span>
              <span>• Match conditions</span>
            </div>
          </div>
          <div className={styles.processStep}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepIcon}>🔬</div>
            <h3>AI Analysis</h3>
            <p>Logistic regression algorithm processes all data points to calculate win probabilities for each team</p>
            <div className={styles.stepDetails}>
              <span>• Pattern recognition</span>
              <span>• Probability calculation</span>
              <span>• Confidence scoring</span>
            </div>
          </div>
          <div className={styles.processStep}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepIcon}>💡</div>
            <h3>Smart Betting</h3>
            <p>Kelly Criterion mathematics determines optimal bet sizes, only placing bets when genuine value is detected</p>
            <div className={styles.stepDetails}>
              <span>• Value detection</span>
              <span>• Risk management</span>
              <span>• Optimal sizing</span>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features - More Visual */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>📊</span>
            What Data We Analyze
          </h2>
          <p className={styles.sectionSubtitle}>Comprehensive data points that drive our predictions</p>
        </div>
        
        <div className={styles.featureCards}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>📈</div>
            <h3>Team Performance</h3>
            <p className={styles.featureDescription}>Historical and recent team statistics that reveal form and capability</p>
            <div className={styles.featureList}>
              <span className={styles.featureItem}>✓ Recent win/loss streaks</span>
              <span className={styles.featureItem}>✓ Points scored vs conceded</span>
              <span className={styles.featureItem}>✓ 3, 5 & 8 game form averages</span>
              <span className={styles.featureItem}>✓ Season win percentages</span>
              <span className={styles.featureItem}>✓ Attack & defense efficiency</span>
            </div>
          </div>
          
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🏆</div>
            <h3>Match Context</h3>
            <p className={styles.featureDescription}>Situational factors that can influence game outcomes</p>
            <div className={styles.featureList}>
              <span className={styles.featureItem}>✓ Home field advantage</span>
              <span className={styles.featureItem}>✓ Travel distance effects</span>
              <span className={styles.featureItem}>✓ Rest days between games</span>
              <span className={styles.featureItem}>✓ Historical head-to-head</span>
            </div>
          </div>
          
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>⚖️</div>
            <h3>Market Intelligence</h3>
            <p className={styles.featureDescription}>Advanced metrics that identify value betting opportunities</p>
            <div className={styles.featureList}>
              <span className={styles.featureItem}>✓ ELO team ratings</span>
              <span className={styles.featureItem}>✓ Bookmaker odds analysis</span>
              <span className={styles.featureItem}>✓ Market probability gaps</span>
              <span className={styles.featureItem}>✓ Value bet identification</span>
            </div>
          </div>
        </div>
      </section>

      {/* Confidence Levels - Cleaner Design */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>🎯</span>
            Prediction Confidence
          </h2>
          <p className={styles.sectionSubtitle}>How we rate the certainty of our predictions</p>
        </div>
        
        <div className={styles.confidenceExplanation}>
          <p>Our AI assigns a confidence score to each prediction based on data quality, historical patterns, and statistical certainty. Higher confidence indicates stronger evidence supporting the prediction.</p>
        </div>
        
        <div className={styles.confidenceCards}>
          <div className={`${styles.confidenceCard} ${styles.highConfidence}`}>
            <div className={styles.confidenceIcon}>🟢</div>
            <h3>High Confidence</h3>
            <div className={styles.confidenceRange}>85%+</div>
            <p>Strong statistical evidence supports our prediction. Historical data shows clear patterns and the model is highly certain.</p>
            <div className={styles.confidenceExample}>
              <strong>Example:</strong> Team A has won 8/10 recent matches against similar opponents with consistent performance metrics.
            </div>
          </div>
          
          <div className={`${styles.confidenceCard} ${styles.mediumConfidence}`}>
            <div className={styles.confidenceIcon}>🟡</div>
            <h3>Medium Confidence</h3>
            <div className={styles.confidenceRange}>65-84%</div>
            <p>Good prediction accuracy with some uncertainty factors that could affect the outcome. Solid data but with variables to consider.</p>
            <div className={styles.confidenceExample}>
              <strong>Example:</strong> Teams are closely matched but one has a slight statistical advantage in key performance areas.
            </div>
          </div>
          
          <div className={`${styles.confidenceCard} ${styles.lowConfidence}`}>
            <div className={styles.confidenceIcon}>🟠</div>
            <h3>Lower Confidence</h3>
            <div className={styles.confidenceRange}>50-64%</div>
            <p>Highly competitive match. Teams are closely matched with unpredictable factors that make the outcome uncertain.</p>
            <div className={styles.confidenceExample}>
              <strong>Example:</strong> Both teams have similar recent form, making it difficult to identify a clear favorite.
            </div>
          </div>
        </div>
      </section>

      {/* Betting Strategy - Simplified */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>💰</span>
            Smart Betting Strategy
          </h2>
          <p className={styles.sectionSubtitle}>Kelly Criterion for optimal bet sizing and risk management</p>
        </div>
        
        <div className={styles.strategyOverview}>
          <p>Our betting system uses the mathematically proven Kelly Criterion to determine optimal bet sizes. This approach maximizes long-term growth while minimizing the risk of significant losses.</p>
        </div>
        
        <div className={styles.strategyGrid}>
          <div className={styles.strategyCard}>
            <div className={styles.strategyIcon}>🔍</div>
            <h3>Value Detection</h3>
            <p>We compare our AI predictions against bookmaker odds to find opportunities where the market undervalues a team's true chances of winning.</p>
            <div className={styles.strategyExample}>
              If our model predicts 60% chance but odds imply 50%, we've found value.
            </div>
          </div>
          
          <div className={styles.strategyCard}>
            <div className={styles.strategyIcon}>📏</div>
            <h3>Optimal Sizing</h3>
            <p>Kelly Criterion calculates the perfect bet size to maximize long-term growth while protecting your bankroll from significant losses.</p>
            <div className={styles.strategyExample}>
              Larger edge = larger bet, but never risking more than mathematically optimal.
            </div>
          </div>
          
          <div className={styles.strategyCard}>
            <div className={styles.strategyIcon}>🛡️</div>
            <h3>Risk Management</h3>
            <p>Conservative approach ensures we only bet when there's genuine value, avoiding emotional or impulsive betting decisions.</p>
            <div className={styles.strategyExample}>
              No bet is placed unless our model identifies clear statistical advantage.
            </div>
          </div>
        </div>

        <div className={styles.bettingGuide}>
          <h3>Bet Size Guide</h3>
          <p className={styles.guideSubtitle}>Kelly Criterion determines these bet sizes based on statistical edge</p>
          <div className={styles.bettingRanges}>
            <div className={`${styles.bettingRange} ${styles.exceptional}`}>
              <div className={styles.rangeHeader}>
                <span className={styles.rangeLabel}>8%+ of bankroll</span>
                <span className={styles.rangeIndicator}>🔥</span>
              </div>
              <span className={styles.rangeDesc}>Exceptional value - Significant statistical edge detected with high confidence</span>
            </div>
            <div className={`${styles.bettingRange} ${styles.good}`}>
              <div className={styles.rangeHeader}>
                <span className={styles.rangeLabel}>2-8% of bankroll</span>
                <span className={styles.rangeIndicator}>✅</span>
              </div>
              <span className={styles.rangeDesc}>Good value - Moderate advantage identified with solid data support</span>
            </div>
            <div className={`${styles.bettingRange} ${styles.small}`}>
              <div className={styles.rangeHeader}>
                <span className={styles.rangeLabel}>0-2% of bankroll</span>
                <span className={styles.rangeIndicator}>📊</span>
              </div>
              <span className={styles.rangeDesc}>Small value - Minor edge detected, minimal stake recommended</span>
            </div>
            <div className={`${styles.bettingRange} ${styles.none}`}>
              <div className={styles.rangeHeader}>
                <span className={styles.rangeLabel}>No bet recommended</span>
                <span className={styles.rangeIndicator}>⏸️</span>
              </div>
              <span className={styles.rangeDesc}>No value - Market odds are fair or unfavorable, patience is key</span>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <div className={styles.disclaimer}>
        <div className={styles.disclaimerIcon}>⚠️</div>
        <h3>Important Information</h3>
        <div className={styles.disclaimerContent}>
          <p>
            This AI system is designed for <strong>educational and analytical purposes</strong>. 
            Sports betting involves inherent risk, and past performance does not guarantee future results.
          </p>
          <div className={styles.disclaimerPoints}>
            <div className={styles.disclaimerPoint}>
              <span className={styles.pointIcon}>🎯</span>
              <span>AI predictions are probabilistic, not guaranteed outcomes</span>
            </div>
            <div className={styles.disclaimerPoint}>
              <span className={styles.pointIcon}>💰</span>
              <span>Only bet what you can afford to lose</span>
            </div>
            <div className={styles.disclaimerPoint}>
              <span className={styles.pointIcon}>🏥</span>
              <span>Seek help if gambling becomes a problem</span>
            </div>
          </div>
          <p className={styles.disclaimerFooter}>
            Remember: The house always has an edge. This tool helps identify value, but responsible gambling is your responsibility.
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
          className={`${styles.tab} ${activeTab === 'model' ? styles.active : ''}`}
          onClick={() => setActiveTab('model')}
        >
          Model Info
        </button>
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
          className={`${styles.tab} ${activeTab === 'improvements' ? styles.active : ''}`}
          onClick={() => setActiveTab('improvements')}
        >
          Future Improvements
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === 'model' && renderModelInfo()}
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'predictions' && renderPredictions()}
        {activeTab === 'bets' && renderBets()}
        {activeTab === 'improvements' && renderFutureImprovements()}
      </div>
    </div>
  );
};

export default AIDashboardPage;
