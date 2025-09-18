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
        confirmPassword: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [verificationStep, setVerificationStep] = useState(false);
    const [code, setCode] = useState('');
    const [cooldown, setCooldown] = useState(0);

    // Which field is focused? "password" | "confirm" | null
    const [focusedField, setFocusedField] = useState(null);
    const [showPasswordFeedback, setShowPasswordFeedback] = useState(false);
    const blurTimeoutRef = useRef(null);

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
        passwordsMatch: data.password === data.confirmPassword && data.confirmPassword.length > 0,
    };

    const handleFieldFocus = (field) => {
        if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
        setFocusedField(field);          // "password" or "confirm"
        setShowPasswordFeedback(true);
    };

    const handleFieldBlur = () => {
        blurTimeoutRef.current = setTimeout(() => {
            setShowPasswordFeedback(false);
            setFocusedField(null);
        }, 120);
    };

    const registerUser = async (e) => {
        e.preventDefault();

        if (!data.username.trim()) {
            toast.error('Username is required.');
            return;
        }
        // Must pass all checks
        if (!Object.values(passwordChecks).every(Boolean)) {
            toast.error('Please meet all password requirements.');
            return;
        }

        try {
            const res = await api.post('/register', {
                name: data.name,
                email: data.email.trim().toLowerCase(),
                username: data.username.trim().toLowerCase(),
                password: data.password,
                confirmPassword: data.confirmPassword,
            });

            if (res.data.error) {
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

            if (res.data.error) {
                toast.error(res.data.error);
            } else {
                toast.success('Email verified! Logging you in...');
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
            if (res.data.error) toast.error(res.data.error);
            else { toast.success('New verification code sent!'); setCooldown(30); }
        } catch {
            toast.error('Could not resend code');
        }
    };

    const GreenTickIcon = () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feedback-icon">
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
    );

    const RedCrossIcon = () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feedback-icon">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
    );

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
                            <div className="username-input-wrapper">
                                <span className="url-prefix">www.konarcard.com/u/</span>
                                <input
                                    type="text"
                                    id="username"
                                    placeholder="username"
                                    value={data.username}
                                    onChange={(e) => setData({ ...data, username: e.target.value })}
                                    autoComplete="off"
                                    required
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
                                    onFocus={() => handleFieldFocus('password')}
                                    onBlur={handleFieldBlur}
                                    required
                                />
                                <button type="button" onClick={() => setShowPassword((s) => !s)}>
                                    {showPassword ? 'Hide' : 'Show'}
                                </button>
                            </div>

                            {/* Feedback under first field: show only rules 1–3 */}
                            {showPasswordFeedback && focusedField === 'password' && (
                                <div className="password-feedback">
                                    <p className={passwordChecks.minLength ? 'valid' : 'invalid'}>
                                        {passwordChecks.minLength ? <GreenTickIcon /> : <RedCrossIcon />} Minimum 8 characters
                                    </p>
                                    <p className={passwordChecks.hasUppercase ? 'valid' : 'invalid'}>
                                        {passwordChecks.hasUppercase ? <GreenTickIcon /> : <RedCrossIcon />} One uppercase letter
                                    </p>
                                    <p className={passwordChecks.hasNumber ? 'valid' : 'invalid'}>
                                        {passwordChecks.hasNumber ? <GreenTickIcon /> : <RedCrossIcon />} One number
                                    </p>
                                </div>
                            )}

                            <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                            <div className="password-wrapper">
                                <input
                                    type={showConfirm ? 'text' : 'password'}
                                    id="confirmPassword"
                                    placeholder="Confirm password"
                                    value={data.confirmPassword}
                                    onChange={(e) => setData({ ...data, confirmPassword: e.target.value })}
                                    autoComplete="new-password"
                                    onFocus={() => handleFieldFocus('confirm')}
                                    onBlur={handleFieldBlur}
                                    required
                                />
                                <button type="button" onClick={() => setShowConfirm((s) => !s)}>
                                    {showConfirm ? 'Hide' : 'Show'}
                                </button>
                            </div>

                            {/* Feedback under second field: show ONLY match status */}
                            {showPasswordFeedback && focusedField === 'confirm' && (
                                <div className="password-feedback">
                                    <p className={passwordChecks.passwordsMatch ? 'valid' : 'invalid'}>
                                        {passwordChecks.passwordsMatch ? <GreenTickIcon /> : <RedCrossIcon />} Passwords match
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
