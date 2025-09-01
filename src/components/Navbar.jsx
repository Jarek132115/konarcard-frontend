// src/components/Navbar.jsx
import React, { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import LogoIcon from '../assets/icons/Logo-Icon.svg';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, loading, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">

        {/* ===== Mobile header ===== */}
        <div className="navbar-mobile-header">
          <Link to="/" className="logo-link">
            <img src={LogoIcon} alt="Logo" className="logo" />
          </Link>
          <div
            className={`hamburger ${mobileOpen ? 'active' : ''}`}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>

        {/* ===== Mobile overlay menu ===== */}
        {mobileOpen && (
          <div
            className="mobile-overlay"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            onClick={(e) => {
              // Close only when clicking outside the panel
              if (e.target.classList.contains('mobile-overlay')) {
                setMobileOpen(false);
              }
            }}
          >
            <div className="mobile-panel">
              <div className="mobile-panel-header">
                <span className="mobile-panel-title blue"></span>
                <button
                  className="mobile-close"
                  aria-label="Close menu"
                  onClick={() => setMobileOpen(false)}
                >
                  ✕
                </button>
              </div>

              <ul className="mobile-list">
                <li>
                  <Link to="/productandplan" onClick={() => setMobileOpen(false)}>
                    Product &amp; Plan
                  </Link>
                </li>
                <li>
                  <Link to="/reviews" onClick={() => setMobileOpen(false)}>
                    Reviews
                  </Link>
                </li>
                <li>
                  <Link to="/faq" onClick={() => setMobileOpen(false)}>
                    FAQs
                  </Link>
                </li>
                <li>
                  <Link to="/contactus" onClick={() => setMobileOpen(false)}>
                    Contact Us
                  </Link>
                </li>
              </ul>

              <div className="mobile-actions">
                {!loading && (!user ? (
                  <>
                    <Link
                      to="/login"
                      state={{ from: location }}
                      className="desktop-button cta-blue-button"
                      onClick={() => setMobileOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      state={{ from: location }}
                      className="desktop-button cta-black-button"
                      onClick={() => setMobileOpen(false)}
                    >
                      Sign up
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/myprofile"
                      className="desktop-button cta-blue-button"
                      onClick={() => setMobileOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => { handleLogout(); setMobileOpen(false); }}
                      className="logout-btn"
                    >
                      Logout
                    </button>
                  </>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===== Desktop navbar ===== */}
        <div className="navbar-desktop">
          <div className="navbar-left">
            <Link to="/" className="logo-link">
              <img src={LogoIcon} alt="Logo" className="logo" />
            </Link>
            <ul className="nav-links">
              <li><Link to="/productandplan">Product & Plan</Link></li>
              <li><Link to="/reviews">Reviews</Link></li>
              <li><Link to="/faq">FAQs</Link></li>
              <li><Link to="/contactus">Contact Us</Link></li>
            </ul>
          </div>
          <div className="auth-links">
            {!loading && (!user ? (
              <>
                <Link to="/login" state={{ from: location }} className="desktop-button cta-blue-button">Login</Link>
                <Link to="/register" state={{ from: location }} className="desktop-button cta-black-button">Sign up</Link>
              </>
            ) : (
              <>
                <Link to="/myprofile" className="desktop-button cta-blue-button">Dashboard</Link>
                <button onClick={handleLogout} className="desktop-button cta-black-button">Logout</button>
              </>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
