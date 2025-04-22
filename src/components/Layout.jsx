// src/components/Layout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx'; // Create Navbar next

const Layout = () => {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        {/* Outlet renders the matched child route component */}
        <Outlet />
      </main>
      {/* Add a Footer component here if needed */}
      {/* <footer>Footer Content</footer> */}
    </div>
  );
};

export default Layout;