// frontend/src/pages/website/Register.jsx
import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../../components/AuthContext';
import api from '../../services/api';
import '../../styling/login.css';

const POST_AUTH_KEY = 'postAuthAction';
const PENDING_CLAIM_KEY = 'pendingClaimUsername';
const OAUTH_SOURCE_KEY = 'oauthSource'; // 'register' | 'login'

export default function Register() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useContext(AuthContext);

    const usernameInputRef = useRef(null);

    const [data, setData] = useState({
        name: '',
        email: '',
        username: '',
        password: '',
    });

    // Step 1 = claim link, Step 2 = full signup, Step 3 = verify email
    const [claimStep, setClaimStep] = useState(true);
    const [verificationStep, setVerificationStep] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const [code, setCode] = useState('');
    const [cooldown, setCooldown] = useState(0);
    const [showPasswordFeedback, setShowPasswordFeedback] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);

    useEffect(() => {
        const action = location.state?.postAuthAction;
        if (action) {
            try {
                localStorage.setItem(POST_AUTH_KEY, JSON.stringify(action));
            } catch { }
        }
    }, [location.state]);

    useEffect(() => {
        if (cooldown > 0) {
            const t = setTimeout(() => setCooldown((s) => s - 1), 1000);
            return () => clearTimeout(t);
        }
    }, [cooldown]);

    const passwordChecks = {
        minLength: data.password.length >= 8,
        hasUppercase: /[A-Z]/.test(data.password),
        hasNumber: /\d/.test(data.password),
    };

    const handlePasswordFocus = () => setShowPasswordFeedback(true);
    const handlePasswordBlur = () => setShowPasswordFeedback(false);

    const startOAuth = (provider) => {
        // ✅ Persist the already-chosen link so OAuth can auto-claim it
        const pending = (data.username || '').trim().toLowerCase();
        try {
            localStorage.setItem(OAUTH_SOURCE_KEY, 'register');
            if (pending) localStorage.setItem(PENDING_CLAIM_KEY, pending);
        } catch { }

        const base = import.meta.env.VITE_API_URL;
        window.location.href = `${base}/auth/${provider}`;
    };

    const claimLinkContinue = async (e) => {
        e.preventDefault();

        const username = data.username.trim().toLowerCase();
        if (!username) {
            toast.error('Please enter your link name.');
            return;
        }

        try {
            const res = await api.post('/claim-link', { username });

            if (res.data?.error) {
                toast.error(res.data.error);
                return;
            }

            setData((d) => ({ ...d, username: res.data.username || username }));
            setClaimStep(false);

            // also store pending for safety (if they choose OAuth next)
            try {
                localStorage.setItem(PENDING_CLAIM_KEY, (res.data.username || username).trim().toLowerCase());
                localStorage.setItem(OAUTH_SOURCE_KEY, 'register');
            } catch { }

            setTimeout(() => document.getElementById('name')?.focus?.(), 0);
        } catch (err) {
            toast.error(err?.response?.data?.error || 'Could not claim that link. Try another.');
        }
    };

    const registerUser = async (e) => {
        e.preventDefault();

        if (!data.username.trim()) {
            toast.error('Username is required.');
            return;
        }
        if (!Object.values(passwordChecks).every(Boolean)) {
            toast.error('Please meet all password requirements.');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await api.post('/register', {
                name: data.name,
                email: data.email.trim().toLowerCase(),
                username: data.username.trim().toLowerCase(),
                password: data.password,
                confirmPassword: data.password,
            });

            if (res.data?.error) {
                toast.error(res.data.error);
            } else {
                toast.success('Verification code sent!');
                setVerificationStep(true);
                setCooldown(30);
            }
        } catch (err) {
            toast.error(err?.response?.data?.error || 'Registration failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const verifyCode = async (e) => {
        e.preventDefault();
        setIsVerifying(true);
        try {
            const res = await api.post('/verify-email', {
                email: data.email.trim().toLowerCase(),
                code,
            });

            if (res.data?.error) {
                toast.error(res.data.error);
            } else {
                toast.success('Email verified! Logging you in...');

                const loginRes = await api.post('/login', {
                    email: data.email.trim().toLowerCase(),
                    password: data.password,
                });

                if (loginRes.data?.error) {
                    toast.error(loginRes.data.error);
                } else {
                    login(loginRes.data.token, loginRes.data.user);
                    // cleanup pending claim keys since local flow already stored username
                    try {
                        localStorage.removeItem(PENDING_CLAIM_KEY);
                        localStorage.removeItem(OAUTH_SOURCE_KEY);
                    } catch { }
                    navigate('/myprofile');
                }
            }
        } catch {
            toast.error('Verification failed');
        } finally {
            setIsVerifying(false);
        }
    };

    const resendCode = async () => {
        try {
            const res = await api.post('/resend-code', { email: data.email.trim().toLowerCase() });
            if (res.data?.error) toast.error(res.data.error);
            else {
                toast.success('New verification code sent!');
                setCooldown(30);
            }
        } catch {
            toast.error('Could not resend code');
        }
    };

    return (
        <div className="kc-auth-page">
            <header className="kc-auth-header">
                <Link to="/" className="kc-logo" aria-label="KonarCard Home">
                    K
                </Link>

                <button type="button" className="kc-close" onClick={() => navigate('/')} aria-label="Close">
                    <span aria-hidden="true">×</span>
                </button>
            </header>

            <main className="kc-auth-main">
                <div className="kc-auth-inner">
                    {verificationStep ? (
                        <>
                            <h1 className="kc-title">Verify your email</h1>
                            <p className="kc-subtitle">
                                Enter the 6-digit code sent to <strong>{data.email.trim().toLowerCase()}</strong>
                            </p>

                            <form className="kc-form" onSubmit={verifyCode}>
                                <div className="kc-field">
                                    <label className="kc-label" htmlFor="verificationCode">
                                        Verification code
                                    </label>
                                    <input
                                        className="kc-input"
                                        type="text"
                                        id="verificationCode"
                                        placeholder="123456"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        autoComplete="one-time-code"
                                        inputMode="numeric"
                                        maxLength={6}
                                        required
                                    />
                                </div>

                                <button type="submit" className="kc-btn kc-btn-primary kc-btn-center" disabled={isVerifying} aria-busy={isVerifying}>
                                    {isVerifying ? 'Verifying…' : 'Verify Email'}
                                </button>

                                <button type="button" className="kc-btn kc-btn-secondary kc-btn-center" onClick={resendCode} disabled={cooldown > 0}>
                                    {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}
                                </button>
                            </form>
                        </>
                    ) : claimStep ? (
                        <>
                            <h1 className="kc-title">Claim Your Link</h1>
                            <p className="kc-subtitle">
                                This is your unique link. When someone clicks it, they see
                                <br />
                                your digital business card.
                            </p>

                            <form className="kc-form kc-form-claim" onSubmit={claimLinkContinue}>
                                <div className="kc-field">
                                    <label className="kc-label" htmlFor="username">
                                        Claim Your Link Name
                                    </label>

                                    <div className="kc-claim" onClick={() => usernameInputRef.current?.focus?.()} role="group" aria-label="Claim your link input">
                                        <span className="kc-claim-prefix">www.konarcard.com/u/</span>
                                        <span className="kc-claim-sep">|</span>
                                        <input
                                            ref={usernameInputRef}
                                            className="kc-input kc-claim-input"
                                            type="text"
                                            id="username"
                                            placeholder="yourbusinessname"
                                            value={data.username}
                                            onChange={(e) => setData({ ...data, username: e.target.value })}
                                            autoComplete="off"
                                            required
                                        />
                                    </div>
                                </div>

                                <p className="kc-microcopy">Free to claim. No payment needed.</p>

                                <button type="submit" className="kc-btn kc-btn-primary kc-btn-center">
                                    Claim Link
                                </button>

                                <p className="kc-bottom-line">
                                    Already have an account?{' '}
                                    <Link className="kc-link" to="/login">
                                        Sign In
                                    </Link>
                                </p>
                            </form>
                        </>
                    ) : (
                        <>
                            <h1 className="kc-title">
                                Create an account to
                                <br />
                                save your card
                            </h1>

                            {/* ✅ SHOW CLAIMED SLUG + EDIT BUTTON */}
                            <div style={{ margin: '10px 0 18px' }}>
                                <div style={{ fontSize: 14, opacity: 0.8, marginBottom: 6 }}>Your link:</div>
                                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                                    <div style={{ fontSize: 14 }}>
                                        <strong>www.konarcard.com/u/{(data.username || '').trim().toLowerCase()}</strong>
                                    </div>
                                    <button
                                        type="button"
                                        className="kc-btn kc-btn-secondary"
                                        onClick={() => setClaimStep(true)}
                                        style={{ padding: '8px 12px' }}
                                    >
                                        Edit
                                    </button>
                                </div>
                            </div>

                            <form className="kc-form kc-form-register" onSubmit={registerUser}>
                                <div className="kc-field">
                                    <label className="kc-label" htmlFor="name">
                                        Full name
                                    </label>
                                    <input
                                        className="kc-input"
                                        type="text"
                                        id="name"
                                        placeholder="Enter your name"
                                        value={data.name}
                                        onChange={(e) => setData({ ...data, name: e.target.value })}
                                        autoComplete="name"
                                        required
                                    />
                                </div>

                                <div className="kc-field">
                                    <label className="kc-label" htmlFor="email">
                                        Email
                                    </label>
                                    <input
                                        className="kc-input"
                                        type="email"
                                        id="email"
                                        placeholder="Enter your email"
                                        value={data.email}
                                        onChange={(e) => setData({ ...data, email: e.target.value })}
                                        autoComplete="username"
                                        inputMode="email"
                                        required
                                    />
                                </div>

                                <div className="kc-field">
                                    <label className="kc-label" htmlFor="password">
                                        Password
                                    </label>
                                    <div className="kc-password">
                                        <input
                                            className="kc-input kc-input-password"
                                            type={showPassword ? 'text' : 'password'}
                                            id="password"
                                            placeholder="Create a password"
                                            value={data.password}
                                            onChange={(e) => setData({ ...data, password: e.target.value })}
                                            autoComplete="new-password"
                                            onFocus={handlePasswordFocus}
                                            onBlur={handlePasswordBlur}
                                            required
                                        />
                                        <button type="button" className="kc-password-toggle" onClick={() => setShowPassword((s) => !s)}>
                                            {showPassword ? 'Hide' : 'Show'}
                                        </button>
                                    </div>

                                    {showPasswordFeedback && (
                                        <div className="kc-password-rules" aria-live="polite">
                                            <Rule ok={passwordChecks.minLength} text="Minimum 8 characters" />
                                            <Rule ok={passwordChecks.hasUppercase} text="One uppercase letter" />
                                            <Rule ok={passwordChecks.hasNumber} text="One number" />
                                        </div>
                                    )}
                                </div>

                                <button type="submit" className="kc-btn kc-btn-primary kc-btn-center" disabled={isSubmitting} aria-busy={isSubmitting}>
                                    {isSubmitting ? 'Saving…' : 'Save my digital card'}
                                </button>

                                <div className="kc-divider" aria-hidden="true">
                                    <span>or</span>
                                </div>

                                {/* ✅ TEXT ONLY (no icons) */}
                                <div className="kc-social">
                                    <button type="button" className="kc-social-btn" onClick={() => startOAuth('google')}>
                                        <span>Sign in with Google</span>
                                    </button>
                                    <button type="button" className="kc-social-btn" onClick={() => startOAuth('facebook')}>
                                        <span>Sign in with Facebook</span>
                                    </button>
                                    <button type="button" className="kc-social-btn" onClick={() => startOAuth('apple')}>
                                        <span>Sign in with Apple</span>
                                    </button>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}

function Rule({ ok, text }) {
    return (
        <div className={`kc-rule ${ok ? 'is-ok' : 'is-bad'}`}>
            <span className="kc-rule-dot" aria-hidden="true" />
            <span>{text}</span>
        </div>
    );
}
