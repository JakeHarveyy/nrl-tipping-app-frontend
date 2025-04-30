// src/pages/DashboardPage.jsx
import React, { useEffect, useState } from 'react'; // Add useEffect, useState
import { useAuth } from '../hooks/useAuth';
import MatchList from '../components/MatchList.jsx'; // Import MatchList
import api from '../services/api'; // Import api service

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

  // Callback function passed to MatchList -> MatchItem
  const handleBetPlaced = () => {
      console.log("Bet placed, refreshing user profile on Dashboard...");
      fetchUserProfile(); // Refetch user profile after bet is placed
  };

  return (
      <div>
          <h2>User Dashboard</h2>
          <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid lightblue', borderRadius: '5px', backgroundColor: '#e7f5ff' }}>
              <h3>Welcome, {user?.username || 'User'}!</h3>
              <p>User ID: {user?.user_id || 'N/A'}</p>
              {/* Format bankroll */}
              <p><strong>Current Bankroll: ${Number(bankroll).toFixed(2)}</strong></p>
          </div>

          {/* Add Match List Component */}
          <MatchList onBetPlaced={handleBetPlaced} />

          {/* Add sections for My Bets, Bankroll History later */}
      </div>
  );
};
export default DashboardPage;