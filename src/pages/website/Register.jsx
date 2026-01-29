// frontend/src/pages/auth/Register.jsx
import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../../components/AuthContext';
import api from '../../services/api';
import '../../styling/login.css';

const POST_AUTH_KEY = 'postAuthAction';

export default function Register() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useContext(AuthContext);

    const usernameInputRef = useRef(null);

    const [data, setData] = useState({
        name: '',
        email: '',
        username: '', // claim link name
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

    // Persist incoming post-auth action
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

    const runPendingActionOrDefault = async () => {
        let action = null;
        try {
            const saved = localStorage.getItem(POST_AUTH_KEY);
            if (saved) action = JSON.parse(saved);
        } catch { }
        try {
            localStorage.removeItem(POST_AUTH_KEY);
        } catch { }

        if (!action) {
            navigate('/myprofile');
            return;
        }

        if (action.type === 'subscribe') {
            try {
                const res = await api.post('/subscribe', {
                    returnUrl: window.location.origin + '/SuccessSubscription',
                });
                const url = res?.data?.url;
                if (url) {
                    window.location.href = url;
                    return;
                }
                toast.error('Could not start subscription. Please try again.');
                navigate('/subscription');
            } catch (err) {
                toast.error(err?.response?.data?.error || 'Subscription failed. Please try again.');
                navigate('/subscription');
            }
            return;
        }

        if (action.type === 'buy_card') {
            const qty = Number(action?.payload?.quantity) || 1;
            navigate('/productandplan/konarcard', {
                state: { triggerCheckout: true, quantity: qty },
                replace: true,
            });
            return;
        }

        navigate('/myprofile');
    };

    // Social auth redirect (backend routes will be added next)
    const startOAuth = (provider) => {
        const base = import.meta.env.VITE_API_URL;
        window.location.href = `${base}/auth/${provider}`;
    };

    // Step 1: Claim link (availability check)
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

            // Availability OK
            setData((d) => ({ ...d, username: res.data.username || username }));
            setClaimStep(false);
            setTimeout(() => document.getElementById('name')?.focus?.(), 0);
        } catch (err) {
            const msg = err?.response?.data?.error || 'Could not claim that link. Try another.';
            toast.error(msg);
        }
    };

    // Step 2: Register (send verification email)
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
                confirmPassword: data.password, // keep consistent with backend validation
            });

            if (res.data?.error) {
                toast.error(res.data.error);
                setIsSubmitting(false);
            } else {
                toast.success('Verification code sent!');
                setVerificationStep(true);
                setCooldown(30);
                setIsSubmitting(false);
            }
        } catch (err) {
            if (err.response) toast.error(err.response.data.error || 'Registration failed');
            else if (err.request) toast.error('No response from server. Check network.');
            else toast.error('Registration failed');
            setIsSubmitting(false);
        }
    };

    // Step 3: Verify email then login
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
                setIsVerifying(false);
            } else {
                toast.success('Email verified! Logging you in...');

                const loginRes = await api.post('/login', {
                    email: data.email.trim().toLowerCase(),
                    password: data.password,
                });

                if (loginRes.data?.error) {
                    toast.error(loginRes.data.error);
                    setIsVerifying(false);
                } else {
                    login(loginRes.data.token, loginRes.data.user);
                    await runPendingActionOrDefault();
                }
            }
        } catch {
            toast.error('Verification failed');
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
                    {/* STEP 3: verification */}
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

                                <button
                                    type="submit"
                                    className="kc-btn kc-btn-primary kc-btn-center"
                                    disabled={isVerifying}
                                    aria-busy={isVerifying}
                                >
                                    {isVerifying ? 'Verifying…' : 'Verify Email'}
                                </button>

                                <button
                                    type="button"
                                    className="kc-btn kc-btn-secondary kc-btn-center"
                                    onClick={resendCode}
                                    disabled={cooldown > 0}
                                >
                                    {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}
                                </button>

                                <button type="button" className="kc-text-back" onClick={() => setVerificationStep(false)}>
                                    Back
                                </button>
                            </form>
                        </>
                    ) : claimStep ? (
                        /* STEP 1: Claim your link */
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

                                    <div
                                        className="kc-claim"
                                        onClick={() => usernameInputRef.current?.focus?.()}
                                        role="group"
                                        aria-label="Claim your link input"
                                    >
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
                        /* STEP 2: Create account */
                        <>
                            <h1 className="kc-title">
                                Create an account to
                                <br />
                                save your card
                            </h1>
                            <p className="kc-subtitle">
                                Save your digital card so you can share it, edit it, and access it
                                <br />
                                anytime.
                            </p>

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
                                        <button
                                            type="button"
                                            className="kc-password-toggle"
                                            onClick={() => setShowPassword((s) => !s)}
                                            aria-label="Toggle password visibility"
                                        >
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

                                <button
                                    type="submit"
                                    className="kc-btn kc-btn-primary kc-btn-center"
                                    disabled={isSubmitting}
                                    aria-busy={isSubmitting}
                                >
                                    {isSubmitting ? 'Saving…' : 'Save my digital card'}
                                </button>

                                <p className="kc-bottom-line">
                                    Already have an account?{' '}
                                    <Link className="kc-link" to="/login">
                                        Sign In
                                    </Link>
                                </p>

                                <div className="kc-divider" aria-hidden="true">
                                    <span>or</span>
                                </div>

                                <div className="kc-social">
                                    <button type="button" className="kc-social-btn" onClick={() => startOAuth('google')}>
                                        <GoogleIcon />
                                        <span>Sign in with Google</span>
                                    </button>

                                    <button type="button" className="kc-social-btn" onClick={() => startOAuth('facebook')}>
                                        <FacebookIcon />
                                        <span>Sign in with Facebook</span>
                                    </button>

                                    <button type="button" className="kc-social-btn" onClick={() => startOAuth('apple')}>
                                        <AppleIcon />
                                        <span>Sign in with Apple</span>
                                    </button>
                                </div>

                                <button type="button" className="kc-text-back" onClick={() => setClaimStep(true)}>
                                    Back
                                </button>
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

/* ===== icons (no deps) ===== */
function GoogleIcon() {
    return (
        <svg className="kc-ico" viewBox="0 0 48 48" aria-hidden="true">
            <path
                d="M44.5 20H24v8.5h11.8C34.2 33.7 29.7 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.5 0 6.4 1.2 8.7 3.2l6-6C35.5 4.7 30.1 2.5 24 2.5 12.1 2.5 2.5 12.1 2.5 24S12.1 45.5 24 45.5 45.5 35.9 45.5 24c0-1.4-.2-2.7-.5-4z"
                fill="#FFC107"
            />
            <path
                d="M6.4 14.7l7 5.1C15.3 15.4 19.3 12 24 12c3.5 0 6.4 1.2 8.7 3.2l6-6C35.5 4.7 30.1 2.5 24 2.5c-8.3 0-15.5 4.7-19.6 12.2z"
                fill="#FF3D00"
            />
            <path
                d="M24 45.5c5.9 0 11.1-2 15.1-5.5l-6.9-5.7C30.1 35.7 27.2 37 24 37c-5.7 0-10.2-3.3-11.8-8.5l-7.1 5.4C9.2 41 16.1 45.5 24 45.5z"
                fill="#4CAF50"
            />
            <path
                d="M44.5 20H24v8.5h11.8c-.8 2.2-2.2 4-4 5.2l.1.1 6.9 5.7C41 37.5 45.5 33.4 45.5 24c0-1.4-.2-2.7-.5-4z"
                fill="#1976D2"
            />
        </svg>
    );
}

function FacebookIcon() {
    return (
        <svg className="kc-ico" viewBox="0 0 24 24" aria-hidden="true">
            <path
                fill="#1877F2"
                d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.09 4.39 23.09 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.04 1.79-4.72 4.54-4.72 1.31 0 2.68.24 2.68.24v2.98h-1.51c-1.49 0-1.95.93-1.95 1.88v2.26h3.32l-.53 3.49h-2.79V24C19.61 23.09 24 18.09 24 12.07Z"
            />
        </svg>
    );
}

function AppleIcon() {
    return (
        <svg className="kc-ico" viewBox="0 0 24 24" aria-hidden="true">
            <path
                fill="#111"
                d="M16.7 13.6c0-2 1.6-3 1.7-3.1-1-1.5-2.6-1.7-3.2-1.7-1.3-.1-2.6.8-3.3.8-.7 0-1.7-.8-2.9-.8-1.5 0-2.9.9-3.6 2.2-1.6 2.8-.4 7 1.1 9.2.7 1.1 1.6 2.3 2.8 2.3 1.1 0 1.6-.7 2.9-.7s1.7.7 2.9.7c1.2 0 2-.1 3.3-2 1.5-2.1 1.9-4.1 2-4.2-.1-.1-3.7-1.4-3.7-4.7ZM14.8 6.9c.6-.8 1-1.8.9-2.9-.9.1-2 .6-2.6 1.4-.6.7-1.1 1.8-1 2.8 1 .1 2.1-.5 2.7-1.3Z"
            />
        </svg>
    );
}
