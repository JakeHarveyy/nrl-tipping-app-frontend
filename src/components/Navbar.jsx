// src/components/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import styles from './Navbar.module.css';

const Navbar = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu when screen size changes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
  };

  const handleLogout = () => {
    logout();
    setIsUserDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const getUserInitials = (username) => {
    if (!username) return 'U';
    return username.split(' ').map(name => name[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.navbarContainer}>
          <Link to="/" className={styles.logo}>
            🏉 NRL Tipping
          </Link>

          {/* Desktop Navigation */}
          <div className={styles.navLinks}>
            {isAuthenticated && (
              <NavLink 
                to="/dashboard" 
                className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
              >
                Dashboard
              </NavLink>
            )}
            <NavLink 
              to="/leaderboard" 
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
            >
              Leaderboard
            </NavLink>
            {isAuthenticated && (
              <NavLink 
                to="/my-bets" 
                className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
              >
                My Bets
              </NavLink>
            )}
            <NavLink 
              to="/ai-dashboard" 
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
            >
              AI Dashboard
            </NavLink>
          </div>

          {/* Desktop Auth Section */}
          <div className={styles.navAuth}>
            {isAuthenticated ? (
              <div className={styles.userDropdown} ref={dropdownRef}>
                <button 
                  className={styles.dropdownToggle}
                  onClick={toggleUserDropdown}
                >
                  <div className={styles.userAvatar}>
                    {getUserInitials(user?.username)}
                  </div>
                  <span>{user?.username || 'User'}</span>
                  <span style={{ transform: isUserDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                    ▼
                  </span>
                </button>
                <div 
                  className={styles.dropdownMenu}
                  style={{ display: isUserDropdownOpen ? 'block' : 'none' }}
                >
                  <NavLink 
                    to="/dashboard" 
                    className={styles.dropdownItem}
                    onClick={() => setIsUserDropdownOpen(false)}
                  >
                    Dashboard
                  </NavLink>
                  <NavLink 
                    to="/my-bets" 
                    className={styles.dropdownItem}
                    onClick={() => setIsUserDropdownOpen(false)}
                  >
                    My Bets
                  </NavLink>
                  <hr style={{ margin: '8px 0', border: 'none', borderTop: '1px solid #eee' }} />
                  <button 
                    className={styles.logoutButton}
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.authButtons}>
                <NavLink to="/login" className={styles.authButton}>
                  Login
                </NavLink>
                <NavLink to="/register" className={`${styles.authButton} ${styles.primary}`}>
                  Register
                </NavLink>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className={styles.mobileMenuToggle}
            onClick={toggleMobileMenu}
          >
            {isMobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`${styles.mobileMenu} ${isMobileMenuOpen ? '' : styles.hidden}`}>
        <div className={styles.mobileNavLinks}>
          {isAuthenticated && (
            <NavLink 
              to="/dashboard" 
              className={styles.mobileNavLink}
              onClick={closeMobileMenu}
            >
              Dashboard
            </NavLink>
          )}
          <NavLink 
            to="/leaderboard" 
            className={styles.mobileNavLink}
            onClick={closeMobileMenu}
          >
            Leaderboard
          </NavLink>
          {isAuthenticated && (
            <NavLink 
              to="/my-bets" 
              className={styles.mobileNavLink}
              onClick={closeMobileMenu}
            >
              My Bets
            </NavLink>
          )}
          <NavLink 
            to="/ai-dashboard" 
            className={styles.mobileNavLink}
            onClick={closeMobileMenu}
          >
            AI Dashboard
          </NavLink>
        </div>

        <div className={styles.mobileAuthSection}>
          {isAuthenticated ? (
            <>
              <div className={styles.mobileUserInfo}>
                Welcome, {user?.username || 'User'}!
              </div>
              <div className={styles.mobileAuthButtons}>
                <button 
                  className={`${styles.mobileAuthButton} ${styles.mobileLogoutButton}`}
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className={styles.mobileAuthButtons}>
              <NavLink 
                to="/login" 
                className={styles.mobileAuthButton}
                onClick={closeMobileMenu}
              >
                Login
              </NavLink>
              <NavLink 
                to="/register" 
                className={`${styles.mobileAuthButton} ${styles.primary}`}
                onClick={closeMobileMenu}
              >
                Register
              </NavLink>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;