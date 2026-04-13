// frontend/src/components/Home/HowItWorks.jsx
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";

import "../../styling/home/howitworks.css";

import Step1 from "../../assets/images/Step1.jpg";
import Step2 from "../../assets/images/Step2.jpg";
import Step3 from "../../assets/images/Step3.jpg";

/* ── Animation presets ─────────────────────────────────────── */
const EASE = [0.22, 1, 0.36, 1];

const fadeUpInView = (delay = 0) => ({
    initial: { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-40px" },
    transition: { duration: 0.48, delay, ease: EASE },
});

/* ── Data ──────────────────────────────────────────────────── */
const STEPS = [
    {
        step: "Step 1",
        title: "Tap or Scan",
        desc: "The customer taps your card on their phone, or scans the QR code on the back.",
        img: Step1,
        alt: "Customer tapping a KonarCard on their phone",
    },
    {
        step: "Step 2",
        title: "Profile Opens",
        desc: "They see your details, services, work photos and reviews straight away — no app needed.",
        img: Step2,
        alt: "KonarCard profile open on a phone",
    },
    {
        step: "Step 3",
        title: "They Book You",
        desc: "Call, save your number, send a message or leave a review — all from one link.",
        img: Step3,
        alt: "Customer contacting a tradesperson via KonarCard",
    },
];

export default function HowItWorks() {
    return (
        <section className="hiw" aria-label="Set up your profile in 3 simple steps">
            <div className="hiw__inner">

                <motion.header className="hiw__head" {...fadeUpInView(0)}>
                    <p className="kc-pill hiw__kicker">How it works</p>

                    <h2 className="h3 hiw__title">
                        Tap the card.{" "}
                        <span className="hiw__accent">Win the job.</span>
                    </h2>

                    <p className="kc-subheading hiw__sub">
                        No apps to download. No faff. Three steps and the customer has everything they need.
                    </p>
                </motion.header>

                <ol className="hiw__grid">
                    {STEPS.map((s, i) => (
                        <motion.li
                            className="hiw__card"
                            key={s.step}
                            initial={{ opacity: 0, y: 14 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-40px" }}
                            transition={{ duration: 0.44, delay: i * 0.1, ease: EASE }}
                        >
                            <div className="hiw__cardTop">
                                <span className="kc-pill hiw__stepPill">{s.step}</span>
                                <h3 className="kc-title hiw__cardTitle">{s.title}</h3>
                                <p className="body hiw__cardDesc">{s.desc}</p>
                            </div>

                            <div className="hiw__imgWrap">
                                <img
                                    src={s.img}
                                    alt={s.alt}
                                    className="hiw__img"
                                    loading="lazy"
                                    decoding="async"
                                />
                            </div>
                        </motion.li>
                    ))}
                </ol>

                <motion.div className="hiw__ctaBlock" {...fadeUpInView(0.2)}>
                    <p className="body hiw__ctaDesc">
                        Ready to look more professional on the next job?
                    </p>

                    <div className="hiw__cta">
                        <Link to="/register" className="kx-btn kx-btn--black">
                            Start Free
                        </Link>

                        <Link to="/products" className="kx-btn kx-btn--white">
                            See the Cards
                        </Link>
                    </div>
                </motion.div>

            </div>
        </section>
    );
}
