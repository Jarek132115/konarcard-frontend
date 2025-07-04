import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import backgroundImg from '../../assets/images/background.png';
import greenTick from '../../assets/icons/Green-Tick-Icon.svg';
import redCross from '../../assets/icons/Red-Cross-Icon.svg';

export default function ResetPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [step, setStep] = useState(1);
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    // New state to control password feedback visibility, initialized to false
    const [showPasswordFeedback, setShowPasswordFeedback] = useState(false);
    // Ref to manage blur timeout for password fields
    const blurTimeoutRef = React.useRef(null);

    const togglePassword = () => setShowPassword(!showPassword);
    const toggleConfirm = () => setShowConfirm(!showConfirm);

    const passwordChecks = {
        minLength: password.length >= 8,
        hasUppercase: /[A-Z]/.test(password),
        hasNumber: /\d/.test(password),
        passwordsMatch: password === confirmPassword && confirmPassword.length > 0,
    };

    // Handler for when password fields gain focus
    const handlePasswordFocus = () => {
        // Clear any pending blur timeout if we are focusing again
        if (blurTimeoutRef.current) {
            clearTimeout(blurTimeoutRef.current);
        }
        setShowPasswordFeedback(true);
    };

    // Handler for when password fields lose focus
    const handlePasswordBlur = () => {
        // Set a timeout to hide feedback, allowing a brief moment to switch between password fields
        blurTimeoutRef.current = setTimeout(() => {
            setShowPasswordFeedback(false);
        }, 100); // 100ms delay
    };

    const requestReset = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('/forgot-password', { email });
            if (res.data.error) {
                toast.error(res.data.error);
            } else {
                toast.success('Password reset code sent!'); // Changed message for clarity
                setStep(2);
            }
        } catch (err) {
            toast.error('Something went wrong. Please try again.');
        }
    };

    const resetPassword = async (e) => {
        e.preventDefault();
        if (!Object.values(passwordChecks).every(Boolean)) {
            toast.error('Please meet all password requirements.');
            return;
        }

        try {
            const res = await axios.post('/reset-password', {
                email,
                code,
                newPassword: password,
            });

            if (res.data.error) {
                toast.error(res.data.error);
            } else {
                toast.success('Password reset successful! You can now log in.');
                navigate('/login');
            }
        } catch (err) {
            toast.error('Could not reset password. Please check the code and try again.');
        }
    };

    return (
        <div className="login-wrapper">
            {/* Using a div with onClick for the close button to match Register/Login consistent navigation */}
            <div className="close-button" onClick={() => navigate('/')}>×</div>
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
                    <h2 className="login-title">{step === 1 ? 'Forgot Password' : 'Reset Your Password'}</h2>

                    {step === 1 ? (
                        <form onSubmit={requestReset} className="login-form">
                            <label htmlFor="email" className="form-label">Email</label>
                            <input
                                type="email"
                                id="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="standard-input" // Added standard-input class
                                autoComplete="email" // Added for better UX
                            />
                            <button type="submit" className="primary-button send-reset-link-button">Send Reset Code</button>
                            <button type="button" className="link-button back-to-login-button" onClick={() => navigate('/login')}>Back to Login</button>
                        </form>
                    ) : (
                        <form onSubmit={resetPassword} className="login-form">
                            <label htmlFor="code" className="form-label">Verification Code</label>
                            <input
                                type="text"
                                id="code"
                                placeholder="Enter the code sent to your email"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                required
                                className="standard-input" // Added standard-input class
                                autoComplete="off" // No autocomplete for verification code
                            />

                            <label htmlFor="newPassword" className="form-label">New Password</label>
                            <div className="password-wrapper">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="newPassword"
                                    placeholder="New Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    onFocus={handlePasswordFocus} // Added onFocus
                                    onBlur={handlePasswordBlur}   // Added onBlur
                                    autoComplete="new-password" // Added for better UX
                                />
                                <button type="button" onClick={togglePassword}>
                                    {showPassword ? 'Hide' : 'Show'}
                                </button>
                            </div>

                            <label htmlFor="confirmNewPassword" className="form-label">Confirm New Password</label>
                            <div className="password-wrapper">
                                <input
                                    type={showConfirm ? 'text' : 'password'}
                                    id="confirmNewPassword"
                                    placeholder="Confirm New Password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    onFocus={handlePasswordFocus} // Added onFocus
                                    onBlur={handlePasswordBlur}   // Added onBlur
                                    autoComplete="new-password" // Added for better UX
                                />
                                <button type="button" onClick={toggleConfirm}>
                                    {showConfirm ? 'Hide' : 'Show'}
                                </button>
                            </div>

                            {showPasswordFeedback && ( // Conditionally render password feedback
                                <div className="password-feedback">
                                    <p className={passwordChecks.minLength ? 'valid' : 'invalid'}>
                                        <img src={passwordChecks.minLength ? greenTick : redCross} alt="" className="feedback-icon" />
                                        Minimum 8 characters
                                    </p>
                                    <p className={passwordChecks.hasUppercase ? 'valid' : 'invalid'}>
                                        <img src={passwordChecks.hasUppercase ? greenTick : redCross} alt="" className="feedback-icon" />
                                        One uppercase letter
                                    </p>
                                    <p className={passwordChecks.hasNumber ? 'valid' : 'invalid'}>
                                        <img src={passwordChecks.hasNumber ? greenTick : redCross} alt="" className="feedback-icon" />
                                        One number
                                    </p>
                                    <p className={passwordChecks.passwordsMatch ? 'valid' : 'invalid'}>
                                        <img src={passwordChecks.passwordsMatch ? greenTick : redCross} alt="" className="feedback-icon" />
                                        Passwords match
                                    </p>
                                </div>
                            )}

                            <button type="submit" className="primary-button verify-email-button">Reset Password</button>
                            <button type="button" className="link-button back-to-login-button" onClick={() => navigate('/login')}>Back to Login</button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}