// frontend/src/pages/website/ResetPassword.jsx
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useKonarToast } from "../../hooks/useKonarToast";
import axios from "axios";
import Navbar from "../../components/Navbar";
import "../../styling/login.css";

/* ── Icons ──────────────────────────────────────────────── */
function BackArrow() {
    return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M9 2.5L4.5 7 9 11.5" stroke="currentColor" strokeWidth="1.7"
                strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function EyeIcon({ open }) {
    return open ? (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M1.5 9C1.5 9 4 4.5 9 4.5S16.5 9 16.5 9 14 13.5 9 13.5 1.5 9 1.5 9Z"
                stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
            <circle cx="9" cy="9" r="2.25" stroke="currentColor" strokeWidth="1.4" />
        </svg>
    ) : (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M2.5 2.5l13 13M7.17 7.27A2.25 2.25 0 0011.73 11.83M4.2 4.45C2.8 5.6 1.5 9 1.5 9s2.5 4.5 7.5 4.5c1.37 0 2.58-.37 3.61-.97M7.5 4.6A8.2 8.2 0 019 4.5c5 0 7.5 4.5 7.5 4.5a12.6 12.6 0 01-2.16 2.95"
                stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

export default function ResetPassword() {
    const toast         = useKonarToast();
    const navigate      = useNavigate();
    const { token }     = useParams();

    const [password, setPassword]           = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword]   = useState(false);
    const [showConfirm, setShowConfirm]     = useState(false);
    const [isSubmitting, setIsSubmitting]   = useState(false);

    const API = import.meta.env.VITE_API_URL;

    const resetPassword = async (e) => {
        e.preventDefault();

        if (password.length < 8)
            return toast.error("Password must be at least 8 characters.");
        if (password !== confirmPassword)
            return toast.error("Passwords do not match.");

        setIsSubmitting(true);
        try {
            await axios.post(
                `${API}/reset-password/${encodeURIComponent(token)}`,
                { password },
                { headers: { "Content-Type": "application/json" } }
            );
            toast.success("Password reset. You can now sign in.");
            navigate("/login");
        } catch (err) {
            toast.error(err?.response?.data?.error || "This reset link has expired or is invalid.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Navbar />

            <div className="kc-auth-page">
                <div className="kc-auth-topActions">
                    <button type="button" className="kc-auth-backBtn"
                        onClick={() => navigate("/login")} aria-label="Back to sign in">
                        <BackArrow />
                        Back to sign in
                    </button>
                </div>

                <main className="kc-auth-main">
                    <div className="kc-auth-inner">
                        <div className="kc-auth-panel">

                            <h1 className="h2 kc-auth-title">
                                Reset your <span className="kc-auth-accent">password</span>
                            </h1>
                            <p className="kc-subtitle">
                                Choose a strong password of at least 8 characters.
                            </p>

                            <form className="kc-form" onSubmit={resetPassword}>
                                <div className="kc-field">
                                    <label className="kc-label" htmlFor="newPassword">New password</label>
                                    <div className="kc-password">
                                        <input
                                            id="newPassword"
                                            type={showPassword ? "text" : "password"}
                                            className="kc-input"
                                            placeholder="Enter new password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            autoComplete="new-password"
                                            autoFocus
                                            required
                                        />
                                        <button type="button" className="kc-password-toggle"
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                            onClick={() => setShowPassword((s) => !s)}>
                                            <EyeIcon open={showPassword} />
                                        </button>
                                    </div>
                                </div>

                                <div className="kc-field">
                                    <label className="kc-label" htmlFor="confirmPassword">Confirm password</label>
                                    <div className="kc-password">
                                        <input
                                            id="confirmPassword"
                                            type={showConfirm ? "text" : "password"}
                                            className="kc-input"
                                            placeholder="Repeat your new password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            autoComplete="new-password"
                                            required
                                        />
                                        <button type="button" className="kc-password-toggle"
                                            aria-label={showConfirm ? "Hide password" : "Show password"}
                                            onClick={() => setShowConfirm((s) => !s)}>
                                            <EyeIcon open={showConfirm} />
                                        </button>
                                    </div>
                                </div>

                                <div className="kc-actionsCenter">
                                    <button className="kx-btn kx-btn--black kc-authBtn"
                                        disabled={isSubmitting} aria-busy={isSubmitting}>
                                        {isSubmitting ? "Resetting…" : "Reset password"}
                                    </button>
                                </div>
                            </form>

                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
