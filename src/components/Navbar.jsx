// frontend/src/components/Navbar.jsx
import React, { useContext, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { AuthContext } from "./AuthContext";
import LogoIcon from "../assets/icons/Logo-Icon.svg";

/* ── Easing ─────────────────────────────────────────────── */
const EASE_OUT = [0.22, 1, 0.36, 1];
const EASE_IN  = [0.4, 0, 1, 1];

/* ── Nav items ──────────────────────────────────────────── */
const NAV_ITEMS = [
    { label: "Products", to: "/products" },
    { label: "Examples", to: "/examples" },
    { label: "Pricing",  to: "/pricing"  },
    { label: "FAQs",     to: "/faq"      },
];

/* ── Burger / X icon ────────────────────────────────────── */
function BurgerIcon({ open }) {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            {/* Top line → rotates to \ */}
            <motion.rect
                x="4" y="6" width="16" height="2" rx="1"
                fill="#0b1220"
                animate={
                    open
                        ? { rotate: 45, y: 11, x: 4 }
                        : { rotate: 0,  y: 6,  x: 4 }
                }
                transition={{ duration: 0.25, ease: EASE_OUT }}
                style={{ transformOrigin: "12px 12px" }}
            />
            {/* Middle line → fades out */}
            <motion.rect
                x="4" y="11" width="16" height="2" rx="1"
                fill="#0b1220"
                animate={{ opacity: open ? 0 : 1, scaleX: open ? 0 : 1 }}
                transition={{ duration: 0.2 }}
                style={{ transformOrigin: "12px 12px" }}
            />
            {/* Bottom line → rotates to / */}
            <motion.rect
                x="4" y="16" width="16" height="2" rx="1"
                fill="#0b1220"
                animate={
                    open
                        ? { rotate: -45, y: 11, x: 4 }
                        : { rotate: 0,   y: 16, x: 4 }
                }
                transition={{ duration: 0.25, ease: EASE_OUT }}
                style={{ transformOrigin: "12px 12px" }}
            />
        </svg>
    );
}

/* ── Overlay animation variants ─────────────────────────── */
const overlayVariants = {
    hidden:  { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.28, ease: EASE_OUT } },
    exit:    { opacity: 0, transition: { duration: 0.2,  ease: EASE_IN } },
};

const staggerList = {
    visible: { transition: { staggerChildren: 0.04, delayChildren: 0.06 } },
};

const itemVariants = {
    hidden:  { opacity: 0, x: -12 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: EASE_OUT } },
};

/* ── Component ──────────────────────────────────────────── */
export default function Navbar() {
    const [open, setOpen]  = useState(false);
    const location         = useLocation();
    const navigate         = useNavigate();
    const { user, logout } = useContext(AuthContext);

    const isAuthed = !!user;
    const isActive = (path) => location.pathname === path;
    const close    = () => setOpen(false);

    const handleLogout = async () => {
        close();
        await logout();
        navigate("/");
    };

    /* Lock body scroll when overlay is open */
    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [open]);

    /* Close on route change */
    useEffect(() => { close(); }, [location.pathname]);

    return (
        <>
            {/* ── Fixed nav bar ─────────────────────────────── */}
            <nav className="kc-nav" aria-label="Primary navigation">
                <div className="kc-nav__inner">
                    {/* Logo */}
                    <Link to="/" className="kc-nav__logo" onClick={close} aria-label="KonarCard home">
                        <img src={LogoIcon} alt="KonarCard" height="32" />
                    </Link>

                    {/* Desktop links */}
                    <ul className="kc-nav__links" role="list">
                        {NAV_ITEMS.map((item) => (
                            <li key={item.to}>
                                <Link
                                    to={item.to}
                                    className={`kc-nav__link${isActive(item.to) ? " is-active" : ""}`}
                                >
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>

                    {/* Desktop actions */}
                    <div className="kc-nav__actions">
                        {!isAuthed ? (
                            <>
                                <Link
                                    to="/login"
                                    state={{ from: location.pathname }}
                                    className="kc-nav__textLink"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    state={{ from: location.pathname }}
                                    className="kc-nav__cta"
                                >
                                    Claim Your Link
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link to="/dashboard" className="kc-nav__textLink">
                                    Dashboard
                                </Link>
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="kc-nav__textLink kc-nav__textLink--btn"
                                >
                                    Logout
                                </button>
                            </>
                        )}
                    </div>

                    {/* Mobile burger */}
                    <button
                        type="button"
                        className="kc-nav__burger"
                        onClick={() => setOpen((s) => !s)}
                        aria-label={open ? "Close menu" : "Open menu"}
                        aria-expanded={open}
                        aria-controls="kc-mobile-menu"
                    >
                        <BurgerIcon open={open} />
                    </button>
                </div>
            </nav>

            {/* ── Mobile overlay ────────────────────────────── */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        id="kc-mobile-menu"
                        className="kc-nav__overlay"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Mobile navigation"
                        variants={overlayVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        <div className="kc-nav__overlayInner">
                            {/* Nav links */}
                            <motion.nav
                                variants={staggerList}
                                initial="hidden"
                                animate="visible"
                                className="kc-nav__mobileLinks"
                                aria-label="Mobile nav links"
                            >
                                {NAV_ITEMS.map((item) => (
                                    <motion.div key={item.to} variants={itemVariants}>
                                        <Link
                                            to={item.to}
                                            className={`kc-nav__mobileLink${isActive(item.to) ? " is-active" : ""}`}
                                            onClick={close}
                                        >
                                            {item.label}
                                        </Link>
                                    </motion.div>
                                ))}
                            </motion.nav>

                            {/* Divider */}
                            <div className="kc-nav__mobileDivider" />

                            {/* Auth actions */}
                            <motion.div
                                className="kc-nav__mobileActions"
                                variants={staggerList}
                                initial="hidden"
                                animate="visible"
                            >
                                {!isAuthed ? (
                                    <>
                                        <motion.div variants={itemVariants}>
                                            <Link
                                                to="/register"
                                                state={{ from: location.pathname }}
                                                className="kc-nav__mobileCta"
                                                onClick={close}
                                            >
                                                Claim Your Link
                                            </Link>
                                        </motion.div>
                                        <motion.div variants={itemVariants}>
                                            <Link
                                                to="/login"
                                                state={{ from: location.pathname }}
                                                className="kc-nav__mobileSecondary"
                                                onClick={close}
                                            >
                                                Login
                                            </Link>
                                        </motion.div>
                                    </>
                                ) : (
                                    <>
                                        <motion.div variants={itemVariants}>
                                            <Link
                                                to="/dashboard"
                                                className="kc-nav__mobileCta"
                                                onClick={close}
                                            >
                                                Dashboard
                                            </Link>
                                        </motion.div>
                                        <motion.div variants={itemVariants}>
                                            <button
                                                type="button"
                                                className="kc-nav__mobileSecondary kc-nav__mobileSecondary--btn"
                                                onClick={handleLogout}
                                            >
                                                Logout
                                            </button>
                                        </motion.div>
                                    </>
                                )}
                            </motion.div>

                            <p className="kc-nav__mobileFooter">
                                &copy; {new Date().getFullYear()} KonarCard
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
