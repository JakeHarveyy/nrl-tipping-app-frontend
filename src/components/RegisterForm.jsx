// src/components/RegisterForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import styles from './RegisterForm.module.css';

const RegisterForm = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(''); // To show success message
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(''); // Clear previous success message
    setLoading(true);

    // Basic validation (more robust validation can be added)
    if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        setLoading(false);
        return;
    }

    try {
      // The backend endpoint currently returns the verification token for testing
      // Adjust based on final backend response if needed
      const response = await api.post('/auth/register', {
        username: username,
        email: email,
        password: password,
      });

      console.log('Registration response:', response.data);
      setSuccess('Registration successful! Redirecting to login...'); // Set success message

      // Optionally handle the verification token if backend sends it for testing
      // const verificationToken = response.data.verification_token_for_testing;
      // console.log("Verification Token (for testing):", verificationToken);

      // Redirect to login page after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 2000); // 2 second delay

    } catch (err) {
      console.error('Registration failed:', err);
      if (err.response && err.response.data && err.response.data.message) {
        // Use the error message from the backend if available
        setError(err.response.data.message);
      } else {
        setError('Registration failed. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.registerForm}>
      {error && <div className={styles.errorMessage}>{error}</div>}
      {success && <div className={styles.successMessage}>{success}</div>}
      
      <div className={styles.inputGroup}>
        <label htmlFor="reg-username" className={styles.label}>Username</label>
        <input
          type="text"
          id="reg-username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className={styles.input}
          placeholder="Enter your username"
          autoComplete="username"
        />
      </div>
      
      <div className={styles.inputGroup}>
        <label htmlFor="reg-email" className={styles.label}>Email</label>
        <input
          type="email"
          id="reg-email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={styles.input}
          placeholder="Enter your email"
          autoComplete="email"
        />
      </div>
      
      <div className={styles.inputGroup}>
        <label htmlFor="reg-password" className={styles.label}>Password</label>
        <input
          type="password"
          id="reg-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength="6"
          className={styles.input}
          placeholder="Enter your password (min 6 characters)"
          autoComplete="new-password"
        />
      </div>
      
      <button 
        type="submit" 
        disabled={loading || success || !username || !email || !password} 
        className={`${styles.submitButton} ${loading ? styles.loading : ''}`}
      >
        {loading ? (
          <>
            <span className={styles.spinner}></span>
            Creating Account...
          </>
        ) : success ? (
          'Account Created!'
        ) : (
          'Create Account'
        )}
      </button>
    </form>
  );
};

export default RegisterForm;