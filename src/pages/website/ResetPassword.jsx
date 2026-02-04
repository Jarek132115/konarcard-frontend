// src/pages/auth/ResetPassword.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "axios";
import Navbar from "../../components/Navbar";
import "../../styling/login.css";

export default function ResetPassword() {
    const navigate = useNavigate();
    const { token } = useParams();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const blurTimeoutRef = useRef(null);

    useEffect(() => {
        if (!token) {
            toast.error("Invalid or expired reset link.");
            navigate("/login");
        }
    }, [token, navigate]);

    const checks = {
        minLength: password.length >= 8,
        hasUpper: /[A-Z]/.test(password),
        hasNumber: /\d/.test(password),
        match: password === confirmPassword && confirmPassword.length > 0,
    };

    const allValid = Object.values(checks).every(Boolean);

    const handleBlur = () => {
        blurTimeoutRef.current = setTimeout(() => setShowFeedback(false), 120);
    };

    const handleFocus = () => {
        if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
        setShowFeedback(true);
    };

    const resetPassword = async (e) => {
        e.preventDefault();

        if (!allValid) {
            toast.error("Please meet all password requirements.");
            return;
        }

        try {
            setIsSubmitting(true);

            const API = import.meta.env.VITE_API_URL;
            await axios.post(
                `${API}/reset-password/${encodeURIComponent(token)}`,
                { password },
                { headers: { "Content-Type": "application/json" } }
            );

            toast.success("Password reset successfully!");
            navigate("/login");
        } catch (err) {
            toast.error(
                err?.response?.data?.error ||
                "Reset link expired or invalid."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Navbar />

            <div className="kc-auth-page">
                <div className="kc-auth-topActions">
                    <button
                        type="button"
                        className="kc-auth-closeBtn"
                        onClick={() => navigate("/")}
                        aria-label="Close"
                    >
                        <span aria-hidden="true">×</span>
                    </button>
                </div>

                <main className="kc-auth-main">
                    <div className="kc-auth-inner">
                        <h1 className="kc-title">Reset your password</h1>
                        <p className="kc-subtitle">
                            Choose a strong password you’ll remember.
                        </p>

                        <form className="kc-form" onSubmit={resetPassword}>
                            <div className="kc-field">
                                <label className="kc-label">New password</label>
                                <div className="kc-password">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="kc-input"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onFocus={handleFocus}
                                        onBlur={handleBlur}
                                        autoComplete="new-password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="kc-password-toggle"
                                        onClick={() => setShowPassword((s) => !s)}
                                    >
                                        {showPassword ? "Hide" : "Show"}
                                    </button>
                                </div>
                            </div>

                            <div className="kc-field">
                                <label className="kc-label">Confirm password</label>
                                <div className="kc-password">
                                    <input
                                        type={showConfirm ? "text" : "password"}
                                        className="kc-input"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        onFocus={handleFocus}
                                        onBlur={handleBlur}
                                        autoComplete="new-password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="kc-password-toggle"
                                        onClick={() => setShowConfirm((s) => !s)}
                                    >
                                        {showConfirm ? "Hide" : "Show"}
                                    </button>
                                </div>
                            </div>

                            {showFeedback && (
                                <div className="kc-password-feedback">
                                    <p className={checks.minLength ? "is-valid" : ""}>• At least 8 characters</p>
                                    <p className={checks.hasUpper ? "is-valid" : ""}>• One uppercase letter</p>
                                    <p className={checks.hasNumber ? "is-valid" : ""}>• One number</p>
                                    <p className={checks.match ? "is-valid" : ""}>• Passwords match</p>
                                </div>
                            )}

                            <button
                                className="kc-btn kc-btn-primary kc-btn-center"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Resetting…" : "Reset password"}
                            </button>

                            <button
                                type="button"
                                className="kc-text-back"
                                onClick={() => navigate("/login")}
                            >
                                Back to login
                            </button>
                        </form>
                    </div>
                </main>
            </div>
        </>
    );
}
