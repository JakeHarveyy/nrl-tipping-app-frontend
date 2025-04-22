// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
// import { jwtDecode } from "jwt-decode"; // Install jwt-decode if needed: npm install jwt-decode

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken'));
  const [user, setUser] = useState(null); // Store basic user info (id, username)
  const [loading, setLoading] = useState(true); // To track initial auth status check

  const isAuthenticated = !!token; // Simple check if token exists

  // Function to handle login (stores tokens, could fetch user data)
  const login = useCallback((data) => {
      localStorage.setItem('authToken', data.access_token);
      localStorage.setItem('refreshToken', data.refresh_token);
      setToken(data.access_token);
      setRefreshToken(data.refresh_token);
      // Optionally decode token to get user ID immediately
      // Or fetch user profile data
      // const decoded = jwtDecode(data.access_token); // Example if needed
      // setUser({ user_id: decoded.sub, username: '...' }); // Fetch full profile later
      console.log("Login successful, tokens stored.");
      // Manually trigger user fetch or profile load after login if needed
  }, []);

  // Function to handle logout (clears tokens and user state)
  const logout = useCallback(() => {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      setToken(null);
      setRefreshToken(null);
      setUser(null);
      console.log("Logout successful, tokens removed.");
      // Optionally: Make API call to invalidate refresh token on backend if implemented
      // navigate('/login'); // Navigate after logout if needed (use useNavigate hook)
  }, []);

  // TODO: Add function for refreshing token using the refresh token and API service

  // TODO: Add effect to fetch user profile data when token exists or changes
  useEffect(() => {
      const fetchUserProfile = async () => {
          if (token) {
              try {
                   setLoading(true);
                   console.log("Attempting to fetch user profile...");
                  // Replace with actual API call using the token
                  const response = await api.get('/user/profile');
                  setUser(response.data);
                  console.log("User profile loaded:", response.data);
                  // TEMPORARY: Simulate user loading if token exists
                  // Maybe decode token for ID here as placeholder
                  // const decoded = jwtDecode(token);
                  // setUser({ user_id: decoded.sub, username: 'Placeholder User' });
              } catch (error) {
                  console.error("Failed to fetch user profile:", error);
                  // Token might be invalid/expired, log out
                  if (error.response && error.response.status === 401) {
                      logout();
                  }
              } finally {
                  setLoading(false);
              }
          } else {
              setLoading(false); // No token, not loading
              setUser(null); // Ensure user is null if no token
          }
      };
      fetchUserProfile();
  }, [token, logout]); // Rerun if token changes


  return (
    <AuthContext.Provider value={{ token, user, setUser, login, logout, isAuthenticated, loading }}>
      {children}
    </AuthContext.Provider>
  );
};