import React, { useState, useEffect, useRef, useContext, useMemo, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useKonarToast } from "../../hooks/useKonarToast";
import { AuthContext } from "../../components/AuthContext";
import api, { BASE_URL } from "../../services/api";
import Navbar from "../../components/Navbar";
import "../../styling/login.css";

import { useSeo } from "../../utils/seo";

import GoogleIcon   from "../../assets/icons/Google-Icon.svg";
import FacebookIcon from "../../assets/icons/Facebook-Icon.svg";
import AppleIcon    from "../../assets/icons/Apple-Icon.svg";

const PENDING_CLAIM_KEY    = "pendingClaimUsername";
const OAUTH_SOURCE_KEY     = "oauthSource";
const CHECKOUT_INTENT_KEY  = "konar_checkout_intent_v1";
const NFC_INTENT_KEY       = "konar_nfc_intent_v1";

/* ── Icons ───────────────────────────────────────────────── */
function BackArrow() {
    return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M9 2.5L4.5 7 9 11.5" stroke="currentColor" strokeWidth="1.7"
                strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function EyeIcon({ open }) {
    return open ? (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M1.5 9C1.5 9 4 4.5 9 4.5S16.5 9 16.5 9 14 13.5 9 13.5 1.5 9 1.5 9Z"
                stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
            <circle cx="9" cy="9" r="2.25" stroke="currentColor" strokeWidth="1.4" />
        </svg>
    ) : (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M2.5 2.5l13 13M7.17 7.27A2.25 2.25 0 0011.73 11.83M4.2 4.45C2.8 5.6 1.5 9 1.5 9s2.5 4.5 7.5 4.5c1.37 0 2.58-.37 3.61-.97M7.5 4.6A8.2 8.2 0 019 4.5c5 0 7.5 4.5 7.5 4.5a12.6 12.6 0 01-2.16 2.95"
                stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

/* ── Helpers ──────────────────────────────────────────────── */
function buildCardsProductUrl(productKey) {
    const safe = String(productKey || "").trim();
    return safe ? `/cards?product=${encodeURIComponent(safe)}` : "/cards";
}

export default function Register() {
    useSeo({
        path: "/register",
        title: "Create Your KonarCard Account",
        description:
            "Sign up for KonarCard and set up your digital business card profile in minutes.",
        noindex: true,
    });

    const toast     = useKonarToast();
    const navigate  = useNavigate();
    const location  = useLocation();
    const { login } = useContext(AuthContext);

    const claimInputRef = useRef(null);
    const nameInputRef  = useRef(null);

    const [data, setData] = useState({ name: "", email: "", username: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [claimInput, setClaimInput]     = useState("");
    const [forceClaimStep, setForceClaimStep]   = useState(false);
    const [verificationStep, setVerificationStep] = useState(false);
    const [code, setCode]         = useState("");
    const [cooldown, setCooldown] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isVerifying, setIsVerifying]   = useState(false);

    const sanitizeSlug = (v) =>
        (v || "").trim().toLowerCase().replace(/[^a-z0-9._-]/g, "");

    const cleanEmail = (v) => String(v || "").trim().toLowerCase();
    const cleanCode  = (v) => String(v || "").replace(/\D/g, "").slice(0, 6);

    const goBack = () => {
        const from = location.state?.from;
        if (from) navigate(from);
        else navigate(-1);
    };

    const goToVerifyStep = (msg) => {
        toast.success(msg || "Check your inbox. Verification code sent.");
        setCode("");
        setVerificationStep(true);
        setCooldown(30);
    };

    /* ── Intent helpers ──────────────────────────────────── */
    const readCheckoutIntent = useCallback(() => {
        try {
            const raw = localStorage.getItem(CHECKOUT_INTENT_KEY);
            if (!raw) return null;
            const intent = JSON.parse(raw);
            if (!intent?.planKey) return null;
            const age = Date.now() - Number(intent.createdAt || 0);
            if (Number.isFinite(age) && age > 30 * 60 * 1000) { localStorage.removeItem(CHECKOUT_INTENT_KEY); return null; }
            return intent;
        } catch { return null; }
    }, []);

    const clearCheckoutIntent = useCallback(() => {
        try { localStorage.removeItem(CHECKOUT_INTENT_KEY); } catch { }
    }, []);

    const readNfcIntent = useCallback(() => {
        try {
            const raw = localStorage.getItem(NFC_INTENT_KEY);
            if (!raw) return null;
            const intent = JSON.parse(raw);
            if (!intent?.productKey) return null;
            const age = Date.now() - Number(intent.createdAt || intent.updatedAt || 0);
            if (Number.isFinite(age) && age > 30 * 60 * 1000) { localStorage.removeItem(NFC_INTENT_KEY); return null; }
            return intent;
        } catch { return null; }
    }, []);

    const resolveDefaultPostAuthDestination = useCallback(() => {
        const from = location.state?.from;
        if (typeof from === "string" && from.trim()) return from;
        return "/dashboard";
    }, [location.state]);

    const checkoutIntent  = useMemo(() => readCheckoutIntent(), [readCheckoutIntent]);
    const hasCheckoutIntent = !!checkoutIntent;
    const nfcIntent       = useMemo(() => readNfcIntent(), [readNfcIntent]);
    const hasNfcIntent    = !!nfcIntent;

    useEffect(() => {
        try {
            const saved     = (localStorage.getItem(PENDING_CLAIM_KEY) || "").trim().toLowerCase();
            const stateSlug = (location.state?.claimedUsername || "").trim().toLowerCase();
            const finalSlug = saved || stateSlug;
            if (finalSlug) {
                setData((d) => ({ ...d, username: finalSlug }));
                setClaimInput(finalSlug);
                setForceClaimStep(false);
            } else {
                setClaimInput("");
                if (hasCheckoutIntent || hasNfcIntent) setForceClaimStep(true);
            }
        } catch {
            if (hasCheckoutIntent || hasNfcIntent) setForceClaimStep(true);
        }
    }, [hasCheckoutIntent, hasNfcIntent, location.state]);

    useEffect(() => {
        if (cooldown <= 0) return;
        const t = setTimeout(() => setCooldown((s) => s - 1), 1000);
        return () => clearTimeout(t);
    }, [cooldown]);

    const hasConfirmedUsername    = Boolean((data.username || "").trim());
    const mustClaimBeforeContinuing = (hasCheckoutIntent || hasNfcIntent) && !hasConfirmedUsername && !verificationStep;
    const shouldShowClaimStep     = !verificationStep && (mustClaimBeforeContinuing || forceClaimStep || !hasConfirmedUsername);

    /* ── Handlers ────────────────────────────────────────── */
    const resumeCheckoutIfNeeded = async () => {
        const intent = readCheckoutIntent();
        if (!intent) return false;
        const uname = (data.username || "").trim();
        if (!uname) { toast.error("Please claim your KonarCard link before subscribing."); setForceClaimStep(true); return false; }
        const returnUrl = intent.returnUrl || `${window.location.origin}/myprofile?subscribed=1`;
        try {
            const res = await api.post("/subscribe", { planKey: intent.planKey, returnUrl });
            const url = res?.data?.url;
            if (!url) { toast.error("Stripe checkout URL missing."); return false; }
            clearCheckoutIntent();
            window.location.href = url;
            return true;
        } catch (e) {
            toast.error(e?.response?.data?.error || "Subscription failed.");
            return false;
        }
    };

    const resumeNfcIfNeeded = useCallback(() => {
        const intent = readNfcIntent();
        if (!intent?.productKey) return false;
        navigate(intent.returnTo || buildCardsProductUrl(intent.productKey), {
            replace: true,
            state: { openProductFromIntent: true, source: "register_nfc_resume" },
        });
        return true;
    }, [navigate, readNfcIntent]);

    const finalizePostAuthNavigation = useCallback(async () => {
        const resumed = await resumeCheckoutIfNeeded();
        if (resumed) return true;
        if (resumeNfcIfNeeded()) return true;
        try { localStorage.removeItem(PENDING_CLAIM_KEY); localStorage.removeItem(OAUTH_SOURCE_KEY); } catch { }
        navigate(resolveDefaultPostAuthDestination(), { replace: true });
        return true;
    }, [navigate, resolveDefaultPostAuthDestination, resumeNfcIfNeeded]);

    const claimLinkContinue = async (e) => {
        e.preventDefault();
        const cleaned = sanitizeSlug(claimInput);
        if (!cleaned) return toast.error("Please enter a link name");
        if (cleaned.length < 3) return toast.error("Link name must be at least 3 characters");
        try {
            const res = await api.post("/claim-link", { username: cleaned });
            if (res?.data?.error) { toast.error(res.data.error); return; }
            setData((d) => ({ ...d, username: cleaned }));
            setClaimInput(cleaned);
            setForceClaimStep(false);
            try { localStorage.setItem(PENDING_CLAIM_KEY, cleaned); } catch { }
            setTimeout(() => nameInputRef.current?.focus?.(), 0);
        } catch (err) {
            toast.error(err?.response?.data?.error || "Link not available");
        }
    };

    const registerUser = async (e) => {
        e.preventDefault();
        if ((hasCheckoutIntent || hasNfcIntent) && !sanitizeSlug(data.username)) {
            toast.error("Please claim your link first.");
            setForceClaimStep(true);
            return;
        }
        const payload = {
            name: String(data.name || "").trim(),
            email: cleanEmail(data.email),
            username: sanitizeSlug(data.username),
            password: data.password,
            confirmPassword: data.password,
        };
        setData((d) => ({ ...d, name: payload.name, email: payload.email, username: payload.username }));
        if (!payload.name)     return toast.error("Please enter your name.");
        if (!payload.email)    return toast.error("Please enter your email.");
        if (!payload.password) return toast.error("Please enter a password.");
        if (!payload.username) { toast.error("Please claim your link first."); setForceClaimStep(true); return; }
        setIsSubmitting(true);
        try {
            const res = await api.post("/register", payload);
            if (res?.data?.error) { toast.error(res.data.error); return; }
            goToVerifyStep(res?.data?.emailSent === false
                ? 'Account created. Tap "Resend code" to get your verification code.'
                : "Verification code sent");
        } catch (err) {
            toast.error(err?.response?.data?.error || "Registration failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    const verifyUserCode = async (e) => {
        e.preventDefault();
        setIsVerifying(true);
        const email     = cleanEmail(data.email);
        const finalCode = cleanCode(code);
        if (!email) { toast.error("Please enter your email first."); setVerificationStep(false); setIsVerifying(false); return; }
        if (finalCode.length !== 6) { toast.error("Please enter the 6-digit code."); setIsVerifying(false); return; }
        setData((d) => ({ ...d, email }));
        setCode(finalCode);
        try {
            const res = await api.post("/verify-email", { email, code: finalCode });
            if (res?.data?.error) { toast.error(res.data.error); return; }
            toast.success("Email verified. Logging you in.");
            const loginRes = await api.post("/login", { email, password: data.password });
            if (loginRes?.data?.error) {
                if (loginRes.data?.resend) { toast.error(loginRes.data?.error || "Please verify your email."); setCooldown(30); return; }
                toast.error(loginRes.data.error || "Login failed after verification.");
                return;
            }
            if (!loginRes?.data?.token || !loginRes?.data?.user) { toast.error("Login failed after verification."); return; }
            login(loginRes.data.token, loginRes.data.user);
            await finalizePostAuthNavigation();
        } catch (err) {
            toast.error(err?.response?.data?.error || "Verification failed");
        } finally {
            setIsVerifying(false);
        }
    };

    const resendCode = async () => {
        const email = cleanEmail(data.email);
        if (!email) { toast.error("Enter your email first."); setVerificationStep(false); return; }
        if (cooldown > 0) return;
        try {
            const r = await api.post("/resend-code", { email });
            if (r?.data?.error) { toast.error(r.data.error); return; }
            toast.success("New code sent. Check your inbox.");
            setCooldown(30);
            setCode("");
            setVerificationStep(true);
        } catch (err) {
            toast.error(err?.response?.data?.error || "Could not resend code.");
        }
    };

    const startOAuth = (provider) => {
        if ((hasCheckoutIntent || hasNfcIntent) && !sanitizeSlug(data.username || claimInput)) {
            toast.error("Please claim your link before continuing.");
            setForceClaimStep(true);
            setTimeout(() => claimInputRef.current?.focus?.(), 0);
            return;
        }
        try {
            localStorage.setItem(OAUTH_SOURCE_KEY, "register");
            const pending = sanitizeSlug(data.username || claimInput);
            if (pending) localStorage.setItem(PENDING_CLAIM_KEY, pending);
        } catch { }
        window.location.href = `${BASE_URL}/auth/${provider}`;
    };

    const backFromVerify = () => {
        setVerificationStep(false);
        setCode("");
        if ((hasCheckoutIntent || hasNfcIntent) && !sanitizeSlug(data.username)) {
            setForceClaimStep(true);
            setTimeout(() => claimInputRef.current?.focus?.(), 0);
        }
    };

    const displayUsername = sanitizeSlug(data.username);

    /* ── Render ──────────────────────────────────────────── */
    return (
        <>
            <Navbar />

            <div className="kc-auth-page">
                <div className="kc-auth-topActions">
                    <button type="button" className="kc-auth-backBtn" onClick={goBack} aria-label="Go back">
                        <BackArrow />
                        Back
                    </button>
                </div>

                <main className="kc-auth-main">
                    <div className="kc-auth-inner">
                        <div className="kc-auth-panel">

                            {/* ── Verify email ───────────────────────── */}
                            {verificationStep ? (
                                <>
                                    <h1 className="h2 kc-auth-title">
                                        Verify your <span className="kc-auth-accent">email</span>
                                    </h1>
                                    <p className="kc-subtitle">Enter the 6-digit code we sent to your email.</p>

                                    <form onSubmit={verifyUserCode} className="kc-form">
                                        <div className="kc-field">
                                            <label className="kc-label" htmlFor="code">Verification code</label>
                                            <input
                                                id="code"
                                                className="kc-input"
                                                value={code}
                                                onChange={(e) => setCode(cleanCode(e.target.value))}
                                                maxLength={6}
                                                inputMode="numeric"
                                                autoComplete="one-time-code"
                                                placeholder="123456"
                                                autoFocus
                                                required
                                            />
                                        </div>

                                        <div className="kc-actionsCenter">
                                            <button className="kx-btn kx-btn--black kc-authBtn"
                                                disabled={isVerifying} aria-busy={isVerifying}>
                                                {isVerifying ? "Verifying…" : "Verify email"}
                                            </button>
                                        </div>

                                        <div className="kc-actionsCenter">
                                            <button type="button" className="kx-btn kx-btn--white kc-authBtn"
                                                disabled={cooldown > 0} onClick={resendCode}>
                                                {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
                                            </button>
                                        </div>

                                        <button type="button" className="kc-text-link kc-text-link--center"
                                            onClick={backFromVerify}>
                                            Back
                                        </button>
                                    </form>
                                </>

                            /* ── Claim your link ───────────────────── */
                            ) : shouldShowClaimStep ? (
                                <>
                                    <h1 className="h2 kc-auth-title">
                                        Claim your <span className="kc-auth-accent">link</span>
                                    </h1>
                                    <p className="kc-subtitle">
                                        Your unique link. When someone taps your card, they see your digital profile.
                                    </p>

                                    <form onSubmit={claimLinkContinue} className="kc-form">
                                        <div className="kc-field">
                                            <label className="kc-label">Your KonarCard link</label>
                                            <div className="kc-claim">
                                                <div className="kc-claim-prefix">konarcard.com/u/</div>
                                                <input
                                                    ref={claimInputRef}
                                                    className="kc-input kc-claim-input"
                                                    placeholder="yourbusinessname"
                                                    value={claimInput}
                                                    onChange={(e) => setClaimInput(e.target.value)}
                                                    autoComplete="off"
                                                    autoFocus
                                                    required
                                                />
                                            </div>
                                            <p className="kc-microcopy">Free to claim. No payment needed.</p>
                                        </div>

                                        <div className="kc-actionsCenter">
                                            <button className="kx-btn kx-btn--black kc-authBtn">
                                                Claim Your Link
                                            </button>
                                        </div>

                                        <p className="kc-bottom-line">
                                            Already have an account?{" "}
                                            <Link className="kc-link" to="/login"
                                                state={{ from: resolveDefaultPostAuthDestination() }}>
                                                Sign in
                                            </Link>
                                        </p>
                                    </form>
                                </>

                            /* ── Create account ────────────────────── */
                            ) : (
                                <>
                                    <h1 className="h2 kc-auth-title">
                                        Create your <span className="kc-auth-accent">account</span>
                                    </h1>
                                    <p className="kc-subtitle">
                                        Save your digital card so you can share, edit, and access it anytime.
                                    </p>

                                    <form onSubmit={registerUser} className="kc-form">
                                        <div className="kc-field">
                                            <label className="kc-label" htmlFor="name">Full name</label>
                                            <input
                                                ref={nameInputRef}
                                                id="name"
                                                className="kc-input"
                                                placeholder="Enter your name"
                                                value={data.name}
                                                onChange={(e) => setData((d) => ({ ...d, name: e.target.value }))}
                                                autoComplete="name"
                                                required
                                            />
                                        </div>

                                        <div className="kc-field">
                                            <label className="kc-label" htmlFor="email">Email</label>
                                            <input
                                                id="email"
                                                className="kc-input"
                                                type="email"
                                                placeholder="Enter your email"
                                                value={data.email}
                                                onChange={(e) => setData((d) => ({ ...d, email: e.target.value }))}
                                                autoComplete="email"
                                                required
                                            />
                                        </div>

                                        <div className="kc-field">
                                            <label className="kc-label" htmlFor="password">Password</label>
                                            <div className="kc-password">
                                                <input
                                                    id="password"
                                                    className="kc-input"
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="Create a password (min. 8 characters)"
                                                    value={data.password}
                                                    onChange={(e) => setData((d) => ({ ...d, password: e.target.value }))}
                                                    autoComplete="new-password"
                                                    required
                                                />
                                                <button type="button" className="kc-password-toggle"
                                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                                    onClick={() => setShowPassword((s) => !s)}>
                                                    <EyeIcon open={showPassword} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="kc-actionsCenter">
                                            <button className="kx-btn kx-btn--black kc-authBtn"
                                                disabled={isSubmitting} aria-busy={isSubmitting}>
                                                {isSubmitting ? "Creating account…" : "Create account"}
                                            </button>
                                        </div>

                                        <p className="kc-bottom-line">
                                            Already have an account?{" "}
                                            <Link className="kc-link" to="/login"
                                                state={{ from: resolveDefaultPostAuthDestination() }}>
                                                Sign in
                                            </Link>
                                        </p>
                                    </form>

                                    <div className="kc-divider"><span>or</span></div>

                                    <div className="kc-social">
                                        <button type="button" className="kx-btn kx-btn--white kc-authBtn kc-socialBtn"
                                            onClick={() => startOAuth("google")}>
                                            <img className="kc-social-icon" src={GoogleIcon} alt="" aria-hidden="true" />
                                            Continue with Google
                                        </button>
                                        <button type="button" className="kx-btn kx-btn--white kc-authBtn kc-socialBtn"
                                            onClick={() => startOAuth("facebook")}>
                                            <img className="kc-social-icon" src={FacebookIcon} alt="" aria-hidden="true" />
                                            Continue with Facebook
                                        </button>
                                        <button type="button" className="kx-btn kx-btn--white kc-authBtn kc-socialBtn"
                                            onClick={() => startOAuth("apple")}>
                                            <img className="kc-social-icon" src={AppleIcon} alt="" aria-hidden="true" />
                                            Continue with Apple
                                        </button>
                                    </div>

                                    {displayUsername && (
                                        <p className="kc-bottom-line" style={{ marginTop: 16 }}>
                                            Your link:{" "}
                                            <strong>konarcard.com/u/{displayUsername}</strong>{" "}
                                            <button type="button" className="kc-link"
                                                onClick={() => {
                                                    setClaimInput(displayUsername);
                                                    setForceClaimStep(true);
                                                    setTimeout(() => claimInputRef.current?.focus?.(), 0);
                                                }}>
                                                Edit
                                            </button>
                                        </p>
                                    )}
                                </>
                            )}

                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
