import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import "../../styling/home/pricing.css";

/* Plan icons (above plan name) */
import FreePlanIcon from "../../assets/icons/FreePlan.svg";
import PlusPlanIcon from "../../assets/icons/PlusPlan.svg";
import TeamsPlanIcon from "../../assets/icons/TeamsPlan.svg";

/* Feature tick icon */
import PricingTick from "../../assets/icons/PricingTick.svg";

function FeatureRow({ featured, title, desc }) {
    return (
        <li className="kpr-feature">
            <span className={`kpr-check ${featured ? "is-featured" : ""}`} aria-hidden="true">
                <img src={PricingTick} alt="" loading="lazy" decoding="async" />
            </span>

            <div className="kpr-featureCopy">
                <div className={`kpr-featureTitle ${featured ? "is-featured" : ""}`}>{title}</div>
                <div className={`kpr-featureDesc ${featured ? "is-featured" : ""}`}>{desc}</div>
            </div>
        </li>
    );
}

export default function Pricing() {
    const cards = useMemo(
        () => [
            {
                title: "Free",
                icon: FreePlanIcon,
                sub: "Perfect to start sharing today",
                tag: "Start free",
                price: "£0",
                cadence: "Forever",
                note: "",
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
                icon: PlusPlanIcon,
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
                    { t: "Priority support", d: "Get help faster when you need it." }, // ✅ extra bullet point
                ],
                ctaText: "Upgrade to Plus",
                ctaTo: "/pricing",
                featured: true,
            },
            {
                title: "Teams",
                icon: TeamsPlanIcon,
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
        ],
        []
    );

    return (
        <section className="kpr" aria-labelledby="kpr-title" aria-label="KonarCard pricing for digital business cards">
            <div className="kpr__container">
                <header className="kpr__head">
                    <p className="kpr__kicker">Simple pricing</p>

                    <h2 id="kpr-title" className="h3 kpr__title">
                        Pricing That Pays For Itself
                    </h2>

                    <p className="body-s kpr__sub">
                        Start free, then upgrade when you need more. KonarCard combines an NFC business card with a digital business card
                        profile you can update anytime.
                    </p>
                </header>

                <div className="kpr__grid" role="list" aria-label="KonarCard pricing plans">
                    {cards.map((c) => (
                        <article
                            key={c.title}
                            className={`kpr-card ${c.featured ? "is-featured" : ""}`}
                            role="listitem"
                            aria-label={`${c.title} plan`}
                        >
                            <div className="kpr-cardTop">
                                <div className={`kpr-pill ${c.featured ? "is-featured" : ""}`}>{c.tag}</div>

                                <div className="kpr-planRow">
                                    <span className={`kpr-planIcon ${c.featured ? "is-featured" : ""}`} aria-hidden="true">
                                        <img src={c.icon} alt="" loading="lazy" decoding="async" />
                                    </span>

                                    <p className={`h5 kpr-plan ${c.featured ? "kpr-plan--featured" : ""}`}>{c.title}</p>
                                </div>

                                <p className={`body-s kpr-cardSub ${c.featured ? "is-featured" : ""}`}>{c.sub}</p>
                            </div>

                            <div className="kpr-priceRow">
                                <div className={`kpr-price ${c.featured ? "is-featured" : ""}`}>{c.price}</div>
                                <div className={`kpr-cadence ${c.featured ? "is-featured" : ""}`}>{c.cadence}</div>
                            </div>

                            <div className={`kpr-divider ${c.featured ? "is-featured" : ""}`} aria-hidden="true" />

                            <ul className="kpr-list" aria-label={`${c.title} plan features`}>
                                {c.features.map((f, idx) => (
                                    <FeatureRow key={idx} featured={c.featured} title={f.t} desc={f.d} />
                                ))}
                            </ul>

                            {c.note ? <p className={`kpr-noteLine ${c.featured ? "is-featured" : ""}`}>{c.note}</p> : null}

                            <div className="kpr-actions">
                                <Link to={c.ctaTo} className={`kpr-btn ${c.featured ? "is-primary" : "is-ghost"}`}>
                                    {c.ctaText}
                                </Link>
                            </div>
                        </article>
                    ))}
                </div>

                <div className="kpr-bottom">
                    <p className="body-s kpr-bottomNote">
                        Want full details? Compare plans and billing intervals on the pricing page.
                    </p>

                    <div className="kpr-bottomBtns">
                        <Link to="/pricing" className="kpr-btn is-primary kpr-btn--inline">
                            View full pricing
                        </Link>
                        <Link to="/products" className="kpr-btn is-ghost kpr-btn--inline">
                            Shop cards
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
