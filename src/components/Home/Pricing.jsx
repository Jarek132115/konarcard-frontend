import React from "react";
import { Link } from "react-router-dom";
import "../../styling/home/pricing.css";

/*
  HOME — PRICING SECTION
  Matches screenshot:
  - Title + subtitle centered
  - 3 pricing cards
  - Each card: heading, subheading, 14-day pill, divider, big price £0 + Forever, bullet list, full-width CTA
  - Uses simple consistent classes + global typography where available
*/

function Bullet({ title, desc }) {
    return (
        <li className="kc-pricing__feature">
            <span className="kc-pricing__dot" aria-hidden="true" />
            <div className="kc-pricing__featureCopy">
                <div className="kc-pricing__featureTitle">{title}</div>
                <div className="kc-pricing__featureDesc">{desc}</div>
            </div>
        </li>
    );
}

export default function Pricing() {
    const cards = [
        {
            title: "Konar Digital Business Card Page",
            sub: "Win more work with a power profile",
            badge: "14-Day Free Trial",
            price: "£0",
            cadence: "Forever",
            features: [
                { t: "Digital profile", d: "Upload unlimited photos (Portfolio / Gallery)" },
                { t: "Simple Editor", d: "Edit anytime — no tech skills needed" },
                { t: "Reviews", d: "Build trust with social proof" },
                { t: "Contact options", d: "Call, message, or save details instantly" },
            ],
            ctaText: "Start Free",
            ctaTo: "/register",
            featured: false,
        },
        {
            title: "Konar Digital Business Card Page",
            sub: "Win more work with a power profile",
            badge: "14-Day Free Trial",
            price: "£0",
            cadence: "Forever",
            features: [
                { t: "Digital profile", d: "Upload unlimited photos (Portfolio / Gallery)" },
                { t: "Simple Editor", d: "Edit anytime — no tech skills needed" },
                { t: "Services", d: "List what you do with clear pricing" },
                { t: "Share anywhere", d: "Link, QR code, and NFC tap" },
            ],
            ctaText: "Start Free",
            ctaTo: "/register",
            featured: true, // subtle emphasis on middle card
        },
        {
            title: "Konar Digital Business Card Page",
            sub: "Win more work with a power profile",
            badge: "14-Day Free Trial",
            price: "£0",
            cadence: "Forever",
            features: [
                { t: "Digital profile", d: "Upload unlimited photos (Portfolio / Gallery)" },
                { t: "Simple Editor", d: "Edit anytime — no tech skills needed" },
                { t: "Branding", d: "Logo, colours, and layout control" },
                { t: "Works on any phone", d: "No app needed — just tap or scan" },
            ],
            ctaText: "Start Free",
            ctaTo: "/register",
            featured: false,
        },
    ];

    return (
        <section className="kc-pricing section" aria-label="Pricing">
            <div className="kc-pricing__inner">
                <div className="kc-pricing__header">
                    <h2 className="kc-pricing__title desktop-h2 text-center">Simple Pricing That Pays For Itself</h2>
                    <p className="kc-pricing__sub desktop-body-s text-center">Start free. Upgrade only if you need more.</p>
                </div>

                <div className="kc-pricing__grid">
                    {cards.map((c, i) => (
                        <article
                            key={i}
                            className={`kc-pricing__card ${c.featured ? "is-featured" : ""}`}
                        >
                            <div className="kc-pricing__top">
                                <div className="kc-pricing__head">
                                    <h3 className="kc-pricing__cardTitle">{c.title}</h3>
                                    <p className="kc-pricing__cardSub">{c.sub}</p>
                                </div>
                                <span className="kc-pricing__badge">{c.badge}</span>
                            </div>

                            <div className="kc-pricing__divider" />

                            <div className="kc-pricing__priceRow">
                                <div className="kc-pricing__price">{c.price}</div>
                                <div className="kc-pricing__cadence">{c.cadence}</div>
                            </div>

                            <ul className="kc-pricing__features">
                                {c.features.map((f, idx) => (
                                    <Bullet key={idx} title={f.t} desc={f.d} />
                                ))}
                            </ul>

                            <div className="kc-pricing__bottom">
                                <Link to={c.ctaTo} className="kc-pricing__btn">
                                    {c.ctaText}
                                </Link>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
