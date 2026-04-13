// frontend/src/components/Home/Comparison.jsx
import React from "react";
import { motion } from "motion/react";
import "../../styling/home/comparison.css";

/* ── Animation presets ─────────────────────────────────────── */
const EASE = [0.22, 1, 0.36, 1];

const fadeUpInView = (delay = 0) => ({
    initial: { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-40px" },
    transition: { duration: 0.48, delay, ease: EASE },
});

/* ── Data ──────────────────────────────────────────────────── */
const PAPER = [
    "Gets lost, damaged, or binned",
    "Runs out when you need it",
    "Outdated details = missed jobs",
    "No photos, reviews, or proof",
    "Awkward to share online",
    "Costs money every reprint",
];

const KONAR = [
    "One link that's always ready to share",
    "Update details anytime - no reprints",
    "Show photos, reviews, and services",
    "Share by tap, QR, or link",
    "Look professional instantly",
    "Works on every smartphone",
];

export default function Comparison() {
    return (
        <section className="kc-comp" aria-labelledby="kc-comp-title">
            <div className="kc-comp__inner">
                <motion.header className="kc-comp__header" {...fadeUpInView(0)}>
                    <p className="kc-pill kc-comp__kicker">Why switch?</p>

                    <h2 id="kc-comp-title" className="h3 kc-comp__title">
                        Stop handing out paper cards.{" "}
                        <span className="kc-comp__accent">Start winning trust.</span>
                    </h2>

                    <p className="kc-subheading kc-comp__sub">
                        Paper cards get lost, go out of date, and can't show your work
                        quality.
                    </p>
                </motion.header>

                <div
                    className="kc-comp__layout"
                    aria-label="Comparison: paper business cards vs KonarCard"
                >
                    <motion.article
                        className="kc-comp__card kc-comp__card--paper"
                        aria-label="Old way: Paper business cards"
                        initial={{ opacity: 0, y: 14 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-40px" }}
                        transition={{ duration: 0.44, delay: 0.08, ease: EASE }}
                    >
                        <div className="kc-comp__cardPill">Old way</div>

                        <h3 className="kc-title kc-comp__cardTitle">Paper Business Cards</h3>

                        <p className="body kc-comp__cardHint">
                            Easy to lose. Easy to ignore. Hard to trust.
                        </p>

                        <div className="kc-comp__divider" />

                        <h4 className="kc-subheading-md kc-comp__listTitle">
                            What goes wrong
                        </h4>

                        <ul className="kc-comp__list">
                            {PAPER.map((t, i) => (
                                <li key={i} className="kc-comp__row">
                                    <span className="kc-comp__dot" aria-hidden="true">
                                        •
                                    </span>
                                    <span className="body kc-comp__rowText">{t}</span>
                                </li>
                            ))}
                        </ul>

                        <p className="body kc-comp__note">
                            <em>Fine for 2012. Not great today.</em>
                        </p>
                    </motion.article>

                    <div className="kc-comp__or" aria-hidden="true">
                        <span className="kc-title">OR</span>
                    </div>

                    <motion.article
                        className="kc-comp__card kc-comp__card--konar"
                        aria-label="Smarter option: KonarCard"
                        initial={{ opacity: 0, y: 14 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-40px" }}
                        transition={{ duration: 0.44, delay: 0.16, ease: EASE }}
                    >
                        <div className="kc-comp__cardPill kc-comp__cardPill--dark">
                            The smarter option
                        </div>

                        <h3 className="kc-title kc-comp__cardTitle kc-comp__cardTitle--white">
                            KonarCard - The Modern Alternative
                        </h3>

                        <p className="body kc-comp__cardHint kc-comp__cardHint--white">
                            A shareable profile that sells your work.
                        </p>

                        <div className="kc-comp__divider kc-comp__divider--white" />

                        <h4 className="kc-subheading-md kc-comp__listTitle kc-comp__listTitle--white">
                            What You Get
                        </h4>

                        <ul className="kc-comp__list">
                            {KONAR.map((t, i) => (
                                <li key={i} className="kc-comp__row kc-comp__row--white">
                                    <span
                                        className="kc-comp__dot kc-comp__dot--white"
                                        aria-hidden="true"
                                    >
                                        •
                                    </span>
                                    <span className="body kc-comp__rowText kc-comp__rowText--white">
                                        {t}
                                    </span>
                                </li>
                            ))}
                        </ul>

                        <p className="body kc-comp__note kc-comp__note--white">
                            <em>Share in seconds. Win trust faster.</em>
                        </p>
                    </motion.article>
                </div>
            </div>
        </section>
    );
}
