import React, { useState, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import LogoIcon from "../assets/icons/Logo-Icon.svg";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthed = !!user;

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  // ✅ Updated: Products now goes to /products
  const navItems = [
    { label: "Products", to: "/products" },
    { label: "Examples", to: "/examples" },
    { label: "Pricing", to: "/pricing" },
    { label: "FAQs", to: "/faq" },
  ];

  return (
    <nav className="kc-navbar">
      <div className="kc-navbar__container">
        {/* =========================
            Mobile header
            ========================= */}
        <div className="kc-navbar__mobileHeader">
          <Link to="/" className="kc-navbar__logoLink" aria-label="Home">
            <img src={LogoIcon} alt="Logo" className="kc-navbar__logo" />
          </Link>

          <button
            type="button"
            className={`kc-navbar__hamburger ${mobileOpen ? "active" : ""}`}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        {/* =========================
            Mobile overlay menu
            ========================= */}
        {mobileOpen && (
          <div
            className="kc-navbar__overlay"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            onClick={(e) => {
              if (e.target.classList.contains("kc-navbar__overlay")) setMobileOpen(false);
            }}
          >
            <div className="kc-navbar__panel" role="document">
              <div className="kc-navbar__panelHeader">
                <Link
                  to="/"
                  className="kc-navbar__logoLink"
                  aria-label="Home"
                  onClick={() => setMobileOpen(false)}
                >
                  <img src={LogoIcon} alt="Logo" className="kc-navbar__logo" />
                </Link>

                <button
                  className="kc-navbar__close"
                  aria-label="Close menu"
                  onClick={() => setMobileOpen(false)}
                >
                  ✕
                </button>
              </div>

              <ul className="kc-navbar__mobileList">
                {navItems.map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      onClick={() => setMobileOpen(false)}
                      className={`kc-navbar__mobileLink ${isActive(item.to) ? "active" : ""}`}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="kc-navbar__divider" aria-hidden="true" />

              <div className="kc-navbar__mobileActions">
                {!isAuthed ? (
                  <>
                    <Link
                      to="/login"
                      state={{ from: location.pathname }}
                      className="kc-navbar__mobileLink"
                      onClick={() => setMobileOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      state={{ from: location.pathname }}
                      className="kc-navbar__mobileCta"
                      onClick={() => setMobileOpen(false)}
                    >
                      Claim Your Link
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/myprofile"
                      className="kc-navbar__mobileLink"
                      onClick={() => setMobileOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        handleLogout();
                        setMobileOpen(false);
                      }}
                      className="kc-navbar__mobileLogout"
                    >
                      Logout
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* =========================
            Desktop navbar
            ========================= */}
        <div className="kc-navbar__desktop">
          {/* left: logo */}
          <div className="kc-navbar__left">
            <Link to="/" className="kc-navbar__logoLink" aria-label="Home">
              <img src={LogoIcon} alt="Logo" className="kc-navbar__logo" />
            </Link>
          </div>

          {/* center: links */}
          <ul className="kc-navbar__centerLinks">
            {navItems.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className={isActive(item.to) ? "active" : ""}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* right: auth */}
          <div className="kc-navbar__right">
            {!isAuthed ? (
              <>
                <Link
                  to="/login"
                  state={{ from: location.pathname }}
                  className="kc-navbar__login"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  state={{ from: location.pathname }}
                  className="kc-navbar__cta"
                >
                  Claim Your Link
                </Link>
              </>
            ) : (
              <>
                <Link to="/myprofile" className="kc-navbar__login">
                  Dashboard
                </Link>
                <button type="button" onClick={handleLogout} className="kc-navbar__logoutBtn">
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
