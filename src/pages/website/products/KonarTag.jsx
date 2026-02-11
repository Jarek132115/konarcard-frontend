// frontend/src/pages/website/products/KonarTag.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import KonarTag3D from "../../../components/KonarTag3D";

/* ✅ This MUST match the class system used below */
import "../../../styling/products/konartag.css";

/* ✅ White logo (for dark metal finish on the tag) */
import LogoIconWhite from "../../../assets/icons/Logo-Icon-White.svg";

/* ✅ Your QR image (static) */
import CardQrCode from "../../../assets/images/CardQrCode.png";

export default function KonarTag() {
    const [qty, setQty] = useState(1);

    // ---- Logo upload preview (FRONT ONLY) ----
    const [logoUrl, setLogoUrl] = useState("");
    const [logoSize, setLogoSize] = useState(44);

    // black | gold
    const [finish, setFinish] = useState("black");

    /* =========================================================
       SEO — Meta upsert + JSON-LD (SPA-safe)
       NOTE: Canonical set to WWW to match sitemap/robots standardisation.
    ========================================================= */
    useEffect(() => {
        const CANONICAL = "https://www.konarcard.com/products/konartag";

        const title = "KonarTag — NFC Key Tag for Digital Business Cards (UK) | KonarCard";
        const description =
            "KonarTag is a premium NFC key tag for instantly sharing your digital business card in the UK. Tap on iPhone/Android to open your Konar profile, with QR backup if NFC is off.";
        const ogImage = "https://www.konarcard.com/og/konartag.png"; // optional

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

        // Core
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
            description:
                "Premium NFC key tag for sharing a Konar digital business card profile instantly, with QR backup. UK-focused.",
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

        // FAQ JSON-LD (sync with on-page FAQs)
        upsertJsonLd("konartag-faq", {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
                {
                    "@type": "Question",
                    name: "What is KonarTag?",
                    acceptedAnswer: {
                        "@type": "Answer",
                        text: "KonarTag is a premium NFC key tag that opens your Konar digital business card (profile) with a tap. It also includes a QR code backup so people can scan if NFC is turned off.",
                    },
                },
                {
                    "@type": "Question",
                    name: "Does KonarTag work with iPhone and Android?",
                    acceptedAnswer: {
                        "@type": "Answer",
                        text: "Yes. KonarTag works with modern iPhone and Android devices that support NFC. There’s no app required — it opens directly in the browser. If NFC is disabled, the QR code backup still works.",
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
                    name: "What happens if someone’s phone doesn’t read NFC?",
                    acceptedAnswer: {
                        "@type": "Answer",
                        text: "KonarTag includes a QR code on the back. If NFC is off or unsupported, they can scan the QR code to open your profile and save your details.",
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
                {
                    "@type": "Question",
                    name: "Is there a warranty?",
                    acceptedAnswer: {
                        "@type": "Answer",
                        text: "Yes — KonarTag includes a 12 month warranty.",
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

    const onPickLogo = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) return;

        if (logoUrl) URL.revokeObjectURL(logoUrl);
        setLogoUrl(URL.createObjectURL(file));
    };

    const clearLogo = () => {
        if (logoUrl) URL.revokeObjectURL(logoUrl);
        setLogoUrl("");
    };

    const features = useMemo(
        () => [
            { t: "Pocket-friendly", s: "A compact NFC key tag — ideal for keys, vans, and everyday carry." },
            { t: "Tap to share instantly", s: "A single tap opens your Konar digital business card profile." },
            { t: "QR code backup", s: "If NFC is off, contacts can scan the QR and still save your details." },
            { t: "No app needed", s: "Works in the browser on iPhone & Android — fast and simple." },
            { t: "Built for daily use", s: "Durable finish designed for busy days and real work." },
            { t: "One-time purchase", s: "Pay once — keep sharing. Your profile stays up to date anytime." },
        ],
        []
    );

    const faqs = useMemo(
        () => [
            {
                q: "What is KonarTag?",
                a: "KonarTag is a premium NFC key tag that opens your Konar digital business card (profile) with a tap. It also includes a QR code backup on the back.",
            },
            {
                q: "Does it work with iPhone and Android?",
                a: "Yes. It works with modern iPhone and Android devices that support NFC. There’s no app required — it opens in the browser. If NFC is off, the QR backup still works.",
            },
            {
                q: "Do I need an app?",
                a: "No. Your profile opens directly in the browser, so contacts can view and save your details without downloading anything.",
            },
            {
                q: "What if someone’s phone doesn’t read NFC?",
                a: "They can scan the QR code on the back to open your profile and save your contact details.",
            },
            {
                q: "Is it a one-time purchase?",
                a: "Yes — KonarTag is a one-time purchase. You can update your Konar profile anytime and the tag will always point to the latest version.",
            },
            {
                q: "Is there a warranty?",
                a: "Yes — KonarTag includes a 12 month warranty.",
            },
        ],
        []
    );

    const displayedLogo = logoUrl || LogoIconWhite;

    return (
        <>
            <Navbar />

            <main className="kc-tag">
                <div className="kc-tag__wrap">
                    {/* Breadcrumbs */}
                    <div className="kc-tag__crumbs">
                        <Link to="/products" className="kc-tag__crumbLink">
                            Products
                        </Link>
                        <span className="kc-tag__crumbSep">/</span>
                        <span className="kc-tag__crumbHere">KonarTag</span>
                    </div>

                    <div className="kc-tag__grid">
                        {/* LEFT: 3D + Controls */}
                        <div className="kc-tag3d">
                            <div className="kc-tag3d__canvasPad">
                                <KonarTag3D logoSrc={displayedLogo} qrSrc={CardQrCode} logoSize={logoSize} finish={finish} />
                            </div>

                            <div className="kc-tag3d__controls">
                                <div className="kc-tag3d__left">
                                    <div className="kc-tag3d__label">Your logo</div>
                                    <div className="kc-tag3d__sub">Upload any image — preview updates instantly.</div>
                                </div>

                                <div className="kc-tag3d__right">
                                    <div className="kc-tag3d__seg" role="group" aria-label="Choose tag finish">
                                        <button
                                            type="button"
                                            className={`kc-tag3d__segBtn ${finish === "black" ? "is-active" : ""}`}
                                            onClick={() => setFinish("black")}
                                        >
                                            Black
                                        </button>
                                        <button
                                            type="button"
                                            className={`kc-tag3d__segBtn ${finish === "gold" ? "is-active" : ""}`}
                                            onClick={() => setFinish("gold")}
                                        >
                                            Gold
                                        </button>
                                    </div>

                                    <label className="kc-tag3d__btn">
                                        <input type="file" accept="image/*" onChange={onPickLogo} />
                                        Upload logo
                                    </label>

                                    <button
                                        type="button"
                                        className="kc-tag3d__btn kc-tag3d__btn--ghost"
                                        onClick={clearLogo}
                                        disabled={!logoUrl}
                                    >
                                        Remove
                                    </button>

                                    <div className="kc-tag3d__slider">
                                        <span className="kc-tag3d__k">Size</span>
                                        <input
                                            type="range"
                                            min={28}
                                            max={70}
                                            value={logoSize}
                                            onChange={(e) => setLogoSize(Number(e.target.value))}
                                            aria-label="Logo size"
                                        />
                                        <span className="kc-tag3d__v">{logoSize}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: Panel */}
                        <aside className="kc-tag__panel">
                            <div className="kc-tag__pillRow">
                                <span className="kc-tag__pill kc-tag__pill--best">Best for keys</span>
                                <span className="kc-tag__pill kc-tag__pill--warranty">12 Month Warranty</span>
                            </div>

                            {/* ✅ SEO H1 */}
                            <h1 className="kc-tag__title">KonarTag — NFC Key Tag for Digital Business Cards (UK)</h1>

                            <p className="kc-tag__sub">
                                A premium NFC key tag built for everyday use in the UK. Tap compatible iPhone/Android devices to open your
                                Konar profile instantly — with QR backup on the back if NFC is off.
                            </p>

                            <div className="kc-tag__priceRow">
                                <div className="kc-tag__price">£9.99</div>
                                <div className="kc-tag__priceNote">One-time purchase • Tap or scan to share</div>
                            </div>

                            <div className="kc-tag__buyRow" aria-label="Choose quantity and buy">
                                <div className="kc-tag__qty" aria-label="Quantity">
                                    <button
                                        type="button"
                                        className="kc-tag__qtyBtn"
                                        onClick={() => setQty((q) => Math.max(1, q - 1))}
                                        aria-label="Decrease quantity"
                                    >
                                        −
                                    </button>
                                    <div className="kc-tag__qtyVal">{qty}</div>
                                    <button
                                        type="button"
                                        className="kc-tag__qtyBtn"
                                        onClick={() => setQty((q) => Math.min(50, q + 1))}
                                        aria-label="Increase quantity"
                                    >
                                        +
                                    </button>
                                </div>

                                <Link
                                    to="/productandplan/konartag"
                                    state={{ triggerCheckout: true, quantity: qty, finish }}
                                    className="kc-tag__cta kc-tag__cta--primary"
                                >
                                    Buy KonarTag
                                </Link>
                            </div>

                            <div className="kc-tag__secondaryRow">
                                <Link to="/register" className="kc-tag__cta kc-tag__cta--ghost">
                                    Create your profile first
                                </Link>
                            </div>

                            {/* Optional meta block exists in CSS — safe to include (not “random”, already designed) */}
                            <div className="kc-tag__meta" aria-label="Compatibility and key details">
                                <div className="kc-tag__metaItem">
                                    <div className="kc-tag__metaK">Compatibility</div>
                                    <div className="kc-tag__metaV">iPhone & Android (NFC + QR)</div>
                                </div>
                                <div className="kc-tag__metaItem">
                                    <div className="kc-tag__metaK">Best for</div>
                                    <div className="kc-tag__metaV">Keys • Trades • Small business</div>
                                </div>
                                <div className="kc-tag__metaItem">
                                    <div className="kc-tag__metaK">Warranty</div>
                                    <div className="kc-tag__metaV">12 months</div>
                                </div>
                            </div>
                        </aside>
                    </div>

                    {/* What you get */}
                    <section className="kc-tag__section">
                        <div className="kc-tag__sectionHead">
                            <h2 className="kc-tag__h2">What you get</h2>
                            <p className="kc-tag__p">
                                Everything you need to share your details in seconds — tap to open your profile, or scan the QR if NFC is
                                off.
                            </p>
                        </div>

                        <div className="kc-tag__cards">
                            {features.map((f, i) => (
                                <div className="kc-tag__card" key={i}>
                                    <div className="kc-tag__ico" aria-hidden="true">
                                        ✓
                                    </div>
                                    <div className="kc-tag__cardT">{f.t}</div>
                                    <div className="kc-tag__cardS">{f.s}</div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* FAQ */}
                    <section className="kc-tag__section">
                        <div className="kc-tag__sectionHead">
                            <h2 className="kc-tag__h2">KonarTag FAQ</h2>
                            <p className="kc-tag__p">Quick answers about compatibility, NFC, QR backup, and how KonarTag works in the UK.</p>
                        </div>

                        <div className="kc-tag__cards">
                            {faqs.map((f, i) => (
                                <div className="kc-tag__card" key={i}>
                                    <div className="kc-tag__ico" aria-hidden="true">
                                        ?
                                    </div>
                                    <div className="kc-tag__cardT">{f.q}</div>
                                    <div className="kc-tag__cardS">{f.a}</div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </main>

            <Footer />
        </>
    );
}
