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
        icon: RefreshIcon,
        title: "Your details never go out of date",
        desc: "Change your number, address or prices online and every card you have ever handed out updates instantly.",
    },
    {
        icon: SmartPhoneTapIcon,
        title: "Customers see your work before they call",
        desc: "Your profile shows photos, services and reviews. Customers arrive knowing what you do and what you charge.",
    },
    {
        icon: NoPrintIcon,
        title: "No reprints, no waste",
        desc: "One card does the job forever. Stop paying for boxes of cards that end up in a drawer.",
    },
    {
        icon: MoneyShieldIcon,
        title: "Works on every phone",
        desc: "Tap to an iPhone or Android. No app needed on the customer's end. It just works.",
    },
    {
        icon: ToolsIcon,
        title: "Built for life on the tools",
        desc: "Tough plastic that lives in a wallet or van glovebox. Made for everyday use, not office drawers.",
    },
    {
        icon: TrophyIcon,
        title: "Looks professional from day one",
        desc: "A clean, branded profile that earns trust the second you hand the card over.",
    },
];

export default function Value() {
    return (
        <section className="khv" aria-label="Why KonarCard is worth it">
            <div className="khv__inner">
                <motion.header className="khv__head" {...fadeUpInView(0)}>
                    <p className="kc-pill khv__kicker">Built for trades</p>

                    <h2 className="h3 khv__title">
                        Why Tradespeople <span className="khv__accent">Choose</span> KonarCard
                    </h2>

                    <p className="kc-subheading khv__sub">
                        The real reasons it wins more work than a paper card.
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
