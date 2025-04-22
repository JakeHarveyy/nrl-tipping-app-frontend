// src/pages/GoogleCallbackPage.jsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const GoogleCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation(); // To potentially redirect back where user came from
  const { login } = useAuth();
  const [message, setMessage] = useState('Processing Google Login...');
  const [error, setError] = useState(null);

  useEffect(() => {
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const loginError = searchParams.get('error'); // Check if backend sent an error

    if (loginError) {
        console.error("Google login failed (from backend):", loginError);
        setError(`Google login failed: ${loginError}. Redirecting to login page...`);
        // Redirect back to login after delay
        setTimeout(() => navigate('/login', { replace: true }), 3000);
    } else if (accessToken && refreshToken) {
      console.log("Received tokens from Google callback.");
      // Store the tokens using the login function from AuthContext
      login({ access_token: accessToken, refresh_token: refreshToken });

      // Determine where to redirect
      // If user was trying to access protected route, redirect there, otherwise dashboard
      const from = location.state?.from?.pathname || '/dashboard';
      setMessage('Login successful! Redirecting...');

      // Use replace: true so this callback page isn't in browser history
      navigate(from, { replace: true });

    } else {
      // Tokens not found in URL parameters, something went wrong
      console.error("Tokens not found in Google callback URL.");
      setError('Login failed: Could not retrieve authentication tokens. Redirecting to login page...');
      // Redirect back to login after delay
      setTimeout(() => navigate('/login', { replace: true }), 3000);
    }

    // This effect should only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array ensures it runs only once

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Google Authentication Callback</h2>
      {error ? <p style={{ color: 'red' }}>{error}</p> : <p>{message}</p>}
      {/* You could add a loading spinner here */}
    </div>
  );
};

export default GoogleCallbackPage;