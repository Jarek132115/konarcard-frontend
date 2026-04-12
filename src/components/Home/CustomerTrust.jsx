// frontend/src/components/Home/CustomerTrust.jsx
import React from "react";
import { motion } from "motion/react";

import "../../styling/home/customertrust.css";

import TrustSection1 from "../../assets/images/TrustSection1.jpg";
import TrustSection2 from "../../assets/images/TrustSection2.jpg";
import TrustSection3 from "../../assets/images/TrustSection3.jpg";
import TrustSection4 from "../../assets/images/TrustSection4.jpg";
import TrustSection5 from "../../assets/images/TrustSection5.jpg";
import TrustSection6 from "../../assets/images/TrustSection6.jpg";

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
        img: TrustSection1,
        alt: "KonarCard works on every phone example",
        title: "Works on every phone",
        desc: "Tap or scan to open your profile instantly - no apps, no setup.",
    },
    {
        img: TrustSection2,
        alt: "KonarCard shows your work in one place example",
        title: "Your work, all in one place",
        desc: "Show photos, services, pricing, and reviews clearly in one simple layout.",
    },
    {
        img: TrustSection3,
        alt: "KonarCard instant contact options example",
        title: "Instant contact options",
        desc: "Let customers call, WhatsApp, email, or save your number in one tap.",
    },
    {
        img: TrustSection4,
        alt: "KonarCard update anytime example",
        title: "Update anytime",
        desc: "Change your details, prices, or photos once - it updates everywhere.",
    },
    {
        img: TrustSection5,
        alt: "KonarCard looks professional example",
        title: "Looks professional",
        desc: "Make a strong first impression before you even speak.",
    },
    {
        img: TrustSection6,
        alt: "KonarCard share anywhere example",
        title: "Share anywhere",
        desc: "In person, on site, online, or across social media.",
    },
];

export default function CustomerTrust() {
    return (
        <section className="kht" aria-label="Trust builders for your digital business card">
            <div className="kht__inner">

                <motion.header className="kht__head" {...fadeUpInView(0)}>
                    <p className="kc-pill kht__kicker">Built for trades</p>

                    <h2 className="h3 kht__title">
                        Everything <span className="kht__accent">Customers</span> Need
                        <br />
                        to <span className="kht__accent">Trust You</span>
                    </h2>

                    <p className="kc-subheading kht__sub">
                        Put your work, reviews, and contact options in one place — so
                        <br />
                        customers choose you faster.
                    </p>
                </motion.header>

                <div className="kht__grid" role="list" aria-label="Trust builder features">
                    {CARDS.map((c, i) => (
                        <motion.article
                            key={c.title}
                            className="kht__card"
                            role="listitem"
                            initial={{ opacity: 0, y: 14 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-40px" }}
                            transition={{ duration: 0.42, delay: i * 0.07, ease: EASE }}
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
