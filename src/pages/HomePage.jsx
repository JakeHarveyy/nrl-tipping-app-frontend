// src/pages/HomePage.jsx
import React from 'react';
import MatchList from '../components/MatchList'; // Import the MatchList component
import styles from './HomePage.module.css'; // Optional: for page-specific styles

const HomePage = () => {
  return (
    <div className={styles.homeContainer}>
      <div className={styles.welcomeHeader}>
        <h1>Welcome to NRL Tipping!</h1>
        <p>View the upcoming matches below. Login or Register to start placing bets.</p>
      </div>
      {/*
        The MatchList component is now used here.
        It handles its own data fetching.
        The `MatchItem` sub-component will show the "Please log in" message
        if a non-authenticated user tries to interact with betting controls.
      */}
      <MatchList />
    </div>
  );
};

export default HomePage;