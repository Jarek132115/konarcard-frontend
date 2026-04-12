// frontend/src/pages/website/pricingpage/PricingPageWho.jsx
import React from "react";
import { motion } from "motion/react";

import "../../../styling/fonts.css";
import "../../../styling/pricing.css";

import TrustSection2 from "../../../assets/images/TrustSection2.jpg";
import TrustSection5 from "../../../assets/images/TrustSection5.jpg";
import TrustSection6 from "../../../assets/images/TrustSection6.jpg";

const EASE = [0.22, 1, 0.36, 1];

const fadeUpInView = (delay = 0) => ({
    initial: { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-40px" },
    transition: { duration: 0.48, delay, ease: EASE },
});

const CARDS = [
    {
        title: "Free",
        desc: "Perfect if you just want your link, contact buttons, and a clean profile.",
        img: TrustSection2,
        alt: "KonarCard free plan preview",
    },
    {
        title: "Plus",
        desc: "Best for higher limits, better presentation, and deeper analytics.",
        img: TrustSection5,
        alt: "KonarCard plus plan preview",
    },
    {
        title: "Teams",
        desc: "Start with Plus, then add extra staff profiles as you grow.",
        img: TrustSection6,
        alt: "KonarCard teams plan preview",
    },
];

export default function PricingPageWho() {
    return (
        <section className="kht pr-who" aria-label="Who each plan is for">
            <div className="kht__inner">

                <motion.header className="kht__head" {...fadeUpInView(0)}>
                    <p className="kc-pill kht__kicker">Plans</p>
                    <h2 className="h3 kht__title">
                        Who each <span className="kht__accent">plan</span> is for
                    </h2>
                    <p className="kc-subheading kht__sub">Pick the plan that fits your day-to-day.</p>
                </motion.header>

                <div className="kht__grid" role="list" aria-label="Plan fit cards">
                    {CARDS.map((c, i) => (
                        <motion.article
                            key={c.title}
                            className="kht__card pr-whoCard"
                            role="listitem"
                            initial={{ opacity: 0, y: 14 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-40px" }}
                            transition={{ duration: 0.42, delay: i * 0.08, ease: EASE }}
                        >
                            <div className="kht__copy">
                                <h3 className="kc-title kht__cardTitle">{c.title}</h3>
                                <p className="body kht__cardDesc">{c.desc}</p>
                            </div>

                            <div className="kht__imgWrap" aria-hidden="true">
                                <img
                                    className="kht__img"
                                    src={c.img}
                                    alt={c.alt}
                                    loading="lazy"
                                    decoding="async"
                                />
                            </div>
                        </motion.article>
                    ))}
                </div>

            </div>
        </section>
    );
}
