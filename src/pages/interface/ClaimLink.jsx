// src/pages/auth/ClaimLink.jsx
import React, { useEffect, useMemo, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useKonarToast } from "../../hooks/useKonarToast";
import api from "../../services/api";
import { AuthContext } from "../../components/AuthContext";
import Navbar from "../../components/Navbar";
import "../../styling/login.css";

/* ── Icons ──────────────────────────────────────────────── */
function BackArrow() {
    return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M9 2.5L4.5 7 9 11.5" stroke="currentColor" strokeWidth="1.7"
                strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

const PENDING_CLAIM_KEY = "pendingClaimUsername";
const OAUTH_SOURCE_KEY = "oauthSource";
const CHECKOUT_INTENT_KEY = "konar_checkout_intent_v1";

function readCheckoutIntent() {
    try {
        const raw = localStorage.getItem(CHECKOUT_INTENT_KEY);
        if (!raw) return null;
        const intent = JSON.parse(raw);
        if (!intent?.planKey) return null;

        const age = Date.now() - Number(intent.createdAt || 0);
        if (age > 30 * 60 * 1000) {
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
    } catch { }
}

function clearLocalAuth() {
    try {
        localStorage.removeItem("token");
        localStorage.removeItem("authUser");
    } catch { }
}

export default function ClaimLink() {
    const toast    = useKonarToast();
    const navigate = useNavigate();
    const { user, fetchUser } = useContext(AuthContext);

    const [username, setUsername] = useState("");
    const [profileSlug, setProfileSlug] = useState("");
    const [loading, setLoading] = useState(false);

    const hasClaimedUsername = !!user?.username;
    const currentUsername = (user?.username || "").toLowerCase().trim();

    const cleanedUsername = useMemo(
        () =>
            (username || "")
                .trim()
                .toLowerCase()
                .replace(/[^a-z0-9._-]/g, ""),
        [username]
    );

    const cleanedProfileSlug = useMemo(
        () =>
            (profileSlug || "")
                .trim()
                .toLowerCase()
                .replace(/[^a-z0-9-]/g, "-")
                .replace(/-+/g, "-")
                .replace(/^-+|-+$/g, ""),
        [profileSlug]
    );

    const resumeCheckoutIfNeeded = async () => {
        const intent = readCheckoutIntent();
        if (!intent) return false;

        try {
            const res = await api.post("/subscribe", {
                planKey: intent.planKey,
                returnUrl: intent.returnUrl,
            });

            if (!res?.data?.url) return false;

            clearCheckoutIntent();
            window.location.href = res.data.url;
            return true;
        } catch {
            return false;
        }
    };

    const submitClaimUsername = async (e) => {
        e.preventDefault();

        if (!cleanedUsername || cleanedUsername.length < 3) {
            toast.error("Link name must be at least 3 characters.");
            return;
        }

        setLoading(true);
        try {
            const res = await api.post("/claim-link", { username: cleanedUsername });

            if (res?.data?.error) {
                toast.error(res.data.error);
                return;
            }

            await fetchUser?.();

            try {
                localStorage.removeItem(PENDING_CLAIM_KEY);
                localStorage.removeItem(OAUTH_SOURCE_KEY);
            } catch { }

            const resumed = await resumeCheckoutIfNeeded();
            if (resumed) return;

            navigate("/profiles", { replace: true });
        } catch (err) {
            if ([401, 403].includes(err?.response?.status)) {
                clearLocalAuth();
                navigate("/login", { replace: true });
                return;
            }
            toast.error(err?.response?.data?.error || "Failed to claim link.");
        } finally {
            setLoading(false);
        }
    };

    const submitCreateProfile = async (e) => {
        e.preventDefault();

        if (!cleanedProfileSlug || cleanedProfileSlug.length < 3) {
            toast.error("Profile slug must be at least 3 characters.");
            return;
        }

        setLoading(true);
        try {
            const res = await api.post("/api/business-card/profiles", {
                profile_slug: cleanedProfileSlug,
                template_id: "template-1",
            });

            navigate(`/profiles/edit?slug=${res?.data?.data?.profile_slug || cleanedProfileSlug}`, {
                replace: true,
            });
        } catch (err) {
            toast.error(err?.response?.data?.error || "Failed to create profile.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (hasClaimedUsername && !profileSlug) setProfileSlug("profile-2");
    }, [hasClaimedUsername, profileSlug]);

    return (
        <>
            <Navbar />

            <div className="kc-auth-page">
                <div className="kc-auth-topActions">
                    <button
                        type="button"
                        className="kc-auth-backBtn"
                        onClick={() => navigate(hasClaimedUsername ? "/profiles" : "/")}
                        aria-label={hasClaimedUsername ? "Back to profiles" : "Back to home"}
                    >
                        <BackArrow />
                        {hasClaimedUsername ? "Back to profiles" : "Back to home"}
                    </button>
                </div>

                <main className="kc-auth-main">
                    <div className="kc-auth-inner">
                        <div className="kc-auth-panel">
                            {!hasClaimedUsername ? (
                                <>
                                    <h1 className="h2 kc-auth-title">
                                        Claim your <span className="kc-auth-accent">link</span>
                                    </h1>
                                    <p className="kc-subtitle">
                                        This is your main KonarCard link. You’ll share this with customers.
                                    </p>

                                    <form onSubmit={submitClaimUsername} className="kc-form">
                                        <div className="kc-field">
                                            <label className="kc-label">Your link</label>
                                            <div className="kc-claim">
                                                <div className="kc-claim-prefix">konarcard.com/u/</div>
                                                <input
                                                    className="kc-input kc-claim-input"
                                                    value={username}
                                                    onChange={(e) => setUsername(e.target.value)}
                                                    placeholder="yourbusinessname"
                                                    autoFocus
                                                    required
                                                />
                                            </div>
                                            <p className="kc-microcopy">Free to claim. No payment needed.</p>
                                        </div>

                                        <div className="kc-actionsCenter">
                                            <button className="kx-btn kx-btn--black kc-authBtn" disabled={loading} aria-busy={loading}>
                                                {loading ? "Claiming…" : "Claim link"}
                                            </button>
                                        </div>

                                        <p className="kc-bottom-line">
                                            Already have an account?{" "}
                                            <Link className="kc-link" to="/login">
                                                Sign in
                                            </Link>
                                        </p>
                                    </form>
                                </>
                            ) : (
                                <>
                                    <h1 className="h2 kc-auth-title">
                                        Create a <span className="kc-auth-accent">profile link</span>
                                    </h1>
                                    <p className="kc-subtitle">
                                        Your main link is{" "}
                                        <strong>{`konarcard.com/u/${currentUsername}`}</strong>
                                    </p>

                                    <form onSubmit={submitCreateProfile} className="kc-form">
                                        <div className="kc-field">
                                            <label className="kc-label">New profile link</label>
                                            <div className="kc-claim">
                                                <div className="kc-claim-prefix">{`/u/${currentUsername}/`}</div>
                                                <input
                                                    className="kc-input kc-claim-input"
                                                    value={profileSlug}
                                                    onChange={(e) => setProfileSlug(e.target.value)}
                                                    placeholder="kitchen-fitouts"
                                                    autoFocus
                                                    required
                                                />
                                            </div>
                                            <p className="kc-microcopy">
                                                Example:{" "}
                                                <strong>{`/u/${currentUsername}/${cleanedProfileSlug || "kitchen-fitouts"}`}</strong>
                                            </p>
                                        </div>

                                        <div className="kc-actionsCenter">
                                            <button className="kx-btn kx-btn--black kc-authBtn" disabled={loading} aria-busy={loading}>
                                                {loading ? "Creating…" : "Create profile link"}
                                            </button>
                                        </div>

                                        <p className="kc-bottom-line">
                                            Want to manage profiles?{" "}
                                            <Link className="kc-link" to="/profiles">
                                                Go to Profiles
                                            </Link>
                                        </p>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
