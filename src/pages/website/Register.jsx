// frontend/src/pages/auth/Register.jsx
import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../../components/AuthContext';
import api from '../../services/api';

const POST_AUTH_KEY = 'postAuthAction';

export default function Register() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useContext(AuthContext);

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

    // focus helpers (so clicking anywhere in the username row focuses input)
    const usernameRef = useRef(null);
    const passwordRef = useRef(null);

    // Persist incoming post-auth action (subscribe / buy_card)
    useEffect(() => {
        const action = location.state?.postAuthAction;
        if (action) {
            try { localStorage.setItem(POST_AUTH_KEY, JSON.stringify(action)); } catch { }
        }
    }, [location.state]);

    useEffect(() => {
        if (cooldown > 0) {
            const t = setTimeout(() => setCooldown(s => s - 1), 1000);
            return () => clearTimeout(t);
        }
    }, [cooldown]);

    const passwordChecks = {
        minLength: data.password.length >= 8,
        hasUppercase: /[A-Z]/.test(data.password),
        hasNumber: /\d/.test(data.password),
    };

    const registerUser = async (e) => {
        e.preventDefault();

        // simple validation (no confirm password anymore)
        if (!data.name.trim() || !data.email.trim() || !data.username.trim() || !data.password) {
            toast.error('Please fill in all fields.');
            return;
        }
        if (!Object.values(passwordChecks).every(Boolean)) {
            toast.error('Please meet all password requirements.');
            passwordRef.current?.focus();
            return;
        }

        try {
            const res = await api.post('/register', {
                name: data.name.trim(),
                email: data.email.trim().toLowerCase(),
                username: data.username.trim().toLowerCase(),
                password: data.password,
                // confirmPassword REMOVED
            });

            if (res.data?.error) {
                toast.error(res.data.error);
            } else {
                toast.success('Verification code sent!');
                setVerificationStep(true);
                setCooldown(30);
            }
        } catch (err) {
            if (err.response) toast.error(err.response.data.error || 'Registration failed');
            else if (err.request) toast.error('No response from server. Check network.');
            else toast.error('Registration failed');
        }
    };

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

    const verifyCode = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/verify-email', {
                email: data.email.trim().toLowerCase(),
                code,
            });

            if (res.data?.error) {
                toast.error(res.data.error);
            } else {
                toast.success('Email verified! Logging you in...');
                // server returns token + user on verify in your controller
                login(res.data.token, res.data.user);
                await runPendingActionOrDefault();
            }
        } catch {
            toast.error('Verification failed');
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
        <div className="login-wrapper">
            <Link to="/" className="close-button" aria-label="Close">×</Link>

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
                            {/* Name */}
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

                            {/* Email */}
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

                            {/* Username (full-row clickable, 0-gap style) */}
                            <label htmlFor="username" className="form-label">
                                Username <span className="desktop-body-xs" style={{ color: '#666' }}>(cannot be changed)</span>
                            </label>
                            <div
                                className="username-input-wrapper"
                                onClick={() => usernameRef.current?.focus()}
                                role="group"
                                aria-label="Username"
                            >
                                <span className="url-prefix">www.konarcard.com/u/</span>
                                <input
                                    ref={usernameRef}
                                    type="text"
                                    id="username"
                                    placeholder="username"
                                    value={data.username}
                                    onChange={(e) => setData({ ...data, username: e.target.value })}
                                    autoComplete="off"
                                    required
                                />
                            </div>

                            {/* Password */}
                            <label htmlFor="password" className="form-label">Password</label>
                            <div className="password-wrapper" onClick={() => passwordRef.current?.focus()}>
                                <input
                                    ref={passwordRef}
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    placeholder="Create a password"
                                    value={data.password}
                                    onChange={(e) => setData({ ...data, password: e.target.value })}
                                    autoComplete="new-password"
                                    onFocus={() => setShowPasswordFeedback(true)}
                                    onBlur={() => setTimeout(() => setShowPasswordFeedback(false), 120)}
                                    required
                                />
                                <button type="button" onClick={() => setShowPassword(s => !s)}>
                                    {showPassword ? 'Hide' : 'Show'}
                                </button>
                            </div>

                            {/* Password feedback (no match rule anymore) */}
                            {showPasswordFeedback && (
                                <div className="password-feedback">
                                    <p className={passwordChecks.minLength ? 'valid' : 'invalid'}>
                                        <span className="feedback-icon" /> Minimum 8 characters
                                    </p>
                                    <p className={passwordChecks.hasUppercase ? 'valid' : 'invalid'}>
                                        <span className="feedback-icon" /> One uppercase letter
                                    </p>
                                    <p className={passwordChecks.hasNumber ? 'valid' : 'invalid'}>
                                        <span className="feedback-icon" /> One number
                                    </p>
                                </div>
                            )}

                            <label className="terms-label">
                                <input type="checkbox" className="terms-checkbox konar-checkbox" required />
                                <span className="desktop-body-xs">
                                    I agree to the <a href="/policies">Terms of Service</a> & <a href="/policies">Privacy Policy</a>
                                </span>
                            </label>

                            <button type="submit" className="primary-button sign-in-button">Create Account</button>
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
                            <button type="submit" className="primary-button verify-email-button">Verify Email</button>
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
    );
}
