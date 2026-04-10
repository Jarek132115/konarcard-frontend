import { useEffect, useContext, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../components/AuthContext";
import api from "../services/api";

const PENDING_CLAIM_KEY = "pendingClaimUsername";
const OAUTH_SOURCE_KEY = "oauthSource"; // 'register' | 'login'
const CHECKOUT_INTENT_KEY = "konar_checkout_intent_v1";
const NFC_INTENT_KEY = "konar_nfc_intent_v1";
const ADMIN_EMAILS_UI = ["supportteam@konarcard.com"];

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

function readNfcIntent() {
    try {
        const raw = localStorage.getItem(NFC_INTENT_KEY);
        if (!raw) return null;

        const intent = safeJsonParse(raw);
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
}

function buildCardsProductUrl(productKey) {
    const safe = String(productKey || "").trim();
    return safe ? `/cards?product=${encodeURIComponent(safe)}` : "/cards";
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

function isAdminUser(userLike) {
    const email = String(userLike?.email || "").trim().toLowerCase();
    const role = String(userLike?.role || "").trim().toLowerCase();

    return role === "admin" || ADMIN_EMAILS_UI.includes(email);
}

export default function OAuthSuccess() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, fetchUser } = useContext(AuthContext);
    const ranRef = useRef(false);

    const resumeCheckout = useCallback(async (intent) => {
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
        } catch {
            return false;
        }
    }, []);

    const autoClaimIfPossible = useCallback(async () => {
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
    }, [fetchUser]);

    useEffect(() => {
        if (ranRef.current) return;
        ranRef.current = true;

        const params = new URLSearchParams(location.search);
        const token = params.get("token");

        if (!token) {
            navigate("/login?oauth=missing_token", { replace: true });
            return;
        }

        login(token, null);

        (async () => {
            try {
                await fetchUser();

                let user = readUserFromCache();

                if (!user) {
                    clearLocalAuth();
                    navigate("/login?oauth=invalid_user", { replace: true });
                    return;
                }

                if (isAdminUser(user)) {
                    clearClaimKeys();
                    navigate("/admin", { replace: true });
                    return;
                }

                const checkoutIntent = readCheckoutIntent();
                const nfcIntent = readNfcIntent();

                if (checkoutIntent) {
                    if (!userHasClaim(user)) {
                        const claimed = await autoClaimIfPossible();
                        if (claimed) user = readUserFromCache();

                        if (!userHasClaim(user)) {
                            navigate("/claim", { replace: true });
                            return;
                        }
                    }

                    const resumed = await resumeCheckout(checkoutIntent);
                    if (resumed) return;

                    clearClaimKeys();
                    navigate("/dashboard", { replace: true });
                    return;
                }

                if (nfcIntent?.productKey) {
                    clearClaimKeys();
                    navigate(
                        nfcIntent.returnTo || buildCardsProductUrl(nfcIntent.productKey),
                        {
                            replace: true,
                            state: {
                                openProductFromIntent: true,
                                source: "oauth_nfc_resume",
                            },
                        }
                    );
                    return;
                }

                if (userHasClaim(user)) {
                    clearClaimKeys();
                    navigate("/dashboard", { replace: true });
                    return;
                }

                const source = getOauthSource();
                if (source === "register") {
                    const claimed = await autoClaimIfPossible();
                    if (claimed) {
                        clearClaimKeys();
                        navigate("/dashboard", { replace: true });
                        return;
                    }
                }

                navigate("/claim", { replace: true });
            } catch {
                clearLocalAuth();
                navigate("/login?oauth=failed", { replace: true });
            }
        })();
    }, [location.search, navigate, login, fetchUser, autoClaimIfPossible, resumeCheckout]);

    return <p style={{ textAlign: "center", marginTop: "4rem" }}>Signing you in…</p>;
}