// frontend/src/components/Home/Products.jsx
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";

import "../../styling/fonts.css";
import "../../styling/home/products.css";

import KonarCardWhiteImg from "../../assets/images/KonarCard-White.jpg";
import KonarCardBlackImg from "../../assets/images/KonarCard-Black.jpg";
import KonarCardBlueImg  from "../../assets/images/KonarCard-Blue.jpg";

/* ── Animation presets ─────────────────────────────────────── */
const EASE = [0.22, 1, 0.36, 1];

const fadeUpInView = (delay = 0) => ({
    initial: { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-40px" },
    transition: { duration: 0.48, delay, ease: EASE },
});

/* ── Data ──────────────────────────────────────────────────── */
const PRODUCTS = [
    {
        tag: "Classic White",
        name: "KonarCard — White",
        desc: "Clean, professional white finish. Fits any wallet and works on every phone.",
        priceText: "£29.99",
        priceValue: 29.99,
        to: "/products",
        img: KonarCardWhiteImg,
        alt: "KonarCard White — plastic NFC business card",
        sku: "konarcard-white",
        cta: "View Card",
    },
    {
        tag: "Signature Black",
        name: "KonarCard — Black",
        desc: "Bold, premium black finish. Leaves a strong first impression every time.",
        priceText: "£29.99",
        priceValue: 29.99,
        to: "/products",
        img: KonarCardBlackImg,
        alt: "KonarCard Black — plastic NFC business card",
        sku: "konarcard-black",
        cta: "View Card",
    },
    {
        tag: "Standout Blue",
        name: "KonarCard — Blue",
        desc: "Distinctive blue design that stands out and gets noticed on the job.",
        priceText: "£29.99",
        priceValue: 29.99,
        to: "/products",
        img: KonarCardBlueImg,
        alt: "KonarCard Blue — plastic NFC business card",
        sku: "konarcard-blue",
        cta: "View Card",
    },
];

export default function Products() {
    return (
        <section className="khp-products" aria-labelledby="khp-products-title">
            <div className="khp-container">

                <motion.header className="khp-head" {...fadeUpInView(0)}>
                    <p className="kc-pill khp-kicker">Physical Cards</p>

                    <h2 id="khp-products-title" className="h3 khp-title">
                        Tap-to-Share Cards for Your{" "}
                        <span className="khp-accent">Digital Profile</span>
                    </h2>

                    <p className="kc-subheading khp-sub">
                        One-time purchase. Links to your profile forever — update anytime.
                    </p>
                </motion.header>

                <div className="khp-grid" role="list" aria-label="KonarCard products">
                    {PRODUCTS.map((item, i) => (
                        <motion.article
                            key={item.sku}
                            className="khp-card"
                            role="listitem"
                            initial={{ opacity: 0, y: 14 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-40px" }}
                            transition={{ duration: 0.44, delay: i * 0.08, ease: EASE }}
                        >
                            <div className="khp-media">
                                <span className="khp-tagPill">{item.tag}</span>
                                <img
                                    src={item.img}
                                    alt={item.alt}
                                    className="khp-media__img"
                                    loading="lazy"
                                    decoding="async"
                                />
                            </div>

                            <div className="khp-divider" aria-hidden="true" />

                            <div className="khp-card__body">
                                <div className="khp-topCopy">
                                    <h3 className="kc-title khp-card__name">{item.name}</h3>
                                    <p className="body khp-desc">{item.desc}</p>
                                </div>

                                <div className="khp-buy">
                                    <p className="body khp-price">{item.priceText}</p>
                                    <div className="khp-actions">
                                        <Link
                                            to={item.to}
                                            className="kx-btn kx-btn--white khp-btn"
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

                <motion.div className="khp-footer" {...fadeUpInView(0.2)}>
                    <p className="body-s khp-note">
                        One-time card purchase. Your digital profile is free to start.
                    </p>
                    <Link to="/products" className="kx-btn kx-btn--black">
                        View All Cards
                    </Link>
                </motion.div>

            </div>
        </section>
    );
}
