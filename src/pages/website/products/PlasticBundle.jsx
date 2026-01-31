// frontend/src/pages/website/products/PlasticBundle.jsx
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";

/* ✅ Bundles CSS (used for PlasticBundle + MetalBundle) */
import "../../../styling/products/konarbundles.css";

/* Images (swap later with real bundle images) */
import ProductCover from "../../../assets/images/Product-Cover.png";
import ProductImage1 from "../../../assets/images/Product-Image-1.png";
import ProductImage2 from "../../../assets/images/Product-Image-2.png";
import ProductImage3 from "../../../assets/images/Product-Image-3.png";

export default function PlasticBundle() {
    const gallery = useMemo(() => [ProductCover, ProductImage1, ProductImage2, ProductImage3], []);
    const [activeImg, setActiveImg] = useState(gallery[0]);
    const [qty, setQty] = useState(1);

    const included = useMemo(
        () => [
            { t: "Plastic KonarCard", s: "Tap to share your profile instantly." },
            { t: "KonarTag", s: "Key tag for quick sharing on the go." },
            { t: "1 Month Subscription", s: "Unlock your full Konar Profile for 30 days." },
        ],
        []
    );

    const why = useMemo(
        () => [
            { t: "Best value starter kit", s: "Everything you need to look pro fast." },
            { t: "Share anywhere", s: "Tap, scan QR, or send your link." },
            { t: "No app needed", s: "Works on iPhone & Android in the browser." },
            { t: "Update anytime", s: "Edit once — changes go live instantly." },
            { t: "Built for trades", s: "Simple, durable, made for real work." },
            { t: "One job pays for it", s: "Win one extra job and it covers the bundle." },
        ],
        []
    );

    return (
        <>
            <Navbar />

            <main className="kc-bundle">
                <div className="kc-bundle__wrap">
                    {/* ===== Breadcrumbs ===== */}
                    <div className="kc-bundle__crumbs">
                        <Link to="/products" className="kc-bundle__crumbLink">
                            Products
                        </Link>
                        <span className="kc-bundle__crumbSep">/</span>
                        <span className="kc-bundle__crumbHere">Plastic Bundle</span>
                    </div>

                    {/* ===== Top grid ===== */}
                    <div className="kc-bundle__grid">
                        {/* Gallery */}
                        <section className="kc-bundle__gallery" aria-label="Plastic bundle gallery">
                            <div className="kc-bundle__main">
                                <img src={activeImg} alt="Plastic bundle product" />
                            </div>

                            <div className="kc-bundle__thumbs" role="list" aria-label="Choose an image">
                                {gallery.map((src, i) => {
                                    const isActive = src === activeImg;
                                    return (
                                        <button
                                            key={i}
                                            type="button"
                                            className={`kc-bundle__thumb ${isActive ? "is-active" : ""}`}
                                            onClick={() => setActiveImg(src)}
                                            aria-label={`View image ${i + 1}`}
                                        >
                                            <img src={src} alt={`Plastic bundle image ${i + 1}`} />
                                        </button>
                                    );
                                })}
                            </div>
                        </section>

                        {/* Details */}
                        <section className="kc-bundle__panel" aria-label="Plastic bundle details">
                            <div className="kc-bundle__pillRow">
                                <span className="kc-bundle__pill kc-bundle__pill--best">Best Value</span>
                                <span className="kc-bundle__pill">Includes 1 month subscription</span>
                                <span className="kc-bundle__pill">12 Month Warranty</span>
                            </div>

                            <h1 className="kc-bundle__title">Plastic Bundle</h1>
                            <p className="kc-bundle__sub">
                                The easiest way to start: a <strong>Plastic KonarCard</strong> + <strong>KonarTag</strong> +{" "}
                                <strong>1 month subscription</strong> so you can set up your full profile and start winning more work.
                            </p>

                            <div className="kc-bundle__priceRow">
                                <div className="kc-bundle__price">£39.99</div>
                                <div className="kc-bundle__priceNote">One-time purchase • Bundle starter kit</div>
                            </div>

                            {/* Included list */}
                            <div className="kc-bundle__included">
                                <div className="kc-bundle__includedTitle">What’s included</div>
                                <ul className="kc-bundle__list">
                                    {included.map((x, i) => (
                                        <li key={i} className="kc-bundle__li">
                                            <span className="kc-bundle__tick" aria-hidden="true">
                                                ✓
                                            </span>
                                            <div className="kc-bundle__liCopy">
                                                <div className="kc-bundle__liT">{x.t}</div>
                                                <div className="kc-bundle__liS">{x.s}</div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Qty + CTA */}
                            <div className="kc-bundle__buyRow" aria-label="Choose quantity and buy">
                                <div className="kc-bundle__qty">
                                    <button
                                        type="button"
                                        className="kc-bundle__qtyBtn"
                                        onClick={() => setQty((q) => Math.max(1, q - 1))}
                                        aria-label="Decrease quantity"
                                    >
                                        −
                                    </button>
                                    <div className="kc-bundle__qtyVal" aria-label="Quantity">
                                        {qty}
                                    </div>
                                    <button
                                        type="button"
                                        className="kc-bundle__qtyBtn"
                                        onClick={() => setQty((q) => Math.min(50, q + 1))}
                                        aria-label="Increase quantity"
                                    >
                                        +
                                    </button>
                                </div>

                                {/* Hook this to checkout later */}
                                <Link
                                    to="/productandplan/plasticbundle"
                                    state={{ triggerCheckout: true, quantity: qty }}
                                    className="kc-bundle__cta kc-bundle__cta--primary"
                                >
                                    Buy Plastic Bundle
                                </Link>
                            </div>

                            <div className="kc-bundle__secondaryRow">
                                <Link to="/register" className="kc-bundle__cta kc-bundle__cta--ghost">
                                    Create your profile first
                                </Link>
                            </div>

                            <div className="kc-bundle__meta">
                                <div className="kc-bundle__metaItem">
                                    <span className="kc-bundle__metaK">Delivery</span>
                                    <span className="kc-bundle__metaV">Fast dispatch • UK shipping</span>
                                </div>
                                <div className="kc-bundle__metaItem">
                                    <span className="kc-bundle__metaK">Compatibility</span>
                                    <span className="kc-bundle__metaV">iPhone + Android (NFC / QR)</span>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* ===== Why ===== */}
                    <section className="kc-bundle__section">
                        <div className="kc-bundle__sectionHead">
                            <h2 className="kc-bundle__h2">Why this bundle</h2>
                            <p className="kc-bundle__p">Start fast with the most popular setup for trades.</p>
                        </div>

                        <div className="kc-bundle__cards">
                            {why.map((h, i) => (
                                <div className="kc-bundle__card" key={i}>
                                    <div className="kc-bundle__ico" aria-hidden="true">
                                        ✓
                                    </div>
                                    <div className="kc-bundle__cardT">{h.t}</div>
                                    <div className="kc-bundle__cardS">{h.s}</div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* ===== Bottom CTA ===== */}
                    <section className="kc-bundle__bottom">
                        <div className="kc-bundle__bottomInner">
                            <div>
                                <h2 className="kc-bundle__h2">Ready to look more professional?</h2>
                                <p className="kc-bundle__p">Get the full starter kit and begin sharing in minutes.</p>
                            </div>

                            <div className="kc-bundle__bottomBtns">
                                <Link to="/examples" className="kc-bundle__cta kc-bundle__cta--ghost">
                                    See examples
                                </Link>
                                <Link
                                    to="/productandplan/plasticbundle"
                                    state={{ triggerCheckout: true, quantity: qty }}
                                    className="kc-bundle__cta kc-bundle__cta--primary"
                                >
                                    Buy Plastic Bundle
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
