import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../../components/AuthContext';
import backgroundImg from '../../assets/images/background.png';
import api from '../../services/api';

export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useContext(AuthContext);

    const [data, setData] = useState({ email: '', password: '' });
    const [code, setCode] = useState('');
    const [verificationStep, setVerificationStep] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const [showPassword, setShowPassword] = useState(false);
    const [forgotPasswordStep, setForgotPasswordStep] = useState(false);
    const [emailForReset, setEmailForReset] = useState('');

    useEffect(() => {
        let timer;
        if (cooldown > 0) {
            timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [cooldown]);

    const togglePassword = () => setShowPassword(!showPassword);

    const loginUser = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/login', data);

            if (res.data.error) {
                if (res.data.error.includes('verify your email')) {
                    toast.error('Email not verified. New code sent!');
                    setVerificationStep(true);
                    setCooldown(30);
                } else {
                    toast.error(res.data.error);
                }
            } else {
                toast.success('Login successful!');
                login(res.data.token, res.data.user);
                // Explicitly navigate to /myprofile after successful login
                navigate('/myprofile');
            }
        } catch (err) {
            toast.error(err.message || 'Login failed');
        }
    };

    const verifyCode = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/verify-email', { email: data.email, code });

            if (res.data.error) {
                toast.error(res.data.error);
            } else {
                toast.success('Email verified! Logging you in...');
                const loginRes = await api.post('/login', data);

                if (loginRes.data.error) {
                    toast.error(loginRes.data.error);
                } else {
                    login(loginRes.data.token, loginRes.data.user);
                    // Explicitly navigate to /myprofile after successful verification
                    navigate('/myprofile');
                }
            }
        } catch (err) {
            toast.error(err.message || 'Verification failed');
        }
    };

    const resendCode = async () => {
        try {
            const res = await api.post('/resend-code', { email: data.email });
            if (res.data.error) {
                toast.error(res.data.error);
            } else {
                toast.success('New code sent!');
                setCooldown(30);
            }
        } catch (err) {
            toast.error(err.message || 'Could not resend code');
        }
    };

    const sendResetLink = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/forgot-password', { email: emailForReset });
            if (res.data.error) {
                toast.error(res.data.error);
            } else {
                toast.success('Reset link sent to your email');
            }
        } catch (err) {
            toast.error(err.message || 'Failed to send reset link');
        }
    };

    return (
        <div className="login-wrapper">
            <div className="close-button" onClick={() => navigate('/')}>×</div>
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
                    <h2 className={`login-title ${!verificationStep && !forgotPasswordStep ? 'desktop-h4' : ''}`}>
                        {verificationStep
                            ? 'Verify Your Email'
                            : forgotPasswordStep
                                ? 'Reset Password'
                                : 'Welcome back!'}
                    </h2>

                    {!verificationStep && !forgotPasswordStep && (
                        <p className="desktop-body-text text-center" style={{ marginBottom: '24px' }}>
                            Please enter your details to sign in
                        </p>
                    )}

                    {forgotPasswordStep ? (
                        <form onSubmit={sendResetLink} className="login-form">
                            <label htmlFor="resetEmail" className="form-label">Email</label>
                            <input
                                type="email"
                                id="resetEmail"
                                name="resetEmail"
                                placeholder="Enter your email"
                                value={emailForReset}
                                onChange={(e) => setEmailForReset(e.target.value)}
                                className="standard-input"
                                autoComplete="off"
                            />
                            <button type="submit" className="primary-button send-reset-link-button">
                                Send Reset Link
                            </button>
                            <button type="button" onClick={() => setForgotPasswordStep(false)} className="secondary-button back-to-login-button">
                                Back to Login
                            </button>
                        </form>
                    ) : !verificationStep ? (
                        <form className="login-form" onSubmit={loginUser}>
                            <label htmlFor="loginEmail" className="form-label">Email</label>
                            <input
                                type="email"
                                id="loginEmail"
                                name="loginEmail"
                                placeholder="Email"
                                value={data.email}
                                onChange={(e) => setData({ ...data, email: e.target.value })}
                                className="standard-input"
                                autoComplete="off"
                            />
                            <label htmlFor="loginPassword" className="form-label">Password</label>
                            <div className="password-wrapper">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="loginPassword"
                                    name="loginPassword"
                                    placeholder="Password"
                                    value={data.password}
                                    onChange={(e) => setData({ ...data, password: e.target.value })}
                                    autoComplete="off"
                                />
                                <button type="button" onClick={togglePassword}>
                                    {showPassword ? 'Hide' : 'Show'}
                                </button>
                            </div>
                            <button type="submit" className="primary-button sign-in-button">Sign In</button>
                            <button type="button" className="link-button" onClick={() => setForgotPasswordStep(true)}>
                                Forgot Password?
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={verifyCode} className="login-form">
                            <p className="verification-instruction">Enter the 6-digit code sent to <strong>{data.email}</strong></p>
                            <label htmlFor="verificationCode" className="form-label">Verification Code</label>
                            <input
                                type="text"
                                id="verificationCode"
                                name="verificationCode"
                                placeholder="Enter verification code"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="standard-input"
                                maxLength={6}
                                autoComplete="off"
                            />
                            <button type="submit" className="primary-button verify-email-button">Verify Email</button>
                            <button
                                type="button"
                                className="secondary-button resend-code-button"
                                onClick={resendCode}
                                disabled={cooldown > 0}
                                style={{ marginTop: '1rem' }}
                            >
                                {cooldown > 0 ? `Resend available in ${cooldown}s` : 'Resend Code'}
                            </button>
                        </form>
                    )}

                    {!verificationStep && !forgotPasswordStep && (
                        <p className="login-alt-text">
                            Don’t have an account? <Link to="/register">Create one</Link>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}