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

            // expire after 30 minutes
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
        } catch {
            // ignore
        }
    };

    const readUserFromCache = () => {
        try {
            return JSON.parse(localStorage.getItem("authUser") || "null");
        } catch {
            return null;
        }
    };

    const getPendingClaim = () => {
        try {
            return (localStorage.getItem(PENDING_CLAIM_KEY) || "").trim().toLowerCase();
        } catch {
            return "";
        }
    };

    const clearClaimKeys = () => {
        try {
            localStorage.removeItem(PENDING_CLAIM_KEY);
            localStorage.removeItem(OAUTH_SOURCE_KEY);
        } catch {
            // ignore
        }
    };

    const hasClaim = (user) => !!(user?.username || user?.slug);

    // ✅ Only start Stripe AFTER claim exists
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
            // keep intent so user can retry
            return false;
        }
    };

    const autoClaimIfPossible = async () => {
        const pending = getPendingClaim();
        if (!pending) return false;

        try {
            const res = await api.post("/claim-link", { username: pending });
            if (res?.data?.error) return false;

            await fetchUser();
            clearClaimKeys();
            return true;
        } catch {
            return false;
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

        // Save token immediately (OAuth pattern)
        login(token, null);

        (async () => {
            try {
                // Ensure authUser is hydrated
                await fetchUser();
                let user = readUserFromCache();

                const intent = readCheckoutIntent();
                const needsCheckout = !!intent;

                // ✅ If checkout intent exists, we MUST ensure claim exists before Stripe
                if (needsCheckout) {
                    if (!hasClaim(user)) {
                        const claimed = await autoClaimIfPossible();
                        if (claimed) user = readUserFromCache();

                        if (!hasClaim(user)) {
                            // still no claim → send to claim page, keep checkout intent
                            navigate("/claim", { replace: true });
                            return;
                        }
                    }

                    // has claim → go Stripe
                    const resumed = await resumeCheckoutIfNeeded();
                    if (resumed) return;

                    // if Stripe failed, go profile but keep intent so they can retry
                    navigate("/myprofile", { replace: true });
                    return;
                }

                // ✅ No checkout intent -> normal flow
                if (hasClaim(user)) {
                    clearClaimKeys();
                    navigate("/myprofile", { replace: true });
                    return;
                }

                
                // no claim -> if they came from register and we have pending, try auto-claim
                let source = "";
                try {
                    source = localStorage.getItem(OAUTH_SOURCE_KEY) || "";
                } catch {
                    source = "";
                }

                if (source === "register") {
                    const claimed = await autoClaimIfPossible();
                    if (claimed) {
                        navigate("/myprofile", { replace: true });
                        return;
                    }
                }

                // otherwise manual claim
                navigate("/claim", { replace: true });
            } catch {
                navigate("/login?oauth=failed", { replace: true });
            }
        })();
    }, [location.search, navigate, login, fetchUser]);

    return <p style={{ textAlign: "center", marginTop: "4rem" }}>Signing you in…</p>;
}
