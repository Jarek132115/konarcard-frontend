// frontend/src/pages/website/products/MetalCard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import MetalCard3D from "../../../components/MetalCard3D";

/* ✅ SAME CSS system as PlasticCard */
import "../../../styling/products/konarcard.css";

/* Placeholder logo */
import LogoIcon from "../../../assets/icons/Logo-Icon.svg";

/* QR image (static) */
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

const PRESET_TO_PERCENT = {
    small: 60,
    medium: 70,
    large: 80,
};

export default function MetalCard() {
    const navigate = useNavigate();
    const location = useLocation();

    // ✅ keep consistent intent storage per product
    const PRODUCT_KEY = "metal-card";

    const [qty, setQty] = useState(1);

    // Finish: black | gold
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
       NOTE: Canonical set to WWW to match sitemap/robots standardisation.
       (NO className changes, NO layout changes)
    ========================================================= */
    useEffect(() => {
        const CANONICAL = "https://www.konarcard.com/products/metal";
        const title = "Metal NFC Business Card (UK) — KonarCard Metal Edition";
        const description =
            "KonarCard Metal Edition is a premium metal NFC business card in the UK. Tap to share your digital business card instantly on iPhone/Android, with QR backup on the back.";

        const ogImage = "https://www.konarcard.com/og/metal-card.png"; // optional

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
        upsertJsonLd("metal-product", {
            "@context": "https://schema.org",
            "@type": "Product",
            name: "KonarCard Metal Edition",
            description:
                "Premium metal NFC business card for instantly sharing a Konar digital business card profile, with QR backup. UK-focused.",
            brand: { "@type": "Brand", name: "KonarCard" },
            image: [ogImage],
            sku: "metal-card",
            offers: {
                "@type": "Offer",
                url: CANONICAL,
                priceCurrency: "GBP",
                price: "59.99",
                availability: "https://schema.org/InStock",
                itemCondition: "https://schema.org/NewCondition",
            },
        });

        // FAQ JSON-LD (aligned to copy on page)
        upsertJsonLd("metal-faq", {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
                {
                    "@type": "Question",
                    name: "Does the Metal KonarCard work with iPhone and Android?",
                    acceptedAnswer: {
                        "@type": "Answer",
                        text: "Yes. Metal KonarCard works with modern iPhone and Android devices that support NFC. No app is required — it opens in the browser. If NFC is off, the QR code backup still works.",
                    },
                },
                {
                    "@type": "Question",
                    name: "What’s the difference between Metal and Plastic?",
                    acceptedAnswer: {
                        "@type": "Answer",
                        text: "Metal Edition has a premium, heavier feel designed to stand out. Both editions share tap-to-share profile linking and QR code backup.",
                    },
                },
                {
                    "@type": "Question",
                    name: "Can I update my details after I buy?",
                    acceptedAnswer: {
                        "@type": "Answer",
                        text: "Yes. Your card links to your Konar profile, so you can update your details anytime and the card will always share the latest version.",
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

    // Handle checkout return messages (same behaviour as PlasticCard)
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

    // Restore intent for this product
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
    }, []);

    // Default profile (same as PlasticCard)
    useEffect(() => {
        if (!isLoggedIn) return;
        if (profileId) return;
        if (!Array.isArray(myProfiles) || myProfiles.length === 0) return;

        const firstId = String(myProfiles?.[0]?._id || "");
        if (firstId) setProfileId(firstId);
    }, [isLoggedIn, myProfiles, profileId]);

    // Persist intent while configuring (same pattern)
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

    const displayedLogo = logoUrl || LogoIcon;

    const features = useMemo(
        () => [
            { t: "Premium metal finish", s: "A heavier, luxury feel designed to stand out." },
            { t: "No reprints, ever", s: "Update your details anytime without reordering cards." },
            { t: "Always up to date", s: "Your latest work, reviews, and services — instantly." },
            { t: "Works everywhere", s: "In person, online, on any phone. No apps needed." },
            { t: "QR backup included", s: "If NFC is off, they can scan the QR and still save your details." },
            { t: "Looks premium fast", s: "Metal makes a strong first impression before you even speak." },
        ],
        []
    );

    const specs = useMemo(
        () => [
            { k: "Card size", v: "85.6 × 54 mm (standard bank card)" },
            { k: "Thickness", v: "0.8 mm (premium metal build)" },
            { k: "Material", v: "Premium metal body, engraved-style finish options" },
            { k: "NFC", v: "NTAG compatible (works with iPhone & Android)" },
            { k: "QR backup", v: "Printed on the rear for instant scan access" },
            { k: "Setup", v: "Link to your Konar profile — updates anytime" },
        ],
        []
    );

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
                <div className="kc-konarcard__wrap">
                    <section className="kc-premHero kc-premHero--clean">
                        <div className="kc-premHero__top">
                            <div className="kc-premHero__crumbs">
                                <Link to="/products" className="kc-konarcard__crumbLink">
                                    Products
                                </Link>
                                <span className="kc-konarcard__crumbSep">/</span>
                                <span className="kc-konarcard__crumbHere">KonarCard – Metal</span>
                            </div>

                            <h1 className="kc-premHero__title">Metal NFC Business Card (UK) — KonarCard Metal Edition</h1>

                            <p className="kc-premHero__sub">
                                A premium metal NFC business card for the UK. Tap to share your digital business card instantly — with QR
                                backup on the back if NFC is off.
                            </p>

                            <div className="kc-premHero__badges">
                                <span className="kc-konarcard__pill kc-konarcard__pill--best">Premium</span>
                                <span className="kc-konarcard__pill kc-konarcard__pill--warranty">12 Month Warranty</span>
                            </div>

                            {(errorMsg || infoMsg) && (
                                <div className="kc-msgBox">{errorMsg ? `⚠️ ${errorMsg}` : `ℹ️ ${infoMsg}`}</div>
                            )}
                        </div>

                        <div className="kc-premStage">
                            <div className="kc-premStage__canvasPad">
                                <MetalCard3D logoSrc={displayedLogo} qrSrc={CardQrCode} logoSize={logoPercent} finish={finish} />
                            </div>

                            {/* ✅ SAME CONFIG BAR PATTERN AS PLASTIC (classes already styled in konarcard.css) */}
                            <div className="kc-configBar" aria-label="Configure your card">
                                <div className="kc-configBar__row">
                                    <div className="kc-configGroup">
                                        <div className="kc-configLabel">Finish</div>

                                        {/* Use existing finish styles already added to konarcard.css */}
                                        <div className="kc-konarcard__finish" role="group" aria-label="Choose metal finish">
                                            <button
                                                type="button"
                                                className={`kc-konarcard__finishBtn ${finish === "black" ? "is-active" : ""}`}
                                                onClick={() => setFinish("black")}
                                                disabled={busy}
                                            >
                                                Black
                                            </button>
                                            <button
                                                type="button"
                                                className={`kc-konarcard__finishBtn ${finish === "gold" ? "is-active" : ""}`}
                                                onClick={() => setFinish("gold")}
                                                disabled={busy}
                                            >
                                                Gold
                                            </button>
                                        </div>
                                    </div>

                                    <div className="kc-configGroup">
                                        <div className="kc-configLabel">Logo</div>

                                        <div className="kc-logoActions">
                                            <label className="kc-uploadPill">
                                                <input type="file" accept="image/*" onChange={onPickLogo} />
                                                {logoUrl ? "Replace logo" : "Upload logo"}
                                            </label>

                                            <button
                                                type="button"
                                                className="kc-uploadPill kc-uploadPill--ghost"
                                                onClick={clearLogo}
                                                disabled={!logoUrl || busy}
                                            >
                                                Remove
                                            </button>
                                        </div>

                                        <div className="kc-configHint">Optional — if skipped, we’ll use the Konar “K”.</div>
                                    </div>

                                    <div className="kc-configGroup">
                                        <div className="kc-configLabel">Logo size</div>
                                        <div className="kc-sizePills" role="group" aria-label="Choose logo size">
                                            <button
                                                type="button"
                                                className={`kc-sizeBtn ${logoPreset === "small" ? "is-active" : ""}`}
                                                onClick={() => setLogoPreset("small")}
                                                disabled={busy}
                                            >
                                                Small
                                            </button>
                                            <button
                                                type="button"
                                                className={`kc-sizeBtn ${logoPreset === "medium" ? "is-active" : ""}`}
                                                onClick={() => setLogoPreset("medium")}
                                                disabled={busy}
                                            >
                                                Medium
                                            </button>
                                            <button
                                                type="button"
                                                className={`kc-sizeBtn ${logoPreset === "large" ? "is-active" : ""}`}
                                                onClick={() => setLogoPreset("large")}
                                                disabled={busy}
                                            >
                                                Large
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ✅ SAME PURCHASE CARD AS PLASTIC */}
                            <div className="kc-purchaseCard" aria-label="Purchase">
                                <div className="kc-purchaseCard__price">
                                    <div className="kc-purchasePrice">£59.99</div>
                                    <div className="kc-purchaseMicro">Premium metal • NFC + QR backup • Ships fast</div>
                                </div>

                                <div className="kc-purchaseCard__controls">
                                    <div className="kc-purchaseTop">
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

                                        <select
                                            className="kc-profileSelect kc-profileSelect--premium"
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
                                    </div>

                                    {!isLoggedIn && (
                                        <div className="kc-buyHint">You must be logged in to link a profile before checkout.</div>
                                    )}

                                    <button type="button" onClick={handleBuy} className="kc-buyMainBtn kc-buyMainBtn--wide" disabled={busy}>
                                        {busy ? "Starting checkout..." : "Buy KonarCard"}
                                    </button>
                                </div>
                            </div>

                            {/* PRODUCT DETAILS */}
                            <div className="kc-specSection" aria-label="Product details">
                                <div className="kc-specHead">
                                    <div className="kc-specTitle">Product details</div>
                                    <div className="kc-specSub">Materials, sizing, and tech — simple and clear.</div>
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

                            {/* WHAT YOU GET */}
                            <section className="kc-benefits" aria-label="What you get">
                                <div className="kc-benefits__head">
                                    <h2 className="kc-benefits__title">What you get</h2>
                                    <p className="kc-benefits__sub">
                                        A simple tool that makes you look premium instantly — and keeps everything up to date.
                                    </p>
                                </div>

                                <div className="kc-benefits__grid">
                                    {features.map((f, i) => (
                                        <article className="kc-benefitCard" key={i}>
                                            <div className="kc-benefitCard__icon" aria-hidden="true">
                                                <span className="kc-benefitDot" />
                                            </div>
                                            <div className="kc-benefitCard__body">
                                                <div className="kc-benefitCard__t">{f.t}</div>
                                                <div className="kc-benefitCard__s">{f.s}</div>
                                            </div>
                                            <div className="kc-benefitCard__sheen" aria-hidden="true" />
                                        </article>
                                    ))}
                                </div>
                            </section>

                            {/* 8 EXAMPLES GRID */}
                            <section className="kc-gallery" aria-label="In the wild">
                                <div className="kc-gallery__head">
                                    <h2 className="kc-gallery__title">Made to look premium</h2>
                                    <p className="kc-gallery__sub">
                                        Swap in your real graphics later — these are placeholders for a clean “logo card grid” section.
                                    </p>
                                </div>

                                <div className="kc-gallery__grid">
                                    {Array.from({ length: 8 }).map((_, i) => (
                                        <div className="kc-galleryTile" key={i}>
                                            <div className="kc-galleryTile__inner">
                                                <div className="kc-galleryMark">K</div>
                                                <div className="kc-galleryMeta">
                                                    <div className="kc-galleryLine" />
                                                    <div className="kc-galleryLine kc-galleryLine--short" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    </section>
                </div>
            </main>

            <Footer />
        </>
    );
}
