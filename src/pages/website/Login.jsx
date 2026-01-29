// frontend/src/pages/auth/Login.jsx
import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../../components/AuthContext';
import api from '../../services/api';
import '../../styling/login.css';

const POST_AUTH_KEY = 'postAuthAction';
const REMEMBER_KEY = 'rememberLogin';
const REMEMBERED_EMAIL_KEY = 'rememberedEmail';

// Keep this in sync with Cloud Run ADMIN_EMAILS for UI-side convenience
const ADMIN_EMAILS_UI = ['supportteam@konarcard.com'];

export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useContext(AuthContext);

    const [data, setData] = useState({ email: '', password: '' });
    const [rememberMe, setRememberMe] = useState(false);
    const [code, setCode] = useState('');
    const [verificationStep, setVerificationStep] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const [showPassword, setShowPassword] = useState(false);
    const [forgotPasswordStep, setForgotPasswordStep] = useState(false);
    const [emailForReset, setEmailForReset] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isSendingReset, setIsSendingReset] = useState(false);

    const isAdminEmail = (email) => ADMIN_EMAILS_UI.includes((email || '').toLowerCase());

    // Social auth redirect (backend routes will be added next)
    const startOAuth = (provider) => {
        const base = import.meta.env.VITE_API_URL;
        window.location.href = `${base}/auth/${provider}`;
    };

    // bring back remembered email
    useEffect(() => {
        try {
            const remembered = localStorage.getItem(REMEMBER_KEY) === 'true';
            const email = localStorage.getItem(REMEMBERED_EMAIL_KEY) || '';
            if (remembered && email) {
                setRememberMe(true);
                setData((d) => ({ ...d, email }));
            }
        } catch { }
    }, []);

    // Persist post-auth action
    useEffect(() => {
        const action = location.state?.postAuthAction;
        if (action) {
            try {
                localStorage.setItem(POST_AUTH_KEY, JSON.stringify(action));
            } catch { }
        }
    }, [location.state]);

    useEffect(() => {
        let t;
        if (cooldown > 0) t = setTimeout(() => setCooldown((s) => s - 1), 1000);
        return () => clearTimeout(t);
    }, [cooldown]);

    const togglePassword = () => setShowPassword((s) => !s);

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

    const loginUser = async (e) => {
        e.preventDefault();

        // remember email choice
        try {
            if (rememberMe) {
                localStorage.setItem(REMEMBER_KEY, 'true');
                localStorage.setItem(REMEMBERED_EMAIL_KEY, data.email.trim().toLowerCase());
            } else {
                localStorage.removeItem(REMEMBER_KEY);
                localStorage.removeItem(REMEMBERED_EMAIL_KEY);
            }
        } catch { }

        setIsSubmitting(true);
        try {
            const res = await api.post('/login', {
                email: data.email.trim().toLowerCase(),
                password: data.password,
            });

            if (res.data?.error) {
                if (res.data.error.toLowerCase().includes('verify your email') || res.data.resend) {
                    toast.error('Email not verified. New code sent!');
                    setVerificationStep(true);
                    setCooldown(30);
                } else {
                    toast.error(res.data.error);
                }
                setIsSubmitting(false);
            } else {
                toast.success('Login successful!');
                login(res.data.token, res.data.user);

                const email = res?.data?.user?.email || data.email;
                if (isAdminEmail(email)) {
                    navigate('/admin', { replace: true });
                } else {
                    await runPendingActionOrDefault();
                }

                setIsSubmitting(false);
            }
        } catch (err) {
            toast.error(err.message || 'Login failed');
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

                    const email = loginRes?.data?.user?.email || data.email;
                    if (isAdminEmail(email)) {
                        navigate('/admin', { replace: true });
                    } else {
                        await runPendingActionOrDefault();
                    }
                }
            }
        } catch (err) {
            toast.error(err.message || 'Verification failed');
            setIsVerifying(false);
        }
    };

    const resendCode = async () => {
        try {
            const res = await api.post('/resend-code', {
                email: data.email.trim().toLowerCase(),
            });
            if (res.data?.error) toast.error(res.data.error);
            else {
                toast.success('New code sent!');
                setCooldown(30);
            }
        } catch (err) {
            toast.error(err.message || 'Could not resend code');
        }
    };

    const sendResetLink = async (e) => {
        e.preventDefault();
        setIsSendingReset(true);
        try {
            const res = await api.post('/forgot-password', {
                email: emailForReset.trim().toLowerCase(),
            });
            if (res.data?.error) toast.error(res.data.error);
            else toast.success('Reset link sent to your email');
            setIsSendingReset(false);
        } catch (err) {
            toast.error(err.message || 'Failed to send reset link');
            setIsSendingReset(false);
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
                    <h1 className="kc-title">
                        {verificationStep ? 'Verify your email' : forgotPasswordStep ? 'Reset password' : 'Welcome back'}
                    </h1>

                    {!verificationStep && !forgotPasswordStep && (
                        <p className="kc-subtitle">
                            New to KonarCard?{' '}
                            <Link className="kc-link" to="/register">
                                Create an account
                            </Link>
                        </p>
                    )}

                    {forgotPasswordStep ? (
                        <form className="kc-form" onSubmit={sendResetLink}>
                            <div className="kc-field">
                                <label className="kc-label" htmlFor="resetEmail">
                                    Email
                                </label>
                                <input
                                    className="kc-input"
                                    type="email"
                                    id="resetEmail"
                                    placeholder="Enter your email"
                                    value={emailForReset}
                                    onChange={(e) => setEmailForReset(e.target.value)}
                                    autoComplete="username"
                                    inputMode="email"
                                    required
                                />
                            </div>

                            <button type="submit" className="kc-btn kc-btn-primary" disabled={isSendingReset} aria-busy={isSendingReset}>
                                {isSendingReset ? 'Sending…' : 'Send reset link'}
                            </button>

                            <button type="button" className="kc-btn kc-btn-secondary" onClick={() => setForgotPasswordStep(false)}>
                                Back to login
                            </button>
                        </form>
                    ) : verificationStep ? (
                        <form className="kc-form" onSubmit={verifyCode}>
                            <p className="kc-helper">
                                Enter the 6-digit code sent to <strong>{data.email.trim().toLowerCase()}</strong>
                            </p>

                            <div className="kc-field">
                                <label className="kc-label" htmlFor="verificationCode">
                                    Verification code
                                </label>
                                <input
                                    className="kc-input"
                                    type="text"
                                    id="verificationCode"
                                    name="verificationCode"
                                    placeholder="Enter verification code"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    maxLength={6}
                                    autoComplete="one-time-code"
                                    inputMode="numeric"
                                    required
                                />
                            </div>

                            <button type="submit" className="kc-btn kc-btn-primary" disabled={isVerifying} aria-busy={isVerifying}>
                                {isVerifying ? 'Verifying…' : 'Verify email'}
                            </button>

                            <button type="button" className="kc-btn kc-btn-secondary" onClick={resendCode} disabled={cooldown > 0}>
                                {cooldown > 0 ? `Resend available in ${cooldown}s` : 'Resend code'}
                            </button>

                            <button type="button" className="kc-btn kc-btn-ghost" onClick={() => setVerificationStep(false)}>
                                Back
                            </button>
                        </form>
                    ) : (
                        <>
                            <form className="kc-form" onSubmit={loginUser}>
                                <div className="kc-field">
                                    <label className="kc-label" htmlFor="loginEmail">
                                        Email
                                    </label>
                                    <input
                                        className="kc-input"
                                        type="email"
                                        id="loginEmail"
                                        name="email"
                                        placeholder="Enter your email"
                                        value={data.email}
                                        onChange={(e) => setData({ ...data, email: e.target.value })}
                                        autoComplete="username"
                                        inputMode="email"
                                        required
                                    />
                                </div>

                                <div className="kc-field">
                                    <label className="kc-label" htmlFor="loginPassword">
                                        Password
                                    </label>

                                    <div className="kc-password">
                                        <input
                                            className="kc-input kc-input-password"
                                            type={showPassword ? 'text' : 'password'}
                                            id="loginPassword"
                                            name="password"
                                            placeholder="Enter your password"
                                            value={data.password}
                                            onChange={(e) => setData({ ...data, password: e.target.value })}
                                            autoComplete="current-password"
                                            required
                                        />
                                        <button type="button" className="kc-password-toggle" onClick={togglePassword} aria-label="Toggle password visibility">
                                            {showPassword ? 'Hide' : 'Show'}
                                        </button>
                                    </div>
                                </div>

                                <div className="kc-row">
                                    <label className="kc-remember">
                                        <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                                        <span>Remember me</span>
                                    </label>

                                    <button type="button" className="kc-text-btn" onClick={() => setForgotPasswordStep(true)}>
                                        Forgot Password?
                                    </button>
                                </div>

                                <button type="submit" className="kc-btn kc-btn-primary kc-btn-wide" disabled={isSubmitting} aria-busy={isSubmitting}>
                                    {isSubmitting ? 'Signing in…' : 'Sign in'}
                                </button>
                            </form>

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
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}

/* ===== simple inline icons (no deps) ===== */
function GoogleIcon() {
    return (
        <svg className="kc-ico" viewBox="0 0 48 48" aria-hidden="true">
            <path
                d="M44.5 20H24v8.5h11.8C34.2 33.7 29.7 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.5 0 6.4 1.2 8.7 3.2l6-6C35.5 4.7 30.1 2.5 24 2.5 12.1 2.5 2.5 12.1 2.5 24S12.1 45.5 24 45.5 45.5 35.9 45.5 24c0-1.4-.2-2.7-.5-4z"
                fill="#FFC107"
            />
            <path d="M6.4 14.7l7 5.1C15.3 15.4 19.3 12 24 12c3.5 0 6.4 1.2 8.7 3.2l6-6C35.5 4.7 30.1 2.5 24 2.5c-8.3 0-15.5 4.7-19.6 12.2z" fill="#FF3D00" />
            <path d="M24 45.5c5.9 0 11.1-2 15.1-5.5l-6.9-5.7C30.1 35.7 27.2 37 24 37c-5.7 0-10.2-3.3-11.8-8.5l-7.1 5.4C9.2 41 16.1 45.5 24 45.5z" fill="#4CAF50" />
            <path d="M44.5 20H24v8.5h11.8c-.8 2.2-2.2 4-4 5.2l.1.1 6.9 5.7C41 37.5 45.5 33.4 45.5 24c0-1.4-.2-2.7-.5-4z" fill="#1976D2" />
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
