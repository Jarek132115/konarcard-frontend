// frontend/src/pages/website/products/PlasticCard.jsx
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

/* ✅ your saved SVG icons */
import OneJobIcon from "../../../assets/icons/OneJob.svg";
import NoReprintsIcon from "../../../assets/icons/NoReprints.svg";
import UpToDateIcon from "../../../assets/icons/UpToDate.svg";
import WorksEverywhereIcon from "../../../assets/icons/WorksEverywhere.svg";
import HammerIcon from "../../../assets/icons/Hammer.svg";
import ProfessionalFastIcon from "../../../assets/icons/ProfessionalFast.svg";

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

const PRESET_TO_PERCENT = {
    small: 60,
    medium: 70,
    large: 80,
};

export default function PlasticCard() {
    const navigate = useNavigate();
    const location = useLocation();

    const PRODUCT_KEY = "plastic-card";

    const [qty, setQty] = useState(1);
    const [cardVariant, setCardVariant] = useState("white"); // "white" | "black"

    const [logoUrl, setLogoUrl] = useState("");
    const [logoFile, setLogoFile] = useState(null);

    const [logoPreset, setLogoPreset] = useState("medium"); // small | medium | large
    const logoPercent = PRESET_TO_PERCENT[logoPreset] || 70;

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
        if (typeof intent.profileId === "string") setProfileId(intent.profileId);

        if (intent.cardVariant === "black" || intent.cardVariant === "white") setCardVariant(intent.cardVariant);

        if (intent.logoPreset === "small" || intent.logoPreset === "medium" || intent.logoPreset === "large") {
            setLogoPreset(intent.logoPreset);
        }

        if (intent.hadLogo) setInfoMsg("Please re-upload your logo to continue checkout.");
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
            profileId,
            hadLogo: !!logoFile,
            cardVariant,
            logoPreset,
            returnTo: location.pathname,
            createdAt: base?.createdAt || Date.now(),
            updatedAt: Date.now(),
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [qty, profileId, logoFile, cardVariant, logoPreset, location.pathname, location.search]);

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
            { icon: OneJobIcon, t: "One job pays for everything", s: "Land one extra job and it covers your card and profile." },
            { icon: NoReprintsIcon, t: "No reprints, ever", s: "Update your details anytime without reordering cards." },
            { icon: UpToDateIcon, t: "Always up to date", s: "Your latest work, reviews, and services — instantly." },
            { icon: WorksEverywhereIcon, t: "Works everywhere", s: "In person, online, on any phone. No apps needed." },
            { icon: HammerIcon, t: "Built for real trades", s: "Simple, practical, and made for how you actually work." },
            { icon: ProfessionalFastIcon, t: "Looks professional fast", s: "Build trust before you even speak." },
        ],
        []
    );

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
                profileId,
                hadLogo: !!logoFile,
                cardVariant,
                logoPreset,
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
                    logoPercent,
                    logoPreset,
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

    return (
        <>
            <Navbar />

            <main className="kc-konarcard kc-konarcard--premium kc-page">
                {/* ===== TOP HERO (grid bg) ===== */}
                <section className="kc-topHero" aria-label="Plastic KonarCard hero">
                    <div className="kc-konarcard__wrap">
                        <div className="kc-topHero__head">
                            {/* breadcrumb pill */}
                            <div className="kc-crumbPill" aria-label="Breadcrumb">
                                <Link to="/products" className="kc-crumbPill__link">
                                    Products
                                </Link>
                                <span className="kc-crumbPill__sep">/</span>
                                <span className="kc-crumbPill__here">KonarCard – Plastic</span>
                            </div>

                            {/* tightened copy */}
                            <h1 className="kc-premHero__title">Plastic NFC Business Card (UK)</h1>
                            <p className="kc-premHero__sub">Tap to share your Konar profile instantly — with QR backup on the back.</p>

                            {/* badges */}
                            <div className="kc-topHero__badges">
                                <span className="kc-badge kc-badge--orange">Best Value</span>
                                <span className="kc-badge">12 Month Warranty</span>
                            </div>

                            {(errorMsg || infoMsg) && <div className="kc-msgBox">{errorMsg ? `⚠️ ${errorMsg}` : `ℹ️ ${infoMsg}`}</div>}
                        </div>

                        {/* preview (do not style the actual 3D card component) */}
                        <div className="kc-premStage">
                            <div className="kc-premStage__canvasPad">
                                <PlasticCard3D logoSrc={displayedLogo} qrSrc={CardQrCode} logoSize={logoPercent} variant={cardVariant} />
                            </div>

                            {/* CONTROLS (2x2, no background container) */}
                            <div className="kc-controls" aria-label="Configure your card">
                                <div className="kc-controlsGrid">
                                    {/* Upload logo */}
                                    <div className="kc-controlCell">
                                        <div className="kc-controlK">Logo</div>

                                        <div className="kc-controlStack">
                                            <div className="kc-controlRow kc-controlRow--center">
                                                <label className="kc-controlBtn">
                                                    <input type="file" accept="image/*" onChange={onPickLogo} />
                                                    {logoUrl ? "Replace logo" : "Upload logo"}
                                                </label>

                                                <button
                                                    type="button"
                                                    className="kc-controlBtn kc-controlBtn--ghost"
                                                    onClick={clearLogo}
                                                    disabled={!logoUrl || busy}
                                                >
                                                    Remove
                                                </button>
                                            </div>

                                            <div className="kc-controlHint">Optional — if skipped, we’ll use the Konar “K”.</div>
                                        </div>
                                    </div>

                                    {/* Logo size */}
                                    <div className="kc-controlCell">
                                        <div className="kc-controlK">Logo size</div>

                                        <div className="kc-controlRow kc-controlRow--center" role="group" aria-label="Choose logo size">
                                            <button
                                                type="button"
                                                className={`kc-chip ${logoPreset === "small" ? "is-active" : ""}`}
                                                onClick={() => setLogoPreset("small")}
                                                disabled={busy}
                                            >
                                                Small
                                            </button>
                                            <button
                                                type="button"
                                                className={`kc-chip ${logoPreset === "medium" ? "is-active" : ""}`}
                                                onClick={() => setLogoPreset("medium")}
                                                disabled={busy}
                                            >
                                                Medium
                                            </button>
                                            <button
                                                type="button"
                                                className={`kc-chip ${logoPreset === "large" ? "is-active" : ""}`}
                                                onClick={() => setLogoPreset("large")}
                                                disabled={busy}
                                            >
                                                Large
                                            </button>
                                        </div>
                                    </div>

                                    {/* Colour */}
                                    <div className="kc-controlCell">
                                        <div className="kc-controlK">Colour</div>

                                        <div className="kc-controlRow kc-controlRow--center" role="group" aria-label="Choose card colour">
                                            <button
                                                type="button"
                                                className={`kc-chip ${cardVariant === "white" ? "is-active" : ""}`}
                                                onClick={() => setCardVariant("white")}
                                                disabled={busy}
                                            >
                                                White
                                            </button>
                                            <button
                                                type="button"
                                                className={`kc-chip ${cardVariant === "black" ? "is-active" : ""}`}
                                                onClick={() => setCardVariant("black")}
                                                disabled={busy}
                                            >
                                                Black
                                            </button>
                                        </div>
                                    </div>

                                    {/* Choose profile */}
                                    <div className="kc-controlCell">
                                        <div className="kc-controlK">Link to profile</div>

                                        <div className="kc-controlStack">
                                            <select
                                                className="kc-profileSelect kc-profileSelect--clean"
                                                value={profileId}
                                                onChange={(e) => setProfileId(e.target.value)}
                                                disabled={!isLoggedIn || busy || isProfilesLoading}
                                                aria-label="Choose profile"
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
                                                        p?.business_card_name || p?.full_name || p?.main_heading || p?.profile_slug || "Profile";
                                                    const slug = p?.profile_slug ? ` (@${p.profile_slug})` : "";
                                                    return (
                                                        <option key={id} value={id}>
                                                            {label}
                                                            {slug}
                                                        </option>
                                                    );
                                                })}
                                            </select>

                                            {!isLoggedIn && <div className="kc-controlHint">You must be logged in to link a profile before checkout.</div>}
                                        </div>
                                    </div>
                                </div>

                                {/* BUY AREA (qty above black CTA) */}
                                <div className="kc-buyArea" aria-label="Buy">
                                    <div className="kc-buyMeta">
                                        <div className="kc-buyPrice">£29.99</div>
                                        <div className="kc-buyMicro">Premium PVC • NFC + QR backup • Ships fast</div>
                                    </div>

                                    <div className="kc-buyControls">
                                        <div className="kc-qtySm" aria-label="Quantity">
                                            <button
                                                type="button"
                                                className="kc-qtySm__btn"
                                                onClick={() => setQty((q) => Math.max(1, q - 1))}
                                                disabled={busy}
                                                aria-label="Decrease quantity"
                                            >
                                                −
                                            </button>
                                            <div className="kc-qtySm__val">{qty}</div>
                                            <button
                                                type="button"
                                                className="kc-qtySm__btn"
                                                onClick={() => setQty((q) => Math.min(20, q + 1))}
                                                disabled={busy}
                                                aria-label="Increase quantity"
                                            >
                                                +
                                            </button>
                                        </div>

                                        <button type="button" onClick={handleBuy} className="kc-buyBlackBtn" disabled={busy}>
                                            {busy ? "Starting checkout..." : "Buy KonarCard"}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* end hero wrap */}
                        </div>
                    </div>
                </section>

                {/* ====== FULL-WIDTH SECTIONS ====== */}
                <section className="kc-section kc-section--soft" aria-label="Product details">
                    <div className="kc-section__inner">
                        <div className="kc-section__head">
                            <p className="kc-pill kc-section__pill">Product details</p>
                            <h2 className="kc-section__title">Everything you need to know</h2>
                            <p className="kc-section__sub">Materials, sizing, and tech — simple and clear.</p>
                        </div>

                        <div className="kc-detailsGrid">
                            {specs.map((s, i) => (
                                <div className="kc-detailsItem" key={i}>
                                    <div className="kc-detailsK">{s.k}</div>
                                    <div className="kc-detailsV">{s.v}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="kc-section kc-section--white" aria-label="What you get">
                    <div className="kc-section__inner">
                        <div className="kc-section__head">
                            <p className="kc-pill kc-section__pill">What you get</p>
                            <h2 className="kc-section__title">Everything you need to look professional</h2>
                            <p className="kc-section__sub">A simple tool that makes you look professional instantly — and keeps everything up to date.</p>
                        </div>

                        <div className="kc-whatGrid" role="list" aria-label="What you get features">
                            {features.map((f, i) => (
                                <article className="kc-whatCard" key={i} role="listitem">
                                    <div className="kc-whatIcon" aria-hidden="true">
                                        <img className="kc-whatSvg" src={f.icon} alt="" loading="lazy" decoding="async" />
                                    </div>
                                    <h3 className="kc-whatTitle">{f.t}</h3>
                                    <p className="kc-whatDesc">{f.s}</p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="kc-section kc-section--soft" aria-label="Made to look premium">
                    <div className="kc-section__inner">
                        <div className="kc-section__head">
                            <p className="kc-pill kc-section__pill">Made to look premium</p>
                            <h2 className="kc-section__title">Made to look premium</h2>
                            <p className="kc-section__sub">Placeholder gallery (swap these for real photos later).</p>
                        </div>

                        <div className="kc-premiumGrid" aria-label="Premium gallery placeholders">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div className="kc-premiumTile" key={i} aria-hidden="true" />
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
}
