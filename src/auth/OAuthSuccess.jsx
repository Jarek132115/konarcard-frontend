// frontend/src/auth/OAuthSuccess.jsx
import { useEffect, useContext, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../components/AuthContext";
import api from "../services/api";

const PENDING_CLAIM_KEY = "pendingClaimUsername";
const OAUTH_SOURCE_KEY = "oauthSource";
const CHECKOUT_INTENT_KEY = "konar_checkout_intent_v1";

export default function OAuthSuccess() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, fetchUser } = useContext(AuthContext);
    const ranRef = useRef(false);

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

    const resumeCheckoutIfNeeded = async () => {
        const intent = readCheckoutIntent();
        if (!intent) return false;

        const returnUrl = intent.returnUrl || `${window.location.origin}/myprofile?subscribed=1`;

        try {
            const res = await api.post("/subscribe", {
                planKey: intent.planKey,
                returnUrl,
            });

            const url = res?.data?.url;
            if (!url) return false;

            clearCheckoutIntent();
            window.location.href = url;
            return true;
        } catch {
            return false; // keep intent so user can retry
        }
    };

    const readUserFromCache = () => {
        try {
            return JSON.parse(localStorage.getItem("authUser") || "null");
        } catch {
            return null;
        }
    };

    useEffect(() => {
        if (ranRef.current) return;
        ranRef.current = true;

        const params = new URLSearchParams(location.search);
        const token = params.get("token");

        if (!token) {
            navigate("/login?oauth=missing_token", { replace: true });
            return;
        }

        // Save token immediately
        login(token, null);

        (async () => {
            try {
                // ✅ Ensure AuthContext hydrates and writes authUser to localStorage
                await fetchUser();

                // ✅ Always read user after fetchUser() from cache (fetchUser doesn't return)
                const user = readUserFromCache();

                // If pricing intent exists, try Stripe FIRST (don’t block on claim)
                const resumed = await resumeCheckoutIfNeeded();
                if (resumed) return;

                // No checkout intent -> proceed with claim flow as normal
                const hasClaim = !!(user?.username || user?.slug);

                if (hasClaim) {
                    try {
                        localStorage.removeItem(PENDING_CLAIM_KEY);
                        localStorage.removeItem(OAUTH_SOURCE_KEY);
                    } catch { }
                    navigate("/myprofile", { replace: true });
                    return;
                }

                // no claim yet
                let pending = "";
                let source = "";
                try {
                    pending = (localStorage.getItem(PENDING_CLAIM_KEY) || "").trim().toLowerCase();
                    source = localStorage.getItem(OAUTH_SOURCE_KEY) || "";
                } catch { }

                // Auto-claim only if they came from REGISTER and we have pending username
                if (source === "register" && pending) {
                    try {
                        const res = await api.post("/claim-link", { username: pending });
                        if (res?.data?.user && !res.data?.error) {
                            await fetchUser();
                            try {
                                localStorage.removeItem(PENDING_CLAIM_KEY);
                                localStorage.removeItem(OAUTH_SOURCE_KEY);
                            } catch { }

                            navigate("/myprofile", { replace: true });
                            return;
                        }
                    } catch {
                        // fall through
                    }
                }

                navigate("/claim", { replace: true });
            } catch {
                navigate("/login?oauth=failed", { replace: true });
            }
        })();
    }, [location.search, navigate, login, fetchUser]);

    return <p style={{ textAlign: "center", marginTop: "4rem" }}>Signing you in…</p>;
}
