// frontend/src/pages/website/productspage/ProductsPageHero.jsx
import React from "react";
import { Link } from "react-router-dom";

import "../../../styling/fonts.css";
import "../../../styling/productspage/productspagehero.css";

export default function ProductsPageHero({ products }) {
    // ✅ enforce consistent CTA labels (even if product data changes)
    const getCtaLabel = (sku) => {
        const s = String(sku || "").toLowerCase();
        if (s.includes("plastic")) return "View Plastic Card";
        if (s.includes("metal")) return "View Metal Card";
        if (s.includes("konartag") || s.includes("tag")) return "View KonarTag";
        return "View Product";
    };

    return (
        <section className="kph-hero" aria-labelledby="kph-title">
            <div className="kph-container">
                <header className="kph-head">
                    <p className="kc-pill kph-topPill">NFC & Contactless Business Cards</p>

                    <h1 id="kph-title" className="h2 kph-title">
                        Premium <span className="kph-accent">NFC Business Cards</span> That Help You{" "}
                        <span className="kph-accent">Win More Work</span>
                    </h1>

                    <p className="kc-subheading kph-sub">
                        Browse durable plastic and metal contactless business cards designed for trades and service professionals.
                    </p>
                </header>

                <div className="kph-grid" role="list" aria-label="KonarCard products">
                    {products.map((item) => (
                        <article key={item.sku} className="kph-card" role="listitem">
                            <div className="kph-media">
                                <span className="kph-tagPill" aria-label={item.tag}>
                                    {item.tag}
                                </span>

                                <img
                                    src={item.img}
                                    alt={item.alt}
                                    className="kph-media__img"
                                    loading="lazy"
                                    decoding="async"
                                />
                            </div>

                            <div className="kph-divider" aria-hidden="true" />

                            <div className="kph-card__body">
                                <div className="kph-topCopy">
                                    <h3 className="kc-title kph-card__name">{item.name}</h3>
                                    <p className="body kph-desc">{item.desc}</p>
                                </div>

                                <div className="kph-buy">
                                    <p className="body kph-price">{item.priceText}</p>

                                    <div className="kph-actions">
                                        <Link
                                            to={item.to}
                                            className="kx-btn kx-btn--white kph-btn"
                                            aria-label={`View ${item.name}`}
                                        >
                                            {getCtaLabel(item.sku)}
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}