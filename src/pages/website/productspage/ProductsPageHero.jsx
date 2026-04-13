// frontend/src/pages/website/productspage/ProductsPageHero.jsx
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";

import "../../../styling/fonts.css";
import "../../../styling/productspage/productspagehero.css";

/* ── Animation presets ─────────────────────────────────────── */
const EASE = [0.22, 1, 0.36, 1];

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay, ease: EASE },
});

const cardVariant = {
    hidden: { opacity: 0, y: 16 },
    show: (i) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.44, delay: i * 0.07, ease: EASE },
    }),
};

export default function ProductsPageHero({ products }) {
    return (
        <section className="kph-hero" aria-labelledby="kph-title">
            <div className="kph-container">
                <header className="kph-head">
                    {/* Grid lines — circular radial fade */}
                    <div className="kph-gridBg" aria-hidden="true" />

                    <motion.div className="kph-headContent" {...fadeUp(0)}>
                        <p className="kc-pill kph-topPill">
                            NFC & Contactless Business Cards
                        </p>

                        <h1 id="kph-title" className="h2 kph-title">
                            NFC Business Cards — <span className="kph-accent">Choose Your Colour</span>
                        </h1>

                        <p className="kc-subheading kph-sub">
                            KonarCard NFC business cards are available in 6 colours. Each card is the
                            same price — £19.99 — and includes a free digital profile you can update
                            any time. Works on every iPhone and Android phone without an app. Tap the
                            card to any phone and your profile opens instantly.
                        </p>
                    </motion.div>
                </header>

                <div
                    className="kph-grid"
                    role="list"
                    aria-label="KonarCard plastic card designs"
                >
                    {products.map((item, i) => (
                        <motion.article
                            key={item.sku}
                            className="kph-card"
                            role="listitem"
                            custom={i}
                            variants={cardVariant}
                            initial="hidden"
                            animate="show"
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
                        </motion.article>
                    ))}
                </div>
            </div>
        </section>
    );
}
