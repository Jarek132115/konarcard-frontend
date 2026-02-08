import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import PlasticCard3D from "../../../components/PlasticCard3D";

import "../../../styling/products/konarcard.css";

import LogoIcon from "../../../assets/icons/Logo-Icon.svg";
import LogoIconWhite from "../../../assets/icons/Logo-Icon-White.svg";
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
    } catch { }
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
    const [cardVariant, setCardVariant] = useState("white"); // "white" | "black"

    const [logoUrl, setLogoUrl] = useState("");
    const [logoFile, setLogoFile] = useState(null);
    const [logoSize, setLogoSize] = useState(44);

    const [profileId, setProfileId] = useState("");
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

    const profilesQuery = useMyProfiles();
    const isProfilesLoading = !!profilesQuery?.isLoading;

    const myProfiles = (() => {
        const d = profilesQuery?.data;
        if (Array.isArray(d)) return d;
        if (Array.isArray(d?.data)) return d.data;
        if (Array.isArray(d?.data?.data)) return d.data.data;
        return [];
    })();

    useEffect(() => {
        return () => {
            if (logoUrl) URL.revokeObjectURL(logoUrl);
        };
    }, [logoUrl]);

    useEffect(() => {
        const sp = new URLSearchParams(location.search);
        const checkout = sp.get("checkout");

        if (checkout === "success") {
            setErrorMsg("");
            setInfoMsg("✅ Payment received! We’ll email you confirmation shortly.");
            writeIntent(null);
            return;
        }

        if (checkout === "cancel") {
            setErrorMsg("Checkout cancelled. You can try again anytime.");
            setInfoMsg("");
            return;
        }
    }, [location.search]);

    useEffect(() => {
        const intent = readIntent();
        if (!intent) return;
        if (intent.productKey !== PRODUCT_KEY) return;

        if (typeof intent.quantity === "number") setQty(Math.max(1, Math.min(20, intent.quantity)));
        if (typeof intent.logoSize === "number") setLogoSize(Math.max(28, Math.min(70, intent.logoSize)));
        if (typeof intent.profileId === "string") setProfileId(intent.profileId);

        if (intent.cardVariant === "black" || intent.cardVariant === "white") {
            setCardVariant(intent.cardVariant);
        }

        if (intent.hadLogo) setInfoMsg("Please re-upload your logo to continue checkout.");
    }, []);

    useEffect(() => {
        if (!isLoggedIn) return;
        if (profileId) return;
        if (!Array.isArray(myProfiles) || myProfiles.length === 0) return;

        const firstId = String(myProfiles?.[0]?._id || "");
        if (firstId) setProfileId(firstId);
    }, [isLoggedIn, myProfiles, profileId]);

    useEffect(() => {
        const sp = new URLSearchParams(location.search);
        const checkout = sp.get("checkout");
        if (checkout === "success") return;

        const existing = readIntent();
        const base = existing && typeof existing === "object" && existing.productKey === PRODUCT_KEY ? existing : null;

        writeIntent({
            ...(base || {}),
            productKey: PRODUCT_KEY,
            quantity: qty,
            logoSize,
            profileId,
            hadLogo: !!logoFile,
            cardVariant,
            returnTo: location.pathname,
            createdAt: base?.createdAt || Date.now(),
            updatedAt: Date.now(),
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [qty, logoSize, profileId, logoFile, cardVariant, location.pathname, location.search]);

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

    // ✅ Default logo depends on variant (REAL svg for black)
    const defaultLogo = cardVariant === "black" ? LogoIconWhite : LogoIcon;
    const displayedLogo = logoUrl || defaultLogo;

    const handleBuy = async () => {
        setErrorMsg("");
        setInfoMsg("");

        if (!isLoggedIn) {
            const existing = readIntent();
            writeIntent({
                ...(existing && typeof existing === "object" ? existing : {}),
                productKey: PRODUCT_KEY,
                quantity: qty,
                logoSize,
                profileId,
                hadLogo: !!logoFile,
                cardVariant,
                returnTo: location.pathname,
                createdAt: existing?.createdAt || Date.now(),
                updatedAt: Date.now(),
            });

            navigate("/login", { state: { from: location.pathname } });
            return;
        }

        if (!myProfiles.length) {
            setErrorMsg("You need at least 1 profile before buying a card. Please create a profile first.");
            return;
        }

        if (!profileId) {
            setErrorMsg("Please choose which profile to link to this card before checkout.");
            return;
        }

        setBusy(true);
        try {
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

            const resp = await api.post("/api/checkout/nfc/session", {
                productKey: PRODUCT_KEY,
                quantity: qty,
                profileId,
                logoUrl: savedLogoUrl || "",
                preview: {
                    logoSize,
                    usedCustomLogo: !!savedLogoUrl,
                    cardVariant,
                },
            });

            if (resp?.status >= 400 || !resp?.data?.url) {
                throw new Error(resp?.data?.error || "Failed to start checkout");
            }

            writeIntent(null);
            window.location.href = resp.data.url;
        } catch (e) {
            setErrorMsg(e?.message || "Checkout failed. Please try again.");
        } finally {
            setBusy(false);
        }
    };

    const specs = useMemo(
        () => [
            { k: "Card size", v: "85.6 × 54 mm (standard bank card)" },
            { k: "Thickness", v: "0.76 mm" },
            { k: "Material", v: "Premium PVC plastic, smooth matte finish" },
            { k: "NFC", v: "NTAG compatible (works with iPhone & Android)" },
            { k: "QR backup", v: "Printed on the rear for instant scan access" },
            { k: "Setup", v: "Link to your Konar profile — updates anytime" },
        ],
        []
    );

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
                                A clean NFC business card that shares your Konar profile instantly — with QR backup on the back.
                            </p>

                            {(errorMsg || infoMsg) && (
                                <div
                                    style={{
                                        marginTop: 12,
                                        padding: "10px 12px",
                                        borderRadius: 12,
                                        border: "1px solid var(--kc-border)",
                                        background: "rgba(12, 24, 48, 0.03)",
                                        color: "rgba(12, 24, 48, 0.9)",
                                        fontSize: 14,
                                    }}
                                >
                                    {errorMsg ? `⚠️ ${errorMsg}` : `ℹ️ ${infoMsg}`}
                                </div>
                            )}
                        </div>

                        <div className="kc-premStage">
                            <div className="kc-premStage__canvasPad">
                                <PlasticCard3D
                                    logoSrc={displayedLogo}
                                    qrSrc={CardQrCode}
                                    logoSize={logoSize}
                                    variant={cardVariant}
                                />
                            </div>

                            <div className="kc-variantRow">
                                <div className="kc-variantToggle" role="group" aria-label="Choose card colour">
                                    <button
                                        type="button"
                                        className={`kc-variantBtn ${cardVariant === "white" ? "is-active" : ""}`}
                                        onClick={() => setCardVariant("white")}
                                    >
                                        White
                                    </button>
                                    <button
                                        type="button"
                                        className={`kc-variantBtn ${cardVariant === "black" ? "is-active" : ""}`}
                                        onClick={() => setCardVariant("black")}
                                    >
                                        Black
                                    </button>
                                </div>
                            </div>

                            {/* ✅ SAME HEIGHT PANELS */}
                            <div className="kc-pc-panels kc-pc-panels--equal">
                                {/* Left */}
                                <div className="kc-pc-card kc-pc-logoCard kc-pc-card--stretch">
                                    <div className="kc-pc-logoHead">
                                        <div className="kc-pc-logoTitle">Your logo</div>
                                        <div className="kc-pc-logoSub">Upload any image — preview updates instantly.</div>
                                    </div>

                                    <div className="kc-pc-logoPreview kc-pc-logoPreview--flex" aria-label="Logo preview">
                                        {logoUrl ? <img src={logoUrl} alt="Uploaded logo preview" /> : <div className="kc-pc-plus">+</div>}
                                    </div>

                                    <div className="kc-pc-logoActions">
                                        <label className="kc-premBtn">
                                            <input type="file" accept="image/*" onChange={onPickLogo} />
                                            Upload logo
                                        </label>

                                        <button
                                            type="button"
                                            className="kc-premBtn kc-premBtn--ghost"
                                            onClick={clearLogo}
                                            disabled={!logoUrl || busy}
                                        >
                                            Remove
                                        </button>
                                    </div>

                                    <div className="kc-pc-sliderRow">
                                        <span>Size</span>
                                        <input
                                            type="range"
                                            min={28}
                                            max={70}
                                            value={logoSize}
                                            onChange={(e) => setLogoSize(Number(e.target.value))}
                                            aria-label="Logo size"
                                            disabled={busy}
                                        />
                                        <span className="kc-pc-sliderVal">{logoSize}%</span>
                                    </div>
                                </div>

                                {/* Right */}
                                <div className="kc-pc-card kc-pc-buyCard kc-pc-card--stretch" aria-label="Checkout options">
                                    <div className="kc-premPrice__value">£29.99</div>
                                    <div className="kc-premPrice__note">
                                        One-time purchase • {cardVariant === "black" ? "Black card" : "White card"} • Works with your profile
                                    </div>

                                    {/* ✅ qty + profile on same row */}
                                    <div className="kc-buyRow">
                                        <div className="kc-qtySm" aria-label="Quantity">
                                            <button
                                                type="button"
                                                className="kc-qtySm__btn"
                                                onClick={() => setQty((q) => Math.max(1, q - 1))}
                                                aria-label="Decrease quantity"
                                                disabled={busy}
                                            >
                                                −
                                            </button>
                                            <div className="kc-qtySm__val">{qty}</div>
                                            <button
                                                type="button"
                                                className="kc-qtySm__btn"
                                                onClick={() => setQty((q) => Math.min(20, q + 1))}
                                                aria-label="Increase quantity"
                                                disabled={busy}
                                            >
                                                +
                                            </button>
                                        </div>

                                        <div className="kc-buyRow__select">
                                            <select
                                                value={profileId}
                                                onChange={(e) => setProfileId(e.target.value)}
                                                disabled={!isLoggedIn || busy || isProfilesLoading}
                                                aria-label="Choose profile"
                                                className="kc-profileSelect"
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
                                                    const label =
                                                        p?.business_card_name ||
                                                        p?.full_name ||
                                                        p?.main_heading ||
                                                        p?.profile_slug ||
                                                        "Profile";
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
                                                <div className="kc-buyHint">
                                                    You must be logged in to link a profile before checkout.
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleBuy}
                                        className="kc-buyMainBtn"
                                        disabled={busy}
                                    >
                                        {busy ? "Starting checkout..." : "Buy KonarCard"}
                                    </button>
                                </div>
                            </div>

                            {/* ✅ NEW SPECS / DETAILS */}
                            <div className="kc-pc-card kc-specCard" aria-label="Product specifications">
                                <div className="kc-specHead">
                                    <div className="kc-specTitle">Product details</div>
                                    <div className="kc-specSub">Everything you need to know — materials, sizing, and tech.</div>
                                </div>

                                <div className="kc-specGrid">
                                    {specs.map((s, i) => (
                                        <div className="kc-specItem" key={i}>
                                            <div className="kc-specK">{s.k}</div>
                                            <div className="kc-specV">{s.v}</div>
                                        </div>
                                    ))}
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
                                    {[
                                        { t: "Tap to share instantly", s: "Open your profile on any modern phone with an NFC tap." },
                                        { t: "QR code backup", s: "If NFC is off, they can scan and still save your details." },
                                        { t: "Works with your Konar profile", s: "Your card always links to your live profile — edits update instantly." },
                                        { t: "No app needed", s: "Works in the browser on iPhone and Android." },
                                        { t: "Built for real trades", s: "Clean, durable, and made to be shared every day." },
                                        { t: "One-time purchase", s: "Buy once. Share forever." },
                                    ].map((f, i) => (
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
