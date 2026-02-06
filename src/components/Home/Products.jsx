// frontend/src/components/home/Products.jsx
import React, { useMemo } from "react";
import { Link } from "react-router-dom";

import "../../styling/fonts.css";
import "../../styling/home/products.css";

/* ✅ Product images (same as Products page) */
import PlasticCardImg from "../../assets/images/PlasticCard.jpg";
import MetalCardImg from "../../assets/images/MetalCard.jpg";
import KonarTagImg from "../../assets/images/KonarTag.jpg";

export default function Products() {
    const products = useMemo(
        () => [
            {
                tag: "Best seller",
                name: "KonarCard — Plastic Edition",
                desc: "Durable, lightweight NFC business card for everyday use.",
                price: "£29.99",
                to: "/products/plastic-card",
                cta: "View Plastic Card",
                img: PlasticCardImg,
            },
            {
                tag: "Premium",
                name: "KonarCard — Metal Edition",
                desc: "Premium metal NFC card designed to make a strong first impression.",
                price: "£44.99",
                to: "/products/metal-card",
                cta: "View Metal Card",
                img: MetalCardImg,
            },
            {
                tag: "Accessory",
                name: "KonarTag",
                desc: "Compact NFC key tag that shares your profile with a tap.",
                price: "£9.99",
                to: "/products/konartag",
                cta: "View KonarTag",
                img: KonarTagImg,
            },
        ],
        []
    );

    return (
        <section className="khp-products" aria-label="Products">
            <div className="khp-container">
                <div className="khp-hero">
                    <div className="khp-hero__inner">
                        <p className="khp-kicker">Cards that link directly to your KonarCard profile</p>
                        <h2 className="h2 khp-title">Business Cards That Share Your Profile Instantly</h2>
                        <p className="body-s khp-sub">
                            The KonarCard is an NFC business card that opens your digital profile with a tap. It’s the easiest way to share your
                            details in person — without paper cards.
                        </p>
                    </div>
                </div>

                <div className="khp-grid">
                    {products.map((item) => (
                        <article key={item.name} className="khp-card">
                            <div className="khp-card__topRow">
                                <span className="khp-pill">{item.tag}</span>
                            </div>

                            <div className="khp-media" aria-hidden="true">
                                <img src={item.img} alt="" className="khp-media__img" loading="lazy" />
                            </div>

                            <div className="khp-card__body">
                                <p className="h6 khp-card__name">{item.name}</p>
                                <p className="body-s khp-desc">{item.desc}</p>

                                <div className="khp-priceRow">
                                    <p className="h6 khp-price">{item.price}</p>
                                </div>

                                <div className="khp-actions">
                                    <Link to={item.to} className="khp-btn">
                                        {item.cta}
                                    </Link>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>

                <p className="khp-note">
                    Your KonarCard works with your digital profile. The card is a one-time purchase. Profiles are free to start.
                </p>

                <div className="khp-ctaRow">
                    <Link to="/products" className="khp-cta khp-cta--primary">
                        Shop Business Cards
                    </Link>
                    <Link to="/how-it-works" className="khp-cta khp-cta--ghost">
                        See How The Cards Work
                    </Link>
                </div>
            </div>
        </section>
    );
}
