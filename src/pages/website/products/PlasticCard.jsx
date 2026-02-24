// frontend/src/pages/website/products/PlasticCard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import PlasticCard3D from "../../../components/PlasticCard3D";

import "../../../styling/products/konarcard.css";
import "../../../styling/fonts.css";

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
            { icon: OneJobIcon, t: "One job pays for everything", s: "One extra job can easily cover the cost of your card." },
            { icon: NoReprintsIcon, t: "No reprints, ever", s: "Update your details anytime — no reordering required." },
            { icon: UpToDateIcon, t: "Always up to date", s: "Your latest work, reviews, and services stay live instantly." },
            { icon: WorksEverywhereIcon, t: "Works everywhere", s: "In person, online, or on the phone — no apps needed." },
            { icon: HammerIcon, t: "Built for real trades", s: "Designed for everyday work, not office desks." },
            { icon: ProfessionalFastIcon, t: "Looks professional fast", s: "Make a strong first impression in seconds." },
        ],
        []
    );

    const specs = useMemo(
        () => [
            { k: "Card size", v: "85.6 × 54 mm – standard wallet size" },
            { k: "Thickness", v: "0.76 mm – same thickness as a bank card" },
            { k: "Material", v: "Durable PVC plastic with a smooth matte finish" },
            { k: "NFC", v: "NFC enabled – works with iPhone & Android" },
            { k: "QR backup", v: "Printed QR code on the back for instant access" },
            { k: "Setup", v: "Linked to your Konar profile – update anytime, no reprints" },
        ],
        []
    );

    const defaultLogo = cardVariant === "black" ? LogoIconWhite : LogoIcon;
    const displayedLogo = logoUrl || defaultLogo;

    const goLogin = () => {
        navigate("/login", { state: { from: location.pathname } });
    };

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

            goLogin();
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

    const logoLabel = logoFile?.name || "Upload logo";
    const sizeLabel = (k) => (k === "small" ? "S" : k === "medium" ? "M" : "L");

    return (
        <>
            <Navbar />

            <main className="kc-konarcard kc-page">
                {/* =========================
                    HERO (match 2nd image)
                   ========================= */}
                <section className="kcp-hero" aria-label="Plastic KonarCard hero">
                    <div className="kcp-hero__inner">
                        <header className="kcp-hero__head">
                            <div className="kcp-crumbPill" aria-label="Breadcrumb">
                                <Link to="/products" className="kcp-crumbPill__link">
                                    Products
                                </Link>
                                <span className="kcp-crumbPill__sep">/</span>
                                <span className="kcp-crumbPill__here">KonarCard – Plastic</span>
                            </div>

                            {/* ✅ requested: main heading uses h2 class */}
                            <h1 className="h2 kcp-hero__title">
                                Plastic NFC <span className="kcp-accent">Business Card</span> (UK)
                            </h1>

                            <p className="kc-subheading kcp-hero__sub">
                                Tap to share your profile in seconds — with a QR backup so it works on every phone.
                            </p>

                            <div className="kcp-hero__badges" aria-label="Highlights">
                                <span className="kcp-badge kcp-badge--orange">Best Value</span>
                                <span className="kcp-badge">12 Month Warranty</span>
                            </div>

                            {(errorMsg || infoMsg) && (
                                <div className="kcp-msgBox">{errorMsg ? `⚠️ ${errorMsg}` : `ℹ️ ${infoMsg}`}</div>
                            )}
                        </header>

                        <div className="kcp-stage">
                            <div className="kcp-stage__canvas">
                                <PlasticCard3D
                                    logoSrc={displayedLogo}
                                    qrSrc={CardQrCode}
                                    logoSize={logoPercent}
                                    variant={cardVariant}
                                />
                            </div>

                            {/* ✅ keep controls + CTA (but restyled to match new design) */}
                            <div className="kcp-config" aria-label="Configure your card">
                                <div className="kcp-config__grid">
                                    {/* Logo */}
                                    <div className="kcp-control">
                                        <div className="kcp-control__k">Logo</div>

                                        <div className="kcp-control__row">
                                            <label className="kcp-textAction" title="Upload logo">
                                                <input type="file" accept="image/*" onChange={onPickLogo} />
                                                {logoLabel}
                                            </label>

                                            <button
                                                type="button"
                                                className="kcp-textAction kcp-textAction--muted"
                                                onClick={clearLogo}
                                                disabled={!logoUrl || busy}
                                                title="Remove logo"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>

                                    {/* Colour */}
                                    <div className="kcp-control">
                                        <div className="kcp-control__k">Colour</div>

                                        <div className="kcp-control__row" role="group" aria-label="Choose card colour">
                                            <button
                                                type="button"
                                                className={`kcp-toggle ${cardVariant === "white" ? "is-active" : ""}`}
                                                onClick={() => setCardVariant("white")}
                                                disabled={busy}
                                            >
                                                White
                                            </button>
                                            <button
                                                type="button"
                                                className={`kcp-toggle ${cardVariant === "black" ? "is-active" : ""}`}
                                                onClick={() => setCardVariant("black")}
                                                disabled={busy}
                                            >
                                                Black
                                            </button>
                                        </div>
                                    </div>

                                    {/* BUY (center) */}
                                    <div className="kcp-buy" aria-label="Buy">
                                        <div className="kcp-buy__price">£29.99</div>

                                        <div className="kcp-buy__row">
                                            <div className="kcp-qty" aria-label="Quantity">
                                                <button
                                                    type="button"
                                                    className="kcp-qty__btn"
                                                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                                                    disabled={busy}
                                                    aria-label="Decrease quantity"
                                                >
                                                    −
                                                </button>
                                                <div className="kcp-qty__val">{qty}</div>
                                                <button
                                                    type="button"
                                                    className="kcp-qty__btn"
                                                    onClick={() => setQty((q) => Math.min(20, q + 1))}
                                                    disabled={busy}
                                                    aria-label="Increase quantity"
                                                >
                                                    +
                                                </button>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={handleBuy}
                                                className="kx-btn kx-btn--black kcp-buy__btn"
                                                disabled={busy}
                                            >
                                                {busy ? "Starting checkout..." : "Buy KonarCard"}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Logo size */}
                                    <div className="kcp-control">
                                        <div className="kcp-control__k">Logo size</div>

                                        <div className="kcp-control__row" role="group" aria-label="Choose logo size">
                                            {["small", "medium", "large"].map((k) => (
                                                <button
                                                    key={k}
                                                    type="button"
                                                    className={`kcp-toggle ${logoPreset === k ? "is-active" : ""}`}
                                                    onClick={() => setLogoPreset(k)}
                                                    disabled={busy}
                                                >
                                                    {sizeLabel(k)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Profile */}
                                    <div className="kcp-control">
                                        <div className="kcp-control__k">Link to profile</div>

                                        <div className="kcp-profileBox">
                                            {!isLoggedIn ? (
                                                <div className="kcp-profileLoggedOut">
                                                    <span>Please login</span>
                                                    <button type="button" className="kcp-loginInline" onClick={goLogin}>
                                                        Login
                                                    </button>
                                                </div>
                                            ) : (
                                                <select
                                                    className="kcp-profileSelect"
                                                    value={profileId}
                                                    onChange={(e) => setProfileId(e.target.value)}
                                                    disabled={busy || isProfilesLoading}
                                                    aria-label="Choose profile"
                                                >
                                                    <option value="">
                                                        {isProfilesLoading ? "Loading..." : myProfiles.length ? "Choose profile" : "No profiles"}
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

                                                        return (
                                                            <option key={id} value={id}>
                                                                {label}
                                                            </option>
                                                        );
                                                    })}
                                                </select>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* =========================
                    DETAILS (2nd image copy)
                   ========================= */}
                <section className="kcp-section kcp-section--soft" aria-label="Product details">
                    <div className="kcp-section__inner">
                        <header className="kcp-section__head">
                            <p className="kc-pill kcp-section__pill">Product details</p>

                            <h2 className="h3 kcp-section__title">
                                Everything <span className="kcp-accent">you need to know</span> about
                                <br />
                                your NFC business card
                            </h2>

                            <p className="kc-subheading kcp-section__sub">
                                Built to standard bank card size. Durable for daily use. Works instantly with NFC and QR.
                            </p>
                        </header>

                        <div className="kcp-detailsGrid" aria-label="Specs">
                            {specs.map((s, i) => (
                                <div className="kcp-detailsItem" key={i}>
                                    <div className="kcp-detailsK">{s.k}</div>
                                    <div className="body kcp-detailsV">{s.v}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* =========================
                    WHAT YOU GET
                   ========================= */}
                <section className="kcp-section kcp-section--white" aria-label="What you get">
                    <div className="kcp-section__inner">
                        <header className="kcp-section__head">
                            <p className="kc-pill kcp-section__pill">What you get</p>

                            <h2 className="h3 kcp-section__title">
                                Everything <span className="kcp-accent">you need</span> to look
                                <br />
                                professional
                            </h2>

                            <p className="kc-subheading kcp-section__sub">
                                Make a strong first impression instantly — and update your details anytime without reprinting.
                            </p>
                        </header>

                        <div className="kcp-whatGrid" role="list" aria-label="Benefits">
                            {features.map((f, i) => (
                                <article className="kcp-whatCard" key={i} role="listitem">
                                    <div className="kcp-whatIcon" aria-hidden="true">
                                        <img className="kcp-whatSvg" src={f.icon} alt="" loading="lazy" decoding="async" />
                                    </div>
                                    <h3 className="kc-title kcp-whatTitle">{f.t}</h3>
                                    <p className="body kcp-whatDesc">{f.s}</p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                {/* =========================
                    GALLERY
                   ========================= */}
                <section className="kcp-section kcp-section--soft" aria-label="Plastic card gallery">
                    <div className="kcp-section__inner">
                        <header className="kcp-section__head">
                            {/* ✅ fix UX/SEO: pill should NOT repeat heading */}
                            <p className="kc-pill kcp-section__pill">Plastic NFC Business Card Gallery</p>

                            <h2 className="h3 kcp-section__title">
                                Made to look <span className="kcp-accent">premium</span>
                            </h2>

                            <p className="kc-subheading kcp-section__sub">
                                Built for plumbers, electricians, builders and UK trades who need to share details fast on site.
                            </p>
                        </header>

                        {/* ✅ placeholder tiles (swap to real images later) */}
                        <div className="kcp-galleryGrid" aria-label="Gallery placeholders">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div className="kcp-galleryTile" key={i} aria-hidden="true" />
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
}