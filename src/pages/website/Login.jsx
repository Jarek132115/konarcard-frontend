// frontend/src/pages/auth/Login.jsx
import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../../components/AuthContext';
import api from '../../services/api';
import '../../styling/login.css';

const POST_AUTH_KEY = 'postAuthAction';
const REMEMBER_KEY = 'rememberLogin';
const REMEMBERED_EMAIL_KEY = 'rememberedEmail';

// Keep this in sync with Cloud Run ADMIN_EMAILS for UI-side convenience
const ADMIN_EMAILS_UI = ['supportteam@konarcard.com'];

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

    
    const isAdminEmail = (email) =>
        ADMIN_EMAILS_UI.includes((email || '').toLowerCase());

    // Social auth redirect
    // inside Login.jsx
    const startOAuth = (provider) => {
        try {
            localStorage.setItem('oauthSource', 'login');
            localStorage.removeItem('pendingClaimUsername');
        } catch { }
        const base = import.meta.env.VITE_API_URL;
        window.location.href = `${base}/auth/${provider}`;
    };


    // Restore remembered email
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
            try {
                localStorage.setItem(POST_AUTH_KEY, JSON.stringify(action));
            } catch { }
        }
    }, [location.state]);

    useEffect(() => {
        if (cooldown <= 0) return;
        const t = setTimeout(() => setCooldown((s) => s - 1), 1000);
        return () => clearTimeout(t);
    }, [cooldown]);

    const runPendingActionOrDefault = async () => {
        let action = null;
        try {
            const saved = localStorage.getItem(POST_AUTH_KEY);
            if (saved) action = JSON.parse(saved);
        } catch { }
        try {
            localStorage.removeItem(POST_AUTH_KEY);
        } catch { }

        if (!action) {
            navigate('/myprofile');
            return;
        }

        if (action.type === 'subscribe') {
            try {
                const res = await api.post('/subscribe', {
                    returnUrl: window.location.origin + '/SuccessSubscription',
                });
                if (res?.data?.url) {
                    window.location.href = res.data.url;
                    return;
                }
                toast.error('Could not start subscription.');
                navigate('/subscription');
            } catch {
                toast.error('Subscription failed.');
                navigate('/subscription');
            }
            return;
        }

        if (action.type === 'buy_card') {
            navigate('/productandplan/konarcard', {
                state: {
                    triggerCheckout: true,
                    quantity: Number(action?.payload?.quantity) || 1,
                },
                replace: true,
            });
            return;
        }

        navigate('/myprofile');
    };

    const loginUser = async (e) => {
        e.preventDefault();

        try {
            if (rememberMe) {
                localStorage.setItem(REMEMBER_KEY, 'true');
                localStorage.setItem(
                    REMEMBERED_EMAIL_KEY,
                    data.email.trim().toLowerCase()
                );
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
                if (res.data.resend) {
                    toast.error('Email not verified. Code sent.');
                    setVerificationStep(true);
                    setCooldown(30);
                } else {
                    toast.error(res.data.error);
                }
            } else {
                toast.success('Login successful!');
                login(res.data.token, res.data.user);

                const email = res.data.user?.email || data.email;
                if (isAdminEmail(email)) {
                    navigate('/admin', { replace: true });
                } else {
                    await runPendingActionOrDefault();
                }
            }
        } catch {
            toast.error('Login failed.');
        } finally {
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
            } else {
                toast.success('Email verified!');
                const loginRes = await api.post('/login', {
                    email: data.email.trim().toLowerCase(),
                    password: data.password,
                });
                login(loginRes.data.token, loginRes.data.user);
                await runPendingActionOrDefault();
            }
        } catch {
            toast.error('Verification failed.');
        } finally {
            setIsVerifying(false);
        }
    };

    const resendCode = async () => {
        try {
            await api.post('/resend-code', {
                email: data.email.trim().toLowerCase(),
            });
            toast.success('New code sent!');
            setCooldown(30);
        } catch {
            toast.error('Could not resend code.');
        }
    };

    const sendResetLink = async (e) => {
        e.preventDefault();
        setIsSendingReset(true);
        try {
            await api.post('/forgot-password', {
                email: emailForReset.trim().toLowerCase(),
            });
            toast.success('Reset link sent!');
        } catch {
            toast.error('Failed to send reset link.');
        } finally {
            setIsSendingReset(false);
        }
    };

    return (
        <div className="kc-auth-page">
            <main className="kc-auth-main">
                <div className="kc-auth-inner">
                    {forgotPasswordStep ? (
                        <form className="kc-form" onSubmit={sendResetLink}>
                            <h1 className="kc-title">Reset password</h1>
                            <input
                                className="kc-input"
                                type="email"
                                placeholder="Email"
                                value={emailForReset}
                                onChange={(e) => setEmailForReset(e.target.value)}
                                required
                            />
                            <button className="kc-btn kc-btn-primary">
                                {isSendingReset ? 'Sending…' : 'Send reset link'}
                            </button>
                            <button
                                type="button"
                                className="kc-btn kc-btn-secondary"
                                onClick={() => setForgotPasswordStep(false)}
                            >
                                Back
                            </button>
                        </form>
                    ) : verificationStep ? (
                        <form className="kc-form" onSubmit={verifyCode}>
                            <h1 className="kc-title">Verify email</h1>
                            <input
                                className="kc-input"
                                type="text"
                                placeholder="Verification code"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                maxLength={6}
                                required
                            />
                            <button className="kc-btn kc-btn-primary">
                                {isVerifying ? 'Verifying…' : 'Verify'}
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
                    ) : (
                        <>
                            <form className="kc-form" onSubmit={loginUser}>
                                <h1 className="kc-title">Welcome back</h1>
                                <input
                                    className="kc-input"
                                    type="email"
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

                                <label className="kc-remember">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                    />
                                    Remember me
                                </label>

                                <button className="kc-btn kc-btn-primary">
                                    {isSubmitting ? 'Signing in…' : 'Sign in'}
                                </button>
                            </form>

                            <div className="kc-divider"><span>or</span></div>

                            <div className="kc-social">
                                <button onClick={() => startOAuth('google')}>Sign in with Google</button>
                                <button onClick={() => startOAuth('facebook')}>Sign in with Facebook</button>
                                <button onClick={() => startOAuth('apple')}>Sign in with Apple</button>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
