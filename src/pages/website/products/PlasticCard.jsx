import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import PlasticCard3D from "../../../components/PlasticCard3D";

/* ✅ Page CSS */
import "../../../styling/products/konarcard.css";

/* Use Konar logo as placeholder (same as navbar) */
import LogoIcon from "../../../assets/icons/Logo-Icon.svg";

/* ✅ Your QR image (static) */
import CardQrCode from "../../../assets/images/CardQrCode.png";

import api from "../../../services/api";
import { useMyProfiles } from "../../../hooks/useBusinessCard";

const INTENT_KEY = "konar_nfc_intent_v1";

function readIntent() {
    try {
        return JSON.parse(localStorage.getItem(INTENT_KEY) || "null");
    } catch {
        return null;
    }
}

function writeIntent(v) {
    try {
        if (!v) localStorage.removeItem(INTENT_KEY);
        else localStorage.setItem(INTENT_KEY, JSON.stringify(v));
    } catch {
        // ignore
    }
}

function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result || ""));
        r.onerror = reject;
        r.readAsDataURL(file);
    });
}

export default function PlasticCard() {
    const navigate = useNavigate();
    const location = useLocation();

    const PRODUCT_KEY = "plastic-card";

    const [qty, setQty] = useState(1);

    // ---- Logo upload preview (FRONT ONLY) ----
    const [logoUrl, setLogoUrl] = useState("");
    const [logoFile, setLogoFile] = useState(null);
    const [logoSize, setLogoSize] = useState(44);

    // Profile selection (required for purchase)
    const [profileId, setProfileId] = useState("");

    // UX state
    const [errorMsg, setErrorMsg] = useState("");
    const [infoMsg, setInfoMsg] = useState("");
    const [busy, setBusy] = useState(false);

    const isLoggedIn = (() => {
        try {
            return !!localStorage.getItem("token");
        } catch {
            return false;
        }
    })();

    // Profiles
    const profilesQuery = useMyProfiles();
    const isProfilesLoading = !!profilesQuery?.isLoading;

    // Robustly normalize possible shapes:
    const myProfiles = (() => {
        const d = profilesQuery?.data;
        if (Array.isArray(d)) return d;
        if (Array.isArray(d?.data)) return d.data;
        if (Array.isArray(d?.data?.data)) return d.data.data;
        return [];
    })();

    // Cleanup object URL
    useEffect(() => {
        return () => {
            if (logoUrl) URL.revokeObjectURL(logoUrl);
        };
    }, [logoUrl]);

    // Stripe return feedback (success/cancel)
    useEffect(() => {
        const sp = new URLSearchParams(location.search);
        const checkout = sp.get("checkout");

        if (checkout === "success") {
            setErrorMsg("");
            setInfoMsg("✅ Payment received! We’ll email you confirmation shortly.");
            writeIntent(null); // ✅ truly clear
            return;
        }

        if (checkout === "cancel") {
            setErrorMsg("Checkout cancelled. You can try again anytime.");
            setInfoMsg("");
            return;
        }
    }, [location.search]);

    // Restore intent after login/return
    useEffect(() => {
        const intent = readIntent();
        if (!intent) return;
        if (intent.productKey !== PRODUCT_KEY) return;

        if (typeof intent.quantity === "number") {
            setQty(Math.max(1, Math.min(20, intent.quantity)));
        }

        if (typeof intent.logoSize === "number") {
            setLogoSize(Math.max(28, Math.min(70, intent.logoSize)));
        }

        if (typeof intent.profileId === "string") {
            setProfileId(intent.profileId);
        }

        // If they had selected a logo before login, we can't restore the File after redirect.
        if (intent.hadLogo) {
            setInfoMsg("Please re-upload your logo to continue checkout.");
        }
    }, []);

    // Auto-select first profile once loaded (nice UX)
    useEffect(() => {
        if (!isLoggedIn) return;
        if (profileId) return;
        if (!Array.isArray(myProfiles) || myProfiles.length === 0) return;

        const firstId = String(myProfiles?.[0]?._id || "");
        if (firstId) setProfileId(firstId);
    }, [isLoggedIn, myProfiles, profileId]);

    // ✅ Persist intent as user changes controls
    // IMPORTANT: do NOT rewrite intent on Stripe success/cancel pages
    useEffect(() => {
        const sp = new URLSearchParams(location.search);
        const checkout = sp.get("checkout");
        if (checkout === "success") return;

        const existing = readIntent();
        const base =
            existing && typeof existing === "object" && existing.productKey === PRODUCT_KEY
                ? existing
                : null;

        const next = {
            ...(base || {}),
            productKey: PRODUCT_KEY,
            quantity: qty,
            logoSize,
            profileId,
            hadLogo: !!logoFile,
            returnTo: location.pathname, // ✅ no querystring
            createdAt: base?.createdAt || Date.now(),
            updatedAt: Date.now(),
        };

        writeIntent(next);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [qty, logoSize, profileId, logoFile, location.pathname, location.search]);

    const onPickLogo = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) return;

        if (logoUrl) URL.revokeObjectURL(logoUrl);

        setLogoFile(file);
        setLogoUrl(URL.createObjectURL(file));
        setInfoMsg("");
        setErrorMsg("");
    };

    const clearLogo = () => {
        if (logoUrl) URL.revokeObjectURL(logoUrl);
        setLogoUrl("");
        setLogoFile(null);
    };

    const features = useMemo(
        () => [
            { t: "Tap to share instantly", s: "Open your profile on any modern phone with an NFC tap." },
            { t: "QR code backup", s: "If NFC is off, they can scan and still save your details." },
            { t: "Works with your Konar profile", s: "Your card always links to your live profile — edits update instantly." },
            { t: "No app needed", s: "Works in the browser on iPhone and Android." },
            { t: "Built for real trades", s: "Clean, durable, and made to be shared every day." },
            { t: "One-time purchase", s: "Buy once. Share forever." },
        ],
        []
    );

    const displayedLogo = logoUrl || LogoIcon;

    const handleBuy = async () => {
        setErrorMsg("");
        setInfoMsg("");

        // 1) Must be logged in
        if (!isLoggedIn) {
            // ✅ intent already persists, but ensure it has the basics
            const existing = readIntent();
            writeIntent({
                ...(existing && typeof existing === "object" ? existing : {}),
                productKey: PRODUCT_KEY,
                quantity: qty,
                logoSize,
                profileId,
                hadLogo: !!logoFile,
                returnTo: location.pathname,
                createdAt: existing?.createdAt || Date.now(),
                updatedAt: Date.now(),
            });

            navigate("/login", { state: { from: location.pathname } });
            return;
        }

        // 2) Must have profiles
        if (!myProfiles.length) {
            setErrorMsg("You need at least 1 profile before buying a card. Please create a profile first.");
            return;
        }

        // 3) Must pick profile
        if (!profileId) {
            setErrorMsg("Please choose which profile to link to this card before checkout.");
            return;
        }

        setBusy(true);
        try {
            // 4) Upload logo to S3 (optional)
            let savedLogoUrl = "";
            if (logoFile) {
                const dataUrl = await fileToDataUrl(logoFile);

                const up = await api.post("/api/checkout/nfc/logo", {
                    dataUrl,
                    filename: logoFile?.name || "logo.png",
                });

                if (up?.status >= 400 || !up?.data?.logoUrl) {
                    throw new Error(up?.data?.error || "Logo upload failed");
                }

                savedLogoUrl = up.data.logoUrl;
            }

            // 5) Create Stripe checkout session
            const resp = await api.post("/api/checkout/nfc/session", {
                productKey: PRODUCT_KEY,
                quantity: qty,
                profileId,
                logoUrl: savedLogoUrl || "",
                preview: {
                    logoSize,
                    usedCustomLogo: !!savedLogoUrl,
                },
            });

            if (resp?.status >= 400 || !resp?.data?.url) {
                throw new Error(resp?.data?.error || "Failed to start checkout");
            }

            // Clear intent now that we have a real Stripe session
            writeIntent(null);

            // 6) Redirect to Stripe checkout
            window.location.href = resp.data.url;
        } catch (e) {
            setErrorMsg(e?.message || "Checkout failed. Please try again.");
        } finally {
            setBusy(false);
        }
    };

    return (
        <>
            <Navbar />

            <main className="kc-konarcard kc-konarcard--premium kc-page">
                <div className="kc-konarcard__wrap">
                    <section className="kc-premHero kc-premHero--clean">
                        <div className="kc-premHero__top">
                            <div className="kc-premHero__crumbs">
                                <Link to="/products" className="kc-konarcard__crumbLink">
                                    Products
                                </Link>
                                <span className="kc-konarcard__crumbSep">/</span>
                                <span className="kc-konarcard__crumbHere">KonarCard – Plastic</span>
                            </div>

                            <h1 className="kc-premHero__title">KonarCard — Plastic Edition</h1>

                            <div className="kc-premHero__badges">
                                <span className="kc-konarcard__pill kc-konarcard__pill--best">Best Value</span>
                                <span className="kc-konarcard__pill kc-konarcard__pill--warranty">12 Month Warranty</span>
                            </div>

                            <p className="kc-premHero__sub">
                                A clean white NFC business card that shares your Konar profile instantly — with QR backup on the back.
                            </p>

                            {(errorMsg || infoMsg) && (
                                <div
                                    style={{
                                        marginTop: 12,
                                        padding: "10px 12px",
                                        borderRadius: 12,
                                        border: "1px solid var(--kc-border)",
                                        background: "var(--kc-bg-soft)",
                                        color: "var(--kc-text-primary)",
                                        fontSize: 14,
                                    }}
                                >
                                    {errorMsg ? `⚠️ ${errorMsg}` : `ℹ️ ${infoMsg}`}
                                </div>
                            )}
                        </div>

                        <div className="kc-premStage">
                            <div className="kc-premStage__canvasPad">
                                <PlasticCard3D logoSrc={displayedLogo} qrSrc={CardQrCode} logoSize={logoSize} />
                            </div>

                            {/* Controls */}
                            <div className="kc-premControls kc-premControls--clean">
                                <div className="kc-premControls__left">
                                    <div className="kc-premControls__label">Your logo</div>
                                    <div className="kc-premControls__sub">Upload any image — preview updates instantly.</div>
                                </div>

                                <div className="kc-premControls__right">
                                    <label className="kc-premBtn">
                                        <input type="file" accept="image/*" onChange={onPickLogo} />
                                        Upload logo
                                    </label>

                                    <button type="button" className="kc-premBtn kc-premBtn--ghost" onClick={clearLogo} disabled={!logoUrl || busy}>
                                        Remove
                                    </button>

                                    <div className="kc-premSlider">
                                        <span className="kc-premSlider__k">Size</span>
                                        <input
                                            type="range"
                                            min={28}
                                            max={70}
                                            value={logoSize}
                                            onChange={(e) => setLogoSize(Number(e.target.value))}
                                            aria-label="Logo size"
                                            disabled={busy}
                                        />
                                        <span className="kc-premSlider__v">{logoSize}%</span>
                                    </div>
                                </div>
                            </div>

                            {/* Buy row */}
                            <div className="kc-premBuy kc-premBuy--clean" aria-label="Choose quantity and buy">
                                <div className="kc-premPrice">
                                    <div className="kc-premPrice__value">£29.99</div>
                                    <div className="kc-premPrice__note">One-time purchase • Works with your profile</div>
                                </div>

                                <div className="kc-premBuy__right">
                                    {/* Quantity */}
                                    <div className="kc-konarcard__qty">
                                        <button
                                            type="button"
                                            className="kc-konarcard__qtyBtn"
                                            onClick={() => setQty((q) => Math.max(1, q - 1))}
                                            aria-label="Decrease quantity"
                                            disabled={busy}
                                        >
                                            −
                                        </button>
                                        <div className="kc-konarcard__qtyVal" aria-label="Quantity">
                                            {qty}
                                        </div>
                                        <button
                                            type="button"
                                            className="kc-konarcard__qtyBtn"
                                            onClick={() => setQty((q) => Math.min(20, q + 1))}
                                            aria-label="Increase quantity"
                                            disabled={busy}
                                        >
                                            +
                                        </button>
                                    </div>

                                    {/* Profile select (required) */}
                                    <div style={{ minWidth: 240 }}>
                                        <select
                                            value={profileId}
                                            onChange={(e) => setProfileId(e.target.value)}
                                            disabled={!isLoggedIn || busy || isProfilesLoading}
                                            aria-label="Choose profile"
                                            style={{
                                                width: "100%",
                                                height: 44,
                                                borderRadius: 12,
                                                border: "1px solid var(--kc-border)",
                                                background: "var(--kc-bg-main)",
                                                padding: "0 12px",
                                                color: "var(--kc-text-primary)",
                                                outline: "none",
                                            }}
                                        >
                                            <option value="">
                                                {!isLoggedIn
                                                    ? "Log in to choose a profile"
                                                    : isProfilesLoading
                                                        ? "Loading profiles..."
                                                        : myProfiles.length
                                                            ? "Choose profile to link"
                                                            : "No profiles found"}
                                            </option>

                                            {myProfiles.map((p) => {
                                                const id = String(p?._id || "");
                                                if (!id) return null;
                                                const label = p?.business_card_name || p?.full_name || p?.main_heading || p?.profile_slug || "Profile";
                                                const slug = p?.profile_slug ? ` (@${p.profile_slug})` : "";
                                                return (
                                                    <option key={id} value={id}>
                                                        {label}
                                                        {slug}
                                                    </option>
                                                );
                                            })}
                                        </select>

                                        {!isLoggedIn && (
                                            <div style={{ fontSize: 12, marginTop: 6, color: "var(--kc-text-secondary)" }}>
                                                You must be logged in to link a profile before checkout.
                                            </div>
                                        )}
                                    </div>

                                    {/* Buy */}
                                    <button
                                        type="button"
                                        onClick={handleBuy}
                                        className="kc-konarcard__cta kc-konarcard__cta--primary"
                                        disabled={busy}
                                        style={{ cursor: busy ? "not-allowed" : "pointer" }}
                                    >
                                        {busy ? "Starting checkout..." : "Buy KonarCard"}
                                    </button>

                                    <Link to="/register" className="kc-konarcard__cta kc-konarcard__cta--ghost">
                                        Create your profile first
                                    </Link>
                                </div>
                            </div>

                            {/* What you get */}
                            <div className="kc-konarcard__section">
                                <div className="kc-konarcard__sectionHead">
                                    <h2 className="kc-konarcard__h2">What you get</h2>
                                    <p className="kc-konarcard__p">
                                        Everything you need to share your profile instantly — no paper cards, no typing numbers.
                                    </p>
                                </div>

                                <div className="kc-konarcard__featureGrid">
                                    {features.map((f, i) => (
                                        <div className="kc-konarcard__feature" key={i}>
                                            <div className="kc-konarcard__ico" aria-hidden="true">
                                                ✓
                                            </div>
                                            <div>
                                                <div className="kc-konarcard__featureT">{f.t}</div>
                                                <div className="kc-konarcard__featureS">{f.s}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            <Footer />
        </>
    );
}
