// src/pages/website/products/PlasticCard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import PlasticCard3D from "../../../components/PlasticCard3D";

/* ✅ Page CSS */
import "../../../styling/products/konarcard.css";

/* Use Konar logo as placeholder (same as navbar) */
import LogoIcon from "../../../assets/icons/Logo-Icon.svg";

/* ✅ Your QR image (static) */
import CardQrCode from "../../../assets/images/CardQrCode.png";

export default function PlasticCard() {
    const [qty, setQty] = useState(1);

    // ---- Logo upload preview (FRONT ONLY) ----
    const [logoUrl, setLogoUrl] = useState("");
    const [logoSize, setLogoSize] = useState(44);

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

    return (
        <>
            <Navbar />

            <main className="kc-konarcard kc-konarcard--premium kc-page">
                <div className="kc-konarcard__wrap">
                    <section className="kc-premHero kc-premHero--clean">
                        {/* ✅ TOP (keep as-is) */}
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
                        </div>

                        {/* ✅ PRODUCT AREA (small tweak: add bottom spacing so shadow never gets covered) */}
                        <div className="kc-premStage kc-premStage--padBottom">
                            <PlasticCard3D logoSrc={displayedLogo} qrSrc={CardQrCode} logoSize={logoSize} />

                            {/* ✅ Controls + buy row grouped into a “purchase panel” */}
                            <div className="kc-purchase">
                                <div className="kc-purchase__grid">
                                    {/* left: logo controls */}
                                    <div className="kc-purchase__card">
                                        <div className="kc-purchase__head">
                                            <div>
                                                <div className="kc-purchase__title">Your logo</div>
                                                <div className="kc-purchase__sub">Upload any image — preview updates instantly.</div>
                                            </div>

                                            <div className="kc-purchase__actions">
                                                <label className="kc-premBtn">
                                                    <input type="file" accept="image/*" onChange={onPickLogo} />
                                                    Upload logo
                                                </label>

                                                <button
                                                    type="button"
                                                    className="kc-premBtn kc-premBtn--ghost"
                                                    onClick={clearLogo}
                                                    disabled={!logoUrl}
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>

                                        <div className="kc-purchase__sliderRow">
                                            <div className="kc-premSlider kc-premSlider--full">
                                                <span className="kc-premSlider__k">Size</span>
                                                <input
                                                    type="range"
                                                    min={28}
                                                    max={70}
                                                    value={logoSize}
                                                    onChange={(e) => setLogoSize(Number(e.target.value))}
                                                    aria-label="Logo size"
                                                />
                                                <span className="kc-premSlider__v">{logoSize}%</span>
                                            </div>
                                        </div>

                                        <div className="kc-miniNote">
                                            Tip: choose a high-resolution PNG/SVG for the cleanest print.
                                        </div>
                                    </div>

                                    {/* right: purchase */}
                                    <div className="kc-purchase__card">
                                        <div className="kc-purchase__priceRow">
                                            <div className="kc-premPrice">
                                                <div className="kc-premPrice__value">£29.99</div>
                                                <div className="kc-premPrice__note">One-time purchase • Works with your profile</div>
                                            </div>

                                            <div className="kc-konarcard__qty">
                                                <button
                                                    type="button"
                                                    className="kc-konarcard__qtyBtn"
                                                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                                                    aria-label="Decrease quantity"
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
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>

                                        <div className="kc-purchase__ctaRow">
                                            <Link
                                                to="/productandplan/konarcard"
                                                state={{ triggerCheckout: true, quantity: qty, edition: "plastic" }}
                                                className="kc-konarcard__cta kc-konarcard__cta--primary kc-konarcard__cta--wide"
                                            >
                                                Buy KonarCard
                                            </Link>

                                            <Link
                                                to="/register"
                                                className="kc-konarcard__cta kc-konarcard__cta--ghost kc-konarcard__cta--wide"
                                            >
                                                Create your profile first
                                            </Link>
                                        </div>

                                        <div className="kc-badgelist">
                                            <span className="kc-badgeMini">Free profile updates</span>
                                            <span className="kc-badgeMini">Ships fast</span>
                                            <span className="kc-badgeMini">Secure checkout</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ✅ “What you get” redesigned (same content, nicer layout) */}
                            <div className="kc-konarcard__section kc-section">
                                <div className="kc-section__head">
                                    <h2 className="kc-konarcard__h2">What you get</h2>
                                    <p className="kc-konarcard__p">
                                        Everything you need to share your profile instantly — no paper cards, no typing numbers.
                                    </p>
                                </div>

                                <div className="kc-featureGrid2">
                                    {features.map((f, i) => (
                                        <div className="kc-feature2" key={i}>
                                            <div className="kc-feature2__dot" aria-hidden="true">
                                                ✓
                                            </div>
                                            <div className="kc-feature2__body">
                                                <div className="kc-feature2__t">{f.t}</div>
                                                <div className="kc-feature2__s">{f.s}</div>
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
