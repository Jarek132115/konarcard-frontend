import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "./AuthContext";

const NFC_INTENT_KEY = "konar_nfc_intent_v1";

function readNfcIntent() {
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
}

function buildCardsProductUrl(productKey) {
    const safe = String(productKey || "").trim();
    return safe ? `/cards?product=${encodeURIComponent(safe)}` : "/cards";
}

export default function PublicOnlyRoute({
    children,
    redirectAuthenticatedTo = "/dashboard",
    allowProductIntentRedirect = false,
}) {
    const { user, initialized, hydrating } = useContext(AuthContext);
    const location = useLocation();

    const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (!initialized || hydrating) {
        return <div style={{ minHeight: "40vh" }} />;
    }

    const isAuthed = !!token && !!user;

    if (!isAuthed) {
        return children;
    }

    if (allowProductIntentRedirect) {
        const nfcIntent = readNfcIntent();
        if (nfcIntent?.productKey) {
            return (
                <Navigate
                    to={nfcIntent.returnTo || buildCardsProductUrl(nfcIntent.productKey)}
                    replace
                    state={{
                        openProductFromIntent: true,
                        from: location.pathname + location.search,
                    }}
                />
            );
        }
    }

    return <Navigate to={redirectAuthenticatedTo} replace />;
}