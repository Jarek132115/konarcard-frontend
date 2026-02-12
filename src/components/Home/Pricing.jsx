// frontend/src/components/Home/Pricing.jsx
import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import "../../styling/home/pricing.css";

/* Plan icons (above plan name) */
import FreePlanIcon from "../../assets/icons/FreePlan.svg";
import PlusPlanIcon from "../../assets/icons/PlusPlan.svg";
import TeamsPlanIcon from "../../assets/icons/TeamsPlan.svg";

/* Feature tick icon */
import PricingTick from "../../assets/icons/PricingTick.svg";

/* ✅ Single-line feature row (no title + desc split) */
function FeatureRow({ featured, text }) {
    return (
        <li className="kpr-feature">
            <span className={`kpr-check ${featured ? "is-featured" : ""}`} aria-hidden="true">
                <img src={PricingTick} alt="" loading="lazy" decoding="async" />
            </span>

            <p className={`kpr-featureLine ${featured ? "is-featured" : ""}`}>{text}</p>
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
                    "1 profile + 1 link + 1 QR code",
                    "Fully customise your profile anytime",
                    "Works on any phone — tap or scan, no app",
                    "Unlimited link updates (your link never changes)",
                    "Add contact info, socials, website, and reviews",
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
                /* ✅ more bullets so it’s taller and stands out more */
                features: [
                    "Choose from 5 premium layouts",
                    "Higher limits for photos, services, and reviews",
                    "Add more links (WhatsApp, booking, quote form)",
                    "Deep analytics — see what customers click",
                    "Remove Konar branding (make it fully yours)",
                    "Priority support when you need help fast",
                    "Showcase your best work with featured galleries",
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
                price: "£4.95",
                cadence: "per month",
                note: "Add extra profiles",
                features: [
                    "Multiple team profiles for staff and contractors",
                    "Centralised branding to keep everything consistent",
                    "Deep analytics across profiles",
                    "Extra profiles available — £1.95 per profile / month",
                    "Manage profiles from one place",
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
                        Start free, then upgrade when you need more. KonarCard combines an NFC business card with a digital business card profile
                        you can update anytime.
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
                                    <p className={`h5 kpr-plan ${c.featured ? "kpr-plan--featured" : ""}`}>{c.title}</p>

                                    <span className={`kpr-planIcon ${c.featured ? "is-featured" : ""}`} aria-hidden="true">
                                        <img src={c.icon} alt="" loading="lazy" decoding="async" />
                                    </span>
                                </div>

                                <p className={`body-s kpr-cardSub ${c.featured ? "is-featured" : ""}`}>{c.sub}</p>
                            </div>

                            <div className="kpr-priceRow">
                                <div className={`kpr-price ${c.featured ? "is-featured" : ""}`}>{c.price}</div>
                                <div className={`kpr-cadence ${c.featured ? "is-featured" : ""}`}>{c.cadence}</div>
                            </div>

                            <div className={`kpr-divider ${c.featured ? "is-featured" : ""}`} aria-hidden="true" />

                            <ul className="kpr-list" aria-label={`${c.title} plan features`}>
                                {c.features.map((text, idx) => (
                                    <FeatureRow key={idx} featured={c.featured} text={text} />
                                ))}
                            </ul>

                            {c.note ? <p className={`kpr-noteLine ${c.featured ? "is-featured" : ""}`}>{c.note}</p> : null}

                            <div className="kpr-actions">
                                <Link to={c.ctaTo} className={`kx-btn ${c.featured ? "kx-btn--white" : "kx-btn--black"} kpr-ctaBtn`}>
                                    {c.ctaText}
                                </Link>
                            </div>
                        </article>
                    ))}
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
