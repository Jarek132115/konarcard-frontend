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
        title: "Claim Your Link",
        desc: "Sign up free and get your own KonarCard link. It takes two minutes and no card is needed to get started.",
        img: Step1,
        alt: "Claim your KonarCard link",
    },
    {
        step: "Step 2",
        title: "Create Your Profile",
        desc: "Add your services, work photos, prices and contact details. Your profile looks professional from day one.",
        img: Step2,
        alt: "Create your KonarCard profile",
    },
    {
        step: "Step 3",
        title: "Share Your Profile",
        desc: "Tap your card to a customer's phone, share your link, or let them scan the QR code. Your profile opens instantly on any phone.",
        img: Step3,
        alt: "Share your KonarCard profile",
    },
];

export default function HowItWorks() {
    return (
        <section className="hiw" aria-label="Set up your profile in 3 simple steps">
            <div className="hiw__inner">

                <motion.header className="hiw__head" {...fadeUpInView(0)}>
                    <p className="kc-pill hiw__kicker">How it works</p>

                    <h2 className="h3 hiw__title">
                        How <span className="hiw__accent">KonarCard</span> Works
                    </h2>

                    <p className="kc-subheading hiw__sub">
                        Quick and easy. Set up in under 5 minutes.
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
                            Claim Your Link
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
