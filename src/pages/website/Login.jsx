import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import { AuthContext } from "../../components/AuthContext";
import api, { BASE_URL } from "../../services/api";
import Navbar from "../../components/Navbar";
import "../../styling/login.css";

/* Social logos */
import GoogleIcon from "../../assets/icons/Google-Icon.svg";
import FacebookIcon from "../../assets/icons/Facebook-Icon.svg";
import AppleIcon from "../../assets/icons/Apple-Icon.svg";

const POST_AUTH_KEY = "postAuthAction";
const REMEMBER_KEY = "rememberLogin";
const REMEMBERED_EMAIL_KEY = "rememberedEmail";

const CHECKOUT_INTENT_KEY = "konar_checkout_intent_v1";
const NFC_INTENT_KEY = "konar_nfc_intent_v1";

const ADMIN_EMAILS_UI = ["supportteam@konarcard.com"];

export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useContext(AuthContext);

    const [data, setData] = useState({ email: "", password: "" });
    const [rememberMe, setRememberMe] = useState(false);

    const [code, setCode] = useState("");
    const [verificationStep, setVerificationStep] = useState(false);
    const [cooldown, setCooldown] = useState(0);

    const [forgotPasswordStep, setForgotPasswordStep] = useState(false);
    const [emailForReset, setEmailForReset] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isSendingReset, setIsSendingReset] = useState(false);

    const isAdminEmail = (email) => ADMIN_EMAILS_UI.includes((email || "").toLowerCase());

    const closeAuth = () => {
        const from = location.state?.from;
        if (from) navigate(from);
        else navigate("/");
    };

    const readCheckoutIntent = () => {
        try {
            const raw = localStorage.getItem(CHECKOUT_INTENT_KEY);
            if (!raw) return null;
            const intent = JSON.parse(raw);
            if (!intent?.planKey) return null;

            const age = Date.now() - Number(intent.createdAt || 0);
            if (Number.isFinite(age) && age > 30 * 60 * 1000) {
                localStorage.removeItem(CHECKOUT_INTENT_KEY);
                return null;
            }
            return intent;
        } catch {
            return null;
        }
    };

    const clearCheckoutIntent = () => {
        try {
            localStorage.removeItem(CHECKOUT_INTENT_KEY);
        } catch { }
    };

    const readNfcIntent = () => {
        try {
            const raw = localStorage.getItem(NFC_INTENT_KEY);
            if (!raw) return null;
            const intent = JSON.parse(raw);
            if (!intent?.productKey) return null;

            const age = Date.now() - Number(intent.createdAt || intent.updatedAt || 0);
            if (Number.isFinite(age) && age > 30 * 60 * 1000) {
                localStorage.removeItem(NFC_INTENT_KEY);
                return null;
            }
            return intent;
        } catch {
            return null;
        }
    };

    const clearNfcIntent = () => {
        try {
            localStorage.removeItem(NFC_INTENT_KEY);
        } catch { }
    };

    const startOAuth = (provider) => {
        if (provider === "apple") {
            toast("Apple login coming soon");
            return;
        }
        window.location.href = `${BASE_URL}/auth/${provider}`;
    };

    useEffect(() => {
        try {
            const remembered = localStorage.getItem(REMEMBER_KEY) === "true";
            const email = localStorage.getItem(REMEMBERED_EMAIL_KEY) || "";
            if (remembered && email) {
                setRememberMe(true);
                setData((d) => ({ ...d, email }));
            }
        } catch { }
    }, []);

    useEffect(() => {
        if (cooldown <= 0) return;
        const t = setTimeout(() => setCooldown((s) => s - 1), 1000);
        return () => clearTimeout(t);
    }, [cooldown]);

    const runPendingActionOrDefault = async () => {
        let action = null;
        try {
            const saved = localStorage.getItem(POST_AUTH_KEY);
            if (saved) action = JSON.parse(saved);
        } catch { }
        try {
            localStorage.removeItem(POST_AUTH_KEY);
        } catch { }

        if (action?.type === "buy_nfc") {
            const returnTo =
                (typeof action?.payload?.returnTo === "string" && action.payload.returnTo.trim()) ||
                readNfcIntent()?.returnTo ||
                (typeof location.state?.from === "string" && location.state.from.trim()) ||
                "/products";

            navigate(returnTo, { replace: true });
            return;
        }

        if (action?.type === "buy_card") {
            navigate("/productandplan/konarcard", {
                state: { triggerCheckout: true, quantity: Number(action?.payload?.quantity) || 1 },
                replace: true,
            });
            return;
        }

        const nfc = readNfcIntent();
        if (nfc?.returnTo) {
            navigate(nfc.returnTo, { replace: true });
            return;
        }

        navigate("/myprofile");
    };

    const resumeCheckoutIfNeeded = async () => {
        const intent = readCheckoutIntent();
        if (!intent) return false;

        const returnUrl = intent.returnUrl || `${window.location.origin}/myprofile?subscribed=1`;

        try {
            const res = await api.post("/subscribe", { planKey: intent.planKey, returnUrl });
            const url = res?.data?.url;
            if (!url) {
                toast.error("Stripe checkout URL missing. Please try again.");
                return false;
            }
            clearCheckoutIntent();
            window.location.href = url;
            return true;
        } catch (err) {
            toast.error(err?.response?.data?.error || "Subscription failed. Please try again.");
            return false;
        }
    };

    const goToVerificationStep = (msg) => {
        toast.error(msg || "Email not verified. Code sent.");
        setCode("");
        setForgotPasswordStep(false);
        setVerificationStep(true);
        setCooldown(30);
    };

    const loginUser = async (e) => {
        e.preventDefault();

        const cleanEmail = (data.email || "").trim().toLowerCase();

        try {
            if (rememberMe) {
                localStorage.setItem(REMEMBER_KEY, "true");
                localStorage.setItem(REMEMBERED_EMAIL_KEY, cleanEmail);
            } else {
                localStorage.removeItem(REMEMBER_KEY);
                localStorage.removeItem(REMEMBERED_EMAIL_KEY);
            }
        } catch { }

        setIsSubmitting(true);
        try {
            const res = await api.post("/login", { email: cleanEmail, password: data.password });

            if (res.data?.error) {
                if (res.data?.resend) goToVerificationStep(res.data?.error || "Email not verified. Code sent.");
                else toast.error(res.data.error);
                return;
            }

            toast.success("Login successful!");
            login(res.data.token, res.data.user);

            const email = res.data.user?.email || cleanEmail;
            if (isAdminEmail(email)) {
                clearNfcIntent();
                navigate("/admin", { replace: true });
                return;
            }

            const resumed = await resumeCheckoutIfNeeded();
            if (resumed) return;

            await runPendingActionOrDefault();
        } catch (err) {
            toast.error(err?.response?.data?.error || "Login failed.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const verifyCode = async (e) => {
        e.preventDefault();

        const cleanEmail = (data.email || "").trim().toLowerCase();
        const cleanOtp = String(code || "").replace(/\D/g, "").slice(0, 6);

        if (!cleanEmail) {
            toast.error("Please enter your email first.");
            setVerificationStep(false);
            return;
        }
        if (cleanOtp.length !== 6) {
            toast.error("Please enter the 6-digit code.");
            return;
        }

        setIsVerifying(true);
        try {
            const res = await api.post("/verify-email", { email: cleanEmail, code: cleanOtp });

            if (res?.data?.error) {
                toast.error(res.data.error || "Verification failed.");
                return;
            }

            toast.success("Email verified!");

            const loginRes = await api.post("/login", { email: cleanEmail, password: data.password });

            if (loginRes.data?.error) {
                toast.error(loginRes.data.error);
                return;
            }

            login(loginRes.data.token, loginRes.data.user);

            const resumed = await resumeCheckoutIfNeeded();
            if (resumed) return;

            await runPendingActionOrDefault();
        } catch (err) {
            toast.error(err?.response?.data?.error || "Verification failed.");
        } finally {
            setIsVerifying(false);
        }
    };

    const resendCode = async () => {
        const cleanEmail = (data.email || "").trim().toLowerCase();
        if (!cleanEmail) {
            toast.error("Enter your email first.");
            setVerificationStep(false);
            return;
        }
        if (cooldown > 0) return;

        try {
            const res = await api.post("/resend-code", { email: cleanEmail });
            if (res.data?.error) {
                toast.error(res.data.error);
                return;
            }
            toast.success("New code sent!");
            setCode("");
            setCooldown(30);
            setVerificationStep(true);
            setForgotPasswordStep(false);
        } catch (err) {
            toast.error(err?.response?.data?.error || "Could not resend code.");
        }
    };

    const sendResetLink = async (e) => {
        e.preventDefault();
        setIsSendingReset(true);
        try {
            const res = await api.post("/forgot-password", { email: emailForReset.trim().toLowerCase() });
            if (res.data?.error) toast.error(res.data.error);
            else toast.success("Reset link sent!");
        } catch {
            toast.error("Failed to send reset link.");
        } finally {
            setIsSendingReset(false);
        }
    };

    return (
        <>
            <Navbar />

            <div className="kc-auth-page">
                <div className="kc-auth-topActions">
                    <button type="button" className="kc-auth-closeBtn" onClick={closeAuth} aria-label="Close">
                        <span className="kc-auth-closeIcon" aria-hidden="true">
                            ×
                        </span>
                    </button>
                </div>

                <main className="kc-auth-main">
                    <div className="kc-auth-inner">
                        <div className="kc-auth-wrap">
                            <div className="kc-auth-panel">
                                {forgotPasswordStep ? (
                                    <>
                                        <h1 className="kc-title">Reset password</h1>
                                        <p className="kc-subtitle">We’ll email you a reset link.</p>

                                        <form className="kc-form" onSubmit={sendResetLink}>
                                            <div className="kc-field">
                                                <label className="kc-label" htmlFor="resetEmail">
                                                    Email
                                                </label>
                                                <input
                                                    className="kc-input"
                                                    id="resetEmail"
                                                    type="email"
                                                    placeholder="Enter your email"
                                                    value={emailForReset}
                                                    onChange={(e) => setEmailForReset(e.target.value)}
                                                    required
                                                />
                                            </div>

                                            <div className="kc-actionsCenter">
                                                <button className="kx-btn kx-btn--black kc-authBtn" disabled={isSendingReset} aria-busy={isSendingReset}>
                                                    {isSendingReset ? "Sending…" : "Send reset link"}
                                                </button>
                                            </div>

                                            <div className="kc-actionsCenter">
                                                <button type="button" className="kx-btn kx-btn--white kc-authBtn" onClick={() => setForgotPasswordStep(false)}>
                                                    Back
                                                </button>
                                            </div>
                                        </form>
                                    </>
                                ) : verificationStep ? (
                                    <>
                                        <h1 className="kc-title">Verify email</h1>
                                        <p className="kc-subtitle">Enter the code we sent to your email.</p>

                                        <form className="kc-form" onSubmit={verifyCode}>
                                            <div className="kc-field">
                                                <label className="kc-label" htmlFor="code">
                                                    Verification code
                                                </label>
                                                <input
                                                    className="kc-input"
                                                    id="code"
                                                    type="text"
                                                    placeholder="123456"
                                                    value={code}
                                                    onChange={(e) => setCode((e.target.value || "").replace(/\D/g, "").slice(0, 6))}
                                                    maxLength={6}
                                                    inputMode="numeric"
                                                    autoComplete="one-time-code"
                                                    required
                                                />
                                            </div>

                                            <div className="kc-actionsCenter">
                                                <button className="kx-btn kx-btn--black kc-authBtn" disabled={isVerifying} aria-busy={isVerifying}>
                                                    {isVerifying ? "Verifying…" : "Verify"}
                                                </button>
                                            </div>

                                            <div className="kc-actionsCenter">
                                                <button type="button" className="kx-btn kx-btn--white kc-authBtn" onClick={resendCode} disabled={cooldown > 0}>
                                                    {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
                                                </button>
                                            </div>

                                            <button
                                                type="button"
                                                className="kc-text-link kc-text-link--center"
                                                onClick={() => {
                                                    setVerificationStep(false);
                                                    setCode("");
                                                }}
                                            >
                                                Back to login
                                            </button>
                                        </form>
                                    </>
                                ) : (
                                    <>
                                        <h1 className="kc-title">Welcome back</h1>
                                        <p className="kc-subtitle">
                                            New to KonarCard?{" "}
                                            <Link className="kc-link" to="/register" state={{ from: location.state?.from || "/" }}>
                                                Create an account
                                            </Link>
                                        </p>

                                        <form className="kc-form" onSubmit={loginUser}>
                                            <div className="kc-field">
                                                <label className="kc-label" htmlFor="email">
                                                    Email
                                                </label>
                                                <input
                                                    className="kc-input"
                                                    id="email"
                                                    type="email"
                                                    placeholder="Enter your email"
                                                    value={data.email}
                                                    onChange={(e) => setData({ ...data, email: e.target.value })}
                                                    required
                                                />
                                            </div>

                                            <div className="kc-field">
                                                <label className="kc-label" htmlFor="password">
                                                    Password
                                                </label>
                                                <input
                                                    className="kc-input"
                                                    id="password"
                                                    type="password"
                                                    placeholder="Enter your password"
                                                    value={data.password}
                                                    onChange={(e) => setData({ ...data, password: e.target.value })}
                                                    required
                                                />
                                            </div>

                                            <div className="kc-row">
                                                <label className="kc-remember">
                                                    <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                                                    Remember me
                                                </label>

                                                <button type="button" className="kc-text-link" onClick={() => setForgotPasswordStep(true)}>
                                                    Forgot password?
                                                </button>
                                            </div>

                                            <div className="kc-actionsCenter">
                                                <button className="kx-btn kx-btn--black kc-authBtn" disabled={isSubmitting} aria-busy={isSubmitting}>
                                                    {isSubmitting ? "Signing in…" : "Sign in"}
                                                </button>
                                            </div>
                                        </form>

                                        <div className="kc-divider kc-divider--matchWidth">
                                            <span>or</span>
                                        </div>

                                        <div className="kc-social">
                                            <button type="button" className="kx-btn kx-btn--white kc-authBtn kc-socialBtn" onClick={() => startOAuth("google")}>
                                                <img className="kc-social-icon" src={GoogleIcon} alt="" aria-hidden="true" />
                                                <span>Sign in with Google</span>
                                            </button>

                                            <button type="button" className="kx-btn kx-btn--white kc-authBtn kc-socialBtn" onClick={() => startOAuth("facebook")}>
                                                <img className="kc-social-icon" src={FacebookIcon} alt="" aria-hidden="true" />
                                                <span>Sign in with Facebook</span>
                                            </button>

                                            <button type="button" className="kx-btn kx-btn--white kc-authBtn kc-socialBtn" onClick={() => startOAuth("apple")}>
                                                <img className="kc-social-icon" src={AppleIcon} alt="" aria-hidden="true" />
                                                <span>Sign in with Apple</span>
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
