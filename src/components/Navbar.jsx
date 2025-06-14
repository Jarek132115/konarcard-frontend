import React, { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import LogoIcon from '../assets/icons/Logo-Icon.svg';
import ArrowDown from '../assets/icons/Arrow-Down-Icon.svg';

export default function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, setUser, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    // FIX: Use VITE_API_URL for API calls
    await fetch(`${import.meta.env.VITE_API_URL}/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    setUser(null);
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">

        {/* MOBILE HEADER */}
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

        {/* MOBILE MENU */}
        <div className={`mobile-menu ${mobileOpen ? 'open' : ''}`}>
          {mobileOpen && (
            <>
              <ul>
                <li><Link to="/shopnfccards" onClick={() => setMobileOpen(false)}>Shop NFC Cards</Link></li>
                <li><Link to="/howitworks" onClick={() => setMobileOpen(false)}>How It Works</Link></li>
                <li><Link to="/whatisnfc" onClick={() => setMobileOpen(false)}>What Is NFC</Link></li>
                <li><Link to="/reviews" onClick={() => setMobileOpen(false)}>Reviews</Link></li>
                <li><Link to="/contactus" onClick={() => setMobileOpen(false)}>Contact Us</Link></li>
              </ul>
              <div className="auth-links">
                {!loading && (!user ? (
                  <>
                    <Link to="/login" state={{ from: location }} className="btn login-btn" onClick={() => setMobileOpen(false)}>Login</Link>
                    <Link to="/register" state={{ from: location }} className="btn signup-btn" onClick={() => setMobileOpen(false)}>Sign up</Link>
                  </>
                ) : (
                  <>
                    <Link to="/myprofile" className="btn login-btn" onClick={() => setMobileOpen(false)}>Dashboard</Link>
                    <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="btn signup-btn">Logout</button>
                  </>
                ))}
              </div>
            </>
          )}
        </div>

        {/* DESKTOP NAV */}
        <div className="navbar-desktop">
          <div className="navbar-left">
            <Link to="/" className="logo-link">
              <img src={LogoIcon} alt="Logo" className="logo" />
            </Link>
            <ul className="nav-links">
              <li><Link to="/shopnfccards">Shop NFC Cards</Link></li>
              <li
                className="dropdown"
                onMouseEnter={() => setDropdownOpen(true)}
                onMouseLeave={() => setDropdownOpen(false)}
              >
                <span className="dropdown-toggle">
                  About <img src={ArrowDown} alt="Arrow Down" />
                </span>
                {dropdownOpen && (
                  <ul className="dropdown-menu">
                    <li><Link to="/howitworks">How It Works</Link></li>
                    <li><Link to="/whatisnfc">What Is NFC</Link></li>
                    <li><Link to="/reviews">Reviews</Link></li>
                    <li><Link to="/contactus">Contact Us</Link></li>
                  </ul>
                )}
              </li>
            </ul>
          </div>
          <div className="auth-links">
            {!loading && (!user ? (
              <>
                <Link to="/login" state={{ from: location }} className="btn desktop-button login-btn">Login</Link>
                <Link to="/register" state={{ from: location }} className="btn signup-btn">Sign up</Link>
              </>
            ) : (
              <>
                <Link to="/myprofile" className="btn login-btn">Dashboard</Link>
                <button onClick={handleLogout} className="btn signup-btn">Logout</button>
              </>
            ))}
          </div>
        </div>

      </div>
    </nav>
  );
}