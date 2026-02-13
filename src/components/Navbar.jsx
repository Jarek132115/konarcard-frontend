import React, { useEffect, useState, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import LogoIcon from "../assets/icons/Logo-Icon.svg";

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

  // lock scroll when menu open
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  // close on route change
  useEffect(() => {
    setMobileOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <nav className="kc-navbar" aria-label="Primary navigation">
      <div className="kc-navbar__container">
        {/* =========================
            MOBILE BAR (always same height)
           ========================= */}
        <div className="kc-navbar__mobileBar">
          <Link to="/" className="kc-navbar__logoLink" aria-label="Home">
            <img src={LogoIcon} alt="KonarCard" className="kc-navbar__logo" />
          </Link>

          <button
            type="button"
            className={`kc-navbar__burger ${mobileOpen ? "is-open" : ""}`}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((s) => !s)}
          >
            <span aria-hidden="true" />
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>
        </div>

        {/* =========================
            DESKTOP BAR
           ========================= */}
        <div className="kc-navbar__desktop">
          <div className="kc-navbar__left">
            <Link to="/" className="kc-navbar__logoLink" aria-label="Home">
              <img src={LogoIcon} alt="KonarCard" className="kc-navbar__logo" />
            </Link>
          </div>

          <ul className="kc-navbar__centerLinks">
            {navItems.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className={isActive(item.to) ? "active" : ""}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="kc-navbar__right">
            {!isAuthed ? (
              <>
                <Link to="/login" state={{ from: location.pathname }} className="kc-navbar__login">
                  Login
                </Link>

                <Link to="/register" state={{ from: location.pathname }} className="kc-navbar__cta">
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

      {/* =========================
          MOBILE MENU (full width, under the bar)
         ========================= */}
      <div className={`kc-navbar__mobileMenu ${mobileOpen ? "is-open" : ""}`} role="dialog" aria-modal="true">
        <div className="kc-navbar__mobileMenuInner">
          <div className="kc-navbar__menuLabel">MENU</div>

          <div className="kc-navbar__menuLinks">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`kc-navbar__menuBtn ${isActive(item.to) ? "is-active" : ""}`}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* ✅ requested: make this 100px */}
          <div className="kc-navbar__menuGap" aria-hidden="true" />

          <div className="kc-navbar__menuActions">
            {!isAuthed ? (
              <>
                <Link
                  to="/login"
                  state={{ from: location.pathname }}
                  className="kc-navbar__menuBtn"
                  onClick={() => setMobileOpen(false)}
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  state={{ from: location.pathname }}
                  className="kc-navbar__menuCta"
                  onClick={() => setMobileOpen(false)}
                >
                  Claim Your Link
                </Link>
              </>
            ) : (
              <>
                <Link to="/myprofile" className="kc-navbar__menuBtn" onClick={() => setMobileOpen(false)}>
                  Dashboard
                </Link>

                <button type="button" className="kc-navbar__menuBtn" onClick={handleLogout}>
                  Logout
                </button>
              </>
            )}
          </div>

          <div className="kc-navbar__menuFooter">© {new Date().getFullYear()} KonarCard</div>
        </div>
      </div>
    </nav>
  );
}
