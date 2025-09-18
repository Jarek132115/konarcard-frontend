import React, { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import LogoIcon from '../assets/icons/Logo-Icon.svg';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthed = !!user;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // helper: check if path matches
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">

        {/* ===== Mobile header ===== */}
        <div className="navbar-mobile-header">
          <Link to="/" className="logo-link" aria-label="Home">
            <img src={LogoIcon} alt="Logo" className="logo" />
          </Link>

          <button
            type="button"
            className={`hamburger ${mobileOpen ? 'active' : ''}`}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

        {/* ===== Mobile overlay menu ===== */}
        {mobileOpen && (
          <div
            className="mobile-overlay"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            onClick={(e) => {
              if (e.target.classList.contains('mobile-overlay')) setMobileOpen(false);
            }}
          >
            <div className="mobile-panel" role="document">
              <div className="mobile-panel-header">
                <Link
                  to="/"
                  className="logo-link"
                  aria-label="Home"
                  onClick={() => setMobileOpen(false)}
                >
                  <img src={LogoIcon} alt="Logo" className="logo" />
                </Link>

                <button
                  className="mobile-close"
                  aria-label="Close menu"
                  onClick={() => setMobileOpen(false)}
                >
                  ✕
                </button>
              </div>

              <ul className="mobile-list">
                {/* Mobile-only Home link */}
                <li className="mobile-only">
                  <Link
                    to="/"
                    onClick={() => setMobileOpen(false)}
                    className="desktop-h4"
                  >
                    Home
                  </Link>
                </li>

                <li>
                  <Link
                    to="/productandplan"
                    onClick={() => setMobileOpen(false)}
                    className="desktop-h4"
                  >
                    Product &amp; Plan
                  </Link>
                </li>
                <li>
                  <Link
                    to="/reviews"
                    onClick={() => setMobileOpen(false)}
                    className="desktop-h4"
                  >
                    Reviews
                  </Link>
                </li>
                <li>
                  <Link
                    to="/faq"
                    onClick={() => setMobileOpen(false)}
                    className="desktop-h4"
                  >
                    FAQs
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contactus"
                    onClick={() => setMobileOpen(false)}
                    className="desktop-h4"
                  >
                    Contact Us
                  </Link>
                </li>
              </ul>

              <div className="mobile-divider" aria-hidden="true" />

              <div className="mobile-actions">
                {!isAuthed ? (
                  <>
                    <Link
                      to="/login"
                      state={{ from: location.pathname }}
                      className="desktop-h4"
                      onClick={() => setMobileOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      state={{ from: location.pathname }}
                      className="desktop-h4"
                      onClick={() => setMobileOpen(false)}
                    >
                      Sign up
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/myprofile"
                      className="desktop-h4"
                      onClick={() => setMobileOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button
                      type="button"
                      onClick={() => { handleLogout(); setMobileOpen(false); }}
                      className="desktop-h4 logout-link"
                    >
                      Logout
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===== Desktop navbar ===== */}
        <div className="navbar-desktop">
          <div className="navbar-left">
            <Link to="/" className="logo-link" aria-label="Home">
              <img src={LogoIcon} alt="Logo" className="logo" />
            </Link>
            <ul className="nav-links">
              {/* Highlight active link, skip home */}
              <li>
                <Link
                  to="/productandplan"
                  className={isActive('/productandplan') ? 'active' : ''}
                >
                  Product &amp; Plan
                </Link>
              </li>
              <li>
                <Link
                  to="/reviews"
                  className={isActive('/reviews') ? 'active' : ''}
                >
                  Reviews
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className={isActive('/faq') ? 'active' : ''}
                >
                  FAQs
                </Link>
              </li>
              <li>
                <Link
                  to="/contactus"
                  className={isActive('/contactus') ? 'active' : ''}
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          <div className="auth-links">
            {!isAuthed ? (
              <>
                <Link to="/login" state={{ from: location.pathname }} className="desktop-button cta-blue-button">
                  Login
                </Link>
                <Link to="/register" state={{ from: location.pathname }} className="desktop-button cta-black-button">
                  Sign up
                </Link>
              </>
            ) : (
              <>
                <Link to="/myprofile" className="desktop-button cta-blue-button">
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="desktop-button cta-black-button">
                  Logout
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </nav>
  );
}
