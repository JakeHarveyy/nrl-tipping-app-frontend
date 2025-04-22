// src/pages/RegisterPage.jsx
import React from 'react';
import RegisterForm from '../components/RegisterForm.jsx'; // Import the form

const RegisterPage = () => {
   return (
    <div style={{ textAlign: 'center' }}>
      <h2>Register</h2>
      <RegisterForm /> {/* Use the RegisterForm component */}
    </div>
  );
};
export default RegisterPage;