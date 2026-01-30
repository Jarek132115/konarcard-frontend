// frontend/src/pages/website/Login.jsx
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

const FALLBACK_BASE = 'https://konarcard-backend-331608269918.europe-west1.run.app';

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

    const startOAuth = (provider) => {
        try {
            localStorage.setItem('oauthSource', 'login');
            // ✅ DO NOT clear pendingClaimSlug here.
            // If user claimed earlier, we want OAuthSuccess to finalize it.
        } catch { }

        const base = (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.trim())
            ? import.meta.env.VITE_API_URL.trim()
            : (api?.defaults?.baseURL || FALLBACK_BASE);

        window.location.href = `${base}/auth/${provider}`;
    };

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

    useEffect(() => {
        const action = location.state?.postAuthAction;
        if (action) {
            try {
                localStorage.setItem(POST_AUTH_KEY, JSON.stringify(action));
            } catch { }
        }
    }, [location.state]);

    useEffect(() => {
        if (cooldown <= 0) return;
        const t = setTimeout(() => setCooldown((s) => s - 1), 1000);
        return () => clearTimeout(t);
    }, [cooldown]);

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
                if (res?.data?.url) {
                    window.location.href = res.data.url;
                    return;
                }
                toast.error('Could not start subscription.');
                navigate('/subscription');
            } catch {
                toast.error('Subscription failed.');
                navigate('/subscription');
            }
            return;
        }

        if (action.type === 'buy_card') {
            navigate('/productandplan/konarcard', {
                state: {
                    triggerCheckout: true,
                    quantity: Number(action?.payload?.quantity) || 1,
                },
                replace: true,
            });
            return;
        }

        navigate('/myprofile');
    };

    const loginUser = async (e) => {
        e.preventDefault();

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
                if (res.data.resend) {
                    toast.error('Email not verified. Code sent.');
                    setVerificationStep(true);
                    setCooldown(30);
                } else {
                    toast.error(res.data.error);
                }
            } else {
                toast.success('Login successful!');
                login(res.data.token, res.data.user);

                const email = res.data.user?.email || data.email;
                if (isAdminEmail(email)) navigate('/admin', { replace: true });
                else await runPendingActionOrDefault();
            }
        } catch (err) {
            toast.error(err?.response?.data?.error || 'Login failed.');
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
                toast.success('Email verified!');
                const loginRes = await api.post('/login', {
                    email: data.email.trim().toLowerCase(),
                    password: data.password,
                });
                login(loginRes.data.token, loginRes.data.user);
                await runPendingActionOrDefault();
            }
        } catch (err) {
            toast.error(err?.response?.data?.error || 'Verification failed.');
        } finally {
            setIsVerifying(false);
        }
    };

    const resendCode = async () => {
        try {
            const res = await api.post('/resend-code', { email: data.email.trim().toLowerCase() });
            if (res.data?.error) toast.error(res.data.error);
            else {
                toast.success('New code sent!');
                setCooldown(30);
            }
        } catch {
            toast.error('Could not resend code.');
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
            else toast.success('Reset link sent!');
        } catch {
            toast.error('Failed to send reset link.');
        } finally {
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
                    {forgotPasswordStep ? (
                        <form className="kc-form" onSubmit={sendResetLink}>
                            <h1 className="kc-title">Reset password</h1>

                            <div className="kc-field">
                                <label className="kc-label" htmlFor="resetEmail">
                                    Email
                                </label>
                                <input
                                    className="kc-input"
                                    id="resetEmail"
                                    type="email"
                                    placeholder="Email"
                                    value={emailForReset}
                                    onChange={(e) => setEmailForReset(e.target.value)}
                                    required
                                />
                            </div>

                            <button className="kc-btn kc-btn-primary kc-btn-center" disabled={isSendingReset} aria-busy={isSendingReset}>
                                {isSendingReset ? 'Sending…' : 'Send reset link'}
                            </button>

                            <button type="button" className="kc-btn kc-btn-secondary kc-btn-center" onClick={() => setForgotPasswordStep(false)}>
                                Back
                            </button>
                        </form>
                    ) : verificationStep ? (
                        <form className="kc-form" onSubmit={verifyCode}>
                            <h1 className="kc-title">Verify email</h1>

                            <div className="kc-field">
                                <label className="kc-label" htmlFor="code">
                                    Verification code
                                </label>
                                <input
                                    className="kc-input"
                                    id="code"
                                    type="text"
                                    placeholder="123456"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    maxLength={6}
                                    required
                                />
                            </div>

                            <button className="kc-btn kc-btn-primary kc-btn-center" disabled={isVerifying} aria-busy={isVerifying}>
                                {isVerifying ? 'Verifying…' : 'Verify'}
                            </button>

                            <button type="button" className="kc-btn kc-btn-secondary kc-btn-center" onClick={resendCode} disabled={cooldown > 0}>
                                {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
                            </button>
                        </form>
                    ) : (
                        <>
                            <h1 className="kc-title">Welcome back</h1>
                            <p className="kc-subtitle">
                                New to KonarCard?{' '}
                                <Link className="kc-link" to="/register">
                                    Create an account
                                </Link>
                            </p>

                            <form className="kc-form" onSubmit={loginUser}>
                                <div className="kc-field">
                                    <label className="kc-label" htmlFor="email">
                                        Email
                                    </label>
                                    <input
                                        className="kc-input"
                                        id="email"
                                        type="email"
                                        placeholder="Email"
                                        value={data.email}
                                        onChange={(e) => setData({ ...data, email: e.target.value })}
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
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Password"
                                            value={data.password}
                                            onChange={(e) => setData({ ...data, password: e.target.value })}
                                            required
                                        />
                                        <button type="button" className="kc-password-toggle" onClick={() => setShowPassword((s) => !s)}>
                                            {showPassword ? 'Hide' : 'Show'}
                                        </button>
                                    </div>
                                </div>

                                <label className="kc-remember" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                                    Remember me
                                </label>

                                <button className="kc-btn kc-btn-primary kc-btn-center" disabled={isSubmitting} aria-busy={isSubmitting}>
                                    {isSubmitting ? 'Signing in…' : 'Sign in'}
                                </button>

                                <button type="button" className="kc-text-back" onClick={() => setForgotPasswordStep(true)}>
                                    Forgot Password?
                                </button>
                            </form>

                            <div className="kc-divider">
                                <span>or</span>
                            </div>

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
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
