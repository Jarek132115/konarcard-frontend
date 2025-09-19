// frontend/src/pages/auth/Login.jsx
import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../../components/AuthContext';
import Navbar from '../../components/Navbar';
import api from '../../services/api';

const POST_AUTH_KEY = 'postAuthAction';
const REMEMBER_KEY = 'rememberLogin';
const REMEMBERED_EMAIL_KEY = 'rememberedEmail';

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
            try { localStorage.setItem(POST_AUTH_KEY, JSON.stringify(action)); } catch { }
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
        try { localStorage.removeItem(POST_AUTH_KEY); } catch { }

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
                if (url) { window.location.href = url; return; }
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
                await runPendingActionOrDefault();
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
                    await runPendingActionOrDefault();
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
            else { toast.success('New code sent!'); setCooldown(30); }
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
        <div className="auth-page">
            {/* Real navbar */}
            <Navbar />

            {/* Page-level close button that sits at the right end of the navbar */}
            <button
                className="auth-nav-close"
                onClick={() => navigate('/')}
                aria-label="Close"
            >
                ×
            </button>

            {/* Content */}
            <div className="login-wrapper">
                <div className="login-right">
                    <div className="login-card" role="form" aria-labelledby="login-title">
                        <h1 id="login-title" className="desktop-h3 text-center" style={{ marginBottom: 8 }}>Welcome Back</h1>
                        <p className="desktop-body-text text-center" style={{ marginBottom: 24 }}>
                            Enter your email and password to access your account.
                        </p>

                        {forgotPasswordStep ? (
                            <form onSubmit={sendResetLink} className="login-form">
                                <label htmlFor="resetEmail" className="form-label">Email</label>
                                <input
                                    type="email"
                                    id="resetEmail"
                                    placeholder="Enter your email"
                                    value={emailForReset}
                                    onChange={(e) => setEmailForReset(e.target.value)}
                                    className="standard-input"
                                    autoComplete="username"
                                    inputMode="email"
                                    required
                                />
                                <button
                                    type="submit"
                                    className="primary-button send-reset-link-button"
                                    disabled={isSendingReset}
                                    aria-busy={isSendingReset}
                                >
                                    {isSendingReset ? 'Sending…' : 'Send Reset Link'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setForgotPasswordStep(false)}
                                    className="secondary-button back-to-login-button"
                                >
                                    Back to Login
                                </button>
                            </form>
                        ) : !verificationStep ? (
                            <form className="login-form" onSubmit={loginUser}>
                                <label htmlFor="loginEmail" className="form-label">Email</label>
                                <input
                                    type="email"
                                    id="loginEmail"
                                    name="email"
                                    placeholder="you@example.com"
                                    value={data.email}
                                    onChange={(e) => setData({ ...data, email: e.target.value })}
                                    className="standard-input"
                                    autoComplete="username"
                                    inputMode="email"
                                    required
                                />

                                <label htmlFor="loginPassword" className="form-label">Password</label>
                                <div className="password-wrapper">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="loginPassword"
                                        name="password"
                                        placeholder="Your password"
                                        value={data.password}
                                        onChange={(e) => setData({ ...data, password: e.target.value })}
                                        autoComplete="current-password"
                                        required
                                    />
                                    <button type="button" onClick={togglePassword} aria-label="Toggle password visibility">
                                        {showPassword ? 'Hide' : 'Show'}
                                    </button>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '8px 0 12px' }}>
                                    <label className="terms-label" style={{ margin: 0, cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            className="konar-checkbox"
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                        />
                                        <span className="desktop-body-xs" style={{ color: '#666' }}>Remember me</span>
                                    </label>

                                    <button type="button" className="link-button desktop-body-xs" onClick={() => setForgotPasswordStep(true)}>
                                        Forgot your password?
                                    </button>
                                </div>

                                <button
                                    type="submit"
                                    className="primary-button sign-in-button"
                                    disabled={isSubmitting}
                                    aria-busy={isSubmitting}
                                >
                                    {isSubmitting ? 'Signing in…' : 'Log In'}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={verifyCode} className="login-form">
                                <p className="verification-instruction">
                                    Enter the 6-digit code sent to <strong>{data.email.trim().toLowerCase()}</strong>
                                </p>
                                <label htmlFor="verificationCode" className="form-label">Verification Code</label>
                                <input
                                    type="text"
                                    id="verificationCode"
                                    name="verificationCode"
                                    placeholder="Enter verification code"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    className="standard-input"
                                    maxLength={6}
                                    autoComplete="one-time-code"
                                    required
                                />
                                <button
                                    type="submit"
                                    className="cta-blue-button desktop-button"
                                    disabled={isVerifying}
                                    aria-busy={isVerifying}
                                >
                                    {isVerifying ? 'Verifying…' : 'Verify Email'}
                                </button>
                                <button
                                    type="button"
                                    className="cta-black-button desktop-button"
                                    onClick={resendCode}
                                    disabled={cooldown > 0}
                                    style={{ marginTop: '1rem' }}
                                >
                                    {cooldown > 0 ? `Resend available in ${cooldown}s` : 'Resend Code'}
                                </button>
                            </form>
                        )}

                        {!forgotPasswordStep && !verificationStep && (
                            <p className="login-alt-text">
                                Don’t have an account? <Link to="/register">Register Now.</Link>
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
