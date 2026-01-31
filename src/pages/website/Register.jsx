import React, { useState, useEffect, useRef, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import { AuthContext } from "../../components/AuthContext";
import api from "../../services/api";
import Navbar from "../../components/Navbar";
import "../../styling/auth/login.css";

const PENDING_CLAIM_KEY = "pendingClaimUsername";
const OAUTH_SOURCE_KEY = "oauthSource";

export default function Register() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useContext(AuthContext);

    const claimInputRef = useRef(null);

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

    const closeAuth = () => {
        const from = location.state?.from;
        if (from) navigate(from);
        else navigate("/");
    };

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
            }
        } catch { }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (cooldown <= 0) return;
        const t = setTimeout(() => setCooldown((s) => s - 1), 1000);
        return () => clearTimeout(t);
    }, [cooldown]);

    const hasConfirmedUsername = Boolean((data.username || "").trim());
    const shouldShowClaimStep = !verificationStep && (forceClaimStep || !hasConfirmedUsername);

    const sanitize = (v) =>
        (v || "")
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9._-]/g, "");

    const claimLinkContinue = async (e) => {
        e.preventDefault();

        const cleaned = sanitize(claimInput);
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

            setTimeout(() => document.getElementById("name")?.focus(), 0);
        } catch (err) {
            toast.error(err?.response?.data?.error || "Link not available");
        }
    };

    const registerUser = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const res = await api.post("/register", {
                name: data.name,
                email: data.email.toLowerCase(),
                username: sanitize(data.username),
                password: data.password,
                confirmPassword: data.password,
            });

            if (res.data?.error) toast.error(res.data.error);
            else {
                toast.success("Verification code sent");
                setVerificationStep(true);
                setCooldown(30);
            }
        } catch {
            toast.error("Registration failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    const verifyCode = async (e) => {
        e.preventDefault();
        setIsVerifying(true);

        try {
            const res = await api.post("/verify-email", {
                email: data.email.toLowerCase(),
                code,
            });

            if (res.data?.error) {
                toast.error(res.data.error);
                return;
            }

            const loginRes = await api.post("/login", {
                email: data.email.toLowerCase(),
                password: data.password,
            });

            login(loginRes.data.token, loginRes.data.user);

            try {
                localStorage.removeItem(PENDING_CLAIM_KEY);
                localStorage.removeItem(OAUTH_SOURCE_KEY);
            } catch { }

            navigate("/myprofile", { replace: true });
        } catch {
            toast.error("Verification failed");
        } finally {
            setIsVerifying(false);
        }
    };

    const startOAuth = (provider) => {
        if (provider === "apple") {
            toast("Apple login coming soon");
            return;
        }

        try {
            localStorage.setItem(OAUTH_SOURCE_KEY, "register");
            const pending = sanitize(data.username || claimInput);
            if (pending) localStorage.setItem(PENDING_CLAIM_KEY, pending);
        } catch { }

        const base = import.meta.env.VITE_API_URL;
        window.location.href = `${base}/auth/${provider}`;
    };

    return (
        <>
            <Navbar />

            <div className="kc-auth-page">
                <div className="kc-auth-topActions">
                    <button type="button" className="kc-auth-closeBtn" onClick={closeAuth} aria-label="Close">
                        <span aria-hidden="true">×</span>
                    </button>
                </div>

                <main className="kc-auth-main">
                    <div className="kc-auth-inner">
                        {verificationStep ? (
                            <>
                                <h1 className="kc-title">Verify your email</h1>
                                <p className="kc-subtitle">Enter the 6-digit code we sent to your email.</p>

                                <form onSubmit={verifyCode} className="kc-form">
                                    <div className="kc-field">
                                        <label className="kc-label" htmlFor="code">
                                            Verification code
                                        </label>
                                        <input
                                            id="code"
                                            className="kc-input"
                                            value={code}
                                            onChange={(e) => setCode(e.target.value)}
                                            maxLength={6}
                                            placeholder="123456"
                                            required
                                        />
                                    </div>

                                    <button className="kc-btn kc-btn-primary kc-btn-center" disabled={isVerifying} aria-busy={isVerifying}>
                                        {isVerifying ? "Verifying…" : "Verify"}
                                    </button>

                                    <button
                                        type="button"
                                        className="kc-btn kc-btn-secondary kc-btn-center"
                                        disabled={cooldown > 0}
                                        onClick={async () => {
                                            try {
                                                const r = await api.post("/resend-code", { email: data.email.toLowerCase() });
                                                if (r.data?.error) toast.error(r.data.error);
                                                else {
                                                    toast.success("New code sent!");
                                                    setCooldown(30);
                                                }
                                            } catch {
                                                toast.error("Could not resend code.");
                                            }
                                        }}
                                    >
                                        {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
                                    </button>
                                </form>
                            </>
                        ) : shouldShowClaimStep ? (
                            <>
                                <h1 className="kc-title">Claim Your Link</h1>
                                <p className="kc-subtitle">
                                    This is your unique link. When someone clicks it, they see your digital business card.
                                </p>

                                <form onSubmit={claimLinkContinue} className="kc-form kc-form-claim">
                                    <div className="kc-field">
                                        <label className="kc-label">Claim Your Link Name</label>

                                        <div className="kc-claim">
                                            <div className="kc-claim-prefix">www.konarcard.com/u/</div>
                                            <div className="kc-claim-sep">|</div>
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

                                    <button className="kc-btn kc-btn-primary kc-btn-center">Claim Link</button>

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
                                <h1 className="kc-title">Create an account to save your card</h1>
                                <p className="kc-subtitle">
                                    Save your digital card so you can share it, edit it, and access it anytime.
                                </p>

                                <form onSubmit={registerUser} className="kc-form kc-form-register">
                                    <div className="kc-field">
                                        <label className="kc-label" htmlFor="name">
                                            Full name
                                        </label>
                                        <input
                                            id="name"
                                            className="kc-input"
                                            placeholder="Enter your name"
                                            value={data.name}
                                            onChange={(e) => setData((d) => ({ ...d, name: e.target.value }))}
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
                                            placeholder="Enter your email"
                                            value={data.email}
                                            onChange={(e) => setData((d) => ({ ...d, email: e.target.value }))}
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
                                            required
                                        />
                                    </div>

                                    <button className="kc-btn kc-btn-primary kc-btn-center" disabled={isSubmitting} aria-busy={isSubmitting}>
                                        {isSubmitting ? "Saving…" : "Save my digital card"}
                                    </button>

                                    <p className="kc-bottom-line">
                                        Already have an account?{" "}
                                        <Link className="kc-link" to="/login" state={{ from: location.state?.from || "/" }}>
                                            Sign In
                                        </Link>
                                    </p>
                                </form>

                                <div className="kc-divider">
                                    <span>or</span>
                                </div>

                                <div className="kc-social">
                                    <button type="button" className="kc-social-btn" onClick={() => startOAuth("google")}>
                                        <span>Sign in with Google</span>
                                    </button>
                                    <button type="button" className="kc-social-btn" onClick={() => startOAuth("facebook")}>
                                        <span>Sign in with Facebook</span>
                                    </button>
                                    <button type="button" className="kc-social-btn" onClick={() => startOAuth("apple")}>
                                        <span>Sign in with Apple</span>
                                    </button>
                                </div>

                                <p className="kc-bottom-line" style={{ marginTop: 18 }}>
                                    Your link: <strong>konarcard.com/u/{data.username}</strong>{" "}
                                    <button
                                        type="button"
                                        className="kc-link"
                                        onClick={() => {
                                            setClaimInput(data.username);
                                            setForceClaimStep(true);
                                            setTimeout(() => claimInputRef.current?.focus?.(), 0);
                                        }}
                                    >
                                        Edit
                                    </button>
                                </p>
                            </>
                        )}
                    </div>
                </main>
            </div>
        </>
    );
}
