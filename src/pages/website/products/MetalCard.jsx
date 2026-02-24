// frontend/src/pages/website/products/MetalCard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import MetalCard3D from "../../../components/MetalCard3D";

/* ✅ typography tokens */
import "../../../styling/fonts.css";

/* ✅ same page CSS system as Plastic */
import "../../../styling/products/konarcard.css";

/* ✅ reuse the exact homepage “Worth it” section system */
import "../../../styling/home/value.css";

/* Logos */
import LogoIcon from "../../../assets/icons/Logo-Icon.svg";
import LogoIconWhite from "../../../assets/icons/Logo-Icon-White.svg";

/* QR image (static) */
import CardQrCode from "../../../assets/images/CardQrCode.png";

import api from "../../../services/api";
import { useMyProfiles } from "../../../hooks/useBusinessCard";

/* ✅ same icons (consistency) */
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

export default function MetalCard() {
    const navigate = useNavigate();
    const location = useLocation();

    const PRODUCT_KEY = "metal-card";

    const [qty, setQty] = useState(1);

    // Metal finish: black | gold
    const [finish, setFinish] = useState("black");

    const [logoUrl, setLogoUrl] = useState("");
    const [logoFile, setLogoFile] = useState(null);

    const [logoPreset, setLogoPreset] = useState("medium");
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

    // checkout return messages
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

    // restore intent for this product
    useEffect(() => {
        const intent = readIntent();
        if (!intent) return;
        if (intent.productKey !== PRODUCT_KEY) return;

        if (typeof intent.quantity === "number") setQty(Math.max(1, Math.min(20, intent.quantity)));
        if (typeof intent.profileId === "string") setProfileId(intent.profileId);

        if (intent.finish === "black" || intent.finish === "gold") setFinish(intent.finish);

        if (intent.logoPreset === "small" || intent.logoPreset === "medium" || intent.logoPreset === "large") {
            setLogoPreset(intent.logoPreset);
        }

        if (intent.hadLogo) setInfoMsg("Please re-upload your logo to continue checkout.");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // default profile
    useEffect(() => {
        if (!isLoggedIn) return;
        if (profileId) return;
        if (!Array.isArray(myProfiles) || myProfiles.length === 0) return;

        const firstId = String(myProfiles?.[0]?._id || "");
        if (firstId) setProfileId(firstId);
    }, [isLoggedIn, myProfiles, profileId]);

    // persist intent while configuring
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
            finish,
            logoPreset,
            returnTo: location.pathname,
            createdAt: base?.createdAt || Date.now(),
            updatedAt: Date.now(),
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [qty, profileId, logoFile, finish, logoPreset, location.pathname, location.search]);

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

    const goLogin = () => {
        navigate("/login", { state: { from: location.pathname } });
    };

    /* ✅ “What you get” benefits (same structure + tone as Plastic, but premium/metal angle) */
    const features = useMemo(
        () => [
            { icon: OneJobIcon, t: "Premium metal that stands out", s: "Heavier feel designed to leave a strong first impression." },
            { icon: NoReprintsIcon, t: "No reprints, ever", s: "Update your details anytime — no reordering required." },
            { icon: UpToDateIcon, t: "Always up to date", s: "Your latest work, reviews, and services stay live instantly." },
            { icon: WorksEverywhereIcon, t: "Works everywhere", s: "In person, online, or on the phone — no apps needed." },
            { icon: HammerIcon, t: "Built for serious trades", s: "Clean, practical, and made for the way you actually work." },
            { icon: ProfessionalFastIcon, t: "Looks premium fast", s: "Metal helps you look the part before you even speak." },
        ],
        []
    );

    /* ✅ “Product details” specs (match grid style used on homepage value.css) */
    const specs = useMemo(
        () => [
            { k: "Card size", v: "85.6 × 54 mm — standard wallet size" },
            { k: "Thickness", v: "0.8 mm — premium metal build" },
            { k: "Material", v: "Premium metal body with a durable finish" },
            { k: "NFC", v: "NFC enabled — works with iPhone & Android" },
            { k: "QR backup", v: "Printed QR code on the back for instant access" },
            { k: "Setup", v: "Linked to your Konar profile — update anytime, no reprints" },
        ],
        []
    );

    // preview: black finish uses white icon by default
    const defaultLogo = finish === "black" ? LogoIconWhite : LogoIcon;
    const displayedLogo = logoUrl || defaultLogo;

    const logoLabel = logoFile?.name || "Upload logo";
    const sizeLabel = (k) => (k === "small" ? "S" : k === "medium" ? "M" : "L");

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
                finish,
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
                    finish,
                    edition: "metal",
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
                {/* =====================
                    HERO (same as Plastic style)
                ====================== */}
                <section className="kc-topHero" aria-label="Metal KonarCard hero">
                    <div className="kc-konarcard__wrap">
                        <div className="kc-heroHeadWrap kc-heroHeadWrap--lg">
                            <div className="kc-topHero__head">
                                <div className="kc-crumbPill" aria-label="Breadcrumb">
                                    <Link to="/products" className="kc-crumbPill__link">
                                        Products
                                    </Link>
                                    <span className="kc-crumbPill__sep">/</span>
                                    <span className="kc-crumbPill__here">KonarCard – Metal</span>
                                </div>

                                {/* ✅ match Plastic: heading uses h2 class */}
                                <h1 className="h2 kc-premHero__title">Metal NFC Business Card (UK)</h1>

                                <p className="kc-premHero__sub">
                                    Premium metal that stands out — tap to share your profile in seconds, with a QR backup so it works on every phone.
                                </p>

                                <div className="kc-topHero__badges">
                                    <span className="kc-badge kc-badge--orange">Premium</span>
                                    <span className="kc-badge">12 Month Warranty</span>
                                </div>

                                {(errorMsg || infoMsg) && (
                                    <div className="kc-msgBox">{errorMsg ? `⚠️ ${errorMsg}` : `ℹ️ ${infoMsg}`}</div>
                                )}
                            </div>
                        </div>

                        <div className="kc-premStage">
                            <div className="kc-premStage__canvasPad">
                                <MetalCard3D logoSrc={displayedLogo} qrSrc={CardQrCode} logoSize={logoPercent} finish={finish} />
                            </div>

                            {/* ✅ keep configurator + buy (same grid) */}
                            <div className="kc-controls" aria-label="Configure your card">
                                <div className="kc-configGrid">
                                    {/* Logo */}
                                    <div className="kc-controlCell kc-cell--logo">
                                        <div className="kc-controlK">Logo</div>

                                        <div className="kc-inlineRow">
                                            <label className="kc-textAction" title="Upload logo">
                                                <input type="file" accept="image/*" onChange={onPickLogo} />
                                                {logoLabel}
                                            </label>

                                            <button
                                                type="button"
                                                className="kc-textAction kc-textAction--muted"
                                                onClick={clearLogo}
                                                disabled={!logoUrl || busy}
                                                title="Remove logo"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>

                                    {/* Logo size */}
                                    <div className="kc-controlCell kc-cell--size">
                                        <div className="kc-controlK">Logo size</div>

                                        <div className="kc-inlineRow" role="group" aria-label="Choose logo size">
                                            {["small", "medium", "large"].map((k) => (
                                                <button
                                                    key={k}
                                                    type="button"
                                                    className={`kc-toggleText ${logoPreset === k ? "is-active" : ""}`}
                                                    onClick={() => setLogoPreset(k)}
                                                    disabled={busy}
                                                >
                                                    {sizeLabel(k)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Finish */}
                                    <div className="kc-controlCell kc-cell--colour">
                                        <div className="kc-controlK">Finish</div>

                                        <div className="kc-inlineRow" role="group" aria-label="Choose metal finish">
                                            <button
                                                type="button"
                                                className={`kc-toggleText ${finish === "black" ? "is-active" : ""}`}
                                                onClick={() => setFinish("black")}
                                                disabled={busy}
                                            >
                                                Black
                                            </button>
                                            <button
                                                type="button"
                                                className={`kc-toggleText ${finish === "gold" ? "is-active" : ""}`}
                                                onClick={() => setFinish("gold")}
                                                disabled={busy}
                                            >
                                                Gold
                                            </button>
                                        </div>
                                    </div>

                                    {/* Profile */}
                                    <div className="kc-controlCell kc-cell--profile">
                                        <div className="kc-controlK">Link to profile</div>

                                        <div className="kc-profileBox kc-profileBox--sm">
                                            {!isLoggedIn ? (
                                                <div className="kc-profileLoggedOut">
                                                    <span>Please login</span>
                                                    <button type="button" className="kc-loginInline" onClick={goLogin}>
                                                        Login
                                                    </button>
                                                </div>
                                            ) : (
                                                <select
                                                    className="kc-profileSelect kc-profileSelect--boxed"
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

                                    {/* BUY */}
                                    <div className="kc-buyArea kc-cell--buy" aria-label="Buy">
                                        <div className="kc-buyMeta">
                                            {/* update if your backend price differs */}
                                            <div className="kc-buyPrice">£44.99</div>
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

                                            <button type="button" onClick={handleBuy} className="kx-btn kx-btn--black kc-buyBtnFit" disabled={busy}>
                                                {busy ? "Starting checkout..." : "Buy KonarCard"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* =====================
                    PRODUCT DETAILS (khv style)
                    bg: #fafafa (default)
                ====================== */}
                <section className="khv kc-plastic-khv" aria-label="Product details">
                    <div className="khv__inner">
                        <header className="khv__head">
                            <p className="kc-pill khv__kicker">Product details</p>

                            <h2 className="h3 khv__title">
                                Everything <span className="khv__accent">you need</span> to know about <br />
                                your metal NFC business card
                            </h2>

                            <p className="kc-subheading khv__sub">
                                Premium metal build. Durable finish. Works instantly with NFC and QR.
                            </p>
                        </header>

                        <div className="khv__grid" aria-label="Metal card specifications">
                            {specs.map((s, i) => (
                                <article className="khv__cell kc-specCell" key={i}>
                                    <p className="kc-pill kc-specPill">{s.k}</p>
                                    <p className="body khv__cellDesc kc-specValue">{s.v}</p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                {/* =====================
                    WHAT YOU GET (khv style)
                    bg: #ffffff
                ====================== */}
                <section className="khv khv--white kc-plastic-khv" aria-label="What you get">
                    <div className="khv__inner">
                        <header className="khv__head">
                            <p className="kc-pill khv__kicker">What you get</p>

                            <h2 className="h3 khv__title">
                                Everything <span className="khv__accent">you need</span> to look <br />
                                premium
                            </h2>

                            <p className="kc-subheading khv__sub">
                                Make a strong first impression instantly — and update your details anytime without reprinting.
                            </p>
                        </header>

                        <div className="khv__grid" aria-label="Metal card benefits">
                            {features.map((it, i) => (
                                <article className="khv__cell" key={i}>
                                    <div className="khv__icon" aria-hidden="true">
                                        <img className="khv__iconImg" src={it.icon} alt="" loading="lazy" decoding="async" />
                                    </div>

                                    <h3 className="kc-title khv__cellTitle">{it.t}</h3>
                                    <p className="body khv__cellDesc">{it.s}</p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                {/* =====================
                    GALLERY (same as Plastic)
                    bg: #fafafa
                ====================== */}
                <section className="kc-section kc-section--soft" aria-label="Metal NFC Business Card gallery">
                    <div className="kc-section__inner">
                        <div className="kc-section__head">
                            <p className="kc-pill kc-section__pill">Metal NFC Business Card Gallery</p>
                            <h2 className="kc-section__title">
                                Made to look <span className="kc-accentWord">premium</span>
                            </h2>
                            <p className="kc-section__sub">
                                Built for trades who want a premium first impression and a profile that stays up to date.
                            </p>
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