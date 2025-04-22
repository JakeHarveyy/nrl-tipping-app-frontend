// src/components/LoginForm.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; // To update auth state on success
import api from '../services/api'; // Your Axios instance

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth(); // Get login function from context
  const navigate = useNavigate();
  const location = useLocation();

  // Get the location to redirect to after login (from ProtectedRoute)
  const from = location.state?.from?.pathname || "/dashboard"; // Default to dashboard

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setError(''); // Clear previous errors
    setLoading(true);

    try {
      const response = await api.post('/auth/login', {
        username: username,
        password: password,
      });

      // Handle successful login
      console.log('Login response:', response.data);
      login(response.data); // Update AuthContext with tokens

      // Redirect user to where they were trying to go, or dashboard
      navigate(from, { replace: true });

    } catch (err) {
      console.error('Login failed:', err);
      if (err.response && err.response.status === 401) {
        setError('Invalid username or password.');
      } else {
        setError('Login failed. Please try again later.');
      }
    } finally {
      setLoading(false); // Stop loading indicator
    }
  };

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      {error && <p style={errorStyle}>{error}</p>}
      <div style={inputGroupStyle}>
        <label htmlFor="username">Username:</label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={inputStyle}
        />
      </div>
      <div style={inputGroupStyle}>
        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={inputStyle}
        />
      </div>
      <button type="submit" disabled={loading} style={buttonStyle}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};

// Basic inline styles (consider moving to CSS/Modules later)
const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  maxWidth: '300px',
  margin: '20px auto',
  padding: '20px',
  border: '1px solid #ccc',
  borderRadius: '5px',
};

const inputGroupStyle = {
  marginBottom: '15px',
  display: 'flex',
  flexDirection: 'column',
};

const inputStyle = {
  padding: '8px',
  marginTop: '5px',
  border: '1px solid #ccc',
  borderRadius: '3px',
};

const buttonStyle = {
  padding: '10px 15px',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '3px',
  cursor: 'pointer',
};

const errorStyle = {
    color: 'red',
    marginBottom: '10px',
    textAlign: 'center',
    fontSize: '0.9em',
}


export default LoginForm;