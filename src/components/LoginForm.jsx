// src/components/LoginForm.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import styles from './LoginForm.module.css';

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
    <form onSubmit={handleSubmit} className={styles.loginForm}>
      {error && <div className={styles.errorMessage}>{error}</div>}
      
      <div className={styles.inputGroup}>
        <label htmlFor="username" className={styles.label}>Username</label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className={styles.input}
          placeholder="Enter your username"
          autoComplete="username"
        />
      </div>
      
      <div className={styles.inputGroup}>
        <label htmlFor="password" className={styles.label}>Password</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className={styles.input}
          placeholder="Enter your password"
          autoComplete="current-password"
        />
      </div>
      
      <button 
        type="submit" 
        disabled={loading || !username || !password} 
        className={`${styles.submitButton} ${loading ? styles.loading : ''}`}
      >
        {loading ? (
          <>
            <span className={styles.spinner}></span>
            Signing in...
          </>
        ) : (
          'Sign In'
        )}
      </button>
    </form>
  );
};

export default LoginForm;