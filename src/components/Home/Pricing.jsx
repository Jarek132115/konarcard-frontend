// frontend/src/components/Home/Pricing.jsx
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";

import "../../styling/home/pricing.css";

import FreePlanIcon  from "../../assets/icons/FreePlan.svg";
import PlusPlanIcon  from "../../assets/icons/PlusPlan.svg";
import TeamsPlanIcon from "../../assets/icons/TeamsPlan.svg";

/* ── Animation presets ─────────────────────────────────────── */
const EASE = [0.22, 1, 0.36, 1];

const fadeUpInView = (delay = 0) => ({
    initial: { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-40px" },
    transition: { duration: 0.48, delay, ease: EASE },
});

/* ── Data ──────────────────────────────────────────────────── */
const CARDS = [
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
        cta: { label: "Claim Your Link", to: "/register" },
    },
    {
        key: "plus",
        title: "Plus",
        icon: PlusPlanIcon,
        tag: "Most popular",
        featured: true,
        price: "£5",
        cadence: "per month",
        meta: ["Cancel anytime. No contracts."],
        highlights: [
            "Full customisation",
            "More photos",
            "Services & pricing",
            "Reviews & ratings",
            "Unlimited edits",
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
        price: "£5",
        cadence: "+ £2 per extra profile/month",
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
];

export default function Pricing() {
    return (
        <section className="kpr" aria-label="Pricing">
            <div className="kpr__container">

                <motion.header className="kpr__head" {...fadeUpInView(0)}>
                    <div className="kc-pill kpr__pill">Simple pricing</div>

                    <h2 className="h3 kpr__title">
                        Pricing That <span className="kpr__accent">Pays</span> For Itself
                    </h2>

                    <p className="kc-subheading kpr__sub">
                        Start free. Upgrade anytime. No contracts.
                    </p>
                </motion.header>

                <div className="kpr__grid" role="list" aria-label="KonarCard plans">
                    {CARDS.map((card, i) => {
                        const isFeatured = card.featured;

                        return (
                            <motion.article
                                key={card.key}
                                className={`kpr-card ${isFeatured ? "is-featured" : ""}`}
                                role="listitem"
                                initial={{ opacity: 0, y: 14 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-40px" }}
                                transition={{ duration: 0.44, delay: i * 0.08, ease: EASE }}
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

                                {/* BODY */}
                                <div className="kpr-body">
                                    <div className="kpr-content">
                                        <div className={`kpr-included ${isFeatured ? "is-featured" : ""}`}>
                                            What's Included
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

                                    <div className="kpr-actions">
                                        <Link
                                            to={card.cta.to}
                                            className={`kx-btn kpr-btn ${isFeatured ? "kpr-btn--featured" : "kpr-btn--outline"}`}
                                        >
                                            {card.cta.label}
                                        </Link>
                                    </div>
                                </div>
                            </motion.article>
                        );
                    })}
                </div>

                <motion.div className="kpr-bottom" {...fadeUpInView(0.2)}>
                    <p className="body-s kpr-bottomText">Compare plans and see full details.</p>
                    <Link to="/pricing" className="kx-btn kx-btn--black">
                        View full Pricing
                    </Link>
                </motion.div>

            </div>
        </section>
    );
}
