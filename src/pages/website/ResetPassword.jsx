// src/pages/auth/ResetPassword.jsx
import React, { useState } from "react";
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
    const [isSubmitting, setIsSubmitting] = useState(false);

    const API = import.meta.env.VITE_API_URL;

    const resetPassword = async (e) => {
        e.preventDefault();

        if (password.length < 8)
            return toast.error("Password must be at least 8 characters.");
        if (password !== confirmPassword)
            return toast.error("Passwords do not match.");

        try {
            setIsSubmitting(true);

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
                        <span className="kc-auth-closeIcon">×</span>
                    </button>
                </div>

                <main className="kc-auth-main">
                    <div className="kc-auth-inner">
                        <div className="kc-auth-wrap">
                            <div className="kc-auth-panel">
                                <h1 className="h2 kc-auth-title">
                                    Reset your <span className="kc-auth-accent">password</span>
                                </h1>

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
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="kc-password-toggle"
                                                onClick={() =>
                                                    setShowPassword((s) => !s)
                                                }
                                            >
                                                {showPassword ? "Hide" : "Show"}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="kc-field">
                                        <label className="kc-label">
                                            Confirm password
                                        </label>
                                        <div className="kc-password">
                                            <input
                                                type={showConfirm ? "text" : "password"}
                                                className="kc-input"
                                                value={confirmPassword}
                                                onChange={(e) =>
                                                    setConfirmPassword(e.target.value)
                                                }
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="kc-password-toggle"
                                                onClick={() =>
                                                    setShowConfirm((s) => !s)
                                                }
                                            >
                                                {showConfirm ? "Hide" : "Show"}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="kc-actionsCenter">
                                        <button
                                            className="kx-btn kx-btn--black kc-authBtn"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting
                                                ? "Resetting…"
                                                : "Reset password"}
                                        </button>
                                    </div>

                                    <button
                                        type="button"
                                        className="kc-text-link kc-text-link--center"
                                        onClick={() => navigate("/login")}
                                    >
                                        Back to login
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}