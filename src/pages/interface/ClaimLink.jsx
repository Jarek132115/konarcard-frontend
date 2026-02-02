// src/pages/auth/ClaimLink.jsx  (or wherever this file lives)
import React, { useEffect, useMemo, useState, useContext } from "react";
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

/**
 * ✅ This page now supports BOTH:
 * 1) Claiming the main username link (first-time):  /u/:username
 * 2) Creating a NEW profile link (multi-profile):  /u/:username/:slug
 *
 * ✅ QR requirement:
 * - When you CREATE a profile: backend generates qr_code_url immediately.
 * - When you SAVE a profile: backend "safety-net" generates qr_code_url if missing.
 * - After claiming username, we also ensure a "main" profile exists + has QR.
 */
export default function ClaimLink() {
    const navigate = useNavigate();
    const { user, fetchUser } = useContext(AuthContext);

    // Mode A: Claim username (if user has no username yet)
    const [username, setUsername] = useState("");

    // Mode B: Create a new profile slug (if user already has username)
    const [profileSlug, setProfileSlug] = useState("");

    const [loading, setLoading] = useState(false);

    const hasClaimedUsername = !!(user?.username && String(user.username).trim());
    const currentUsername = (user?.username || "").toLowerCase().trim();

    const cleanedUsername = useMemo(() => {
        return (username || "")
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9._-]/g, "");
    }, [username]);

    const cleanedProfileSlug = useMemo(() => {
        // allow a-z 0-9 - only (match backend schema)
        const s = (profileSlug || "")
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-+|-+$/g, "");
        return s;
    }, [profileSlug]);

    // ✅ Start Stripe checkout AFTER claim exists
    const resumeCheckoutIfNeeded = async () => {
        const intent = readCheckoutIntent();
        if (!intent) return false;

        // default returnUrl to new dashboard editor
        const returnUrl =
            intent.returnUrl || `${window.location.origin}/profiles/edit?slug=main&subscribed=1`;

        try {
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

    /**
     * ✅ Ensure main profile exists and has a QR code.
     * - If profile doesn't exist: create it (backend creates QR).
     * - If it exists but missing qr_code_url: POST /api/business-card with only profile_slug
     *   (backend safety-net creates QR without overwriting user data).
     */
    const ensureMainProfileAndQr = async () => {
        try {
            // 1) check if main profile exists
            const res = await api.get("/api/business-card/profiles/main");
            const card = res?.data?.data || null;

            if (!card) {
                // create main profile (backend generates qr_code_url)
                await api.post("/api/business-card/profiles", {
                    profile_slug: "main",
                    template_id: "template-1",
                    business_card_name: "",
                });
                return;
            }

            // 2) if main exists but QR missing, trigger save safety-net
            if (!card.qr_code_url) {
                const fd = new FormData();
                fd.set("profile_slug", "main");
                await api.post("/api/business-card", fd, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            }
        } catch (e) {
            // Don't block the user if QR generation fails — just log & continue.
            console.error("ensureMainProfileAndQr failed:", e);
        }
    };

    /**
     * MODE A: Claim username
     */
    const submitClaimUsername = async (e) => {
        e.preventDefault();

        if (!cleanedUsername) return toast.error("Please enter a link name.");
        if (cleanedUsername.length < 3)
            return toast.error("Link name must be at least 3 characters.");

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
            // ✅ Uses api interceptor auth
            const res = await api.post("/claim-link", { username: cleanedUsername });

            if (res?.data?.error) {
                toast.error(res.data.error);
                return;
            }

            toast.success("Link claimed successfully!");

            // refresh authUser (so user.username exists)
            await fetchUser?.();

            // ✅ After claiming username, ensure main profile exists + has QR (per-profile QR)
            await ensureMainProfileAndQr();

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

            // Otherwise go to profiles dashboard
            navigate("/profiles", { replace: true });
        } catch (err) {
            const status = err?.response?.status;

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

    /**
     * MODE B: Create a new profile link (slug)
     * - Uses existing user.username
     * - Creates BusinessCard profile_slug
     * - Backend creates qr_code_url immediately
     */
    const submitCreateProfile = async (e) => {
        e.preventDefault();

        if (!hasClaimedUsername) {
            toast.error("You must claim your main username link first.");
            return;
        }

        if (!cleanedProfileSlug) return toast.error("Please enter a profile link slug.");
        if (cleanedProfileSlug.length < 3)
            return toast.error("Profile slug must be at least 3 characters.");
        if (cleanedProfileSlug === "main")
            return toast.error('Use "main" for your default profile. Pick a different slug.');

        setLoading(true);
        try {
            const created = await api.post("/api/business-card/profiles", {
                profile_slug: cleanedProfileSlug,
                template_id: "template-1",
                business_card_name: "",
            });

            const card = created?.data?.data;
            toast.success("Profile link created!");

            // Go edit this profile
            navigate(`/profiles/edit?slug=${encodeURIComponent(card?.profile_slug || cleanedProfileSlug)}`, {
                replace: true,
            });
        } catch (err) {
            const status = err?.response?.status;

            if (status === 401 || status === 403) {
                clearLocalAuth();
                toast.error("Session expired. Please log in again.");
                navigate("/login", { replace: true });
                return;
            }

            toast.error(err?.response?.data?.error || "Failed to create profile link.");
        } finally {
            setLoading(false);
        }
    };

    // Small UX: if user is already claimed, prefill a suggested slug
    useEffect(() => {
        if (!hasClaimedUsername) return;
        if (profileSlug) return;
        setProfileSlug("profile-2");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasClaimedUsername]);

    const closeTo = hasClaimedUsername ? "/profiles" : "/dashboard";

    return (
        <div className="kc-auth-page">
            <header className="kc-auth-header">
                <Link to="/" className="kc-logo" aria-label="KonarCard Home">
                    K
                </Link>

                <button
                    type="button"
                    className="kc-close"
                    onClick={() => navigate(closeTo)}
                    aria-label="Close"
                >
                    <span aria-hidden="true">×</span>
                </button>
            </header>

            <main className="kc-auth-main">
                <div className="kc-auth-inner">
                    {!hasClaimedUsername ? (
                        <>
                            <h1 className="kc-title">Claim Your Link</h1>
                            <p className="kc-subtitle">
                                This is your main link. When someone clicks it, they see your digital business card.
                            </p>

                            <form onSubmit={submitClaimUsername} className="kc-form kc-form-claim">
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

                                <button
                                    className="kc-btn kc-btn-primary kc-btn-center"
                                    disabled={loading}
                                    aria-busy={loading}
                                >
                                    {loading ? "Claiming…" : "Claim Link"}
                                </button>

                                <p className="kc-bottom-line">
                                    Already have an account?{" "}
                                    <Link className="kc-link" to="/login">
                                        Sign In
                                    </Link>
                                </p>
                            </form>
                        </>
                    ) : (
                        <>
                            <h1 className="kc-title">Create a New Profile Link</h1>
                            <p className="kc-subtitle">
                                Your main link is{" "}
                                <strong>{`www.konarcard.com/u/${currentUsername}`}</strong>. Add a profile slug to create another
                                shareable link (and it will get its own QR code).
                            </p>

                            <form onSubmit={submitCreateProfile} className="kc-form kc-form-claim">
                                <div className="kc-field">
                                    <label className="kc-label">New profile link</label>

                                    <div className="kc-claim">
                                        <div className="kc-claim-prefix">{`www.konarcard.com/u/${currentUsername}/`}</div>
                                        <div className="kc-claim-sep">|</div>
                                        <input
                                            className="kc-input kc-claim-input"
                                            value={profileSlug}
                                            onChange={(e) => setProfileSlug(e.target.value)}
                                            placeholder="kitchen-fitouts"
                                            autoComplete="off"
                                            required
                                        />
                                    </div>

                                    <p className="kc-microcopy">
                                        Example:{" "}
                                        <strong>{`/u/${currentUsername}/${cleanedProfileSlug || "kitchen-fitouts"}`}</strong>
                                    </p>
                                </div>

                                <button
                                    className="kc-btn kc-btn-primary kc-btn-center"
                                    disabled={loading}
                                    aria-busy={loading}
                                >
                                    {loading ? "Creating…" : "Create Profile Link"}
                                </button>

                                <p className="kc-bottom-line">
                                    Want to edit your profiles instead?{" "}
                                    <Link className="kc-link" to="/profiles">
                                        Go to Profiles
                                    </Link>
                                </p>
                            </form>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
