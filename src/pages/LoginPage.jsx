// src/pages/LoginPage.jsx
import React from 'react';
import LoginForm from '../components/LoginForm.jsx'; // Import the form
import GoogleLoginButton from '../components/GoogleLoginButton.jsx'; // Create this next

const LoginPage = () => {
  return (
    <div style={{ textAlign: 'center' }}>
      <h2>Login</h2>
      <LoginForm /> {/* Use the LoginForm component */}
      <hr style={{ margin: '20px 0', width: '80%', maxWidth: '300px', marginLeft: 'auto', marginRight: 'auto'}} />
      <GoogleLoginButton /> {/* Add Google login button */}
    </div>
   );
};
export default LoginPage;