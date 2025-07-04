import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; // Import useParams
import axios from 'axios'; // Assuming 'api' is configured to be axios instance
import { toast } from 'react-hot-toast';
import backgroundImg from '../../assets/images/background.png';
import greenTick from '../../assets/icons/Green-Tick-Icon.svg';
import redCross from '../../assets/icons/Red-Cross-Icon.svg';

export default function ResetPassword() {
    const navigate = useNavigate();
    const { token } = useParams(); // Extract token from URL
    // Remove email and code states as they are not directly used when arriving via reset link
    // const [email, setEmail] = useState('');
    // const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showPasswordFeedback, setShowPasswordFeedback] = useState(false);
    const blurTimeoutRef = React.useRef(null);

    // No cooldown needed here as it's for verification code resend, not password reset
    // useEffect(() => {
    //     let timer;
    //     if (cooldown > 0) {
    //         timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    //     }
    //     return () => clearTimeout(timer);
    // }, [cooldown]);

    const togglePassword = () => setShowPassword(!showPassword);
    const toggleConfirm = () => setShowConfirm(!showConfirm);

    const passwordChecks = {
        minLength: password.length >= 8,
        hasUppercase: /[A-Z]/.test(password),
        hasNumber: /\d/.test(password),
        passwordsMatch: password === confirmPassword && confirmPassword.length > 0,
    };

    const handlePasswordFocus = () => {
        if (blurTimeoutRef.current) {
            clearTimeout(blurTimeoutRef.current);
        }
        setShowPasswordFeedback(true);
    };

    const handlePasswordBlur = () => {
        blurTimeoutRef.current = setTimeout(() => {
            setShowPasswordFeedback(false);
        }, 100);
    };

    // This function is no longer needed in this component, as the user arrives directly with a token
    // const requestReset = async (e) => { /* ... */ };

    const resetPassword = async (e) => {
        e.preventDefault();
        if (!Object.values(passwordChecks).every(Boolean)) {
            toast.error('Please meet all password requirements.');
            return;
        }

        if (!token) { // Ensure token exists from URL
            toast.error('Invalid reset link. Token missing.');
            return;
        }

        try {
            // Send the token from URL params and newPassword in the body
            const res = await axios.post(`/reset-password/${token}`, {
                password: password, // Changed from newPassword to password to match backend
            });

            if (res.data.error) {
                toast.error(res.data.error);
            } else {
                toast.success('Password reset successful! You can now log in.');
                navigate('/login');
            }
        } catch (err) {
            console.error('Could not reset password:', err.response?.data?.error || err.message || err);
            toast.error(err.response?.data?.error || 'Could not reset password. Please check the link and try again.');
        }
    };

    // Effect to check for token on component mount
    useEffect(() => {
        if (!token) {
            toast.error('Invalid or missing password reset token.');
            navigate('/login'); // Redirect to login if no token is present
        }
    }, [token, navigate]);


    return (
        <div className="login-wrapper">
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
                    {/* Title always "Reset Your Password" as this component is for the final step */}
                    <h2 className="login-title">Reset Your Password</h2>

                    {/* Only show the password reset form */}
                    <form onSubmit={resetPassword} className="login-form">
                        {/* Removed email and code inputs, as they are not part of this flow */}
                        {/* <label htmlFor="code" className="form-label">Verification Code</label>
                        <input
                            type="text"
                            id="code"
                            placeholder="Enter the code sent to your email"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            required
                            className="standard-input"
                            autoComplete="off"
                        /> */}

                        <label htmlFor="newPassword" className="form-label">New Password</label>
                        <div className="password-wrapper">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="newPassword"
                                placeholder="New Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                onFocus={handlePasswordFocus}
                                onBlur={handlePasswordBlur}
                                autoComplete="new-password"
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
                                onFocus={handlePasswordFocus}
                                onBlur={handlePasswordBlur}
                                autoComplete="new-password"
                            />
                            <button type="button" onClick={toggleConfirm}>
                                {showConfirm ? 'Hide' : 'Show'}
                            </button>
                        </div>

                        {showPasswordFeedback && (
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
                        <button type="button" className="secondary-button back-to-login-button" onClick={() => navigate('/login')}>Back to Login</button>
                    </form>
                </div>
            </div>
        </div>
    );
}