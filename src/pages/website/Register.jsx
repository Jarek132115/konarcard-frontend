import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../../components/AuthContext';
import backgroundImg from '../../assets/images/background.png';
import greenTick from '../../assets/icons/Green-Tick-Icon.svg';
import redCross from '../../assets/icons/Red-Cross-Icon.svg';

export default function Register() {
    const navigate = useNavigate();
    const location = useLocation();
    const { setUser } = useContext(AuthContext);
    const from = location.state?.from || '/';

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
            console.log('Sending registration request...');
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/register`, {
                name: data.name,
                email: data.email,
                username: data.username.trim().toLowerCase(),
                password: data.password,
                confirmPassword: data.confirmPassword,
            });

            console.log('Registration response received:', res);
            console.log('Response data:', res.data);
            console.log('Response status:', res.status);

            if (res.data.error) {
                toast.error(res.data.error);
                console.log('Backend sent an explicit error:', res.data.error);
            } else {
                toast.success('Verification code sent!');
                setVerificationStep(true);
                setCooldown(30);
                console.log('Frontend logic: Switched to verification step.');
            }
        } catch (err) {
            console.error('Registration request failed (caught by frontend):', err);
            // Check err.response for more details if it's an HTTP error
            if (err.response) {
                console.error('Error response data:', err.response.data);
                console.error('Error response status:', err.response.status);
                toast.error(err.response.data.error || 'Registration failed');
            } else if (err.request) {
                console.error('Error request:', err.request); // The request was made but no response was received
                toast.error('No response from server. Check network.');
            } else {
                console.error('Error message:', err.message); // Something else happened in setting up the request
                toast.error('Registration failed');
            }
        }
    };

    const verifyCode = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/verify-email`, {
                email: data.email,
                code,
            });

            if (res.data.error) {
                toast.error(res.data.error);
            } else {
                toast.success('Email verified! Logging you in...');
                const loginRes = await axios.post('/login', {
                    email: data.email,
                    password: data.password,
                });

                if (loginRes.data.error) {
                    toast.error(loginRes.data.error);
                } else {
                    setUser(loginRes.data);
                    navigate(from);
                }
            }
        } catch (err) {
            toast.error('Verification failed');
        }
    };

    const resendCode = async () => {
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/resend-code`, { email: data.email }); 
            if (res.data.error) {
                toast.error(res.data.error);
            } else {
                toast.success('New verification code sent!');
                setCooldown(30);
            }
        } catch (err) {
            toast.error('Could not resend code');
        }
    };

    return (
        <>
            <Link to="/" className="close-button">×</Link>
            <div className="login-wrapper">
                <div className="login-left">
                    <img src={backgroundImg} alt="Visual" className="login-visual" />
                    <div className="login-quote">
                        <span className="quote-icon">“</span>
                        <p className="quote-text">“This has completely changed the way I find work. Clients love it.”</p>
                        <p className="quote-author">Liam Turner – Electrical Contractor</p>
                    </div>
                </div>

                <div className="login-right">
                    <div className="login-card">
                        <h2 className="login-title">{verificationStep ? 'Verify Your Email' : 'Create Your Account'}</h2>

                        {!verificationStep ? (
                            <form onSubmit={registerUser} className="login-form">
                                <input type="text" placeholder="Name" value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} />
                                <input type="text" placeholder="Username" value={data.username} onChange={(e) => setData({ ...data, username: e.target.value })} />
                                <input type="email" placeholder="Email" value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} />
                                <div className="password-wrapper">
                                    <input type={showPassword ? 'text' : 'password'} placeholder="Password" value={data.password} onChange={(e) => setData({ ...data, password: e.target.value })} />
                                    <button type="button" onClick={togglePassword}>{showPassword ? 'Hide' : 'Show'}</button>
                                </div>
                                <div className="password-wrapper">
                                    <input type={showConfirm ? 'text' : 'password'} placeholder="Confirm Password" value={data.confirmPassword} onChange={(e) => setData({ ...data, confirmPassword: e.target.value })} />
                                    <button type="button" onClick={toggleConfirm}>{showConfirm ? 'Hide' : 'Show'}</button>
                                </div>

                                <div className="password-feedback">
                                    <p className={passwordChecks.minLength ? 'valid' : 'invalid'}>
                                        <img src={passwordChecks.minLength ? greenTick : redCross} alt="" className="feedback-icon" /> Minimum 8 characters
                                    </p>
                                    <p className={passwordChecks.hasUppercase ? 'valid' : 'invalid'}>
                                        <img src={passwordChecks.hasUppercase ? greenTick : redCross} alt="" className="feedback-icon" /> One uppercase letter
                                    </p>
                                    <p className={passwordChecks.hasNumber ? 'valid' : 'invalid'}>
                                        <img src={passwordChecks.hasNumber ? greenTick : redCross} alt="" className="feedback-icon" /> One number
                                    </p>
                                    <p className={passwordChecks.passwordsMatch ? 'valid' : 'invalid'}>
                                        <img src={passwordChecks.passwordsMatch ? greenTick : redCross} alt="" className="feedback-icon" /> Passwords match
                                    </p>
                                </div>

                                <label className="terms-label">
                                    <input type="checkbox" className="terms-checkbox" required />
                                    <span className="desktop-body-xs">
                                        I agree to the <a href="/policies">Terms of Service</a> & <a href="/policies">Privacy Policy</a>
                                    </span>
                                </label>

                                <button type="submit" className="primary-button">Register</button>
                            </form>
                        ) : (
                            <form onSubmit={verifyCode} className="login-form">
                                <p>Enter the 6-digit code sent to <strong>{data.email}</strong></p>
                                <input type="text" placeholder="Enter verification code" value={code} onChange={(e) => setCode(e.target.value)} />
                                <button type="submit" className="primary-button">Verify Email</button>
                                <button type="button" className="secondary-button" onClick={resendCode} disabled={cooldown > 0} style={{ marginTop: '1rem' }}>
                                    {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}
                                </button>
                            </form>
                        )}

                        {!verificationStep && (
                            <p className="login-alt-text">
                                Already have an account? <Link to="/login" state={{ from }}>Login</Link>
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}