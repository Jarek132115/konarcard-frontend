import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../../components/AuthContext';
import backgroundImg from '../../assets/images/background.png';
import api from '../../services/api'; // configured axios instance

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
    const [showPasswordFeedback, setShowPasswordFeedback] = useState(false);
    const blurTimeoutRef = useRef(null);

    // Persist incoming post-auth action (e.g., Buy Now / Subscribe)
    useEffect(() => {
        const action = location.state?.postAuthAction;
        if (action) {
            try { localStorage.setItem(POST_AUTH_KEY, JSON.stringify(action)); } catch { }
        }
    }, [location.state]);

    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldown]);

    const togglePassword = () => setShowPassword(!showPassword);
    const toggleConfirm = () => setShowConfirm(!showConfirm);

    const passwordChecks = {
        minLength: data.password.length >= 8,
        hasUppercase: /[A-Z]/.test(data.password),
        hasNumber: /\d/.test(data.password),
        passwordsMatch: data.password === data.confirmPassword && data.confirmPassword.length > 0,
    };

    const handlePasswordFocus = () => {
        if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
        setShowPasswordFeedback(true);
    };

    const handlePasswordBlur = () => {
        blurTimeoutRef.current = setTimeout(() => setShowPasswordFeedback(false), 100);
    };

    const registerUser = async (e) => {
        e.preventDefault();

        if (!data.username) {
            toast.error('Username is required.');
            return;
        }

        if (!Object.values(passwordChecks).every(Boolean)) {
            toast.error('Please meet all password requirements.');
            return;
        }

        try {
            const res = await api.post('/register', {
                name: data.name,
                email: data.email.trim().toLowerCase(),            // normalize email
                username: data.username.trim().toLowerCase(),       // normalize username
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
            if (err.response) {
                toast.error(err.response.data.error || 'Registration failed');
            } else if (err.request) {
                toast.error('No response from server. Check network.');
            } else {
                toast.error('Registration failed');
            }
        }
    };

    // After verify -> login -> run pending action (subscribe / buy_card) or default
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

    const verifyCode = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/verify-email', {
                email: data.email.trim().toLowerCase(),   // normalize email
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
            const res = await api.post('/resend-code', { email: data.email.trim().toLowerCase() }); // normalize
            if (res.data.error) {
                toast.error(res.data.error);
            } else {
                toast.success('New verification code sent!');
                setCooldown(30);
            }
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
        <>
            <div className="login-wrapper">
                <Link to="/" className="close-button">×</Link>
                <div className="login-left">
                    <img src={backgroundImg} alt="Login visual" className="login-visual" />
                    <div className="login-quote">
                        <span className="quote-icon">“</span>
                        <p className="quote-text">“This has completely changed the way I find work. Clients love it.”</p>
                        <p className="quote-author">Liam Turner – Electrical Contractor</p>
                    </div>
                </div>

                <div className="login-right">
                    <div className="login-card">
                        <h2 className={`login-title ${!verificationStep ? 'desktop-h4' : ''}`}>
                            {verificationStep ? 'Verify Your Email' : 'Create Your Account'}
                        </h2>

                        {!verificationStep && (
                            <p className="desktop-body-text text-center" style={{ marginBottom: '24px' }}>
                                Please enter your details to create an account
                            </p>
                        )}

                        {!verificationStep ? (
                            <form onSubmit={registerUser} className="login-form">
                                <label htmlFor="name" className="form-label">Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    placeholder="Name"
                                    value={data.name}
                                    onChange={(e) => setData({ ...data, name: e.target.value })}
                                    className="standard-input"
                                    autoComplete="name"
                                />

                                <label htmlFor="email" className="form-label">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    placeholder="Email"
                                    value={data.email}
                                    onChange={(e) => setData({ ...data, email: e.target.value })}
                                    className="standard-input"
                                    autoComplete="username"     // tell PMs this is the account identifier
                                    autoCapitalize="none"
                                    inputMode="email"
                                />

                                <label htmlFor="username" className="form-label">
                                    Username <span className="text-sm text-gray-500">(username cannot be changed)</span>
                                </label>
                                <div className="username-input-wrapper">
                                    <span className="url-prefix">www.konarcard.com/u/</span>
                                    <input
                                        type="text"
                                        id="username"
                                        name="username"
                                        placeholder="username"
                                        value={data.username}
                                        onChange={(e) => setData({ ...data, username: e.target.value })}
                                        autoComplete="off"       // avoid PM saving this as login username
                                        autoCapitalize="none"
                                    />
                                </div>

                                <label htmlFor="password" className="form-label">Password</label>
                                <div className="password-wrapper">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        name="password"
                                        placeholder="Password"
                                        value={data.password}
                                        onChange={(e) => setData({ ...data, password: e.target.value })}
                                        autoComplete="new-password"   // create credential
                                        onFocus={handlePasswordFocus}
                                        onBlur={handlePasswordBlur}
                                    />
                                    <button type="button" onClick={togglePassword}>{showPassword ? 'Hide' : 'Show'}</button>
                                </div>

                                <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                                <div className="password-wrapper">
                                    <input
                                        type={showConfirm ? 'text' : 'password'}
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        placeholder="Confirm Password"
                                        value={data.confirmPassword}
                                        onChange={(e) => setData({ ...data, confirmPassword: e.target.value })}
                                        autoComplete="new-password"
                                        onFocus={handlePasswordFocus}
                                        onBlur={handlePasswordBlur}
                                    />
                                    <button type="button" onClick={toggleConfirm}>{showConfirm ? 'Hide' : 'Show'}</button>
                                </div>

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

                                <button type="submit" className="primary-button sign-in-button">Register</button>
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
                                    autoComplete="one-time-code"
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
                                Already have an account? <Link to="/login">Login</Link>
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
