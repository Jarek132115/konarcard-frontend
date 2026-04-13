// frontend/src/components/CookieConsent.jsx
// Lightweight cookie consent banner shown on first visit.
// Decision is stored in localStorage under `kc_cookie_consent_v1`.
// Policy reference: /policies (Cookie Policy section).

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";

import "../styling/cookie-consent.css";

const STORAGE_KEY = "kc_cookie_consent_v1";

function readConsent() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

function writeConsent(accepted) {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ accepted: !!accepted, ts: Date.now() })
        );
    } catch {
        // ignore — non-blocking
    }
}

export default function CookieConsent() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Only show if the user has never responded. Slight delay so it
        // doesn't flash in before the page paints.
        const existing = readConsent();
        if (existing) return;

        const t = setTimeout(() => setVisible(true), 600);
        return () => clearTimeout(t);
    }, []);

    const handleAccept = () => {
        writeConsent(true);
        setVisible(false);
    };

    const handleReject = () => {
        writeConsent(false);
        setVisible(false);
    };

    return (
        <AnimatePresence>
            {visible ? (
                <motion.div
                    key="cookie-consent"
                    className="kc-cookie"
                    role="dialog"
                    aria-live="polite"
                    aria-label="Cookie notice"
                    initial={{ opacity: 0, y: 20, x: "-50%" }}
                    animate={{ opacity: 1, y: 0, x: "-50%" }}
                    exit={{ opacity: 0, y: 20, x: "-50%" }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                >
                    <div className="kc-cookie__body">
                        <p className="kc-cookie__title">We use cookies</p>
                        <p className="kc-cookie__text">
                            We use essential cookies to make the site work, and
                            optional analytics cookies to understand how it is used. See our{" "}
                            <Link to="/policies" className="kc-cookie__link">
                                Cookie Policy
                            </Link>
                            .
                        </p>
                    </div>

                    <div className="kc-cookie__actions">
                        <button
                            type="button"
                            className="kx-btn kx-btn--white kc-cookie__btn"
                            onClick={handleReject}
                        >
                            Reject optional
                        </button>
                        <button
                            type="button"
                            className="kx-btn kx-btn--orange kc-cookie__btn"
                            onClick={handleAccept}
                        >
                            Accept all
                        </button>
                    </div>
                </motion.div>
            ) : null}
        </AnimatePresence>
    );
}
