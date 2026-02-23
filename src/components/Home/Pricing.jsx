import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import "../../styling/home/pricing.css";

/* Plan icons */
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
                cadence: "No monthly fees",
                meta: [],
                highlights: [
                    "Your KonarCard link",
                    "Contact buttons",
                    "QR sharing",
                    "Works on any phone",
                    "Unlimited updates",
                    "Tap or scan share",
                ],
                cta: { label: "Start Free", to: "/register" },
            },
            {
                key: "plus",
                title: "Plus",
                icon: PlusPlanIcon,
                tag: "Most popular",
                featured: true,
                price: "£4.95",
                cadence: "per month",
                meta: ["Cancel anytime. No contracts."],
                highlights: [
                    "Full customisation",
                    "More photos",
                    "Services & pricing",
                    "Reviews & ratings",
                    "Unlimited edits",
                    "Remove branding",
                    "Deeper analytics",
                ],
                cta: { label: "Upgrade to Plus", to: "/pricing" },
            },
            {
                key: "teams",
                title: "Teams",
                icon: TeamsPlanIcon,
                tag: "For small teams",
                featured: false,
                price: "£4.95",
                cadence: "+ £1.95 per extra profile",
                meta: ["Billed monthly. Cancel anytime."],
                highlights: [
                    "Everything in Plus",
                    "Add staff profiles",
                    "Centralised controls",
                    "Shared branding",
                    "Team analytics",
                    "Manage in one place",
                ],
                cta: { label: "Upgrade to Teams", to: "/pricing" },
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
                        Pricing That <span className="kpr__accent">Pays</span> For Itself
                    </h2>

                    <p className="kc-subheading kpr__sub">
                        Start free. Upgrade anytime. No contracts.
                    </p>
                </header>

                <div className="kpr__grid" role="list" aria-label="KonarCard plans">
                    {cards.map((card) => {
                        const isFeatured = card.featured;

                        return (
                            <article
                                key={card.key}
                                className={`kpr-card ${isFeatured ? "is-featured" : ""}`}
                                role="listitem"
                            >
                                {/* TOP */}
                                <div className={`kpr-top ${isFeatured ? "is-featured" : ""}`}>
                                    <div className={`kpr-tag ${isFeatured ? "is-featured" : ""}`}>
                                        {card.tag}
                                    </div>

                                    <div className="kpr-nameRow">
                                        <div className={`kpr-name ${isFeatured ? "is-featured" : ""}`}>
                                            {card.title}
                                        </div>

                                        <span className={`kpr-icon ${isFeatured ? "is-featured" : ""}`} aria-hidden="true">
                                            <img src={card.icon} alt="" loading="lazy" decoding="async" />
                                        </span>
                                    </div>

                                    <div className="kpr-priceRow">
                                        <div className={`kpr-price ${isFeatured ? "is-featured" : ""}`}>
                                            {card.price}
                                        </div>
                                        <div className={`kpr-cadence ${isFeatured ? "is-featured" : ""}`}>
                                            {card.cadence}
                                        </div>
                                    </div>

                                    {card.meta?.length ? (
                                        <div className={`kpr-meta ${isFeatured ? "is-featured" : ""}`}>
                                            {card.meta.map((m) => (
                                                <div key={m}>{m}</div>
                                            ))}
                                        </div>
                                    ) : null}
                                </div>

                                <div className={`kpr-divider ${isFeatured ? "is-featured" : ""}`} aria-hidden="true" />

                                {/* BODY (fit height) */}
                                <div className="kpr-body">
                                    {/* content wrapper */}
                                    <div className="kpr-content">
                                        <div className={`kpr-included ${isFeatured ? "is-featured" : ""}`}>
                                            What’s Included
                                        </div>

                                        <ul
                                            className={`kpr-list ${isFeatured ? "is-featured" : ""}`}
                                            aria-label={`${card.title} plan features`}
                                        >
                                            {card.highlights.map((h) => (
                                                <li key={h} className="kpr-li">
                                                    <span className={`kpr-liText ${isFeatured ? "is-featured" : ""}`}>
                                                        {h}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* ✅ CTA wrapper gives consistent spacing */}
                                    <div className="kpr-actions">
                                        <Link
                                            to={card.cta.to}
                                            className={`kx-btn kpr-btn ${isFeatured ? "kpr-btn--featured" : "kpr-btn--outline"}`}
                                        >
                                            {card.cta.label}
                                        </Link>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>

                <div className="kpr-bottom">
                    <p className="body-s kpr-bottomText">Compare plans and see full details.</p>

                    <Link to="/pricing" className="kx-btn kx-btn--black">
                        View full Pricing
                    </Link>
                </div>
            </div>
        </section>
    );
}