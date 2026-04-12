import React, { useEffect, useState, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import LogoIcon from "../assets/icons/Logo-Icon.svg";

function BurgerIcon() {
  return (
    <svg width="22" height="16" viewBox="0 0 22 16" fill="none">
      <line x1="1" y1="2" x2="21" y2="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="1" y1="8" x2="21" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="1" y1="14" x2="21" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <line x1="4" y1="4" x2="16" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="16" y1="4" x2="4" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthed = !!user;

  const navItems = [
    { label: "Products", to: "/products" },
    { label: "Examples", to: "/examples" },
    { label: "Pricing", to: "/pricing" },
    { label: "FAQs", to: "/faq" },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    setMobileOpen(false);
    navigate("/");
  };

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <nav className="kcnav" aria-label="Primary navigation">
      {/* ── SINGLE TOP BAR ── */}
      <div className="kcnav__bar">
        <Link to="/" className="kcnav__logoLink" aria-label="Home">
          <img src={LogoIcon} alt="KonarCard" className="kcnav__logo" />
        </Link>

        <ul className="kcnav__links">
          {navItems.map((item) => (
            <li key={item.to}>
              <Link to={item.to} className={isActive(item.to) ? "active" : ""}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="kcnav__actions">
          {!isAuthed ? (
            <>
              <Link to="/login" state={{ from: location.pathname }} className="kcnav__loginBtn">
                Login
              </Link>
              <Link to="/register" state={{ from: location.pathname }} className="kcnav__cta">
                Claim Your Link
              </Link>
            </>
          ) : (
            <>
              <Link to="/myprofile" className="kcnav__loginBtn">
                Dashboard
              </Link>
              <button type="button" onClick={handleLogout} className="kcnav__logoutBtn">
                Logout
              </button>
            </>
          )}
        </div>

        <button
          type="button"
          className="kcnav__burger"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((s) => !s)}
        >
          {mobileOpen ? <CloseIcon /> : <BurgerIcon />}
        </button>
      </div>

      {/* ── MOBILE MENU ── */}
      {mobileOpen && (
        <div className="kcnav__menu" role="dialog" aria-modal="true">
          <div className="kcnav__menuInner">
            <div className="kcnav__menuLabel">MENU</div>

            <div className="kcnav__menuLinks">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`kcnav__menuBtn ${isActive(item.to) ? "is-active" : ""}`}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="kcnav__menuGap" aria-hidden="true" />

            <div className="kcnav__menuActions">
              {!isAuthed ? (
                <>
                  <Link
                    to="/login"
                    state={{ from: location.pathname }}
                    className="kcnav__menuBtn"
                    onClick={() => setMobileOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    state={{ from: location.pathname }}
                    className="kcnav__menuCta"
                    onClick={() => setMobileOpen(false)}
                  >
                    Claim Your Link
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/myprofile" className="kcnav__menuBtn" onClick={() => setMobileOpen(false)}>
                    Dashboard
                  </Link>
                  <button type="button" className="kcnav__menuBtn" onClick={handleLogout}>
                    Logout
                  </button>
                </>
              )}
            </div>

            <div className="kcnav__menuFooter">© {new Date().getFullYear()} KonarCard</div>
          </div>
        </div>
      )}
    </nav>
  );
}
