import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import "../../styling/home/pricing.css";

/* Plan icons (same as pricing page) */
import FreePlanIcon from "../../assets/icons/FreePlan.svg";
import PlusPlanIcon from "../../assets/icons/PlusPlan.svg";
import TeamsPlanIcon from "../../assets/icons/TeamsPlan.svg";

export default function Pricing() {
    const cards = useMemo(
        () => [
            {
                key: "free",
                title: "Individual",
                icon: FreePlanIcon,
                tag: "Best for starting out",
                featured: false,
                price: "£0",
                sub: "No monthly cost",
                priceMeta: [],
                highlights: ["Your KonarCard link", "Contact buttons", "QR sharing", "Works on any phone", "Unlimited updates", "Tap or scan share"],
                cta: { type: "link", label: "Get started free", to: "/register" },
            },
            {
                key: "plus",
                title: "Plus",
                icon: PlusPlanIcon,
                tag: "Most popular",
                featured: true,
                price: "£4.95",
                sub: "per month",
                priceMeta: ["Cancel anytime."],
                highlights: ["Full customisation", "More photos", "Services & pricing", "Reviews & ratings", "Unlimited edits", "Remove branding", "Deeper analytics"],
                cta: { type: "link", label: "Continue to Plus", to: "/pricing" },
            },
            {
                key: "teams",
                title: "Teams",
                icon: TeamsPlanIcon,
                tag: "For small teams",
                featured: false,
                price: "£4.95",
                sub: "per month + add-ons",
                priceMeta: ["£1.95 / extra profile / month", "Billed monthly.", "Example: 3 profiles = £8.85 / month"],
                highlights: ["Everything in Plus", "Add staff profiles", "Centralised controls", "Shared branding", "Team analytics", "Manage in one place"],
                cta: { type: "link", label: "Continue to Teams", to: "/pricing" },
            },
        ],
        []
    );

    return (
        <section className="kpr" aria-label="Pricing">
            <div className="kpr__container">
                <header className="kpr__head">
                    <div className="kc-pill kpr__pill">Simple pricing</div>

                    <h2 className="h3 kpr__title">
                        Pricing That <span className="kpr-accent">Pays</span> For Itself
                    </h2>

                    <p className="body-s kpr__sub">
                        Start free. Upgrade when you’re ready. No stress.
                    </p>

                </header>

                <div className="kpr__grid" role="list" aria-label="KonarCard plans">
                    {cards.map((card) => {
                        const isFeatured = card.featured;
                        const btn = card.cta;

                        return (
                            <article key={card.key} className={`kpr-card ${isFeatured ? "is-featured" : ""}`} role="listitem">
                                <div className="kpr-cardTop">
                                    {/* pill row */}
                                    <div className={`kpr-pillCard ${isFeatured ? "is-featured" : ""}`}>{card.tag}</div>

                                    {/* ✅ ALWAYS next row */}
                                    <div className="kpr-planRow">
                                        <p className={`h5 kpr-plan ${isFeatured ? "is-featured" : ""}`}>{card.title}</p>

                                        <span className={`kpr-planIcon ${isFeatured ? "is-featured" : ""}`} aria-hidden="true">
                                            <img src={card.icon} alt="" loading="lazy" decoding="async" />
                                        </span>
                                    </div>

                                    <div className="kpr-priceRow">
                                        <div className={`kpr-price ${isFeatured ? "is-featured" : ""}`}>{card.price}</div>
                                        <div className={`kpr-cadence ${isFeatured ? "is-featured" : ""}`}>{card.sub}</div>
                                    </div>

                                    {card.priceMeta?.length ? (
                                        <div className={`kpr-priceMeta ${isFeatured ? "is-featured" : ""}`}>
                                            {card.priceMeta.map((m) => (
                                                <div key={m} className="kpr-priceMeta__line">
                                                    {m}
                                                </div>
                                            ))}
                                        </div>
                                    ) : null}
                                </div>

                                <div className={`kpr-divider ${isFeatured ? "is-featured" : ""}`} aria-hidden="true" />

                                <div className={`kpr-included ${isFeatured ? "is-featured" : ""}`}>What’s included</div>

                                <ul className={`kpr-bullets ${isFeatured ? "is-featured" : ""}`} aria-label={`${card.title} plan features`}>
                                    {card.highlights.map((h) => (
                                        <li key={h} className="kpr-bulletItem">
                                            <span className="body-s kpr-liText">{h}</span>
                                        </li>
                                    ))}
                                </ul>

                                <div className="kpr-actions">
                                    <Link to={btn.to} className={`kx-btn kpr-ctaBtn ${isFeatured ? "kpr-ctaBtn--orange" : "kpr-ctaBtn--outline"}`}>
                                        {btn.label}
                                    </Link>
                                </div>
                            </article>
                        );
                    })}
                </div>

                <div className="kpr-bottom">
                    <p className="body-s kpr-bottomNote">Want full details? Compare plans and billing intervals on the pricing page.</p>

                    <div className="kpr-bottomBtns">
                        <Link to="/pricing" className="kx-btn kx-btn--black">
                            View full pricing
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
