import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../../components/AuthContext';
import backgroundImg from '../../assets/images/background.png';
import api from '../../services/api';

export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from || '/myprofile';
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
                // FIX: Only pass the token to AuthContext.login
                login(res.data.token);
                navigate(from);
            }
        } catch (err) {
            console.error('Login failed:', err.message || err);
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
                    // FIX: Only pass the token to AuthContext.login
                    login(loginRes.data.token);
                    navigate(from);
                }
            }
        } catch (err) {
            console.error('Verification failed:', err.message || err);
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
            console.error('Could not resend code:', err.message || err);
            toast.error(err.message || 'Could not resend code');
        }
    };

    const sendResetLink = async () => {
        try {
            const res = await api.post('/forgot-password', { email: emailForReset });
            if (res.data.error) {
                toast.error(res.data.error);
            } else {
                toast.success('Reset link sent to your email');
            }
        } catch (err) {
            console.error('Failed to send reset link:', err.message || err);
            toast.error(err.message || 'Failed to send reset link');
        }
    };

    return (
        <div className="login-wrapper">
            <div className="close-button" onClick={() => navigate('/')}>×</div>
            <div className="login-left">
                <img src={backgroundImg} alt="Login visual" className="login-visual" />
            </div>

            <div className="login-right">
                <div className="login-card">
                    <h2 className="login-title">
                        {verificationStep
                            ? 'Verify Your Email'
                            : forgotPasswordStep
                                ? 'Reset Password'
                                : 'Welcome back!'}
                    </h2>

                    {forgotPasswordStep ? (
                        <>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={emailForReset}
                                onChange={(e) => setEmailForReset(e.target.value)}
                            />
                            <button onClick={sendResetLink} className="primary-button">
                                Send Reset Link
                            </button>
                            <button onClick={() => setForgotPasswordStep(false)} className="secondary-button">
                                Back to Login
                            </button>
                        </>
                    ) : !verificationStep ? (
                        <form className="login-form" onSubmit={loginUser}>
                            <input
                                type="email"
                                placeholder="Email"
                                value={data.email}
                                onChange={(e) => setData({ ...data, email: e.target.value })}
                            />
                            <div className="password-wrapper">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Password"
                                    value={data.password}
                                    onChange={(e) => setData({ ...data, password: e.target.value })}
                                />
                                <button type="button" onClick={togglePassword}>
                                    {showPassword ? 'Hide' : 'Show'}
                                </button>
                            </div>
                            <button type="submit" className="primary-button">Sign In</button>
                            <button type="button" className="link-button" onClick={() => setForgotPasswordStep(true)}>
                                Forgot Password?
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={verifyCode} className="login-form">
                            <p>Enter the 6-digit code sent to <strong>{data.email}</strong></p>
                            <input
                                type="text"
                                placeholder="Enter verification code"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                maxLength={6}
                            />
                            <button type="submit" className="primary-button">Verify Email</button>
                            <button
                                type="button"
                                className="secondary-button"
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