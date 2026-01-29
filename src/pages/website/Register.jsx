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
        username: '',
        password: '',
    });

    // Step control
    const [claimStep, setClaimStep] = useState(true);
    const [verificationStep, setVerificationStep] = useState(false);

    // Password UX
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordFeedback, setShowPasswordFeedback] = useState(false);

    // Verification
    const [code, setCode] = useState('');
    const [cooldown, setCooldown] = useState(0);

    // Loading states
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);

    /* ----------------------------------
       Persist post-auth action (checkout)
    ----------------------------------- */
    useEffect(() => {
        const action = location.state?.postAuthAction;
        if (action) {
            try {
                localStorage.setItem(POST_AUTH_KEY, JSON.stringify(action));
            } catch { }
        }
    }, [location.state]);

    /* ----------------------------------
       Cooldown timer
    ----------------------------------- */
    useEffect(() => {
        if (cooldown <= 0) return;
        const t = setTimeout(() => setCooldown((s) => s - 1), 1000);
        return () => clearTimeout(t);
    }, [cooldown]);

    /* ----------------------------------
       Password rules
    ----------------------------------- */
    const passwordChecks = {
        minLength: data.password.length >= 8,
        hasUppercase: /[A-Z]/.test(data.password),
        hasNumber: /\d/.test(data.password),
    };

    /* ----------------------------------
       OAuth redirect
    ----------------------------------- */
    const startOAuth = (provider) => {
        const base = import.meta.env.VITE_API_URL;
        window.location.href = `${base}/auth/${provider}`;
    };

    /* ----------------------------------
       Step 1: Claim link (availability only)
    ----------------------------------- */
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

            setData((d) => ({ ...d, username }));
            setClaimStep(false);

            setTimeout(() => {
                document.getElementById('name')?.focus();
            }, 0);
        } catch (err) {
            toast.error(err?.response?.data?.error || 'Link unavailable.');
        }
    };

    /* ----------------------------------
       Step 2: Register (send verification)
    ----------------------------------- */
    const registerUser = async (e) => {
        e.preventDefault();

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
            toast.error(err?.response?.data?.error || 'Registration failed.');
        } finally {
            setIsSubmitting(false);
        }
    };

    /* ----------------------------------
       Step 3: Verify email + auto-login
    ----------------------------------- */
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
                return;
            }

            toast.success('Email verified! Logging you in…');

            const loginRes = await api.post('/login', {
                email: data.email.trim().toLowerCase(),
                password: data.password,
            });

            login(loginRes.data.token, loginRes.data.user);
            navigate('/myprofile');
        } catch (err) {
            toast.error(err?.response?.data?.error || 'Verification failed.');
        } finally {
            setIsVerifying(false);
        }
    };

    /* ----------------------------------
       Resend verification code
    ----------------------------------- */
    const resendCode = async () => {
        try {
            await api.post('/resend-code', {
                email: data.email.trim().toLowerCase(),
            });
            toast.success('New verification code sent!');
            setCooldown(30);
        } catch {
            toast.error('Could not resend code.');
        }
    };

    return (
        <div className="kc-auth-page">
            <header className="kc-auth-header">
                <Link to="/" className="kc-logo">K</Link>
                <button className="kc-close" onClick={() => navigate('/')}>×</button>
            </header>

            <main className="kc-auth-main">
                <div className="kc-auth-inner">

                    {/* STEP 3: VERIFY */}
                    {verificationStep ? (
                        <form className="kc-form" onSubmit={verifyCode}>
                            <h1 className="kc-title">Verify your email</h1>
                            <p className="kc-subtitle">
                                Enter the 6-digit code sent to <strong>{data.email}</strong>
                            </p>

                            <input
                                className="kc-input"
                                placeholder="Verification code"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                maxLength={6}
                                required
                            />

                            <button className="kc-btn kc-btn-primary" disabled={isVerifying}>
                                {isVerifying ? 'Verifying…' : 'Verify email'}
                            </button>

                            <button
                                type="button"
                                className="kc-btn kc-btn-secondary"
                                onClick={resendCode}
                                disabled={cooldown > 0}
                            >
                                {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
                            </button>
                        </form>
                    ) : claimStep ? (
                        /* STEP 1: CLAIM */
                        <form className="kc-form" onSubmit={claimLinkContinue}>
                            <h1 className="kc-title">Claim your link</h1>
                            <p className="kc-subtitle">This will be your public profile URL</p>

                            <div className="kc-claim">
                                <span className="kc-claim-prefix">konarcard.com/u/</span>
                                <input
                                    ref={usernameInputRef}
                                    className="kc-input kc-claim-input"
                                    placeholder="yourname"
                                    value={data.username}
                                    onChange={(e) => setData({ ...data, username: e.target.value })}
                                    required
                                />
                            </div>

                            <button className="kc-btn kc-btn-primary">
                                Claim link
                            </button>

                            <p className="kc-bottom-line">
                                Already have an account? <Link to="/login">Sign in</Link>
                            </p>
                        </form>
                    ) : (
                        /* STEP 2: REGISTER */
                        <>
                            <form className="kc-form" onSubmit={registerUser}>
                                <h1 className="kc-title">Create your account</h1>

                                <input
                                    id="name"
                                    className="kc-input"
                                    placeholder="Full name"
                                    value={data.name}
                                    onChange={(e) => setData({ ...data, name: e.target.value })}
                                    required
                                />

                                <input
                                    className="kc-input"
                                    type="email"
                                    placeholder="Email"
                                    value={data.email}
                                    onChange={(e) => setData({ ...data, email: e.target.value })}
                                    required
                                />

                                <div className="kc-password">
                                    <input
                                        className="kc-input"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Create password"
                                        value={data.password}
                                        onChange={(e) => setData({ ...data, password: e.target.value })}
                                        onFocus={() => setShowPasswordFeedback(true)}
                                        onBlur={() => setShowPasswordFeedback(false)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="kc-password-toggle"
                                        onClick={() => setShowPassword((s) => !s)}
                                    >
                                        {showPassword ? 'Hide' : 'Show'}
                                    </button>
                                </div>

                                {showPasswordFeedback && (
                                    <div className="kc-password-rules">
                                        <Rule ok={passwordChecks.minLength} text="At least 8 characters" />
                                        <Rule ok={passwordChecks.hasUppercase} text="One uppercase letter" />
                                        <Rule ok={passwordChecks.hasNumber} text="One number" />
                                    </div>
                                )}

                                <button className="kc-btn kc-btn-primary" disabled={isSubmitting}>
                                    {isSubmitting ? 'Saving…' : 'Create account'}
                                </button>
                            </form>

                            <div className="kc-divider"><span>or</span></div>

                            <div className="kc-social">
                                <button onClick={() => startOAuth('google')}>Sign up with Google</button>
                                <button onClick={() => startOAuth('facebook')}>Sign up with Facebook</button>
                                <button onClick={() => startOAuth('apple')}>Sign up with Apple</button>
                            </div>
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
            <span className="kc-rule-dot" />
            <span>{text}</span>
        </div>
    );
}
