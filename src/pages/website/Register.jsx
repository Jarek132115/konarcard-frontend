// frontend/src/pages/website/Register.jsx
import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../../components/AuthContext';
import api from '../../services/api';
import '../../styling/login.css';

const POST_AUTH_KEY = 'postAuthAction';
const CLAIM_KEY = 'pendingClaimSlug';
const DOMAIN_PREFIX = 'www.konarcard.com/u/';

export default function Register() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useContext(AuthContext);
    const usernameInputRef = useRef(null);

    const [data, setData] = useState({ name: '', email: '', username: '', password: '' });

    // Step 1 = claim link, Step 2 = create account/social, Step 3 = verify
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
            try { localStorage.setItem(POST_AUTH_KEY, JSON.stringify(action)); } catch { }
        }
    }, [location.state]);

    // Restore claimed slug (important for OAuth + refresh)
    useEffect(() => {
        try {
            const saved = localStorage.getItem(CLAIM_KEY);
            if (saved) {
                setData((d) => ({ ...d, username: saved }));
                setClaimStep(false);
            }
        } catch { }
    }, []);

    useEffect(() => {
        if (cooldown <= 0) return;
        const t = setTimeout(() => setCooldown((s) => s - 1), 1000);
        return () => clearTimeout(t);
    }, [cooldown]);

    const sanitizeUsername = (raw) =>
        (raw || '').trim().toLowerCase().replace(/[^a-z0-9._-]/g, '');

    const passwordChecks = {
        minLength: data.password.length >= 8,
        hasUppercase: /[A-Z]/.test(data.password),
        hasNumber: /\d/.test(data.password),
    };

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

    // OAuth redirect (MUST keep slug)
    const startOAuth = (provider) => {
        const base = import.meta.env.VITE_API_URL;
        try {
            localStorage.setItem('oauthSource', 'register');
            const u = sanitizeUsername(data.username);
            if (u) localStorage.setItem(CLAIM_KEY, u);
        } catch { }
        window.location.href = `${base}/auth/${provider}`;
    };

    // STEP 1: claim link (availability check)
    // claim link (availability check) - MUST be NO-AUTH
    const claimLinkContinue = async (e) => {
        e.preventDefault();
        const username = data.username.trim().toLowerCase();

        if (!username) {
            toast.error('Please enter a link name');
            return;
        }

        try {
            await api.post('/claim-link', { username }, { headers: { 'x-no-auth': '1' } });

            localStorage.setItem(CLAIM_KEY, username);
            setData(d => ({ ...d, username }));
            setClaimStep(false);
            setTimeout(() => document.getElementById('name')?.focus(), 0);
        } catch (err) {
            const msg = err?.response?.data?.error || 'Link not available';
            toast.error(msg);
        }
    };



    // STEP 2: register (email+password)
    const registerUser = async (e) => {
        e.preventDefault();

        const username = sanitizeUsername(data.username);
        if (!username) return toast.error('Username is required.');
        if (!Object.values(passwordChecks).every(Boolean)) {
            toast.error('Please meet all password requirements.');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await api.post('/register', {
                name: data.name,
                email: data.email.trim().toLowerCase(),
                username,
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
            toast.error(err?.response?.data?.error || 'Registration failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    // STEP 3: verify email then login
    const verifyEmail = async (e) => {
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

            if (loginRes.data?.error) {
                toast.error(loginRes.data.error);
                return;
            }

            login(loginRes.data.token, loginRes.data.user);

            try { localStorage.removeItem(CLAIM_KEY); } catch { }
            await runPendingActionOrDefault();
        } catch (err) {
            toast.error(err?.response?.data?.error || 'Verification failed');
        } finally {
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

    const goEditSlug = () => {
        setVerificationStep(false);
        setClaimStep(true);
        setTimeout(() => usernameInputRef.current?.focus?.(), 0);
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
                    {/* STEP 3 */}
                    {verificationStep ? (
                        <>
                            <h1 className="kc-title">Verify your email</h1>
                            <p className="kc-subtitle">
                                Enter the 6-digit code sent to <strong>{data.email.trim().toLowerCase()}</strong>
                            </p>

                            <form className="kc-form" onSubmit={verifyEmail}>
                                <div className="kc-field">
                                    <label className="kc-label" htmlFor="verificationCode">Verification code</label>
                                    <input
                                        className="kc-input"
                                        id="verificationCode"
                                        type="text"
                                        placeholder="123456"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        maxLength={6}
                                        autoComplete="one-time-code"
                                        inputMode="numeric"
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
                        /* STEP 1 */
                        <>
                            <h1 className="kc-title">Claim Your Link</h1>
                            <p className="kc-subtitle">
                                This is your unique link. When someone clicks it, they see
                                <br />
                                your digital business card.
                            </p>

                            <form className="kc-form kc-form-claim" onSubmit={claimLinkContinue}>
                                <div className="kc-field">
                                    <label className="kc-label" htmlFor="username">Claim Your Link Name</label>

                                    <div
                                        className="kc-claim"
                                        onClick={() => usernameInputRef.current?.focus?.()}
                                        role="group"
                                        aria-label="Claim your link input"
                                    >
                                        <span className="kc-claim-prefix">{DOMAIN_PREFIX}</span>
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
                        /* STEP 2 */
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

                            <p className="kc-subtitle" style={{ marginTop: -6 }}>
                                Your link:{' '}
                                <strong>{DOMAIN_PREFIX}{sanitizeUsername(data.username)}</strong>{' '}
                                <button type="button" className="kc-link" onClick={goEditSlug} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                                    Edit
                                </button>
                            </p>

                            <form className="kc-form kc-form-register" onSubmit={registerUser}>
                                <div className="kc-field">
                                    <label className="kc-label" htmlFor="name">Full name</label>
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
                                    <label className="kc-label" htmlFor="email">Email</label>
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
                                    <label className="kc-label" htmlFor="password">Password</label>

                                    <div className="kc-password">
                                        <input
                                            className="kc-input kc-input-password"
                                            type={showPassword ? 'text' : 'password'}
                                            id="password"
                                            placeholder="Create a password"
                                            value={data.password}
                                            onChange={(e) => setData({ ...data, password: e.target.value })}
                                            autoComplete="new-password"
                                            onFocus={() => setShowPasswordFeedback(true)}
                                            onBlur={() => setShowPasswordFeedback(false)}
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
                                        <span>Sign in with Google</span>
                                    </button>

                                    <button type="button" className="kc-social-btn" onClick={() => startOAuth('facebook')}>
                                        <span>Sign in with Facebook</span>
                                    </button>

                                    <button type="button" className="kc-social-btn" onClick={() => startOAuth('apple')}>
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
