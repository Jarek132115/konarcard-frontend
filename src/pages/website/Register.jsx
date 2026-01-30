// frontend/src/pages/website/Register.jsx
import React, { useState, useEffect, useRef, useContext, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../../components/AuthContext';
import api from '../../services/api';
import '../../styling/login.css';

const PENDING_CLAIM_KEY = 'pendingClaimUsername';
const OAUTH_SOURCE_KEY = 'oauthSource';

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

    const [forceClaimStep, setForceClaimStep] = useState(false);
    const [verificationStep, setVerificationStep] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const [code, setCode] = useState('');
    const [cooldown, setCooldown] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);

    useEffect(() => {
        try {
            const saved = localStorage.getItem(PENDING_CLAIM_KEY);
            const stateSlug = location.state?.claimedUsername;
            const finalSlug = (saved || stateSlug || '').trim().toLowerCase();

            if (finalSlug) {
                setData((d) => ({ ...d, username: finalSlug }));
                setForceClaimStep(false);
            }
        } catch { }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const hasClaimedUsername = useMemo(() => Boolean((data.username || '').trim()), [data.username]);
    const shouldShowClaimStep = !verificationStep && (forceClaimStep || !hasClaimedUsername);

    useEffect(() => {
        if (cooldown <= 0) return;
        const t = setTimeout(() => setCooldown((s) => s - 1), 1000);
        return () => clearTimeout(t);
    }, [cooldown]);

    const claimLinkContinue = async (e) => {
        e.preventDefault();
        const username = (data.username || '').trim().toLowerCase();

        if (!username) return toast.error('Please enter a link name');

        try {
            // availability check (not logged in) is fine here
            const res = await api.post('/claim-link', { username });

            if (res?.data?.error) {
                toast.error(res.data.error);
                return;
            }

            localStorage.setItem(PENDING_CLAIM_KEY, username);
            setData((d) => ({ ...d, username }));
            setForceClaimStep(false);

            setTimeout(() => document.getElementById('name')?.focus(), 0);
        } catch (err) {
            toast.error(err?.response?.data?.error || 'Link not available');
        }
    };

    const registerUser = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const res = await api.post('/register', {
                name: data.name,
                email: data.email.toLowerCase(),
                username: (data.username || '').trim().toLowerCase(),
                password: data.password,
                confirmPassword: data.password,
            });

            if (res.data?.error) toast.error(res.data.error);
            else {
                toast.success('Verification code sent');
                setVerificationStep(true);
                setCooldown(30);
            }
        } catch {
            toast.error('Registration failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const verifyCode = async (e) => {
        e.preventDefault();
        setIsVerifying(true);

        try {
            const res = await api.post('/verify-email', {
                email: data.email.toLowerCase(),
                code,
            });

            if (res.data?.error) {
                toast.error(res.data.error);
                return;
            }

            const loginRes = await api.post('/login', {
                email: data.email.toLowerCase(),
                password: data.password,
            });

            login(loginRes.data.token, loginRes.data.user);

            // clear after full success
            localStorage.removeItem(PENDING_CLAIM_KEY);
            localStorage.removeItem(OAUTH_SOURCE_KEY);

            navigate('/myprofile', { replace: true });
        } catch {
            toast.error('Verification failed');
        } finally {
            setIsVerifying(false);
        }
    };

    const startOAuth = (provider) => {
        try {
            localStorage.setItem(OAUTH_SOURCE_KEY, 'register');
            const u = (data.username || '').trim().toLowerCase();
            if (u) localStorage.setItem(PENDING_CLAIM_KEY, u);
        } catch { }

        const base = import.meta.env.VITE_API_URL;
        window.location.href = `${base}/auth/${provider}`;
    };

    return (
        <div className="kc-auth-page">
            <main className="kc-auth-main">
                <div className="kc-auth-inner">
                    {verificationStep ? (
                        <>
                            <h1 className="kc-title">Verify your email</h1>
                            <form onSubmit={verifyCode} className="kc-form">
                                <input
                                    className="kc-input"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    maxLength={6}
                                    required
                                />
                                <button className="kc-btn kc-btn-primary" disabled={isVerifying}>
                                    Verify
                                </button>
                            </form>
                        </>
                    ) : shouldShowClaimStep ? (
                        <>
                            <h1 className="kc-title">Claim Your Link</h1>
                            <form onSubmit={claimLinkContinue} className="kc-form">
                                <input
                                    ref={usernameInputRef}
                                    className="kc-input"
                                    placeholder="yourname"
                                    value={data.username}
                                    onChange={(e) => setData({ ...data, username: e.target.value })}
                                    required
                                />
                                <button className="kc-btn kc-btn-primary">Claim Link</button>
                            </form>
                        </>
                    ) : (
                        <>
                            <h1 className="kc-title">Save your card</h1>
                            <p className="kc-subtitle">
                                Your link: <strong>konarcard.com/u/{data.username}</strong>{' '}
                                <button
                                    type="button"
                                    className="kc-link"
                                    onClick={() => {
                                        setForceClaimStep(true);
                                        setTimeout(() => usernameInputRef.current?.focus?.(), 0);
                                    }}
                                >
                                    Edit
                                </button>
                            </p>

                            <form onSubmit={registerUser} className="kc-form">
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
                                    placeholder="Email"
                                    value={data.email}
                                    onChange={(e) => setData({ ...data, email: e.target.value })}
                                    required
                                />
                                <input
                                    className="kc-input"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Password"
                                    value={data.password}
                                    onChange={(e) => setData({ ...data, password: e.target.value })}
                                    required
                                />
                                <button className="kc-btn kc-btn-primary" disabled={isSubmitting}>
                                    Save my card
                                </button>
                            </form>

                            <div className="kc-divider">
                                <span>or</span>
                            </div>

                            <button className="kc-btn" onClick={() => startOAuth('google')}>
                                Continue with Google
                            </button>
                            <button className="kc-btn" onClick={() => startOAuth('facebook')}>
                                Continue with Facebook
                            </button>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
