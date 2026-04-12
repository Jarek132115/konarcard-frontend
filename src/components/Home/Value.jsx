// frontend/src/components/Home/Value.jsx
import React from "react";
import { motion } from "motion/react";
import "../../styling/home/value.css";

/* Icons */
import SmartPhoneTapIcon from "../../assets/icons/SmartPhoneTap.svg";
import ToolsIcon from "../../assets/icons/Tools.svg";
import MoneyShieldIcon from "../../assets/icons/MoneyShield.svg";
import TrophyIcon from "../../assets/icons/Trophy.svg";
import NoPrintIcon from "../../assets/icons/NoPrint.svg";
import RefreshIcon from "../../assets/icons/Refresh.svg";

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
        icon: MoneyShieldIcon,
        title: "One job pays for everything",
        desc: "One extra job can cover your card cost.",
    },
    {
        icon: NoPrintIcon,
        title: "No reprints, ever",
        desc: "Update details anytime - no reprints.",
    },
    {
        icon: RefreshIcon,
        title: "Always up to date",
        desc: "Your latest work and reviews stay up to date.",
    },
    {
        icon: SmartPhoneTapIcon,
        title: "Works everywhere",
        desc: "Share anywhere - works on every phone.",
    },
    {
        icon: ToolsIcon,
        title: "Built for real trades",
        desc: "Built for real jobs, not office desks.",
    },
    {
        icon: TrophyIcon,
        title: "Looks professional fast",
        desc: "Look credible before you even speak.",
    },
];

export default function Value() {
    return (
        <section className="khv" aria-label="Why KonarCard is worth it">
            <div className="khv__inner">
                <motion.header className="khv__head" {...fadeUpInView(0)}>
                    <p className="kc-pill khv__kicker">Built for trades</p>

                    <h2 className="h3 khv__title">
                        Why KonarCard Is <span className="khv__accent">Worth It</span>
                    </h2>

                    <p className="kc-subheading khv__sub">
                        A practical profile you can share by tap, QR, or link.
                    </p>
                </motion.header>

                <div className="khv__grid" aria-label="KonarCard benefits">
                    {ITEMS.map((it, i) => (
                        <motion.article
                            className="khv__cell"
                            key={i}
                            initial={{ opacity: 0, y: 14 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-40px" }}
                            transition={{ duration: 0.44, delay: i * 0.07, ease: EASE }}
                        >
                            <div className="khv__icon" aria-hidden="true">
                                <img className="khv__iconImg" src={it.icon} alt="" loading="lazy" />
                            </div>

                            <h3 className="kc-title khv__cellTitle">{it.title}</h3>
                            <p className="body khv__cellDesc">{it.desc}</p>
                        </motion.article>
                    ))}
                </div>
            </div>
        </section>
    );
}
