// src/components/RegisterForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; // Your Axios instance

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
    <form onSubmit={handleSubmit} style={formStyle}>
      {error && <p style={errorStyle}>{error}</p>}
      {success && <p style={successStyle}>{success}</p>}
      <div style={inputGroupStyle}>
        <label htmlFor="reg-username">Username:</label>
        <input
          type="text"
          id="reg-username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={inputStyle}
        />
      </div>
      <div style={inputGroupStyle}>
        <label htmlFor="reg-email">Email:</label>
        <input
          type="email"
          id="reg-email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={inputStyle}
        />
      </div>
      <div style={inputGroupStyle}>
        <label htmlFor="reg-password">Password:</label>
        <input
          type="password"
          id="reg-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength="6" // Basic HTML5 validation
          style={inputStyle}
        />
      </div>
      <button type="submit" disabled={loading || success} style={buttonStyle}>
        {loading ? 'Registering...' : 'Register'}
      </button>
    </form>
  );
};

// Reusing some basic inline styles (consider moving to CSS/Modules later)
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
  backgroundColor: '#28a745', // Green for register
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

const successStyle = {
    color: 'green',
    marginBottom: '10px',
    textAlign: 'center',
    fontSize: '0.9em',
}

export default RegisterForm;