// src/pages/DashboardPage.jsx
import React, { useEffect, useState } from 'react'; // Add useEffect, useState
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import MatchList from '../components/MatchList.jsx'; // Import MatchList
import api from '../services/api'; // Import api service
import BankrollChart from '../components/BankrollChart.jsx';

const DashboardPage = () => {
  const { user, setUser, token } = useAuth(); // Get setUser and token
  const [bankroll, setBankroll] = useState(user?.bankroll || 0); // Local state for bankroll display

   // Function to refetch user profile data (including bankroll)
   const fetchUserProfile = async () => {
       if (!token) return; // Don't fetch if no token
       try {
           console.log("Dashboard refreshing user profile...");
           const response = await api.get('/user/profile');
           setUser(response.data); // Update context
           setBankroll(response.data.bankroll); // Update local state
       } catch (error) {
           console.error("Failed to refresh user profile:", error);
           // Handle error, maybe logout if 401
       }
   };


  // Update local bankroll state when user context changes
  useEffect(() => {
    if (user?.bankroll !== undefined) {
      setBankroll(user.bankroll);
    }
  }, [user]); // Run when user object changes

  useEffect(() => {
    fetchUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);


  // Callback function passed to MatchList -> MatchItem
  const handleBetPlaced = () => {
      console.log("Bet placed, refreshing user profile on Dashboard...");
      fetchUserProfile(); // Refetch user profile after bet is placed
      // TODO: Ideally also trigger chart refresh if needed, but chart fetches its own data on mount
  };

  return (
      <div>
          <div style={{ textAlign: 'center' }}>
            <h2>User Dashboard</h2>
          </div>
          <div
            style={{
              marginBottom: '20px',
              padding: '16px',
              border: '1px solid #b3d4fc',
              borderRadius: '10px',
              backgroundColor: '#f0f8ff',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
            }}
          >
            {/* Top row with Welcome + User ID */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginBottom: '10px',
              }}
            >
              <h3 style={{ margin: 0, fontWeight: 600, color: '#1a3c5d' }}>
                Welcome, {user?.username || 'User'}!
              </h3>
              <p style={{ margin: 0, fontSize: '15px', color: '#666' }}>
                User ID: {user?.user_id || 'N/A'}
              </p>
            </div>

            {/* Bankroll box */}
            <div
              style={{
                marginTop: '5px',
                padding: '20px',
                background: 'linear-gradient(135deg, #dff0ff 0%, #b3e0ff 100%)',
                border: '2px solid #4da3ff',
                borderRadius: '12px',
                textAlign: 'center',
                boxShadow: '0 4px 12px rgba(77, 163, 255, 0.15)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                cursor: 'default',
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(77, 163, 255, 0.25)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(77, 163, 255, 0.15)';
              }}
            >
              <p style={{ 
                margin: '0 0 8px 0', 
                fontWeight: 'bold',
                fontSize: '16px',
                letterSpacing: '0.5px'
              }}>
                💰 <span style={{ color: '#003366' }}>Current Bankroll</span>
              </p>
              <p
                style={{
                  fontSize: '32px',
                  fontWeight: '700',
                  color: '#007bff',
                  margin: 0,
                  textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                  fontFamily: '"Segoe UI", system-ui, sans-serif',
                }}
              >
                ${Number(bankroll).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            
            {/* How to Play Button */}
            <div style={{ marginTop: '15px', textAlign: 'center' }}>
              <Link 
                to="/how-to-play"
                style={{
                  display: 'inline-block',
                  padding: '12px 24px',
                  backgroundColor: '#ffc107',
                  color: '#333333',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '16px',
                  transition: 'all 0.2s ease',
                  border: '2px solid #ffc107',
                  boxShadow: '0 2px 8px rgba(255, 193, 7, 0.2)',
                  marginRight: '10px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#e0a800';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(255, 193, 7, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#ffc107';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 8px rgba(255, 193, 7, 0.2)';
                }}
              >
                📚 How to Play
              </Link>
              
              <Link 
                to="/ai-dashboard"
                style={{
                  display: 'inline-block',
                  padding: '12px 24px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '16px',
                  transition: 'all 0.2s ease',
                  border: '2px solid #3b82f6',
                  boxShadow: '0 2px 8px rgba(59, 130, 246, 0.2)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#2563eb';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#3b82f6';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.2)';
                }}
              >
                🤖 AI Dashboard
              </Link>
            </div>
          </div>
          {/* Add Match List Component */}
          <MatchList onBetPlaced={handleBetPlaced} />

          {/* --- ADD BANKROLL CHART --- */}
          <BankrollChart />
          {/* ------------------------- */}

          {/* Add sections for My Bets, Bankroll History later */}
      </div>
  );
};
export default DashboardPage;