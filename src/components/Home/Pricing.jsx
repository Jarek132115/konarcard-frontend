// frontend/src/components/home/Pricing.jsx
import React from "react";
import { Link } from "react-router-dom";
import "../../styling/home/pricing.css";

function Feature({ title, desc }) {
    return (
        <li className="khp-feature">
            <span className="khp-check" aria-hidden="true">✓</span>
            <div className="khp-featureCopy">
                <div className="khp-featureTitle">{title}</div>
                <div className="khp-featureDesc">{desc}</div>
            </div>
        </li>
    );
}

export default function Pricing() {
    const cards = [
        {
            title: "Free",
            sub: "Perfect to start sharing today",
            tag: "Start free",
            price: "£0",
            cadence: "Forever",
            features: [
                { t: "1 profile + 1 link + 1 QR", d: "Everything you need to share your details." },
                { t: "Fully customise your profile", d: "Edit your details anytime." },
                { t: "Works on any phone", d: "Tap or scan — no app needed." },
                { t: "Unlimited link updates", d: "Your link never changes." },
            ],
            ctaText: "Get started free",
            ctaTo: "/register",
            featured: false,
        },
        {
            title: "Plus",
            sub: "Most popular for solo trades",
            tag: "Most popular",
            price: "£4.95",
            cadence: "per month",
            note: "Cancel anytime",
            features: [
                { t: "More templates", d: "Choose from 5 layouts." },
                { t: "Higher limits", d: "More photos, services, and reviews." },
                { t: "Deep analytics", d: "See what customers click." },
                { t: "Remove Konar branding", d: "Make it fully yours." },
            ],
            ctaText: "Upgrade to Plus",
            ctaTo: "/pricing",
            featured: true,
        },
        {
            title: "Teams",
            sub: "Built for growing businesses",
            tag: "For teams",
            price: "£19.95",
            cadence: "per month",
            note: "Add extra profiles",
            features: [
                { t: "Multiple team profiles", d: "Great for staff and contractors." },
                { t: "Centralised branding", d: "Keep everything consistent." },
                { t: "Deep analytics", d: "Track performance across profiles." },
                { t: "Extra profiles available", d: "£1.95 / extra profile / month." },
            ],
            ctaText: "See Teams options",
            ctaTo: "/pricing",
            featured: false,
        },
    ];

    return (
        <section className="khp-pricing" aria-label="Pricing">
            <div className="khp-container">
                <header className="khp-head">
                    <p className="khp-kicker">Simple pricing</p>
                    <h2 className="h3 khp-title">Pricing That Pays For Itself</h2>
                    <p className="body-s khp-sub">Start free. Upgrade only when you need more.</p>
                </header>

                <div className="khp-grid">
                    {cards.map((c) => (
                        <article key={c.title} className={`khp-card ${c.featured ? "is-featured" : ""}`}>
                            <div className="khp-cardTop">
                                <div className={`khp-pill ${c.featured ? "is-featured" : ""}`}>{c.tag}</div>
                                <p className="h5 khp-cardTitle">{c.title}</p>
                                <p className="body-s khp-cardSub">{c.sub}</p>
                            </div>

                            <div className="khp-priceRow">
                                <div className="khp-price">{c.price}</div>
                                <div className="khp-cadence">{c.cadence}</div>
                            </div>

                            {c.note ? <div className="khp-note">{c.note}</div> : <div className="khp-note khp-note--empty" aria-hidden="true" />}

                            <div className="khp-divider" aria-hidden="true" />

                            <ul className="khp-list" aria-label={`${c.title} plan features`}>
                                {c.features.map((f, idx) => (
                                    <Feature key={idx} title={f.t} desc={f.d} />
                                ))}
                            </ul>

                            <div className="khp-actions">
                                <Link to={c.ctaTo} className={`khp-btn ${c.featured ? "is-primary" : "is-ghost"}`}>
                                    {c.ctaText}
                                </Link>
                            </div>
                        </article>
                    ))}
                </div>

                <div className="khp-bottom">
                    <p className="body-s khp-bottomNote">
                        Want full details? Compare plans and billing intervals on the pricing page.
                    </p>
                    <div className="khp-bottomBtns">
                        <Link to="/pricing" className="khp-btn is-primary khp-btn--inline">
                            View full pricing
                        </Link>
                        <Link to="/products" className="khp-btn is-ghost khp-btn--inline">
                            Shop cards
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
