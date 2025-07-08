// src/pages/RegisterPage.jsx
import React from 'react';
import RegisterForm from '../components/RegisterForm.jsx';
import GoogleLoginButton from '../components/GoogleLoginButton.jsx';
import { Link } from 'react-router-dom';
import styles from './RegisterPage.module.css';

const RegisterPage = () => {
  return (
    <div className={styles.registerPageContainer}>
      <div className={styles.registerCard}>
        <div className={styles.registerHeader}>
          <h1 className={styles.registerTitle}>Create Account</h1>
          <p className={styles.registerSubtitle}>Join the NRL Tipping community</p>
        </div>
        
        <div className={styles.registerFormSection}>
          <RegisterForm />
        </div>
        
        <div className={styles.divider}>
          <span className={styles.dividerText}>or</span>
        </div>
        
        <div className={styles.googleLoginSection}>
          <GoogleLoginButton />
        </div>
        
        <div className={styles.loginPrompt}>
          <p>Already have an account? <Link to="/login" className={styles.loginLink}>Sign in here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;