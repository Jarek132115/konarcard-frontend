// frontend/src/pages/auth/Register.jsx
import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../../components/AuthContext';
import Navbar from '../../components/Navbar';
import api from '../../services/api';

const POST_AUTH_KEY = 'postAuthAction';

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

    const [showPassword, setShowPassword] = useState(false);
    const [verificationStep, setVerificationStep] = useState(false);
    const [code, setCode] = useState('');
    const [cooldown, setCooldown] = useState(0);
    const [showPasswordFeedback, setShowPasswordFeedback] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);

    // Persist incoming post-auth action
    useEffect(() => {
        const action = location.state?.postAuthAction;
        if (action) {
            try { localStorage.setItem(POST_AUTH_KEY, JSON.stringify(action)); } catch { }
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
        try { localStorage.removeItem(POST_AUTH_KEY); } catch { }

        if (!action) { navigate('/myprofile'); return; }

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

    const registerUser = async (e) => {
        e.preventDefault();

        if (!data.username.trim()) { toast.error('Username is required.'); return; }
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
            else { toast.success('New verification code sent!'); setCooldown(30); }
        } catch {
            toast.error('Could not resend code');
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
                    <div className="login-card" role="form" aria-labelledby="register-title">
                        <h1 id="register-title" className="desktop-h3 text-center" style={{ marginBottom: 8 }}>
                            Create Your Account
                        </h1>
                        <p className="desktop-body-text text-center" style={{ marginBottom: 24 }}>
                            Enter your details to get started.
                        </p>

                        {!verificationStep ? (
                            <form onSubmit={registerUser} className="login-form">
                                <label htmlFor="name" className="form-label">Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    placeholder="Full name"
                                    value={data.name}
                                    onChange={(e) => setData({ ...data, name: e.target.value })}
                                    className="standard-input"
                                    autoComplete="name"
                                    required
                                />

                                <label htmlFor="email" className="form-label">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    placeholder="you@example.com"
                                    value={data.email}
                                    onChange={(e) => setData({ ...data, email: e.target.value })}
                                    className="standard-input"
                                    autoComplete="username"
                                    inputMode="email"
                                    required
                                />

                                <label htmlFor="username" className="form-label">
                                    Username <span className="desktop-body-xs" style={{ color: '#666' }}>(cannot be changed)</span>
                                </label>

                                {/* Click anywhere focuses input; username text touches the domain */}
                                <div
                                    className="username-input-wrapper"
                                    onClick={() => usernameInputRef.current?.focus()}
                                    role="group"
                                    aria-label="Username (with site prefix)"
                                >
                                    <span className="url-prefix">www.konarcard.com/u/</span>
                                    <input
                                        ref={usernameInputRef}
                                        type="text"
                                        id="username"
                                        placeholder="username"
                                        value={data.username}
                                        onChange={(e) => setData({ ...data, username: e.target.value })}
                                        autoComplete="off"
                                        required
                                        style={{ paddingLeft: 0 }}
                                    />
                                </div>

                                <label htmlFor="password" className="form-label">Password</label>
                                <div className="password-wrapper">
                                    <input
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
                                    <button type="button" onClick={() => setShowPassword((s) => !s)}>
                                        {showPassword ? 'Hide' : 'Show'}
                                    </button>
                                </div>

                                {showPasswordFeedback && (
                                    <div className="password-feedback">
                                        <p className={passwordChecks.minLength ? 'valid' : 'invalid'}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" className="feedback-icon" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                            Minimum 8 characters
                                        </p>
                                        <p className={passwordChecks.hasUppercase ? 'valid' : 'invalid'}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" className="feedback-icon" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                            One uppercase letter
                                        </p>
                                        <p className={passwordChecks.hasNumber ? 'valid' : 'invalid'}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" className="feedback-icon" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                            One number
                                        </p>
                                    </div>
                                )}

                                <label className="terms-label">
                                    <input type="checkbox" className="terms-checkbox konar-checkbox" required />
                                    <span className="desktop-body-xs">
                                        I agree to the <a href="/policies">Terms of Service</a> & <a href="/policies">Privacy Policy</a>
                                    </span>
                                </label>

                                <button
                                    type="submit"
                                    className="primary-button sign-in-button"
                                    disabled={isSubmitting}
                                    aria-busy={isSubmitting}
                                >
                                    {isSubmitting ? 'Registering…' : 'Create Account'}
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
                                    placeholder="123456"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    className="standard-input"
                                    autoComplete="one-time-code"
                                    maxLength={6}
                                    required
                                />
                                <button
                                    type="submit"
                                    className="primary-button verify-email-button"
                                    disabled={isVerifying}
                                    aria-busy={isVerifying}
                                >
                                    {isVerifying ? 'Verifying…' : 'Verify Email'}
                                </button>
                                <button
                                    type="button"
                                    className="secondary-button resend-code-button"
                                    onClick={resendCode}
                                    disabled={cooldown > 0}
                                    style={{ marginTop: '1rem' }}
                                >
                                    {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}
                                </button>
                            </form>
                        )}

                        {!verificationStep && (
                            <p className="login-alt-text">
                                Already have an account? <Link to="/login">Log In</Link>
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
