import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";

/* ✅ Shared CSS for Plastic + Metal */
import "../../../styling/products/konarcard.css";

/* Images (swap later) */
import ProductCover from "../../../assets/images/Product-Cover.png";
import ProductImage1 from "../../../assets/images/Product-Image-1.png";
import ProductImage2 from "../../../assets/images/Product-Image-2.png";
import ProductImage3 from "../../../assets/images/Product-Image-3.png";
import ProductImage4 from "../../../assets/images/Product-Image-4.png";

export default function PlasticCard() {
    const gallery = useMemo(
        () => [ProductCover, ProductImage1, ProductImage2, ProductImage3, ProductImage4],
        []
    );

    const [activeImg, setActiveImg] = useState(gallery[0]);
    const [qty, setQty] = useState(1);

    // ---- Logo upload preview (frontend-only) ----
    const [logoUrl, setLogoUrl] = useState("");
    const [logoSize, setLogoSize] = useState(46); // percent of card height-ish

    useEffect(() => {
        return () => {
            if (logoUrl) URL.revokeObjectURL(logoUrl);
        };
    }, [logoUrl]);

    const onPickLogo = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // simple image guard
        if (!file.type.startsWith("image/")) return;

        if (logoUrl) URL.revokeObjectURL(logoUrl);
        setLogoUrl(URL.createObjectURL(file));
    };

    const clearLogo = () => {
        if (logoUrl) URL.revokeObjectURL(logoUrl);
        setLogoUrl("");
    };

    // ---- Drag 3D rotation ----
    const wrapRef = useRef(null);
    const dragRef = useRef({
        isDown: false,
        startX: 0,
        startY: 0,
        baseRX: -10,
        baseRY: 18,
    });

    const [rot, setRot] = useState({ rx: -10, ry: 18 });
    const [isDragging, setIsDragging] = useState(false);

    const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

    const setRotation = (rx, ry) => {
        setRot({
            rx: clamp(rx, -28, 28),
            ry: clamp(ry, -40, 40),
        });
    };

    const onPointerDown = (e) => {
        // allow drag on touch + mouse
        dragRef.current.isDown = true;
        setIsDragging(true);

        dragRef.current.startX = e.clientX;
        dragRef.current.startY = e.clientY;
        dragRef.current.baseRX = rot.rx;
        dragRef.current.baseRY = rot.ry;

        // capture pointer so it keeps dragging even if cursor leaves
        try {
            e.currentTarget.setPointerCapture(e.pointerId);
        } catch { }
    };

    const onPointerMove = (e) => {
        if (!dragRef.current.isDown) return;
        const dx = e.clientX - dragRef.current.startX;
        const dy = e.clientY - dragRef.current.startY;

        // tweak sensitivity
        const nextRY = dragRef.current.baseRY + dx * 0.12;
        const nextRX = dragRef.current.baseRX - dy * 0.12;

        setRotation(nextRX, nextRY);
    };

    const onPointerUp = () => {
        dragRef.current.isDown = false;
        setIsDragging(false);
    };

    const resetView = () => setRotation(-10, 18);

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

    return (
        <>
            <Navbar />

            <main className="kc-konarcard">
                <div className="kc-konarcard__wrap">
                    {/* ===== Top ===== */}
                    <div className="kc-konarcard__top">
                        <div className="kc-konarcard__crumbs">
                            <Link to="/products" className="kc-konarcard__crumbLink">
                                Products
                            </Link>
                            <span className="kc-konarcard__crumbSep">/</span>
                            <span className="kc-konarcard__crumbHere">KonarCard – Plastic Edition</span>
                        </div>

                        <div className="kc-konarcard__grid">
                            {/* Left: Gallery + 3D Preview */}
                            <section className="kc-konarcard__gallery" aria-label="Product gallery">
                                {/* NEW: 3D preview */}
                                <div className="kc-konarcard__previewHead">
                                    <div>
                                        <div className="kc-konarcard__previewKicker">Live preview</div>
                                        <div className="kc-konarcard__previewTitle">Upload your logo</div>
                                    </div>

                                    <button type="button" className="kc-konarcard__tinyBtn" onClick={resetView}>
                                        Reset view
                                    </button>
                                </div>

                                <div className="kc-3dWrap" ref={wrapRef}>
                                    <div
                                        className={`kc-3dStage ${isDragging ? "is-dragging" : ""}`}
                                        onPointerDown={onPointerDown}
                                        onPointerMove={onPointerMove}
                                        onPointerUp={onPointerUp}
                                        onPointerCancel={onPointerUp}
                                        role="application"
                                        aria-label="3D card preview. Drag to rotate."
                                    >
                                        <div
                                            className="kc-3dCard kc-3dCard--plastic"
                                            style={{
                                                transform: `rotateX(${rot.rx}deg) rotateY(${rot.ry}deg)`,
                                            }}
                                        >
                                            {/* front */}
                                            <div className="kc-3dFace kc-3dFace--front">
                                                <div className="kc-3dTexture" style={{ backgroundImage: `url(${activeImg})` }} />
                                                <div className="kc-3dBrandMark" aria-hidden="true" />

                                                {logoUrl ? (
                                                    <img
                                                        className="kc-3dLogo"
                                                        src={logoUrl}
                                                        alt="Uploaded logo preview"
                                                        style={{ width: `${logoSize}%` }}
                                                        draggable={false}
                                                    />
                                                ) : (
                                                    <div className="kc-3dLogoPlaceholder">
                                                        <div className="kc-3dLogoDot" />
                                                        <div>
                                                            <div className="kc-3dLogoPhT">Your logo here</div>
                                                            <div className="kc-3dLogoPhS">Upload a PNG/SVG/JPG</div>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="kc-3dShine" aria-hidden="true" />
                                            </div>

                                            {/* back */}
                                            <div className="kc-3dFace kc-3dFace--back">
                                                <div className="kc-3dBackInner">
                                                    <div className="kc-3dBackTitle">QR backup</div>
                                                    <div className="kc-3dBackSub">Scan if NFC is off</div>
                                                    <div className="kc-3dFakeQr" aria-hidden="true" />
                                                </div>
                                                <div className="kc-3dShine" aria-hidden="true" />
                                            </div>
                                        </div>

                                        <div className="kc-3dHint">{isDragging ? "Release to stop" : "Drag to rotate"}</div>
                                    </div>
                                </div>

                                {/* NEW: controls */}
                                <div className="kc-customize">
                                    <div className="kc-customize__row">
                                        <div className="kc-customize__label">Logo file</div>
                                        <div className="kc-customize__actions">
                                            <label className="kc-customize__file">
                                                <input type="file" accept="image/*" onChange={onPickLogo} />
                                                Upload logo
                                            </label>

                                            <button
                                                type="button"
                                                className="kc-customize__ghost"
                                                onClick={clearLogo}
                                                disabled={!logoUrl}
                                                aria-disabled={!logoUrl}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>

                                    <div className="kc-customize__row">
                                        <div className="kc-customize__label">Logo size</div>
                                        <div className="kc-customize__slider">
                                            <input
                                                type="range"
                                                min={26}
                                                max={70}
                                                value={logoSize}
                                                onChange={(e) => setLogoSize(Number(e.target.value))}
                                                aria-label="Logo size"
                                            />
                                            <div className="kc-customize__val">{logoSize}%</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Thumbs */}
                                <div className="kc-konarcard__thumbRow" role="list" aria-label="Choose an image">
                                    {gallery.map((src, i) => {
                                        const isActive = src === activeImg;
                                        return (
                                            <button
                                                key={i}
                                                type="button"
                                                className={`kc-konarcard__thumb ${isActive ? "is-active" : ""}`}
                                                onClick={() => setActiveImg(src)}
                                                aria-label={`View image ${i + 1}`}
                                            >
                                                <img src={src} alt={`KonarCard image ${i + 1}`} />
                                            </button>
                                        );
                                    })}
                                </div>
                            </section>

                            {/* Right: Details */}
                            <section className="kc-konarcard__panel" aria-label="Product details">
                                <div className="kc-konarcard__badgeRow">
                                    <span className="kc-konarcard__pill kc-konarcard__pill--best">Best Value</span>
                                    <span className="kc-konarcard__pill kc-konarcard__pill--warranty">12 Month Warranty</span>
                                </div>

                                <h1 className="kc-konarcard__title">KonarCard – Plastic Edition</h1>
                                <p className="kc-konarcard__sub">
                                    Durable, lightweight NFC business card for everyday use. Tap to instantly share your Konar profile.
                                </p>

                                <div className="kc-konarcard__priceRow">
                                    <div className="kc-konarcard__price">£29.99</div>
                                    <div className="kc-konarcard__priceNote">One-time purchase • Works with your profile</div>
                                </div>

                                <div className="kc-konarcard__buyRow" aria-label="Choose quantity and buy">
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

                                    <Link
                                        to="/productandplan/konarcard"
                                        state={{ triggerCheckout: true, quantity: qty, edition: "plastic" }}
                                        className="kc-konarcard__cta kc-konarcard__cta--primary"
                                    >
                                        Buy KonarCard
                                    </Link>
                                </div>

                                <div className="kc-konarcard__secondaryRow">
                                    <Link to="/register" className="kc-konarcard__cta kc-konarcard__cta--ghost">
                                        Create your profile first
                                    </Link>
                                </div>

                                <div className="kc-konarcard__meta">
                                    <div className="kc-konarcard__metaItem">
                                        <span className="kc-konarcard__metaK">Delivery</span>
                                        <span className="kc-konarcard__metaV">Fast dispatch • UK shipping</span>
                                    </div>
                                    <div className="kc-konarcard__metaItem">
                                        <span className="kc-konarcard__metaK">Compatibility</span>
                                        <span className="kc-konarcard__metaV">iPhone + Android (NFC / QR)</span>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>

                    {/* ===== Middle content ===== */}
                    <section className="kc-konarcard__section">
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
                    </section>

                    <section className="kc-konarcard__section">
                        <div className="kc-konarcard__split">
                            <div className="kc-konarcard__card">
                                <h3 className="kc-konarcard__h3">Perfect for</h3>
                                <ul className="kc-konarcard__list">
                                    <li>On-site quotes and client meetings</li>
                                    <li>Trade counters, suppliers, and networking</li>
                                    <li>Van QR codes and site boards</li>
                                    <li>After-job follow-ups and referrals</li>
                                </ul>
                            </div>

                            <div className="kc-konarcard__card">
                                <h3 className="kc-konarcard__h3">How it works</h3>
                                <ol className="kc-konarcard__list kc-konarcard__list--ol">
                                    <li>Create your Konar profile</li>
                                    <li>Link your card to your profile</li>
                                    <li>Tap or scan to share instantly</li>
                                </ol>

                                <div className="kc-konarcard__miniCtas">
                                    <Link to="/examples" className="kc-konarcard__miniBtn">
                                        View examples
                                    </Link>
                                    <Link to="/faq" className="kc-konarcard__miniBtn kc-konarcard__miniBtn--ghost">
                                        Read FAQs
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ===== Bottom CTA ===== */}
                    <section className="kc-konarcard__bottom">
                        <div className="kc-konarcard__bottomInner">
                            <div>
                                <h2 className="kc-konarcard__h2">Ready to share like a pro?</h2>
                                <p className="kc-konarcard__p">
                                    Get your KonarCard and start sending your profile instantly — no paper, no hassle.
                                </p>
                            </div>

                            <Link
                                to="/productandplan/konarcard"
                                state={{ triggerCheckout: true, quantity: qty, edition: "plastic" }}
                                className="kc-konarcard__cta kc-konarcard__cta--primary"
                            >
                                Buy KonarCard
                            </Link>
                        </div>
                    </section>
                </div>
            </main>

            <Footer />
        </>
    );
}
