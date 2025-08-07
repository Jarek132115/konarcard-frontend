import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LogoIcon from '../assets/icons/Logo-Icon.svg';

export default function Navbar({ user, logout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = async () => {
    if (logout) await logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Desktop Navbar */}
        <div className="navbar-desktop">
          <div className="navbar-left">
            <Link to="/">
              <img src={LogoIcon} alt="Logo" className="logo" />
            </Link>
            <ul className="nav-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/products-and-plans">Products & Plans</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/reviews">Reviews</Link></li>
            </ul>
          </div>
          <div className="auth-links">
            {user ? (
              <>
                <Link to="/myprofile" className="btn signup-btn">My Profile</Link>
                <button onClick={handleLogout} className="btn logout-btn">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn signup-btn">Login</Link>
                <Link to="/register" className="btn login-btn">Sign Up</Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Navbar Header */}
        <div className="navbar-mobile-header">
          <Link to="/">
            <img src={LogoIcon} alt="Logo" className="logo" />
          </Link>
          <div className={`hamburger ${mobileMenuOpen ? 'active' : ''}`} onClick={toggleMobileMenu}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <ul>
          <li><Link to="/" onClick={toggleMobileMenu}>Home</Link></li>
          <li><Link to="/products-and-plans" onClick={toggleMobileMenu}>Products & Plans</Link></li>
          <li><Link to="/contact" onClick={toggleMobileMenu}>Contact</Link></li>
          <li><Link to="/reviews" onClick={toggleMobileMenu}>Reviews</Link></li>
        </ul>
        <div className="auth-links">
          {user ? (
            <>
              <Link to="/myprofile" className="btn signup-btn" onClick={toggleMobileMenu}>My Profile</Link>
              <button onClick={handleLogout} className="btn logout-btn">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn signup-btn" onClick={toggleMobileMenu}>Login</Link>
              <Link to="/register" className="btn login-btn" onClick={toggleMobileMenu}>Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}