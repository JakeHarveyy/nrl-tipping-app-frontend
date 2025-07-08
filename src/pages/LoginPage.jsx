// src/pages/LoginPage.jsx
import React from 'react';
import LoginForm from '../components/LoginForm.jsx';
import GoogleLoginButton from '../components/GoogleLoginButton.jsx';
import { Link } from 'react-router-dom';
import styles from './LoginPage.module.css';

const LoginPage = () => {
  return (
    <div className={styles.loginPageContainer}>
      <div className={styles.loginCard}>
        <div className={styles.loginHeader}>
          <h1 className={styles.loginTitle}>Welcome Back</h1>
          <p className={styles.loginSubtitle}>Sign in to your NRL Tipping account</p>
        </div>
        
        <div className={styles.loginFormSection}>
          <LoginForm />
        </div>
        
        <div className={styles.divider}>
          <span className={styles.dividerText}>or</span>
        </div>
        
        <div className={styles.googleLoginSection}>
          <GoogleLoginButton />
        </div>
        
        <div className={styles.signupPrompt}>
          <p>Don't have an account? <Link to="/register" className={styles.signupLink}>Sign up here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;