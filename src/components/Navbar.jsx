{/* MOBILE OVERLAY MENU */ }
{
  mobileOpen && (
    <div
      className="mobile-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile navigation"
      onClick={(e) => {
        // close only when clicking the dim/edge (not inside panel)
        if (e.target.classList.contains('mobile-overlay')) setMobileOpen(false);
      }}
    >
      <div className="mobile-panel">
        <div className="mobile-panel-header">
          <span className="mobile-panel-title">Menu</span>
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
  )
}
