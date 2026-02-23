// src/pages/auth/Register.jsx
import React, { useState, useEffect, useRef, useContext, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import { AuthContext } from "../../components/AuthContext";
import api, { BASE_URL } from "../../services/api";
import Navbar from "../../components/Navbar";
import "../../styling/login.css";

/* Social logos */
import GoogleIcon from "../../assets/icons/Google-Icon.svg";
import FacebookIcon from "../../assets/icons/Facebook-Icon.svg";
import AppleIcon from "../../assets/icons/Apple-Icon.svg";

const PENDING_CLAIM_KEY = "pendingClaimUsername";
const OAUTH_SOURCE_KEY = "oauthSource";

// pricing -> register -> stripe resume
const CHECKOUT_INTENT_KEY = "konar_checkout_intent_v1";

// ✅ NFC product buy intent
const NFC_INTENT_KEY = "konar_nfc_intent_v1";

export default function Register() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useContext(AuthContext);

    const claimInputRef = useRef(null);
    const nameInputRef = useRef(null);

    const [data, setData] = useState({
        name: "",
        email: "",
        username: "",
        password: "",
    });

    const [claimInput, setClaimInput] = useState("");
    const [forceClaimStep, setForceClaimStep] = useState(false);
    const [verificationStep, setVerificationStep] = useState(false);

    const [code, setCode] = useState("");
    const [cooldown, setCooldown] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);

    // ---------------------------------
    // Helpers
    // ---------------------------------
    const sanitizeSlug = (v) =>
        (v || "")
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9._-]/g, "");

    const cleanEmail = (v) => String(v || "").trim().toLowerCase();
    const cleanCode = (v) => String(v || "").replace(/\D/g, "").slice(0, 6);

    const closeAuth = () => {
        const from = location.state?.from;
        if (from) navigate(from);
        else navigate("/");
    };

    const goToVerifyStep = (msg) => {
        toast.success(msg || "Verification code sent");
        setCode("");
        setVerificationStep(true);
        setCooldown(30);
    };

    // ----------------------------
    // checkout intent helpers
    // ----------------------------
    const readCheckoutIntent = () => {
        try {
            const raw = localStorage.getItem(CHECKOUT_INTENT_KEY);
            if (!raw) return null;

            const intent = JSON.parse(raw);
            if (!intent?.planKey) return null;

            const age = Date.now() - Number(intent.createdAt || 0);
            if (Number.isFinite(age) && age > 30 * 60 * 1000) {
                localStorage.removeItem(CHECKOUT_INTENT_KEY);
                return null;
            }

            return intent;
        } catch {
            return null;
        }
    };

    const clearCheckoutIntent = () => {
        try {
            localStorage.removeItem(CHECKOUT_INTENT_KEY);
        } catch { }
    };

    // ✅ NFC intent read (for returning to product page after register)
    const readNfcIntent = () => {
        try {
            const raw = localStorage.getItem(NFC_INTENT_KEY);
            if (!raw) return null;

            const intent = JSON.parse(raw);
            if (!intent?.productKey) return null;

            const age = Date.now() - Number(intent.createdAt || intent.updatedAt || 0);
            if (Number.isFinite(age) && age > 30 * 60 * 1000) {
                localStorage.removeItem(NFC_INTENT_KEY);
                return null;
            }

            return intent;
        } catch {
            return null;
        }
    };

    const checkoutIntent = useMemo(() => readCheckoutIntent(), []);
    const hasCheckoutIntent = !!checkoutIntent;

    const nfcIntent = useMemo(() => readNfcIntent(), []);
    const hasNfcIntent = !!nfcIntent;

    // ---------------------------------
    // On mount: preload pending claim
    // ---------------------------------
    useEffect(() => {
        try {
            const saved = (localStorage.getItem(PENDING_CLAIM_KEY) || "").trim().toLowerCase();
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (cooldown <= 0) return;
        const t = setTimeout(() => setCooldown((s) => s - 1), 1000);
        return () => clearTimeout(t);
    }, [cooldown]);

    const hasConfirmedUsername = Boolean((data.username || "").trim());

    const mustClaimBeforeContinuing =
        (hasCheckoutIntent || hasNfcIntent) && !hasConfirmedUsername && !verificationStep;

    const shouldShowClaimStep =
        !verificationStep && (mustClaimBeforeContinuing || forceClaimStep || !hasConfirmedUsername);

    // ---------------------------------
    // Stripe resume (ONLY after verified login)
    // ---------------------------------
    const resumeCheckoutIfNeeded = async () => {
        const intent = readCheckoutIntent();
        if (!intent) return false;

        const uname = (data.username || "").trim();
        if (!uname) {
            toast.error("Please claim your KonarCard link before subscribing.");
            setForceClaimStep(true);
            return false;
        }

        const returnUrl = intent.returnUrl || `${window.location.origin}/myprofile?subscribed=1`;

        try {
            const res = await api.post("/subscribe", { planKey: intent.planKey, returnUrl });
            const url = res?.data?.url;
            if (!url) {
                toast.error("Stripe checkout URL missing. Please try again.");
                return false;
            }

            clearCheckoutIntent();
            window.location.href = url;
            return true;
        } catch (e) {
            toast.error(e?.response?.data?.error || "Subscription failed.");
            return false;
        }
    };

    const resumeNfcIfNeeded = () => {
        const intent = readNfcIntent();
        if (!intent) return false;

        const returnTo =
            (typeof intent.returnTo === "string" && intent.returnTo.trim()) ||
            (typeof location.state?.from === "string" && location.state.from.trim()) ||
            "/products";

        navigate(returnTo, { replace: true });
        return true;
    };

    // ---------------------------------
    // Claim link (step 1 if needed)
    // ---------------------------------
    const claimLinkContinue = async (e) => {
        e.preventDefault();

        const cleaned = sanitizeSlug(claimInput);
        if (!cleaned) return toast.error("Please enter a link name");
        if (cleaned.length < 3) return toast.error("Link name must be at least 3 characters");

        try {
            const res = await api.post("/claim-link", { username: cleaned });

            if (res?.data?.error) {
                toast.error(res.data.error);
                return;
            }

            setData((d) => ({ ...d, username: cleaned }));
            setClaimInput(cleaned);
            setForceClaimStep(false);

            try {
                localStorage.setItem(PENDING_CLAIM_KEY, cleaned);
            } catch { }

            setTimeout(() => {
                nameInputRef.current?.focus?.();
            }, 0);
        } catch (err) {
            toast.error(err?.response?.data?.error || "Link not available");
        }
    };

    // ---------------------------------
    // Register (step 2) -> always go to verify
    // ---------------------------------
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

        setData((d) => ({
            ...d,
            name: payload.name,
            email: payload.email,
            username: payload.username,
        }));

        if (!payload.name) return toast.error("Please enter your name.");
        if (!payload.email) return toast.error("Please enter your email.");
        if (!payload.password) return toast.error("Please enter a password.");
        if (!payload.username) {
            toast.error("Please claim your link first.");
            setForceClaimStep(true);
            return;
        }

        setIsSubmitting(true);

        try {
            const res = await api.post("/register", payload);

            if (res?.data?.error) {
                toast.error(res.data.error);
                return;
            }

            if (res?.data?.success) {
                if (res.data?.emailSent === false) {
                    goToVerifyStep("Account created. Tap “Resend code” to get your verification code.");
                } else {
                    goToVerifyStep("Verification code sent");
                }
                return;
            }

            goToVerifyStep("Verification code sent");
        } catch (err) {
            toast.error(err?.response?.data?.error || "Registration failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    // ---------------------------------
    // Verify email (step 3) + login + (optional) Stripe
    // ---------------------------------
    const verifyUserCode = async (e) => {
        e.preventDefault();
        setIsVerifying(true);

        const email = cleanEmail(data.email);
        const finalCode = cleanCode(code);

        if (!email) {
            toast.error("Please enter your email first.");
            setVerificationStep(false);
            setIsVerifying(false);
            return;
        }

        if (finalCode.length !== 6) {
            toast.error("Please enter the 6-digit code.");
            setIsVerifying(false);
            return;
        }

        setData((d) => ({ ...d, email }));
        setCode(finalCode);

        try {
            const res = await api.post("/verify-email", { email, code: finalCode });

            if (res?.data?.error) {
                toast.error(res.data.error);
                return;
            }

            toast.success("Email verified!");

            const loginRes = await api.post("/login", { email, password: data.password });

            if (loginRes?.data?.error) {
                if (loginRes.data?.resend) {
                    toast.error(loginRes.data?.error || "Please verify your email. Code sent.");
                    setCooldown(30);
                    return;
                }
                toast.error(loginRes.data.error || "Login failed after verification.");
                return;
            }

            if (!loginRes?.data?.token || !loginRes?.data?.user) {
                toast.error("Login failed after verification.");
                return;
            }

            login(loginRes.data.token, loginRes.data.user);

            try {
                localStorage.removeItem(OAUTH_SOURCE_KEY);
            } catch { }

            const resumed = await resumeCheckoutIfNeeded();
            if (resumed) return;

            if (resumeNfcIfNeeded()) return;

            try {
                localStorage.removeItem(PENDING_CLAIM_KEY);
            } catch { }

            navigate("/myprofile", { replace: true });
        } catch (err) {
            toast.error(err?.response?.data?.error || "Verification failed");
        } finally {
            setIsVerifying(false);
        }
    };

    const resendCode = async () => {
        const email = cleanEmail(data.email);
        if (!email) {
            toast.error("Enter your email first.");
            setVerificationStep(false);
            return;
        }

        if (cooldown > 0) return;

        try {
            const r = await api.post("/resend-code", { email });

            if (r?.data?.error) {
                toast.error(r.data.error);
                return;
            }

            toast.success("New code sent!");
            setCooldown(30);
            setCode("");
            setVerificationStep(true);
        } catch (err) {
            toast.error(err?.response?.data?.error || "Could not resend code.");
        }
    };

    // ---------------------------------
    // OAuth
    // ---------------------------------
    const startOAuth = (provider) => {
        if (provider === "apple") {
            toast("Apple login coming soon");
            return;
        }

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

    return (
        <>
            <Navbar />

            <div className="kc-auth-page">
                <div className="kc-auth-topActions">
                    <button type="button" className="kc-auth-closeBtn" onClick={closeAuth} aria-label="Close">
                        <span className="kc-auth-closeIcon" aria-hidden="true">
                            ×
                        </span>
                    </button>
                </div>

                <main className="kc-auth-main">
                    <div className="kc-auth-inner">
                        <div className="kc-auth-wrap">
                            <div className="kc-auth-panel">
                                {verificationStep ? (
                                    <>
                                        <h1 className="h2 kc-auth-title">
                                            Verify your <span className="kc-auth-accent">email</span>
                                        </h1>
                                        <p className="kc-subtitle">Enter the 6-digit code we sent to your email.</p>

                                        <form onSubmit={verifyUserCode} className="kc-form">
                                            <div className="kc-field">
                                                <label className="kc-label" htmlFor="code">
                                                    Verification code
                                                </label>
                                                <input
                                                    id="code"
                                                    className="kc-input"
                                                    value={code}
                                                    onChange={(e) => setCode(cleanCode(e.target.value))}
                                                    maxLength={6}
                                                    inputMode="numeric"
                                                    autoComplete="one-time-code"
                                                    placeholder="123456"
                                                    required
                                                />
                                            </div>

                                            <div className="kc-actionsCenter">
                                                <button className="kx-btn kx-btn--black kc-authBtn" disabled={isVerifying} aria-busy={isVerifying}>
                                                    {isVerifying ? "Verifying…" : "Verify"}
                                                </button>
                                            </div>

                                            <div className="kc-actionsCenter">
                                                <button
                                                    type="button"
                                                    className="kx-btn kx-btn--white kc-authBtn"
                                                    disabled={cooldown > 0}
                                                    onClick={resendCode}
                                                >
                                                    {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
                                                </button>
                                            </div>

                                            <button type="button" className="kc-text-link kc-text-link--center" onClick={backFromVerify}>
                                                Back
                                            </button>
                                        </form>
                                    </>
                                ) : shouldShowClaimStep ? (
                                    <>
                                        <h1 className="h2 kc-auth-title">
                                            Claim your <span className="kc-auth-accent">Link</span>
                                        </h1>
                                        <p className="kc-subtitle">
                                            This is your unique link. When someone clicks it, they see your digital business card.
                                        </p>

                                        <form onSubmit={claimLinkContinue} className="kc-form">
                                            <div className="kc-field">
                                                <label className="kc-label">Claim Your Link Name</label>

                                                <div className="kc-claim">
                                                    <div className="kc-claim-prefix">www.konarcard.com/u/</div>
                                                    <div className="kc-claim-sep" />
                                                    <input
                                                        ref={claimInputRef}
                                                        className="kc-input kc-claim-input"
                                                        placeholder="yourbusinessname"
                                                        value={claimInput}
                                                        onChange={(e) => setClaimInput(e.target.value)}
                                                        autoComplete="off"
                                                        required
                                                    />
                                                </div>

                                                <p className="kc-microcopy">Free to claim. No payment needed.</p>
                                            </div>

                                            <div className="kc-actionsCenter">
                                                <button className="kx-btn kx-btn--black kc-authBtn">Claim Your Link</button>
                                            </div>

                                            <p className="kc-bottom-line">
                                                Already have an account?{" "}
                                                <Link className="kc-link" to="/login" state={{ from: location.state?.from || "/" }}>
                                                    Sign In
                                                </Link>
                                            </p>
                                        </form>
                                    </>
                                ) : (
                                    <>
                                        <h1 className="h2 kc-auth-title">
                                            Create an account to <span className="kc-auth-accent">save</span>
                                            <br />
                                            your card
                                        </h1>
                                        <p className="kc-subtitle">
                                            Save your digital card so you can share it, edit it, and access it anytime.
                                        </p>

                                        <form onSubmit={registerUser} className="kc-form">
                                            <div className="kc-field">
                                                <label className="kc-label" htmlFor="name">
                                                    Full name
                                                </label>
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
                                                <label className="kc-label" htmlFor="email">
                                                    Email
                                                </label>
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
                                                <label className="kc-label" htmlFor="password">
                                                    Password
                                                </label>
                                                <input
                                                    id="password"
                                                    className="kc-input"
                                                    type="password"
                                                    placeholder="Create a password"
                                                    value={data.password}
                                                    onChange={(e) => setData((d) => ({ ...d, password: e.target.value }))}
                                                    autoComplete="new-password"
                                                    required
                                                />
                                            </div>

                                            <div className="kc-actionsCenter">
                                                <button className="kx-btn kx-btn--black kc-authBtn" disabled={isSubmitting} aria-busy={isSubmitting}>
                                                    {isSubmitting ? "Creating…" : "Save My Digital Card"}
                                                </button>
                                            </div>

                                            <p className="kc-bottom-line">
                                                Already have an account?{" "}
                                                <Link className="kc-link" to="/login" state={{ from: location.state?.from || "/" }}>
                                                    Sign In
                                                </Link>
                                            </p>
                                        </form>

                                        {/* ✅ Center the divider + social buttons (don’t inherit kc-form left alignment) */}
                                        <div style={{ textAlign: "center" }}>
                                            <div className="kc-divider kc-divider--matchWidth">
                                                <span>or</span>
                                            </div>

                                            <div className="kc-social">
                                                <button
                                                    type="button"
                                                    className="kx-btn kx-btn--white kc-authBtn kc-socialBtn"
                                                    onClick={() => startOAuth("google")}
                                                >
                                                    <img className="kc-social-icon" src={GoogleIcon} alt="" aria-hidden="true" />
                                                    <span>Sign in with Google</span>
                                                </button>

                                                <button
                                                    type="button"
                                                    className="kx-btn kx-btn--white kc-authBtn kc-socialBtn"
                                                    onClick={() => startOAuth("facebook")}
                                                >
                                                    <img className="kc-social-icon" src={FacebookIcon} alt="" aria-hidden="true" />
                                                    <span>Sign in with Facebook</span>
                                                </button>

                                                <button
                                                    type="button"
                                                    className="kx-btn kx-btn--white kc-authBtn kc-socialBtn"
                                                    onClick={() => startOAuth("apple")}
                                                >
                                                    <img className="kc-social-icon" src={AppleIcon} alt="" aria-hidden="true" />
                                                    <span>Sign in with Apple</span>
                                                </button>
                                            </div>
                                        </div>

                                        {displayUsername ? (
                                            <p className="kc-bottom-line" style={{ marginTop: 18 }}>
                                                Your link: <strong>{`konarcard.com/u/${displayUsername}`}</strong>{" "}
                                                <button
                                                    type="button"
                                                    className="kc-link"
                                                    onClick={() => {
                                                        setClaimInput(displayUsername);
                                                        setForceClaimStep(true);
                                                        setTimeout(() => claimInputRef.current?.focus?.(), 0);
                                                    }}
                                                >
                                                    Edit
                                                </button>
                                            </p>
                                        ) : null}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}