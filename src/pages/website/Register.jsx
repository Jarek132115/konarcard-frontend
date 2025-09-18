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
        // keep confirmPassword here if your UI still shows it;
        // remove it if you switched backend to no-confirm.
        confirmPassword: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [verificationStep, setVerificationStep] = useState(false);
    const [code, setCode] = useState('');
    const [cooldown, setCooldown] = useState(0);
    const [showPasswordFeedback, setShowPasswordFeedback] = useState(false);

    // NEW: submitting state for the loading button
    const [submitting, setSubmitting] = useState(false);

    const blurTimeoutRef = useRef(null);

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
        passwordsMatch:
            (data.confirmPassword ?? '').length > 0 &&
            data.password === data.confirmPassword,
    };

    const handlePasswordFocus = () => {
        if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
        setShowPasswordFeedback(true);
    };
    const handlePasswordBlur = () => {
        blurTimeoutRef.current = setTimeout(() => setShowPasswordFeedback(false), 120);
    };

    const registerUser = async (e) => {
        e.preventDefault();

        // (Optional) keep these if your backend still expects confirmPassword
        if (!data.username.trim()) {
            toast.error('Username is required.');
            return;
        }

        // Example validations — adjust to your current backend rules
        if (!passwordChecks.minLength || !passwordChecks.hasUppercase || !passwordChecks.hasNumber) {
            toast.error('Please meet all password requirements.');
            return;
        }

        // If your backend NO LONGER requires confirmPassword, you can remove this block
        if ('confirmPassword' in data && data.confirmPassword !== undefined) {
            if (!passwordChecks.passwordsMatch) {
                toast.error('Passwords must match.');
                return;
            }
        }

        try {
            setSubmitting(true); // start loading

            const payload = {
                name: data.name,
                email: data.email.trim().toLowerCase(),
                username: data.username.trim().toLowerCase(),
                password: data.password,
            };

            // include confirmPassword ONLY if your backend still requires it
            if ('confirmPassword' in data && data.confirmPassword !== undefined) {
                payload.confirmPassword = data.confirmPassword;
            }

            const res = await api.post('/register', payload);

            if (res.data?.error) {
                toast.error(res.data.error);
                return;
            }

            toast.success('Verification code sent!');
            setVerificationStep(true);
            setCooldown(30);
        } catch (err) {
            if (err.response) toast.error(err.response.data.error || 'Registration failed');
            else if (err.request) toast.error('No response from server. Check network.');
            else toast.error('Registration failed');
        } finally {
            // turn off loading — the UI will switch to the verify step if successful
            setSubmitting(false);
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

        // ... (unchanged) subscribe / buy_card handlers
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
                return;
            }

            toast.success('Email verified! Logging you in...');
            login(res.data.token, res.data.user);
            await runPendingActionOrDefault();
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

    const GreenTickIcon = () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" className="feedback-icon">
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
    );

    const RedCrossIcon = () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" className="feedback-icon">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
    );

    return (
        <div className="login-wrapper">
            <Link to="/" className="close-button" aria-label="Close">×</Link>

            <div className="login-right">
                <div className="login-card" role="form" aria-labelledby="register-title" aria-busy={submitting}>
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
                                disabled={submitting}
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
                                disabled={submitting}
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
                            {/* Make the whole wrapper focusable & click-to-type */}
                            <div
                                className="username-input-wrapper"
                                role="group"
                                onClick={() => document.getElementById('username')?.focus()}
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Delete') {
                                        e.preventDefault();
                                        document.getElementById('username')?.focus();
                                    }
                                }}
                            >
                                <span className="url-prefix">www.konarcard.com/u/</span>
                                <input
                                    disabled={submitting}
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
                                    disabled={submitting}
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
                                <button type="button" onClick={() => setShowPassword((s) => !s)} disabled={submitting}>
                                    {showPassword ? 'Hide' : 'Show'}
                                </button>
                            </div>

                            {/* Show match only after user touched confirm field (if you still use it) */}
                            {showPasswordFeedback && (
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
                                    {'confirmPassword' in data && data.confirmPassword !== undefined && (
                                        <p className={passwordChecks.passwordsMatch ? 'valid' : 'invalid'}>
                                            {passwordChecks.passwordsMatch ? <GreenTickIcon /> : <RedCrossIcon />} Passwords match
                                        </p>
                                    )}
                                </div>
                            )}

                            {'confirmPassword' in data && (
                                <>
                                    <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                                    <div className="password-wrapper">
                                        <input
                                            disabled={submitting}
                                            type={showConfirm ? 'text' : 'password'}
                                            id="confirmPassword"
                                            placeholder="Confirm password"
                                            value={data.confirmPassword}
                                            onChange={(e) => setData({ ...data, confirmPassword: e.target.value })}
                                            autoComplete="new-password"
                                            onFocus={handlePasswordFocus}
                                            onBlur={handlePasswordBlur}
                                            required
                                        />
                                        <button type="button" onClick={() => setShowConfirm((s) => !s)} disabled={submitting}>
                                            {showConfirm ? 'Hide' : 'Show'}
                                        </button>
                                    </div>
                                </>
                            )}

                            <label className="terms-label">
                                <input disabled={submitting} type="checkbox" className="terms-checkbox konar-checkbox" required />
                                <span className="desktop-body-xs">
                                    I agree to the <a href="/policies">Terms of Service</a> & <a href="/policies">Privacy Policy</a>
                                </span>
                            </label>

                            <button
                                type="submit"
                                className="primary-button sign-in-button"
                                disabled={submitting}
                                aria-disabled={submitting}
                            >
                                {submitting ? (
                                    <>
                                        <span className="btn-spinner" aria-hidden="true" /> Creating account…
                                    </>
                                ) : (
                                    'Create Account'
                                )}
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
