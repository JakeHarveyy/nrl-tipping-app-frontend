// src/components/Navbar.jsx
import React from 'react';
import { Link, NavLink } from 'react-router-dom'; // NavLink can show active state
import { useAuth } from '../hooks/useAuth'; // Import useAuth hook later

const Navbar = () => {
  // Get auth state and logout function from context later
  const { isAuthenticated, logout, user } = useAuth();

  return (
    <nav>
      <Link to="/">NRL Tipping 🏉</Link>
      <div className="nav-links">
        {/* Example NavLink for active styling */}
        {/* <NavLink to="/leaderboard" className={({ isActive }) => isActive ? 'active' : ''}>Leaderboard</NavLink> */}
        {isAuthenticated && <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>Dashboard</NavLink>}
        <NavLink to="/leaderboard" className={({ isActive }) => isActive ? 'active' : ''}>Leaderboard</NavLink>
        {isAuthenticated && <NavLink to="/my-bets" className={({ isActive }) => isActive ? 'active' : ''}>My Bets</NavLink>}
         {/* Add other links */}
      </div>
      <div className="nav-auth">
        {isAuthenticated ? (
          <>
            <span>Welcome, {user?.username || 'User'}!</span> {/* Display username */}
            <button onClick={logout} className="btn btn-secondary">Logout</button>
          </>
        ) : (
          <>
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/register">Register</NavLink>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;