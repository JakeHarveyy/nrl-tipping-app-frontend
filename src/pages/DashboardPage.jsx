// src/pages/DashboardPage.jsx (Example Protected Page)
import React from 'react';
import { useAuth } from '../hooks/useAuth';

const DashboardPage = () => {
  const { user } = useAuth();
  return (
      <div>
          <h2>User Dashboard</h2>
          <p>This page is protected.</p>
          <p>User ID: {user?.user_id}</p>
          <p>Username: {user?.username}</p>
          {/* Display bankroll, upcoming matches, recent bets etc. */}
      </div>
  );
};
export default DashboardPage;