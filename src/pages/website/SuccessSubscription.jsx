// src/pages/interface/SuccessSubscription.jsx
import React, { useEffect, useMemo, useState, useContext } from "react";
import { Link, useLocation } from "react-router-dom";

import Sidebar from "../../components/Dashboard/Sidebar";
import PageHeader from "../../components/PageHeader";
import LogoIcon from "../../assets/icons/Logo-Icon.svg";
import api from "../../services/api";
import { AuthContext } from "../../components/AuthContext";

function nicePlanName(plan) {
    const p = (plan || "free").toLowerCase();
    if (p === "plus") return "Plus Plan";
    if (p === "teams") return "Teams Plan";
    return "Free";
}

function niceInterval(interval) {
    const i = (interval || "").toLowerCase();
    if (i === "monthly") return "Monthly";
    if (i === "quarterly") return "Quarterly";
    if (i === "yearly") return "Yearly";
    return "—";
}

export default function SuccessSubscription() {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const sessionIdParam = params.get("session_id"); // Stripe return (we just use it to clean the URL)

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 1000);
    const [isSmallMobile, setIsSmallMobile] = useState(window.innerWidth <= 600);

    const { user: authUser } = useContext(AuthContext);

    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    // Subscription details from backend
    const [sub, setSub] = useState(null);

    // ---------- layout listeners ----------
    useEffect(() => {
        const onResize = () => {
            const m = window.innerWidth <= 1000;
            const sm = window.innerWidth <= 600;
            setIsMobile(m);
            setIsSmallMobile(sm);
            if (!m && sidebarOpen) setSidebarOpen(false);
        };
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, [sidebarOpen]);

    useEffect(() => {
        if (sidebarOpen && isMobile) document.body.classList.add("body-no-scroll");
        else document.body.classList.remove("body-no-scroll");
    }, [sidebarOpen, isMobile]);

    // ---------- fetch subscription status ----------
    useEffect(() => {
        let mounted = true;

        (async () => {
            try {
                setLoading(true);
                setErr("");

                // Pull subscription status from YOUR backend (DB-backed)
                const res = await api.get("/api/subscription-status", {
                    params: { ts: Date.now() },
                });

                if (!mounted) return;

                setSub(res?.data || null);

                // Clean URL (drop session_id)
                if (sessionIdParam) {
                    const clean = new URL(window.location.href);
                    clean.searchParams.delete("session_id");
                    window.history.replaceState({}, document.title, clean.toString());
                }
            } catch (e) {
                if (!mounted) return;
                setErr(
                    e?.response?.data?.error ||
                    "Could not load your subscription details."
                );
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, [authUser, sessionIdParam]);

    const isActive = !!sub?.active;
    const plan = sub?.plan || "free";
    const interval = sub?.interval || "monthly";
    const status = sub?.status || (isActive ? "active" : "inactive");

    const nextChargeDate = useMemo(() => {
        if (!sub?.currentPeriodEnd) return null;
        const d = new Date(sub.currentPeriodEnd);
        if (Number.isNaN(d.getTime())) return null;
        return d;
    }, [sub]);

    return (
        <div className={`app-layout ${sidebarOpen ? "sidebar-active" : ""}`}>
            <div className="myprofile-mobile-header">
                <Link to="/" className="myprofile-logo-link">
                    <img src={LogoIcon} alt="Logo" className="myprofile-logo" />
                </Link>
                <button
                    className={`sidebar-menu-toggle ${sidebarOpen ? "active" : ""}`}
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    aria-label={sidebarOpen ? "Close menu" : "Open menu"}
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>

            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            {sidebarOpen && isMobile && (
                <div
                    className="sidebar-overlay active"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <main className="main-content-container">
                <PageHeader title="Subscription" isMobile={isMobile} isSmallMobile={isSmallMobile} />

                <div className="success-container">
                    {loading ? (
                        <p>Activating your subscription…</p>
                    ) : err ? (
                        <p style={{ color: "#b91c1c" }}>{err}</p>
                    ) : !sub ? (
                        <p>No subscription details found.</p>
                    ) : (
                        <div className="success-box">
                            <h2 className="desktop-h4 success-header">Subscription Activated ✅</h2>

                            <p className="desktop-body" style={{ margin: 0, color: "#555" }}>
                                Plan: <strong>{nicePlanName(plan)}</strong> · Billing:{" "}
                                <strong>{niceInterval(interval)}</strong>
                            </p>

                            <div className="success-grid" style={{ marginTop: 14 }}>
                                <div className="info-tile">
                                    <p className="desktop-body-s label">Status</p>
                                    <p className="desktop-h5 value">{String(status)}</p>
                                </div>

                                <div className="info-tile">
                                    <p className="desktop-body-s label">Next renewal</p>
                                    <p className="desktop-h5 value">
                                        {nextChargeDate ? nextChargeDate.toLocaleString() : "—"}
                                    </p>
                                </div>
                            </div>

                            {!isActive && (
                                <div
                                    style={{
                                        marginTop: 12,
                                        padding: 12,
                                        borderRadius: 12,
                                        border: "1px solid #fecaca",
                                        background: "#fff1f2",
                                    }}
                                >
                                    <p className="desktop-body-s" style={{ margin: 0 }}>
                                        Your subscription isn’t active yet. If you just paid, refresh in 10–20 seconds.
                                    </p>
                                </div>
                            )}

                            <div className="success-buttons" style={{ display: "grid", gap: 12, marginTop: 14 }}>
                                <Link
                                    to="/myprofile"
                                    className="cta-blue-button desktop-button"
                                    style={{ width: "100%" }}
                                >
                                    Go to Dashboard
                                </Link>

                                <Link
                                    to="/pricing"
                                    className="cta-black-button desktop-button"
                                    style={{ width: "100%" }}
                                >
                                    View pricing
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
