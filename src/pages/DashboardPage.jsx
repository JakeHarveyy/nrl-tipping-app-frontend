// src/pages/DashboardPage.jsx
import React, { useEffect, useState } from 'react'; // Add useEffect, useState
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
                padding: '15px',
                backgroundColor: '#dff0ff',
                border: '2px solid #4da3ff',
                borderRadius: '8px',
                textAlign: 'center',
              }}
            >
              <p style={{ margin: 0, fontWeight: 'bold' }}>
                💰 <span style={{ color: '#003366' }}>Current Bankroll:</span>
              </p>
              <p
                style={{
                  fontSize: '28px',
                  fontWeight: 'bold',
                  color: '#007bff',
                  margin: 0,
                }}
              >
                ${Number(bankroll).toFixed(2)}
              </p>
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