// frontend/src/auth/OAuthSuccess.jsx
import { useEffect, useContext, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../components/AuthContext";
import api from "../services/api";

const PENDING_CLAIM_KEY = "pendingClaimUsername";
const OAUTH_SOURCE_KEY = "oauthSource"; // 'register' | 'login'
const CHECKOUT_INTENT_KEY = "konar_checkout_intent_v1";

function safeJsonParse(raw) {
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

function readUserFromCache() {
    try {
        return safeJsonParse(localStorage.getItem("authUser") || "null");
    } catch {
        return null;
    }
}

function clearLocalAuth() {
    try {
        localStorage.removeItem("token");
        localStorage.removeItem("authUser");
    } catch {
        // ignore
    }
}

function readCheckoutIntent() {
    try {
        const raw = localStorage.getItem(CHECKOUT_INTENT_KEY);
        if (!raw) return null;

        const intent = safeJsonParse(raw);
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
}

function clearCheckoutIntent() {
    try {
        localStorage.removeItem(CHECKOUT_INTENT_KEY);
    } catch {
        // ignore
    }
}

function getPendingClaim() {
    try {
        return (localStorage.getItem(PENDING_CLAIM_KEY) || "").trim().toLowerCase();
    } catch {
        return "";
    }
}

function getOauthSource() {
    try {
        return localStorage.getItem(OAUTH_SOURCE_KEY) || "";
    } catch {
        return "";
    }
}

function clearClaimKeys() {
    try {
        localStorage.removeItem(PENDING_CLAIM_KEY);
        localStorage.removeItem(OAUTH_SOURCE_KEY);
    } catch {
        // ignore
    }
}

function userHasClaim(user) {
    return !!(user?.username || user?.slug || user?.profileUrl);
}

export default function OAuthSuccess() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, fetchUser } = useContext(AuthContext);
    const ranRef = useRef(false);

    // Start Stripe checkout (ONLY called when claim exists)
    const resumeCheckout = async (intent) => {
        if (!intent?.planKey) return false;

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
        } catch (e) {
            // keep intent so user can retry
            return false;
        }
    };

    // Attempt auto-claim using pendingClaimUsername
    const autoClaimIfPossible = async () => {
        const pending = getPendingClaim();
        if (!pending) return false;

        try {
            const res = await api.post("/claim-link", { username: pending });

            // backend patterns vary; treat any explicit error as failure
            if (res?.data?.error) return false;

            // refresh user after claim
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

        // Save token immediately (AuthContext should write localStorage token)
        login(token, null);

        (async () => {
            try {
                // Hydrate user from backend into AuthContext + localStorage
                await fetchUser();

                // IMPORTANT: read from localStorage AFTER fetchUser
                let user = readUserFromCache();

                // If backend couldn’t hydrate user (deleted user / invalid token)
                if (!user) {
                    clearLocalAuth();
                    navigate("/login?oauth=invalid_user", { replace: true });
                    return;
                }

                const intent = readCheckoutIntent();
                const needsCheckout = !!intent;

                // ===============================
                // A) If pricing intent exists
                // MUST have claim BEFORE Stripe
                // ===============================
                if (needsCheckout) {
                    if (!userHasClaim(user)) {
                        // First try auto-claim if we have a pending username
                        const claimed = await autoClaimIfPossible();
                        if (claimed) user = readUserFromCache();

                        // Still no claim -> must go manual claim (keep intent)
                        if (!userHasClaim(user)) {
                            navigate("/claim", { replace: true });
                            return;
                        }
                    }

                    // Claim exists -> Stripe
                    const ok = await resumeCheckout(intent);
                    if (ok) return;

                    // Stripe failed -> go profile (intent remains so they can retry)
                    navigate("/myprofile", { replace: true });
                    return;
                }

                // ==================================
                // B) No pricing intent -> normal flow
                // ==================================
                if (userHasClaim(user)) {
                    clearClaimKeys();
                    navigate("/myprofile", { replace: true });
                    return;
                }

                // If they came from register, we can auto-claim using pending claim
                const source = getOauthSource();
                if (source === "register") {
                    const claimed = await autoClaimIfPossible();
                    if (claimed) {
                        navigate("/myprofile", { replace: true });
                        return;
                    }
                }

                // Otherwise manual claim
                navigate("/claim", { replace: true });
            } catch {
                clearLocalAuth();
                navigate("/login?oauth=failed", { replace: true });
            }
        })();
    }, [location.search, navigate, login, fetchUser]);

    return <p style={{ textAlign: "center", marginTop: "4rem" }}>Signing you in…</p>;
}
