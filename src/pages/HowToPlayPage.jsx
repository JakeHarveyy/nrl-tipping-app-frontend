// src/pages/HowToPlayPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const HowToPlayPage = () => {
  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: '"Segoe UI", system-ui, sans-serif'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ 
          color: '#1a3c5d', 
          fontSize: '2.5em', 
          marginBottom: '10px',
          fontWeight: '700'
        }}>
          🏈 How to Play NRL Tipping
        </h1>
        <p style={{ 
          fontSize: '1.2em', 
          color: '#666',
          fontStyle: 'italic'
        }}>
          Your complete guide to NRL betting and bankroll management
        </p>
      </div>

      <div style={{ 
        display: 'grid', 
        gap: '25px',
        lineHeight: '1.6'
      }}>
        {/* Weekly Bankroll Section */}
        <div style={{
          padding: '25px',
          background: 'linear-gradient(135deg, #e8f4fd 0%, #d1ecf1 100%)',
          border: '2px solid #4da3ff',
          borderRadius: '15px',
          boxShadow: '0 4px 15px rgba(77, 163, 255, 0.1)'
        }}>
          <h2 style={{ 
            color: '#1a3c5d', 
            fontSize: '1.8em', 
            marginBottom: '15px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            💰 Weekly Bankroll
          </h2>
          <p style={{ fontSize: '1.1em', color: '#333', margin: '0 0 15px 0' }}>
            <strong>Every week, each user receives $1,000</strong> added to their bankroll automatically. 
            This gives you fresh opportunities to place bets each round!
          </p>
          <div style={{ 
            padding: '15px', 
            backgroundColor: '#ffffff', 
            borderRadius: '8px',
            border: '1px solid #b3d4fc'
          }}>
            <p style={{ margin: '0', fontSize: '0.95em', color: '#555' }}>
              <strong>Example:</strong> Start with $1,000 → Win some bets → Have $1,200 → 
              Next week you get another $1,000 → Total: $2,200
            </p>
          </div>
        </div>

        {/* How Betting Works Section */}
        <div style={{
          padding: '25px',
          background: 'linear-gradient(135deg, #fff5e6 0%, #ffeaa7 100%)',
          border: '2px solid #f39c12',
          borderRadius: '15px',
          boxShadow: '0 4px 15px rgba(243, 156, 18, 0.1)'
        }}>
          <h2 style={{ 
            color: '#d68910', 
            fontSize: '1.8em', 
            marginBottom: '15px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            🎯 How Betting Works
          </h2>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: '#d68910', fontSize: '1.3em', marginBottom: '10px' }}>
              Placing Bets
            </h3>
            <ul style={{ paddingLeft: '20px', fontSize: '1.1em', color: '#333' }}>
              <li style={{ marginBottom: '8px' }}>Choose any match from the current round</li>
              <li style={{ marginBottom: '8px' }}>Select which team you think will win</li>
              <li style={{ marginBottom: '8px' }}>Decide how much to bet (up to your available bankroll)</li>
              <li style={{ marginBottom: '8px' }}>Confirm your bet - it's locked in!</li>
            </ul>
          </div>
          <div style={{ 
            padding: '15px', 
            backgroundColor: '#ffffff', 
            borderRadius: '8px',
            border: '1px solid #f39c12'
          }}>
            <p style={{ margin: '0', fontSize: '0.95em', color: '#555' }}>
              <strong>Remember:</strong> You can only bet what you have in your bankroll. 
              Bet wisely to maximize your winnings!
            </p>
          </div>
        </div>

        {/* Betting Rules Section */}
        <div style={{
          padding: '25px',
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
          border: '2px solid #0ea5e9',
          borderRadius: '15px',
          boxShadow: '0 4px 15px rgba(14, 165, 233, 0.1)'
        }}>
          <h2 style={{ 
            color: '#0369a1', 
            fontSize: '1.8em', 
            marginBottom: '15px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            📋 Betting Rules
          </h2>
          <div style={{ display: 'grid', gap: '15px' }}>
            <div style={{ 
              padding: '15px', 
              backgroundColor: '#ffffff', 
              borderRadius: '8px',
              border: '1px solid #0ea5e9'
            }}>
              <h4 style={{ color: '#0369a1', margin: '0 0 8px 0' }}>✅ You CAN:</h4>
              <ul style={{ paddingLeft: '20px', margin: '0', color: '#333' }}>
                <li>Bet on any available match in the current round</li>
                <li>Choose not to bet at all (no penalty)</li>
                <li>Bet any amount up to your current bankroll</li>
                <li>Place multiple bets on different matches</li>
              </ul>
            </div>
            <div style={{ 
              padding: '15px', 
              backgroundColor: '#ffffff', 
              borderRadius: '8px',
              border: '1px solid #0ea5e9'
            }}>
              <h4 style={{ color: '#dc2626', margin: '0 0 8px 0' }}>❌ You CANNOT:</h4>
              <ul style={{ paddingLeft: '20px', margin: '0', color: '#333' }}>
                <li>Bet more than your available bankroll</li>
                <li>Change or cancel bets once placed</li>
                <li>Bet on matches that have already started</li>
                <li>Go into negative bankroll</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Winning & Payouts Section */}
        <div style={{
          padding: '25px',
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
          border: '2px solid #22c55e',
          borderRadius: '15px',
          boxShadow: '0 4px 15px rgba(34, 197, 94, 0.1)'
        }}>
          <h2 style={{ 
            color: '#15803d', 
            fontSize: '1.8em', 
            marginBottom: '15px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            🏆 Winning & Payouts
          </h2>
          <div style={{ marginBottom: '20px' }}>
            <p style={{ fontSize: '1.1em', color: '#333', margin: '0 0 15px 0' }}>
              Your winnings are calculated based on the odds when you place your bet:
            </p>
            <div style={{ 
              padding: '15px', 
              backgroundColor: '#ffffff', 
              borderRadius: '8px',
              border: '1px solid #22c55e',
              fontSize: '1.05em'
            }}>
              <p style={{ margin: '0 0 10px 0', color: '#333' }}>
                <strong>If you win:</strong> You get your bet amount back PLUS winnings based on the odds
              </p>
              <p style={{ margin: '0 0 10px 0', color: '#333' }}>
                <strong>If you lose:</strong> You lose the amount you bet
              </p>
              <p style={{ margin: '0', color: '#666', fontSize: '0.9em' }}>
                <em>Example: Bet $100 on Team A at $1.50 odds → Win $150 total ($50 profit + $100 bet back)</em>
              </p>
            </div>
          </div>
        </div>

        {/* Strategy Tips Section */}
        <div style={{
          padding: '25px',
          background: 'linear-gradient(135deg, #fef3f2 0%, #fecaca 100%)',
          border: '2px solid #ef4444',
          borderRadius: '15px',
          boxShadow: '0 4px 15px rgba(239, 68, 68, 0.1)'
        }}>
          <h2 style={{ 
            color: '#dc2626', 
            fontSize: '1.8em', 
            marginBottom: '15px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            💡 Strategy Tips
          </h2>
          <div style={{ display: 'grid', gap: '12px' }}>
            <div style={{ 
              padding: '12px', 
              backgroundColor: '#ffffff', 
              borderRadius: '8px',
              border: '1px solid #ef4444'
            }}>
              <p style={{ margin: '0', color: '#333' }}>
                <strong>🎯 Don't bet everything:</strong> Spread your risk across multiple matches
              </p>
            </div>
            <div style={{ 
              padding: '12px', 
              backgroundColor: '#ffffff', 
              borderRadius: '8px',
              border: '1px solid #ef4444'
            }}>
              <p style={{ margin: '0', color: '#333' }}>
                <strong>📊 Use AI insights:</strong> Check our AI predictions for data-driven tips
              </p>
            </div>
            <div style={{ 
              padding: '12px', 
              backgroundColor: '#ffffff', 
              borderRadius: '8px',
              border: '1px solid #ef4444'
            }}>
              <p style={{ margin: '0', color: '#333' }}>
                <strong>⏰ It's okay to skip:</strong> No bet is better than a bad bet
              </p>
            </div>
            <div style={{ 
              padding: '12px', 
              backgroundColor: '#ffffff', 
              borderRadius: '8px',
              border: '1px solid #ef4444'
            }}>
              <p style={{ margin: '0', color: '#333' }}>
                <strong>📈 Track your progress:</strong> Monitor your bankroll performance over time
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: '40px', 
          padding: '20px',
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          borderRadius: '15px',
          border: '2px solid #94a3b8'
        }}>
          <h3 style={{ color: '#1a3c5d', marginBottom: '15px' }}>
            Ready to Start Playing?
          </h3>
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link 
              to="/dashboard" 
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                backgroundColor: '#007bff',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                transition: 'all 0.2s ease',
                border: '2px solid #007bff'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#0056b3';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#007bff';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              Go to Dashboard
            </Link>
            <Link 
              to="/ai-dashboard" 
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                backgroundColor: 'transparent',
                color: '#007bff',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                border: '2px solid #007bff',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#007bff';
                e.target.style.color = 'white';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = '#007bff';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              Learn About AI Tips
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowToPlayPage;
