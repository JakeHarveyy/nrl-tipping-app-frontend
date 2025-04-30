// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx'; // Create this next
import HomePage from './pages/HomePage.jsx'; // Create this
import LoginPage from './pages/LoginPage.jsx'; // Create this
import RegisterPage from './pages/RegisterPage.jsx'; // Create this
import DashboardPage from './pages/DashboardPage.jsx'; // Example protected page
import NotFoundPage from './pages/NotFoundPage.jsx'; 
import ProtectedRoute from './components/ProtectedRoute.jsx'; 
import GoogleCallbackPage from './pages/GoogleCallbackPage.jsx';
import MyBetsPage from './pages/MyBetsPage.jsx';
import ResultsPage from './pages/ResultsPage.jsx';

function App() {
  return (
    <Routes>
      {/* Routes with shared Layout (Navbar, Footer, etc.) */}
      <Route path="/" element={<Layout />}>
        {/* Public Routes */}
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="results" element={<ResultsPage />} />
        {/* Add other public routes like leaderboard here */}

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}> {/* Wrapper for protected routes */}
             <Route path="dashboard" element={<DashboardPage />} />
             <Route path="my-bets" element={<MyBetsPage />} />
             {/* Add other protected routes like "place bet", "my bets" here */}
        </Route>

        {/* Catch-all for routes not found */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Route WITHOUT the main Layout for Google Callback */}
      <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />

       {/* Add routes without the main Layout if needed */}
       {/* <Route path="/some-special-page" element={<SpecialPage />} /> */}

    </Routes>
  );
}

export default App;