// frontend/src/pages/website/products/MetalCard.jsx
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";

/* ✅ Shared CSS for Plastic + Metal */
import "../../../styling/products/konarcard.css";

/* Images (swap later with real Metal product images) */
import ProductCover from "../../../assets/images/Product-Cover.png";
import ProductImage1 from "../../../assets/images/Product-Image-1.png";
import ProductImage2 from "../../../assets/images/Product-Image-2.png";
import ProductImage3 from "../../../assets/images/Product-Image-3.png";
import ProductImage4 from "../../../assets/images/Product-Image-4.png";

export default function MetalCard() {
    const gallery = useMemo(
        () => [ProductCover, ProductImage1, ProductImage2, ProductImage3, ProductImage4],
        []
    );

    const [activeImg, setActiveImg] = useState(gallery[0]);
    const [qty, setQty] = useState(1);

    const features = useMemo(
        () => [
            { t: "Premium metal finish", s: "Designed to make a strong first impression — built to last." },
            { t: "Tap to share instantly", s: "Open your profile on any modern phone with an NFC tap." },
            { t: "QR code backup", s: "If NFC is off, they can scan and still save your details." },
            { t: "Works with your Konar profile", s: "Your card always links to your live profile — edits update instantly." },
            { t: "No app needed", s: "Works in the browser on iPhone and Android." },
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
                            <span className="kc-konarcard__crumbHere">KonarCard – Metal Edition</span>
                        </div>

                        <div className="kc-konarcard__grid">
                            {/* Left: Gallery */}
                            <section className="kc-konarcard__gallery" aria-label="Product gallery">
                                <div className="kc-konarcard__mainImg">
                                    <img src={activeImg} alt="KonarCard Metal Edition" />
                                </div>

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
                                    <span className="kc-konarcard__pill kc-konarcard__pill--warranty">12 Month Warranty</span>
                                </div>

                                <h1 className="kc-konarcard__title">KonarCard – Metal Edition</h1>
                                <p className="kc-konarcard__sub">
                                    Premium metal NFC business card designed to make a strong first impression. Tap to instantly share your
                                    Konar profile.
                                </p>

                                <div className="kc-konarcard__priceRow">
                                    <div className="kc-konarcard__price">£44.99</div>
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

                                    {/* Hook this to checkout later */}
                                    <Link
                                        to="/productandplan/konarcard"
                                        state={{ triggerCheckout: true, quantity: qty, edition: "metal" }}
                                        className="kc-konarcard__cta kc-konarcard__cta--primary"
                                    >
                                        Buy Metal KonarCard
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
                                The premium version of KonarCard — made to look elite while still being simple and practical.
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
                                    <li>Trades who want a premium look</li>
                                    <li>High-end jobs and bigger quotes</li>
                                    <li>Networking and referrals</li>
                                    <li>Daily work — built to last</li>
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
                                <h2 className="kc-konarcard__h2">Want the premium version?</h2>
                                <p className="kc-konarcard__p">
                                    Choose Metal Edition for the strongest first impression — and still share instantly with one tap.
                                </p>
                            </div>

                            <Link
                                to="/productandplan/konarcard"
                                state={{ triggerCheckout: true, quantity: qty, edition: "metal" }}
                                className="kc-konarcard__cta kc-konarcard__cta--primary"
                            >
                                Buy Metal KonarCard
                            </Link>
                        </div>
                    </section>
                </div>
            </main>

            <Footer />
        </>
    );
}
