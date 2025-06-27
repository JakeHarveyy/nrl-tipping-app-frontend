// src/components/GoogleLoginButton.jsx
import React from 'react';
import { API_BASE_URL } from '../services/api';

const GoogleLoginButton = () => {

  const handleGoogleLogin = () => {
    // Redirect the user's browser to the backend endpoint that initiates Google OAuth
    // Make sure this matches the URL defined in your Flask routes for GoogleLogin
    const googleLoginUrl = `${API_BASE_URL}/auth/google/login`;
    console.log(`Redirecting to Google login at: ${googleLoginUrl}`); // For debugging
    window.location.href = googleLoginUrl;
  };

  return (
    <button onClick={handleGoogleLogin} style={googleButtonStyle}>
      Login with Google
    </button>
  );
};

// Basic styling (can be improved)
const googleButtonStyle = {
  padding: '10px 15px',
  backgroundColor: '#db4437', // Google red
  color: 'white',
  border: 'none',
  borderRadius: '3px',
  cursor: 'pointer',
  marginTop: '10px',
};

export default GoogleLoginButton;