import React, { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import LogoIcon from '../assets/icons/Logo-Icon.svg';
import ArrowDown from '../assets/icons/Arrow-Down-Icon.svg';

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

        <div className={`mobile-menu ${mobileOpen ? 'open' : ''}`}>
          {mobileOpen && (
            <>
              <ul>
                <li><Link to="/productandplan" onClick={() => setMobileOpen(false)}>Product & Plan</Link></li>
                <li><Link to="/reviews" onClick={() => setMobileOpen(false)}>Reviews</Link></li>
                <li><Link to="/faq" onClick={() => setMobileOpen(false)}>FAQs</Link></li>
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
                    <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="btn logout-btn">Logout</button>
                  </>
                ))}
              </div>
            </>
          )}
        </div>

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
                <Link to="/login" state={{ from: location }} className="btn desktop-button login-btn">Login</Link>
                <Link to="/register" state={{ from: location }} className="btn signup-btn">Sign up</Link>
              </>
            ) : (
              <>
                <Link to="/myprofile" className="btn login-btn">Dashboard</Link>
                <button onClick={handleLogout} className="btn logout-btn">Logout</button>
              </>
            ))}
          </div>
        </div>

      </div>
    </nav>
  );
}