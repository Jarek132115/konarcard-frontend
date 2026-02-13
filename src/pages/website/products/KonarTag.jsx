// frontend/src/pages/website/products/KonarTag.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import KonarTag3D from "../../../components/KonarTag3D";

/* ✅ USE SAME CSS SYSTEM AS PLASTIC/METAL (includes kc-configGrid layout) */
import "../../../styling/products/konarcard.css";

/* Logos */
import LogoIcon from "../../../assets/icons/Logo-Icon.svg";
import LogoIconWhite from "../../../assets/icons/Logo-Icon-White.svg";

/* QR image (static) */
import CardQrCode from "../../../assets/images/CardQrCode.png";

import api from "../../../services/api";
import { useMyProfiles } from "../../../hooks/useBusinessCard";

/* ✅ reuse feature icons for consistency */
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

export default function KonarTag() {
    const navigate = useNavigate();
    const location = useLocation();

    const PRODUCT_KEY = "konartag";

    const [qty, setQty] = useState(1);

    // black | gold (tag finish)
    const [finish, setFinish] = useState("black");

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

    /* =========================================================
       SEO — Meta upsert + JSON-LD (SPA-safe)
    ========================================================= */
    useEffect(() => {
        const CANONICAL = "https://www.konarcard.com/products/konartag";
        const title = "KonarTag — NFC Key Tag for Digital Business Cards (UK) | KonarCard";
        const description =
            "KonarTag is a premium NFC key tag for instantly sharing your digital business card in the UK. Tap on iPhone/Android to open your Konar profile, with QR backup if NFC is off.";
        const ogImage = "https://www.konarcard.com/og/konartag.png";

        const upsertMeta = (nameOrProp, content, isProperty = false) => {
            if (!content) return;
            const selector = isProperty ? `meta[property="${nameOrProp}"]` : `meta[name="${nameOrProp}"]`;
            let el = document.head.querySelector(selector);
            if (!el) {
                el = document.createElement("meta");
                if (isProperty) el.setAttribute("property", nameOrProp);
                else el.setAttribute("name", nameOrProp);
                document.head.appendChild(el);
            }
            el.setAttribute("content", content);
        };

        const upsertLink = (rel, href) => {
            if (!href) return;
            let el = document.head.querySelector(`link[rel="${rel}"]`);
            if (!el) {
                el = document.createElement("link");
                el.setAttribute("rel", rel);
                document.head.appendChild(el);
            }
            el.setAttribute("href", href);
        };

        const upsertJsonLd = (id, json) => {
            const scriptId = `jsonld-${id}`;
            let el = document.getElementById(scriptId);
            if (!el) {
                el = document.createElement("script");
                el.type = "application/ld+json";
                el.id = scriptId;
                document.head.appendChild(el);
            }
            el.text = JSON.stringify(json);
        };

        document.title = title;

        upsertLink("canonical", CANONICAL);
        upsertMeta("description", description);
        upsertMeta("robots", "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1");

        // Open Graph
        upsertMeta("og:type", "product", true);
        upsertMeta("og:site_name", "KonarCard", true);
        upsertMeta("og:title", title, true);
        upsertMeta("og:description", description, true);
        upsertMeta("og:url", CANONICAL, true);
        upsertMeta("og:image", ogImage, true);

        // Twitter
        upsertMeta("twitter:card", "summary_large_image");
        upsertMeta("twitter:title", title);
        upsertMeta("twitter:description", description);
        upsertMeta("twitter:image", ogImage);

        // Product JSON-LD
        upsertJsonLd("konartag-product", {
            "@context": "https://schema.org",
            "@type": "Product",
            name: "KonarTag",
            description: "Premium NFC key tag for sharing a Konar digital business card profile instantly, with QR backup. UK-focused.",
            brand: { "@type": "Brand", name: "KonarCard" },
            image: [ogImage],
            sku: "konartag",
            offers: {
                "@type": "Offer",
                url: CANONICAL,
                priceCurrency: "GBP",
                price: "9.99",
                availability: "https://schema.org/InStock",
                itemCondition: "https://schema.org/NewCondition",
            },
        });

        // FAQ JSON-LD
        upsertJsonLd("konartag-faq", {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
                {
                    "@type": "Question",
                    name: "Does KonarTag work with iPhone and Android?",
                    acceptedAnswer: {
                        "@type": "Answer",
                        text: "Yes. KonarTag works with modern iPhone and Android devices that support NFC. No app is required — it opens in the browser. If NFC is disabled, the QR backup still works.",
                    },
                },
                {
                    "@type": "Question",
                    name: "Do I need an app to use KonarTag?",
                    acceptedAnswer: {
                        "@type": "Answer",
                        text: "No. KonarTag opens your Konar profile in the browser, so contacts can save your details without downloading anything.",
                    },
                },
                {
                    "@type": "Question",
                    name: "Is KonarTag a one-time purchase?",
                    acceptedAnswer: {
                        "@type": "Answer",
                        text: "Yes. KonarTag is a one-time purchase. You can update your Konar profile anytime, and the tag will always point to the latest version.",
                    },
                },
            ],
        });
    }, []);

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

        if (typeof intent.quantity === "number") setQty(Math.max(1, Math.min(50, intent.quantity)));
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

    const specs = useMemo(
        () => [
            { k: "Tag size", v: "Compact key-tag size (everyday carry)" },
            { k: "Material", v: "Durable metal body with premium finish" },
            { k: "Finish", v: "Black or Gold" },
            { k: "NFC", v: "Tap compatible (works with iPhone & Android)" },
            { k: "QR backup", v: "Printed on the rear for instant scan access" },
            { k: "Setup", v: "Link to your Konar profile — updates anytime" },
        ],
        []
    );

    const features = useMemo(
        () => [
            { icon: WorksEverywhereIcon, t: "Pocket-friendly", s: "A compact NFC tag — ideal for keys, vans, and everyday carry." },
            { icon: UpToDateIcon, t: "Tap to share instantly", s: "A single tap opens your Konar profile in seconds." },
            { icon: NoReprintsIcon, t: "QR backup included", s: "If NFC is off, they can scan the QR and still save your details." },
            { icon: HammerIcon, t: "Built for daily use", s: "Durable finish designed for busy days and real work." },
            { icon: OneJobIcon, t: "One-time purchase", s: "Pay once — keep sharing. Your profile stays up to date anytime." },
            { icon: ProfessionalFastIcon, t: "Looks professional fast", s: "Clean, premium, and easy to share anywhere." },
        ],
        []
    );

    const logoLabel = logoFile?.name || "Upload logo";
    const sizeLabel = (k) => (k === "small" ? "S" : k === "medium" ? "M" : "L");

    // ✅ KonarTag: BOTH finishes default to white logo (matches your request)
    const defaultLogo = LogoIconWhite;
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
            setErrorMsg("You need at least 1 profile before buying a KonarTag. Please create a profile first.");
            return;
        }

        if (!profileId) {
            setErrorMsg("Please choose which profile to link to this KonarTag before checkout.");
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
                    edition: "tag",
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
                <section className="kc-topHero" aria-label="KonarTag hero">
                    <div className="kc-konarcard__wrap">
                        <div className="kc-heroHeadWrap kc-heroHeadWrap--lg">
                            <div className="kc-topHero__head">
                                <div className="kc-crumbPill" aria-label="Breadcrumb">
                                    <Link to="/products" className="kc-crumbPill__link">
                                        Products
                                    </Link>
                                    <span className="kc-crumbPill__sep">/</span>
                                    <span className="kc-crumbPill__here">KonarTag</span>
                                </div>

                                <h1 className="kc-premHero__title">KonarTag NFC Key Tag (UK)</h1>
                                <p className="kc-premHero__sub">
                                    Pocket-friendly. Tap to share your Konar profile instantly — with QR backup on the back.
                                </p>

                                <div className="kc-topHero__badges">
                                    <span className="kc-badge kc-badge--orange">Best for keys</span>
                                    <span className="kc-badge">12 Month Warranty</span>
                                </div>

                                {(errorMsg || infoMsg) && (
                                    <div className="kc-msgBox">{errorMsg ? `⚠️ ${errorMsg}` : `ℹ️ ${infoMsg}`}</div>
                                )}
                            </div>
                        </div>

                        <div className="kc-premStage">
                            <div className="kc-premStage__canvasPad">
                                <KonarTag3D logoSrc={displayedLogo} qrSrc={CardQrCode} logoSize={logoPercent} finish={finish} />
                            </div>

                            {/* ✅ EXACT SAME GRID SYSTEM AS PLASTIC:
                                Wide: 3 columns (2 controls left, BUY middle, 2 controls right)
                                Not wide: controls become 2x2 and BUY drops underneath (handled by CSS)
                            */}
                            <div className="kc-controls" aria-label="Configure your KonarTag">
                                <div className="kc-configGrid">
                                    {/* Logo (left) */}
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

                                    {/* Finish (left bottom) */}
                                    <div className="kc-controlCell kc-cell--colour">
                                        <div className="kc-controlK">Finish</div>

                                        <div className="kc-inlineRow" role="group" aria-label="Choose finish">
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

                                    {/* Logo size (right top) */}
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

                                    {/* Profile (right bottom) */}
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

                                    {/* ✅ BUY (middle column on wide) */}
                                    <div className="kc-buyArea kc-cell--buy" aria-label="Buy">
                                        <div className="kc-buyMeta">
                                            <div className="kc-buyPrice">£9.99</div>
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
                                                    onClick={() => setQty((q) => Math.min(50, q + 1))}
                                                    disabled={busy}
                                                    aria-label="Increase quantity"
                                                >
                                                    +
                                                </button>
                                            </div>

                                            <button type="button" onClick={handleBuy} className="kx-btn kx-btn--black kc-buyBtnFit" disabled={busy}>
                                                {busy ? "Starting checkout..." : "Buy KonarTag"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
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
                            <h2 className="kc-section__title">Everything you need to share faster</h2>
                            <p className="kc-section__sub">A simple tool for everyday carry — tap or scan and you’re done.</p>
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
