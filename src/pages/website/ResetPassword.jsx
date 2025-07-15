import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import backgroundImg from '../../assets/images/background.png';
import greenTick from '../../assets/icons/Green-Tick-Icon.svg';
import redCross from '../../assets/icons/Red-Cross-Icon.svg';

export default function ResetPassword() {
    const navigate = useNavigate();
    const { token } = useParams();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showPasswordFeedback, setShowPasswordFeedback] = useState(false);
    const blurTimeoutRef = React.useRef(null);

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

    const resetPassword = async (e) => {
        e.preventDefault();
        if (!Object.values(passwordChecks).every(Boolean)) {
            toast.error('Please meet all password requirements.');
            return;
        }

        if (!token) {
            toast.error('Invalid reset link. Token missing.');
            return;
        }

        try {
            const res = await axios.post(`/reset-password/${token}`, {
                password: password,
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

    useEffect(() => {
        if (!token) {
            toast.error('Invalid or missing password reset token.');
            navigate('/login');
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
                    <h2 className="login-title">Reset Your Password</h2>
                    <form onSubmit={resetPassword} className="login-form">
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