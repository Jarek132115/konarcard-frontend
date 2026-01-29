// frontend/src/pages/website/Register.jsx
import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../../components/AuthContext';
import api from '../../services/api';
import '../../styling/login.css';

const POST_AUTH_KEY = 'postAuthAction';
const CLAIM_KEY = 'pendingClaimSlug';

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

    const [claimStep, setClaimStep] = useState(true);
    const [verificationStep, setVerificationStep] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const [code, setCode] = useState('');
    const [cooldown, setCooldown] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);

    // restore claimed slug (important for OAuth)
    useEffect(() => {
        const savedSlug = localStorage.getItem(CLAIM_KEY);
        if (savedSlug) {
            setData(d => ({ ...d, username: savedSlug }));
            setClaimStep(false);
        }
    }, []);

    // claim link (availability check)
    const claimLinkContinue = async (e) => {
        e.preventDefault();
        const username = data.username.trim().toLowerCase();

        if (!username) {
            toast.error('Please enter a link name');
            return;
        }

        try {
            await api.post('/claim-link', { username });

            localStorage.setItem(CLAIM_KEY, username);
            setData(d => ({ ...d, username }));
            setClaimStep(false);
            setTimeout(() => document.getElementById('name')?.focus(), 0);
        } catch (err) {
            const msg = err?.response?.data?.error || 'Link not available';
            toast.error(msg);
        }
    };

    // register (email + password)
    const registerUser = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const res = await api.post('/register', {
                name: data.name,
                email: data.email.toLowerCase(),
                username: data.username,
                password: data.password,
                confirmPassword: data.password,
            });

            if (res.data?.error) {
                toast.error(res.data.error);
            } else {
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

    // verify email
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
            } else {
                const loginRes = await api.post('/login', {
                    email: data.email.toLowerCase(),
                    password: data.password,
                });

                login(loginRes.data.token, loginRes.data.user);
                localStorage.removeItem(CLAIM_KEY);
                navigate('/myprofile');
            }
        } catch {
            toast.error('Verification failed');
        } finally {
            setIsVerifying(false);
        }
    };

    // OAuth
    const startOAuth = (provider) => {
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
                                    onChange={e => setCode(e.target.value)}
                                    maxLength={6}
                                    required
                                />
                                <button className="kc-btn kc-btn-primary" disabled={isVerifying}>
                                    Verify
                                </button>
                            </form>
                        </>
                    ) : claimStep ? (
                        <>
                            <h1 className="kc-title">Claim Your Link</h1>
                            <form onSubmit={claimLinkContinue} className="kc-form">
                                <input
                                    ref={usernameInputRef}
                                    className="kc-input"
                                    placeholder="yourname"
                                    value={data.username}
                                    onChange={e => setData({ ...data, username: e.target.value })}
                                    required
                                />
                                <button className="kc-btn kc-btn-primary">Claim Link</button>
                            </form>
                        </>
                    ) : (
                        <>
                            <h1 className="kc-title">Save your card</h1>
                            <p className="kc-subtitle">
                                Your link: <strong>konarcard.com/u/{data.username}</strong>
                                {' '}
                                <button
                                    type="button"
                                    className="kc-link"
                                    onClick={() => setClaimStep(true)}
                                >
                                    Edit
                                </button>
                            </p>

                            <form onSubmit={registerUser} className="kc-form">
                                <input
                                    className="kc-input"
                                    placeholder="Full name"
                                    value={data.name}
                                    onChange={e => setData({ ...data, name: e.target.value })}
                                    required
                                />
                                <input
                                    className="kc-input"
                                    placeholder="Email"
                                    value={data.email}
                                    onChange={e => setData({ ...data, email: e.target.value })}
                                    required
                                />
                                <input
                                    className="kc-input"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Password"
                                    value={data.password}
                                    onChange={e => setData({ ...data, password: e.target.value })}
                                    required
                                />
                                <button className="kc-btn kc-btn-primary" disabled={isSubmitting}>
                                    Save my card
                                </button>
                            </form>

                            <div className="kc-divider"><span>or</span></div>

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
