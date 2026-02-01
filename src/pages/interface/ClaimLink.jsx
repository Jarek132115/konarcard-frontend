// src/pages/auth/ClaimLink.jsx  (or wherever this file lives)
import React, { useState, useContext, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../../services/api";
import { AuthContext } from "../../components/AuthContext";
import "../../styling/login.css";

const PENDING_CLAIM_KEY = "pendingClaimUsername";
const OAUTH_SOURCE_KEY = "oauthSource";
const CHECKOUT_INTENT_KEY = "konar_checkout_intent_v1";

function readCheckoutIntent() {
    try {
        const raw = localStorage.getItem(CHECKOUT_INTENT_KEY);
        if (!raw) return null;

        const intent = JSON.parse(raw);
        if (!intent?.planKey) return null;

        // expire after 30 minutes
        const age = Date.now() - Number(intent.createdAt || 0);
        if (Number.isFinite(age) && age > 30 * 60 * 1000) {
            localStorage.removeItem(CHECKOUT_INTENT_KEY);
            return null;
        }

        return intent;
    } catch {
        return null;
    }
}

function clearCheckoutIntent() {
    try {
        localStorage.removeItem(CHECKOUT_INTENT_KEY);
    } catch {
        // ignore
    }
}

function clearLocalAuth() {
    try {
        localStorage.removeItem("token");
        localStorage.removeItem("authUser");
    } catch {
        // ignore
    }
}

export default function ClaimLink() {
    const navigate = useNavigate();
    const { fetchUser } = useContext(AuthContext);

    const [username, setUsername] = useState("");
    const [loading, setLoading] = useState(false);

    const cleaned = useMemo(() => {
        return (username || "")
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9._-]/g, "");
    }, [username]);

    // ✅ Start Stripe checkout AFTER claim exists
    const resumeCheckoutIfNeeded = async () => {
        const intent = readCheckoutIntent();
        if (!intent) return false;

        const returnUrl = intent.returnUrl || `${window.location.origin}/myprofile?subscribed=1`;

        try {
            // do NOT clear intent until we have a Stripe URL
            const res = await api.post("/subscribe", {
                planKey: intent.planKey,
                returnUrl,
            });

            const url = res?.data?.url;
            if (!url) {
                toast.error("Stripe checkout URL missing. Please try again.");
                return false;
            }

            clearCheckoutIntent();
            window.location.href = url;
            return true;
        } catch (e) {
            // keep intent so user can retry
            toast.error(e?.response?.data?.error || "Subscription failed.");
            return false;
        }
    };

    const submit = async (e) => {
        e.preventDefault();

        if (!cleaned) return toast.error("Please enter a link name.");
        if (cleaned.length < 3) return toast.error("Link name must be at least 3 characters.");

        // Must be logged in to claim
        const token = (() => {
            try {
                return localStorage.getItem("token") || "";
            } catch {
                return "";
            }
        })();

        if (!token) {
            toast.error("You must be logged in.");
            navigate("/login", { replace: true });
            return;
        }

        setLoading(true);
        try {
            // ✅ Use api interceptor auth (don’t manually pass Authorization)
            const res = await api.post("/claim-link", { username: cleaned });

            if (res?.data?.error) {
                toast.error(res.data.error);
                return;
            }

            toast.success("Link claimed successfully!");

            // Refresh authUser
            await fetchUser?.();

            // Clear claim-related keys
            try {
                localStorage.removeItem(PENDING_CLAIM_KEY);
                localStorage.removeItem(OAUTH_SOURCE_KEY);
            } catch {
                // ignore
            }

            // ✅ If user came from pricing, go Stripe NOW
            const resumed = await resumeCheckoutIfNeeded();
            if (resumed) return;

            // Otherwise normal
            navigate("/myprofile", { replace: true });
        } catch (err) {
            const status = err?.response?.status;

            // If token is invalid / user deleted
            if (status === 401 || status === 403) {
                clearLocalAuth();
                toast.error("Session expired. Please log in again.");
                navigate("/login", { replace: true });
                return;
            }

            toast.error(err?.response?.data?.error || "Failed to claim link.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="kc-auth-page">
            <header className="kc-auth-header">
                <Link to="/" className="kc-logo" aria-label="KonarCard Home">
                    K
                </Link>

                <button
                    type="button"
                    className="kc-close"
                    onClick={() => navigate("/myprofile")}
                    aria-label="Close"
                >
                    <span aria-hidden="true">×</span>
                </button>
            </header>

            <main className="kc-auth-main">
                <div className="kc-auth-inner">
                    <h1 className="kc-title">Claim Your Link</h1>
                    <p className="kc-subtitle">
                        This is your unique link. When someone clicks it, they see your digital business card.
                    </p>

                    <form onSubmit={submit} className="kc-form kc-form-claim">
                        <div className="kc-field">
                            <label className="kc-label">Claim Your Link Name</label>

                            <div className="kc-claim">
                                <div className="kc-claim-prefix">www.konarcard.com/u/</div>
                                <div className="kc-claim-sep">|</div>
                                <input
                                    className="kc-input kc-claim-input"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="yourbusinessname"
                                    autoComplete="off"
                                    required
                                />
                            </div>

                            <p className="kc-microcopy">Free to claim. No payment needed.</p>
                        </div>

                        <button className="kc-btn kc-btn-primary kc-btn-center" disabled={loading} aria-busy={loading}>
                            {loading ? "Claiming…" : "Claim Link"}
                        </button>

                        <p className="kc-bottom-line">
                            Already have an account? <Link className="kc-link" to="/login">Sign In</Link>
                        </p>
                    </form>
                </div>
            </main>
        </div>
    );
}
