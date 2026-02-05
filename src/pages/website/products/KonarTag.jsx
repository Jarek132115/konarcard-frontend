// frontend/src/pages/website/products/KonarTag.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import KonarTag3D from "../../../components/KonarTag3D";

/* ✅ Page CSS (SAME system as Plastic/Metal) */
import "../../../styling/products/konarcard.css";

/* ✅ White logo (for dark metal finish on the tag) */
import LogoIconWhite from "../../../assets/icons/Logo-Icon-White.svg";

/* ✅ Your QR image (static) */
import CardQrCode from "../../../assets/images/CardQrCode.png";

export default function KonarTag() {
    const [qty, setQty] = useState(1);

    // ---- Logo upload preview (FRONT ONLY) ----
    const [logoUrl, setLogoUrl] = useState("");
    const [logoSize, setLogoSize] = useState(44);

    // black | gold (same idea as you asked)
    const [finish, setFinish] = useState("black");

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
            { t: "Pocket-friendly", s: "Small, simple, and always with your keys." },
            { t: "Tap to share instantly", s: "Open your Konar profile on compatible phones with a tap." },
            { t: "QR code backup", s: "If NFC is off, they can scan and still save your details." },
            { t: "No app needed", s: "Works right in the browser — iPhone & Android." },
            { t: "Built for daily use", s: "Durable design made for keys, vans, and site days." },
            { t: "One-time purchase", s: "Buy once. Share forever." },
        ],
        []
    );

    // ✅ default tag “logo” is the WHITE icon so it reads on black metal
    const displayedLogo = logoUrl || LogoIconWhite;

    return (
        <>
            <Navbar />

            {/* ✅ same shell + spacing as Plastic/Metal */}
            <main className="kc-konarcard kc-konarcard--premium kc-page">
                <div className="kc-konarcard__wrap">
                    <section className="kc-premHero kc-premHero--clean">
                        <div className="kc-premHero__top">
                            <div className="kc-premHero__crumbs">
                                <Link to="/products" className="kc-konarcard__crumbLink">
                                    Products
                                </Link>
                                <span className="kc-konarcard__crumbSep">/</span>
                                <span className="kc-konarcard__crumbHere">KonarTag</span>
                            </div>

                            <h1 className="kc-premHero__title">KonarTag</h1>

                            <div className="kc-premHero__badges">
                                <span className="kc-konarcard__pill kc-konarcard__pill--best">Best for keys</span>
                                <span className="kc-konarcard__pill kc-konarcard__pill--warranty">12 Month Warranty</span>
                            </div>

                            <p className="kc-premHero__sub">
                                A premium NFC key tag that shares your Konar profile instantly — with QR backup on the back.
                            </p>
                        </div>

                        <div className="kc-premStage">
                            {/* ✅ spacing pad so the shadow never gets covered */}
                            <div className="kc-premStage__canvasPad">
                                <KonarTag3D
                                    logoSrc={displayedLogo}
                                    qrSrc={CardQrCode}
                                    logoSize={logoSize}
                                    finish={finish}
                                />
                            </div>

                            {/* Controls */}
                            <div className="kc-premControls kc-premControls--clean">
                                <div className="kc-premControls__left">
                                    <div className="kc-premControls__label">Your logo</div>
                                    <div className="kc-premControls__sub">Upload any image — preview updates instantly.</div>
                                </div>

                                <div className="kc-premControls__right">
                                    {/* Finish toggle (same visual language as your site) */}
                                    <div className="kc-konarcard__finish" role="group" aria-label="Choose tag finish">
                                        <button
                                            type="button"
                                            className={`kc-konarcard__finishBtn ${finish === "black" ? "is-active" : ""}`}
                                            onClick={() => setFinish("black")}
                                        >
                                            Black
                                        </button>
                                        <button
                                            type="button"
                                            className={`kc-konarcard__finishBtn ${finish === "gold" ? "is-active" : ""}`}
                                            onClick={() => setFinish("gold")}
                                        >
                                            Gold
                                        </button>
                                    </div>

                                    <label className="kc-premBtn">
                                        <input type="file" accept="image/*" onChange={onPickLogo} />
                                        Upload logo
                                    </label>

                                    <button type="button" className="kc-premBtn kc-premBtn--ghost" onClick={clearLogo} disabled={!logoUrl}>
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
                                        />
                                        <span className="kc-premSlider__v">{logoSize}%</span>
                                    </div>
                                </div>
                            </div>

                            {/* Buy row */}
                            <div className="kc-premBuy kc-premBuy--clean" aria-label="Choose quantity and buy">
                                <div className="kc-premPrice">
                                    <div className="kc-premPrice__value">£9.99</div>
                                    <div className="kc-premPrice__note">One-time purchase • Works with your profile</div>
                                </div>

                                <div className="kc-premBuy__right">
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
                                            onClick={() => setQty((q) => Math.min(50, q + 1))}
                                            aria-label="Increase quantity"
                                        >
                                            +
                                        </button>
                                    </div>

                                    <Link
                                        to="/productandplan/konartag"
                                        state={{ triggerCheckout: true, quantity: qty, finish }}
                                        className="kc-konarcard__cta kc-konarcard__cta--primary"
                                    >
                                        Buy KonarTag
                                    </Link>

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
                                        Everything you need to share instantly — just tap, or scan the QR if NFC is off.
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
