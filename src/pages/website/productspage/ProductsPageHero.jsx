// frontend/src/pages/website/productspage/ProductsPageHero.jsx
import React from "react";
import { Link } from "react-router-dom";

import "../../../styling/fonts.css";
import "../../../styling/productspage/productspagehero.css";

export default function ProductsPageHero({ products }) {
    return (
        <section className="kph-hero" aria-labelledby="kph-title">
            <div className="kph-container">
                <header className="kph-head">
                    <p className="kc-pill kph-topPill">
                        NFC & Contactless Business Cards
                    </p>

                    <h1 id="kph-title" className="h2 kph-title">
                        Premium <span className="kph-accent">Plastic NFC Cards</span> Designed
                        for <span className="kph-accent">Your Brand</span>
                    </h1>

                    <p className="kc-subheading kph-sub">
                        Choose from multiple professionally designed card styles — all powered by
                        your KonarCard digital profile.
                    </p>
                </header>

                <div
                    className="kph-grid"
                    role="list"
                    aria-label="KonarCard plastic card designs"
                >
                    {products.map((item) => (
                        <article
                            key={item.sku}
                            className="kph-card"
                            role="listitem"
                        >
                            {/* IMAGE */}
                            <div className="kph-media">
                                <span className="kph-tagPill">{item.tag}</span>

                                <img
                                    src={item.img}
                                    alt={item.alt}
                                    className="kph-media__img"
                                    loading="lazy"
                                    decoding="async"
                                />
                            </div>

                            <div className="kph-divider" />

                            {/* CONTENT */}
                            <div className="kph-card__body">
                                <div className="kph-topCopy">
                                    <h3 className="kc-title kph-card__name">
                                        {item.name}
                                    </h3>

                                    <p className="body kph-desc">
                                        {item.desc}
                                    </p>
                                </div>

                                {/* PRICE + CTA */}
                                <div className="kph-buy">
                                    <p className="body kph-price">
                                        {item.priceText}
                                    </p>

                                    <div className="kph-actions">
                                        <Link
                                            to={item.to}
                                            className="kx-btn kx-btn--white kph-btn"
                                            aria-label={`View ${item.name}`}
                                        >
                                            {item.cta}
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