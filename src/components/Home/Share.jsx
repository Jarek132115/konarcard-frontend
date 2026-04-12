// frontend/src/components/Home/Share.jsx
import React from "react";
import { motion } from "motion/react";

import "../../styling/home/share.css";

import ShareFastest  from "../../assets/images/ShareFastest.jpg";
import SharePhone    from "../../assets/images/SharePhone.jpg";
import ShareFollowUp from "../../assets/images/ShareFollowUp.jpg";
import ShareVisible  from "../../assets/images/ShareVisible.jpg";

/* ── Animation presets ─────────────────────────────────────── */
const EASE = [0.22, 1, 0.36, 1];

const fadeUpInView = (delay = 0) => ({
    initial: { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-40px" },
    transition: { duration: 0.48, delay, ease: EASE },
});

/* ── Data ──────────────────────────────────────────────────── */
const ITEMS = [
    {
        k: "nfc",
        title: "Tap with KonarCard",
        desc: "Tap your card — your profile opens instantly.",
        img: ShareFastest,
        badge: "Fastest Way",
    },
    {
        k: "phone",
        title: "Scan the QR backup",
        desc: "Scan with any phone camera — opens instantly.",
        img: SharePhone,
        badge: "Works on Any Phone",
    },
    {
        k: "msg",
        title: "Send your link",
        desc: "Send it by WhatsApp, text, or email in seconds.",
        img: ShareFollowUp,
        badge: "Best for Follow-Ups",
    },
    {
        k: "bio",
        title: "Link in bio",
        desc: "Add it to Instagram, Google, or your website.",
        img: ShareVisible,
        badge: "Always Visible",
    },
];

export default function Share() {
    return (
        <section className="khs-share" aria-label="How to share your profile with KonarCard">
            <div className="khs-container">

                <motion.header className="khs-head" {...fadeUpInView(0)}>
                    <p className="kc-pill khs-kicker">One profile, everywhere</p>

                    <h2 className="h3 khs-title">
                        One <span className="khs-accent">Profile</span>. Shared{" "}
                        <span className="khs-accent">Every Way</span>.
                    </h2>

                    <p className="kc-subheading khs-sub">
                        Share your profile in person, online, and anywhere.
                    </p>
                </motion.header>

                <div className="khs-grid" aria-label="Sharing methods">
                    {ITEMS.map((it, i) => (
                        <motion.article
                            className="khs-card"
                            key={it.k}
                            initial={{ opacity: 0, y: 14 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-40px" }}
                            transition={{ duration: 0.44, delay: i * 0.07, ease: EASE }}
                        >
                            {/* Image — top of card, badge pill overlaid */}
                            <div className="khs-media" aria-hidden="true">
                                <span className="khs-pill">{it.badge}</span>
                                <img
                                    className="khs-img"
                                    src={it.img}
                                    alt={`${it.title} — KonarCard sharing method`}
                                    loading="lazy"
                                    decoding="async"
                                />
                            </div>

                            {/* Body below image */}
                            <div className="khs-body">
                                <h3 className="kc-title khs-cardTitle">{it.title}</h3>
                                <p className="body khs-cardDesc">{it.desc}</p>
                            </div>
                        </motion.article>
                    ))}
                </div>

            </div>
        </section>
    );
}
