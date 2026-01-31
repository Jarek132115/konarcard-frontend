// frontend/src/pages/website/products/KonarTag.jsx
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";

/* ✅ KonarTag CSS (used for KonarTag page) */
import "../../../styling/products/konartag.css";

/* Images (swap later with real KonarTag images) */
import ProductCover from "../../../assets/images/Product-Cover.png";
import ProductImage1 from "../../../assets/images/Product-Image-1.png";
import ProductImage2 from "../../../assets/images/Product-Image-2.png";
import ProductImage3 from "../../../assets/images/Product-Image-3.png";
import ProductImage4 from "../../../assets/images/Product-Image-4.png";

export default function KonarTag() {
    const gallery = useMemo(
        () => [ProductCover, ProductImage1, ProductImage2, ProductImage3, ProductImage4],
        []
    );

    const [activeImg, setActiveImg] = useState(gallery[0]);
    const [qty, setQty] = useState(1);

    const highlights = useMemo(
        () => [
            { t: "Pocket-friendly", s: "Small, simple, and always with your keys." },
            { t: "Tap to share", s: "Opens your Konar profile instantly on compatible phones." },
            { t: "QR backup", s: "If NFC is off, scan and still save your details." },
            { t: "No app needed", s: "Works right in the browser — iPhone & Android." },
            { t: "One-time purchase", s: "Buy once. Share forever." },
            { t: "Built for real work", s: "Durable design for daily use." },
        ],
        []
    );

    return (
        <>
            <Navbar />

            <main className="kc-tag">
                <div className="kc-tag__wrap">
                    {/* ===== Breadcrumbs ===== */}
                    <div className="kc-tag__crumbs">
                        <Link to="/products" className="kc-tag__crumbLink">
                            Products
                        </Link>
                        <span className="kc-tag__crumbSep">/</span>
                        <span className="kc-tag__crumbHere">KonarTag</span>
                    </div>

                    {/* ===== Top grid ===== */}
                    <div className="kc-tag__grid">
                        {/* Left: gallery */}
                        <section className="kc-tag__gallery" aria-label="KonarTag gallery">
                            <div className="kc-tag__main">
                                <img src={activeImg} alt="KonarTag product" />
                            </div>

                            <div className="kc-tag__thumbs" role="list" aria-label="Choose an image">
                                {gallery.map((src, i) => {
                                    const isActive = src === activeImg;
                                    return (
                                        <button
                                            key={i}
                                            type="button"
                                            className={`kc-tag__thumb ${isActive ? "is-active" : ""}`}
                                            onClick={() => setActiveImg(src)}
                                            aria-label={`View image ${i + 1}`}
                                        >
                                            <img src={src} alt={`KonarTag image ${i + 1}`} />
                                        </button>
                                    );
                                })}
                            </div>
                        </section>

                        {/* Right: details */}
                        <section className="kc-tag__panel" aria-label="KonarTag details">
                            <div className="kc-tag__pillRow">
                                <span className="kc-tag__pill kc-tag__pill--best">Best for keys</span>
                                <span className="kc-tag__pill kc-tag__pill--warranty">12 Month Warranty</span>
                            </div>

                            <h1 className="kc-tag__title">KonarTag</h1>
                            <p className="kc-tag__sub">
                                Compact NFC key tag that shares your Konar profile with a tap. Perfect for on-the-go sharing without a
                                wallet card.
                            </p>

                            <div className="kc-tag__priceRow">
                                <div className="kc-tag__price">£9.99</div>
                                <div className="kc-tag__priceNote">One-time purchase • Works with your profile</div>
                            </div>

                            <div className="kc-tag__buyRow" aria-label="Choose quantity and buy">
                                <div className="kc-tag__qty">
                                    <button
                                        type="button"
                                        className="kc-tag__qtyBtn"
                                        onClick={() => setQty((q) => Math.max(1, q - 1))}
                                        aria-label="Decrease quantity"
                                    >
                                        −
                                    </button>
                                    <div className="kc-tag__qtyVal" aria-label="Quantity">
                                        {qty}
                                    </div>
                                    <button
                                        type="button"
                                        className="kc-tag__qtyBtn"
                                        onClick={() => setQty((q) => Math.min(50, q + 1))}
                                        aria-label="Increase quantity"
                                    >
                                        +
                                    </button>
                                </div>

                                {/* Hook this to checkout later */}
                                <Link
                                    to="/productandplan/konartag"
                                    state={{ triggerCheckout: true, quantity: qty }}
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

                            <div className="kc-tag__meta">
                                <div className="kc-tag__metaItem">
                                    <span className="kc-tag__metaK">Delivery</span>
                                    <span className="kc-tag__metaV">Fast dispatch • UK shipping</span>
                                </div>
                                <div className="kc-tag__metaItem">
                                    <span className="kc-tag__metaK">Compatibility</span>
                                    <span className="kc-tag__metaV">iPhone + Android (NFC / QR)</span>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* ===== Highlights ===== */}
                    <section className="kc-tag__section">
                        <div className="kc-tag__sectionHead">
                            <h2 className="kc-tag__h2">Why KonarTag</h2>
                            <p className="kc-tag__p">
                                The quickest way to share your details when your hands are full — keys, van, site visits, and quotes.
                            </p>
                        </div>

                        <div className="kc-tag__cards">
                            {highlights.map((h, i) => (
                                <div className="kc-tag__card" key={i}>
                                    <div className="kc-tag__ico" aria-hidden="true">
                                        ✓
                                    </div>
                                    <div className="kc-tag__cardT">{h.t}</div>
                                    <div className="kc-tag__cardS">{h.s}</div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* ===== Bottom CTA ===== */}
                    <section className="kc-tag__bottom">
                        <div className="kc-tag__bottomInner">
                            <div>
                                <h2 className="kc-tag__h2">Ready to share with one tap?</h2>
                                <p className="kc-tag__p">
                                    Add KonarTag to your keys and your profile is always one tap away — no apps, no hassle.
                                </p>
                            </div>

                            <div className="kc-tag__bottomBtns">
                                <Link to="/examples" className="kc-tag__cta kc-tag__cta--ghost">
                                    See examples
                                </Link>
                                <Link
                                    to="/productandplan/konartag"
                                    state={{ triggerCheckout: true, quantity: qty }}
                                    className="kc-tag__cta kc-tag__cta--primary"
                                >
                                    Buy KonarTag
                                </Link>
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            <Footer />
        </>
    );
}
