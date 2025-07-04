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
    // New state to control password feedback visibility
    const [showPasswordFeedback, setShowPasswordFeedback] = useState(false);
    // Ref to manage blur timeout
    const blurTimeoutRef = React.useRef(null);

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
        // Clear any pending blur timeout if we are focusing again
        if (blurTimeoutRef.current) {
            clearTimeout(blurTimeoutRef.current);
        }
        setShowPasswordFeedback(true);
    };

    const handlePasswordBlur = () => {
        // Set a timeout to hide feedback, allowing a brief moment to switch between password fields
        blurTimeoutRef.current = setTimeout(() => {
            setShowPasswordFeedback(false);
        }, 100); // 100ms delay
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
            const res = await axios.post('/register', {
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
            const res = await axios.post('/verify-email', {
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
            const res = await axios.post('/resend-code', { email: data.email });
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
                                <label htmlFor="name" className="form-label">Name</label>
                                <input type="text" id="name" name="name" placeholder="Name" value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} className="standard-input" autoComplete="off" />

                                {/* Updated Username Label and Input Structure */}
                                <label htmlFor="username" className="form-label">
                                    Username <span className="text-sm text-gray-500">(this username cannot be changed)</span>
                                </label>
                                <div className="username-input-wrapper">
                                    <span className="url-prefix">www.konarcard.com/u/</span>
                                    <input
                                        type="text"
                                        id="username"
                                        name="username"
                                        placeholder="username" // Changed placeholder for clarity
                                        value={data.username}
                                        onChange={(e) => setData({ ...data, username: e.target.value })}
                                        autoComplete="off"
                                    // Removed standard-input class as styling is now on the wrapper and internal input
                                    />
                                </div>

                                <label htmlFor="email" className="form-label">Email</label>
                                <input type="email" id="email" name="email" placeholder="Email" value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} className="standard-input" autoComplete="off" />

                                <label htmlFor="password" className="form-label">Password</label>
                                <div className="password-wrapper">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        name="password"
                                        placeholder="Password"
                                        value={data.password}
                                        onChange={(e) => setData({ ...data, password: e.target.value })}
                                        autoComplete="new-password"
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
                                )}

                                <label className="terms-label">
                                    <input type="checkbox" className="terms-checkbox konar-checkbox" required />
                                    <span className="desktop-body-xs">
                                        I agree to the <a href="/policies">Terms of Service</a> & <a href="/policies">Privacy Policy</a>
                                    </span>
                                </label>

                                <button type="submit" className="primary-button">Register</button>
                            </form>
                        ) : (
                            <form onSubmit={verifyCode} className="login-form">
                                <p className="verification-instruction">Enter the 6-digit code sent to <strong>{data.email}</strong></p>
                                <label htmlFor="verificationCode" className="form-label">Verification Code</label>
                                <input type="text" id="verificationCode" name="verificationCode" placeholder="Enter verification code" value={code} onChange={(e) => setCode(e.target.value)} className="standard-input" autoComplete="off" />
                                <button type="submit" className="primary-button verify-email-button">Verify Email</button>
                                <button type="button" className="secondary-button resend-code-button" onClick={resendCode} disabled={cooldown > 0} style={{ marginTop: '1rem' }}>
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